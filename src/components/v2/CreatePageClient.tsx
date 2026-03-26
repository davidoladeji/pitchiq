"use client";

import { DashboardVersionToggle } from "@/components/DashboardVersionToggle";
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
/*  Types + Constants                                                  */
/* ------------------------------------------------------------------ */

interface Props {
  userPlan?: string;
  deckCount?: number;
  userName?: string;
}

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
    companyName: "",
    industry: "",
    stage: "Pre-seed",
    fundingTarget: "",
    investorType: "vc",
    problem: "",
    solution: "",
    keyMetrics: "",
    teamInfo: "",
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
    <AppShellV2 userName={userName} userPlan={userPlan} breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Create Deck" }]}>
      <PageTransition>
        <div className="max-w-3xl mx-auto">
          <DashboardVersionToggle />

          {/* Header */}
          <div className="mt-4 mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-[var(--electric)]/10 flex items-center justify-center">
                <Sparkles size={20} className="text-[var(--electric)]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Create Your Pitch Deck</h1>
                <p className="text-sm text-neutral-500 dark:text-white/40">
                  AI-powered deck generation with market research & expert review
                </p>
              </div>
            </div>
          </div>

          {/* Step indicators */}
          <div className="flex items-center gap-1 mb-6 p-1 rounded-xl bg-neutral-100 dark:bg-[var(--surface-2)]">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const active = activeStep === step.id;
              const complete = isStepComplete(step.id) && activeStep !== step.id;
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    active
                      ? "bg-white dark:bg-[var(--surface-1)] text-[var(--electric)] shadow-sm"
                      : complete
                        ? "text-[var(--electric)]/70 hover:bg-white/50"
                        : "text-neutral-400 dark:text-white/30 hover:bg-white/50"
                  }`}
                >
                  {complete ? (
                    <Check size={14} className="text-[var(--electric)]" />
                  ) : (
                    <Icon size={14} />
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                </button>
              );
            })}
          </div>

          {/* Form sections */}
          <div ref={formRef} className="space-y-3">
            {/* Company */}
            <FormSection
              title="Company Basics"
              step="company"
              activeStep={activeStep}
              onToggle={setActiveStep}
              complete={isStepComplete("company")}
              number={1}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <FormField label="Company Name" required>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => update("companyName", e.target.value)}
                    placeholder="Acme Corp"
                    className="form-input"
                  />
                </FormField>
                <FormField label="Industry" required>
                  <div className="flex flex-wrap gap-1.5">
                    {INDUSTRIES.map((ind) => (
                      <Chip key={ind} selected={form.industry === ind} onClick={() => update("industry", ind)}>{ind}</Chip>
                    ))}
                  </div>
                </FormField>
                <FormField label="Stage">
                  <div className="flex flex-wrap gap-1.5">
                    {STAGES.map((s) => (
                      <Chip key={s} selected={form.stage === s} onClick={() => update("stage", s)}>{s}</Chip>
                    ))}
                  </div>
                </FormField>
                <FormField label="Funding Target">
                  <input
                    type="text"
                    value={form.fundingTarget || ""}
                    onChange={(e) => update("fundingTarget", e.target.value)}
                    placeholder="$500K"
                    className="form-input"
                  />
                </FormField>
                <FormField label="Investor Type" className="sm:col-span-2">
                  <div className="flex gap-2">
                    {INVESTOR_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => update("investorType", t.value)}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border-2 transition-all ${
                          form.investorType === t.value
                            ? "border-[var(--electric)] bg-[var(--electric)]/5 text-[var(--electric)]"
                            : "border-neutral-200 dark:border-white/10 text-neutral-500 dark:text-white/40 hover:border-neutral-300"
                        }`}
                      >
                        <span>{t.icon}</span>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </FormField>
              </div>
            </FormSection>

            {/* Story */}
            <FormSection
              title="Your Story"
              step="story"
              activeStep={activeStep}
              onToggle={setActiveStep}
              complete={isStepComplete("story")}
              number={2}
            >
              <div className="space-y-5">
                <FormField label="Problem You're Solving" required>
                  <textarea
                    value={form.problem || ""}
                    onChange={(e) => update("problem", e.target.value)}
                    placeholder="Describe the problem your startup solves. Be specific about who has this problem and why existing solutions fall short."
                    rows={4}
                    className="form-input resize-none"
                  />
                </FormField>
                <FormField label="Your Solution" required>
                  <textarea
                    value={form.solution || ""}
                    onChange={(e) => update("solution", e.target.value)}
                    placeholder="How does your product solve this problem? What makes your approach unique?"
                    rows={4}
                    className="form-input resize-none"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Traction */}
            <FormSection
              title="Traction & Team"
              step="traction"
              activeStep={activeStep}
              onToggle={setActiveStep}
              complete={isStepComplete("traction")}
              number={3}
              optional
            >
              <div className="space-y-5">
                <FormField label="Key Metrics" hint="Revenue, users, growth rate, retention, etc.">
                  <textarea
                    value={form.keyMetrics || ""}
                    onChange={(e) => update("keyMetrics", e.target.value)}
                    placeholder="$12K MRR, 2,400 active users, 180% QoQ growth, 89% retention"
                    rows={3}
                    className="form-input resize-none"
                  />
                </FormField>
                <FormField label="Team" hint="Founders and key hires">
                  <textarea
                    value={form.teamInfo || ""}
                    onChange={(e) => update("teamInfo", e.target.value)}
                    placeholder={"Alex Chen, CEO — ex-Stripe, 3x founder\nJordan Patel, CTO — MIT CS, ex-Google"}
                    rows={3}
                    className="form-input resize-none"
                  />
                </FormField>
              </div>
            </FormSection>

            {/* Design */}
            <FormSection
              title="Design Preferences"
              step="design"
              activeStep={activeStep}
              onToggle={setActiveStep}
              complete={isStepComplete("design")}
              number={4}
              optional
            >
              <div className="space-y-5">
                <FormField label="Narrative Style" hint="How should the deck tell your story?">
                  <select
                    value={form.narrativeStyle || ""}
                    onChange={(e) => update("narrativeStyle" as keyof DeckInput, e.target.value)}
                    className="form-input"
                  >
                    <option value="">Auto-detect (recommended)</option>
                    <option value="disruptor">Disruptor — Shock + revolution</option>
                    <option value="traction-machine">Traction Machine — Numbers first</option>
                    <option value="vision">Vision — Paint the future</option>
                    <option value="team-story">Team Story — Founder origin</option>
                    <option value="data-story">Data Story — Numbers-driven</option>
                    <option value="inevitable-trend">Inevitable Trend — Why now</option>
                  </select>
                </FormField>
                <FormField label="Visual Style" hint="The visual personality of your deck">
                  <select
                    value={form.visualStyle || ""}
                    onChange={(e) => update("visualStyle" as keyof DeckInput, e.target.value)}
                    className="form-input"
                  >
                    <option value="">Auto-detect from industry</option>
                    <option value="corporate-premium">Corporate Premium</option>
                    <option value="bold-playful">Bold Playful</option>
                    <option value="futuristic-gradient">Futuristic Gradient</option>
                    <option value="clinical-clean">Clinical Clean</option>
                    <option value="startup-energetic">Startup Energetic</option>
                  </select>
                </FormField>
              </div>
            </FormSection>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2">
              <AlertCircle size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Generate button */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || loading}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-white font-semibold text-sm shadow-[0_4px_24px_rgba(var(--electric-rgb),0.3)] hover:shadow-[0_4px_32px_rgba(var(--electric-rgb),0.45)] hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:shadow-none"
              style={{ background: "var(--electric)" }}
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Generating...</>
              ) : (
                <><Sparkles size={18} /> Generate Deck <ArrowRight size={16} /></>
              )}
            </button>
            {!canGenerate && (
              <p className="text-xs text-neutral-400 dark:text-white/30">
                Fill in company name, problem, and solution to generate
              </p>
            )}
          </div>
        </div>
      </PageTransition>

      {/* Scoped form styles using the PitchIQ design tokens */}
      <style jsx global>{`
        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 2px solid transparent;
          background: var(--surface-2);
          color: var(--tw-prose-body, #1a1a2e);
          font-size: 0.875rem;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          outline: none;
        }
        .form-input:hover {
          background: var(--surface-3);
        }
        .form-input:focus {
          border-color: var(--electric);
          background: var(--surface-1);
          box-shadow: 0 0 0 3px rgba(var(--electric-rgb), 0.1);
        }
        .form-input::placeholder {
          color: rgba(100, 116, 139, 0.5);
        }
        .dark .form-input {
          color: #e8e8ed;
        }
        .dark .form-input::placeholder {
          color: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </AppShellV2>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function FormSection({
  title, step, activeStep, onToggle, complete, number, optional, children,
}: {
  title: string; step: Step; activeStep: Step; onToggle: (s: Step) => void;
  complete: boolean; number: number; optional?: boolean; children: React.ReactNode;
}) {
  const open = activeStep === step;
  return (
    <div className={`rounded-2xl border-2 transition-all duration-200 ${
      open
        ? "border-[var(--electric)]/20 bg-white dark:bg-[var(--surface-1)] shadow-[0_2px_16px_rgba(var(--electric-rgb),0.06)]"
        : complete
          ? "border-[var(--electric)]/10 bg-white dark:bg-[var(--surface-1)]"
          : "border-neutral-200/60 dark:border-white/5 bg-white dark:bg-[var(--surface-1)]"
    }`}>
      <button type="button" onClick={() => onToggle(step)} className="w-full flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          {complete && !open ? (
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: "rgba(var(--electric-rgb), 0.1)" }}>
              <Check size={14} style={{ color: "var(--electric)" }} />
            </div>
          ) : (
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold ${
              open ? "text-white" : "text-neutral-400 dark:text-white/30 bg-neutral-100 dark:bg-[var(--surface-2)]"
            }`} style={open ? { background: "var(--electric)" } : undefined}>
              {number}
            </div>
          )}
          <span className="text-sm font-semibold text-neutral-800 dark:text-white">{title}</span>
          {optional && <span className="text-[10px] text-neutral-400 dark:text-white/20 uppercase tracking-wide font-medium">Optional</span>}
        </div>
        {open ? <ChevronUp size={16} className="text-neutral-400" /> : <ChevronDown size={16} className="text-neutral-400" />}
      </button>
      {open && <div className="px-5 pb-6 pt-1">{children}</div>}
    </div>
  );
}

function FormField({ label, hint, required, className, children }: {
  label: string; hint?: string; required?: boolean; className?: string; children: React.ReactNode;
}) {
  return (
    <div className={`space-y-2 ${className || ""}`}>
      <label className="block text-xs font-semibold text-neutral-700 dark:text-white/60">
        {label}
        {required && <span className="ml-0.5" style={{ color: "var(--electric)" }}>*</span>}
      </label>
      {hint && <p className="text-[11px] text-neutral-400 dark:text-white/25 -mt-1">{hint}</p>}
      {children}
    </div>
  );
}

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        selected
          ? "text-white shadow-sm"
          : "bg-neutral-100 dark:bg-[var(--surface-2)] text-neutral-500 dark:text-white/40 hover:bg-neutral-200 dark:hover:bg-[var(--surface-3)]"
      }`}
      style={selected ? { background: "var(--electric)" } : undefined}
    >
      {children}
    </button>
  );
}
