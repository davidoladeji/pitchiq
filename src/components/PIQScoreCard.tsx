"use client";

import Link from "next/link";
import { PIQScore } from "@/lib/types";

function scoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#4361ee";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

export default function PIQScoreCard({
  score,
  detail = "full",
}: {
  score: PIQScore;
  detail?: "basic" | "full";
}) {
  const radius = 54;
  const stroke = 6;
  const circumference = 2 * Math.PI * radius;
  const progress = (score.overall / 100) * circumference;
  const color = scoreColor(score.overall);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-start gap-6">
        {/* Gauge */}
        <div className="relative w-[128px] h-[128px] shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
            <circle cx="60" cy="60" r={radius} fill="none" stroke="#f3f4f6" strokeWidth={stroke} />
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="none"
              stroke={color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-navy tabular-nums">{score.overall}</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">PIQ Score</span>
          </div>
        </div>

        {/* Dimensions */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-3">
            <span
              className="px-2 py-0.5 rounded text-xs font-bold text-white"
              style={{ background: color }}
            >
              {score.grade}
            </span>
            <span className="text-sm text-gray-500">Fundability Rating</span>
          </div>

          {detail === "full" ? (
            <div className="space-y-2">
              {score.dimensions.map((dim) => (
                <div key={dim.id} className="flex items-center gap-2">
                  <span className="text-[11px] text-gray-500 w-[100px] shrink-0 text-right truncate">
                    {dim.label}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${dim.score}%`,
                        background: scoreColor(dim.score),
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold tabular-nums w-7 text-right" style={{ color: scoreColor(dim.score) }}>
                    {dim.score}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            /* Basic plan — blurred dimensions with upgrade CTA */
            <div className="relative">
              <div className="space-y-2 blur-[6px] select-none pointer-events-none" aria-hidden="true">
                {score.dimensions.slice(0, 4).map((dim) => (
                  <div key={dim.id} className="flex items-center gap-2">
                    <span className="text-[11px] text-gray-500 w-[100px] shrink-0 text-right truncate">
                      {dim.label}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div className="h-full rounded-full bg-gray-300" style={{ width: "60%" }} />
                    </div>
                    <span className="text-xs font-semibold tabular-nums w-7 text-right text-gray-400">--</span>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Link
                  href="/#pricing"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-electric/10 text-electric text-xs font-semibold hover:bg-electric/20 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Upgrade for full breakdown
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations — only for full detail */}
      {detail === "full" && score.recommendations.length > 0 && (
        <div className="mt-5 pt-5 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-navy mb-3">Improve your score</h3>
          <ul className="space-y-2">
            {score.recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 shrink-0 mt-0.5 text-electric" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {detail === "basic" && (
        <div className="mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-electric shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            <p className="text-sm text-gray-500">
              <Link href="/#pricing" className="text-electric font-semibold hover:underline">Upgrade to Pro</Link> for dimension-by-dimension breakdown and personalized coaching recommendations.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
