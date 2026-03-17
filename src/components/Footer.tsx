import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer
      id="footer"
      className="bg-background border-t border-navy-100"
      aria-label="Site footer"
    >
      <div className="max-w-5xl mx-auto py-12 px-6">
        {/* Primary CTA — conversion moment, design-system match to hero/final CTA; deep-link for campaigns */}
        {/* Primary CTA — shadow matches hero, LandingCTA, Create, Score (design-system single source of truth) */}
        <div id="footer-cta" className="flex justify-center mb-10">
          <Link
            href="/create"
            aria-label="Get your PIQ Score — analyze your deck's fundability"
            className="inline-flex items-center justify-center min-h-[44px] px-8 py-3 rounded-full bg-electric text-white font-semibold text-sm shadow-lg shadow-electric/25 transition-all hover:bg-electric-600 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Get Your PIQ Score
          </Link>
        </div>

        {/* Top row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <Image src="/logo.png" alt="" width={28} height={28} className="rounded-lg" />
            <span className="font-semibold text-navy tracking-tight">
              PitchIQ
            </span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap items-center gap-3 sm:gap-6" aria-label="Footer navigation">
            <Link
              href="/create"
              aria-label="Create your pitch deck"
              className="text-sm text-navy-400 hover:text-navy transition-colors min-h-[44px] min-w-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-lg"
            >
              Create Deck
            </Link>
            <Link
              href="/score"
              aria-label="Score your deck"
              className="text-sm text-navy-400 hover:text-navy transition-colors min-h-[44px] min-w-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-lg"
            >
              Score Deck
            </Link>
            <Link
              href="/ideas"
              aria-label="Explore startup ideas — no signup required"
              className="text-sm text-navy-400 hover:text-navy transition-colors min-h-[44px] min-w-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-lg"
            >
              Ideas
            </Link>
            <a
              href="#how-it-works"
              aria-label="Jump to How it works section"
              className="text-sm text-navy-400 hover:text-navy transition-colors min-h-[44px] min-w-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-lg"
            >
              How it works
            </a>
            <a
              href="#features"
              aria-label="Jump to Features section"
              className="text-sm text-navy-400 hover:text-navy transition-colors min-h-[44px] min-w-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-lg"
            >
              Features
            </a>
            <a
              href="#pricing"
              aria-label="Jump to Pricing section"
              className="text-sm text-navy-400 hover:text-navy transition-colors min-h-[44px] min-w-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-lg"
            >
              Pricing
            </a>
            <Link
              href="/piq-score"
              aria-label="Learn how the PIQ Score works"
              className="text-sm text-navy-400 hover:text-navy transition-colors min-h-[44px] min-w-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-lg"
            >
              PIQ Score
            </Link>
          </nav>
        </div>

        {/* Bottom row */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-navy-500">
          <span>Privacy-first &middot; We never train on your data</span>
          <span>&copy; {new Date().getFullYear()} PitchIQ. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
