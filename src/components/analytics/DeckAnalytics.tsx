"use client";

import { useEffect, useState, useCallback } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsData {
  totalViews: number;
  uniqueViewers: number;
  avgTimeSpent: number;
  completionRate: number;
  dailyViews: { date: string; count: number }[];
  slideEngagement: {
    slideIndex: number;
    avgTime: number;
    views: number;
    revisits: number;
  }[];
  recentViews: {
    id: string;
    totalTime: number;
    createdAt: string;
    slideCount: number;
  }[];
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded bg-white/5 ${className}`}
    />
  );
}

export default function DeckAnalytics({
  shareId,
  onClose,
}: {
  shareId: string;
  onClose: () => void;
}) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/decks/${shareId}/analytics/detailed`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to load analytics");
      }
      const json: AnalyticsData = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="flex h-full flex-col bg-[#0F0F14] text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 className="text-lg font-semibold tracking-tight">
          Deck Analytics
        </h2>
        <button
          onClick={onClose}
          className="rounded p-1.5 text-white/50 transition-colors hover:bg-white/5 hover:text-white"
          aria-label="Close analytics"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M5 5l10 10M15 5L5 15" />
          </svg>
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {loading && <LoadingSkeleton />}

        {!loading && !error && data && data.totalViews === 0 && (
          <EmptyState />
        )}

        {!loading && !error && data && data.totalViews > 0 && (
          <>
            <OverviewCards data={data} />
            <ViewsChart dailyViews={data.dailyViews} />
            <SlideEngagement slides={data.slideEngagement} />
            <RevisitedSlides slides={data.slideEngagement} />
            <RecentViewers views={data.recentViews} />
          </>
        )}
      </div>
    </div>
  );
}

/* ---------- Overview Cards ---------- */

function OverviewCards({ data }: { data: AnalyticsData }) {
  const cards = [
    { label: "Total Views", value: data.totalViews.toLocaleString() },
    { label: "Unique Viewers", value: data.uniqueViewers.toLocaleString() },
    { label: "Avg. Time Spent", value: formatTime(data.avgTimeSpent) },
    { label: "Completion Rate", value: `${data.completionRate}%` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3"
        >
          <p className="text-xs text-white/50">{c.label}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{c.value}</p>
        </div>
      ))}
    </div>
  );
}

/* ---------- Views Over Time Chart ---------- */

function ViewsChart({ dailyViews }: { dailyViews: AnalyticsData["dailyViews"] }) {
  const formatted = dailyViews.map((d) => ({
    ...d,
    label: new Date(d.date + "T00:00:00").toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <section>
      <h3 className="mb-3 text-sm font-medium text-white/70">
        Views Over Time
      </h3>
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={formatted}>
            <defs>
              <linearGradient id="viewsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4361EE" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#4361EE" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize: 10, fill: "rgba(255,255,255,0.4)" }}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip
              contentStyle={{
                background: "#1A1A24",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                fontSize: 12,
                color: "#fff",
              }}
              labelStyle={{ color: "rgba(255,255,255,0.6)" }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#4361EE"
              strokeWidth={2}
              fill="url(#viewsFill)"
              name="Views"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

/* ---------- Slide Engagement Heatmap ---------- */

function SlideEngagement({
  slides,
}: {
  slides: AnalyticsData["slideEngagement"];
}) {
  if (slides.length === 0) return null;

  const maxTime = Math.max(...slides.map((s) => s.avgTime), 1);

  function heatColor(ratio: number): string {
    // Cool (low) to warm (high): blue -> amber
    if (ratio < 0.33) return "bg-blue-500/60";
    if (ratio < 0.66) return "bg-amber-500/60";
    return "bg-orange-500/70";
  }

  return (
    <section>
      <h3 className="mb-3 text-sm font-medium text-white/70">
        Per-Slide Engagement
      </h3>
      <div className="space-y-2">
        {slides.map((s) => {
          const ratio = s.avgTime / maxTime;
          const pct = Math.max(Math.round(ratio * 100), 4);
          return (
            <div key={s.slideIndex} className="flex items-center gap-3">
              <span className="w-16 shrink-0 text-xs text-white/50 tabular-nums">
                Slide {s.slideIndex + 1}
              </span>
              <div className="relative h-5 flex-1 overflow-hidden rounded bg-white/5">
                <div
                  className={`absolute inset-y-0 left-0 rounded ${heatColor(ratio)}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-14 shrink-0 text-right text-xs text-white/40 tabular-nums">
                {formatTime(Math.round(s.avgTime / 1000))}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ---------- Most Re-visited Slides ---------- */

function RevisitedSlides({
  slides,
}: {
  slides: AnalyticsData["slideEngagement"];
}) {
  const revisited = slides
    .filter((s) => s.revisits > 0)
    .sort((a, b) => b.revisits - a.revisits);

  if (revisited.length === 0) return null;

  return (
    <section>
      <h3 className="mb-3 text-sm font-medium text-white/70">
        Most Re-visited Slides
      </h3>
      <div className="rounded-lg border border-white/10 bg-white/[0.03] divide-y divide-white/5">
        {revisited.map((s) => (
          <div
            key={s.slideIndex}
            className="flex items-center justify-between px-4 py-2.5"
          >
            <span className="text-sm text-white/80">
              Slide {s.slideIndex + 1}
            </span>
            <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-white/60 tabular-nums">
              {s.revisits} revisit{s.revisits !== 1 ? "s" : ""}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Recent Viewers ---------- */

function RecentViewers({
  views,
}: {
  views: AnalyticsData["recentViews"];
}) {
  if (views.length === 0) return null;

  return (
    <section>
      <h3 className="mb-3 text-sm font-medium text-white/70">
        Recent Viewers
      </h3>
      <div className="rounded-lg border border-white/10 bg-white/[0.03] divide-y divide-white/5">
        {views.map((v) => (
          <div
            key={v.id}
            className="flex items-center justify-between px-4 py-2.5"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#4361EE]/20 text-xs font-medium text-[#4361EE]">
                {v.slideCount}
              </div>
              <div>
                <p className="text-sm text-white/80">
                  {v.slideCount} slide{v.slideCount !== 1 ? "s" : ""} viewed
                </p>
                <p className="text-xs text-white/40">
                  {formatTime(v.totalTime)} spent
                </p>
              </div>
            </div>
            <span className="text-xs text-white/40">
              {relativeTime(v.createdAt)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Loading Skeleton ---------- */

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3"
          >
            <Skeleton className="h-3 w-16 mb-2" />
            <Skeleton className="h-6 w-12" />
          </div>
        ))}
      </div>
      <div>
        <Skeleton className="h-3 w-24 mb-3" />
        <Skeleton className="h-[180px] w-full rounded-lg" />
      </div>
      <div>
        <Skeleton className="h-3 w-32 mb-3" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-5 w-full mb-2" />
        ))}
      </div>
    </div>
  );
}

/* ---------- Empty State ---------- */

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
        className="mb-4 text-white/10"
      >
        <rect
          x="8"
          y="16"
          width="48"
          height="36"
          rx="4"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M16 40l8-8 6 6 10-12 8 10"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <h3 className="text-base font-medium text-white/60">No views yet</h3>
      <p className="mt-1 max-w-[240px] text-sm text-white/30">
        Share your deck to start seeing engagement analytics here.
      </p>
    </div>
  );
}
