"use client";

import Link from "next/link";

/**
 * Prompts users to complete their startup profile.
 * Shown on dashboard when hasProfile is false.
 * Each deck may map to a different startup, so profiles improve investor matching.
 */
export default function DashboardProfilePrompt() {
  return (
    <section className="rounded-2xl border border-electric/20 bg-white p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Icon */}
        <div className="w-12 h-12 rounded-xl bg-electric/10 flex items-center justify-center shrink-0">
          <svg
            className="w-6 h-6 text-electric"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21"
            />
          </svg>
        </div>

        {/* Copy */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-navy">Set Up Your Startup Profile</h3>
          <p className="text-xs text-navy-500 mt-0.5 leading-relaxed">
            Tell us about your company — sector, stage, geography, and funding details.
            This powers smarter investor matching and lets you match against your profile
            instead of just a single deck.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/dashboard/startup-profile"
          className="shrink-0 inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-electric text-white text-xs font-semibold shadow-sm hover:bg-electric-600 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          Complete Profile
        </Link>
      </div>
    </section>
  );
}
