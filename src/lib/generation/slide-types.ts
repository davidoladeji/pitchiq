/* ------------------------------------------------------------------ */
/*  Expanded Slide Type Vocabulary                                     */
/*  25+ purpose-driven slide types replacing the flat 12-type system   */
/* ------------------------------------------------------------------ */

export type ExpandedSlideType =
  // Openers
  | "title-hero"
  | "statement"
  | "stat-hook"
  // Problem / opportunity
  | "problem-visual"
  | "problem-data"
  | "market-landscape"
  // Solution
  | "solution-reveal"
  | "how-it-works"
  | "product-showcase"
  | "before-after"
  // Traction & data
  | "metrics-dashboard"
  | "growth-chart"
  | "unit-economics"
  | "data-highlight"
  // Credibility
  | "social-proof"
  | "case-study"
  | "team-grid"
  | "team-featured"
  | "advisors"
  // Strategy
  | "competitive-matrix"
  | "market-sizing"
  | "business-model"
  | "go-to-market"
  | "roadmap"
  // Close
  | "the-ask"
  | "vision-close"
  | "cta";

/**
 * Map expanded slide types back to the legacy SlideData.type values
 * for backward compatibility with SlideRenderer.
 */
export function toLegacySlideType(expanded: ExpandedSlideType): string {
  const MAP: Record<ExpandedSlideType, string> = {
    "title-hero": "title",
    "statement": "content",
    "stat-hook": "stats",
    "problem-visual": "image-content",
    "problem-data": "content",
    "market-landscape": "content",
    "solution-reveal": "image-content",
    "how-it-works": "timeline",
    "product-showcase": "image-content",
    "before-after": "content",
    "metrics-dashboard": "metrics",
    "growth-chart": "chart",
    "unit-economics": "chart",
    "data-highlight": "stats",
    "social-proof": "logo-grid",
    "case-study": "content",
    "team-grid": "team",
    "team-featured": "team",
    "advisors": "team",
    "competitive-matrix": "table",
    "market-sizing": "chart",
    "business-model": "content",
    "go-to-market": "timeline",
    "roadmap": "timeline",
    "the-ask": "chart",
    "vision-close": "content",
    "cta": "cta",
  };
  return MAP[expanded] || "content";
}
