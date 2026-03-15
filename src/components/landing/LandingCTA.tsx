"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function LandingCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section className="py-24 md:py-32 px-6 bg-navy-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-electric/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-dark pointer-events-none opacity-30" />

      <div ref={ref} className="max-w-2xl mx-auto text-center relative z-10">
        <h2
          className={`text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight transition-all duration-700 ease-out ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Ready to pitch smarter?
        </h2>
        <p
          className={`text-blue-100/50 text-lg mb-10 max-w-lg mx-auto transition-all duration-700 ease-out delay-100 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Join founders using AI to create decks that close meetings.
        </p>
        <div
          className={`transition-all duration-700 ease-out delay-200 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <Link
            href="/create"
            className="group inline-flex items-center justify-center min-h-[52px] px-10 py-3.5 rounded-xl bg-electric text-white font-semibold text-lg shadow-lg shadow-electric/25 hover:shadow-xl hover:shadow-electric/30 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
          >
            Generate Your Deck &mdash; Free
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <p className="mt-3 text-sm text-blue-200/30">No signup &middot; No credit card</p>
        </div>
      </div>
    </section>
  );
}
