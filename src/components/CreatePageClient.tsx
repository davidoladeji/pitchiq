"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import DeckForm from "@/components/DeckForm";
import SlideRenderer from "@/components/SlideRenderer";
import PIQScoreCard from "@/components/PIQScoreCard";
import ExportMenu from "@/components/ExportMenu";
import { DeckData } from "@/lib/types";
import { getPlanLimits } from "@/lib/plan-limits";

export default function CreatePageClient({
  userPlan = "starter",
  deckCount = 0,
}: {
  userPlan?: string;
  deckCount?: number;
}) {
  const limits = getPlanLimits(userPlan);
  const [deck, setDeck] = useState<DeckData | null>(null);
  const [copied, setCopied] = useState(false);
  const [pdfExporting, setPdfExporting] = useState(false);
  const [pdfExported, setPdfExported] = useState(false);
  const deckRef = useRef<HTMLDivElement>(null);
  const [showIdeaPrompt, setShowIdeaPrompt] = useState(false);

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

  const handleExportPdf = async () => {
    if (!deck) return;
    setPdfExporting(true);
    setPdfExported(false);
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const container = document.getElementById("pdf-slides-container");
      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1280, 720] });

      if (container && container.children.length > 0) {
        for (let i = 0; i < container.children.length; i++) {
          if (i > 0) pdf.addPage([1280, 720], "landscape");
          const el = container.children[i] as HTMLElement;
          try {
            const canvas = await html2canvas(el, {
              width: 1280, height: 720, scale: 2,
              useCORS: true, logging: false, backgroundColor: null,
            });
            pdf.addImage(canvas.toDataURL("image/jpeg", 0.92), "JPEG", 0, 0, 1280, 720);
          } catch {
            // text fallback
            const slide = deck.slides[i];
            const isDark = slide.type === "title" || slide.type === "cta" || slide.accent;
            pdf.setFillColor(isDark ? 26 : 255, isDark ? 26 : 255, isDark ? 46 : 255);
            pdf.rect(0, 0, 1280, 720, "F");
            pdf.setTextColor(isDark ? 255 : 26, isDark ? 255 : 26, isDark ? 255 : 46);
            pdf.setFontSize(40);
            pdf.setFont("helvetica", "bold");
            pdf.text(slide.title, 80, 120);
          }
        }
      }

      pdf.save(`${deck.companyName}-pitch-deck.pdf`);
      setPdfExported(true);
      setTimeout(() => setPdfExported(false), 2000);
    } finally {
      setPdfExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      {/* Skip link — WCAG 2.1 AA */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-electric focus:text-white focus:outline-none focus:ring-2 focus:ring-electric focus:ring-offset-2"
      >
        Skip to main content
      </a>
      <AppNav
        actions={
          deck ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={handleCopyLink}
                aria-label={copied ? "Link copied to clipboard" : "Copy share link"}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-3 sm:px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-navy hover:border-gray-300 shadow-sm hover:shadow-glow hover:shadow-electric/10 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
              >
                {copied ? (
                  <span className="flex items-center gap-1.5 text-electric">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Copied
                  </span>
                ) : (
                  "Copy Link"
                )}
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={pdfExporting}
                aria-busy={pdfExporting}
                aria-label={pdfExporting ? "Preparing PDF" : pdfExported ? "PDF downloaded" : "Export PDF"}
                className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-3 sm:px-4 py-2 rounded-lg bg-navy text-white text-sm font-medium shadow-sm hover:bg-navy-800 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 disabled:opacity-70 disabled:pointer-events-none disabled:hover:translate-y-0 disabled:hover:shadow-sm"
              >
                {pdfExporting ? (
                  "Preparing PDF…"
                ) : pdfExported ? (
                  <span className="inline-flex items-center gap-1.5 text-green-400">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Downloaded
                  </span>
                ) : (
                  "Export PDF"
                )}
              </button>
            </div>
          ) : undefined
        }
      />

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
                <Link
                  href="/#pricing"
                  className="shrink-0 inline-flex items-center gap-1.5 min-h-[40px] px-5 py-2 rounded-xl bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-light hover:-translate-y-0.5 active:translate-y-0 transition-all"
                >
                  Upgrade Now
                </Link>
              </div>
            </div>
          </div>
        )}

        {!deck && (
          <div className="max-w-2xl mx-auto animate-fade-in">
            <div className="text-center mb-12">
              <h1 className="text-3xl md:text-4xl font-bold text-navy mb-3 tracking-tight">
                Create Your Pitch Deck
              </h1>
              <p className="text-gray-600 text-base sm:text-lg max-w-lg mx-auto">
                Describe your startup and we&apos;ll generate a polished,
                investor-ready pitch deck in seconds.
              </p>
              <p className="mt-3 text-gray-600 text-sm inline-flex items-center justify-center gap-1.5">
                <svg className="w-4 h-4 shrink-0 text-electric/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Takes about 60 seconds
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
                    className="ml-3 text-gray-500 text-sm font-medium hover:text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 rounded"
                  >
                    Dismiss
                  </button>
                </div>
              )}
            </div>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 md:p-10">
              <DeckForm onGenerated={handleGenerated} userPlan={userPlan} />
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
              <p className="text-gray-500 text-sm">
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
                className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-gray-200 text-navy font-semibold shadow-sm hover:border-gray-300 hover:shadow-glow hover:shadow-electric/10 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
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
                className="min-h-[44px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-gray-200 text-navy font-medium hover:border-electric/40 hover:text-electric shadow-sm hover:shadow-glow hover:shadow-electric/5 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
              >
                <span>View shareable deck</span>
                <svg className="w-4 h-4 shrink-0 opacity-70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </Link>
              <button
                type="button"
                onClick={() => setDeck(null)}
                className="min-h-[44px] inline-flex items-center justify-center px-6 py-3 rounded-xl text-gray-500 font-medium shadow-sm hover:text-navy hover:shadow-glow hover:shadow-electric/5 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
              >
                Create Another
              </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 flex items-center gap-3 max-w-xl mx-auto animate-fade-in-up stagger-5">
              <div className="flex-1 text-xs sm:text-sm text-gray-500 truncate font-mono">
                {shareUrl}
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                aria-label={copied ? "Link copied to clipboard" : "Copy share URL"}
                className="shrink-0 min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-gray-50 text-xs sm:text-sm font-medium text-navy hover:bg-gray-100 border border-gray-200 shadow-sm hover:shadow-glow hover:shadow-electric/5 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
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
                    <p className="text-gray-500 text-xs sm:text-sm">
                      Upgrade to Pro for unlimited decks, full PIQ coaching, all themes, PPTX export, brand customization & remove &quot;Made with PitchIQ&quot; branding.
                    </p>
                  </div>
                  <Link
                    href="/#pricing"
                    className="shrink-0 inline-flex items-center gap-1.5 min-h-[40px] px-5 py-2 rounded-xl bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-light hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
                  >
                    View Plans
                  </Link>
                </div>
              </div>
            )}

            {/* Go to Dashboard */}
            <div className="text-center animate-fade-in-up stagger-5">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 text-sm text-gray-500 font-medium hover:text-electric transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 rounded"
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
    </div>
  );
}
