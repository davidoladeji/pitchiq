"use client";

import { useState, useCallback } from "react";
import { useEditorStore } from "../state/editorStore";

interface SimQuestion {
  question: string;
  context: string;
  targetSlideIndex: number;
  suggestedImprovement: string;
}

interface SimResult {
  questions: SimQuestion[];
}

interface PitchSimulatorProps {
  onClose: () => void;
}

export default function PitchSimulator({ onClose }: PitchSimulatorProps) {
  const deck = useEditorStore((s) => s.deck);
  const slides = useEditorStore((s) => s.slides);
  const selectSlide = useEditorStore((s) => s.selectSlide);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const runSimulation = useCallback(async () => {
    if (!deck) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setExpandedIndex(null);

    try {
      const res = await fetch(`/api/decks/${deck.shareId}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "simulate" }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const data: SimResult = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Simulation failed");
    } finally {
      setLoading(false);
    }
  }, [deck]);

  function handleGoToSlide(slideIndex: number) {
    if (slideIndex >= 0 && slideIndex < slides.length) {
      selectSlide(slideIndex);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="bg-[#0f0f23] border border-white/10 rounded-2xl shadow-2xl w-[90vw] max-w-2xl max-h-[85vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Pitch Simulator</h2>
                <p className="text-xs text-white/40">
                  AI-generated tough investor questions targeting your deck&apos;s weakest points
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5">
          {/* Run button */}
          {!result && !loading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Prepare for the tough questions</h3>
              <p className="text-sm text-white/40 max-w-md mx-auto mb-6">
                Our AI will analyze your entire deck, identify weaknesses, and generate 5 challenging questions
                that real investors would ask. Each comes with a suggested improvement.
              </p>
              <button
                onClick={runSimulation}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-400 hover:to-rose-500 text-white text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Start Simulation
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500/20 to-rose-600/20 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <p className="text-sm text-white/60 font-medium">Analyzing your entire deck...</p>
              <p className="text-xs text-white/30 mt-1">Generating tough investor questions</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={runSimulation}
                className="mt-2 text-xs text-red-400 underline hover:text-red-300"
              >
                Try again
              </button>
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-white/40 uppercase tracking-wider font-semibold">
                  {result.questions.length} Investor Questions
                </p>
                <button
                  onClick={runSimulation}
                  disabled={loading}
                  className="text-xs text-white/40 hover:text-white/60 transition-colors"
                >
                  Regenerate
                </button>
              </div>

              {result.questions.map((q, i) => {
                const isExpanded = expandedIndex === i;
                const targetSlide = slides[q.targetSlideIndex];

                return (
                  <div
                    key={i}
                    className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
                  >
                    {/* Question */}
                    <button
                      onClick={() => setExpandedIndex(isExpanded ? null : i)}
                      className="w-full text-left px-4 py-3.5 flex items-start gap-3 hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/90 font-medium leading-relaxed">
                          &ldquo;{q.question}&rdquo;
                        </p>
                        {targetSlide && (
                          <p className="text-[10px] text-white/30 mt-1">
                            Targets: Slide {q.targetSlideIndex + 1} ({targetSlide.type}) - {targetSlide.title}
                          </p>
                        )}
                      </div>
                      <svg
                        className={`w-4 h-4 text-white/30 shrink-0 mt-1 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-3 border-t border-white/5">
                        {/* Context */}
                        <div className="pt-3">
                          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-1">
                            Why investors ask this
                          </p>
                          <p className="text-xs text-white/60 leading-relaxed">
                            {q.context}
                          </p>
                        </div>

                        {/* Suggestion */}
                        <div className="p-3 rounded-xl bg-[#4361ee]/10 border border-[#4361ee]/20">
                          <p className="text-[10px] text-[#4361ee] uppercase tracking-wider font-semibold mb-1">
                            Suggested improvement
                          </p>
                          <p className="text-xs text-white/70 leading-relaxed">
                            {q.suggestedImprovement}
                          </p>
                        </div>

                        {/* Go to slide button */}
                        {targetSlide && (
                          <button
                            onClick={() => {
                              handleGoToSlide(q.targetSlideIndex);
                              onClose();
                            }}
                            className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-white/60 hover:text-white font-medium transition-colors flex items-center justify-center gap-1.5"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                            Go to Slide {q.targetSlideIndex + 1}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-white/20">
              Powered by AI - Questions based on your deck content
            </p>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
