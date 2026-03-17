"use client";

import { useEffect, useRef, useState } from "react";
import { ELECTRIC_HEX, AMBER_HEX, EMERALD_HEX } from "@/lib/design-tokens";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Flat monochrome SVG icons */
const IconRocket = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
    <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
    <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
    <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
  </svg>
);

const IconBolt = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const IconHandshake = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87" />
    <path d="M16 3.13a4 4 0 010 7.75" />
  </svg>
);

const PERSONAS = [
  {
    icon: IconRocket,
    title: "The First-Time Founder",
    forAudience: "Pre-seed founders, bootstrappers, solo builders",
    desc: "You\u2019re building something real but haven\u2019t raised before. You need a deck that looks professional and tells the right story \u2014 without spending weeks on design or $5k on a consultant. PitchIQ generates investor-ready slides from your answers in 60 seconds.",
    accent: ELECTRIC_HEX,
  },
  {
    icon: IconBolt,
    title: "The Serial Operator",
    forAudience: "Repeat founders, VCs, accelerator leads",
    desc: "You\u2019ve done this before and know what matters: speed, structure, and data. You need decks fast \u2014 for portfolio companies, demo days, or your next raise. Generate, score, and iterate at the pace you actually work.",
    accent: AMBER_HEX,
  },
  {
    icon: IconHandshake,
    title: "The Advisor & Consultant",
    forAudience: "Mentors, coaches, fractional CTOs",
    desc: "You help founders get funded. Instead of manually reviewing messy decks, send them a PitchIQ link. They get an instant score, you get structured feedback to work from, and everyone saves hours.",
    accent: EMERALD_HEX,
  },
];

export default function LandingPersonas() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleCards, setVisibleCards] = useState<boolean[]>(
    new Array(PERSONAS.length).fill(false)
  );

  useEffect(() => {
    if (prefersReducedMotion()) {
      setVisibleCards(new Array(PERSONAS.length).fill(true));
      return;
    }
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
        { threshold: 0.15 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  return (
    <section
      className="section-py px-4 sm:px-6 bg-navy"
      aria-labelledby="personas-heading"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 id="personas-heading" className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold leading-tight text-white">
            Built for founders who measure
            <br />
            before they pitch
          </h2>
          <p className="mt-5 text-base sm:text-lg text-white/70 max-w-xl mx-auto">
            Whether you&apos;re raising for the first time or helping someone
            who is.
          </p>
        </div>

        {/* Cards — stacked vertically */}
        <div className="flex flex-col gap-5">
          {PERSONAS.map((persona, i) => (
            <div
              key={persona.title}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="bg-white/[0.04] border border-white/[0.06] backdrop-blur-sm rounded-2xl overflow-hidden transition-all duration-700 ease-out"
              style={{
                opacity: visibleCards[i] ? 1 : 0,
                transform: visibleCards[i] ? "translateY(0)" : "translateY(24px)",
                transitionDelay: visibleCards[i] ? `${i * 120}ms` : "0ms",
              }}
            >
              <div className="flex flex-col md:flex-row">
                {/* Left side — ~65% */}
                <div className="flex-1 p-8 sm:p-10 md:w-[65%]">
                  {/* Icon */}
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-6"
                    style={{
                      backgroundColor: `${persona.accent}15`,
                      border: `1px solid ${persona.accent}25`,
                    }}
                  >
                    <persona.icon color={persona.accent} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-4">
                    {persona.title}
                  </h3>

                  {/* Description */}
                  <p className="text-[15px] sm:text-base text-white/50 leading-relaxed max-w-lg">
                    {persona.desc}
                  </p>
                </div>

                {/* Right side — ~35% */}
                <div className="md:w-[35%] border-t md:border-t-0 md:border-l border-white/[0.06] bg-white/[0.02] p-8 sm:p-10 flex flex-col justify-center">
                  <span
                    className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-3 block"
                    style={{ color: persona.accent }}
                  >
                    For
                  </span>
                  <span className="text-lg sm:text-xl font-bold text-white leading-snug">
                    {persona.forAudience}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
