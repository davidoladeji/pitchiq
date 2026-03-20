"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
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

interface ProfileOption {
  id: string;
  companyName: string;
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
  profileCount = 0,
}: {
  plan: string;
  decks: Array<{ shareId: string; title: string; id: string }>;
  hasProfile?: boolean;
  profileCount?: number;
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

  // Profile selector for multi-profile users
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string | null>(null);

  // Fetch profiles when user has multiple
  useEffect(() => {
    if (profileCount <= 1) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/startup-profile");
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data.profiles) {
          const list: ProfileOption[] = data.profiles.map((p: { id: string; companyName: string }) => ({
            id: p.id,
            companyName: p.companyName,
          }));
          setProfiles(list);
          if (list.length > 0 && !selectedProfileId) {
            setSelectedProfileId(list[0].id);
          }
        }
      } catch {
        // Silently handle
      }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileCount]);

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

  const fetchMatches = useCallback(async (source: "profile" | "deck", deckId?: string, profileIdParam?: string | null) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (source === "profile") {
        params.set("source", "profile");
        if (profileIdParam) {
          params.set("profileId", profileIdParam);
        }
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

  // Fetch matches when source, deck, or selected profile changes
  useEffect(() => {
    if (matchSource === "profile") {
      fetchMatches("profile", undefined, selectedProfileId);
    } else if (selectedDeck?.id) {
      fetchMatches("deck", selectedDeck.id);
    }
  }, [matchSource, selectedDeck, selectedProfileId, fetchMatches]);

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
      <section className="bg-[#0F0F14] border border-white/[0.08] rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-[#4361EE]/10 flex items-center justify-center">
            <Users className="w-4 h-4 text-[#4361EE]" />
          </div>
          <h2 className="text-base font-semibold text-white">Find Investors</h2>
        </div>
        <p className="text-sm text-white/40 mb-4">
          Match your deck with investors most likely to be interested in your startup.
        </p>
        <div className="relative rounded-xl border border-white/[0.06] bg-white/[0.03] p-8 text-center">
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
    <section className="bg-[#0F0F14] border border-white/[0.08] rounded-2xl overflow-hidden shadow-lg">
      {/* Header bar */}
      <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#4361EE]/10 flex items-center justify-center">
              <Users className="w-4.5 h-4.5 text-[#4361EE]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-white tracking-tight">Find Investors</h2>
              <p className="text-[11px] text-white/35 mt-0.5">
                {matchSource === "profile" ? "Matched against your startup profile" : "Matched against your deck data"}
                {matches.length > 0 && <span className="text-white/20 ml-1.5">({filtered.length} of {matches.length})</span>}
              </p>
            </div>
          </div>
        </div>

        {/* Match source toggle */}
        <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
          {hasProfile && (
            <button
              type="button"
              onClick={() => setMatchSource("profile")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                matchSource === "profile"
                  ? "bg-[#4361EE] text-white shadow-sm"
                  : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
              }`}
            >
              <Building2 className="w-3 h-3" />
              Startup Profile
            </button>
          )}
          {!hasProfile && (
            <Link
              href={limits.maxStartupProfiles === 0 ? "/billing" : "/dashboard/startup-profile"}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[#4361EE]/70 hover:text-[#4361EE] hover:bg-[#4361EE]/5 transition-all"
            >
              <Building2 className="w-3 h-3" />
              {limits.maxStartupProfiles === 0 ? "Upgrade for Profiles" : "Set Up Profile"}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setMatchSource("deck")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              matchSource === "deck"
                ? "bg-[#4361EE] text-white shadow-sm"
                : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
            }`}
          >
            Deck Analysis
          </button>
        </div>

        {/* Profile selector (when profile source and multiple profiles) */}
        {matchSource === "profile" && profiles.length > 1 && (
          <div className="mt-3">
            <select
              value={selectedProfileId || ""}
              onChange={(e) => setSelectedProfileId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-sm text-white/70 focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.companyName}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Profile setup nudge */}
        {!hasProfile && (
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg border border-[#4361EE]/15 bg-[#4361EE]/5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#4361EE]/60 shrink-0" />
            <p className="text-[11px] text-white/50">
              {limits.maxStartupProfiles === 0 ? (
                <>
                  <Link href="/billing" className="text-[#4361EE] hover:underline font-medium">
                    Upgrade to Pro
                  </Link>
                  {" "}to create a startup profile — profile-based matching is significantly more accurate than deck analysis alone.
                </>
              ) : (
                <>
                  <Link href="/dashboard/startup-profile" className="text-[#4361EE] hover:underline font-medium">
                    Set up your startup profile
                  </Link>
                  {" "}to unlock profile-based matching — more accurate than deck analysis alone.
                </>
              )}
            </p>
          </div>
        )}

        {/* Deck selector (when deck source) */}
        {matchSource === "deck" && decks.length > 1 && (
          <div className="mt-3">
            <select
              value={selectedDeck?.id || ""}
              onChange={(e) => {
                const d = decks.find((dk) => dk.id === e.target.value);
                if (d) setSelectedDeck(d);
              }}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.06] border border-white/[0.08] text-sm text-white/70 focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
            >
              {decks.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Search + Filters area */}
      <div className="px-6 py-4">
        {matches.length > 0 && (
          <div className="space-y-3 mb-4">
            {/* Search bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" />
                <input
                  type="text"
                  placeholder="Search by name or sector..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 rounded-lg bg-white/[0.06] border border-white/[0.08] text-xs text-white/80 placeholder:text-white/25 focus:outline-none focus:ring-2 focus:ring-[#4361EE]/50 focus:border-[#4361EE]/30 transition-all"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
                  showFilters
                    ? "bg-[#4361EE]/10 text-[#4361EE] border-[#4361EE]/20"
                    : "bg-white/[0.04] text-white/40 hover:text-white/60 border-white/[0.08] hover:border-white/[0.12]"
                }`}
              >
                <Filter className="w-3.5 h-3.5" />
                Filters
              </button>
            </div>

            {/* Filter row */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                {/* Type pills */}
                <div className="flex items-center gap-1">
                  {["all", "vc", "angel", "accelerator", "family_office"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setFilterType(t)}
                      className={`px-2.5 py-1 rounded-md text-[10px] font-medium transition-all ${
                        filterType === t
                          ? "bg-[#4361EE] text-white"
                          : "bg-white/[0.04] text-white/40 hover:text-white/60 hover:bg-white/[0.08]"
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
                  className="px-2 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[10px] text-white/60 focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
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
                    className="px-2 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[10px] text-white/60 focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
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
                  className="px-2 py-1 rounded-lg bg-white/[0.06] border border-white/[0.08] text-[10px] text-white/60 focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
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
        <p className="text-[10px] text-white/20 italic mb-4">
          Matches are based on publicly available investor data. A high match score does not guarantee investor interest.
        </p>

        {/* Error */}
        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="w-6 h-6 animate-spin text-[#4361EE]" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="mt-3 text-sm text-white/40">Analyzing investor fit...</span>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && matchSource === "deck" && decks.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-white/40">Create a deck first to find matching investors.</p>
          </div>
        )}
      </div>

      {/* Results list */}
      {!loading && filtered.length > 0 && (
        <div className="px-6 pb-6">
          {/* Column header */}
          <div className="flex items-center gap-3 px-4 pb-2 mb-1 text-[10px] font-medium text-white/25 uppercase tracking-wider">
            <span className="w-10 text-center shrink-0">Score</span>
            <span className="flex-1">Investor</span>
            <span className="hidden sm:block w-28 text-right">Cheque Range</span>
            <span className="w-4 shrink-0" />
          </div>

          <div className="space-y-1.5">
            {filtered.slice(0, 30).map((m) => {
              const isExpanded = expandedId === m.investorId;
              const isSaved = savedIds.has(m.investorId);
              const isSaving = savingId === m.investorId;
              const badge = compatibilityBadge(m.compatibilityLabel);

              return (
                <div
                  key={m.investorId}
                  className={`rounded-xl border overflow-hidden transition-all ${
                    isExpanded
                      ? "border-[#4361EE]/20 bg-[#4361EE]/[0.03]"
                      : "border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.10]"
                  }`}
                >
                  {/* Row */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : m.investorId)}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
                  >
                    {/* Score circle */}
                    <div className={`w-10 h-10 rounded-full ${fitScoreBg(m.fitScore)} flex items-center justify-center shrink-0 ring-1 ring-inset ${
                      m.fitScore >= 80 ? "ring-emerald-500/20" : m.fitScore >= 65 ? "ring-[#4361EE]/20" : m.fitScore >= 50 ? "ring-amber-500/20" : "ring-white/[0.06]"
                    }`}>
                      <span className={`text-sm font-bold tabular-nums ${fitScoreColor(m.fitScore)}`}>{m.fitScore}</span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-white truncate">{m.name}</span>
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
                      <div className="flex items-center gap-1.5 mt-1">
                        {m.topReasons.slice(0, 2).map((r, ri) => (
                          <span key={r} className="text-[11px] text-white/30 truncate">
                            {ri > 0 && <span className="text-white/10 mr-1.5">|</span>}
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Cheque */}
                    {m.chequeMin != null && m.chequeMax != null && (
                      <span className="text-xs text-white/35 shrink-0 hidden sm:block font-medium tabular-nums">
                        {formatAmount(m.chequeMin)} – {formatAmount(m.chequeMax)}
                      </span>
                    )}

                    {/* Expand arrow */}
                    <ChevronDown
                      className={`w-4 h-4 text-white/20 shrink-0 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-white/[0.06]">
                      {/* Dealbreakers */}
                      {m.dealbreakers.length > 0 && (
                        <div className="mt-3 mb-3 rounded-lg border border-red-500/20 bg-red-500/[0.06] p-3 space-y-1">
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
                        <div className="mt-3 mb-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-3 space-y-1">
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
                        <p className="text-xs text-white/45 mt-3 mb-3 leading-relaxed">{m.description}</p>
                      )}

                      {/* Quick stats row */}
                      <div className="grid grid-cols-3 gap-2 mb-4 mt-3">
                        {m.aum && (
                          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                            <span className="text-[9px] text-white/25 uppercase tracking-wider block">AUM</span>
                            <span className="text-xs text-white/60 font-medium">{m.aum}</span>
                          </div>
                        )}
                        {m.fundSize != null && (
                          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                            <span className="text-[9px] text-white/25 uppercase tracking-wider block">Fund Size</span>
                            <span className="text-xs text-white/60 font-medium">{formatAmount(m.fundSize)}</span>
                          </div>
                        )}
                        {m.leadPreference && (
                          <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
                            <span className="text-[9px] text-white/25 uppercase tracking-wider block">Lead Pref</span>
                            <span className="text-xs text-white/60 font-medium capitalize">{m.leadPreference}</span>
                          </div>
                        )}
                      </div>

                      {/* Score breakdown bars */}
                      <div className="space-y-2 mb-4">
                        <h4 className="text-[10px] font-semibold text-white/40 uppercase tracking-wider">Score Breakdown</h4>
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
                              <span className="text-[10px] text-white/30 tabular-nums">{r.score}/{r.maxScore}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden ml-[18px]">
                              <div
                                className={`h-full rounded-full transition-all ${scoreBarColor(r.score, r.maxScore)}`}
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
                      <div className="flex flex-wrap gap-1 mb-4">
                        {m.stages.map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-white/[0.05] text-white/35 border border-white/[0.04]">{s}</span>
                        ))}
                        {m.sectors.slice(0, 5).map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded text-[10px] bg-[#4361EE]/[0.06] text-[#4361EE]/50 border border-[#4361EE]/10">{s}</span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 pt-3 border-t border-white/[0.06]">
                        <button
                          type="button"
                          onClick={() => handleSaveToPipeline(m)}
                          disabled={isSaved || isSaving}
                          className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                            isSaved
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 cursor-default"
                              : "bg-[#4361EE] text-white hover:bg-[#3651DE] disabled:opacity-50 shadow-sm"
                          }`}
                        >
                          <Bookmark className="w-3 h-3 inline mr-1.5" />
                          {isSaving ? "Saving..." : isSaved ? "Saved to Pipeline" : "Save to Pipeline"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDetailId(m.investorId)}
                          className="px-4 py-2 rounded-lg text-xs font-medium bg-white/[0.06] text-white/50 hover:text-white/70 hover:bg-white/[0.08] transition-all flex items-center gap-1 border border-white/[0.06]"
                        >
                          <ChevronRight className="w-3 h-3" />
                          Full Profile
                        </button>
                        {m.website && (
                          <a
                            href={m.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 rounded-lg text-xs font-medium bg-white/[0.06] text-white/50 hover:text-white/70 hover:bg-white/[0.08] transition-all flex items-center gap-1 border border-white/[0.06]"
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
        </div>
      )}

      {/* No results after filter */}
      {!loading && !error && matches.length > 0 && filtered.length === 0 && (
        <div className="text-center py-10 px-6">
          <p className="text-sm text-white/40">No investors match your current filters.</p>
          <button
            type="button"
            onClick={() => { setFilterType("all"); setMinScore(0); setFilterRegion("all"); setFilterLead("all"); setHideDealbreakers(false); setSearchQuery(""); }}
            className="mt-2 text-xs text-[#4361EE] hover:text-[#4361EE]/80 transition-colors"
          >
            Clear all filters
          </button>
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
