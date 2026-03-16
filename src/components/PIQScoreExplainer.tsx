"use client";

import Link from "next/link";
import { PIQ_DIMENSIONS, PIQ_BENCHMARKS, GRADE_SCALE, SCORING_GUIDELINES } from "@/lib/piq-dimensions";

export default function PIQScoreExplainer() {
  return (
    <div className="pb-20">
      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="px-6 pb-16 pt-8 text-center max-w-3xl mx-auto">
        <span className="inline-block px-3.5 py-1.5 rounded-full bg-electric/10 text-electric text-[11px] font-semibold uppercase tracking-[0.2em] mb-5">
          PIQ Score Methodology
        </span>
        <h1 className="text-4xl sm:text-5xl md:text-display-lg font-display font-bold text-navy tracking-[-0.02em] mb-5">
          How investors evaluate startups
        </h1>
        <p className="text-lg text-navy-500 max-w-xl mx-auto leading-relaxed mb-8">
          The PIQ Score measures your startup&apos;s fundraising readiness across 8
          investor-grade dimensions &mdash; the same criteria VCs use to make
          funding decisions.
        </p>
        <Link
          href="/create"
          className="inline-flex items-center justify-center min-h-[44px] px-8 py-3.5 rounded-full bg-electric text-white font-semibold text-base transition-all duration-300 hover:bg-electric-dark hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Get Your PIQ Score
        </Link>
      </section>

      {/* ── Benchmarks ─────────────────────────────────────────────────── */}
      <section className="px-6 pb-20 max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-navy text-center mb-3">
          How do you compare?
        </h2>
        <p className="text-navy-500 text-center mb-10 max-w-lg mx-auto">
          PIQ Score benchmarks based on thousands of analyzed pitch decks across
          funding stages.
        </p>

        <div className="space-y-4">
          {PIQ_BENCHMARKS.map((b) => (
            <div
              key={b.label}
              className="flex items-center gap-4 bg-navy-50 border border-navy-100 rounded-xl p-5"
            >
              {/* Score circle */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 font-display font-bold text-lg text-white"
                style={{ backgroundColor: b.color }}
              >
                {b.score}
              </div>

              {/* Label + grade */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-navy text-base">
                  {b.label}
                </p>
                <p className="text-sm text-navy-500">
                  Grade: {b.grade}
                </p>
              </div>

              {/* Bar */}
              <div className="hidden sm:block flex-1 max-w-[200px]">
                <div className="h-2.5 bg-navy-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${b.score}%`,
                      backgroundColor: b.color,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── 8 Dimensions ───────────────────────────────────────────────── */}
      <section className="px-6 pb-20 max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-navy text-center mb-3">
          The 8 Dimensions
        </h2>
        <p className="text-navy-500 text-center mb-12 max-w-lg mx-auto">
          Each dimension is weighted by how much investors actually prioritize
          it during due diligence.
        </p>

        <div className="space-y-6">
          {PIQ_DIMENSIONS.map((dim) => (
            <div
              key={dim.id}
              className="bg-white border border-navy-100 rounded-2xl p-6 sm:p-8"
            >
              {/* Header row */}
              <div className="flex items-start gap-4 mb-5">
                <div className="w-11 h-11 rounded-xl bg-electric/10 border border-electric/20 flex items-center justify-center text-electric shrink-0">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={dim.icon}
                    />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-semibold text-navy">
                      {dim.label}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-navy-100 text-navy-600 uppercase tracking-wider">
                      {dim.weight}% weight
                    </span>
                  </div>
                  <p className="text-sm text-navy-500 leading-relaxed">
                    {dim.longDescription}
                  </p>
                </div>
              </div>

              {/* Investor perspective */}
              <div className="mb-5 pl-0 sm:pl-15">
                <h4 className="text-xs font-semibold text-navy-600 uppercase tracking-wider mb-2">
                  What investors look for
                </h4>
                <p className="text-sm text-navy-500 leading-relaxed">
                  {dim.investorPerspective}
                </p>
              </div>

              {/* Common mistakes */}
              <div className="mb-5 pl-0 sm:pl-15">
                <h4 className="text-xs font-semibold text-navy-600 uppercase tracking-wider mb-2">
                  Common mistakes
                </h4>
                <ul className="space-y-1.5">
                  {dim.commonMistakes.map((m, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-navy-500"
                    >
                      <span className="text-red-400 mt-0.5 shrink-0">&times;</span>
                      {m}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Score examples */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pl-0 sm:pl-15">
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                    90+ Excellent
                  </p>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    {dim.scoreExamples.excellent}
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-1">
                    50-70 Average
                  </p>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    {dim.scoreExamples.average}
                  </p>
                </div>
                <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                  <p className="text-[10px] font-bold text-red-700 uppercase tracking-wider mb-1">
                    &lt;40 Poor
                  </p>
                  <p className="text-xs text-red-800 leading-relaxed">
                    {dim.scoreExamples.poor}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Grade Scale ────────────────────────────────────────────────── */}
      <section className="px-6 pb-20 max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-navy text-center mb-3">
          Grade Scale
        </h2>
        <p className="text-navy-500 text-center mb-8 max-w-md mx-auto">
          Your PIQ Score maps to a letter grade investors instantly understand.
        </p>

        {/* Grade bar */}
        <div className="mb-6">
          <div className="flex h-10 overflow-hidden gap-[2px]">
            {GRADE_SCALE.map((g, i) => {
              const span = g.max - g.min + 1;
              const isFirst = i === 0;
              const isLast = i === GRADE_SCALE.length - 1;
              return (
                <div
                  key={g.grade}
                  className="relative flex items-center justify-center"
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
                  title={`${g.grade}: ${g.min}\u2013${g.max} (${g.label})`}
                >
                  <span className="text-white text-[11px] font-bold drop-shadow-sm">
                    {g.grade}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Guidelines table */}
        <div className="bg-white border border-navy-100 rounded-xl overflow-hidden">
          {SCORING_GUIDELINES.map((g, i) => (
            <div
              key={g.range}
              className={`flex items-center gap-4 px-5 py-4 ${
                i < SCORING_GUIDELINES.length - 1 ? "border-b border-navy-50" : ""
              }`}
            >
              <span className="text-sm font-mono font-semibold text-navy w-16 shrink-0">
                {g.range}
              </span>
              <span className="text-sm font-semibold text-navy w-28 shrink-0">
                {g.label}
              </span>
              <span className="text-sm text-navy-500">
                {g.description}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Methodology ────────────────────────────────────────────────── */}
      <section className="px-6 pb-20 max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-navy text-center mb-3">
          Methodology
        </h2>
        <p className="text-navy-500 text-center mb-8 max-w-lg mx-auto">
          How the PIQ Score is calculated.
        </p>

        <div className="bg-navy-50 border border-navy-100 rounded-2xl p-6 sm:p-8 space-y-5">
          <div>
            <h3 className="text-sm font-semibold text-navy mb-1.5">
              Weighted scoring model
            </h3>
            <p className="text-sm text-navy-500 leading-relaxed">
              Each of the 8 dimensions receives an individual score from 0 to
              100. The overall PIQ Score is the weighted average, where
              Narrative Structure, Market Sizing, and Financial Clarity carry
              the highest weights (15% each) because they have the strongest
              correlation with successful fundraising outcomes.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-navy mb-1.5">
              AI-powered analysis
            </h3>
            <p className="text-sm text-navy-500 leading-relaxed">
              PitchIQ uses advanced language models trained on thousands of
              successful pitch decks to evaluate each dimension. The analysis
              considers slide content, structure, data quality, and visual
              presentation to produce actionable scores and feedback.
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-navy mb-1.5">
              Continuous calibration
            </h3>
            <p className="text-sm text-navy-500 leading-relaxed">
              Benchmarks are updated regularly based on aggregated,
              anonymized scoring data. The system learns from outcomes to
              ensure PIQ Scores remain predictive of real fundraising success.
            </p>
          </div>
        </div>
      </section>

      {/* ── Final CTA ──────────────────────────────────────────────────── */}
      <section className="px-6 pb-8 text-center max-w-2xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-display font-bold text-navy mb-4">
          Ready to know your number?
        </h2>
        <p className="text-navy-500 text-lg mb-8 max-w-md mx-auto">
          Upload your deck and get your PIQ Score in under 60 seconds.
        </p>
        <Link
          href="/create"
          className="inline-flex items-center justify-center min-h-[44px] px-10 py-4 rounded-full bg-electric text-white font-semibold text-lg transition-all duration-300 hover:bg-electric-dark hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Get Your PIQ Score
        </Link>
        <p className="mt-4 text-sm text-navy-400">
          Free analysis &middot; No credit card &middot; Your data stays private
        </p>
      </section>
    </div>
  );
}
