"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export default function FinalCTA() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
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
        className={`text-blue-100/70 text-lg mb-12 max-w-xl mx-auto leading-relaxed transition-all duration-700 ease-out delay-100 ${
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
        <span className="block rounded-xl p-[2px] bg-gradient-to-r from-electric via-violet to-electric shadow-glow shadow-electric/20">
          <Link
            href="/create"
            aria-label="Generate your pitch deck for free — no signup required"
            className="group/inner relative min-h-[44px] inline-flex items-center justify-center px-10 py-4 rounded-[10px] bg-electric text-white font-semibold text-lg transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a16]"
          >
            <span className="relative z-10">Generate Your Deck — Free</span>
            <div className="absolute inset-0 rounded-[10px] bg-gradient-to-r from-electric to-violet opacity-0 group-hover/inner:opacity-100 transition-opacity duration-300" />
          </Link>
        </span>
        <p className="text-blue-200/50 text-sm">No signup · No credit card</p>
      </div>
    </div>
  );
}
