"use client";

import { useEffect, useState, useCallback } from "react";

/* ─── Plan card data ─── */

interface PlanCard {
  name: string;
  plan?: string; // "pro" | "growth"
  price: string;
  unit: string;
  desc: string;
  color: string;       // accent colour class
  bgAccent: string;    // light background class
  badge?: string;
  features: string[];
  cta: string;
}

const PLANS: PlanCard[] = [
  {
    name: "Starter",
    price: "Free",
    unit: "",
    desc: "Try it out",
    color: "text-navy-400",
    bgAccent: "bg-navy-50",
    features: [
      "1 AI-generated deck",
      "PDF export (watermarked)",
      "Basic PIQ Score — overall only",
      "1 design theme",
      "Shareable link",
    ],
    cta: "Current Plan",
  },
  {
    name: "Pro",
    plan: "pro",
    price: "$29",
    unit: "/mo",
    desc: "For active fundraisers",
    color: "text-electric",
    bgAccent: "bg-electric/5",
    badge: "Popular",
    features: [
      "Unlimited decks",
      "Full PIQ Score + AI coaching",
      "All 12+ design themes",
      "PDF + PPTX export — no watermark",
      "Pitch deck editor with Smart Blocks",
      "AI coaching per slide",
      "10 version history snapshots",
      "Deck templates library",
      "Remove PitchIQ branding",
    ],
    cta: "Upgrade to Pro",
  },
  {
    name: "Growth",
    plan: "growth",
    price: "$79",
    unit: "/mo",
    desc: "Full intelligence suite",
    color: "text-violet-600",
    bgAccent: "bg-violet-50",
    badge: "Best Value",
    features: [
      "Everything in Pro, plus:",
      "Engagement analytics dashboard",
      "Slide-level viewer tracking",
      "Investor variants (VC, Angel, Accelerator)",
      "A/B testing with smart routing",
      "Follow-up alerts on high engagement",
      "Investor CRM — track who viewed",
      "Investor Lens AI — 3 persona scoring",
      "Pitch Simulator — AI investor Q&A",
      "Unlimited version history",
      "Custom domain for shared links",
    ],
    cta: "Upgrade to Growth",
  },
  {
    name: "Enterprise",
    plan: "enterprise",
    price: "$399",
    unit: "/mo",
    desc: "For teams & programs",
    color: "text-amber-600",
    bgAccent: "bg-amber-50",
    features: [
      "Everything in Growth, plus:",
      "Team collaboration & workspaces",
      "Unlimited workspace members",
      "REST API access for integrations",
      "Batch scoring for cohorts",
      "White-label — fully branded",
      "SSO / SAML authentication",
      "Dedicated support & onboarding",
    ],
    cta: "Upgrade to Enterprise",
  },
];

/* ─── Component ─── */

interface PlanCompareModalProps {
  open: boolean;
  onClose: () => void;
  currentPlan?: string; // "starter" | "pro" | "growth" | "enterprise"
  highlightPlan?: string; // which plan to auto-highlight
}

export default function PlanCompareModal({ open, onClose, currentPlan = "starter", highlightPlan }: PlanCompareModalProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
  }, [onClose]);

  useEffect(() => {
    if (open) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [open, handleKeyDown]);

  const handleCheckout = async (plan: string) => {
    setLoadingPlan(plan);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(`/dashboard`)}`;
          return;
        }
        throw new Error(data.error || "Checkout failed");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoadingPlan(null);
    }
  };

  if (!open) return null;

  const planRank: Record<string, number> = { starter: 0, pro: 1, growth: 2, enterprise: 3 };
  const currentRank = planRank[currentPlan] ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 sm:pt-16 px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-5xl max-h-[85vh] overflow-y-auto rounded-2xl bg-white shadow-2xl border border-navy-100">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-lg hover:bg-navy-100 transition-colors text-navy-400 hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="px-6 sm:px-8 pt-8 pb-4 border-b border-navy-100">
          <h2 className="text-2xl font-bold text-navy tracking-tight">Choose your plan</h2>
          <p className="text-sm text-navy-500 mt-1">
            Compare features and pick what fits your fundraising stage.
          </p>
          {error && (
            <p className="mt-2 text-red-500 text-sm font-medium">{error}</p>
          )}
        </div>

        {/* Plan cards grid */}
        <div className="p-6 sm:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PLANS.map((p) => {
              const isCurrent = currentPlan === (p.plan || p.name.toLowerCase());
              const isHighlighted = highlightPlan === p.plan;
              const isDowngrade = (planRank[p.plan || p.name.toLowerCase()] ?? 0) < currentRank;
              const isLoading = loadingPlan === p.plan;

              return (
                <div
                  key={p.name}
                  className={`relative flex flex-col rounded-xl border p-5 transition-all duration-300 ${
                    isHighlighted
                      ? `border-2 ${p.plan === "growth" ? "border-violet-400 shadow-lg shadow-violet-100" : "border-electric shadow-lg shadow-electric/10"}`
                      : isCurrent
                        ? "border-2 border-electric/30 bg-electric/[0.02]"
                        : "border-navy-200 hover:border-navy-300 hover:-translate-y-0.5"
                  }`}
                >
                  {/* Badge */}
                  {p.badge && (
                    <div className={`absolute -top-2.5 left-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide text-white ${
                      p.plan === "growth" ? "bg-gradient-to-r from-violet-500 to-electric" : "bg-electric"
                    }`}>
                      {p.badge}
                    </div>
                  )}

                  {/* Current plan indicator */}
                  {isCurrent && (
                    <div className="absolute -top-2.5 right-4 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-emerald-500 text-white">
                      Current
                    </div>
                  )}

                  {/* Plan info */}
                  <h3 className={`text-sm font-bold ${p.color}`}>{p.name}</h3>
                  <p className="text-[11px] text-navy-400 mt-0.5">{p.desc}</p>

                  {/* Price */}
                  <div className="flex items-baseline gap-0.5 mt-4 mb-5">
                    <span className="text-2xl font-bold text-navy">{p.price}</span>
                    {p.unit && <span className="text-xs text-navy-400">{p.unit}</span>}
                  </div>

                  {/* Features */}
                  <ul className="space-y-2 mb-6 flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-xs">
                        <svg className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${p.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-navy-600">{f}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  {isCurrent ? (
                    <div className="mt-auto w-full text-center py-2.5 rounded-lg bg-navy-100 text-navy-400 text-xs font-semibold">
                      Your current plan
                    </div>
                  ) : isDowngrade ? (
                    <div className="mt-auto w-full text-center py-2.5 rounded-lg bg-navy-50 text-navy-300 text-xs font-semibold cursor-not-allowed">
                      Included in your plan
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => p.plan && handleCheckout(p.plan)}
                      disabled={!!loadingPlan}
                      aria-busy={!!loadingPlan}
                      aria-label={loadingPlan ? "Setting up checkout…" : p.cta}
                      className={`mt-auto w-full min-h-[44px] inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-70 disabled:cursor-wait disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                        p.plan === "growth"
                          ? "bg-electric text-white shadow-lg shadow-electric/25 hover:bg-electric-600 hover:shadow-glow"
                          : "bg-navy text-white shadow-lg shadow-navy-900/20 hover:bg-navy-800 hover:shadow-glow hover:shadow-electric/10"
                      }`}
                    >
                      {isLoading ? (
                        <span className="inline-flex items-center justify-center gap-1.5">
                          <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Setting up...
                        </span>
                      ) : (
                        p.cta
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom note */}
          <p className="text-center text-xs text-navy-400 mt-6">
            All paid plans include a free trial period. Cancel anytime — no lock-in.
          </p>
        </div>
      </div>
    </div>
  );
}
