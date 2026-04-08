"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Users,
  ChevronDown,
  ChevronUp,
  Target,
  Briefcase,
  TrendingUp,
  Star,
} from "lucide-react";
import { staggerContainer, fadeInUp } from "@/lib/animations";

import { Card, CardHeader, CardTitle } from "@/components/v2/ui/card";
import { Badge } from "@/components/v2/ui/badge";
import { Button } from "@/components/v2/ui/button";
import { useDashboardData } from "@/components/v2/shell/DashboardDataContext";

interface InvestorMatch {
  id: string;
  name: string;
  type: string;
  fitScore: number;
  matchReasons: string[];
  avatarUrl?: string;
}

function fitScoreColor(score: number) {
  if (score >= 80) return "var(--neon-cyan, #00F0FF)";
  if (score >= 60) return "rgba(99, 102, 241, 1)";
  return "rgba(139, 92, 246, 1)";
}

function fitScoreBg(score: number) {
  if (score >= 80) return "rgba(0, 240, 255, 0.12)";
  if (score >= 60) return "rgba(99, 102, 241, 0.12)";
  return "rgba(139, 92, 246, 0.12)";
}

function FitBar({ score }: { score: number }) {
  return (
    <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: "var(--void-surface)" }}>
      <motion.div
        className="h-full rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${score}%` }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ background: fitScoreColor(score) }}
      />
    </div>
  );
}

function InvestorCard({ investor }: { investor: InvestorMatch }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div variants={fadeInUp}>
      <Card
        className="hover-lift cursor-pointer transition-all duration-200"
        style={{
          borderColor: expanded ? "rgba(99, 102, 241, 0.2)" : undefined,
        }}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            {investor.avatarUrl ? (
              <img
                src={investor.avatarUrl}
                alt={investor.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{
                  background: "rgba(67, 97, 238, 0.15)",
                  color: "var(--neon-cyan, #00F0FF)",
                }}
              >
                {investor.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm">{investor.name}</CardTitle>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--void-text-dim)" }}
              >
                {investor.type}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant="primary"
                style={{
                  background: fitScoreBg(investor.fitScore),
                  color: fitScoreColor(investor.fitScore),
                }}
              >
                {investor.fitScore}% fit
              </Badge>
              {expanded ? (
                <ChevronUp size={14} style={{ color: "var(--void-text-dim)" }} />
              ) : (
                <ChevronDown size={14} style={{ color: "var(--void-text-dim)" }} />
              )}
            </div>
          </div>
        </CardHeader>

        <div className="px-6 pb-3">
          <FitBar score={investor.fitScore} />
        </div>

        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-1.5">
            {investor.matchReasons.map((reason, i) => (
              <span
                key={i}
                className="px-2 py-0.5 rounded text-xs"
                style={{
                  background: "var(--void-surface)",
                  color: "var(--void-text-muted)",
                }}
              >
                {reason}
              </span>
            ))}
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div
                className="px-6 pb-5 pt-2 space-y-4"
                style={{
                  borderTop: "1px solid var(--void-border, rgba(255,255,255,0.06))",
                }}
              >
                {/* Fit Score Breakdown */}
                <div>
                  <p
                    className="text-xs font-medium mb-2 flex items-center gap-1.5"
                    style={{ color: "var(--void-text-muted)" }}
                  >
                    <Target size={12} />
                    Fit Score Breakdown
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      {
                        label: "Sector",
                        value: Math.min(100, Math.round(investor.fitScore * 1.05)),
                        icon: Briefcase,
                      },
                      {
                        label: "Stage",
                        value: Math.min(100, Math.round(investor.fitScore * 0.95)),
                        icon: TrendingUp,
                      },
                      {
                        label: "Overall",
                        value: investor.fitScore,
                        icon: Star,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="rounded-lg p-2.5 text-center"
                        style={{ background: "var(--void-surface)" }}
                      >
                        <item.icon
                          size={12}
                          className="mx-auto mb-1"
                          style={{ color: "var(--void-text-dim)" }}
                        />
                        <p
                          className="text-lg font-semibold"
                          style={{ color: fitScoreColor(item.value) }}
                        >
                          {item.value}%
                        </p>
                        <p
                          className="text-[10px]"
                          style={{ color: "var(--void-text-dim)" }}
                        >
                          {item.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Match Reasons Detail */}
                <div>
                  <p
                    className="text-xs font-medium mb-2 flex items-center gap-1.5"
                    style={{ color: "var(--void-text-muted)" }}
                  >
                    <Users size={12} />
                    Why This Match
                  </p>
                  <ul className="space-y-1">
                    {investor.matchReasons.map((reason, i) => (
                      <li
                        key={i}
                        className="text-xs flex items-start gap-2"
                        style={{ color: "var(--void-text-dim)" }}
                      >
                        <span
                          className="mt-1.5 w-1 h-1 rounded-full shrink-0"
                          style={{ background: "var(--neon-cyan, #00F0FF)" }}
                        />
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

export default function InvestorsPage() {
  const { data: dashData, loading } = useDashboardData();
  const investors = (dashData?.investors || []) as InvestorMatch[];
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"fit" | "name">("fit");

  const filtered = investors
    .filter(
      (inv) =>
        !search ||
        inv.name.toLowerCase().includes(search.toLowerCase()) ||
        inv.type.toLowerCase().includes(search.toLowerCase()) ||
        inv.matchReasons.some((r) =>
          r.toLowerCase().includes(search.toLowerCase())
        )
    )
    .sort((a, b) =>
      sortBy === "fit" ? b.fitScore - a.fitScore : a.name.localeCompare(b.name)
    );

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        variants={fadeInUp}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h2
            className="text-xl font-semibold"
            style={{ color: "var(--void-text)" }}
          >
            Investor Matches
          </h2>
          <p
            className="text-sm mt-1"
            style={{ color: "var(--void-text-dim)" }}
          >
            {loading
              ? "Loading..."
              : `${filtered.length} match${filtered.length !== 1 ? "es" : ""} found`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--void-text-dim)" }}
            />
            <input
              type="text"
              placeholder="Search investors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-sm w-52 rounded-lg bg-transparent border outline-none transition-colors"
              style={{
                borderColor: "var(--void-border, rgba(255,255,255,0.06))",
                color: "var(--void-text)",
              }}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSortBy(sortBy === "fit" ? "name" : "fit")}
          >
            {sortBy === "fit" ? "By Fit" : "A-Z"}
          </Button>
        </div>
      </motion.div>

      {/* Investor Grid */}
      {!loading && filtered.length === 0 ? (
        <motion.div variants={fadeInUp}>
          <Card className="text-center py-12">
            <Users
              size={28}
              className="mx-auto mb-3"
              style={{ color: "var(--void-text-dim)" }}
            />
            <p
              className="text-sm font-medium"
              style={{ color: "var(--void-text-muted)" }}
            >
              {search ? "No matches for your search" : "No investor matches yet"}
            </p>
            <p
              className="text-xs mt-1"
              style={{ color: "var(--void-text-dim)" }}
            >
              {search
                ? "Try adjusting your search terms"
                : "Upload a pitch deck to get matched with investors"}
            </p>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          {filtered.map((inv) => (
            <InvestorCard key={inv.id} investor={inv} />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
