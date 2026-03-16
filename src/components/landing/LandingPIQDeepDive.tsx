"use client";

import { useEffect, useRef, useState } from "react";
import { PIQ_DIMENSIONS, GRADE_SCALE, SCORING_GUIDELINES } from "@/lib/piq-dimensions";

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
  // Determine text-anchor based on horizontal position
  const angle = ANGLE_OFFSET + index * ANGLE_STEP;
  const cos = Math.cos(angle);
  let anchor: "start" | "middle" | "end" = "middle";
  if (cos > 0.3) anchor = "start";
  if (cos < -0.3) anchor = "end";
  return { x, y, anchor };
}

/* ── Component ───────────────────────────────────────────────────────── */

export default function LandingPIQDeepDive() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const gradeRef = useRef<HTMLDivElement>(null);

  const [headerVisible, setHeaderVisible] = useState(false);
  const [chartVisible, setChartVisible] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
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
      // Slight delay for chart animation
      setTimeout(() => setChartVisible(v), 300);
    });
    observe(cardsRef.current, setCardsVisible, 0.05);
    observe(gradeRef.current, setGradeVisible, 0.1);

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  /* Radar chart dimensions */
  const svgSize = 380;
  const cx = svgSize / 2;
  const cy = svgSize / 2;
  const maxR = 140;
  const rings = [maxR * 0.33, maxR * 0.66, maxR];
  const labelR = maxR + 32;

  /* Condensed grade scale — pick a representative subset for the bar */
  const gradeBarEntries = GRADE_SCALE.filter((g) =>
    ["A+", "A", "B+", "B", "C+", "C", "D", "F"].includes(g.grade)
  );

  return (
    <section
      ref={sectionRef}
      className="section-py px-4 sm:px-6 bg-white"
      aria-label="PIQ Score methodology deep dive"
    >
      <div className="max-w-6xl mx-auto">
        {/* ── Section header ──────────────────────────────────────────── */}
        <div
          className="text-center mb-16 transition-all duration-700 ease-out"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateY(0)" : "translateY(24px)",
          }}
        >
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-electric/10 text-electric text-[11px] font-semibold uppercase tracking-[0.2em] mb-5">
            PIQ Score
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-navy tracking-[-0.02em] mb-4">
            Your deck&apos;s fundability, quantified
          </h2>
          <p className="text-navy-500 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed">
            Our AI evaluates your pitch across 8 investor-critical dimensions,
            weighted by what VCs actually care about. No guesswork — just a clear
            roadmap to a fundable deck.
          </p>
        </div>

        {/* ── Radar chart + legend row ────────────────────────────────── */}
        <div
          className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16 mb-20 transition-all duration-700 ease-out"
          style={{
            opacity: headerVisible ? 1 : 0,
            transform: headerVisible ? "translateY(0)" : "translateY(24px)",
          }}
        >
          {/* SVG radar chart */}
          <div className="relative flex-shrink-0">
            <svg
              viewBox={`0 0 ${svgSize} ${svgSize}`}
              className="w-[320px] h-[320px] sm:w-[380px] sm:h-[380px]"
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
                    r={4}
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
                      y={y - 6}
                      textAnchor={anchor}
                      className="fill-navy text-[11px] font-semibold"
                      style={{ fontSize: 11 }}
                    >
                      {dim.label.split(" ")[0]}
                    </text>
                    <text
                      x={x}
                      y={y + 8}
                      textAnchor={anchor}
                      className="fill-electric text-[10px] font-bold"
                      style={{ fontSize: 10 }}
                    >
                      {score}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend / summary sidebar */}
          <div className="max-w-sm text-center lg:text-left">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="text-5xl font-display font-bold text-navy">
                77.6
              </span>
              <span className="text-sm text-navy-500 leading-tight">
                Overall
                <br />
                PIQ Score
              </span>
            </div>
            <p className="text-navy-500 text-sm leading-relaxed mb-6">
              This example deck scores <strong className="text-navy">B+</strong> overall.
              Strong design and team presentation, but competitive differentiation
              and financials need work before investor meetings.
            </p>
            <div className="space-y-2">
              {SCORING_GUIDELINES.map((g) => (
                <div key={g.range} className="flex items-baseline gap-3 text-sm">
                  <span className="font-mono text-xs text-electric font-semibold w-14 shrink-0">
                    {g.range}
                  </span>
                  <span className="text-navy-500">
                    <span className="font-medium text-navy">{g.label}</span>
                    {" — "}
                    {g.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Dimension cards grid ────────────────────────────────────── */}
        <div ref={cardsRef} className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {PIQ_DIMENSIONS.map((dim, i) => {
              const score = EXAMPLE_SCORES[dim.id] ?? 50;
              return (
                <div
                  key={dim.id}
                  className="group bg-white rounded-xl border border-navy-200 p-6 hover:border-electric/20 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300"
                  style={{
                    opacity: cardsVisible ? 1 : 0,
                    transform: cardsVisible
                      ? "translateY(0)"
                      : "translateY(16px)",
                    transitionDelay: cardsVisible ? `${i * 60}ms` : "0ms",
                    transitionDuration: "500ms",
                    transitionTimingFunction: "cubic-bezier(0.25,0.46,0.45,0.94)",
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-electric/10 flex items-center justify-center text-electric">
                      <svg
                        width="20"
                        height="20"
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

                    <div className="flex-1 min-w-0">
                      {/* Title + weight badge */}
                      <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
                        <h3 className="text-[15px] font-semibold text-navy">
                          {dim.label}
                        </h3>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-electric/10 text-electric text-[10px] font-bold tracking-wide">
                          {dim.weight}%
                        </span>
                        <span className="ml-auto text-xs font-mono font-bold text-navy">
                          {score}/100
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-[13px] text-navy-500 leading-relaxed mb-3">
                        {dim.description}
                      </p>

                      {/* Tip */}
                      <div className="flex items-start gap-2 bg-amber-50 rounded-lg px-3 py-2.5">
                        <svg
                          className="w-4 h-4 text-amber-500 shrink-0 mt-0.5"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <p className="text-[12px] text-amber-800 leading-relaxed">
                          {dim.tip}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
          <h3 className="text-center text-lg sm:text-xl font-display font-bold text-navy mb-2">
            Grade Scale
          </h3>
          <p className="text-center text-sm text-navy-500 mb-8 max-w-lg mx-auto">
            Your overall PIQ Score maps to a letter grade investors instantly understand.
          </p>

          {/* Bar */}
          <div className="max-w-3xl mx-auto">
            <div className="flex rounded-xl overflow-hidden h-10 shadow-sm border border-navy-200">
              {GRADE_SCALE.map((g) => {
                const span = g.max - g.min + 1;
                return (
                  <div
                    key={g.grade}
                    className="relative flex items-center justify-center group/grade"
                    style={{
                      width: `${span}%`,
                      backgroundColor: g.color,
                    }}
                    title={`${g.grade}: ${g.min}–${g.max} (${g.label})`}
                  >
                    <span className="text-white text-[10px] sm:text-xs font-bold drop-shadow-sm">
                      {g.grade}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Labels under bar */}
            <div className="flex mt-2">
              {GRADE_SCALE.map((g) => {
                const span = g.max - g.min + 1;
                return (
                  <div
                    key={`label-${g.grade}`}
                    className="text-center"
                    style={{ width: `${span}%` }}
                  >
                    <span className="text-[9px] sm:text-[10px] text-navy-500 font-medium hidden sm:inline">
                      {g.min}–{g.max}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Compact legend row */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 mt-5 text-xs text-navy-500">
              {gradeBarEntries.map((g) => (
                <span key={g.grade} className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
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
