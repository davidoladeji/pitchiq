"use client";

import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";

/**
 * Full-screen overlay that freezes the app for suspended users.
 * They can see the page behind it (blurred) but cannot interact.
 * Only option is to sign out or contact support.
 *
 * This component fetches /api/me/status once on mount (and when session changes)
 * to check if the user is suspended.
 */
export default function SuspendedOverlay() {
  const { data: session, status } = useSession();
  const [suspended, setSuspended] = useState(false);
  const [reason, setReason] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated" || !session?.user) {
      setSuspended(false);
      return;
    }

    let cancelled = false;

    async function check() {
      try {
        const res = await fetch("/api/me/status");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.suspended) {
          setSuspended(true);
          setReason(data.suspendedReason || null);
        }
      } catch {
        // Silent fail — don't block the app if the check fails
      }
    }

    check();
    return () => { cancelled = true; };
  }, [status, session]);

  if (!suspended) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      style={{ pointerEvents: "auto" }}
    >
      <div className="max-w-md w-full mx-4 bg-[#1A1A24] border border-white/10 rounded-2xl shadow-2xl p-8 text-center">
        {/* Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-red-500/15 flex items-center justify-center mb-5">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">
          Account Suspended
        </h2>

        <p className="text-sm text-white/50 mb-4 leading-relaxed">
          Your account has been suspended and all features are currently frozen.
          If you believe this is an error, please contact our support team.
        </p>

        {reason && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 mb-5">
            <p className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-1">Reason</p>
            <p className="text-sm text-red-300">{reason}</p>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <a
            href="mailto:support@usepitchiq.com"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-electric text-white text-sm font-semibold hover:bg-electric-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            Contact Support
          </a>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="px-5 py-2.5 rounded-lg bg-white/5 text-white/50 text-sm hover:text-white hover:bg-white/10 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
