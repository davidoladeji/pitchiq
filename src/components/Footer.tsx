import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="bg-white border-t border-zinc-100"
      aria-label="Site footer"
    >
      <div className="max-w-5xl mx-auto py-12 px-6">
        {/* Primary CTA — conversion moment, design-system match to hero/final CTA */}
        <div className="flex justify-center mb-10">
          <span className="inline-block p-[2px] rounded-full bg-gradient-to-r from-electric via-violet to-electric shadow-glow shadow-electric/20">
            <Link
              href="/create"
              aria-label="Create your pitch deck — get your PIQ Score in 60 seconds"
              className="inline-flex items-center justify-center min-h-[44px] px-8 rounded-full bg-electric text-white font-semibold text-sm shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-glow hover:shadow-electric/20 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              Create your deck
            </Link>
          </span>
        </div>

        {/* Top row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-electric flex items-center justify-center">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="font-semibold text-navy tracking-tight">
              PitchIQ
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6" aria-label="Footer navigation">
            <Link
              href="/create"
              aria-label="Create your pitch deck"
              className="text-sm text-zinc-400 hover:text-navy transition-colors min-h-[44px] min-w-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 rounded-lg"
            >
              Create Deck
            </Link>
            <Link
              href="/score"
              aria-label="Score your deck"
              className="text-sm text-zinc-400 hover:text-navy transition-colors min-h-[44px] min-w-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 rounded-lg"
            >
              Score Deck
            </Link>
            <Link
              href="/ideas"
              aria-label="Explore startup ideas — no signup required"
              className="text-sm text-zinc-400 hover:text-navy transition-colors min-h-[44px] min-w-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 rounded-lg"
            >
              Ideas
            </Link>
            <a
              href="#features"
              aria-label="Jump to Features section"
              className="text-sm text-zinc-400 hover:text-navy transition-colors min-h-[44px] min-w-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 rounded-lg"
            >
              Features
            </a>
            <a
              href="#pricing"
              aria-label="Jump to Pricing section"
              className="text-sm text-zinc-400 hover:text-navy transition-colors min-h-[44px] min-w-[44px] inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 rounded-lg"
            >
              Pricing
            </a>
          </nav>
        </div>

        {/* Bottom row */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <span>Privacy-first &middot; We never train on your data</span>
          <span>&copy; {new Date().getFullYear()} PitchIQ. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
