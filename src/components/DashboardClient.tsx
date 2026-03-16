"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import AppNav from "@/components/AppNav";
import { getPlanLimits } from "@/lib/plan-limits";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";
import DashboardDeckGrid from "@/components/dashboard/DashboardDeckGrid";
import DashboardAnalytics from "@/components/dashboard/DashboardAnalytics";
import DashboardActivityFeed, { type ActivityItem } from "@/components/dashboard/DashboardActivityFeed";
import DashboardABTests from "@/components/dashboard/DashboardABTests";
import DashboardInvestorCRM from "@/components/dashboard/DashboardInvestorCRM";
import PlanCompareModal from "@/components/PlanCompareModal";

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

const PLAN_LABELS: Record<string, { label: string; color: string }> = {
  starter: { label: "Starter", color: "bg-navy-100 text-navy-600" },
  pro: { label: "Pro", color: "bg-electric/10 text-electric" },
  growth: { label: "Growth", color: "bg-purple-100 text-purple-700" },
};

export default function DashboardClient({
  decks,
  userName,
  plan = "starter",
  hasSubscription = false,
  upgradedPlan,
  activities = [],
}: {
  decks: DeckSummary[];
  userName: string;
  plan?: string;
  hasSubscription?: boolean;
  upgradedPlan?: string;
  activities?: ActivityItem[];
}) {
  const [managingBilling, setManagingBilling] = useState(false);
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(!!upgradedPlan);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [dailyViews, setDailyViews] = useState<{ date: string; count: number }[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [totalViewsFromApi, setTotalViewsFromApi] = useState<number | null>(null);

  const isPaidPlan = plan !== "starter";
  const planInfo = PLAN_LABELS[plan] || PLAN_LABELS.starter;
  const limits = getPlanLimits(plan);
  const atDeckLimit = decks.length >= limits.maxDecks;

  // Total views from deck data as fallback
  const totalViewsFromDecks = decks.reduce((sum, d) => sum + d.viewCount, 0);
  const totalViews = totalViewsFromApi ?? totalViewsFromDecks;

  // Fetch analytics on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/dashboard/analytics");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (!cancelled) {
          setDailyViews(data.dailyViews || []);
          setTotalViewsFromApi(data.totalViews ?? null);
        }
      } catch {
        // Silently fail — deck-level data is the fallback
      } finally {
        if (!cancelled) setAnalyticsLoading(false);
      }
    }
    fetchAnalytics();
    return () => { cancelled = true; };
  }, []);

  const handleManageBilling = async () => {
    setManagingBilling(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      window.location.href = "/#pricing";
    } finally {
      setManagingBilling(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:ring-2 focus:ring-electric focus:ring-offset-2 focus:ring-offset-white focus:bg-white focus:font-medium focus:text-navy"
      >
        Skip to main content
      </a>
      <AppNav
        actions={
          atDeckLimit && !isPaidPlan ? (
            <button
              type="button"
              onClick={() => setShowPlanModal(true)}
              aria-label="Upgrade to create more decks"
              className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-electric to-violet text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Upgrade for More
            </button>
          ) : (
            <Link
              href="/create"
              aria-label="Create new pitch deck"
              className="min-h-[44px] inline-flex items-center px-5 py-2.5 rounded-lg bg-electric text-white text-sm font-semibold shadow-sm hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              New Deck
            </Link>
          )
        }
      />

      <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6 outline-none">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-navy font-display tracking-tight">
                Hey {userName}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <p className="text-navy-500 text-sm">
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
                    className="text-xs text-navy-500 hover:text-electric font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded"
                  >
                    {managingBilling ? "Loading..." : "Manage billing"}
                  </button>
                )}
              </div>
            </div>
            <span className={`shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${planInfo.color}`}>
              {planInfo.label}
            </span>
          </div>

          {/* Upgrade success banner */}
          {showUpgradeSuccess && upgradedPlan && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 sm:p-6 animate-fade-in">
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

          {/* Upgrade CTA banner -- starter only */}
          {!isPaidPlan && (
            <div className="rounded-2xl border border-electric/15 bg-gradient-to-r from-electric/5 via-white to-navy-50 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <svg className="w-5 h-5 text-electric shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                    <h3 className="font-bold text-navy text-sm">Upgrade to Pro</h3>
                  </div>
                  <p className="text-navy-500 text-xs sm:text-sm">
                    Unlock unlimited decks, full PIQ coaching, all themes, PPTX export &amp; remove branding.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPlanModal(true)}
                  className="shrink-0 inline-flex items-center gap-1.5 min-h-[40px] px-5 py-2 rounded-xl bg-electric text-white text-sm font-semibold shadow-sm hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  View Plans
                </button>
              </div>
            </div>
          )}

          {/* Overview stats */}
          <DashboardOverview decks={decks} totalViews={totalViews} plan={plan} />

          {/* Quick actions */}
          <DashboardQuickActions />

          {/* A/B Testing (Growth+ only) */}
          <DashboardABTests
            decks={decks.map((d) => ({ shareId: d.shareId, title: d.title }))}
            plan={plan}
          />

          {/* Investor CRM (Growth+ only) */}
          <DashboardInvestorCRM plan={plan} />

          {/* Two-column layout: deck grid + sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main column: 2/3 */}
            <div className="lg:col-span-2">
              <DashboardDeckGrid decks={decks} />
            </div>

            {/* Sidebar: 1/3 */}
            <div className="space-y-6">
              <DashboardAnalytics
                dailyViews={dailyViews}
                plan={plan}
                loading={analyticsLoading}
              />
              <DashboardActivityFeed
                activities={activities}
                plan={plan}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Plan comparison modal */}
      <PlanCompareModal
        open={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        currentPlan={plan}
        highlightPlan="pro"
      />
    </div>
  );
}
