"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, RefreshCw, X } from "lucide-react";

interface PIQScoreInput {
  overall: number;
  grade: string;
  dimensions: Array<{ id: string; label: string; score: number; feedback: string }>;
  recommendations: string[];
}

function scoreBarColor(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-[#4361EE]";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

function scoreTextColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-[#4361EE]";
  if (score >= 40) return "text-amber-400";
  return "text-red-400";
}

function scoreBorderColor(score: number): string {
  if (score >= 80) return "border-emerald-500/30";
  if (score >= 60) return "border-[#4361EE]/30";
  if (score >= 40) return "border-amber-500/30";
  return "border-red-500/30";
}

function ScoreGauge({ score, grade, label }: { score: number; grade: string; label: string }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const colorClass = scoreTextColor(score);

  return (
    <div className="flex flex-col items-center">
      <span className="text-[10px] font-semibold text-white/40 uppercase tracking-widest mb-3">
        {label}
      </span>
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
          <circle cx="50" cy="50" r={radius} fill="none" className="stroke-white/5" strokeWidth={4} />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            className={`transition-all duration-1000 ease-out ${score >= 80 ? "stroke-emerald-500" : score >= 60 ? "stroke-[#4361EE]" : score >= 40 ? "stroke-amber-500" : "stroke-red-500"}`}
            strokeWidth={4}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold tabular-nums ${colorClass}`}>{score}</span>
          <span className="text-[10px] text-white/40 font-medium">{grade}</span>
        </div>
      </div>
    </div>
  );
}

function DimensionBar({
  label,
  scoreBefore,
  scoreAfter,
}: {
  label: string;
  scoreBefore: number;
  scoreAfter: number;
}) {
  const improved = scoreAfter > scoreBefore;
  const delta = scoreAfter - scoreBefore;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white/70 truncate flex-1">{label}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs tabular-nums text-white/40">{scoreBefore}</span>
          {improved && (
            <span className="text-emerald-400 text-[10px]">&#8593;</span>
          )}
          <span className={`text-xs tabular-nums font-semibold ${scoreTextColor(scoreAfter)}`}>
            {scoreAfter}
          </span>
          {delta !== 0 && (
            <span className={`text-[10px] tabular-nums ${delta > 0 ? "text-emerald-400" : "text-red-400"}`}>
              {delta > 0 ? "+" : ""}{delta}
            </span>
          )}
        </div>
      </div>
      {/* Before bar */}
      <div className="flex gap-1 items-center">
        <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 opacity-40 ${scoreBarColor(scoreBefore)}`}
            style={{ width: `${scoreBefore}%` }}
          />
        </div>
      </div>
      {/* After bar */}
      <div className="flex gap-1 items-center">
        <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ${scoreBarColor(scoreAfter)}`}
            style={{ width: `${scoreAfter}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export default function ScoreComparisonView({
  scoreBefore,
  scoreAfter,
  improvements,
  summary,
  newDeckShareId,
  onRefineAgain,
  onDismiss,
}: {
  scoreBefore: PIQScoreInput;
  scoreAfter: PIQScoreInput;
  improvements: Array<{ dimension: string; originalScore: number; change: string }>;
  summary: string;
  newDeckShareId: string;
  onRefineAgain?: () => void;
  onDismiss?: () => void;
}) {
  const delta = scoreAfter.overall - scoreBefore.overall;

  // Build a lookup of "after" dimension scores
  const afterMap = new Map(scoreAfter.dimensions.map((d) => [d.id, d.score]));

  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
      {/* Delta badge */}
      {delta > 0 && (
        <div className="flex justify-center mb-5">
          <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/15 text-emerald-400 text-sm font-bold">
            +{delta} points improvement
          </span>
        </div>
      )}

      {/* Two-column gauges */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className={`flex flex-col items-center p-4 rounded-xl border ${scoreBorderColor(scoreBefore.overall)} bg-white/[0.02]`}>
          <ScoreGauge score={scoreBefore.overall} grade={scoreBefore.grade} label="ORIGINAL" />
        </div>
        <div className={`flex flex-col items-center p-4 rounded-xl border ${scoreBorderColor(scoreAfter.overall)} bg-white/[0.02]`}>
          <ScoreGauge score={scoreAfter.overall} grade={scoreAfter.grade} label="IMPROVED" />
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <p className="text-sm text-white/60 leading-relaxed mb-6 text-center">{summary}</p>
      )}

      {/* Dimension comparison bars */}
      <div className="space-y-4 mb-6">
        <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest">
          Dimension Breakdown
        </h4>
        {scoreBefore.dimensions.map((dim) => {
          const after = afterMap.get(dim.id) ?? dim.score;
          return (
            <DimensionBar
              key={dim.id}
              label={dim.label}
              scoreBefore={dim.score}
              scoreAfter={after}
            />
          );
        })}
      </div>

      {/* Improvements list */}
      {improvements.length > 0 && (
        <div className="mb-6">
          <h4 className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">
            Key Improvements
          </h4>
          <div className="space-y-2">
            {improvements.map((imp, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="text-sm text-white/70 leading-snug">
                  {imp.change}
                  <span className="text-white/30 ml-1.5">
                    ({imp.dimension}: {imp.originalScore} &#8594; {imp.originalScore + (parseInt(imp.change) || 0)})
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href={`/editor/${newDeckShareId}`}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4361EE] to-[#6C63FF] text-white text-sm font-semibold shadow-lg shadow-[#4361EE]/25 hover:shadow-[#4361EE]/40 hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          <ArrowUpRight className="w-4 h-4" />
          Open Improved Deck
        </Link>
        {onRefineAgain && (
          <button
            onClick={onRefineAgain}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-white/70 text-sm font-medium hover:bg-white/[0.05] hover:text-white transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Refine Again
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-white/40 text-sm font-medium hover:text-white/60 transition-all"
          >
            <X className="w-4 h-4" />
            Keep Original
          </button>
        )}
      </div>
    </div>
  );
}
