"use client";

import { useState, useEffect } from "react";
import { useDashboardTab } from "./DashboardTabContext";

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
/*  Tab Renderer — keeps visited pages mounted, shows active via CSS   */
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
  const { activeTab } = useDashboardTab();
  const [visited, setVisited] = useState<Set<string>>(() => new Set([activeTab]));

  // When active tab changes, add to visited set (lazy mount)
  useEffect(() => {
    setVisited((prev) => {
      if (prev.has(activeTab)) return prev;
      return new Set(prev).add(activeTab);
    });
  }, [activeTab]);

  return (
    <>
      {TABS.map(({ key, Component }) => {
        if (!visited.has(key)) return null;
        return (
          <div
            key={key}
            style={{ display: activeTab === key ? "block" : "none" }}
          >
            <Component />
          </div>
        );
      })}
    </>
  );
}
