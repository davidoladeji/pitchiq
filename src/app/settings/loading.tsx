/**
 * Settings route loading UI — void-themed skeleton.
 * Matches the v2 void dark theme for seamless transitions.
 */
export default function SettingsLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--void, #000)" }} aria-busy="true">
      <p className="sr-only" role="status" aria-live="polite">
        Loading settings
      </p>

      <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6 outline-none" aria-label="Main content" aria-hidden="true">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Title */}
          <div>
            <div className="h-8 w-40 rounded-lg animate-pulse motion-reduce:animate-none" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
            <div className="h-4 w-64 mt-2 rounded animate-pulse motion-reduce:animate-none" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
          </div>

          {/* Tabs skeleton */}
          <div className="flex gap-4" style={{ borderBottom: "1px solid var(--void-border, rgba(255,255,255,0.06))" }}>
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-9 w-20 rounded-t-lg animate-pulse motion-reduce:animate-none" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
            ))}
          </div>

          {/* Form card 1 */}
          <div className="rounded-2xl p-6 space-y-4 animate-pulse motion-reduce:animate-none" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))", border: "1px solid var(--void-border, rgba(255,255,255,0.06))" }}>
            <div className="h-4 w-20 rounded" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
            <div className="h-10 w-full rounded-xl" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
            <div className="h-10 w-full rounded-xl" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
          </div>

          {/* Form card 2 */}
          <div className="rounded-2xl p-6 space-y-4 animate-pulse motion-reduce:animate-none" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))", border: "1px solid var(--void-border, rgba(255,255,255,0.06))" }}>
            <div className="h-4 w-28 rounded" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
            <div className="h-10 w-full rounded-xl" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
            <div className="h-10 w-full rounded-xl" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
            <div className="h-10 w-full rounded-xl" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
          </div>
        </div>
      </main>
    </div>
  );
}
