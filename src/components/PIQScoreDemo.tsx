"use client";

import { useEffect, useState } from "react";

const DIMENSIONS = [
  { label: "Narrative", score: 82, color: "#4361ee" },
  { label: "Market Sizing", score: 71, color: "#7c3aed" },
  { label: "Differentiation", score: 88, color: "#4361ee" },
  { label: "Financials", score: 65, color: "#f59e0b" },
  { label: "Team", score: 90, color: "#10b981" },
  { label: "Ask", score: 76, color: "#7c3aed" },
  { label: "Design", score: 85, color: "#4361ee" },
  { label: "Credibility", score: 79, color: "#10b981" },
];

const OVERALL_SCORE = 78;

function ScoreGauge({ score, animate }: { score: number; animate: boolean }) {
  const radius = 70;
  const stroke = 8;
  const circumference = 2 * Math.PI * radius;
  const progress = animate ? (score / 100) * circumference : 0;

  return (
    <div className="relative w-[180px] h-[180px] md:w-[200px] md:h-[200px]">
      <svg
        className="w-full h-full -rotate-90"
        viewBox="0 0 160 160"
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        {/* Progress arc */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          fill="none"
          stroke="url(#scoreGradient)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-[1500ms] ease-out"
        />
        <defs>
          <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#4361ee" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
      {/* Score number */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl md:text-5xl font-bold text-white tabular-nums">
          {animate ? score : 0}
        </span>
        <span className="text-xs text-blue-200/60 font-medium uppercase tracking-wider mt-1">
          PIQ Score
        </span>
      </div>
    </div>
  );
}

export default function PIQScoreDemo({ animate }: { animate: boolean }) {
  const [showDimensions, setShowDimensions] = useState(false);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => setShowDimensions(true), 600);
      return () => clearTimeout(timer);
    }
  }, [animate]);

  return (
    <div className="relative aspect-[16/9] rounded-2xl bg-hero-gradient shadow-premium-lg border border-white/10 flex flex-col items-center justify-center text-white p-6 md:p-10 overflow-hidden">
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-dark opacity-30" aria-hidden="true" />
      {/* Inner glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] bg-electric/10 rounded-full blur-[80px]" aria-hidden="true" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-10 w-full max-w-3xl">
        {/* Left: Score gauge */}
        <div className="flex flex-col items-center shrink-0">
          <ScoreGauge score={OVERALL_SCORE} animate={animate} />
          <div className="mt-3 flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
              <span className="text-sm font-bold text-electric-200">A</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Acme Corp</p>
              <p className="text-[11px] text-blue-200/50">Series A &middot; FinTech</p>
            </div>
          </div>
        </div>

        {/* Right: Dimension bars */}
        <div className="flex-1 w-full space-y-2.5 md:space-y-3">
          {DIMENSIONS.map((dim, i) => (
            <div
              key={dim.label}
              className={`flex items-center gap-3 transition-all duration-500 ease-out ${
                showDimensions
                  ? "opacity-100 translate-x-0"
                  : "opacity-0 translate-x-4"
              }`}
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <span className="text-[11px] text-blue-200/60 w-[88px] shrink-0 text-right font-medium">
                {dim.label}
              </span>
              <div className="flex-1 h-2 rounded-full bg-white/8 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-[1200ms] ease-out"
                  style={{
                    width: showDimensions ? `${dim.score}%` : "0%",
                    backgroundColor: dim.color,
                    transitionDelay: `${i * 80 + 200}ms`,
                  }}
                />
              </div>
              <span
                className={`text-xs font-semibold tabular-nums w-8 transition-opacity duration-500 ${
                  showDimensions ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  color: dim.color,
                  transitionDelay: `${i * 80 + 400}ms`,
                }}
              >
                {dim.score}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
