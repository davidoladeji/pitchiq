"use client";

import { useState, useCallback } from "react";
import { useEditorStore } from "../state/editorStore";
import { PIQ_DIMENSIONS } from "@/lib/piq-dimensions";

interface FeedbackItem {
  dimension: string;
  rating: "strong" | "needs-work" | "weak";
  suggestion: string;
}

interface CoachResult {
  feedback: FeedbackItem[];
  overallTip: string;
}

const RATING_CONFIG = {
  strong: {
    label: "Strong",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    border: "border-emerald-400/20",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  "needs-work": {
    label: "Needs Work",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    border: "border-amber-400/20",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
      </svg>
    ),
  },
  weak: {
    label: "Weak",
    color: "text-red-400",
    bg: "bg-red-400/10",
    border: "border-red-400/20",
    icon: (
      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
};

interface AICoachPanelProps {
  onClose: () => void;
}

export default function AICoachPanel({ onClose }: AICoachPanelProps) {
  const deck = useEditorStore((s) => s.deck);
  const selectedSlideIndex = useEditorStore((s) => s.selectedSlideIndex);
  const slides = useEditorStore((s) => s.slides);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CoachResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzedSlideIndex, setAnalyzedSlideIndex] = useState<number | null>(null);

  const slide = slides[selectedSlideIndex];

  const runCoach = useCallback(async () => {
    if (!deck) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/decks/${deck.shareId}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "coach",
          slideIndex: selectedSlideIndex,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const data: CoachResult = await res.json();
      setResult(data);
      setAnalyzedSlideIndex(selectedSlideIndex);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Coach analysis failed");
    } finally {
      setLoading(false);
    }
  }, [deck, selectedSlideIndex]);

  const getDimension = (id: string) =>
    PIQ_DIMENSIONS.find((d) => d.id === id);

  const strongCount = result?.feedback.filter((f) => f.rating === "strong").length || 0;
  const needsWorkCount = result?.feedback.filter((f) => f.rating === "needs-work").length || 0;
  const weakCount = result?.feedback.filter((f) => f.rating === "weak").length || 0;

  return (
    <div className="h-full flex flex-col bg-[#0f0f23] border-l border-white/10">
      {/* Header */}
      <div className="p-4 border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">AI Coach</h3>
              <p className="text-[10px] text-white/40">PIQ dimension feedback</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {/* Analyze button */}
        <div className="p-4 border-b border-white/5">
          <div className="text-xs text-white/50 mb-2">
            Slide {selectedSlideIndex + 1}: <span className="text-white/70 font-medium">{slide?.title || "Untitled"}</span>
          </div>
          <button
            onClick={runCoach}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-electric hover:bg-electric-light text-white text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing...
              </>
            ) : result && analyzedSlideIndex === selectedSlideIndex ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
                Re-analyze Slide
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Analyze This Slide
              </>
            )}
          </button>

          {/* Stale indicator */}
          {result && analyzedSlideIndex !== selectedSlideIndex && (
            <p className="text-[10px] text-amber-400/70 mt-2 text-center">
              Results are for slide {(analyzedSlideIndex ?? 0) + 1}. Click to analyze the current slide.
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="p-4 space-y-4">
            {/* Summary bar */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-white/60">{strongCount} strong</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-xs text-white/60">{needsWorkCount} needs work</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-xs text-white/60">{weakCount} weak</span>
              </div>
            </div>

            {/* Overall tip */}
            {result.overallTip && (
              <div className="p-3 rounded-xl bg-[#4361ee]/10 border border-[#4361ee]/20">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-[#4361ee] shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-xs text-white/80 leading-relaxed">{result.overallTip}</p>
                </div>
              </div>
            )}

            {/* Dimension feedback */}
            <div className="space-y-2">
              {result.feedback.map((item, i) => {
                const config = RATING_CONFIG[item.rating] || RATING_CONFIG["needs-work"];
                const dim = getDimension(item.dimension);

                return (
                  <div
                    key={i}
                    className={`p-3 rounded-xl border ${config.border} ${config.bg}`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        {dim && (
                          <svg className="w-3.5 h-3.5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d={dim.icon} />
                          </svg>
                        )}
                        <span className="text-xs font-semibold text-white/80">
                          {dim?.label || item.dimension}
                        </span>
                        {dim && (
                          <span className="text-[10px] text-white/30">{dim.weight}%</span>
                        )}
                      </div>
                      <div className={`flex items-center gap-1 ${config.color}`}>
                        {config.icon}
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                          {config.label}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed pl-5.5">
                      {item.suggestion}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-sm text-white/40 font-medium mb-1">AI Coaching</p>
            <p className="text-xs text-white/25 leading-relaxed max-w-[200px] mx-auto">
              Get per-slide feedback across all 8 PIQ Score dimensions from our AI coach.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
