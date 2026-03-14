import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa]">
      {/* Skip link — WCAG 2.1 AA */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-electric focus:text-white focus:outline-none focus:ring-2 focus:ring-electric focus:ring-offset-2"
      >
        Skip to main content
      </a>

      <main
        id="main"
        className="flex flex-1 flex-col items-center justify-center px-6 py-16"
        role="main"
      >
        {/* Brand — consistent with landing/deck viewer */}
        <Link
          href="/"
          className="mb-12 flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-electric shadow-glow">
            <span className="font-bold text-white text-sm">P</span>
          </div>
          <span className="font-bold text-xl text-navy tracking-tight">
            PitchIQ
          </span>
        </Link>

        {/* 404 content */}
        <div className="text-center max-w-md">
          <p className="text-electric font-semibold text-sm uppercase tracking-widest mb-4">
            Page not found
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-navy mb-3 tracking-tight">
            404
          </h1>
          <p className="text-gray-500 mb-10 text-base leading-relaxed">
            This page doesn&apos;t exist or may have been moved. Head back and
            create your pitch deck instead.
          </p>

          {/* CTAs — primary + conversion secondary */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-navy text-white font-semibold text-sm shadow-sm hover:bg-navy-800 hover:shadow-glow hover:shadow-electric/10 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              Go to PitchIQ
            </Link>
            <Link
              href="/create"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-6 py-3.5 rounded-xl border border-electric/30 text-electric font-semibold text-sm shadow-sm hover:bg-electric/5 hover:border-electric/50 hover:shadow-glow hover:shadow-electric/10 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              Create your deck
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
