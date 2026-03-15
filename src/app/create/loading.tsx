/**
 * Create route loading UI — skeleton for instant perceived performance.
 * Mirrors CreatePageClient layout (nav + main + form card) so first paint feels instant.
 * Speed as a feature; respects prefers-reduced-motion via Tailwind animate-pulse (no custom motion).
 */
export default function CreateLoading() {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-electric focus:text-white focus:outline-none focus:ring-2 focus:ring-electric focus:ring-offset-2"
      >
        Skip to main content
      </a>
      {/* Nav skeleton — matches CreatePageClient fixed nav */}
      <header className="fixed top-0 w-full z-50 glass border-b border-white/10" aria-hidden="true">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gray-200 animate-pulse" />
            <div className="h-5 w-20 rounded-md bg-gray-200 animate-pulse" />
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6" aria-hidden="true">
        <div className="max-w-2xl mx-auto">
          {/* Title block skeleton */}
          <div className="text-center mb-12">
            <div className="h-9 w-64 sm:w-80 mx-auto rounded-lg bg-gray-200 animate-pulse mb-3" />
            <div className="h-4 max-w-lg mx-auto rounded bg-gray-100 animate-pulse" />
          </div>

          {/* Form card skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-10">
            {/* Step indicator skeleton — 4 circles + connectors */}
            <div className="flex items-center gap-1 mb-10">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center flex-1">
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse shrink-0" />
                    <div className="hidden sm:block min-w-0 flex-1">
                      <div className="h-3 w-12 rounded bg-gray-100 animate-pulse mb-1" />
                      <div className="h-2.5 w-16 rounded bg-gray-50 animate-pulse" />
                    </div>
                  </div>
                  {i < 4 && (
                    <div className="h-px flex-1 mx-3 bg-gray-100 animate-pulse min-w-[8px]" />
                  )}
                </div>
              ))}
            </div>

            {/* Form fields skeleton — 3 label + input rows */}
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 rounded bg-gray-100 animate-pulse" />
                  <div className="h-12 w-full rounded-xl bg-gray-50 animate-pulse" />
                </div>
              ))}
            </div>

            {/* CTA row skeleton */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
              <div className="h-11 w-24 rounded-lg bg-gray-100 animate-pulse" />
              <div className="h-11 w-28 rounded-xl bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
