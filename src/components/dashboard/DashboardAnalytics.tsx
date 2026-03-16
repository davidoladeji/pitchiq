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
    <div className="bg-white rounded-xl border border-navy-200 px-3 py-2 shadow-lg">
      <p className="text-xs text-navy-500 mb-0.5">{label ? formatDate(label) : ""}</p>
      <p className="text-sm font-bold text-navy tabular-nums">
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
  const isGated = plan !== "growth";

  // For gated users, show placeholder data
  const chartData = isGated
    ? Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 86400000).toISOString().slice(0, 10),
        count: Math.floor(Math.random() * 40 + 10),
      }))
    : dailyViews;

  return (
    <section aria-label="View analytics" className="bg-white rounded-2xl border border-navy-200 p-4 sm:p-6 relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-navy font-display">View Trends</h3>
        <span className="text-xs text-navy-500">Last 30 days</span>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-electric border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        </div>
      ) : (
        <div className={isGated ? "blur-[6px] select-none pointer-events-none" : ""}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="viewGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4361ee" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: "#6b7280" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#4361ee"
                strokeWidth={2}
                fill="url(#viewGradient)"
                dot={false}
                activeDot={{ r: 4, fill: "#4361ee", strokeWidth: 0 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Gated overlay */}
      {isGated && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[2px] rounded-2xl">
          <div className="text-center px-4">
            <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <p className="text-sm font-bold text-navy mb-1">Full Analytics</p>
            <p className="text-xs text-navy-500 mb-3 max-w-[200px] mx-auto">
              Upgrade to Growth for detailed view trends and engagement data.
            </p>
            <Link
              href="/#pricing"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-electric hover:bg-electric-light text-white text-xs font-semibold shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
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
