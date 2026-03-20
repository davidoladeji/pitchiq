"use client";

import { useState, useEffect, useCallback } from "react";
import { getPlanLimits } from "@/lib/plan-limits";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MatchResult {
  investorId: string;
  name: string;
  type: string;
  description: string | null;
  website: string | null;
  fitScore: number;
  topReasons: string[];
  reasons: Array<{
    dimension: string;
    matched: boolean;
    detail: string;
    points: number;
  }>;
  notableDeals: string[];
  aum: string | null;
  verified: boolean;
  stages: string[];
  sectors: string[];
  geographies: string[];
  chequeMin: number | null;
  chequeMax: number | null;
}

interface DeckOption {
  shareId: string;
  title: string;
  id: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatAmount(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(0)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

const TYPE_COLORS: Record<string, string> = {
  vc: "bg-electric/10 text-electric",
  angel: "bg-emerald-500/10 text-emerald-400",
  accelerator: "bg-violet-500/10 text-violet-400",
  family_office: "bg-amber-500/10 text-amber-400",
  corporate: "bg-slate-400/10 text-slate-300",
};

function fitScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-electric";
  if (score >= 40) return "text-amber-400";
  return "text-red-400";
}

function fitScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500/10";
  if (score >= 60) return "bg-electric/10";
  if (score >= 40) return "bg-amber-500/10";
  return "bg-red-500/10";
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DashboardInvestorMatch({
  plan,
  decks,
}: {
  plan: string;
  decks: Array<{ shareId: string; title: string; id: string }>;
}) {
  const limits = getPlanLimits(plan);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<DeckOption | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [minScore, setMinScore] = useState(0);

  // Auto-select first deck
  useEffect(() => {
    if (decks.length > 0 && !selectedDeck) {
      setSelectedDeck(decks[0]);
    }
  }, [decks, selectedDeck]);

  const fetchMatches = useCallback(async (deckId: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/investors/match?deckId=${deckId}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to load matches");
      }
      const data = await res.json();
      setMatches(data.matches || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setMatches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch matches when deck changes
  useEffect(() => {
    if (selectedDeck?.id) {
      fetchMatches(selectedDeck.id);
    }
  }, [selectedDeck, fetchMatches]);

  const handleSaveToPipeline = async (match: MatchResult) => {
    setSavingId(match.investorId);
    try {
      const res = await fetch("/api/investors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: match.name,
          firm: match.name,
          email: "",
          status: "identified",
          notes: `Matched via PitchIQ (${match.fitScore}% fit). ${match.topReasons.join(". ")}`,
          investorProfileId: match.investorId,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save");
      }
      setSavedIds((prev) => new Set(prev).add(match.investorId));
    } catch {
      // Silently handle — user can retry
    } finally {
      setSavingId(null);
    }
  };

  // Filter matches
  const filtered = matches.filter((m) => {
    if (filterType !== "all" && m.type !== filterType) return false;
    if (m.fitScore < minScore) return false;
    return true;
  });

  if (!limits.investorCRM) {
    return (
      <section className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-electric/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-electric" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772" />
            </svg>
          </div>
          <h2 className="text-base font-semibold text-white">Find Investors</h2>
        </div>
        <p className="text-sm text-white/40 mb-4">
          Match your deck with investors most likely to be interested in your startup.
        </p>
        <div className="relative rounded-xl border border-white/[0.06] bg-white/[0.02] p-8 text-center">
          <div className="absolute inset-0 backdrop-blur-sm rounded-xl" />
          <div className="relative">
            <p className="text-white/50 text-sm mb-2">Investor matching is available on Growth plans and above.</p>
            <span className="text-electric text-xs font-medium">Upgrade to unlock</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-electric/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-electric" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772" />
            </svg>
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Find Investors</h2>
            <p className="text-xs text-white/30">Matched against your deck data</p>
          </div>
        </div>
        {matches.length > 0 && (
          <span className="text-xs text-white/30">{filtered.length} of {matches.length} shown</span>
        )}
      </div>

      {/* Deck selector */}
      {decks.length > 1 && (
        <div className="mb-4">
          <select
            value={selectedDeck?.id || ""}
            onChange={(e) => {
              const d = decks.find((dk) => dk.id === e.target.value);
              if (d) setSelectedDeck(d);
            }}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white/70 focus:outline-none focus:ring-1 focus:ring-electric"
          >
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Filters */}
      {matches.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {["all", "vc", "angel", "accelerator"].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterType === t
                  ? "bg-electric/15 text-electric"
                  : "bg-white/[0.04] text-white/40 hover:text-white/60"
              }`}
            >
              {t === "all" ? "All" : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-white/30">Min score:</span>
            <select
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white/60 focus:outline-none focus:ring-1 focus:ring-electric"
            >
              <option value={0}>Any</option>
              <option value={40}>40+</option>
              <option value={60}>60+</option>
              <option value={80}>80+</option>
            </select>
          </div>
        </div>
      )}

      {/* Trust disclaimer */}
      <p className="text-[11px] text-white/25 italic mb-4">
        Matches are based on publicly available investor data. A high match score does not guarantee investor interest.
      </p>

      {/* Error */}
      {error && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <svg className="w-5 h-5 animate-spin text-electric" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="ml-2 text-sm text-white/40">Finding matches...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && decks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-white/40">Create a deck first to find matching investors.</p>
        </div>
      )}

      {/* Results */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.slice(0, 20).map((m) => {
            const isExpanded = expandedId === m.investorId;
            const isSaved = savedIds.has(m.investorId);
            const isSaving = savingId === m.investorId;

            return (
              <div key={m.investorId} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                {/* Row */}
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : m.investorId)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.02] transition-colors"
                >
                  {/* Score */}
                  <div className={`w-10 h-10 rounded-lg ${fitScoreBg(m.fitScore)} flex items-center justify-center shrink-0`}>
                    <span className={`text-sm font-bold ${fitScoreColor(m.fitScore)}`}>{m.fitScore}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white truncate">{m.name}</span>
                      {m.verified && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Verified" />
                      )}
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_COLORS[m.type] || TYPE_COLORS.vc}`}>
                        {m.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {m.topReasons.slice(0, 2).map((r) => (
                        <span key={r} className="text-[11px] text-white/30 truncate">{r}</span>
                      ))}
                    </div>
                  </div>

                  {/* Cheque */}
                  {m.chequeMin != null && m.chequeMax != null && (
                    <span className="text-xs text-white/30 shrink-0 hidden sm:block">
                      {formatAmount(m.chequeMin)} - {formatAmount(m.chequeMax)}
                    </span>
                  )}

                  {/* Expand arrow */}
                  <svg
                    className={`w-4 h-4 text-white/20 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-white/[0.04]">
                    {/* Description */}
                    {m.description && (
                      <p className="text-xs text-white/40 mt-3 mb-3">{m.description}</p>
                    )}

                    {/* Fit breakdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                      {m.reasons.map((r) => (
                        <div
                          key={r.dimension}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                            r.matched ? "bg-emerald-500/5" : "bg-white/[0.02]"
                          }`}
                        >
                          {r.matched ? (
                            <svg className="w-3.5 h-3.5 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5 text-white/20 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          <div className="min-w-0">
                            <span className="text-[11px] font-medium text-white/50">{r.dimension}</span>
                            <p className="text-[11px] text-white/30 truncate">{r.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Notable deals */}
                    {m.notableDeals.length > 0 && (
                      <div className="mb-3">
                        <span className="text-[11px] text-white/30">Notable investments: </span>
                        <span className="text-[11px] text-white/50">{m.notableDeals.slice(0, 5).join(", ")}</span>
                      </div>
                    )}

                    {/* Stages + sectors pills */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {m.stages.map((s) => (
                        <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.04] text-white/30">{s}</span>
                      ))}
                      {m.sectors.slice(0, 5).map((s) => (
                        <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-electric/5 text-electric/40">{s}</span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleSaveToPipeline(m)}
                        disabled={isSaved || isSaving}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isSaved
                            ? "bg-emerald-500/10 text-emerald-400 cursor-default"
                            : "bg-electric/10 text-electric hover:bg-electric/20 disabled:opacity-50"
                        }`}
                      >
                        {isSaving ? "Saving..." : isSaved ? "Saved to Pipeline" : "Save to Pipeline"}
                      </button>
                      {m.website && (
                        <a
                          href={m.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] text-white/40 hover:text-white/60 transition-colors"
                        >
                          Visit Website
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* No results after filter */}
      {!loading && !error && matches.length > 0 && filtered.length === 0 && (
        <div className="text-center py-6">
          <p className="text-sm text-white/40">No investors match your current filters.</p>
        </div>
      )}
    </section>
  );
}
