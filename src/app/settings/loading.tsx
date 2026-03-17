export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-navy-50" aria-busy="true">
      <p className="sr-only" role="status" aria-live="polite">
        Loading settings
      </p>
      <header className="fixed top-0 w-full z-50 glass border-b border-white/10" aria-hidden="true">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-navy-100 animate-pulse" />
            <div className="h-5 w-20 rounded-md bg-navy-100 animate-pulse" />
          </div>
          <div className="h-10 w-24 rounded-lg bg-navy-100 animate-pulse" />
        </div>
      </header>

      <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6 outline-none" aria-label="Main content" aria-hidden="true">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <div className="h-8 w-40 rounded-lg bg-navy-100 animate-pulse" />
            <div className="h-4 w-64 mt-2 rounded bg-navy-50 animate-pulse" />
          </div>
          <div className="rounded-2xl border border-navy-50 bg-white p-6 space-y-4 animate-pulse">
            <div className="h-4 w-20 rounded bg-navy-50" />
            <div className="h-10 w-full rounded-xl bg-navy-50/80" />
            <div className="h-10 w-full rounded-xl bg-navy-50/80" />
          </div>
          <div className="rounded-2xl border border-navy-50 bg-white p-6 space-y-4 animate-pulse">
            <div className="h-4 w-28 rounded bg-navy-50" />
            <div className="h-10 w-full rounded-xl bg-navy-50/80" />
            <div className="h-10 w-full rounded-xl bg-navy-50/80" />
            <div className="h-10 w-full rounded-xl bg-navy-50/80" />
          </div>
        </div>
      </main>
    </div>
  );
}
