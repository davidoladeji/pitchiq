"use client";

import Link from "next/link";
import { useState } from "react";
import AppNav from "@/components/AppNav";
import { getPlanLimits } from "@/lib/plan-limits";

interface DeckSummary {
  id: string;
  shareId: string;
  title: string;
  companyName: string;
  themeId: string;
  piqScore: string;
  isPremium: boolean;
  createdAt: string;
  viewCount: number;
}

function parsePiqOverall(piqJson: string): number | null {
  try {
    const parsed = JSON.parse(piqJson);
    return typeof parsed.overall === "number" ? parsed.overall : null;
  } catch {
    return null;
  }
}

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  starter: { label: "Starter", color: "bg-gray-100 text-gray-600" },
  pro: { label: "Pro", color: "bg-electric/10 text-electric" },
  growth: { label: "Growth", color: "bg-purple-100 text-purple-700" },
};

export default function DashboardClient({
  decks,
  userName,
  plan = "starter",
  hasSubscription = false,
  upgradedPlan,
}: {
  decks: DeckSummary[];
  userName: string;
  plan?: string;
  hasSubscription?: boolean;
  upgradedPlan?: string;
}) {
  const [managingBilling, setManagingBilling] = useState(false);
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(!!upgradedPlan);
  const isPaidPlan = plan !== "starter";
  const planInfo = PLAN_LABELS[plan] || PLAN_LABELS.starter;
  const limits = getPlanLimits(plan);
  const atDeckLimit = decks.length >= limits.maxDecks;

  const handleManageBilling = async () => {
    setManagingBilling(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Fallback to pricing page
      window.location.href = "/#pricing";
    } finally {
      setManagingBilling(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:ring-2 focus:ring-electric focus:ring-offset-2 focus:bg-white focus:font-medium focus:text-navy"
      >
        Skip to main content
      </a>
      <AppNav
        actions={
          atDeckLimit && !isPaidPlan ? (
            <Link
              href="/#pricing"
              aria-label="Upgrade to create more decks"
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-electric to-purple-500 text-white text-sm font-semibold shadow-sm hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Upgrade for More
            </Link>
          ) : (
            <Link
              href="/create"
              aria-label="Create new pitch deck"
              className="min-h-[44px] inline-flex items-center px-5 py-2.5 rounded-lg bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-light hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              New Deck
            </Link>
          )
        }
      />

      <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6 outline-none">
        <div className="max-w-4xl mx-auto">
          {/* Upgrade success banner */}
          {showUpgradeSuccess && upgradedPlan && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-5 sm:p-6 animate-fade-in">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-green-900 text-sm">Welcome to {PLAN_LABELS[upgradedPlan]?.label || "Pro"}!</h3>
                    <p className="text-green-700 text-xs sm:text-sm">
                      Your subscription is active. All your decks have been upgraded with premium features.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowUpgradeSuccess(false)}
                  className="shrink-0 text-green-400 hover:text-green-600 transition-colors"
                  aria-label="Dismiss"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <div className="flex items-start justify-between gap-4 mb-1">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy tracking-tight">
              Hey {userName}
            </h1>
            <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${planInfo.color}`}>
              {planInfo.label}
            </span>
          </div>
          <div className="flex items-center gap-4 mb-8">
            <p className="text-gray-500 text-sm">
              {decks.length === 0
                ? "You haven't created any decks yet."
                : !isPaidPlan && limits.maxDecks < Infinity
                  ? `${decks.length} of ${limits.maxDecks} deck${limits.maxDecks === 1 ? "" : "s"} used`
                  : `${decks.length} deck${decks.length === 1 ? "" : "s"}`}
            </p>
            {hasSubscription && (
              <button
                type="button"
                onClick={handleManageBilling}
                disabled={managingBilling}
                className="text-xs text-gray-400 hover:text-electric font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 rounded"
              >
                {managingBilling ? "Loading..." : "Manage billing"}
              </button>
            )}
          </div>

          {/* Upgrade CTA banner — only show for starter plan */}
          {!isPaidPlan && (
            <div className="mb-6 rounded-2xl border border-electric/15 bg-gradient-to-r from-electric/5 via-white to-purple-50 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-electric shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                    <h3 className="font-bold text-navy text-sm">Upgrade to Pro</h3>
                  </div>
                  <p className="text-gray-500 text-xs sm:text-sm">
                    Unlock unlimited decks, full PIQ coaching, all themes, PPTX export & remove branding.
                  </p>
                </div>
                <Link
                  href="/#pricing"
                  className="shrink-0 inline-flex items-center gap-1.5 min-h-[40px] px-5 py-2 rounded-xl bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-light hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  View Plans
                </Link>
              </div>
            </div>
          )}

          {decks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-electric/5 border border-electric/10 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-electric"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-navy mb-2">
                Create your first deck
              </h2>
              <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                Describe your startup and get an AI-generated pitch deck with a
                PIQ Score in 60 seconds.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/create"
                  aria-label="Create your first pitch deck"
                  className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-xl bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-light hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
                >
                  Create Deck
                </Link>
                <Link
                  href="/ideas"
                  aria-label="Explore startup ideas — no signup required"
                  className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:border-electric/30 hover:text-electric transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
                >
                  Explore ideas first
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {decks.map((deck) => {
                const piqOverall = parsePiqOverall(deck.piqScore);
                return (
                  <Link
                    key={deck.id}
                    href={`/deck/${deck.shareId}`}
                    aria-label={`View deck: ${deck.title}`}
                    className="group bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 transition-all duration-300 hover:border-electric/20 hover:shadow-card-hover hover:-translate-y-1"
                  >
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4">
                      <div className="min-w-0 flex-1">
                        <h2 className="font-bold text-navy text-base mb-1 truncate group-hover:text-electric transition-colors">
                          {deck.title}
                        </h2>
                        <p className="text-gray-500 text-sm">
                          {deck.companyName}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        {piqOverall !== null && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-electric tabular-nums">
                              {piqOverall}
                            </div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                              PIQ
                            </div>
                          </div>
                        )}
                        <div className="text-center">
                          <div className="text-lg font-bold text-navy tabular-nums">
                            {deck.viewCount}
                          </div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                            Views
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                      <span>
                        {new Date(deck.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="capitalize">{deck.themeId} theme</span>
                      {deck.isPremium && (
                        <span className="px-1.5 py-0.5 rounded bg-electric/8 text-electric font-bold text-[10px] uppercase">
                          Pro
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
