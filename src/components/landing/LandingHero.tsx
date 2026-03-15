"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100vh] flex items-center justify-center px-4 sm:px-6 overflow-hidden bg-navy"
      aria-label="PitchIQ hero — get your PIQ Score"
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid-dark pointer-events-none opacity-40" />

      {/* Animated gradient orb — electric #4361ee */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] sm:w-[500px] sm:h-[500px] md:w-[800px] md:h-[800px] rounded-full pointer-events-none animate-glow-pulse"
        style={{
          background:
            "radial-gradient(circle, rgba(67,97,238,0.15) 0%, rgba(67,97,238,0.06) 40%, transparent 70%)",
          filter: "blur(100px)",
        }}
      />

      {/* Secondary subtle orb */}
      <div
        className="absolute bottom-[10%] right-[15%] w-[200px] h-[200px] sm:w-[300px] sm:h-[300px] md:w-[400px] md:h-[400px] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, rgba(67,97,238,0.06) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Pill badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/[0.03] mb-10 transition-all duration-700 ease-out ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electric opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-electric" />
          </span>
          <span className="text-sm text-blue-100/70 font-medium tracking-wide">
            AI-Powered Fundraising Intelligence
          </span>
        </div>

        {/* Headline */}
        <h1
          className={`font-display text-4xl sm:text-5xl md:text-display-xl font-bold text-white leading-[1.05] tracking-[-0.04em] mb-6 sm:mb-8 transition-all duration-1000 ease-out delay-150 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Know your deck&apos;s
          <br />
          <span className="text-gradient">fundability score</span>
          <br />
          before investors do
        </h1>

        {/* Subtitle — blue-100/70 for WCAG 2.1 AA contrast on dark navy */}
        <p
          className={`text-lg text-blue-100/70 max-w-xl mx-auto mb-10 leading-relaxed transition-all duration-1000 ease-out delay-300 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Upload your pitch deck, get a 0&ndash;100 fundability score across 8
          dimensions, and know exactly what to fix &mdash; in under 60 seconds.
        </p>

        {/* Single CTA */}
        <div
          className={`mb-6 transition-all duration-1000 ease-out delay-500 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <Link
            href="/create"
            aria-label="Get your PIQ Score"
            className="group inline-flex items-center justify-center min-h-[44px] px-10 py-4 rounded-full bg-electric text-white font-semibold text-lg shadow-lg shadow-electric/25 transition-all duration-300 hover:shadow-[0_0_40px_rgba(67,97,238,0.35)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            Get Your PIQ Score
            <svg
              className="w-5 h-5 ml-2.5 group-hover:translate-x-1 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
              />
            </svg>
          </Link>
        </div>

        {/* Trust line — blue-200/50 for WCAG 2.1 AA contrast on dark navy */}
        <p
          className={`text-sm text-blue-200/50 tracking-wide transition-all duration-1000 ease-out delay-700 ${
            visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Free to start &middot; No credit card &middot; Privacy-first
        </p>
      </div>
    </section>
  );
}
