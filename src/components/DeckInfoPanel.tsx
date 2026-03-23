"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X, Building2, Users, DollarSign, Lightbulb, TrendingUp,
  Palette, Sparkles, RefreshCw, Copy, ChevronDown, ChevronRight,
  Calendar, Briefcase, BarChart3, Zap,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface DeckInfoData {
  shareId: string;
  companyName: string;
  industry?: string;
  stage?: string;
  fundingTarget?: string;
  investorType?: string;
  problem?: string;
  solution?: string;
  keyMetrics?: string;
  teamInfo?: string;
  source?: string;
  foundedYear?: number;
  businessModel?: string;
  revenueModel?: string;
  customerType?: string;
  themeId?: string;
  createdAt?: string;
  generationMeta?: {
    dna?: { narrativeArchetype?: string; visualPersonality?: string; informationDensity?: string; contentTone?: string };
    narrative?: { archetype?: string; slideCount?: number; throughLine?: string };
    visualSystem?: { colors?: Record<string, string>; typography?: { headingFont?: string; headingWeight?: number } };
  };
  brandPrimaryColor?: string;
  brandFont?: string;
  brandLogo?: string;
  slideCount?: number;
}

interface DeckInfoPanelProps {
  deck: DeckInfoData;
  isOwner: boolean;
  onClose: () => void;
  /** Overlay mode (viewer) vs inline (editor sidebar) */
  mode?: "overlay" | "inline";
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const STAGE_COLORS: Record<string, string> = {
  "pre-seed": "bg-purple-500/20 text-purple-300",
  "seed": "bg-green-500/20 text-green-300",
  "series-a": "bg-blue-500/20 text-blue-300",
  "series-b": "bg-indigo-500/20 text-indigo-300",
  "series-c": "bg-teal-500/20 text-teal-300",
  "growth": "bg-emerald-500/20 text-emerald-300",
};

const INVESTOR_ICONS: Record<string, string> = {
  vc: "Venture Capital",
  angel: "Angel Investor",
  accelerator: "Accelerator",
};

function formatLabel(str: string): string {
  return str
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ------------------------------------------------------------------ */
/*  Editable Field                                                     */
/* ------------------------------------------------------------------ */

function EditableField({
  label,
  value,
  field,
  multiline = false,
  readOnly = false,
  onSave,
}: {
  label: string;
  value: string | undefined | null;
  field: string;
  multiline?: boolean;
  readOnly?: boolean;
  onSave?: (field: string, value: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value || "");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    setDraft(value || "");
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const handleChange = useCallback(
    (newVal: string) => {
      setDraft(newVal);
      if (!onSave) return;
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSave(field, newVal);
      }, 500);
    },
    [field, onSave],
  );

  const handleBlur = useCallback(() => {
    setEditing(false);
    if (onSave && draft !== (value || "")) {
      clearTimeout(debounceRef.current);
      onSave(field, draft);
    }
  }, [draft, field, onSave, value]);

  const displayValue = value?.trim() || null;

  if (readOnly || !onSave) {
    return (
      <div className="group">
        <dt className="text-[11px] uppercase tracking-wider text-navy-400 font-medium mb-0.5">{label}</dt>
        <dd className={displayValue ? "text-sm text-navy-100" : "text-sm text-navy-500 italic"}>
          {displayValue || "Not provided"}
        </dd>
      </div>
    );
  }

  if (!editing) {
    return (
      <div className="group cursor-pointer" onClick={() => setEditing(true)} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setEditing(true)}>
        <dt className="text-[11px] uppercase tracking-wider text-navy-400 font-medium mb-0.5 flex items-center gap-1">
          {label}
          <span className="opacity-0 group-hover:opacity-100 text-[10px] text-electric transition-opacity">click to edit</span>
        </dt>
        <dd className={`text-sm rounded-lg px-2 py-1.5 -mx-2 transition-colors group-hover:bg-white/5 ${displayValue ? "text-navy-100" : "text-navy-500 italic"}`}>
          {multiline && displayValue ? (
            <span className="whitespace-pre-wrap line-clamp-3">{displayValue}</span>
          ) : (
            displayValue || "Not provided"
          )}
        </dd>
      </div>
    );
  }

  const cls = "w-full bg-navy-800 border border-navy-600 rounded-lg px-3 py-2 text-sm text-navy-100 focus:outline-none focus:ring-2 focus:ring-electric focus:border-transparent placeholder:text-navy-500";

  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wider text-electric font-medium mb-1">{label}</dt>
      <dd>
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => { if (e.key === "Escape") handleBlur(); }}
            rows={3}
            className={cls + " resize-none"}
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={draft}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === "Escape") handleBlur(); }}
            className={cls}
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        )}
      </dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Collapsible Section                                                */
/* ------------------------------------------------------------------ */

function Section({
  title,
  icon: Icon,
  children,
  defaultOpen = true,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-navy-800 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 py-3 text-sm font-semibold text-navy-200 hover:text-white transition-colors"
      >
        <Icon size={14} className="text-navy-400" />
        {title}
        <span className="ml-auto">
          {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </span>
      </button>
      {open && <dl className="space-y-3 pb-4">{children}</dl>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Panel                                                         */
/* ------------------------------------------------------------------ */

export default function DeckInfoPanel({ deck, isOwner, onClose, mode = "overlay" }: DeckInfoPanelProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [confirmRegenerate, setConfirmRegenerate] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const handleSave = useCallback(async (field: string, value: string) => {
    if (!isOwner) return;
    setSaving(true);
    try {
      await fetch(`/api/decks/${deck.shareId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }, [deck.shareId, isOwner]);

  const handleRegenerate = useCallback(async () => {
    setRegenerating(true);
    try {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: deck.companyName,
          industry: deck.industry || "",
          stage: deck.stage || "",
          fundingTarget: deck.fundingTarget || "",
          investorType: deck.investorType || "vc",
          problem: deck.problem || "",
          solution: deck.solution || "",
          keyMetrics: deck.keyMetrics || "",
          teamInfo: deck.teamInfo || "",
          themeId: deck.themeId || "midnight",
        }),
      });
      if (!res.ok) throw new Error("Generation failed");
      const data = await res.json();
      router.push(`/editor/${data.shareId}`);
    } catch (err) {
      console.error("Regenerate failed:", err);
      setRegenerating(false);
    }
  }, [deck, router]);

  const handleDuplicate = useCallback(() => {
    router.push(`/create?from=${deck.shareId}`);
  }, [deck.shareId, router]);

  const onSave = isOwner ? handleSave : undefined;

  const stageClass = STAGE_COLORS[(deck.stage || "").toLowerCase().replace(/\s+/g, "-")] || "bg-navy-700 text-navy-200";

  const dna = deck.generationMeta?.dna;
  const narrative = deck.generationMeta?.narrative;

  // Panel content
  const panelContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-navy-800 shrink-0">
        <div className="flex items-center gap-2">
          <Building2 size={16} className="text-electric" />
          <h2 className="text-sm font-semibold text-white">Deck Info</h2>
          {saving && (
            <span className="text-[10px] text-navy-400 animate-pulse">Saving...</span>
          )}
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-navy-400 hover:text-white hover:bg-white/10 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-0">
        {/* Company section */}
        <Section title="Company" icon={Building2}>
          <EditableField label="Company Name" value={deck.companyName} field="companyName" onSave={onSave} />
          <EditableField label="Industry" value={deck.industry} field="industry" onSave={onSave} />
          <div className="group">
            <dt className="text-[11px] uppercase tracking-wider text-navy-400 font-medium mb-0.5">Stage</dt>
            <dd>
              {deck.stage ? (
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${stageClass}`}>
                  {formatLabel(deck.stage)}
                </span>
              ) : (
                <span className="text-sm text-navy-500 italic">Not provided</span>
              )}
            </dd>
          </div>
          {(deck.foundedYear || isOwner) && (
            <EditableField label="Founded Year" value={deck.foundedYear?.toString()} field="foundedYear" onSave={onSave} />
          )}
          {(deck.businessModel || isOwner) && (
            <EditableField label="Business Model" value={deck.businessModel} field="businessModel" onSave={onSave} />
          )}
          {(deck.customerType || isOwner) && (
            <EditableField label="Customer Type" value={deck.customerType} field="customerType" onSave={onSave} />
          )}
        </Section>

        {/* The Pitch section */}
        <Section title="The Pitch" icon={Lightbulb}>
          <EditableField label="Problem" value={deck.problem} field="problem" multiline onSave={onSave} />
          <EditableField label="Solution" value={deck.solution} field="solution" multiline onSave={onSave} />
        </Section>

        {/* Traction section */}
        <Section title="Traction" icon={TrendingUp}>
          <EditableField label="Key Metrics" value={deck.keyMetrics} field="keyMetrics" multiline onSave={onSave} />
          <EditableField label="Team Info" value={deck.teamInfo} field="teamInfo" multiline onSave={onSave} />
        </Section>

        {/* Fundraising section */}
        <Section title="Fundraising" icon={DollarSign}>
          <EditableField label="Funding Target" value={deck.fundingTarget} field="fundingTarget" onSave={onSave} />
          <div className="group">
            <dt className="text-[11px] uppercase tracking-wider text-navy-400 font-medium mb-0.5">Investor Type</dt>
            <dd className="flex items-center gap-1.5 text-sm text-navy-100">
              {deck.investorType === "vc" && <Briefcase size={12} className="text-blue-400" />}
              {deck.investorType === "angel" && <Users size={12} className="text-amber-400" />}
              {deck.investorType === "accelerator" && <Zap size={12} className="text-green-400" />}
              {INVESTOR_ICONS[deck.investorType || ""] || deck.investorType || <span className="text-navy-500 italic">Not provided</span>}
            </dd>
          </div>
          {(deck.revenueModel || isOwner) && (
            <EditableField label="Revenue Model" value={deck.revenueModel} field="revenueModel" onSave={onSave} />
          )}
        </Section>

        {/* Generation Settings section */}
        {dna && (
          <Section title="Generation Settings" icon={Sparkles} defaultOpen={false}>
            <EditableField label="Narrative Archetype" value={dna.narrativeArchetype ? formatLabel(dna.narrativeArchetype) : undefined} field="" readOnly />
            <EditableField label="Visual Personality" value={dna.visualPersonality ? formatLabel(dna.visualPersonality) : undefined} field="" readOnly />
            {dna.contentTone && (
              <EditableField label="Content Tone" value={formatLabel(dna.contentTone)} field="" readOnly />
            )}
            {narrative?.slideCount && (
              <EditableField label="Slides Generated" value={String(narrative.slideCount)} field="" readOnly />
            )}
            {narrative?.throughLine && (
              <EditableField label="Through-Line" value={narrative.throughLine} field="" readOnly />
            )}
          </Section>
        )}

        {/* Design section */}
        <Section title="Design" icon={Palette} defaultOpen={false}>
          <EditableField label="Theme" value={deck.themeId ? formatLabel(deck.themeId) : undefined} field="" readOnly />
          {deck.brandPrimaryColor && (
            <div className="group">
              <dt className="text-[11px] uppercase tracking-wider text-navy-400 font-medium mb-0.5">Brand Color</dt>
              <dd className="flex items-center gap-2 text-sm text-navy-100">
                <span className="w-4 h-4 rounded-full border border-navy-600" style={{ backgroundColor: deck.brandPrimaryColor }} />
                {deck.brandPrimaryColor}
              </dd>
            </div>
          )}
          {deck.brandFont && (
            <EditableField label="Brand Font" value={deck.brandFont} field="" readOnly />
          )}
          {deck.source && (
            <EditableField label="Source" value={formatLabel(deck.source)} field="" readOnly />
          )}
          {deck.createdAt && (
            <div className="group">
              <dt className="text-[11px] uppercase tracking-wider text-navy-400 font-medium mb-0.5">Created</dt>
              <dd className="flex items-center gap-1.5 text-sm text-navy-300">
                <Calendar size={12} />
                {new Date(deck.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </dd>
            </div>
          )}
          {deck.slideCount && (
            <div className="group">
              <dt className="text-[11px] uppercase tracking-wider text-navy-400 font-medium mb-0.5">Slide Count</dt>
              <dd className="flex items-center gap-1.5 text-sm text-navy-300">
                <BarChart3 size={12} />
                {deck.slideCount} slides
              </dd>
            </div>
          )}
        </Section>
      </div>

      {/* Footer actions (owner only) */}
      {isOwner && (
        <div className="shrink-0 px-4 py-3 border-t border-navy-800 space-y-2">
          {!confirmRegenerate ? (
            <>
              <p className="text-[11px] text-navy-400 flex items-center gap-1">
                <Lightbulb size={11} />
                Changed your inputs? Regenerate with updated info.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmRegenerate(true)}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-electric/10 text-electric text-xs font-medium hover:bg-electric/20 transition-colors"
                >
                  <RefreshCw size={12} />
                  Regenerate Deck
                </button>
                <button
                  onClick={handleDuplicate}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 text-navy-200 text-xs font-medium hover:bg-white/10 transition-colors"
                >
                  <Copy size={12} />
                  Duplicate & Edit
                </button>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-navy-300">
                This will create a <strong>new version</strong> of your deck using your updated inputs. Your current deck will be preserved.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleRegenerate}
                  disabled={regenerating}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-electric text-white text-xs font-semibold hover:bg-electric/90 disabled:opacity-50 transition-colors"
                >
                  {regenerating ? (
                    <>
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24" aria-hidden="true"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <RefreshCw size={12} />
                      Confirm Regenerate
                    </>
                  )}
                </button>
                <button
                  onClick={() => setConfirmRegenerate(false)}
                  className="px-3 py-2 rounded-lg text-navy-400 text-xs hover:text-white hover:bg-white/5 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Overlay mode: slide-over from right
  if (mode === "overlay") {
    return (
      <>
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black/50 z-40 lg:bg-black/30" onClick={onClose} />
        {/* Panel */}
        <div className="fixed right-0 top-0 h-full w-full sm:w-[380px] bg-navy-950 border-l border-navy-800 z-50 shadow-2xl animate-slide-in-right flex flex-col">
          {panelContent}
        </div>
      </>
    );
  }

  // Inline mode: just the content (for editor sidebar)
  return (
    <div className="h-full bg-navy-950 flex flex-col">
      {panelContent}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Quick-View Popover (for dashboard cards)                           */
/* ------------------------------------------------------------------ */

export function DeckInfoQuickView({ deck, onViewDetails }: { deck: DeckInfoData; onViewDetails?: () => void }) {
  return (
    <div className="w-64 p-3 space-y-2 text-sm">
      <div className="flex items-center gap-2">
        <Building2 size={14} className="text-electric" />
        <span className="font-semibold text-white truncate">{deck.companyName}</span>
      </div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-navy-400">Industry</span>
          <p className="text-navy-200 truncate">{deck.industry || "—"}</p>
        </div>
        <div>
          <span className="text-navy-400">Stage</span>
          <p className="text-navy-200 truncate">{deck.stage ? formatLabel(deck.stage) : "—"}</p>
        </div>
        <div>
          <span className="text-navy-400">Target</span>
          <p className="text-navy-200 truncate">{deck.fundingTarget || "—"}</p>
        </div>
        <div>
          <span className="text-navy-400">Investor</span>
          <p className="text-navy-200 truncate">{deck.investorType ? formatLabel(deck.investorType) : "—"}</p>
        </div>
      </div>
      {onViewDetails && (
        <button
          onClick={onViewDetails}
          className="w-full mt-1 px-2 py-1.5 rounded-lg bg-white/5 text-navy-200 text-xs font-medium hover:bg-white/10 transition-colors text-center"
        >
          View Details
        </button>
      )}
    </div>
  );
}
