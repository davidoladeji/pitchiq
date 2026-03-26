"use client";

import { useEffect, useState } from "react";
import { DashboardVersionToggle } from "@/components/DashboardVersionToggle";
import AppShellV2 from "./shell/AppShell";
import { motion } from "framer-motion";
import { FolderOpen, Eye, Star, Trophy, CheckCircle, X } from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";

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

import type {
  DeckItem, ActivityItem, DailyDataPoint,
  InvestorMatch, FundraisePipeline, PracticeSession, ABTest,
} from "@/types";

/* ------------------------------------------------------------------ */
/*  Types from API response                                            */
/* ------------------------------------------------------------------ */

interface DashboardData {
  stats: { totalDecks: number; totalViews: number; avgScore: number; bestScore: number; bestDeckTitle: string };
  sparklines: { decks: number[]; views: number[] };
  decks: DeckItem[];
  activities: ActivityItem[];
  dailyViews: DailyDataPoint[];
  investors: InvestorMatch[];
  fundraise: FundraisePipeline;
  practice: PracticeSession[];
  abTests: ABTest[];
  user: { plan: string; creditBalance: number; name: string };
}

/* ------------------------------------------------------------------ */
/*  Props (still received from server for SSR compat)                  */
/* ------------------------------------------------------------------ */

interface Props {
  decks: unknown[];
  userName: string;
  plan: string;
  upgradedPlan?: string;
  activities: unknown[];
  hasProfile: boolean;
  profileCount: number;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function DashboardNew({ userName, plan }: Props) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    fetch("/api/v2/dashboard")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  // Loading skeleton
  if (loading || !data) {
    return (
      <AppShellV2 userName={userName} userPlan={plan}>
        <DashboardVersionToggle />
        <div className="section-gap">
          <div className="metrics-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-xl bg-surface-muted animate-pulse" />
            ))}
          </div>
          <div className="h-64 rounded-xl bg-surface-muted animate-pulse" />
          <div className="h-48 rounded-xl bg-surface-muted animate-pulse" />
        </div>
      </AppShellV2>
    );
  }

  const { stats, sparklines, decks, activities, dailyViews, investors, fundraise, practice, abTests, user } = data;

  return (
    <AppShellV2
      userName={user.name || userName}
      userPlan={user.plan || plan}
      breadcrumbs={[{ label: "Dashboard" }]}
      recentDecks={decks.slice(0, 5).map((d) => ({ shareId: d.id, title: d.title, piqScore: d.score }))}
    >
      <DashboardVersionToggle />

      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="section-gap">
        {/* Welcome banner for new users */}
        {showWelcome && stats.totalDecks === 0 && (
          <motion.div variants={fadeInUp}>
            <div className="flex items-center justify-between rounded-xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-700">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} />
                <span>Welcome to PitchIQ, <strong>{user.name || userName}</strong>! Create your first deck to get started.</span>
              </div>
              <button onClick={() => setShowWelcome(false)} className="text-primary-400 hover:text-primary-600"><X size={16} /></button>
            </div>
          </motion.div>
        )}

        {/* Metric Cards */}
        <motion.div variants={fadeInUp} className="metrics-grid">
          <MetricCard title="Total Decks" value={stats.totalDecks} change={stats.totalDecks > 0 ? 12 : 0} icon={FolderOpen} sparklineData={sparklines.decks} />
          <MetricCard title="Total Views" value={stats.totalViews} change={stats.totalViews > 0 ? 24 : 0} icon={Eye} sparklineData={sparklines.views} />
          <MetricCard title="Avg PIQ Score" value={stats.avgScore} icon={Star} />
          <MetricCard title="Best Score" value={stats.bestScore} icon={Trophy} prefix="" />
        </motion.div>

        {/* PAYG Status */}
        <motion.div variants={fadeInUp}>
          <PaygStatusWidget />
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeInUp}>
          <QuickActions />
        </motion.div>

        {/* Analytics + Activity Feed */}
        <motion.div variants={fadeInUp} className="content-grid">
          <AnalyticsChart data={dailyViews} />
          <ActivityFeed activities={activities} />
        </motion.div>

        {/* Investor Matches */}
        {investors.length > 0 && (
          <motion.div variants={fadeInUp}>
            <InvestorMatches investors={investors} />
          </motion.div>
        )}

        {/* Fundraise + Practice */}
        <motion.div variants={fadeInUp} className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <FundraisePipelineCard pipeline={fundraise} />
          <PitchPractice sessions={practice} />
        </motion.div>

        {/* Deck Grid */}
        {decks.length > 0 && (
          <motion.div variants={fadeInUp}>
            <DeckGrid decks={decks} />
          </motion.div>
        )}

        {/* AB Tests */}
        {abTests.length > 0 && (
          <motion.div variants={fadeInUp}>
            <ABTesting tests={abTests} />
          </motion.div>
        )}

        {/* Upgrade CTA */}
        {user.plan !== "growth" && user.plan !== "enterprise" && (
          <motion.div variants={fadeInUp}>
            <UpgradeCta />
          </motion.div>
        )}
      </motion.div>
    </AppShellV2>
  );
}
