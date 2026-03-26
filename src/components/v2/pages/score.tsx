"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, Target, Loader2, FileText, CheckCircle2, AlertTriangle } from "lucide-react";
import type { PIQScore } from "@/lib/types";

type State = "idle" | "uploading" | "scoring" | "result" | "error";

export default function ScorePage() {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [score, setScore] = useState<PIQScore | null>(null);
  const [shareId, setShareId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setState("uploading");
    setProgress(20);

    try {
      const formData = new FormData();
      formData.append("file", f);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: formData });
      if (!uploadRes.ok) throw new Error("Upload failed");
      const { slideTexts, slideCount } = await uploadRes.json();
      setProgress(50);

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
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "var(--void-text)" }}>
          Score Your Pitch Deck
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--void-text-dim)" }}>
          Upload your deck and get an instant PIQ fundability score with actionable feedback
        </p>
      </div>

      {(state === "idle" || state === "error") && (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200 p-12 text-center ${dragOver ? "scale-[1.01]" : ""}`}
            style={{
              borderColor: dragOver ? "var(--neon-electric)" : "var(--void-border)",
              background: dragOver ? "rgba(67,97,238,0.05)" : "var(--void-surface)",
            }}
          >
            <input ref={fileRef} type="file" accept=".pdf,.pptx" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} className="hidden" />
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(67,97,238,0.1)" }}>
              <Upload size={24} style={{ color: "var(--neon-electric)" }} />
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--void-text)" }}>Drop your deck here or click to browse</p>
            <p className="text-xs" style={{ color: "var(--void-text-dim)" }}>Supports PDF and PPTX files</p>
            <div className="flex justify-center gap-2 mt-3">
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono" style={{ background: "rgba(255,255,255,0.06)", color: "var(--void-text-dim)" }}>PDF</span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono" style={{ background: "rgba(255,255,255,0.06)", color: "var(--void-text-dim)" }}>PPTX</span>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-3 rounded-xl flex items-center gap-2" style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}>
              <AlertTriangle size={16} className="text-red-400 shrink-0" />
              <p className="text-sm" style={{ color: "#F87171" }}>{error}</p>
            </div>
          )}
        </>
      )}

      {(state === "uploading" || state === "scoring") && (
        <div className="rounded-2xl p-8 text-center" style={{ border: "1px solid var(--void-border)", background: "var(--void-surface)" }}>
          <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: "var(--neon-electric)" }} />
          <p className="text-sm font-medium mb-2" style={{ color: "var(--void-text)" }}>
            {state === "uploading" ? "Uploading your deck..." : "Analyzing your deck..."}
          </p>
          <div className="w-48 h-1.5 rounded-full mx-auto overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "var(--neon-electric)" }} />
          </div>
          {file && (
            <div className="flex items-center justify-center gap-2 mt-3 text-xs" style={{ color: "var(--void-text-dim)" }}>
              <FileText size={12} /> {file.name}
            </div>
          )}
        </div>
      )}

      {state === "result" && score && (
        <div className="space-y-6">
          <div className="rounded-2xl p-6" style={{ border: "1px solid var(--void-border)", background: "var(--void-surface)" }}>
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center" style={{ background: "rgba(67,97,238,0.1)" }}>
                <span className="text-3xl font-bold" style={{ color: "var(--neon-electric)" }}>{score.overall}</span>
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: "var(--void-text)" }}>PIQ Score: {score.overall}/100</p>
                <p className="text-sm" style={{ color: "var(--void-text-dim)" }}>Grade: {score.grade}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl p-6" style={{ border: "1px solid var(--void-border)", background: "var(--void-surface)" }}>
            <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--void-text)" }}>Dimension Breakdown</h2>
            <div className="space-y-3">
              {score.dimensions?.map((dim) => (
                <div key={dim.id} className="flex items-center gap-3">
                  <span className="text-xs w-32 truncate" style={{ color: "var(--void-text-muted)" }}>{dim.label}</span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${dim.score}%`, background: dim.score >= 80 ? "var(--neon-emerald)" : dim.score >= 60 ? "#FBBF24" : "#F87171" }} />
                  </div>
                  <span className="text-xs font-semibold w-8 text-right" style={{ color: "var(--void-text)" }}>{dim.score}</span>
                </div>
              ))}
            </div>
          </div>

          {score.recommendations && score.recommendations.length > 0 && (
            <div className="rounded-2xl p-6" style={{ border: "1px solid var(--void-border)", background: "var(--void-surface)" }}>
              <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--void-text)" }}>Recommendations</h2>
              <div className="space-y-2">
                {score.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Target size={14} className="mt-0.5 shrink-0" style={{ color: "var(--neon-electric)" }} />
                    <p style={{ color: "var(--void-text-muted)" }}>{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center gap-3">
            {shareId && (
              <button onClick={() => router.push(`/create?from=${shareId}`)} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors hover:brightness-110" style={{ background: "var(--neon-electric)" }}>
                <CheckCircle2 size={16} /> Improve This Deck
              </button>
            )}
            <button onClick={() => { setState("idle"); setFile(null); setScore(null); setError(""); }} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors hover:bg-white/[0.06]" style={{ border: "1px solid var(--void-border)", background: "var(--void-surface)", color: "var(--void-text)" }}>
              Score Another
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
