/**
 * Deck Generation Pipeline — barrel export
 *
 * Multi-phase generation: DNA → Narrative → Visual System → Per-Slide → Coherence → Enrichment
 */

export { analyzeCompanyDNA, analyzeCompanyDNAHeuristic } from "./company-dna";
export type { CompanyDNA, NarrativeArchetype, VisualPersonality } from "./company-dna";

export { designNarrative, designNarrativeHeuristic } from "./narrative-architect";
export type { SlideBlueprint, DeckNarrative, EmotionalBeat } from "./narrative-architect";

export { ALL_COMPOSITIONS, getComposition, getCompatibleCompositions, pickComposition } from "./compositions";
export type { CompositionPattern, CompositionZone, CompositionCategory } from "./compositions";

export type { ExpandedSlideType } from "./slide-types";
export { toLegacySlideType } from "./slide-types";

export { generateVisualSystem } from "./visual-system";
export type { VisualSystem } from "./visual-system";

export { generateSlide, generateAllSlides } from "./slide-generator";

export { reviewDeckCoherence } from "./coherence-reviewer";
export type { CoherenceIssue } from "./coherence-reviewer";

export { enrichSlidesWithImages, searchImage, enhanceImagePrompt } from "./image-intelligence";

export { mapSlideToBlocks } from "./slide-to-blocks";
