/**
 * Score route loading UI — void-themed skeleton.
 * Mirrors ScorePageClient layout (title + upload zone).
 * Matches the v2 void dark theme for seamless transitions.
 */
export default function ScoreLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--void, #000)" }} aria-busy="true">
      <p className="sr-only" role="status" aria-live="polite">
        Loading score
      </p>

      <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6 outline-none" aria-label="Main content" aria-hidden="true">
        <div className="max-w-2xl mx-auto">
          {/* Header skeleton — badge + title + subtitle */}
          <div className="text-center mb-10">
            <div className="inline-flex h-9 w-32 rounded-full animate-pulse motion-reduce:animate-none mb-4" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
            <div className="h-8 w-64 mx-auto rounded-lg animate-pulse motion-reduce:animate-none mb-2" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
            <div className="h-5 w-80 mx-auto rounded-md animate-pulse motion-reduce:animate-none" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
          </div>

          {/* Upload card skeleton */}
          <div className="rounded-2xl p-8 sm:p-10 animate-pulse motion-reduce:animate-none" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))", border: "1px solid var(--void-border, rgba(255,255,255,0.06))" }}>
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
              <div className="h-5 w-48 rounded-md" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
              <div className="h-4 w-64 rounded" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
              <div className="h-24 w-full rounded-xl mt-2" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))", border: "2px dashed var(--void-border, rgba(255,255,255,0.06))" }} />
              <div className="h-10 w-36 rounded-lg" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
