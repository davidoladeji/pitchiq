"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FlaskConical,
  ChevronDown,
  ChevronUp,
  Eye,
  Link as LinkIcon,
  X,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/v2/ui/badge";
import { Button } from "@/components/v2/ui/button";
import { Card } from "@/components/v2/ui/card";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { relativeTime } from "@/lib/cn";
import { useDashboardData } from "@/components/v2/shell/DashboardDataContext";

/* ------------------------------------------------------------------ */
/*  Types matching the real API responses                              */
/* ------------------------------------------------------------------ */

interface ABTestDeck {
  id: string;
  shareId: string;
  title: string;
  views: number;
}

interface ABTestRecord {
  id: string;
  shareSlug: string;
  deckA: ABTestDeck;
  deckB: ABTestDeck;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ABTestsPage() {
  const { data: dashData } = useDashboardData();

  /* ---------- real test list from API ---------- */
  const [tests, setTests] = useState<ABTestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchTests = useCallback(() => {
    setLoading(true);
    setFetchError(null);
    fetch("/api/ab-test")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load tests");
        return r.json();
      })
      .then((d) => {
        setTests(d.tests ?? []);
        setLoading(false);
      })
      .catch((err) => {
        setFetchError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  /* ---------- inline "New Test" form ---------- */
  const [showForm, setShowForm] = useState(false);
  const [deckAId, setDeckAId] = useState("");
  const [deckBId, setDeckBId] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const decks = dashData?.decks ?? [];

  const handleCreate = async () => {
    if (!deckAId || !deckBId) return;
    if (deckAId === deckBId) {
      setCreateError("Please select two different decks.");
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      const res = await fetch("/api/ab-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deckAShareId: deckAId, deckBShareId: deckBId }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Failed to create test");
      }

      const data = await res.json();

      // Add to local state so it appears immediately
      const newTest: ABTestRecord = {
        id: data.id,
        shareSlug: data.shareSlug,
        deckA: {
          id: data.deckAId,
          shareId: deckAId,
          title: data.deckATitle ?? decks.find((d) => d.id === deckAId)?.title ?? "Deck A",
          views: 0,
        },
        deckB: {
          id: data.deckBId,
          shareId: deckBId,
          title: data.deckBTitle ?? decks.find((d) => d.id === deckBId)?.title ?? "Deck B",
          views: 0,
        },
        createdAt: new Date().toISOString(),
      };

      setTests((prev) => [newTest, ...prev]);
      setShowForm(false);
      setDeckAId("");
      setDeckBId("");
    } catch (err: unknown) {
      setCreateError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  /* ---------- expandable card ---------- */
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const toggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  /* ---------- copy share URL ---------- */
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);
  const copyLink = (slug: string) => {
    const url = `${window.location.origin}/ab/${slug}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    });
  };

  /* ---------- render ---------- */
  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: "var(--void-text)" }}>
            A/B Tests
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--void-text-dim)" }}>
            {loading ? "Loading..." : `${tests.length} test${tests.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
          {showForm ? "Cancel" : "New Test"}
        </Button>
      </motion.div>

      {/* Inline creation form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-5 space-y-4" style={{ border: "1px solid rgba(99,102,241,0.25)" }}>
              <p className="text-sm font-medium" style={{ color: "var(--void-text)" }}>
                Create a new A/B test
              </p>
              <p className="text-xs" style={{ color: "var(--void-text-dim)" }}>
                Select two decks to compare. Viewers will be randomly shown one of the two.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Deck A select */}
                <div>
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--void-text-dim)" }}>
                    Variant A
                  </label>
                  <select
                    value={deckAId}
                    onChange={(e) => setDeckAId(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{
                      background: "var(--void-bg)",
                      color: "var(--void-text)",
                      border: "1px solid var(--void-border)",
                    }}
                  >
                    <option value="">Select a deck...</option>
                    {decks.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Deck B select */}
                <div>
                  <label className="block text-xs mb-1.5 font-medium" style={{ color: "var(--void-text-dim)" }}>
                    Variant B
                  </label>
                  <select
                    value={deckBId}
                    onChange={(e) => setDeckBId(e.target.value)}
                    className="w-full rounded-lg px-3 py-2 text-sm outline-none"
                    style={{
                      background: "var(--void-bg)",
                      color: "var(--void-text)",
                      border: "1px solid var(--void-border)",
                    }}
                  >
                    <option value="">Select a deck...</option>
                    {decks.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {createError && (
                <p className="text-xs" style={{ color: "#F87171" }}>
                  {createError}
                </p>
              )}

              <Button onClick={handleCreate} disabled={creating || !deckAId || !deckBId}>
                {creating ? (
                  <>
                    <Loader2 size={14} className="mr-2 animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <FlaskConical size={14} className="mr-2" /> Create Test
                  </>
                )}
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error state */}
      {fetchError && (
        <motion.div variants={fadeInUp}>
          <Card className="p-4 text-center">
            <p className="text-sm" style={{ color: "#F87171" }}>
              {fetchError}
            </p>
            <Button className="mt-3" onClick={fetchTests}>
              Retry
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Loading state */}
      {loading && !fetchError && (
        <motion.div variants={fadeInUp} className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin" style={{ color: "var(--void-text-dim)" }} />
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && !fetchError && tests.length === 0 && (
        <motion.div variants={fadeInUp}>
          <Card className="text-center py-12">
            <FlaskConical size={32} className="mx-auto mb-3" style={{ color: "var(--void-text-dim)" }} />
            <p className="text-sm font-medium" style={{ color: "var(--void-text)" }}>
              No A/B tests yet
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--void-text-dim)" }}>
              Test different deck variants to see which performs better
            </p>
            <Button className="mt-4" onClick={() => setShowForm(true)}>
              Create Your First Test
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Test list */}
      {!loading && tests.length > 0 && (
        <motion.div variants={fadeInUp} className="space-y-3">
          {tests.map((t) => {
            const isExpanded = expandedId === t.id;
            const totalViews = t.deckA.views + t.deckB.views;

            return (
              <Card key={t.id} className="overflow-hidden">
                {/* Clickable header */}
                <button
                  type="button"
                  onClick={() => toggle(t.id)}
                  className="w-full p-4 flex items-center justify-between text-left transition-colors hover:opacity-90"
                  style={{ background: "transparent" }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <FlaskConical size={18} style={{ color: "rgba(139,92,246,0.8)" }} className="shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "var(--void-text)" }}>
                        {t.deckA.title} vs {t.deckB.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--void-text-dim)" }}>
                        Created {relativeTime(t.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="primary">{totalViews} view{totalViews !== 1 ? "s" : ""}</Badge>
                    {isExpanded ? (
                      <ChevronUp size={16} style={{ color: "var(--void-text-dim)" }} />
                    ) : (
                      <ChevronDown size={16} style={{ color: "var(--void-text-dim)" }} />
                    )}
                  </div>
                </button>

                {/* Expandable details */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="px-4 pb-4 pt-1 space-y-4"
                        style={{ borderTop: "1px solid var(--void-border)" }}
                      >
                        {/* Stats grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Variant A */}
                          <div
                            className="rounded-lg p-3"
                            style={{
                              background: "var(--void-surface)",
                              border: "1px solid rgba(99,102,241,0.2)",
                            }}
                          >
                            <p className="text-xs font-medium mb-2" style={{ color: "rgba(99,102,241,0.9)" }}>
                              Variant A
                            </p>
                            <p className="text-sm font-medium truncate" style={{ color: "var(--void-text)" }}>
                              {t.deckA.title}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1">
                                <Eye size={12} style={{ color: "var(--void-text-dim)" }} />
                                <span className="text-xs" style={{ color: "var(--void-text-dim)" }}>
                                  {t.deckA.views} views
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Variant B */}
                          <div
                            className="rounded-lg p-3"
                            style={{
                              background: "var(--void-surface)",
                              border: "1px solid rgba(6,182,212,0.2)",
                            }}
                          >
                            <p className="text-xs font-medium mb-2" style={{ color: "rgba(6,182,212,0.9)" }}>
                              Variant B
                            </p>
                            <p className="text-sm font-medium truncate" style={{ color: "var(--void-text)" }}>
                              {t.deckB.title}
                            </p>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1">
                                <Eye size={12} style={{ color: "var(--void-text-dim)" }} />
                                <span className="text-xs" style={{ color: "var(--void-text-dim)" }}>
                                  {t.deckB.views} views
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* View split bar */}
                        {totalViews > 0 && (
                          <div>
                            <div className="flex justify-between text-xs mb-1" style={{ color: "var(--void-text-dim)" }}>
                              <span>A: {Math.round((t.deckA.views / totalViews) * 100)}%</span>
                              <span>B: {Math.round((t.deckB.views / totalViews) * 100)}%</span>
                            </div>
                            <div
                              className="h-1.5 rounded-full overflow-hidden flex"
                              style={{ background: "var(--void-surface)" }}
                            >
                              <div
                                className="h-full rounded-l-full"
                                style={{
                                  width: `${(t.deckA.views / totalViews) * 100}%`,
                                  background: "rgba(99,102,241,0.7)",
                                }}
                              />
                              <div
                                className="h-full rounded-r-full"
                                style={{
                                  width: `${(t.deckB.views / totalViews) * 100}%`,
                                  background: "rgba(6,182,212,0.7)",
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Share link */}
                        <div className="flex items-center gap-2">
                          <LinkIcon size={12} style={{ color: "var(--void-text-dim)" }} />
                          <code
                            className="text-xs px-2 py-1 rounded"
                            style={{
                              background: "var(--void-surface)",
                              color: "var(--void-text-dim)",
                              border: "1px solid var(--void-border)",
                            }}
                          >
                            /ab/{t.shareSlug}
                          </code>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              copyLink(t.shareSlug);
                            }}
                            className="text-xs px-2 py-1 rounded transition-colors"
                            style={{
                              color: copiedSlug === t.shareSlug ? "rgba(99,102,241,1)" : "var(--void-text-dim)",
                              border: "1px solid var(--void-border)",
                            }}
                          >
                            {copiedSlug === t.shareSlug ? "Copied!" : "Copy"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
