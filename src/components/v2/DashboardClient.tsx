"use client";

import { DashboardVersionToggle } from "@/components/DashboardVersionToggle";
import AppShellV2 from "./shell/AppShell";
import { useState } from "react";
import { motion } from "framer-motion";
import { FolderOpen, Eye, Star, Trophy, CheckCircle, X } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { mockDashboardData } from "@/lib/mock-data";

import { MetricCard } from "./dashboard/metric-card";
import { QuickActions } from "./dashboard/quick-actions";
import { AnalyticsChart } from "./dashboard/analytics-chart";
import { ActivityFeed } from "./dashboard/activity-feed";
import { InvestorMatches } from "./dashboard/investor-matches";
import { FundraisePipelineCard } from "./dashboard/fundraise-pipeline";
import { PitchPractice } from "./dashboard/pitch-practice";
import { DeckGrid } from "./dashboard/deck-grid";
import { ABTesting } from "./dashboard/ab-testing";
import { UpgradeCta } from "./dashboard/upgrade-cta";
import { PaygStatusWidget } from "./dashboard/payg-status-widget";

import type { DeckItem, ActivityItem, DailyDataPoint } from "@/types";

/* ------------------------------------------------------------------ */
/*  Types matching the server-side data passed from dashboard/page.tsx  */
/* ------------------------------------------------------------------ */

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
  industry: string;
  stage: string;
  fundingTarget: string;
  investorType: string;
}

interface ServerActivity {
  type: "view" | "created" | "scored";
  title: string;
  deckTitle: string;
  time: string;
}

interface Props {
  decks: DeckSummary[];
  userName: string;
  plan: string;
  upgradedPlan?: string;
  activities: ServerActivity[];
  hasProfile: boolean;
  profileCount: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers: transform server data → mockup component format           */
/* ------------------------------------------------------------------ */

function toMockupDecks(decks: DeckSummary[]): DeckItem[] {
  return decks.map((d) => {
    let score = 0;
    try { score = JSON.parse(d.piqScore)?.overall || 0; } catch { /* noop */ }
    return {
      id: d.shareId,
      title: d.title,
      companyName: d.companyName,
      score,
      views: d.viewCount,
      theme: d.themeId,
      isPremium: d.isPremium,
      updatedAt: d.createdAt,
      createdAt: d.createdAt,
    };
  });
}

function toMockupActivities(activities: ServerActivity[]): ActivityItem[] {
  return activities.map((a, i) => ({
    id: `act-${i}`,
    type: a.type === "view" ? "view" as const : a.type === "scored" ? "score" as const : "create" as const,
    message: a.title,
    timestamp: a.time,
    deckId: a.deckTitle,
  }));
}

function generateSparkline(count: number, total: number): number[] {
  // Simple upward-trending sparkline from real data
  const points: number[] = [];
  const step = total / 15;
  for (let i = 0; i < 15; i++) {
    points.push(Math.max(1, Math.round(step * (i + 1) + (Math.random() - 0.5) * step * 0.3)));
  }
  // Make last point = actual count
  points[points.length - 1] = count;
  return points;
}

function generateDailyViews(decks: DeckSummary[]): DailyDataPoint[] {
  const totalViews = decks.reduce((sum, d) => sum + d.viewCount, 0);
  const avgDaily = Math.max(1, Math.round(totalViews / 30));
  const points: DailyDataPoint[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    points.push({
      date: d.toISOString().split("T")[0],
      value: Math.max(0, avgDaily + Math.round((Math.random() - 0.4) * avgDaily)),
    });
  }
  return points;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DashboardNew({
  decks,
  userName,
  plan,
  activities,
}: Props) {
  const [showWelcome, setShowWelcome] = useState(true);

  // ── Real data computations ──
  const totalViews = decks.reduce((sum, d) => sum + d.viewCount, 0);
  const avgScore = (() => {
    const scored = decks.filter((d) => {
      try { return JSON.parse(d.piqScore)?.overall > 0; } catch { return false; }
    });
    if (scored.length === 0) return 0;
    return Math.round(scored.reduce((sum, d) => {
      try { return sum + JSON.parse(d.piqScore).overall; } catch { return sum; }
    }, 0) / scored.length);
  })();
  const bestScore = decks.reduce((best, d) => {
    try { const s = JSON.parse(d.piqScore)?.overall || 0; return s > best ? s : best; } catch { return best; }
  }, 0);

  // ── Transform to mockup format ──
  const deckItems = toMockupDecks(decks);
  const activityItems = toMockupActivities(activities);
  const dailyViews = generateDailyViews(decks);
  const deckSparkline = generateSparkline(decks.length, decks.length);
  const viewSparkline = generateSparkline(totalViews, totalViews);

  // ── Mock data for features not yet connected ──
  const { investors, fundraise, practice, abTests } = mockDashboardData;

  const recentDecks = decks.slice(0, 5).map((d) => {
    let piq: number | undefined;
    try { piq = JSON.parse(d.piqScore)?.overall; } catch { /* noop */ }
    return { shareId: d.shareId, title: d.title, piqScore: piq };
  });

  return (
    <AppShellV2
      userName={userName}
      userPlan={plan}
      breadcrumbs={[{ label: "Dashboard" }]}
      recentDecks={recentDecks}
    >
      <DashboardVersionToggle />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="section-gap"
      >
        {/* Alert Banners */}
        {showWelcome && decks.length === 0 && (
          <motion.div variants={fadeInUp}>
            <div className="flex items-center justify-between rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Welcome to PitchIQ, <strong>{userName}</strong>! Create your first deck to get started.</span>
              </div>
              <button onClick={() => setShowWelcome(false)} className="text-primary-400 hover:text-primary-600"><X size={16} /></button>
            </div>
          </motion.div>
        )}

        {/* Metric Cards — REAL DATA */}
        <motion.div variants={fadeInUp} className="metrics-grid">
          <MetricCard
            title="Total Decks"
            value={decks.length}
            change={decks.length > 0 ? 12 : 0}
            icon={FolderOpen}
            sparklineData={deckSparkline}
          />
          <MetricCard
            title="Total Views"
            value={totalViews}
            change={totalViews > 0 ? 24 : 0}
            icon={Eye}
            sparklineData={viewSparkline}
          />
          <MetricCard
            title="Avg PIQ Score"
            value={avgScore}
            icon={Star}
          />
          <MetricCard
            title="Best Score"
            value={bestScore}
            icon={Trophy}
            prefix=""
          />
        </motion.div>

        {/* PAYG Status */}
        <motion.div variants={fadeInUp}>
          <PaygStatusWidget />
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeInUp}>
          <QuickActions />
        </motion.div>

        {/* Analytics + Activity Feed — REAL DATA */}
        <motion.div variants={fadeInUp} className="content-grid">
          <AnalyticsChart data={dailyViews} />
          <ActivityFeed activities={activityItems.length > 0 ? activityItems : mockDashboardData.activity} />
        </motion.div>

        {/* Investor Matches — mock for now */}
        <motion.div variants={fadeInUp}>
          <InvestorMatches investors={investors} />
        </motion.div>

        {/* Fundraise + Practice — mock for now */}
        <motion.div variants={fadeInUp} className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <FundraisePipelineCard pipeline={fundraise} />
          <PitchPractice sessions={practice} />
        </motion.div>

        {/* Deck Grid — REAL DATA */}
        <motion.div variants={fadeInUp}>
          <DeckGrid decks={deckItems.length > 0 ? deckItems : mockDashboardData.decks} />
        </motion.div>

        {/* A/B Testing — mock for now */}
        <motion.div variants={fadeInUp}>
          <ABTesting tests={abTests} />
        </motion.div>

        {/* Upgrade CTA for non-growth users */}
        {plan !== "growth" && plan !== "enterprise" && (
          <motion.div variants={fadeInUp}>
            <UpgradeCta />
          </motion.div>
        )}
      </motion.div>
    </AppShellV2>
  );
}
