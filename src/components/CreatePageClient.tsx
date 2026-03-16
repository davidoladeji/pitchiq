"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import DeckForm from "@/components/DeckForm";
import GitHubRepoForm from "@/components/GitHubRepoForm";
import SlideRenderer from "@/components/SlideRenderer";
import PIQScoreCard from "@/components/PIQScoreCard";
import ExportMenu from "@/components/ExportMenu";
import PlanCompareModal from "@/components/PlanCompareModal";
import TemplateBrowser from "@/components/TemplateBrowser";
import { DeckData } from "@/lib/types";
import { getPlanLimits } from "@/lib/plan-limits";
import { type DeckTemplate, applyTemplate } from "@/lib/templates";

type CreateMode = "form" | "github";

export default function CreatePageClient({
  userPlan = "starter",
  deckCount = 0,
}: {
  userPlan?: string;
  deckCount?: number;
}) {
  const { status } = useSession();
  const limits = getPlanLimits(userPlan);
  const [deck, setDeck] = useState<DeckData | null>(null);
  const [copied, setCopied] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);
  const [showIdeaPrompt, setShowIdeaPrompt] = useState(false);
  const [mode, setMode] = useState<CreateMode>("form");
  const [hasGithub, setHasGithub] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DeckTemplate | null>(null);

  useEffect(() => {
    fetch("/api/auth/has-github")
      .then((res) => res.json())
      .then((data) => setHasGithub(data.hasGithub))
      .catch(() => setHasGithub(false));
  }, []);

  const handleGenerated = useCallback((newDeck: DeckData) => {
    setDeck(newDeck);
    setTimeout(() => {
      deckRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const shareUrl = deck
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/deck/${deck.shareId}`
    : "";

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /** Live region for copy success — screen readers announce when link is copied (WCAG 2.1 AA). */
  const copySuccessAnnouncement = copied ? "Share link copied to clipboard." : "";

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-navy-50" aria-busy="true">
        <AppNav />
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-2 border-electric border-t-transparent animate-spin" aria-hidden="true" />
        </div>
        <span role="status" aria-live="polite" aria-atomic="true" className="sr-only">
          Loading
        </span>
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
            <h2 className="text-2xl font-bold text-navy mb-2">Sign in to create your deck</h2>
            <p className="text-navy-500 mb-6 max-w-md">Create a free account to generate investor-ready pitch decks with AI.</p>
            <a href="/auth/signin?callbackUrl=/create" className="inline-flex items-center px-6 py-3 rounded-full bg-electric text-white font-semibold hover:opacity-90 transition-opacity">
              Sign in to get started
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50">
      {/* Skip link — WCAG 2.1 AA */}
      <a
        href="#main"
        className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-4 focus-visible:left-4 focus-visible:z-[100] focus-visible:px-4 focus-visible:py-2 focus-visible:rounded-lg focus-visible:bg-electric focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        Skip to main content
      </a>
      <AppNav />

      <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6">
        {!deck && deckCount >= limits.maxDecks && (
          <div className="max-w-2xl mx-auto mb-6 animate-fade-in">
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-amber-900 text-sm mb-1">Free deck limit reached</h3>
                  <p className="text-amber-700 text-xs sm:text-sm">
                    You&apos;ve used your 1 free deck. Upgrade to Pro for unlimited decks, all themes, full PIQ coaching & more.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPlanModal(true)}
                  className="shrink-0 inline-flex items-center gap-1.5 min-h-[40px] px-5 py-2 rounded-xl bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-light hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          </div>
        )}

        {!deck && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-navy mb-3 tracking-tight">
                Create Your Pitch Deck
              </h1>
              <p className="text-navy-600 text-base sm:text-lg max-w-lg mx-auto">
                Describe your startup and we&apos;ll generate a polished,
                investor-ready pitch deck in seconds.
              </p>
              <p className="mt-3 text-navy-600 text-sm inline-flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4 shrink-0 text-electric/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Takes about 60 seconds
              </p>
              <p className="mt-2 text-navy-500 text-sm">
                Already have a deck?{" "}
                <Link href="/score" className="text-electric font-medium hover:underline">
                  Upload &amp; score it →
                </Link>
              </p>
              {!showIdeaPrompt && (
                <p className="mt-4">
                  <button
                    type="button"
                    onClick={() => setShowIdeaPrompt(true)}
                    className="text-electric text-sm font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 rounded"
                  >
                    Don&apos;t have an idea yet? Generate business ideas from a short quiz →
                  </button>
                </p>
              )}
              {showIdeaPrompt && (
                <div className="mt-4 p-4 rounded-xl bg-electric/5 border border-electric/20">
                  <p className="text-navy text-sm mb-3">Answer a few questions and we&apos;ll suggest viable business ideas, then you can turn one into a deck.</p>
                  <Link
                    href="/ideas"
                    className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-light hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
                  >
                    Start idea generator
                  </Link>
                  <button
                    type="button"
                    onClick={() => setShowIdeaPrompt(false)}
                    className="ml-3 text-navy-500 text-sm font-medium hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>

            {/* Mode tabs */}
            <div className="flex items-center gap-2 mb-6" role="tablist" aria-label="Deck creation method">
              <button
                type="button"
                role="tab"
                aria-selected={mode === "form"}
                onClick={() => setMode("form")}
                className={`min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                  mode === "form"
                    ? "bg-navy text-white shadow-sm"
                    : "bg-navy-100 text-navy-500 hover:bg-navy-200 hover:text-navy"
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                From Form
              </button>
              {hasGithub && (
                <button
                  type="button"
                  role="tab"
                  aria-selected={mode === "github"}
                  onClick={() => setMode("github")}
                  className={`min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
                    mode === "github"
                      ? "bg-navy text-white shadow-sm"
                      : "bg-navy-100 text-navy-500 hover:bg-navy-200 hover:text-navy"
                  }`}
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  From GitHub
                </button>
              )}
            </div>

            {/* Template browser (above form when no template selected) */}
            {mode === "form" && !selectedTemplate && (
              <div className="bg-white rounded-2xl shadow-sm border border-navy-100 p-6 sm:p-8 mb-6">
                <TemplateBrowser
                  onSelect={(template) => setSelectedTemplate(template)}
                />
              </div>
            )}

            {/* Selected template indicator */}
            {selectedTemplate && (
              <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-electric/5 border border-electric/15">
                <svg className={`w-5 h-5 ${selectedTemplate.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d={selectedTemplate.icon} />
                </svg>
                <span className="text-sm font-medium text-navy">
                  Using <strong>{selectedTemplate.name}</strong> template
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedTemplate(null)}
                  className="ml-auto text-xs text-navy-400 hover:text-navy font-medium"
                >
                  Clear
                </button>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-navy-100 p-6 sm:p-8 md:p-10">
              {mode === "form" && (
                <DeckForm
                  onGenerated={handleGenerated}
                  userPlan={userPlan}
                  templateDefaults={
                    selectedTemplate
                      ? applyTemplate(selectedTemplate, {})
                      : undefined
                  }
                />
              )}
              {mode === "github" && (
                <GitHubRepoForm onGenerated={handleGenerated} userPlan={userPlan} />
              )}
            </div>
          </div>
        )}

        {deck && (
          <div
            ref={deckRef}
            className="max-w-5xl mx-auto space-y-8"
          >
            <div className="text-center animate-fade-in-up stagger-1">
              <p className="inline-flex items-center justify-center gap-2 text-electric text-sm font-medium mb-3" role="status" aria-live="polite">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Your deck is ready
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-navy mb-2 tracking-tight">
                {deck.title}
              </h1>
              <p className="text-navy-500 text-sm">
                {deck.slides.length} slides generated
              </p>
            </div>

            {deck.piqScore && (
              <div className="animate-fade-in-up stagger-2">
                <PIQScoreCard score={deck.piqScore} detail={limits.piqScoreDetail} />
              </div>
            )}

            <div className="animate-fade-in-up stagger-3">
              <SlideRenderer
                slides={deck.slides}
                companyName={deck.companyName}
                themeId={deck.themeId}
              />
            </div>

            {/* Live region: announces copy success to screen readers (WCAG 2.1 AA) */}
            {copySuccessAnnouncement && (
              <p className="sr-only" role="status" aria-live="polite">
                {copySuccessAnnouncement}
              </p>
            )}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 pt-4 animate-fade-in-up stagger-4">
              <ExportMenu deck={deck} userPlan={userPlan} />
              <button
                type="button"
                onClick={handleCopyLink}
                aria-label={copied ? "Link copied to clipboard" : "Copy shareable link"}
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-navy-200 text-navy font-semibold shadow-sm hover:border-navy-300 hover:shadow-glow hover:shadow-electric/10 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                {copied ? (
                  <>
                    <svg className="w-4 h-4 shrink-0 text-electric" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Link Copied!
                  </>
                ) : (
                  "Copy Shareable Link"
                )}
              </button>
              <Link
                href={`/deck/${deck.shareId}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="View shareable deck in new tab — see what investors will see"
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-navy-200 text-navy font-medium hover:border-electric/40 hover:text-electric shadow-sm hover:shadow-glow hover:shadow-electric/5 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <span>View shareable deck</span>
                <svg className="w-4 h-4 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
              <button
                type="button"
                onClick={() => setDeck(null)}
                className="min-h-[44px] inline-flex items-center justify-center px-6 py-3 rounded-xl text-navy-500 font-medium shadow-sm hover:text-navy hover:shadow-glow hover:shadow-electric/5 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                Create Another
              </button>
            </div>

            <div className="bg-white rounded-xl border border-navy-200 p-3 sm:p-4 flex items-center gap-3 max-w-xl mx-auto animate-fade-in-up stagger-5">
              <div className="flex-1 text-xs sm:text-sm text-navy-500 truncate font-mono">
                {shareUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                aria-label={copied ? "Link copied to clipboard" : "Copy share URL"}
                className="shrink-0 min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-navy-50 text-xs sm:text-sm font-medium text-navy hover:bg-navy-100 border border-navy-200 shadow-sm hover:shadow-glow hover:shadow-electric/5 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>

            {/* Upgrade CTA */}
            {!deck.isPremium && (
              <div className="max-w-2xl mx-auto rounded-2xl border border-electric/15 bg-gradient-to-r from-electric/5 via-white to-purple-50 p-6 animate-fade-in-up stagger-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-electric shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                      <h3 className="font-bold text-navy text-sm">Want more from your deck?</h3>
                    </div>
                    <p className="text-navy-500 text-xs sm:text-sm">
                      Upgrade to Pro for unlimited decks, full PIQ coaching, all themes, PPTX export, brand customization & remove &quot;Made with PitchIQ&quot; branding.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPlanModal(true)}
                    className="shrink-0 inline-flex items-center gap-1.5 min-h-[40px] px-5 py-2 rounded-xl bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-light hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
                  >
                    View Plans
                  </button>
                </div>
              </div>
            )}

            {/* Go to Dashboard */}
            <div className="text-center animate-fade-in-up stagger-5">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-navy-500 font-medium hover:text-electric transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}
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
