"use client";

import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ELECTRIC_HEX, VIOLET_HEX, NAVY_500_HEX } from "@/lib/design-tokens";
import { getPlanLimits } from "@/lib/plan-limits";

interface DailyView {
  date: string;
  count: number;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-navy-800 rounded-xl border border-navy-200 dark:border-white/10 px-3 py-2 shadow-lg">
      <p className="text-xs text-navy-500 dark:text-navy-300 mb-0.5">{label ? formatDate(label) : ""}</p>
      <p className="text-sm font-bold text-navy dark:text-white tabular-nums">
        {payload[0].value} view{payload[0].value !== 1 ? "s" : ""}
      </p>
    </div>
  );
}

export default function DashboardAnalytics({
  dailyViews,
  plan,
  loading = false,
}: {
  dailyViews: DailyView[];
  plan: string;
  loading?: boolean;
}) {
  const isGated = !getPlanLimits(plan).analytics;

  // For gated users, show placeholder data
  const chartData = isGated
    ? Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
        count: Math.floor(Math.random() * 40 + 10),
      }))
    : dailyViews;

  return (
    <section aria-labelledby="dashboard-analytics-heading" className="bg-white dark:bg-navy-800 rounded-2xl border border-navy-200 dark:border-white/10 p-4 sm:p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 id="dashboard-analytics-heading" className="text-sm font-bold text-navy dark:text-white font-display">View Trends</h3>
        <span className="text-xs text-navy-500 dark:text-navy-300">Last 30 days</span>
      </div>

      {loading ? (
        <div className="h-48 flex flex-col items-center justify-center gap-2" role="status">
          <div
            className="w-6 h-6 border-2 border-electric border-t-transparent rounded-full animate-spin motion-reduce:animate-none motion-reduce:border-electric/40 ring-2 ring-electric/10 ring-offset-2 ring-offset-white motion-reduce:ring-0"
            aria-hidden="true"
          />
          <span className="sr-only">Loading view trends</span>
        </div>
      ) : (
        <div className={isGated ? "blur-[6px] select-none pointer-events-none" : ""}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={ELECTRIC_HEX} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={VIOLET_HEX} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 10, fill: NAVY_500_HEX }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: NAVY_500_HEX }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke={ELECTRIC_HEX}
                strokeWidth={2}
                fill="url(#viewGradient)"
                dot={false}
                activeDot={{ r: 4, fill: ELECTRIC_HEX, strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gated overlay */}
      {isGated && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-navy-800/60 backdrop-blur-[2px] rounded-2xl">
          <div className="text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-navy dark:text-white mb-1">Full Analytics</p>
            <p className="text-xs text-navy-500 dark:text-navy-300 mb-3 max-w-[200px] mx-auto">
              Upgrade to Growth for detailed view trends and engagement data.
            </p>
            <Link
              href="/#pricing"
              className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2 rounded-xl bg-electric text-white text-xs font-semibold shadow-lg shadow-electric/25 hover:bg-electric-600 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="Upgrade to Growth for full analytics"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Upgrade to Growth
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}
