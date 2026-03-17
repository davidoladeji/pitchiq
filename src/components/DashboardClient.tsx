"use client";


import { useState, useEffect } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import { getPlanLimits } from "@/lib/plan-limits";
import DashboardOverview from "@/components/dashboard/DashboardOverview";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";
import DashboardDeckGrid from "@/components/dashboard/DashboardDeckGrid";
import DashboardAnalytics from "@/components/dashboard/DashboardAnalytics";
import DashboardActivityFeed, { type ActivityItem } from "@/components/dashboard/DashboardActivityFeed";
import DashboardABTests from "@/components/dashboard/DashboardABTests";
import DashboardInvestorCRM from "@/components/dashboard/DashboardInvestorCRM";
import DashboardFundraiseTracker from "@/components/dashboard/DashboardFundraiseTracker";
import DashboardApiKeys from "@/components/dashboard/DashboardApiKeys";
import DashboardBatchJobs from "@/components/dashboard/DashboardBatchJobs";
import DashboardCustomDomain from "@/components/dashboard/DashboardCustomDomain";
import DashboardPitchPractice from "@/components/dashboard/DashboardPitchPractice";
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
  growth: { label: "Growth", color: "bg-violet-100 text-violet-700" },
  enterprise: { label: "Enterprise", color: "bg-amber-100 text-amber-700" },
};

export default function DashboardClient({
  decks,
  userName,
  plan = "starter",
  upgradedPlan,
  activities = [],
}: {
  decks: DeckSummary[];
  userName: string;
  plan?: string;
  upgradedPlan?: string;
  activities?: ActivityItem[];
}) {
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(!!upgradedPlan);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [dailyViews, setDailyViews] = useState<{ date: string; count: number }[]>([]);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [totalViewsFromApi, setTotalViewsFromApi] = useState<number | null>(null);

  // If user just completed checkout, use upgraded plan as effective plan
  // (webhook may not have fired yet when the redirect lands)
  const effectivePlan = upgradedPlan && ["pro", "growth", "enterprise"].includes(upgradedPlan)
    ? upgradedPlan
    : plan;
  const isPaidPlan = effectivePlan !== "starter";
  const planInfo = PLAN_LABELS[effectivePlan] || PLAN_LABELS.starter;
  const limits = getPlanLimits(effectivePlan);

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

  return (
    <div className="min-h-screen bg-navy-50">
      <AppNav />

      <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6 outline-none" aria-label="Main content">
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
                {isPaidPlan && (
                  <Link
                    href="/billing"
                    className="text-xs text-navy-500 hover:text-electric font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded"
                  >
                    Manage billing
                  </Link>
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
                  className="shrink-0 inline-flex items-center gap-1.5 min-h-[44px] px-5 py-2 rounded-xl bg-electric text-white text-sm font-semibold shadow-lg shadow-electric/25 hover:bg-electric-600 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  aria-label="View plans and upgrade to Pro"
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
          <DashboardOverview decks={decks} totalViews={totalViews} plan={effectivePlan} />

          {/* Quick actions */}
          <DashboardQuickActions plan={effectivePlan} />

          {/* A/B Testing (Growth+ only) */}
          <DashboardABTests
            decks={decks.map((d) => ({ shareId: d.shareId, title: d.title }))}
            plan={effectivePlan}
          />

          {/* Investor CRM (Growth+ only) */}
          <DashboardInvestorCRM plan={effectivePlan} />

          {/* Fundraise Tracker (Growth+ only) */}
          <DashboardFundraiseTracker plan={effectivePlan} />

          {/* Pitch Practice (Growth+ only) */}
          <DashboardPitchPractice plan={effectivePlan} decks={decks.map((d) => ({ shareId: d.shareId, title: d.title }))} />

          {/* Batch Scoring (Enterprise only) */}
          <DashboardBatchJobs plan={effectivePlan} />

          {/* Custom Domain (Growth+ only) */}
          <DashboardCustomDomain plan={effectivePlan} />

          {/* API Keys (Enterprise only) */}
          <DashboardApiKeys hasApiAccess={limits.apiAccess} />

          {/* Deck grid — full width */}
          <DashboardDeckGrid decks={decks} plan={effectivePlan} />

          {/* Analytics + Activity — full width, side-by-side on large screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DashboardAnalytics
              dailyViews={dailyViews}
              plan={effectivePlan}
              loading={analyticsLoading}
            />
            <DashboardActivityFeed
              activities={activities}
              plan={effectivePlan}
            />
          </div>
        </div>
      </main>

      {/* Plan comparison modal */}
      <PlanCompareModal
        open={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        currentPlan={effectivePlan}
        highlightPlan="pro"
      />
    </div>
  );
}
