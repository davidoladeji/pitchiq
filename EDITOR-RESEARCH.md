# PitchIQ Editor: Revolutionary Pitch Deck Builder Research

## Executive Summary

This document provides a comprehensive research-backed specification for building a revolutionary pitch deck editor. It synthesizes analysis of 15+ competing products, emerging design patterns, market gaps, and maps these against PitchIQ's existing architecture. The goal: an editor that combines the creative freedom of Canva, the intelligent auto-layout of Beautiful.ai, the narrative intelligence of Tome, and the startup-specific tooling of Slidebean — while going beyond all of them.

The core thesis: **every existing tool is either design-first or content-first. None are truly both.** PitchIQ should be the first editor where narrative and design are bidirectionally synchronized — where changing your story reshapes your layout, and changing your layout reshapes your story.

---

## Part 1: Competitive Landscape Analysis

### 1.1 The Current Market Map

The presentation builder market ($7.85B in 2025, projected $22.22B by 2033) splits into five categories:

**Traditional Tools (PowerPoint, Google Slides, Keynote)** — Universal but uninspired. PowerPoint owns enterprise through inertia. Google Slides wins on accessibility and collaboration. Keynote delivers premium design but is Apple-only. All three are adding AI (Copilot, Gemini, Apple Intelligence) but their core paradigm — freeform canvas with manual placement — hasn't fundamentally changed.

**AI-First Generators (Gamma, Tome, Slidebean, Pitches.ai)** — These generate complete decks from prompts. Gamma is the fastest (full deck in seconds). Tome combines GPT-4 text with DALL-E images for integrated creation. Slidebean is purpose-built for fundraising with investor-proven templates. The problem: generated output still needs significant manual refinement, and the editing experience after generation is mediocre.

**Smart Design Tools (Beautiful.ai, Canva)** — Beautiful.ai's "Smart Slides" auto-adjust spacing, fonts, and alignment as content changes. It enforces design rules (white space, visual hierarchy, compositional balance) automatically. Canva democratized design through simplicity and a massive element library. Neither has strong narrative intelligence or startup-specific features.

**Collaboration-First (Pitch.com, Figma Slides)** — Pitch excels at team editing and brand consistency. Figma Slides brings full design tools (Auto Layout, components) to presentations. Both are strong for teams but lack AI generation and startup-specific features.

**Interactive/Narrative (Prezi, Storydoc, Tome)** — Prezi pioneered non-linear zoom-based presentations. Storydoc does scrollytelling (interactive webpage-style). Tome blends slides with Notion-like documents. These push the format forward but sacrifice compatibility with the PowerPoint/PDF world investors expect.

### 1.2 What Each Competitor Does Best (and Worst)

| Product | Best At | Worst At | Core Paradigm |
|---------|---------|----------|---------------|
| **Canva** | Accessibility, element library, templates | Not purpose-built for presentations; feels "too templated" for professionals | Drag-and-drop freeform canvas |
| **Beautiful.ai** | Auto-layout, design enforcement, Smart Slides (G2: 4.7/5) | Creative freedom is limited; you work within its 300 layouts | AI-powered auto-layout |
| **Gamma** | Speed of generation, handles complex content well (Capterra: 4.5/5) | Less suitable for formal investor decks; limited export control | Card-based generative |
| **Tome** | Narrative storytelling, scrollable format, interactive embeds | Editing AI output requires effort; non-traditional format | Narrative doc-slide hybrid |
| **Slidebean** | Investor-proven templates, pitch analytics, fundraising workflow | Template-locked; limited creative freedom | Template-locked auto-design |
| **Pitch.com** | Team collaboration, brand consistency, modern UI | Less AI-driven; still catching up on generation features | Structured collaborative |
| **Figma Slides** | Design control, component reusability, Auto Layout | Missing presentation-specific features; complex for non-designers | Design-first freeform |
| **Prezi** | Non-linear navigation, cinematic zoom effects | Feels outdated vs. modern AI tools; niche appeal | Zoomable infinite canvas |
| **PowerPoint** | Universal compatibility, enterprise standard, Copilot AI | Complex interface, poor default design, steep learning curve | Freeform slide-based |
| **Google Slides** | Free, excellent collaboration, Gemini AI integration | Less design-focused; AI still catching up to dedicated tools | Cloud-native collaborative |
| **Keynote** | Premium design quality, Apple ecosystem integration | Apple-only; expensive ecosystem | Native freeform |
| **Visme** | Data visualization, interactive charts, animations | Steep learning curve; not ideal for simple decks | Data-viz focused drag-drop |
| **Storydoc** | Interactive scrollytelling, engagement analytics | Non-standard format; not investor-expected | Interactive webpage |
| **Decktopus** | Simplicity, integrated resource library | Limited customization; basic features | Template-based simple |

### 1.3 User Sentiment (from Reddit, G2, Product Hunt)

**What startup founders actually say they want:**
- 40-80% time reduction in deck creation (AI tools deliver ~40% savings today)
- Built-in fundraising guidance (which slides to include, what investors look for)
- Bulk-edit commands (align icons, apply dark mode to all slides instantly)
- Quality assurance that enforces visual hierarchy, color contrast, whitespace
- Analytics showing which slides investors actually spend time on
- Export flexibility: PowerPoint, PDF, web link, video — all from one source
- Brand consistency without manual formatting work

**What designers say they hate:**
- Countless hours aligning textboxes and formatting margins in PowerPoint
- Expected to "wow" under tight deadlines with tools that fight them
- Default designs that look amateurish; workarounds always required
- No constraint systems — everything is manual
- Template lock-in — beautiful templates you can't actually customize

**The tension:** Founders want speed and guidance. Designers want freedom and control. Current tools serve one or the other. A revolutionary editor must serve both simultaneously.

---

## Part 2: The Block System — What PitchIQ's Editor Should Contain

### 2.1 Design Philosophy: Constrained Freedom

The key insight from studying Canva, Beautiful.ai, and Figma Slides: **the best editors give you freedom within intelligent constraints.** You can do anything, but the tool nudges you toward good design. Beautiful.ai's Smart Slides enforce spacing rules automatically. Canva's snap points guide alignment naturally. Figma's Auto Layout adapts components responsively.

PitchIQ's block system should follow this principle: **every block type is a self-contained design unit that knows how to look good, but can be customized infinitely within its constraints.**

### 2.2 Block Categories and Specifications

PitchIQ currently has 9 block types: text, metric, chart, team-member, timeline-item, image, quote, logo-grid, comparison-row. Based on competitive analysis and market gaps, here is the complete block system needed:

---

#### CATEGORY 1: CONTENT BLOCKS

**1. Rich Text Block**
- *What it does:* Multi-paragraph text with inline formatting
- *Why it matters:* Foundation of every slide. Must feel as good as Notion's editor
- *Properties:* fontSize, fontWeight, fontFamily, color, alignment, lineHeight, letterSpacing, textTransform
- *Inline formatting:* bold, italic, underline, strikethrough, highlight, link, inline code
- *Smart features:* Auto-size text to fit container (like Keynote's "Autosize Text" — a feature Figma Slides notably lacks). AI-powered rewrite suggestions. Character/word count. Readability score
- *What competitors miss:* Most editors treat text as a dumb box. PitchIQ should understand text semantically — "this is a headline," "this is a supporting point," "this is a call to action" — and style accordingly
- *Developer notes:* Use contentEditable with a lightweight rich text engine (Tiptap/ProseMirror recommended over Draft.js for performance). Support markdown shortcuts (## for heading, ** for bold, etc.)

**2. Heading Block**
- *What it does:* Slide-level or section-level heading with automatic hierarchy
- *Properties:* level (h1-h4), alignment, color, fontFamily, fontWeight, textTransform, letterSpacing
- *Smart features:* Auto-scales based on content length. Maintains typographic hierarchy relative to other headings on the slide. Suggests heading text based on slide content
- *Developer notes:* Should be distinct from Rich Text — headings have different resize behavior, different default styling, and participate in slide-level hierarchy calculations

**3. Bullet List Block**
- *What it does:* Structured list with customizable markers
- *Properties:* markerStyle (bullet, number, letter, check, icon, custom), spacing, indentLevel, iconSet
- *Smart features:* Auto-animates on presentation (reveal one-by-one). Suggest icon replacements for bullets. Convert between list styles
- *What competitors miss:* Lists are the #1 content type in pitch decks but get the least design attention. Each bullet should be a mini-block that can have its own icon, color accent, or emphasis level

**4. Callout/Highlight Block**
- *What it does:* Emphasized text block with background, border, or accent
- *Properties:* variant (info, warning, success, quote, stat, custom), icon, backgroundColor, borderStyle, borderColor
- *Why it matters:* Investors scan decks fast. Callouts create visual anchors that draw the eye to key points
- *Developer notes:* Should support nesting a Rich Text block inside it

**5. Quote/Testimonial Block** (existing, needs expansion)
- *What it does:* Customer quotes, press quotes, advisor endorsements
- *Properties:* attribution, role, company, avatarUrl, rating (1-5 stars), source (press logo), variant (minimal, card, featured)
- *Smart features:* Auto-pull testimonials from connected sources (website, G2, etc.). Format switching between styles
- *What competitors miss:* Most treat quotes as styled text. A proper testimonial block should feel like social proof — with avatar, company logo, star rating, and source attribution as first-class elements

---

#### CATEGORY 2: DATA & METRICS BLOCKS

**6. Metric/KPI Block** (existing, needs expansion)
- *What it does:* Single key number with context
- *Properties:* value, label, prefix ($, etc.), suffix (%, etc.), change, changePeriod, trend (up/down/neutral), previousValue, targetValue, format (number, currency, percentage)
- *Smart features:* Animated count-up on presentation. Sparkline mini-chart showing trend. Auto-format large numbers (1,200,000 → 1.2M). Color-coded trend indicators. Comparison to target (progress bar)
- *What competitors miss:* Metrics should tell a story. Not just "10,000 users" but "10,000 users — 3x growth in 6 months, 85% of target." The block should support this narrative context natively
- *Developer notes:* Use Intl.NumberFormat for locale-aware formatting. Sparklines via a lightweight SVG library (no need for full Recharts)

**7. Metric Grid Block**
- *What it does:* Multiple metrics in a responsive grid layout
- *Properties:* columns (2-4), metrics (array of MetricBlock data), variant (cards, minimal, featured)
- *Smart features:* Auto-layout based on number of metrics. Highlight the most impressive metric automatically. Responsive — adapts from 4-column to 2-column based on content
- *Why it matters:* Traction slides need 3-6 metrics displayed together. This is one of the most common pitch deck patterns and deserves a dedicated compound block

**8. Chart Block** (existing, needs major expansion)
- *Current state:* Bar, pie, line, area via Recharts
- *Needed chart types:* Bar (horizontal/vertical/stacked/grouped), line, area (stacked), pie, donut, funnel, waterfall, scatter, treemap, gauge/radial, combo (bar + line), sparkline
- *Properties:* chartType, data, xAxisLabel, yAxisLabel, showLegend, showGrid, showValues, colorScheme, animate, aspectRatio
- *Smart features:*
  - **Data table editor** with paste-from-spreadsheet support (parse CSV/TSV from clipboard)
  - **Live data connections** — pull from Google Sheets, Airtable, or API endpoints
  - **Chart type recommendation** — AI suggests best visualization for the data shape
  - **Annotation layer** — add callout labels pointing to specific data points ("Series A closed here")
  - **Animation on present** — data builds progressively during presentation
- *What competitors miss:* Visme does interactive charts but is complex. Beautiful.ai does auto-styled charts but limited types. Nobody does annotation layers or live data in a pitch deck context
- *Developer notes:* Consider Recharts for standard charts + a custom SVG layer for annotations. For live data, use SWR/React Query with configurable refresh intervals

**9. Table Block**
- *What it does:* Structured data in rows and columns
- *Properties:* columns (array of {header, width, align}), rows (array of cell data), headerStyle, stripedRows, borderStyle, highlightColumn, highlightRow
- *Smart features:* Paste from spreadsheet. Auto-size columns. Highlight best values. Sortable in presentation mode. Convert to chart with one click
- *Why it matters:* Comparison tables (us vs. competitors), pricing tables, and feature matrices are pitch deck staples
- *Developer notes:* Use CSS Grid internally (not HTML table) for better styling control

**10. Progress/Goal Block**
- *What it does:* Visual progress toward a goal
- *Properties:* current, target, label, format (bar, radial, steps), milestones (array), color
- *Smart features:* Milestone markers with labels. Animated fill on presentation. Multiple progress bars for comparing metrics
- *Why it matters:* Fundraising progress, product milestones, growth targets — these are core pitch deck narratives

---

#### CATEGORY 3: VISUAL & MEDIA BLOCKS

**11. Image Block** (existing, needs expansion)
- *Properties:* src, alt, fit (cover/contain/fill), borderRadius, shadow, opacity, filter (grayscale, blur, brightness), mask (circle, rounded, custom shape), caption
- *Smart features:*
  - **AI image generation** inline (describe → generate → insert)
  - **Smart crop** with subject detection
  - **Background removal** (one-click)
  - **Image effects** (duotone, gradient overlay, blur background)
  - **Placeholder system** — drag in a "product screenshot" placeholder that shows a device mockup frame
- *What competitors miss:* Canva has the best image tooling but it's generic. PitchIQ should have pitch-specific image frames: phone mockups, laptop mockups, dashboard screenshots, app store frames
- *Developer notes:* Use canvas API for client-side effects. Consider Cloudinary or similar for server-side transforms. Background removal can use remove.bg API or a local ML model

**12. Icon Block**
- *What it does:* Single icon from an icon library
- *Properties:* icon (name/id from library), size, color, backgroundColor, shape (none, circle, rounded-square, square), strokeWidth
- *Icon sources:* Lucide (already in stack), Phosphor, custom uploaded SVGs
- *Smart features:* Search by concept ("growth" → trending-up, rocket, chart-line). Consistent styling across all icons on a slide. Swap icon libraries without changing layout
- *Why it matters:* Icons are the visual language of pitch decks. Every feature list, every process flow, every value prop uses icons

**13. Shape Block**
- *What it does:* Geometric shapes and decorative elements
- *Properties:* shape (rectangle, circle, triangle, arrow, line, custom path), fill, stroke, strokeWidth, opacity, rotation, borderRadius
- *Smart features:* Connector lines between blocks. Arrow shapes that auto-route. Decorative dividers
- *Developer notes:* SVG-based rendering. For connectors, track source and target block IDs and recalculate path on layout changes

**14. Video/Embed Block**
- *What it does:* Embedded media from external sources
- *Properties:* url, type (youtube, vimeo, loom, figma, generic-iframe), autoplay, startTime, aspectRatio, thumbnail
- *Smart features:* Auto-detect embed type from URL. Generate thumbnail preview for PDF export. Loom integration for recording directly into a slide
- *Why it matters:* Product demos are critical in pitch decks. Embedding a 30-second Loom walkthrough is more compelling than 5 static screenshots
- *Developer notes:* Use iframe sandboxing. For PDF export, capture thumbnail frame and link to video URL

**15. Device Mockup Block**
- *What it does:* Wraps a screenshot or image in a device frame (phone, laptop, tablet, browser window)
- *Properties:* device (iphone, android, macbook, ipad, browser, watch), screenshot (image src), orientation (portrait/landscape), colorVariant (silver, space-gray, gold)
- *Smart features:* Auto-resize screenshot to fit device frame. Multiple devices in a composition (phone + laptop side by side). Animated scroll-through of multiple screenshots
- *Why it matters:* This is one of the most requested features on Reddit/Product Hunt for pitch deck tools. Every product demo slide needs device mockups. Currently founders screenshot their app and manually place it in a phone frame in Figma — this should be one click
- *Developer notes:* Pre-built SVG device frames with a clipping mask for the screenshot area. Store device frame SVGs as assets

**16. Logo Grid Block** (existing, needs expansion)
- *Properties:* logos (array of {src, name, url}), columns (2-6), variant (grayscale, color, monochrome), size (sm, md, lg), showNames, backgroundColor
- *Smart features:* Auto-fetch company logos by name (using Clearbit Logo API or similar). Grayscale filter with color-on-hover for presentations. "As seen in" / "Trusted by" / "Backed by" header variants
- *What competitors miss:* Founders spend absurd time finding, downloading, and sizing partner logos. Auto-fetch by company name eliminates this entirely

---

#### CATEGORY 4: STORYTELLING & NARRATIVE BLOCKS

**17. Timeline/Roadmap Block** (existing, needs major expansion)
- *Current state:* Single timeline items
- *Needed:* Full timeline visualization with multiple items
- *Properties:* items (array of {date, title, description, status, icon}), orientation (horizontal, vertical), style (line, stepped, branching), showConnectors, currentMarker
- *Smart features:*
  - **Past/present/future styling** — completed items are solid, current is highlighted, future is dotted/faded
  - **Zoom levels** — quarterly view vs. yearly view vs. multi-year view
  - **Milestone categories** — product, funding, team, market (color-coded)
  - **Auto-generate from text** — "We launched in Jan 2024, raised seed in June, hit 10k users in December" → visual timeline
- *What competitors miss:* Timelines in most tools are static. A pitch timeline should be dynamic — investors should see where you are on the journey and what's ahead

**18. Comparison Block** (existing, needs expansion)
- *Properties:* type (before-after, us-vs-them, feature-matrix), columns (2-4), items (array of {feature, values[]}), highlightWinner, showIcons
- *Variants:*
  - **Before/After:** Two-column with red/green or old/new styling
  - **Competitive Matrix:** Multi-column with checkmarks, X marks, and partial indicators
  - **Feature Comparison:** Grouped features with ratings or check/cross per competitor
- *Smart features:* Auto-highlight your advantages. Generate comparison from competitor URLs. Suggest missing comparison points based on industry
- *Why it matters:* The competitive landscape slide is in every pitch deck. It should be effortless to build and maintain

**19. Process/Flow Block**
- *What it does:* Step-by-step process visualization
- *Properties:* steps (array of {title, description, icon}), layout (horizontal, vertical, circular, zigzag), showNumbers, showConnectors, connectorStyle (arrow, line, dotted)
- *Smart features:* Auto-layout based on number of steps. Animated step-through during presentation. Branching flows for complex processes
- *Why it matters:* "How it works" slides are in virtually every pitch deck. Process flows are the visual standard
- *Developer notes:* SVG-based connectors with flexbox/grid-based step positioning

**20. Pricing/Tier Block**
- *What it does:* Pricing table with feature comparison across tiers
- *Properties:* tiers (array of {name, price, period, features[], highlighted, ctaLabel}), variant (cards, table, minimal)
- *Smart features:* Highlight recommended tier. Toggle monthly/annual pricing. Currency formatting. Feature grouping
- *Why it matters:* Business model slides need pricing visualization. This is so common it deserves a dedicated block rather than a manually-built table

**21. Team Block** (existing, needs expansion)
- *Properties:* members (array of {name, role, bio, avatarUrl, linkedinUrl, previousCompanies[], highlights[]}), layout (grid, list, featured+grid), showLogos
- *Smart features:*
  - **Auto-pull from LinkedIn** (with permission) — photo, title, previous companies
  - **Company logo badges** — show "ex-Google", "ex-McKinsey" as recognizable logos
  - **Advisor vs. Team distinction** — different visual treatment
  - **Featured member** layout — CEO/CTO larger, rest in grid below
- *What competitors miss:* Team slides are one of the most viewed by investors, yet every tool treats them as basic cards. The "ex-FAANG" logos next to names is a proven credibility signal that should be a native feature

**22. Funnel Block**
- *What it does:* Conversion funnel or market sizing (TAM/SAM/SOM)
- *Properties:* stages (array of {label, value, color}), type (funnel, inverted-pyramid, concentric-circles), showPercentages, showValues, animate
- *Smart features:* Auto-calculate conversion rates between stages. Animate on presentation. TAM/SAM/SOM template with auto-formatting of large numbers
- *Why it matters:* Market sizing slides (TAM/SAM/SOM) appear in every investor deck. Conversion funnels appear in every growth-stage deck. Both are painful to build manually

**23. Map/Geography Block**
- *What it does:* Geographic visualization showing market presence, expansion plans, or user distribution
- *Properties:* mapType (world, continent, country), highlights (array of {region, value, color}), markers (array of {lat, lng, label}), showLegend, projection
- *Smart features:* Choropleth (heat map by region). Pin markers for offices/customers. Expansion timeline overlay. Auto-highlight based on data
- *Why it matters:* Go-to-market slides, international expansion plans, and user distribution are common pitch deck elements
- *Developer notes:* Use a lightweight map library (react-simple-maps or D3-geo). Pre-built topoJSON for common regions. Keep it simple — this is a presentation, not Google Maps

---

#### CATEGORY 5: INTERACTIVE & DYNAMIC BLOCKS

**24. Calculator/Interactive Block**
- *What it does:* Embedded interactive calculator for financial projections or ROI demonstrations
- *Properties:* inputs (array of {label, type, default, min, max}), formula, outputLabel, outputFormat
- *Smart features:* Pre-built templates (ROI calculator, unit economics, growth projection). Real-time calculation as inputs change. Present-mode interaction
- *Why it matters:* Storydoc pioneered this — interactive calculators in presentations are incredibly engaging for investors. "Move this slider to see how our revenue scales with user growth" is more compelling than a static chart
- *Developer notes:* Formula evaluation via mathjs (already conceptually compatible). Input components from existing UI system

**25. CTA/Action Block**
- *What it does:* Call-to-action with button, link, or contact information
- *Properties:* headline, description, buttonLabel, buttonUrl, email, calendlyUrl, variant (card, banner, minimal), backgroundColor
- *Smart features:* Calendly embed for scheduling. Email capture form. Smart link detection (auto-style Calendly, LinkedIn, email links differently)
- *Why it matters:* The final slide of every pitch deck is a CTA. It should be purpose-built, not a text block with a manually-styled "button"

**26. Embed/Widget Block**
- *What it does:* Generic embed for any third-party content
- *Properties:* url, type (auto-detect), width, height, fallbackImage
- *Supported embeds:* Figma prototypes, Notion pages, Airtable views, Google Sheets charts, Twitter/X posts, Product Hunt badges, GitHub contribution graphs, App Store badges
- *Smart features:* Auto-detect embed type from URL. OEmbed protocol support. Fallback to screenshot for PDF export
- *Why it matters:* Modern pitch decks increasingly include live product demos, social proof tweets, and data from other tools

---

#### CATEGORY 6: LAYOUT & STRUCTURAL BLOCKS

**27. Divider Block**
- *What it does:* Visual separator between content sections
- *Properties:* style (line, dotted, dashed, gradient, decorative), color, thickness, width (full, partial), spacing
- *Smart features:* Auto-suggest dividers when content sections are dense

**28. Spacer Block**
- *What it does:* Intentional whitespace
- *Properties:* height (px or percentage)
- *Why it matters:* Whitespace is a design element. Making it explicit (rather than relying on margins) gives creators control

**29. Column Layout Block**
- *What it does:* Multi-column container that holds other blocks
- *Properties:* columns (2-4), ratio (equal, 2:1, 1:2, 1:1:1, 2:1:1, etc.), gap, verticalAlign (top, center, bottom)
- *Smart features:* Responsive — columns stack on narrow views. Drag blocks between columns. Auto-balance content height
- *Developer notes:* This is a container block — it renders child blocks inside each column. Use CSS Grid with named areas

**30. Card Group Block**
- *What it does:* Multiple cards in a consistent grid layout
- *Properties:* cards (array of {icon, title, description, image}), columns (2-4), variant (elevated, outlined, flat, image-top), equalHeight
- *Smart features:* Auto-layout based on card count. Consistent sizing. Icon or image options per card. Color accent per card
- *Why it matters:* "Three key features," "four market segments," "three revenue streams" — card grids are the backbone of pitch deck content. They appear on almost every slide that isn't a title or data slide

---

### 2.3 Block Interaction Model

Every block should support these universal interactions:

**Selection & Focus**
- Single click: select block (show selection ring + action bar)
- Double click: enter edit mode (inline editing for text-containing blocks)
- Click outside: deselect
- Tab: cycle through blocks on slide
- Escape: exit edit mode → selected mode → deselected

**Manipulation**
- Drag handle: reorder within slide
- Resize handles: corner and edge handles with aspect-ratio lock (shift key)
- Option/Alt + drag: duplicate block
- Delete/Backspace: remove block (with undo)

**Context Menu (right-click)**
- Duplicate, Delete, Copy style, Paste style
- Lock position, Lock content
- Move to front/back (z-index)
- Convert to... (suggest alternative block types for the same content)
- AI: Enhance, Rewrite, Suggest alternatives

**Action Bar (floating above selected block)**
- Block-specific quick actions (chart type switcher, text alignment, color)
- AI magic wand button
- More options (...)
- Drag handle

---

## Part 3: Smart Layout System

### 3.1 The Problem with Existing Approaches

**Freeform (PowerPoint, Keynote, Canva):** Total freedom means total responsibility. Users spend hours aligning elements, managing spacing, and fighting with layouts. Great for designers, terrible for everyone else.

**Template-locked (Slidebean, Haiku Deck):** Everything looks good automatically, but you can't customize. If the template doesn't match your content, you're stuck.

**Smart auto-layout (Beautiful.ai):** The best middle ground today — 300+ layouts that auto-adjust. But you're still choosing from presets, not creating freely.

### 3.2 PitchIQ's Approach: Adaptive Constraint Layout

PitchIQ should pioneer a fourth approach: **Adaptive Constraint Layout (ACL).**

The core idea: blocks exist on a slide within an intelligent grid that adapts to content. You can place blocks freely, but the system maintains design rules:

**Auto-spacing:** Blocks maintain consistent gutters. Move one block, and adjacent blocks adjust to maintain rhythm.

**Magnetic alignment:** Blocks snap to a 12-column grid, to other blocks' edges and centers, and to the slide's visual center. Alignment guides appear dynamically (like Figma/Canva).

**Content-aware resize:** When you type more text, the block grows and other blocks reflow around it. When you shrink an image, surrounding content expands to fill the space.

**Layout presets as starting points:** Offer layout presets (centered, split, two-column, three-column, asymmetric, etc.) but allow free modification. The preset sets the initial constraint grid; the user can break out of it selectively.

**Design rules engine:** A background process that continuously evaluates the slide against design principles:
- Minimum margin from edges (padding)
- Maximum content density (no more than N blocks per slide)
- Typography hierarchy consistency (heading > subheading > body > caption)
- Color contrast accessibility (WCAG AA minimum)
- Visual balance (content isn't all on one side)
- Whitespace ratio (at least 30% of slide should be whitespace)

The rules engine should surface warnings, not block actions. Think of it like a linter for design — yellow underlines, not hard errors.

### 3.3 Slide Templates as Layout Blueprints

Each slide template should be a named layout blueprint that specifies:

```typescript
interface SlideLayout {
  id: string;
  name: string;                    // "Split Left Image"
  category: SlideCategory;         // "content" | "data" | "team" | "cta" | etc.
  grid: GridDefinition;            // CSS Grid template
  zones: LayoutZone[];             // Named areas where blocks can be placed
  suggestedBlocks: BlockSuggestion[]; // What blocks work well in each zone
  constraints: LayoutConstraint[];    // Design rules specific to this layout
  variants: LayoutVariant[];          // Visual variations (accent, minimal, etc.)
}

interface LayoutZone {
  id: string;
  name: string;                    // "hero-image", "title-area", "content-area"
  gridArea: string;                // CSS Grid area name
  acceptedBlockTypes: SlideBlockType[];
  maxBlocks: number;
  defaultBlock?: BlockSuggestion;
}
```

**Recommended slide layout library (40+ layouts across categories):**

**Title Layouts (5):** Centered title, Title + subtitle, Title + image background, Bold statement, Section divider

**Content Layouts (8):** Single column, Two column (equal), Two column (60/40), Two column (40/60), Three column, Content + sidebar, Full image + overlay text, Content + featured image

**Data Layouts (6):** Single chart, Chart + commentary, Metric grid (2-4), Table, Comparison (2-col), Comparison (3-col)

**Team Layouts (3):** Team grid (2x2, 2x3, 3x3), Featured member + team grid, Advisors row

**Storytelling Layouts (6):** Timeline horizontal, Timeline vertical, Process flow, Funnel, Before/after split, Problem → solution

**Evidence Layouts (5):** Quote + attribution, Testimonial cards, Logo wall, Case study (image + text + metrics), Press mentions

**Market Layouts (4):** TAM/SAM/SOM, Market map, Geographic expansion, Competitive matrix

**CTA Layouts (3):** Contact card, Full-bleed CTA, Minimal ask

---

## Part 4: What Makes This Revolutionary

### 4.1 Beyond AI Generation: Narrative Intelligence

Every competitor is racing to generate decks from prompts. That's table stakes. PitchIQ should go further with **Narrative Intelligence** — an AI system that understands pitch deck storytelling at a structural level.

**Narrative Arc Analysis:** The AI understands that a pitch deck follows a story arc: Hook → Problem → Solution → Traction → Market → Business Model → Team → Ask. It monitors whether your deck follows a coherent narrative and flags gaps. "Your deck has a strong problem/solution section but no traction evidence — investors will ask about this."

**Audience Adaptation:** One deck, multiple audiences. Toggle between "Investor View" (emphasize traction, market size, returns), "Customer View" (emphasize features, pricing, case studies), and "Partner View" (emphasize integration, co-marketing, shared audience). The AI restructures content emphasis and slide ordering per audience.

**Claim Verification:** AI flags unsupported claims ("$50B market" without a source) and suggests data to back them up. Links to credible sources. This builds investor trust.

**Competitive Intelligence:** Connect your competitive landscape slide to live data. AI monitors competitor announcements and suggests updates to your positioning.

### 4.2 Beyond Templates: Generative Layouts

Instead of choosing from 300 preset layouts (Beautiful.ai) or getting a random AI layout (Gamma), PitchIQ should generate layouts specific to your content:

**Content → Layout:** You add three bullet points and a metric. The AI generates 5 layout options specifically for "three points + one metric." Not generic templates — layouts that understand what you're showing.

**Layout → Content:** You choose a layout that has space for a chart + two paragraphs. The AI suggests what content fits that structure based on your pitch narrative.

**Style Transfer:** See a slide layout you love in someone else's deck? Upload a screenshot. The AI extracts the layout pattern and applies it to your content. Not pixel-copying — understanding the structural relationships (this has a large image left, small text right, accent color bar top).

### 4.3 Beyond Static: Presentation Runtime

The presentation experience should be as revolutionary as the editor:

**Presenter Intelligence:** During a live pitch, the tool tracks which slides are being presented for how long. Post-presentation analytics show your pacing. AI suggests "You spent 45 seconds on the problem slide but only 10 seconds on traction — consider rebalancing."

**Dynamic Responses:** If an investor asks a question during a pitch, you can jump to any slide with a search overlay (Cmd+K style). The AI can also generate an "answer slide" on the fly based on common investor questions.

**Engagement Analytics (for shared links):** When you send your deck as a link, track per-slide view time, scroll depth, and re-engagement. Slidebean pioneered this but it should be richer — show heatmaps of where the cursor lingers, flag when the viewer goes back to re-read a slide (high interest signal).

### 4.4 Beyond Solo: Collaborative Design Intelligence

**Designer + Founder Mode:** Two editing modes on the same deck. The founder works in "content mode" (text, data, narrative). The designer works in "design mode" (layout, color, typography, spacing). Changes in one mode auto-adapt the other.

**Review Mode:** Stakeholders (co-founders, advisors, mentors) can annotate slides with comments that are tied to specific blocks, not just slides. "This metric seems low — can we use the Q4 numbers instead?" attached to the specific metric block.

**Version Branching:** Like Git branches for decks. Create a "YC Version" branch and a "Series A Version" branch from the same base deck. Changes to shared slides propagate; unique slides stay separate.

### 4.5 Beyond Export: Universal Output

One deck, every format:

**PowerPoint Export:** Pixel-perfect .pptx that looks identical to the editor. This is critical — investors often forward decks internally as .pptx. Most AI tools produce terrible PowerPoint exports.

**PDF Export:** Print-quality PDF with proper typography, embedded fonts, and optimized file size.

**Web Presentation:** Interactive web version with animations, embedded videos, live charts, and engagement tracking.

**Video Export:** Auto-narrated video version using text-to-speech or recorded voiceover synced to slides. For cold outreach — "Watch my 3-minute pitch" is more compelling than "Read my 20-slide deck."

**Social Clips:** Auto-generate carousel images for LinkedIn/Twitter from key slides. Extract the best 3-5 slides as social-ready images with proper dimensions.

---

## Part 5: Architecture Recommendations

### 5.1 Current State Assessment

PitchIQ's current architecture is solid:
- Next.js 14 + TypeScript + Tailwind (modern stack)
- Zustand with Immer for state (good for complex nested state)
- @dnd-kit for drag-and-drop (industry standard)
- Recharts for charts (adequate but may need supplementing)
- 50-level undo/redo history (good)
- 960x540 slide canvas with scaling (standard 16:9)

### 5.2 Recommended Architecture Changes

**Block System Refactor:**
```typescript
// Current: flat block with generic properties
interface SlideBlock {
  id: string;
  type: SlideBlockType;
  content: string;
  properties: Record<string, unknown>;
}

// Proposed: typed block system with positioning
interface SlideBlock<T extends BlockType = BlockType> {
  id: string;
  type: T;
  data: BlockDataMap[T];           // Type-safe properties per block type
  position: BlockPosition;          // x, y, width, height in grid units
  style: BlockStyle;                // Visual overrides (color, opacity, etc.)
  locked: boolean;
  hidden: boolean;
  animations: BlockAnimation[];     // Entrance/exit animations for present mode
}

interface BlockPosition {
  x: number;                        // Grid column start (0-11 for 12-col grid)
  y: number;                        // Grid row start
  width: number;                    // Column span
  height: number;                   // Row span (or 'auto')
  zIndex: number;
}

interface BlockStyle {
  backgroundColor?: string;
  borderRadius?: number;
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  opacity?: number;
  padding?: number;
  customCSS?: Record<string, string>; // Escape hatch for advanced users
}
```

**Slide Layout Engine:**
```typescript
interface SlideData {
  id: string;
  layout: SlideLayout;              // Layout blueprint (grid definition + zones)
  blocks: SlideBlock[];             // Blocks positioned within the layout
  background: SlideBackground;      // Color, gradient, image, or video
  transition: SlideTransition;      // How this slide enters during presentation
  notes: string;                    // Speaker notes (rich text)
  metadata: SlideMetadata;          // Analytics, comments, version info
}

interface SlideBackground {
  type: 'color' | 'gradient' | 'image' | 'video';
  value: string;                    // Hex, gradient CSS, image URL, or video URL
  overlay?: string;                 // Semi-transparent overlay color
  blur?: number;                    // Background blur for image/video
}
```

**Plugin Architecture for Custom Blocks:**
```typescript
// Allow third-party or user-created block types
interface BlockPlugin {
  type: string;                     // Unique block type identifier
  name: string;                     // Display name
  icon: React.ComponentType;        // Icon component
  category: BlockCategory;
  defaultData: () => BlockData;     // Factory for default state
  Editor: React.ComponentType<BlockEditorProps>;   // Edit mode component
  Renderer: React.ComponentType<BlockRendererProps>; // Display mode component
  Properties: React.ComponentType<BlockPropertiesProps>; // Sidebar panel
  thumbnail: React.ComponentType;   // Preview in block library
}
```

### 5.3 Key Technical Recommendations

**Rich Text:** Migrate from contentEditable to Tiptap (ProseMirror-based). It supports collaborative editing, custom node types, and markdown shortcuts. This is the foundation for the text editing experience feeling "Notion-level."

**Canvas Rendering:** Consider hybrid rendering — use DOM for block editing (accessibility, text selection, contentEditable) but switch to Canvas/WebGL for presentation mode (smooth animations, better performance with many elements). Libraries like Pixi.js or Konva.js could handle the presentation renderer.

**Real-time Collaboration:** Implement CRDT-based collaboration using Yjs or Liveblocks. Zustand can be adapted to sync with Yjs documents. This enables the Designer + Founder simultaneous editing model.

**Design Rules Engine:** Implement as a separate module that subscribes to store changes and runs async evaluation. Use a scoring system (0-100 per rule) rather than pass/fail. Display aggregate "design score" in the toolbar.

**Analytics Pipeline:** For shared deck analytics, use a lightweight event tracker (PostHog or custom) that captures: slide_viewed, slide_time, scroll_depth, link_clicked, deck_completed, deck_shared. Store per-viewer sessions for CRM-like investor tracking.

---

## Part 6: Prioritized Implementation Roadmap

### Phase 1: Foundation (Block System v2)
Refactor the block system with typed data, positioning, and the universal interaction model. Implement Column Layout Block and Card Group Block as the first container blocks. Add 5 new block types: Heading, Bullet List, Divider, Spacer, Shape.

### Phase 2: Smart Layout
Implement the 12-column grid system with magnetic alignment. Build the layout blueprint system. Create 20 initial slide layouts across categories. Add the design rules engine with visual warnings.

### Phase 3: Data & Visualization
Expand Chart Block to all chart types. Add Table Block, Funnel Block, Metric Grid Block, Progress Block. Implement paste-from-spreadsheet for data blocks. Add chart type recommendation AI.

### Phase 4: Visual & Media
Implement Device Mockup Block. Expand Image Block with AI generation, background removal, and effects. Add Video/Embed Block with auto-detection. Build Logo Grid auto-fetch.

### Phase 5: Narrative Intelligence
Build the narrative arc analyzer. Implement audience adaptation (investor/customer/partner views). Add claim verification. Build the AI layout generation system.

### Phase 6: Collaboration & Analytics
Implement real-time collaboration via CRDT. Build version branching. Add shared deck analytics with per-slide engagement tracking. Build the review/annotation system.

### Phase 7: Universal Output
Pixel-perfect PowerPoint export. Enhanced PDF export. Web presentation mode with animations. Video export. Social media clip generation.

---

## Appendix: Sources & References

**Product Research:**
- Beautiful.ai Smart Slides documentation and G2 reviews (4.7/5, 177 reviews)
- Gamma.app capabilities and Capterra reviews (4.5/5)
- Slidebean pitch deck builder and analytics features
- Figma Slides honest review (Allen Pike, 2025) — Auto Layout strengths, presentation feature gaps
- Google Slides Gemini integration (TechCrunch, March 2026)
- PowerPoint Copilot and Agent Mode capabilities (Microsoft Tech Community, 2026)
- Apple Keynote 2026 updates (MacRumors)
- Tome, Prezi, Visme, Decktopus product comparisons

**Market Data:**
- Presentation Software Market: $7.85B (2025) → $22.22B projected (2033) — Yahoo Finance / TBRC
- 62% of newly deployed tools support multi-user editing
- Real-time collaboration increased deployment by 31%
- AI formatting reduced manual editing by 25%
- 88% of startups using AI-generated decks experienced increased investor engagement

**Design Research:**
- Beautiful.ai Smart Slides design principles (auto-spacing, visual hierarchy, compositional balance)
- Canva UX patterns (progressive disclosure, snap alignment, template scaffolding)
- Figma Auto Layout paradigm applied to presentations
- "Why Designers Hate PowerPoint" (Medium) — professional pain points
- Presentation design trends 2025-2026 (24slides, inkppt)
- Block-based editing patterns from Notion, applied to visual content

**Reddit/Community Insights:**
- r/startups, r/entrepreneur discussions on pitch deck tools
- Product Hunt presentation software category rankings (2026)
- Winning Presentations independent tool reviews and comparisons
- Visible.vc best pitch deck software compilation
