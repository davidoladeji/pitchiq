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
    <section
      className="section-py px-6 bg-navy relative overflow-hidden"
      aria-label="Ready to pitch smarter — generate your deck for free"
    >
      <div className="absolute inset-0 bg-hero-mesh" />

      <div ref={ref} className="max-w-2xl mx-auto text-center relative z-10">
        <h2
          className={`text-3xl sm:text-4xl md:text-5xl font-display text-white mb-5 tracking-[-0.02em] transition-all duration-700 ease-out ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          Ready to pitch smarter?
        </h2>
        <p
          className={`text-blue-100/70 text-lg mb-12 max-w-lg mx-auto font-light transition-all duration-700 ease-out delay-100 ${
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
          <span className="inline-block rounded-xl p-[2px] bg-gradient-to-r from-electric via-violet to-electric shadow-glow shadow-electric/20">
            <Link
              href="/create"
              aria-label="Generate your pitch deck for free — no signup required"
              className="group/inner relative min-h-[44px] inline-flex items-center justify-center px-10 py-4 rounded-[10px] bg-electric text-white font-semibold text-lg transition-all hover:-translate-y-0.5 hover:shadow-glow hover:shadow-electric/20 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
            >
              <span className="relative z-10">Generate Your Deck &mdash; Free</span>
              <div className="absolute inset-0 rounded-[10px] bg-gradient-to-r from-electric to-violet opacity-0 group-hover/inner:opacity-100 transition-opacity duration-300" aria-hidden="true" />
            </Link>
          </span>
        </div>
        <p
          className={`mt-5 text-sm text-blue-200/50 transition-all duration-700 ease-out delay-300 ${
            inView ? "opacity-100" : "opacity-0"
          }`}
        >
          Free to start &middot; No credit card
        </p>
      </div>
    </section>
  );
}
