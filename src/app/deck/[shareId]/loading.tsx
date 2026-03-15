/**
 * Deck viewer route loading UI — skeleton for instant perceived performance.
 * Mirrors DeckViewerClient loading layout (nav + title + slide placeholders + CTAs).
 * Speed as a feature; animate-pulse only (no custom motion); respects prefers-reduced-motion.
 */
export default function DeckViewerLoading() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-electric focus:text-white focus:outline-none focus:ring-2 focus:ring-electric focus:ring-offset-2"
      >
        Skip to main content
      </a>
      {/* Nav skeleton — matches DeckViewerClient fixed nav */}
      <header className="fixed top-0 w-full z-50 glass border-b border-white/10" aria-hidden="true">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy-100 animate-pulse" />
            <div className="h-5 w-20 rounded-md bg-navy-100 animate-pulse" />
          </div>
          <div className="h-9 w-28 rounded-lg bg-navy-100 animate-pulse" />
        </div>
      </header>

      <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6" aria-hidden="true">
        <div className="max-w-5xl mx-auto">
          {/* Title block skeleton */}
          <div className="text-center mb-8">
            <div className="h-8 w-48 mx-auto rounded-lg bg-navy-100 animate-pulse mb-3" />
            <div className="h-4 w-16 mx-auto rounded bg-navy-50 animate-pulse" />
          </div>

          {/* Slide placeholders — 3 cards matching DeckViewerClient loading */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="aspect-video rounded-2xl bg-navy-50 border border-navy-50 animate-pulse"
              >
                <div className="h-full flex flex-col justify-center p-8 md:p-12">
                  <div className="h-10 max-w-md rounded-lg bg-navy-100 mb-4 mx-auto w-3/4" />
                  <div className="h-5 max-w-xs rounded bg-navy-100/80 mb-6 mx-auto w-1/2" />
                  <div className="space-y-2 max-w-lg mx-auto">
                    <div className="h-4 w-full rounded bg-navy-50" />
                    <div className="h-4 w-4/5 rounded bg-navy-50" />
                    <div className="h-4 w-2/3 rounded bg-navy-50" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA row skeleton */}
          <div className="flex justify-center mt-8 gap-3">
            <div className="h-10 w-24 rounded-xl bg-navy-100 animate-pulse" />
            <div className="h-10 w-24 rounded-xl bg-navy-100 animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}
