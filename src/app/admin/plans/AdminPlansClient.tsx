"use client";

import { useState, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PlanRow {
  id: string;
  planKey: string;
  sortOrder: number;
  enabled: boolean;
  displayName: string;
  description: string;
  price: string;
  priceUnit: string;
  highlight: boolean;
  badge: string | null;
  ctaText: string;
  ctaHref: string;
  features: string; // JSON string[] from DB
  stripePriceId: string | null;
  stripeAmount: number | null;
  maxDecks: number;
  allowedThemes: string; // JSON string[]
  piqScoreDetail: string;
  showBranding: boolean;
  pdfWatermark: boolean;
  pptxExport: boolean;
  analytics: boolean;
  investorVariants: boolean;
  abTesting: boolean;
  followUpAlerts: boolean;
  investorCRM: boolean;
  fundraiseTracker: boolean;
  editor: boolean;
  aiCoachingPerSlide: boolean;
  investorLens: boolean;
  pitchSimulator: boolean;
  maxVersionHistory: number;
  smartBlocks: boolean;
  deckTemplates: boolean;
  appendixGenerator: boolean;
  teamCollaboration: boolean;
  maxWorkspaceMembers: number;
  customDomain: boolean;
  apiAccess: boolean;
  batchScoring: boolean;
  maxApiKeys: number;
  apiRateLimit: number;
  maxBatchSize: number;
  pitchPractice: boolean;
}

/** Local editable form state (features parsed to string[]) */
interface PlanForm {
  planKey: string;
  sortOrder: number;
  enabled: boolean;
  displayName: string;
  description: string;
  price: string;
  priceUnit: string;
  highlight: boolean;
  badge: string;
  ctaText: string;
  ctaHref: string;
  features: string[];
  stripePriceId: string;
  stripeAmount: number | null;
  maxDecks: number;
  piqScoreDetail: string;
  showBranding: boolean;
  pdfWatermark: boolean;
  pptxExport: boolean;
  analytics: boolean;
  investorVariants: boolean;
  abTesting: boolean;
  followUpAlerts: boolean;
  investorCRM: boolean;
  fundraiseTracker: boolean;
  editor: boolean;
  aiCoachingPerSlide: boolean;
  investorLens: boolean;
  pitchSimulator: boolean;
  maxVersionHistory: number;
  smartBlocks: boolean;
  deckTemplates: boolean;
  appendixGenerator: boolean;
  teamCollaboration: boolean;
  maxWorkspaceMembers: number;
  customDomain: boolean;
  apiAccess: boolean;
  batchScoring: boolean;
  maxApiKeys: number;
  apiRateLimit: number;
  maxBatchSize: number;
  pitchPractice: boolean;
}

function rowToForm(row: PlanRow): PlanForm {
  let features: string[] = [];
  try {
    features = JSON.parse(row.features);
  } catch {
    features = [];
  }
  return {
    planKey: row.planKey,
    sortOrder: row.sortOrder,
    enabled: row.enabled,
    displayName: row.displayName,
    description: row.description,
    price: row.price,
    priceUnit: row.priceUnit,
    highlight: row.highlight,
    badge: row.badge ?? "",
    ctaText: row.ctaText,
    ctaHref: row.ctaHref,
    features,
    stripePriceId: row.stripePriceId ?? "",
    stripeAmount: row.stripeAmount,
    maxDecks: row.maxDecks,
    piqScoreDetail: row.piqScoreDetail,
    showBranding: row.showBranding,
    pdfWatermark: row.pdfWatermark,
    pptxExport: row.pptxExport,
    analytics: row.analytics,
    investorVariants: row.investorVariants,
    abTesting: row.abTesting,
    followUpAlerts: row.followUpAlerts,
    investorCRM: row.investorCRM,
    fundraiseTracker: row.fundraiseTracker,
    editor: row.editor,
    aiCoachingPerSlide: row.aiCoachingPerSlide,
    investorLens: row.investorLens,
    pitchSimulator: row.pitchSimulator,
    maxVersionHistory: row.maxVersionHistory,
    smartBlocks: row.smartBlocks,
    deckTemplates: row.deckTemplates,
    appendixGenerator: row.appendixGenerator,
    teamCollaboration: row.teamCollaboration,
    maxWorkspaceMembers: row.maxWorkspaceMembers,
    customDomain: row.customDomain,
    apiAccess: row.apiAccess,
    batchScoring: row.batchScoring,
    maxApiKeys: row.maxApiKeys,
    apiRateLimit: row.apiRateLimit,
    maxBatchSize: row.maxBatchSize,
    pitchPractice: row.pitchPractice,
  };
}

// ---------------------------------------------------------------------------
// Reusable UI Atoms
// ---------------------------------------------------------------------------

function Toggle({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        value ? "bg-electric" : "bg-white/10"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
          value ? "translate-x-4.5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

function FieldRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-xs text-white/50 shrink-0">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

function NumberWithUnlimited({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  label?: string;
}) {
  const isUnlimited = value === -1;
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        min={0}
        disabled={isUnlimited}
        value={isUnlimited ? "" : value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white disabled:opacity-30 disabled:cursor-not-allowed"
      />
      <label className="flex items-center gap-1.5 text-xs text-white/40 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isUnlimited}
          onChange={() => onChange(isUnlimited ? 0 : -1)}
          className="accent-electric"
        />
        {label ?? "Unlimited"}
      </label>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-white/25 pt-4 pb-1 border-t border-white/5 mt-2">
      {title}
    </h4>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function CardSkeleton() {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6 animate-pulse motion-reduce:animate-none">
      <div className="flex items-center gap-4">
        <div className="h-4 w-20 bg-white/5 rounded" />
        <div className="h-5 w-32 bg-white/5 rounded" />
        <div className="ml-auto h-4 w-12 bg-white/5 rounded" />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Plan Card
// ---------------------------------------------------------------------------

function PlanCard({
  form,
  setForm,
  expanded,
  onToggleExpand,
  onSave,
  saving,
  flash,
}: {
  form: PlanForm;
  setForm: (fn: (prev: PlanForm) => PlanForm) => void;
  expanded: boolean;
  onToggleExpand: () => void;
  onSave: () => void;
  saving: boolean;
  flash: { type: "success" | "error"; msg: string } | null;
}) {
  const update = useCallback(
    <K extends keyof PlanForm>(key: K, val: PlanForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: val }));
    },
    [setForm]
  );

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
      {/* Header — always visible */}
      <button
        type="button"
        onClick={onToggleExpand}
        className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-white/[0.02] transition-colors"
      >
        <code className="text-[11px] text-white/25 font-mono bg-white/5 px-2 py-0.5 rounded">
          {form.planKey}
        </code>
        <span className="font-semibold text-sm text-white">
          {form.displayName}
        </span>
        <span className="text-xs text-white/40">
          {form.price}
          {form.priceUnit}
        </span>
        {form.badge && (
          <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-electric/15 text-electric">
            {form.badge}
          </span>
        )}
        <span className="ml-auto flex items-center gap-3">
          <span
            className={`text-[10px] font-semibold uppercase tracking-wider ${
              form.enabled ? "text-emerald-400" : "text-white/20"
            }`}
          >
            {form.enabled ? "Enabled" : "Disabled"}
          </span>
          <svg
            className={`w-4 h-4 text-white/30 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 8.25l-7.5 7.5-7.5-7.5"
            />
          </svg>
        </span>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div className="px-6 pb-6 space-y-4 border-t border-white/5">
          {/* Flash message */}
          {flash && (
            <div
              className={`mt-4 rounded-xl px-4 py-2.5 text-sm ${
                flash.type === "success"
                  ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-400"
              }`}
            >
              {flash.msg}
            </div>
          )}

          {/* ── Section A: Identity & Display ── */}
          <SectionHeader title="Identity & Display" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            <FieldRow label="Display Name">
              <input
                type="text"
                value={form.displayName}
                onChange={(e) => update("displayName", e.target.value)}
                className="w-48 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
              />
            </FieldRow>
            <FieldRow label="Description">
              <input
                type="text"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                className="w-48 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
              />
            </FieldRow>
            <FieldRow label="Sort Order">
              <input
                type="number"
                value={form.sortOrder}
                onChange={(e) => update("sortOrder", Number(e.target.value) || 0)}
                className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
              />
            </FieldRow>
            <FieldRow label="Enabled">
              <Toggle
                value={form.enabled}
                onChange={(v) => update("enabled", v)}
              />
            </FieldRow>
          </div>

          {/* ── Section B: Pricing & Stripe ── */}
          <SectionHeader title="Pricing & Stripe" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            <FieldRow label="Display Price">
              <input
                type="text"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="$29"
                className="w-32 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
              />
            </FieldRow>
            <FieldRow label="Price Unit">
              <select
                value={form.priceUnit}
                onChange={(e) => update("priceUnit", e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
              >
                <option value="/mo">/mo</option>
                <option value="/yr">/yr</option>
                <option value="">None</option>
              </select>
            </FieldRow>
            <FieldRow label="Stripe Price ID">
              <input
                type="text"
                value={form.stripePriceId}
                onChange={(e) => update("stripePriceId", e.target.value)}
                placeholder="price_..."
                className="w-48 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white font-mono text-xs"
              />
            </FieldRow>
            <FieldRow label="Amount (cents)">
              <input
                type="number"
                value={form.stripeAmount ?? ""}
                onChange={(e) =>
                  update(
                    "stripeAmount",
                    e.target.value === "" ? null : Number(e.target.value)
                  )
                }
                placeholder="2900"
                className="w-28 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
              />
            </FieldRow>
          </div>

          {/* ── Section C: Card Appearance ── */}
          <SectionHeader title="Card Appearance" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            <FieldRow label="Highlight / Featured">
              <Toggle
                value={form.highlight}
                onChange={(v) => update("highlight", v)}
              />
            </FieldRow>
            <FieldRow label="Badge Text">
              <input
                type="text"
                value={form.badge}
                onChange={(e) => update("badge", e.target.value)}
                placeholder="Popular"
                className="w-32 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
              />
            </FieldRow>
            <FieldRow label="CTA Button Text">
              <input
                type="text"
                value={form.ctaText}
                onChange={(e) => update("ctaText", e.target.value)}
                className="w-40 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
              />
            </FieldRow>
            <FieldRow label="CTA Link">
              <input
                type="text"
                value={form.ctaHref}
                onChange={(e) => update("ctaHref", e.target.value)}
                className="w-40 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white font-mono text-xs"
              />
            </FieldRow>
          </div>

          {/* ── Section D: Feature Bullets ── */}
          <SectionHeader title="Feature Bullets" />
          <div className="space-y-2">
            {form.features.map((feat, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-[10px] text-white/20 w-5 text-right tabular-nums">
                  {i + 1}.
                </span>
                <input
                  type="text"
                  value={feat}
                  onChange={(e) => {
                    const next = [...form.features];
                    next[i] = e.target.value;
                    update("features", next);
                  }}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    const next = form.features.filter((_, j) => j !== i);
                    update("features", next);
                  }}
                  className="text-white/20 hover:text-red-400 transition-colors p-1"
                  aria-label="Remove feature"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => update("features", [...form.features, ""])}
              className="text-xs text-electric hover:text-electric/80 transition-colors mt-1"
            >
              + Add feature
            </button>
          </div>

          {/* ── Section E: Plan Limits ── */}
          <SectionHeader title="Core Limits" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            <FieldRow label="Max Decks">
              <NumberWithUnlimited
                value={form.maxDecks}
                onChange={(v) => update("maxDecks", v)}
              />
            </FieldRow>
            <FieldRow label="PIQ Score Detail">
              <select
                value={form.piqScoreDetail}
                onChange={(e) => update("piqScoreDetail", e.target.value)}
                className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
              >
                <option value="basic">basic</option>
                <option value="full">full</option>
              </select>
            </FieldRow>
            <FieldRow label="Show Branding">
              <Toggle
                value={form.showBranding}
                onChange={(v) => update("showBranding", v)}
              />
            </FieldRow>
            <FieldRow label="PDF Watermark">
              <Toggle
                value={form.pdfWatermark}
                onChange={(v) => update("pdfWatermark", v)}
              />
            </FieldRow>
            <FieldRow label="PPTX Export">
              <Toggle
                value={form.pptxExport}
                onChange={(v) => update("pptxExport", v)}
              />
            </FieldRow>
          </div>

          <SectionHeader title="Growth Features" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            <FieldRow label="Analytics">
              <Toggle
                value={form.analytics}
                onChange={(v) => update("analytics", v)}
              />
            </FieldRow>
            <FieldRow label="Investor Variants">
              <Toggle
                value={form.investorVariants}
                onChange={(v) => update("investorVariants", v)}
              />
            </FieldRow>
            <FieldRow label="A/B Testing">
              <Toggle
                value={form.abTesting}
                onChange={(v) => update("abTesting", v)}
              />
            </FieldRow>
            <FieldRow label="Follow-up Alerts">
              <Toggle
                value={form.followUpAlerts}
                onChange={(v) => update("followUpAlerts", v)}
              />
            </FieldRow>
            <FieldRow label="Investor CRM">
              <Toggle
                value={form.investorCRM}
                onChange={(v) => update("investorCRM", v)}
              />
            </FieldRow>
            <FieldRow label="Fundraise Tracker">
              <Toggle
                value={form.fundraiseTracker}
                onChange={(v) => update("fundraiseTracker", v)}
              />
            </FieldRow>
          </div>

          <SectionHeader title="Editor Features" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            <FieldRow label="Editor">
              <Toggle
                value={form.editor}
                onChange={(v) => update("editor", v)}
              />
            </FieldRow>
            <FieldRow label="AI Coaching Per Slide">
              <Toggle
                value={form.aiCoachingPerSlide}
                onChange={(v) => update("aiCoachingPerSlide", v)}
              />
            </FieldRow>
            <FieldRow label="Investor Lens">
              <Toggle
                value={form.investorLens}
                onChange={(v) => update("investorLens", v)}
              />
            </FieldRow>
            <FieldRow label="Pitch Simulator">
              <Toggle
                value={form.pitchSimulator}
                onChange={(v) => update("pitchSimulator", v)}
              />
            </FieldRow>
            <FieldRow label="Max Version History">
              <NumberWithUnlimited
                value={form.maxVersionHistory}
                onChange={(v) => update("maxVersionHistory", v)}
              />
            </FieldRow>
            <FieldRow label="Smart Blocks">
              <Toggle
                value={form.smartBlocks}
                onChange={(v) => update("smartBlocks", v)}
              />
            </FieldRow>
            <FieldRow label="Deck Templates">
              <Toggle
                value={form.deckTemplates}
                onChange={(v) => update("deckTemplates", v)}
              />
            </FieldRow>
            <FieldRow label="Appendix Generator">
              <Toggle
                value={form.appendixGenerator}
                onChange={(v) => update("appendixGenerator", v)}
              />
            </FieldRow>
          </div>

          <SectionHeader title="Enterprise Features" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            <FieldRow label="Team Collaboration">
              <Toggle
                value={form.teamCollaboration}
                onChange={(v) => update("teamCollaboration", v)}
              />
            </FieldRow>
            <FieldRow label="Max Workspace Members">
              <NumberWithUnlimited
                value={form.maxWorkspaceMembers}
                onChange={(v) => update("maxWorkspaceMembers", v)}
              />
            </FieldRow>
            <FieldRow label="Custom Domain">
              <Toggle
                value={form.customDomain}
                onChange={(v) => update("customDomain", v)}
              />
            </FieldRow>
            <FieldRow label="API Access">
              <Toggle
                value={form.apiAccess}
                onChange={(v) => update("apiAccess", v)}
              />
            </FieldRow>
            <FieldRow label="Batch Scoring">
              <Toggle
                value={form.batchScoring}
                onChange={(v) => update("batchScoring", v)}
              />
            </FieldRow>
            <FieldRow label="Max API Keys">
              <input
                type="number"
                min={0}
                value={form.maxApiKeys}
                onChange={(e) =>
                  update("maxApiKeys", Number(e.target.value) || 0)
                }
                className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
              />
            </FieldRow>
            <FieldRow label="API Rate Limit">
              <input
                type="number"
                min={0}
                value={form.apiRateLimit}
                onChange={(e) =>
                  update("apiRateLimit", Number(e.target.value) || 0)
                }
                className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
              />
            </FieldRow>
            <FieldRow label="Max Batch Size">
              <input
                type="number"
                min={0}
                value={form.maxBatchSize}
                onChange={(e) =>
                  update("maxBatchSize", Number(e.target.value) || 0)
                }
                className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
              />
            </FieldRow>
            <FieldRow label="Pitch Practice">
              <Toggle
                value={form.pitchPractice}
                onChange={(v) => update("pitchPractice", v)}
              />
            </FieldRow>
          </div>

          {/* Save */}
          <div className="pt-4 flex justify-end">
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="bg-electric text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-electric/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AdminPlansClient() {
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [forms, setForms] = useState<Record<string, PlanForm>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [flashes, setFlashes] = useState<
    Record<string, { type: "success" | "error"; msg: string }>
  >({});
  const [seeding, setSeeding] = useState(false);
  const [seedFlash, setSeedFlash] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  const fetchPlans = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/plans");
      if (!res.ok) throw new Error("Failed to fetch plans");
      const data = await res.json();
      const rows: PlanRow[] = data.plans ?? [];
      setPlans(rows);
      const formMap: Record<string, PlanForm> = {};
      for (const row of rows) {
        formMap[row.planKey] = rowToForm(row);
      }
      setForms(formMap);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  async function handleSave(planKey: string) {
    const form = forms[planKey];
    if (!form) return;

    setSaving(planKey);
    setFlashes((prev) => {
      const next = { ...prev };
      delete next[planKey];
      return next;
    });

    try {
      const body = {
        ...form,
        badge: form.badge || null,
        stripePriceId: form.stripePriceId || null,
      };

      const res = await fetch("/api/admin/plans", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Save failed");
      }

      setFlashes((prev) => ({
        ...prev,
        [planKey]: { type: "success", msg: "Plan saved successfully" },
      }));

      // Refresh from server
      await fetchPlans();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setFlashes((prev) => ({
        ...prev,
        [planKey]: { type: "error", msg },
      }));
    } finally {
      setSaving(null);
    }
  }

  async function handleSeed() {
    setSeeding(true);
    setSeedFlash(null);

    try {
      const res = await fetch("/api/admin/plans/seed", { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Seed failed");
      }
      const data = await res.json();
      setSeedFlash({
        type: "success",
        msg: data.message || `Seeded ${data.seeded ?? 0} plans`,
      });
      await fetchPlans();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Seed failed";
      setSeedFlash({ type: "error", msg });
    } finally {
      setSeeding(false);
    }
  }

  const sorted = [...plans].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Plans</h1>
          <p className="text-sm text-white/30 mt-1">
            Manage pricing tiers, features, and limits
          </p>
        </div>
        <button
          type="button"
          onClick={handleSeed}
          disabled={seeding}
          className="bg-white/5 text-white/50 text-xs font-medium px-4 py-2 rounded-xl hover:bg-white/10 hover:text-white/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {seeding ? "Seeding..." : "Seed Plans"}
        </button>
      </div>

      {/* Seed flash */}
      {seedFlash && (
        <div
          className={`rounded-xl px-4 py-3 text-sm ${
            seedFlash.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          {seedFlash.msg}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {/* Empty state */}
      {!loading && plans.length === 0 && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 px-6 py-12 text-center">
          <p className="text-sm text-white/30">
            No plans configured yet. Click &quot;Seed Plans&quot; to create
            default plans.
          </p>
        </div>
      )}

      {/* Plan cards */}
      {!loading &&
        sorted.map((plan) => {
          const form = forms[plan.planKey];
          if (!form) return null;
          return (
            <PlanCard
              key={plan.planKey}
              form={form}
              setForm={(fn) =>
                setForms((prev) => ({
                  ...prev,
                  [plan.planKey]: fn(prev[plan.planKey]),
                }))
              }
              expanded={expanded === plan.planKey}
              onToggleExpand={() =>
                setExpanded((prev) =>
                  prev === plan.planKey ? null : plan.planKey
                )
              }
              onSave={() => handleSave(plan.planKey)}
              saving={saving === plan.planKey}
              flash={flashes[plan.planKey] ?? null}
            />
          );
        })}
    </div>
  );
}
