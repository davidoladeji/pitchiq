"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  Coins,
  ArrowUpRight,
  ShoppingCart,
  Calendar,
  CreditCard,
  Sparkles,
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
  basic: "bg-electric/10 text-electric",
  growth: "bg-violet-100 text-violet-700",
  full: "bg-amber-100 text-amber-700",
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function txBadge(type: string): { label: string; cls: string } {
  switch (type) {
    case "purchase":
      return { label: "Purchase", cls: "bg-emerald-100 text-emerald-700" };
    case "usage":
      return { label: "Usage", cls: "bg-orange-100 text-orange-700" };
    case "bonus":
      return { label: "Bonus", cls: "bg-electric/10 text-electric" };
    case "refund":
      return { label: "Refund", cls: "bg-violet-100 text-violet-700" };
    default:
      return { label: type, cls: "bg-navy-100 text-navy-500" };
  }
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function Skeleton() {
  return (
    <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-white/10 rounded-2xl p-4 animate-pulse">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-5 h-5 rounded bg-navy-100 dark:bg-navy-900" />
        <div className="h-4 w-32 rounded bg-navy-100 dark:bg-navy-900" />
      </div>
      <div className="space-y-3">
        <div className="h-8 w-20 rounded bg-navy-100 dark:bg-navy-900" />
        <div className="h-3 w-full rounded bg-navy-50 dark:bg-navy-950" />
        <div className="h-3 w-3/4 rounded bg-navy-50 dark:bg-navy-950" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function PaygStatus() {
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
        // silently fail — widget is non-critical
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <Skeleton />;
  if (!data) return null;

  const { activePasses, creditBalance, effectivePlan, recentCredits } = data;
  const activePass = activePasses[0] ?? null;
  const showUpgrade = effectivePlan === "starter";
  const recentThree = recentCredits.slice(0, 3);

  return (
    <div className="bg-white dark:bg-navy-900 border border-navy-200 dark:border-white/10 rounded-2xl p-4 shadow-sm">
      <h3 className="text-sm font-bold text-navy dark:text-white mb-3 flex items-center gap-1.5">
        <CreditCard className="w-4 h-4 text-electric" />
        Pay As You Go
      </h3>

      {/* Active pass */}
      {activePass && (
        <div className="flex items-center gap-2 mb-3">
          <span
            className={`px-2 py-0.5 rounded-md text-xs font-semibold ${TIER_COLORS[activePass.tier] ?? "bg-navy-100 text-navy-500"}`}
          >
            {TIER_LABELS[activePass.tier] ?? activePass.tier}
          </span>
          <span className="flex items-center gap-1 text-xs text-navy-400">
            <Clock className="w-3 h-3" />
            {activePass.daysLeft} day{activePass.daysLeft !== 1 ? "s" : ""} left
          </span>
        </div>
      )}

      {/* Credit balance */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-500" />
          <span className="text-xl font-bold text-navy dark:text-white tabular-nums">
            {creditBalance}
          </span>
          <span className="text-xs text-navy-400">credits</span>
        </div>
        <Link
          href="/dashboard/credits"
          className="inline-flex items-center gap-1 text-xs font-medium text-electric hover:text-electric-dark transition-colors"
        >
          <ShoppingCart className="w-3 h-3" />
          Buy More
        </Link>
      </div>

      {/* Upgrade prompt */}
      {showUpgrade && !activePass && (
        <div className="rounded-xl bg-navy-50 dark:bg-navy-950 border border-navy-200 dark:border-white/10 p-3 mb-3">
          <p className="text-xs text-navy-500 dark:text-navy-300 mb-2">
            Unlock more features with a plan, pass, or credits.
          </p>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/#pricing"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-electric/10 text-electric text-[10px] font-semibold hover:bg-electric/20 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Subscribe
            </Link>
            <Link
              href="/#payg"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-violet-100 text-violet-700 text-[10px] font-semibold hover:bg-violet-200 transition-colors"
            >
              <Calendar className="w-3 h-3" />
              Get a Pass
            </Link>
            <Link
              href="/dashboard/credits"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-700 text-[10px] font-semibold hover:bg-amber-200 transition-colors"
            >
              <Coins className="w-3 h-3" />
              Buy Credits
            </Link>
          </div>
        </div>
      )}

      {/* Recent transactions */}
      {recentThree.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-wider text-navy-400 font-semibold mb-2">
            Recent Activity
          </p>
          <ul className="space-y-1.5">
            {recentThree.map((tx) => {
              const badge = txBadge(tx.type);
              return (
                <li
                  key={tx.id}
                  className="flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0 ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                    <span className="text-navy-600 dark:text-navy-200 truncate">
                      {tx.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span
                      className={`font-semibold tabular-nums ${tx.amount >= 0 ? "text-emerald-600" : "text-red-500"}`}
                    >
                      {tx.amount >= 0 ? "+" : ""}
                      {tx.amount}
                    </span>
                    <span className="text-navy-300 dark:text-navy-500">
                      {relativeTime(tx.createdAt)}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
          {recentCredits.length > 3 && (
            <Link
              href="/dashboard/credits"
              className="inline-flex items-center gap-1 text-[10px] font-medium text-electric hover:text-electric-dark mt-2 transition-colors"
            >
              View all
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
