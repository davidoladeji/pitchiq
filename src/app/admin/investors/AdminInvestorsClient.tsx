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

const EDIT_TABS = [
  { key: "basic", label: "Basic" },
  { key: "investment", label: "Investment" },
  { key: "location", label: "Location & Currency" },
  { key: "preferences", label: "Preferences" },
  { key: "requirements", label: "Requirements" },
  { key: "fund", label: "Fund Info" },
  { key: "focus", label: "Focus" },
  { key: "conflicts", label: "Conflicts" },
] as const;

type EditTabKey = (typeof EDIT_TABS)[number]["key"];

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
  // Extended fields
  country: string | null;
  city: string | null;
  currencies: string;
  businessModels: string;
  revenueModels: string;
  customerTypes: string;
  dealStructures: string;
  valuationMin: number | null;
  valuationMax: number | null;
  minRevenue: number | null;
  minGrowthRate: number | null;
  minTeamSize: number | null;
  fundVintage: number | null;
  fundSize: number | null;
  deploymentPace: string | null;
  averageCheckCount: number | null;
  leadPreference: string | null;
  boardSeatRequired: boolean;
  syndicateOpen: boolean;
  followOnReserve: boolean;
  impactFocus: boolean;
  diversityLens: boolean;
  thesisKeywords: string;
  portfolioCompanies: string;
  portfolioConflictSectors: string;
  declinedSectors: string;
  coInvestors: string;
  lpTypes: string;
  lastActiveDate: string | null;
  avgResponseDays: number | null;
  avgCloseWeeks: number | null;
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
  // Extended fields
  country: string;
  city: string;
  currencies: string[];
  businessModels: string[];
  revenueModels: string[];
  customerTypes: string[];
  dealStructures: string[];
  valuationMin: number | null;
  valuationMax: number | null;
  minRevenue: number | null;
  minGrowthRate: number | null;
  minTeamSize: number | null;
  fundVintage: number | null;
  fundSize: number | null;
  deploymentPace: string;
  averageCheckCount: number | null;
  leadPreference: string;
  boardSeatRequired: boolean;
  syndicateOpen: boolean;
  followOnReserve: boolean;
  impactFocus: boolean;
  diversityLens: boolean;
  thesisKeywords: string[];
  portfolioCompanies: string[];
  coInvestors: string[];
  portfolioConflictSectors: string[];
  declinedSectors: string[];
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
    // Extended
    country: row.country ?? "",
    city: row.city ?? "",
    currencies: parseJsonArray(row.currencies),
    businessModels: parseJsonArray(row.businessModels),
    revenueModels: parseJsonArray(row.revenueModels),
    customerTypes: parseJsonArray(row.customerTypes),
    dealStructures: parseJsonArray(row.dealStructures),
    valuationMin: row.valuationMin,
    valuationMax: row.valuationMax,
    fundVintage: row.fundVintage,
    fundSize: row.fundSize,
    deploymentPace: row.deploymentPace ?? "",
    minRevenue: row.minRevenue,
    minGrowthRate: row.minGrowthRate,
    minTeamSize: row.minTeamSize,
    leadPreference: row.leadPreference ?? "",
    boardSeatRequired: row.boardSeatRequired,
    syndicateOpen: row.syndicateOpen,
    followOnReserve: row.followOnReserve,
    averageCheckCount: row.averageCheckCount,
    impactFocus: row.impactFocus,
    diversityLens: row.diversityLens,
    thesisKeywords: parseJsonArray(row.thesisKeywords),
    portfolioCompanies: parseJsonArray(row.portfolioCompanies),
    coInvestors: parseJsonArray(row.coInvestors),
    portfolioConflictSectors: parseJsonArray(row.portfolioConflictSectors),
    declinedSectors: parseJsonArray(row.declinedSectors),
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
    // Extended
    country: "",
    city: "",
    currencies: [],
    businessModels: [],
    revenueModels: [],
    customerTypes: [],
    dealStructures: [],
    valuationMin: null,
    valuationMax: null,
    fundVintage: null,
    fundSize: null,
    deploymentPace: "",
    minRevenue: null,
    minGrowthRate: null,
    minTeamSize: null,
    averageCheckCount: null,
    leadPreference: "",
    boardSeatRequired: false,
    syndicateOpen: false,
    followOnReserve: false,
    impactFocus: false,
    diversityLens: false,
    thesisKeywords: [],
    portfolioCompanies: [],
    coInvestors: [],
    portfolioConflictSectors: [],
    declinedSectors: [],
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

function TabBar({ active, onChange }: { active: EditTabKey; onChange: (t: EditTabKey) => void }) {
  return (
    <div className="flex flex-wrap gap-1 mb-4">
      {EDIT_TABS.map((tab) => (
        <button
          key={tab.key}
          type="button"
          onClick={() => onChange(tab.key)}
          className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors ${
            active === tab.key
              ? "bg-[#4361EE] text-white"
              : "bg-white/5 text-white/40 hover:text-white/60 hover:bg-white/10"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string | number | null;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: "text" | "number" | "email";
}) {
  return (
    <div>
      <label className="block text-xs text-white/50 mb-1 font-medium">{label}</label>
      <input
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white placeholder:text-white/25"
      />
    </div>
  );
}

function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className="block text-xs text-white/50 mb-1 font-medium">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white resize-none placeholder:text-white/25"
      />
    </div>
  );
}

function FormCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none py-1">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-[#4361EE] w-3.5 h-3.5"
      />
      <span className="text-xs text-white/60">{label}</span>
    </label>
  );
}

function FormCommaArray({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-white/50 mb-1 font-medium">{label}</label>
      <input
        type="text"
        value={value.join(", ")}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          )
        }
        placeholder={placeholder ?? "Comma-separated values"}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white placeholder:text-white/25"
      />
    </div>
  );
}

/** Renders the tab content for a given tab key, form, and update function */
function InvestorTabContent({
  tab,
  form,
  update,
}: {
  tab: EditTabKey;
  form: InvestorForm;
  update: <K extends keyof InvestorForm>(key: K, val: InvestorForm[K]) => void;
}) {
  const numUp = (key: keyof InvestorForm) => (v: string) =>
    update(key, v === "" ? null : (Number(v) as never));

  switch (tab) {
    case "basic":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          <FormInput label="Name *" value={form.name} onChange={(v) => update("name", v)} placeholder="Sequoia Capital" />
          <div>
            <label className="block text-xs text-white/50 mb-1 font-medium">Type</label>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-sm text-white"
            >
              {TYPE_OPTIONS.map((t) => (
                <option key={t} value={t} className="bg-[#0F0F14]">{t.replace("_", " ")}</option>
              ))}
            </select>
          </div>
          <FormInput label="Website" value={form.website} onChange={(v) => update("website", v)} placeholder="https://..." />
          <FormTextarea label="Description" value={form.description} onChange={(v) => update("description", v)} />
          <FormTextarea label="Thesis" value={form.thesis} onChange={(v) => update("thesis", v)} placeholder="Investment thesis or focus areas..." rows={3} />
          <FormInput label="AUM" value={form.aum} onChange={(v) => update("aum", v)} placeholder="$500M" />
          <FormInput label="Partner Count" value={form.partnerCount} onChange={numUp("partnerCount")} type="number" />
          <FormInput label="LinkedIn" value={form.linkedIn} onChange={(v) => update("linkedIn", v)} placeholder="https://linkedin.com/in/..." />
          <FormInput label="Twitter" value={form.twitter} onChange={(v) => update("twitter", v)} placeholder="@handle" />
        </div>
      );

    case "investment":
      return (
        <div className="space-y-4">
          <div>
            <span className="text-xs text-white/50 block mb-1.5 font-medium">Stages</span>
            <MultiCheckbox options={STAGE_OPTIONS} selected={form.stages} onChange={(v) => update("stages", v)} />
          </div>
          <div>
            <span className="text-xs text-white/50 block mb-1.5 font-medium">Sectors</span>
            <MultiCheckbox options={SECTOR_OPTIONS} selected={form.sectors} onChange={(v) => update("sectors", v)} />
          </div>
          <div>
            <span className="text-xs text-white/50 block mb-1.5 font-medium">Geographies</span>
            <MultiCheckbox options={GEO_OPTIONS} selected={form.geographies} onChange={(v) => update("geographies", v)} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
            <FormInput label="Cheque Min ($)" value={form.chequeMin} onChange={numUp("chequeMin")} type="number" placeholder="50000" />
            <FormInput label="Cheque Max ($)" value={form.chequeMax} onChange={numUp("chequeMax")} type="number" placeholder="2000000" />
          </div>
          <FormCommaArray label="Notable Deals" value={form.notableDeals} onChange={(v) => update("notableDeals", v)} placeholder="Stripe, Notion, Figma" />
        </div>
      );

    case "location":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          <FormInput label="Country" value={form.country} onChange={(v) => update("country", v)} placeholder="US" />
          <FormInput label="City" value={form.city} onChange={(v) => update("city", v)} placeholder="San Francisco" />
          <FormCommaArray label="Currencies" value={form.currencies} onChange={(v) => update("currencies", v)} placeholder="USD, EUR, GBP" />
        </div>
      );

    case "preferences":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          <FormCommaArray label="Business Models" value={form.businessModels} onChange={(v) => update("businessModels", v)} placeholder="B2B, B2C, B2B2C" />
          <FormCommaArray label="Revenue Models" value={form.revenueModels} onChange={(v) => update("revenueModels", v)} placeholder="SaaS, Marketplace, Transactional" />
          <FormCommaArray label="Customer Types" value={form.customerTypes} onChange={(v) => update("customerTypes", v)} placeholder="SMB, Mid-Market, Enterprise" />
          <FormCommaArray label="Deal Structures" value={form.dealStructures} onChange={(v) => update("dealStructures", v)} placeholder="Equity, SAFE, Convertible Note" />
          <FormInput label="Valuation Min ($)" value={form.valuationMin} onChange={numUp("valuationMin")} type="number" placeholder="1000000" />
          <FormInput label="Valuation Max ($)" value={form.valuationMax} onChange={numUp("valuationMax")} type="number" placeholder="50000000" />
          <FormInput label="Lead Preference" value={form.leadPreference} onChange={(v) => update("leadPreference", v)} placeholder="lead, co-lead, follow" />
        </div>
      );

    case "requirements":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          <FormInput label="Min Revenue ($)" value={form.minRevenue} onChange={numUp("minRevenue")} type="number" placeholder="0" />
          <FormInput label="Min Growth Rate (%)" value={form.minGrowthRate} onChange={numUp("minGrowthRate")} type="number" placeholder="20" />
          <FormInput label="Min Team Size" value={form.minTeamSize} onChange={numUp("minTeamSize")} type="number" placeholder="2" />
          <FormCheckbox label="Board Seat Required" checked={form.boardSeatRequired} onChange={(v) => update("boardSeatRequired", v)} />
        </div>
      );

    case "fund":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          <FormInput label="Fund Vintage (year)" value={form.fundVintage} onChange={numUp("fundVintage")} type="number" placeholder="2024" />
          <FormInput label="Fund Size ($)" value={form.fundSize} onChange={numUp("fundSize")} type="number" placeholder="100000000" />
          <FormInput label="Deployment Pace" value={form.deploymentPace} onChange={(v) => update("deploymentPace", v)} placeholder="10-15 deals/year" />
          <FormInput label="Average Check Count" value={form.averageCheckCount} onChange={numUp("averageCheckCount")} type="number" placeholder="30" />
          <FormCheckbox label="Syndicate Open" checked={form.syndicateOpen} onChange={(v) => update("syndicateOpen", v)} />
          <FormCheckbox label="Follow-On Reserve" checked={form.followOnReserve} onChange={(v) => update("followOnReserve", v)} />
        </div>
      );

    case "focus":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          <FormCheckbox label="Impact Focus" checked={form.impactFocus} onChange={(v) => update("impactFocus", v)} />
          <FormCheckbox label="Diversity Lens" checked={form.diversityLens} onChange={(v) => update("diversityLens", v)} />
          <FormCommaArray label="Thesis Keywords" value={form.thesisKeywords} onChange={(v) => update("thesisKeywords", v)} placeholder="AI, climate, dev-tools" />
          <FormCommaArray label="Portfolio Companies" value={form.portfolioCompanies} onChange={(v) => update("portfolioCompanies", v)} placeholder="Stripe, Notion, Figma" />
          <FormCommaArray label="Co-Investors" value={form.coInvestors} onChange={(v) => update("coInvestors", v)} placeholder="a16z, Sequoia, YC" />
        </div>
      );

    case "conflicts":
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          <FormCommaArray label="Portfolio Conflict Sectors" value={form.portfolioConflictSectors} onChange={(v) => update("portfolioConflictSectors", v)} placeholder="Sectors where portfolio has conflicts" />
          <FormCommaArray label="Declined Sectors" value={form.declinedSectors} onChange={(v) => update("declinedSectors", v)} placeholder="Sectors explicitly declined" />
        </div>
      );

    default:
      return null;
  }
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
  const [editTab, setEditTab] = useState<EditTabKey>("basic");

  return (
    <tr>
      <td colSpan={8} className="px-5 py-4 border-b border-white/5 bg-[#0F0F14]">
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

        <TabBar active={editTab} onChange={setEditTab} />

        <InvestorTabContent tab={editTab} form={form} update={update} />

        {/* Admin toggles -- always visible */}
        <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-1">
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
            className="bg-[#4361EE] text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-[#4361EE]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
  const [editTab, setEditTab] = useState<EditTabKey>("basic");

  const update = useCallback(
    <K extends keyof InvestorForm>(key: K, val: InvestorForm[K]) => {
      setForm((prev) => ({ ...prev, [key]: val }));
    },
    []
  );

  async function handleCreate() {
    if (!form.name.trim()) {
      setError("Name is required");
      setEditTab("basic");
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
      <div className="bg-[#0F0F14] border border-white/10 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6">
        <h2 className="text-lg font-bold text-white mb-1">Add Investor</h2>
        <p className="text-sm text-white/40 mb-4">Create a new investor profile for matching.</p>

        {error && (
          <div className="mb-4 rounded-xl px-4 py-2.5 text-sm bg-red-500/10 border border-red-500/20 text-red-400">
            {error}
          </div>
        )}

        <TabBar active={editTab} onChange={setEditTab} />

        <InvestorTabContent tab={editTab} form={form} update={update} />

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-white/5">
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
            className="bg-[#4361EE] text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-[#4361EE]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
