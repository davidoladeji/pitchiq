"use client";

import Link from "next/link";

/**
 * Prompts users to complete their startup profile or add more profiles.
 * For Starter users (maxProfiles=0), shows an informative upgrade-oriented card
 * explaining how profiles improve investor matching.
 */
export default function DashboardProfilePrompt({
  profileCount = 0,
  maxProfiles = 1,
  onUpgrade,
}: {
  profileCount?: number;
  maxProfiles?: number;
  plan?: string;
  onUpgrade?: () => void;
}) {
  const hasAny = profileCount > 0;
  const isStarter = maxProfiles === 0;
  const canAddMore = !isStarter && (maxProfiles === Infinity || profileCount < maxProfiles);

  // If user has profiles and can't add more, nothing to prompt
  if (hasAny && !canAddMore && !isStarter) return null;

  // ── Starter plan: informative upgrade card ──────────────────────────
  if (isStarter) {
    return (
      <section className="rounded-2xl border border-white/[0.06] bg-[#0F0F14] p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          {/* Icon */}
          <div className="w-12 h-12 rounded-xl bg-[#4361EE]/10 flex items-center justify-center shrink-0">
            <svg
              className="w-6 h-6 text-[#4361EE]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128H5.228A2 2 0 013 17.16V17a6.003 6.003 0 017.212-5.872M15 19.128a9.004 9.004 0 00-5.197-2.872M12 9.75a3 3 0 11-6 0 3 3 0 016 0zm8.25 0a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
              />
            </svg>
          </div>

          {/* Copy */}
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white">Startup Profiles Unlock Smarter Investor Matching</h3>
            <p className="text-xs text-white/50 mt-1 leading-relaxed">
              With a startup profile, PitchIQ matches you against 80+ investors based on your stage,
              sector, geography, and funding needs — not just your deck content. Profiles deliver
              significantly higher match accuracy and surface investors you&apos;d otherwise miss.
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
              <span className="inline-flex items-center gap-1 text-[10px] text-white/40">
                <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Stage &amp; sector matching
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-white/40">
                <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Geography-aware scoring
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-white/40">
                <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Cheque-size fit analysis
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] text-white/40">
                <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Multi-venture support
              </span>
            </div>
          </div>

          {/* Upgrade CTA */}
          <button
            type="button"
            onClick={onUpgrade}
            className="shrink-0 inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl bg-[#4361EE] text-white text-xs font-semibold shadow-sm hover:bg-[#3651DE] hover:-translate-y-0.5 active:translate-y-0 transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F14]"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
            </svg>
            Upgrade to Pro
          </button>
        </div>
      </section>
    );
  }

  // ── Paid plans: create / add more profiles ──────────────────────────
  return (
    <section className="rounded-2xl border border-electric/20 bg-white dark:bg-navy-900 p-5 sm:p-6">
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
          {!hasAny ? (
            <>
              <h3 className="text-sm font-bold text-navy dark:text-white">Set Up Your Startup Profile</h3>
              <p className="text-xs text-navy-500 dark:text-navy-300 mt-0.5 leading-relaxed">
                Tell us about your company — sector, stage, geography, and funding details.
                This powers smarter investor matching and lets you match against your profile
                instead of just a single deck.
                {maxProfiles > 1 && (
                  <span className="block mt-1 text-navy-400 dark:text-navy-400">
                    Your plan supports up to {maxProfiles === Infinity ? "unlimited" : maxProfiles} startup profile{maxProfiles === 1 ? "" : "s"}.
                  </span>
                )}
              </p>
            </>
          ) : (
            <>
              <h3 className="text-sm font-bold text-navy dark:text-white">Add Another Startup Profile</h3>
              <p className="text-xs text-navy-500 dark:text-navy-300 mt-0.5 leading-relaxed">
                You have {profileCount} profile{profileCount === 1 ? "" : "s"}.
                {maxProfiles === Infinity
                  ? " Your plan supports unlimited profiles."
                  : ` Your plan supports up to ${maxProfiles} — add another to match different ventures against investors.`}
              </p>
            </>
          )}
        </div>

        {/* CTA */}
        <Link
          href="/dashboard/startup-profile"
          className="shrink-0 inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl bg-electric text-white text-xs font-semibold shadow-sm hover:bg-electric-600 hover:-translate-y-0.5 active:translate-y-0 transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-navy-800"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
          {hasAny ? "Manage Profiles" : "Complete Profile"}
        </Link>
      </div>
    </section>
  );
}
