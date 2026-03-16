"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import SlideRenderer from "@/components/SlideRenderer";
import ExportMenu from "@/components/ExportMenu";
import DeckVariants from "@/components/DeckVariants";
import { DeckData } from "@/lib/types";

export default function DeckViewerClient() {
  const params = useParams();
  const shareId = params?.shareId as string;
  const [deck, setDeck] = useState<DeckData | null>(null);
  const [ownerPlan, setOwnerPlan] = useState("starter");
  const [isOwner, setIsOwner] = useState(false);
  const [variants, setVariants] = useState<{ shareId: string; title: string; investorType: string; piqScore: number | null }[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

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
        if (data.ownerPlan) setOwnerPlan(data.ownerPlan);
        if (data.isOwner) setIsOwner(true);
        if (data.variants) setVariants(data.variants);
      } catch {
        setError("This deck doesn't exist or has been removed.");
      } finally {
        setLoading(false);
      }
    }
    fetchDeck();
  }, [shareId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-50" aria-busy="true" aria-label="Loading deck">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-electric focus:text-white focus:outline-none focus:ring-2 focus:ring-electric focus:ring-offset-2 focus:ring-offset-white"
        >
          Skip to main content
        </a>
        <AppNav
          actions={<div className="h-9 w-28 rounded-lg bg-navy-100 animate-pulse" />}
        />
        <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <div className="h-8 w-48 mx-auto rounded-lg bg-navy-100 animate-pulse mb-3" />
              <div className="h-4 w-16 mx-auto rounded bg-navy-50 animate-pulse" />
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-video rounded-2xl bg-navy-50 border border-navy-50 animate-pulse"
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
              <div className="h-10 w-24 rounded-xl bg-navy-100 animate-pulse" />
              <div className="h-10 w-24 rounded-xl bg-navy-100 animate-pulse" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-navy-50 px-6">
        <div className="w-16 h-16 rounded-2xl bg-navy-100 flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-navy-400"
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
        <h1 className="text-2xl font-bold text-navy mb-2 tracking-tight">
          Deck not found
        </h1>
        <p className="text-navy-500 mb-8 text-center max-w-sm">{error}</p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/create"
            aria-label="Create your own pitch deck"
            className="min-h-[44px] inline-flex items-center justify-center px-6 py-3 rounded-xl bg-electric text-white font-medium shadow-sm hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          >
            Create a deck
          </Link>
          <Link
            href="/"
            aria-label="Go to PitchIQ home"
            className="min-h-[44px] inline-flex items-center justify-center px-6 py-3 rounded-xl border border-navy-200 text-navy font-medium shadow-sm hover:border-navy-300 hover:bg-navy-50 hover:shadow-glow hover:shadow-electric/10 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          >
            Go to PitchIQ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <AppNav
        actions={
          <div className="flex items-center gap-2">
            {deck && (
              <ExportMenu deck={deck} userPlan={ownerPlan} className="[&_button]:min-h-[36px] [&_button]:py-1.5 [&_button]:px-4 [&_button]:text-xs [&_button]:rounded-lg" />
            )}
            <Link
              href="/create"
              aria-label="Create your own pitch deck"
              className="min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-navy text-white text-sm font-medium shadow-sm hover:bg-navy-800 hover:shadow-glow hover:shadow-electric/10 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              Create Your Own
            </Link>
          </div>
        }
      />

      <div className="pt-24 pb-16 px-4 sm:px-6 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-navy mb-1 tracking-tight">
              {deck.title}
            </h1>
            <p className="text-navy-500 text-sm mb-4">{deck.slides.length} slides</p>
            {/* Share strip — same copy-success pattern as Create (trust through polish, design system) */}
            {shareUrl && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <span className="text-navy-500 text-sm">Share this deck</span>
                <div className="flex items-center w-full sm:w-auto max-w-full sm:max-w-md rounded-xl border border-navy-200 bg-white px-3 py-2 gap-2">
                  <span className="flex-1 min-w-0 truncate text-sm text-navy" aria-hidden="true">
                    {shareUrl.replace(/^https?:\/\//, "")}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="min-h-[44px] min-w-[44px] shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-electric text-white text-sm font-medium shadow-sm hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
                    aria-label={copied ? "Link copied to clipboard" : "Copy share link"}
                  >
                    {copied ? (
                      <>
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
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
            showBranding={!deck.isPremium}
            themeId={deck.themeId}
          />

          {/* Actions below deck */}
          <div className="flex flex-col items-center gap-4 mt-8">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {deck && (
                <ExportMenu deck={deck} userPlan={ownerPlan} />
              )}
              {isOwner && (ownerPlan === "growth" || ownerPlan === "enterprise") && (
                <Link
                  href={`/practice/${shareId}`}
                  className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl border border-electric/20 bg-electric/5 text-electric text-sm font-semibold hover:bg-electric/10 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                  Practice Pitch
                </Link>
              )}
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl border border-navy-200 text-navy text-sm font-medium hover:border-electric/30 hover:text-electric shadow-sm hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
              <Link
                href="/create"
                className="inline-flex items-center gap-2 min-h-[44px] px-5 py-2.5 rounded-xl bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-light hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
              >
                Create New Deck
              </Link>
            </div>

            {/* Upgrade CTA for non-premium decks */}
            {!deck.isPremium && (
              <div className="w-full max-w-2xl rounded-2xl border border-electric/15 bg-gradient-to-r from-electric/5 via-white to-purple-50 p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <svg className="w-5 h-5 text-electric shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      <h3 className="font-bold text-navy text-sm">Upgrade to Pro</h3>
                    </div>
                    <p className="text-navy-500 text-xs sm:text-sm">
                      Remove branding, unlock all themes, PPTX export, detailed analytics & engagement tracking.
                    </p>
                  </div>
                  <Link
                    href="/#pricing"
                    className="shrink-0 inline-flex items-center gap-1.5 min-h-[40px] px-5 py-2 rounded-xl bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-light hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
                  >
                    View Plans
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
