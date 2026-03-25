"use client";

import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { AnimatedNumber } from "../shared/AnimatedNumber";
import { BarChart3, Eye, Target } from "lucide-react";

interface Props {
  userName: string;
  plan: string;
  deckCount: number;
  totalViews: number;
  avgScore: number;
  hasProfile: boolean;
}

export function WelcomeHeader({ userName, plan, deckCount, totalViews, avgScore, hasProfile }: Props) {
  // Dynamic insight line
  const insight = (() => {
    if (deckCount === 0) return "Create your first pitch deck to get started";
    if (totalViews === 0) return "Share your deck link to start getting views";
    if (avgScore >= 80) return `Your average PIQ score is ${avgScore} \u2014 top tier`;
    return `Your decks have ${totalViews} total views`;
  })();

  const firstName = userName.split(" ")[0] || userName;
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl font-bold text-navy dark:text-white">
            {greeting}, {firstName}
          </h1>
          <Badge variant="electric" size="md">{plan}</Badge>
        </div>
        <p className="text-sm text-navy-500 dark:text-white/50">{insight}</p>
      </div>

      {/* Stat pills */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-electric/10 flex items-center justify-center">
              <Target size={16} className="text-electric" />
            </div>
            <span className="text-xs text-navy-400 dark:text-white/40">Avg PIQ Score</span>
          </div>
          <div className="text-2xl font-bold text-navy dark:text-white">
            <AnimatedNumber value={avgScore} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-violet/10 flex items-center justify-center">
              <Eye size={16} className="text-violet-500" />
            </div>
            <span className="text-xs text-navy-400 dark:text-white/40">Total Views</span>
          </div>
          <div className="text-2xl font-bold text-navy dark:text-white">
            <AnimatedNumber value={totalViews} />
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <BarChart3 size={16} className="text-emerald-500" />
            </div>
            <span className="text-xs text-navy-400 dark:text-white/40">Decks</span>
          </div>
          <div className="text-2xl font-bold text-navy dark:text-white">
            <AnimatedNumber value={deckCount} />
          </div>
        </Card>
      </div>

      {/* Profile nudge */}
      {!hasProfile && deckCount > 0 && (
        <Card className="p-3 px-4 flex items-center justify-between">
          <p className="text-sm text-navy-500 dark:text-white/60">
            Complete your Startup Profile to unlock investor matching
          </p>
          <a
            href="/startup-profile"
            className="shrink-0 px-3 py-1.5 rounded-lg bg-electric text-white text-xs font-semibold hover:bg-electric-600 transition-colors"
          >
            Set Up
          </a>
        </Card>
      )}
    </div>
  );
}
