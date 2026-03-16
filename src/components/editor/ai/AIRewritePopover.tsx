"use client";

import { useState, useCallback } from "react";
import { useEditorStore } from "../state/editorStore";

interface AIRewritePopoverProps {
  text: string;
  slideIndex: number;
  blockId?: string;
  fieldPath?: string; // "title" | "subtitle" | "content.0" etc.
  onApply: (rewritten: string) => void;
  onClose: () => void;
  position?: { top: number; left: number };
}

const STYLES = [
  { id: "concise", label: "Concise", desc: "Shorter, punchier" },
  { id: "compelling", label: "Compelling", desc: "Emotionally engaging" },
  { id: "data-driven", label: "Data-driven", desc: "Numbers-focused" },
  { id: "investor-friendly", label: "Investor-friendly", desc: "VC-ready language" },
];

export default function AIRewritePopover({
  text,
  onApply,
  onClose,
  position,
}: AIRewritePopoverProps) {
  const deck = useEditorStore((s) => s.deck);

  const [loading, setLoading] = useState(false);
  const [rewritten, setRewritten] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState("concise");

  const runRewrite = useCallback(
    async (style: string) => {
      if (!deck) return;
      setLoading(true);
      setError(null);
      setRewritten(null);
      setSelectedStyle(style);

      try {
        const res = await fetch(`/api/decks/${deck.shareId}/ai`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "rewrite",
            text,
            style: `${style} and investor-friendly`,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Rewrite failed");
        }

        const data = await res.json();
        setRewritten(data.rewritten || text);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Rewrite failed");
      } finally {
        setLoading(false);
      }
    },
    [deck, text]
  );

  const style: React.CSSProperties = position
    ? { position: "absolute", top: position.top, left: position.left, zIndex: 100 }
    : {};

  return (
    <div
      className="bg-[#1a1a2e] border border-white/15 rounded-2xl shadow-2xl w-[320px] overflow-hidden"
      style={style}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-[#4361ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <span className="text-sm font-bold text-white">AI Rewrite</span>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 flex items-center justify-center rounded text-white/30 hover:text-white hover:bg-white/10 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Original text preview */}
      <div className="px-4 py-2.5 border-b border-white/5">
        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-1">
          Original
        </p>
        <p className="text-xs text-white/50 leading-relaxed line-clamp-2">
          {text}
        </p>
      </div>

      {/* Style buttons */}
      <div className="px-4 py-3 border-b border-white/5">
        <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-2">
          Rewrite Style
        </p>
        <div className="grid grid-cols-2 gap-1.5">
          {STYLES.map((s) => (
            <button
              key={s.id}
              onClick={() => runRewrite(s.id)}
              disabled={loading}
              className={`px-3 py-2 rounded-lg text-left transition-all border ${
                selectedStyle === s.id && (rewritten || loading)
                  ? "bg-[#4361ee]/15 border-[#4361ee]/30 text-white"
                  : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white/80"
              } disabled:opacity-50`}
            >
              <span className="text-xs font-semibold block">{s.label}</span>
              <span className="text-[10px] opacity-50">{s.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="px-4 py-4 text-center">
          <svg className="w-5 h-5 text-[#4361ee] animate-spin mx-auto mb-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-xs text-white/40">Rewriting...</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-4 py-3">
          <p className="text-xs text-red-400">{error}</p>
        </div>
      )}

      {/* Result */}
      {rewritten && !loading && (
        <div className="px-4 py-3">
          <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-1">
            Rewritten
          </p>
          <p className="text-xs text-white/80 leading-relaxed mb-3 p-2 rounded-lg bg-white/5 border border-white/5">
            {rewritten}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onApply(rewritten);
                onClose();
              }}
              className="flex-1 py-2 rounded-lg bg-[#4361ee] hover:bg-[#3651de] text-white text-xs font-semibold transition-colors"
            >
              Apply
            </button>
            <button
              onClick={() => runRewrite(selectedStyle)}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-white/60 text-xs font-medium transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
