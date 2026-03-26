/**
 * Billing route loading UI — void-themed skeleton.
 * Mirrors BillingClient layout (title + plan cards).
 * Matches the v2 void dark theme for seamless transitions.
 */
export default function BillingLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--void, #000)" }} aria-busy="true">
      <p className="sr-only" role="status" aria-live="polite">
        Loading billing
      </p>

      <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6 outline-none" aria-label="Main content" aria-hidden="true">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Title */}
          <div>
            <div className="h-8 w-56 rounded-lg animate-pulse motion-reduce:animate-none" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
            <div className="h-4 w-72 mt-2 rounded animate-pulse motion-reduce:animate-none" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
          </div>

          {/* Current plan card */}
          <div className="rounded-2xl p-6 space-y-5 animate-pulse motion-reduce:animate-none" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))", border: "1px solid var(--void-border, rgba(255,255,255,0.06))" }}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="h-4 w-24 rounded" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
                <div className="flex items-center gap-3">
                  <div className="h-8 w-16 rounded-lg" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
                  <div className="h-6 w-14 rounded" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
                </div>
              </div>
              <div className="h-9 w-28 rounded-lg" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
            </div>
            <div className="pt-4 space-y-2" style={{ borderTop: "1px solid var(--void-border, rgba(255,255,255,0.06))" }}>
              <div className="h-4 w-full rounded" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
              <div className="h-4 w-2/3 rounded" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
            </div>
          </div>

          {/* Plan options card */}
          <div className="rounded-2xl p-6 animate-pulse motion-reduce:animate-none" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))", border: "1px solid var(--void-border, rgba(255,255,255,0.06))" }}>
            <div className="h-5 w-32 rounded-md mb-4" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
            <div className="grid gap-3 sm:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-20 rounded-xl" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))", border: "1px solid var(--void-border, rgba(255,255,255,0.06))" }} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
