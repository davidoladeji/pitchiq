"use client";

import { useEffect, useRef, useState } from "react";

const CARDS = [
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4361ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      </svg>
    ),
    title: "Everything organized, nothing forgotten",
    desc: "Upload your existing deck or fill out a guided form — all your startup info in one place.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4361ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.912 5.813h6.088l-4.956 3.574 1.912 5.813L12 14.626 7.044 18.2l1.912-5.813L4 8.813h6.088z" />
      </svg>
    ),
    title: "Your deck designed automatically",
    desc: "AI generates investor-ready slides with charts, metrics, and the right narrative structure.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4361ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="12" width="4" height="9" />
        <rect x="10" y="7" width="4" height="14" />
        <rect x="17" y="3" width="4" height="18" />
      </svg>
    ),
    title: "Your strongest story, front and center",
    desc: "PIQ Score analyzes 8 dimensions to find weaknesses before investors do.",
  },
  {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#4361ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
      </svg>
    ),
    title: "When feedback comes, iterate fast",
    desc: "Refine your pitch and regenerate polished slides in seconds, not days.",
  },
];

export default function LandingTransformation() {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [visibleCards, setVisibleCards] = useState<boolean[]>(
    new Array(CARDS.length).fill(false)
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
      aria-label="How PitchIQ transforms your pitch workflow"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-medium tracking-wide border border-white/10 text-white/60 bg-white/[0.04] mb-5">
            Before &amp; With PitchIQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold">
            <span className="bg-gradient-to-r from-[#4361ee] to-[#A855F7] bg-clip-text text-transparent">
              Stop guessing. Start pitching.
            </span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {CARDS.map((card, i) => (
            <div
              key={card.title}
              ref={(el) => {
                cardRefs.current[i] = el;
              }}
              className="p-6 rounded-xl transition-all duration-700 ease-out"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                opacity: visibleCards[i] ? 1 : 0,
                transform: visibleCards[i] ? "translateY(0)" : "translateY(16px)",
                transitionDelay: visibleCards[i] ? `${i * 100}ms` : "0ms",
              }}
            >
              <div
                className="w-10 h-10 rounded-lg bg-[#4361ee]/10 border border-[#4361ee]/20 flex items-center justify-center mb-4"
              >
                {card.icon}
              </div>
              <h3 className="text-base font-semibold text-white mb-2">
                {card.title}
              </h3>
              <p className="text-sm text-[#A0A0B8]">{card.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
