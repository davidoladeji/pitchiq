# PitchIQ Deck Generation: Research & Overhaul Proposal

## The Problem

PitchIQ's current deck generation will produce sameness at scale. Here's why, backed by a thorough audit of the codebase and competitive research:

### 1. Single-Prompt Monolith

The entire deck is generated in ONE Claude call (`generate-deck.ts`, line 21-88). A single 4,000-word prompt asks the AI to simultaneously handle content strategy, narrative arc, visual design decisions, data generation, and storytelling — all within a 6,000-token output budget. This is like asking an architect to design a house, write the marketing brochure, and pick the furniture all in one breath.

**Result**: The AI spreads itself thin. Content is surface-level. Visual decisions are formulaic because the model is already at capacity handling structure.

### 2. Twelve Slide Types, Five Layouts — That's It

Every PitchIQ deck draws from the same vocabulary:
- **Types**: title, content, stats, comparison, cta, chart, metrics, team, timeline, image-content, logo-grid, table
- **Layouts**: default, centered, split, two-column, stat-highlight

A fintech Series A deck and a consumer pre-seed deck get the same visual building blocks. Compare this to a professional design agency (Celerart, Halo Lab, Slidebean's design service) where every deck gets a custom visual system built from the company's brand, industry conventions, and storytelling needs.

### 3. Prescribed Slide Order

Line 66-80 of `generate-deck.ts` literally prescribes: Title → Problem → Solution → Market → Product → Business Model → Traction → Social Proof → Growth → Competition → Team → Roadmap → Financials → Ask → CTA. Every single deck follows this skeleton. Investors see hundreds of decks — they can tell when they're all generated from the same template.

As VC Charles Hudson (Precursor Ventures) warns: "The only thing that seems to differentiate these companies is the names of the founders. There isn't much true differentiation."

### 4. No Industry Visual DNA

A biotech deck should feel clinical, data-heavy, with clean whites and scientific typography. A gaming startup should feel bold, colorful, with dynamic compositions. A B2B enterprise SaaS should feel corporate-premium with restrained elegance. Currently, the theme system (13 color themes) affects palette but not composition, typography hierarchy, image treatment, or information density.

### 5. Cookie-Cutter Data Visualization

Only 4 chart types: bar, pie, line, area. No infographics, no creative data displays (waffle charts, icon arrays, radial progress, comparison cards, funnel visualizations with custom styling, waterfall charts for unit economics, etc.). The chart data is either AI-hallucinated or filled by the Thesys API — neither produces the bespoke feel of a hand-crafted deck.

### 6. No Visual Storytelling Arc

Professional decks have visual rhythm — high-impact visual slides alternate with data-dense slides, creating tension and release. The pacing builds toward the ask. Currently, slides are independent units with no concept of visual momentum.

### 7. Stock Imagery Problem

Image queries are truncated to 100 characters and sent to Unsplash. The results are generic ("modern SaaS dashboard") — the same stock photos every AI tool returns. This is the #1 visual tell that a deck was AI-generated.

---

## What the Best Tools Do Differently

### Gamma
- Generates from prompt but applies **design rules per-card** (their term for slides)
- Theme system goes beyond colors into composition patterns
- Cards are more like sections — variable height, mixed content blocks
- Brand import: users can bring logos, colors, fonts and the system respects them

### Beautiful.ai
- **Smart slides**: design rules baked into each template so you literally cannot make an ugly slide
- Auto-adjusts spacing, alignment, typography as you edit
- Doesn't generate content — focuses entirely on design intelligence
- Dozens of layout templates that adapt to content volume

### Tome
- Full-bleed imagery, cinematic layouts
- AI pairs copy with DALL-E visuals in one sweep
- Storytelling flow feels like a brand experience, not a business document
- Strongest at emotional/narrative decks (weakest at data-heavy ones)

### Slidebean
- **Purpose-built for fundraising**: AI understands investor expectations
- Templates modeled on decks that actually raised capital (Airbnb, Uber, etc.)
- Includes analytics and investor outreach (like PitchIQ)
- Optional human design review services as upsell

### What Professional Design Agencies Do
- Assemble teams: business analyst + brand designer + UI specialist
- Build custom visual systems per client (grid, type scale, image treatment, color logic)
- Create "slide masters" — compositional frameworks, not just color themes
- Vary information density deliberately (splash slides vs. data slides)
- Use the Rule of Thirds, Golden Ratio, and modular grids for composition
- Bento-style layouts where each idea gets its own visual compartment

---

## The Solution: Multi-Phase Generation Pipeline

Instead of one prompt generating everything, break generation into a **pipeline of specialized stages**:

### Stage 1: Company Intelligence Extraction
**What**: Deep analysis of the company's inputs to build a "Company DNA" profile
**How**: AI analyzes problem, solution, metrics, industry, stage, team to determine:
- **Narrative archetype**: Is this a "David vs Goliath" story? "Inevitable trend"? "Secret insight"? "Proven model in new market"?
- **Visual personality**: Corporate-premium vs. startup-bold vs. scientific-clean vs. creative-dynamic
- **Information density profile**: Data-heavy (lots of metrics/traction) vs. vision-heavy (early stage, big idea) vs. balanced
- **Key tension**: What's the central conflict the deck resolves?

### Stage 2: Narrative Architecture
**What**: Design the story structure — NOT a fixed template
**How**: AI designs a custom slide sequence based on the Company DNA:
- Which slides this specific company needs (not every company needs a competition slide)
- Custom ordering for investor type (VC/angel/accelerator) AND company story
- Pacing plan: where to place high-impact visual moments vs. data density
- Emotional arc: hook → tension → credibility → vision → ask
- Number of slides (10-16) based on how much substance the company has

### Stage 3: Visual System Design
**What**: Create a bespoke design language for this deck
**How**: Based on Company DNA, generate:
- **Composition strategy**: Which grid patterns to use (asymmetric for bold startups, modular for enterprise, editorial for consumer brands)
- **Typography hierarchy**: Beyond just font — the relationship between heading sizes, weight contrast, case usage
- **Color logic**: Not just a palette but rules for when to use accent vs. muted, gradient vs. solid
- **Image treatment**: Full-bleed vs. contained, rounded vs. sharp, overlayed text vs. separate
- **Data visualization style**: Minimalist charts vs. infographic-heavy vs. annotated
- **Visual motifs**: Recurring visual elements that create identity (e.g., a distinctive divider style, icon treatment, or background pattern)

### Stage 4: Per-Slide Content Generation
**What**: Generate each slide individually with full context
**How**: For each slide in the narrative architecture:
- Full slide brief: purpose, key message, emotional beat, visual treatment
- Generate content with company-specific language and real data
- Apply the visual system: select layout composition, specify block arrangement
- Write image/illustration briefs that are highly specific (not generic stock photo queries)

### Stage 5: Visual Coherence Pass
**What**: Review the full deck as a unit for flow and variety
**How**: AI reviews the complete slide sequence and adjusts:
- No two consecutive slides should use the same composition pattern
- Color accent distribution across slides (not random, not uniform — rhythmic)
- Information density variation (prevent three data-heavy slides in a row)
- Visual callback from opening to closing (bookend technique)
- Ensure the "money slides" (traction, ask) have the most visual impact

### Stage 6: Enrichment
**What**: Add polish — images, refined charts, animations
**How**: Parallel processing of:
- Stock image search with highly specific, multi-keyword queries
- Chart data refinement with realistic, industry-appropriate numbers
- Optional AI image generation prompts for product mockups
- Slide transition suggestions

---

## Architectural Changes Required

### A. New Slide Composition System

Replace the flat 5-layout system with a **compositional grid** approach. Instead of "split" or "two-column", define compositions as block arrangements on the 12-column × 6-row grid:

**40+ Composition Patterns across 8 categories:**

1. **Hero compositions** (3): Full-bleed image + overlay text, cinematic wide image + bottom bar, gradient background + centered content
2. **Split compositions** (5): 50/50, 60/40, 40/60, vertical split top/bottom, diagonal split
3. **Modular/Bento compositions** (6): 2×2 grid, 3×1 strip, 1-large + 2-small, L-shape + fill, mosaic, staggered cards
4. **Data-forward compositions** (5): Full chart + annotation, chart + sidebar insights, dashboard (multi-metric), comparison (side-by-side with visual), waterfall/flow
5. **Content-forward compositions** (5): Numbered steps, icon grid (3×2), timeline (horizontal or vertical), process flow, layered cards
6. **Visual-forward compositions** (5): Product screenshot + features overlay, device mockup + caption, photo grid/collage, single large visual + quote, before/after split
7. **Emphasis compositions** (5): Single stat + context, quote + author + context, bold statement + supporting evidence, callout card + background, title card with brand mark
8. **Team/Social proof compositions** (6): Photo grid + bios, featured founder + grid, logo wall, testimonial cards, press logos + headline, investor logos + amounts

Each composition is defined as a set of block positions on the grid (not just a label), allowing the rendering engine to place content precisely.

### B. Industry Visual Profiles

Create a mapping from industry → visual personality:

```
fintech → corporate-premium: restrained palette, clean grids, trustworthy typography (Inter/SF Pro), data-heavy, blue/green tones
healthtech → clinical-clean: whites, greens, scientific feel, lots of data viz, credibility-focused
consumer → bold-playful: saturated colors, dynamic compositions, lifestyle imagery, rounded elements
enterprise-saas → professional-modern: structured grids, navy/slate tones, dashboard screenshots, case-study format
deeptech/biotech → scientific-rigorous: high data density, papers/diagrams feel, muted palette, technical typography
gaming → dynamic-bold: high contrast, neon accents, asymmetric layouts, dark backgrounds
climate/cleantech → organic-hopeful: earth tones, nature imagery, growth metaphors, warm palette
crypto/web3 → futuristic-gradient: gradients, geometric patterns, dark mode, tech-forward
marketplace → friendly-trustworthy: warm colors, social proof heavy, two-sided visual language
edtech → approachable-clear: bright but professional, illustration-friendly, structured content
```

### C. Narrative Archetypes

Instead of one fixed slide order, define 6-8 narrative frameworks:

1. **The Disruptor**: Hook with shocking stat → broken status quo → revolutionary solution → proof it works → massive market → team that can execute → ask
2. **The Inevitable Trend**: Macro trend → why now → who wins → why us → traction → path to dominance → ask
3. **The Data Story**: Headline metric → how we got here → what drives it → market context → unit economics → projection → team → ask
4. **The Vision**: Future state → today's reality → bridge (our product) → early proof → market → team → ask
5. **The Secret Insight**: Non-obvious insight → why everyone else is wrong → our approach → proof → market implications → team → ask
6. **The Proven Model**: Existing model in other markets → our adaptation → traction → why this market is different/bigger → expansion plan → team → ask
7. **The Team Story**: Founder origin → problem discovered → solution built → traction → market → why this team → ask (best for angel decks)
8. **The Traction Machine**: Key metric → growth story → what's driving it → market size → competition → expansion → team → ask (best for Series A+)

The AI selects the best archetype based on: stage, investor type, strength of traction data, and company story.

### D. Per-Slide AI Generation

Instead of generating all slides in one prompt, generate each slide with a focused prompt that includes:
- The slide's role in the narrative arc
- The emotional beat (build tension, provide relief, create urgency)
- The composition pattern assigned to this slide
- Content constraints (word count, number of data points)
- Visual treatment instructions from the visual system
- Context from surrounding slides (what came before, what comes after)

This allows each slide to be crafted with the attention of a dedicated designer, not mass-produced.

### E. Smart Content Differentiation

The AI should adapt writing style to company personality:
- **Technical founders**: precise language, fewer superlatives, let data speak
- **Consumer brands**: emotional language, lifestyle framing, aspiration
- **Enterprise**: ROI-focused, case study language, risk mitigation
- **Biotech/deep tech**: scientific rigor, regulatory awareness, milestone-driven

---

## What This Means in Practice

**Before (current system):**
Every deck = same 15 slides in same order with same layouts, different text. A fintech deck and a gaming deck are visually identical except for color theme.

**After:**
- A fintech Series A deck uses "The Data Story" archetype with corporate-premium visual DNA: clean modular grids, dashboard composition for metrics, waterfall chart for unit economics, blue-slate palette, Inter typography
- A consumer app seed deck uses "The Vision" archetype with bold-playful visual DNA: hero compositions with lifestyle imagery, vibrant palette, dynamic asymmetric layouts, rounded elements, DM Sans typography
- A biotech pre-seed deck uses "The Secret Insight" archetype with scientific-rigorous visual DNA: high-density data compositions, clinical whites, annotated diagrams, serif headers for authority

No two decks feel the same because the visual system, narrative structure, composition patterns, and writing style are all derived from the company's unique DNA.
