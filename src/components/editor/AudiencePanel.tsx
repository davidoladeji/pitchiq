"use client";

import { useMemo, useState } from "react";
import { useEditorStore } from "./state/editorStore";
import {
  computeAudienceAdaptation,
  type AudienceMode,
  type AudienceAdaptation,
} from "@/lib/editor/ai/audience-adapter";

const MODES: { value: AudienceMode; label: string; description: string }[] = [
  {
    value: "investor",
    label: "Investor",
    description: "Traction, market, team, ask",
  },
  {
    value: "customer",
    label: "Customer",
    description: "Solution, pricing, proof",
  },
  {
    value: "partner",
    label: "Partner",
    description: "Solution, market, team",
  },
];

export default function AudiencePanel() {
  const slides = useEditorStore((s) => s.slides);
  const slideBlocks = useEditorStore((s) => s.slideBlocks);
  const slideBlockOrder = useEditorStore((s) => s.slideBlockOrder);
  const audienceMode = useEditorStore((s) => s.audienceMode);
  const setAudienceMode = useEditorStore((s) => s.setAudienceMode);
  const reorderSlides = useEditorStore((s) => s.reorderSlides);

  const [reorderPending, setReorderPending] = useState(false);

  const adaptation: AudienceAdaptation = useMemo(
    () =>
      computeAudienceAdaptation(
        { slides, slideBlocks, slideBlockOrder },
        audienceMode,
      ),
    [slides, slideBlocks, slideBlockOrder, audienceMode],
  );

  // Check if current order already matches suggestion
  const isAlreadyOrdered = useMemo(() => {
    for (let i = 0; i < adaptation.suggestedOrder.length; i++) {
      if (adaptation.suggestedOrder[i] !== i) return false;
    }
    return true;
  }, [adaptation.suggestedOrder]);

  const handleReorder = () => {
    setReorderPending(true);

    // Apply the suggested order by doing sequential reorder operations.
    // We need to map from suggested order → actual swaps.
    // Strategy: place each slide in its target position from left to right.
    const order = [...adaptation.suggestedOrder];
    const current = slides.map((_, i) => i);

    for (let target = 0; target < order.length; target++) {
      const sourceValue = order[target];
      const currentPos = current.indexOf(sourceValue);
      if (currentPos !== target) {
        reorderSlides(currentPos, target);
        // Update our tracking array
        const [moved] = current.splice(currentPos, 1);
        current.splice(target, 0, moved);
      }
    }

    setReorderPending(false);
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-[#0F0F14] rounded-xl">
      {/* Header */}
      <h3 className="text-[13px] font-bold text-white tracking-tight">
        Audience Mode
      </h3>

      {/* Mode selector */}
      <div className="flex gap-1">
        {MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => setAudienceMode(mode.value)}
            className={`flex-1 flex flex-col items-center gap-0.5 px-2 py-2 rounded-lg text-center transition-colors ${
              audienceMode === mode.value
                ? "bg-[#4361EE] text-white"
                : "bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/70"
            }`}
          >
            <span className="text-[11px] font-semibold">{mode.label}</span>
            <span className="text-[9px] opacity-60 leading-tight">
              {mode.description}
            </span>
          </button>
        ))}
      </div>

      {/* Recommendation */}
      <p className="text-[11px] text-white/50 leading-snug">
        {adaptation.recommendation}
      </p>

      {/* Emphasis hints */}
      {adaptation.emphasis.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-white/40 uppercase tracking-wider font-medium">
            Emphasis hints
          </p>
          {adaptation.emphasis.slice(0, 4).map((emph) => (
            <div
              key={emph.slideIndex}
              className="flex items-start gap-2 text-[10px] text-white/50"
            >
              <span className="text-[#4361EE] font-mono font-semibold shrink-0">
                S{emph.slideIndex + 1}
              </span>
              <span className="leading-snug">{emph.hint}</span>
            </div>
          ))}
        </div>
      )}

      {/* Reorder button */}
      <button
        type="button"
        onClick={handleReorder}
        disabled={isAlreadyOrdered || reorderPending}
        className={`w-full py-2 rounded-lg text-xs font-semibold transition-colors ${
          isAlreadyOrdered
            ? "bg-white/[0.04] text-white/30 cursor-not-allowed"
            : "bg-[#4361EE]/20 text-[#4361EE] hover:bg-[#4361EE]/30"
        }`}
      >
        {isAlreadyOrdered
          ? "Already in suggested order"
          : reorderPending
            ? "Reordering..."
            : `Reorder for ${audienceMode}`}
      </button>
    </div>
  );
}
