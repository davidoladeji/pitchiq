/**
 * Default block factories for the v2 editor block system.
 * Each function returns a fully-formed EditorBlock with sensible defaults.
 */

import { nanoid } from "nanoid";
import type {
  BlockType,
  BlockDataMap,
  BlockPosition,
  BlockStyle,
  EditorBlock,
} from "./block-types";

/* ------------------------------------------------------------------ */
/*  Default position (full-width, stacked vertically)                  */
/* ------------------------------------------------------------------ */

export function defaultPosition(index = 0): BlockPosition {
  return { x: 0, y: index, width: 12, height: 1, zIndex: index };
}

/* ------------------------------------------------------------------ */
/*  Default style (empty — inherits from theme)                        */
/* ------------------------------------------------------------------ */

export const DEFAULT_STYLE: BlockStyle = {};

/* ------------------------------------------------------------------ */
/*  Default data per block type                                        */
/* ------------------------------------------------------------------ */

const DEFAULTS: { [K in BlockType]: () => BlockDataMap[K] } = {
  text: () => ({
    text: "Enter your text here...",
    fontSize: 16,
    align: "left" as const,
    bold: false,
    italic: false,
  }),

  heading: () => ({
    text: "Slide Heading",
    level: 1 as const,
    align: "center" as const,
  }),

  "bullet-list": () => ({
    items: ["First point", "Second point", "Third point"],
    ordered: false,
    style: "disc" as const,
  }),

  quote: () => ({
    text: "Add your quote here...",
    author: "Author Name",
    source: undefined,
  }),

  callout: () => ({
    text: "Important information goes here.",
    variant: "info" as const,
    icon: undefined,
  }),

  metric: () => ({
    label: "Metric Label",
    value: "0",
    change: "+0%",
    trend: "neutral" as const,
  }),

  chart: () => ({
    chartType: "bar" as const,
    data: [
      { label: "Q1", value: 40 },
      { label: "Q2", value: 65 },
      { label: "Q3", value: 50 },
      { label: "Q4", value: 80 },
    ],
    yAxisLabel: "Value",
  }),

  "comparison-row": () => ({
    label: "Feature",
    us: "Yes",
    them: "No",
  }),

  image: () => ({
    src: "",
    alt: "Image placeholder",
    fit: "contain" as const,
  }),

  "logo-grid": () => ({
    logos: ["Partner 1", "Partner 2", "Partner 3", "Partner 4"],
    columns: 4,
  }),

  shape: () => ({
    shape: "rectangle" as const,
    fill: "#4361EE",
    stroke: "transparent",
    strokeWidth: 0,
  }),

  "team-member": () => ({
    name: "Team Member",
    role: "Role",
    bio: undefined,
    avatarUrl: undefined,
  }),

  "timeline-item": () => ({
    date: "Q1 2026",
    title: "Milestone",
    description: undefined,
    completed: false,
  }),

  divider: () => ({
    style: "solid" as const,
    thickness: 1,
    color: undefined,
  }),

  spacer: () => ({
    height: 1,
  }),

  "card-group": () => ({
    cards: [
      { title: "Card 1", body: "Description for card one." },
      { title: "Card 2", body: "Description for card two." },
      { title: "Card 3", body: "Description for card three." },
    ],
    columns: 3 as const,
  }),
};

/* ------------------------------------------------------------------ */
/*  Factory                                                            */
/* ------------------------------------------------------------------ */

/**
 * Create a new EditorBlock with default data for the given type.
 * @param type  The block type
 * @param index Optional insertion index (sets default y-position)
 */
export function createDefaultEditorBlock<T extends BlockType>(
  type: T,
  index = 0,
): EditorBlock<T> {
  const factory = DEFAULTS[type] as () => BlockDataMap[T];
  return {
    id: nanoid(10),
    type,
    data: factory(),
    position: defaultPosition(index),
    style: { ...DEFAULT_STYLE },
    locked: false,
    hidden: false,
    animations: [],
  };
}
