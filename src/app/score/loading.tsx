/**
 * Score route loading UI — skeleton for instant perceived performance.
 * Mirrors ScorePageClient layout (nav + main + title + upload card) so first paint feels instant.
 * Speed as a feature; design-system navy tint; respects prefers-reduced-motion via animate-pulse.
 */
export default function ScoreLoading() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-electric focus:text-white focus:outline-none focus:ring-2 focus:ring-electric focus:ring-offset-2"
      >
        Skip to main content
      </a>
      {/* Nav skeleton — matches AppNav */}
      <header className="fixed top-0 w-full z-50 glass border-b border-white/10" aria-hidden="true">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy-100 animate-pulse" />
            <div className="h-5 w-20 rounded-md bg-navy-100 animate-pulse" />
          </div>
          <div className="h-10 w-24 rounded-lg bg-navy-100 animate-pulse" />
        </div>
      </header>

      <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6 outline-none" aria-hidden="true">
        <div className="max-w-2xl mx-auto">
          {/* Header skeleton — badge + title + subtitle */}
          <div className="text-center mb-10">
            <div className="inline-flex h-9 w-32 rounded-full bg-navy-100 animate-pulse mb-4" />
            <div className="h-8 w-64 mx-auto rounded-lg bg-navy-100 animate-pulse mb-2" />
            <div className="h-5 w-80 mx-auto rounded-md bg-navy-50 animate-pulse" />
          </div>

          {/* Upload card skeleton */}
          <div className="rounded-2xl border border-navy-50 bg-white p-8 sm:p-10 animate-pulse">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-navy-100" />
              <div className="h-5 w-48 rounded-md bg-navy-50" />
              <div className="h-4 w-64 rounded bg-navy-50/80" />
              <div className="h-24 w-full rounded-xl border-2 border-dashed border-navy-50 bg-navy-50/30 mt-2" />
              <div className="h-10 w-36 rounded-lg bg-navy-100" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
