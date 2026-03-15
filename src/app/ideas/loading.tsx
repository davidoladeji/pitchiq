/**
 * Ideas route loading UI — skeleton for instant perceived performance.
 * Mirrors IdeasPageClient layout (nav + main + form card) so first paint feels instant.
 * Speed as a feature; respects prefers-reduced-motion via Tailwind animate-pulse (no custom motion).
 */
export default function IdeasLoading() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-electric focus:text-white focus:outline-none focus:ring-2 focus:ring-electric focus:ring-offset-2"
      >
        Skip to main content
      </a>
      {/* Nav skeleton — matches IdeasPageClient fixed nav */}
      <header className="fixed top-0 w-full z-50 glass border-b border-white/10" aria-hidden="true">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-5 w-20 rounded-md bg-gray-200 animate-pulse" />
          </div>
          <div className="h-10 w-24 rounded-lg bg-gray-200 animate-pulse" />
        </div>
      </header>

      <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6" aria-hidden="true">
        <div className="max-w-xl mx-auto">
          {/* Title block skeleton — "Business idea generator" + subtext */}
          <div className="mb-8">
            <div className="h-9 w-72 rounded-lg bg-gray-200 animate-pulse mb-2" />
            <div className="h-4 max-w-md rounded bg-gray-100 animate-pulse" />
          </div>

          {/* Form card skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            {/* Step / progress row */}
            <div className="flex items-center gap-2 mb-6">
              <div className="h-3 w-24 rounded bg-gray-100 animate-pulse" />
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full w-1/3 bg-gray-200 rounded-full animate-pulse" />
              </div>
            </div>

            {/* Label + input row */}
            <div className="space-y-3">
              <div className="h-4 w-32 rounded bg-gray-100 animate-pulse" />
              <div className="h-12 w-full rounded-xl bg-gray-50 animate-pulse" />
            </div>

            {/* Back / Next row */}
            <div className="flex items-center justify-between mt-8">
              <div className="h-11 w-16 rounded-xl bg-gray-100 animate-pulse" />
              <div className="h-11 w-20 rounded-xl bg-gray-200 animate-pulse" />
            </div>
          </div>

          {/* Bottom link placeholder */}
          <div className="mt-6 flex justify-center">
            <div className="h-4 w-56 rounded bg-gray-100 animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}
