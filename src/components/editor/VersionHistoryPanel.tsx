"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useEditorStore } from "./state/editorStore";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Version {
  id: string;
  version: number;
  slideCount: number;
  piqScore: number | null;
  changeNote: string | null;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function scoreColorHex(score: number): string {
  if (score >= 80) return "#06D6A0";
  if (score >= 60) return "#4361EE";
  if (score >= 40) return "#FFD166";
  return "#EF476F";
}

/* ------------------------------------------------------------------ */
/*  Score History Chart (SVG sparkline)                                */
/* ------------------------------------------------------------------ */

function ScoreHistoryChart({ versions }: { versions: Version[] }) {
  // Filter to versions that have PIQ scores, sorted oldest → newest
  const scored = useMemo(
    () =>
      versions
        .filter((v) => v.piqScore !== null)
        .sort((a, b) => a.version - b.version),
    [versions]
  );

  if (scored.length < 2) return null;

  const scores = scored.map((v) => v.piqScore as number);
  const firstScore = scores[0];
  const lastScore = scores[scores.length - 1];
  const delta = lastScore - firstScore;
  const deltaColor = delta >= 0 ? "#06D6A0" : "#EF476F";

  // SVG dimensions
  const W = 260;
  const H = 60;
  const PADDING_X = 8;
  const PADDING_Y = 8;

  const minScore = Math.max(0, Math.min(...scores) - 5);
  const maxScore = Math.min(100, Math.max(...scores) + 5);
  const range = maxScore - minScore || 1;

  const points = scores.map((s, i) => {
    const x = PADDING_X + (i / (scores.length - 1)) * (W - 2 * PADDING_X);
    const y = H - PADDING_Y - ((s - minScore) / range) * (H - 2 * PADDING_Y);
    return { x, y, score: s, version: scored[i].version };
  });

  const polyline = points.map((p) => `${p.x},${p.y}`).join(" ");

  // Area fill path
  const areaPath = [
    `M ${points[0].x},${H - PADDING_Y}`,
    `L ${points.map((p) => `${p.x},${p.y}`).join(" L ")}`,
    `L ${points[points.length - 1].x},${H - PADDING_Y}`,
    "Z",
  ].join(" ");

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[11px] font-semibold text-white/60">
          PIQ Score History
        </h4>
        <div className="flex items-center gap-2">
          <span
            className="text-sm font-bold font-mono tabular-nums"
            style={{ color: scoreColorHex(lastScore) }}
          >
            {lastScore}
          </span>
          {delta !== 0 && (
            <span
              className="text-[10px] font-bold font-mono tabular-nums"
              style={{ color: deltaColor }}
            >
              {delta > 0 ? "+" : ""}
              {delta} pts
            </span>
          )}
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-[60px]"
        aria-label={`PIQ score trend: ${firstScore} to ${lastScore}`}
      >
        {/* Area fill */}
        <path d={areaPath} fill="#4361EE" fillOpacity={0.08} />

        {/* Line */}
        <polyline
          points={polyline}
          fill="none"
          stroke="#4361EE"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Points */}
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={3}
            fill={scoreColorHex(p.score)}
            stroke="#0F0F14"
            strokeWidth={1.5}
          />
        ))}

        {/* Version labels at first and last */}
        <text
          x={points[0].x}
          y={H - 1}
          textAnchor="start"
          fill="rgba(255,255,255,0.3)"
          fontSize={8}
        >
          v{points[0].version}
        </text>
        <text
          x={points[points.length - 1].x}
          y={H - 1}
          textAnchor="end"
          fill="rgba(255,255,255,0.3)"
          fontSize={8}
        >
          v{points[points.length - 1].version}
        </text>
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  VersionHistoryPanel                                                */
/* ------------------------------------------------------------------ */

export default function VersionHistoryPanel({
  shareId,
  onClose,
}: {
  shareId: string;
  onClose: () => void;
}) {
  const initDeck = useEditorStore((s) => s.initDeck);

  const [versions, setVersions] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const fetchVersions = useCallback(async () => {
    try {
      const res = await fetch(`/api/decks/${shareId}/versions`);
      if (res.ok) {
        const data = await res.json();
        setVersions(data.versions);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [shareId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleRestore = async (versionId: string) => {
    setRestoring(versionId);
    try {
      const res = await fetch(
        `/api/decks/${shareId}/versions/${versionId}/restore`,
        { method: "POST" }
      );
      if (res.ok) {
        // Reload the deck from the API so editor state reflects the restored version
        const deckRes = await fetch(`/api/decks/${shareId}`);
        if (deckRes.ok) {
          const deckData = await deckRes.json();
          initDeck(deckData);
        }
        setConfirmId(null);
        await fetchVersions();
      }
    } finally {
      setRestoring(null);
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  const focusRingDark =
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F0F14]";
  const restoreConfirmCta = `min-h-[44px] rounded-xl bg-electric px-3 text-xs font-semibold text-white shadow-lg shadow-electric/25 transition-all hover:-translate-y-0.5 hover:bg-electric-600 hover:shadow-glow active:translate-y-0 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${focusRingDark}`;

  return (
    <section
      className="flex h-full flex-col bg-[#0F0F14]"
      aria-labelledby="version-history-heading"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h3 id="version-history-heading" className="text-sm font-semibold text-white">
          Version History
        </h3>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close version history"
          className={`flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white/70 motion-reduce:transition-none ${focusRingDark}`}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {loading ? (
          <div
            className="flex items-center justify-center py-12"
            role="status"
            aria-live="polite"
          >
            <span className="sr-only">Loading version history</span>
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60 motion-reduce:animate-none" />
          </div>
        ) : versions.length === 0 ? (
          <p className="py-12 text-center text-xs text-white/40">
            No version history available.
          </p>
        ) : (
          <>
            {/* Score History Chart */}
            <ScoreHistoryChart versions={versions} />

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.08]" />

              <div className="space-y-1">
                {versions.map((v, idx) => {
                  const isCurrent = idx === 0;
                  const isConfirming = confirmId === v.id;
                  const isRestoring = restoring === v.id;

                  // Score delta from previous version
                  const prevVersion = idx < versions.length - 1 ? versions[idx + 1] : null;
                  const scoreDelta =
                    v.piqScore !== null && prevVersion?.piqScore !== null && prevVersion?.piqScore !== undefined
                      ? v.piqScore - prevVersion.piqScore
                      : null;

                  return (
                    <div key={v.id} className="group relative pl-6">
                      {/* Dot */}
                      <div
                        className={`absolute left-[4px] top-3 h-[7px] w-[7px] rounded-full ${
                          isCurrent ? "bg-electric" : "bg-white/20"
                        }`}
                      />

                      <div
                        className={`rounded-xl border p-3 transition-colors motion-reduce:transition-none ${
                          isCurrent
                            ? "border-electric/30 bg-electric/[0.06]"
                            : "border-white/[0.06] bg-white/[0.04] hover:border-white/[0.12]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white">
                              v{v.version}
                            </span>
                            {isCurrent && (
                              <span className="rounded bg-electric/20 px-1.5 py-0.5 text-[10px] font-medium text-electric">
                                Current
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-white/30">
                            {timeAgo(v.createdAt)}
                          </span>
                        </div>

                        <div className="mt-1.5 flex items-center gap-3">
                          <span className="text-[11px] text-white/50">
                            {v.slideCount} slide{v.slideCount !== 1 ? "s" : ""}
                          </span>
                          {v.piqScore !== null && (
                            <span className="flex items-center gap-1">
                              <span
                                className="text-[11px] font-mono font-semibold tabular-nums"
                                style={{ color: scoreColorHex(v.piqScore) }}
                              >
                                PIQ {v.piqScore}
                              </span>
                              {scoreDelta !== null && scoreDelta !== 0 && (
                                <span
                                  className="text-[10px] font-mono font-bold tabular-nums"
                                  style={{
                                    color: scoreDelta > 0 ? "#06D6A0" : "#EF476F",
                                  }}
                                >
                                  {scoreDelta > 0 ? "+" : ""}
                                  {scoreDelta}
                                </span>
                              )}
                            </span>
                          )}
                          {v.changeNote && (
                            <span className="text-[11px] text-white/40">
                              {v.changeNote}
                            </span>
                          )}
                        </div>

                        {/* Restore */}
                        {!isCurrent && !isConfirming && (
                          <button
                            type="button"
                            onClick={() => setConfirmId(v.id)}
                            className={`mt-2 hidden min-h-[44px] text-[11px] font-medium text-electric transition-colors hover:text-electric/80 group-hover:inline-block ${focusRingDark}`}
                          >
                            Restore
                          </button>
                        )}

                        {/* Confirm */}
                        {isConfirming && (
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="text-[11px] text-white/50">
                              Restore this version?
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRestore(v.id)}
                              disabled={isRestoring}
                              aria-busy={isRestoring}
                              aria-label={
                                isRestoring
                                  ? "Restoring version, please wait"
                                  : "Confirm restore this version"
                              }
                              className={restoreConfirmCta}
                            >
                              {isRestoring ? (
                                <span className="inline-flex items-center gap-2">
                                  <span
                                    className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none"
                                    aria-hidden
                                  />
                                  Restoring…
                                  <span className="sr-only">Please wait</span>
                                </span>
                              ) : (
                                "Confirm"
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmId(null)}
                              className={`min-h-[44px] rounded-lg px-2 text-[11px] text-white/40 hover:text-white/60 ${focusRingDark}`}
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
