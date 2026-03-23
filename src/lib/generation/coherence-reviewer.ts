import type { SlideData } from "@/lib/types";
import type { DeckNarrative } from "./narrative-architect";
import type { VisualSystem } from "./visual-system";

/* ------------------------------------------------------------------ */
/*  Coherence Reviewer — checks and fixes deck-level quality           */
/* ------------------------------------------------------------------ */

export interface CoherenceIssue {
  type: "repetitive-layout" | "density-fatigue" | "missing-variety" | "weak-opening"
    | "weak-close" | "color-monotony" | "pacing-issue";
  slideIndices: number[];
  description: string;
  suggestion: string;
}

export interface CoherenceResult {
  issues: CoherenceIssue[];
  adjustedSlides: SlideData[];
}

export async function reviewDeckCoherence(
  slides: SlideData[],
  narrative: DeckNarrative,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  _visualSystem: VisualSystem,
): Promise<CoherenceResult> {
  const issues: CoherenceIssue[] = [];
  const adjusted = slides.map((s) => ({ ...s }));

  // Check 1: No consecutive same-type slides (except content)
  checkConsecutiveTypes(adjusted, issues);

  // Check 2: Density rhythm — no more than 2 data-dense slides in a row
  checkDensityRhythm(adjusted, narrative, issues);

  // Check 3: Visual peaks are spread across the deck
  checkVisualPeakDistribution(adjusted, issues);

  // Check 4: Opening strength
  checkOpeningStrength(adjusted, issues);

  // Check 5: Closing strength
  checkClosingStrength(adjusted, issues);

  // Check 6: Slide type variety
  checkTypeVariety(adjusted, issues);

  // Check 7: Accent distribution (3-5 spread across deck)
  checkAccentDistribution(adjusted, issues);

  return { issues, adjustedSlides: adjusted };
}

/* ------------------------------------------------------------------ */
/*  Individual Checks                                                  */
/* ------------------------------------------------------------------ */

function checkConsecutiveTypes(slides: SlideData[], issues: CoherenceIssue[]): void {
  for (let i = 1; i < slides.length; i++) {
    if (slides[i].type === slides[i - 1].type && slides[i].type !== "content") {
      issues.push({
        type: "repetitive-layout",
        slideIndices: [i - 1, i],
        description: `Slides ${i} and ${i + 1} are both type "${slides[i].type}"`,
        suggestion: "Consider varying the slide type for visual diversity",
      });
    }
  }
}

function checkDensityRhythm(slides: SlideData[], narrative: DeckNarrative, issues: CoherenceIssue[]): void {
  const DATA_DENSE_TYPES = new Set(["chart", "metrics", "table", "stats"]);
  let consecutive = 0;

  for (let i = 0; i < slides.length; i++) {
    if (DATA_DENSE_TYPES.has(slides[i].type)) {
      consecutive++;
      if (consecutive > 2) {
        issues.push({
          type: "density-fatigue",
          slideIndices: [i - 2, i - 1, i],
          description: `3+ data-dense slides in a row (slides ${i - 1} to ${i + 1})`,
          suggestion: "Insert a visual breather between data-heavy slides",
        });

        // Auto-fix: if it's a content slide equivalent, swap layout to splash
        if (slides[i].type === "content" || slides[i].type === "stats") {
          slides[i].layout = "centered";
          slides[i].accent = true;
        }
      }
    } else {
      consecutive = 0;
    }
  }
  void narrative; // Used for context in advanced checks
}

function checkVisualPeakDistribution(slides: SlideData[], issues: CoherenceIssue[]): void {
  const peakIndices = slides.map((s, i) => s.accent ? i : -1).filter((i) => i >= 0);

  if (peakIndices.length < 3) {
    issues.push({
      type: "pacing-issue",
      slideIndices: peakIndices,
      description: `Only ${peakIndices.length} accent slides — deck may feel flat`,
      suggestion: "Add accent to 3-5 slides at key narrative moments",
    });

    // Auto-fix: add accents at key positions
    const targetPositions = [0, Math.floor(slides.length * 0.35), Math.floor(slides.length * 0.7), slides.length - 1];
    for (const pos of targetPositions) {
      if (pos < slides.length && !slides[pos].accent) {
        slides[pos].accent = true;
      }
    }
  }

  // Check clustering: no 2 consecutive accents
  for (let i = 1; i < slides.length; i++) {
    if (slides[i].accent && slides[i - 1].accent) {
      issues.push({
        type: "color-monotony",
        slideIndices: [i - 1, i],
        description: `Consecutive accent slides at positions ${i} and ${i + 1}`,
        suggestion: "Spread accents across the deck, not clustered",
      });
      // Auto-fix: remove accent from the less important one
      if (slides[i].type === "content") {
        slides[i].accent = false;
      }
    }
  }
}

function checkOpeningStrength(slides: SlideData[], issues: CoherenceIssue[]): void {
  if (slides.length > 0 && !slides[0].accent) {
    issues.push({
      type: "weak-opening",
      slideIndices: [0],
      description: "Opening slide is not an accent/visual-peak slide",
      suggestion: "First slide should be visually impactful",
    });
    slides[0].accent = true;
  }
}

function checkClosingStrength(slides: SlideData[], issues: CoherenceIssue[]): void {
  if (slides.length > 1) {
    const lastIdx = slides.length - 1;
    const last = slides[lastIdx];
    if (last.type !== "cta" && last.type !== "content") {
      issues.push({
        type: "weak-close",
        slideIndices: [lastIdx],
        description: "Last slide is not a CTA or closing statement",
        suggestion: "End with a clear call to action",
      });
    }
  }
}

function checkTypeVariety(slides: SlideData[], issues: CoherenceIssue[]): void {
  const types = new Set(slides.map((s) => s.type));
  if (types.size < 4) {
    issues.push({
      type: "missing-variety",
      slideIndices: [],
      description: `Only ${types.size} different slide types used`,
      suggestion: "Use at least 5 different slide types for visual diversity",
    });
  }
}

function checkAccentDistribution(slides: SlideData[], issues: CoherenceIssue[]): void {
  const accentCount = slides.filter((s) => s.accent).length;

  if (accentCount > 6) {
    // Too many accents — remove from less important slides
    issues.push({
      type: "color-monotony",
      slideIndices: [],
      description: `Too many accent slides (${accentCount}) — diminishes impact`,
      suggestion: "Keep accent slides to 3-5 for maximum impact",
    });

    // Auto-fix: keep first, last, and a few in the middle
    const keepPositions = new Set([0, Math.floor(slides.length * 0.35), Math.floor(slides.length * 0.7), slides.length - 1]);
    let removed = 0;
    for (let i = 0; i < slides.length; i++) {
      if (slides[i].accent && !keepPositions.has(i) && accentCount - removed > 5) {
        slides[i].accent = false;
        removed++;
      }
    }
  }
}
