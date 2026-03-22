"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Sparkles, Pencil, Loader2, CheckCircle2 } from "lucide-react";
import ScoreComparisonView from "@/components/ScoreComparisonView";

interface PIQScoreInput {
  overall: number;
  grade: string;
  dimensions: Array<{ id: string; label: string; score: number; feedback: string }>;
  recommendations: string[];
}

interface RefineResult {
  scoreBefore: PIQScoreInput;
  scoreAfter: PIQScoreInput;
  improvements: Array<{ dimension: string; originalScore: number; change: string }>;
  summary: string;
  newDeckShareId: string;
}

const INVESTOR_TYPES = [
  { id: "vc", label: "VC" },
  { id: "angel", label: "Angel" },
  { id: "accelerator", label: "Accelerator" },
] as const;

const PROGRESS_STEPS = [
  { label: "Analyzing your original deck...", delayMs: 0 },
  { label: "Identifying improvement areas...", delayMs: 2000 },
  { label: "Generating improved slides...", delayMs: 5000 },
  { label: "Scoring your new deck...", delayMs: 10000 },
];

function ConfidenceBadge({ confidence }: { confidence: string }) {
  const colorMap: Record<string, string> = {
    high: "bg-emerald-500/20 text-emerald-400",
    medium: "bg-yellow-500/20 text-yellow-400",
    low: "bg-red-500/20 text-red-400",
  };
  const cls = colorMap[confidence] ?? colorMap.low;
  return (
    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${cls}`}>
      {confidence}
    </span>
  );
}

export default function SmartRefineCard({
  deckShareId,
  extractedContent,
  onRefineStart,
}: {
  deckShareId: string;
  piqScore?: PIQScoreInput;
  extractedContent?: { companyName: string; extractionConfidence: string } | null;
  onRefineStart?: () => void;
}) {
  const [investorType, setInvestorType] = useState<string>("vc");
  const [guidance, setGuidance] = useState("");
  const [isRefining, setIsRefining] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RefineResult | null>(null);

  // Timed progress steps during refining
  useEffect(() => {
    if (!isRefining) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    PROGRESS_STEPS.forEach((step, i) => {
      if (i > 0) {
        timers.push(setTimeout(() => setCurrentStep(i), step.delayMs));
      }
    });
    return () => timers.forEach(clearTimeout);
  }, [isRefining]);

  const handleGenerate = useCallback(async () => {
    setIsRefining(true);
    setCurrentStep(0);
    setError(null);
    onRefineStart?.();

    try {
      const res = await fetch(`/api/decks/${deckShareId}/refine-deck`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investorType,
          userGuidance: guidance || undefined,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Refinement failed (${res.status})`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsRefining(false);
    }
  }, [deckShareId, investorType, guidance, onRefineStart]);

  // Show comparison view after successful refinement
  if (result) {
    return (
      <ScoreComparisonView
        scoreBefore={result.scoreBefore}
        scoreAfter={result.scoreAfter}
        improvements={result.improvements}
        summary={result.summary}
        newDeckShareId={result.newDeckShareId}
        onRefineAgain={() => setResult(null)}
      />
    );
  }

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-2">
        <Sparkles className="w-5 h-5 text-[#4361EE]" />
        <h3 className="text-lg font-semibold text-white">Want a better score?</h3>
      </div>
      <p className="text-sm text-white/60 mb-5">
        PitchIQ can rebuild your deck using your content and fix every weakness identified above.
      </p>

      {/* Extracted content indicator */}
      {extractedContent && (
        <div className="flex items-center gap-2 mb-5 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-sm text-white/70">
            Content extracted: <span className="text-white font-medium">{extractedContent.companyName}</span>
          </span>
          <ConfidenceBadge confidence={extractedContent.extractionConfidence} />
        </div>
      )}

      {/* Investor type selector */}
      <div className="mb-4">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">
          Target Investor Type
        </label>
        <div className="flex gap-2">
          {INVESTOR_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => setInvestorType(type.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                investorType === type.id
                  ? "bg-[#4361EE] text-white shadow-lg shadow-[#4361EE]/25"
                  : "bg-white/[0.05] text-white/60 hover:bg-white/[0.08] hover:text-white/80"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {/* Optional guidance */}
      <div className="mb-5">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider mb-2 block">
          Additional Guidance <span className="normal-case text-white/30">(optional)</span>
        </label>
        <textarea
          value={guidance}
          onChange={(e) => setGuidance(e.target.value)}
          placeholder='e.g., "emphasize our revenue growth"'
          rows={2}
          className="w-full text-sm bg-white/[0.02] border border-white/10 rounded-lg px-3 py-2.5 text-white/80 placeholder:text-white/25 focus:outline-none focus:border-[#4361EE]/50 focus:ring-1 focus:ring-[#4361EE]/30 resize-none transition-colors"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Progress steps */}
      {isRefining && (
        <div className="mb-5 space-y-2">
          {PROGRESS_STEPS.map((step, i) => (
            <div
              key={i}
              className={`flex items-center gap-2.5 text-sm transition-opacity duration-300 ${
                i <= currentStep ? "opacity-100" : "opacity-30"
              }`}
            >
              {i < currentStep ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : i === currentStep ? (
                <Loader2 className="w-4 h-4 text-[#4361EE] shrink-0 animate-spin" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-white/20 shrink-0" />
              )}
              <span className={i <= currentStep ? "text-white/80" : "text-white/30"}>
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleGenerate}
          disabled={isRefining}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4361EE] to-[#6C63FF] text-white text-sm font-semibold shadow-lg shadow-[#4361EE]/25 hover:shadow-[#4361EE]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-[#4361EE]/25"
        >
          {isRefining ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isRefining ? "Generating..." : "Generate Improved Deck"}
        </button>
        <Link
          href={`/editor/${deckShareId}`}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm font-medium hover:bg-white/[0.05] hover:text-white transition-all"
        >
          <Pencil className="w-4 h-4" />
          Edit in Editor Instead
        </Link>
      </div>
    </div>
  );
}
