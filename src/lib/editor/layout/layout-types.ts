/**
 * Layout Blueprint Type System — defines the structure for slide layout presets.
 *
 * Each layout is a CSS Grid template-areas string with named zones.
 * Zones map to suggested block types and grid positions.
 */

import type { BlockType } from "../block-types";

/* ------------------------------------------------------------------ */
/*  Core types                                                         */
/* ------------------------------------------------------------------ */

export type LayoutCategory = "title" | "content" | "data" | "team";

export interface LayoutZone {
  /** Unique zone name (used in grid-template-areas) */
  name: string;
  /** Grid position: column start (0-based) */
  x: number;
  /** Grid position: row start (0-based) */
  y: number;
  /** Column span */
  width: number;
  /** Row span */
  height: number;
  /** Suggested block type for this zone */
  suggestedBlock: BlockType;
  /** Human label for the zone */
  label: string;
}

export interface SlideLayout {
  id: string;
  name: string;
  category: LayoutCategory;
  /** Description shown in the layout picker */
  description: string;
  /** CSS Grid template-areas string for visual reference */
  gridTemplate: string;
  /** The zones that define block positions */
  zones: LayoutZone[];
  /** Thumbnail icon (SVG path or emoji) */
  icon: string;
}

/* ------------------------------------------------------------------ */
/*  Category metadata                                                  */
/* ------------------------------------------------------------------ */

export const LAYOUT_CATEGORIES: Record<
  LayoutCategory,
  { label: string; color: string; description: string }
> = {
  title: {
    label: "Title",
    color: "#4361EE",
    description: "Opening and section slides",
  },
  content: {
    label: "Content",
    color: "#06D6A0",
    description: "Body content and storytelling",
  },
  data: {
    label: "Data",
    color: "#7209B7",
    description: "Charts, metrics, and comparisons",
  },
  team: {
    label: "Team",
    color: "#FF9F1C",
    description: "Team and people layouts",
  },
};
