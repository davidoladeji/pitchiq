/**
 * Ideas route loading UI — void-themed skeleton.
 * Mirrors IdeasPageClient layout (title + card grid).
 * Matches the v2 void dark theme for seamless transitions.
 */
export default function IdeasLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--void, #000)" }} aria-busy="true">
      <p className="sr-only" role="status" aria-live="polite">
        Loading ideas
      </p>

      <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6 outline-none" aria-label="Main content" aria-hidden="true">
        <div className="max-w-4xl mx-auto">
          {/* Title block skeleton */}
          <div className="mb-8">
            <div className="h-9 w-72 rounded-lg animate-pulse motion-reduce:animate-none mb-2" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
            <div className="h-4 max-w-md rounded animate-pulse motion-reduce:animate-none" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
          </div>

          {/* Card grid skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-40 rounded-2xl animate-pulse motion-reduce:animate-none"
                style={{
                  background: "var(--void-surface, rgba(255,255,255,0.03))",
                  border: "1px solid var(--void-border, rgba(255,255,255,0.06))",
                }}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
