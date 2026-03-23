import type { CompanyDNA, NarrativeArchetype } from "./company-dna";
import type { ExpandedSlideType } from "./slide-types";
import type { CompositionPattern, CompositionCategory } from "./compositions";
import { pickComposition } from "./compositions";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type EmotionalBeat =
  | "hook" | "tension" | "revelation" | "proof"
  | "credibility" | "urgency" | "excitement" | "confidence" | "action";

export interface SlideBlueprint {
  id: string;
  purpose: string;
  keyMessage: string;
  emotionalBeat: EmotionalBeat;
  slideType: ExpandedSlideType;
  composition: CompositionPattern;
  density: "splash" | "standard" | "data-dense";
  isVisualPeak: boolean;
  contentHints: string[];
  narrativePosition: number;
}

export interface DeckNarrative {
  archetype: NarrativeArchetype;
  title: string;
  slideCount: number;
  slides: SlideBlueprint[];
  throughLine: string;
  openingHook: string;
  closingStrategy: string;
}

/* ------------------------------------------------------------------ */
/*  Framework Definitions (per archetype)                              */
/* ------------------------------------------------------------------ */

interface FrameworkSlot {
  purpose: string;
  emotionalBeat: EmotionalBeat;
  slideType: ExpandedSlideType;
  density: "splash" | "standard" | "data-dense";
  isVisualPeak: boolean;
  preferredCategory?: CompositionCategory;
  contentHints: string[];
  /** If true, only include when company DNA condition is met */
  condition?: (dna: CompanyDNA) => boolean;
}

const DISRUPTOR_FRAMEWORK: FrameworkSlot[] = [
  { purpose: "hook", emotionalBeat: "hook", slideType: "stat-hook", density: "splash", isVisualPeak: true, preferredCategory: "emphasis", contentHints: ["Shocking industry statistic", "Scale of the problem"] },
  { purpose: "broken-status-quo", emotionalBeat: "tension", slideType: "problem-visual", density: "standard", isVisualPeak: false, preferredCategory: "split", contentHints: ["Current painful reality", "Who suffers and why"] },
  { purpose: "cost-of-problem", emotionalBeat: "tension", slideType: "problem-data", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["Quantified cost of the problem", "Market waste/inefficiency"], condition: (dna) => dna.hasMarketData },
  { purpose: "the-revolution", emotionalBeat: "revelation", slideType: "solution-reveal", density: "splash", isVisualPeak: true, preferredCategory: "hero", contentHints: ["Product introduction", "How it changes everything"] },
  { purpose: "how-it-works", emotionalBeat: "credibility", slideType: "how-it-works", density: "standard", isVisualPeak: false, preferredCategory: "content-forward", contentHints: ["Step-by-step process", "Key differentiators"] },
  { purpose: "product-demo", emotionalBeat: "proof", slideType: "product-showcase", density: "standard", isVisualPeak: false, preferredCategory: "visual-forward", contentHints: ["Product screenshot or mockup", "Key features"], condition: (dna) => dna.hasProduct },
  { purpose: "proof-it-works", emotionalBeat: "proof", slideType: "metrics-dashboard", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["Key traction metrics", "Growth numbers"], condition: (dna) => dna.hasTraction },
  { purpose: "market-opportunity", emotionalBeat: "excitement", slideType: "market-sizing", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["TAM/SAM/SOM", "Market growth rate"] },
  { purpose: "competitive-edge", emotionalBeat: "credibility", slideType: "competitive-matrix", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["Feature comparison", "Competitive advantages"], condition: (dna) => dna.hasCompetitiveMoat },
  { purpose: "social-proof", emotionalBeat: "credibility", slideType: "social-proof", density: "standard", isVisualPeak: false, preferredCategory: "team-social", contentHints: ["Customer logos", "Partnerships", "Press"], condition: (dna) => dna.hasTraction },
  { purpose: "business-model", emotionalBeat: "confidence", slideType: "business-model", density: "standard", isVisualPeak: false, preferredCategory: "content-forward", contentHints: ["Revenue model", "Pricing strategy"] },
  { purpose: "team", emotionalBeat: "credibility", slideType: "team-grid", density: "standard", isVisualPeak: false, preferredCategory: "team-social", contentHints: ["Founder backgrounds", "Key hires"] },
  { purpose: "roadmap", emotionalBeat: "excitement", slideType: "roadmap", density: "standard", isVisualPeak: false, preferredCategory: "content-forward", contentHints: ["Next 12-18 months", "Key milestones"] },
  { purpose: "the-ask", emotionalBeat: "urgency", slideType: "the-ask", density: "data-dense", isVisualPeak: true, preferredCategory: "emphasis", contentHints: ["Funding amount", "Use of funds breakdown"] },
  { purpose: "closing", emotionalBeat: "action", slideType: "cta", density: "splash", isVisualPeak: true, preferredCategory: "hero", contentHints: ["Company vision", "Call to action"] },
];

const TRACTION_MACHINE_FRAMEWORK: FrameworkSlot[] = [
  { purpose: "headline-metric", emotionalBeat: "hook", slideType: "stat-hook", density: "splash", isVisualPeak: true, preferredCategory: "emphasis", contentHints: ["#1 growth metric", "Most impressive number"] },
  { purpose: "growth-trajectory", emotionalBeat: "excitement", slideType: "growth-chart", density: "data-dense", isVisualPeak: true, preferredCategory: "data-forward", contentHints: ["Revenue/user growth chart", "Month-over-month growth"] },
  { purpose: "what-drives-growth", emotionalBeat: "credibility", slideType: "how-it-works", density: "standard", isVisualPeak: false, preferredCategory: "content-forward", contentHints: ["Growth engine breakdown", "Key growth drivers"] },
  { purpose: "unit-economics", emotionalBeat: "proof", slideType: "unit-economics", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["CAC, LTV, margins", "Unit economics breakdown"], condition: (dna) => dna.hasRevenue },
  { purpose: "full-metrics", emotionalBeat: "proof", slideType: "metrics-dashboard", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["All key KPIs", "Performance dashboard"] },
  { purpose: "product", emotionalBeat: "credibility", slideType: "product-showcase", density: "standard", isVisualPeak: false, preferredCategory: "visual-forward", contentHints: ["Product screenshot", "Key features"], condition: (dna) => dna.hasProduct },
  { purpose: "market-size", emotionalBeat: "excitement", slideType: "market-sizing", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["TAM/SAM/SOM", "Market opportunity"] },
  { purpose: "competitive-edge", emotionalBeat: "confidence", slideType: "competitive-matrix", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["Feature comparison vs competitors"] },
  { purpose: "social-proof", emotionalBeat: "credibility", slideType: "social-proof", density: "standard", isVisualPeak: false, preferredCategory: "team-social", contentHints: ["Customer logos", "Testimonials"] },
  { purpose: "team", emotionalBeat: "credibility", slideType: "team-grid", density: "standard", isVisualPeak: false, preferredCategory: "team-social", contentHints: ["Team backgrounds"] },
  { purpose: "financials", emotionalBeat: "confidence", slideType: "growth-chart", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["Revenue projections", "Path to profitability"] },
  { purpose: "the-ask", emotionalBeat: "urgency", slideType: "the-ask", density: "data-dense", isVisualPeak: true, preferredCategory: "emphasis", contentHints: ["Funding amount", "Use of funds"] },
  { purpose: "closing", emotionalBeat: "action", slideType: "cta", density: "splash", isVisualPeak: false, preferredCategory: "hero", contentHints: ["Contact info", "Next steps"] },
];

const VISION_FRAMEWORK: FrameworkSlot[] = [
  { purpose: "future-state", emotionalBeat: "hook", slideType: "statement", density: "splash", isVisualPeak: true, preferredCategory: "hero", contentHints: ["Bold vision of the future", "What the world looks like when you succeed"] },
  { purpose: "todays-reality", emotionalBeat: "tension", slideType: "problem-visual", density: "standard", isVisualPeak: false, preferredCategory: "split", contentHints: ["Gap between today and vision", "Why the status quo fails"] },
  { purpose: "the-bridge", emotionalBeat: "revelation", slideType: "solution-reveal", density: "splash", isVisualPeak: true, preferredCategory: "visual-forward", contentHints: ["Product as the bridge", "How you get from here to there"] },
  { purpose: "how-it-works", emotionalBeat: "credibility", slideType: "how-it-works", density: "standard", isVisualPeak: false, preferredCategory: "content-forward", contentHints: ["Product mechanics", "Key features"] },
  { purpose: "why-now", emotionalBeat: "urgency", slideType: "market-landscape", density: "standard", isVisualPeak: false, preferredCategory: "content-forward", contentHints: ["Market timing", "Enabling trends"] },
  { purpose: "early-proof", emotionalBeat: "proof", slideType: "metrics-dashboard", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["Early traction or validation", "Key metrics"], condition: (dna) => dna.hasTraction },
  { purpose: "market-size", emotionalBeat: "excitement", slideType: "market-sizing", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["Market opportunity size"] },
  { purpose: "business-model", emotionalBeat: "confidence", slideType: "business-model", density: "standard", isVisualPeak: false, preferredCategory: "content-forward", contentHints: ["How you'll make money"] },
  { purpose: "team", emotionalBeat: "credibility", slideType: "team-featured", density: "standard", isVisualPeak: false, preferredCategory: "team-social", contentHints: ["Why this team can build this vision"] },
  { purpose: "roadmap", emotionalBeat: "excitement", slideType: "roadmap", density: "standard", isVisualPeak: false, preferredCategory: "content-forward", contentHints: ["Path from today to vision"] },
  { purpose: "the-ask", emotionalBeat: "urgency", slideType: "the-ask", density: "data-dense", isVisualPeak: true, preferredCategory: "emphasis", contentHints: ["Funding amount", "What it unlocks"] },
  { purpose: "vision-close", emotionalBeat: "action", slideType: "vision-close", density: "splash", isVisualPeak: true, preferredCategory: "hero", contentHints: ["Return to the vision", "Bookend with opening"] },
];

const TEAM_STORY_FRAMEWORK: FrameworkSlot[] = [
  { purpose: "founder-origin", emotionalBeat: "hook", slideType: "title-hero", density: "splash", isVisualPeak: true, preferredCategory: "hero", contentHints: ["Founder's personal connection to the problem"] },
  { purpose: "problem-discovered", emotionalBeat: "tension", slideType: "problem-visual", density: "standard", isVisualPeak: false, preferredCategory: "split", contentHints: ["How the founder discovered the problem firsthand"] },
  { purpose: "solution-built", emotionalBeat: "revelation", slideType: "solution-reveal", density: "splash", isVisualPeak: true, preferredCategory: "visual-forward", contentHints: ["The product they built", "Origin story"] },
  { purpose: "how-it-works", emotionalBeat: "credibility", slideType: "how-it-works", density: "standard", isVisualPeak: false, preferredCategory: "content-forward", contentHints: ["Product walkthrough"] },
  { purpose: "early-traction", emotionalBeat: "proof", slideType: "data-highlight", density: "standard", isVisualPeak: false, preferredCategory: "emphasis", contentHints: ["Early wins", "Validation signals"], condition: (dna) => dna.hasTraction },
  { purpose: "market", emotionalBeat: "excitement", slideType: "market-sizing", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["Market opportunity"] },
  { purpose: "team-deep-dive", emotionalBeat: "credibility", slideType: "team-featured", density: "standard", isVisualPeak: true, preferredCategory: "team-social", contentHints: ["Full team with backgrounds", "Why this team is uniquely qualified"] },
  { purpose: "business-model", emotionalBeat: "confidence", slideType: "business-model", density: "standard", isVisualPeak: false, preferredCategory: "content-forward", contentHints: ["Revenue model"] },
  { purpose: "the-ask", emotionalBeat: "urgency", slideType: "the-ask", density: "data-dense", isVisualPeak: false, preferredCategory: "emphasis", contentHints: ["Funding amount", "What it enables"] },
  { purpose: "closing", emotionalBeat: "action", slideType: "cta", density: "splash", isVisualPeak: false, preferredCategory: "hero", contentHints: ["Personal appeal", "Contact info"] },
];

const DATA_STORY_FRAMEWORK: FrameworkSlot[] = [
  { purpose: "headline-metric", emotionalBeat: "hook", slideType: "stat-hook", density: "splash", isVisualPeak: true, preferredCategory: "emphasis", contentHints: ["Most impressive metric"] },
  { purpose: "how-we-got-here", emotionalBeat: "credibility", slideType: "growth-chart", density: "data-dense", isVisualPeak: true, preferredCategory: "data-forward", contentHints: ["Growth timeline", "Key inflection points"] },
  { purpose: "what-drives-it", emotionalBeat: "proof", slideType: "how-it-works", density: "standard", isVisualPeak: false, preferredCategory: "content-forward", contentHints: ["Growth drivers", "Product-market fit evidence"] },
  { purpose: "product", emotionalBeat: "credibility", slideType: "product-showcase", density: "standard", isVisualPeak: false, preferredCategory: "visual-forward", contentHints: ["Product visualization"], condition: (dna) => dna.hasProduct },
  { purpose: "unit-economics", emotionalBeat: "proof", slideType: "unit-economics", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["CAC, LTV, margins"], condition: (dna) => dna.hasRevenue },
  { purpose: "market-context", emotionalBeat: "excitement", slideType: "market-sizing", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["Market size relative to traction"] },
  { purpose: "competition", emotionalBeat: "confidence", slideType: "competitive-matrix", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["Competitive landscape"] },
  { purpose: "social-proof", emotionalBeat: "credibility", slideType: "social-proof", density: "standard", isVisualPeak: false, preferredCategory: "team-social", contentHints: ["Customer logos", "Case studies"] },
  { purpose: "team", emotionalBeat: "credibility", slideType: "team-grid", density: "standard", isVisualPeak: false, preferredCategory: "team-social", contentHints: ["Team backgrounds"] },
  { purpose: "projection", emotionalBeat: "excitement", slideType: "growth-chart", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["Revenue projections"] },
  { purpose: "the-ask", emotionalBeat: "urgency", slideType: "the-ask", density: "data-dense", isVisualPeak: true, preferredCategory: "emphasis", contentHints: ["Funding and use of funds"] },
  { purpose: "closing", emotionalBeat: "action", slideType: "cta", density: "splash", isVisualPeak: false, preferredCategory: "hero", contentHints: ["Next steps"] },
];

const INEVITABLE_TREND_FRAMEWORK: FrameworkSlot[] = [
  { purpose: "macro-trend", emotionalBeat: "hook", slideType: "statement", density: "splash", isVisualPeak: true, preferredCategory: "hero", contentHints: ["The unstoppable trend"] },
  { purpose: "why-now", emotionalBeat: "urgency", slideType: "data-highlight", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["Data proving the trend is accelerating"] },
  { purpose: "who-wins", emotionalBeat: "tension", slideType: "market-landscape", density: "standard", isVisualPeak: false, preferredCategory: "content-forward", contentHints: ["Who captures value in this trend"] },
  { purpose: "why-us", emotionalBeat: "revelation", slideType: "solution-reveal", density: "splash", isVisualPeak: true, preferredCategory: "visual-forward", contentHints: ["Our unique position to capture this trend"] },
  { purpose: "product", emotionalBeat: "credibility", slideType: "how-it-works", density: "standard", isVisualPeak: false, preferredCategory: "content-forward", contentHints: ["How our product rides this trend"] },
  { purpose: "traction", emotionalBeat: "proof", slideType: "metrics-dashboard", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["Traction metrics"], condition: (dna) => dna.hasTraction },
  { purpose: "market-size", emotionalBeat: "excitement", slideType: "market-sizing", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["Market created by this trend"] },
  { purpose: "social-proof", emotionalBeat: "credibility", slideType: "social-proof", density: "standard", isVisualPeak: false, preferredCategory: "team-social", contentHints: ["Early adopters", "Partners"] },
  { purpose: "team", emotionalBeat: "credibility", slideType: "team-grid", density: "standard", isVisualPeak: false, preferredCategory: "team-social", contentHints: ["Team positioned for this trend"] },
  { purpose: "roadmap", emotionalBeat: "confidence", slideType: "roadmap", density: "standard", isVisualPeak: false, preferredCategory: "content-forward", contentHints: ["How we ride the wave"] },
  { purpose: "the-ask", emotionalBeat: "urgency", slideType: "the-ask", density: "data-dense", isVisualPeak: true, preferredCategory: "emphasis", contentHints: ["Funding to capture the trend window"] },
  { purpose: "closing", emotionalBeat: "action", slideType: "cta", density: "splash", isVisualPeak: false, preferredCategory: "hero", contentHints: ["Act now — the window is closing"] },
];

const SECRET_INSIGHT_FRAMEWORK: FrameworkSlot[] = [
  { purpose: "non-obvious-insight", emotionalBeat: "hook", slideType: "statement", density: "splash", isVisualPeak: true, preferredCategory: "emphasis", contentHints: ["The counterintuitive truth"] },
  { purpose: "why-others-are-wrong", emotionalBeat: "tension", slideType: "problem-data", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["Evidence that conventional wisdom fails"] },
  { purpose: "our-approach", emotionalBeat: "revelation", slideType: "solution-reveal", density: "standard", isVisualPeak: true, preferredCategory: "split", contentHints: ["Our contrarian approach"] },
  { purpose: "how-it-works", emotionalBeat: "credibility", slideType: "how-it-works", density: "standard", isVisualPeak: false, preferredCategory: "content-forward", contentHints: ["Product mechanics"] },
  { purpose: "proof", emotionalBeat: "proof", slideType: "metrics-dashboard", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["Evidence our approach works"], condition: (dna) => dna.hasTraction },
  { purpose: "market-implications", emotionalBeat: "excitement", slideType: "market-sizing", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["If we're right, the market is..."] },
  { purpose: "competition", emotionalBeat: "confidence", slideType: "competitive-matrix", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["Why competitors miss this"], condition: (dna) => dna.hasCompetitiveMoat },
  { purpose: "team", emotionalBeat: "credibility", slideType: "team-featured", density: "standard", isVisualPeak: false, preferredCategory: "team-social", contentHints: ["Why we see what others don't"] },
  { purpose: "the-ask", emotionalBeat: "urgency", slideType: "the-ask", density: "data-dense", isVisualPeak: true, preferredCategory: "emphasis", contentHints: ["Funding to prove the thesis"] },
  { purpose: "closing", emotionalBeat: "action", slideType: "cta", density: "splash", isVisualPeak: false, preferredCategory: "hero", contentHints: ["The bet: contrarian and right"] },
];

const PROVEN_MODEL_FRAMEWORK: FrameworkSlot[] = [
  { purpose: "existing-success", emotionalBeat: "hook", slideType: "stat-hook", density: "splash", isVisualPeak: true, preferredCategory: "emphasis", contentHints: ["The proven model that works elsewhere"] },
  { purpose: "new-market", emotionalBeat: "excitement", slideType: "market-landscape", density: "standard", isVisualPeak: false, preferredCategory: "content-forward", contentHints: ["Why this market is ready"] },
  { purpose: "our-adaptation", emotionalBeat: "revelation", slideType: "solution-reveal", density: "standard", isVisualPeak: true, preferredCategory: "split", contentHints: ["How we adapt the model"] },
  { purpose: "how-it-works", emotionalBeat: "credibility", slideType: "how-it-works", density: "standard", isVisualPeak: false, preferredCategory: "content-forward", contentHints: ["Product walkthrough"] },
  { purpose: "traction", emotionalBeat: "proof", slideType: "metrics-dashboard", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["Early traction"], condition: (dna) => dna.hasTraction },
  { purpose: "why-market-is-different", emotionalBeat: "urgency", slideType: "market-sizing", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["Why this market is bigger/better"] },
  { purpose: "competition", emotionalBeat: "confidence", slideType: "competitive-matrix", density: "data-dense", isVisualPeak: false, preferredCategory: "data-forward", contentHints: ["Competitive landscape"] },
  { purpose: "team", emotionalBeat: "credibility", slideType: "team-grid", density: "standard", isVisualPeak: false, preferredCategory: "team-social", contentHints: ["Team expertise"] },
  { purpose: "expansion-plan", emotionalBeat: "excitement", slideType: "roadmap", density: "standard", isVisualPeak: false, preferredCategory: "content-forward", contentHints: ["Geographic/market expansion"] },
  { purpose: "the-ask", emotionalBeat: "urgency", slideType: "the-ask", density: "data-dense", isVisualPeak: true, preferredCategory: "emphasis", contentHints: ["Funding and milestones"] },
  { purpose: "closing", emotionalBeat: "action", slideType: "cta", density: "splash", isVisualPeak: false, preferredCategory: "hero", contentHints: ["Join the proven model"] },
];

/* ------------------------------------------------------------------ */
/*  Framework Registry                                                 */
/* ------------------------------------------------------------------ */

const FRAMEWORKS: Record<NarrativeArchetype, FrameworkSlot[]> = {
  "disruptor": DISRUPTOR_FRAMEWORK,
  "inevitable-trend": INEVITABLE_TREND_FRAMEWORK,
  "data-story": DATA_STORY_FRAMEWORK,
  "vision": VISION_FRAMEWORK,
  "secret-insight": SECRET_INSIGHT_FRAMEWORK,
  "proven-model": PROVEN_MODEL_FRAMEWORK,
  "team-story": TEAM_STORY_FRAMEWORK,
  "traction-machine": TRACTION_MACHINE_FRAMEWORK,
};

/* ------------------------------------------------------------------ */
/*  Narrative Designer                                                 */
/* ------------------------------------------------------------------ */

export function designNarrative(dna: CompanyDNA): DeckNarrative {
  const framework = FRAMEWORKS[dna.narrativeArchetype] || FRAMEWORKS["vision"];

  // Filter slots based on company DNA conditions
  const activeSlots = framework.filter((slot) => !slot.condition || slot.condition(dna));

  // Ensure density rhythm: no more than 2 data-dense in a row
  const rhythmAdjusted = enforceDensityRhythm(activeSlots);

  // Assign compositions with variety
  const recentCategories: CompositionCategory[] = [];
  const slides: SlideBlueprint[] = rhythmAdjusted.map((slot, index) => {
    const composition = pickComposition(
      dna.visualPersonality,
      slot.density,
      recentCategories.slice(-2),
      slot.preferredCategory,
    );
    recentCategories.push(composition.category);

    return {
      id: `slide-${index}`,
      purpose: slot.purpose,
      keyMessage: buildKeyMessage(slot, dna),
      emotionalBeat: slot.emotionalBeat,
      slideType: slot.slideType,
      composition,
      density: slot.density,
      isVisualPeak: slot.isVisualPeak,
      contentHints: slot.contentHints,
      narrativePosition: index / Math.max(rhythmAdjusted.length - 1, 1),
    };
  });

  // Ensure visual peaks are well-distributed
  distributeVisualPeaks(slides);

  return {
    archetype: dna.narrativeArchetype,
    title: `${dna.companyName} Pitch Deck`,
    slideCount: slides.length,
    slides,
    throughLine: dna.keyTension,
    openingHook: buildOpeningHook(dna),
    closingStrategy: buildClosingStrategy(dna),
  };
}

/** Heuristic narrative design (no AI) */
export function designNarrativeHeuristic(dna: CompanyDNA): DeckNarrative {
  return designNarrative(dna);
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function enforceDensityRhythm(slots: FrameworkSlot[]): FrameworkSlot[] {
  const result: FrameworkSlot[] = [];
  let consecutiveDataDense = 0;

  for (const slot of slots) {
    if (slot.density === "data-dense") {
      consecutiveDataDense++;
      if (consecutiveDataDense > 2) {
        // Force a breather — change density to standard
        result.push({ ...slot, density: "standard" });
        consecutiveDataDense = 0;
        continue;
      }
    } else {
      consecutiveDataDense = 0;
    }
    result.push(slot);
  }
  return result;
}

function distributeVisualPeaks(slides: SlideBlueprint[]): void {
  // Ensure visual peaks at roughly 0.0, 0.3-0.5, 0.7-0.8, 0.9-1.0
  const targetPositions = [0, 0.35, 0.75, 0.95];
  const currentPeaks = slides.filter((s) => s.isVisualPeak);

  if (currentPeaks.length < 3) {
    // Add peaks at target positions
    for (const targetPos of targetPositions) {
      const bestIndex = Math.round(targetPos * (slides.length - 1));
      const slide = slides[bestIndex];
      if (slide && !slide.isVisualPeak) {
        slide.isVisualPeak = true;
      }
    }
  }

  // Cap at 5 visual peaks
  let peakCount = 0;
  for (const slide of slides) {
    if (slide.isVisualPeak) {
      peakCount++;
      if (peakCount > 5) slide.isVisualPeak = false;
    }
  }
}

function buildKeyMessage(slot: FrameworkSlot, dna: CompanyDNA): string {
  const messages: Record<string, string> = {
    "hook": `Why ${dna.industry || "this market"} can't stay the way it is`,
    "broken-status-quo": `The painful reality of ${dna.industry || "the current market"}`,
    "cost-of-problem": "The quantified cost of doing nothing",
    "the-revolution": `How ${dna.companyName} changes everything`,
    "how-it-works": `${dna.companyName}'s approach in 3 steps`,
    "product-demo": `See ${dna.companyName} in action`,
    "proof-it-works": "The numbers don't lie",
    "market-opportunity": "The size of the opportunity",
    "competitive-edge": `Why ${dna.companyName} wins`,
    "social-proof": "Trusted by industry leaders",
    "business-model": "How we make money",
    "team": "The team that makes it happen",
    "roadmap": "Where we're going",
    "the-ask": `${dna.fundingTarget || "Investment"} to accelerate growth`,
    "closing": `Join the ${dna.companyName} journey`,
  };
  return messages[slot.purpose] || slot.contentHints[0] || slot.purpose;
}

function buildOpeningHook(dna: CompanyDNA): string {
  switch (dna.narrativeArchetype) {
    case "disruptor": return "Open with a shocking statistic that exposes the broken status quo";
    case "traction-machine": return "Lead with the single most impressive growth metric";
    case "vision": return "Paint a vivid picture of the future state";
    case "team-story": return "Start with the founder's personal connection to the problem";
    case "data-story": return "Open with the headline metric that demands attention";
    case "inevitable-trend": return "Present the unstoppable macro trend";
    case "secret-insight": return "Share the non-obvious insight that everyone else is missing";
    case "proven-model": return "Reference the proven success story being adapted";
    default: return "Hook with a compelling opening";
  }
}

function buildClosingStrategy(dna: CompanyDNA): string {
  switch (dna.narrativeArchetype) {
    case "disruptor": return "End with urgency — the revolution is happening with or without them";
    case "vision": return "Bookend: return to the future vision, now made tangible";
    case "team-story": return "Personal appeal from the founder";
    default: return "Clear ask with specific next steps";
  }
}
