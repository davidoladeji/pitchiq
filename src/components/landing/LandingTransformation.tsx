"use client";

import { useEffect, useRef, useState } from "react";

type Tab = "before" | "with";

interface CardData {
  heading: string;
  desc: string;
}

const BEFORE_CARDS: CardData[] = [
  {
    heading: "Scattered across 10 tabs",
    desc: "Deck in Google Slides, notes in Notion, financials in Sheets. Nothing connects.",
  },
  {
    heading: "Designed by committee",
    desc: "Hours asking friends, tweaking fonts, Googling 'what VCs want to see'.",
  },
  {
    heading: "No idea if it\u2019s working",
    desc: "You send the deck and pray. Zero feedback until the meeting.",
  },
  {
    heading: "Weeks of iteration",
    desc: "Every round of feedback means starting over. Version 12 still isn\u2019t right.",
  },
];

const WITH_CARDS: CardData[] = [
  {
    heading: "Everything in one place",
    desc: "Upload or fill a form. PitchIQ pulls it together into a structured deck.",
  },
  {
    heading: "Designed by AI in 60 seconds",
    desc: "Investor-ready slides with charts, metrics, and narrative automatically.",
  },
  {
    heading: "Know your score before investors do",
    desc: "PIQ Score rates 8 dimensions. Fix weaknesses before you send.",
  },
  {
    heading: "Iterate in seconds, not weeks",
    desc: "Refine and regenerate. New version in one click.",
  },
];

/* ── Card style configs ─────────────────────────────────────────────── */

const CARD_STYLES = [
  {
    gradient: "bg-gradient-to-br from-electric-50 to-violet-50",
    blob: "bg-electric",
    iconBg: "bg-electric/10 border-electric/20",
    iconColor: "text-electric",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      </svg>
    ),
  },
  {
    gradient: "bg-gradient-to-br from-violet-50 to-purple-50",
    blob: "bg-violet-400",
    iconBg: "bg-violet-100 border-violet-200",
    iconColor: "text-violet-600",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 3l1.912 5.813h6.088l-4.956 3.574 1.912 5.813L12 14.626 7.044 18.2l1.912-5.813L4 8.813h6.088z" />
      </svg>
    ),
  },
  {
    gradient: "bg-gradient-to-br from-amber-50 to-orange-50",
    blob: "bg-amber-400",
    iconBg: "bg-amber-100 border-amber-200",
    iconColor: "text-amber-600",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="12" width="4" height="9" />
        <rect x="10" y="7" width="4" height="14" />
        <rect x="17" y="3" width="4" height="18" />
      </svg>
    ),
  },
  {
    gradient: "bg-gradient-to-br from-rose-50 to-pink-50",
    blob: "bg-rose-400",
    iconBg: "bg-rose-100 border-rose-200",
    iconColor: "text-rose-600",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 11-2.12-9.36L23 10" />
      </svg>
    ),
  },
];

/* ── Sparkle icon for "With PitchIQ" tab ────────────────────────────── */

function SparkleIcon() {
  return (
    <svg
      className="w-3.5 h-3.5 mr-1.5"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2l2.09 6.26L20.18 10l-6.09 1.74L12 18l-2.09-6.26L3.82 10l6.09-1.74L12 2z" />
    </svg>
  );
}

/* ── Component ──────────────────────────────────────────────────────── */

export default function LandingTransformation() {
  const [activeTab, setActiveTab] = useState<Tab>("before");
  const [animating, setAnimating] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const [headingVisible, setHeadingVisible] = useState(false);

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
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  /* Handle tab switch with animation */
  function switchTab(tab: Tab) {
    if (tab === activeTab || animating) return;
    setAnimating(true);
    // Brief delay to let cards fade out, then switch content
    setTimeout(() => {
      setActiveTab(tab);
      setTimeout(() => setAnimating(false), 50);
    }, 200);
  }

  const cards = activeTab === "before" ? BEFORE_CARDS : WITH_CARDS;

  return (
    <section
      ref={sectionRef}
      className="section-py px-4 sm:px-6 bg-navy-50"
      aria-label="How PitchIQ transforms your pitch workflow"
    >
      <div className="max-w-4xl mx-auto">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div
          className="text-center mb-12 transition-all duration-700 ease-out"
          style={{
            opacity: headingVisible ? 1 : 0,
            transform: headingVisible ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-navy mb-3">
            Stop guessing. Start pitching.
          </h2>
          <p className="text-navy-500 text-base max-w-lg mx-auto mb-8">
            See how PitchIQ replaces the chaos with a single, streamlined flow.
          </p>

          {/* ── Pill toggle ────────────────────────────────────────── */}
          <div className="inline-flex items-center bg-white rounded-full p-1 shadow-sm border border-navy-200">
            <button
              type="button"
              onClick={() => switchTab("before")}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                activeTab === "before"
                  ? "bg-navy text-white"
                  : "text-navy-500 hover:text-navy-700"
              }`}
            >
              Before
            </button>
            <button
              type="button"
              onClick={() => switchTab("with")}
              className={`px-5 py-2 text-sm font-medium rounded-full transition-all duration-200 flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                activeTab === "with"
                  ? "bg-electric text-white"
                  : "text-navy-500 hover:text-navy-700"
              }`}
            >
              <SparkleIcon />
              With PitchIQ
            </button>
          </div>
        </div>

        {/* ── Cards grid ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-4xl mx-auto">
          {cards.map((card, i) => {
            const style = CARD_STYLES[i];
            return (
              <div
                key={`${activeTab}-${i}`}
                className={`rounded-2xl p-7 relative overflow-hidden ${style.gradient} transition-all duration-500 ease-out`}
                style={{
                  opacity: animating ? 0 : 1,
                  transform: animating ? "translateY(12px)" : "translateY(0)",
                  transitionDelay: animating ? "0ms" : `${i * 80}ms`,
                }}
              >
                {/* Decorative blob */}
                <div
                  className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-[0.15] ${style.blob}`}
                  aria-hidden="true"
                />

                {/* Decorative SVG wave */}
                <svg
                  className="absolute bottom-0 left-0 w-full opacity-[0.06]"
                  viewBox="0 0 400 80"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0 40c40-20 80 10 120 0s80-30 120-10 80 20 120 0 40-10 40-10v60H0z"
                    fill="currentColor"
                    className={style.iconColor}
                  />
                </svg>

                {/* Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${style.iconBg} ${style.iconColor} relative z-10`}
                >
                  {style.icon}
                </div>

                {/* Text */}
                <h3 className="text-lg font-semibold text-navy mb-1.5 relative z-10">
                  {card.heading}
                </h3>
                <p className="text-sm text-navy-600 leading-relaxed relative z-10">
                  {card.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
