"use client";

import { useState } from "react";
import {
  Check,
  Clock,
  Coins,
  Loader2,
  Sparkles,
  Zap,
  Crown,
} from "lucide-react";
import {
  DEFAULT_PASS_TIERS,
  DEFAULT_CREDIT_PACKS,
  DEFAULT_CREDIT_ACTIONS,
  calculatePassPrice,
  type PassTier,
  type CreditPack,
} from "@/lib/payg-config";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const DURATIONS = [1, 3, 7, 14, 30] as const;

const TIER_ICONS: Record<string, React.ReactNode> = {
  basic: <Zap className="w-5 h-5" />,
  growth: <Sparkles className="w-5 h-5" />,
  full: <Crown className="w-5 h-5" />,
};

const TIER_ACCENTS: Record<string, string> = {
  basic: "border-electric/30 hover:border-electric/50",
  growth: "border-violet-300 hover:border-violet-400",
  full: "border-amber-300 hover:border-amber-400",
};

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DurationSelector({
  selected,
  onChange,
}: {
  selected: number;
  onChange: (d: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-2 flex-wrap">
      {DURATIONS.map((d) => (
        <button
          key={d}
          type="button"
          onClick={() => onChange(d)}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
            selected === d
              ? "bg-electric text-white shadow-lg shadow-electric/25"
              : "bg-navy-100 text-navy-500 hover:bg-navy-200 hover:text-navy-700"
          }`}
        >
          {d} day{d > 1 ? "s" : ""}
        </button>
      ))}
    </div>
  );
}

function PassCard({
  tier,
  duration,
  loading,
  onBuy,
}: {
  tier: PassTier;
  duration: number;
  loading: boolean;
  onBuy: () => void;
}) {
  const price = calculatePassPrice(tier, duration);
  const perDay = price / duration;

  return (
    <div
      className={`bg-white border ${TIER_ACCENTS[tier.id] ?? "border-navy-200"} rounded-2xl p-6 flex flex-col shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5`}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="text-electric">{TIER_ICONS[tier.id]}</div>
        <h3 className="text-lg font-bold text-navy">{tier.name}</h3>
      </div>
      <p className="text-xs text-navy-400 mb-4">{tier.description}</p>

      <ul className="space-y-2 mb-6 flex-1">
        {tier.features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-navy-600">
            <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="mb-4">
        <div className="text-3xl font-bold text-navy tabular-nums">
          ${formatCents(price)}
        </div>
        <p className="text-xs text-navy-400 mt-0.5">
          ${formatCents(perDay)}/day for {duration} day{duration > 1 ? "s" : ""}
        </p>
      </div>

      <button
        type="button"
        onClick={onBuy}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-dark hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Clock className="w-4 h-4" />
        )}
        {loading ? "Redirecting..." : "Get Pass"}
      </button>
    </div>
  );
}

function CreditPackCard({
  pack,
  loading,
  onBuy,
}: {
  pack: CreditPack;
  loading: boolean;
  onBuy: () => void;
}) {
  const totalCredits = pack.credits + pack.bonus;
  const perCredit = pack.priceCents / totalCredits;

  return (
    <div
      className={`relative bg-white border rounded-2xl p-6 flex flex-col shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${
        pack.popular
          ? "ring-2 ring-electric border-electric/30"
          : "border-navy-200"
      }`}
    >
      {pack.popular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-electric text-white text-[10px] font-bold uppercase tracking-wider">
          Popular
        </span>
      )}

      <h3 className="text-lg font-bold text-navy mb-1">{pack.name}</h3>

      <div className="flex items-baseline gap-1 mb-1">
        <span className="text-3xl font-bold text-navy tabular-nums">
          {pack.credits}
        </span>
        <span className="text-sm text-navy-400">credits</span>
      </div>

      {pack.bonus > 0 && (
        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 mb-3">
          +{pack.bonus} bonus
        </span>
      )}
      {pack.bonus === 0 && <div className="mb-3" />}

      <div className="mb-1">
        <span className="text-2xl font-bold text-navy tabular-nums">
          ${formatCents(pack.priceCents)}
        </span>
      </div>
      <p className="text-xs text-navy-400 mb-5">
        ${formatCents(perCredit)} per credit
      </p>

      <button
        type="button"
        onClick={onBuy}
        disabled={loading}
        className={`mt-auto w-full inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 ${
          pack.popular
            ? "bg-electric text-white hover:bg-electric-dark hover:-translate-y-0.5 active:translate-y-0"
            : "bg-navy-100 text-navy-700 hover:bg-navy-200 hover:-translate-y-0.5 active:translate-y-0"
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Coins className="w-4 h-4" />
        )}
        {loading ? "Redirecting..." : "Buy Credits"}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function PaygPricingSection() {
  const [tab, setTab] = useState<"passes" | "credits">("passes");
  const [selectedDuration, setSelectedDuration] = useState(7);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // ── Checkout handlers ──────────────────────────────────────────────────

  async function handlePassCheckout(tierId: string) {
    setLoadingId(tierId);
    try {
      const res = await fetch("/api/payg/pass/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier: tierId, durationDays: selectedDuration }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Pass checkout error:", data.error);
        setLoadingId(null);
      }
    } catch (err) {
      console.error("Pass checkout error:", err);
      setLoadingId(null);
    }
  }

  async function handleCreditCheckout(packId: string) {
    setLoadingId(packId);
    try {
      const res = await fetch("/api/payg/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packId }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error("Credit checkout error:", data.error);
        setLoadingId(null);
      }
    } catch (err) {
      console.error("Credit checkout error:", err);
      setLoadingId(null);
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <section id="payg" className="py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-navy font-display">
            Pay As You Go
          </h2>
          <p className="text-navy-400 mt-3 text-lg">
            No commitment. Use PitchIQ when you need it.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center justify-center gap-1 bg-navy-100 rounded-xl p-1 max-w-xs mx-auto mb-10">
          <button
            type="button"
            onClick={() => setTab("passes")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "passes"
                ? "bg-electric text-white shadow-lg shadow-electric/20"
                : "text-navy-500 hover:text-navy-700"
            }`}
          >
            Period Passes
          </button>
          <button
            type="button"
            onClick={() => setTab("credits")}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === "credits"
                ? "bg-electric text-white shadow-lg shadow-electric/20"
                : "text-navy-500 hover:text-navy-700"
            }`}
          >
            Credit Packs
          </button>
        </div>

        {/* ── Period Passes ─────────────────────────────────────────────── */}
        {tab === "passes" && (
          <div>
            <div className="mb-8">
              <DurationSelector
                selected={selectedDuration}
                onChange={setSelectedDuration}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {DEFAULT_PASS_TIERS.map((tier) => (
                <PassCard
                  key={tier.id}
                  tier={tier}
                  duration={selectedDuration}
                  loading={loadingId === tier.id}
                  onBuy={() => handlePassCheckout(tier.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Credit Packs ─────────────────────────────────────────────── */}
        {tab === "credits" && (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {DEFAULT_CREDIT_PACKS.map((pack) => (
                <CreditPackCard
                  key={pack.id}
                  pack={pack}
                  loading={loadingId === pack.id}
                  onBuy={() => handleCreditCheckout(pack.id)}
                />
              ))}
            </div>

            {/* Credit Cost Table */}
            <div className="mt-12">
              <h3 className="text-lg font-bold text-navy mb-4">
                Credit Costs
              </h3>
              <div className="overflow-x-auto rounded-2xl border border-navy-200 bg-white">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-navy-200 bg-navy-50">
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-navy-400">
                        Action
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-navy-400">
                        Credits
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-navy-400 hidden sm:table-cell">
                        Description
                      </th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider text-navy-400">
                        Min Plan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-navy-100">
                    {DEFAULT_CREDIT_ACTIONS.map((action) => (
                      <tr
                        key={action.action}
                        className="hover:bg-navy-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 text-navy-700 font-medium">
                          {action.displayName}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1 text-electric font-semibold tabular-nums">
                            <Coins className="w-3.5 h-3.5" />
                            {action.cost}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-navy-400 hidden sm:table-cell">
                          {action.description}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md bg-navy-100 text-navy-500 text-xs font-medium capitalize">
                            {action.requiredPlan}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
