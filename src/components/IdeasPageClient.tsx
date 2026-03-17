"use client";

import { useState, useCallback, useRef, useEffect } from "react";
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
  const [loadingMessage, setLoadingMessage] = useState("Generating ideas...");
  const [error, setError] = useState("");
  const [ideas, setIdeas] = useState<BusinessIdea[] | null>(null);
  const [deckLoadingId, setDeckLoadingId] = useState<number | null>(null);
  const [autofilling, setAutofilling] = useState<Record<string, boolean>>({});
  const resultsHeadingRef = useRef<HTMLHeadingElement>(null);

  /** When ideas load, move focus to results heading so keyboard/screen reader users land on the new content (WCAG 2.1 AA, founder-first). */
  useEffect(() => {
    if (ideas?.length) {
      const t = setTimeout(() => resultsHeadingRef.current?.focus({ preventScroll: true }), 200);
      return () => clearTimeout(t);
    }
  }, [ideas]);

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

  const startLoading = useCallback((isSurprise: boolean) => {
    setLoading(true);
    setError("");
    const messages = isSurprise
      ? ["Rolling the dice...", "Mixing unexpected themes...", "Crafting wild ideas..."]
      : ["Analyzing your answers...", "Finding market opportunities...", "Crafting tailored ideas..."];
    let i = 0;
    setLoadingMessage(messages[0]);
    const interval = setInterval(() => {
      i++;
      if (i < messages.length) setLoadingMessage(messages[i]);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const handleAutofill = useCallback(async (questionId: string) => {
    setAutofilling((prev) => ({ ...prev, [questionId]: true }));
    try {
      const res = await fetch("/api/ideas/autofill", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questionId, previousAnswers: answers }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.suggestion) {
          setAnswers((prev) => ({ ...prev, [questionId]: data.suggestion }));
        }
      }
    } catch {
      // Silently fail — user can still type manually
    } finally {
      setAutofilling((prev) => ({ ...prev, [questionId]: false }));
    }
  }, [answers]);

  const handleAutofillAll = useCallback(async () => {
    const emptyQuestions = IDEA_QUESTIONS.filter((q) => !answers[q.id]?.trim());
    if (emptyQuestions.length === 0) return;
    emptyQuestions.forEach((q) => setAutofilling((prev) => ({ ...prev, [q.id]: true })));
    await Promise.all(
      emptyQuestions.map(async (q) => {
        try {
          const res = await fetch("/api/ideas/autofill", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ questionId: q.id, previousAnswers: answers }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.suggestion) {
              setAnswers((prev) => ({ ...prev, [q.id]: data.suggestion }));
            }
          }
        } catch {
          // Silently fail
        } finally {
          setAutofilling((prev) => ({ ...prev, [q.id]: false }));
        }
      })
    );
  }, [answers]);

  const handleSubmit = useCallback(async () => {
    if (!canSubmit) return;
    const cleanup = startLoading(false);
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
      cleanup();
      setLoading(false);
    }
  }, [canSubmit, answerPayload, startLoading]);

  const handleSurpriseMe = useCallback(async () => {
    const cleanup = startLoading(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surpriseMe: true }),
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
      cleanup();
      setLoading(false);
    }
  }, [startLoading]);

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

  const resetAll = () => {
    setIdeas(null);
    setStep(0);
    setAnswers(Object.fromEntries(IDEA_QUESTIONS.map((q) => [q.id, ""])));
    setError("");
  };

  // ── Results view ──
  if (ideas && ideas.length > 0) {
    return (
      <div className="min-h-screen bg-navy-50">
        <AppNav />

        <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6" aria-label="Main content">
          <div className="max-w-3xl mx-auto">
            <h1
              ref={resultsHeadingRef}
              tabIndex={-1}
              className="text-2xl md:text-3xl font-bold text-navy mb-1 tracking-tight outline-none focus:outline-none"
            >
              Here are your ideas
            </h1>
            <p className="text-navy-500 text-sm mb-8">
              Pick one to turn into a full pitch deck with PIQ Score.
            </p>
            <div className="space-y-5">
              {ideas.map((idea, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-navy-100 p-6 shadow-sm hover:border-electric/20 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h2 className="text-lg font-bold text-navy">{idea.name}</h2>
                      <p className="text-electric text-sm font-medium">{idea.oneLiner}</p>
                    </div>
                    <span className="shrink-0 w-8 h-8 rounded-lg bg-electric/[0.06] flex items-center justify-center text-electric text-sm font-bold">
                      {i + 1}
                    </span>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    <div className="rounded-xl bg-navy-50 p-3">
                      <p className="text-[11px] text-navy-500 font-semibold uppercase tracking-wider mb-1">Problem</p>
                      <p className="text-navy-600 text-sm leading-relaxed">{idea.problem}</p>
                    </div>
                    <div className="rounded-xl bg-navy-50 p-3">
                      <p className="text-[11px] text-navy-500 font-semibold uppercase tracking-wider mb-1">Solution</p>
                      <p className="text-navy-600 text-sm leading-relaxed">{idea.solution}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-navy-500 mb-4">
                    <span className="inline-flex items-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                      {idea.targetCustomer}
                    </span>
                    {idea.whyNow && (
                      <span className="inline-flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        {idea.whyNow}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCheckDeckForIdea(idea, i)}
                    disabled={deckLoadingId !== null}
                    aria-label={deckLoadingId === i ? "Building deck…" : `Turn ${idea.name} into a pitch deck`}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-electric text-white text-sm font-semibold shadow-lg shadow-electric/25 hover:bg-electric-600 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 disabled:pointer-events-none disabled:hover:translate-y-0 disabled:hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    {deckLoadingId === i ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Building deck...
                      </>
                    ) : (
                      <>
                        Turn into pitch deck
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={resetAll}
                className="min-h-[44px] inline-flex items-center px-5 py-2.5 rounded-xl border border-navy-200 text-navy text-sm font-medium hover:border-navy-300 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Start over
              </button>
              <button
                type="button"
                onClick={handleSurpriseMe}
                disabled={loading}
                className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-navy-200 text-navy text-sm font-medium hover:border-electric/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <svg className="w-4 h-4 text-electric" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" /></svg>
                Surprise me again
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Question wizard view ──
  return (
    <div className="min-h-screen bg-navy-50">
      <AppNav
      />

      <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6" aria-label="Main content">
        <div className="max-w-xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-1 tracking-tight">
            Find your next startup idea
          </h1>
          <p className="text-navy-500 text-sm mb-6">
            Answer a few questions and AI will suggest tailored ideas. Or skip the questions entirely.
          </p>

          {/* Surprise Me card */}
          <button
            type="button"
            onClick={handleSurpriseMe}
            disabled={loading}
            aria-label="Surprise me — get random startup ideas without answering questions"
            className="w-full mb-6 p-4 rounded-2xl border-2 border-dashed border-electric/20 bg-electric/[0.02] hover:bg-electric/[0.05] hover:border-electric/30 transition-all text-left group disabled:opacity-60 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-electric/10 flex items-center justify-center shrink-0 group-hover:bg-electric group-hover:text-white text-electric transition-all">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                </svg>
              </div>
              <div>
                <p className="font-semibold text-navy text-sm">Surprise me</p>
                <p className="text-navy-500 text-xs">Skip the questions &mdash; get random, creative ideas instantly</p>
              </div>
            </div>
          </button>

          <div className="relative flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-navy-200" />
            <span className="text-xs text-navy-500 font-medium">or answer questions</span>
            <div className="flex-1 h-px bg-navy-200" />
          </div>

          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={handleAutofillAll}
              disabled={Object.values(autofilling).some(Boolean)}
              aria-label="Autofill all empty fields with AI suggestions"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-violet-600 bg-violet-50 hover:bg-violet-100 transition-all disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              title="Fill all empty fields with AI suggestions"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
              Autofill all empty fields
            </button>
          </div>

          {/* Question card */}
          <div className="bg-white rounded-2xl shadow-sm border border-navy-100 p-6 sm:p-8">
            {/* Progress */}
            <div
              className="flex items-center gap-3 mb-6"
              role="group"
              aria-label={`Question ${step + 1} of ${IDEA_QUESTIONS.length}`}
            >
              <span className="text-xs font-semibold text-navy-600 tabular-nums shrink-0">
                {step + 1}/{IDEA_QUESTIONS.length}
              </span>
              <div className="flex-1 flex gap-1">
                {IDEA_QUESTIONS.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                      i <= step ? "bg-electric" : "bg-navy-100"
                    }`}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center gap-4 py-12" aria-live="polite" aria-busy="true">
                <div className="w-12 h-12 rounded-xl bg-electric/10 border border-electric/20 flex items-center justify-center">
                  <svg className="animate-spin h-6 w-6 text-electric" viewBox="0 0 24 24" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-navy">{loadingMessage}</p>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2 mb-1">
                  <label className="block text-base font-semibold text-navy">
                    {currentQuestion.label}
                  </label>
                  <button
                    type="button"
                    onClick={() => handleAutofill(currentQuestion.id)}
                    disabled={autofilling[currentQuestion.id]}
                    aria-label={autofilling[currentQuestion.id] ? "AI suggesting answer…" : "AI suggest an answer for this question"}
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-electric bg-electric/[0.06] hover:bg-electric/[0.12] transition-all disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    title="AI will suggest an answer you can refine"
                  >
                    {autofilling[currentQuestion.id] ? (
                      <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
                      </svg>
                    )}
                    AI Suggest
                  </button>
                </div>
                <p className="text-xs text-navy-500 mb-4">{currentQuestion.hint}</p>

                {currentQuestion.id === "model" ? (
                  <select
                    value={answers[currentQuestion.id] ?? ""}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                    className={inputClass}
                  >
                    <option value="">Select a business model...</option>
                    <option value="SaaS subscriptions">SaaS subscriptions</option>
                    <option value="Marketplace / transaction fees">Marketplace / transaction fees</option>
                    <option value="Consulting / services">Consulting / services</option>
                    <option value="E-commerce / physical products">E-commerce / physical products</option>
                    <option value="Advertising / content">Advertising / content</option>
                    <option value="Freemium with premium tier">Freemium with premium tier</option>
                    <option value="Open to anything">Open to anything</option>
                  </select>
                ) : (
                  <textarea
                    value={answers[currentQuestion.id] ?? ""}
                    onChange={(e) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                    placeholder={currentQuestion.placeholder}
                    rows={3}
                    className={`${inputClass} resize-none`}
                    autoFocus
                  />
                )}

                {error && (
                  <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between mt-6">
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={step === 0}
                    className="min-h-[44px] px-4 py-2.5 rounded-xl text-navy-500 text-sm font-medium hover:text-navy disabled:opacity-30 disabled:pointer-events-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    Back
                  </button>

                  <div className="flex items-center gap-2">
                    {step < IDEA_QUESTIONS.length - 1 && (
                      <button
                        type="button"
                        onClick={() => setStep((s) => s + 1)}
                        className="min-h-[44px] px-4 py-2.5 rounded-xl text-navy-500 text-sm font-medium hover:text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      >
                        Skip
                      </button>
                    )}
                    {step < IDEA_QUESTIONS.length - 1 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        disabled={!canAdvance}
                        className="min-h-[44px] px-6 py-2.5 rounded-xl bg-electric text-white text-sm font-semibold shadow-lg shadow-electric/25 hover:bg-electric-600 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:pointer-events-none disabled:hover:translate-y-0 disabled:hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        aria-label="Next question"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        className="min-h-[44px] px-6 py-2.5 rounded-xl bg-navy text-white text-sm font-semibold shadow-sm hover:bg-navy-800 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-40 disabled:pointer-events-none disabled:hover:translate-y-0 disabled:hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                        aria-label={canSubmit ? "Generate ideas" : "Complete answers to generate ideas"}
                      >
                        Generate ideas
                      </button>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          <p className="mt-6 text-center">
            <Link href="/create" aria-label="Create your deck from scratch" className="text-electric text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded">
              Already have an idea? Create your deck
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
