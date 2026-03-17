/**
 * Sign-in route loading UI — skeleton for instant perceived performance.
 * Mirrors sign-in page layout (centered card, logo, title, provider buttons) so first paint feels instant.
 * Speed as a feature; design-system navy tint; respects prefers-reduced-motion via animate-pulse.
 */
export default function SignInLoading() {
  return (
    <div className="min-h-screen bg-navy-50 flex items-center justify-center px-4" aria-busy="true">
      <p className="sr-only" role="status" aria-live="polite">
        Loading sign in
      </p>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8" aria-hidden="true">
          {/* Logo + name skeleton */}
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-10 h-10 rounded-xl bg-navy-100 animate-pulse" />
            <div className="h-7 w-20 rounded-md bg-navy-100 animate-pulse" />
          </div>
          {/* Title + subtitle skeleton */}
          <div className="h-8 w-48 mx-auto rounded-lg bg-navy-100 animate-pulse mb-2" />
          <div className="h-4 w-64 mx-auto rounded bg-navy-50 animate-pulse" />
        </div>
        <main id="main" tabIndex={-1} className="outline-none" aria-label="Main content" aria-hidden="true">
          <div className="bg-white rounded-2xl border border-navy-50 shadow-sm p-6 space-y-3">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-12 rounded-xl bg-navy-50 animate-pulse"
              />
            ))}
          </div>
          <div className="mt-6 h-3 w-56 mx-auto rounded bg-navy-50/80 animate-pulse" />
        </main>
      </div>
    </div>
  );
}
