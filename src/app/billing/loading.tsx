/**
 * Billing route loading UI — skeleton for instant perceived performance.
 * Mirrors BillingClient layout (nav + main + header + plan card) so first paint feels instant.
 * Speed as a feature; navy-tinted design system; respects prefers-reduced-motion via animate-pulse.
 */
export default function BillingLoading() {
  return (
    <div className="min-h-screen bg-navy-50" aria-busy="true">
      <p className="sr-only" role="status" aria-live="polite">
        Loading billing
      </p>
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
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <div className="h-8 w-56 rounded-lg bg-navy-100 animate-pulse motion-reduce:animate-none" />
            <div className="h-4 w-72 mt-2 rounded bg-navy-50 animate-pulse motion-reduce:animate-none" />
          </div>
          <div className="rounded-2xl border border-navy-50 bg-white p-6 space-y-5 animate-pulse motion-reduce:animate-none">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-navy-50" />
                <div className="flex items-center gap-3">
                  <div className="h-8 w-16 rounded-lg bg-navy-100" />
                  <div className="h-6 w-14 rounded bg-navy-50" />
                </div>
              </div>
              <div className="h-9 w-28 rounded-lg bg-navy-50" />
            </div>
            <div className="pt-4 border-t border-navy-50 space-y-2">
              <div className="h-4 w-full rounded bg-navy-50/80" />
              <div className="h-4 w-2/3 rounded bg-navy-50/80" />
            </div>
          </div>
          <div className="rounded-2xl border border-navy-50 bg-white p-6 animate-pulse motion-reduce:animate-none">
            <div className="h-5 w-32 rounded-md bg-navy-50 mb-4" />
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-xl bg-navy-50/80" />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
