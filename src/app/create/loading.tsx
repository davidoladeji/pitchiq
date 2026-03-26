/**
 * Create route loading UI — void-themed skeleton.
 * Mirrors CreatePageClient layout (title + step indicator + form).
 * Matches the v2 void dark theme for seamless transitions.
 */
export default function CreateLoading() {
  return (
    <div className="min-h-screen" style={{ background: "var(--void, #000)" }} aria-busy="true">
      <p className="sr-only" role="status" aria-live="polite">
        Loading create
      </p>

      <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6 outline-none" aria-label="Main content" aria-hidden="true">
        <div className="max-w-2xl mx-auto">
          {/* Title block skeleton */}
          <div className="text-center mb-12">
            <div className="h-9 w-64 sm:w-80 mx-auto rounded-lg animate-pulse motion-reduce:animate-none mb-3" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
            <div className="h-4 max-w-lg mx-auto rounded animate-pulse motion-reduce:animate-none" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
          </div>

          {/* Form card skeleton */}
          <div className="rounded-2xl p-6 sm:p-8 md:p-10" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))", border: "1px solid var(--void-border, rgba(255,255,255,0.06))" }}>
            {/* Step indicator skeleton — 4 circles + connectors */}
            <div className="flex items-center gap-1 mb-10">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center flex-1">
                  <div className="flex items-center gap-2.5 flex-1">
                    <div className="w-9 h-9 rounded-xl animate-pulse motion-reduce:animate-none shrink-0" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
                    <div className="hidden sm:block min-w-0 flex-1">
                      <div className="h-3 w-12 rounded animate-pulse motion-reduce:animate-none mb-1" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
                      <div className="h-2.5 w-16 rounded animate-pulse motion-reduce:animate-none" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
                    </div>
                  </div>
                  {i < 4 && (
                    <div className="h-px flex-1 mx-3 animate-pulse motion-reduce:animate-none min-w-[8px]" style={{ background: "var(--void-border, rgba(255,255,255,0.06))" }} />
                  )}
                </div>
              ))}
            </div>

            {/* Form fields skeleton — 3 label + input rows */}
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 w-24 rounded animate-pulse motion-reduce:animate-none" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
                  <div className="h-12 w-full rounded-xl animate-pulse motion-reduce:animate-none" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
                </div>
              ))}
            </div>

            {/* CTA row skeleton */}
            <div className="flex gap-3 mt-8 pt-6" style={{ borderTop: "1px solid var(--void-border, rgba(255,255,255,0.06))" }}>
              <div className="h-11 w-24 rounded-lg animate-pulse motion-reduce:animate-none" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
              <div className="h-11 w-28 rounded-xl animate-pulse motion-reduce:animate-none" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
