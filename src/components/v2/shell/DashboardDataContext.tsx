"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

/* ------------------------------------------------------------------ */
/*  Dashboard Data Context — single fetch, shared across all tabs      */
/* ------------------------------------------------------------------ */

export interface DashboardData {
  stats: {
    totalDecks: number;
    totalViews: number;
    avgScore: number;
    bestScore: number;
    bestDeckTitle: string;
  };
  sparklines: { decks: number[]; views: number[] };
  decks: {
    id: string;
    title: string;
    companyName: string;
    score: number;
    views: number;
    theme: string;
    isPremium: boolean;
    createdAt: string;
    updatedAt: string;
  }[];
  activities: {
    id: string;
    type: "view";
    message: string;
    timestamp: string;
    deckId: string;
  }[];
  dailyViews: { date: string; value: number }[];
  investors: {
    id: string;
    name: string;
    type: string;
    fitScore: number;
    matchReasons: string[];
    avatarUrl?: string;
  }[];
  investorContacts: {
    id: string;
    name: string;
    firm: string;
    email: string;
    stage: string;
    notes: string;
    lastUpdated: string;
  }[];
  fundraise: {
    identified: number;
    contacted: number;
    meeting: number;
    dueDiligence: number;
    termSheet: number;
  };
  practice: {
    id: string;
    deckId: string;
    deckTitle: string;
    date: string;
    durationSeconds: number;
    overallScore: number;
    clarity: number;
    pacing: number;
    confidence: number;
  }[];
  abTests: {
    id: string;
    deckId: string;
    deckTitle: string;
    status: "active";
    startedAt: string;
    variantA: { views: number; avgTimeSeconds: number };
    variantB: { views: number; avgTimeSeconds: number };
  }[];
  user: {
    plan: string;
    creditBalance: number;
    name: string;
  };
}

interface DashboardDataContextValue {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const DashboardDataContext = createContext<DashboardDataContextValue>({
  data: null,
  loading: true,
  error: null,
  refetch: () => {},
});

export function DashboardDataProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchedRef = useRef(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);
    fetch("/api/v2/dashboard")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load dashboard");
        return r.json();
      })
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true;
      fetchData();
    }
  }, [fetchData]);

  return (
    <DashboardDataContext.Provider value={{ data, loading, error, refetch: fetchData }}>
      {children}
    </DashboardDataContext.Provider>
  );
}

export function useDashboardData() {
  return useContext(DashboardDataContext);
}
