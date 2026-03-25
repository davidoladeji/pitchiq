"use client";

import Link from "next/link";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/EmptyState";
import { Layers, Eye, Pencil, Share2, MoreHorizontal } from "lucide-react";

interface DeckSummary {
  id: string;
  shareId: string;
  title: string;
  companyName: string;
  themeId: string;
  piqScore: string;
  isPremium: boolean;
  createdAt: string;
  viewCount: number;
  industry: string;
  stage: string;
  fundingTarget: string;
  investorType: string;
}

interface Activity {
  type: "view" | "created" | "scored";
  title: string;
  deckTitle: string;
  time: string;
}

interface Props {
  decks: DeckSummary[];
  activities: Activity[];
}

function getScore(piqScore: string): number | null {
  try {
    const parsed = JSON.parse(piqScore);
    return typeof parsed.overall === "number" ? parsed.overall : null;
  } catch { return null; }
}

function getScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-500";
  if (score >= 60) return "text-amber-500";
  return "text-red-500";
}

function getScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500/10";
  if (score >= 60) return "bg-amber-500/10";
  return "bg-red-500/10";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function DeckGrid({ decks, activities }: Props) {
  if (decks.length === 0) {
    return (
      <EmptyState
        icon={<Layers size={28} />}
        title="Create your first pitch deck"
        description="PitchIQ's AI will analyze your company and build an investor-ready deck in minutes."
        actionLabel="Create Deck"
        actionHref="/create"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Deck cards — 2/3 width on desktop */}
      <div className="lg:col-span-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-navy dark:text-white">My Decks</h2>
          <span className="text-xs text-navy-400 dark:text-white/40">{decks.length} total</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {decks.map((deck) => {
            const score = getScore(deck.piqScore);
            return (
              <Card key={deck.id} interactive className="group overflow-hidden">
                {/* Slide thumbnail placeholder */}
                <div className="aspect-video bg-[var(--surface-2)] relative">
                  <div className="absolute inset-0 flex items-center justify-center text-navy-300 dark:text-white/20">
                    <Layers size={32} />
                  </div>
                  {/* Hover actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                    <Link
                      href={`/editor/${deck.shareId}`}
                      className="w-9 h-9 rounded-xl bg-white/90 flex items-center justify-center text-navy hover:bg-white transition-colors"
                      aria-label="Edit deck"
                    >
                      <Pencil size={16} />
                    </Link>
                    <button
                      className="w-9 h-9 rounded-xl bg-white/90 flex items-center justify-center text-navy hover:bg-white transition-colors"
                      aria-label="Share deck"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.clipboard.writeText(`${window.location.origin}/deck/${deck.shareId}`);
                      }}
                    >
                      <Share2 size={16} />
                    </button>
                    <button
                      className="w-9 h-9 rounded-xl bg-white/90 flex items-center justify-center text-navy hover:bg-white transition-colors"
                      aria-label="More options"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>

                <Link href={`/deck/${deck.shareId}`} className="block p-4 space-y-2">
                  <h3 className="text-sm font-semibold text-navy dark:text-white truncate">
                    {deck.title}
                  </h3>
                  <p className="text-xs text-navy-400 dark:text-white/40">
                    {[deck.industry, deck.stage, deck.fundingTarget].filter(Boolean).join(" \u00b7 ")}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      {score !== null && (
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${getScoreBg(score)}`}>
                          <span className={`text-sm font-bold ${getScoreColor(score)}`}>{score}</span>
                          <span className="text-[10px] text-navy-400 dark:text-white/40">PIQ</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-navy-400 dark:text-white/40">
                        <Eye size={12} />
                        <span className="text-xs">{deck.viewCount}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-navy-400 dark:text-white/40">{timeAgo(deck.createdAt)}</span>
                  </div>
                </Link>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Activity panel — 1/3 width on desktop */}
      <div>
        <h2 className="text-lg font-semibold text-navy dark:text-white mb-4">Activity</h2>
        <Card className="p-4">
          {activities.length === 0 ? (
            <p className="text-sm text-navy-400 dark:text-white/40 text-center py-8">
              Activity will appear here as you create and share decks
            </p>
          ) : (
            <div className="space-y-4">
              {activities.slice(0, 8).map((activity, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-full bg-[var(--surface-2)] flex items-center justify-center shrink-0 mt-0.5">
                    {activity.type === "view" && <Eye size={12} className="text-navy-400 dark:text-white/40" />}
                    {activity.type === "created" && <Layers size={12} className="text-electric" />}
                    {activity.type === "scored" && <span className="text-violet-500 text-xs font-bold">S</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-navy dark:text-white truncate">{activity.title}</p>
                    <p className="text-[10px] text-navy-400 dark:text-white/40 truncate">{activity.deckTitle}</p>
                  </div>
                  <span className="text-[10px] text-navy-400 dark:text-white/40 shrink-0">{timeAgo(activity.time)}</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
