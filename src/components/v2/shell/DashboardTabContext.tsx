"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Dashboard Tab Context — instant tab switching via pushState        */
/* ------------------------------------------------------------------ */

const TAB_TO_PATH: Record<string, string> = {
  dashboard: "/dashboard",
  decks: "/dashboard/decks",
  analytics: "/dashboard/analytics",
  "investor-match": "/dashboard/investor-match",
  "investor-crm": "/dashboard/investor-crm",
  practice: "/dashboard/practice",
  "ab-tests": "/dashboard/ab-tests",
  credits: "/dashboard/credits",
  "startup-profile": "/dashboard/startup-profile",
};

const PATH_TO_TAB: Record<string, string> = {};
for (const [tab, path] of Object.entries(TAB_TO_PATH)) {
  PATH_TO_TAB[path] = tab;
}

/** Resolve a pathname to a tab key, defaulting to "dashboard" */
function pathToTab(pathname: string): string {
  // Exact match first
  if (PATH_TO_TAB[pathname]) return PATH_TO_TAB[pathname];
  // Try stripping trailing slash
  const clean = pathname.replace(/\/$/, "");
  if (PATH_TO_TAB[clean]) return PATH_TO_TAB[clean];
  return "dashboard";
}

interface DashboardTabContextValue {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const DashboardTabContext = createContext<DashboardTabContextValue | null>(null);

export function DashboardTabProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTabState] = useState(() => {
    if (typeof window !== "undefined") {
      return pathToTab(window.location.pathname);
    }
    return "dashboard";
  });

  const setActiveTab = useCallback((tab: string) => {
    setActiveTabState(tab);
    const path = TAB_TO_PATH[tab] || "/dashboard";
    if (window.location.pathname !== path) {
      window.history.pushState({ tab }, "", path);
    }
  }, []);

  // Handle browser back/forward
  useEffect(() => {
    const onPopState = () => {
      setActiveTabState(pathToTab(window.location.pathname));
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  return (
    <DashboardTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </DashboardTabContext.Provider>
  );
}

/** Returns the tab context, or null when outside DashboardTabProvider */
export function useDashboardTab() {
  return useContext(DashboardTabContext);
}

/** Returns the tab context — throws if used outside DashboardTabProvider */
export function useDashboardTabRequired() {
  const ctx = useContext(DashboardTabContext);
  if (!ctx) throw new Error("useDashboardTabRequired must be used inside DashboardTabProvider");
  return ctx;
}

export { TAB_TO_PATH };
