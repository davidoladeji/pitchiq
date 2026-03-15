"use client";

import { useEffect, useRef, useState } from "react";

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

const OVERALL = 78;

export default function LandingDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setAnimate(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const radius = 62;
  const stroke = 7;
  const circumference = 2 * Math.PI * radius;
  const progress = animate ? (OVERALL / 100) * circumference : 0;

  return (
    <section className="relative -mt-12 pb-20 px-6 z-10" ref={ref}>
      <div className="max-w-4xl mx-auto">
        <div
          className={`relative rounded-2xl bg-navy-900 border border-white/[0.06] shadow-2xl shadow-navy-950/50 overflow-hidden transition-all duration-700 ease-out ${
            animate ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Subtle glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[250px] bg-electric/8 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 p-6 sm:p-8 md:p-10">
            {/* Header row */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
              <span className="ml-3 text-xs text-white/20 font-mono">pitchiq.app/deck/acme-corp</span>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              {/* Score gauge */}
              <div className="flex flex-col items-center shrink-0">
                <div className="relative w-[160px] h-[160px]">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 140 140" aria-hidden="true">
                    <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
                    <circle
                      cx="70" cy="70" r={radius} fill="none"
                      stroke="url(#demoGrad)" strokeWidth={stroke} strokeLinecap="round"
                      strokeDasharray={circumference}
                      strokeDashoffset={circumference - progress}
                      className="transition-all duration-[1500ms] ease-out"
                    />
                    <defs>
                      <linearGradient id="demoGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4361ee" />
                        <stop offset="100%" stopColor="#7c3aed" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold text-white tabular-nums">{animate ? OVERALL : 0}</span>
                    <span className="text-[10px] text-blue-200/40 font-semibold uppercase tracking-widest mt-0.5">PIQ Score</span>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-electric/10 text-electric-200 text-xs font-bold">
                    B+ <span className="text-blue-200/40 font-normal">&middot; Fundable</span>
                  </span>
                </div>
              </div>

              {/* Dimension bars */}
              <div className="flex-1 w-full space-y-2.5">
                {DIMENSIONS.map((dim, i) => (
                  <div key={dim.label} className="flex items-center gap-3">
                    <span className="text-[11px] text-blue-200/40 w-[90px] shrink-0 text-right font-medium">
                      {dim.label}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-[1200ms] ease-out"
                        style={{
                          width: animate ? `${dim.score}%` : "0%",
                          backgroundColor: dim.color,
                          transitionDelay: `${i * 80 + 400}ms`,
                        }}
                      />
                    </div>
                    <span
                      className={`text-xs font-semibold tabular-nums w-7 text-right transition-opacity duration-500 ${animate ? "opacity-100" : "opacity-0"}`}
                      style={{ color: dim.color, transitionDelay: `${i * 80 + 600}ms` }}
                    >
                      {dim.score}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
