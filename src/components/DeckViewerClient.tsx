"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import SlideRenderer from "@/components/SlideRenderer";
import ExportMenu from "@/components/ExportMenu";
import DeckVariants from "@/components/DeckVariants";
import DeckInfoPanel from "@/components/DeckInfoPanel";
import { DeckData } from "@/lib/types";
import { DeckTracker } from "@/lib/analytics/deck-tracker";
import {
  FileText, Check, ArrowLeft, Plus, Mic, LayoutDashboard,
  Share2, Sparkles, AlertCircle,
} from "lucide-react";

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

  const shareUrl = typeof window !== "undefined" && shareId ? `${window.location.origin}/deck/${shareId}` : "";

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

  useEffect(() => {
    if (!viewId || !shareId) return;
    const tracker = new DeckTracker(shareId, viewId);
    trackerRef.current = tracker;
    tracker.trackSlideView(0);
    return () => { tracker.flush(); tracker.cleanup(); };
  }, [viewId, shareId]);

  const handleSlideChange = useCallback((slideIndex: number) => {
    trackerRef.current?.trackSlideView(slideIndex);
    if (deck && slideIndex === deck.slides.length - 1) trackerRef.current?.markCompleted();
  }, [deck]);

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: "var(--void, #000)" }}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-16 pb-10">
          <div className="flex items-center justify-between mb-8">
            <div className="h-5 w-32 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            <div className="flex gap-2">
              <div className="h-9 w-20 rounded-xl animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
              <div className="h-9 w-9 rounded-full animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            </div>
          </div>
          <div className="text-center mb-8">
            <div className="h-8 w-64 mx-auto rounded-lg animate-pulse mb-3" style={{ background: "rgba(255,255,255,0.04)" }} />
            <div className="h-4 w-20 mx-auto rounded animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
          </div>
          <div className="aspect-video rounded-2xl animate-pulse mb-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }} />
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-8 h-8 rounded-lg animate-pulse" style={{ background: "rgba(255,255,255,0.04)" }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Error ── */
  if (error || !deck) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6" style={{ background: "var(--void, #000)" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6" style={{ background: "rgba(248,113,113,0.1)", border: "1px solid rgba(248,113,113,0.2)" }}>
          <AlertCircle size={28} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2" style={{ color: "var(--void-text, #E8E8ED)" }}>Deck not found</h1>
        <p className="text-sm mb-8 text-center max-w-sm" style={{ color: "var(--void-text-dim, rgba(255,255,255,0.3))" }}>{error}</p>
        <div className="flex items-center gap-3">
          <Link href="/create" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:-translate-y-0.5" style={{ background: "var(--neon-electric, #4361EE)", boxShadow: "0 4px 20px rgba(67,97,238,0.3)" }}>
            <Plus size={16} /> Create a deck
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors" style={{ border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.6)" }}>
            Go to PitchIQ
          </Link>
        </div>
      </div>
    );
  }

  /* ── PIQ Score ── */
  let piqScore: number | null = null;
  try {
    const parsed = typeof deck.piqScore === "string" ? JSON.parse(deck.piqScore) : deck.piqScore;
    piqScore = parsed?.overall || null;
  } catch { /* */ }
  const scoreColor = piqScore && piqScore >= 80 ? "var(--neon-emerald, #00FF9D)" : piqScore && piqScore >= 60 ? "var(--neon-cyan, #00F0FF)" : "var(--neon-electric, #4361EE)";

  return (
    <div style={{ background: "var(--void, #000)" }}>
      {/* ── Top Bar ── */}
      <header className="sticky top-0 z-40 backdrop-blur-xl" style={{ background: "rgba(0,0,0,0.7)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80" style={{ color: "rgba(255,255,255,0.5)" }}>
              <ArrowLeft size={14} />
              Dashboard
            </Link>
            <span style={{ color: "rgba(255,255,255,0.15)" }}>/</span>
            <span className="text-xs font-medium truncate max-w-[200px]" style={{ color: "var(--void-text, #E8E8ED)" }}>
              {deck.title}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* PIQ Score badge */}
            {piqScore && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: `${scoreColor}10`, border: `1px solid ${scoreColor}25` }}>
                <Sparkles size={12} style={{ color: scoreColor }} />
                <span className="text-xs font-bold" style={{ color: scoreColor }}>{piqScore}</span>
                <span className="text-[10px]" style={{ color: "rgba(255,255,255,0.3)" }}>PIQ</span>
              </div>
            )}

            {/* Share */}
            <button onClick={handleCopyLink} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
              {copied ? <><Check size={12} className="text-emerald-400" /> Copied</> : <><Share2 size={12} /> Share</>}
            </button>

            {/* Deck Info */}
            {isOwner && fullDeckData && (
              <button onClick={() => setShowInfoPanel(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" }}>
                <FileText size={12} /> Info
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-12">
        {/* Deck header */}
        <div className="text-center mb-8">
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1" style={{ color: "var(--void-text, #E8E8ED)" }}>
            {deck.title}
          </h1>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
            {deck.companyName} · {deck.slides.length} slides
          </p>

          {/* Share URL */}
          {shareUrl && (
            <div className="mt-4 flex items-center justify-center gap-2">
              <div className="flex items-center max-w-md rounded-xl px-3 py-1.5 gap-2" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="truncate text-[11px]" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {shareUrl.replace(/^https?:\/\//, "")}
                </span>
                <button onClick={handleCopyLink} className="shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-semibold transition-all" style={{ background: "rgba(var(--neon-electric-rgb, 67,97,238), 0.15)", color: "var(--neon-cyan, #00F0FF)" }}>
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Investor variants */}
        {isOwner && variants.length > 0 && (
          <div className="mb-6">
            <DeckVariants shareId={shareId} variants={variants} ownerPlan={ownerPlan} />
          </div>
        )}

        {/* Slides */}
        <SlideRenderer
          slides={deck.slides}
          companyName={deck.companyName}
          showBranding={showBranding}
          themeId={deck.themeId}
          onSlideChange={handleSlideChange}
        />

        {/* ── Action Bar ── */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {deck && <ExportMenu deck={deck} userPlan={ownerPlan} />}

            {isOwner && (ownerPlan === "growth" || ownerPlan === "enterprise") && (
              <Link href={`/practice/${shareId}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all" style={{ background: "rgba(var(--neon-electric-rgb, 67,97,238), 0.1)", border: "1px solid rgba(var(--neon-electric-rgb, 67,97,238), 0.2)", color: "var(--neon-cyan, #00F0FF)" }}>
                <Mic size={14} /> Practice Pitch
              </Link>
            )}

            {isOwner && (
              <Link href={`/editor/${shareId}`} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
                Edit Deck
              </Link>
            )}

            <Link href="/dashboard" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)" }}>
              <LayoutDashboard size={14} /> Dashboard
            </Link>

            <Link href="/create" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-semibold transition-all hover:-translate-y-0.5" style={{ background: "var(--neon-electric, #4361EE)", boxShadow: "0 4px 20px rgba(67,97,238,0.3)" }}>
              <Plus size={14} /> New Deck
            </Link>
          </div>

          {/* Upgrade CTA */}
          {ownerPlan === "starter" && (
            <div className="w-full max-w-2xl rounded-2xl p-5" style={{ background: "rgba(var(--neon-electric-rgb, 67,97,238), 0.05)", border: "1px solid rgba(var(--neon-electric-rgb, 67,97,238), 0.15)" }}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles size={14} style={{ color: "var(--neon-electric, #4361EE)" }} />
                    <h3 className="font-bold text-xs" style={{ color: "var(--void-text, #E8E8ED)" }}>Upgrade to Pro</h3>
                  </div>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    Remove branding, unlock all themes, PPTX export, detailed analytics & engagement tracking.
                  </p>
                </div>
                <Link href="/#pricing" className="shrink-0 inline-flex items-center px-5 py-2 rounded-xl text-white text-xs font-semibold" style={{ background: "var(--neon-electric, #4361EE)" }}>
                  View Plans
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Deck Info Panel */}
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
