"use client";

import { useState, useEffect, useCallback } from "react";
import { useEditorStore } from "./state/editorStore";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Version {
  id: string;
  version: number;
  slideCount: number;
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

  return (
    <div className="flex h-full flex-col bg-[#0F0F14]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <h3 className="text-sm font-semibold text-white">Version History</h3>
        <button
          type="button"
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white/70"
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
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
          </div>
        ) : versions.length === 0 ? (
          <p className="py-12 text-center text-xs text-white/40">
            No version history available.
          </p>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[7px] top-2 bottom-2 w-px bg-white/[0.08]" />

            <div className="space-y-1">
              {versions.map((v, idx) => {
                const isCurrent = idx === 0;
                const isConfirming = confirmId === v.id;
                const isRestoring = restoring === v.id;

                return (
                  <div key={v.id} className="group relative pl-6">
                    {/* Dot */}
                    <div
                      className={`absolute left-[4px] top-3 h-[7px] w-[7px] rounded-full ${
                        isCurrent ? "bg-[#4361EE]" : "bg-white/20"
                      }`}
                    />

                    <div
                      className={`rounded-xl border p-3 transition-colors ${
                        isCurrent
                          ? "border-[#4361EE]/30 bg-[#4361EE]/[0.06]"
                          : "border-white/[0.06] bg-white/[0.04] hover:border-white/[0.12]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">
                            v{v.version}
                          </span>
                          {isCurrent && (
                            <span className="rounded bg-[#4361EE]/20 px-1.5 py-0.5 text-[10px] font-medium text-[#4361EE]">
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
                          className="mt-2 hidden text-[11px] font-medium text-[#4361EE] transition-colors hover:text-[#4361EE]/80 group-hover:inline-block"
                        >
                          Restore
                        </button>
                      )}

                      {/* Confirm */}
                      {isConfirming && (
                        <div className="mt-2 flex items-center gap-2">
                          <span className="text-[11px] text-white/50">
                            Restore this version?
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRestore(v.id)}
                            disabled={isRestoring}
                            className="rounded bg-[#4361EE] px-2.5 py-1 text-[11px] font-medium text-white transition-opacity disabled:opacity-40"
                          >
                            {isRestoring ? "Restoring..." : "Confirm"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmId(null)}
                            className="text-[11px] text-white/40 hover:text-white/60"
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
        )}
      </div>
    </div>
  );
}
