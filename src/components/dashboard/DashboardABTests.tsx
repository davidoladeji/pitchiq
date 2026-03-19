"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ABTestDeck {
  id: string;
  shareId: string;
  title: string;
  views: number;
}

interface ABTest {
  id: string;
  shareSlug: string;
  deckA: ABTestDeck;
  deckB: ABTestDeck;
  createdAt: string;
}

interface DeckOption {
  shareId: string;
  title: string;
}

export default function DashboardABTests({
  decks,
  plan,
}: {
  decks: DeckOption[];
  plan: string;
}) {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [deckAId, setDeckAId] = useState("");
  const [deckBId, setDeckBId] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const isGrowth = plan === "growth" || plan === "enterprise";

  useEffect(() => {
    if (!isGrowth) {
      setLoading(false);
      return;
    }
    async function fetchTests() {
      try {
        const res = await fetch("/api/ab-test");
        if (res.ok) {
          const data = await res.json();
          setTests(data.tests || []);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }
    fetchTests();
  }, [isGrowth]);

  async function handleCreate() {
    if (!deckAId || !deckBId || deckAId === deckBId) return;
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/ab-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckAShareId: deckAId, deckBShareId: deckBId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create A/B test");
      }

      // Refetch tests
      const listRes = await fetch("/api/ab-test");
      if (listRes.ok) {
        const data = await listRes.json();
        setTests(data.tests || []);
      }

      setShowCreate(false);
      setDeckAId("");
      setDeckBId("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  if (!isGrowth) return null;

  const appUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="rounded-2xl border border-navy-100 bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center">
            <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </div>
          <h3 className="font-bold text-navy text-sm">A/B Tests</h3>
        </div>
        {!showCreate && decks.length >= 2 && (
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex items-center gap-1 text-xs text-electric font-medium hover:underline"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            New Test
          </button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="rounded-xl border border-navy-200 bg-navy-50/50 p-4 mb-4 space-y-3">
          <p className="text-xs font-semibold text-navy">Select two decks to compare:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="ab-deck-a" className="block text-[11px] font-medium text-navy-500 mb-1">Deck A</label>
              <select
                id="ab-deck-a"
                value={deckAId}
                onChange={(e) => setDeckAId(e.target.value)}
                className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-xs text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <option value="">Select a deck...</option>
                {decks.map((d) => (
                  <option key={d.shareId} value={d.shareId} disabled={d.shareId === deckBId}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="ab-deck-b" className="block text-[11px] font-medium text-navy-500 mb-1">Deck B</label>
              <select
                id="ab-deck-b"
                value={deckBId}
                onChange={(e) => setDeckBId(e.target.value)}
                className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2 text-xs text-navy focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <option value="">Select a deck...</option>
                {decks.map((d) => (
                  <option key={d.shareId} value={d.shareId} disabled={d.shareId === deckAId}>
                    {d.title}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCreate}
              disabled={creating || !deckAId || !deckBId || deckAId === deckBId}
              className="px-4 py-2 rounded-lg bg-electric text-white text-xs font-semibold disabled:opacity-50 hover:bg-electric-600 transition-colors"
            >
              {creating ? "Creating..." : "Create A/B Test"}
            </button>
            <button
              type="button"
              onClick={() => { setShowCreate(false); setDeckAId(""); setDeckBId(""); setError(""); }}
              disabled={creating}
              className="px-4 py-2 rounded-lg bg-navy-50 text-navy-400 text-xs font-semibold hover:text-navy transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-navy-50 animate-pulse motion-reduce:animate-none" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && tests.length === 0 && !showCreate && (
        <div className="text-center py-6">
          <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </div>
          <p className="text-xs text-navy-400">
            No A/B tests yet.{" "}
            {decks.length >= 2 ? (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className="text-electric hover:underline font-medium"
              >
                Create one
              </button>
            ) : (
              "Create at least 2 decks to start testing."
            )}
          </p>
        </div>
      )}

      {/* Test list */}
      {!loading && tests.length > 0 && (
        <div className="space-y-3">
          {tests.map((test) => {
            const totalViews = test.deckA.views + test.deckB.views;
            const aPct = totalViews > 0 ? Math.round((test.deckA.views / totalViews) * 100) : 50;
            const bPct = 100 - aPct;
            const shareLink = `${appUrl}/api/ab/${test.shareSlug}`;

            return (
              <div key={test.id} className="rounded-xl border border-navy-100 bg-navy-50/30 p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0">
                    <p className="text-[11px] text-navy-400 mb-0.5">A/B Test</p>
                    <div className="flex items-center gap-1 text-[11px] text-navy-400">
                      <span className="font-mono truncate max-w-[200px]">{shareLink.replace(/^https?:\/\//, "")}</span>
                      <button
                        type="button"
                        onClick={() => navigator.clipboard.writeText(shareLink)}
                        className="shrink-0 text-electric hover:text-electric-light"
                        aria-label="Copy A/B test link"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <span className="text-[10px] text-navy-400 shrink-0">
                    {new Date(test.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Comparison bars */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-4 text-[10px] font-bold text-electric">A</span>
                    <div className="flex-1 h-6 rounded-lg bg-navy-100 overflow-hidden relative">
                      <div
                        className="h-full bg-electric/20 rounded-lg transition-all"
                        style={{ width: `${aPct}%` }}
                      />
                      <span className="absolute inset-0 flex items-center px-2 text-[11px] font-semibold text-navy truncate">
                        {test.deckA.title}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-navy w-12 text-right">
                      {test.deckA.views} <span className="font-normal text-navy-400">({aPct}%)</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 text-[10px] font-bold text-violet-600">B</span>
                    <div className="flex-1 h-6 rounded-lg bg-navy-100 overflow-hidden relative">
                      <div
                        className="h-full bg-violet-200/50 rounded-lg transition-all"
                        style={{ width: `${bPct}%` }}
                      />
                      <span className="absolute inset-0 flex items-center px-2 text-[11px] font-semibold text-navy truncate">
                        {test.deckB.title}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-navy w-12 text-right">
                      {test.deckB.views} <span className="font-normal text-navy-400">({bPct}%)</span>
                    </span>
                  </div>
                </div>

                {totalViews === 0 && (
                  <p className="text-[10px] text-navy-400 mt-2">
                    Share the A/B test link to start collecting data.
                  </p>
                )}

                <div className="flex gap-2 mt-3">
                  <Link
                    href={`/deck/${test.deckA.shareId}`}
                    className="text-[10px] text-electric hover:underline font-medium"
                  >
                    View A
                  </Link>
                  <Link
                    href={`/deck/${test.deckB.shareId}`}
                    className="text-[10px] text-violet-600 hover:underline font-medium"
                  >
                    View B
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
