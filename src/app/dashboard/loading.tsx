/**
 * Dashboard route loading UI — void-themed skeleton.
 * Shows for all /dashboard/* routes during server rendering.
 * Matches the v2 void dark theme for seamless transitions.
 */
export default function DashboardLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--void, #000)" }} aria-busy="true">
      <p className="sr-only" role="status" aria-live="polite">Loading dashboard</p>

      <div className="flex">
        {/* Icon rail skeleton */}
        <div className="hidden lg:flex flex-col items-center w-16 shrink-0 py-6 gap-4 border-r" style={{ background: "var(--void-1, #050510)", borderColor: "var(--void-border, rgba(255,255,255,0.06))" }}>
          <div className="w-8 h-8 rounded-xl animate-pulse" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
          <div className="w-6 h-6 rounded-lg animate-pulse mt-4" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
          <div className="w-6 h-6 rounded-lg animate-pulse" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
          <div className="w-8 h-8 rounded-xl animate-pulse" style={{ background: "var(--neon-electric, #4361EE)" }} />
          <div className="w-6 h-6 rounded-lg animate-pulse" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
          <div className="w-6 h-6 rounded-lg animate-pulse" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 lg:p-8">
          {/* Top bar skeleton */}
          <div className="flex items-center justify-between mb-8">
            <div className="h-4 w-48 rounded animate-pulse" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
            <div className="flex items-center gap-3">
              <div className="h-8 w-28 rounded-xl animate-pulse" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
              <div className="h-8 w-8 rounded-full animate-pulse" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
            </div>
          </div>

          {/* Greeting skeleton */}
          <div className="mb-8">
            <div className="h-9 w-72 rounded-lg animate-pulse mb-2" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
            <div className="h-4 w-48 rounded animate-pulse" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
          </div>

          {/* Metric cards skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 rounded-2xl animate-pulse" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))", border: "1px solid var(--void-border, rgba(255,255,255,0.06))" }} />
            ))}
          </div>

          {/* Quick actions skeleton */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))", border: "1px solid var(--void-border, rgba(255,255,255,0.06))" }} />
            ))}
          </div>

          {/* Content grid skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-36 rounded-2xl animate-pulse" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))", border: "1px solid var(--void-border, rgba(255,255,255,0.06))" }} />
              ))}
            </div>
            <div className="h-80 rounded-2xl animate-pulse" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))", border: "1px solid var(--void-border, rgba(255,255,255,0.06))" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
