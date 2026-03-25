"use client";

import { DashboardVersionToggle } from "@/components/DashboardVersionToggle";
import AppShellV2 from "./shell/AppShell";
import { WelcomeHeader } from "./dashboard/WelcomeHeader";
import { DeckGrid } from "./dashboard/DeckGrid";
import { QuickActions } from "./dashboard/QuickActions";

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

interface Activity {
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
  activities: Activity[];
  hasProfile: boolean;
  profileCount: number;
}

export default function DashboardNew({
  decks,
  userName,
  plan,
  activities,
  hasProfile,
}: Props) {
  const totalViews = decks.reduce((sum, d) => sum + d.viewCount, 0);
  const avgScore = (() => {
    const scored = decks.filter((d) => {
      try { return JSON.parse(d.piqScore)?.overall; } catch { return false; }
    });
    if (scored.length === 0) return 0;
    return Math.round(scored.reduce((sum, d) => {
      try { return sum + JSON.parse(d.piqScore).overall; } catch { return sum; }
    }, 0) / scored.length);
  })();

  return (
    <AppShellV2 userName={userName} userPlan={plan} breadcrumbs={[{ label: "Dashboard" }]}>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Version toggle banner */}
        <DashboardVersionToggle />

        {/* Welcome header with stats */}
        <WelcomeHeader
          userName={userName}
          plan={plan}
          deckCount={decks.length}
          totalViews={totalViews}
          avgScore={avgScore}
          hasProfile={hasProfile}
        />

        {/* Quick actions */}
        <QuickActions plan={plan} />

        {/* Deck grid */}
        <DeckGrid decks={decks} activities={activities} />
      </div>
    </AppShellV2>
  );
}
