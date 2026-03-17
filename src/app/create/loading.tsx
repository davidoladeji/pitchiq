/**
 * Create route loading UI — skeleton for instant perceived performance.
 * Mirrors CreatePageClient layout (nav + main + form card) so first paint feels instant.
 * Speed as a feature; respects prefers-reduced-motion via Tailwind animate-pulse (no custom motion).
 */
export default function CreateLoading() {
  return (
    <div className="min-h-screen bg-navy-50" aria-busy="true">
      {/* Screen reader: announce loading state (WCAG 2.1 AA) */}
      <p className="sr-only" role="status" aria-live="polite">
        Loading create
      </p>
      {/* Nav skeleton — matches CreatePageClient fixed nav */}
      <header className="fixed top-0 w-full z-50 glass border-b border-white/10" aria-hidden="true">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy-100 animate-pulse" />
            <div className="h-5 w-20 rounded-md bg-navy-100 animate-pulse" />
          </div>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6" aria-label="Main content" aria-hidden="true">
        <div className="max-w-2xl mx-auto">
          {/* Title block skeleton */}
          <div className="text-center mb-12">
            <div className="h-9 w-64 sm:w-80 mx-auto rounded-lg bg-navy-100 animate-pulse mb-3" />
            <div className="h-4 max-w-lg mx-auto rounded bg-navy-50 animate-pulse" />
          </div>

          {/* Form card skeleton */}
          <div className="bg-white rounded-2xl shadow-sm border border-navy-50 p-6 sm:p-8 md:p-10">
            {/* Step indicator skeleton — 4 circles + connectors */}
            <div className="flex items-center gap-1 mb-10">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center flex-1">
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className="w-9 h-9 rounded-xl bg-navy-50 animate-pulse shrink-0" />
                    <div className="hidden sm:block min-w-0 flex-1">
                      <div className="h-3 w-12 rounded bg-navy-50 animate-pulse mb-1" />
                      <div className="h-2.5 w-16 rounded bg-navy-50/80 animate-pulse" />
                    </div>
                  </div>
                  {i < 4 && (
                    <div className="h-px flex-1 mx-3 bg-navy-50 animate-pulse min-w-[8px]" />
                  )}
                </div>
              ))}
            </div>

            {/* Form fields skeleton — 3 label + input rows */}
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 rounded bg-navy-50 animate-pulse" />
                  <div className="h-12 w-full rounded-xl bg-navy-50/80 animate-pulse" />
                </div>
              ))}
            </div>

            {/* CTA row skeleton */}
            <div className="flex gap-3 mt-8 pt-6 border-t border-navy-50">
              <div className="h-11 w-24 rounded-lg bg-navy-50 animate-pulse" />
              <div className="h-11 w-28 rounded-xl bg-navy-100 animate-pulse" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
