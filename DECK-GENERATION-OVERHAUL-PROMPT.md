# Claude Code Prompt: Deck Generation Overhaul — Multi-Phase Pipeline

> Paste this entire prompt into Claude Code in **Act mode**. Do not ask questions — implement everything described below. This is a large feature — work through it phase by phase.

---

## Context

You are working on the PitchIQ codebase (`usepitchiq.com`), a Next.js 14 + TypeScript + Prisma + PostgreSQL app. The current deck generation (`src/lib/generate-deck.ts`) produces sameness: every deck uses the same 15-slide order, same 5 layouts, same visual structure. A fintech deck is indistinguishable from a gaming deck. This needs to change fundamentally.

**The current approach**: One Claude API call → 6,000 tokens → entire deck. All slides generated simultaneously with a rigid prescribed order and limited layout vocabulary.

**The new approach**: A multi-phase pipeline where each stage has a specialized role. The AI first understands the company, then designs a custom narrative arc, then creates a visual system, then generates each slide individually, then reviews the whole for coherence.

**Read `DECK-GENERATION-RESEARCH.md` in the project root** for the full analysis backing these decisions.

---

## PHASE 1: Company DNA Analyzer

### 1A. Create `src/lib/generation/company-dna.ts`

This module takes the user's input and produces a rich "Company DNA" profile that drives all downstream decisions.

```typescript
export interface CompanyDNA {
  // Core identity
  companyName: string;
  industry: string;
  stage: string;
  fundingTarget: string;

  // Derived intelligence
  narrativeArchetype: NarrativeArchetype;
  visualPersonality: VisualPersonality;
  informationDensity: "data-heavy" | "vision-heavy" | "balanced";
  contentTone: "technical" | "visionary" | "professional" | "bold" | "scientific";
  keyTension: string;          // "The central conflict this deck resolves"
  uniqueAngle: string;         // What makes THIS company's story different
  audienceProfile: string;     // What this investor type cares about most

  // Content strength assessment
  hasTraction: boolean;        // Has meaningful metrics to show
  hasProduct: boolean;         // Has a working product (not just idea)
  hasRevenue: boolean;
  hasTeamCredibility: boolean; // Repeat founders, notable backgrounds
  hasCompetitiveMoat: boolean;
  hasMarketData: boolean;

  // Visual inputs
  brandColor?: string;
  brandFont?: string;
  brandLogo?: string;
}

export type NarrativeArchetype =
  | "disruptor"           // Shocking stat → broken status quo → revolution
  | "inevitable-trend"    // Macro trend → why now → who wins
  | "data-story"          // Headline metric → how we got here → projection
  | "vision"              // Future state → today's reality → bridge
  | "secret-insight"      // Non-obvious insight → why others are wrong
  | "proven-model"        // Existing model → new market adaptation
  | "team-story"          // Founder origin → problem → solution (angel-optimized)
  | "traction-machine";   // Key metric → growth → what drives it (Series A+)

export type VisualPersonality =
  | "corporate-premium"    // Fintech, enterprise SaaS, B2B
  | "bold-playful"         // Consumer, social, gaming, D2C
  | "clinical-clean"       // Healthtech, biotech, medtech
  | "scientific-rigorous"  // Deeptech, research, hardware
  | "futuristic-gradient"  // Crypto, AI, frontier tech
  | "organic-hopeful"      // Climate, sustainability, agtech
  | "editorial-refined"    // Media, content, marketplace
  | "startup-energetic";   // General early-stage, accelerator

/**
 * Analyze inputs and produce Company DNA.
 * Uses AI to derive narrative archetype, visual personality, and content strategy.
 * Falls back to heuristics if no API key.
 */
export async function analyzeCompanyDNA(input: DeckInput): Promise<CompanyDNA>
```

**AI Prompt for DNA Analysis** (send to Claude Haiku for speed — this is a classification/analysis task):

```
Analyze this startup and determine the best storytelling strategy for their pitch deck.

Company: {companyName}
Industry: {industry}
Stage: {stage}
Funding Target: {fundingTarget}
Problem: {problem}
Solution: {solution}
Key Metrics: {keyMetrics}
Team: {teamInfo}
Investor Type: {investorType}

Return JSON:
{
  "narrativeArchetype": one of "disruptor" | "inevitable-trend" | "data-story" | "vision" | "secret-insight" | "proven-model" | "team-story" | "traction-machine",
  "visualPersonality": one of "corporate-premium" | "bold-playful" | "clinical-clean" | "scientific-rigorous" | "futuristic-gradient" | "organic-hopeful" | "editorial-refined" | "startup-energetic",
  "informationDensity": one of "data-heavy" | "vision-heavy" | "balanced",
  "contentTone": one of "technical" | "visionary" | "professional" | "bold" | "scientific",
  "keyTension": "one sentence describing the central conflict",
  "uniqueAngle": "what makes this company's story different from competitors",
  "hasTraction": boolean,
  "hasProduct": boolean,
  "hasRevenue": boolean,
  "hasTeamCredibility": boolean,
  "hasCompetitiveMoat": boolean,
  "hasMarketData": boolean
}

Rules for archetype selection:
- Series A+ with strong metrics → "traction-machine" or "data-story"
- Pre-seed with big vision but little traction → "vision" or "disruptor"
- Angel with strong founder story → "team-story"
- Company in emerging trend (AI, climate, etc.) → "inevitable-trend"
- Company with non-obvious insight → "secret-insight"
- Applying proven model to new market → "proven-model"

Rules for visual personality:
- Fintech, enterprise SaaS, B2B → "corporate-premium"
- Consumer apps, social, gaming, D2C → "bold-playful"
- Healthtech, medtech → "clinical-clean"
- Deeptech, hardware, robotics → "scientific-rigorous"
- Crypto, AI/ML platform, frontier tech → "futuristic-gradient"
- Climate, sustainability, agtech, food-tech → "organic-hopeful"
- Media, content, marketplace → "editorial-refined"
- General early-stage, accelerator pitch → "startup-energetic"
```

**Heuristic fallback** (no API key): Map industry keywords to visual personality, stage to archetype.

---

## PHASE 2: Narrative Architecture

### 2A. Create `src/lib/generation/narrative-architect.ts`

This designs the custom slide sequence — NOT a fixed template.

```typescript
export interface SlideBlueprint {
  /** Unique ID for this slide in the sequence */
  id: string;
  /** Purpose of this slide in the narrative */
  purpose: string;
  /** The single key message this slide must communicate */
  keyMessage: string;
  /** Emotional beat: what should the audience feel */
  emotionalBeat: "hook" | "tension" | "revelation" | "proof" | "credibility" | "urgency" | "excitement" | "confidence" | "action";
  /** Slide type from the expanded vocabulary */
  slideType: ExpandedSlideType;
  /** Composition pattern to use */
  composition: CompositionPattern;
  /** Information density for this specific slide */
  density: "splash" | "standard" | "data-dense";
  /** Whether this is a high-visual-impact slide */
  isVisualPeak: boolean;
  /** Content hints: what data/content to include */
  contentHints: string[];
  /** Position in the narrative arc (0-1) */
  narrativePosition: number;
}

export interface DeckNarrative {
  archetype: NarrativeArchetype;
  title: string;
  slideCount: number;
  slides: SlideBlueprint[];
  /** The "through-line" — the one idea that connects every slide */
  throughLine: string;
  /** Opening hook strategy */
  openingHook: string;
  /** Closing call-to-action strategy */
  closingStrategy: string;
}
```

**Archetype-to-Narrative Mapping**: Define the slide sequence for each archetype. These are NOT rigid templates — they're frameworks that the AI adapts:

```typescript
// Example: "disruptor" archetype
const DISRUPTOR_FRAMEWORK: SlideBlueprint[] = [
  { purpose: "hook", emotionalBeat: "hook", density: "splash", slideType: "statement", ... },
  { purpose: "broken-status-quo", emotionalBeat: "tension", density: "standard", slideType: "problem-visual", ... },
  { purpose: "cost-of-problem", emotionalBeat: "tension", density: "data-dense", slideType: "data-highlight", ... },
  { purpose: "the-revolution", emotionalBeat: "revelation", density: "splash", slideType: "solution-reveal", ... },
  { purpose: "how-it-works", emotionalBeat: "credibility", density: "standard", slideType: "process-flow", ... },
  { purpose: "proof-it-works", emotionalBeat: "proof", density: "data-dense", slideType: "metrics-dashboard", ... },
  { purpose: "market-opportunity", emotionalBeat: "excitement", density: "data-dense", slideType: "market-chart", ... },
  // ... adapts based on company DNA
];

// Example: "traction-machine" archetype
const TRACTION_MACHINE_FRAMEWORK: SlideBlueprint[] = [
  { purpose: "headline-metric", emotionalBeat: "hook", density: "splash", slideType: "hero-stat", ... },
  { purpose: "growth-trajectory", emotionalBeat: "excitement", density: "data-dense", slideType: "growth-chart", ... },
  { purpose: "what-drives-growth", emotionalBeat: "credibility", density: "standard", slideType: "driver-breakdown", ... },
  { purpose: "unit-economics", emotionalBeat: "proof", density: "data-dense", slideType: "economics-visual", ... },
  // ...
];
```

The function `designNarrative(dna: CompanyDNA): DeckNarrative` should:

1. Select the archetype framework
2. **Add or remove slides** based on company DNA:
   - No traction? Remove the metrics dashboard, add a vision/why-now slide
   - Strong team credibility? Move team earlier in the deck
   - No competitive moat? Replace competition slide with a differentiation-focused slide
   - Has revenue? Add unit economics slide
   - Early stage? Fewer slides (10-12); later stage? More slides (14-16)
3. Assign composition patterns (see Phase 3) ensuring variety
4. Set density rhythm: never 3 data-dense slides in a row, always bookend data with visual breathers
5. Mark 3-4 slides as "visual peaks" — these get the most dramatic compositions

---

## PHASE 3: Expanded Composition System

### 3A. Create `src/lib/generation/compositions.ts`

Replace the 5-layout system with 40+ composition patterns organized by category.

```typescript
export type CompositionCategory =
  | "hero"          // Full-impact visual slides
  | "split"         // Two-area layouts
  | "modular"       // Bento/grid layouts
  | "data-forward"  // Chart/metric-focused
  | "content-forward" // Text/list-focused
  | "visual-forward"  // Image/mockup-focused
  | "emphasis"       // Single-point-of-focus
  | "team-social";   // People/logos

export interface CompositionPattern {
  id: string;
  name: string;
  category: CompositionCategory;
  /** Grid positions for content zones */
  zones: CompositionZone[];
  /** Which visual personalities this composition works well with */
  bestFor: VisualPersonality[];
  /** Information density this composition handles */
  density: "splash" | "standard" | "data-dense";
  /** SVG preview for admin/debug */
  preview?: string;
}

export interface CompositionZone {
  id: string;
  role: "heading" | "subheading" | "body" | "chart" | "metric" | "image" | "icon-grid" | "quote" | "stat" | "caption" | "logo-row" | "cta" | "background";
  /** Grid position: column start (1-12), row start, column span, row span */
  gridArea: { col: number; row: number; colSpan: number; rowSpan: number };
  /** Whether this zone is optional (content may not fill it) */
  optional?: boolean;
}
```

Define at least 40 compositions. Here's the structure for a few examples:

```typescript
// HERO: Full-bleed image with text overlay
{
  id: "hero-fullbleed",
  category: "hero",
  zones: [
    { id: "bg-image", role: "background", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 6 } },
    { id: "headline", role: "heading", gridArea: { col: 2, row: 2, colSpan: 8, rowSpan: 2 } },
    { id: "subtitle", role: "subheading", gridArea: { col: 2, row: 4, colSpan: 6, rowSpan: 1 } },
  ],
  bestFor: ["bold-playful", "editorial-refined", "startup-energetic"],
  density: "splash",
}

// MODULAR: Bento 2×2 grid
{
  id: "bento-2x2",
  category: "modular",
  zones: [
    { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 12, rowSpan: 1 } },
    { id: "card-1", role: "stat", gridArea: { col: 1, row: 2, colSpan: 6, rowSpan: 2.5 } },
    { id: "card-2", role: "stat", gridArea: { col: 7, row: 2, colSpan: 6, rowSpan: 2.5 } },
    { id: "card-3", role: "body", gridArea: { col: 1, row: 4.5, colSpan: 6, rowSpan: 2.5 } },
    { id: "card-4", role: "chart", gridArea: { col: 7, row: 4.5, colSpan: 6, rowSpan: 2.5 } },
  ],
  bestFor: ["corporate-premium", "clinical-clean", "futuristic-gradient"],
  density: "data-dense",
}

// EMPHASIS: Single hero stat with context
{
  id: "hero-stat",
  category: "emphasis",
  zones: [
    { id: "big-number", role: "stat", gridArea: { col: 2, row: 1, colSpan: 8, rowSpan: 3 } },
    { id: "context", role: "subheading", gridArea: { col: 3, row: 4, colSpan: 6, rowSpan: 1 } },
    { id: "supporting", role: "body", gridArea: { col: 2, row: 5, colSpan: 8, rowSpan: 1 } },
  ],
  bestFor: ["bold-playful", "startup-energetic", "corporate-premium"],
  density: "splash",
}

// DATA: Chart with sidebar insights
{
  id: "chart-insights",
  category: "data-forward",
  zones: [
    { id: "heading", role: "heading", gridArea: { col: 1, row: 1, colSpan: 8, rowSpan: 1 } },
    { id: "chart", role: "chart", gridArea: { col: 1, row: 2, colSpan: 8, rowSpan: 4 } },
    { id: "insight-1", role: "stat", gridArea: { col: 9, row: 2, colSpan: 4, rowSpan: 1.3 } },
    { id: "insight-2", role: "stat", gridArea: { col: 9, row: 3.3, colSpan: 4, rowSpan: 1.3 } },
    { id: "insight-3", role: "stat", gridArea: { col: 9, row: 4.6, colSpan: 4, rowSpan: 1.3 } },
  ],
  bestFor: ["corporate-premium", "scientific-rigorous", "clinical-clean"],
  density: "data-dense",
}
```

**Implement all categories with at least 5 compositions each** (40+ total). Ensure each visual personality has at least 10 compatible compositions.

### 3B. Expanded Slide Types

Create `src/lib/generation/slide-types.ts` — expand from 12 to 25+ slide types:

```typescript
export type ExpandedSlideType =
  // Openers
  | "title-hero"           // Big visual opening
  | "statement"            // Bold single statement
  | "stat-hook"            // Shocking statistic opener

  // Problem/opportunity
  | "problem-visual"       // Problem with vivid imagery
  | "problem-data"         // Problem quantified with data
  | "market-landscape"     // Market overview

  // Solution
  | "solution-reveal"      // Product/solution introduction
  | "how-it-works"         // Step-by-step or process flow
  | "product-showcase"     // Product screenshots/mockups
  | "before-after"         // Transformation visual

  // Traction & data
  | "metrics-dashboard"    // KPI grid
  | "growth-chart"         // Growth trajectory
  | "unit-economics"       // Revenue/cost breakdown
  | "data-highlight"       // Single key data point

  // Credibility
  | "social-proof"         // Logos, testimonials, press
  | "case-study"           // Customer success story
  | "team-grid"            // Team members
  | "team-featured"        // Founder spotlight + team
  | "advisors"             // Advisory board

  // Strategy
  | "competitive-matrix"   // Feature comparison
  | "market-sizing"        // TAM/SAM/SOM
  | "business-model"       // Revenue mechanics
  | "go-to-market"         // GTM strategy
  | "roadmap"              // Timeline/milestones

  // Close
  | "the-ask"              // Funding ask with use of funds
  | "vision-close"         // Big vision closing
  | "cta";                 // Call to action
```

---

## PHASE 4: Visual System Generator

### 4A. Create `src/lib/generation/visual-system.ts`

This generates a bespoke design language for each deck.

```typescript
export interface VisualSystem {
  /** Color palette derived from personality + brand */
  colors: {
    primary: string;       // Main brand/accent color
    secondary: string;     // Supporting color
    background: string;    // Slide background
    surface: string;       // Card/block surface
    text: string;          // Primary text
    textMuted: string;     // Secondary text
    accent: string;        // CTA/highlight color
    chart: string[];       // 6-color chart palette
    gradient?: string;     // CSS gradient for splash slides
  };

  /** Typography scale */
  typography: {
    headingFont: string;
    bodyFont: string;
    headingWeight: number;
    headingSizes: { h1: number; h2: number; h3: number }; // in px at 960×540
    bodySize: number;
    lineHeight: number;
    letterSpacing: string;       // "tight" | "normal" | "wide"
    headingCase: "none" | "uppercase" | "capitalize";
  };

  /** Spatial rules */
  spacing: {
    slideMargin: number;   // Grid units from edge
    blockGap: number;      // Gap between blocks
    cardPadding: number;   // Internal card padding
    cardRadius: number;    // Border radius for cards (0 = sharp)
  };

  /** Image treatment */
  imageStyle: {
    treatment: "full-bleed" | "contained" | "rounded" | "circular" | "masked";
    overlay: "none" | "gradient" | "dark-overlay" | "color-tint";
    filterStyle: "none" | "slight-desaturate" | "high-contrast" | "duotone";
  };

  /** Visual motifs — recurring elements that create identity */
  motifs: {
    dividerStyle: "solid" | "dashed" | "gradient" | "dots" | "none";
    iconStyle: "outline" | "filled" | "duotone" | "none";
    backgroundPattern: "none" | "dots" | "grid" | "gradient-mesh" | "noise";
    accentShape: "circle" | "rounded-rect" | "line" | "none";
  };

  /** Data visualization style */
  dataViz: {
    chartStyle: "minimal" | "detailed" | "infographic";
    showGridLines: boolean;
    animateOnReveal: boolean;
    labelPosition: "inside" | "outside" | "tooltip";
  };
}
```

**Create `generateVisualSystem(dna: CompanyDNA, theme?: ThemeDef): VisualSystem`**

This function should:
1. Start from the visual personality
2. Apply brand colors if provided (user's brand overrides defaults)
3. Select typography that matches the personality
4. Set spacing rules (corporate = more whitespace, startup = tighter)
5. Define image treatment (consumer brands = rounded/lifestyle, enterprise = contained/professional)
6. Set motifs that create visual identity without being distracting

### 4B. Visual Personality Presets

Define base presets for each `VisualPersonality`:

```typescript
const PERSONALITY_PRESETS: Record<VisualPersonality, Partial<VisualSystem>> = {
  "corporate-premium": {
    colors: { primary: "#1e3a5f", secondary: "#4a90d9", background: "#ffffff", ... },
    typography: { headingFont: "Inter", bodyFont: "Inter", headingWeight: 700, letterSpacing: "normal", headingCase: "none" },
    spacing: { slideMargin: 1.5, cardRadius: 8 },
    imageStyle: { treatment: "contained", overlay: "none", filterStyle: "none" },
    motifs: { dividerStyle: "solid", iconStyle: "outline", backgroundPattern: "none" },
    dataViz: { chartStyle: "detailed", showGridLines: true },
  },
  "bold-playful": {
    colors: { primary: "#ff6b35", secondary: "#004e98", background: "#fafafa", ... },
    typography: { headingFont: "Space Grotesk", headingWeight: 800, letterSpacing: "tight", headingCase: "none" },
    spacing: { slideMargin: 1, cardRadius: 16 },
    imageStyle: { treatment: "rounded", overlay: "color-tint" },
    motifs: { dividerStyle: "gradient", iconStyle: "filled", backgroundPattern: "gradient-mesh" },
    dataViz: { chartStyle: "infographic", showGridLines: false },
  },
  // ... define all 8 personalities
};
```

---

## PHASE 5: Per-Slide Content Generator

### 5A. Create `src/lib/generation/slide-generator.ts`

Generate each slide individually with full context.

```typescript
export interface SlideGenerationContext {
  /** Company DNA for voice and content */
  dna: CompanyDNA;
  /** This slide's blueprint from narrative architecture */
  blueprint: SlideBlueprint;
  /** The visual system for this deck */
  visualSystem: VisualSystem;
  /** Full deck narrative for context */
  narrative: DeckNarrative;
  /** Previously generated slides (for continuity) */
  previousSlides: SlideData[];
  /** User's original input */
  input: DeckInput;
}

/**
 * Generate a single slide with focused, high-quality content.
 */
export async function generateSlide(context: SlideGenerationContext): Promise<SlideData>
```

**Per-slide AI prompt structure**:

```
You are designing slide {position}/{total} of a pitch deck for {companyName}.

NARRATIVE CONTEXT:
- Archetype: {narrativeArchetype}
- Through-line: {throughLine}
- Previous slide conveyed: {previousSlide.keyMessage}
- This slide's purpose: {blueprint.purpose}
- Next slide will cover: {nextSlide.purpose}

SLIDE BRIEF:
- Key message: {blueprint.keyMessage}
- Emotional beat: {blueprint.emotionalBeat}
- Information density: {blueprint.density}
- Content tone: {dna.contentTone}

COMPOSITION: {blueprint.composition.name}
This slide uses a "{blueprint.composition.category}" layout with these zones:
{zones described with their roles and sizes}

CONTENT TO INCLUDE:
{blueprint.contentHints}

COMPANY DATA:
{relevant fields from input}

VISUAL STYLE:
- Personality: {dna.visualPersonality}
- Chart style: {visualSystem.dataViz.chartStyle}
- Image treatment: {visualSystem.imageStyle.treatment}

Generate content for each zone in this composition. Return JSON matching the SlideData interface with editorBlocksV2 positioned according to the composition grid.

CRITICAL RULES:
1. Use the company's REAL data — never invent metrics that weren't provided
2. For missing data, use industry-appropriate estimates clearly marked
3. Write in {dna.contentTone} tone — not generic business-speak
4. This slide must EARN its place — if it doesn't advance the narrative, it fails
5. Image prompts must be HIGHLY SPECIFIC to this company (not "modern dashboard" — describe what the dashboard shows)
```

### 5B. Parallel Generation with Batching

Generate slides in parallel where possible:
- Slides that don't depend on previous slide content can be generated simultaneously
- Group into batches: [slide 1-3 sequential for opening], [slides 4-8 parallel], [slides 9-12 parallel], [closing slides sequential]
- Use `Promise.all` for parallel batches to reduce total generation time

### 5C. Slide-to-EditorBlocks Mapper

Create `src/lib/generation/slide-to-blocks.ts`:

Takes a `SlideData` + `CompositionPattern` + `VisualSystem` and produces positioned `editorBlocksV2` that map to the composition grid. This connects the generation pipeline to the existing editor rendering engine.

```typescript
export function mapSlideToBlocks(
  slide: SlideData,
  composition: CompositionPattern,
  visualSystem: VisualSystem,
): Record<string, unknown>[]
```

---

## PHASE 6: Coherence Review Pass

### 6A. Create `src/lib/generation/coherence-reviewer.ts`

After all slides are generated, review the complete deck for flow and variety.

```typescript
export interface CoherenceIssue {
  type: "repetitive-layout" | "density-fatigue" | "missing-variety" | "weak-opening" | "weak-close" | "color-monotony" | "pacing-issue";
  slideIndices: number[];
  description: string;
  suggestion: string;
}

/**
 * Review a complete deck for visual coherence and variety.
 * Returns issues and optionally auto-fixes them.
 */
export async function reviewDeckCoherence(
  slides: SlideData[],
  narrative: DeckNarrative,
  visualSystem: VisualSystem,
): Promise<{
  issues: CoherenceIssue[];
  adjustedSlides: SlideData[];  // Slides with fixes applied
}>
```

The reviewer checks:
1. **No consecutive same-category compositions** — if two "split" compositions are adjacent, swap one
2. **Density rhythm** — no more than 2 data-dense slides in a row (insert a splash/standard between)
3. **Visual peaks are spread** — high-impact slides should be at positions ~0.0 (opener), ~0.4 (solution/product), ~0.7 (traction peak), ~0.95 (ask)
4. **Color accent distribution** — accent slides distributed 3-5 across the deck, not clustered
5. **Opening strength** — first slide must be a "splash" density composition
6. **Closing strength** — last 2 slides must build to a clear CTA
7. **Composition variety** — at least 5 different composition categories used across the deck

---

## PHASE 7: Pipeline Orchestrator

### 7A. Rewrite `src/lib/generate-deck.ts`

Replace the current single-prompt function with the full pipeline:

```typescript
export async function generateDeck(input: DeckInput): Promise<{
  slides: SlideData[];
  dna: CompanyDNA;
  narrative: DeckNarrative;
  visualSystem: VisualSystem;
}> {
  // 1. Analyze company DNA (fast — uses Haiku or heuristics)
  const dna = await analyzeCompanyDNA(input);

  // 2. Design narrative architecture
  const narrative = await designNarrative(dna);

  // 3. Generate visual system
  const visualSystem = generateVisualSystem(dna, getTheme(input.themeId));

  // 4. Generate slides (batched parallel)
  const slides = await generateAllSlides(dna, narrative, visualSystem, input);

  // 5. Coherence review + adjustments
  const { adjustedSlides } = await reviewDeckCoherence(slides, narrative, visualSystem);

  // 6. Enrichment: images, chart data
  const enrichedSlides = await enrichSlides(adjustedSlides, dna);

  return {
    slides: enrichedSlides,
    dna,
    narrative,
    visualSystem,
  };
}
```

### 7B. Backward Compatibility

- The function signature stays compatible (accepts `DeckInput`, returns `SlideData[]`)
- The existing API route (`/api/decks` POST) should work unchanged
- Store `dna`, `narrative`, and `visualSystem` as JSON on the Deck model for later use in refinement/editing:

Add to Deck model in `prisma/schema.prisma`:
```prisma
generationMeta     String?  // JSON: { dna, narrative, visualSystem }
```

### 7C. Fallback

Keep the existing `generateFallbackDeck()` function as the fallback when no API key is available. But also create an improved heuristic version that uses the composition system and visual presets without AI:

```typescript
function generateHeuristicDeck(input: DeckInput): SlideData[] {
  const dna = analyzeCompanyDNAHeuristic(input);  // No AI, just keyword mapping
  const narrative = designNarrativeHeuristic(dna); // Archetype lookup
  const visualSystem = generateVisualSystem(dna);  // Deterministic
  // Use the composition system to place blocks, just with template content
}
```

---

## PHASE 8: Image Intelligence

### 8A. Upgrade `enrichSlidesWithImages`

The current system truncates image prompts to 100 chars and searches Unsplash once. Upgrade to:

```typescript
async function searchImage(prompt: string, options: {
  industry: string;
  visualStyle: VisualPersonality;
  treatment: string;
}): Promise<string | null> {
  // 1. Generate 3 search strategies from the prompt:
  //    - Literal: direct keywords from the prompt
  //    - Conceptual: abstract concept behind the prompt
  //    - Industry: industry-specific visual language
  // 2. Search Unsplash with all 3, pick the best result
  // 3. Prefer landscape orientation for split/hero compositions
  // 4. Filter by color if visual system has strong palette
}
```

### 8B. AI Image Prompt Enhancement

Before searching stock photos, enhance the image prompt:

```typescript
async function enhanceImagePrompt(
  rawPrompt: string,
  context: { industry: string; visualPersonality: VisualPersonality; slidePurpose: string }
): Promise<string[]> {
  // Use AI (Haiku) to generate 3 specific, diverse image search queries
  // e.g., rawPrompt: "our product dashboard"
  // → ["SaaS analytics dashboard dark mode metrics", "business intelligence data visualization clean UI", "startup product screenshot laptop workspace"]
}
```

---

## PHASE 9: Admin & User Controls

### 9A. Generation Preferences UI

Add a "Generation Style" section to the deck creation form:

- **Narrative style** (optional override): Dropdown with archetype names + descriptions
- **Visual style** (optional override): Dropdown with personality names + previews
- **Slide count preference**: Slider (10-16, default "auto")
- **Emphasis**: Checkboxes for "More data-heavy" / "More visual" / "Balanced"

These are optional — by default the AI chooses. But power users can override.

### 9B. Store Generation Metadata

When a deck is generated, store the full pipeline output:
- CompanyDNA
- DeckNarrative (slide blueprints)
- VisualSystem
- Per-slide generation context

This enables:
- "Regenerate with different narrative" (keep content, change archetype)
- "Regenerate with different visual style" (keep narrative, change aesthetics)
- Debugging: admin can see why a deck looks the way it does

---

## Implementation Notes

- **Do NOT ask questions** — make reasonable decisions and implement
- **Keep existing `SlideData` interface compatible** — new fields are additive
- **The pipeline should be fast**: DNA analysis with Haiku (~1s), narrative design (~1s), visual system (instant, no AI), per-slide generation (parallel, ~3-5s total), coherence review (~1s). Total: ~7-10 seconds
- **Use Claude Haiku for classification tasks** (DNA analysis, coherence review) and Claude Sonnet for content generation (per-slide)
- **Run `npm run build`** periodically to catch TypeScript errors
- **Composition patterns must work with the existing editor** — they produce block positions that the EditorCanvas can render
- **Every composition must render well on the 960×540 canvas**
- **Test with at least 3 different company profiles** (fintech SaaS, consumer app, biotech) to verify visual variety
- **The fallback deck (no API key) should still look good** — use the composition system with template content
