import Link from "next/link";
import AppNav from "@/components/AppNav";
import Footer from "@/components/Footer";
import FinalCTA from "@/components/FinalCTA";
import DemoPreviewReveal from "@/components/DemoPreviewReveal";
import PricingReveal from "@/components/PricingReveal";
import SectionReveal from "@/components/SectionReveal";
import PIQScoreDemo from "@/components/PIQScoreDemo";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden bg-white">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-electric focus:text-white focus:outline-none focus:ring-2 focus:ring-electric focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <AppNav variant="landing" />

      <main id="main" tabIndex={-1}>
        {/* Hero */}
        <section
          className="relative pt-32 pb-32 md:pt-40 md:pb-40 px-6 bg-hero-gradient overflow-hidden noise-overlay"
          aria-label="PitchIQ hero — get your PIQ Score and generate your deck"
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-electric/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-violet/6 rounded-full blur-[110px] pointer-events-none" />
          <div className="absolute bottom-0 -left-20 w-[400px] h-[400px] bg-electric/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 bg-grid-dark pointer-events-none" />

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-electric-200 text-sm font-medium mb-8 opacity-0 animate-fade-in">
              <span className="w-1.5 h-1.5 rounded-full bg-electric-400 animate-pulse" />
              AI Fundraising Intelligence Platform
            </div>

            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-[1.05] mb-6 tracking-tight opacity-0 animate-fade-in-up">
              Know your{" "}
              <span className="text-gradient-light">pitch score</span>{" "}
              before investors do
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed opacity-0 animate-fade-in-up stagger-2">
              Generate investor-ready pitch decks, get a 0&ndash;100 fundability
              score across 8 dimensions, and track how investors engage with
              your deck &mdash; all powered by AI.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-in-up stagger-3 w-full sm:w-auto">
              <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                <span className="block w-full sm:w-auto rounded-xl p-[2px] bg-gradient-to-r from-electric via-violet to-electric shadow-glow shadow-electric/20 group/btn">
                  <Link
                    href="/create"
                    aria-label="Get your PIQ Score for free — no signup required"
                    className="group/inner relative min-h-[44px] w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-[10px] bg-electric text-white font-semibold text-lg transition-all hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a16]"
                  >
                    <span className="relative z-10">
                      Get Your PIQ Score &mdash; Free
                    </span>
                    <div className="absolute inset-0 rounded-[10px] bg-gradient-to-r from-electric to-violet opacity-0 group-hover/inner:opacity-100 transition-opacity duration-300" />
                  </Link>
                </span>
                <p className="text-gray-300 text-sm">
                  No signup &middot; No credit card
                </p>
              </div>
              <Link
                href="#how-it-works"
                aria-label="See how PitchIQ works — four steps"
                className="min-h-[44px] w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 rounded-xl border border-white/15 text-white/80 font-semibold text-lg shadow-sm hover:bg-white/5 hover:border-white/25 hover:shadow-glow hover:shadow-electric/10 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a16]"
              >
                See How It Works
              </Link>
            </div>

            <p className="mt-8 text-sm text-gray-300 opacity-0 animate-fade-in-up stagger-3 flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4 text-electric-200/60"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
                />
              </svg>
              We never train on your data &middot; Your pitches stay private
            </p>
          </div>
        </section>

        {/* Demo Preview — PIQ Score gauge */}
        <section
          className="relative -mt-20 pb-24 px-6 z-10"
          aria-label="Product preview — example PIQ Score and deck"
        >
          <DemoPreviewReveal>
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-electric/15 via-violet/10 to-electric/15 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <PIQScoreDemo animate={true} />
            </div>
          </DemoPreviewReveal>
        </section>

        {/* Social proof strip */}
        <section
          className="py-12 px-6 border-y border-gray-100 bg-gray-50/50"
          aria-label="Why use PitchIQ"
        >
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row flex-wrap items-center justify-center gap-6 sm:gap-x-12 sm:gap-y-6">
            <ul
              className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-sm text-gray-600 list-none"
              role="list"
            >
              {[
                "PIQ Score in seconds",
                "12+ design themes",
                "Multi-format export",
                "Privacy-first AI",
              ].map((text) => (
                <li key={text} className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-electric shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {text}
                </li>
              ))}
            </ul>
            <Link
              href="/create"
              aria-label="Try PitchIQ for free — create your deck and get your PIQ Score in 60 seconds"
              className="min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-dark hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              Try free &rarr;
            </Link>
          </div>
        </section>

        {/* How It Works — 4 steps */}
        <section
          id="how-it-works"
          className="py-28 md:py-32 px-6"
          aria-label="How it works — four steps to fundraising clarity"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-electric font-semibold text-sm uppercase tracking-widest mb-4">
                How it works
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy tracking-tight mb-5">
                Four steps to fundraising clarity
              </h2>
              <p className="text-gray-600 text-lg max-w-xl mx-auto leading-relaxed">
                From startup idea to scored, investor-ready deck &mdash; faster
                than brewing coffee.
              </p>
            </div>
            <SectionReveal>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 section-reveal-grid">
                {[
                  {
                    step: "01",
                    title: "Describe Your Startup",
                    desc: "Enter your company details, problem, solution, traction, and funding target. Select your investor type and design theme.",
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
                    title: "Get Your PIQ Score",
                    desc: "Receive a 0\u2013100 fundability score across 8 dimensions with specific, actionable improvement recommendations.",
                    icon: (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                      </svg>
                    ),
                  },
                  {
                    step: "04",
                    title: "Share & Track",
                    desc: "Export as PDF or PPTX, share live tracking links, and see exactly how investors engage with your deck.",
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
                      <p className="text-gray-500 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </SectionReveal>

            <div className="text-center mt-20">
              <p className="text-gray-600 text-lg mb-6">
                Ready? Get your PIQ Score in 60 seconds.
              </p>
              <div className="flex flex-col items-center gap-2">
                <span className="inline-block rounded-xl p-[2px] bg-gradient-to-r from-electric via-violet to-electric shadow-glow shadow-electric/20">
                  <Link
                    href="/create"
                    aria-label="Create your deck for free — get your PIQ Score in 60 seconds"
                    className="group/inner relative min-h-[44px] inline-flex items-center justify-center px-8 py-4 rounded-[10px] bg-electric text-white font-semibold text-lg transition-all hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    <span className="relative z-10">
                      Create your deck &mdash; free
                    </span>
                    <div className="absolute inset-0 rounded-[10px] bg-gradient-to-r from-electric to-violet opacity-0 group-hover/inner:opacity-100 transition-opacity duration-300" />
                  </Link>
                </span>
                <p className="text-gray-600 text-sm">
                  No signup &middot; No credit card
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="py-28 md:py-32 px-6 bg-gray-50/60 border-y border-gray-100"
          aria-label="Features"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-electric font-semibold text-sm uppercase tracking-widest mb-4">
                Features
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy tracking-tight mb-5">
                Not another AI slide maker
              </h2>
              <p className="text-gray-600 text-lg max-w-xl mx-auto leading-relaxed">
                Purpose-built for fundraising. Every feature optimized for
                closing investor meetings.
              </p>
            </div>
            <SectionReveal>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 section-reveal-grid">
                {(
                  [
                    {
                      title: "Pitch IQ Score",
                      desc: "Get a 0\u2013100 fundability rating across 8 dimensions \u2014 narrative, market sizing, differentiation, financials, team, ask, design, and credibility.",
                      premium: false,
                      iconPath:
                        "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
                    },
                    {
                      title: "Investor-Type Targeting",
                      desc: "Decks restructured based on VC, angel, or accelerator priorities. The right story for each audience.",
                      premium: false,
                      iconPath:
                        "M15 10.5a3 3 0 11-6 0 3 3 0 016 0zM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z",
                    },
                    {
                      title: "12+ Design Themes",
                      desc: "Choose from professionally designed themes \u2014 Midnight, Arctic, Ember, Forest, and more. Your deck, your style.",
                      premium: false,
                      iconPath:
                        "M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z",
                    },
                    {
                      title: "View Analytics",
                      desc: "Track who opened your deck, which slides they lingered on. Know exactly when to follow up.",
                      premium: true,
                      iconPath:
                        "M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5s8.577 3.007 9.963 7.178c.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5s-8.577-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z",
                    },
                    {
                      title: "Multi-Format Export",
                      desc: "Download as PDF or PPTX with pixel-perfect fidelity. Google Slides and Keynote coming soon.",
                      premium: false,
                      iconPath:
                        "M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3",
                    },
                    {
                      title: "Shareable Live Links",
                      desc: "Every deck gets a unique URL with engagement tracking. Share a live link instead of a dead PDF.",
                      premium: false,
                      iconPath:
                        "M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244",
                    },
                    {
                      title: "A/B Test Narratives",
                      desc: "Generate multiple deck variants. Track which story converts more investor meetings.",
                      premium: true,
                      iconPath:
                        "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5",
                    },
                    {
                      title: "AI Coaching",
                      desc: "Get specific, actionable recommendations for each scoring dimension. Know exactly what to improve.",
                      premium: true,
                      iconPath:
                        "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5",
                    },
                    {
                      title: "Brand Customization",
                      desc: "Apply your logo, colors, and fonts. Investors see only your brand \u2014 no third-party watermarks.",
                      premium: true,
                      iconPath:
                        "M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42",
                    },
                  ] as const
                ).map((item) => (
                  <div
                    key={item.title}
                    className="group relative bg-white rounded-2xl p-6 border border-gray-100 hover:border-electric/15 hover:ring-2 hover:ring-electric/20 hover:shadow-card-hover transition-all duration-500 hover:-translate-y-1"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-electric/5 border border-electric/10 flex items-center justify-center shrink-0 text-electric group-hover:bg-electric group-hover:text-white group-hover:border-electric group-hover:shadow-sm transition-all duration-300">
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
                            d={item.iconPath}
                          />
                        </svg>
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

        {/* Pricing — 4 tiers */}
        <section
          id="pricing"
          className="py-28 md:py-32 px-6"
          aria-label="Pricing"
        >
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-electric font-semibold text-sm uppercase tracking-widest mb-4">
                Pricing
              </p>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy tracking-tight mb-5">
                Simple, transparent pricing
              </h2>
              <p className="text-gray-600 text-lg">
                Start free. Upgrade when you need intelligence and analytics.
              </p>
            </div>
            <PricingReveal>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-6 items-stretch pricing-reveal-grid">
                {[
                  {
                    name: "Starter",
                    price: "Free",
                    unit: "",
                    desc: "Perfect for getting started",
                    highlight: false,
                    features: [
                      "1 AI-generated deck",
                      "PDF export",
                      "Basic PIQ Score",
                      "1 design theme",
                      "Shareable links (branded)",
                    ],
                    cta: "Get Started",
                    sub: "Free forever",
                  },
                  {
                    name: "Pro",
                    price: "$29",
                    unit: "/mo",
                    desc: "For active fundraisers",
                    highlight: true,
                    features: [
                      "Unlimited decks",
                      "Full PIQ Score + coaching",
                      "All 12+ themes",
                      "PDF + PPTX export",
                      "Brand customization",
                      "Remove PitchIQ branding",
                    ],
                    cta: "Start with Pro",
                    sub: "14-day free trial",
                  },
                  {
                    name: "Growth",
                    price: "$79",
                    unit: "/mo",
                    desc: "Full fundraising intelligence",
                    highlight: false,
                    features: [
                      "Everything in Pro",
                      "Engagement analytics",
                      "Slide-level tracking",
                      "Investor-aware variants",
                      "A/B testing",
                      "Auto follow-up alerts",
                    ],
                    cta: "Start Growth",
                    sub: "14-day free trial",
                  },
                  {
                    name: "Enterprise",
                    price: "Custom",
                    unit: "",
                    desc: "For teams and programs",
                    highlight: false,
                    features: [
                      "Everything in Growth",
                      "Team collaboration",
                      "API access",
                      "White-label option",
                      "SSO / SAML",
                      "Dedicated support",
                    ],
                    cta: "Contact Sales",
                    sub: "Custom pricing",
                  },
                ].map((tier) => (
                  <div
                    key={tier.name}
                    className={`relative flex flex-col h-full rounded-2xl p-7 transition-all duration-500 ${
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
                      className={`text-sm mb-5 ${
                        tier.highlight ? "text-gray-300" : "text-gray-500"
                      }`}
                    >
                      {tier.desc}
                    </p>
                    <div className="flex items-baseline gap-1 mb-6">
                      <span className="text-3xl font-bold tracking-tight">
                        {tier.price}
                      </span>
                      {tier.unit && (
                        <span
                          className={`text-sm ${
                            tier.highlight ? "text-gray-400" : "text-gray-500"
                          }`}
                        >
                          {tier.unit}
                        </span>
                      )}
                    </div>
                    <ul className="space-y-3 mb-7 flex-1">
                      {tier.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-center gap-2.5 text-sm"
                        >
                          <svg
                            className={`w-4 h-4 shrink-0 ${
                              tier.highlight
                                ? "text-electric-200"
                                : "text-electric"
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
                              tier.highlight
                                ? "text-gray-300"
                                : "text-gray-500"
                            }
                          >
                            {f}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex flex-col items-center gap-2">
                      <Link
                        href={
                          tier.name === "Enterprise" ? "#" : "/create"
                        }
                        className={`block w-full text-center min-h-[44px] flex items-center justify-center py-3 rounded-xl font-semibold text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric ${
                          tier.highlight
                            ? "bg-electric text-white hover:bg-electric-light shadow-glow animate-pulse-glow hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
                            : "bg-gray-50 text-navy hover:bg-gray-100 border border-gray-200 hover:border-electric/20 shadow-sm hover:shadow-glow hover:shadow-electric/10 hover:-translate-y-0.5 active:translate-y-0 focus-visible:ring-offset-2"
                        }`}
                      >
                        {tier.cta}
                      </Link>
                      <p
                        className={`text-xs ${
                          tier.highlight
                            ? "text-gray-400"
                            : "text-gray-500"
                        }`}
                      >
                        {tier.sub}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </PricingReveal>
          </div>
        </section>

        {/* Privacy & Trust */}
        <section
          className="py-16 px-6 bg-gray-50/60 border-y border-gray-100"
          aria-label="Privacy and trust"
        >
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight mb-3">
                Your data stays yours
              </h2>
              <p className="text-gray-600 text-base max-w-lg mx-auto">
                PitchIQ is built on a privacy-first architecture. We never use
                your pitches to train our AI.
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {[
                {
                  title: "Encrypted at rest",
                  desc: "AES-256 encryption",
                  iconPath:
                    "M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z",
                },
                {
                  title: "Never trained on",
                  desc: "Your data stays out of AI training",
                  iconPath:
                    "M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                },
                {
                  title: "GDPR compliant",
                  desc: "Full data export & deletion",
                  iconPath:
                    "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z",
                },
                {
                  title: "TLS 1.3 in transit",
                  desc: "Encrypted connections always",
                  iconPath:
                    "M7.864 4.243A7.5 7.5 0 0119.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 004.5 10.5a7.464 7.464 0 01-1.15 3.993m1.989 3.559A11.209 11.209 0 008.25 10.5a3.75 3.75 0 117.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 01-3.6 9.75m6.633-4.596a18.666 18.666 0 01-2.485 5.33",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="text-center p-4 md:p-6 rounded-xl bg-white border border-gray-100"
                >
                  <div className="w-10 h-10 rounded-xl bg-electric/5 border border-electric/10 flex items-center justify-center mx-auto mb-3 text-electric">
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
                        d={item.iconPath}
                      />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-navy text-sm mb-1">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-xs">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section
          className="py-28 md:py-32 px-6 bg-hero-gradient relative overflow-hidden noise-overlay"
          aria-label="Get your PIQ Score"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-electric/8 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-violet/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute inset-0 bg-grid-dark pointer-events-none" />
          <FinalCTA />
        </section>
      </main>

      <Footer />
    </div>
  );
}
