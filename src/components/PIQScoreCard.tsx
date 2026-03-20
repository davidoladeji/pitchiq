"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { PIQScore } from "@/lib/types";
import { PIQ_DIMENSIONS } from "@/lib/piq-dimensions";
import { scoreColorHex } from "@/lib/design-tokens";
import { trackEvent } from "@/lib/analytics/product-events";

/* ── Helpers ───────────────────────────────────────────── */

/** Hex for SVG stroke/inline style; uses design-system token single source of truth. */
function scoreColor(score: number): string {
  return scoreColorHex(score);
}

function scoreBadgeClass(score: number): string {
  if (score >= 80) return "bg-emerald-500";
  if (score >= 60) return "bg-electric";
  if (score >= 40) return "bg-amber-500";
  return "bg-red-500";
}

function borderColorClass(score: number): string {
  if (score >= 80) return "border-l-emerald-500";
  if (score >= 60) return "border-l-electric";
  if (score >= 40) return "border-l-amber-500";
  return "border-l-red-500";
}

/* ── Radar chart geometry ──────────────────────────────── */

const NUM_AXES = 8;
const ANGLE_STEP = (2 * Math.PI) / NUM_AXES;
const ANGLE_OFFSET = -Math.PI / 2;

function polarToXY(cx: number, cy: number, radius: number, index: number): [number, number] {
  const angle = ANGLE_OFFSET + index * ANGLE_STEP;
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

function octagonPoints(cx: number, cy: number, radius: number): string {
  return Array.from({ length: NUM_AXES })
    .map((_, i) => polarToXY(cx, cy, radius, i).join(","))
    .join(" ");
}

/* ── Component ─────────────────────────────────────────── */

export default function PIQScoreCard({
  score,
  detail = "full",
}: {
  score: PIQScore;
  detail?: "basic" | "full";
}) {
  // Track score.viewed once per score value
  const trackedScore = useRef<number | null>(null);
  useEffect(() => {
    if (trackedScore.current !== score.overall) {
      trackEvent({ event: "score.viewed", properties: { score: score.overall } });
      trackedScore.current = score.overall;
    }
  }, [score.overall]);

  const gaugeRadius = 42;
  const gaugeStroke = 5;
  const circumference = 2 * Math.PI * gaugeRadius;
  const progress = (score.overall / 100) * circumference;
  const color = scoreColor(score.overall);
  const badgeClass = scoreBadgeClass(score.overall);

  // Radar chart sizing
  const radarSize = { desktop: 240, mobile: 200 };
  const cx = radarSize.desktop / 2;
  const cy = radarSize.desktop / 2;
  const maxR = radarSize.desktop / 2 - 30; // leave room for labels

  // Build radar data polygon from real dimension scores
  const radarPoints = score.dimensions
    .map((dim, i) => {
      const r = (dim.score / 100) * maxR;
      return polarToXY(cx, cy, r, i).join(",");
    })
    .join(" ");

  // Match dimension data with PIQ_DIMENSIONS for icons
  function getDimDef(dimId: string) {
    return PIQ_DIMENSIONS.find((d) => d.id === dimId);
  }

  return (
    <div className="bg-white rounded-2xl border border-navy-100 shadow-sm p-5 sm:p-6">
      {/* ── Header row: Gauge + Grade + Label ── */}
      <div className="flex items-center gap-4 mb-5">
        {/* Compact gauge ring */}
        <div className="relative w-[100px] h-[100px] shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r={gaugeRadius} fill="none" className="stroke-navy-100" strokeWidth={gaugeStroke} />
            <circle
              cx="50"
              cy="50"
              r={gaugeRadius}
              fill="none"
              stroke={color}
              strokeWidth={gaugeStroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference - progress}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-navy tabular-nums">{score.overall}</span>
            <span className="text-[9px] text-navy-500 uppercase tracking-wider font-medium">PIQ</span>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-md text-sm font-bold text-white ${badgeClass}`}>
              {score.grade}
            </span>
            <span className="text-sm font-medium text-navy-600">Fundability Rating</span>
          </div>
          <p className="text-xs text-navy-400">
            Scored across {score.dimensions.length} investor-critical dimensions
          </p>
        </div>
      </div>

      {/* AI disclaimer */}
      <p className="text-[11px] italic text-navy-400 mb-4">
        This score is directional guidance based on AI analysis of your deck. It does not guarantee funding outcomes.
      </p>

      {detail === "full" ? (
        <>
          {/* ── Radar Chart ── */}
          <div className="flex justify-center mb-5">
            <svg
              viewBox={`0 0 ${radarSize.desktop} ${radarSize.desktop}`}
              className="w-[200px] h-[200px] sm:w-[240px] sm:h-[240px]"
              aria-label="PIQ score radar chart"
            >
              {/* Grid rings at 33%, 66%, 100% */}
              {[0.33, 0.66, 1].map((pct) => (
                <polygon
                  key={pct}
                  points={octagonPoints(cx, cy, maxR * pct)}
                  fill="none"
                  className="stroke-navy-100"
                  strokeWidth={1}
                />
              ))}

              {/* Axis lines */}
              {Array.from({ length: NUM_AXES }).map((_, i) => {
                const [x, y] = polarToXY(cx, cy, maxR, i);
                return (
                  <line
                    key={i}
                    x1={cx}
                    y1={cy}
                    x2={x}
                    y2={y}
                    className="stroke-navy-100"
                    strokeWidth={0.5}
                  />
                );
              })}

              {/* Data fill polygon */}
              <polygon
                points={radarPoints}
                className="fill-electric/15 stroke-electric"
                strokeWidth={2}
                strokeLinejoin="round"
              />

              {/* Data points */}
              {score.dimensions.map((dim, i) => {
                const r = (dim.score / 100) * maxR;
                const [x, y] = polarToXY(cx, cy, r, i);
                return <circle key={dim.id} cx={x} cy={y} r={3} className="fill-electric" />;
              })}

              {/* Dimension labels around the radar */}
              {score.dimensions.map((dim, i) => {
                const labelR = maxR + 18;
                const [x, y] = polarToXY(cx, cy, labelR, i);
                const anchor =
                  Math.abs(x - cx) < 5 ? "middle" : x > cx ? "start" : "end";
                return (
                  <text
                    key={dim.id}
                    x={x}
                    y={y}
                    textAnchor={anchor}
                    dominantBaseline="central"
                    className="fill-navy-500"
                    fontSize={8}
                    fontWeight={500}
                  >
                    {dim.label.length > 14 ? dim.label.slice(0, 12) + "..." : dim.label}
                  </text>
                );
              })}
            </svg>
          </div>

          {/* ── Dimension Cards Grid ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {score.dimensions.map((dim) => {
              const def = getDimDef(dim.id);
              return (
                <div
                  key={dim.id}
                  className={`rounded-lg border border-navy-100 border-l-4 ${borderColorClass(dim.score)} bg-navy-50/30 p-3`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {def && (
                      <svg
                        className="w-4 h-4 text-navy-400 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d={def.icon} />
                      </svg>
                    )}
                    <span className="text-sm font-semibold text-navy flex-1 truncate">
                      {dim.label}
                    </span>
                    <span className="text-[10px] font-medium text-navy-400 bg-navy-100 rounded px-1.5 py-0.5">
                      {dim.weight}%
                    </span>
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: scoreColor(dim.score) }}
                    >
                      {dim.score}
                    </span>
                  </div>
                  <p className="text-xs text-navy-500 leading-relaxed line-clamp-2">
                    {dim.feedback}
                  </p>
                </div>
              );
            })}
          </div>

          {/* ── Recommendations ── */}
          {score.recommendations.length > 0 && (
            <div className="border-t border-navy-100 pt-4">
              <h3 className="text-sm font-semibold text-navy mb-3">Improve your score</h3>
              <div className="flex flex-col gap-2">
                {score.recommendations.map((rec, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-lg bg-electric/5 px-3 py-2.5"
                  >
                    <svg
                      className="w-4 h-4 shrink-0 mt-0.5 text-electric"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                    <span className="text-sm text-navy-600 leading-snug">{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* ── Basic plan view ── */
        <>
          {/* Blurred decorative radar chart with upgrade overlay */}
          <div className="relative mb-5">
            <div className="flex justify-center blur-[6px] select-none pointer-events-none" aria-hidden="true">
              <svg
                viewBox={`0 0 ${radarSize.desktop} ${radarSize.desktop}`}
                className="w-[200px] h-[200px]"
              >
                {[0.33, 0.66, 1].map((pct) => (
                  <polygon
                    key={pct}
                    points={octagonPoints(cx, cy, maxR * pct)}
                    fill="none"
                    className="stroke-navy-200"
                    strokeWidth={1}
                  />
                ))}
                {Array.from({ length: NUM_AXES }).map((_, i) => {
                  const [x, y] = polarToXY(cx, cy, maxR, i);
                  return (
                    <line key={i} x1={cx} y1={cy} x2={x} y2={y} className="stroke-navy-200" strokeWidth={0.5} />
                  );
                })}
                <polygon
                  points={octagonPoints(cx, cy, maxR * 0.6)}
                  className="fill-electric/10 stroke-navy-400"
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Link
                href="/#pricing"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white/90 shadow-md border border-navy-100 text-electric text-sm font-semibold hover:bg-electric hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                aria-label="Upgrade to see full PIQ radar chart"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
                Unlock full analysis
              </Link>
            </div>
          </div>

          {/* 2 visible dimension cards + blurred remaining */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
            {score.dimensions.slice(0, 2).map((dim) => {
              const def = getDimDef(dim.id);
              return (
                <div
                  key={dim.id}
                  className={`rounded-lg border border-navy-100 border-l-4 ${borderColorClass(dim.score)} bg-navy-50/30 p-3`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    {def && (
                      <svg
                        className="w-4 h-4 text-navy-400 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d={def.icon} />
                      </svg>
                    )}
                    <span className="text-sm font-semibold text-navy flex-1 truncate">
                      {dim.label}
                    </span>
                    <span className="text-[10px] font-medium text-navy-400 bg-navy-100 rounded px-1.5 py-0.5">
                      {dim.weight}%
                    </span>
                    <span
                      className="text-sm font-bold tabular-nums"
                      style={{ color: scoreColor(dim.score) }}
                    >
                      {dim.score}
                    </span>
                  </div>
                  <p className="text-xs text-navy-500 leading-relaxed line-clamp-2">
                    {dim.feedback}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Blurred remaining cards */}
          {score.dimensions.length > 2 && (
            <div className="relative mb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 blur-[6px] select-none pointer-events-none" aria-hidden="true">
                {score.dimensions.slice(2, 6).map((dim) => (
                  <div
                    key={dim.id}
                    className="rounded-lg border border-navy-100 border-l-4 border-l-navy-300 bg-navy-50/30 p-3"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-4 h-4 rounded bg-navy-200" />
                      <span className="text-sm font-semibold text-navy flex-1">{dim.label}</span>
                      <span className="text-sm font-bold text-navy-300">--</span>
                    </div>
                    <p className="text-xs text-navy-400">Detailed feedback available on Pro plan.</p>
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Link
                  href="/#pricing"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-electric/10 text-electric text-xs font-semibold hover:bg-electric/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  aria-label="Upgrade to see full PIQ breakdown"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Upgrade for full breakdown
                </Link>
              </div>
            </div>
          )}

          {/* Upgrade nudge */}
          <div className="border-t border-navy-100 pt-4">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-electric shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              <p className="text-sm text-navy-500">
                <Link href="/#pricing" className="text-electric font-semibold hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded">
                  Upgrade to Pro
                </Link>{" "}
                for dimension-by-dimension breakdown, radar analysis, and personalized coaching recommendations.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
