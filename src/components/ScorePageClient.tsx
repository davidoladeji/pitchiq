"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import DeckUploader from "@/components/DeckUploader";
import PIQScoreCard from "@/components/PIQScoreCard";
import PlanCompareModal from "@/components/PlanCompareModal";
import { getPlanLimits } from "@/lib/plan-limits";
import { PIQScore } from "@/lib/types";

type PageState = "idle" | "uploading" | "result" | "error";

export default function ScorePageClient({
  userPlan = "starter",
}: {
  userPlan?: string;
}) {
  const { status } = useSession();
  const limits = getPlanLimits(userPlan);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [state, setState] = useState<PageState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [score, setScore] = useState<PIQScore | null>(null);
  const [slideCount, setSlideCount] = useState(0);
  const [detectedName, setDetectedName] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileSelected = useCallback((f: File) => {
    setFile(f);
    setScore(null);
    setState("idle");
    setErrorMsg("");
  }, []);

  const handleScore = async () => {
    if (!file) return;
    setState("uploading");
    setErrorMsg("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      if (companyName.trim()) {
        formData.append("companyName", companyName.trim());
      }

      const res = await fetch("/api/score", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Something went wrong.");
        setState("error");
        return;
      }

      setScore(data.piqScore);
      setSlideCount(data.slideCount);
      setDetectedName(data.companyName);
      setState("result");
    } catch {
      setErrorMsg("Network error. Please try again.");
      setState("error");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-navy-50">
        <AppNav />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-electric border-t-transparent animate-spin" />
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen bg-navy-50">
        <AppNav />
        <main className="pt-24 pb-16 px-4 sm:px-6">
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
            <div className="w-16 h-16 rounded-2xl bg-electric/10 flex items-center justify-center mb-6">
              <svg className="w-8 h-8 text-electric" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-navy mb-2">Sign in to score your deck</h2>
            <p className="text-navy-500 mb-6 max-w-md">Create a free account to get an instant fundability score with actionable feedback.</p>
            <a href="/auth/signin?callbackUrl=/score" className="inline-flex items-center px-6 py-3 rounded-full bg-electric text-white font-semibold hover:opacity-90 transition-opacity">
              Sign in to get started
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-electric focus:text-white focus:outline-none focus:ring-2 focus:ring-electric focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <AppNav />

      <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-electric/5 border border-electric/15 mb-4">
              <svg className="w-4 h-4 text-electric" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
              <span className="text-xs font-semibold text-electric">PIQ Score</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy mb-3 tracking-tight">
              Score Your Pitch Deck
            </h1>
            <p className="text-navy-600 text-base sm:text-lg max-w-lg mx-auto">
              Upload your existing deck and get an instant fundability score
              with actionable feedback from our AI evaluator.
            </p>
          </div>

          {/* Upload card */}
          {state !== "result" && (
            <div className="bg-white rounded-2xl shadow-sm border border-navy-100 p-6 sm:p-8 animate-fade-in">
              <DeckUploader
                onFileSelected={handleFileSelected}
                disabled={state === "uploading"}
                isUploading={state === "uploading"}
              />

              {/* Optional company name */}
              <div className="mt-5">
                <label
                  htmlFor="company-name"
                  className="block text-sm font-medium text-navy-700 mb-1.5"
                >
                  Company name{" "}
                  <span className="text-navy-500 font-normal">(optional — auto-detected from deck)</span>
                </label>
                <input
                  id="company-name"
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Acme Inc."
                  disabled={state === "uploading"}
                  className="w-full px-4 py-2.5 rounded-xl border border-navy-200 text-sm text-navy placeholder:text-navy-500 focus:border-electric focus:ring-2 focus:ring-electric/20 outline-none transition-all disabled:opacity-50"
                />
              </div>

              {/* Error */}
              {state === "error" && errorMsg && (
                <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-200" role="alert">
                  <p className="text-sm text-red-700">{errorMsg}</p>
                </div>
              )}

              {/* Score button */}
              <button
                type="button"
                onClick={handleScore}
                disabled={!file || state === "uploading"}
                className="mt-6 w-full min-h-[48px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-light hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
              >
                {state === "uploading" ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                    Score My Deck
                  </>
                )}
              </button>

              {/* Free tier info */}
              {userPlan === "starter" && (
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
            <div className="space-y-6 animate-fade-in-up">
              <div className="text-center">
                <p className="inline-flex items-center gap-2 text-electric text-sm font-medium mb-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  Analysis complete
                </p>
                <h2 className="text-xl font-bold text-navy">
                  {detectedName || companyName || "Your Deck"}
                </h2>
                <p className="text-navy-500 text-sm mt-1">
                  {slideCount} slide{slideCount !== 1 ? "s" : ""} analyzed
                </p>
              </div>

              <PIQScoreCard score={score} detail={limits.piqScoreDetail} />

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
                <Link
                  href="/create"
                  className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-light hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                  </svg>
                  Create AI-Enhanced Deck
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setState("idle");
                    setScore(null);
                    setFile(null);
                  }}
                  className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center px-6 py-3 rounded-xl border-2 border-navy-200 text-navy text-sm font-semibold hover:border-navy-300 shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Score Another Deck
                </button>
              </div>

              {/* Upgrade CTA for free users */}
              {userPlan === "starter" && (
                <div className="max-w-xl mx-auto rounded-2xl border border-electric/15 bg-gradient-to-r from-electric/5 via-white to-purple-50 p-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-navy text-sm mb-1">Unlock full insights</h3>
                      <p className="text-navy-500 text-xs sm:text-sm">
                        See dimension-by-dimension breakdown, specific feedback, and actionable
                        recommendations to improve your score.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPlanModal(true)}
                      className="shrink-0 inline-flex items-center gap-1.5 min-h-[44px] px-5 py-2 rounded-xl bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-light hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
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
