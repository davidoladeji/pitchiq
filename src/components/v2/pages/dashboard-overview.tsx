"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Eye, Star, Trophy, CheckCircle, X, AlertTriangle } from "lucide-react";

import { mockDashboardData } from "@/lib/mock-data";
import { staggerContainer, fadeInUp } from "@/lib/animations";

import { MetricCard } from "@/components/v2/dashboard/metric-card";
import { QuickActions } from "@/components/v2/dashboard/quick-actions";
import { AnalyticsChart } from "@/components/v2/dashboard/analytics-chart";
import { ActivityFeed } from "@/components/v2/dashboard/activity-feed";
import { InvestorMatches } from "@/components/v2/dashboard/investor-matches";
import { FundraisePipelineCard } from "@/components/v2/dashboard/fundraise-pipeline";
import { PitchPractice } from "@/components/v2/dashboard/pitch-practice";
import { DeckGrid } from "@/components/v2/dashboard/deck-grid";
import { ABTesting } from "@/components/v2/dashboard/ab-testing";
import { UpgradeCta } from "@/components/v2/dashboard/upgrade-cta";
import { PaygStatusWidget } from "@/components/v2/dashboard/payg-status-widget";

const { stats, sparklines, analytics, activity, investors, fundraise, practice, decks, abTests } =
  mockDashboardData;

export default function DashboardPage() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [showCreditAlert, setShowCreditAlert] = useState(true);

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="section-gap"
    >
      {/* ── Alert Banners ────────────────────────────────────── */}
      <motion.div variants={fadeInUp}>
        {showWelcome && (
          <div className="flex items-center justify-between rounded-xl border border-success-200 bg-success-50 px-4 py-3 text-sm text-success-700">
            <div className="flex items-center gap-2">
              <CheckCircle size={16} />
              <span>Welcome back! Your <strong>Growth Pass</strong> is active — 5 days remaining.</span>
            </div>
            <button onClick={() => setShowWelcome(false)} className="text-success-500 hover:text-success-700"><X size={16} /></button>
          </div>
        )}
      </motion.div>

      <motion.div variants={fadeInUp}>
        {showCreditAlert && (
          <div className="flex items-center justify-between rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-600">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>Your credit balance is running low (23 credits). Buy more to continue using pay-per-use features.</span>
            </div>
            <button onClick={() => setShowCreditAlert(false)} className="text-warning-500 hover:text-warning-600"><X size={16} /></button>
          </div>
        )}
      </motion.div>

      {/* ── Metric Cards ─────────────────────────────────────── */}
      <motion.div variants={fadeInUp} className="metrics-grid">
        <MetricCard
          title="Total Decks"
          value={stats.totalDecks}
          change={12}
          icon={FolderOpen}
          sparklineData={sparklines.decks}
        />
        <MetricCard
          title="Total Views"
          value={stats.totalViews}
          change={24}
          icon={Eye}
          sparklineData={sparklines.views}
        />
        <MetricCard
          title="Avg PIQ Score"
          value={stats.avgScore}
          icon={Star}
        />
        <MetricCard
          title="Best Deck"
          value={stats.bestScore}
          icon={Trophy}
          prefix=""
        />
      </motion.div>

      {/* ── PAYG Status ──────────────────────────────────────── */}
      <motion.div variants={fadeInUp}>
        <PaygStatusWidget />
      </motion.div>

      {/* ── Quick Actions ────────────────────────────────────── */}
      <motion.div variants={fadeInUp}>
        <QuickActions />
      </motion.div>

      {/* ── Analytics + Activity Feed ────────────────────────── */}
      <motion.div variants={fadeInUp} className="content-grid">
        <AnalyticsChart data={analytics.dailyViews} />
        <ActivityFeed activities={activity} />
      </motion.div>

      {/* ── Investor Matches ─────────────────────────────────── */}
      <motion.div variants={fadeInUp}>
        <InvestorMatches investors={investors} />
      </motion.div>

      {/* ── Fundraise Pipeline + Pitch Practice ──────────────── */}
      <motion.div
        variants={fadeInUp}
        className="grid gap-6 grid-cols-1 lg:grid-cols-2"
      >
        <FundraisePipelineCard pipeline={fundraise} />
        <PitchPractice sessions={practice} />
      </motion.div>

      {/* ── Deck Grid ────────────────────────────────────────── */}
      <motion.div variants={fadeInUp}>
        <DeckGrid decks={decks} />
      </motion.div>

      {/* ── A/B Testing ──────────────────────────────────────── */}
      <motion.div variants={fadeInUp}>
        <ABTesting tests={abTests} />
      </motion.div>

      {/* ── Upgrade CTA ──────────────────────────────────────── */}
      <motion.div variants={fadeInUp}>
        <UpgradeCta />
      </motion.div>
    </motion.div>
  );
}
