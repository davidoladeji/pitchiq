"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Coins,
  Clock,
  ShoppingCart,
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  TrendingUp,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ActivePass {
  tier: string;
  expiresAt: string;
  daysLeft: number;
  startsAt: string;
}

interface CreditTransaction {
  id: string;
  type: string;
  amount: number;
  description: string;
  balanceAfter?: number;
  createdAt: string;
}

interface PaygStatusData {
  subscription: { plan: string; active: boolean };
  activePasses: ActivePass[];
  creditBalance: number;
  effectivePlan: string;
  recentCredits: CreditTransaction[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TIER_LABELS: Record<string, string> = {
  basic: "Basic Pass",
  growth: "Growth Pass",
  full: "Full Access",
};

const TIER_COLORS: Record<string, string> = {
  basic: "bg-[#4361EE]/15 text-[#4361EE]",
  growth: "bg-violet-500/15 text-violet-400",
  full: "bg-amber-500/15 text-amber-400",
};

function txTypeBadge(type: string): { label: string; cls: string } {
  switch (type) {
    case "purchase":
      return { label: "Purchase", cls: "bg-emerald-500/15 text-emerald-400" };
    case "usage":
      return { label: "Usage", cls: "bg-orange-500/15 text-orange-400" };
    case "bonus":
      return { label: "Bonus", cls: "bg-[#4361EE]/15 text-[#4361EE]" };
    case "refund":
      return { label: "Refund", cls: "bg-violet-500/15 text-violet-400" };
    default:
      return { label: type, cls: "bg-white/[0.06] text-white/50" };
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function PageSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0f1c] text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 animate-pulse">
        <div className="h-6 w-48 rounded bg-white/10 mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="h-32 rounded-2xl bg-white/[0.03]" />
          <div className="h-32 rounded-2xl bg-white/[0.03]" />
        </div>
        <div className="h-64 rounded-2xl bg-white/[0.03]" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CreditsPage() {
  const [data, setData] = useState<PaygStatusData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/payg/status");
        if (!res.ok) throw new Error("fetch failed");
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        // fail silently
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <PageSkeleton />;
  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center">
        <p className="text-white/50">Unable to load credit data. Please try again later.</p>
      </div>
    );
  }

  const { creditBalance, recentCredits, activePasses } = data;

  // Compute lifetime earned (sum of positive transactions)
  const lifetimeEarned = recentCredits
    .filter((t) => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-[#0a0f1c]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-white/30 hover:text-white/60 transition-colors"
              aria-label="Back to dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-2xl font-bold text-white font-display">
              Credits &amp; Passes
            </h1>
          </div>
          <Link
            href="/#payg"
            className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-[#4361EE] text-white text-sm font-semibold shadow-sm hover:bg-[#3651DE] hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            <ShoppingCart className="w-4 h-4" />
            Buy More
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {/* Credit Balance */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Coins className="w-5 h-5 text-amber-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                Credit Balance
              </span>
            </div>
            <div className="text-4xl font-bold text-white tabular-nums mb-1">
              {creditBalance}
            </div>
            <p className="text-xs text-white/40">
              credits available
            </p>
            <div className="flex items-center gap-1.5 mt-3 text-xs text-white/30">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{lifetimeEarned} lifetime credits earned</span>
            </div>
          </div>

          {/* Active Passes */}
          <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-violet-400" />
              <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
                Active Passes
              </span>
            </div>
            {activePasses.length > 0 ? (
              <div className="space-y-2">
                {activePasses.map((pass, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between"
                  >
                    <span
                      className={`px-2 py-0.5 rounded-md text-xs font-semibold ${TIER_COLORS[pass.tier] ?? "bg-white/[0.06] text-white/50"}`}
                    >
                      {TIER_LABELS[pass.tier] ?? pass.tier}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-white/50">
                      <Clock className="w-3 h-3" />
                      {pass.daysLeft} day{pass.daysLeft !== 1 ? "s" : ""} left
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <p className="text-sm text-white/40 mb-3">No active passes</p>
                <Link
                  href="/#payg"
                  className="inline-flex items-center gap-1 text-xs font-medium text-[#4361EE] hover:text-[#3651DE] transition-colors"
                >
                  Get a pass
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Transaction History */}
        <section>
          <h2 className="text-lg font-bold text-white mb-4">
            Transaction History
          </h2>

          {recentCredits.length === 0 ? (
            <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-8 text-center">
              <Coins className="w-8 h-8 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/40">
                No transactions yet. Purchase credits to get started.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                      Date
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                      Type
                    </th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                      Amount
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white/40 hidden sm:table-cell">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentCredits.map((tx) => {
                    const badge = txTypeBadge(tx.type);
                    return (
                      <tr
                        key={tx.id}
                        className="hover:bg-white/[0.02] transition-colors"
                      >
                        <td className="px-4 py-3 text-white/50 whitespace-nowrap">
                          {formatDateTime(tx.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-md text-[10px] font-semibold ${badge.cls}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span
                            className={`font-semibold tabular-nums ${tx.amount >= 0 ? "text-emerald-400" : "text-red-400"}`}
                          >
                            {tx.amount >= 0 ? "+" : ""}
                            {tx.amount}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-white/50 hidden sm:table-cell">
                          {tx.description}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Pass History */}
        {activePasses.length > 0 && (
          <section className="mt-8">
            <h2 className="text-lg font-bold text-white mb-4">
              Pass History
            </h2>
            <div className="space-y-3">
              {activePasses.map((pass, i) => {
                const isActive =
                  new Date(pass.expiresAt).getTime() > Date.now();

                return (
                  <div
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white/[0.03] border border-white/5 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-semibold ${TIER_COLORS[pass.tier] ?? "bg-white/[0.06] text-white/50"}`}
                      >
                        {TIER_LABELS[pass.tier] ?? pass.tier}
                      </span>
                      <span className="text-xs text-white/40">
                        {formatDate(pass.startsAt)} &mdash;{" "}
                        {formatDate(pass.expiresAt)}
                      </span>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        isActive
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-white/[0.06] text-white/30"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-emerald-400" : "bg-white/20"}`}
                      />
                      {isActive ? "Active" : "Expired"}
                    </span>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
