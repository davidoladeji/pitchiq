import Link from "next/link";

export default function Footer() {
  return (
    <footer
      id="footer"
      className="bg-background border-t border-navy-100"
      aria-label="Site footer"
    >
      <div className="max-w-5xl mx-auto py-12 px-6">
        {/* Primary CTA — conversion moment, design-system match to hero/final CTA; deep-link for campaigns */}
        <div id="footer-cta" className="flex justify-center mb-10">
          <Link
            href="/create"
            aria-label="Get your PIQ Score — analyze your deck's fundability"
            className="inline-flex items-center justify-center min-h-[44px] px-8 py-3 rounded-full bg-electric text-white font-semibold text-sm transition-all hover:bg-electric-dark hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            Get Your PIQ Score
          </Link>
        </div>

        {/* Top row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center bg-navy">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 13V3h4.5a3.5 3.5 0 010 7H5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M11 8l2-2.5L15 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.7" />
                <line x1="13" y1="5.5" x2="13" y2="12" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
              </svg>
            </div>
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
