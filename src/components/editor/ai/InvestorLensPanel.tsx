"use client";

import { useState, useCallback } from "react";
import { useEditorStore } from "../state/editorStore";

interface InvestorEvaluation {
  type: string;
  label: string;
  stars: number;
  feedback: string;
  suggestion: string;
}

interface LensResult {
  evaluations: InvestorEvaluation[];
}

const INVESTOR_ICONS: Record<string, { emoji: string; gradient: string }> = {
  vc: { emoji: "VC", gradient: "from-electric to-cyan-500" },
  angel: { emoji: "AN", gradient: "from-emerald-500 to-teal-500" },
  accelerator: { emoji: "AC", gradient: "from-violet-500 to-electric" },
};

function StarRating({ stars, max = 5 }: { stars: number; max?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg
          key={i}
          className={`w-3.5 h-3.5 ${i < stars ? "text-amber-400" : "text-white/10"}`}
          fill={i < stars ? "currentColor" : "none"}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={i < stars ? 0 : 1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
          />
        </svg>
      ))}
      <span className="text-xs text-white/40 ml-1 font-semibold">{stars}/{max}</span>
    </div>
  );
}

interface InvestorLensPanelProps {
  onClose: () => void;
}

export default function InvestorLensPanel({ onClose }: InvestorLensPanelProps) {
  const deck = useEditorStore((s) => s.deck);
  const selectedSlideIndex = useEditorStore((s) => s.selectedSlideIndex);
  const slides = useEditorStore((s) => s.slides);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LensResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [analyzedSlideIndex, setAnalyzedSlideIndex] = useState<number | null>(null);

  const slide = slides[selectedSlideIndex];

  const runLens = useCallback(async () => {
    if (!deck) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/decks/${deck.shareId}/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "investor-lens",
          slideIndex: selectedSlideIndex,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Request failed (${res.status})`);
      }

      const data: LensResult = await res.json();
      setResult(data);
      setAnalyzedSlideIndex(selectedSlideIndex);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Investor Lens failed");
    } finally {
      setLoading(false);
    }
  }, [deck, selectedSlideIndex]);

  const avgStars = result
    ? (result.evaluations.reduce((sum, e) => sum + e.stars, 0) / result.evaluations.length).toFixed(1)
    : null;

  return (
    <section
      className="h-full flex flex-col bg-navy-950 border-l border-white/10"
      aria-labelledby="investor-lens-heading"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-electric to-violet flex items-center justify-center" aria-hidden>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div>
              <h3 id="investor-lens-heading" className="text-sm font-bold text-white">
                Investor Lens
              </h3>
              <p className="text-[10px] text-white/40">3 investor perspectives</p>
            </div>
          </div>
          <p className="text-[11px] italic text-white/40 mt-2">
            Simulated investor feedback — not from real investors
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Investor Lens panel"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
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
            type="button"
            onClick={runLens}
            disabled={loading}
            aria-label={loading ? "Evaluating slide" : result && analyzedSlideIndex === selectedSlideIndex ? "Re-evaluate this slide" : "Evaluate this slide with Investor Lens"}
            aria-busy={loading}
            className="w-full min-h-[44px] py-2.5 rounded-xl bg-electric hover:bg-electric-600 text-white text-sm font-semibold shadow-lg shadow-electric/25 hover:shadow-glow transition-all motion-reduce:transition-none hover:-translate-y-0.5 active:translate-y-0 motion-reduce:hover:translate-y-0 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin motion-reduce:animate-none" fill="none" viewBox="0 0 24 24" aria-hidden>
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="sr-only">Evaluating slide, please wait</span>
                <span aria-hidden>Evaluating...</span>
              </>
            ) : result && analyzedSlideIndex === selectedSlideIndex ? (
              "Re-evaluate Slide"
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Evaluate This Slide
              </>
            )}
          </button>

          {result && analyzedSlideIndex !== selectedSlideIndex && (
            <p className="text-[10px] text-electric/70 mt-2 text-center">
              Results are for slide {(analyzedSlideIndex ?? 0) + 1}. Click to evaluate the current slide.
            </p>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-4 mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20" role="alert">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="p-4 space-y-3">
            {/* Average score */}
            {avgStars && (
              <div className="text-center py-3 px-4 rounded-xl bg-white/5 border border-white/5">
                <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1">
                  Average Score
                </p>
                <p className="text-2xl font-bold text-white">{avgStars}</p>
                <p className="text-[10px] text-white/30">out of 5.0</p>
              </div>
            )}

            {/* Investor cards */}
            {result.evaluations.map((evaluation, i) => {
              const config = INVESTOR_ICONS[evaluation.type] || INVESTOR_ICONS.vc;

              return (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
                >
                  {/* Investor header */}
                  <div className="px-4 py-3 border-b border-white/5 flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} flex items-center justify-center text-white text-[10px] font-black`}
                    >
                      {config.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white">{evaluation.label}</p>
                      <StarRating stars={evaluation.stars} />
                    </div>
                  </div>

                  {/* Feedback */}
                  <div className="px-4 py-3 space-y-2.5">
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-1">
                        Feedback
                      </p>
                      <p className="text-xs text-white/70 leading-relaxed">
                        {evaluation.feedback}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-1">
                        Suggestion
                      </p>
                      <p className="text-xs text-electric/80 leading-relaxed">
                        {evaluation.suggestion}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!result && !loading && !error && (
          <div className="p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <p className="text-sm text-white/40 font-medium mb-1">Investor Lens</p>
            <p className="text-xs text-white/25 leading-relaxed max-w-[200px] mx-auto">
              See how 3 different investor types would evaluate this slide - VC Partner, Angel, and Accelerator Director.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
