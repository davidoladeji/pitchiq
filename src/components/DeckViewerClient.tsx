"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AppNav from "@/components/AppNav";
import SlideRenderer from "@/components/SlideRenderer";
import { DeckData } from "@/lib/types";

export default function DeckViewerClient() {
  const params = useParams();
  const shareId = params?.shareId as string;
  const [deck, setDeck] = useState<DeckData | null>(null);
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
      <div className="min-h-screen bg-[#fafafa]" aria-busy="true" aria-label="Loading deck">
        <AppNav
          actions={<div className="h-9 w-28 rounded-lg bg-gray-200 animate-pulse" />}
        />
        <div className="pt-24 pb-16 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <div className="h-8 w-48 mx-auto rounded-lg bg-gray-200 animate-pulse mb-3" />
              <div className="h-4 w-16 mx-auto rounded bg-gray-100 animate-pulse" />
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-video rounded-2xl bg-gray-100 border border-gray-100 animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className="h-full flex flex-col justify-center p-8 md:p-12">
                    <div className="h-10 w-3/4 max-w-md rounded-lg bg-gray-200/80 mb-4" />
                    <div className="h-5 w-1/2 max-w-xs rounded bg-gray-200/60 mb-6" />
                    <div className="space-y-2">
                      <div className="h-4 w-full rounded bg-gray-200/50" />
                      <div className="h-4 w-4/5 rounded bg-gray-200/50" />
                      <div className="h-4 w-2/3 rounded bg-gray-200/50" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-8 gap-3">
              <div className="h-10 w-24 rounded-xl bg-gray-200 animate-pulse" />
              <div className="h-10 w-24 rounded-xl bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fafafa] px-6">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-6">
          <svg
            className="w-8 h-8 text-gray-300"
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
        <p className="text-gray-500 mb-8 text-center max-w-sm">{error}</p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/create"
            className="min-h-[44px] inline-flex items-center justify-center px-6 py-3 rounded-xl bg-electric text-white font-medium shadow-sm hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          >
            Create a deck
          </Link>
          <Link
            href="/"
            className="min-h-[44px] inline-flex items-center justify-center px-6 py-3 rounded-xl border border-gray-200 text-navy font-medium shadow-sm hover:border-gray-300 hover:bg-gray-50 hover:shadow-glow hover:shadow-electric/10 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          >
            Go to PitchIQ
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <AppNav
        actions={
          <Link
            href="/create"
            className="min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-navy text-white text-sm font-medium shadow-sm hover:bg-navy-800 hover:shadow-glow hover:shadow-electric/10 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          >
            Create Your Own
          </Link>
        }
      />

      <div className="pt-24 pb-16 px-4 sm:px-6 animate-fade-in">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-navy mb-1 tracking-tight">
              {deck.title}
            </h1>
            <p className="text-gray-500 text-sm mb-4">{deck.slides.length} slides</p>
            {/* Share strip — same copy-success pattern as Create (trust through polish, design system) */}
            {shareUrl && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <span className="text-gray-500 text-sm">Share this deck</span>
                <div className="flex items-center w-full sm:w-auto max-w-md rounded-xl border border-gray-200 bg-white px-3 py-2 gap-2">
                  <span className="flex-1 min-w-0 truncate text-sm text-navy" aria-hidden="true">
                    {shareUrl.replace(/^https?:\/\//, "")}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="min-h-[44px] min-w-[44px] shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-electric text-white text-sm font-medium shadow-sm hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
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

          <SlideRenderer
            slides={deck.slides}
            companyName={deck.companyName}
            showBranding={!deck.isPremium}
            themeId={deck.themeId}
          />
        </div>
      </div>
    </div>
  );
}
