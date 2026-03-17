"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setInView(true);
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="max-w-3xl mx-auto text-center relative z-10">
      <h2
        className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-5 tracking-tight transition-all duration-700 ease-out ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        Ready to pitch smarter?
      </h2>
      <p
        className={`text-white/70 text-lg mb-12 max-w-xl mx-auto leading-relaxed transition-all duration-700 ease-out delay-100 ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        Join thousands of founders using AI to create pitch decks that close
        meetings.
      </p>
      <div
        className={`flex flex-col items-center gap-2 transition-all duration-700 ease-out delay-200 ${
          inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        }`}
      >
        <Link
          href="/create"
          aria-label="Generate your pitch deck for free — no signup required"
          className="min-h-[44px] inline-flex items-center justify-center px-10 py-4 rounded-xl bg-electric hover:bg-electric-600 text-white font-semibold text-lg shadow-lg shadow-electric/25 transition-all hover:-translate-y-0.5 hover:shadow-glow active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
        >
          Generate Your Deck — Free
        </Link>
        <p className="text-white/50 text-sm">No signup · No credit card</p>
      </div>
    </div>
  );
}
