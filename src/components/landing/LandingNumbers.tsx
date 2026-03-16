"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface Stat {
  value: number;
  suffix: string;
  label: string;
  animate: boolean;
}

const STATS: Stat[] = [
  { value: 10000, suffix: "+", label: "Decks Generated", animate: true },
  { value: 68, suffix: "", label: "Average PIQ Score Improvement", animate: true },
  { value: 60, suffix: "s", label: "Average Generation Time", animate: false },
  { value: 8, suffix: "", label: "Scoring Dimensions", animate: false },
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

    const duration = 1500; // ms
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
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

function StatCell({ stat, active, isLast }: { stat: Stat; active: boolean; isLast: boolean }) {
  const count = useCountUp(stat.value, stat.animate, active);

  return (
    <div
      className={`py-2 ${!isLast ? "md:border-r md:border-white/10" : ""}`}
    >
      <div className="text-4xl sm:text-5xl font-display font-bold bg-gradient-to-r from-[#4361ee] to-[#A855F7] bg-clip-text text-transparent">
        {formatNumber(count)}
        {stat.suffix}
      </div>
      <div className="text-xs sm:text-sm text-gray-400 mt-1">{stat.label}</div>
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
      ref={sectionRef}
      style={{ backgroundColor: "#0b111d" }}
      className="py-16 sm:py-20 px-4 sm:px-6"
      aria-label="PitchIQ in numbers"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
        {STATS.map((stat, i) => (
          <StatCell
            key={stat.label}
            stat={stat}
            active={active}
            isLast={i === STATS.length - 1}
          />
        ))}
      </div>
    </section>
  );
}
