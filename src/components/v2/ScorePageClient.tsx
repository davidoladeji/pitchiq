"use client";

import { DashboardVersionToggle } from "@/components/DashboardVersionToggle";
import AppShellV2 from "./shell/AppShell";
import { PageTransition } from "./shared/PageTransition";
import { useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Upload, Target, Loader2, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import type { PIQScore } from "@/lib/types";

interface Props {
  userPlan?: string;
  userName?: string;
}

type State = "idle" | "uploading" | "scoring" | "result" | "error";

export default function ScorePageV2({ userPlan = "starter", userName }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<State>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [score, setScore] = useState<PIQScore | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  // URL params available for future use (load existing score)
  void searchParams;

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setState("uploading");
    setProgress(20);

    try {
      // Upload
      const formData = new FormData();
      formData.append("file", f);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { slideTexts, slideCount } = await uploadRes.json();
      setProgress(50);

      // Score
      setState("scoring");
      const scoreRes = await fetch("/api/piq-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slideTexts, slideCount, fileName: f.name }),
      });
      if (!scoreRes.ok) throw new Error("Scoring failed");
      setProgress(80);

      const data = await scoreRes.json();
      setScore(data.score);
      setShareId(data.shareId);
      setProgress(100);
      setState("result");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.type === "application/pdf" || f.name.endsWith(".pptx"))) {
      handleFile(f);
    }
  }, [handleFile]);

  return (
    <AppShellV2
      userName={userName}
      userPlan={userPlan}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Score Deck" },
      ]}
    >
      <PageTransition>
        <div className="max-w-3xl mx-auto">
          <DashboardVersionToggle />

          <div className="mt-4 mb-8">
            <h1 className="text-2xl font-bold text-navy dark:text-white">Score Your Pitch Deck</h1>
            <p className="text-sm text-navy-400 dark:text-white/40 mt-1">
              Upload your deck and get an instant PIQ fundability score with actionable feedback
            </p>
          </div>

          {(state === "idle" || state === "error") && (
            <>
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-12 text-center ${
                  dragOver
                    ? "border-electric bg-electric/5 scale-[1.01]"
                    : "border-[var(--border-default)] bg-[var(--surface-1)] hover:border-[var(--border-emphasis)] hover:bg-[var(--surface-2)]"
                }`}
              >
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.pptx"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  className="hidden"
                />
                <div className="w-14 h-14 rounded-2xl bg-electric/10 flex items-center justify-center mx-auto mb-4">
                  <Upload size={24} className="text-electric" />
                </div>
                <p className="text-sm font-medium text-navy dark:text-white mb-1">
                  Drop your deck here or click to browse
                </p>
                <p className="text-xs text-navy-400 dark:text-white/30">
                  Supports PDF and PPTX files
                </p>
                <div className="flex justify-center gap-2 mt-3">
                  <span className="px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[10px] font-mono text-navy-400 dark:text-white/30">PDF</span>
                  <span className="px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[10px] font-mono text-navy-400 dark:text-white/30">PPTX</span>
                </div>
              </div>

              {error && (
                <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-red-500 shrink-0" />
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
            </>
          )}

          {(state === "uploading" || state === "scoring") && (
            <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-8 text-center">
              <Loader2 size={32} className="text-electric animate-spin mx-auto mb-4" />
              <p className="text-sm font-medium text-navy dark:text-white mb-2">
                {state === "uploading" ? "Uploading your deck..." : "Analyzing your deck..."}
              </p>
              <div className="w-48 h-1.5 rounded-full bg-[var(--surface-2)] mx-auto overflow-hidden">
                <div
                  className="h-full bg-electric rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
              {file && (
                <div className="flex items-center justify-center gap-2 mt-3 text-xs text-navy-400 dark:text-white/30">
                  <FileText size={12} />
                  {file.name}
                </div>
              )}
            </div>
          )}

          {state === "result" && score && (
            <div className="space-y-6">
              {/* Overall score */}
              <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-electric/10 flex items-center justify-center">
                    <span className="text-3xl font-bold text-electric">{score.overall}</span>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-navy dark:text-white">PIQ Score: {score.overall}/100</p>
                    <p className="text-sm text-navy-400 dark:text-white/40">Grade: {score.grade}</p>
                  </div>
                </div>
              </div>

              {/* Dimensions */}
              <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6">
                <h2 className="text-sm font-semibold text-navy dark:text-white mb-4">Dimension Breakdown</h2>
                <div className="space-y-3">
                  {score.dimensions?.map((dim) => (
                    <div key={dim.id} className="flex items-center gap-3">
                      <span className="text-xs text-navy-500 dark:text-white/50 w-32 truncate">{dim.label}</span>
                      <div className="flex-1 h-2 rounded-full bg-[var(--surface-2)] overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${
                            dim.score >= 80 ? "bg-emerald-500" : dim.score >= 60 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-navy dark:text-white w-8 text-right">{dim.score}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              {score.recommendations && score.recommendations.length > 0 && (
                <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] p-6">
                  <h2 className="text-sm font-semibold text-navy dark:text-white mb-4">Recommendations</h2>
                  <div className="space-y-2">
                    {score.recommendations.map((rec, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Target size={14} className="text-electric mt-0.5 shrink-0" />
                        <p className="text-navy-600 dark:text-white/70">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-center gap-3">
                {shareId && (
                  <button
                    onClick={() => router.push(`/create?from=${shareId}`)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-electric text-white text-sm font-semibold hover:bg-electric-600 transition-colors"
                  >
                    <CheckCircle2 size={16} />
                    Improve This Deck
                  </button>
                )}
                <button
                  onClick={() => { setState("idle"); setFile(null); setScore(null); setError(""); }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-1)] text-sm font-medium text-navy dark:text-white hover:bg-[var(--surface-2)] transition-colors"
                >
                  Score Another
                </button>
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </AppShellV2>
  );
}
