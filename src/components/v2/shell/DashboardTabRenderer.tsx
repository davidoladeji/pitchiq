"use client";

import { useDashboardTabRequired } from "./DashboardTabContext";

/* ── Page imports ── */
import DashboardOverviewPage from "@/components/v2/pages/dashboard-overview";
import DecksPage from "@/components/v2/pages/decks";
import AnalyticsPage from "@/components/v2/pages/analytics";
import InvestorsPage from "@/components/v2/pages/investors";
import FundraisePage from "@/components/v2/pages/fundraise";
import PracticePage from "@/components/v2/pages/practice";
import ABTestsPage from "@/components/v2/pages/ab-tests";
import CreditsPage from "@/components/v2/pages/credits";

/* ------------------------------------------------------------------ */
/*  Tab Renderer — ALL pages pre-mounted, active shown via CSS         */
/*  Note: /score and /ideas are standalone routes (not dashboard tabs) */
/*  because they import server-only modules (e.g. @anthropic-ai/sdk). */
/* ------------------------------------------------------------------ */

const TABS: { key: string; Component: React.ComponentType }[] = [
  { key: "dashboard", Component: DashboardOverviewPage },
  { key: "decks", Component: DecksPage },
  { key: "analytics", Component: AnalyticsPage },
  { key: "investor-match", Component: InvestorsPage },
  { key: "investor-crm", Component: FundraisePage },
  { key: "practice", Component: PracticePage },
  { key: "ab-tests", Component: ABTestsPage },
  { key: "credits", Component: CreditsPage },
];

export default function DashboardTabRenderer() {
  const { activeTab } = useDashboardTabRequired();

  return (
    <>
      {TABS.map(({ key, Component }) => (
        <div
          key={key}
          style={{ display: activeTab === key ? "block" : "none" }}
        >
          <Component />
        </div>
      ))}
    </>
  );
}
