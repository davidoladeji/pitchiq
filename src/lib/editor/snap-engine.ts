/**
 * Snap Engine — Magnetic alignment system for the PitchIQ editor.
 *
 * When dragging or resizing blocks, computes snap guides that align to:
 *   1. The 12-column grid lines
 *   2. Other blocks' edges and centers
 *   3. The slide's horizontal and vertical center
 *
 * Returns snap lines to render and snapped position deltas.
 */

import type { BlockPosition, EditorBlock } from "./block-types";

/* ------------------------------------------------------------------ */
/*  Configuration                                                      */
/* ------------------------------------------------------------------ */

/** How close (in % of canvas) before snapping activates */
export const SNAP_THRESHOLD = 1.5; // percentage points

/** Canvas grid dimensions */
export const GRID_COLUMNS = 12;
export const GRID_ROWS = 6;

/** Default gutter between blocks (in grid-column fractions) */
export const DEFAULT_GUTTER = 0.25; // ~2% of canvas width

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SnapGuide {
  /** "x" = vertical line, "y" = horizontal line */
  axis: "x" | "y";
  /** Position in percentage (0-100) */
  position: number;
  /** What this guide represents */
  type: "grid" | "block-edge" | "block-center" | "slide-center";
}

export interface SnapResult {
  /** Adjusted position after snapping */
  snappedPosition: BlockPosition;
  /** Active snap guides to render */
  guides: SnapGuide[];
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Convert grid units to percentage of canvas */
function gridXToPercent(x: number): number {
  return (x / GRID_COLUMNS) * 100;
}
function gridYToPercent(y: number): number {
  return (y / GRID_ROWS) * 100;
}

/** Block edges in percentage coordinates */
interface BlockEdges {
  left: number;
  right: number;
  top: number;
  bottom: number;
  centerX: number;
  centerY: number;
}

function blockToEdges(pos: BlockPosition): BlockEdges {
  const left = gridXToPercent(pos.x);
  const right = gridXToPercent(pos.x + pos.width);
  const top = gridYToPercent(pos.y);
  const bottom = gridYToPercent(pos.y + pos.height);
  return {
    left,
    right,
    top,
    bottom,
    centerX: (left + right) / 2,
    centerY: (top + bottom) / 2,
  };
}

/* ------------------------------------------------------------------ */
/*  Snap targets                                                       */
/* ------------------------------------------------------------------ */

interface SnapTarget {
  value: number; // percentage
  type: SnapGuide["type"];
}

function buildXTargets(otherBlocks: EditorBlock[], excludeId: string): SnapTarget[] {
  const targets: SnapTarget[] = [];

  // Grid column lines (0 through 12)
  for (let col = 0; col <= GRID_COLUMNS; col++) {
    targets.push({ value: gridXToPercent(col), type: "grid" });
  }

  // Slide horizontal center
  targets.push({ value: 50, type: "slide-center" });

  // Other blocks' left/right edges and centers
  for (const block of otherBlocks) {
    if (block.id === excludeId || block.hidden) continue;
    const edges = blockToEdges(block.position);
    targets.push({ value: edges.left, type: "block-edge" });
    targets.push({ value: edges.right, type: "block-edge" });
    targets.push({ value: edges.centerX, type: "block-center" });
  }

  return targets;
}

function buildYTargets(otherBlocks: EditorBlock[], excludeId: string): SnapTarget[] {
  const targets: SnapTarget[] = [];

  // Grid row lines (0 through 6)
  for (let row = 0; row <= GRID_ROWS; row++) {
    targets.push({ value: gridYToPercent(row), type: "grid" });
  }

  // Slide vertical center
  targets.push({ value: 50, type: "slide-center" });

  // Other blocks' top/bottom edges and centers
  for (const block of otherBlocks) {
    if (block.id === excludeId || block.hidden) continue;
    const edges = blockToEdges(block.position);
    targets.push({ value: edges.top, type: "block-edge" });
    targets.push({ value: edges.bottom, type: "block-edge" });
    targets.push({ value: edges.centerY, type: "block-center" });
  }

  return targets;
}

/* ------------------------------------------------------------------ */
/*  Core snap function                                                 */
/* ------------------------------------------------------------------ */

/**
 * Given a dragging block's proposed position and all other blocks on the slide,
 * compute snap-adjusted position and active guides.
 */
export function computeSnap(
  proposed: BlockPosition,
  blockId: string,
  allBlocks: EditorBlock[],
  threshold = SNAP_THRESHOLD,
): SnapResult {
  const guides: SnapGuide[] = [];
  const edges = blockToEdges(proposed);

  const xTargets = buildXTargets(allBlocks, blockId);
  const yTargets = buildYTargets(allBlocks, blockId);

  let snapDx = 0; // percentage offset to apply
  let snapDy = 0;
  let snappedX = false;
  let snappedY = false;

  // Try snapping left edge, right edge, center X
  const xEdges = [
    { value: edges.left, label: "left" as const },
    { value: edges.right, label: "right" as const },
    { value: edges.centerX, label: "center" as const },
  ];

  for (const edge of xEdges) {
    if (snappedX) break;
    for (const target of xTargets) {
      const dist = Math.abs(edge.value - target.value);
      if (dist < threshold) {
        const delta = target.value - edge.value;
        snapDx = delta;
        guides.push({ axis: "x", position: target.value, type: target.type });
        snappedX = true;
        break;
      }
    }
  }

  // Try snapping top edge, bottom edge, center Y
  const yEdges = [
    { value: edges.top, label: "top" as const },
    { value: edges.bottom, label: "bottom" as const },
    { value: edges.centerY, label: "center" as const },
  ];

  for (const edge of yEdges) {
    if (snappedY) break;
    for (const target of yTargets) {
      const dist = Math.abs(edge.value - target.value);
      if (dist < threshold) {
        const delta = target.value - edge.value;
        snapDy = delta;
        guides.push({ axis: "y", position: target.value, type: target.type });
        snappedY = true;
        break;
      }
    }
  }

  // Convert percentage offsets back to grid units
  const dxGrid = (snapDx / 100) * GRID_COLUMNS;
  const dyGrid = (snapDy / 100) * GRID_ROWS;

  const snappedPosition: BlockPosition = {
    ...proposed,
    x: Math.max(0, Math.min(GRID_COLUMNS - proposed.width, proposed.x + dxGrid)),
    y: Math.max(0, proposed.y + dyGrid),
  };

  // Round to nearest 0.25 grid unit for clean positioning
  snappedPosition.x = Math.round(snappedPosition.x * 4) / 4;
  snappedPosition.y = Math.round(snappedPosition.y * 4) / 4;

  return { snappedPosition, guides };
}

/* ------------------------------------------------------------------ */
/*  Auto-spacing helpers                                               */
/* ------------------------------------------------------------------ */

/**
 * Find blocks that are adjacent (within gutter distance) to a given block
 * on each side, and return nudge adjustments to maintain consistent gutters.
 */
export function computeAutoSpacing(
  movedBlock: EditorBlock,
  allBlocks: EditorBlock[],
  gutter = DEFAULT_GUTTER,
): Map<string, Partial<BlockPosition>> {
  const nudges = new Map<string, Partial<BlockPosition>>();
  const moved = movedBlock.position;
  const movedRight = moved.x + moved.width;
  const movedBottom = moved.y + moved.height;

  for (const other of allBlocks) {
    if (other.id === movedBlock.id || other.hidden || other.locked) continue;
    const op = other.position;
    const otherRight = op.x + op.width;
    const otherBottom = op.y + op.height;

    // Check horizontal adjacency (same row band)
    const vertOverlap =
      moved.y < otherBottom && movedBottom > op.y;

    if (vertOverlap) {
      // Other is to the right of moved block
      const gapRight = op.x - movedRight;
      if (gapRight > 0 && gapRight < gutter * 3) {
        const targetX = movedRight + gutter;
        if (Math.abs(op.x - targetX) > 0.01) {
          nudges.set(other.id, { x: targetX });
        }
      }

      // Other is to the left of moved block
      const gapLeft = moved.x - otherRight;
      if (gapLeft > 0 && gapLeft < gutter * 3) {
        const targetX = moved.x - gutter - op.width;
        if (Math.abs(op.x - targetX) > 0.01 && targetX >= 0) {
          nudges.set(other.id, { x: targetX });
        }
      }
    }

    // Check vertical adjacency (same column band)
    const horzOverlap =
      moved.x < otherRight && movedRight > op.x;

    if (horzOverlap) {
      // Other is below moved block
      const gapBelow = op.y - movedBottom;
      if (gapBelow > 0 && gapBelow < gutter * 3) {
        const targetY = movedBottom + gutter;
        if (Math.abs(op.y - targetY) > 0.01) {
          nudges.set(other.id, { ...(nudges.get(other.id) || {}), y: targetY });
        }
      }

      // Other is above moved block
      const gapAbove = moved.y - otherBottom;
      if (gapAbove > 0 && gapAbove < gutter * 3) {
        const targetY = moved.y - gutter - op.height;
        if (Math.abs(op.y - targetY) > 0.01 && targetY >= 0) {
          nudges.set(other.id, { ...(nudges.get(other.id) || {}), y: targetY });
        }
      }
    }
  }

  return nudges;
}
