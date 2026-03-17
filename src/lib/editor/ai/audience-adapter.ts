/**
 * Audience Adaptation Engine — Suggests slide ordering and per-slide emphasis
 * hints based on the target audience mode.
 *
 * Three audience modes:
 *   - investor: Traction → Market → Team → Ask prioritized
 *   - customer: Solution → Pricing → Testimonials prioritized
 *   - partner:  Solution → Market → Team prioritized
 *
 * Does NOT auto-reorder — returns suggestions that the user confirms.
 */

import type { EditorBlock } from "@/lib/editor/block-types";
import {
  analyzeNarrativeArc,
  type NarrativeSectionId,
  type AnalyzerInput,
} from "./narrative-analyzer";

/* ------------------------------------------------------------------ */
/*  Public Types                                                       */
/* ------------------------------------------------------------------ */

export type AudienceMode = "investor" | "customer" | "partner";

export interface SlideEmphasis {
  slideIndex: number;
  /** Block IDs that should be visually emphasized (e.g., larger, highlighted). */
  emphasizeBlockIds: string[];
  /** Short hint for the user. */
  hint: string;
}

export interface AudienceAdaptation {
  mode: AudienceMode;
  /** Suggested slide order (array of slide indices in the original array). */
  suggestedOrder: number[];
  /** Per-slide emphasis hints. */
  emphasis: SlideEmphasis[];
  /** Overall recommendation text. */
  recommendation: string;
}

/* ------------------------------------------------------------------ */
/*  Priority Orderings                                                 */
/* ------------------------------------------------------------------ */

const AUDIENCE_PRIORITIES: Record<AudienceMode, NarrativeSectionId[]> = {
  investor: [
    "hook", "problem", "solution", "traction", "market", "business-model", "team", "ask",
  ],
  customer: [
    "hook", "problem", "solution", "business-model", "traction", "market", "team", "ask",
  ],
  partner: [
    "hook", "solution", "market", "traction", "team", "business-model", "problem", "ask",
  ],
};

/** Block types to emphasize per audience mode. */
const EMPHASIS_BLOCK_TYPES: Record<AudienceMode, string[]> = {
  investor: ["metric", "metric-grid", "chart", "funnel", "progress", "timeline-item"],
  customer: ["device-mockup", "video-embed", "image", "quote", "comparison-row", "table"],
  partner: ["team-member", "logo-grid", "chart", "card-group"],
};

/** Audience-specific recommendations. */
const RECOMMENDATIONS: Record<AudienceMode, string> = {
  investor:
    "Investor mode prioritizes traction, market size, and team credibility. Lead with strong metrics and end with a clear ask.",
  customer:
    "Customer mode puts your solution front and center. Show the product early, followed by pricing and social proof.",
  partner:
    "Partner mode emphasizes your solution, market reach, and team. Show why a partnership creates mutual value.",
};

/* ------------------------------------------------------------------ */
/*  Adaptation Engine                                                  */
/* ------------------------------------------------------------------ */

/**
 * Given the current deck state and an audience mode, compute a suggested
 * slide reordering and per-slide emphasis hints.
 */
export function computeAudienceAdaptation(
  input: AnalyzerInput,
  mode: AudienceMode,
): AudienceAdaptation {
  const { slides, slideBlocks, slideBlockOrder } = input;

  // Run narrative analysis to map slides to sections
  const report = analyzeNarrativeArc(input);
  const priority = AUDIENCE_PRIORITIES[mode];
  const emphasisTypes = EMPHASIS_BLOCK_TYPES[mode];

  // Build a mapping: sectionId → slideIndex
  const sectionToSlide = new Map<NarrativeSectionId, number>();
  for (const section of report.sections) {
    if (section.slideIndex !== null) {
      sectionToSlide.set(section.id, section.slideIndex);
    }
  }

  // Build suggested order:
  // 1. Place slides in the priority order for mapped sections
  // 2. Append any unmapped slides in their original order
  const orderedIndices: number[] = [];
  const usedIndices = new Set<number>();

  for (const sectionId of priority) {
    const idx = sectionToSlide.get(sectionId);
    if (idx !== undefined && !usedIndices.has(idx)) {
      orderedIndices.push(idx);
      usedIndices.add(idx);
    }
  }

  // Append remaining slides
  for (let i = 0; i < slides.length; i++) {
    if (!usedIndices.has(i)) {
      orderedIndices.push(i);
    }
  }

  // Compute per-slide emphasis
  const emphasis: SlideEmphasis[] = [];

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const sid = slide.id || "";
    const order = slideBlockOrder[sid] || [];
    const blocks = slideBlocks[sid] || {};
    const blockArray = order.map((id) => blocks[id]).filter(Boolean) as EditorBlock[];

    // Find blocks of emphasis types
    const emphBlocks = blockArray.filter((b) => emphasisTypes.includes(b.type));

    if (emphBlocks.length > 0) {
      const hint = getEmphasisHint(mode, emphBlocks);
      emphasis.push({
        slideIndex: i,
        emphasizeBlockIds: emphBlocks.map((b) => b.id),
        hint,
      });
    }
  }

  return {
    mode,
    suggestedOrder: orderedIndices,
    emphasis,
    recommendation: RECOMMENDATIONS[mode],
  };
}

/** Generate a human-readable emphasis hint. */
function getEmphasisHint(mode: AudienceMode, blocks: EditorBlock[]): string {
  const types = Array.from(new Set(blocks.map((b) => b.type)));

  switch (mode) {
    case "investor":
      if (types.includes("metric") || types.includes("metric-grid")) {
        return "Highlight these metrics — investors look for traction signals.";
      }
      if (types.includes("chart")) {
        return "Make this chart prominent — growth trends are key for investors.";
      }
      if (types.includes("timeline-item")) {
        return "Emphasize milestones to show execution capability.";
      }
      return "Emphasize data-driven content for investors.";

    case "customer":
      if (types.includes("device-mockup") || types.includes("video-embed")) {
        return "Lead with product visuals — show customers what they'll use.";
      }
      if (types.includes("comparison-row") || types.includes("table")) {
        return "Make pricing/comparison visible — customers need to evaluate value.";
      }
      if (types.includes("quote")) {
        return "Social proof builds trust — make testimonials prominent.";
      }
      return "Emphasize product and value proposition for customers.";

    case "partner":
      if (types.includes("team-member")) {
        return "Highlight the team — partners want to know who they'll work with.";
      }
      if (types.includes("logo-grid")) {
        return "Show existing partnerships to build credibility.";
      }
      if (types.includes("chart")) {
        return "Market data validates the opportunity for potential partners.";
      }
      return "Emphasize market reach and team for partners.";
  }
}
