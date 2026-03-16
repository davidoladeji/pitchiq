"use client";

import { useEffect, useRef, useState } from "react";

const FEATURES = [
  {
    title: "PIQ Score",
    desc: "0\u2013100 fundability rating across 8 investor-grade dimensions with actionable coaching.",
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
    pro: false,
  },
  {
    title: "Investor Targeting",
    desc: "Decks restructured for VC, angel, or accelerator priorities. Right story, right audience.",
    icon: "M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
    pro: false,
  },
  {
    title: "Upload & Score",
    desc: "Already have a deck? Upload a PDF or PPTX and get your PIQ Score instantly.",
    icon: "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5",
    pro: false,
  },
  {
    title: "12+ Design Themes",
    desc: "Midnight, Arctic, Ember, Forest, and more. Professionally designed for every brand.",
    icon: "M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z",
    pro: false,
  },
  {
    title: "View Analytics",
    desc: "Track opens, slide-level engagement, and time spent. Know when to follow up.",
    icon: "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5s8.577 3.007 9.963 7.178c.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5s-8.577-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
    pro: true,
  },
  {
    title: "Shareable Links",
    desc: "Every deck gets a unique URL with live tracking. Share a link, not a dead PDF.",
    icon: "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244",
    pro: false,
  },
];

const CARD_THEMES = [
  {
    bg: "bg-navy-50 border border-navy-100",
    blob: "bg-electric",
    iconBg: "bg-electric/10",
    iconBorder: "border-electric/20",
    iconColor: "text-electric",
  },
  {
    bg: "bg-white border border-navy-100",
    blob: "bg-electric",
    iconBg: "bg-electric/10",
    iconBorder: "border-electric/20",
    iconColor: "text-electric",
  },
  {
    bg: "bg-navy-50 border border-navy-100",
    blob: "bg-navy-300",
    iconBg: "bg-navy-100",
    iconBorder: "border-navy-200",
    iconColor: "text-navy-600",
  },
  {
    bg: "bg-white border border-navy-100",
    blob: "bg-navy-300",
    iconBg: "bg-navy-100",
    iconBorder: "border-navy-200",
    iconColor: "text-navy-600",
  },
  {
    bg: "bg-navy-50 border border-navy-100",
    blob: "bg-electric",
    iconBg: "bg-electric/10",
    iconBorder: "border-electric/20",
    iconColor: "text-electric",
  },
  {
    bg: "bg-white border border-navy-100",
    blob: "bg-electric",
    iconBg: "bg-electric/10",
    iconBorder: "border-electric/20",
    iconColor: "text-electric",
  },
];

export default function LandingFeatures() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = section.querySelectorAll("[data-feature-card]");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(
              (entry.target as HTMLElement).dataset.featureIndex
            );
            setVisibleCards((prev) => new Set(prev).add(index));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );

    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="features"
      className="section-py px-6 bg-navy-50"
      aria-label="Features — built for fundraising intelligence"
    >
      <div className="max-w-5xl mx-auto" ref={sectionRef}>
        {/* Section header */}
        <div className="text-center mb-20">
          <span className="inline-block px-3.5 py-1.5 rounded-full bg-electric/10 text-electric text-[11px] font-semibold uppercase tracking-[0.2em] mb-5">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[2.75rem] lg:text-5xl font-bold text-navy tracking-[-0.025em] mb-5 font-display leading-[1.1]">
            Built for fundraising intelligence
          </h2>
          <p className="text-lg text-navy-500 max-w-md mx-auto leading-relaxed">
            Every feature designed to quantify, improve, and track your fundraising readiness.
          </p>
        </div>

        {/* Feature cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, i) => {
            const theme = CARD_THEMES[i % CARD_THEMES.length];
            const isVisible = visibleCards.has(i);
            const staggerDelay = isVisible
              ? `${(i % 3) * 100 + 80}ms`
              : "0ms";

            return (
              <div
                key={feat.title}
                data-feature-card
                data-feature-index={i}
                className={`group relative rounded-2xl p-7 overflow-hidden cursor-default transition-all duration-500 ease-out ${theme.bg} ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-6"
                }`}
                style={{ transitionDelay: staggerDelay }}
              >
                {/* Decorative blob */}
                <div
                  className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-[0.15] ${theme.blob}`}
                  aria-hidden="true"
                />

                {/* SVG wave */}
                <svg
                  className="absolute bottom-0 left-0 w-full opacity-[0.06]"
                  viewBox="0 0 400 60"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0 30 Q50 0 100 30 T200 30 T300 30 T400 30 V60 H0Z"
                    fill="currentColor"
                  />
                </svg>

                {/* Icon */}
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${theme.iconBg} ${theme.iconBorder} ${theme.iconColor}`}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d={feat.icon}
                    />
                  </svg>
                </div>

                {/* Title + Pro badge */}
                <div className="flex items-center gap-2.5 mb-2">
                  <h3 className="text-lg font-semibold text-navy">
                    {feat.title}
                  </h3>
                  {feat.pro && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-electric/10 text-electric uppercase tracking-wider leading-none">
                      Pro
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="text-sm text-navy-600 leading-relaxed relative">
                  {feat.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
