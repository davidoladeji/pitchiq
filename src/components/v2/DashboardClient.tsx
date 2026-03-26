"use client";

import { DashboardVersionToggle } from "@/components/DashboardVersionToggle";
import AppShellV2 from "./shell/AppShell";
import DashboardOverviewPage from "./pages/dashboard-overview";

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
  userName,
  plan,
}: Props) {
  const recentDecks = [
    { shareId: "demo", title: "My Deck", piqScore: 72 },
  ];

  return (
    <AppShellV2
      userName={userName}
      userPlan={plan}
      breadcrumbs={[{ label: "Dashboard" }]}
      recentDecks={recentDecks}
    >
      <DashboardVersionToggle />
      {/* Render the full mockup dashboard overview */}
      <DashboardOverviewPage />
    </AppShellV2>
  );
}
