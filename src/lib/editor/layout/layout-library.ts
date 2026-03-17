/**
 * Layout Library — 20 predefined slide layouts across 4 categories.
 *
 * Each layout defines zones on a 12-column × 6-row grid.
 * Zones map to suggested block types and precise grid positions.
 */

import type { SlideLayout } from "./layout-types";

/* ================================================================== */
/*  Title Layouts (5)                                                  */
/* ================================================================== */

const titleLayouts: SlideLayout[] = [
  {
    id: "title-centered",
    name: "Centered Title",
    category: "title",
    description: "Bold centered heading with subtitle",
    icon: "M4 7V4h16v3M9 20h6M12 4v16",
    gridTemplate: `
      ". . . . . . . . . . . ."
      ". . . . . . . . . . . ."
      ". . h h h h h h h h . ."
      ". . . s s s s s s . . ."
      ". . . . . . . . . . . ."
      ". . . . . . . . . . . ."
    `,
    zones: [
      { name: "heading", x: 2, y: 2, width: 8, height: 1, suggestedBlock: "heading", label: "Title" },
      { name: "subtitle", x: 3, y: 3, width: 6, height: 1, suggestedBlock: "text", label: "Subtitle" },
    ],
  },
  {
    id: "title-left",
    name: "Title + Statement",
    category: "title",
    description: "Left-aligned title with supporting text",
    icon: "M3.75 6.75h16.5M3.75 12h10",
    gridTemplate: `
      ". . . . . . . . . . . ."
      ". h h h h h h h . . . ."
      ". s s s s s . . . . . ."
      ". t t t t t t . . . . ."
      ". . . . . . . . . . . ."
      ". . . . . . . . . . . ."
    `,
    zones: [
      { name: "heading", x: 1, y: 1, width: 7, height: 1, suggestedBlock: "heading", label: "Title" },
      { name: "subtitle", x: 1, y: 2, width: 5, height: 1, suggestedBlock: "text", label: "Subtitle" },
      { name: "text", x: 1, y: 3, width: 6, height: 1, suggestedBlock: "text", label: "Body" },
    ],
  },
  {
    id: "title-bold",
    name: "Bold Statement",
    category: "title",
    description: "Full-width statement with accent",
    icon: "M4 7V4h16v3",
    gridTemplate: `
      ". . . . . . . . . . . ."
      ". . . . . . . . . . . ."
      ". h h h h h h h h h h ."
      ". d d d d d d d d d d ."
      ". . . . . . . . . . . ."
      ". . . . . . . . . . . ."
    `,
    zones: [
      { name: "heading", x: 1, y: 2, width: 10, height: 1, suggestedBlock: "heading", label: "Statement" },
      { name: "divider", x: 1, y: 3, width: 10, height: 1, suggestedBlock: "divider", label: "Divider" },
    ],
  },
  {
    id: "title-section",
    name: "Section Divider",
    category: "title",
    description: "Section number with heading",
    icon: "M7 20l4-16m2 16l4-16",
    gridTemplate: `
      ". . . . . . . . . . . ."
      ". n . h h h h h h h . ."
      ". . . s s s s s . . . ."
      ". . . . . . . . . . . ."
      ". . . . . . . . . . . ."
      ". . . . . . . . . . . ."
    `,
    zones: [
      { name: "number", x: 1, y: 1, width: 1, height: 1, suggestedBlock: "text", label: "Section #" },
      { name: "heading", x: 3, y: 1, width: 7, height: 1, suggestedBlock: "heading", label: "Section Title" },
      { name: "subtitle", x: 3, y: 2, width: 5, height: 1, suggestedBlock: "text", label: "Description" },
    ],
  },
  {
    id: "title-image",
    name: "Title + Image",
    category: "title",
    description: "Split layout with image and title",
    icon: "M2.25 15.75l5.159-5.159",
    gridTemplate: `
      "h h h h h h i i i i i i"
      "h h h h h h i i i i i i"
      "h h h h h h i i i i i i"
      "s s s s s s i i i i i i"
      ". . . . . . i i i i i i"
      ". . . . . . i i i i i i"
    `,
    zones: [
      { name: "heading", x: 0, y: 0, width: 6, height: 3, suggestedBlock: "heading", label: "Title" },
      { name: "subtitle", x: 0, y: 3, width: 6, height: 1, suggestedBlock: "text", label: "Subtitle" },
      { name: "image", x: 6, y: 0, width: 6, height: 6, suggestedBlock: "image", label: "Image" },
    ],
  },
];

/* ================================================================== */
/*  Content Layouts (8)                                                */
/* ================================================================== */

const contentLayouts: SlideLayout[] = [
  {
    id: "content-single",
    name: "Single Column",
    category: "content",
    description: "Full-width heading with bullet points",
    icon: "M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12",
    gridTemplate: `
      "h h h h h h h h h h h h"
      "b b b b b b b b b b b b"
      "b b b b b b b b b b b b"
      "b b b b b b b b b b b b"
      "b b b b b b b b b b b b"
      ". . . . . . . . . . . ."
    `,
    zones: [
      { name: "heading", x: 0, y: 0, width: 12, height: 1, suggestedBlock: "heading", label: "Heading" },
      { name: "body", x: 0, y: 1, width: 12, height: 4, suggestedBlock: "bullet-list", label: "Content" },
    ],
  },
  {
    id: "content-two-col",
    name: "Two Columns",
    category: "content",
    description: "Equal two-column layout",
    icon: "M9 4.5v15m6-15v15",
    gridTemplate: `
      "h h h h h h h h h h h h"
      "l l l l l l r r r r r r"
      "l l l l l l r r r r r r"
      "l l l l l l r r r r r r"
      "l l l l l l r r r r r r"
      ". . . . . . . . . . . ."
    `,
    zones: [
      { name: "heading", x: 0, y: 0, width: 12, height: 1, suggestedBlock: "heading", label: "Heading" },
      { name: "left", x: 0, y: 1, width: 6, height: 4, suggestedBlock: "bullet-list", label: "Left Column" },
      { name: "right", x: 6, y: 1, width: 6, height: 4, suggestedBlock: "bullet-list", label: "Right Column" },
    ],
  },
  {
    id: "content-60-40",
    name: "Content 60/40",
    category: "content",
    description: "Wide content left, narrow sidebar right",
    icon: "M3 4h10v16H3zM14 4h7v16h-7z",
    gridTemplate: `
      "h h h h h h h h h h h h"
      "m m m m m m m s s s s s"
      "m m m m m m m s s s s s"
      "m m m m m m m s s s s s"
      "m m m m m m m s s s s s"
      ". . . . . . . . . . . ."
    `,
    zones: [
      { name: "heading", x: 0, y: 0, width: 12, height: 1, suggestedBlock: "heading", label: "Heading" },
      { name: "main", x: 0, y: 1, width: 7, height: 4, suggestedBlock: "text", label: "Main Content" },
      { name: "sidebar", x: 7, y: 1, width: 5, height: 4, suggestedBlock: "callout", label: "Sidebar" },
    ],
  },
  {
    id: "content-three-col",
    name: "Three Columns",
    category: "content",
    description: "Equal three-column layout with cards",
    icon: "M3 4h5v16H3zM9 4h6v16H9zM16 4h5v16h-5z",
    gridTemplate: `
      "h h h h h h h h h h h h"
      "a a a a b b b b c c c c"
      "a a a a b b b b c c c c"
      "a a a a b b b b c c c c"
      "a a a a b b b b c c c c"
      ". . . . . . . . . . . ."
    `,
    zones: [
      { name: "heading", x: 0, y: 0, width: 12, height: 1, suggestedBlock: "heading", label: "Heading" },
      { name: "col1", x: 0, y: 1, width: 4, height: 4, suggestedBlock: "text", label: "Column 1" },
      { name: "col2", x: 4, y: 1, width: 4, height: 4, suggestedBlock: "text", label: "Column 2" },
      { name: "col3", x: 8, y: 1, width: 4, height: 4, suggestedBlock: "text", label: "Column 3" },
    ],
  },
  {
    id: "content-hero-text",
    name: "Hero + Text",
    category: "content",
    description: "Large image top, text below",
    icon: "M2.25 15.75l5.159-5.159",
    gridTemplate: `
      "i i i i i i i i i i i i"
      "i i i i i i i i i i i i"
      "i i i i i i i i i i i i"
      "h h h h h h h h h h h h"
      "t t t t t t t t t t t t"
      "t t t t t t t t t t t t"
    `,
    zones: [
      { name: "image", x: 0, y: 0, width: 12, height: 3, suggestedBlock: "image", label: "Hero Image" },
      { name: "heading", x: 0, y: 3, width: 12, height: 1, suggestedBlock: "heading", label: "Heading" },
      { name: "text", x: 0, y: 4, width: 12, height: 2, suggestedBlock: "text", label: "Body" },
    ],
  },
  {
    id: "content-quote-focus",
    name: "Quote Focus",
    category: "content",
    description: "Centered quote with attribution",
    icon: "M7.5 8.25h9M7.5 12H12",
    gridTemplate: `
      ". . . . . . . . . . . ."
      ". . q q q q q q q q . ."
      ". . q q q q q q q q . ."
      ". . q q q q q q q q . ."
      ". . . . . . . . . . . ."
      ". . . . . . . . . . . ."
    `,
    zones: [
      { name: "quote", x: 2, y: 1, width: 8, height: 3, suggestedBlock: "quote", label: "Quote" },
    ],
  },
  {
    id: "content-sidebar-left",
    name: "Left Sidebar",
    category: "content",
    description: "Narrow left panel with main content",
    icon: "M3 4h5v16H3zM9 4h12v16H9z",
    gridTemplate: `
      "h h h h h h h h h h h h"
      "s s s . m m m m m m m m"
      "s s s . m m m m m m m m"
      "s s s . m m m m m m m m"
      "s s s . m m m m m m m m"
      ". . . . . . . . . . . ."
    `,
    zones: [
      { name: "heading", x: 0, y: 0, width: 12, height: 1, suggestedBlock: "heading", label: "Heading" },
      { name: "sidebar", x: 0, y: 1, width: 3, height: 4, suggestedBlock: "callout", label: "Key Point" },
      { name: "main", x: 4, y: 1, width: 8, height: 4, suggestedBlock: "bullet-list", label: "Content" },
    ],
  },
  {
    id: "content-cards",
    name: "Card Grid",
    category: "content",
    description: "Heading with card group below",
    icon: "M3.75 6A2.25 2.25 0 016 3.75h2.25",
    gridTemplate: `
      "h h h h h h h h h h h h"
      "c c c c c c c c c c c c"
      "c c c c c c c c c c c c"
      "c c c c c c c c c c c c"
      "c c c c c c c c c c c c"
      ". . . . . . . . . . . ."
    `,
    zones: [
      { name: "heading", x: 0, y: 0, width: 12, height: 1, suggestedBlock: "heading", label: "Heading" },
      { name: "cards", x: 0, y: 1, width: 12, height: 4, suggestedBlock: "card-group", label: "Cards" },
    ],
  },
];

/* ================================================================== */
/*  Data Layouts (4)                                                   */
/* ================================================================== */

const dataLayouts: SlideLayout[] = [
  {
    id: "data-metrics",
    name: "Metric Grid",
    category: "data",
    description: "Four key metrics in a 2×2 grid",
    icon: "M3 3v18h18M7 16V8m4 8V5m4 11v-4m4 4V9",
    gridTemplate: `
      "h h h h h h h h h h h h"
      "a a a a a a b b b b b b"
      "a a a a a a b b b b b b"
      "c c c c c c d d d d d d"
      "c c c c c c d d d d d d"
      ". . . . . . . . . . . ."
    `,
    zones: [
      { name: "heading", x: 0, y: 0, width: 12, height: 1, suggestedBlock: "heading", label: "Heading" },
      { name: "metric1", x: 0, y: 1, width: 6, height: 2, suggestedBlock: "metric", label: "Metric 1" },
      { name: "metric2", x: 6, y: 1, width: 6, height: 2, suggestedBlock: "metric", label: "Metric 2" },
      { name: "metric3", x: 0, y: 3, width: 6, height: 2, suggestedBlock: "metric", label: "Metric 3" },
      { name: "metric4", x: 6, y: 3, width: 6, height: 2, suggestedBlock: "metric", label: "Metric 4" },
    ],
  },
  {
    id: "data-chart-full",
    name: "Full Chart",
    category: "data",
    description: "Chart with heading and description",
    icon: "M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z",
    gridTemplate: `
      "h h h h h h h h h h h h"
      "c c c c c c c c c c c c"
      "c c c c c c c c c c c c"
      "c c c c c c c c c c c c"
      "c c c c c c c c c c c c"
      "t t t t t t t t t t t t"
    `,
    zones: [
      { name: "heading", x: 0, y: 0, width: 12, height: 1, suggestedBlock: "heading", label: "Heading" },
      { name: "chart", x: 0, y: 1, width: 12, height: 4, suggestedBlock: "chart", label: "Chart" },
      { name: "caption", x: 0, y: 5, width: 12, height: 1, suggestedBlock: "text", label: "Caption" },
    ],
  },
  {
    id: "data-chart-commentary",
    name: "Chart + Commentary",
    category: "data",
    description: "Chart on left, key insights on right",
    icon: "M3 3v18h18M7 16V8",
    gridTemplate: `
      "h h h h h h h h h h h h"
      "c c c c c c c c t t t t"
      "c c c c c c c c t t t t"
      "c c c c c c c c t t t t"
      "c c c c c c c c t t t t"
      ". . . . . . . . . . . ."
    `,
    zones: [
      { name: "heading", x: 0, y: 0, width: 12, height: 1, suggestedBlock: "heading", label: "Heading" },
      { name: "chart", x: 0, y: 1, width: 8, height: 4, suggestedBlock: "chart", label: "Chart" },
      { name: "insights", x: 8, y: 1, width: 4, height: 4, suggestedBlock: "bullet-list", label: "Key Insights" },
    ],
  },
  {
    id: "data-comparison",
    name: "Comparison Table",
    category: "data",
    description: "Side-by-side feature comparison",
    icon: "M9 4.5v15m6-15v15",
    gridTemplate: `
      "h h h h h h h h h h h h"
      "r r r r r r r r r r r r"
      "r r r r r r r r r r r r"
      "r r r r r r r r r r r r"
      "r r r r r r r r r r r r"
      ". . . . . . . . . . . ."
    `,
    zones: [
      { name: "heading", x: 0, y: 0, width: 12, height: 1, suggestedBlock: "heading", label: "Heading" },
      { name: "row1", x: 0, y: 1, width: 12, height: 1, suggestedBlock: "comparison-row", label: "Feature 1" },
      { name: "row2", x: 0, y: 2, width: 12, height: 1, suggestedBlock: "comparison-row", label: "Feature 2" },
      { name: "row3", x: 0, y: 3, width: 12, height: 1, suggestedBlock: "comparison-row", label: "Feature 3" },
      { name: "row4", x: 0, y: 4, width: 12, height: 1, suggestedBlock: "comparison-row", label: "Feature 4" },
    ],
  },
];

/* ================================================================== */
/*  Team Layouts (3)                                                   */
/* ================================================================== */

const teamLayouts: SlideLayout[] = [
  {
    id: "team-grid",
    name: "Team Grid",
    category: "team",
    description: "3-column team member grid",
    icon: "M15 19.128a9.38 9.38 0 002.625.372",
    gridTemplate: `
      "h h h h h h h h h h h h"
      "a a a a b b b b c c c c"
      "a a a a b b b b c c c c"
      "a a a a b b b b c c c c"
      "a a a a b b b b c c c c"
      ". . . . . . . . . . . ."
    `,
    zones: [
      { name: "heading", x: 0, y: 0, width: 12, height: 1, suggestedBlock: "heading", label: "Heading" },
      { name: "member1", x: 0, y: 1, width: 4, height: 4, suggestedBlock: "team-member", label: "Team Member 1" },
      { name: "member2", x: 4, y: 1, width: 4, height: 4, suggestedBlock: "team-member", label: "Team Member 2" },
      { name: "member3", x: 8, y: 1, width: 4, height: 4, suggestedBlock: "team-member", label: "Team Member 3" },
    ],
  },
  {
    id: "team-featured",
    name: "Featured + Grid",
    category: "team",
    description: "One large founder + smaller team",
    icon: "M12 6.375a3.375 3.375 0 11-6.75 0",
    gridTemplate: `
      "h h h h h h h h h h h h"
      "f f f f f f a a a b b b"
      "f f f f f f a a a b b b"
      "f f f f f f c c c d d d"
      "f f f f f f c c c d d d"
      ". . . . . . . . . . . ."
    `,
    zones: [
      { name: "heading", x: 0, y: 0, width: 12, height: 1, suggestedBlock: "heading", label: "Heading" },
      { name: "featured", x: 0, y: 1, width: 6, height: 4, suggestedBlock: "team-member", label: "Founder/CEO" },
      { name: "member1", x: 6, y: 1, width: 3, height: 2, suggestedBlock: "team-member", label: "Team Member" },
      { name: "member2", x: 9, y: 1, width: 3, height: 2, suggestedBlock: "team-member", label: "Team Member" },
      { name: "member3", x: 6, y: 3, width: 3, height: 2, suggestedBlock: "team-member", label: "Team Member" },
      { name: "member4", x: 9, y: 3, width: 3, height: 2, suggestedBlock: "team-member", label: "Team Member" },
    ],
  },
  {
    id: "team-advisors",
    name: "Advisors Row",
    category: "team",
    description: "Team heading with advisor logos below",
    icon: "M18 18.72a9.094 9.094 0 003.741-.479",
    gridTemplate: `
      "h h h h h h h h h h h h"
      "t t t t t t t t t t t t"
      "t t t t t t t t t t t t"
      "t t t t t t t t t t t t"
      "l l l l l l l l l l l l"
      "l l l l l l l l l l l l"
    `,
    zones: [
      { name: "heading", x: 0, y: 0, width: 12, height: 1, suggestedBlock: "heading", label: "Heading" },
      { name: "team", x: 0, y: 1, width: 12, height: 3, suggestedBlock: "card-group", label: "Core Team" },
      { name: "advisors", x: 0, y: 4, width: 12, height: 2, suggestedBlock: "logo-grid", label: "Advisors / Partners" },
    ],
  },
];

/* ================================================================== */
/*  Full library                                                       */
/* ================================================================== */

export const LAYOUT_LIBRARY: SlideLayout[] = [
  ...titleLayouts,
  ...contentLayouts,
  ...dataLayouts,
  ...teamLayouts,
];

/** Get all layouts for a specific category */
export function getLayoutsByCategory(category: SlideLayout["category"]): SlideLayout[] {
  return LAYOUT_LIBRARY.filter((l) => l.category === category);
}

/** Get a single layout by ID */
export function getLayoutById(id: string): SlideLayout | undefined {
  return LAYOUT_LIBRARY.find((l) => l.id === id);
}
