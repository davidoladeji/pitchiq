"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Stat {
  value: number;
  suffix: string;
  label: string;
  animate: boolean;
  icon: React.ReactNode;
  cardClass: string;
  iconClass: string;
}

const ICON_PATHS = {
  document: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  ),
  trendingUp: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
    </svg>
  ),
  clock: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
  chartBar: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  ),
};

const STATS: Stat[] = [
  {
    value: 10000,
    suffix: "+",
    label: "Startups Scored",
    animate: true,
    icon: ICON_PATHS.document,
    cardClass: "bg-navy-50 border border-navy-100",
    iconClass: "bg-electric/10 border border-electric/20 text-electric",
  },
  {
    value: 68,
    suffix: "",
    label: "Avg. Score Improvement",
    animate: true,
    icon: ICON_PATHS.trendingUp,
    cardClass: "bg-navy-50 border border-navy-100",
    iconClass: "bg-electric/10 border border-electric/20 text-electric",
  },
  {
    value: 60,
    suffix: "s",
    label: "Average Analysis Time",
    animate: false,
    icon: ICON_PATHS.clock,
    cardClass: "bg-navy-50 border border-navy-100",
    iconClass: "bg-electric/10 border border-electric/20 text-electric",
  },
  {
    value: 8,
    suffix: "",
    label: "Scoring Dimensions",
    animate: false,
    icon: ICON_PATHS.chartBar,
    cardClass: "bg-navy-50 border border-navy-100",
    iconClass: "bg-electric/10 border border-electric/20 text-electric",
  },
];

function formatNumber(n: number): string {
  if (n >= 1000) return n.toLocaleString();
  return String(n);
}

function useCountUp(target: number, shouldAnimate: boolean, active: boolean) {
  const [current, setCurrent] = useState(0);
  const rafRef = useRef<number | null>(null);

  const animate = useCallback(() => {
    if (!active) return;

    if (!shouldAnimate) {
      setCurrent(target);
      return;
    }

    const duration = 1500;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [target, shouldAnimate, active]);

  useEffect(() => {
    animate();
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [animate]);

  return current;
}

const BLOB_POSITIONS = [
  "top-0 right-0 translate-x-1/3 -translate-y-1/3",
  "bottom-0 left-0 -translate-x-1/3 translate-y-1/3",
  "top-0 left-0 -translate-x-1/4 -translate-y-1/4",
  "bottom-0 right-0 translate-x-1/4 translate-y-1/4",
];

function StatCard({ stat, active, index }: { stat: Stat; active: boolean; index: number }) {
  const count = useCountUp(stat.value, stat.animate, active);

  return (
    <div
      className={`${stat.cardClass} rounded-2xl p-6 sm:p-7 relative overflow-hidden text-center`}
    >
      {/* Decorative blob */}
      <div
        className={`absolute ${BLOB_POSITIONS[index]} w-24 h-24 rounded-full bg-white/40 blur-2xl pointer-events-none`}
        aria-hidden="true"
      />

      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className={`${stat.iconClass} w-10 h-10 rounded-xl flex items-center justify-center`}>
          {stat.icon}
        </div>
      </div>

      {/* Number */}
      <div className="text-4xl sm:text-5xl font-display font-bold text-navy">
        {formatNumber(count)}
        {stat.suffix}
      </div>

      {/* Label */}
      <div className="text-sm text-navy-600 mt-2">{stat.label}</div>
    </div>
  );
}

export default function LandingNumbers() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          obs.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      id="numbers"
      ref={sectionRef}
      className="section-py bg-background px-4 sm:px-6"
      aria-label="PitchIQ in numbers"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-5xl mx-auto">
        {STATS.map((stat, i) => (
          <StatCard
            key={stat.label}
            stat={stat}
            active={active}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
