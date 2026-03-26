"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight, ArrowLeft, Lightbulb, Users, Clock, Loader2, RotateCcw } from "lucide-react";
import { IDEA_QUESTIONS } from "@/lib/generate-ideas";
import { BusinessIdea, IdeaQuestionAnswer } from "@/lib/types";
import { Button } from "@/components/v2/ui/button";
import { Card } from "@/components/v2/ui/card";

export default function IdeasPageV2() {
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
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ideas?.length) {
      setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }
  }, [ideas]);

  const currentQuestion = IDEA_QUESTIONS[step];
  const answerPayload: IdeaQuestionAnswer[] = IDEA_QUESTIONS.map((q) => ({
    questionId: q.id,
    answer: answers[q.id]?.trim() || "",
  })).filter((a) => a.answer.length > 0);

  const canAdvance = step < IDEA_QUESTIONS.length - 1 ? (answers[currentQuestion?.id]?.trim()?.length ?? 0) > 0 : answerPayload.length >= 2;
  const canSubmit = answerPayload.length >= 2;

  const startLoading = useCallback((isSurprise: boolean) => {
    setLoading(true);
    setError("");
    const messages = isSurprise
      ? ["Rolling the dice...", "Mixing unexpected themes...", "Crafting wild ideas..."]
      : ["Analyzing your answers...", "Finding market opportunities...", "Crafting tailored ideas..."];
    let i = 0;
    setLoadingMessage(messages[0]);
    const interval = setInterval(() => { i++; if (i < messages.length) setLoadingMessage(messages[i]); }, 1500);
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
        if (data.suggestion) setAnswers((prev) => ({ ...prev, [questionId]: data.suggestion }));
      }
    } catch { /* */ } finally {
      setAutofilling((prev) => ({ ...prev, [questionId]: false }));
    }
  }, [answers]);

  const handleAutofillAll = useCallback(async () => {
    const empty = IDEA_QUESTIONS.filter((q) => !answers[q.id]?.trim());
    if (!empty.length) return;
    empty.forEach((q) => setAutofilling((prev) => ({ ...prev, [q.id]: true })));
    await Promise.all(empty.map(async (q) => {
      try {
        const res = await fetch("/api/ideas/autofill", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: q.id, previousAnswers: answers }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.suggestion) setAnswers((prev) => ({ ...prev, [q.id]: data.suggestion }));
        }
      } catch { /* */ } finally {
        setAutofilling((prev) => ({ ...prev, [q.id]: false }));
      }
    }));
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
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to generate ideas"); }
      setIdeas(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { cleanup(); setLoading(false); }
  }, [canSubmit, answerPayload, startLoading]);

  const handleSurpriseMe = useCallback(async () => {
    const cleanup = startLoading(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ surpriseMe: true }),
      });
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed to generate ideas"); }
      setIdeas(await res.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally { cleanup(); setLoading(false); }
  }, [startLoading]);

  const handleCreateDeck = useCallback(async (idea: BusinessIdea, index: number) => {
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
      if (!res.ok) { const data = await res.json(); throw new Error(data.error || "Failed"); }
      const deck = await res.json();
      router.push(`/deck/${deck.shareId}`);
    } catch { setDeckLoadingId(null); }
  }, [router]);

  const resetAll = () => {
    setIdeas(null);
    setStep(0);
    setAnswers(Object.fromEntries(IDEA_QUESTIONS.map((q) => [q.id, ""])));
    setError("");
  };

  // ── Results view ──
  if (ideas && ideas.length > 0) {
    return (
      <div ref={resultsRef} className="space-y-6 scroll-mt-24">
        <div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--void-text)" }}>Here are your ideas</h1>
          <p className="text-sm mt-1" style={{ color: "var(--void-text-dim)" }}>Pick one to turn into a full pitch deck with PIQ Score.</p>
        </div>

        <div className="space-y-4">
          {ideas.map((idea, i) => (
            <Card key={i} className="p-6 group hover:border-white/[0.12] transition-all">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h2 className="text-lg font-bold" style={{ color: "var(--void-text)" }}>{idea.name}</h2>
                  <p className="text-sm font-medium" style={{ color: "var(--neon-cyan)" }}>{idea.oneLiner}</p>
                </div>
                <span className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ background: "rgba(67,97,238,0.15)", color: "var(--neon-electric)" }}>
                  {i + 1}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <div className="rounded-xl p-3" style={{ background: "var(--void-surface)", border: "1px solid var(--void-border)" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--void-text-dim)" }}>Problem</p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--void-text-muted)" }}>{idea.problem}</p>
                </div>
                <div className="rounded-xl p-3" style={{ background: "var(--void-surface)", border: "1px solid var(--void-border)" }}>
                  <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--void-text-dim)" }}>Solution</p>
                  <p className="text-sm leading-relaxed" style={{ color: "var(--void-text-muted)" }}>{idea.solution}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs mb-4" style={{ color: "var(--void-text-dim)" }}>
                <span className="inline-flex items-center gap-1"><Users size={12} /> {idea.targetCustomer}</span>
                {idea.whyNow && <span className="inline-flex items-center gap-1"><Clock size={12} /> {idea.whyNow}</span>}
              </div>

              <Button onClick={() => handleCreateDeck(idea, i)} disabled={deckLoadingId !== null}>
                {deckLoadingId === i ? <><Loader2 size={14} className="animate-spin" /> Building deck...</> : <>Turn into pitch deck <ArrowRight size={14} /></>}
              </Button>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={resetAll}><RotateCcw size={14} /> Start over</Button>
          <Button variant="outline" onClick={handleSurpriseMe} disabled={loading}><Sparkles size={14} /> Surprise me again</Button>
        </div>
      </div>
    );
  }

  // ── Question wizard view ──
  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: "var(--void-text)" }}>Find your next startup idea</h1>
        <p className="text-sm mt-1" style={{ color: "var(--void-text-dim)" }}>Answer a few questions and AI will suggest tailored ideas. Or skip the questions entirely.</p>
      </div>

      {/* Surprise Me */}
      <button
        type="button"
        onClick={handleSurpriseMe}
        disabled={loading}
        className="w-full p-4 rounded-2xl text-left group transition-all disabled:opacity-60 hover:border-white/[0.12]"
        style={{ background: "rgba(67,97,238,0.05)", border: "2px dashed rgba(67,97,238,0.2)" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all" style={{ background: "rgba(67,97,238,0.15)", color: "var(--neon-electric)" }}>
            <Sparkles size={20} />
          </div>
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--void-text)" }}>Surprise me</p>
            <p className="text-xs" style={{ color: "var(--void-text-dim)" }}>Skip the questions — get random, creative ideas instantly</p>
          </div>
        </div>
      </button>

      <div className="relative flex items-center gap-3">
        <div className="flex-1 h-px" style={{ background: "var(--void-border)" }} />
        <span className="text-xs font-medium" style={{ color: "var(--void-text-dim)" }}>or answer questions</span>
        <div className="flex-1 h-px" style={{ background: "var(--void-border)" }} />
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleAutofillAll}
          disabled={Object.values(autofilling).some(Boolean)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
          style={{ background: "rgba(var(--neon-violet-rgb,139,92,246),0.12)", color: "var(--neon-violet)" }}
        >
          <Sparkles size={12} /> Autofill all empty fields
        </button>
      </div>

      {/* Question card */}
      <Card className="p-6 sm:p-8">
        {/* Progress */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-xs font-semibold tabular-nums shrink-0" style={{ color: "var(--void-text-muted)" }}>
            {step + 1}/{IDEA_QUESTIONS.length}
          </span>
          <div className="flex-1 flex gap-1">
            {IDEA_QUESTIONS.map((_, i) => (
              <div
                key={i}
                className="h-1 flex-1 rounded-full transition-colors duration-300"
                style={{ background: i <= step ? "var(--neon-electric)" : "var(--void-surface)" }}
              />
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "rgba(67,97,238,0.1)", border: "1px solid rgba(67,97,238,0.2)" }}>
              <Loader2 size={24} className="animate-spin" style={{ color: "var(--neon-electric)" }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: "var(--void-text)" }}>{loadingMessage}</p>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-2 mb-1">
              <label className="block text-base font-semibold" style={{ color: "var(--void-text)" }}>
                {currentQuestion.label}
              </label>
              <button
                type="button"
                onClick={() => handleAutofill(currentQuestion.id)}
                disabled={autofilling[currentQuestion.id]}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-50"
                style={{ background: "rgba(67,97,238,0.1)", color: "var(--neon-cyan)" }}
              >
                {autofilling[currentQuestion.id] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                AI Suggest
              </button>
            </div>
            <p className="text-xs mb-4" style={{ color: "var(--void-text-dim)" }}>{currentQuestion.hint}</p>

            {currentQuestion.id === "model" ? (
              <select
                value={answers[currentQuestion.id] ?? ""}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                className="w-full h-10 rounded-lg border px-3 text-sm"
                style={{ background: "var(--void-surface)", borderColor: "var(--void-border)", color: "var(--void-text)" }}
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
                className="w-full rounded-lg border px-3 py-2.5 text-sm resize-none placeholder:opacity-30"
                style={{ background: "var(--void-surface)", borderColor: "var(--void-border)", color: "var(--void-text)" }}
                autoFocus
              />
            )}

            {error && (
              <div className="mt-4 p-3 rounded-xl text-sm" style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)", color: "#F87171" }}>
                {error}
              </div>
            )}

            <div className="flex items-center justify-between mt-6">
              <button
                type="button"
                onClick={() => step > 0 && setStep((s) => s - 1)}
                disabled={step === 0}
                className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors disabled:opacity-30"
                style={{ color: "var(--void-text-dim)" }}
              >
                <ArrowLeft size={14} className="inline mr-1" /> Back
              </button>

              <div className="flex items-center gap-2">
                {step < IDEA_QUESTIONS.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setStep((s) => s + 1)}
                    className="px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
                    style={{ color: "var(--void-text-dim)" }}
                  >
                    Skip
                  </button>
                )}
                {step < IDEA_QUESTIONS.length - 1 ? (
                  <Button onClick={() => canAdvance && setStep((s) => s + 1)} disabled={!canAdvance}>
                    Next <ArrowRight size={14} />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} disabled={!canSubmit}>
                    <Lightbulb size={14} /> Generate ideas
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </Card>

      <p className="text-center">
        <Link href="/create" className="text-sm font-medium hover:underline" style={{ color: "var(--neon-cyan)" }}>
          Already have an idea? Create your deck →
        </Link>
      </p>
    </div>
  );
}
