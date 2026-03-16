"use client";

import { useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import PlanCompareModal from "@/components/PlanCompareModal";
import { getPlanLimits } from "@/lib/plan-limits";

const PLAN_INFO: Record<string, { label: string; price: string; color: string; bgColor: string }> = {
  starter: { label: "Starter", price: "Free", color: "text-navy-600", bgColor: "bg-navy-100" },
  pro: { label: "Pro", price: "$29/mo", color: "text-electric", bgColor: "bg-electric/10" },
  growth: { label: "Growth", price: "$79/mo", color: "text-purple-700", bgColor: "bg-purple-100" },
  enterprise: { label: "Enterprise", price: "$399/mo", color: "text-amber-700", bgColor: "bg-amber-100" },
};

export default function BillingClient({
  plan,
  hasSubscription,
  planExpiresAt,
  memberSince,
  deckCount,
}: {
  plan: string;
  hasSubscription: boolean;
  planExpiresAt: string | null;
  memberSince: string | null;
  deckCount: number;
}) {
  const [managingBilling, setManagingBilling] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const info = PLAN_INFO[plan] || PLAN_INFO.starter;
  const limits = getPlanLimits(plan);
  const isPaid = plan !== "starter";

  const handleManageBilling = async () => {
    setManagingBilling(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      // Fallback
    } finally {
      setManagingBilling(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-50">
      <AppNav />

      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-navy font-display tracking-tight">
              Billing & Subscription
            </h1>
            <p className="text-sm text-navy-500 mt-1">
              Manage your plan, payment method, and invoices.
            </p>
          </div>

          {/* Current plan card */}
          <div className="rounded-2xl border border-navy-200 bg-white p-6 space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-bold text-navy-500 uppercase tracking-wider mb-2">Current Plan</h2>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${info.color} ${info.bgColor}`}>
                    {info.label}
                  </span>
                  <span className="text-xl font-bold text-navy">{info.price}</span>
                </div>
              </div>
              {isPaid && hasSubscription && (
                <button
                  type="button"
                  onClick={handleManageBilling}
                  disabled={managingBilling}
                  className="px-4 py-2 rounded-xl border border-navy-200 text-sm font-medium text-navy hover:bg-navy-50 transition-colors disabled:opacity-50"
                >
                  {managingBilling ? "Loading..." : "Manage in Stripe"}
                </button>
              )}
            </div>

            {planExpiresAt && (
              <p className="text-xs text-navy-500">
                Next billing date:{" "}
                <span className="font-medium text-navy">
                  {new Date(planExpiresAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </p>
            )}

            {/* Plan features summary */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-navy-100">
              <div>
                <div className="text-xs text-navy-400 mb-1">Decks</div>
                <div className="text-sm font-bold text-navy">
                  {deckCount} / {limits.maxDecks === Infinity ? "Unlimited" : limits.maxDecks}
                </div>
              </div>
              <div>
                <div className="text-xs text-navy-400 mb-1">Themes</div>
                <div className="text-sm font-bold text-navy">
                  {limits.allowedThemes.length === 1 ? "1 theme" : "All themes"}
                </div>
              </div>
              <div>
                <div className="text-xs text-navy-400 mb-1">PPTX Export</div>
                <div className={`text-sm font-bold ${limits.pptxExport ? "text-emerald-600" : "text-navy-300"}`}>
                  {limits.pptxExport ? "Included" : "Not included"}
                </div>
              </div>
              <div>
                <div className="text-xs text-navy-400 mb-1">Analytics</div>
                <div className={`text-sm font-bold ${limits.analytics ? "text-emerald-600" : "text-navy-300"}`}>
                  {limits.analytics ? "Included" : "Not included"}
                </div>
              </div>
            </div>
          </div>

          {/* Upgrade / Change plan */}
          {!isPaid && (
            <div className="rounded-2xl border border-electric/15 bg-white p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-navy text-sm mb-1">Upgrade your plan</h3>
                  <p className="text-xs text-navy-500">
                    Unlock unlimited decks, full PIQ coaching, all themes, and more.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPlanModal(true)}
                  className="shrink-0 px-5 py-2.5 rounded-xl bg-electric text-white text-sm font-semibold hover:opacity-90 transition-all"
                >
                  View Plans
                </button>
              </div>
            </div>
          )}

          {isPaid && (
            <div className="rounded-2xl border border-navy-200 bg-white p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-navy text-sm mb-1">Want to change plans?</h3>
                  <p className="text-xs text-navy-500">
                    Compare all plans and switch anytime. Changes take effect immediately.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPlanModal(true)}
                  className="shrink-0 px-5 py-2.5 rounded-xl border border-navy-200 text-navy text-sm font-semibold hover:bg-navy-50 transition-all"
                >
                  Compare Plans
                </button>
              </div>
            </div>
          )}

          {/* Billing actions */}
          {isPaid && hasSubscription && (
            <div className="rounded-2xl border border-navy-200 bg-white p-6 space-y-4">
              <h2 className="text-sm font-bold text-navy-500 uppercase tracking-wider">Billing Actions</h2>
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleManageBilling}
                  disabled={managingBilling}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-navy-200 hover:bg-navy-50 transition-colors text-left disabled:opacity-50"
                >
                  <div>
                    <div className="text-sm font-medium text-navy">Update payment method</div>
                    <div className="text-xs text-navy-400">Change your credit card or billing details</div>
                  </div>
                  <svg className="w-4 h-4 text-navy-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleManageBilling}
                  disabled={managingBilling}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-navy-200 hover:bg-navy-50 transition-colors text-left disabled:opacity-50"
                >
                  <div>
                    <div className="text-sm font-medium text-navy">View invoices</div>
                    <div className="text-xs text-navy-400">Download past invoices and receipts</div>
                  </div>
                  <svg className="w-4 h-4 text-navy-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={handleManageBilling}
                  disabled={managingBilling}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-red-200 hover:bg-red-50 transition-colors text-left disabled:opacity-50"
                >
                  <div>
                    <div className="text-sm font-medium text-red-600">Cancel subscription</div>
                    <div className="text-xs text-red-400">Downgrade to the free Starter plan</div>
                  </div>
                  <svg className="w-4 h-4 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Account info */}
          <div className="rounded-2xl border border-navy-200 bg-white p-6">
            <h2 className="text-sm font-bold text-navy-500 uppercase tracking-wider mb-4">Account</h2>
            <div className="space-y-3">
              {memberSince && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-navy-500">Member since</span>
                  <span className="font-medium text-navy">
                    {new Date(memberSince).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-navy-500">Total decks created</span>
                <span className="font-medium text-navy">{deckCount}</span>
              </div>
            </div>
          </div>

          {/* Back to dashboard */}
          <div className="text-center">
            <Link
              href="/dashboard"
              className="text-sm text-navy-500 hover:text-electric font-medium transition-colors"
            >
              &larr; Back to Dashboard
            </Link>
          </div>
        </div>
      </main>

      <PlanCompareModal
        open={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        currentPlan={plan}
        highlightPlan={plan === "starter" ? "pro" : undefined}
      />
    </div>
  );
}
