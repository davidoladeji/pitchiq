"use client";

import Link from "next/link";

export default function LandingHero() {
  return (
    <section
      className="relative pt-28 pb-20 md:pt-36 md:pb-28 px-6 overflow-hidden bg-navy-900"
      aria-label="PitchIQ hero — get your PIQ Score and generate your deck"
    >
      {/* Background effects */}
      <div className="absolute inset-0 bg-hero-gradient" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px] bg-electric/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -top-32 -right-32 w-[400px] h-[400px] bg-violet/8 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-electric/6 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-dark pointer-events-none opacity-40" />

      <div className="max-w-5xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.06] border border-white/[0.08] text-sm font-medium mb-8 animate-fade-in">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-blue-200/80">AI-Powered Fundraising Intelligence</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.08] mb-6 tracking-tight animate-fade-in-up">
          Know your{" "}
          <span className="relative inline-block">
            <span className="text-gradient-light">fundability score</span>
            <svg className="absolute -bottom-1 left-0 w-full" viewBox="0 0 300 12" fill="none" aria-hidden="true">
              <path d="M2 8c50-6 100-6 148-2s100 4 148-2" stroke="url(#underline-grad)" strokeWidth="3" strokeLinecap="round" />
              <defs>
                <linearGradient id="underline-grad" x1="0" y1="0" x2="300" y2="0" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#4361ee" />
                  <stop offset="1" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <br className="hidden sm:block" />
          before investors do
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-blue-100/60 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up stagger-2">
          Generate investor-ready pitch decks, get a 0&ndash;100 PIQ Score
          across 8 dimensions, and track engagement &mdash; all in under 60
          seconds.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up stagger-3">
          <Link
            href="/create"
            aria-label="Get your PIQ Score for free — no signup required"
            className="group relative w-full sm:w-auto min-h-[52px] inline-flex items-center justify-center px-8 py-3.5 rounded-xl bg-electric text-white font-semibold text-base shadow-lg shadow-electric/25 hover:shadow-xl hover:shadow-electric/30 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
          >
            Get Your PIQ Score &mdash; Free
            <svg className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
          <a
            href="#how-it-works"
            aria-label="See how PitchIQ works — four steps"
            className="w-full sm:w-auto min-h-[52px] inline-flex items-center justify-center px-8 py-3.5 rounded-xl border border-white/[0.12] text-white/70 font-medium text-base hover:bg-white/[0.04] hover:text-white hover:border-white/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
          >
            See How It Works
          </a>
        </div>

        {/* Trust line */}
        <p className="mt-6 text-sm text-blue-200/40 animate-fade-in-up stagger-3 flex items-center justify-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
          No signup required &middot; No credit card &middot; Your data stays private
        </p>
      </div>
    </section>
  );
}
