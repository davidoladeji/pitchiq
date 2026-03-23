import type { VisualPersonality } from "./company-dna";

/* ------------------------------------------------------------------ */
/*  Composition System — 40+ layout patterns for slide variety         */
/* ------------------------------------------------------------------ */

export type CompositionCategory =
  | "hero"
  | "split"
  | "modular"
  | "data-forward"
  | "content-forward"
  | "visual-forward"
  | "emphasis"
  | "team-social";

export interface CompositionZone {
  id: string;
  role: "heading" | "subheading" | "body" | "chart" | "metric" | "image"
    | "icon-grid" | "quote" | "stat" | "caption" | "logo-row" | "cta" | "background";
  gridArea: { col: number; row: number; colSpan: number; rowSpan: number };
  optional?: boolean;
}

export interface CompositionPattern {
  id: string;
  name: string;
  category: CompositionCategory;
  zones: CompositionZone[];
  bestFor: VisualPersonality[];
  density: "splash" | "standard" | "data-dense";
}

/* ------------------------------------------------------------------ */
/*  HERO compositions (5)                                              */
/* ------------------------------------------------------------------ */

const HERO_COMPOSITIONS: CompositionPattern[] = [
  {
    id: "hero-fullbleed",
    name: "Full-Bleed Hero",
    category: "hero",
    density: "splash",
    bestFor: ["bold-playful", "editorial-refined", "startup-energetic", "futuristic-gradient"],
    zones: [
      { id: "bg", role: "background", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 6 } },
      { id: "headline", role: "heading", gridArea: { col: 2, row: 2, colSpan: 8, rowSpan: 2 } },
      { id: "subtitle", role: "subheading", gridArea: { col: 2, row: 4, colSpan: 6, rowSpan: 1 } },
    ],
  },
  {
    id: "hero-centered",
    name: "Centered Hero",
    category: "hero",
    density: "splash",
    bestFor: ["corporate-premium", "clinical-clean", "startup-energetic", "organic-hopeful"],
    zones: [
      { id: "headline", role: "heading", gridArea: { col: 2, row: 2, colSpan: 8, rowSpan: 2 } },
      { id: "subtitle", role: "subheading", gridArea: { col: 3, row: 4, colSpan: 6, rowSpan: 1 } },
      { id: "cta", role: "cta", gridArea: { col: 4, row: 5, colSpan: 4, rowSpan: 1 }, optional: true },
    ],
  },
  {
    id: "hero-gradient",
    name: "Gradient Hero",
    category: "hero",
    density: "splash",
    bestFor: ["futuristic-gradient", "bold-playful", "startup-energetic"],
    zones: [
      { id: "bg", role: "background", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 6 } },
      { id: "headline", role: "heading", gridArea: { col: 1, row: 2, colSpan: 10, rowSpan: 2 } },
      { id: "subtitle", role: "subheading", gridArea: { col: 1, row: 4, colSpan: 7, rowSpan: 1 } },
      { id: "stat", role: "stat", gridArea: { col: 9, row: 4, colSpan: 3, rowSpan: 2 }, optional: true },
    ],
  },
  {
    id: "hero-cinematic",
    name: "Cinematic Wide",
    category: "hero",
    density: "splash",
    bestFor: ["editorial-refined", "organic-hopeful", "bold-playful"],
    zones: [
      { id: "image", role: "image", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 4 } },
      { id: "headline", role: "heading", gridArea: { col: 1, row: 5, colSpan: 8, rowSpan: 1 } },
      { id: "subtitle", role: "subheading", gridArea: { col: 1, row: 6, colSpan: 6, rowSpan: 1 } },
    ],
  },
  {
    id: "hero-bold-statement",
    name: "Bold Statement",
    category: "hero",
    density: "splash",
    bestFor: ["bold-playful", "startup-energetic", "futuristic-gradient", "corporate-premium"],
    zones: [
      { id: "headline", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 4 } },
      { id: "caption", role: "caption", gridArea: { col: 1, row: 5, colSpan: 8, rowSpan: 1 } },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  SPLIT compositions (6)                                             */
/* ------------------------------------------------------------------ */

const SPLIT_COMPOSITIONS: CompositionPattern[] = [
  {
    id: "split-50-50",
    name: "Equal Split",
    category: "split",
    density: "standard",
    bestFor: ["corporate-premium", "clinical-clean", "editorial-refined", "startup-energetic"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 5, rowSpan: 1 } },
      { id: "body", role: "body", gridArea: { col: 1, row: 2, colSpan: 5, rowSpan: 4 } },
      { id: "visual", role: "image", gridArea: { col: 7, row: 1, colSpan: 6, rowSpan: 6 } },
    ],
  },
  {
    id: "split-60-40",
    name: "Content-Heavy Split",
    category: "split",
    density: "standard",
    bestFor: ["corporate-premium", "scientific-rigorous", "clinical-clean"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 7, rowSpan: 1 } },
      { id: "body", role: "body", gridArea: { col: 1, row: 2, colSpan: 7, rowSpan: 4 } },
      { id: "visual", role: "image", gridArea: { col: 8, row: 1, colSpan: 5, rowSpan: 5 } },
      { id: "caption", role: "caption", gridArea: { col: 1, row: 6, colSpan: 12, rowSpan: 1 }, optional: true },
    ],
  },
  {
    id: "split-40-60",
    name: "Visual-Heavy Split",
    category: "split",
    density: "standard",
    bestFor: ["bold-playful", "editorial-refined", "organic-hopeful"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 4, rowSpan: 1 } },
      { id: "body", role: "body", gridArea: { col: 1, row: 2, colSpan: 4, rowSpan: 4 } },
      { id: "visual", role: "image", gridArea: { col: 5, row: 1, colSpan: 8, rowSpan: 6 } },
    ],
  },
  {
    id: "split-top-bottom",
    name: "Vertical Split",
    category: "split",
    density: "standard",
    bestFor: ["startup-energetic", "futuristic-gradient", "bold-playful"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "visual", role: "image", gridArea: { col: 1, row: 2, colSpan: 12, rowSpan: 3 } },
      { id: "body", role: "body", gridArea: { col: 1, row: 5, colSpan: 12, rowSpan: 2 } },
    ],
  },
  {
    id: "split-text-chart",
    name: "Text + Chart Split",
    category: "split",
    density: "data-dense",
    bestFor: ["corporate-premium", "scientific-rigorous", "clinical-clean", "startup-energetic"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 5, rowSpan: 1 } },
      { id: "body", role: "body", gridArea: { col: 1, row: 2, colSpan: 5, rowSpan: 4 } },
      { id: "chart", role: "chart", gridArea: { col: 7, row: 1, colSpan: 6, rowSpan: 5 } },
      { id: "caption", role: "caption", gridArea: { col: 1, row: 6, colSpan: 12, rowSpan: 1 }, optional: true },
    ],
  },
  {
    id: "split-quote-context",
    name: "Quote + Context",
    category: "split",
    density: "splash",
    bestFor: ["editorial-refined", "organic-hopeful", "clinical-clean"],
    zones: [
      { id: "quote", role: "quote", gridArea: { col: 1, row: 1, colSpan: 6, rowSpan: 5 } },
      { id: "heading", role: "heading", gridArea: { col: 7, row: 1, colSpan: 6, rowSpan: 1 } },
      { id: "body", role: "body", gridArea: { col: 7, row: 2, colSpan: 6, rowSpan: 4 } },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  MODULAR / Bento compositions (6)                                   */
/* ------------------------------------------------------------------ */

const MODULAR_COMPOSITIONS: CompositionPattern[] = [
  {
    id: "bento-2x2",
    name: "Bento 2×2",
    category: "modular",
    density: "data-dense",
    bestFor: ["corporate-premium", "clinical-clean", "futuristic-gradient", "scientific-rigorous"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "card1", role: "stat", gridArea: { col: 1, row: 2, colSpan: 6, rowSpan: 2.5 } },
      { id: "card2", role: "stat", gridArea: { col: 7, row: 2, colSpan: 6, rowSpan: 2.5 } },
      { id: "card3", role: "body", gridArea: { col: 1, row: 4.5, colSpan: 6, rowSpan: 2.5 } },
      { id: "card4", role: "chart", gridArea: { col: 7, row: 4.5, colSpan: 6, rowSpan: 2.5 } },
    ],
  },
  {
    id: "bento-1-large-2-small",
    name: "Featured + Details",
    category: "modular",
    density: "standard",
    bestFor: ["startup-energetic", "bold-playful", "futuristic-gradient"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "featured", role: "image", gridArea: { col: 1, row: 2, colSpan: 7, rowSpan: 5 } },
      { id: "detail1", role: "stat", gridArea: { col: 8, row: 2, colSpan: 5, rowSpan: 2.5 } },
      { id: "detail2", role: "body", gridArea: { col: 8, row: 4.5, colSpan: 5, rowSpan: 2.5 } },
    ],
  },
  {
    id: "bento-3-strip",
    name: "Triple Strip",
    category: "modular",
    density: "standard",
    bestFor: ["corporate-premium", "clinical-clean", "startup-energetic", "editorial-refined"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "strip1", role: "stat", gridArea: { col: 1, row: 2, colSpan: 4, rowSpan: 4 } },
      { id: "strip2", role: "stat", gridArea: { col: 5, row: 2, colSpan: 4, rowSpan: 4 } },
      { id: "strip3", role: "stat", gridArea: { col: 9, row: 2, colSpan: 4, rowSpan: 4 } },
      { id: "caption", role: "caption", gridArea: { col: 1, row: 6, colSpan: 12, rowSpan: 1 }, optional: true },
    ],
  },
  {
    id: "bento-mosaic",
    name: "Mosaic Grid",
    category: "modular",
    density: "data-dense",
    bestFor: ["futuristic-gradient", "bold-playful", "startup-energetic"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 8, rowSpan: 1 } },
      { id: "big", role: "chart", gridArea: { col: 1, row: 2, colSpan: 8, rowSpan: 3 } },
      { id: "side1", role: "stat", gridArea: { col: 9, row: 1, colSpan: 4, rowSpan: 2 } },
      { id: "side2", role: "stat", gridArea: { col: 9, row: 3, colSpan: 4, rowSpan: 2 } },
      { id: "bottom1", role: "stat", gridArea: { col: 1, row: 5, colSpan: 4, rowSpan: 2 } },
      { id: "bottom2", role: "stat", gridArea: { col: 5, row: 5, colSpan: 4, rowSpan: 2 } },
      { id: "bottom3", role: "stat", gridArea: { col: 9, row: 5, colSpan: 4, rowSpan: 2 } },
    ],
  },
  {
    id: "bento-l-shape",
    name: "L-Shape + Fill",
    category: "modular",
    density: "data-dense",
    bestFor: ["corporate-premium", "scientific-rigorous", "clinical-clean"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "main", role: "chart", gridArea: { col: 1, row: 2, colSpan: 8, rowSpan: 5 } },
      { id: "right1", role: "stat", gridArea: { col: 9, row: 2, colSpan: 4, rowSpan: 1.6 } },
      { id: "right2", role: "stat", gridArea: { col: 9, row: 3.6, colSpan: 4, rowSpan: 1.6 } },
      { id: "right3", role: "stat", gridArea: { col: 9, row: 5.2, colSpan: 4, rowSpan: 1.6 } },
    ],
  },
  {
    id: "bento-staggered",
    name: "Staggered Cards",
    category: "modular",
    density: "standard",
    bestFor: ["bold-playful", "startup-energetic", "organic-hopeful", "editorial-refined"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "card1", role: "body", gridArea: { col: 1, row: 2, colSpan: 5, rowSpan: 2 } },
      { id: "card2", role: "body", gridArea: { col: 7, row: 2.5, colSpan: 5, rowSpan: 2 } },
      { id: "card3", role: "body", gridArea: { col: 2, row: 4.5, colSpan: 5, rowSpan: 2 } },
      { id: "card4", role: "body", gridArea: { col: 8, row: 5, colSpan: 5, rowSpan: 2 }, optional: true },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  DATA-FORWARD compositions (5)                                      */
/* ------------------------------------------------------------------ */

const DATA_FORWARD_COMPOSITIONS: CompositionPattern[] = [
  {
    id: "chart-full",
    name: "Full Chart",
    category: "data-forward",
    density: "data-dense",
    bestFor: ["corporate-premium", "scientific-rigorous", "clinical-clean", "futuristic-gradient"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 8, rowSpan: 1 } },
      { id: "chart", role: "chart", gridArea: { col: 1, row: 2, colSpan: 12, rowSpan: 5 } },
    ],
  },
  {
    id: "chart-insights",
    name: "Chart + Sidebar Insights",
    category: "data-forward",
    density: "data-dense",
    bestFor: ["corporate-premium", "scientific-rigorous", "clinical-clean"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 8, rowSpan: 1 } },
      { id: "chart", role: "chart", gridArea: { col: 1, row: 2, colSpan: 8, rowSpan: 4 } },
      { id: "insight1", role: "stat", gridArea: { col: 9, row: 2, colSpan: 4, rowSpan: 1.3 } },
      { id: "insight2", role: "stat", gridArea: { col: 9, row: 3.3, colSpan: 4, rowSpan: 1.3 } },
      { id: "insight3", role: "stat", gridArea: { col: 9, row: 4.6, colSpan: 4, rowSpan: 1.3 } },
      { id: "caption", role: "caption", gridArea: { col: 1, row: 6, colSpan: 12, rowSpan: 1 }, optional: true },
    ],
  },
  {
    id: "dashboard-metrics",
    name: "Metrics Dashboard",
    category: "data-forward",
    density: "data-dense",
    bestFor: ["corporate-premium", "futuristic-gradient", "clinical-clean", "startup-energetic"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "m1", role: "metric", gridArea: { col: 1, row: 2, colSpan: 3, rowSpan: 2 } },
      { id: "m2", role: "metric", gridArea: { col: 4, row: 2, colSpan: 3, rowSpan: 2 } },
      { id: "m3", role: "metric", gridArea: { col: 7, row: 2, colSpan: 3, rowSpan: 2 } },
      { id: "m4", role: "metric", gridArea: { col: 10, row: 2, colSpan: 3, rowSpan: 2 } },
      { id: "chart", role: "chart", gridArea: { col: 1, row: 4, colSpan: 12, rowSpan: 3 } },
    ],
  },
  {
    id: "comparison-columns",
    name: "Side-by-Side Comparison",
    category: "data-forward",
    density: "data-dense",
    bestFor: ["corporate-premium", "clinical-clean", "scientific-rigorous", "editorial-refined"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "left", role: "body", gridArea: { col: 1, row: 2, colSpan: 6, rowSpan: 5 } },
      { id: "right", role: "body", gridArea: { col: 7, row: 2, colSpan: 6, rowSpan: 5 } },
    ],
  },
  {
    id: "waterfall-economics",
    name: "Economics Waterfall",
    category: "data-forward",
    density: "data-dense",
    bestFor: ["corporate-premium", "scientific-rigorous", "clinical-clean"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "chart", role: "chart", gridArea: { col: 1, row: 2, colSpan: 8, rowSpan: 5 } },
      { id: "summary", role: "body", gridArea: { col: 9, row: 2, colSpan: 4, rowSpan: 5 } },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  CONTENT-FORWARD compositions (6)                                   */
/* ------------------------------------------------------------------ */

const CONTENT_FORWARD_COMPOSITIONS: CompositionPattern[] = [
  {
    id: "numbered-steps",
    name: "Numbered Steps",
    category: "content-forward",
    density: "standard",
    bestFor: ["corporate-premium", "clinical-clean", "startup-energetic", "editorial-refined"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "step1", role: "body", gridArea: { col: 1, row: 2, colSpan: 4, rowSpan: 4 } },
      { id: "step2", role: "body", gridArea: { col: 5, row: 2, colSpan: 4, rowSpan: 4 } },
      { id: "step3", role: "body", gridArea: { col: 9, row: 2, colSpan: 4, rowSpan: 4 } },
      { id: "caption", role: "caption", gridArea: { col: 1, row: 6, colSpan: 12, rowSpan: 1 }, optional: true },
    ],
  },
  {
    id: "icon-grid-6",
    name: "Icon Grid 3×2",
    category: "content-forward",
    density: "standard",
    bestFor: ["startup-energetic", "bold-playful", "organic-hopeful", "futuristic-gradient"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "i1", role: "icon-grid", gridArea: { col: 1, row: 2, colSpan: 4, rowSpan: 2 } },
      { id: "i2", role: "icon-grid", gridArea: { col: 5, row: 2, colSpan: 4, rowSpan: 2 } },
      { id: "i3", role: "icon-grid", gridArea: { col: 9, row: 2, colSpan: 4, rowSpan: 2 } },
      { id: "i4", role: "icon-grid", gridArea: { col: 1, row: 4, colSpan: 4, rowSpan: 2 } },
      { id: "i5", role: "icon-grid", gridArea: { col: 5, row: 4, colSpan: 4, rowSpan: 2 } },
      { id: "i6", role: "icon-grid", gridArea: { col: 9, row: 4, colSpan: 4, rowSpan: 2 } },
    ],
  },
  {
    id: "timeline-horizontal",
    name: "Horizontal Timeline",
    category: "content-forward",
    density: "standard",
    bestFor: ["corporate-premium", "startup-energetic", "clinical-clean", "futuristic-gradient"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "timeline", role: "body", gridArea: { col: 1, row: 2, colSpan: 12, rowSpan: 3 } },
      { id: "context", role: "caption", gridArea: { col: 1, row: 5, colSpan: 12, rowSpan: 2 }, optional: true },
    ],
  },
  {
    id: "process-flow",
    name: "Process Flow",
    category: "content-forward",
    density: "standard",
    bestFor: ["scientific-rigorous", "clinical-clean", "corporate-premium"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "step1", role: "body", gridArea: { col: 1, row: 2, colSpan: 3, rowSpan: 3 } },
      { id: "step2", role: "body", gridArea: { col: 4, row: 2, colSpan: 3, rowSpan: 3 } },
      { id: "step3", role: "body", gridArea: { col: 7, row: 2, colSpan: 3, rowSpan: 3 } },
      { id: "step4", role: "body", gridArea: { col: 10, row: 2, colSpan: 3, rowSpan: 3 } },
      { id: "conclusion", role: "subheading", gridArea: { col: 1, row: 5, colSpan: 12, rowSpan: 2 } },
    ],
  },
  {
    id: "layered-cards",
    name: "Layered Cards",
    category: "content-forward",
    density: "standard",
    bestFor: ["bold-playful", "editorial-refined", "organic-hopeful"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "card1", role: "body", gridArea: { col: 1, row: 2, colSpan: 6, rowSpan: 2.5 } },
      { id: "card2", role: "body", gridArea: { col: 7, row: 2, colSpan: 6, rowSpan: 2.5 } },
      { id: "card3", role: "body", gridArea: { col: 4, row: 4.5, colSpan: 6, rowSpan: 2.5 } },
    ],
  },
  {
    id: "bullets-with-visual",
    name: "Bullets + Visual Accent",
    category: "content-forward",
    density: "standard",
    bestFor: ["corporate-premium", "clinical-clean", "scientific-rigorous", "startup-energetic"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 8, rowSpan: 1 } },
      { id: "subheading", role: "subheading", gridArea: { col: 1, row: 2, colSpan: 8, rowSpan: 1 } },
      { id: "body", role: "body", gridArea: { col: 1, row: 3, colSpan: 8, rowSpan: 4 } },
      { id: "accent", role: "image", gridArea: { col: 9, row: 2, colSpan: 4, rowSpan: 4 }, optional: true },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  VISUAL-FORWARD compositions (5)                                    */
/* ------------------------------------------------------------------ */

const VISUAL_FORWARD_COMPOSITIONS: CompositionPattern[] = [
  {
    id: "product-screenshot",
    name: "Product Screenshot",
    category: "visual-forward",
    density: "standard",
    bestFor: ["startup-energetic", "corporate-premium", "bold-playful", "futuristic-gradient"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 5, rowSpan: 1 } },
      { id: "features", role: "body", gridArea: { col: 1, row: 2, colSpan: 4, rowSpan: 4 } },
      { id: "mockup", role: "image", gridArea: { col: 5, row: 1, colSpan: 8, rowSpan: 6 } },
    ],
  },
  {
    id: "device-mockup",
    name: "Device Mockup",
    category: "visual-forward",
    density: "splash",
    bestFor: ["bold-playful", "startup-energetic", "futuristic-gradient", "editorial-refined"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "device", role: "image", gridArea: { col: 3, row: 2, colSpan: 8, rowSpan: 4 } },
      { id: "caption", role: "caption", gridArea: { col: 2, row: 6, colSpan: 8, rowSpan: 1 } },
    ],
  },
  {
    id: "photo-grid",
    name: "Photo Grid",
    category: "visual-forward",
    density: "splash",
    bestFor: ["bold-playful", "organic-hopeful", "editorial-refined"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "img1", role: "image", gridArea: { col: 1, row: 2, colSpan: 4, rowSpan: 5 } },
      { id: "img2", role: "image", gridArea: { col: 5, row: 2, colSpan: 4, rowSpan: 5 } },
      { id: "img3", role: "image", gridArea: { col: 9, row: 2, colSpan: 4, rowSpan: 5 } },
    ],
  },
  {
    id: "single-visual-quote",
    name: "Large Visual + Quote",
    category: "visual-forward",
    density: "splash",
    bestFor: ["editorial-refined", "organic-hopeful", "bold-playful"],
    zones: [
      { id: "image", role: "image", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 4 } },
      { id: "quote", role: "quote", gridArea: { col: 2, row: 5, colSpan: 8, rowSpan: 2 } },
    ],
  },
  {
    id: "before-after-split",
    name: "Before/After",
    category: "visual-forward",
    density: "standard",
    bestFor: ["startup-energetic", "bold-playful", "clinical-clean", "corporate-premium"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "before-label", role: "subheading", gridArea: { col: 1, row: 2, colSpan: 6, rowSpan: 1 } },
      { id: "before", role: "body", gridArea: { col: 1, row: 3, colSpan: 6, rowSpan: 4 } },
      { id: "after-label", role: "subheading", gridArea: { col: 7, row: 2, colSpan: 6, rowSpan: 1 } },
      { id: "after", role: "body", gridArea: { col: 7, row: 3, colSpan: 6, rowSpan: 4 } },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  EMPHASIS compositions (5)                                          */
/* ------------------------------------------------------------------ */

const EMPHASIS_COMPOSITIONS: CompositionPattern[] = [
  {
    id: "hero-stat",
    name: "Hero Stat",
    category: "emphasis",
    density: "splash",
    bestFor: ["bold-playful", "startup-energetic", "corporate-premium", "futuristic-gradient"],
    zones: [
      { id: "big-number", role: "stat", gridArea: { col: 2, row: 1, colSpan: 8, rowSpan: 3 } },
      { id: "context", role: "subheading", gridArea: { col: 3, row: 4, colSpan: 6, rowSpan: 1 } },
      { id: "supporting", role: "body", gridArea: { col: 2, row: 5, colSpan: 8, rowSpan: 2 } },
    ],
  },
  {
    id: "bold-quote",
    name: "Bold Quote",
    category: "emphasis",
    density: "splash",
    bestFor: ["editorial-refined", "organic-hopeful", "bold-playful"],
    zones: [
      { id: "quote", role: "quote", gridArea: { col: 2, row: 1, colSpan: 8, rowSpan: 4 } },
      { id: "attribution", role: "caption", gridArea: { col: 3, row: 5, colSpan: 6, rowSpan: 1 } },
    ],
  },
  {
    id: "callout-card",
    name: "Callout Card",
    category: "emphasis",
    density: "splash",
    bestFor: ["corporate-premium", "clinical-clean", "startup-energetic"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 2, row: 1, colSpan: 8, rowSpan: 1 } },
      { id: "callout", role: "stat", gridArea: { col: 2, row: 2, colSpan: 8, rowSpan: 3 } },
      { id: "body", role: "body", gridArea: { col: 2, row: 5, colSpan: 8, rowSpan: 2 } },
    ],
  },
  {
    id: "stat-trio",
    name: "Stat Trio",
    category: "emphasis",
    density: "data-dense",
    bestFor: ["corporate-premium", "futuristic-gradient", "startup-energetic", "scientific-rigorous"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "stat1", role: "stat", gridArea: { col: 1, row: 2, colSpan: 4, rowSpan: 3 } },
      { id: "stat2", role: "stat", gridArea: { col: 5, row: 2, colSpan: 4, rowSpan: 3 } },
      { id: "stat3", role: "stat", gridArea: { col: 9, row: 2, colSpan: 4, rowSpan: 3 } },
      { id: "caption", role: "caption", gridArea: { col: 1, row: 5, colSpan: 12, rowSpan: 2 }, optional: true },
    ],
  },
  {
    id: "statement-proof",
    name: "Statement + Proof",
    category: "emphasis",
    density: "standard",
    bestFor: ["bold-playful", "startup-energetic", "editorial-refined", "futuristic-gradient"],
    zones: [
      { id: "statement", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 3 } },
      { id: "proof1", role: "stat", gridArea: { col: 1, row: 4, colSpan: 4, rowSpan: 3 } },
      { id: "proof2", role: "stat", gridArea: { col: 5, row: 4, colSpan: 4, rowSpan: 3 } },
      { id: "proof3", role: "stat", gridArea: { col: 9, row: 4, colSpan: 4, rowSpan: 3 } },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  TEAM / SOCIAL PROOF compositions (5)                               */
/* ------------------------------------------------------------------ */

const TEAM_SOCIAL_COMPOSITIONS: CompositionPattern[] = [
  {
    id: "team-grid-4",
    name: "Team Grid",
    category: "team-social",
    density: "standard",
    bestFor: ["corporate-premium", "clinical-clean", "startup-energetic", "scientific-rigorous"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "m1", role: "body", gridArea: { col: 1, row: 2, colSpan: 3, rowSpan: 5 } },
      { id: "m2", role: "body", gridArea: { col: 4, row: 2, colSpan: 3, rowSpan: 5 } },
      { id: "m3", role: "body", gridArea: { col: 7, row: 2, colSpan: 3, rowSpan: 5 } },
      { id: "m4", role: "body", gridArea: { col: 10, row: 2, colSpan: 3, rowSpan: 5 }, optional: true },
    ],
  },
  {
    id: "team-featured-founder",
    name: "Featured Founder + Team",
    category: "team-social",
    density: "standard",
    bestFor: ["startup-energetic", "bold-playful", "editorial-refined", "organic-hopeful"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "founder", role: "image", gridArea: { col: 1, row: 2, colSpan: 5, rowSpan: 5 } },
      { id: "founder-bio", role: "body", gridArea: { col: 6, row: 2, colSpan: 7, rowSpan: 2 } },
      { id: "team-strip", role: "body", gridArea: { col: 6, row: 4, colSpan: 7, rowSpan: 3 } },
    ],
  },
  {
    id: "logo-wall",
    name: "Logo Wall",
    category: "team-social",
    density: "standard",
    bestFor: ["corporate-premium", "clinical-clean", "startup-energetic", "editorial-refined", "bold-playful"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "subtitle", role: "subheading", gridArea: { col: 1, row: 2, colSpan: 12, rowSpan: 1 } },
      { id: "logos", role: "logo-row", gridArea: { col: 1, row: 3, colSpan: 12, rowSpan: 4 } },
    ],
  },
  {
    id: "testimonial-cards",
    name: "Testimonial Cards",
    category: "team-social",
    density: "standard",
    bestFor: ["editorial-refined", "organic-hopeful", "corporate-premium", "bold-playful"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "t1", role: "quote", gridArea: { col: 1, row: 2, colSpan: 4, rowSpan: 4 } },
      { id: "t2", role: "quote", gridArea: { col: 5, row: 2, colSpan: 4, rowSpan: 4 } },
      { id: "t3", role: "quote", gridArea: { col: 9, row: 2, colSpan: 4, rowSpan: 4 } },
      { id: "caption", role: "caption", gridArea: { col: 1, row: 6, colSpan: 12, rowSpan: 1 }, optional: true },
    ],
  },
  {
    id: "press-logos",
    name: "Press + Headlines",
    category: "team-social",
    density: "standard",
    bestFor: ["corporate-premium", "editorial-refined", "startup-energetic"],
    zones: [
      { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
      { id: "logos", role: "logo-row", gridArea: { col: 1, row: 2, colSpan: 12, rowSpan: 2 } },
      { id: "headline1", role: "quote", gridArea: { col: 1, row: 4, colSpan: 6, rowSpan: 3 } },
      { id: "headline2", role: "quote", gridArea: { col: 7, row: 4, colSpan: 6, rowSpan: 3 } },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Complete Registry                                                  */
/* ------------------------------------------------------------------ */

export const ALL_COMPOSITIONS: CompositionPattern[] = [
  ...HERO_COMPOSITIONS,
  ...SPLIT_COMPOSITIONS,
  ...MODULAR_COMPOSITIONS,
  ...DATA_FORWARD_COMPOSITIONS,
  ...CONTENT_FORWARD_COMPOSITIONS,
  ...VISUAL_FORWARD_COMPOSITIONS,
  ...EMPHASIS_COMPOSITIONS,
  ...TEAM_SOCIAL_COMPOSITIONS,
];

/** Look up composition by ID */
export function getComposition(id: string): CompositionPattern | undefined {
  return ALL_COMPOSITIONS.find((c) => c.id === id);
}

/** Get all compositions for a given category */
export function getCompositionsByCategory(category: CompositionCategory): CompositionPattern[] {
  return ALL_COMPOSITIONS.filter((c) => c.category === category);
}

/** Get compositions compatible with a visual personality and density */
export function getCompatibleCompositions(
  personality: VisualPersonality,
  density?: "splash" | "standard" | "data-dense",
): CompositionPattern[] {
  return ALL_COMPOSITIONS.filter((c) =>
    c.bestFor.includes(personality) && (!density || c.density === density)
  );
}

/** Pick a composition avoiding recently used categories for variety */
export function pickComposition(
  personality: VisualPersonality,
  density: "splash" | "standard" | "data-dense",
  recentCategories: CompositionCategory[],
  preferredCategory?: CompositionCategory,
): CompositionPattern {
  const compatible = getCompatibleCompositions(personality, density);

  // Prefer the requested category if available and not recently used
  if (preferredCategory) {
    const fromPreferred = compatible.filter(
      (c) => c.category === preferredCategory && !recentCategories.includes(c.category)
    );
    if (fromPreferred.length > 0) return fromPreferred[Math.floor(Math.random() * fromPreferred.length)];
  }

  // Avoid recently used categories
  const fresh = compatible.filter((c) => !recentCategories.includes(c.category));
  if (fresh.length > 0) return fresh[Math.floor(Math.random() * fresh.length)];

  // Fallback: pick any compatible
  if (compatible.length > 0) return compatible[Math.floor(Math.random() * compatible.length)];

  // Ultimate fallback
  return SPLIT_COMPOSITIONS[0];
}
