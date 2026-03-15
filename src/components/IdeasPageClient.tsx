"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppNav from "@/components/AppNav";
import { IDEA_QUESTIONS } from "@/lib/generate-ideas";
import { BusinessIdea, IdeaQuestionAnswer } from "@/lib/types";
import { inputClass } from "@/components/ui/FormField";

export default function IdeasPageClient() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries(IDEA_QUESTIONS.map((q) => [q.id, ""]))
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ideas, setIdeas] = useState<BusinessIdea[] | null>(null);
  const [deckLoadingId, setDeckLoadingId] = useState<number | null>(null);

  const currentQuestion = IDEA_QUESTIONS[step];
  const answerPayload: IdeaQuestionAnswer[] = IDEA_QUESTIONS.map((q) => ({
    questionId: q.id,
    answer: answers[q.id]?.trim() || "",
  })).filter((a) => a.answer.length > 0);

  const canAdvance = step < IDEA_QUESTIONS.length - 1 ? (answers[currentQuestion?.id]?.trim()?.length ?? 0) > 0 : answerPayload.length >= 2;
  const canSubmit = answerPayload.length >= 2;

  const handleNext = useCallback(() => {
    if (step < IDEA_QUESTIONS.length - 1 && canAdvance) setStep((s) => s + 1);
  }, [step, canAdvance]);

  const handleBack = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
  }, [step]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: answerPayload }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to generate ideas");
      }
      const data: BusinessIdea[] = await res.json();
      setIdeas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [canSubmit, answerPayload]);

  const handleCheckDeckForIdea = useCallback(
    async (idea: BusinessIdea, index: number) => {
      setDeckLoadingId(index);
      try {
        const res = await fetch("/api/decks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: idea.name,
            industry: "",
            stage: "Early",
            fundingTarget: "Pre-seed / Seed",
            investorType: "vc" as const,
            problem: idea.problem,
            solution: idea.solution,
            keyMetrics: "",
            teamInfo: "",
          }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to generate deck");
        }
        const deck = await res.json();
        router.push(`/deck/${deck.shareId}`);
      } catch {
        setDeckLoadingId(null);
      }
    },
    [router]
  );

  const skipLinkClass =
    "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-electric focus:text-white focus:outline-none focus:ring-2 focus:ring-electric focus:ring-offset-2";

  if (ideas && ideas.length > 0) {
    return (
      <div className="min-h-screen bg-[#fafafa]">
        <a href="#main" className={skipLinkClass}>
          Skip to main content
        </a>
        <AppNav
          actions={
            <Link
              href="/create"
              className="min-h-[44px] inline-flex items-center px-4 py-2.5 rounded-lg bg-navy text-white text-sm font-semibold shadow-sm hover:bg-navy-800 hover:shadow-glow hover:shadow-electric/10 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              Create Deck
            </Link>
          }
        />

        <main id="main" className="pt-24 pb-16 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold text-navy mb-2 tracking-tight">
              Your business ideas
            </h1>
            <p className="text-gray-600 text-sm mb-8">
              Pick one to turn into a pitch deck, or start over.
            </p>
            <ul className="space-y-6">
              {ideas.map((idea, i) => (
                <li
                  key={i}
                  className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:border-electric/20 transition-colors"
                >
                  <h2 className="text-lg font-bold text-navy mb-1">{idea.name}</h2>
                  <p className="text-electric text-sm font-medium mb-3">{idea.oneLiner}</p>
                  <p className="text-gray-500 text-sm mb-2"><strong>Problem:</strong> {idea.problem}</p>
                  <p className="text-gray-500 text-sm mb-2"><strong>Solution:</strong> {idea.solution}</p>
                  <p className="text-gray-500 text-sm"><strong>Target:</strong> {idea.targetCustomer}</p>
                  {idea.whyNow && (
                    <p className="text-gray-500 text-xs mt-2"><strong>Why now:</strong> {idea.whyNow}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCheckDeckForIdea(idea, i)}
                    disabled={deckLoadingId !== null}
                    className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-light hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
                  >
                    {deckLoadingId === i ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Generating deck…
                      </>
                    ) : (
                      "Check deck for this idea"
                    )}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => { setIdeas(null); setStep(0); setAnswers(Object.fromEntries(IDEA_QUESTIONS.map((q) => [q.id, ""]))); }}
                aria-label="Generate new ideas again"
                className="min-h-[44px] inline-flex items-center px-5 py-2.5 rounded-xl border border-gray-200 text-navy text-sm font-medium shadow-sm hover:border-gray-300 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
              >
                Generate again
              </button>
              <Link
                href="/"
                aria-label="Back to PitchIQ home"
                className="min-h-[44px] inline-flex items-center px-5 py-2.5 rounded-xl text-gray-500 text-sm font-medium hover:text-navy hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
              >
                Back to home
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <a href="#main" className={skipLinkClass}>
        Skip to main content
      </a>
      <AppNav
        actions={
          <Link
            href="/create"
            className="min-h-[44px] inline-flex items-center px-4 py-2.5 rounded-lg text-navy text-sm font-medium shadow-sm hover:bg-white/5 hover:shadow-glow hover:shadow-electric/10 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          >
            Create Deck
          </Link>
        }
      />

      <main id="main" className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-2 tracking-tight">
            Business idea generator
          </h1>
          <p className="text-gray-600 text-sm mb-2">
            Answer a few questions and we’ll suggest viable business ideas. Then you can turn one into a pitch deck.
          </p>
          <p className="text-gray-600 text-sm mb-8 flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Takes about 60 seconds</span>
          </p>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <div className="flex items-center gap-2 mb-6">
              <span className="text-xs font-semibold text-gray-600">
                Question {step + 1} of {IDEA_QUESTIONS.length}
              </span>
              <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-electric rounded-full transition-all duration-300"
                  style={{ width: `${((step + 1) / IDEA_QUESTIONS.length) * 100}%` }}
                />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center gap-4 py-8" aria-live="polite" aria-busy="true">
                <div className="w-12 h-12 rounded-xl bg-electric/10 border border-electric/20 flex items-center justify-center">
                  <svg className="animate-spin h-6 w-6 text-electric" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-navy">Generating ideas...</p>
              </div>
            ) : (
              <>
                <label className="block text-sm font-semibold text-navy mb-3">
                  {currentQuestion.label}
                </label>
                <input
                  type="text"
                  value={answers[currentQuestion.id] ?? ""}
                  onChange={(e) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                  placeholder={currentQuestion.placeholder}
                  className={inputClass}
                  autoFocus
                />

                {error && (
                  <div className="mt-4 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2.5">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between mt-8">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={step === 0}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl text-gray-500 text-sm font-medium hover:text-navy disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
                  >
                    Back
                  </button>
                  {step < IDEA_QUESTIONS.length - 1 ? (
<button
                    type="button"
                    onClick={handleNext}
                    disabled={!canAdvance}
                    className="min-h-[44px] px-6 py-2.5 rounded-xl bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-light hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0 disabled:hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
                  >
                    Next
                  </button>
                  ) : (
                    <div className="flex flex-col items-end">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        aria-label={loading ? "Generating business ideas" : "Generate business ideas"}
                        aria-busy={loading}
                        className="min-h-[44px] px-6 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold shadow-sm hover:bg-navy-800 hover:shadow-glow hover:shadow-electric/10 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:pointer-events-none disabled:hover:translate-y-0 disabled:hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
                      >
                        Generate ideas
                      </button>
                      <p className="text-gray-500 text-xs mt-1.5">No signup · No credit card</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <p className="mt-6 text-center">
            <Link href="/create" className="text-electric text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 rounded">
              I already have an idea — go to Create Deck
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
