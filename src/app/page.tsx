import Link from "next/link";
import LandingNav from "@/components/LandingNav";
import FinalCTA from "@/components/FinalCTA";
import DemoPreviewReveal from "@/components/DemoPreviewReveal";
import PricingReveal from "@/components/PricingReveal";
import SectionReveal from "@/components/SectionReveal";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-white">
      {/* Skip link — WCAG 2.1 AA */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-electric focus:text-white focus:outline-none focus:ring-2 focus:ring-electric focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <LandingNav />

      <main id="main">
      {/* Hero — Dark, dramatic, premium */}
      <section className="relative pt-32 pb-32 md:pt-40 md:pb-40 px-6 bg-hero-gradient overflow-hidden noise-overlay">
        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-electric/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-violet/6 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-electric/5 rounded-full blur-[100px] pointer-events-none" />

        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid-dark pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-electric-200 text-sm font-medium mb-8 opacity-0 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-electric-400 animate-pulse" />
            Open Source &middot; MIT Licensed
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] mb-6 tracking-tight opacity-0 animate-fade-in-up">
            Pitch decks that{" "}
            <span className="text-gradient-light">close meetings</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed opacity-0 animate-fade-in-up stagger-2">
            Describe your startup. Pick your investor type.
            Get a polished, presentation-quality pitch deck in 60 seconds
            — powered by AI, optimized for fundraising.
          </p>

          {/* CTAs — primary with gradient ring (premium, reference-style) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-up stagger-3 w-full sm:w-auto">
            <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
              <span className="block w-full sm:w-auto rounded-xl p-[2px] bg-gradient-to-r from-electric via-violet to-electric shadow-glow shadow-electric/20 group/btn">
                <Link
                  href="/create"
                  className="group/inner relative min-h-[44px] w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-[10px] bg-electric text-white font-semibold text-lg transition-all hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a16]"
                >
                  <span className="relative z-10">Generate Your Deck — Free</span>
                  <div className="absolute inset-0 rounded-[10px] bg-gradient-to-r from-electric to-violet opacity-0 group-hover/inner:opacity-100 transition-opacity duration-300" />
                </Link>
              </span>
              <p className="text-gray-300 text-sm">No signup · No credit card</p>
            </div>
            <a
              href="https://github.com/davidoladeji/pitchiq"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/15 text-white/80 font-semibold text-lg shadow-sm hover:bg-white/5 hover:border-white/25 hover:shadow-glow hover:shadow-electric/10 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a16]"
            >
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                Star on GitHub
              </span>
            </a>
          </div>

          {/* Scroll hint — guides visitors to value prop (founder-first, conversion) */}
          <a
            href="#how-it-works"
            className="group mt-14 inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 text-sm font-medium text-white/70 hover:text-white/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a16] rounded-lg opacity-0 animate-fade-in-up stagger-3"
            aria-label="See how it works — scroll to three steps"
          >
            <span>See how it works</span>
            <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </section>

      {/* Demo Preview — floating above the fold break; scroll-triggered reveal */}
      <section className="relative -mt-20 pb-24 px-6 z-10">
        <DemoPreviewReveal>
          <div className="relative group">
            {/* Hover glow */}
            <div className="absolute -inset-2 bg-gradient-to-r from-electric/15 via-violet/10 to-electric/15 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="relative aspect-[16/9] rounded-2xl bg-hero-gradient shadow-premium-lg border border-white/10 flex flex-col items-center justify-center text-white p-8 md:p-12 overflow-hidden">
              {/* Grid overlay */}
              <div className="absolute inset-0 bg-grid-dark opacity-30" />
              {/* Inner glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[200px] bg-electric/10 rounded-full blur-[80px]" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 animate-float shadow-dark-card">
                  <span className="text-2xl font-bold text-electric-200">A</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 tracking-tight">
                  Acme Corp
                </h2>
                <p className="text-lg md:text-xl text-blue-200/60 mb-4">
                  FinTech &middot; Series A
                </p>
                <p className="text-blue-100/40 mb-8 text-sm md:text-base">
                  Raising $5M to revolutionize payments
                </p>
                <div className="flex gap-1.5">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className={`rounded-full transition-all duration-300 ${
                        i === 0
                          ? "bg-electric w-6 h-2"
                          : "bg-white/15 hover:bg-white/30 w-2 h-2"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DemoPreviewReveal>
      </section>

      {/* Social proof strip — semantic list, 8px grid, subtle bg + conversion CTA */}
      <section className="py-12 px-6 border-y border-gray-100 bg-gray-50/50" aria-label="Why use PitchIQ">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row flex-wrap items-center justify-center gap-6 sm:gap-x-12 sm:gap-y-6">
          <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-sm text-gray-600 list-none" role="list">
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-electric shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              No signup required
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-electric shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Ready in under 60s
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-electric shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              PDF export included
            </li>
            <li className="flex items-center gap-2">
              <svg className="w-4 h-4 text-electric shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              MIT licensed
            </li>
          </ul>
          <Link
            href="/create"
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-dark hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-gray-50/50"
          >
            Try free →
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-28 md:py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-electric font-semibold text-sm uppercase tracking-widest mb-4">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy tracking-tight mb-5">
              Three steps. Sixty seconds.
            </h2>
            <p className="text-gray-600 text-lg max-w-xl mx-auto leading-relaxed">
              From startup idea to investor-ready deck — faster than brewing coffee.
            </p>
          </div>
          <SectionReveal>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 section-reveal-grid">
            {[
              {
                step: "01",
                title: "Describe Your Startup",
                desc: "Enter your company details, problem, solution, traction, and funding target. Select your target investor type.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "AI Generates Your Deck",
                desc: "Our AI creates a polished 10-12 slide pitch deck, structured and optimized for your specific investor audience.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Share & Track",
                desc: "Download as PDF or share a live link. Track who views your deck and which slides get the most attention.",
                icon: (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:border-electric/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-card-hover"
              >
                {/* Step number watermark */}
                <div className="absolute top-6 right-6 text-6xl font-black text-gray-50 group-hover:text-electric/5 transition-colors duration-500 select-none">
                  {item.step}
                </div>
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-electric/5 border border-electric/10 flex items-center justify-center mb-6 text-electric group-hover:bg-electric group-hover:text-white group-hover:border-electric group-hover:shadow-glow transition-all duration-300">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold text-navy mb-3 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
          </SectionReveal>

          {/* Mid-page CTA — conversion point right after value prop (How it works); gradient ring matches hero */}
          <div className="text-center mt-20">
            <p className="text-gray-600 text-lg mb-6">
              Ready? Generate your first deck in 60 seconds.
            </p>
            <div className="flex flex-col items-center gap-2">
              <span className="inline-block rounded-xl p-[2px] bg-gradient-to-r from-electric via-violet to-electric shadow-glow shadow-electric/20">
                <Link
                  href="/create"
                  className="group/inner relative min-h-[44px] inline-flex items-center justify-center px-8 py-4 rounded-[10px] bg-electric text-white font-semibold text-lg transition-all hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  <span className="relative z-10">Create your deck — free</span>
                  <div className="absolute inset-0 rounded-[10px] bg-gradient-to-r from-electric to-violet opacity-0 group-hover/inner:opacity-100 transition-opacity duration-300" />
                </Link>
              </span>
              <p className="text-gray-600 text-sm">No signup · No credit card</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-28 md:py-32 px-6 bg-gray-50/60 border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-electric font-semibold text-sm uppercase tracking-widest mb-4">
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy tracking-tight mb-5">
              Not another AI slide maker
            </h2>
            <p className="text-gray-600 text-lg max-w-xl mx-auto leading-relaxed">
              Purpose-built for fundraising. Every feature optimized for closing investor meetings.
            </p>
          </div>
          <SectionReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 section-reveal-grid">
            {[
              {
                title: "Investor-Type Targeting",
                desc: "Decks restructured based on VC, angel, or accelerator priorities. The right story for each audience.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                ),
              },
              {
                title: "View Analytics",
                desc: "Track who opened your deck, which slides they lingered on. Know exactly when to follow up.",
                premium: true,
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
              },
              {
                title: "Shareable Live Links",
                desc: "Every deck gets a unique URL. Share a live link instead of a dead PDF attachment.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                  </svg>
                ),
              },
              {
                title: "A/B Test Narratives",
                desc: "Generate multiple deck variants. Track which story converts more investor meetings.",
                premium: true,
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                ),
              },
              {
                title: "PDF Export",
                desc: "Download your deck as a polished PDF. Ready for email attachments and offline sharing.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                ),
              },
              {
                title: "Open Source",
                desc: "Self-host for free. Contribute on GitHub. MIT licensed core — zero vendor lock-in.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-electric/15 hover:ring-2 hover:ring-electric/20 hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-electric/5 border border-electric/10 flex items-center justify-center shrink-0 text-electric group-hover:bg-electric group-hover:text-white group-hover:border-electric group-hover:shadow-sm transition-all duration-300">
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-navy tracking-tight">
                        {item.title}
                      </h3>
                      {item.premium && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-electric/8 text-electric uppercase tracking-wider border border-electric/10">
                          Pro
                        </span>
                      )}
                    </div>
                    <p className="text-gray-500 text-sm leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </SectionReveal>
        </div>
      </section>

      {/* Why premium decks are better — differentiator for landing */}
      <section id="why-premium" className="py-28 md:py-32 px-6 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-electric font-semibold text-sm uppercase tracking-widest mb-4">
              Why premium
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy tracking-tight mb-5">
              Free decks get you in the door. Premium decks help you close.
            </h2>
            <p className="text-gray-600 text-lg max-w-xl mx-auto leading-relaxed">
              Same AI quality. The difference is what happens after you share.
            </p>
          </div>
          <SectionReveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 section-reveal-grid">
            {[
              {
                title: "Your brand, not ours",
                desc: "Remove PitchIQ branding. Investors see only your company and story — no \"Powered by\" footnote.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.38 8.75a5.5 5.5 0 00-10.9 0" />
                  </svg>
                ),
              },
              {
                title: "See who viewed",
                desc: "Know when your deck was opened and by whom. Follow up while the pitch is still top of mind.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5s8.577 3.007 9.963 7.178c.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5s-8.577-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
              },
              {
                title: "Which slides landed",
                desc: "Slide-level engagement shows where they lingered. Sharpen your narrative where it matters.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                ),
              },
              {
                title: "A/B test your story",
                desc: "Generate two deck angles. See which one gets more opens and meetings. Double down on what works.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                  </svg>
                ),
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group relative bg-gray-50/80 rounded-2xl p-6 border border-gray-100 hover:border-electric/15 hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1"
              >
                <div className="w-10 h-10 rounded-xl bg-electric/5 border border-electric/10 flex items-center justify-center mb-4 text-electric group-hover:bg-electric group-hover:text-white group-hover:border-electric transition-all duration-300">
                  {item.icon}
                </div>
                <h3 className="font-semibold text-navy tracking-tight mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
          </SectionReveal>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-28 md:py-32 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-electric font-semibold text-sm uppercase tracking-widest mb-4">
              Pricing
            </p>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy tracking-tight mb-5">
              Simple, transparent pricing
            </h2>
            <p className="text-gray-600 text-lg">
              Start free. Upgrade when you need analytics and white-label.
            </p>
          </div>
          <PricingReveal>
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch pricing-reveal-grid">
            {[
              {
                name: "Community",
                price: "Free",
                desc: "Perfect for getting started",
                features: [
                  "Unlimited AI decks",
                  "PDF export",
                  "Shareable links (branded)",
                  "3 investor types",
                  "Self-hostable",
                ],
              },
              {
                name: "Pro",
                price: "$29",
                unit: "/deck",
                desc: "For active fundraisers",
                highlight: true,
                features: [
                  "Everything in Community",
                  "Remove PitchIQ branding",
                  "Basic view count",
                  "Priority generation",
                  "Email support",
                ],
              },
              {
                name: "Fundraise",
                price: "$99",
                unit: "/mo",
                desc: "Full fundraising intelligence",
                features: [
                  "Everything in Pro",
                  "Full view analytics",
                  "Slide-level engagement",
                  "A/B testing",
                  "Auto follow-up alerts",
                ],
              },
            ].map((tier) => (
              <div
                key={tier.name}
                className={`relative flex flex-col h-full rounded-2xl p-8 transition-all duration-500 ${
                  tier.highlight
                    ? "bg-navy text-white shadow-premium-lg ring-1 ring-white/10 md:scale-[1.03] hover:-translate-y-2 hover:ring-2 hover:ring-electric/35 hover:shadow-glow"
                    : "bg-white border border-gray-200 hover:border-electric/15 hover:shadow-card-hover hover:-translate-y-1"
                }`}
              >
                {tier.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-electric text-white text-xs font-bold tracking-wide shadow-glow">
                    Most Popular
                  </div>
                )}
                <h3
                  className={`text-lg font-bold mb-1 tracking-tight ${
                    tier.highlight ? "text-white" : "text-navy"
                  }`}
                >
                  {tier.name}
                </h3>
                <p
                  className={`text-sm mb-6 ${
                    tier.highlight ? "text-gray-300" : "text-gray-400"
                  }`}
                >
                  {tier.desc}
                </p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-bold tracking-tight">
                    {tier.price}
                  </span>
                  {tier.unit && (
                    <span
                      className={`text-sm ${
                        tier.highlight ? "text-gray-500" : "text-gray-400"
                      }`}
                    >
                      {tier.unit}
                    </span>
                  )}
                </div>
                <ul className="space-y-3.5 mb-8">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm">
                      <svg
                        className={`w-4 h-4 shrink-0 ${
                          tier.highlight ? "text-electric-200" : "text-electric"
                        }`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span
                        className={
                          tier.highlight ? "text-gray-300" : "text-gray-500"
                        }
                      >
                        {f}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto flex flex-col items-center gap-2">
                  <Link
                    href="/create"
                    className={`block w-full text-center min-h-[44px] min-w-[44px] flex items-center justify-center py-3.5 rounded-xl font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric ${
                      tier.highlight
                        ? "bg-electric text-white hover:bg-electric-light shadow-glow animate-pulse-glow hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
                        : "bg-gray-50 text-navy hover:bg-gray-100 border border-gray-200 hover:border-electric/20 shadow-sm hover:shadow-glow hover:shadow-electric/10 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-offset-2"
                    }`}
                  >
                    {tier.highlight ? "Start with Pro" : "Get Started"}
                  </Link>
                  {tier.highlight && (
                    <p className="text-gray-500 text-xs">No credit card required to try</p>
                  )}
                  {tier.name === "Community" && (
                    <p className="text-gray-600 text-xs">Free forever · No signup</p>
                  )}
                  {tier.name === "Fundraise" && (
                    <p className="text-gray-600 text-xs">Start free · Upgrade when ready</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          </PricingReveal>
        </div>
      </section>

      {/* Final CTA — Dark section; scroll-triggered fade-in for conversion focus */}
      <section className="py-28 md:py-32 px-6 bg-hero-gradient relative overflow-hidden noise-overlay">
        {/* Gradient orbs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-electric/8 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute inset-0 bg-grid-dark pointer-events-none" />

        <FinalCTA />
      </section>

      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-gray-100 bg-white">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded bg-electric-gradient flex items-center justify-center">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="font-semibold text-navy tracking-tight">
              PitchIQ
            </span>
            <span className="text-gray-300 text-xs ml-1">
              Open Source
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <Link
              href="/create"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-electric text-white hover:bg-electric-light transition-all shadow-sm hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              Create your deck
            </Link>
            <a
              href="https://github.com/davidoladeji/pitchiq"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-3 py-2 text-gray-400 text-sm hover:text-navy transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              GitHub
            </a>
            <span className="text-gray-300 text-sm">
              MIT License. Built for founders, by founders.
              <span className="text-gray-500/90 ml-1.5" aria-hidden="true">·</span>
              <span className="text-gray-600 ml-1.5">Private · No account required</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
