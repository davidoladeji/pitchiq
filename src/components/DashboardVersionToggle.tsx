"use client";

import { useDashboardVersion } from "@/lib/dashboard-version";

export function DashboardVersionToggle() {
  const { version, toggle, isToggling } = useDashboardVersion();

  if (version === "classic") {
    return (
      <div className="rounded-xl border border-electric/20 bg-electric/5 dark:bg-electric/10 p-3 px-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">&#10024;</span>
          <p className="text-sm font-medium text-navy dark:text-white">
            A new dashboard experience is ready
          </p>
        </div>
        <button
          onClick={toggle}
          disabled={isToggling}
          className="shrink-0 px-3 py-1.5 rounded-lg bg-electric text-white text-xs font-semibold hover:bg-electric-600 transition-colors disabled:opacity-50"
        >
          {isToggling ? "Switching..." : "Try it out \u2192"}
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-surface-1 p-3 px-4 flex items-center justify-between gap-4">
      <p className="text-sm text-navy-500 dark:text-white/60">
        You&apos;re using the new dashboard
      </p>
      <button
        onClick={toggle}
        disabled={isToggling}
        className="shrink-0 text-xs text-navy-400 hover:text-navy-600 dark:text-white/40 dark:hover:text-white/70 transition-colors disabled:opacity-50"
      >
        {isToggling ? "Switching..." : "Switch to classic"}
      </button>
    </div>
  );
}
