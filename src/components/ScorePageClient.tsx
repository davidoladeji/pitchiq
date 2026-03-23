"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import DeckUploader from "@/components/DeckUploader";
import PIQScoreCard from "@/components/PIQScoreCard";
import PlanCompareModal from "@/components/PlanCompareModal";
import { getPlanLimits } from "@/lib/plan-limits";
import { PIQScore } from "@/lib/types";

type PageState = "idle" | "uploading" | "parsing" | "scoring" | "result" | "error";

export default function ScorePageClient({
  userPlan = "starter",
}: {
  userPlan?: string;
}) {
  const { status } = useSession();
  const router = useRouter();
  const limits = getPlanLimits(userPlan);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [state, setState] = useState<PageState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [score, setScore] = useState<PIQScore | null>(null);
  const [slideCount, setSlideCount] = useState(0);
  const [detectedName, setDetectedName] = useState("");
  const [shareId, setShareId] = useState<string | null>(null);
  const [refining, setRefining] = useState(false);
  const [refineError, setRefineError] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [progress, setProgress] = useState(0);
  const [extendEnabled, setExtendEnabled] = useState<boolean | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Check if Extend.ai is available on mount
  useEffect(() => {
    fetch("/api/upload")
      .then((r) => r.json())
      .then((d) => setExtendEnabled(d.extendEnabled === true))
      .catch(() => setExtendEnabled(false));
  }, []);

  useEffect(() => {
    if (state !== "result" || !score) return;
    const t = window.setTimeout(() => {
      const reduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      resultRef.current?.scrollIntoView({
        behavior: reduced ? "instant" : "smooth",
        block: "start",
      });
    }, 100);
    return () => window.clearTimeout(t);
  }, [state, score]);

  const handleFileSelected = useCallback((f: File) => {
    setFile(f);
    setScore(null);
    setState("idle");
    setErrorMsg("");
    setProgress(0);
  }, []);

  const handleScore = async () => {
    if (!file) return;
    setErrorMsg("");
    setProgress(0);

    if (extendEnabled) {
      // Two-step flow: Upload to Extend → Score with fileId
      await handleExtendFlow();
    } else {
      // Direct FormData upload
      await handleLocalFlow();
    }
  };

  async function handleExtendFlow() {
    if (!file) return;

    // Step 1: Upload
    setState("uploading");
    setProgress(10);

    let fileId: string;
    try {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      setProgress(40);

      if (!uploadRes.ok) {
        if (uploadRes.status === 413) {
          setErrorMsg("File too large for upload. Please use a file under 4.5 MB, or compress your PDF before uploading.");
          setState("error");
          return;
        }
        let data;
        try {
          data = await uploadRes.json();
        } catch {
          setErrorMsg("Upload failed. The file may be too large.");
          setState("error");
          return;
        }
        if (data.useLocalUpload) {
          // Extend not configured — fall back to local
          return handleLocalFlow();
        }
        setErrorMsg(data.error || "Upload failed.");
        setState("error");
        return;
      }

      const uploadData = await uploadRes.json();
      fileId = uploadData.fileId;
    } catch {
      setErrorMsg("Upload failed. Please try again.");
      setState("error");
      return;
    }

    // Step 2: Score with fileId
    setState("scoring");
    setProgress(60);

    try {
      const scoreRes = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileId,
          companyName: companyName.trim() || undefined,
        }),
      });

      setProgress(90);

      const data = await scoreRes.json();

      if (!scoreRes.ok) {
        setErrorMsg(data.error || "Scoring failed.");
        setState("error");
        return;
      }

      setScore(data.piqScore);
      setSlideCount(data.slideCount);
      setDetectedName(data.companyName);
      setShareId(data.shareId || null);
      setProgress(100);
      setState("result");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setState("error");
    }
  }

  async function handleLocalFlow() {
    if (!file) return;
    setState("uploading");
    setProgress(20);

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (companyName.trim()) {
        formData.append("companyName", companyName.trim());
      }

      setProgress(40);
      const res = await fetch("/api/score", { method: "POST", body: formData });
      setProgress(80);
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setState("error");
        return;
      }

      setScore(data.piqScore);
      setSlideCount(data.slideCount);
      setDetectedName(data.companyName);
      setShareId(data.shareId || null);
      setProgress(100);
      setState("result");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setState("error");
    }
  }

  async function handleRefine() {
    if (!shareId) return;
    setRefining(true);
    setRefineError("");

    try {
      const res = await fetch(`/api/decks/${shareId}/refine-deck`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ investorType: "vc" }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "ACCESS_DENIED") {
          setRefineError("upgrade");
        } else {
          setRefineError(data.error || "Refinement failed. Please try again.");
        }
        setRefining(false);
        return;
      }

      router.push(`/editor/${data.newDeck.shareId}`);
    } catch {
      setRefineError("Network error. Please try again.");
      setRefining(false);
    }
  }

  const isProcessing = state === "uploading" || state === "parsing" || state === "scoring";

  const statusLabel =
    state === "uploading"
      ? "Uploading document…"
      : state === "parsing"
        ? "Parsing document…"
        : state === "scoring"
          ? "AI is scoring your deck…"
          : "Analyzing…";

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-navy-50" aria-busy="true">
        <AppNav />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div
            className="w-8 h-8 rounded-full border-2 border-electric border-t-transparent animate-spin motion-reduce:animate-none motion-reduce:border-electric/40"
            aria-hidden="true"
          />
        </div>
        <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          Loading score
        </span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-navy-50 dark:bg-navy-950">
        <AppNav />
        <main
          id="main"
          tabIndex={-1}
          className="pt-24 pb-16 px-4 sm:px-6"
          aria-labelledby="score-signin-heading"
        >
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-electric/10 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-electric" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h1 id="score-signin-heading" className="text-2xl font-bold text-navy mb-2">
              Sign in to score your deck
            </h1>
            <p className="text-navy-500 mb-6 max-w-md">Create a free account to get an instant fundability score with actionable feedback.</p>
            <a
              href="/auth/signin?callbackUrl=/score"
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-full bg-electric text-white font-semibold shadow-lg shadow-electric/25 hover:shadow-glow hover:bg-electric-600 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:-translate-y-0.5 active:translate-y-0"
              aria-label="Sign in to get started and score your deck"
            >
              Sign in to get started
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50 dark:bg-navy-950">
      <AppNav />

      <main
        id="main"
        tabIndex={-1}
        className="pt-24 pb-16 px-4 sm:px-6"
        aria-labelledby={
          state === "result" && score ? "score-result-heading" : "score-page-heading"
        }
      >
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-electric/5 border border-electric/15 mb-4">
              <svg className="w-4 h-4 text-electric" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
              <span className="text-xs font-semibold text-electric">PIQ Score</span>
            </div>
            <h1
              id="score-page-heading"
              className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy dark:text-white mb-3 tracking-tight"
            >
              Score Your Pitch Deck
            </h1>
            <p className="text-navy-600 dark:text-navy-300 text-base sm:text-lg max-w-lg mx-auto">
              Upload your existing deck and get an instant fundability score
              with actionable feedback from our AI evaluator.
            </p>
          </div>

          {/* Upload card */}
          {state !== "result" && (
            <div className="bg-white dark:bg-navy-900 rounded-2xl shadow-sm border border-navy-100 dark:border-white/10 p-6 sm:p-8 animate-fade-in">
              <DeckUploader
                onFileSelected={handleFileSelected}
                disabled={isProcessing}
                isUploading={isProcessing}
              />

              {/* Progress bar */}
              {isProcessing && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-navy-600 dark:text-navy-300 font-medium">{statusLabel}</span>
                    <span className="text-navy-400">{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-navy-100 dark:bg-navy-900 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-electric transition-all duration-500 ease-out motion-reduce:transition-none"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Optional company name */}
              {!isProcessing && (
                <div className="mt-5">
                  <label
                    htmlFor="company-name"
                    className="block text-sm font-medium text-navy-700 dark:text-navy-200 mb-1.5"
                  >
                    Company name{" "}
                    <span className="text-navy-500 dark:text-navy-400 font-normal">(optional — auto-detected from deck)</span>
                  </label>
                  <input
                    id="company-name"
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Inc."
                    disabled={isProcessing}
                    className="w-full px-4 py-2.5 rounded-xl border border-navy-200 dark:border-white/10 bg-white dark:bg-navy-900 text-sm text-navy dark:text-white placeholder:text-navy-400 dark:placeholder:text-navy-500 outline-none transition-all disabled:opacity-50 focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-navy-950"
                  />
                </div>
              )}

              {/* Error */}
              {state === "error" && errorMsg && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200" role="alert">
                  <p className="text-sm text-red-700">{errorMsg}</p>
                </div>
              )}

              {/* Score button */}
              {!isProcessing && (
                <button
                  type="button"
                  onClick={handleScore}
                  disabled={!file || isProcessing}
                  className="mt-6 w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-electric text-white text-sm font-semibold shadow-lg shadow-electric/25 hover:bg-electric-600 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                  Score My Deck
                </button>
              )}

              {/* Free tier info */}
              {userPlan === "starter" && !isProcessing && (
                <p className="mt-3 text-center text-xs text-navy-500">
                  Free: overall score + grade.{" "}
                  <button type="button" onClick={() => setShowPlanModal(true)} className="text-electric hover:underline">
                    Upgrade to Pro
                  </button>{" "}
                  for full dimension breakdown & recommendations.
                </p>
              )}
            </div>
          )}

          {/* Result */}
          {state === "result" && score && (
            <div ref={resultRef} className="space-y-6 animate-fade-in-up scroll-mt-24">
              <div className="text-center">
                <p className="inline-flex items-center gap-2 text-electric text-sm font-medium mb-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Analysis complete
                </p>
                <h2 id="score-result-heading" className="text-xl font-bold text-navy dark:text-white">
                  {detectedName || companyName || "Your Deck"}
                </h2>
                <p className="text-navy-500 dark:text-navy-400 text-sm mt-1">
                  {slideCount} slide{slideCount !== 1 ? "s" : ""} analyzed
                </p>
              </div>

              <PIQScoreCard score={score} detail={limits.piqScoreDetail} />

              {refining ? (
                <div className="flex flex-col items-center gap-3 pt-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-5 h-5 rounded-full border-2 border-electric border-t-transparent animate-spin motion-reduce:animate-none"
                      aria-hidden="true"
                    />
                    <span className="text-sm font-medium text-navy-600 dark:text-navy-300">
                      AI is building your enhanced deck&hellip;
                    </span>
                  </div>
                  <p className="text-xs text-navy-400 dark:text-navy-500">
                    Using PIQ feedback to improve weak dimensions. This may take a minute.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 pt-4">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full">
                    {shareId ? (
                      <button
                        type="button"
                        onClick={handleRefine}
                        className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-electric text-white text-sm font-semibold shadow-lg shadow-electric/25 hover:bg-electric-600 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-navy-950"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                        Create AI-Enhanced Deck
                      </button>
                    ) : (
                      <Link
                        href="/create"
                        className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-electric text-white text-sm font-semibold shadow-lg shadow-electric/25 hover:bg-electric-600 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-navy-950"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                        </svg>
                        Create AI-Enhanced Deck
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setState("idle");
                        setScore(null);
                        setFile(null);
                        setShareId(null);
                        setRefineError("");
                        setProgress(0);
                      }}
                      className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 border-navy-200 dark:border-white/15 text-navy dark:text-white text-sm font-semibold hover:border-navy-300 dark:hover:border-white/25 shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-navy-950"
                    >
                      Score Another Deck
                    </button>
                  </div>

                  {refineError === "upgrade" && (
                    <div className="w-full max-w-md p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-700/30 text-center">
                      <p className="text-sm text-amber-800 dark:text-amber-300 mb-2">
                        Deck refinement requires a Pro plan or credits.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowPlanModal(true)}
                        className="text-sm font-semibold text-electric hover:underline"
                      >
                        View Plans
                      </button>
                    </div>
                  )}

                  {refineError && refineError !== "upgrade" && (
                    <div className="w-full max-w-md p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-700/30" role="alert">
                      <p className="text-sm text-red-700 dark:text-red-300">{refineError}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Upgrade CTA for free users */}
              {userPlan === "starter" && (
                <div className="max-w-xl mx-auto rounded-2xl border border-electric/15 bg-gradient-to-r from-electric/5 via-white to-violet-50 dark:from-electric/10 dark:via-navy-900 dark:to-violet-950/30 p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-navy dark:text-white text-sm mb-1">Unlock full insights</h3>
                      <p className="text-navy-500 dark:text-navy-400 text-xs sm:text-sm">
                        See dimension-by-dimension breakdown, specific feedback, and actionable
                        recommendations to improve your score.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPlanModal(true)}
                      className="shrink-0 inline-flex items-center gap-1.5 min-h-[44px] px-5 py-2 rounded-xl bg-electric text-white text-sm font-semibold shadow-lg shadow-electric/25 hover:bg-electric-600 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      aria-label="View plans and upgrade to Pro"
                    >
                      View Plans
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      <PlanCompareModal
        open={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        currentPlan={userPlan}
        highlightPlan="pro"
      />
    </div>
  );
}
