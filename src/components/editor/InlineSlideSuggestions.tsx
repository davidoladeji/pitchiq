"use client";

import { useMemo, useState } from "react";
import { useEditorStore } from "./state/editorStore";
import { computeDesignScore, type DesignRule } from "@/lib/editor/design-rules";
import {
  analyzeNarrativeArc,
  type NarrativeSection,
} from "@/lib/editor/ai/narrative-analyzer";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Suggestion {
  id: string;
  icon: "design" | "narrative" | "tip";
  text: string;
  severity: "warning" | "info";
}

/* ------------------------------------------------------------------ */
/*  Icons                                                              */
/* ------------------------------------------------------------------ */

function SuggestionIcon({ type }: { type: Suggestion["icon"] }) {
  const cls = "w-3.5 h-3.5 shrink-0";

  if (type === "design") {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    );
  }

  if (type === "narrative") {
    return (
      <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M12 20h9M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    );
  }

  // tip
  return (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Dismiss (X) button                                                 */
/* ------------------------------------------------------------------ */

function DismissButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className="
        min-w-[44px] min-h-[44px] flex items-center justify-center
        -mr-2 -my-1 shrink-0
        text-white/30 hover:text-white/60
        transition-colors motion-reduce:transition-none
        rounded
      "
      aria-label="Dismiss suggestion"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
        <path d="M18 6L6 18M6 6l12 12" />
      </svg>
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  Suggestion generation (pure, no API calls)                         */
/* ------------------------------------------------------------------ */

function generateSuggestions(
  slideIndex: number,
  state: {
    slides: ReturnType<typeof useEditorStore.getState>["slides"];
    slideBlocks: ReturnType<typeof useEditorStore.getState>["slideBlocks"];
    slideBlockOrder: ReturnType<typeof useEditorStore.getState>["slideBlockOrder"];
  },
): Suggestion[] {
  const slide = state.slides[slideIndex];
  if (!slide) return [];

  const slideId = slide.id || "";
  const suggestions: Suggestion[] = [];

  /* ---- Design rules ---- */
  const order = state.slideBlockOrder[slideId] || [];
  const blocksMap = state.slideBlocks[slideId] || {};
  const blocks = order
    .map((id) => blocksMap[id])
    .filter(Boolean);

  if (blocks.length > 0) {
    const designScore = computeDesignScore(blocks);

    // Pick the worst-scoring rule that has a message (max 1 design suggestion)
    const worstRule = designScore.rules
      .filter((r): r is DesignRule & { message: string } => !!r.message && r.score < 80)
      .sort((a, b) => a.score - b.score)[0];

    if (worstRule) {
      suggestions.push({
        id: `design-${worstRule.id}`,
        icon: "design",
        text: worstRule.message,
        severity: worstRule.score < 50 ? "warning" : "info",
      });
    }
  }

  /* ---- Narrative arc ---- */
  const narrative = analyzeNarrativeArc({
    slides: state.slides,
    slideBlocks: state.slideBlocks,
    slideBlockOrder: state.slideBlockOrder,
  });

  // Find sections mapped to the current slide that are weak
  const currentSlideSection = narrative.sections.find(
    (s): s is NarrativeSection & { slideIndex: number } =>
      s.slideIndex === slideIndex && s.status === "weak",
  );

  if (currentSlideSection && currentSlideSection.suggestions.length > 0) {
    suggestions.push({
      id: `narrative-${currentSlideSection.id}`,
      icon: "narrative",
      text: currentSlideSection.suggestions[0],
      severity: "info",
    });
  }

  // If no narrative suggestion for this slide yet, check for missing sections
  // and suggest adding them if the current slide is the last one
  if (
    !currentSlideSection &&
    suggestions.length < 2 &&
    slideIndex === state.slides.length - 1 &&
    narrative.gaps.length > 0
  ) {
    const firstGap = narrative.sections.find(
      (s) => s.status === "missing",
    );
    if (firstGap && firstGap.suggestions.length > 0) {
      suggestions.push({
        id: `narrative-gap-${firstGap.id}`,
        icon: "narrative",
        text: firstGap.suggestions[0],
        severity: "info",
      });
    }
  }

  // If slide has no blocks at all, give a tip
  if (blocks.length === 0 && suggestions.length === 0) {
    suggestions.push({
      id: "tip-empty",
      icon: "tip",
      text: "This slide is empty. Add a heading and supporting content to get started.",
      severity: "info",
    });
  }

  // Cap at 2 suggestions
  return suggestions.slice(0, 2);
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function InlineSlideSuggestions() {
  const selectedSlideIndex = useEditorStore((s) => s.selectedSlideIndex);
  const slides = useEditorStore((s) => s.slides);
  const slideBlocks = useEditorStore((s) => s.slideBlocks);
  const slideBlockOrder = useEditorStore((s) => s.slideBlockOrder);

  // Track dismissed suggestion IDs for this session
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  // Reset dismissed set when slide changes
  // (but keep dismissed items for the session — only reset the generation key)
  const suggestions = useMemo(
    () =>
      generateSuggestions(selectedSlideIndex, {
        slides,
        slideBlocks,
        slideBlockOrder,
      }),
    [selectedSlideIndex, slides, slideBlocks, slideBlockOrder],
  );

  const visible = suggestions.filter((s) => !dismissed.has(s.id));

  // When slide changes, allow re-showing suggestions for new slide context
  // We keep dismissed IDs persistent for the session so revisiting a slide
  // won't re-show what was already dismissed.

  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5 px-4 pb-3 pt-2 max-w-[960px] mx-auto w-full">
      {visible.map((suggestion) => (
        <div
          key={suggestion.id}
          className="
            flex items-center gap-2.5 px-3 py-2
            bg-white/[0.04] border border-white/[0.08] rounded-lg
            transition-opacity motion-reduce:transition-none
            animate-in fade-in slide-in-from-top-1 duration-200
          "
        >
          {/* Icon */}
          <span
            className={
              suggestion.severity === "warning"
                ? "text-[#FFD166]"
                : "text-[#4361EE]"
            }
          >
            <SuggestionIcon type={suggestion.icon} />
          </span>

          {/* Text */}
          <span className="text-xs leading-relaxed text-white/50 flex-1 min-w-0">
            {suggestion.text}
          </span>

          {/* Dismiss */}
          <DismissButton
            onClick={() =>
              setDismissed((prev) => new Set(prev).add(suggestion.id))
            }
          />
        </div>
      ))}
    </div>
  );
}
