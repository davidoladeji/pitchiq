"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface DeckView {
  shareId: string;
  title: string;
  views: number;
  totalTime: number;
}

interface Investor {
  viewerId: string;
  totalViews: number;
  totalTime: number;
  lastSeen: string;
  decksViewed: DeckView[];
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}

function getEngagementLevel(totalTime: number): { label: string; color: string } {
  if (totalTime >= 300) return { label: "High", color: "text-green-600 bg-green-50" };
  if (totalTime >= 60) return { label: "Medium", color: "text-amber-600 bg-amber-50" };
  return { label: "Low", color: "text-navy-400 bg-navy-50" };
}

export default function DashboardInvestorCRM({ plan }: { plan: string }) {
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const isGrowth = plan === "growth" || plan === "enterprise";

  useEffect(() => {
    if (!isGrowth) {
      setLoading(false);
      return;
    }

    async function fetchInvestors() {
      try {
        const res = await fetch("/api/dashboard/investors");
        if (res.ok) {
          const data = await res.json();
          setInvestors(data.investors || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchInvestors();
  }, [isGrowth]);

  if (!isGrowth) return null;

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
          <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </div>
        <div>
          <h3 className="font-bold text-navy text-sm">Investor CRM</h3>
          <p className="text-[10px] text-navy-400">Viewer engagement insights</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-navy-50 animate-pulse motion-reduce:animate-none" />
          ))}
        </div>
      ) : investors.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-xs text-navy-400">
            No viewer data yet. Share your decks to start tracking engagement.
          </p>
        </div>
      ) : (
        <div className="space-y-1.5">
          {/* Header */}
          <div className="grid grid-cols-12 gap-2 px-3 py-1 text-[10px] font-semibold text-navy-400 uppercase tracking-wide">
            <div className="col-span-3">Viewer</div>
            <div className="col-span-2 text-center">Views</div>
            <div className="col-span-2 text-center">Time</div>
            <div className="col-span-2 text-center">Engagement</div>
            <div className="col-span-3 text-right">Last Active</div>
          </div>

          {investors.map((investor) => {
            const engagement = getEngagementLevel(investor.totalTime);
            const isExpanded = expanded === investor.viewerId;

            return (
              <div key={investor.viewerId}>
                <button
                  type="button"
                  onClick={() => setExpanded(isExpanded ? null : investor.viewerId)}
                  className="w-full grid grid-cols-12 gap-2 px-3 py-2.5 rounded-xl hover:bg-navy-50/50 transition-colors text-left"
                >
                  <div className="col-span-3 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-navy-100 flex items-center justify-center shrink-0">
                      <span className="text-[9px] font-bold text-navy-400">
                        #{investor.viewerId.slice(0, 4)}
                      </span>
                    </div>
                    <span className="text-xs font-mono text-navy truncate">
                      {investor.viewerId.slice(0, 8)}
                    </span>
                  </div>
                  <div className="col-span-2 text-center text-xs font-semibold text-navy">
                    {investor.totalViews}
                  </div>
                  <div className="col-span-2 text-center text-xs text-navy-600">
                    {formatTime(investor.totalTime)}
                  </div>
                  <div className="col-span-2 flex justify-center">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${engagement.color}`}>
                      {engagement.label}
                    </span>
                  </div>
                  <div className="col-span-3 text-right text-[11px] text-navy-400">
                    {new Date(investor.lastSeen).toLocaleDateString()}
                  </div>
                </button>

                {/* Expanded: per-deck breakdown */}
                {isExpanded && investor.decksViewed.length > 0 && (
                  <div className="ml-8 mr-3 mb-2 rounded-lg bg-navy-50/50 border border-navy-100 p-3 space-y-1.5">
                    <p className="text-[10px] font-semibold text-navy-400 mb-1.5">Decks viewed:</p>
                    {investor.decksViewed.map((deck) => (
                      <div key={deck.shareId} className="flex items-center justify-between text-[11px]">
                        <Link
                          href={`/deck/${deck.shareId}`}
                          className="text-electric hover:underline font-medium truncate max-w-[60%]"
                        >
                          {deck.title}
                        </Link>
                        <span className="text-navy-400 shrink-0">
                          {deck.views} view{deck.views !== 1 ? "s" : ""} · {formatTime(deck.totalTime)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
