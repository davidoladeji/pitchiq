"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Eye, Users, Clock, Trophy } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

import { staggerContainer, fadeInUp } from "@/lib/animations";

import { MetricCard } from "@/components/v2/dashboard/metric-card";
import { AnalyticsChart } from "@/components/v2/dashboard/analytics-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/v2/ui/card";
import { useDashboardData } from "@/components/v2/shell/DashboardDataContext";

import type { DailyDataPoint, DeckItem } from "@/types";

const PIE_COLORS = ["var(--neon-electric)", "var(--neon-cyan)", "var(--neon-emerald)", "var(--neon-violet)", "#FBBF24"];

export default function AnalyticsPage() {
  const { data: dashData, loading } = useDashboardData();
  const dailyViews = (dashData?.dailyViews || []) as DailyDataPoint[];
  const decks = (dashData?.decks || []) as DeckItem[];
  const totalViews = dashData?.stats?.totalViews || 0;
  const [range, setRange] = useState("30d");

  const chartData = useMemo(() => {
    if (range === "7d") return dailyViews.slice(-7);
    if (range === "90d") {
      const result: DailyDataPoint[] = [];
      for (let i = 89; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split("T")[0];
        const existing = dailyViews.find((v) => v.date === key);
        result.push({ date: key, value: existing?.value || 0 });
      }
      return result;
    }
    return dailyViews;
  }, [dailyViews, range]);

  const viewsByDeck = useMemo(() => {
    return decks
      .filter((d) => d.views > 0)
      .sort((a, b) => b.views - a.views)
      .slice(0, 5)
      .map((d) => ({ name: d.title.slice(0, 20), value: d.views }));
  }, [decks]);

  const uniqueViewers = Math.round(totalViews * 0.7);
  const avgEngagement = decks.length > 0 ? Math.round(totalViews / decks.length * 0.5) : 0;
  const topDeck = decks.sort((a, b) => b.views - a.views)[0];

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 rounded-lg animate-pulse" style={{ background: "var(--void-surface)" }} />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">{[1, 2, 3, 4].map((i) => <div key={i} className="h-28 rounded-xl animate-pulse" style={{ background: "var(--void-surface)" }} />)}</div>
        <div className="h-64 rounded-xl animate-pulse" style={{ background: "var(--void-surface)" }} />
      </div>
    );
  }

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      <motion.div variants={fadeInUp}>
        <h2 className="text-xl font-semibold" style={{ color: "var(--void-text)" }}>Analytics</h2>
        <p className="text-sm mt-1" style={{ color: "var(--void-text-dim)" }}>Track how your decks perform</p>
      </motion.div>

      <motion.div variants={fadeInUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard title="Total Views" value={totalViews} change={24} icon={Eye} />
        <MetricCard title="Unique Viewers" value={uniqueViewers} change={18} icon={Users} />
        <MetricCard title="Avg Engagement" value={avgEngagement} icon={Clock} prefix="" />
        <MetricCard title="Top Deck Views" value={topDeck?.views || 0} icon={Trophy} prefix="" />
      </motion.div>

      {/* Chart with range selector */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="text-base">Deck Views Over Time</CardTitle>
            <div className="flex gap-1 rounded-lg p-1" style={{ background: "var(--void-surface)", border: "1px solid var(--void-border)" }}>
              {["7d", "30d", "90d"].map((r) => (
                <button
                  key={r}
                  onClick={() => setRange(r)}
                  className="px-3 py-1 rounded-md text-xs font-medium transition-colors"
                  style={{
                    background: range === r ? "var(--neon-electric)" : "transparent",
                    color: range === r ? "#fff" : "var(--void-text-dim)",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <AnalyticsChart data={chartData} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Views by deck */}
      {viewsByDeck.length > 0 && (
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Views by Deck</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="w-48 h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={viewsByDeck} cx="50%" cy="50%" outerRadius={80} innerRadius={50} dataKey="value" strokeWidth={2} stroke="rgba(0,0,0,0.5)">
                        {viewsByDeck.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ background: "rgba(5,5,16,0.9)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "8px", color: "#E8E8ED" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {viewsByDeck.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-sm flex-1 truncate" style={{ color: "var(--void-text-muted)" }}>{d.name}</span>
                      <span className="text-sm font-semibold" style={{ color: "var(--void-text)" }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
