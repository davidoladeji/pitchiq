"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface AdminDeck {
  id: string;
  shareId: string;
  title: string;
  companyName: string;
  themeId: string;
  isPremium: boolean;
  piqScore: string;
  createdAt: string;
  userEmail: string;
  viewCount: number;
}

export default function AdminDecksPage() {
  const [decks, setDecks] = useState<AdminDeck[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchDecks = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      const res = await fetch(`/api/admin/decks?${params}`);
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setDecks(data.decks);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch {
      setDecks([]);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this deck? This cannot be undone.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/decks/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      setDecks((prev) => prev.filter((d) => d.id !== id));
      setTotal((prev) => prev - 1);
    } catch {
      alert("Failed to delete deck");
    } finally {
      setDeleting(null);
    }
  }

  function getPiqScore(raw: string): number | null {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed.overall === "number") return parsed.overall;
    } catch { /* empty */ }
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Decks</h1>
          <p className="text-sm text-white/30 mt-1">{total.toLocaleString()} total decks</p>
        </div>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search title, company, email..."
            className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 outline-none focus:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 w-64"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-electric text-white text-sm font-semibold hover:bg-electric-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearchInput(""); setSearch(""); setPage(1); }}
              className="px-3 py-2 rounded-xl bg-white/5 text-white/50 text-sm hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Deck</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">User</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">PIQ</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Views</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Created</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/5">
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-3 bg-white/5 rounded animate-pulse w-20" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : decks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-white/30 text-sm">
                    {search ? "No decks match your search." : "No decks yet."}
                  </td>
                </tr>
              ) : (
                decks.map((deck) => {
                  const score = getPiqScore(deck.piqScore);
                  return (
                    <tr key={deck.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-sm font-medium text-white truncate max-w-[200px]">{deck.title}</p>
                          <p className="text-xs text-white/30">{deck.companyName}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-white/50">{deck.userEmail}</span>
                      </td>
                      <td className="px-5 py-3">
                        {score !== null ? (
                          <span className={`text-sm font-bold ${
                            score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400"
                          }`}>
                            {score}
                          </span>
                        ) : (
                          <span className="text-xs text-white/20">--</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-white/50">{deck.viewCount}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-white/30">
                          {new Date(deck.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/deck/${deck.shareId}`}
                            target="_blank"
                            className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            View
                          </Link>
                          <button
                            onClick={() => handleDelete(deck.id)}
                            disabled={deleting === deck.id}
                            className="px-2.5 py-1 rounded-lg bg-red-500/10 text-xs text-red-400 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          >
                            {deleting === deck.id ? "..." : "Delete"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-white/5">
            <p className="text-xs text-white/30">
              Page {page} of {totalPages}
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-white/50 hover:text-white disabled:opacity-25 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-white/50 hover:text-white disabled:opacity-25 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
