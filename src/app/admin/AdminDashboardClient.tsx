"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AnalyticsData {
  stats: {
    totalUsers: number;
    totalDecks: number;
    totalViews: number;
    totalTransactions: number;
    totalRevenue: number;
    recentUsers: number;
    recentDecks: number;
    recentViews: number;
    userTrend: number;
    deckTrend: number;
  };
  charts: {
    signupsByDay: { date: string; count: number }[];
    decksByDay: { date: string; count: number }[];
  };
  planDistribution: Record<string, number>;
  recentActivity: {
    id: string;
    type: string;
    description: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
  }[];
}

/** Design-system hex tokens for Recharts (API requires hex). Align with tailwind navy/electric/violet/amber. */
const CHART_TOKENS = {
  navy: "#1a1a2e",
  navy500: "#505068",
  electric: "#4361ee",
  violet: "#8B5CF6",
  amber: "#f59e0b",
} as const;

const PLAN_COLORS: Record<string, string> = {
  starter: CHART_TOKENS.navy500,
  pro: CHART_TOKENS.electric,
  growth: CHART_TOKENS.violet,
  enterprise: CHART_TOKENS.amber,
};

const STATUS_COLORS: Record<string, string> = {
  succeeded: "text-emerald-400",
  pending: "text-amber-400",
  failed: "text-red-400",
  refunded: "text-blue-400",
};

export default function AdminDashboardClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/analytics")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load");
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-white/30 mt-1">Loading analytics...</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 animate-pulse">
              <div className="h-3 bg-white/5 rounded w-20 mb-3" />
              <div className="h-8 bg-white/5 rounded w-24" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="rounded-2xl bg-white/[0.03] border border-white/5 p-6 h-72 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 p-6">
          <p className="text-sm text-red-400">{error || "Failed to load analytics"}</p>
        </div>
      </div>
    );
  }

  const { stats, charts, planDistribution, recentActivity } = data;

  const pieData = Object.entries(planDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: PLAN_COLORS[name] || CHART_TOKENS.navy500,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-white/30 mt-1">System overview — last 30 days</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          trend={stats.userTrend}
          trendLabel={`${stats.recentUsers} new`}
          icon="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
          href="/admin/users"
        />
        <StatCard
          label="Total Decks"
          value={stats.totalDecks.toLocaleString()}
          trend={stats.deckTrend}
          trendLabel={`${stats.recentDecks} new`}
          icon="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776"
          href="/admin/decks"
        />
        <StatCard
          label="Total Views"
          value={stats.totalViews.toLocaleString()}
          trend={null}
          trendLabel={`${stats.recentViews} this month`}
          icon="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
        <StatCard
          label="Revenue"
          value={`$${stats.totalRevenue.toLocaleString()}`}
          trend={null}
          trendLabel={`${stats.totalTransactions} transactions`}
          icon="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          href="/admin/transactions"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User signups chart */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6">
          <h3 className="text-sm font-semibold text-white mb-1">User Signups</h3>
          <p className="text-xs text-white/30 mb-4">Last 30 days</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.signupsByDay}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_TOKENS.electric} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_TOKENS.electric} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
                  tickFormatter={(v: string) => v.slice(5)}
                  interval={6}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: CHART_TOKENS.navy,
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: 12,
                  }}
                  labelFormatter={(v) => String(v)}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={CHART_TOKENS.electric}
                  fillOpacity={1}
                  fill="url(#userGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Deck creations chart */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6">
          <h3 className="text-sm font-semibold text-white mb-1">Deck Creations</h3>
          <p className="text-xs text-white/30 mb-4">Last 30 days</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.decksByDay}>
                <defs>
                  <linearGradient id="deckGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={CHART_TOKENS.violet} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={CHART_TOKENS.violet} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
                  tickFormatter={(v: string) => v.slice(5)}
                  interval={6}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "rgba(255,255,255,0.25)", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    background: CHART_TOKENS.navy,
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontSize: 12,
                  }}
                  labelFormatter={(v) => String(v)}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke={CHART_TOKENS.violet}
                  fillOpacity={1}
                  fill="url(#deckGrad)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom row: Plan distribution + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Plan distribution */}
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6">
          <h3 className="text-sm font-semibold text-white mb-1">Plan Distribution</h3>
          <p className="text-xs text-white/30 mb-4">Active users by plan</p>
          {pieData.length > 0 ? (
            <>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: CHART_TOKENS.navy,
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "12px",
                        color: "#fff",
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {pieData.map((entry) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: entry.color }} />
                      <span className="text-xs text-white/60">{entry.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-white/80">{entry.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-white/30 text-center py-8">No user data</p>
          )}
        </div>

        {/* Recent activity */}
        <div className="lg:col-span-2 rounded-2xl bg-white/[0.03] border border-white/5 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Transactions</h3>
              <p className="text-xs text-white/30">Latest payment activity</p>
            </div>
            <Link
              href="/admin/transactions"
              className="text-xs text-electric font-medium hover:text-electric/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 rounded px-1 py-0.5"
            >
              View all
            </Link>
          </div>
          {recentActivity.length > 0 ? (
            <div className="space-y-2">
              {recentActivity.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-white/70 truncate">{item.description}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className="text-sm font-semibold text-white">
                      ${item.amount.toFixed(2)}
                    </p>
                    <p className={`text-[10px] font-semibold uppercase ${STATUS_COLORS[item.status] || "text-white/30"}`}>
                      {item.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-white/30 text-center py-8">No transactions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  trend,
  trendLabel,
  icon,
  href,
}: {
  label: string;
  value: string;
  trend: number | null;
  trendLabel: string;
  icon: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-5 hover:bg-white/[0.05] transition-colors group">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">{label}</p>
        <svg className="w-5 h-5 text-white/15 group-hover:text-white/25 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
        </svg>
      </div>
      <p className="text-2xl font-bold text-white mb-1">{value}</p>
      <div className="flex items-center gap-2">
        {trend !== null && (
          <span className={`text-xs font-semibold ${trend >= 0 ? "text-emerald-400" : "text-red-400"}`}>
            {trend >= 0 ? "+" : ""}{trend}%
          </span>
        )}
        <span className="text-xs text-white/30">{trendLabel}</span>
      </div>
    </div>
  );

  return href ? (
    <Link
      href={href}
      className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 rounded-2xl"
    >
      {content}
    </Link>
  ) : (
    content
  );
}
