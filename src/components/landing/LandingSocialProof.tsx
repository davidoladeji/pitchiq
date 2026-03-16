"use client";

import { useEffect, useRef, useState } from "react";

const TESTIMONIALS = [
  {
    quote:
      "I went from a messy Google Doc to an investor-ready deck in under 2 minutes. The PIQ score helped me fix my financials slide before my YC interview.",
    name: "Sarah K.",
    role: "Pre-seed Founder",
  },
  {
    quote:
      "We use PitchIQ for every portfolio company at our accelerator. It saves us hours of back-and-forth on deck reviews.",
    name: "Marcus T.",
    role: "Accelerator Director",
  },
  {
    quote:
      "The before/after was wild. My first deck scored 34. After using the feedback, I got to 78 and closed my round.",
    name: "James L.",
    role: "Seed-Stage Founder",
  },
  {
    quote:
      "Finally a tool that understands what VCs actually look for. Not just pretty slides \u2014 real narrative structure.",
    name: "Priya M.",
    role: "Series A Founder",
  },
  {
    quote:
      "I was skeptical about AI-generated decks, but the quality genuinely surprised me. Sent it to my advisor and she thought I hired a designer.",
    name: "Alex R.",
    role: "Solo Founder",
  },
  {
    quote:
      "PitchIQ is now part of our standard playbook. Every founder in our cohort gets a PIQ score on day one.",
    name: "Diana C.",
    role: "Venture Partner",
  },
];

export default function LandingSocialProof() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [headingVisible, setHeadingVisible] = useState(false);
  const [visibleCards, setVisibleCards] = useState<boolean[]>(
    new Array(TESTIMONIALS.length).fill(false)
  );

  /* Fade-in heading on scroll */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHeadingVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Staggered card reveal */
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
        { threshold: 0.1 }
      );
      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  return (
    <section
      id="social-proof"
      ref={sectionRef}
      className="section-py px-4 sm:px-6 bg-navy-50"
      aria-label="What founders say about PitchIQ"
    >
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div
          className="text-center mb-14 transition-all duration-700 ease-out"
          style={{
            opacity: headingVisible ? 1 : 0,
            transform: headingVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-navy">
            Founders love PitchIQ
          </h2>
        </div>

        {/* Masonry-ish grid: 3 columns on desktop */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {TESTIMONIALS.map((t, i) => (
            <div
              key={t.name}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="break-inside-avoid bg-white border border-navy-100 rounded-xl p-6 shadow-sm transition-all duration-700 ease-out"
              style={{
                opacity: visibleCards[i] ? 1 : 0,
                transform: visibleCards[i] ? "translateY(0)" : "translateY(16px)",
                transitionDelay: visibleCards[i] ? `${i * 100}ms` : "0ms",
              }}
            >
              {/* Decorative quote mark */}
              <span
                className="block text-4xl leading-none text-navy-200 font-serif select-none"
                aria-hidden="true"
              >
                &ldquo;
              </span>

              {/* Quote */}
              <p className="text-sm text-navy-700 leading-relaxed mt-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* Attribution */}
              <p className="text-sm font-semibold text-navy mt-4">
                {t.name}
              </p>
              <p className="text-xs text-navy-500">{t.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
