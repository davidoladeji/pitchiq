/**
 * Admin route loading UI — skeleton for instant perceived performance.
 * Mirrors AdminLayout (skip link, header bar, main content) so first paint feels instant on /admin/*.
 * Speed as a feature; design-system navy tint; respects prefers-reduced-motion via animate-pulse.
 */
export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-navy-50" aria-busy="true">
      {/* Screen reader: announce loading state (WCAG 2.1 AA) */}
      <p className="sr-only" role="status" aria-live="polite">
        Loading
      </p>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-electric focus:px-4 focus:py-2 focus:text-white focus:outline-none focus:ring-2 focus:ring-electric focus:ring-offset-2 focus:ring-offset-white"
      >
        Skip to main content
      </a>
      {/* Header skeleton — matches AdminLayout (PitchIQ Admin + nav links) */}
      <header className="border-b bg-white px-4 py-3" aria-hidden="true">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="h-6 w-32 rounded-md bg-navy-100 animate-pulse" />
          <nav className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-10 w-20 rounded-lg bg-navy-100 animate-pulse"
              />
            ))}
          </nav>
        </div>
      </header>

      <main
        id="main"
        tabIndex={-1}
        className="mx-auto max-w-6xl px-4 py-6 outline-none"
        aria-hidden="true"
      >
        {/* Content block placeholders */}
        <div className="space-y-6">
          <div className="h-8 w-48 rounded-lg bg-navy-100 animate-pulse" />
          <div className="rounded-xl border border-navy-50 bg-white p-6">
            <div className="space-y-4">
              <div className="h-5 w-full rounded-md bg-navy-50 animate-pulse" />
              <div className="h-5 w-4/5 rounded-md bg-navy-50 animate-pulse" />
              <div className="h-5 w-3/4 rounded-md bg-navy-50/80 animate-pulse" />
            </div>
          </div>
          <div className="rounded-xl border border-navy-50 bg-white p-6">
            <div className="h-24 w-full rounded-lg bg-navy-50/50 animate-pulse" />
          </div>
        </div>
      </main>
    </div>
  );
}
