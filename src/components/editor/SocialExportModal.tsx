"use client";

import { useState } from "react";
import { useEditorStore } from "./state/editorStore";
import {
  exportSocialImages,
  PLATFORMS,
  type SocialPlatform,
} from "@/lib/export/social-exporter";

interface SocialExportModalProps {
  onClose: () => void;
}

const platformKeys = Object.keys(PLATFORMS) as SocialPlatform[];

export default function SocialExportModal({ onClose }: SocialExportModalProps) {
  const slides = useEditorStore((s) => s.slides);
  const deck = useEditorStore((s) => s.deck);

  const [platform, setPlatform] = useState<SocialPlatform>("linkedin");
  const [selectedSlides, setSelectedSlides] = useState<Set<number>>(
    () => new Set(slides.map((_, i) => i))
  );
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleSlide(idx: number) {
    setSelectedSlides((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
      } else {
        next.add(idx);
      }
      return next;
    });
  }

  function selectAll() {
    setSelectedSlides(new Set(slides.map((_, i) => i)));
  }

  function selectNone() {
    setSelectedSlides(new Set());
  }

  async function handleExport() {
    if (selectedSlides.size === 0) return;
    setExporting(true);
    setError(null);
    try {
      await exportSocialImages({
        platform,
        slideIndices: Array.from(selectedSlides).sort((a, b) => a - b),
        deckTitle: deck?.title || "pitch-deck",
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }

  const dims = PLATFORMS[platform];

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center bg-black/60">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#0F0F14] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-sm font-semibold text-white">
            Export for Social Media
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-white/40 transition-colors hover:bg-white/[0.08] hover:text-white/70"
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

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Platform picker */}
          <div>
            <label className="mb-2 block text-[11px] font-medium uppercase tracking-wider text-white/40">
              Platform
            </label>
            <div className="flex gap-2">
              {platformKeys.map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPlatform(key)}
                  className={`flex-1 rounded-lg border px-3 py-2.5 text-xs font-medium transition-colors ${
                    platform === key
                      ? "border-[#4361EE]/40 bg-[#4361EE]/10 text-white"
                      : "border-white/[0.08] bg-white/[0.03] text-white/50 hover:border-white/[0.15] hover:text-white/70"
                  }`}
                >
                  <div className="text-[11px] font-semibold capitalize">
                    {key === "twitter" ? "Twitter/X" : key}
                  </div>
                  <div className="mt-0.5 text-[10px] opacity-60">
                    {PLATFORMS[key].width}×{PLATFORMS[key].height}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Slide picker */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-[11px] font-medium uppercase tracking-wider text-white/40">
                Slides ({selectedSlides.size}/{slides.length})
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAll}
                  className="text-[10px] text-[#4361EE] hover:text-[#4361EE]/80"
                >
                  All
                </button>
                <button
                  type="button"
                  onClick={selectNone}
                  className="text-[10px] text-white/40 hover:text-white/60"
                >
                  None
                </button>
              </div>
            </div>
            <div className="grid max-h-48 grid-cols-6 gap-1.5 overflow-y-auto rounded-lg border border-white/[0.08] bg-white/[0.03] p-2">
              {slides.map((slide, idx) => (
                <button
                  key={slide.id || idx}
                  type="button"
                  onClick={() => toggleSlide(idx)}
                  className={`flex aspect-video items-center justify-center rounded text-[10px] font-medium transition-colors ${
                    selectedSlides.has(idx)
                      ? "bg-[#4361EE] text-white"
                      : "bg-white/[0.06] text-white/30 hover:bg-white/[0.10] hover:text-white/50"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Output info */}
          <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-4 py-3">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-white/40">Output</span>
              <span className="text-white/60">
                {selectedSlides.size} × {dims.width}×{dims.height} PNG
                {selectedSlides.size > 1 ? " (ZIP)" : ""}
              </span>
            </div>
          </div>

          {error && (
            <p className="text-[11px] text-red-400">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-white/10 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-xs font-medium text-white/50 transition-colors hover:text-white/70"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting || selectedSlides.size === 0}
            className="rounded-lg bg-[#4361EE] px-5 py-2 text-xs font-semibold text-white transition-opacity disabled:opacity-40"
          >
            {exporting ? "Exporting..." : "Export Images"}
          </button>
        </div>
      </div>
    </div>
  );
}
