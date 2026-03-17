/**
 * Design Rules Engine — Scores slides 0-100 across 6 design criteria.
 *
 * Pure functions only. No React, no side effects.
 * Works on the 12-column × 6-row grid system used by the PitchIQ editor.
 */

import type { EditorBlock, BlockPosition } from "@/lib/editor/block-types";

/* ------------------------------------------------------------------ */
/*  Public Interfaces                                                  */
/* ------------------------------------------------------------------ */

export interface DesignRule {
  id: string;
  label: string;
  weight: number; // 0-1, all weights sum to 1
  score: number; // 0-100
  message?: string; // warning/suggestion text when score < 80
}

export interface DesignScore {
  overall: number; // 0-100 weighted average
  rules: DesignRule[];
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GRID_COLS = 12;
const GRID_ROWS = 6;
const CANVAS_AREA = GRID_COLS * GRID_ROWS; // 72
const CANVAS_CENTER_X = GRID_COLS / 2; // 6
const CANVAS_CENTER_Y = GRID_ROWS / 2; // 3
const EDGE_MARGIN = 0.5; // minimum margin from edges in grid units

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Return only visible (non-hidden) blocks. */
function visibleBlocks(blocks: EditorBlock[]): EditorBlock[] {
  return blocks.filter((b) => !b.hidden);
}

/** Compute the area of a block in grid units². */
function blockArea(pos: BlockPosition): number {
  return pos.width * pos.height;
}

/** Clamp a value between 0 and 100. */
function clamp100(v: number): number {
  return Math.max(0, Math.min(100, Math.round(v)));
}

/**
 * Bell-curve score centered on `center` with a given `spread`.
 * Returns 100 at the center and falls off toward 0 at the edges.
 */
function bellCurveScore(
  value: number,
  center: number,
  spread: number,
): number {
  const distance = Math.abs(value - center);
  const score = 100 * Math.exp(-((distance * distance) / (2 * spread * spread)));
  return clamp100(score);
}

/* ------------------------------------------------------------------ */
/*  Rule Implementations                                               */
/* ------------------------------------------------------------------ */

/**
 * a. Edge Margins (weight: 0.15)
 * Blocks should have >= 0.5 grid units of margin from all canvas edges.
 */
function scoreEdgeMargins(blocks: EditorBlock[]): DesignRule {
  const visible = visibleBlocks(blocks);

  if (visible.length === 0) {
    return {
      id: "edge-margins",
      label: "Edge Margins",
      weight: 0.15,
      score: 100,
    };
  }

  let violations = 0;

  for (const block of visible) {
    const { x, y, width, height } = block.position;
    const rightEdge = x + width;
    const bottomEdge = y + height;

    if (x < EDGE_MARGIN) violations++;
    if (y < EDGE_MARGIN) violations++;
    if (rightEdge > GRID_COLS - EDGE_MARGIN) violations++;
    if (bottomEdge > GRID_ROWS - EDGE_MARGIN) violations++;
  }

  // Each block can have up to 4 edge violations
  const maxViolations = visible.length * 4;
  const score = clamp100(100 - (violations / maxViolations) * 100);

  return {
    id: "edge-margins",
    label: "Edge Margins",
    weight: 0.15,
    score,
    message:
      score < 80
        ? `${violations} block edge(s) too close to the slide boundary. Add at least 0.5 units of margin.`
        : undefined,
  };
}

/**
 * b. Content Density (weight: 0.20)
 * Ideal coverage is 40-75%. Bell curve centered at 55%.
 */
function scoreContentDensity(blocks: EditorBlock[]): DesignRule {
  const visible = visibleBlocks(blocks);

  if (visible.length === 0) {
    return {
      id: "content-density",
      label: "Content Density",
      weight: 0.2,
      score: 40,
      message: "The slide is empty. Add some content.",
    };
  }

  const totalArea = visible.reduce((sum, b) => sum + blockArea(b.position), 0);
  const coverage = (totalArea / CANVAS_AREA) * 100; // percentage

  // Bell curve centered at 55% coverage, spread ~20%
  const score = bellCurveScore(coverage, 55, 20);

  let message: string | undefined;
  if (score < 80) {
    if (coverage < 25) {
      message = `Content covers only ${Math.round(coverage)}% of the slide. Consider adding more elements.`;
    } else if (coverage > 85) {
      message = `Content covers ${Math.round(coverage)}% of the slide. Consider removing elements to reduce clutter.`;
    } else {
      message = `Content density is ${Math.round(coverage)}%. Aim for 40-75% coverage for optimal readability.`;
    }
  }

  return {
    id: "content-density",
    label: "Content Density",
    weight: 0.2,
    score,
    message,
  };
}

/**
 * c. Typography Hierarchy (weight: 0.20)
 * Check heading blocks: ideal is 1-2 headings per slide.
 */
function scoreTypographyHierarchy(blocks: EditorBlock[]): DesignRule {
  const visible = visibleBlocks(blocks);
  const headings = visible.filter((b) => b.type === "heading");
  const headingCount = headings.length;

  let score: number;
  let message: string | undefined;

  if (visible.length === 0) {
    // Empty slide — neutral
    score = 50;
    message = "No content on this slide.";
  } else if (headingCount === 0) {
    score = 40;
    message = "This slide has no heading. Add a heading to establish visual hierarchy.";
  } else if (headingCount <= 2) {
    score = 100;
  } else if (headingCount === 3) {
    score = 65;
    message = "Three headings may compete for attention. Consider reducing to 1-2.";
  } else {
    // 4+ headings
    score = clamp100(30 - (headingCount - 4) * 10);
    message = `${headingCount} headings create a cluttered hierarchy. Use 1-2 headings per slide.`;
  }

  return {
    id: "typography-hierarchy",
    label: "Typography Hierarchy",
    weight: 0.2,
    score,
    message,
  };
}

/**
 * d. Color Contrast (weight: 0.10)
 * Fewer than 3 unique background colors = good. More than 4 = penalized.
 */
function scoreColorContrast(blocks: EditorBlock[]): DesignRule {
  const visible = visibleBlocks(blocks);

  const bgColors = new Set<string>();
  for (const block of visible) {
    if (block.style.backgroundColor) {
      bgColors.add(block.style.backgroundColor.toLowerCase());
    }
  }

  const uniqueCount = bgColors.size;
  let score: number;
  let message: string | undefined;

  if (uniqueCount <= 2) {
    score = 100;
  } else if (uniqueCount === 3) {
    score = 90;
  } else if (uniqueCount === 4) {
    score = 70;
    message = "4 different background colors. Consider a more cohesive palette.";
  } else {
    score = clamp100(60 - (uniqueCount - 4) * 15);
    message = `${uniqueCount} different background colors make the slide feel inconsistent. Limit to 2-3 colors.`;
  }

  return {
    id: "color-contrast",
    label: "Color Contrast",
    weight: 0.1,
    score,
    message,
  };
}

/**
 * e. Visual Balance (weight: 0.20)
 * Center-of-mass should be near canvas center (6, 3).
 * Also checks left-right area balance.
 */
function scoreVisualBalance(blocks: EditorBlock[]): DesignRule {
  const visible = visibleBlocks(blocks);

  if (visible.length === 0) {
    return {
      id: "visual-balance",
      label: "Visual Balance",
      weight: 0.2,
      score: 50,
      message: "No content to evaluate balance.",
    };
  }

  // Compute area-weighted center of mass
  let totalArea = 0;
  let weightedX = 0;
  let weightedY = 0;
  let leftArea = 0;
  let rightArea = 0;

  for (const block of visible) {
    const { x, y, width, height } = block.position;
    const area = blockArea(block.position);
    const centerX = x + width / 2;
    const centerY = y + height / 2;

    totalArea += area;
    weightedX += centerX * area;
    weightedY += centerY * area;

    // Left-right balance: split at column 6
    if (centerX < CANVAS_CENTER_X) {
      leftArea += area;
    } else {
      rightArea += area;
    }
  }

  const comX = weightedX / totalArea;
  const comY = weightedY / totalArea;

  // Distance from ideal center, normalized
  const dx = Math.abs(comX - CANVAS_CENTER_X) / CANVAS_CENTER_X; // 0-1
  const dy = Math.abs(comY - CANVAS_CENTER_Y) / CANVAS_CENTER_Y; // 0-1
  const centerScore = clamp100(100 - (dx + dy) * 50);

  // Left-right balance score
  const balanceRatio =
    totalArea > 0
      ? Math.abs(leftArea - rightArea) / totalArea
      : 0;
  const balanceScore = clamp100(100 - balanceRatio * 100);

  // Combined: 60% center of mass, 40% left-right balance
  const score = clamp100(centerScore * 0.6 + balanceScore * 0.4);

  let message: string | undefined;
  if (score < 80) {
    const direction =
      comX < CANVAS_CENTER_X - 0.5
        ? "left"
        : comX > CANVAS_CENTER_X + 0.5
          ? "right"
          : comY < CANVAS_CENTER_Y - 0.3
            ? "top"
            : "bottom";
    message = `Content is skewed toward the ${direction}. Redistribute elements for better visual balance.`;
  }

  return {
    id: "visual-balance",
    label: "Visual Balance",
    weight: 0.2,
    score,
    message,
  };
}

/**
 * f. Whitespace Ratio (weight: 0.15)
 * Checks that whitespace is evenly distributed across the canvas.
 */
function scoreWhitespaceRatio(blocks: EditorBlock[]): DesignRule {
  const visible = visibleBlocks(blocks);

  if (visible.length === 0) {
    return {
      id: "whitespace-ratio",
      label: "Whitespace Ratio",
      weight: 0.15,
      score: 60,
      message: "Empty slide — add content to improve the score.",
    };
  }

  const totalBlockArea = visible.reduce(
    (sum, b) => sum + blockArea(b.position),
    0,
  );
  const whitespaceArea = CANVAS_AREA - totalBlockArea;
  const whitespaceRatio = whitespaceArea / CANVAS_AREA;

  // Check whitespace distribution across quadrants
  // Divide canvas into 4 quadrants and compute block area in each
  const quadrantArea = [0, 0, 0, 0]; // TL, TR, BL, BR

  for (const block of visible) {
    const { x, y, width, height } = block.position;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    const area = blockArea(block.position);

    const col = centerX < CANVAS_CENTER_X ? 0 : 1;
    const row = centerY < CANVAS_CENTER_Y ? 0 : 1;
    quadrantArea[row * 2 + col] += area;
  }

  // Compute how evenly whitespace is distributed (standard deviation of quadrant fill)
  const quadrantCapacity = CANVAS_AREA / 4; // 18 each
  const quadrantFill = quadrantArea.map((a) => a / quadrantCapacity);
  const avgFill =
    quadrantFill.reduce((s, v) => s + v, 0) / quadrantFill.length;
  const variance =
    quadrantFill.reduce((s, v) => s + (v - avgFill) ** 2, 0) /
    quadrantFill.length;
  const stdDev = Math.sqrt(variance);

  // Low stdDev = evenly distributed = good
  const distributionScore = clamp100(100 - stdDev * 150);

  // Whitespace ratio score: ideal is 25-60%
  const ratioScore = bellCurveScore(whitespaceRatio * 100, 42, 18);

  // Combined
  const score = clamp100(distributionScore * 0.5 + ratioScore * 0.5);

  let message: string | undefined;
  if (score < 80) {
    if (whitespaceRatio < 0.2) {
      message =
        "Very little whitespace. Give content room to breathe by reducing block sizes or removing elements.";
    } else if (whitespaceRatio > 0.7) {
      message =
        "Too much whitespace. The slide may feel sparse — consider adding content or enlarging existing blocks.";
    } else {
      message =
        "Whitespace is unevenly distributed. Try to space elements more evenly across the slide.";
    }
  }

  return {
    id: "whitespace-ratio",
    label: "Whitespace Ratio",
    weight: 0.15,
    score,
    message,
  };
}

/* ------------------------------------------------------------------ */
/*  Main Entry Point                                                   */
/* ------------------------------------------------------------------ */

/**
 * Compute an overall design score (0-100) for a set of blocks on a single slide.
 * Returns the weighted average and per-rule breakdown.
 */
export function computeDesignScore(blocks: EditorBlock[]): DesignScore {
  const rules: DesignRule[] = [
    scoreEdgeMargins(blocks),
    scoreContentDensity(blocks),
    scoreTypographyHierarchy(blocks),
    scoreColorContrast(blocks),
    scoreVisualBalance(blocks),
    scoreWhitespaceRatio(blocks),
  ];

  const overall = clamp100(
    rules.reduce((sum, r) => sum + r.score * r.weight, 0),
  );

  return { overall, rules };
}
