"use client";

import AppShellV2 from "./shell/AppShell";
import { PageTransition } from "./shared/PageTransition";
import type { DeckInput } from "@/lib/types";
import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, Target, Sparkles, ChevronDown, ChevronUp, Check, Loader2,
  Lightbulb, Palette, ArrowRight, AlertCircle,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

interface Props { userPlan?: string; deckCount?: number; userName?: string; }
type Step = "company" | "story" | "traction" | "design";

const STEPS: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "company", label: "Company", icon: Building2 },
  { id: "story", label: "Story", icon: Lightbulb },
  { id: "traction", label: "Traction", icon: Target },
  { id: "design", label: "Design", icon: Palette },
];
const STAGES = ["Pre-seed", "Seed", "Series A", "Series B", "Series C+", "Growth"];
const INVESTOR_TYPES = [
  { value: "vc", label: "VC", icon: "🏦" },
  { value: "angel", label: "Angel", icon: "😇" },
  { value: "accelerator", label: "Accelerator", icon: "🚀" },
];
const INDUSTRIES = [
  "SaaS", "Fintech", "HealthTech", "AI/ML", "Consumer", "Marketplace",
  "CleanTech", "EdTech", "Gaming", "Crypto/Web3", "DeepTech", "D2C", "Media", "Other",
];

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function CreatePageV2({ userPlan = "starter", userName }: Props) {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState<Step>("company");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState<DeckInput>({
    companyName: "", industry: "", stage: "Pre-seed", fundingTarget: "",
    investorType: "vc", problem: "", solution: "", keyMetrics: "", teamInfo: "",
    themeId: "midnight",
  });

  const update = useCallback((field: keyof DeckInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const isStepComplete = useCallback((step: Step): boolean => {
    switch (step) {
      case "company": return !!(form.companyName && form.industry);
      case "story": return !!(form.problem && form.solution);
      case "traction": return true;
      case "design": return true;
    }
  }, [form]);

  const canGenerate = form.companyName && form.problem && form.solution;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to generate deck");
      }
      const data = await res.json();
      router.push(`/deck/${data.shareId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  };

  return (
    <AppShellV2 userName={userName} userPlan={userPlan}>
      <PageTransition>
        <div className="max-w-3xl mx-auto">

          {/* Header */}
          <div className="mt-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(var(--neon-electric-rgb), 0.1)", border: "1px solid rgba(var(--neon-electric-rgb), 0.2)" }}>
              <Sparkles size={20} style={{ color: "var(--neon-electric)" }} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--void-text)" }}>Create Your Pitch Deck</h1>
              <p className="text-sm" style={{ color: "var(--void-text-dim)" }}>AI-powered generation with market research & expert review</p>
            </div>
          </div>

          {/* Step tabs */}
          <div className="flex items-center gap-0.5 mb-6 p-1 rounded-xl" style={{ background: "var(--void-surface)", border: "1px solid var(--void-border)" }}>
            {STEPS.map((step) => {
              const Icon = step.icon;
              const active = activeStep === step.id;
              return (
                <button key={step.id} onClick={() => setActiveStep(step.id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all"
                  style={active
                    ? { background: "rgba(var(--neon-electric-rgb), 0.1)", color: "var(--neon-cyan)", border: "1px solid rgba(var(--neon-electric-rgb), 0.2)" }
                    : { color: "var(--void-text-dim)" }
                  }
                >
                  <Icon size={14} />
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form */}
          <div ref={formRef} className="space-y-3">
            <FormSection title="Company Basics" step="company" activeStep={activeStep} onToggle={setActiveStep} complete={isStepComplete("company")} number={1}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <VoidField label="Company Name" required>
                  <input type="text" value={form.companyName} onChange={(e) => update("companyName", e.target.value)} placeholder="Acme Corp" className="void-input" />
                </VoidField>
                <VoidField label="Industry" required>
                  <div className="flex flex-wrap gap-1.5">
                    {INDUSTRIES.map((ind) => (
                      <VoidChip key={ind} selected={form.industry === ind} onClick={() => update("industry", ind)}>{ind}</VoidChip>
                    ))}
                  </div>
                </VoidField>
                <VoidField label="Stage">
                  <div className="flex flex-wrap gap-1.5">
                    {STAGES.map((s) => (
                      <VoidChip key={s} selected={form.stage === s} onClick={() => update("stage", s)}>{s}</VoidChip>
                    ))}
                  </div>
                </VoidField>
                <VoidField label="Funding Target">
                  <input type="text" value={form.fundingTarget || ""} onChange={(e) => update("fundingTarget", e.target.value)} placeholder="$500K" className="void-input" />
                </VoidField>
                <VoidField label="Investor Type" className="sm:col-span-2">
                  <div className="flex gap-2">
                    {INVESTOR_TYPES.map((t) => (
                      <button key={t.value} type="button" onClick={() => update("investorType", t.value)}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all"
                        style={form.investorType === t.value
                          ? { background: "rgba(var(--neon-electric-rgb), 0.1)", color: "var(--neon-cyan)", border: "1px solid rgba(var(--neon-electric-rgb), 0.3)" }
                          : { background: "var(--void-surface)", color: "var(--void-text-muted)", border: "1px solid var(--void-border)" }
                        }
                      >
                        <span>{t.icon}</span>{t.label}
                      </button>
                    ))}
                  </div>
                </VoidField>
              </div>
            </FormSection>

            <FormSection title="Your Story" step="story" activeStep={activeStep} onToggle={setActiveStep} complete={isStepComplete("story")} number={2}>
              <div className="space-y-5">
                <VoidField label="Problem You're Solving" required>
                  <textarea value={form.problem || ""} onChange={(e) => update("problem", e.target.value)} placeholder="Describe the problem your startup solves..." rows={4} className="void-input resize-none" />
                </VoidField>
                <VoidField label="Your Solution" required>
                  <textarea value={form.solution || ""} onChange={(e) => update("solution", e.target.value)} placeholder="How does your product solve this?" rows={4} className="void-input resize-none" />
                </VoidField>
              </div>
            </FormSection>

            <FormSection title="Traction & Team" step="traction" activeStep={activeStep} onToggle={setActiveStep} complete={isStepComplete("traction")} number={3} optional>
              <div className="space-y-5">
                <VoidField label="Key Metrics" hint="Revenue, users, growth rate">
                  <textarea value={form.keyMetrics || ""} onChange={(e) => update("keyMetrics", e.target.value)} placeholder="$12K MRR, 2,400 users, 180% QoQ growth" rows={3} className="void-input resize-none" />
                </VoidField>
                <VoidField label="Team" hint="Founders and key hires">
                  <textarea value={form.teamInfo || ""} onChange={(e) => update("teamInfo", e.target.value)} placeholder={"Alex Chen, CEO — ex-Stripe\nJordan Patel, CTO — MIT CS"} rows={3} className="void-input resize-none" />
                </VoidField>
              </div>
            </FormSection>

            <FormSection title="Design Preferences" step="design" activeStep={activeStep} onToggle={setActiveStep} complete={isStepComplete("design")} number={4} optional>
              <div className="space-y-5">
                <VoidField label="Narrative Style" hint="How should the deck tell your story?">
                  <select value={form.narrativeStyle || ""} onChange={(e) => update("narrativeStyle" as keyof DeckInput, e.target.value)} className="void-input">
                    <option value="">Auto-detect (recommended)</option>
                    <option value="disruptor">Disruptor</option>
                    <option value="traction-machine">Traction Machine</option>
                    <option value="vision">Vision</option>
                    <option value="team-story">Team Story</option>
                    <option value="data-story">Data Story</option>
                  </select>
                </VoidField>
                <VoidField label="Visual Style" hint="The visual personality">
                  <select value={form.visualStyle || ""} onChange={(e) => update("visualStyle" as keyof DeckInput, e.target.value)} className="void-input">
                    <option value="">Auto-detect</option>
                    <option value="corporate-premium">Corporate Premium</option>
                    <option value="bold-playful">Bold Playful</option>
                    <option value="futuristic-gradient">Futuristic</option>
                    <option value="clinical-clean">Clinical Clean</option>
                    <option value="startup-energetic">Startup Energetic</option>
                  </select>
                </VoidField>
              </div>
            </FormSection>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-xl flex items-center gap-2" style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}>
              <AlertCircle size={16} className="text-red-400 shrink-0" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Generate button */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <button onClick={handleGenerate} disabled={!canGenerate || loading}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-white font-semibold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{ background: "var(--neon-electric)", boxShadow: canGenerate ? "0 4px 30px rgba(var(--neon-electric-rgb), 0.35)" : "none" }}
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Sparkles size={18} /> Generate Deck <ArrowRight size={16} /></>}
            </button>
            {!canGenerate && <p className="text-xs" style={{ color: "var(--void-text-dim)" }}>Fill in company name, problem, and solution</p>}
          </div>
        </div>
      </PageTransition>

      {/* Void form input styles */}
      <style jsx global>{`
        .void-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid var(--void-border);
          background: var(--void-surface);
          color: var(--void-text);
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .void-input:hover { border-color: var(--void-border-hover); background: var(--void-surface-hover); }
        .void-input:focus { border-color: rgba(var(--neon-electric-rgb), 0.5); box-shadow: 0 0 0 3px rgba(var(--neon-electric-rgb), 0.08); background: var(--void-surface-hover); }
        .void-input::placeholder { color: var(--void-text-dim); }
        .void-input option { background: var(--void-2); color: var(--void-text); }
      `}</style>
    </AppShellV2>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function FormSection({ title, step, activeStep, onToggle, complete, number, optional, children }: {
  title: string; step: Step; activeStep: Step; onToggle: (s: Step) => void;
  complete: boolean; number: number; optional?: boolean; children: React.ReactNode;
}) {
  const open = activeStep === step;
  return (
    <div className="void-card overflow-hidden">
      <button type="button" onClick={() => onToggle(step)} className="w-full flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          {complete && !open ? (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(var(--neon-emerald-rgb), 0.1)" }}>
              <Check size={14} style={{ color: "var(--neon-emerald)" }} />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={open ? { background: "var(--neon-electric)", color: "white" } : { background: "var(--void-surface)", color: "var(--void-text-dim)" }}
            >{number}</div>
          )}
          <span className="text-sm font-semibold" style={{ color: "var(--void-text)" }}>{title}</span>
          {optional && <span className="text-[10px] uppercase tracking-wide font-medium" style={{ color: "var(--void-text-dim)" }}>Optional</span>}
        </div>
        {open ? <ChevronUp size={16} style={{ color: "var(--void-text-dim)" }} /> : <ChevronDown size={16} style={{ color: "var(--void-text-dim)" }} />}
      </button>
      {open && <div className="px-5 pb-5 pt-1">{children}</div>}
    </div>
  );
}

function VoidField({ label, hint, required, className, children }: {
  label: string; hint?: string; required?: boolean; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={`space-y-2 ${className || ""}`}>
      <label className="block text-xs font-semibold" style={{ color: "var(--void-text-muted)" }}>
        {label}{required && <span style={{ color: "var(--neon-cyan)" }} className="ml-0.5">*</span>}
      </label>
      {hint && <p className="text-[11px] -mt-1" style={{ color: "var(--void-text-dim)" }}>{hint}</p>}
      {children}
    </div>
  );
}

function VoidChip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick}
      className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={selected
        ? { background: "rgba(var(--neon-electric-rgb), 0.15)", color: "var(--neon-cyan)", border: "1px solid rgba(var(--neon-electric-rgb), 0.3)" }
        : { background: "var(--void-surface)", color: "var(--void-text-dim)", border: "1px solid var(--void-border)" }
      }
    >{children}</button>
  );
}
