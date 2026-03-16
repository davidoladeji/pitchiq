import Link from "next/link";

export const dynamic = "force-dynamic";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-navy-50">
      {/* Skip link — WCAG 2.1 AA */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-electric focus:text-white focus:outline-none focus:ring-2 focus:ring-electric focus:ring-offset-2 focus:ring-offset-white"
      >
        Skip to main content
      </a>

      <main
        id="main"
        tabIndex={-1}
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

        {/* 404 content — h1 is semantic ("Page not found"); 404 is visual only for clarity */}
        <div className="text-center max-w-md">
          <h1 className="sr-only">Page not found</h1>
          <p className="text-electric font-semibold text-sm uppercase tracking-widest mb-2" aria-hidden="true">
            Page not found
          </p>
          <p className="text-4xl sm:text-5xl font-bold text-navy mb-3 tracking-tight" aria-hidden="true">
            404
          </p>
          <p className="text-navy-500 mb-10 text-base leading-relaxed">
            This page doesn&apos;t exist or may have been moved. Head back and
            create your pitch deck instead.
          </p>

          {/* CTAs — primary (home) + conversion (create) with design-system gradient ring */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              aria-label="Go to PitchIQ home"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-navy text-white font-semibold text-sm shadow-sm hover:bg-navy-800 hover:shadow-glow hover:shadow-electric/10 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              Go to PitchIQ
            </Link>
            <Link
              href="/create"
              aria-label="Create your pitch deck — get your PIQ Score in 60 seconds"
              className="min-h-[44px] w-full sm:w-auto inline-flex items-center justify-center px-6 py-3.5 rounded-xl bg-electric hover:bg-electric-light text-white font-semibold text-sm shadow-lg hover:-translate-y-0.5 hover:shadow-xl active:translate-y-0 active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Create your deck
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
