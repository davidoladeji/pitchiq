"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Eye, Plus, Pencil, ExternalLink, Sparkles } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Decks Page — Void Command Center style                             */
/* ------------------------------------------------------------------ */

interface DeckItem {
  id: string;
  title: string;
  companyName: string;
  score: number;
  views: number;
  theme: string;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  } catch { return dateStr; }
}

export default function DecksPage() {
  const router = useRouter();
  const [decks, setDecks] = useState<DeckItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"recent" | "score" | "views">("recent");

  useEffect(() => {
    fetch("/api/v2/dashboard")
      .then((r) => r.json())
      .then((d) => { setDecks(d.decks || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = decks;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((d) => d.title.toLowerCase().includes(q) || d.companyName.toLowerCase().includes(q));
    }
    if (sort === "score") list = [...list].sort((a, b) => b.score - a.score);
    else if (sort === "views") list = [...list].sort((a, b) => b.views - a.views);
    return list;
  }, [decks, search, sort]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-48 rounded-xl animate-pulse" style={{ background: "var(--void-surface)" }} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-2xl animate-pulse" style={{ background: "var(--void-surface)" }} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: "var(--void-text)" }}>My Decks</h2>
          <p className="text-sm" style={{ color: "var(--void-text-dim)" }}>{decks.length} deck{decks.length !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => router.push("/create")}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-xs font-semibold transition-all hover:-translate-y-0.5"
          style={{ background: "var(--neon-electric)", boxShadow: "0 4px 20px rgba(var(--neon-electric-rgb), 0.3)" }}
        >
          <Plus size={14} /> New Deck
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--void-text-dim)" }} />
          <input
            placeholder="Search decks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 rounded-xl text-sm outline-none transition-all"
            style={{ background: "var(--void-surface)", border: "1px solid var(--void-border)", color: "var(--void-text)" }}
          />
        </div>
        <div className="flex gap-0.5 rounded-xl p-0.5" style={{ background: "var(--void-surface)", border: "1px solid var(--void-border)" }}>
          {(["recent", "score", "views"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={sort === s
                ? { background: "rgba(var(--neon-electric-rgb), 0.15)", color: "var(--neon-cyan)" }
                : { color: "var(--void-text-dim)" }
              }
            >
              {s === "recent" ? "Recent" : s === "score" ? "Score" : "Views"}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && !search && (
        <div className="void-card p-12 text-center">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center orb-breathe" style={{ background: "rgba(var(--neon-electric-rgb), 0.1)", border: "1px solid rgba(var(--neon-electric-rgb), 0.2)" }}>
            <Sparkles size={24} style={{ color: "var(--neon-electric)" }} />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--void-text)" }}>No decks yet</p>
          <p className="text-xs mt-1 mb-4" style={{ color: "var(--void-text-dim)" }}>Create your first AI-powered pitch deck</p>
          <button onClick={() => router.push("/create")} className="px-5 py-2.5 rounded-xl text-white text-xs font-semibold" style={{ background: "var(--neon-electric)" }}>
            Create Deck
          </button>
        </div>
      )}

      {filtered.length === 0 && search && (
        <p className="text-center text-sm py-8" style={{ color: "var(--void-text-dim)" }}>No decks match &ldquo;{search}&rdquo;</p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((deck) => {
          const scoreColor = deck.score >= 90 ? "var(--neon-emerald)" : deck.score >= 70 ? "var(--neon-cyan)" : deck.score >= 50 ? "#FBBF24" : deck.score > 0 ? "#F87171" : "var(--void-text-dim)";
          return (
            <div key={deck.id} className="void-card overflow-hidden group">
              {/* Thumbnail area */}
              <Link
                href={`/deck/${deck.id}`}
                className="block h-28 flex items-center justify-center"
                style={{ background: "var(--void-2)" }}
              >
                <span className="text-[10px]" style={{ color: "var(--void-text-dim)" }}>Click to view</span>
              </Link>

              <div className="p-4">
                <Link href={`/deck/${deck.id}`} className="block">
                  <h3 className="text-sm font-semibold truncate hover:underline" style={{ color: "var(--void-text)" }}>
                    {deck.title}
                  </h3>
                </Link>
                <p className="text-xs mt-0.5" style={{ color: "var(--void-text-dim)" }}>{deck.companyName}</p>

                {/* Stats row */}
                <div className="flex items-center gap-3 mt-3">
                  {deck.score > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold" style={{ background: `${scoreColor}15`, color: scoreColor, border: `1px solid ${scoreColor}25` }}>
                      {deck.score}
                    </span>
                  )}
                  <span className="flex items-center gap-1 text-xs" style={{ color: "var(--void-text-dim)" }}>
                    <Eye size={12} /> {deck.views}
                  </span>
                  <span className="text-xs ml-auto" style={{ color: "var(--void-text-dim)" }}>{timeAgo(deck.updatedAt)}</span>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 mt-3 pt-3" style={{ borderTop: "1px solid var(--void-border)" }}>
                  <button
                    onClick={() => router.push(`/editor/${deck.id}`)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{ background: "var(--void-surface)", color: "var(--void-text-muted)", border: "1px solid var(--void-border)" }}
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  <button
                    onClick={() => router.push(`/deck/${deck.id}`)}
                    className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                    style={{ background: "var(--void-surface)", color: "var(--void-text-muted)", border: "1px solid var(--void-border)" }}
                  >
                    <ExternalLink size={12} /> View
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
