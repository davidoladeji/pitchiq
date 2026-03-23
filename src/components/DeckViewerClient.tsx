"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import SlideRenderer from "@/components/SlideRenderer";
import ExportMenu from "@/components/ExportMenu";
import DeckVariants from "@/components/DeckVariants";
import DeckInfoPanel from "@/components/DeckInfoPanel";
import { DeckData } from "@/lib/types";
import { DeckTracker } from "@/lib/analytics/deck-tracker";
import { FileText } from "lucide-react";

export default function DeckViewerClient() {
  const params = useParams();
  const shareId = params?.shareId as string;
  const [deck, setDeck] = useState<DeckData | null>(null);
  const [ownerPlan, setOwnerPlan] = useState("starter");
  const [isOwner, setIsOwner] = useState(false);
  const [variants, setVariants] = useState<{ shareId: string; title: string; investorType: string; piqScore: number | null }[]>([]);
  const [showBranding, setShowBranding] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [viewId, setViewId] = useState<string | null>(null);
  const [showInfoPanel, setShowInfoPanel] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [fullDeckData, setFullDeckData] = useState<any>(null);
  const trackerRef = useRef<DeckTracker | null>(null);

  const shareUrl =
    typeof window !== "undefined" && shareId
      ? `${window.location.origin}/deck/${shareId}`
      : "";

  const handleCopyLink = useCallback(() => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [shareUrl]);

  useEffect(() => {
    async function fetchDeck() {
      try {
        const res = await fetch(`/api/decks/${shareId}`);
        if (!res.ok) throw new Error("Deck not found");
        const data = await res.json();
        setDeck(data);
        setFullDeckData(data);
        if (data.ownerPlan) setOwnerPlan(data.ownerPlan);
        if (data.showBranding !== undefined) setShowBranding(data.showBranding);
        if (data.isOwner) setIsOwner(true);
        if (data.variants) setVariants(data.variants);
        if (data.viewId) setViewId(data.viewId);
      } catch {
        setError("This deck doesn't exist or has been removed.");
      } finally {
        setLoading(false);
      }
    }
    fetchDeck();
  }, [shareId]);

  // Initialize tracker when viewId is available
  useEffect(() => {
    if (!viewId || !shareId) return;
    const tracker = new DeckTracker(shareId, viewId);
    trackerRef.current = tracker;
    // Track initial slide view (slide 0)
    tracker.trackSlideView(0);
    return () => {
      tracker.flush();
      tracker.cleanup();
    };
  }, [viewId, shareId]);

  const handleSlideChange = useCallback((slideIndex: number) => {
    trackerRef.current?.trackSlideView(slideIndex);
    // Mark completed if viewing the last slide
    if (deck && slideIndex === deck.slides.length - 1) {
      trackerRef.current?.markCompleted();
    }
  }, [deck]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-950" aria-busy="true" aria-label="Loading deck">
        <p className="sr-only" role="status" aria-live="polite">
          Loading deck
        </p>
        <AppNav />
        <main
          id="main"
          tabIndex={-1}
          className="pt-24 pb-16 px-4 sm:px-6 outline-none"
          aria-labelledby="deck-viewer-loading-heading"
        >
          <h1 id="deck-viewer-loading-heading" className="sr-only">
            Loading deck
          </h1>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <div className="h-8 w-48 mx-auto rounded-lg bg-white/5 animate-pulse motion-reduce:animate-none mb-3" />
              <div className="h-4 w-16 mx-auto rounded bg-white/5 animate-pulse motion-reduce:animate-none" />
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-video rounded-2xl bg-navy-50 border border-navy-50 animate-pulse motion-reduce:animate-none"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="h-full flex flex-col justify-center p-8 md:p-12">
                    <div className="h-10 w-3/4 max-w-md rounded-lg bg-navy-100 mb-4" />
                    <div className="h-5 w-1/2 max-w-xs rounded bg-navy-100/80 mb-6" />
                    <div className="space-y-2">
                      <div className="h-4 w-full rounded bg-navy-50" />
                      <div className="h-4 w-4/5 rounded bg-navy-50" />
                      <div className="h-4 w-2/3 rounded bg-navy-50" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-8 gap-3">
              <div className="h-10 w-24 rounded-xl bg-white/5 animate-pulse motion-reduce:animate-none" />
              <div className="h-10 w-24 rounded-xl bg-white/5 animate-pulse motion-reduce:animate-none" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <main
        id="main"
        tabIndex={-1}
        className="min-h-screen flex flex-col items-center justify-center bg-navy-950 px-6 outline-none"
        aria-labelledby="deck-not-found-heading"
      >
        <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-white/40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 id="deck-not-found-heading" className="text-2xl font-bold text-white mb-2 tracking-tight">
          Deck not found
        </h1>
        <p className="text-white/50 mb-8 text-center max-w-sm">{error}</p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/create"
            aria-label="Create your own pitch deck"
            className="min-h-[44px] inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-violet to-electric text-white font-medium shadow-lg shadow-violet/25 hover:-translate-y-0.5 active:translate-y-0 transition-all"
          >
            Create a deck
          </Link>
          <Link
            href="/"
            aria-label="Go to PitchIQ home"
            className="min-h-[44px] inline-flex items-center justify-center px-6 py-3 rounded-2xl border border-white/10 text-white/70 font-medium hover:bg-white/5 hover:text-white transition-all"
          >
            Go to PitchIQ
          </Link>
        </div>
      </main>
    );
  }

  // Button base styles for the action bar
  const btnBase = "inline-flex items-center justify-center gap-2 rounded-2xl text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950";
  const btnOutline = `${btnBase} min-h-[42px] px-6 py-2.5 border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/20 backdrop-blur-sm`;
  const btnPrimary = `${btnBase} min-h-[42px] px-7 py-2.5 bg-gradient-to-r from-violet to-electric text-white font-semibold shadow-lg shadow-violet/25 hover:shadow-xl hover:shadow-violet/30 hover:-translate-y-0.5 active:translate-y-0`;
  const btnAccent = `${btnBase} min-h-[42px] px-6 py-2.5 bg-violet/15 border border-violet/25 text-violet-light hover:bg-violet/25 hover:text-white`;

  return (
    <div className="min-h-screen bg-navy-950">
      <AppNav />

      <main
        id="main"
        tabIndex={-1}
        className="pt-24 pb-20 px-4 sm:px-6 animate-fade-in motion-reduce:animate-none outline-none"
        aria-labelledby="deck-viewer-title"
      >
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 id="deck-viewer-title" className="text-xl sm:text-2xl font-bold text-white mb-1.5 tracking-tight">
              {deck.title}
            </h1>
            <p className="text-white/40 text-xs mb-5">{deck.slides.length} slides</p>

            {/* Share strip */}
            {shareUrl && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <span className="text-white/40 text-xs">Share this deck</span>
                <div className="flex items-center w-full sm:w-auto max-w-full sm:max-w-md rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm px-4 py-2 gap-2">
                  <span className="flex-1 min-w-0 truncate text-xs text-white/60" aria-hidden="true">
                    {shareUrl.replace(/^https?:\/\//, "")}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-xl bg-violet/20 text-violet-light text-xs font-medium hover:bg-violet/30 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                    aria-label={copied ? "Link copied to clipboard" : "Copy share link"}
                  >
                    {copied ? (
                      <>
                        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Copied!</span>
                      </>
                    ) : (
                      "Copy"
                    )}
                  </button>
                </div>
                {copied && (
                  <p className="sr-only" role="status" aria-live="polite">
                    Share link copied to clipboard.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Investor variants (Growth+ owners only) */}
          {isOwner && (
            <div className="mb-6">
              <DeckVariants
                shareId={shareId}
                variants={variants}
                ownerPlan={ownerPlan}
              />
            </div>
          )}

          <SlideRenderer
            slides={deck.slides}
            companyName={deck.companyName}
            showBranding={showBranding}
            themeId={deck.themeId}
            onSlideChange={handleSlideChange}
          />

          {/* Actions bar */}
          <div className="flex flex-col items-center gap-5 mt-10">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {isOwner && fullDeckData && (
                <button
                  onClick={() => setShowInfoPanel(true)}
                  className={btnOutline}
                  aria-label="View deck info and inputs"
                >
                  <FileText size={14} />
                  Deck Info
                </button>
              )}
              {deck && (
                <ExportMenu deck={deck} userPlan={ownerPlan} />
              )}
              {isOwner && (ownerPlan === "growth" || ownerPlan === "enterprise") && (
                <Link
                  href={`/practice/${shareId}`}
                  className={btnAccent}
                  aria-label="Practice pitch with this deck"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                  Practice Pitch
                </Link>
              )}
              <Link href="/dashboard" className={btnOutline} aria-label="Go to dashboard">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              <Link href="/create" className={btnPrimary} aria-label="Create a new pitch deck">
                Create New Deck
              </Link>
            </div>

            {/* Upgrade CTA for starter-tier decks only */}
            {ownerPlan === "starter" && (
              <div className="w-full max-w-2xl rounded-2xl border border-violet/15 bg-gradient-to-r from-violet/5 via-navy-900 to-electric/5 p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-4 h-4 text-violet-light shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      <h3 className="font-bold text-white text-xs">Upgrade to Pro</h3>
                    </div>
                    <p className="text-white/50 text-xs">
                      Remove branding, unlock all themes, PPTX export, detailed analytics & engagement tracking.
                    </p>
                  </div>
                  <Link
                    href="/#pricing"
                    className={`${btnPrimary} shrink-0`}
                    aria-label="View plans and upgrade to Pro"
                  >
                    View Plans
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Deck Info Panel (slide-over) */}
      {showInfoPanel && fullDeckData && (
        <DeckInfoPanel
          deck={fullDeckData}
          isOwner={isOwner}
          onClose={() => setShowInfoPanel(false)}
          mode="overlay"
        />
      )}
    </div>
  );
}
