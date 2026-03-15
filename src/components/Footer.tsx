import Link from "next/link";

export default function Footer() {
  return (
    <footer
      className="py-12 px-6 border-t border-gray-100 bg-white"
      aria-label="Site footer"
    >
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-electric-gradient flex items-center justify-center">
            <span className="text-white font-bold text-xs">P</span>
          </div>
          <span className="font-semibold text-navy tracking-tight">
            PitchIQ
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          <Link
            href="/create"
            className="min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-semibold bg-electric text-white hover:bg-electric-light transition-all shadow-sm hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          >
            Create your deck
          </Link>
          <Link
            href="/ideas"
            className="min-h-[44px] inline-flex items-center justify-center px-3 py-2 text-gray-500 text-sm hover:text-navy transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          >
            Explore Ideas
          </Link>
          <a
            href="#features"
            className="min-h-[44px] inline-flex items-center justify-center px-3 py-2 text-gray-500 text-sm hover:text-navy transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="min-h-[44px] inline-flex items-center justify-center px-3 py-2 text-gray-500 text-sm hover:text-navy transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          >
            Pricing
          </a>
        </div>
        <span className="text-gray-400 text-xs text-center md:text-right">
          Privacy-first &middot; We never train on your data
        </span>
      </div>
    </footer>
  );
}
