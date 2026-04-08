"use client";

import { lazy, Suspense, useState, useEffect } from "react";
import { useDashboardTabRequired } from "./DashboardTabContext";

/* ── Lazy page imports — code-split per tab ── */
const DashboardOverviewPage = lazy(() => import("@/components/v2/pages/dashboard-overview"));
const DecksPage = lazy(() => import("@/components/v2/pages/decks"));
const AnalyticsPage = lazy(() => import("@/components/v2/pages/analytics"));
const InvestorsPage = lazy(() => import("@/components/v2/pages/investors"));
const FundraisePage = lazy(() => import("@/components/v2/pages/fundraise"));
const PracticePage = lazy(() => import("@/components/v2/pages/practice"));
const ABTestsPage = lazy(() => import("@/components/v2/pages/ab-tests"));
const CreditsPage = lazy(() => import("@/components/v2/pages/credits"));

/* ------------------------------------------------------------------ */
/*  Tab Renderer — lazy-mount pattern                                  */
/*  Only loads a tab's JS bundle when first visited. Keeps visited     */
/*  tabs mounted (display:none) so state is preserved on switch.       */
/*  Note: /score and /ideas are standalone routes (not dashboard tabs) */
/*  because they import server-only modules (e.g. @anthropic-ai/sdk). */
/* ------------------------------------------------------------------ */

const TABS: { key: string; Component: React.LazyExoticComponent<React.ComponentType> }[] = [
  { key: "dashboard", Component: DashboardOverviewPage },
  { key: "decks", Component: DecksPage },
  { key: "analytics", Component: AnalyticsPage },
  { key: "investor-match", Component: InvestorsPage },
  { key: "investor-crm", Component: FundraisePage },
  { key: "practice", Component: PracticePage },
  { key: "ab-tests", Component: ABTestsPage },
  { key: "credits", Component: CreditsPage },
];

function TabSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-48 rounded-lg" style={{ background: "var(--void-surface)" }} />
      <div className="h-64 rounded-2xl" style={{ background: "var(--void-surface)" }} />
    </div>
  );
}

export default function DashboardTabRenderer() {
  const { activeTab } = useDashboardTabRequired();

  // Track which tabs have been visited — only mount those
  const [visited, setVisited] = useState<Set<string>>(() => new Set([activeTab]));

  useEffect(() => {
    setVisited((prev) => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
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
            <Suspense fallback={<TabSkeleton />}>
              <Component />
            </Suspense>
          </div>
        );
      })}
    </>
  );
}
