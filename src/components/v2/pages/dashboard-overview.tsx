"use client";

import Link from "next/link";
import {
  FolderOpen, Eye, Star, Trophy, Plus, Target, Lightbulb,
  ArrowUpRight, Clock, TrendingUp, Sparkles,
} from "lucide-react";
import { useDashboardData } from "@/components/v2/shell/DashboardDataContext";
import { useDashboardTab } from "@/components/v2/shell/DashboardTabContext";

import type { DeckItem, ActivityItem, InvestorMatch } from "@/types";

/* ------------------------------------------------------------------ */
/*  Dashboard Overview — summary landing page using shared data        */
/* ------------------------------------------------------------------ */

export default function DashboardOverview() {
  const { data } = useDashboardData();
  const tabCtx = useDashboardTab();

  const stats = data?.stats || { totalDecks: 0, totalViews: 0, avgScore: 0, bestScore: 0, bestDeckTitle: "" };
  const decks = (data?.decks || []) as DeckItem[];
  const activities = (data?.activities || []) as ActivityItem[];
  const investors = (data?.investors || []) as InvestorMatch[];
  const userName = data?.user?.name || "there";

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();
  const firstName = (userName).split(" ")[0];

  const goTab = (tab: string, e: React.MouseEvent) => {
    if (tabCtx) {
      e.preventDefault();
      tabCtx.setActiveTab(tab);
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Hero Greeting ── */}
      <div>
        <h1 className="text-3xl lg:text-4xl font-bold tracking-tight" style={{ color: "var(--void-text)" }}>
          {greeting}, {firstName}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--void-text-dim)" }}>
          {stats.totalDecks > 0
            ? `${stats.totalViews} views across ${stats.totalDecks} decks`
            : "Create your first deck to get started"
          }
        </p>
      </div>

      {/* ── Telemetry Orbs (metric cards) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <TelemetryOrb label="Decks" value={stats.totalDecks} icon={FolderOpen} color="var(--neon-electric)" />
        <TelemetryOrb label="Total Views" value={stats.totalViews} icon={Eye} color="var(--neon-cyan)" />
        <TelemetryOrb label="Avg PIQ" value={stats.avgScore} icon={Star} color="var(--neon-violet)" suffix="/100" />
        <TelemetryOrb label="Best Score" value={stats.bestScore} icon={Trophy} color="var(--neon-emerald)" suffix="/100" />
      </div>

      {/* ── Quick Launch ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <QuickAction icon={Plus} label="New Deck" href="/create" />
        <QuickAction icon={Target} label="Score Deck" href="/score" tab="score" onTab={goTab} />
        <QuickAction icon={Lightbulb} label="Ideas" href="/ideas" tab="ideas" onTab={goTab} />
        <QuickAction icon={TrendingUp} label="Investors" href="/dashboard/investor-match" tab="investor-match" onTab={goTab} />
      </div>

      {/* ── Deck Grid + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Deck grid */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "var(--void-text)" }}>Your Decks</h2>
            <a href="/dashboard/decks" onClick={(e) => goTab("decks", e)} className="text-xs hover:underline" style={{ color: "var(--neon-cyan)" }}>View all →</a>
          </div>

          {decks.length === 0 ? (
            <div className="void-card p-12 text-center">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center orb-breathe" style={{ background: "rgba(var(--neon-electric-rgb), 0.1)", border: "1px solid rgba(var(--neon-electric-rgb), 0.2)" }}>
                <Sparkles size={24} style={{ color: "var(--neon-electric)" }} />
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--void-text)" }}>Launch your first deck</p>
              <p className="text-xs mt-1 mb-4" style={{ color: "var(--void-text-dim)" }}>AI will research your market and build an investor-ready deck</p>
              <Link href="/create" className="inline-block px-5 py-2.5 rounded-xl text-white text-xs font-semibold transition-all hover:-translate-y-0.5" style={{ background: "var(--neon-electric)", boxShadow: "0 4px 20px rgba(var(--neon-electric-rgb), 0.3)" }}>
                Create Deck
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {decks.slice(0, 6).map((deck) => (
                <DeckCard key={deck.id} deck={deck} />
              ))}
            </div>
          )}
        </div>

        {/* Activity feed */}
        <div>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "var(--void-text)" }}>Activity</h2>
          <div className="void-card p-4 space-y-0">
            {activities.length === 0 ? (
              <div className="py-8 text-center">
                <Clock size={20} className="mx-auto mb-2" style={{ color: "var(--void-text-dim)" }} />
                <p className="text-xs" style={{ color: "var(--void-text-dim)" }}>Activity appears as you create and share decks</p>
              </div>
            ) : (
              activities.slice(0, 8).map((a, i) => (
                <div key={a.id || i} className="flex items-start gap-3 py-2.5" style={{ borderBottom: "1px solid var(--void-border)" }}>
                  <Eye size={14} className="mt-0.5 shrink-0" style={{ color: "var(--void-text-dim)" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate" style={{ color: "var(--void-text-muted)" }}>{a.message}</p>
                    <p className="text-[10px]" style={{ color: "var(--void-text-dim)" }}>{timeAgo(a.timestamp)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Investor matches preview */}
          {investors.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold" style={{ color: "var(--void-text)" }}>Investor Matches</h2>
                <a href="/dashboard/investor-match" onClick={(e) => goTab("investor-match", e)} className="text-[10px]" style={{ color: "var(--neon-cyan)" }}>View all →</a>
              </div>
              <div className="space-y-2">
                {investors.slice(0, 3).map((inv) => (
                  <div key={inv.id} className="void-card p-3 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: "rgba(var(--neon-cyan-rgb), 0.1)", color: "var(--neon-cyan)" }}>
                      {inv.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate" style={{ color: "var(--void-text)" }}>{inv.name}</p>
                      <p className="text-[10px]" style={{ color: "var(--void-text-dim)" }}>{inv.type}</p>
                    </div>
                    <span className="text-[10px] font-bold" style={{ color: inv.fitScore >= 80 ? "var(--neon-emerald)" : "var(--neon-cyan)" }}>
                      {inv.fitScore}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function TelemetryOrb({ label, value, icon: Icon, color, suffix }: {
  label: string; value: number; icon: React.ElementType; color: string; suffix?: string;
}) {
  return (
    <div className="void-card p-4 flex items-center gap-3 group">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: `${color}15`, border: `1px solid ${color}25` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight" style={{ color: "var(--void-text)" }}>
          {value}{suffix && <span className="text-xs font-normal" style={{ color: "var(--void-text-dim)" }}>{suffix}</span>}
        </p>
        <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: "var(--void-text-dim)" }}>{label}</p>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, href, tab, onTab }: {
  icon: React.ElementType; label: string; href: string; tab?: string; onTab?: (tab: string, e: React.MouseEvent) => void;
}) {
  const handleClick = (e: React.MouseEvent) => {
    if (tab && onTab) onTab(tab, e);
  };

  if (tab && onTab) {
    return (
      <a href={href} onClick={handleClick} className="void-card p-3 flex items-center gap-2.5 group hover:border-white/[0.12]">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-105" style={{ background: "rgba(67,97,238,0.1)", border: "1px solid rgba(67,97,238,0.2)" }}>
          <Icon size={16} style={{ color: "var(--neon-electric)" }} />
        </div>
        <span className="text-xs font-medium" style={{ color: "var(--void-text-muted)" }}>{label}</span>
        <ArrowUpRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--void-text-dim)" }} />
      </a>
    );
  }

  return (
    <Link href={href} className="void-card p-3 flex items-center gap-2.5 group hover:border-white/[0.12]">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:scale-105" style={{ background: "rgba(67,97,238,0.1)", border: "1px solid rgba(67,97,238,0.2)" }}>
        <Icon size={16} style={{ color: "var(--neon-electric)" }} />
      </div>
      <span className="text-xs font-medium" style={{ color: "var(--void-text-muted)" }}>{label}</span>
      <ArrowUpRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: "var(--void-text-dim)" }} />
    </Link>
  );
}

/** Safely extract a numeric score — handles object {score, feedback} or raw number */
function safeScore(val: unknown): number {
  if (typeof val === "number") return val;
  if (val && typeof val === "object" && "score" in val) return Number((val as { score: unknown }).score) || 0;
  return Number(val) || 0;
}

function DeckCard({ deck }: { deck: DeckItem }) {
  const score = safeScore(deck.score);
  const scoreColor = score >= 90 ? "var(--neon-emerald)" : score >= 70 ? "var(--neon-cyan)" : score >= 50 ? "#FBBF24" : "#F87171";
  return (
    <Link href={`/deck/${deck.id}`} className="void-card p-4 group block">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: "var(--void-text)" }}>{deck.title}</p>
          <p className="text-[10px] mt-0.5" style={{ color: "var(--void-text-dim)" }}>
            {deck.companyName}
          </p>
        </div>
        {score > 0 && (
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ml-2" style={{ border: `2px solid ${scoreColor}`, color: scoreColor, boxShadow: `0 0 12px ${scoreColor}30` }}>
            {score}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 text-[10px]" style={{ color: "var(--void-text-dim)" }}>
        <span className="flex items-center gap-1"><Eye size={10} /> {deck.views}</span>
        <span>{timeAgo(deck.updatedAt)}</span>
      </div>
    </Link>
  );
}

function timeAgo(d: string): string {
  try {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "now";
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  } catch { return ""; }
}
