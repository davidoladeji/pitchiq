"use client";

import { useMemo } from "react";
import { useEditorStore } from "./state/editorStore";
import { computeDesignScore } from "@/lib/editor/design-rules";
import type { DesignScore, DesignRule } from "@/lib/editor/design-rules";

interface SlideHealthPanelProps {
  slideIndex: number;
  slideId: string;
}

function dotColor(score: number): string {
  if (score >= 80) return "#06D6A0";
  if (score >= 60) return "#FFD166";
  return "#EF476F";
}

function FixButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="px-2 py-0.5 text-[10px] font-medium rounded bg-[#4361EE] text-white hover:bg-[#4361EE]/80 transition-colors"
    >
      {label}
    </button>
  );
}

function FailingRule({
  rule,
  slideId,
}: {
  rule: DesignRule;
  slideId: string;
}) {
  const addBlockOfType = useEditorStore((s) => s.addBlockOfType);
  const color = dotColor(rule.score);
  const msg = rule.message ?? "";
  const msgLower = msg.toLowerCase();

  function renderFix() {
    if (rule.id === "content-density") {
      if (msgLower.includes("too much") || msgLower.includes("clutter") || msgLower.includes("removing")) {
        return <FixButton label="Reduce content" onClick={() => {}} />;
      }
      if (msgLower.includes("empty") || msgLower.includes("sparse") || msgLower.includes("adding more")) {
        return <FixButton label="Add content" onClick={() => {}} />;
      }
    }

    if (rule.id === "whitespace-ratio") {
      return (
        <FixButton
          label="Add whitespace"
          onClick={() => addBlockOfType(slideId, "spacer")}
        />
      );
    }

    if (rule.id === "typography-hierarchy" && msgLower.includes("no heading")) {
      return (
        <FixButton
          label="Add heading"
          onClick={() => addBlockOfType(slideId, "heading")}
        />
      );
    }

    if (rule.id === "edge-margins") {
      return (
        <span className="text-[10px] text-white/40 italic">
          Fix margins manually
        </span>
      );
    }

    return null;
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: color }}
          />
          <span className="text-[11px] text-white/70 font-medium">
            {rule.label}
          </span>
        </div>
        <span
          className="text-[11px] font-mono font-semibold"
          style={{ color }}
        >
          {Math.round(rule.score)}
        </span>
      </div>
      {msg && (
        <p className="text-[10px] text-white/40 leading-tight pl-3">{msg}</p>
      )}
      <div className="pl-3">{renderFix()}</div>
    </div>
  );
}

export default function SlideHealthPanel({
  slideIndex,
  slideId,
}: SlideHealthPanelProps) {
  const slideBlocks = useEditorStore((s) => s.slideBlocks);
  const slideBlockOrder = useEditorStore((s) => s.slideBlockOrder);
  const selectedSlideIndex = useEditorStore((s) => s.selectedSlideIndex);

  const designScore: DesignScore = useMemo(() => {
    const blockMap = slideBlocks[slideId] || {};
    const order = slideBlockOrder[slideId] || [];
    const orderedBlocks = order.map((id) => blockMap[id]).filter(Boolean);
    if (orderedBlocks.length === 0) return { overall: 50, rules: [] };
    return computeDesignScore(orderedBlocks);
  }, [slideId, slideBlocks, slideBlockOrder]);

  const isSelected = selectedSlideIndex === slideIndex;
  const overall = designScore.overall;
  const color = dotColor(overall);

  const failingRules = useMemo(
    () => designScore.rules.filter((r: DesignRule) => r.score < 80),
    [designScore.rules],
  );

  return (
    <>
      {/* Score dot overlay — 8x8 positioned absolutely */}
      <span
        className="absolute top-1 right-1 w-2 h-2 rounded-full z-10"
        style={{ backgroundColor: color }}
        title={`Design score: ${Math.round(overall)}`}
      />

      {/* Expanded panel when selected and score < 80 */}
      {isSelected && overall < 80 && failingRules.length > 0 && (
        <div className="mt-1.5 w-full rounded-lg bg-[#1A1A24] border border-white/10 p-3 space-y-2">
          {/* Header with numeric score */}
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-white/60">
              Design Score
            </span>
            <span
              className="text-sm font-mono font-bold"
              style={{ color }}
            >
              {Math.round(overall)}
            </span>
          </div>

          <div className="w-full h-px bg-white/10" />

          {/* Failing rules */}
          <div className="space-y-2">
            {failingRules.map((rule: DesignRule) => (
              <FailingRule key={rule.id} rule={rule} slideId={slideId} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
