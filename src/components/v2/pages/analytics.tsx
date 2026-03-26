"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Eye, Users, Clock, Trophy } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";


import { staggerContainer, fadeInUp } from "@/lib/animations";
import {
  mockAnalytics,
  mockAnalytics7d,
  mockAnalytics90d,
  mockAnalyticsDetail,
  mockStats,
} from "@/lib/mock-data";

import { Badge } from "@/components/v2/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/v2/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/v2/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/v2/ui/table";
import { MetricCard } from "@/components/v2/dashboard/metric-card";
import { AnalyticsChart } from "@/components/v2/dashboard/analytics-chart";

const DONUT_COLORS = ["#7c3aed", "#a78bfa", "#c4b5fd", "#e879f9"];

type Period = "7d" | "30d" | "90d";

const periodTitles: Record<Period, string> = {
  "7d": "Views - Last 7 Days",
  "30d": "Views - Last 30 Days",
  "90d": "Views - Last 90 Days",
};

export default function AnalyticsPage() {
  const [period, setPeriod] = useState<Period>("30d");

  const chartData = useMemo(() => {
    if (period === "7d") return mockAnalytics7d.dailyViews;
    if (period === "90d") return mockAnalytics90d.dailyViews;
    return mockAnalytics.dailyViews;
  }, [period]);

  const sortedViewsByDeck = useMemo(
    () =>
      [...mockAnalyticsDetail.viewsByDeck].sort((a, b) => b.views - a.views),
    []
  );

  const maxViews = useMemo(
    () => Math.max(...sortedViewsByDeck.map((d) => d.views)),
    [sortedViewsByDeck]
  );

  const donutData = mockAnalyticsDetail.trafficSources.map((s) => ({
    name: s.source,
    value: s.count,
  }));

  // Top decks for engagement table — derive from viewsByDeck
  const topDecks = sortedViewsByDeck.map((d) => ({
    title: d.deckTitle,
    views: d.views,
    avgTime: d.views > 100 ? "5.2 min" : d.views > 50 ? "3.8 min" : "2.1 min",
    level: d.views > 100 ? "High" : d.views > 50 ? "Medium" : ("Low" as string),
  }));

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold text-neutral-900">Analytics</h1>
      </motion.div>

      {/* Date range tabs */}
      <motion.div variants={fadeInUp}>
        <Tabs defaultValue="30d">
          <TabsList>
            <TabsTrigger value="7d" onClick={() => setPeriod("7d")}>
              7 Days
            </TabsTrigger>
            <TabsTrigger value="30d" onClick={() => setPeriod("30d")}>
              30 Days
            </TabsTrigger>
            <TabsTrigger value="90d" onClick={() => setPeriod("90d")}>
              90 Days
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </motion.div>

      {/* Metric row */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={fadeInUp}>
          <MetricCard
            title="Total Views"
            value={mockStats.totalViews}
            icon={Eye}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <MetricCard
            title="Unique Viewers"
            value={mockAnalyticsDetail.uniqueViewers}
            icon={Users}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <MetricCard
            title="Avg Engagement"
            value={`${mockAnalyticsDetail.avgEngagementMinutes} min`}
            icon={Clock}
          />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <MetricCard
            title="Top Deck"
            value={mockAnalyticsDetail.topDeckTitle}
            icon={Trophy}
          />
        </motion.div>
      </motion.div>

      {/* Main chart */}
      <motion.div variants={fadeInUp}>
        <AnalyticsChart data={chartData} title={periodTitles[period]} />
      </motion.div>

      {/* Two-column grid */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        {/* Views by Deck */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle>Views by Deck</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sortedViewsByDeck.map((deck) => (
                <div key={deck.deckTitle} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-700">
                      {deck.deckTitle}
                    </span>
                    <span className="text-sm font-medium text-neutral-900">
                      {deck.views}
                    </span>
                  </div>
                  <div className="h-6 w-full rounded bg-neutral-100">
                    <div
                      className="h-6 rounded bg-primary-500 transition-all duration-500"
                      style={{
                        width: `${(deck.views / maxViews) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Traffic Sources */}
        <motion.div variants={fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <ResponsiveContainer width={220} height={220}>
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {donutData.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={DONUT_COLORS[idx % DONUT_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="mt-4 flex flex-wrap justify-center gap-4">
                {mockAnalyticsDetail.trafficSources.map((source, idx) => (
                  <div key={source.source} className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{
                        backgroundColor:
                          DONUT_COLORS[idx % DONUT_COLORS.length],
                      }}
                    />
                    <span className="text-sm text-neutral-600">
                      {source.source}
                    </span>
                    <span className="text-sm font-medium text-neutral-900">
                      {source.count}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Bottom table */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardHeader>
            <CardTitle>Top Decks by Engagement</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Deck</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Avg Time</TableHead>
                  <TableHead>Engagement Level</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topDecks.map((deck) => (
                  <TableRow key={deck.title}>
                    <TableCell className="font-medium text-neutral-900">
                      {deck.title}
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {deck.views}
                    </TableCell>
                    <TableCell className="text-neutral-600">
                      {deck.avgTime}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          deck.level === "High"
                            ? "success"
                            : deck.level === "Medium"
                              ? "warning"
                              : "default"
                        }
                      >
                        {deck.level}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
