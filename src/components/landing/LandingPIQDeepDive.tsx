"use client";

import { useEffect, useRef, useState } from "react";
import { PIQ_DIMENSIONS, GRADE_SCALE } from "@/lib/piq-dimensions";
import { ELECTRIC_HEX, EMERALD_HEX, AMBER_HEX, RED_HEX } from "@/lib/design-tokens";

/* ── Example scores for the radar chart ──────────────────────────────── */

const EXAMPLE_SCORES: Record<string, number> = {
  narrative: 82,
  market: 75,
  differentiation: 68,
  financials: 71,
  team: 85,
  ask: 77,
  design: 90,
  credibility: 73,
};

const OVERALL_SCORE = 77.6;
const OVERALL_GRADE = "B+";

/* ── Radar chart helpers ─────────────────────────────────────────────── */

const NUM_AXES = 8;
const ANGLE_STEP = (2 * Math.PI) / NUM_AXES;
// Rotate -90 deg so first axis points up
const ANGLE_OFFSET = -Math.PI / 2;

function polarToXY(
  cx: number,
  cy: number,
  radius: number,
  index: number
): [number, number] {
  const angle = ANGLE_OFFSET + index * ANGLE_STEP;
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

function octagonPoints(cx: number, cy: number, radius: number): string {
  return Array.from({ length: NUM_AXES })
    .map((_, i) => polarToXY(cx, cy, radius, i).join(","))
    .join(" ");
}

function scorePolygonPoints(cx: number, cy: number, maxR: number): string {
  return PIQ_DIMENSIONS.map((dim, i) => {
    const score = EXAMPLE_SCORES[dim.id] ?? 50;
    const r = (score / 100) * maxR;
    return polarToXY(cx, cy, r, i).join(",");
  }).join(" ");
}

/* ── Label positions – pushed out further with manual tweaks ─────────── */

function labelPosition(
  cx: number,
  cy: number,
  radius: number,
  index: number
): { x: number; y: number; anchor: "start" | "middle" | "end" } {
  const [x, y] = polarToXY(cx, cy, radius, index);
  const angle = ANGLE_OFFSET + index * ANGLE_STEP;
  const cos = Math.cos(angle);
  let anchor: "start" | "middle" | "end" = "middle";
  if (cos > 0.3) anchor = "start";
  if (cos < -0.3) anchor = "end";
  return { x, y, anchor };
}

/* ── Dimension pill color mapping (design-system hex) ─────────────────── */

function scoreColor(score: number): string {
  if (score >= 85) return EMERALD_HEX;
  if (score >= 75) return ELECTRIC_HEX;
  if (score >= 65) return AMBER_HEX;
  return RED_HEX;
}

function scoreBgClass(score: number): string {
  if (score >= 85) return "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (score >= 75) return "bg-electric-50 text-electric border-electric/20";
  if (score >= 65) return "bg-amber-50 text-amber-700 border-amber-200";
  return "bg-red-50 text-red-600 border-red-200";
}

/* ── Component ───────────────────────────────────────────────────────── */

export default function LandingPIQDeepDive() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const gradeRef = useRef<HTMLDivElement>(null);

  const [headerVisible, setHeaderVisible] = useState(false);
  const [chartVisible, setChartVisible] = useState(false);
  const [gradeVisible, setGradeVisible] = useState(false);

  /* Scroll-triggered visibility */
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const observe = (
      el: HTMLElement | null,
      setter: (v: boolean) => void,
      threshold = 0.15
    ) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setter(true);
            obs.disconnect();
          }
        },
        { threshold }
      );
      obs.observe(el);
      observers.push(obs);
    };

    observe(sectionRef.current, (v) => {
      setHeaderVisible(v);
      setTimeout(() => setChartVisible(v), 300);
    });
    observe(gradeRef.current, setGradeVisible, 0.1);

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  /* Radar chart dimensions */
  const svgSize = 340;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const maxR = 120;
  const rings = [maxR * 0.33, maxR * 0.66, maxR];
  const labelR = maxR + 30;

  /* Condensed grade scale — pick a representative subset for the bar */
  const gradeBarEntries = GRADE_SCALE.filter((g) =>
    ["A+", "A", "B+", "B", "C+", "C", "D", "F"].includes(g.grade)
  );

  return (
    <section
      ref={sectionRef}
      className="py-16 sm:py-20 px-4 sm:px-6 bg-white"
      aria-label="PIQ Score methodology deep dive"
    >
      <div className="max-w-5xl mx-auto">
        {/* ── Section header (compact) ────────────────────────────────── */}
        <div
          className="text-center mb-10 transition-all duration-700 ease-out"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateY(0)" : "translateY(24px)",
          }}
        >
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-electric/10 text-electric text-[11px] font-semibold uppercase tracking-[0.2em] mb-4">
            PIQ Score
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-navy tracking-[-0.02em] mb-3">
            Your deck&apos;s fundability, quantified
          </h2>
          <p className="text-navy-500 text-base max-w-xl mx-auto font-light leading-relaxed">
            Our AI evaluates your pitch across 8 investor-critical dimensions,
            weighted by what VCs actually care about.
          </p>
        </div>

        {/* ── Main 2-panel card ────────────────────────────────────────── */}
        <div
          className="rounded-2xl bg-gradient-to-br from-electric-50 to-violet-50 relative overflow-hidden p-6 sm:p-8 mb-10 transition-all duration-700 ease-out"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateY(0)" : "translateY(24px)",
          }}
        >
          {/* Decorative blob */}
          <div
            className="absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-[0.15] bg-electric"
            aria-hidden="true"
          />

          {/* Decorative SVG wave */}
          <svg
            className="absolute bottom-0 left-0 w-full opacity-[0.06]"
            viewBox="0 0 400 80"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M0 40c40-20 80 10 120 0s80-30 120-10 80 20 120 0 40-10 40-10v60H0z"
              fill="currentColor"
              className="text-electric"
            />
          </svg>

          <div className="relative z-10 flex flex-col lg:flex-row items-center lg:items-start gap-8">
            {/* ── Left: Radar chart ──────────────────────────────────── */}
            <div className="flex-shrink-0">
              <svg
                viewBox={`0 0 ${svgSize} ${svgSize}`}
                className="w-[280px] h-[280px] sm:w-[340px] sm:h-[340px]"
                aria-label="Radar chart showing example PIQ Score across 8 dimensions"
                role="img"
              >
                {/* Grid rings */}
                {rings.map((r, i) => (
                  <polygon
                    key={`ring-${i}`}
                    points={octagonPoints(cx, cy, r)}
                    fill="none"
                    className="stroke-navy-200"
                    strokeWidth={i === rings.length - 1 ? 1.5 : 0.75}
                  />
                ))}

                {/* Axis lines */}
                {PIQ_DIMENSIONS.map((_, i) => {
                  const [x, y] = polarToXY(cx, cy, maxR, i);
                  return (
                    <line
                      key={`axis-${i}`}
                      x1={cx}
                      y1={cy}
                      x2={x}
                      y2={y}
                      className="stroke-navy-200"
                      strokeWidth={0.75}
                    />
                  );
                })}

                {/* Score fill area */}
                <polygon
                  points={scorePolygonPoints(cx, cy, maxR)}
                  className="fill-electric/10 stroke-electric transition-all duration-1000 ease-out origin-center"
                  strokeWidth={2}
                  strokeLinejoin="round"
                  style={{
                    opacity: chartVisible ? 1 : 0,
                    transform: chartVisible ? "scale(1)" : "scale(0)",
                    transformOrigin: `${cx}px ${cy}px`,
                  }}
                />

                {/* Score dots */}
                {PIQ_DIMENSIONS.map((dim, i) => {
                  const score = EXAMPLE_SCORES[dim.id] ?? 50;
                  const r = (score / 100) * maxR;
                  const [x, y] = polarToXY(cx, cy, r, i);
                  return (
                    <circle
                      key={`dot-${i}`}
                      cx={x}
                      cy={y}
                      r={3.5}
                      className="fill-electric stroke-white transition-all duration-1000 ease-out"
                      strokeWidth={2}
                      style={{
                        opacity: chartVisible ? 1 : 0,
                      }}
                    />
                  );
                })}

                {/* Dimension labels */}
                {PIQ_DIMENSIONS.map((dim, i) => {
                  const { x, y, anchor } = labelPosition(cx, cy, labelR, i);
                  const score = EXAMPLE_SCORES[dim.id] ?? 50;
                  return (
                    <g key={`label-${i}`}>
                      <text
                        x={x}
                        y={y - 5}
                        textAnchor={anchor}
                        className="fill-navy text-[10px] font-semibold"
                        style={{ fontSize: 10 }}
                      >
                        {dim.label.split(" ")[0]}
                      </text>
                      <text
                        x={x}
                        y={y + 7}
                        textAnchor={anchor}
                        className="fill-electric text-[9px] font-bold"
                        style={{ fontSize: 9 }}
                      >
                        {score}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* ── Right: Score summary + dimension pills ─────────────── */}
            <div className="flex-1 min-w-0 w-full lg:pt-2">
              {/* Overall score */}
              <div className="flex items-center gap-3 mb-5">
                <span className="text-5xl font-display font-bold text-navy">
                  {OVERALL_SCORE}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-electric/10 border border-electric/20 text-electric text-sm font-bold">
                  {OVERALL_GRADE}
                </span>
                <span className="text-sm text-navy-500 leading-tight">
                  Overall<br />PIQ Score
                </span>
              </div>

              <p className="text-navy-500 text-sm leading-relaxed mb-5 max-w-md">
                Strong design and team presentation, but competitive
                differentiation and financials need work before investor meetings.
              </p>

              {/* 8 dimension rows */}
              <div className="space-y-2">
                {PIQ_DIMENSIONS.map((dim, i) => {
                  const score = EXAMPLE_SCORES[dim.id] ?? 50;
                  const barWidth = `${score}%`;
                  const color = scoreColor(score);
                  return (
                    <div
                      key={dim.id}
                      className="flex items-center gap-3 transition-all duration-500 ease-out"
                      style={{
                        opacity: chartVisible ? 1 : 0,
                        transform: chartVisible
                          ? "translateX(0)"
                          : "translateX(12px)",
                        transitionDelay: chartVisible ? `${i * 80}ms` : "0ms",
                      }}
                    >
                      {/* Icon */}
                      <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-white/70 border border-navy-200/40 flex items-center justify-center text-navy-500">
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={1.5}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d={dim.icon} />
                        </svg>
                      </div>

                      {/* Label */}
                      <span className="text-[13px] font-medium text-navy w-28 sm:w-36 shrink-0 truncate">
                        {dim.label}
                      </span>

                      {/* Score bar */}
                      <div className="flex-1 h-2 bg-white/60 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out"
                          style={{
                            width: chartVisible ? barWidth : "0%",
                            backgroundColor: color,
                            transitionDelay: chartVisible
                              ? `${300 + i * 80}ms`
                              : "0ms",
                          }}
                        />
                      </div>

                      {/* Score badge */}
                      <span
                        className={`text-[12px] font-bold w-10 text-right shrink-0 tabular-nums px-1.5 py-0.5 rounded-md border ${scoreBgClass(score)}`}
                      >
                        {score}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Weight note */}
              <p className="text-[11px] text-navy-400 mt-4">
                Weighted by investor priority — Narrative, Market &amp; Financials carry the most weight.
              </p>
            </div>
          </div>
        </div>

        {/* ── Grade scale bar ─────────────────────────────────────────── */}
        <div
          ref={gradeRef}
          className="transition-all duration-700 ease-out"
          style={{
            opacity: gradeVisible ? 1 : 0,
            transform: gradeVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <h3 className="text-center text-base sm:text-lg font-display font-bold text-navy mb-1.5">
            Grade Scale
          </h3>
          <p className="text-center text-[13px] text-navy-500 mb-5 max-w-md mx-auto">
            Your overall PIQ Score maps to a letter grade investors instantly understand.
          </p>

          {/* Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="flex h-9 overflow-hidden gap-[2px]">
              {GRADE_SCALE.map((g, i) => {
                const span = g.max - g.min + 1;
                const isFirst = i === 0;
                const isLast = i === GRADE_SCALE.length - 1;
                return (
                  <div
                    key={g.grade}
                    className="relative flex items-center justify-center group/grade"
                    style={{
                      width: `${span}%`,
                      backgroundColor: g.color,
                      borderRadius: isFirst
                        ? "8px 0 0 8px"
                        : isLast
                          ? "0 8px 8px 0"
                          : "0",
                      opacity: 0.85,
                    }}
                    title={`${g.grade}: ${g.min}–${g.max} (${g.label})`}
                  >
                    <span className="text-white text-[10px] sm:text-[11px] font-bold drop-shadow-sm">
                      {g.grade}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Labels under bar */}
            <div className="flex mt-1.5 gap-[2px]">
              {GRADE_SCALE.map((g) => {
                const span = g.max - g.min + 1;
                return (
                  <div
                    key={`label-${g.grade}`}
                    className="text-center"
                    style={{ width: `${span}%` }}
                  >
                    <span className="text-[9px] text-navy-400 font-medium hidden sm:inline">
                      {g.min}–{g.max}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Compact legend row */}
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-4 text-[11px] text-navy-500">
              {gradeBarEntries.map((g) => (
                <span key={g.grade} className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: g.color }}
                  />
                  <span className="font-semibold text-navy">{g.grade}</span>
                  {g.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
