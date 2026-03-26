/**
 * Root loading UI — void-themed minimal skeleton.
 * Centered spinner for seamless transitions.
 * Matches the v2 void dark theme.
 */
export default function RootLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--void, #000)" }} aria-busy="true">
      <p className="sr-only" role="status" aria-live="polite">
        Loading
      </p>

      <div className="flex flex-col items-center gap-6" aria-hidden="true">
        {/* Logo placeholder */}
        <div className="w-10 h-10 rounded-xl animate-pulse motion-reduce:animate-none" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }} />
        {/* Spinner bar */}
        <div className="w-48 h-1 rounded-full overflow-hidden" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))" }}>
          <div className="h-full w-1/3 rounded-full animate-pulse motion-reduce:animate-none" style={{ background: "var(--neon-electric, #4361EE)" }} />
        </div>
      </div>
    </div>
  );
}
