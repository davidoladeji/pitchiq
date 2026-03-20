"use client";

import React, { useState, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TYPE_OPTIONS = ["vc", "angel", "accelerator", "family_office", "corporate"] as const;
type InvestorType = (typeof TYPE_OPTIONS)[number];

const STAGE_OPTIONS = ["pre-seed", "seed", "series-a", "series-b", "growth"] as const;

const SECTOR_OPTIONS = [
  "saas", "ai", "fintech", "healthtech", "consumer", "enterprise", "marketplace",
  "crypto", "climate", "biotech", "edtech", "logistics", "security", "defense",
  "proptech", "food-tech", "insurtech", "robotics", "aerospace", "gaming",
  "infrastructure", "web3", "defi", "hardware",
] as const;

const GEO_OPTIONS = [
  "US", "Europe", "Asia", "India", "Southeast Asia", "Latin America",
  "MENA", "Africa", "Israel", "China", "Global",
] as const;

const TYPE_BADGE_STYLES: Record<InvestorType, { bg: string; text: string }> = {
  vc: { bg: "bg-electric/15", text: "text-electric" },
  angel: { bg: "bg-emerald-500/15", text: "text-emerald-400" },
  accelerator: { bg: "bg-violet-500/15", text: "text-violet-400" },
  family_office: { bg: "bg-amber-500/15", text: "text-amber-400" },
  corporate: { bg: "bg-white/10", text: "text-white/50" },
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InvestorRow {
  id: string;
  name: string;
  type: string;
  website: string | null;
  logoUrl: string | null;
  description: string | null;
  stages: string;
  sectors: string;
  geographies: string;
  chequeMin: number | null;
  chequeMax: number | null;
  thesis: string | null;
  notableDeals: string;
  aum: string | null;
  partnerCount: number | null;
  contactEmail: string | null;
  linkedIn: string | null;
  twitter: string | null;
  source: string;
  verified: boolean;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}

interface InvestorForm {
  name: string;
  type: string;
  website: string;
  description: string;
  stages: string[];
  sectors: string[];
  geographies: string[];
  chequeMin: number | null;
  chequeMax: number | null;
  thesis: string;
  notableDeals: string[];
  aum: string;
  partnerCount: number | null;
  contactEmail: string;
  linkedIn: string;
  twitter: string;
  verified: boolean;
  enabled: boolean;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseJsonArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function rowToForm(row: InvestorRow): InvestorForm {
  return {
    name: row.name,
    type: row.type,
    website: row.website ?? "",
    description: row.description ?? "",
    stages: parseJsonArray(row.stages),
    sectors: parseJsonArray(row.sectors),
    geographies: parseJsonArray(row.geographies),
    chequeMin: row.chequeMin,
    chequeMax: row.chequeMax,
    thesis: row.thesis ?? "",
    notableDeals: parseJsonArray(row.notableDeals),
    aum: row.aum ?? "",
    partnerCount: row.partnerCount,
    contactEmail: row.contactEmail ?? "",
    linkedIn: row.linkedIn ?? "",
    twitter: row.twitter ?? "",
    verified: row.verified,
    enabled: row.enabled,
  };
}

function emptyForm(): InvestorForm {
  return {
    name: "",
    type: "vc",
    website: "",
    description: "",
    stages: [],
    sectors: [],
    geographies: [],
    chequeMin: null,
    chequeMax: null,
    thesis: "",
    notableDeals: [],
    aum: "",
    partnerCount: null,
    contactEmail: "",
    linkedIn: "",
    twitter: "",
    verified: false,
    enabled: true,
  };
}

function formatCheque(amount: number | null): string {
  if (amount === null || amount === undefined) return "-";
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(amount % 1_000_000_000 === 0 ? 0 : 1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(amount % 1_000_000 === 0 ? 0 : 1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(amount % 1_000 === 0 ? 0 : 1)}K`;
  return `$${amount}`;
}

function formatChequeRange(min: number | null, max: number | null): string {
  if (min === null && max === null) return "-";
  if (min !== null && max !== null) return `${formatCheque(min)} - ${formatCheque(max)}`;
  if (min !== null) return `${formatCheque(min)}+`;
  return `Up to ${formatCheque(max)}`;
}

function typeBadge(type: string) {
  const style = TYPE_BADGE_STYLES[type as InvestorType] ?? TYPE_BADGE_STYLES.corporate;
  const label = type.replace("_", " ");
  return (
    <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text}`}>
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Reusable UI Atoms
// ---------------------------------------------------------------------------

function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
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

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <span className="text-xs text-white/50 shrink-0">{label}</span>
      <div className="flex items-center gap-2">{children}</div>
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

function MultiCheckbox({
  options,
  selected,
  onChange,
}: {
  options: readonly string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const isChecked = selected.includes(opt);
        return (
          <label
            key={opt}
            className={`flex items-center gap-1.5 text-xs cursor-pointer select-none px-2.5 py-1.5 rounded-lg border transition-colors ${
              isChecked
                ? "bg-electric/10 border-electric/30 text-electric"
                : "bg-white/[0.03] border-white/5 text-white/40 hover:text-white/60"
            }`}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => {
                if (isChecked) {
                  onChange(selected.filter((s) => s !== opt));
                } else {
                  onChange([...selected, opt]);
                }
              }}
              className="accent-electric w-3 h-3"
            />
            {opt}
          </label>
        );
      })}
    </div>
  );
}

function Pill({ text, color }: { text: string; color?: string }) {
  const cls = color ?? "bg-white/5 text-white/40";
  return (
    <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium ${cls}`}>
      {text}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Skeletons
// ---------------------------------------------------------------------------

function TableSkeleton() {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6 animate-pulse space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-4 w-40 bg-white/5 rounded" />
          <div className="h-4 w-16 bg-white/5 rounded" />
          <div className="h-4 w-24 bg-white/5 rounded" />
          <div className="h-4 w-20 bg-white/5 rounded" />
          <div className="ml-auto h-4 w-12 bg-white/5 rounded" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Expanded Row (Edit Form)
// ---------------------------------------------------------------------------

function InvestorEditRow({
  form,
  setForm,
  onSave,
  onDelete,
  saving,
  deleting,
  flash,
  source,
}: {
  form: InvestorForm;
  setForm: (fn: (prev: InvestorForm) => InvestorForm) => void;
  onSave: () => void;
  onDelete: () => void;
  saving: boolean;
  deleting: boolean;
  flash: { type: "success" | "error"; msg: string } | null;
  source: string;
}) {
  const update = useCallback(
    <K extends keyof InvestorForm>(key: K, val: InvestorForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: val }));
    },
    [setForm]
  );

  const [confirmDel, setConfirmDel] = useState(false);

  return (
    <tr>
      <td colSpan={8} className="px-5 py-4 border-b border-white/5 bg-white/[0.01]">
        {flash && (
          <div
            className={`mb-4 rounded-xl px-4 py-2.5 text-sm ${
              flash.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}
          >
            {flash.msg}
          </div>
        )}

        {/* Identity */}
        <SectionHeader title="Identity" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <FieldRow label="Name">
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              className="w-56 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
            />
          </FieldRow>
          <FieldRow label="Type">
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t} className="bg-[#1A1A24]">
                  {t.replace("_", " ")}
                </option>
              ))}
            </select>
          </FieldRow>
          <FieldRow label="Website">
            <input
              type="text"
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://..."
              className="w-56 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
            />
          </FieldRow>
          <FieldRow label="Description">
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={2}
              className="w-56 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white resize-none"
            />
          </FieldRow>
        </div>

        {/* Matching Criteria */}
        <SectionHeader title="Matching Criteria" />
        <div className="space-y-3">
          <div>
            <span className="text-xs text-white/50 block mb-1.5">Stages</span>
            <MultiCheckbox options={STAGE_OPTIONS} selected={form.stages} onChange={(v) => update("stages", v)} />
          </div>
          <div>
            <span className="text-xs text-white/50 block mb-1.5">Sectors</span>
            <MultiCheckbox options={SECTOR_OPTIONS} selected={form.sectors} onChange={(v) => update("sectors", v)} />
          </div>
          <div>
            <span className="text-xs text-white/50 block mb-1.5">Geographies</span>
            <MultiCheckbox options={GEO_OPTIONS} selected={form.geographies} onChange={(v) => update("geographies", v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
            <FieldRow label="Cheque Min ($)">
              <input
                type="number"
                min={0}
                value={form.chequeMin ?? ""}
                onChange={(e) => update("chequeMin", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="50000"
                className="w-32 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
              />
            </FieldRow>
            <FieldRow label="Cheque Max ($)">
              <input
                type="number"
                min={0}
                value={form.chequeMax ?? ""}
                onChange={(e) => update("chequeMax", e.target.value === "" ? null : Number(e.target.value))}
                placeholder="2000000"
                className="w-32 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
              />
            </FieldRow>
          </div>
          <div>
            <span className="text-xs text-white/50 block mb-1.5">Thesis</span>
            <textarea
              value={form.thesis}
              onChange={(e) => update("thesis", e.target.value)}
              rows={3}
              placeholder="Investment thesis or focus areas..."
              className="w-full max-w-xl bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white resize-none"
            />
          </div>
        </div>

        {/* Portfolio */}
        <SectionHeader title="Portfolio" />
        <div className="space-y-2">
          <span className="text-xs text-white/50 block mb-1">Notable Deals</span>
          {form.notableDeals.map((deal, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-[10px] text-white/20 w-5 text-right tabular-nums">{i + 1}.</span>
              <input
                type="text"
                value={deal}
                onChange={(e) => {
                  const next = [...form.notableDeals];
                  next[i] = e.target.value;
                  update("notableDeals", next);
                }}
                className="flex-1 max-w-xs bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
              />
              <button
                type="button"
                onClick={() => update("notableDeals", form.notableDeals.filter((_, j) => j !== i))}
                className="text-white/20 hover:text-red-400 transition-colors p-1"
                aria-label="Remove deal"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => update("notableDeals", [...form.notableDeals, ""])}
            className="text-xs text-electric hover:text-electric/80 transition-colors mt-1"
          >
            + Add deal
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 mt-2">
          <FieldRow label="AUM">
            <input
              type="text"
              value={form.aum}
              onChange={(e) => update("aum", e.target.value)}
              placeholder="$500M"
              className="w-32 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
            />
          </FieldRow>
          <FieldRow label="Partner Count">
            <input
              type="number"
              min={0}
              value={form.partnerCount ?? ""}
              onChange={(e) => update("partnerCount", e.target.value === "" ? null : Number(e.target.value))}
              className="w-20 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
            />
          </FieldRow>
        </div>

        {/* Contact */}
        <SectionHeader title="Contact" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <FieldRow label="Email">
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => update("contactEmail", e.target.value)}
              placeholder="partner@firm.com"
              className="w-56 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
            />
          </FieldRow>
          <FieldRow label="LinkedIn">
            <input
              type="text"
              value={form.linkedIn}
              onChange={(e) => update("linkedIn", e.target.value)}
              placeholder="https://linkedin.com/in/..."
              className="w-56 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
            />
          </FieldRow>
          <FieldRow label="Twitter">
            <input
              type="text"
              value={form.twitter}
              onChange={(e) => update("twitter", e.target.value)}
              placeholder="@handle"
              className="w-56 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
            />
          </FieldRow>
        </div>

        {/* Admin */}
        <SectionHeader title="Admin" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
          <FieldRow label="Source">
            <span className="text-xs text-white/30 font-mono bg-white/5 px-2 py-0.5 rounded">{source}</span>
          </FieldRow>
          <FieldRow label="Verified">
            <Toggle value={form.verified} onChange={(v) => update("verified", v)} />
          </FieldRow>
          <FieldRow label="Enabled">
            <Toggle value={form.enabled} onChange={(v) => update("enabled", v)} />
          </FieldRow>
        </div>

        {/* Actions */}
        <div className="pt-4 flex items-center justify-between">
          <div>
            {!confirmDel ? (
              <button
                type="button"
                onClick={() => setConfirmDel(true)}
                className="px-4 py-2 rounded-xl bg-red-500/10 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
              >
                Delete Investor
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs text-red-400 font-medium">Confirm delete?</span>
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={deleting}
                  className="px-3 py-1.5 rounded-lg bg-red-500/20 text-xs font-semibold text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                >
                  {deleting ? "Deleting..." : "Yes, delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDel(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-xs text-white/50 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="bg-electric text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-electric/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Add Investor Modal
// ---------------------------------------------------------------------------

function AddInvestorModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: () => void;
}) {
  const [form, setForm] = useState<InvestorForm>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = useCallback(
    <K extends keyof InvestorForm>(key: K, val: InvestorForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: val }));
    },
    []
  );

  async function handleCreate() {
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/investors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to create investor");
      }
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#1A1A24] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6">
        <h2 className="text-lg font-bold text-white mb-1">Add Investor</h2>
        <p className="text-sm text-white/40 mb-4">Create a new investor profile for matching.</p>

        {error && (
          <div className="mb-4 rounded-xl px-4 py-2.5 text-sm bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        {/* Name & Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mb-4">
          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Sequoia Capital"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/25"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">Type</label>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t} className="bg-[#1A1A24]">
                  {t.replace("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">Website</label>
            <input
              type="text"
              value={form.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/25"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={2}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white resize-none placeholder:text-white/25"
            />
          </div>
        </div>

        {/* Stages */}
        <div className="mb-4">
          <span className="text-xs text-white/50 block mb-1.5 font-medium">Stages</span>
          <MultiCheckbox options={STAGE_OPTIONS} selected={form.stages} onChange={(v) => update("stages", v)} />
        </div>

        {/* Sectors */}
        <div className="mb-4">
          <span className="text-xs text-white/50 block mb-1.5 font-medium">Sectors</span>
          <MultiCheckbox options={SECTOR_OPTIONS} selected={form.sectors} onChange={(v) => update("sectors", v)} />
        </div>

        {/* Geographies */}
        <div className="mb-4">
          <span className="text-xs text-white/50 block mb-1.5 font-medium">Geographies</span>
          <MultiCheckbox options={GEO_OPTIONS} selected={form.geographies} onChange={(v) => update("geographies", v)} />
        </div>

        {/* Cheque range */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 mb-6">
          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">Cheque Min ($)</label>
            <input
              type="number"
              min={0}
              value={form.chequeMin ?? ""}
              onChange={(e) => update("chequeMin", e.target.value === "" ? null : Number(e.target.value))}
              placeholder="50000"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/25"
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">Cheque Max ($)</label>
            <input
              type="number"
              min={0}
              value={form.chequeMax ?? ""}
              onChange={(e) => update("chequeMax", e.target.value === "" ? null : Number(e.target.value))}
              placeholder="2000000"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/25"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/5 text-sm text-white/50 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={saving}
            className="bg-electric text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-electric/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Creating..." : "Create Investor"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AdminInvestorsClient() {
  const [investors, setInvestors] = useState<InvestorRow[]>([]);
  const [forms, setForms] = useState<Record<string, InvestorForm>>({});
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterVerified, setFilterVerified] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [flashes, setFlashes] = useState<Record<string, { type: "success" | "error"; msg: string }>>({});
  const [seeding, setSeeding] = useState(false);
  const [seedFlash, setSeedFlash] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchInvestors = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filterType !== "all") params.set("type", filterType);
      if (filterVerified) params.set("verified", "true");
      const res = await fetch(`/api/admin/investors?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch investors");
      const data = await res.json();
      const rows: InvestorRow[] = data.investors ?? [];
      setInvestors(rows);
      setTotal(data.total ?? rows.length);
      const formMap: Record<string, InvestorForm> = {};
      for (const row of rows) {
        formMap[row.id] = rowToForm(row);
      }
      setForms(formMap);
    } catch {
      setInvestors([]);
    } finally {
      setLoading(false);
    }
  }, [search, filterType, filterVerified]);

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      fetchInvestors();
    }, search ? 300 : 0);
    return () => clearTimeout(timeout);
  }, [fetchInvestors, search]);

  async function handleSave(investorId: string) {
    const form = forms[investorId];
    if (!form) return;

    setSaving(investorId);
    setFlashes((prev) => {
      const next = { ...prev };
      delete next[investorId];
      return next;
    });

    try {
      const res = await fetch(`/api/admin/investors/${investorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Save failed");
      }

      setFlashes((prev) => ({
        ...prev,
        [investorId]: { type: "success", msg: "Investor saved successfully" },
      }));
      await fetchInvestors();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      setFlashes((prev) => ({
        ...prev,
        [investorId]: { type: "error", msg },
      }));
    } finally {
      setSaving(null);
    }
  }

  async function handleDelete(investorId: string) {
    setDeleting(investorId);
    try {
      const res = await fetch(`/api/admin/investors/${investorId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Delete failed");
      }
      setExpanded(null);
      await fetchInvestors();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Delete failed";
      setFlashes((prev) => ({
        ...prev,
        [investorId]: { type: "error", msg },
      }));
    } finally {
      setDeleting(null);
    }
  }

  async function handleSeed() {
    setSeeding(true);
    setSeedFlash(null);
    try {
      const res = await fetch("/api/admin/investors/seed", { method: "POST" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Seed failed");
      }
      const data = await res.json();
      setSeedFlash({
        type: "success",
        msg: data.message || `Seeded ${data.seeded ?? 0} investors`,
      });
      await fetchInvestors();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Seed failed";
      setSeedFlash({ type: "error", msg });
    } finally {
      setSeeding(false);
    }
  }

  const typeCounts = investors.reduce((acc, inv) => {
    acc[inv.type] = (acc[inv.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <section className="space-y-6" aria-labelledby="admin-investors-heading">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 id="admin-investors-heading" className="text-2xl font-bold text-white">
            Investors
          </h1>
          <p className="text-sm text-white/30 mt-1">
            Manage investor database for matching
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSeed}
            disabled={seeding}
            className="bg-white/5 text-white/50 text-xs font-medium px-4 py-2 rounded-xl hover:bg-white/10 hover:text-white/70 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {seeding ? "Seeding..." : "Seed Defaults"}
          </button>
          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="bg-electric text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-electric/90 transition-colors"
          >
            Add Investor
          </button>
        </div>
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

      {/* Filter pills */}
      <div className="flex flex-wrap items-center gap-2">
        {TYPE_OPTIONS.map((type) => {
          const style = TYPE_BADGE_STYLES[type];
          const count = typeCounts[type] || 0;
          return (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(filterType === type ? "all" : type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                filterType === type
                  ? `${style.bg} ${style.text} ring-1 ring-current`
                  : `${style.bg} ${style.text} opacity-60 hover:opacity-100`
              }`}
              aria-pressed={filterType === type}
            >
              {type.replace("_", " ")}: {count}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setFilterVerified(!filterVerified)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
            filterVerified
              ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-current"
              : "bg-emerald-500/15 text-emerald-400 opacity-60 hover:opacity-100"
          }`}
          aria-pressed={filterVerified}
        >
          Verified only
        </button>
        {(filterType !== "all" || filterVerified) && (
          <button
            type="button"
            onClick={() => {
              setFilterType("all");
              setFilterVerified(false);
            }}
            className="px-3 py-1.5 rounded-lg text-xs text-white/30 hover:text-white/50 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name..."
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 outline-none focus-visible:border-electric w-full max-w-md"
          aria-label="Search investors by name"
        />
        <span className="text-xs text-white/30 shrink-0">
          Showing {investors.length} of {total} investors
        </span>
      </div>

      {/* Loading */}
      {loading && <TableSkeleton />}

      {/* Empty state */}
      {!loading && investors.length === 0 && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 px-6 py-12 text-center">
          <p className="text-sm text-white/30">
            No investors found. Click &quot;Seed Defaults&quot; to populate or &quot;Add Investor&quot; to create one.
          </p>
        </div>
      )}

      {/* Table */}
      {!loading && investors.length > 0 && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Stages</th>
                  <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Sectors</th>
                  <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Geographies</th>
                  <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Cheque</th>
                  <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Verified</th>
                  <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Enabled</th>
                  <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {investors.map((inv) => {
                  const isExpanded = expanded === inv.id;
                  const stages = parseJsonArray(inv.stages);
                  const sectors = parseJsonArray(inv.sectors);
                  const geos = parseJsonArray(inv.geographies);
                  const sectorsExtra = sectors.length > 3 ? sectors.length - 3 : 0;

                  return (
                    <React.Fragment key={inv.id}>
                      <tr
                        className={`border-b border-white/5 transition-colors hover:bg-white/[0.02] cursor-pointer ${
                          isExpanded ? "bg-white/[0.02]" : ""
                        }`}
                        onClick={() => setExpanded(isExpanded ? null : inv.id)}
                      >
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">{inv.name}</span>
                            {typeBadge(inv.type)}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1">
                            {stages.map((s) => (
                              <Pill key={s} text={s} />
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1">
                            {sectors.slice(0, 3).map((s) => (
                              <Pill key={s} text={s} />
                            ))}
                            {sectorsExtra > 0 && (
                              <Pill text={`+${sectorsExtra} more`} color="bg-white/5 text-white/25" />
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-wrap gap-1">
                            {geos.map((g) => (
                              <Pill key={g} text={g} />
                            ))}
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs text-white/50 font-mono">
                            {formatChequeRange(inv.chequeMin, inv.chequeMax)}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          {inv.verified ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400">
                              <span className="w-2 h-2 rounded-full bg-emerald-400" />
                              <span className="text-[10px] font-semibold uppercase tracking-wider">Yes</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-white/20 uppercase tracking-wider">No</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          <span
                            className={`text-[10px] font-semibold uppercase tracking-wider ${
                              inv.enabled ? "text-emerald-400" : "text-white/20"
                            }`}
                          >
                            {inv.enabled ? "Yes" : "No"}
                          </span>
                        </td>
                        <td className="px-5 py-3" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setExpanded(isExpanded ? null : inv.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-white/5 text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors"
                          >
                            {isExpanded ? "Collapse" : "Edit"}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && forms[inv.id] && (
                        <InvestorEditRow
                          form={forms[inv.id]}
                          setForm={(fn) =>
                            setForms((prev) => ({
                              ...prev,
                              [inv.id]: fn(prev[inv.id]),
                            }))
                          }
                          onSave={() => handleSave(inv.id)}
                          onDelete={() => handleDelete(inv.id)}
                          saving={saving === inv.id}
                          deleting={deleting === inv.id}
                          flash={flashes[inv.id] ?? null}
                          source={inv.source}
                        />
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Investor Modal */}
      {showAddModal && (
        <AddInvestorModal
          onClose={() => setShowAddModal(false)}
          onCreated={() => {
            setShowAddModal(false);
            fetchInvestors();
          }}
        />
      )}
    </section>
  );
}
