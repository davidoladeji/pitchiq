"use client";

import { PIQScore } from "@/lib/types";

function scoreColor(score: number): string {
  if (score >= 80) return "#22c55e";
  if (score >= 60) return "#4361ee";
  if (score >= 40) return "#f59e0b";
  return "#ef4444";
}

export default function PIQScoreCard({ score }: { score: PIQScore }) {
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
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">PIQ Score</span>
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
        </div>
      </div>

      {/* Recommendations */}
      {score.recommendations.length > 0 && (
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
    </div>
  );
}
