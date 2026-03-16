"use client";

import { useEffect, useRef, useState } from "react";

const DIMENSIONS = [
  { label: "Narrative", score: 82, color: "#4361ee" },
  { label: "Market Sizing", score: 71, color: "#A855F7" },
  { label: "Differentiation", score: 88, color: "#4361ee" },
  { label: "Financials", score: 65, color: "#F59E0B" },
  { label: "Team", score: 90, color: "#10B981" },
  { label: "Ask", score: 76, color: "#A855F7" },
  { label: "Design", score: 85, color: "#4361ee" },
  { label: "Credibility", score: 79, color: "#10B981" },
];

const OVERALL = 78;

const STATS = [
  { value: "8", label: "Dimensions" },
  { value: "0–100", label: "Score" },
  { value: "60s", label: "Generation" },
];

export default function LandingDemo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.12 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const radius = 62;
  const stroke = 5;
  const circumference = 2 * Math.PI * radius;
  const progress = visible ? (OVERALL / 100) * circumference : 0;

  return (
    <section
      ref={sectionRef}
      className="relative bg-navy section-py px-6"
      aria-label="Product preview — PIQ Score visualization"
    >
      {/* Ambient glow behind mockup */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-electric/[0.06] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Browser mockup */}
        <div
          className={`rounded-2xl border border-white/10 shadow-glow-lg overflow-hidden transition-all duration-1000 ease-out ${
            visible
              ? "opacity-100 translate-y-0 scale-100"
              : "opacity-0 translate-y-12 scale-[0.97]"
          }`}
        >
          {/* Minimal browser chrome — just the 3 dots */}
          <div className="flex items-center gap-2 px-5 py-3.5 bg-navy border-b border-white/[0.06]">
            <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
            <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
            <div className="w-3 h-3 rounded-full bg-[#28C840]" />
          </div>

          {/* Content area */}
          <div className="bg-navy p-4 sm:p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-14">
              {/* Score gauge */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-[160px] h-[160px]">
                  <svg
                    className="w-full h-full -rotate-90"
                    viewBox="0 0 140 140"
                    aria-hidden="true"
                  >
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="rgba(255,255,255,0.04)"
                      strokeWidth={stroke}
                    />
                    <circle
                      cx="70"
                      cy="70"
                      r={radius}
                      fill="none"
                      stroke="url(#demoGradNew)"
                      strokeWidth={stroke}
                      strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - progress}
                      className="transition-all duration-[1800ms] ease-out"
                    />
                    <defs>
                      <linearGradient
                        id="demoGradNew"
                        x1="0%"
                        y1="0%"
                        x2="100%"
                        y2="0%"
                      >
                        <stop offset="0%" stopColor="#4361ee" />
                        <stop offset="100%" stopColor="#A855F7" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-bold text-white tabular-nums tracking-tight">
                      {visible ? OVERALL : 0}
                    </span>
                    <span className="text-[10px] text-blue-100/70 font-semibold uppercase tracking-[0.2em] mt-1">
                      PIQ Score
                    </span>
                  </div>
                </div>
                <div className="mt-4 text-center">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-electric/10 border border-electric/20 text-electric-200 text-xs font-semibold tracking-wide">
                    B+
                    <span className="text-blue-100/70 font-normal">
                      &middot; Fundable
                    </span>
                  </span>
                </div>
              </div>

              {/* Dimension bars */}
              <div className="flex-1 w-full space-y-3.5">
                {DIMENSIONS.map((dim, i) => (
                  <div key={dim.label} className="flex items-center gap-3">
                    <span className="text-[10px] sm:text-[11px] text-blue-100/70 w-16 sm:w-[90px] shrink-0 text-right font-medium">
                      {dim.label}
                    </span>
                    <div className="flex-1 h-[5px] rounded-full bg-white/[0.04] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-[1400ms] ease-out"
                        style={{
                          width: visible ? `${dim.score}%` : "0%",
                          backgroundColor: dim.color,
                          transitionDelay: `${i * 90 + 500}ms`,
                        }}
                      />
                    </div>
                    <span
                      className={`text-xs font-semibold tabular-nums w-7 text-right transition-opacity duration-600 ${
                        visible ? "opacity-100" : "opacity-0"
                      }`}
                      style={{
                        color: dim.color,
                        transitionDelay: `${i * 90 + 700}ms`,
                      }}
                    >
                      {dim.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stat callouts */}
        <div
          className={`mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 transition-all duration-1000 ease-out delay-500 ${
            visible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center py-5 rounded-xl border border-white/10 bg-white/[0.02]"
            >
              <span className="text-2xl font-bold text-white tracking-tight">
                {stat.value}
              </span>
              <span className="text-sm text-blue-100/70 mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
