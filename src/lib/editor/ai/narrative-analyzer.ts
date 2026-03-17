/**
 * Narrative Arc Analyzer — Heuristic-based pitch deck story arc analysis.
 *
 * Reads all slides and their blocks from the store and maps them to the
 * canonical pitch deck narrative arc:
 *   Hook → Problem → Solution → Traction → Market → Business Model → Team → Ask
 *
 * Uses block types, heading text, and keyword matching (no LLM calls).
 * Returns a NarrativeReport with per-section status, slide mapping,
 * and actionable suggestions.
 */

import type { EditorBlock, BlocksRecord } from "@/lib/editor/block-types";
import type {
  HeadingBlockData,
  TextBlockData,
  MetricBlockData,
  ChartBlockData,
  TeamMemberBlockData,
  FunnelBlockData,
  ComparisonRowBlockData,
  BulletListBlockData,
  CalloutBlockData,
} from "@/lib/editor/block-types";
import type { SlideData } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Public Types                                                       */
/* ------------------------------------------------------------------ */

export type NarrativeSectionId =
  | "hook"
  | "problem"
  | "solution"
  | "traction"
  | "market"
  | "business-model"
  | "team"
  | "ask";

export type SectionStatus = "complete" | "weak" | "missing";

export interface NarrativeSection {
  id: NarrativeSectionId;
  label: string;
  status: SectionStatus;
  slideIndex: number | null; // which slide covers this section (null = missing)
  confidence: number; // 0-1 confidence in the classification
  suggestions: string[];
  /** Layout ID to use when auto-creating this section */
  defaultLayoutId: string;
  /** Default slide type */
  defaultSlideType: SlideData["type"];
}

export interface NarrativeReport {
  sections: NarrativeSection[];
  completeness: number; // 0-100 percentage of arc covered
  gaps: NarrativeSectionId[]; // sections that are missing
  suggestions: string[];
}

/* ------------------------------------------------------------------ */
/*  Section Definitions + Keywords                                     */
/* ------------------------------------------------------------------ */

interface SectionDef {
  id: NarrativeSectionId;
  label: string;
  /** Keywords in heading/text that signal this section. Case-insensitive. */
  keywords: string[];
  /** Block types that strongly signal this section. */
  signalBlockTypes: string[];
  /** Slide types that map to this section. */
  slideTypes: string[];
  /** Fallback layout to create when adding this section. */
  defaultLayoutId: string;
  defaultSlideType: SlideData["type"];
}

const SECTION_DEFS: SectionDef[] = [
  {
    id: "hook",
    label: "Hook",
    keywords: [
      "what if", "imagine", "introducing", "the future", "welcome",
      "revolutioniz", "disrupting", "rethink", "vision", "mission",
      "our mission", "our vision", "one-liner", "elevator",
    ],
    signalBlockTypes: [],
    slideTypes: ["title"],
    defaultLayoutId: "title-bold",
    defaultSlideType: "title",
  },
  {
    id: "problem",
    label: "Problem",
    keywords: [
      "problem", "pain point", "challenge", "frustrat", "broken",
      "today's", "current state", "status quo", "why now", "gap",
      "inefficien", "costly", "expensive", "failing", "outdated",
    ],
    signalBlockTypes: ["callout"],
    slideTypes: ["content"],
    defaultLayoutId: "content-single",
    defaultSlideType: "content",
  },
  {
    id: "solution",
    label: "Solution",
    keywords: [
      "solution", "how it works", "our approach", "product", "platform",
      "feature", "demo", "workflow", "how we", "what we do",
      "our product", "technology", "key features", "capabilities",
    ],
    signalBlockTypes: ["device-mockup", "video-embed"],
    slideTypes: ["content"],
    defaultLayoutId: "content-two-col",
    defaultSlideType: "content",
  },
  {
    id: "traction",
    label: "Traction",
    keywords: [
      "traction", "growth", "revenue", "arr", "mrr", "users", "customer",
      "retention", "metric", "kpi", "milestone", "achievement",
      "progress", "momentum", "year over year", "yoy", "mom",
      "testimonial", "case study", "logo", "client",
    ],
    signalBlockTypes: ["metric", "metric-grid", "chart", "progress", "logo-grid", "timeline-item"],
    slideTypes: ["metrics", "stats"],
    defaultLayoutId: "data-metrics",
    defaultSlideType: "metrics",
  },
  {
    id: "market",
    label: "Market",
    keywords: [
      "market", "tam", "sam", "som", "addressable", "opportunity",
      "market size", "billion", "trillion", "industry", "segment",
      "target market", "total addressable", "serviceable",
    ],
    signalBlockTypes: ["funnel"],
    slideTypes: [],
    defaultLayoutId: "data-chart-full",
    defaultSlideType: "chart",
  },
  {
    id: "business-model",
    label: "Business Model",
    keywords: [
      "business model", "revenue model", "pricing", "monetiz", "unit economics",
      "ltv", "cac", "margin", "subscription", "saas", "freemium",
      "how we make money", "pricing tier", "plan", "enterprise",
      "go-to-market", "gtm", "distribution", "channel",
    ],
    signalBlockTypes: ["table", "comparison-row"],
    slideTypes: ["comparison"],
    defaultLayoutId: "data-comparison",
    defaultSlideType: "comparison",
  },
  {
    id: "team",
    label: "Team",
    keywords: [
      "team", "founder", "co-founder", "advisor", "leadership",
      "our team", "management", "executive", "ceo", "cto", "cfo",
      "board", "experience", "background",
    ],
    signalBlockTypes: ["team-member"],
    slideTypes: ["team"],
    defaultLayoutId: "team-grid",
    defaultSlideType: "team",
  },
  {
    id: "ask",
    label: "The Ask",
    keywords: [
      "ask", "fundrais", "raising", "investment", "funding", "round",
      "seeking", "seed", "series", "use of funds", "how we'll use",
      "next steps", "call to action", "join us", "contact",
      "get in touch", "let's talk", "thank you", "questions",
    ],
    signalBlockTypes: [],
    slideTypes: ["cta"],
    defaultLayoutId: "title-centered",
    defaultSlideType: "cta",
  },
];

/* ------------------------------------------------------------------ */
/*  Text Extraction                                                    */
/* ------------------------------------------------------------------ */

/** Extract all text content from a slide's blocks as a single lowercase string. */
function extractSlideText(blocks: EditorBlock[]): string {
  const parts: string[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "heading":
        parts.push((block.data as HeadingBlockData).text);
        break;
      case "text":
        parts.push((block.data as TextBlockData).text);
        break;
      case "bullet-list":
        parts.push(...(block.data as BulletListBlockData).items);
        break;
      case "callout":
        parts.push((block.data as CalloutBlockData).text);
        break;
      case "metric":
        parts.push((block.data as MetricBlockData).label);
        break;
      case "chart":
        parts.push((block.data as ChartBlockData).yAxisLabel || "");
        parts.push(...(block.data as ChartBlockData).data.map((d) => d.label));
        break;
      case "team-member":
        parts.push((block.data as TeamMemberBlockData).name);
        parts.push((block.data as TeamMemberBlockData).role);
        break;
      case "funnel":
        parts.push(...(block.data as FunnelBlockData).stages.map((s) => s.label));
        break;
      case "comparison-row": {
        const cr = block.data as ComparisonRowBlockData;
        parts.push(cr.label, cr.us, cr.them);
        break;
      }
    }
  }

  return parts.join(" ").toLowerCase();
}

/** Get the heading text from a slide's blocks (the first heading block). */
function getHeadingText(blocks: EditorBlock[]): string {
  const heading = blocks.find((b) => b.type === "heading");
  if (heading) return (heading.data as HeadingBlockData).text.toLowerCase();
  return "";
}

/** Get block type counts for a slide. */
function getBlockTypeCounts(blocks: EditorBlock[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const block of blocks) {
    counts[block.type] = (counts[block.type] || 0) + 1;
  }
  return counts;
}

/* ------------------------------------------------------------------ */
/*  Scoring                                                            */
/* ------------------------------------------------------------------ */

interface SlideScore {
  slideIndex: number;
  confidence: number;
}

/**
 * Score a single slide against a section definition.
 * Returns a confidence value 0-1.
 */
function scoreSlideForSection(
  def: SectionDef,
  blocks: EditorBlock[],
  slide: SlideData,
): number {
  let score = 0;

  // 1. Slide type match (strong signal)
  if (def.slideTypes.includes(slide.type)) {
    score += 0.3;
  }

  // 2. Signal block types present
  const typeCounts = getBlockTypeCounts(blocks);
  for (const bt of def.signalBlockTypes) {
    if (typeCounts[bt]) {
      score += 0.2;
      break; // one match is enough
    }
  }

  // 3. Keyword matching in text
  const text = extractSlideText(blocks);
  const heading = getHeadingText(blocks);
  let keywordHits = 0;
  let headingHit = false;

  for (const kw of def.keywords) {
    if (heading.includes(kw)) {
      headingHit = true;
      keywordHits++;
    } else if (text.includes(kw)) {
      keywordHits++;
    }
  }

  // Heading keyword match is worth more
  if (headingHit) score += 0.35;
  if (keywordHits > 0) score += Math.min(0.3, keywordHits * 0.1);

  // 4. Slide title fallback (legacy data)
  const title = (slide.title || "").toLowerCase();
  for (const kw of def.keywords) {
    if (title.includes(kw)) {
      score += 0.2;
      break;
    }
  }

  return Math.min(1, score);
}

/* ------------------------------------------------------------------ */
/*  Main Analyzer                                                      */
/* ------------------------------------------------------------------ */

export interface AnalyzerInput {
  slides: SlideData[];
  slideBlocks: Record<string, BlocksRecord>;
  slideBlockOrder: Record<string, string[]>;
}

/**
 * Analyze the pitch deck's narrative arc.
 * Pure function — reads state snapshot, returns report.
 */
export function analyzeNarrativeArc(input: AnalyzerInput): NarrativeReport {
  const { slides, slideBlocks, slideBlockOrder } = input;

  // Build ordered block arrays per slide
  const slideBlockArrays: EditorBlock[][] = slides.map((slide) => {
    const sid = slide.id || "";
    const order = slideBlockOrder[sid] || [];
    const blocks = slideBlocks[sid] || {};
    return order.map((id) => blocks[id]).filter(Boolean) as EditorBlock[];
  });

  // Score every slide against every section
  const sections: NarrativeSection[] = SECTION_DEFS.map((def) => {
    let bestScore: SlideScore = { slideIndex: -1, confidence: 0 };

    for (let i = 0; i < slides.length; i++) {
      const conf = scoreSlideForSection(def, slideBlockArrays[i], slides[i]);
      if (conf > bestScore.confidence) {
        bestScore = { slideIndex: i, confidence: conf };
      }
    }

    // Determine status
    let status: SectionStatus;
    if (bestScore.confidence >= 0.4) {
      status = "complete";
    } else if (bestScore.confidence >= 0.2) {
      status = "weak";
    } else {
      status = "missing";
    }

    // Generate suggestions
    const suggestions: string[] = [];
    if (status === "missing") {
      suggestions.push(`Add a "${def.label}" slide to strengthen your narrative arc.`);
    } else if (status === "weak") {
      suggestions.push(
        `Your "${def.label}" section could be stronger. Consider adding more supporting content.`,
      );
    }

    // Section-specific suggestions
    if (status !== "complete") {
      switch (def.id) {
        case "hook":
          suggestions.push("Start with a bold statement or question that captures attention.");
          break;
        case "problem":
          suggestions.push("Quantify the problem to make it feel urgent and real.");
          break;
        case "solution":
          suggestions.push("Show, don't tell — add a product screenshot or demo video.");
          break;
        case "traction":
          suggestions.push("Add key metrics: revenue, users, growth rate, retention.");
          break;
        case "market":
          suggestions.push("Include TAM/SAM/SOM breakdown with credible data sources.");
          break;
        case "business-model":
          suggestions.push("Show pricing tiers or unit economics (LTV, CAC, margins).");
          break;
        case "team":
          suggestions.push("Highlight relevant experience and why your team is uniquely qualified.");
          break;
        case "ask":
          suggestions.push("Be specific about the amount, use of funds, and timeline.");
          break;
      }
    }

    return {
      id: def.id,
      label: def.label,
      status,
      slideIndex: bestScore.confidence >= 0.2 ? bestScore.slideIndex : null,
      confidence: bestScore.confidence,
      suggestions,
      defaultLayoutId: def.defaultLayoutId,
      defaultSlideType: def.defaultSlideType,
    };
  });

  // Compute completeness
  const completeSections = sections.filter((s) => s.status === "complete").length;
  const weakSections = sections.filter((s) => s.status === "weak").length;
  const completeness = Math.round(
    ((completeSections + weakSections * 0.5) / sections.length) * 100,
  );

  // Gaps
  const gaps = sections
    .filter((s) => s.status === "missing")
    .map((s) => s.id);

  // Top-level suggestions
  const topSuggestions: string[] = [];
  if (gaps.length === 0) {
    topSuggestions.push("Your narrative arc covers all key sections. Refine each for maximum impact.");
  } else if (gaps.length <= 2) {
    topSuggestions.push(
      `Almost complete — add ${gaps.map((g) => `"${SECTION_DEFS.find((d) => d.id === g)?.label}"`).join(" and ")} to close the narrative.`,
    );
  } else {
    topSuggestions.push(
      `${gaps.length} sections are missing. Investors expect a complete story arc — prioritize adding the missing sections.`,
    );
  }

  // Order-based suggestion
  const coveredIndices = sections
    .filter((s) => s.slideIndex !== null)
    .map((s) => ({ id: s.id, index: s.slideIndex as number }));
  coveredIndices.sort((a, b) => a.index - b.index);

  // Check if sections are in canonical order
  const canonicalOrder = SECTION_DEFS.map((d) => d.id);
  let outOfOrder = false;
  for (let i = 1; i < coveredIndices.length; i++) {
    const prevRank = canonicalOrder.indexOf(coveredIndices[i - 1].id);
    const currRank = canonicalOrder.indexOf(coveredIndices[i].id);
    if (currRank < prevRank) {
      outOfOrder = true;
      break;
    }
  }
  if (outOfOrder) {
    topSuggestions.push(
      "Consider reordering slides to follow the standard arc: Hook → Problem → Solution → Traction → Market → Business Model → Team → Ask.",
    );
  }

  return {
    sections,
    completeness,
    gaps,
    suggestions: topSuggestions,
  };
}
