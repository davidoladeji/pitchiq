# Claude Code Prompt: Agentic Deck Creator with Skills

> Paste this entire prompt into Claude Code in **Act mode**. Do not ask questions — implement everything described below.

---

## Context

You are working on the PitchIQ codebase (`usepitchiq.com`), a Next.js 14 + TypeScript + Prisma + PostgreSQL app. The current deck generation (`src/lib/generate-deck.ts`) is a single-shot AI call that produces everything from one prompt. This makes decks feel generic — the AI has no access to real-world data, can't research the market, can't generate custom visuals, and can't critique its own output.

**The new approach**: The deck generation pipeline becomes an **agentic system** where a coordinator agent orchestrates specialized skill agents. Each skill agent has a focused capability (research, visuals, critique) and produces artifacts that feed into the deck. The coordinator assembles the final deck from these artifacts.

This builds ON TOP of the multi-phase generation pipeline from `DECK-GENERATION-OVERHAUL-PROMPT.md`. If that hasn't been implemented yet, this prompt can be implemented independently — it will create the skill infrastructure and integrate with whatever generation system exists.

---

## Architecture Overview

```
User Input (DeckInput)
        │
        ▼
┌─ Coordinator Agent ──────────────────────────┐
│                                               │
│  1. Analyze company DNA                       │
│  2. Dispatch skill agents (parallel where     │
│     possible)                                 │
│  3. Collect skill outputs                     │
│  4. Generate slides using enriched data       │
│  5. Run critique cycle                        │
│  6. Return final deck                         │
│                                               │
│  Skills dispatched:                           │
│  ├── 🔍 Market Researcher                     │
│  ├── 🏢 Competitor Analyst                    │
│  ├── 📊 Financial Modeler                     │
│  ├── 🎨 Visual Creator                        │
│  ├── 🧠 VC Analyst (critique)                 │
│  └── 🎯 Pitch Coach (critique)                │
└───────────────────────────────────────────────┘
```

---

## PHASE 1: Skill Framework

### 1A. Create `src/lib/generation/skills/types.ts`

Define the skill system interfaces:

```typescript
/**
 * A Skill is a specialized capability the deck generation agent can invoke.
 * Each skill takes a focused input, does one thing well, and returns structured output.
 */
export interface Skill<TInput, TOutput> {
  /** Unique skill identifier */
  id: string;
  /** Human-readable name */
  name: string;
  /** Category for organization */
  category: "research" | "visual" | "critique" | "enrichment";
  /** Description of what this skill does */
  description: string;
  /** Whether this skill requires external API calls (web search, image gen, etc.) */
  requiresExternalAPI: boolean;
  /** Whether this skill can run in parallel with others */
  parallelizable: boolean;
  /** Execute the skill */
  execute(input: TInput, context: SkillContext): Promise<SkillResult<TOutput>>;
}

export interface SkillContext {
  /** Company information from user input */
  companyName: string;
  industry: string;
  stage: string;
  problem: string;
  solution: string;
  keyMetrics: string;
  teamInfo: string;
  fundingTarget: string;
  investorType: string;
  /** API keys available */
  hasAnthropicKey: boolean;
  hasUnsplashKey: boolean;
  hasSearchAPI: boolean;
  /** Budget: how many API calls this generation can make */
  apiCallBudget: number;
  /** Previously collected skill outputs (for skills that depend on others) */
  previousOutputs: Map<string, unknown>;
}

export interface SkillResult<T> {
  success: boolean;
  data: T | null;
  /** How confident the skill is in its output (0-1) */
  confidence: number;
  /** Sources used (URLs, API names, etc.) */
  sources: string[];
  /** Time taken in ms */
  durationMs: number;
  /** Error message if failed */
  error?: string;
  /** Whether fallback data was used */
  usedFallback: boolean;
}

/** Registry of all available skills */
export interface SkillRegistry {
  getSkill(id: string): Skill<unknown, unknown> | undefined;
  getAllSkills(): Skill<unknown, unknown>[];
  getByCategory(category: string): Skill<unknown, unknown>[];
}
```

### 1B. Create `src/lib/generation/skills/registry.ts`

```typescript
import { Skill, SkillRegistry } from "./types";
// Import all skills
import { marketResearcherSkill } from "./research/market-researcher";
import { competitorAnalystSkill } from "./research/competitor-analyst";
import { financialModelerSkill } from "./research/financial-modeler";
import { industryDataSkill } from "./research/industry-data";
import { imageFinderSkill } from "./visual/image-finder";
import { diagramGeneratorSkill } from "./visual/diagram-generator";
import { mockupGeneratorSkill } from "./visual/mockup-generator";
import { iconSelectorSkill } from "./visual/icon-selector";
import { vcAnalystSkill } from "./critique/vc-analyst";
import { pitchCoachSkill } from "./critique/pitch-coach";
import { dataCredibilitySkill } from "./critique/data-credibility";
import { designReviewerSkill } from "./critique/design-reviewer";

const ALL_SKILLS: Skill<unknown, unknown>[] = [
  marketResearcherSkill,
  competitorAnalystSkill,
  financialModelerSkill,
  industryDataSkill,
  imageFinderSkill,
  diagramGeneratorSkill,
  mockupGeneratorSkill,
  iconSelectorSkill,
  vcAnalystSkill,
  pitchCoachSkill,
  dataCredibilitySkill,
  designReviewerSkill,
];

export const skillRegistry: SkillRegistry = {
  getSkill: (id) => ALL_SKILLS.find((s) => s.id === id),
  getAllSkills: () => ALL_SKILLS,
  getByCategory: (cat) => ALL_SKILLS.filter((s) => s.category === cat),
};
```

---

## PHASE 2: Research Skills

### 2A. Market Researcher Skill

Create `src/lib/generation/skills/research/market-researcher.ts`

**Purpose**: Research real market size data for the company's industry.

**Input**: `{ industry: string, stage: string, geography?: string }`

**Output**:
```typescript
export interface MarketResearchOutput {
  tam: { value: string; source: string; year: number }; // "$340B global cloud market"
  sam: { value: string; source: string; year: number }; // "$45B SMB cloud segment"
  som: { value: string; source: string; year: number }; // "$2.1B initial serviceable market"
  growthRate: { value: string; cagr: number; source: string }; // "14.2% CAGR"
  keyTrends: string[];                  // ["Remote work acceleration", "API-first adoption"]
  marketDrivers: string[];              // ["Digital transformation mandates", "Cost pressure"]
  relatedMarkets: string[];             // Adjacent markets worth mentioning
  methodology: "top-down" | "bottom-up" | "hybrid";
}
```

**How it works**:
1. **With web search API** (preferred): Use the Anthropic API with web search tool to find real market reports for the industry. Search queries like:
   - `"{industry} market size 2025 2026 TAM"`
   - `"{industry} market CAGR growth forecast"`
   - `"{specific sub-sector} addressable market report"`
2. **Without web search** (fallback): Use Claude's training knowledge to estimate market sizes based on industry. Be explicit about uncertainty: "Based on available data as of early 2025, the {industry} market is estimated at..."
3. **Always include sources**: Even when using training data, cite the common reports/analysts (Gartner, IDC, Grand View Research, etc.)

**AI prompt for web search mode**:
```
Research the market size for a {stage} startup in {industry}.
Find TAM, SAM, and SOM with real numbers and sources.
Search for recent market reports (2024-2026).
Return only factual data with citations.
If exact numbers aren't available, provide ranges with methodology notes.
Prefer bottom-up analysis where possible.
```

### 2B. Competitor Analyst Skill

Create `src/lib/generation/skills/research/competitor-analyst.ts`

**Purpose**: Identify real competitors and build a factual competitive landscape.

**Output**:
```typescript
export interface CompetitorAnalysisOutput {
  directCompetitors: CompetitorProfile[];   // 3-5 direct competitors
  indirectCompetitors: CompetitorProfile[];  // 2-3 indirect/adjacent
  marketMap: {
    axes: { x: string; y: string };          // e.g., "Enterprise ↔ SMB" × "Simple ↔ Complex"
    positions: { name: string; x: number; y: number }[]; // Where each player sits
  };
  differentiators: string[];                 // What makes this company unique
  competitiveAdvantages: string[];           // Defensible moats
  featureComparison: {
    features: string[];                      // Row labels
    companies: { name: string; values: string[] }[]; // Column data
  };
}

export interface CompetitorProfile {
  name: string;
  description: string;
  funding?: string;        // "Series C, $120M raised"
  founded?: string;
  headquarters?: string;
  strengths: string[];
  weaknesses: string[];
  pricing?: string;        // "Starts at $49/mo"
  targetCustomer: string;
}
```

**How it works**:
1. **With web search**: Search for `"{industry} competitors {solution keywords}"`, `"alternatives to {similar products}"`, `"{industry} startup funding rounds 2024 2025"`
2. **Without web search**: Use AI knowledge to identify likely competitors based on industry + solution description
3. Build a feature comparison matrix with realistic differentiators (not the generic "AI-Powered ✓/✗" from the current system)

### 2C. Financial Modeler Skill

Create `src/lib/generation/skills/research/financial-modeler.ts`

**Purpose**: Generate realistic financial projections and unit economics based on industry benchmarks.

**Output**:
```typescript
export interface FinancialModelOutput {
  unitEconomics: {
    ltv: string;           // "$14,400"
    cac: string;           // "$1,200"
    ltvCacRatio: number;   // 12
    paybackMonths: number; // 8
    grossMargin: string;   // "78%"
    methodology: string;   // How these were derived
  };
  revenueProjections: {
    year: number;
    revenue: number;
    growth: number;        // YoY %
    customers: number;
    arr?: number;
  }[];
  useOfFunds: {
    category: string;      // "Product & Engineering"
    percentage: number;
    amount: string;
    rationale: string;     // "Hire 4 engineers to build enterprise features"
  }[];
  benchmarkComparisons: {
    metric: string;        // "Net Revenue Retention"
    companyValue: string;  // "125%"
    industryMedian: string; // "110%"
    topQuartile: string;   // "130%"
    source: string;
  }[];
  burnRate?: string;
  runway?: string;
}
```

**How it works**:
1. **With web search**: Find SaaS benchmarks, industry-specific financial models, median metrics from reports like KeyBanc SaaS Survey, OpenView benchmarks, a16z metrics guides
2. **Without web search**: Use industry-standard benchmarks from training data:
   - SaaS: 75-85% gross margins, 3:1+ LTV/CAC, $15-25K ACV for mid-market
   - Marketplace: 10-20% take rate, focus on GMV, supply/demand balance
   - Consumer: ARPU-driven, viral coefficient, retention curves
   - Hardware: BOM costs, margin expansion at scale
3. Generate projections that are realistic for the company's stage:
   - Pre-seed: Don't project revenue — project milestones and burn
   - Seed: Conservative revenue start, show path to product-market fit
   - Series A: Show 3-year revenue with growth rate compression
   - Series B+: Show path to profitability, unit economics at scale

### 2D. Industry Data Skill

Create `src/lib/generation/skills/research/industry-data.ts`

**Purpose**: Find industry-specific data points, statistics, and trends that make the deck's problem/opportunity slides compelling.

**Output**:
```typescript
export interface IndustryDataOutput {
  /** Shocking statistics for the opening/problem slides */
  hookStats: { stat: string; source: string; context: string }[];
  /** Industry trends relevant to "why now" */
  trends: { trend: string; evidence: string; source: string }[];
  /** Regulatory or policy changes relevant to the industry */
  regulatory: string[];
  /** Technology shifts enabling the opportunity */
  techShifts: string[];
  /** Customer pain points backed by data */
  painPoints: { point: string; evidence: string }[];
}
```

**How it works**: Search for `"{industry} statistics 2025"`, `"{industry} challenges survey"`, `"{industry} digital transformation trends"`. The hook stats are specifically for opening slides — things like "89% of CFOs still use spreadsheets for..." or "$4.2T is lost annually to..."

---

## PHASE 3: Visual Creation Skills

### 3A. Intelligent Image Finder

Create `src/lib/generation/skills/visual/image-finder.ts`

**Purpose**: Find highly relevant, high-quality images for each slide — far better than the current 100-char Unsplash query.

**Output**:
```typescript
export interface ImageFinderOutput {
  images: {
    slideId: string;
    purpose: string;          // "problem-visualization", "product-screenshot", "team-culture"
    primaryImage: { url: string; alt: string; attribution: string } | null;
    alternateImages: { url: string; alt: string }[];    // 2 alternatives
    searchQueries: string[];  // The queries used (for debugging/admin)
  }[];
}
```

**How it works**:
1. For each slide that needs an image, generate **3 specialized search strategies**:
   - **Literal**: Direct visual of what the slide describes
   - **Conceptual**: Abstract/metaphorical representation
   - **Industry**: Industry-specific visual language
2. Search Unsplash (or Pexels as backup) with all three queries
3. **Score results** on relevance (AI evaluates image descriptions against slide purpose)
4. Return the best match + 2 alternatives
5. **Color filtering**: If the visual system has a dominant palette, prefer images that harmonize

Example — for a fintech problem slide about "manual reconciliation":
- Literal: `"accountant frustrated spreadsheet office"`
- Conceptual: `"tangled cables mess complexity"`
- Industry: `"financial documents paperwork overwhelmed"`

### 3B. Diagram Generator

Create `src/lib/generation/skills/visual/diagram-generator.ts`

**Purpose**: Generate SVG diagrams, flowcharts, and infographics as code — not images.

**Output**:
```typescript
export interface DiagramOutput {
  diagrams: {
    slideId: string;
    type: "flowchart" | "process" | "comparison" | "hierarchy" | "cycle" | "funnel" | "venn" | "timeline" | "architecture";
    svgCode: string;       // Complete SVG that can be rendered inline
    description: string;   // Alt text / description
  }[];
}
```

**How it works**:
1. AI generates SVG code based on the slide content and visual system (colors, fonts, style)
2. Diagram types:
   - **Flowchart**: How the product works (user journey)
   - **Process**: Step-by-step (onboarding, conversion funnel)
   - **Architecture**: System/platform diagram (for technical products)
   - **Comparison**: Visual before/after or us-vs-them
   - **Cycle**: Flywheel effects, feedback loops
   - **Funnel**: Conversion or market sizing visualization
   - **Venn**: Market positioning or overlap
3. SVGs use the deck's color palette and font stack
4. Keep diagrams simple — 5-8 elements max (presentations, not documentation)

**AI prompt for diagram generation**:
```
Generate an SVG diagram for a pitch deck slide.

Slide purpose: {purpose}
Content: {content}
Diagram type: {type}
Color palette: primary={primary}, accent={accent}, bg={background}, text={text}
Font: {headingFont}
Canvas size: 600×340 (it will be placed within a slide composition zone)

Rules:
- Clean, minimal design — this is a presentation, not a technical doc
- Use rounded rectangles, circles, and arrows
- Max 5-8 visual elements
- Text must be legible at presentation scale (min 14px)
- Use the color palette — primary for main elements, accent for highlights
- Include a subtle drop shadow or border for depth
- Return ONLY the SVG code, no explanation
```

### 3C. Product Mockup Generator

Create `src/lib/generation/skills/visual/mockup-generator.ts`

**Purpose**: Generate product mockup descriptions and device frames for solution/product slides.

**Output**:
```typescript
export interface MockupOutput {
  mockups: {
    slideId: string;
    deviceType: "laptop" | "phone" | "tablet" | "browser" | "dashboard";
    screenContent: string;  // Description of what's shown on screen
    svgFrame: string;       // Device frame SVG
    contentZone: { x: number; y: number; width: number; height: number }; // Where screenshot goes inside frame
  }[];
}
```

**How it works**:
1. Based on the solution description, determine the best device to show it in
2. Generate an SVG device frame (laptop, phone, browser window, etc.)
3. The `screenContent` is a detailed description used either for:
   - Placeholder UI (generate a simple SVG dashboard/interface mockup)
   - Image search query (find a relevant SaaS dashboard screenshot)
4. Use the existing `DeviceMockupBlock` SVG frames from the editor as a starting point

### 3D. Icon Selector

Create `src/lib/generation/skills/visual/icon-selector.ts`

**Purpose**: Select appropriate Lucide icons for content slides, process steps, feature lists.

**Output**:
```typescript
export interface IconSelectionOutput {
  icons: {
    concept: string;       // "security", "speed", "integration"
    iconName: string;      // Lucide icon name: "shield", "zap", "plug"
    context: string;       // Where it's used: "feature-list-item-2"
  }[];
}
```

**How it works**: Map content concepts to Lucide icon names. Use AI to select the most semantically appropriate icon for each concept, drawing from the full Lucide library. This replaces generic bullet points with meaningful visual indicators.

---

## PHASE 4: Expert Critique Skills

### 4A. VC Analyst Skill

Create `src/lib/generation/skills/critique/vc-analyst.ts`

**Purpose**: Review the deck from a VC partner's perspective and identify weaknesses.

**Input**: The generated slides + company DNA

**Output**:
```typescript
export interface VCAnalysisOutput {
  overallAssessment: "strong" | "promising" | "needs-work" | "pass";
  investmentThesis: string;          // One-sentence thesis if they'd invest
  strengthsVCsCareAbout: string[];   // "Clear path to $100M ARR"
  criticalWeaknesses: {
    issue: string;                   // "Market sizing uses top-down only"
    severity: "critical" | "moderate" | "minor";
    slideIndex: number;
    suggestedFix: string;            // "Add bottom-up calculation"
  }[];
  questionsInvestorsWillAsk: {
    question: string;                // "What's your net dollar retention?"
    why: string;                     // "Indicates product-market fit strength"
    suggestedAnswer: string;         // How to address it in the deck
  }[];
  competitivePositioning: string;    // How this compares to other pitches they'd see
  dealbreakers: string[];            // Things that would make a VC pass immediately
}
```

**AI prompt persona**:
```
You are a senior partner at a top-tier VC firm (Sequoia, a16z caliber). You've seen thousands of pitch decks and invested in 40+ companies. You are brutally honest but constructive.

Review this pitch deck and provide your assessment. Focus on:
1. Would you take a meeting based on this deck? Why or why not?
2. What are the 3 things that excite you most?
3. What are the critical weaknesses that would come up in partner meeting?
4. What questions would you ask in the first meeting?
5. Is there anything that's an immediate dealbreaker?

Be specific — reference actual slides and content. Don't be generic.
```

### 4B. Pitch Coach Skill

Create `src/lib/generation/skills/critique/pitch-coach.ts`

**Purpose**: Review the deck's storytelling, flow, and persuasive structure.

**Output**:
```typescript
export interface PitchCoachOutput {
  narrativeScore: number;           // 0-100
  emotionalArc: {
    slideIndex: number;
    emotion: string;                // "curiosity", "concern", "excitement", "confidence"
    intensity: number;              // 0-10
    issue?: string;                 // "Energy drops here — need a visual break"
  }[];
  flowIssues: {
    between: [number, number];      // Slide indices
    issue: string;                  // "Jumps from problem to financials without showing solution"
    fix: string;
  }[];
  slideSpecificFeedback: {
    slideIndex: number;
    strength: string;
    improvement: string;
  }[];
  openingHookRating: number;        // 0-10: does the first slide grab attention?
  closingImpactRating: number;      // 0-10: does the CTA create urgency?
  overallRecommendation: string;
}
```

### 4C. Data Credibility Reviewer

Create `src/lib/generation/skills/critique/data-credibility.ts`

**Purpose**: Check that all numbers, claims, and data points in the deck are plausible and consistent.

**Output**:
```typescript
export interface DataCredibilityOutput {
  issues: {
    slideIndex: number;
    claim: string;                   // The specific claim/number
    issue: "implausible" | "inconsistent" | "unsourced" | "outdated" | "vague";
    explanation: string;             // Why it's problematic
    suggestedFix: string;
  }[];
  consistencyChecks: {
    check: string;                   // "Revenue growth matches user growth"
    passed: boolean;
    details: string;
  }[];
  overallCredibility: number;        // 0-100
}
```

**This catches things like**: TAM bigger than GDP, growth rates that don't match revenue numbers, unit economics that don't add up, claims without sources, and metrics that feel hallucinated.

### 4D. Design Reviewer Skill

Create `src/lib/generation/skills/critique/design-reviewer.ts`

**Purpose**: Review visual composition, variety, and professional quality.

**Output**:
```typescript
export interface DesignReviewOutput {
  compositionVariety: number;        // 0-100: are layouts diverse enough?
  informationDensityRhythm: number;  // 0-100: good pacing of dense vs. light slides?
  visualImpactMoments: number;       // Count of high-impact slides
  issues: {
    slideIndex: number;
    issue: string;                   // "Text-heavy — needs visual element"
    category: "density" | "variety" | "alignment" | "whitespace" | "contrast";
    suggestedFix: string;
  }[];
}
```

---

## PHASE 5: Coordinator Agent

### 5A. Create `src/lib/generation/coordinator.ts`

This is the orchestrator — it manages the skill pipeline.

```typescript
export interface GenerationPlan {
  /** Skills to run in parallel in each phase */
  phases: {
    name: string;
    skills: { skillId: string; input: unknown }[];
    parallel: boolean;
  }[];
  /** Total estimated time */
  estimatedTimeMs: number;
  /** Total API calls budgeted */
  totalAPICalls: number;
}

/**
 * Plan which skills to run based on available APIs and user's plan tier.
 */
export function planGeneration(
  input: DeckInput,
  capabilities: { hasWebSearch: boolean; hasImageGen: boolean; planTier: string }
): GenerationPlan

/**
 * Execute the full generation pipeline with skills.
 * Emits progress events for the UI.
 */
export async function executeGeneration(
  input: DeckInput,
  plan: GenerationPlan,
  onProgress?: (event: GenerationProgressEvent) => void,
): Promise<GenerationResult>

export interface GenerationProgressEvent {
  phase: string;
  skill: string;
  status: "started" | "completed" | "failed" | "skipped";
  message: string;
  progress: number;  // 0-100 overall progress
}

export interface GenerationResult {
  slides: SlideData[];
  /** All skill outputs for transparency */
  skillOutputs: Map<string, SkillResult<unknown>>;
  /** Critique results */
  critique: {
    vcAnalysis?: VCAnalysisOutput;
    pitchCoach?: PitchCoachOutput;
    dataCredibility?: DataCredibilityOutput;
    designReview?: DesignReviewOutput;
  };
  /** Generation metadata */
  meta: {
    totalTimeMs: number;
    skillsRun: string[];
    skillsSkipped: string[];
    apiCallsUsed: number;
  };
}
```

**Execution flow**:

```
Phase 1: Research (parallel)
├── Market Researcher    → MarketResearchOutput
├── Competitor Analyst   → CompetitorAnalysisOutput
├── Financial Modeler    → FinancialModelOutput
└── Industry Data        → IndustryDataOutput

Phase 2: Generate slides using enriched data
└── Slide Generator (uses all Phase 1 outputs as context)
    → SlideData[]

Phase 3: Visual enrichment (parallel)
├── Image Finder         → images for each slide
├── Diagram Generator    → SVG diagrams for process/flow slides
├── Mockup Generator     → device mockups for product slides
└── Icon Selector        → icons for feature/benefit slides

Phase 4: Apply visuals to slides
└── Merge visual outputs into slide data

Phase 5: Critique cycle (parallel)
├── VC Analyst           → investment perspective critique
├── Pitch Coach          → storytelling critique
├── Data Credibility     → fact-check all numbers
└── Design Reviewer      → visual quality check

Phase 6: Auto-fix critical issues
└── Apply fixes for any "critical" severity issues from critique
    (regenerate specific slides if needed)

Phase 7: Final assembly
└── Return completed deck + all skill outputs
```

### 5B. Skill-Enriched Slide Generation

The key integration point: when generating slides (Phase 2), the AI now has access to **real data** from the research skills. Update the slide generation prompt to include:

```
MARKET DATA (from research):
- TAM: {tam.value} (Source: {tam.source})
- SAM: {sam.value} (Source: {sam.source})
- SOM: {som.value} (Source: {som.source})
- Growth rate: {growthRate.value} CAGR (Source: {growthRate.source})
- Key trends: {trends}

COMPETITIVE LANDSCAPE (from research):
- Direct competitors: {competitors with descriptions}
- Key differentiators: {differentiators}
- Feature comparison: {featureComparison}

FINANCIAL MODEL (from research):
- Unit economics: LTV={ltv}, CAC={cac}, LTV/CAC={ratio}
- Revenue projections: {projections}
- Use of funds: {breakdown}
- Industry benchmarks: {benchmarks}

COMPELLING DATA POINTS (from research):
- Hook statistics: {hookStats}
- Industry trends: {trends}
- Pain points with evidence: {painPoints}

USE THIS REAL DATA in the slides. Do NOT invent numbers when research data is available.
When using researched data, include a small source note (e.g., "Source: Gartner 2025").
```

### 5C. Critique-Driven Improvement Loop

After the critique skills run, the coordinator should auto-fix critical issues:

```typescript
async function applyCritiqueFixes(
  slides: SlideData[],
  critique: CritiqueResults,
  context: SkillContext,
): Promise<SlideData[]> {
  const criticalIssues = [
    ...critique.vcAnalysis?.criticalWeaknesses.filter(w => w.severity === "critical") || [],
    ...critique.dataCredibility?.issues.filter(i => i.issue === "implausible" || i.issue === "inconsistent") || [],
    ...critique.pitchCoach?.flowIssues || [],
  ];

  if (criticalIssues.length === 0) return slides;

  // Regenerate only the affected slides with the fix instructions
  for (const issue of criticalIssues.slice(0, 5)) { // Max 5 fixes per cycle
    const slideIdx = issue.slideIndex;
    slides[slideIdx] = await regenerateSlide(slides[slideIdx], issue.suggestedFix, context);
  }

  return slides;
}
```

**Limit to ONE critique cycle** to prevent infinite loops and control API costs.

---

## PHASE 6: API & Progress Streaming

### 6A. Update `POST /api/decks` route

The deck creation endpoint should support the new pipeline:

```typescript
// POST /api/decks
// Body: DeckInput + { enableSkills?: boolean, skillPreferences?: string[] }
//
// If enableSkills is true (default for Pro+), run the full skill pipeline
// If false (Starter tier or user preference), run basic generation only
```

### 6B. Progress Streaming

Create `src/app/api/decks/generate-stream/route.ts`:

Use Server-Sent Events (SSE) to stream generation progress to the frontend:

```typescript
// GET /api/decks/generate-stream?jobId=xxx
// Returns SSE stream:
// data: {"phase":"research","skill":"market-researcher","status":"started","message":"Researching market size...","progress":10}
// data: {"phase":"research","skill":"competitor-analyst","status":"completed","message":"Found 5 competitors","progress":25}
// data: {"phase":"slides","skill":"slide-generator","status":"started","message":"Generating slides with enriched data...","progress":40}
// ...
// data: {"phase":"complete","slides":[...],"progress":100}
```

### 6C. Generation Job Model

Add to Prisma schema:

```prisma
model GenerationJob {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  deckId      String?  // Set when deck is created
  status      String   @default("pending") // pending | running | completed | failed
  input       String   // JSON: DeckInput
  progress    Int      @default(0) // 0-100
  currentPhase String?
  skillResults String?  // JSON: Map<skillId, SkillResult>
  critiqueResults String? // JSON: critique outputs
  error       String?
  startedAt   DateTime?
  completedAt DateTime?
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([status])
}
```

---

## PHASE 7: User Interface

### 7A. Generation Progress UI

Replace the current "generating..." spinner with a rich progress view.

Create `src/components/GenerationProgress.tsx`:

```
┌────────────────────────────────────────────────┐
│  ✨ Creating your pitch deck                    │
│                                                │
│  ████████████████████░░░░░░░░  65%             │
│                                                │
│  ✅ Market Research        Found $48B TAM       │
│  ✅ Competitor Analysis    5 competitors mapped  │
│  ✅ Financial Model        Unit economics ready  │
│  ✅ Industry Data          12 data points found  │
│  🔄 Generating Slides      Slide 8 of 14...     │
│  ⏳ Visual Enhancement     Waiting...            │
│  ⏳ Expert Review          Waiting...            │
│                                                │
│  💡 Using real market data from Gartner, IDC    │
└────────────────────────────────────────────────┘
```

Each completed skill shows a one-line summary of what it found. This builds user confidence that the deck is being crafted, not template-generated.

### 7B. Skill Outputs Panel (Post-Generation)

After deck generation, show a "Research & Analysis" tab in the deck view:

- **Market Research**: TAM/SAM/SOM with sources
- **Competitor Map**: Visual positioning map + competitor cards
- **Financial Model**: Unit economics and projections
- **Expert Critique**: VC analysis, pitch coach feedback, credibility check
- **Skills Used**: Which skills ran, confidence scores, time taken

This transparency is a premium feature (Growth+ tier) and differentiates PitchIQ from every competitor. Users can see the research that went into their deck.

### 7C. Critique Review Modal

After generation, if the critique found issues, show a review modal:

```
📋 Expert Review Complete

Your deck scored 78/100 from our VC Analyst.

3 improvements were auto-applied:
  ✅ Added bottom-up market sizing (Slide 4)
  ✅ Fixed revenue projection inconsistency (Slide 9)
  ✅ Strengthened competitive differentiation (Slide 10)

2 optional improvements:
  💡 "Consider adding customer testimonial" (Slide 8)
  💡 "Net retention metric would strengthen traction" (Slide 7)

[View Full Analysis]  [Open Deck]
```

---

## PHASE 8: Skill Budget & Plan Gating

### 8A. Skill Tiers

Different plan tiers get different skill access:

| Skill | Starter | Pro | Growth | Enterprise |
|-------|---------|-----|--------|------------|
| Basic generation (no skills) | ✅ | ✅ | ✅ | ✅ |
| Financial Modeler | ❌ | ✅ | ✅ | ✅ |
| Industry Data | ❌ | ✅ | ✅ | ✅ |
| Icon Selector | ❌ | ✅ | ✅ | ✅ |
| Market Researcher (web) | ❌ | ❌ | ✅ | ✅ |
| Competitor Analyst (web) | ❌ | ❌ | ✅ | ✅ |
| Image Finder (enhanced) | ❌ | ❌ | ✅ | ✅ |
| Diagram Generator | ❌ | ❌ | ✅ | ✅ |
| Mockup Generator | ❌ | ❌ | ✅ | ✅ |
| VC Analyst critique | ❌ | ❌ | ✅ | ✅ |
| Pitch Coach critique | ❌ | ❌ | ✅ | ✅ |
| Data Credibility check | ❌ | ❌ | ✅ | ✅ |
| Design Reviewer | ❌ | ❌ | ✅ | ✅ |
| Full critique cycle + auto-fix | ❌ | ❌ | ❌ | ✅ |

### 8B. API Call Budget

Each generation gets a budget of API calls to prevent runaway costs:

- **Starter**: 1 call (basic generation only)
- **Pro**: 5 calls (generation + financial model + industry data + icons)
- **Growth**: 15 calls (full research + visuals + critique)
- **Enterprise**: 25 calls (full pipeline + auto-fix cycle)
- **PAYG Credits**: Each skill costs 1 credit, full pipeline costs 8 credits

### 8C. Update `plan-limits.ts`

Add to PlanLimits interface:
```typescript
generationSkills: "none" | "basic" | "full" | "premium";
generationAPICalls: number;
```

---

## Implementation Notes

- **Do NOT ask questions** — make reasonable decisions and implement
- **Web search**: For the market researcher and competitor analyst, use the Anthropic SDK's built-in web search tool (beta) if available, otherwise fall back to AI knowledge. Do NOT use external search APIs (SerpAPI, etc.) — keep dependencies minimal
- **All skills must have a non-API fallback** — the system must produce a deck even with zero external API calls. Skills degrade gracefully: web search → AI knowledge → heuristic data → skip
- **Skills run with timeouts** — if a skill takes >10 seconds, cancel and use fallback
- **Critique is additive, not blocking** — if critique skills fail, the deck is still delivered. Critique results are displayed as suggestions, not gates
- **Run `npx prisma db push`** after schema changes
- **Run `npm run build`** periodically
- **SSE streaming**: Use Next.js route handlers with `ReadableStream` for progress events
- **Keep existing generation working** — the skill pipeline is opt-in via `enableSkills` flag. Default to `true` for Pro+ users, `false` for Starter
- **Store skill outputs** on the GenerationJob model — they're valuable for the "Research & Analysis" panel and for regeneration/refinement
