"use client";

import { DashboardVersionToggle } from "@/components/DashboardVersionToggle";
import AppShellV2 from "./shell/AppShell";
import { PageTransition } from "./shared/PageTransition";
import type { DeckInput } from "@/lib/types";
import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Building2, Target,
  Sparkles, ChevronDown, ChevronUp, Check, Loader2,
  Lightbulb, Palette, ArrowRight,
} from "lucide-react";

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
      case "traction": return true; // optional
      case "design": return true;
    }
  }, [form]);

  const canGenerate = form.companyName && form.problem && form.solution;

  // Auto-advance when step is complete
  useEffect(() => {
    if (activeStep === "company" && isStepComplete("company")) {
      // Don't auto-advance, let user click
    }
  }, [activeStep, isStepComplete]);

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
    <AppShellV2
      userName={userName}
      userPlan={userPlan}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Create Deck" },
      ]}
    >
      <PageTransition>
        <div className="max-w-3xl mx-auto">
          <DashboardVersionToggle />

          <div className="mt-4 mb-8">
            <h1 className="text-2xl font-bold text-navy dark:text-white">Create Your Pitch Deck</h1>
            <p className="text-sm text-navy-400 dark:text-white/40 mt-1">
              AI-powered deck generation with real market data
            </p>
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-1 mb-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const active = activeStep === step.id;
              const complete = isStepComplete(step.id);
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    active
                      ? "bg-electric/10 text-electric border border-electric/20"
                      : complete
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "text-navy-400 dark:text-white/30 hover:bg-[var(--surface-2)]"
                  }`}
                >
                  {complete && !active ? (
                    <Check size={14} className="text-emerald-500" />
                  ) : (
                    <Icon size={14} />
                  )}
                  <span className="hidden sm:inline">{step.label}</span>
                  {i < STEPS.length - 1 && (
                    <span className="text-navy-200 dark:text-white/10 ml-1">—</span>
                  )}
                </button>
              );
            })}
          </div>

          <div ref={formRef} className="space-y-4">
            {/* STEP: Company */}
            <Section
              title="Company Basics"
              step="company"
              activeStep={activeStep}
              onToggle={setActiveStep}
              complete={isStepComplete("company")}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Company Name" required>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => update("companyName", e.target.value)}
                    placeholder="Acme Corp"
                    className="v2-input"
                  />
                </Field>
                <Field label="Industry" required>
                  <div className="flex flex-wrap gap-1.5">
                    {INDUSTRIES.map((ind) => (
                      <button
                        key={ind}
                        type="button"
                        onClick={() => update("industry", ind)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          form.industry === ind
                            ? "bg-electric text-white"
                            : "bg-[var(--surface-2)] text-navy-500 dark:text-white/50 hover:bg-[var(--surface-3)]"
                        }`}
                      >
                        {ind}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Stage">
                  <div className="flex flex-wrap gap-1.5">
                    {STAGES.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => update("stage", s)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          form.stage === s
                            ? "bg-electric text-white"
                            : "bg-[var(--surface-2)] text-navy-500 dark:text-white/50 hover:bg-[var(--surface-3)]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Funding Target">
                  <input
                    type="text"
                    value={form.fundingTarget || ""}
                    onChange={(e) => update("fundingTarget", e.target.value)}
                    placeholder="$500K"
                    className="v2-input"
                  />
                </Field>
                <Field label="Investor Type">
                  <div className="flex gap-2">
                    {INVESTOR_TYPES.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => update("investorType", t.value)}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                          form.investorType === t.value
                            ? "bg-electric text-white"
                            : "bg-[var(--surface-2)] text-navy-500 dark:text-white/50 hover:bg-[var(--surface-3)]"
                        }`}
                      >
                        <span>{t.icon}</span>
                        {t.label}
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </Section>

            {/* STEP: Story */}
            <Section
              title="Your Story"
              step="story"
              activeStep={activeStep}
              onToggle={setActiveStep}
              complete={isStepComplete("story")}
            >
              <div className="space-y-4">
                <Field label="Problem You're Solving" required>
                  <textarea
                    value={form.problem || ""}
                    onChange={(e) => update("problem", e.target.value)}
                    placeholder="Describe the problem your startup solves. Be specific about who has this problem and why existing solutions fall short."
                    rows={4}
                    className="v2-input resize-none"
                  />
                </Field>
                <Field label="Your Solution" required>
                  <textarea
                    value={form.solution || ""}
                    onChange={(e) => update("solution", e.target.value)}
                    placeholder="How does your product solve this? What makes it different?"
                    rows={4}
                    className="v2-input resize-none"
                  />
                </Field>
              </div>
            </Section>

            {/* STEP: Traction */}
            <Section
              title="Traction & Team"
              step="traction"
              activeStep={activeStep}
              onToggle={setActiveStep}
              complete={isStepComplete("traction")}
              optional
            >
              <div className="space-y-4">
                <Field label="Key Metrics" hint="Revenue, users, growth rate, etc.">
                  <textarea
                    value={form.keyMetrics || ""}
                    onChange={(e) => update("keyMetrics", e.target.value)}
                    placeholder="$12K MRR, 2,400 active users, 180% QoQ growth, 89% retention"
                    rows={3}
                    className="v2-input resize-none"
                  />
                </Field>
                <Field label="Team" hint="Founders and key team members">
                  <textarea
                    value={form.teamInfo || ""}
                    onChange={(e) => update("teamInfo", e.target.value)}
                    placeholder="Alex Chen, CEO — ex-Stripe, 3x founder&#10;Jordan Patel, CTO — MIT CS, ex-Google"
                    rows={3}
                    className="v2-input resize-none"
                  />
                </Field>
              </div>
            </Section>

            {/* STEP: Design */}
            <Section
              title="Design Preferences"
              step="design"
              activeStep={activeStep}
              onToggle={setActiveStep}
              complete={isStepComplete("design")}
              optional
            >
              <Field label="Narrative Style" hint="How should the deck tell your story?">
                <select
                  value={form.narrativeStyle || ""}
                  onChange={(e) => update("narrativeStyle" as keyof DeckInput, e.target.value)}
                  className="v2-input"
                >
                  <option value="">Auto-detect (recommended)</option>
                  <option value="disruptor">Disruptor — Shock + revolution</option>
                  <option value="traction-machine">Traction Machine — Numbers first</option>
                  <option value="vision">Vision — Paint the future</option>
                  <option value="team-story">Team Story — Founder origin</option>
                  <option value="data-story">Data Story — Numbers-driven</option>
                  <option value="inevitable-trend">Inevitable Trend — Why now</option>
                </select>
              </Field>
              <Field label="Visual Style" hint="The visual personality of your deck">
                <select
                  value={form.visualStyle || ""}
                  onChange={(e) => update("visualStyle" as keyof DeckInput, e.target.value)}
                  className="v2-input"
                >
                  <option value="">Auto-detect from industry</option>
                  <option value="corporate-premium">Corporate Premium</option>
                  <option value="bold-playful">Bold Playful</option>
                  <option value="futuristic-gradient">Futuristic Gradient</option>
                  <option value="clinical-clean">Clinical Clean</option>
                  <option value="startup-energetic">Startup Energetic</option>
                </select>
              </Field>
            </Section>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Generate button */}
          <div className="mt-8 flex justify-center">
            <button
              onClick={handleGenerate}
              disabled={!canGenerate || loading}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-electric text-white font-semibold text-sm shadow-lg shadow-electric/25 hover:shadow-electric/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-electric/25"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate Deck
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>

          {!canGenerate && (
            <p className="text-center text-xs text-navy-400 dark:text-white/30 mt-2">
              Fill in company name, problem, and solution to generate
            </p>
          )}
        </div>
      </PageTransition>
    </AppShellV2>
  );
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function Section({
  title,
  step,
  activeStep,
  onToggle,
  complete,
  optional,
  children,
}: {
  title: string;
  step: Step;
  activeStep: Step;
  onToggle: (s: Step) => void;
  complete: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  const open = activeStep === step;
  return (
    <div className={`rounded-2xl border transition-all duration-200 ${
      open
        ? "border-[var(--border-interactive)] bg-[var(--surface-1)] shadow-elevation-1"
        : "border-[var(--border-default)] bg-[var(--surface-1)]"
    }`}>
      <button
        type="button"
        onClick={() => onToggle(open ? step : step)}
        className="w-full flex items-center justify-between px-5 py-4"
      >
        <div className="flex items-center gap-3">
          {complete ? (
            <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Check size={14} className="text-emerald-500" />
            </div>
          ) : (
            <div className="w-6 h-6 rounded-full bg-[var(--surface-2)] flex items-center justify-center">
              <span className="text-xs font-bold text-navy-400 dark:text-white/30">
                {STEPS.findIndex((s) => s.id === step) + 1}
              </span>
            </div>
          )}
          <span className="text-sm font-semibold text-navy dark:text-white">{title}</span>
          {optional && (
            <span className="text-[10px] text-navy-300 dark:text-white/20 uppercase tracking-wide">Optional</span>
          )}
        </div>
        {open ? <ChevronUp size={16} className="text-navy-300" /> : <ChevronDown size={16} className="text-navy-300" />}
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1">
          {children}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-navy-600 dark:text-white/70">
        {label}
        {required && <span className="text-electric ml-0.5">*</span>}
      </label>
      {hint && <p className="text-[11px] text-navy-400 dark:text-white/30">{hint}</p>}
      {children}
      <style jsx global>{`
        .v2-input {
          width: 100%;
          padding: 0.625rem 0.75rem;
          border-radius: 0.75rem;
          border: 1px solid var(--border-default);
          background: var(--surface-2);
          color: var(--tw-prose-body, #1a1a2e);
          font-size: 0.875rem;
          transition: border-color 0.15s, box-shadow 0.15s;
          outline: none;
        }
        .v2-input:focus {
          border-color: var(--border-interactive);
          box-shadow: 0 0 0 3px rgba(67,97,238,0.1);
        }
        .v2-input::placeholder {
          color: rgba(100,116,139,0.5);
        }
        .dark .v2-input {
          color: #e8e8ed;
        }
        .dark .v2-input::placeholder {
          color: rgba(255,255,255,0.25);
        }
      `}</style>
    </div>
  );
}
