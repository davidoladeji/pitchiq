"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Eye, Plus, Pencil, ExternalLink } from "lucide-react";
import { Card } from "@/components/v2/ui/card";
// Badge available for future use
import { Button } from "@/components/v2/ui/button";
import { Input } from "@/components/v2/ui/input";

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
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  } catch { return dateStr; }
}

function scoreColor(score: number): string {
  if (score >= 80) return "text-emerald-600 bg-emerald-50";
  if (score >= 60) return "text-primary-600 bg-primary-50";
  if (score > 0) return "text-amber-600 bg-amber-50";
  return "text-neutral-400 bg-neutral-50";
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
        <div className="h-10 w-48 rounded-lg bg-neutral-100 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-48 rounded-xl bg-neutral-100 animate-pulse" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-neutral-900">My Decks</h2>
          <p className="text-sm text-neutral-500">{decks.length} deck{decks.length !== 1 ? "s" : ""}</p>
        </div>
        <Button onClick={() => router.push("/create")}>
          <Plus size={16} className="mr-1.5" /> New Deck
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search decks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 h-9 text-sm"
          />
        </div>
        <div className="flex gap-1 rounded-lg border border-neutral-200 p-0.5">
          {(["recent", "score", "views"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                sort === s ? "bg-primary-500 text-white" : "text-neutral-500 hover:bg-neutral-50"
              }`}
            >
              {s === "recent" ? "Recent" : s === "score" ? "Score" : "Views"}
            </button>
          ))}
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 && !search && (
        <Card className="text-center py-12">
          <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
            <Plus size={24} className="text-primary-500" />
          </div>
          <p className="text-sm font-medium text-neutral-700">No decks yet</p>
          <p className="text-xs text-neutral-500 mt-1">Create your first AI-powered pitch deck</p>
          <Button className="mt-4" onClick={() => router.push("/create")}>Create Deck</Button>
        </Card>
      )}

      {filtered.length === 0 && search && (
        <p className="text-center text-sm text-neutral-400 py-8">No decks match &ldquo;{search}&rdquo;</p>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((deck) => (
          <Card key={deck.id} hover className="overflow-hidden">
            {/* Thumbnail placeholder */}
            <div
              className="h-32 bg-neutral-900 flex items-center justify-center cursor-pointer"
              onClick={() => router.push(`/deck/${deck.id}`)}
            >
              <span className="text-white/30 text-xs">Click to view</span>
            </div>

            <div className="p-4">
              <h3
                className="text-sm font-semibold text-neutral-900 truncate cursor-pointer hover:text-primary-600 transition-colors"
                onClick={() => router.push(`/deck/${deck.id}`)}
              >
                {deck.title}
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">{deck.companyName}</p>

              {/* Stats row */}
              <div className="flex items-center gap-3 mt-3">
                {deck.score > 0 && (
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-bold ${scoreColor(deck.score)}`}>
                    {deck.score} PIQ
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-neutral-400">
                  <Eye size={12} /> {deck.views}
                </span>
                <span className="text-xs text-neutral-400 ml-auto">{timeAgo(deck.updatedAt)}</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-neutral-100">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/editor/${deck.id}`)}
                >
                  <Pencil size={12} className="mr-1" /> Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/deck/${deck.id}`)}
                >
                  <ExternalLink size={12} className="mr-1" /> View
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
