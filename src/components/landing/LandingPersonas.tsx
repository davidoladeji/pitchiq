"use client";

import { useEffect, useRef, useState } from "react";

const PERSONAS = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
        <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    ),
    title: "The First-Time Founder",
    forLabel: "Pre-seed founders, bootstrappers, solo builders",
    desc: "You need a polished deck but can\u2019t afford a designer. PitchIQ gives you investor-grade slides in 60 seconds.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: "The Serial Operator",
    forLabel: "Repeat founders, VCs, accelerator leads",
    desc: "You need decks fast, with data-driven structure. Generate, score, iterate \u2014 at the speed you work.",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    title: "The Advisor & Consultant",
    forLabel: "Mentors, coaches, fractional CTOs",
    desc: "Help portfolio companies polish their pitch. One link, instant feedback, professional output.",
  },
];

export default function LandingPersonas() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleCards, setVisibleCards] = useState<boolean[]>(
    new Array(PERSONAS.length).fill(false)
  );

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    cardRefs.current.forEach((el, i) => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleCards((prev) => {
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
      className="section-py px-4 sm:px-6"
      style={{ backgroundColor: "#10141b" }}
      aria-label="Who PitchIQ is built for"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-display font-bold">
            <span className="bg-gradient-to-r from-[#4361ee] to-[#A855F7] bg-clip-text text-transparent">
              Built for people who move fast
            </span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PERSONAS.map((persona, i) => (
            <div
              key={persona.title}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="p-8 rounded-2xl text-center transition-all duration-700 ease-out"
              style={{
                backgroundColor: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.08)",
                opacity: visibleCards[i] ? 1 : 0,
                transform: visibleCards[i] ? "translateY(0)" : "translateY(16px)",
                transitionDelay: visibleCards[i] ? `${i * 100}ms` : "0ms",
              }}
            >
              {/* Icon */}
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#4361ee]/20 to-[#A855F7]/20 border border-[#4361ee]/20 flex items-center justify-center mb-5">
                {persona.icon}
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold mb-3">
                <span className="bg-gradient-to-r from-[#4361ee] to-[#A855F7] bg-clip-text text-transparent">
                  {persona.title}
                </span>
              </h3>

              {/* For label */}
              <p className="text-xs uppercase tracking-[0.15em] text-[#4361ee] font-semibold mb-3">
                For: {persona.forLabel}
              </p>

              {/* Description */}
              <p className="text-sm text-[#A0A0B8] leading-relaxed">
                {persona.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
