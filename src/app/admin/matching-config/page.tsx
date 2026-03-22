"use client";

import { useState, useEffect, useCallback } from "react";

const DEFAULT_WEIGHTS: Record<string, number> = {
  stage: 30,
  sector: 25,
  geography: 20,
  cheque: 20,
  businessModel: 15,
  customerType: 10,
  revenueModel: 10,
  traction: 15,
  dealStructure: 10,
  valuation: 10,
  leadFollow: 10,
  fundActivity: 5,
  portfolioConflict: -20,
  diversityImpact: 5,
  thesisKeyword: 10,
  currency: 5,
};

const WEIGHT_LABELS: Record<string, { label: string; description: string }> = {
  stage: { label: "Stage Fit", description: "Investor's stage focus vs. startup's stage" },
  sector: { label: "Sector Alignment", description: "Overlap between sectors/industries" },
  geography: { label: "Geography", description: "Location proximity scoring" },
  cheque: { label: "Cheque Size", description: "Ask amount vs. investor's cheque range" },
  businessModel: { label: "Business Model", description: "SaaS, marketplace, hardware, etc." },
  customerType: { label: "Customer Type", description: "B2B, B2C, B2B2C match" },
  revenueModel: { label: "Revenue Model", description: "Subscription, transactional, etc." },
  traction: { label: "Traction Threshold", description: "Revenue/growth vs. investor minimums" },
  dealStructure: { label: "Deal Structure", description: "Equity, SAFE, convertible note" },
  valuation: { label: "Valuation Range", description: "Pre-money vs. investor's range" },
  leadFollow: { label: "Lead/Follow", description: "Lead investor availability alignment" },
  fundActivity: { label: "Fund Activity", description: "Active vs. fully deployed fund" },
  portfolioConflict: { label: "Portfolio Conflict", description: "Penalty for competing portfolio companies" },
  diversityImpact: { label: "Diversity/Impact", description: "Bonus for diversity-focused alignment" },
  thesisKeyword: { label: "Thesis Keywords", description: "Keyword overlap with investor thesis" },
  currency: { label: "Currency", description: "Investor deploys in startup's currency" },
};

export default function AdminMatchingConfigPage() {
  const [weights, setWeights] = useState<Record<string, number>>(DEFAULT_WEIGHTS);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/matching-config")
      .then((r) => r.json())
      .then((data) => {
        if (data.weights && typeof data.weights === "object") {
          setWeights({ ...DEFAULT_WEIGHTS, ...data.weights });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalPositive = Object.values(weights).reduce((sum, w) => sum + Math.max(0, w), 0);
  const totalNegative = Object.values(weights).reduce((sum, w) => sum + Math.min(0, w), 0);

  const handleSave = useCallback(async () => {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/matching-config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ weights }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // ignore
    } finally {
      setSaving(false);
    }
  }, [weights]);

  const handleReset = () => setWeights({ ...DEFAULT_WEIGHTS });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-2" role="status">
        <span className="sr-only">Loading matching configuration</span>
        <div
          className="w-6 h-6 border-2 border-[#4361EE] border-t-transparent rounded-full animate-spin motion-reduce:animate-none motion-reduce:border-[#4361EE]/40"
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Matching Algorithm Config</h1>
          <p className="text-sm text-white/30 mt-1">
            Adjust scoring weights for investor matching dimensions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-white/5 text-white/40 hover:bg-white/10 transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#4361EE] text-white hover:bg-[#4361EE]/80 transition-colors disabled:opacity-50"
          >
            {saving ? "Saving..." : saved ? "Saved" : "Save Weights"}
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-4">
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-3">
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Max Positive</p>
          <p className="text-lg font-bold text-emerald-400">{totalPositive} pts</p>
        </div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-3">
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Max Penalty</p>
          <p className="text-lg font-bold text-red-400">{totalNegative} pts</p>
        </div>
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-3">
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">Net Range</p>
          <p className="text-lg font-bold text-white">0–{totalPositive + totalNegative} → 0–100</p>
        </div>
      </div>

      {/* Weight Sliders */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 divide-y divide-white/5">
        {Object.entries(WEIGHT_LABELS).map(([key, { label, description }]) => {
          const w = weights[key] ?? 0;
          const isNegative = key === "portfolioConflict";
          return (
            <div key={key} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-2">
              <div className="sm:w-48 shrink-0">
                <p className="text-sm font-medium text-white/70">{label}</p>
                <p className="text-xs text-white/25">{description}</p>
              </div>
              <div className="flex-1 flex items-center gap-3">
                <input
                  type="range"
                  min={isNegative ? -40 : 0}
                  max={isNegative ? 0 : 50}
                  step={5}
                  value={w}
                  onChange={(e) =>
                    setWeights((prev) => ({ ...prev, [key]: parseInt(e.target.value) }))
                  }
                  className="flex-1 h-1.5 appearance-none rounded-lg bg-white/10 accent-[#4361EE]"
                />
                <span
                  className={`w-12 text-right text-sm font-mono ${
                    isNegative ? "text-red-400" : "text-white/60"
                  }`}
                >
                  {w > 0 ? `+${w}` : w}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info */}
      <div className="rounded-2xl bg-white/[0.04] border border-white/5 p-4">
        <p className="text-xs text-white/30">
          Scores are computed on a 0–{totalPositive + totalNegative} scale, then normalized to 0–100.
          Missing data dimensions are excluded from scoring (denominator adjusts automatically).
          Changes take effect immediately for new matches.
        </p>
      </div>
    </div>
  );
}
