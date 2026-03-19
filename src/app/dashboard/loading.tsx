/**
 * Dashboard route loading UI — skeleton for instant perceived performance.
 * Mirrors DashboardClient layout (nav + main + title + deck cards) so first paint feels instant.
 * Speed as a feature; respects prefers-reduced-motion via Tailwind animate-pulse (no custom motion).
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-navy-50" aria-busy="true">
      {/* Screen reader: announce loading state (WCAG 2.1 AA) */}
      <p className="sr-only" role="status" aria-live="polite">
        Loading dashboard
      </p>
      {/* Nav skeleton — matches DashboardClient fixed nav */}
      <header className="fixed top-0 w-full z-50 glass border-b border-white/10" aria-hidden="true">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy-100 animate-pulse motion-reduce:animate-none" />
            <div className="h-5 w-20 rounded-md bg-navy-100 animate-pulse motion-reduce:animate-none" />
          </div>
          <div className="h-10 w-24 rounded-lg bg-navy-100 animate-pulse motion-reduce:animate-none" />
        </div>
      </header>

      <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6 outline-none" aria-label="Main content" aria-hidden="true">
        <div className="max-w-4xl mx-auto">
          {/* Greeting + plan row skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div className="h-8 w-56 rounded-lg bg-navy-100 animate-pulse motion-reduce:animate-none" />
            <div className="h-9 w-24 rounded-lg bg-navy-50 animate-pulse motion-reduce:animate-none" />
          </div>

          {/* Deck cards skeleton — 2 rows */}
          <div className="grid gap-4 sm:gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-navy-50 bg-white p-5 sm:p-6 animate-pulse motion-reduce:animate-none"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-5 w-3/4 rounded-md bg-navy-50" />
                    <div className="h-4 w-1/2 rounded bg-navy-50/80" />
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="h-8 w-14 rounded-lg bg-navy-50" />
                    <div className="h-8 w-16 rounded-lg bg-navy-50" />
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-navy-50 flex items-center gap-4">
                  <div className="h-4 w-12 rounded bg-navy-50/80" />
                  <div className="h-4 w-20 rounded bg-navy-50/80" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
