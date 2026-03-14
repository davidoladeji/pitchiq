"use client";

import { useState, useCallback } from "react";
import { DeckInput, DeckData } from "@/lib/types";

interface DeckFormProps {
  onGenerated: (deck: DeckData) => void;
}

const STEPS = [
  { label: "Company", description: "Basic info", icon: "01" },
  { label: "Details", description: "Funding & stage", icon: "02" },
  { label: "Story", description: "Problem & solution", icon: "03" },
  { label: "Traction", description: "Metrics & team", icon: "04" },
];

function StepIndicator({
  currentStep,
  totalSteps,
}: {
  currentStep: number;
  totalSteps: number;
}) {
  return (
    <div
      className="flex items-center gap-1 mb-10"
      role="group"
      aria-label={`Step ${currentStep + 1} of ${totalSteps}`}
    >
      {STEPS.map((step, i) => (
        <div key={step.label} className="flex items-center flex-1">
          <div className="flex items-center gap-2.5 flex-1">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-500 ${
                i < currentStep
                  ? "bg-electric text-white shadow-sm"
                  : i === currentStep
                  ? "bg-navy text-white shadow-lg shadow-navy/20 ring-4 ring-navy/5"
                  : "bg-gray-100 text-gray-300 border border-gray-200"
              }`}
              {...(i === currentStep ? { "aria-current": "step" as const } : {})}
            >
              {i < currentStep ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              ) : (
                step.icon
              )}
            </div>
            <div className="hidden sm:block min-w-0">
              <p
                className={`text-xs font-semibold truncate transition-colors ${
                  i <= currentStep ? "text-navy" : "text-gray-300"
                }`}
              >
                {step.label}
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                {step.description}
              </p>
            </div>
          </div>
          {i < totalSteps - 1 && (
            <div
              className={`h-px flex-1 mx-3 transition-all duration-500 ${
                i < currentStep ? "bg-electric" : "bg-gray-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function FormField({
  label,
  required,
  children,
  hint,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-navy">
        {label}{" "}
        {required && <span className="text-electric text-xs">*</span>}
      </label>
      {children}
      {hint && (
        <p className="text-xs text-gray-400 pl-1">{hint}</p>
      )}
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3.5 rounded-xl border border-gray-200 bg-white focus:border-electric focus:ring-2 focus:ring-electric/10 outline-none transition-all text-navy placeholder:text-gray-300 text-sm";

export default function DeckForm({ onGenerated }: DeckFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);
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
  });

  const update = useCallback((field: keyof DeckInput, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  }, []);

  const canAdvance = () => {
    switch (step) {
      case 0:
        return form.companyName.trim() && form.industry.trim();
      case 1:
        return true;
      case 2:
        return form.problem.trim() && form.solution.trim();
      case 3:
        // Require last stage (Traction) details so generation only starts after final stage is complete
        return form.keyMetrics.trim().length > 0 && form.teamInfo.trim().length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < STEPS.length - 1 && canAdvance()) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      handleNext();
      return;
    }
    // Only generate after all stage details (including last stage) are complete
    if (!canAdvance()) return;

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate deck");
      }

      const deck: DeckData = await res.json();
      onGenerated(deck);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Sticky step bar — stays visible below nav while scrolling (founder-first, reduces drop-off) */}
      <div className="sticky top-16 z-40 -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 md:-mx-10 md:-mt-10 px-6 sm:px-8 md:px-10 pt-6 sm:pt-8 md:pt-10 pb-4 bg-white border-b border-gray-100 shadow-sm transition-shadow duration-200">
        <StepIndicator currentStep={step} totalSteps={STEPS.length} />
        {/* Progress bar */}
        <div className="h-1 bg-gray-100 rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-navy rounded-full transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="pt-8" />

      <div className="min-h-[300px] relative">
        {/* Loading skeleton — perceived speed during generation */}
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col justify-center rounded-xl bg-gray-50/80 border border-gray-100 p-8 animate-fade-in" aria-live="polite" aria-busy="true">
            <div className="flex flex-col items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-electric/10 border border-electric/20 flex items-center justify-center">
                <svg className="animate-spin h-7 w-7 text-electric" viewBox="0 0 24 24" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-navy">Generating your deck...</p>
              <div className="w-full max-w-xs space-y-3">
                <div className="h-2 rounded-full bg-gray-200 animate-pulse" style={{ width: "100%" }} />
                <div className="h-2 rounded-full bg-gray-200 animate-pulse" style={{ width: "85%" }} />
                <div className="h-2 rounded-full bg-gray-200 animate-pulse" style={{ width: "70%" }} />
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Company */}
        {step === 0 && !loading && (
          <div className="space-y-6 animate-fade-in">
            <FormField label="Company Name" required>
              <input
                type="text"
                required
                value={form.companyName}
                onChange={(e) => update("companyName", e.target.value)}
                placeholder="Acme Inc."
                className={inputClass}
                autoFocus
              />
            </FormField>
            <FormField
              label="Industry"
              required
              hint="e.g. FinTech, HealthTech, AI/ML, SaaS, Marketplace"
            >
              <input
                type="text"
                required
                value={form.industry}
                onChange={(e) => update("industry", e.target.value)}
                placeholder="FinTech, HealthTech, SaaS..."
                className={inputClass}
              />
            </FormField>
          </div>
        )}

        {/* Step 2: Funding Details */}
        {step === 1 && !loading && (
          <div className="space-y-6 animate-fade-in">
            <FormField label="Stage">
              <select
                value={form.stage}
                onChange={(e) => update("stage", e.target.value)}
                className={`${inputClass} bg-white cursor-pointer`}
              >
                <option>Pre-seed</option>
                <option>Seed</option>
                <option>Series A</option>
                <option>Series B</option>
                <option>Series C+</option>
              </select>
            </FormField>
            <FormField label="Funding Target" hint="How much are you raising?">
              <input
                type="text"
                value={form.fundingTarget}
                onChange={(e) => update("fundingTarget", e.target.value)}
                placeholder="$500K, $2M..."
                className={inputClass}
              />
            </FormField>
            <FormField label="Target Investor">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "vc", label: "VC", desc: "Venture Capital" },
                  { value: "angel", label: "Angel", desc: "Angel Investors" },
                  {
                    value: "accelerator",
                    label: "Accelerator",
                    desc: "Programs",
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => update("investorType", opt.value)}
                    className={`min-h-[44px] flex flex-col items-center justify-center gap-1.5 p-4 rounded-xl border-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 ${
                      form.investorType === opt.value
                        ? "border-navy bg-navy/[0.03] text-navy shadow-sm"
                        : "border-gray-200 text-gray-400 hover:border-gray-300 hover:text-gray-500"
                    }`}
                  >
                    <span className="text-sm font-bold">{opt.label}</span>
                    <span className="text-[10px] text-gray-400">
                      {opt.desc}
                    </span>
                  </button>
                ))}
              </div>
            </FormField>
          </div>
        )}

        {/* Step 3: Story */}
        {step === 2 && !loading && (
          <div className="space-y-6 animate-fade-in">
            <FormField
              label="Problem You're Solving"
              required
              hint="Be specific about who has this problem and why it matters"
            >
              <textarea
                required
                rows={3}
                value={form.problem}
                onChange={(e) => update("problem", e.target.value)}
                placeholder="Describe the problem your startup solves. Be specific about who has this problem and why existing solutions fall short."
                className={`${inputClass} resize-none`}
              />
            </FormField>
            <FormField
              label="Your Solution"
              required
              hint="What makes your approach uniquely different?"
            >
              <textarea
                required
                rows={3}
                value={form.solution}
                onChange={(e) => update("solution", e.target.value)}
                placeholder="Describe your solution. How does it work? What makes it different?"
                className={`${inputClass} resize-none`}
              />
            </FormField>
          </div>
        )}

        {/* Step 4: Traction */}
        {step === 3 && !loading && (
          <div className="space-y-6 animate-fade-in">
            <FormField
              label="Key Metrics / Traction"
              required
              hint="Numbers make your deck stronger — MRR, users, growth rate"
            >
              <textarea
                required
                rows={3}
                value={form.keyMetrics}
                onChange={(e) => update("keyMetrics", e.target.value)}
                placeholder="MRR, users, growth rate, partnerships..."
                className={`${inputClass} resize-none`}
              />
            </FormField>
            <FormField
              label="Team"
              required
              hint="Highlight relevant experience and domain expertise"
            >
              <textarea
                required
                rows={3}
                value={form.teamInfo}
                onChange={(e) => update("teamInfo", e.target.value)}
                placeholder="Founder backgrounds, key hires, domain expertise..."
                className={`${inputClass} resize-none`}
              />
            </FormField>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm" role="alert">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <svg
                className="w-4 h-4 shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              className="min-h-[44px] shrink-0 inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-electric text-white text-sm font-semibold hover:bg-electric-dark transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={handleBack}
          className={`min-h-[44px] inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 ${
            step === 0
              ? "opacity-0 pointer-events-none"
              : "text-gray-400 hover:text-navy hover:bg-gray-50"
          }`}
        >
          <span className="flex items-center gap-1.5">
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back
          </span>
        </button>

        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!canAdvance()}
            className="min-h-[44px] inline-flex items-center px-6 py-3 rounded-xl bg-navy text-white text-sm font-semibold shadow-sm hover:bg-navy-800 hover:shadow-glow hover:shadow-electric/10 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          >
            <span className="flex items-center gap-1.5">
              Continue
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </span>
          </button>
        ) : (
          <div className="flex flex-col items-end gap-2">
            <button
              type="submit"
              disabled={loading || !canAdvance()}
              className="min-h-[44px] inline-flex items-center px-8 py-3.5 rounded-xl bg-electric text-white font-semibold hover:bg-electric-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-electric/20 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              {loading ? (
                <span className="flex items-center gap-2.5">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Generating...
                </span>
              ) : (
                "Generate Pitch Deck"
              )}
            </button>
            <p className="text-gray-400 text-sm">No signup · No credit card</p>
            <p className="text-gray-400 text-xs mt-1">We don&apos;t store your pitch — generate and share, no account needed.</p>
          </div>
        )}
      </div>
    </form>
  );
}
