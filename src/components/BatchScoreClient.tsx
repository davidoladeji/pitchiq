"use client";

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";

interface BatchDimension {
  id: string;
  label: string;
  score: number;
}

interface BatchResultItem {
  fileName: string;
  score: number;
  grade: string;
  dimensions: BatchDimension[];
  error?: string;
}

interface BatchJob {
  id: string;
  name: string;
  status: string;
  totalDecks: number;
  completed: number;
  failed: number;
  results: BatchResultItem[];
  createdAt: string;
}

type SortKey = "fileName" | "score" | "grade";
type SortDir = "asc" | "desc";

const ALLOWED_EXTENSIONS = [".pdf", ".pptx"];
const MAX_FILE_SIZE_MB = 100;

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "text-emerald-600";
  if (grade.startsWith("B")) return "text-electric";
  if (grade.startsWith("C")) return "text-amber-600";
  if (grade.startsWith("D")) return "text-orange-600";
  return "text-red-600";
}

function statusBadge(status: string): { label: string; classes: string } {
  switch (status) {
    case "completed":
      return { label: "Completed", classes: "bg-emerald/15 text-emerald" };
    case "processing":
      return { label: "Processing", classes: "bg-electric/15 text-electric" };
    case "failed":
      return { label: "Failed", classes: "bg-red-50 text-red-700" };
    default:
      return { label: "Pending", classes: "bg-navy-100 text-navy-600" };
  }
}

export default function BatchScoreClient(props: {
  plan: string;
  batchEnabled: boolean;
  maxBatchSize: number;
  initialJobs: BatchJob[];
}) {
  const { batchEnabled, maxBatchSize, initialJobs } = props;
  const [files, setFiles] = useState<File[]>([]);
  const [batchName, setBatchName] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [activeJob, setActiveJob] = useState<BatchJob | null>(null);
  const [jobs, setJobs] = useState<BatchJob[]>(initialJobs);
  const [sortKey, setSortKey] = useState<SortKey>("score");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const inputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // --- File handling ---

  const validateFile = useCallback((file: File): string | null => {
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `${file.name}: Only PDF and PPTX files are accepted.`;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      return `${file.name}: File too large (max ${MAX_FILE_SIZE_MB}MB).`;
    }
    return null;
  }, []);

  const addFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const arr = Array.from(newFiles);
      const errors: string[] = [];
      const valid: File[] = [];

      for (const f of arr) {
        const err = validateFile(f);
        if (err) {
          errors.push(err);
        } else {
          // Prevent duplicates by name
          if (!files.some((existing) => existing.name === f.name && existing.size === f.size)) {
            valid.push(f);
          }
        }
      }

      const combined = [...files, ...valid];
      if (combined.length > maxBatchSize) {
        setError(`Maximum ${maxBatchSize} files per batch. Remove some files first.`);
        return;
      }

      if (errors.length > 0) {
        setError(errors.join(" "));
      } else {
        setError("");
      }
      setFiles(combined);
    },
    [files, maxBatchSize, validateFile]
  );

  const removeFile = useCallback(
    (index: number) => {
      setFiles((prev) => prev.filter((_, i) => i !== index));
      setError("");
    },
    []
  );

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
    }
    // Reset input so the same file can be selected again
    e.target.value = "";
  };

  // --- Submission ---

  const handleSubmit = async () => {
    if (files.length === 0 || submitting) return;
    setSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", batchName || `Batch — ${files.length} decks`);
      for (const file of files) {
        formData.append("files", file);
      }

      const res = await fetch("/api/batch-score", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to start batch scoring.");
        setSubmitting(false);
        return;
      }

      // Job created — start polling
      setActiveJobId(data.id);
      setActiveJob({
        id: data.id,
        name: batchName || `Batch — ${files.length} decks`,
        status: data.status,
        totalDecks: data.totalDecks,
        completed: data.completed,
        failed: data.failed,
        results: data.results || [],
        createdAt: new Date().toISOString(),
      });

      // If already completed (small batch), update jobs list
      if (data.status === "completed") {
        setJobs((prev) => [
          {
            id: data.id,
            name: batchName || `Batch — ${files.length} decks`,
            status: "completed",
            totalDecks: data.totalDecks,
            completed: data.completed,
            failed: data.failed,
            results: data.results || [],
            createdAt: new Date().toISOString(),
          },
          ...prev,
        ]);
        setFiles([]);
        setBatchName("");
      } else {
        startPolling(data.id);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const startPolling = (jobId: string) => {
    if (pollRef.current) clearInterval(pollRef.current);

    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/batch-score/${jobId}`);
        if (!res.ok) return;
        const data = await res.json();

        const job: BatchJob = {
          id: data.id,
          name: data.name,
          status: data.status,
          totalDecks: data.totalDecks,
          completed: data.completed,
          failed: data.failed,
          results: data.results || [],
          createdAt: data.createdAt,
        };

        setActiveJob(job);

        if (data.status === "completed" || data.status === "failed") {
          if (pollRef.current) clearInterval(pollRef.current);
          pollRef.current = null;

          // Add to jobs list
          setJobs((prev) => {
            const exists = prev.some((j) => j.id === job.id);
            if (exists) return prev.map((j) => (j.id === job.id ? job : j));
            return [job, ...prev];
          });

          setFiles([]);
          setBatchName("");
        }
      } catch {
        // Silently retry
      }
    }, 3000);
  };

  // --- View a past job ---

  const viewJob = (job: BatchJob) => {
    setActiveJobId(job.id);
    setActiveJob(job);
  };

  const deleteJob = async (jobId: string) => {
    try {
      const res = await fetch(`/api/batch-score/${jobId}`, { method: "DELETE" });
      if (res.ok) {
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
        if (activeJobId === jobId) {
          setActiveJobId(null);
          setActiveJob(null);
        }
      }
    } catch {
      // Silently fail
    }
  };

  // --- Sorting ---

  const sortedResults = activeJob?.results
    ? [...activeJob.results].sort((a, b) => {
        let cmp = 0;
        if (sortKey === "fileName") {
          cmp = a.fileName.localeCompare(b.fileName);
        } else if (sortKey === "score") {
          cmp = a.score - b.score;
        } else if (sortKey === "grade") {
          cmp = a.grade.localeCompare(b.grade);
        }
        return sortDir === "asc" ? cmp : -cmp;
      })
    : [];

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  // --- CSV Export ---

  const exportCSV = () => {
    if (!activeJob?.results?.length) return;

    const headers = ["File Name", "PIQ Score", "Grade"];
    // Get dimension labels from first successful result
    const firstSuccess = activeJob.results.find((r) => !r.error);
    if (firstSuccess) {
      for (const d of firstSuccess.dimensions) {
        headers.push(d.label);
      }
    }
    headers.push("Error");

    const rows = activeJob.results.map((r) => {
      const row: string[] = [
        `"${r.fileName}"`,
        String(r.score),
        r.grade,
      ];
      if (firstSuccess) {
        for (const dim of firstSuccess.dimensions) {
          const match = r.dimensions.find((d) => d.id === dim.id);
          row.push(match ? String(match.score) : "");
        }
      }
      row.push(r.error ? `"${r.error}"` : "");
      return row.join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${activeJob.name || "batch-results"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // --- Render ---

  // Upgrade prompt for non-enterprise users
  if (!batchEnabled) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-navy-950 to-navy-900">
        <AppNav />
        <div className="max-w-3xl mx-auto px-4 pt-24 pb-16">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="w-16 h-16 bg-navy-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-navy-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-navy-900 mb-2">Batch Scoring</h1>
            <p className="text-navy-500 mb-6">
              Score multiple pitch decks at once. Upload up to 50 decks and get
              PIQ scores, grades, and dimension breakdowns for each — perfect for
              accelerators, VCs, and competitions.
            </p>
            <p className="text-sm text-navy-400 mb-6">
              Available on the <span className="font-semibold text-navy-700">Enterprise</span> plan.
            </p>
            <Link
              href="/#pricing"
              className="inline-flex items-center gap-2 min-h-[44px] px-6 py-3 bg-electric text-white rounded-xl font-medium shadow-lg shadow-electric/25 hover:shadow-glow hover:bg-electric-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white transition hover:-translate-y-0.5 active:translate-y-0"
              aria-label="Upgrade to Enterprise to use batch scoring"
            >
              Upgrade to Enterprise
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const isProcessing = activeJob?.status === "processing";
  const isCompleted = activeJob?.status === "completed";
  const progressPct =
    activeJob && activeJob.totalDecks > 0
      ? Math.round(((activeJob.completed + activeJob.failed) / activeJob.totalDecks) * 100)
      : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-navy-950 to-navy-900">
      <AppNav />
      <div className="max-w-6xl mx-auto px-4 pt-24 pb-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Batch Scoring</h1>
            <p className="text-navy-300">
              Upload multiple pitch decks and score them all at once.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-navy-300 hover:text-white transition"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl p-6 mb-6">
          <h2 className="text-lg font-semibold text-navy-900 mb-4">Upload Decks</h2>

          {/* Batch name */}
          <input
            type="text"
            placeholder="Batch name (optional)"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            className="w-full mb-4 px-4 py-2.5 border border-navy-200 rounded-xl text-navy-900 placeholder-navy-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:border-electric"
          />

          {/* Drop zone */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
              dragActive
                ? "border-electric bg-electric/5"
                : "border-navy-200 hover:border-navy-300 bg-navy-50/50"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.pptx"
              multiple
              onChange={handleInputChange}
              className="hidden"
            />
            <svg
              className="w-10 h-10 mx-auto mb-3 text-navy-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-navy-600 font-medium">
              Drag & drop PDFs or PPTXs here
            </p>
            <p className="text-navy-400 text-sm mt-1">
              or click to browse — up to {maxBatchSize} files
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-3 px-4 py-2 bg-red-50 text-red-700 text-sm rounded-lg">
              {error}
            </div>
          )}

          {/* File list */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-navy-500 font-medium">
                {files.length} file{files.length !== 1 ? "s" : ""} selected
              </p>
              {files.map((file, i) => (
                <div
                  key={`${file.name}-${i}`}
                  className="flex items-center justify-between px-4 py-2.5 bg-navy-50 rounded-lg"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <svg
                      className="w-5 h-5 text-navy-400 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                      />
                    </svg>
                    <span className="text-sm text-navy-700 truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-navy-400 shrink-0">
                      {formatFileSize(file.size)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-navy-400 hover:text-red-500 transition p-1 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white min-h-[44px] min-w-[44px] inline-flex items-center justify-center"
                    aria-label={`Remove ${file.name}`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}

              {/* Submit button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting || files.length === 0}
                className="mt-4 w-full min-h-[44px] py-3 bg-electric text-white font-semibold rounded-xl shadow-lg shadow-electric/25 hover:shadow-glow hover:bg-electric-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white transition hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-2"
                aria-label={submitting ? `Scoring ${files.length} deck${files.length !== 1 ? "s" : ""}…` : `Score all ${files.length} deck${files.length !== 1 ? "s" : ""}`}
                aria-busy={submitting}
              >
                {submitting ? (
                  <>
                    <svg className="w-5 h-5 animate-spin shrink-0" fill="none" viewBox="0 0 24 24" aria-hidden>
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Scoring {files.length} deck{files.length !== 1 ? "s" : ""}...
                  </>
                ) : (
                  <>
                    Score All ({files.length} deck{files.length !== 1 ? "s" : ""})
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Active Job Progress / Results */}
        {activeJob && (
          <div className="bg-white rounded-2xl p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-navy-900">
                {activeJob.name}
              </h2>
              <span
                className={`px-3 py-1 text-xs font-medium rounded-full ${
                  statusBadge(activeJob.status).classes
                }`}
              >
                {statusBadge(activeJob.status).label}
              </span>
            </div>

            {/* Progress bar */}
            {(isProcessing || isCompleted) && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-navy-500 mb-1.5">
                  <span>
                    {activeJob.completed + activeJob.failed} / {activeJob.totalDecks} files processed
                  </span>
                  <span>{progressPct}%</span>
                </div>
                <div className="w-full bg-navy-100 rounded-full h-2.5">
                  <div
                    className="bg-electric rounded-full h-2.5 transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
                {activeJob.failed > 0 && (
                  <p className="text-xs text-red-500 mt-1">
                    {activeJob.failed} file{activeJob.failed !== 1 ? "s" : ""} failed
                  </p>
                )}
              </div>
            )}

            {/* Results table */}
            {isCompleted && sortedResults.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-navy-500">
                    {activeJob.completed} scored, {activeJob.failed} failed
                  </p>
                  <button
                    onClick={exportCSV}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-navy-600 bg-navy-50 rounded-lg hover:bg-navy-100 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                    </svg>
                    Export CSV
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-navy-100">
                        <th
                          className="text-left py-2.5 px-3 text-navy-500 font-medium cursor-pointer select-none hover:text-navy-700"
                          onClick={() => toggleSort("fileName")}
                        >
                          File Name {sortKey === "fileName" ? (sortDir === "asc" ? "^" : "v") : ""}
                        </th>
                        <th
                          className="text-center py-2.5 px-3 text-navy-500 font-medium cursor-pointer select-none hover:text-navy-700"
                          onClick={() => toggleSort("score")}
                        >
                          PIQ Score {sortKey === "score" ? (sortDir === "asc" ? "^" : "v") : ""}
                        </th>
                        <th
                          className="text-center py-2.5 px-3 text-navy-500 font-medium cursor-pointer select-none hover:text-navy-700"
                          onClick={() => toggleSort("grade")}
                        >
                          Grade {sortKey === "grade" ? (sortDir === "asc" ? "^" : "v") : ""}
                        </th>
                        {/* Top dimension columns from first successful result */}
                        {sortedResults.find((r) => !r.error)?.dimensions.slice(0, 4).map((d) => (
                          <th
                            key={d.id}
                            className="text-center py-2.5 px-3 text-navy-500 font-medium hidden lg:table-cell"
                          >
                            {d.label}
                          </th>
                        ))}
                        <th className="text-center py-2.5 px-3 text-navy-500 font-medium">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedResults.map((r, i) => (
                        <tr
                          key={i}
                          className="border-b border-navy-50 hover:bg-navy-50/50 transition"
                        >
                          <td className="py-2.5 px-3 text-navy-800 truncate max-w-[200px]">
                            {r.fileName}
                          </td>
                          <td className="py-2.5 px-3 text-center font-semibold text-navy-900">
                            {r.error ? "—" : r.score}
                          </td>
                          <td className={`py-2.5 px-3 text-center font-bold ${gradeColor(r.grade)}`}>
                            {r.error ? "—" : r.grade}
                          </td>
                          {sortedResults.find((x) => !x.error)?.dimensions.slice(0, 4).map((dim) => {
                            const match = r.dimensions.find((d) => d.id === dim.id);
                            return (
                              <td
                                key={dim.id}
                                className="py-2.5 px-3 text-center text-navy-600 hidden lg:table-cell"
                              >
                                {match ? match.score : "—"}
                              </td>
                            );
                          })}
                          <td className="py-2.5 px-3 text-center">
                            {r.error ? (
                              <span className="text-xs text-red-500" title={r.error}>
                                Failed
                              </span>
                            ) : (
                              <span className="text-xs text-emerald-600">Done</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Summary stats */}
                {activeJob.results.filter((r) => !r.error).length > 0 && (
                  <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(() => {
                      const successful = activeJob.results.filter((r) => !r.error);
                      const avg = Math.round(
                        successful.reduce((s, r) => s + r.score, 0) / successful.length
                      );
                      const highest = Math.max(...successful.map((r) => r.score));
                      const lowest = Math.min(...successful.map((r) => r.score));
                      return (
                        <>
                          <div className="bg-navy-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-navy-400 mb-0.5">Average</p>
                            <p className="text-xl font-bold text-navy-900">{avg}</p>
                          </div>
                          <div className="bg-navy-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-navy-400 mb-0.5">Highest</p>
                            <p className="text-xl font-bold text-emerald-600">{highest}</p>
                          </div>
                          <div className="bg-navy-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-navy-400 mb-0.5">Lowest</p>
                            <p className="text-xl font-bold text-orange-600">{lowest}</p>
                          </div>
                          <div className="bg-navy-50 rounded-xl p-3 text-center">
                            <p className="text-xs text-navy-400 mb-0.5">Scored</p>
                            <p className="text-xl font-bold text-navy-900">{successful.length}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </>
            )}

            {/* Back to new batch button */}
            {isCompleted && (
              <button
                type="button"
                onClick={() => {
                  setActiveJobId(null);
                  setActiveJob(null);
                }}
                className="mt-4 min-h-[44px] px-4 text-sm text-electric hover:text-electric/80 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-lg"
                aria-label="Start a new batch"
              >
                Start New Batch
              </button>
            )}
          </div>
        )}

        {/* History */}
        {jobs.length > 0 && (
          <div className="bg-white rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-navy-900 mb-4">
              Batch History
            </h2>
            <div className="space-y-3">
              {jobs.map((job) => {
                const badge = statusBadge(job.status);
                return (
                  <div
                    key={job.id}
                    className="flex items-center justify-between px-4 py-3 bg-navy-50 rounded-xl hover:bg-navy-100/70 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-medium text-navy-800 truncate">
                          {job.name}
                        </p>
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded-full shrink-0 ${badge.classes}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <p className="text-xs text-navy-400">
                        {job.completed}/{job.totalDecks} scored
                        {job.failed > 0 ? ` (${job.failed} failed)` : ""} —{" "}
                        {formatDate(job.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-3">
                      <button
                        type="button"
                        onClick={() => viewJob(job)}
                        className="text-xs px-3 py-1.5 text-electric bg-electric/10 rounded-lg hover:bg-electric/20 font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white min-h-[44px]"
                        aria-label={`View batch ${job.name}`}
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteJob(job.id)}
                        className="text-xs px-2 py-1.5 text-navy-400 hover:text-red-500 transition min-h-[44px] min-w-[44px] inline-flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-lg"
                        aria-label={`Delete batch ${job.name}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
