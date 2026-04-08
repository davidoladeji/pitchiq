"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Clock,
  BarChart3,
  ChevronDown,
  ChevronUp,
  Presentation,
  Loader2,
  X,
  Gauge,
  Timer,
  Shield,
} from "lucide-react";
import { Badge } from "@/components/v2/ui/badge";
import { Card } from "@/components/v2/ui/card";
import { Button } from "@/components/v2/ui/button";
import { useDashboardData } from "@/components/v2/shell/DashboardDataContext";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { relativeTime } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface PracticeSession {
  id: string;
  deckId: string;
  deckTitle: string;
  date: string;
  durationSeconds: number;
  overallScore: number;
  clarity: number;
  pacing: number;
  confidence: number;
}

interface DeckItem {
  id: string;
  title: string;
  companyName: string;
  score: number;
  views: number;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  if (m === 0) return `${s}s`;
  return s > 0 ? `${m}m ${s}s` : `${m}m`;
}

function scoreColor(score: number): string {
  if (score >= 80) return "var(--neon-cyan)";
  if (score >= 60) return "var(--neon-electric)";
  return "var(--neon-violet)";
}

function scoreBadgeVariant(score: number): "primary" | "warning" | "error" {
  if (score >= 70) return "primary";
  if (score >= 50) return "warning";
  return "error";
}

/* ------------------------------------------------------------------ */
/*  Deck Picker Modal                                                  */
/* ------------------------------------------------------------------ */

function DeckPicker({
  decks,
  onSelect,
  onClose,
  loading,
}: {
  decks: DeckItem[];
  onSelect: (deckId: string) => void;
  onClose: () => void;
  loading: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="w-full max-w-md rounded-xl border shadow-2xl"
        style={{
          background: "var(--void-bg, #0A0A0F)",
          borderColor: "var(--void-border, rgba(255,255,255,0.06))",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: "var(--void-border)" }}>
          <div>
            <h3 className="text-base font-semibold" style={{ color: "var(--void-text)" }}>
              Select a Deck
            </h3>
            <p className="text-xs mt-0.5" style={{ color: "var(--void-text-dim)" }}>
              Choose a pitch deck to practice with
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/[0.06]"
            style={{ color: "var(--void-text-muted)" }}
            disabled={loading}
          >
            <X size={16} />
          </button>
        </div>

        {/* Deck list */}
        <div className="p-3 max-h-80 overflow-y-auto space-y-1.5">
          {decks.length === 0 ? (
            <div className="text-center py-8">
              <Presentation size={28} className="mx-auto mb-2" style={{ color: "var(--void-text-dim)" }} />
              <p className="text-sm" style={{ color: "var(--void-text-dim)" }}>
                No decks available
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--void-text-muted)" }}>
                Create a pitch deck first to start practicing
              </p>
            </div>
          ) : (
            decks.map((deck) => (
              <button
                key={deck.id}
                onClick={() => onSelect(deck.id)}
                disabled={loading}
                className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors hover:bg-white/[0.06] disabled:opacity-50"
              >
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: "rgba(67,97,238,0.12)" }}
                >
                  <Presentation size={16} style={{ color: "var(--neon-electric)" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "var(--void-text)" }}>
                    {deck.title}
                  </p>
                  <p className="text-xs truncate" style={{ color: "var(--void-text-dim)" }}>
                    {deck.companyName}
                  </p>
                </div>
                {deck.score > 0 && (
                  <Badge variant="primary" size="sm">
                    {deck.score}
                  </Badge>
                )}
              </button>
            ))
          )}
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl" style={{ background: "rgba(0,0,0,0.5)" }}>
            <Loader2 size={24} className="animate-spin" style={{ color: "var(--neon-electric)" }} />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Session Detail (expandable)                                        */
/* ------------------------------------------------------------------ */

function SessionDetail({ session }: { session: PracticeSession }) {
  const metrics = [
    { label: "Clarity", value: session.clarity, icon: Gauge },
    { label: "Pacing", value: session.pacing, icon: Timer },
    { label: "Confidence", value: session.confidence, icon: Shield },
  ];

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="overflow-hidden"
    >
      <div className="pt-3 mt-3 border-t grid grid-cols-3 gap-3" style={{ borderColor: "var(--void-border)" }}>
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Icon size={13} style={{ color: "var(--void-text-dim)" }} />
                <span className="text-xs" style={{ color: "var(--void-text-dim)" }}>
                  {m.label}
                </span>
              </div>
              <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${m.value}%` }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }}
                  className="absolute inset-y-0 left-0 rounded-full"
                  style={{ background: scoreColor(m.value) }}
                />
              </div>
              <p className="text-sm font-semibold mt-1" style={{ color: scoreColor(m.value) }}>
                {m.value}
              </p>
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2 text-xs" style={{ color: "var(--void-text-dim)" }}>
        <Clock size={12} />
        <span>Duration: {formatDuration(session.durationSeconds)}</span>
        <span className="mx-1">|</span>
        <span>
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
          }).format(new Date(session.date))}
        </span>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Session Card                                                       */
/* ------------------------------------------------------------------ */

function SessionCard({ session }: { session: PracticeSession }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <motion.div variants={fadeInUp}>
      <Card hover className="p-4 cursor-pointer" onClick={() => setExpanded((v) => !v)}>
        <div className="flex items-center gap-4">
          {/* Score circle */}
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{
              color: scoreColor(session.overallScore),
              border: `2px solid ${scoreColor(session.overallScore)}`,
              boxShadow: `0 0 12px ${scoreColor(session.overallScore)}33`,
            }}
          >
            {session.overallScore}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "var(--void-text)" }}>
              {session.deckTitle}
            </p>
            <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: "var(--void-text-dim)" }}>
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {relativeTime(session.date)}
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 size={12} />
                {formatDuration(session.durationSeconds)}
              </span>
            </div>
          </div>

          {/* Badges + expand */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5">
              <Badge variant={scoreBadgeVariant(session.clarity)} size="sm">
                Clarity {session.clarity}
              </Badge>
              <Badge variant={scoreBadgeVariant(session.pacing)} size="sm">
                Pacing {session.pacing}
              </Badge>
              <Badge variant={scoreBadgeVariant(session.confidence)} size="sm">
                Confidence {session.confidence}
              </Badge>
            </div>
            {expanded ? (
              <ChevronUp size={16} style={{ color: "var(--void-text-dim)" }} />
            ) : (
              <ChevronDown size={16} style={{ color: "var(--void-text-dim)" }} />
            )}
          </div>
        </div>

        {/* Expandable detail */}
        <AnimatePresence>
          {expanded && <SessionDetail session={session} />}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Page                                                          */
/* ------------------------------------------------------------------ */

export default function PracticePage() {
  const { data: dashData, loading, error } = useDashboardData();
  const [pickerOpen, setPickerOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const sessions = (dashData?.practice ?? []) as PracticeSession[];
  const decks = (dashData?.decks ?? []) as DeckItem[];

  const handleCreateSession = useCallback(
    async (deckId: string) => {
      setCreating(true);
      setCreateError(null);
      try {
        const res = await fetch("/api/practice", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deckId }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error ?? `Failed to create session (${res.status})`);
        }
        // Session created -- close picker and let the dashboard context refetch
        setPickerOpen(false);
        // Optionally navigate to the session or just refetch data
        // For now, we trigger a data refresh so the new session appears
        if (dashData) {
          // If the API returns the session, we could optimistically add it.
          // For safety, just refetch:
          window.location.reload();
        }
      } catch (err) {
        setCreateError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setCreating(false);
      }
    },
    [dashData]
  );

  /* Loading state */
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--neon-electric)" }} />
      </div>
    );
  }

  /* Error state */
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <p className="text-sm" style={{ color: "var(--void-text-dim)" }}>
          Failed to load practice data
        </p>
        <p className="text-xs" style={{ color: "var(--void-text-muted)" }}>
          {error}
        </p>
      </div>
    );
  }

  return (
    <>
      <motion.div
        className="space-y-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={fadeInUp} className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold" style={{ color: "var(--void-text)" }}>
              Pitch Practice
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--void-text-dim)" }}>
              {sessions.length} session{sessions.length !== 1 ? "s" : ""} recorded
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Button onClick={() => setPickerOpen(true)}>
              <Mic size={16} />
              New Session
            </Button>
            {createError && (
              <p className="text-xs" style={{ color: "#F87171" }}>
                {createError}
              </p>
            )}
          </div>
        </motion.div>

        {/* Empty state */}
        {sessions.length === 0 ? (
          <motion.div variants={fadeInUp}>
            <Card className="flex flex-col items-center text-center py-16 px-6">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
                style={{ background: "rgba(67,97,238,0.1)" }}
              >
                <Mic size={24} style={{ color: "var(--neon-electric)" }} />
              </div>
              <p className="text-sm font-medium" style={{ color: "var(--void-text)" }}>
                No practice sessions yet
              </p>
              <p className="text-xs mt-1.5 max-w-xs" style={{ color: "var(--void-text-dim)" }}>
                Pick a deck and practice your pitch with AI-powered feedback on clarity, pacing, and confidence.
              </p>
              <Button className="mt-5" onClick={() => setPickerOpen(true)}>
                <Mic size={16} />
                Start Practicing
              </Button>
            </Card>
          </motion.div>
        ) : (
          /* Session list */
          <div className="space-y-3">
            {sessions.map((s) => (
              <SessionCard key={s.id} session={s} />
            ))}
          </div>
        )}
      </motion.div>

      {/* Deck picker modal */}
      <AnimatePresence>
        {pickerOpen && (
          <DeckPicker
            decks={decks}
            onSelect={handleCreateSession}
            onClose={() => {
              if (!creating) setPickerOpen(false);
            }}
            loading={creating}
          />
        )}
      </AnimatePresence>
    </>
  );
}
