"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import DeckForm from "@/components/DeckForm";
import SlideRenderer from "@/components/SlideRenderer";
import PIQScoreCard from "@/components/PIQScoreCard";
import ExportMenu from "@/components/ExportMenu";
import { DeckData } from "@/lib/types";

export default function CreatePageClient() {
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
      const { default: jsPDF } = await import("jspdf");

      const pdf = new jsPDF({ orientation: "landscape", unit: "px", format: [1280, 720] });

      for (let i = 0; i < deck.slides.length; i++) {
        const slide = deck.slides[i];
        if (i > 0) pdf.addPage([1280, 720], "landscape");

        if (slide.type === "title" || slide.type === "cta" || slide.accent) {
          pdf.setFillColor(26, 26, 46);
          pdf.rect(0, 0, 1280, 720, "F");
          pdf.setTextColor(255, 255, 255);
        } else {
          pdf.setFillColor(255, 255, 255);
          pdf.rect(0, 0, 1280, 720, "F");
          pdf.setTextColor(26, 26, 46);
        }

        pdf.setFontSize(40);
        pdf.setFont("helvetica", "bold");
        pdf.text(slide.title, 80, 120);

        if (slide.subtitle) {
          pdf.setFontSize(20);
          pdf.setFont("helvetica", "normal");
          if (slide.type === "title" || slide.type === "cta" || slide.accent) {
            pdf.setTextColor(180, 200, 255);
          } else {
            pdf.setTextColor(120, 120, 140);
          }
          pdf.text(slide.subtitle, 80, 160);
        }

        pdf.setFontSize(18);
        if (slide.type === "title" || slide.type === "cta" || slide.accent) {
          pdf.setTextColor(220, 230, 255);
        } else {
          pdf.setTextColor(60, 60, 80);
        }
        pdf.setFont("helvetica", "normal");

        let yPos = slide.subtitle ? 220 : 200;
        for (const item of slide.content) {
          const lines = pdf.splitTextToSize(`• ${item}`, 1100);
          pdf.text(lines, 80, yPos);
          yPos += lines.length * 28 + 12;
        }

        pdf.setFontSize(10);
        pdf.setTextColor(150, 150, 170);
        pdf.text("Made with PitchIQ", 80, 690);
        pdf.text(`${i + 1} / ${deck.slides.length}`, 1180, 690);
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
              <DeckForm onGenerated={handleGenerated} />
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
                <PIQScoreCard score={deck.piqScore} />
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
              <ExportMenu deck={deck} />
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
                className="min-h-[44px] inline-flex items-center justify-center px-6 py-3 rounded-xl text-gray-500 font-medium hover:text-navy hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
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
          </div>
        )}
      </main>
    </div>
  );
}
