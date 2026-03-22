# Claude Code Prompt: Smart Deck Refinement from Uploads

> Paste this entire prompt into Claude Code in **Act mode**. Do not ask questions — implement everything described below.

---

## Context

You are working on the PitchIQ codebase (`usepitchiq.com`), a Next.js 14 + TypeScript + Prisma + PostgreSQL application. There is a critical gap in the user experience:

**Current flow**: User uploads a pitch deck (PDF/PPTX) → system parses it and generates a PIQ score with per-dimension feedback and recommendations → **dead end**. The user sees their score but has no way to automatically improve their deck. They'd have to manually create a new deck from scratch using the generation form, re-entering all their company info.

**What users want**: Upload deck → get scored → **one click to generate a refined/improved version** that uses the extracted content from their upload PLUS the scoring feedback to create a better deck. The system already has all the pieces — text extraction (`extract-deck-text.ts`), AI scoring (`piq-score.ts`), and AI generation (`generate-deck.ts`) — they just aren't connected.

**Your job**: Close this loop. Build a "Smart Refine" feature that takes an uploaded (or any) deck's content and PIQ score, then generates a new improved deck informed by the scoring feedback.

---

## PHASE 1: Content Extraction from Uploaded Decks

### 1A. Create `src/lib/deck-content-extractor.ts`

This module takes the raw slide text from an uploaded deck and uses AI to extract structured company information — the same fields needed for deck generation.

```typescript
export interface ExtractedDeckContent {
  companyName: string;
  tagline?: string;
  problem: string;
  solution: string;
  industry: string;
  stage: string;
  fundingTarget: string;
  keyMetrics: string;
  teamInfo: string;
  businessModel?: string;
  revenueModel?: string;
  customerType?: string;
  competitiveAdvantage?: string;
  traction?: string;
  marketSize?: string;
  useOfFunds?: string;
  // Raw slide texts for reference
  slideTexts: string[];
  // Confidence: how much useful content was extracted
  extractionConfidence: "high" | "medium" | "low";
}

/**
 * Extract structured content from deck slide texts using AI.
 * Falls back to heuristic extraction if AI is unavailable.
 */
export async function extractDeckContent(
  slideTexts: string[],
  deckTitle?: string,
): Promise<ExtractedDeckContent>
```

**AI extraction prompt** should:
- Receive the concatenated slide texts
- Ask Claude to identify and extract: company name, problem statement, solution, key metrics/traction, team info, industry/sector, funding stage, funding ask, business model, competitive advantage, market size, use of funds
- Return structured JSON
- Handle partial/messy decks gracefully (many uploaded decks are rough drafts)

**Heuristic fallback** (no API key):
- Parse slide texts for common patterns: "Problem:", "Solution:", "Team:", "$XM", "Series A", etc.
- Use the first slide for company name
- Set `extractionConfidence: "low"`

### 1B. Update the Score Endpoint

In `/src/app/api/score/route.ts`, after scoring is complete:
- Call `extractDeckContent()` on the slide texts
- Store the extracted content on the Deck record (update the existing fields: `problem`, `solution`, `keyMetrics`, `teamInfo`, `industry`, `stage`, `fundingTarget`)
- Also store the raw slide texts in a new field (see schema change below)

### 1C. Schema Addition

Add to the `Deck` model in `prisma/schema.prisma`:

```prisma
uploadedSlideTexts  String?  // JSON: string[] — raw text per slide from upload
extractedContent    String?  // JSON: ExtractedDeckContent — AI-extracted structured data
```

Run `npx prisma db push`.

---

## PHASE 2: Refinement Engine

### 2A. Create `src/lib/refine-deck.ts`

This is the core intelligence — it takes an existing deck's content + PIQ score feedback and generates an improved deck.

```typescript
export interface RefinementInput {
  /** Extracted content from the original deck */
  content: ExtractedDeckContent;
  /** PIQ score with per-dimension feedback */
  piqScore: {
    overall: number;
    grade: string;
    dimensions: Array<{
      id: string;
      label: string;
      score: number;
      feedback: string;
    }>;
    recommendations: string[];
  };
  /** Investor type to optimize for */
  investorType: string;
  /** User's optional guidance: "make the traction section stronger", "add more market data", etc. */
  userGuidance?: string;
  /** Which weak dimensions to prioritize (auto-detected from score, user can override) */
  focusAreas?: string[];
}

export interface RefinementResult {
  /** The generated slides for the improved deck */
  slides: SlideData[];
  /** What was changed and why */
  improvements: Array<{
    dimension: string;
    originalScore: number;
    change: string;  // Human-readable: "Added TAM/SAM/SOM breakdown to market slide"
  }>;
  /** Summary of all improvements */
  summary: string;
}

/**
 * Generate an improved deck based on original content + PIQ feedback.
 */
export async function refineDeck(input: RefinementInput): Promise<RefinementResult>
```

**The AI prompt for refinement** is the key differentiator. It should:

1. **Include the original deck content** — so the refined version builds on what the founder actually has, not generic filler
2. **Include ALL PIQ dimension scores and feedback** — so the AI knows exactly what to fix
3. **Include the recommendations** — specific actionable items from scoring
4. **Prioritize weak dimensions** — if Narrative Structure scored 45/100 but Financial Clarity scored 85/100, focus effort on narrative
5. **Preserve what's good** — don't rewrite sections that scored well; keep the founder's voice and specific data points
6. **Add missing sections** — if the upload had no competitive analysis, generate one based on the industry
7. **Enhance with best practices** — apply the investor-type-specific ordering (VC: TAM first → traction → team; Angel: story first → problem → traction; Accelerator: traction first → team → market)

**Prompt structure** (send to Claude):

```
You are a world-class pitch deck consultant. A founder uploaded their pitch deck and received the following score:

OVERALL: {score}/100 ({grade})

DIMENSION SCORES:
- Narrative Structure: {score}/100 — {feedback}
- Market Sizing: {score}/100 — {feedback}
- Competitive Differentiation: {score}/100 — {feedback}
- Financial Clarity: {score}/100 — {feedback}
- Team Presentation: {score}/100 — {feedback}
- Ask Justification: {score}/100 — {feedback}
- Design Quality: {score}/100 — {feedback}
- Data Credibility: {score}/100 — {feedback}

RECOMMENDATIONS:
{recommendations}

ORIGINAL DECK CONTENT:
Company: {companyName}
Problem: {problem}
Solution: {solution}
Key Metrics: {keyMetrics}
Team: {teamInfo}
Industry: {industry}
Stage: {stage}
Funding Target: {fundingTarget}
{additional fields if available}

ORIGINAL SLIDE TEXTS:
{slideTexts per slide}

USER GUIDANCE: {userGuidance or "None — improve based on score feedback"}

TARGET INVESTOR TYPE: {investorType}

TASK: Generate an improved 10-14 slide pitch deck that:
1. PRESERVES the founder's specific data points, metrics, team info, and company details
2. FIXES every weakness identified in the scoring feedback
3. ADDS missing sections (competitive analysis, market sizing, use of funds, etc.) where the original was lacking
4. RESTRUCTURES the narrative for {investorType} investors
5. ENHANCES weak dimensions to aim for 80+ scores

For each slide, explain what improvement was made and which dimension it addresses.

Return JSON: { slides: [...], improvements: [...], summary: "..." }
```

### 2B. Refinement API Route

Create `src/app/api/decks/[shareId]/refine-deck/route.ts`:

```typescript
// POST { investorType?: string, userGuidance?: string, focusAreas?: string[] }
//
// 1. Load the deck and its piqScore
// 2. If deck has extractedContent, use it; otherwise extract now from uploadedSlideTexts or slides
// 3. Call refineDeck() with content + score + options
// 4. Create a new Deck record with source: "refined", linked to original
// 5. Score the new deck immediately
// 6. Return { newDeck, improvements, scoreBefore, scoreAfter }
```

### 2C. Schema: Track Refinement Lineage

Add to `Deck` model:

```prisma
refinedFromId     String?          // ID of the deck this was refined from
refinedFrom       Deck?    @relation("DeckRefinements", fields: [refinedFromId], references: [id])
refinements       Deck[]   @relation("DeckRefinements")
refinementNotes   String?          // JSON: improvements summary from refinement
```

Update the `source` field documentation to include `"refined"` as a valid value.

---

## PHASE 3: User Interface

### 3A. Post-Score Refinement CTA

After scoring an uploaded deck, show a prominent call-to-action. Update the score results UI (wherever the PIQ score is displayed after upload) to include:

**Score Results Card Enhancement:**
```
Your PIQ Score: 62/100 (B-)

[Dimension scores with bars...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Want a better score?

PitchIQ can rebuild your deck using your content
and fix every weakness identified above.

[🚀 Generate Improved Deck]  [✏️ Edit in Editor Instead]

Investor type: [VC ▾]
Optional guidance: [e.g., "emphasize our revenue growth"...]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3B. Refinement Progress UI

When the user clicks "Generate Improved Deck":

1. Show a loading state with progress indicators:
   - "Analyzing your original deck..."
   - "Identifying improvement areas..."
   - "Generating improved slides..."
   - "Scoring your new deck..."

2. On completion, show a **side-by-side comparison**:

```
┌──────────────────────────┬──────────────────────────┐
│  ORIGINAL (62/100)       │  IMPROVED (81/100) ✨     │
├──────────────────────────┼──────────────────────────┤
│ Narrative:    45 ██░░░   │ Narrative:    82 ████░   │
│ Market:       58 ███░░   │ Market:       85 ████░   │
│ Competition:  40 ██░░░   │ Competition:  78 ████░   │
│ Financial:    85 ████░   │ Financial:    88 ████░   │
│ Team:         70 ███░░   │ Team:         75 ████░   │
│ Ask:          55 ███░░   │ Ask:          80 ████░   │
│ Design:       60 ███░░   │ Design:       76 ████░   │
│ Data:         72 ████░   │ Data:         82 ████░   │
└──────────────────────────┴──────────────────────────┘
```

3. Show the list of specific improvements made:
   - "✅ Added TAM/SAM/SOM market sizing slide (Market: 58→85)"
   - "✅ Restructured narrative arc: Hook→Problem→Solution→Traction (Narrative: 45→82)"
   - "✅ Added competitive matrix with 4 competitors (Competition: 40→78)"
   - etc.

4. Action buttons:
   - **[Open Improved Deck]** → goes to editor with the new deck
   - **[Refine Again]** → run refinement again (costs credits if PAYG)
   - **[Keep Original]** → dismiss

### 3C. Dashboard Integration

On the dashboard deck list, for uploaded decks that have been scored:
- Show a small "Improve" button/badge next to any deck scoring below 75
- Tooltip: "Generate an AI-improved version of this deck"
- Clicking it opens a modal with investor type selector + optional guidance, then triggers refinement

For refined decks:
- Show a "Refined from [Original Name]" badge
- Link back to original deck for comparison
- Show the score delta: "+19 points from original"

### 3D. Refinement History

On a deck's detail/settings page, show refinement lineage:
```
📄 Original Upload (62/100) → 📄 Refined v1 (78/100) → 📄 Refined v2 (84/100)
```

Each node is clickable to view that version.

---

## PHASE 4: Smart Defaults & Auto-Population

### 4A. Auto-Populate Generation Form from Upload

When a user uploads a deck and gets scored, the extracted content should also pre-populate the "Create New Deck" form if they choose to start fresh. Update the deck creation flow:

- If user navigates to "Create Deck" and they have a recently uploaded deck with extracted content, offer: "Pre-fill from your uploaded deck [DeckName]?"
- Populate: company name, problem, solution, key metrics, team info, industry, stage, funding target
- This way even users who don't use "Smart Refine" benefit from content extraction

### 4B. Update Score API Response

The `/api/score` endpoint should return the extracted content in its response, so the frontend has it immediately:

```typescript
{
  piqScore: { ... },
  deck: { ... },
  extractedContent: {
    companyName: "...",
    problem: "...",
    solution: "...",
    // ... all fields
    extractionConfidence: "high"
  },
  refinementAvailable: true  // flag for frontend to show CTA
}
```

---

## PHASE 5: Iterative Refinement

### 5A. Multi-Round Refinement

Allow users to refine a refined deck. The second refinement should:
- Use the improved deck's content (not the original upload)
- Use the improved deck's PIQ score
- Focus on remaining weak dimensions
- Reference what was already improved ("Market sizing was fixed in the previous refinement; now focus on...")

### 5B. Guided Refinement

Create `src/app/api/decks/[shareId]/refine-suggestions/route.ts`:

```typescript
// GET — returns refinement suggestions without generating
// Shows the user what WOULD be improved and asks for confirmation/guidance
{
  weakDimensions: [
    { dimension: "Market Sizing", score: 45, suggestedFix: "Add TAM/SAM/SOM analysis" },
    { dimension: "Narrative", score: 52, suggestedFix: "Restructure for problem-first arc" },
  ],
  preservedStrengths: [
    { dimension: "Financial Clarity", score: 88, reason: "Strong unit economics section" },
  ],
  estimatedNewScore: 78,  // rough estimate
  suggestedInvestorType: "vc",  // based on deck content
}
```

This endpoint is lightweight (no generation) and lets the user preview what refinement would do before committing (which costs credits).

---

## PHASE 6: Credit Integration

### 6A. Refinement Credit Cost

Add a new credit action to the PAYG system (if implemented):

```typescript
{ action: "deck_refinement", displayName: "Smart Deck Refinement", cost: 5, description: "AI-powered deck improvement from PIQ feedback", requiredPlan: "pro" }
```

If PAYG is not yet implemented, gate behind Pro+ plan.

### 6B. Refinement Suggestion (Free)

The `refine-suggestions` endpoint should be **free** (no credits) — it's a conversion tool that shows users the value they'd get from refining, encouraging them to pay for the actual refinement.

---

## Implementation Notes

- **Do NOT ask questions** — make reasonable decisions and implement
- **The extraction + refinement should work for BOTH uploaded and generated decks** — any deck with a PIQ score can be refined
- **Preserve the founder's real data** — this is critical. Don't replace their actual metrics with generic text. If they said "42% MoM growth", keep that exact number.
- **Run `npx prisma db push`** after schema changes
- **Run `npm run build`** periodically to catch TypeScript errors
- **Use the existing `generate-deck.ts` patterns** for slide generation format — the refined deck must use the same `SlideData` structure
- **Use the existing UI patterns** — Tailwind, Lucide icons, shadcn-style components, dark theme
- **Plan gating**: Refinement requires Pro+ plan or credits
- **The comparison view is the money shot** — make it visually compelling. The before/after score comparison is what sells upgrades.
