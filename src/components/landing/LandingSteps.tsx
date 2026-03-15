"use client";

import { useEffect, useRef, useState } from "react";

const STEPS = [
  {
    num: "01",
    title: "Describe Your Startup",
    desc: "Company details, problem, solution, traction, and funding target — a 5-step guided form.",
  },
  {
    num: "02",
    title: "AI Builds Your Deck",
    desc: "10-14 slides structured for your specific investor audience with charts, metrics, and timelines.",
  },
  {
    num: "03",
    title: "Get Your PIQ Score",
    desc: "0–100 fundability rating across 8 investor-grade dimensions with personalized feedback.",
  },
  {
    num: "04",
    title: "Share & Track",
    desc: "Export PDF, share live links, and see who opens your deck and how long they spend.",
  },
];

export default function LandingSteps() {
  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleRows, setVisibleRows] = useState<boolean[]>(
    new Array(STEPS.length).fill(false)
  );

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    rowRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleRows((prev) => {
              const next = [...prev];
              next[i] = true;
              return next;
            });
            obs.disconnect();
          }
        },
        { threshold: 0.2 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  return (
    <section
      id="how-it-works"
      className="section-py bg-white px-6"
      aria-label="How it works — four steps to fundraising clarity"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-20">
          <p className="text-xs tracking-[0.2em] text-zinc-400 font-medium uppercase mb-4">
            HOW IT WORKS
          </p>
          <h2 className="text-display-lg font-display text-[#1a1a2e]">
            From idea to scored deck
            <br />
            in 60 seconds
          </h2>
        </div>

        {/* Numbered list */}
        <div>
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              ref={(el) => {
                rowRefs.current[i] = el;
              }}
              className={`group flex items-start gap-8 sm:gap-12 py-8 sm:py-10 transition-all duration-700 ease-out ${
                i < STEPS.length - 1 ? "border-b border-zinc-100" : ""
              } ${
                visibleRows[i]
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{
                transitionDelay: visibleRows[i] ? `${i * 120}ms` : "0ms",
              }}
            >
              {/* Step number */}
              <span className="text-6xl font-display font-bold text-zinc-200 leading-none select-none transition-colors duration-300 group-hover:text-[#4361ee] shrink-0 w-20 sm:w-24">
                {step.num}
              </span>

              {/* Content */}
              <div className="pt-2">
                <h3 className="text-xl font-semibold text-[#1a1a2e] mb-2">
                  {step.title}
                </h3>
                <p className="text-base text-zinc-500 leading-relaxed max-w-lg">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
