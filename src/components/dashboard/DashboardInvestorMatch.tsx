"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { getPlanLimits } from "@/lib/plan-limits";
import {
  Search,
  X,
  ChevronDown,
  ChevronRight,
  Check,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Bookmark,
  Globe,
  Users,
  Building2,
  Filter,
  Linkedin,
  Twitter,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface MatchReason {
  dimension: string;
  score: number;
  maxScore: number;
  matched: boolean;
  detail: string;
  severity?: string;
  points: number;
}

interface MatchResult {
  investorId: string;
  name: string;
  type: string;
  description: string | null;
  website: string | null;
  fitScore: number;
  topReasons: string[];
  warnings: string[];
  dealbreakers: string[];
  compatibilityLabel: string;
  reasons: MatchReason[];
  notableDeals: string[];
  aum: string | null;
  verified: boolean;
  stages: string[];
  sectors: string[];
  geographies: string[];
  chequeMin: number | null;
  chequeMax: number | null;
  // Extended
  country?: string | null;
  city?: string | null;
  thesis?: string | null;
  fundSize?: number | null;
  leadPreference?: string | null;
  deploymentPace?: string | null;
  portfolioCompanies?: string[];
  linkedIn?: string | null;
  twitter?: string | null;
  contactEmail?: string | null;
  logoUrl?: string | null;
  coInvestors?: string[];
  avgResponseDays?: number | null;
  avgCloseWeeks?: number | null;
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
  vc: "bg-[#4361EE]/10 text-[#4361EE]",
  angel: "bg-emerald-500/10 text-emerald-400",
  accelerator: "bg-violet-500/10 text-violet-400",
  family_office: "bg-amber-500/10 text-amber-400",
  corporate: "bg-slate-400/10 text-slate-300",
};

function fitScoreColor(score: number): string {
  if (score >= 80) return "text-emerald-400";
  if (score >= 65) return "text-[#4361EE]";
  if (score >= 50) return "text-amber-400";
  if (score >= 35) return "text-orange-400";
  return "text-red-400";
}

function fitScoreBg(score: number): string {
  if (score >= 80) return "bg-emerald-500/10";
  if (score >= 65) return "bg-[#4361EE]/10";
  if (score >= 50) return "bg-amber-500/10";
  if (score >= 35) return "bg-orange-500/10";
  return "bg-red-500/10";
}

function compatibilityBadge(label: string): { bg: string; text: string } {
  switch (label) {
    case "Excellent Fit": return { bg: "bg-emerald-500/10", text: "text-emerald-400" };
    case "Strong Fit": return { bg: "bg-[#4361EE]/10", text: "text-[#4361EE]" };
    case "Moderate Fit": return { bg: "bg-amber-500/10", text: "text-amber-400" };
    case "Weak Fit": return { bg: "bg-orange-500/10", text: "text-orange-400" };
    case "Poor Fit": return { bg: "bg-red-500/10", text: "text-red-400" };
    default: return { bg: "bg-white/5", text: "text-white/40" };
  }
}

function scoreBarColor(score: number, maxScore: number): string {
  if (maxScore <= 0) return "bg-white/10";
  const pct = score / maxScore;
  if (pct >= 0.75) return "bg-emerald-500";
  if (pct >= 0.5) return "bg-[#4361EE]";
  if (pct >= 0.25) return "bg-amber-500";
  return "bg-red-500";
}

// ---------------------------------------------------------------------------
// Detail Modal
// ---------------------------------------------------------------------------

function InvestorDetailModal({
  match,
  onClose,
  onSave,
  isSaved,
  isSaving,
}: {
  match: MatchResult;
  onClose: () => void;
  onSave: () => void;
  isSaved: boolean;
  isSaving: boolean;
}) {
  const badge = compatibilityBadge(match.compatibilityLabel);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60" />
      {/* Slide-over panel */}
      <div
        className="relative w-full max-w-lg bg-[#0F0F14] border-l border-white/[0.06] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0F0F14]/95 backdrop-blur border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl ${fitScoreBg(match.fitScore)} flex items-center justify-center`}>
                <span className={`text-lg font-bold ${fitScoreColor(match.fitScore)}`}>{match.fitScore}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-white">{match.name}</h2>
                  {match.verified && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400" title="Verified" />
                  )}
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_COLORS[match.type] || TYPE_COLORS.vc}`}>
                    {match.type}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.bg} ${badge.text}`}>
                    {match.compatibilityLabel}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/[0.06] text-white/40 hover:text-white/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Dealbreakers */}
          {match.dealbreakers.length > 0 && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 space-y-2">
              <h3 className="text-xs font-semibold text-red-400 flex items-center gap-1.5">
                <XCircle className="w-3.5 h-3.5" />
                Dealbreakers
              </h3>
              {match.dealbreakers.map((d, i) => (
                <p key={i} className="text-xs text-red-400/80">{d}</p>
              ))}
            </div>
          )}

          {/* Warnings */}
          {match.warnings.length > 0 && (
            <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-2">
              <h3 className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                Warnings
              </h3>
              {match.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-400/80">{w}</p>
              ))}
            </div>
          )}

          {/* Description & Thesis */}
          {(match.description || match.thesis) && (
            <div>
              <h3 className="text-xs font-semibold text-white/60 mb-2">About</h3>
              {match.description && <p className="text-xs text-white/40 mb-2">{match.description}</p>}
              {match.thesis && (
                <p className="text-xs text-white/40 italic">
                  <span className="text-white/50 font-medium not-italic">Thesis: </span>
                  {match.thesis}
                </p>
              )}
            </div>
          )}

          {/* Fund details */}
          <div className="grid grid-cols-2 gap-3">
            {match.aum && (
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                <span className="text-[10px] text-white/30 block">AUM</span>
                <span className="text-sm text-white/70 font-medium">{match.aum}</span>
              </div>
            )}
            {match.fundSize != null && (
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                <span className="text-[10px] text-white/30 block">Fund Size</span>
                <span className="text-sm text-white/70 font-medium">{formatAmount(match.fundSize)}</span>
              </div>
            )}
            {match.chequeMin != null && match.chequeMax != null && (
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                <span className="text-[10px] text-white/30 block">Cheque Range</span>
                <span className="text-sm text-white/70 font-medium">
                  {formatAmount(match.chequeMin)} - {formatAmount(match.chequeMax)}
                </span>
              </div>
            )}
            {match.leadPreference && (
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                <span className="text-[10px] text-white/30 block">Lead Preference</span>
                <span className="text-sm text-white/70 font-medium capitalize">{match.leadPreference}</span>
              </div>
            )}
            {match.avgResponseDays != null && (
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                <span className="text-[10px] text-white/30 block">Avg Response</span>
                <span className="text-sm text-white/70 font-medium">{match.avgResponseDays} days</span>
              </div>
            )}
            {match.avgCloseWeeks != null && (
              <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3">
                <span className="text-[10px] text-white/30 block">Avg Close Time</span>
                <span className="text-sm text-white/70 font-medium">{match.avgCloseWeeks} weeks</span>
              </div>
            )}
          </div>

          {/* Score breakdown */}
          <div>
            <h3 className="text-xs font-semibold text-white/60 mb-3">Score Breakdown</h3>
            <div className="space-y-2">
              {match.reasons.map((r) => (
                <div key={r.dimension} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-white/50">{r.dimension}</span>
                    <span className="text-[10px] text-white/30">
                      {r.score}/{r.maxScore}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${scoreBarColor(r.score, r.maxScore)}`}
                      style={{ width: r.maxScore > 0 ? `${(r.score / r.maxScore) * 100}%` : "0%" }}
                    />
                  </div>
                  <p className="text-[10px] text-white/30">{r.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Portfolio companies */}
          {match.portfolioCompanies && match.portfolioCompanies.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-white/60 mb-2">Portfolio Companies</h3>
              <div className="flex flex-wrap gap-1">
                {match.portfolioCompanies.map((c) => (
                  <span key={c} className="px-2 py-0.5 rounded text-[10px] bg-white/[0.04] text-white/40">{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Notable deals */}
          {match.notableDeals.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-white/60 mb-2">Notable Deals</h3>
              <div className="flex flex-wrap gap-1">
                {match.notableDeals.map((d) => (
                  <span key={d} className="px-2 py-0.5 rounded text-[10px] bg-[#4361EE]/5 text-[#4361EE]/60">{d}</span>
                ))}
              </div>
            </div>
          )}

          {/* Co-investors */}
          {match.coInvestors && match.coInvestors.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-white/60 mb-2">Frequent Co-Investors</h3>
              <div className="flex flex-wrap gap-1">
                {match.coInvestors.map((c) => (
                  <span key={c} className="px-2 py-0.5 rounded text-[10px] bg-white/[0.04] text-white/40">{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Stages + Sectors */}
          <div className="flex flex-wrap gap-1">
            {match.stages.map((s) => (
              <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.04] text-white/30">{s}</span>
            ))}
            {match.sectors.slice(0, 8).map((s) => (
              <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-[#4361EE]/5 text-[#4361EE]/40">{s}</span>
            ))}
            {match.geographies.map((g) => (
              <span key={g} className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/5 text-emerald-400/40">{g}</span>
            ))}
          </div>

          {/* Links */}
          <div className="flex items-center gap-2 flex-wrap">
            {match.website && (
              <a href={match.website} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] text-white/40 hover:text-white/60 transition-colors">
                <Globe className="w-3.5 h-3.5" /> Website
              </a>
            )}
            {match.linkedIn && (
              <a href={match.linkedIn} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] text-white/40 hover:text-white/60 transition-colors">
                <Linkedin className="w-3.5 h-3.5" /> LinkedIn
              </a>
            )}
            {match.twitter && (
              <a href={match.twitter} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] text-white/40 hover:text-white/60 transition-colors">
                <Twitter className="w-3.5 h-3.5" /> Twitter
              </a>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
            <button
              onClick={onSave}
              disabled={isSaved || isSaving}
              className={`flex-1 px-4 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                isSaved
                  ? "bg-emerald-500/10 text-emerald-400 cursor-default"
                  : "bg-[#4361EE]/10 text-[#4361EE] hover:bg-[#4361EE]/20 disabled:opacity-50"
              }`}
            >
              <Bookmark className="w-3.5 h-3.5 inline mr-1.5" />
              {isSaving ? "Saving..." : isSaved ? "Saved to Pipeline" : "Save to Pipeline"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DashboardInvestorMatch({
  plan,
  decks,
  hasProfile,
}: {
  plan: string;
  decks: Array<{ shareId: string; title: string; id: string }>;
  hasProfile?: boolean;
}) {
  const limits = getPlanLimits(plan);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDeck, setSelectedDeck] = useState<DeckOption | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState("");

  // Match source toggle
  const [matchSource, setMatchSource] = useState<"profile" | "deck">(
    hasProfile ? "profile" : "deck"
  );

  // Filters
  const [filterType, setFilterType] = useState<string>("all");
  const [minScore, setMinScore] = useState(0);
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [filterLead, setFilterLead] = useState<string>("all");
  const [hideDealbreakers, setHideDealbreakers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Auto-select first deck
  useEffect(() => {
    if (decks.length > 0 && !selectedDeck) {
      setSelectedDeck(decks[0]);
    }
  }, [decks, selectedDeck]);

  const fetchMatches = useCallback(async (source: "profile" | "deck", deckId?: string) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (source === "profile") {
        params.set("source", "profile");
      } else if (deckId) {
        params.set("deckId", deckId);
      }
      const res = await fetch(`/api/investors/match?${params.toString()}`);
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

  // Fetch matches when source or deck changes
  useEffect(() => {
    if (matchSource === "profile") {
      fetchMatches("profile");
    } else if (selectedDeck?.id) {
      fetchMatches("deck", selectedDeck.id);
    }
  }, [matchSource, selectedDeck, fetchMatches]);

  const handleSaveToPipeline = async (match: MatchResult) => {
    setSavingId(match.investorId);
    try {
      const res = await fetch("/api/investors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: match.name,
          firm: match.name,
          email: match.contactEmail || "",
          status: "identified",
          notes: `Matched via PitchIQ (${match.fitScore}% fit, ${match.compatibilityLabel}). ${match.topReasons.join(". ")}`,
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

  // Derived: unique regions/lead prefs for filters
  const uniqueRegions = useMemo(() => {
    const s = new Set<string>();
    matches.forEach((m) => m.geographies.forEach((g) => s.add(g)));
    return Array.from(s).sort();
  }, [matches]);

  // Filter matches
  const filtered = useMemo(() => {
    return matches.filter((m) => {
      if (filterType !== "all" && m.type !== filterType) return false;
      if (m.fitScore < minScore) return false;
      if (filterRegion !== "all" && !m.geographies.includes(filterRegion)) return false;
      if (filterLead !== "all" && m.leadPreference !== filterLead) return false;
      if (hideDealbreakers && m.dealbreakers.length > 0) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!m.name.toLowerCase().includes(q) && !m.sectors.some((s) => s.toLowerCase().includes(q))) {
          return false;
        }
      }
      return true;
    });
  }, [matches, filterType, minScore, filterRegion, filterLead, hideDealbreakers, searchQuery]);

  const detailMatch = detailId ? matches.find((m) => m.investorId === detailId) : null;

  if (!limits.investorCRM) {
    return (
      <section className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#4361EE]/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-[#4361EE]" />
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
            <span className="text-[#4361EE] text-xs font-medium">Upgrade to unlock</span>
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
          <div className="w-8 h-8 rounded-lg bg-[#4361EE]/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-[#4361EE]" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Find Investors</h2>
            <p className="text-xs text-white/30">
              {matchSource === "profile" ? "Matched against your startup profile" : "Matched against your deck data"}
            </p>
          </div>
        </div>
        {matches.length > 0 && (
          <span className="text-xs text-white/30">{filtered.length} of {matches.length} shown</span>
        )}
      </div>

      {/* Match source toggle */}
      <div className="flex items-center gap-2 mb-4 p-1 rounded-lg bg-white/[0.03] border border-white/[0.06]">
        <span className="text-[11px] text-white/30 px-2 shrink-0">Matching based on:</span>
        {hasProfile && (
          <button
            type="button"
            onClick={() => setMatchSource("profile")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              matchSource === "profile"
                ? "bg-[#4361EE]/10 text-[#4361EE]"
                : "text-white/40 hover:text-white/60"
            }`}
          >
            <Building2 className="w-3 h-3" />
            Your Startup Profile
          </button>
        )}
        <button
          type="button"
          onClick={() => setMatchSource("deck")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
            matchSource === "deck"
              ? "bg-[#4361EE]/10 text-[#4361EE]"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          Select a Deck
        </button>
      </div>

      {/* Deck selector (when deck source) */}
      {matchSource === "deck" && decks.length > 1 && (
        <div className="mb-4">
          <select
            value={selectedDeck?.id || ""}
            onChange={(e) => {
              const d = decks.find((dk) => dk.id === e.target.value);
              if (d) setSelectedDeck(d);
            }}
            className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-sm text-white/70 focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
          >
            {decks.map((d) => (
              <option key={d.id} value={d.id}>
                {d.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Search + Filter toggle */}
      {matches.length > 0 && (
        <div className="space-y-3 mb-4">
          {/* Search bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
              <input
                type="text"
                placeholder="Search investors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                showFilters ? "bg-[#4361EE]/10 text-[#4361EE]" : "bg-white/[0.04] text-white/40 hover:text-white/60"
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>

          {/* Filter row */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]">
              {/* Type pills */}
              <div className="flex items-center gap-1">
                {["all", "vc", "angel", "accelerator", "family_office"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setFilterType(t)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors ${
                      filterType === t
                        ? "bg-[#4361EE]/15 text-[#4361EE]"
                        : "bg-white/[0.04] text-white/40 hover:text-white/60"
                    }`}
                  >
                    {t === "all" ? "All Types" : t === "family_office" ? "Family Office" : t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>

              {/* Min score */}
              <select
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-white/60 focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
              >
                <option value={0}>Any Score</option>
                <option value={35}>35+</option>
                <option value={50}>50+</option>
                <option value={65}>65+</option>
                <option value={80}>80+</option>
              </select>

              {/* Region filter */}
              {uniqueRegions.length > 0 && (
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-white/60 focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
                >
                  <option value="all">All Regions</option>
                  {uniqueRegions.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              )}

              {/* Lead preference filter */}
              <select
                value={filterLead}
                onChange={(e) => setFilterLead(e.target.value)}
                className="px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.08] text-[10px] text-white/60 focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
              >
                <option value="all">Any Lead Pref</option>
                <option value="lead-only">Lead Only</option>
                <option value="co-lead">Co-Lead</option>
                <option value="follow">Follow</option>
                <option value="any">Any</option>
              </select>

              {/* Hide dealbreakers */}
              <label className="flex items-center gap-1.5 text-[10px] text-white/40 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={hideDealbreakers}
                  onChange={(e) => setHideDealbreakers(e.target.checked)}
                  className="rounded border-white/20 bg-white/5 text-[#4361EE] focus:ring-[#4361EE] w-3 h-3"
                />
                Hide dealbreakers
              </label>
            </div>
          )}
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
          <svg className="w-5 h-5 animate-spin text-[#4361EE]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="ml-2 text-sm text-white/40">Finding matches...</span>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && matchSource === "deck" && decks.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-white/40">Create a deck first to find matching investors.</p>
        </div>
      )}

      {/* Results */}
      {!loading && filtered.length > 0 && (
        <div className="space-y-2">
          {filtered.slice(0, 30).map((m) => {
            const isExpanded = expandedId === m.investorId;
            const isSaved = savedIds.has(m.investorId);
            const isSaving = savingId === m.investorId;
            const badge = compatibilityBadge(m.compatibilityLabel);

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
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-white truncate">{m.name}</span>
                      {m.verified && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" title="Verified" />
                      )}
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_COLORS[m.type] || TYPE_COLORS.vc}`}>
                        {m.type}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.bg} ${badge.text}`}>
                        {m.compatibilityLabel}
                      </span>
                      {m.dealbreakers.length > 0 && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-500/10 text-red-400">
                          {m.dealbreakers.length} dealbreaker{m.dealbreakers.length > 1 ? "s" : ""}
                        </span>
                      )}
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
                  <ChevronDown
                    className={`w-4 h-4 text-white/20 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-white/[0.04]">
                    {/* Dealbreakers */}
                    {m.dealbreakers.length > 0 && (
                      <div className="mt-3 mb-3 rounded-lg border border-red-500/20 bg-red-500/5 p-3 space-y-1">
                        {m.dealbreakers.map((d, i) => (
                          <p key={i} className="text-xs text-red-400 flex items-start gap-1.5">
                            <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            {d}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Warnings */}
                    {m.warnings.length > 0 && (
                      <div className="mt-3 mb-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 space-y-1">
                        {m.warnings.map((w, i) => (
                          <p key={i} className="text-xs text-amber-400 flex items-start gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            {w}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Description */}
                    {m.description && (
                      <p className="text-xs text-white/40 mt-3 mb-3">{m.description}</p>
                    )}

                    {/* Score breakdown bars */}
                    <div className="space-y-2 mb-3">
                      {m.reasons.filter((r) => r.maxScore > 0).map((r) => (
                        <div key={r.dimension} className="space-y-0.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {r.matched ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <X className="w-3 h-3 text-white/20" />
                              )}
                              <span className="text-[11px] font-medium text-white/50">{r.dimension}</span>
                            </div>
                            <span className="text-[10px] text-white/30">{r.score}/{r.maxScore}</span>
                          </div>
                          <div className="h-1 rounded-full bg-white/[0.06] overflow-hidden ml-[18px]">
                            <div
                              className={`h-full rounded-full ${scoreBarColor(r.score, r.maxScore)}`}
                              style={{ width: `${(r.score / r.maxScore) * 100}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-white/25 ml-[18px]">{r.detail}</p>
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
                        <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-[#4361EE]/5 text-[#4361EE]/40">{s}</span>
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
                            : "bg-[#4361EE]/10 text-[#4361EE] hover:bg-[#4361EE]/20 disabled:opacity-50"
                        }`}
                      >
                        {isSaving ? "Saving..." : isSaved ? "Saved to Pipeline" : "Save to Pipeline"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDetailId(m.investorId)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] text-white/40 hover:text-white/60 transition-colors flex items-center gap-1"
                      >
                        <ChevronRight className="w-3 h-3" />
                        View Details
                      </button>
                      {m.website && (
                        <a
                          href={m.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/[0.04] text-white/40 hover:text-white/60 transition-colors flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Website
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

      {/* Detail modal */}
      {detailMatch && (
        <InvestorDetailModal
          match={detailMatch}
          onClose={() => setDetailId(null)}
          onSave={() => handleSaveToPipeline(detailMatch)}
          isSaved={savedIds.has(detailMatch.investorId)}
          isSaving={savingId === detailMatch.investorId}
        />
      )}
    </section>
  );
}
