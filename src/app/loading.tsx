/**
 * Root landing loading UI — skeleton for instant perceived performance.
 * Mirrors landing layout (nav + hero) so first paint feels instant on getpitchiq.com.
 * Speed as a feature; respects prefers-reduced-motion via Tailwind animate-pulse only.
 */
export default function RootLoading() {
  return (
    <div className="min-h-screen overflow-hidden bg-background" aria-busy="true">
      {/* Screen reader: announce loading state (WCAG 2.1 AA) */}
      <p className="sr-only" role="status" aria-live="polite">
        Loading home
      </p>
      {/* Nav skeleton — matches LandingNav (fixed glass bar, logo + text + CTA) */}
      <header
        className="fixed top-0 w-full z-50 glass border-b border-white/10"
        aria-hidden="true"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/20 animate-pulse motion-reduce:animate-none" />
            <div className="h-5 w-20 rounded-md bg-white/20 animate-pulse motion-reduce:animate-none" />
          </div>
          <div className="h-10 w-28 rounded-xl bg-white/15 animate-pulse motion-reduce:animate-none" />
        </div>
      </header>

      <main id="main" tabIndex={-1} aria-label="Main content" aria-hidden="true">
        {/* Hero skeleton — dark gradient to match real hero */}
        <section className="relative pt-32 pb-32 md:pt-40 md:pb-40 px-6 bg-hero-gradient overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10">
            {/* Badge */}
            <div className="inline-block h-8 w-48 rounded-full bg-white/10 animate-pulse motion-reduce:animate-none mb-8" />

            {/* Headline — 2 lines */}
            <div className="space-y-3 mb-6">
              <div className="h-14 sm:h-16 md:h-20 w-full max-w-2xl mx-auto rounded-lg bg-white/10 animate-pulse motion-reduce:animate-none" />
              <div className="h-14 sm:h-16 md:h-20 w-3/4 max-w-md mx-auto rounded-lg bg-white/8 animate-pulse motion-reduce:animate-none" />
            </div>

            {/* Subheadline — 2 lines */}
            <div className="space-y-2 max-w-2xl mx-auto mb-12">
              <div className="h-4 w-full rounded bg-white/10 animate-pulse motion-reduce:animate-none" />
              <div className="h-4 w-4/5 mx-auto rounded bg-white/8 animate-pulse motion-reduce:animate-none" />
            </div>

            {/* CTAs row */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="h-14 w-56 rounded-xl bg-white/20 animate-pulse motion-reduce:animate-none" />
              <div className="h-14 w-40 rounded-xl bg-white/10 animate-pulse motion-reduce:animate-none" />
            </div>
          </div>
        </section>

        {/* Placeholder for below-fold (minimal so transition is quick) — navy-tinted for design-system consistency */}
        <section className="py-12 px-6 bg-navy-50/50">
          <div className="max-w-4xl mx-auto">
            <div className="h-6 w-64 rounded bg-navy-100 animate-pulse motion-reduce:animate-none mx-auto" />
          </div>
        </section>
      </main>
    </div>
  );
}
