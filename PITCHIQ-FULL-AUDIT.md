# PitchIQ — Complete Platform Audit

**Date:** March 25, 2026
**Codebase:** Next.js 14 / TypeScript / Prisma / Tailwind CSS
**Live URL:** usepitchiq.com

---

## 1. USER-FACING PAGES

### Landing Page (`/`)
The public marketing page. Composed of 12 scroll-triggered sections: hero with gradient orbs and CTA, a 3-step "how it works" walkthrough, feature cards, an interactive demo, stats/metrics, a deep-dive explainer on the PIQ Score, target user personas (founders, accelerators, advisors), social proof/testimonials, trust badges, a before/after transformation section, subscription pricing tiers, a pay-as-you-go pricing section, and a closing CTA. Navigation is a glass-morphism navbar that responds to scroll position.

### Authentication (`/auth/signin`)
OAuth sign-in via Google, GitHub, and LinkedIn. Managed by NextAuth with PrismaAdapter. Auto-links accounts sharing the same email. Redirects to `/dashboard` on success.

### Dashboard (`/dashboard`)
The main hub after login. Shows a grid of the user's pitch decks (sortable, filterable) with metadata: title, company name, PIQ score badge, theme, view count, and creation date. Includes a quick-actions bar (Create Deck, Score Deck, Find Investors), an analytics summary (average PIQ score, best-performing deck, current plan), an activity feed (deck creations, views, scoring events), and contextual prompts — a startup profile prompt if the user hasn't created one, and a deck refinement prompt if they have scored decks that could be improved.

Additional dashboard sub-sections (rendered as tabs or cards within the dashboard):
- **Investor CRM** — Track investor contacts with pipeline stages (identified → contacted → meeting → due diligence → term sheet → committed → passed), sentiment scoring, deal probability, warm intro tracking, and follow-up scheduling.
- **Investor Match** — Discover matching investors based on startup profile, with fit scores.
- **Fundraise Tracker** — Funding progress visualization.
- **Pitch Practice** — Practice session history with scores.
- **A/B Tests** — Active deck A/B test results.
- **Batch Jobs** — Batch scoring job status.
- **API Keys** — API key management table.
- **Custom Domain** — Custom domain setup and verification.
- **PAYG Status** — Credit balance, active period passes, lifetime credits.

### Credits Page (`/dashboard/credits`)
Dedicated PAYG dashboard. Shows current credit balance, lifetime credits earned, active period passes (with tier badge: Basic/Growth/Full Access and expiry countdown), and a scrollable transaction history table (type: purchase/usage/bonus/refund, amount, balance after, timestamp). Links to buy more credits or passes.

### Startup Profile (`/dashboard/startup-profile`)
A comprehensive form for founders to describe their startup for investor matching. Fields include company name, tagline, location (country/city/currency), industry, sectors, business model, revenue model, customer type, stage, financial metrics (monthly/annual revenue, growth rate, user count, team size, founded year), fundraising details (target, deal structure, valuation, previous raised, lead investor status), team composition (founder count, repeat/technical founder flags, diversity), and investor preferences (type preferences, lead needed, board seat openness, target markets).

### Create Deck (`/create`)
AI-powered deck generation page. Two creation modes:
1. **Form mode** — A 5-step wizard: Company basics (name, industry, stage) → Details (funding target, investor type, business model) → Story (problem, solution, key metrics) → Traction (team info, revenue, users) → Design (narrative style, visual style, slide count preference, emphasis areas). Also includes a template browser for starting from curated templates.
2. **GitHub mode** — Paste a GitHub repo URL and the system extracts README content to auto-populate deck fields.

Generation runs through a 6-phase pipeline: Company DNA Analysis → Narrative Architecture → Visual System Design → Per-Slide Content Generation → Coherence Review → Image Enrichment. Progress is shown via a `GenerationProgress` component with phase indicators.

### Score a Deck (`/score`)
Upload a PDF or PPTX file to get a PIQ Score. The uploader supports drag-and-drop. Scoring uses Claude's vision API to analyze slide images across 8 dimensions: narrative clarity, market opportunity, differentiation, financial credibility, team strength, the ask, design quality, and overall credibility. Returns a radar chart visualization, per-dimension scores with letter grades, and actionable improvement suggestions. No authentication required (but limits are plan-gated).

### Batch Score (`/batch-score`)
Score multiple decks at once. Upload several files, submit as a batch job. Shows a table of recent batch jobs with status (pending/processing/completed/failed), total decks, completed count, and results. Plan-gated feature with batch size limits per tier.

### PIQ Score Explainer (`/piq-score`)
A public educational page explaining the 8 scoring dimensions in detail, with investor-grade evaluation criteria, benchmarks for different company stages (YC-level, Seed, Pre-seed), and what each score range means.

### Deck Viewer (`/deck/[shareId]`)
Public shareable deck view. Renders slides in presentation format with the selected theme. Includes a "Get PIQ Score" button, sharing controls, and view tracking (IP, user agent, slide views, time spent). Viewers can leave comments on specific slides.

### Deck Editor (`/editor/[shareId]`)
A full visual editor for pitch decks. Plan-gated (Growth+ required). The editor has three panels:

**Left Sidebar:**
- Slide list with drag-to-reorder (via @dnd-kit)
- Layout picker with preview thumbnails
- Narrative arc panel (visualizes the story structure)
- Audience panel (define target audience)
- Slide health panel (design/content quality indicators per slide)

**Main Canvas:**
- Renders slides with blocks (text, heading, metrics, charts, images, team cards, timelines, etc.)
- Snap-to-grid with visual grid overlay and smart alignment guides
- Block selection, drag, resize
- Inline editing with contentEditable

**Right Panel:**
- Block properties editor (fonts, colors, spacing, alignment)
- Advanced block properties (V2 editor with per-property controls)

**Toolbar:**
- Save, undo/redo
- Theme picker
- AI panels toggle (Coach, Investor Lens, Pitch Simulator, Rewrite)
- Design score widget
- Export menu (PDF, PPTX, PNG with watermark controls and branding toggle)
- Social export (Twitter, LinkedIn image sizing)

**AI Features in Editor:**
- **AI Coach Panel** — Per-slide feedback with strong/needs-work/weak ratings across dimensions.
- **AI Rewrite Popover** — Select text and get inline rewriting suggestions.
- **Investor Lens Panel** — Evaluate the deck from VC, Angel, or Accelerator perspectives with star ratings.
- **Pitch Simulator** — Mock pitch practice with AI feedback.
- **Inline Slide Suggestions** — Contextual AI suggestions while editing.

**31 Block Types:**
Text, Heading, Bullet List, Callout, Quote, Metric (single), Metric Grid (2-4), Chart (Bar/Pie/Line/Area/Scatter/Treemap/Composed), Funnel, Table, Progress Bar, Comparison Matrix, Image (with filters: grayscale/blur/brightness/contrast/saturate), Video Embed, Logo Grid, Icon, Card Group, Divider, Spacer, Shape, Team Cards, Timeline, Device Mockup (Browser/MacBook/iPad/iPhone frames).

**Collaboration:**
- Version history with restore capability
- Threaded comments on slides/blocks
- Live comments panel

### Pitch Practice (`/practice/[shareId]`)
AI-powered pitch rehearsal. Growth+ plan feature. Load a deck's slides, practice presenting with timing. The system analyzes slide timings against target duration, generates pacing feedback, and evaluates per-slide content coverage. Shows past practice sessions with scores and duration.

### Ideas Generator (`/ideas`)
Answer questions about your interests, skills, and market observations, then get AI-generated startup ideas. Each idea can be turned directly into a pitch deck with one click (auto-populates the creation form).

### Billing (`/billing`)
Subscription management page. Shows current plan name, expiration date, deck count vs. limit. Links to Stripe Customer Portal for managing subscription, updating payment method, or canceling. Displays plan history.

### Settings (`/settings`)
Account settings with two sections:
1. **Profile** — Name, email, avatar management.
2. **Branding** — Custom logo upload, company name, accent color. These are applied to exported decks when branding is enabled (replaces "Made with PitchIQ" watermark).

### Workspace (`/workspace`)
Team collaboration hub. Lists the user's workspaces with role (owner/editor/viewer), member count, and deck count. Create new workspaces or join via invite.

### Workspace Dashboard (`/workspace/[slug]`)
Per-workspace view. Shows workspace decks, members with roles, pending invitations. Owners can invite members, manage roles, update workspace branding, and configure custom domains.

### API Documentation (`/docs/api`)
Public REST API reference. Documents authentication (API keys with `piq_` prefix), available endpoints (deck CRUD, scoring, batch), rate limits (100 req/min per key for Enterprise), scopes (decks:read, decks:write, score, batch), and example requests in curl and JavaScript.

### Presentation Mode
Full-screen slide presentation with keyboard navigation (arrow keys, escape). Triggered from the deck viewer or editor.

---

## 2. ADMIN PANEL

### Admin Login (`/admin/login`)
Email/password authentication for admin users. Uses bcrypt password hashing and HMAC-signed session cookies. Separate from NextAuth user authentication.

### Admin Dashboard (`/admin`)
System overview with aggregate metrics. Protected by middleware that validates admin session cookies.

### User Management (`/admin/users`)
Paginated user list. View user details: email, name, plan tier, suspension status, last seen, deck count. Actions: suspend/unsuspend users with reason tracking.

### Deck Management (`/admin/decks`)
All decks across the platform. Search by title, company name, or user email. Pagination (20 per page). View deck title, company, theme, PIQ score, view count, creator. Delete decks with confirmation.

### Investor Management (`/admin/investors`)
Manage the investor profile database. Add/edit/delete investor profiles with 50+ fields covering: identity, matching criteria (stages, sectors, geographies, cheque range), fund details (size, vintage, deployment pace), preferences (business models, deal structures, valuation ranges), portfolio data (companies, conflict sectors, co-investors), activity metrics (response time, close speed), and contact info. Import investors from CSV. Seed default investor data. Toggle verified/enabled status.

### Matching Analytics (`/admin/matching-analytics`)
Dashboard for investor matching performance. Shows: match event counts by action (saved/dismissed/viewed), average fit scores, score distribution buckets (excellent/strong/moderate/weak/poor), top matched and top dismissed investors, users without startup profiles, and stale investors (1+ year inactive).

### Matching Configuration (`/admin/matching-config`)
Configure the investor matching algorithm. Adjust scoring dimension weights across 16 factors (stage, sector, geography, cheque size, valuation, revenue, growth, team, deal structure, etc.) on the 200-point scale. Toggle active configurations.

### PAYG Management (`/admin/payg`)
Administer the pay-as-you-go system. View statistics on credit purchases, pass activations, and revenue. Manage period passes: create passes for users, extend expiry dates, revoke passes. Grant bonus credits to users. Three pass tiers: Basic ($5/day), Growth ($12/day), Full Access ($20/day) with duration multipliers for multi-day purchases.

### Plan Management (`/admin/plans`)
Configure subscription plan tiers. Each plan has 30+ feature flags and limits: max decks, allowed themes, PIQ score detail level, branding controls, export formats, analytics depth, investor features, editor access, AI coaching, collaboration limits, API access, and more. Seed default plans.

### Transaction History (`/admin/transactions`)
View Stripe payment transactions. Status tracking (succeeded/pending/failed/refunded), total revenue calculations, last 100 transactions with user and deck associations.

### Webhook Management (`/admin/webhooks`)
Stripe webhook configuration. Monitors events: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted, invoice events. Webhook event log/history. Test webhook functionality.

### Admin Settings (`/admin/settings`)
Platform configuration via key-value settings stored in the database. Edit environment variables (API keys, secrets — displayed masked). Overrides .env values at runtime.

### References (`/admin/references`)
Curated pitch deck reference library. Categories: database, curated, github, iconic. Sources include DerStartupCFO, Best Pitch Deck, VIP Graphics. Used as training/reference data for deck generation quality.

---

## 3. API ENDPOINTS (93 routes)

### Authentication (2 routes)
- `GET/POST /api/auth/[...nextauth]` — NextAuth OAuth handler (Google, GitHub, LinkedIn)
- `GET /api/auth/has-github` — Check if user has linked GitHub account

### Deck CRUD & Features (19 routes)
- `POST /api/decks` — Create new deck (triggers full generation pipeline)
- `GET /api/decks/[shareId]` — Retrieve deck data
- `PUT /api/decks/[shareId]` — Update deck
- `DELETE /api/decks/[shareId]` — Delete deck
- `PUT /api/decks/[shareId]/slides` — Update slide content
- `GET /api/decks/[shareId]/extracted-content` — Get extracted content from uploaded deck
- `GET /api/decks/[shareId]/analytics` — Basic view analytics
- `GET /api/decks/[shareId]/analytics/detailed` — Detailed analytics with time series
- `POST /api/decks/[shareId]/ai` — AI coaching feedback per slide
- `POST/GET /api/decks/[shareId]/variants` — Create/list investor-targeted variants (VC/Angel/Accelerator)
- `GET /api/decks/[shareId]/versions` — Version history
- `POST /api/decks/[shareId]/versions/[id]/restore` — Restore previous version
- `POST/GET /api/decks/[shareId]/comments` — Add/list slide comments
- `DELETE /api/decks/[shareId]/comments/[id]` — Delete comment
- `POST /api/decks/[shareId]/appendix` — Generate appendix content
- `POST /api/decks/[shareId]/refine-deck` — Smart AI refinement based on PIQ scores
- `GET /api/decks/[shareId]/refine-suggestions` — Get refinement suggestions
- `GET /api/decks/[shareId]/report` — Generate PDF report
- `POST /api/decks/generate-stream` — Streaming deck generation
- `POST /api/decks/from-repo` — Generate deck from GitHub repository
- `POST /api/decks/refine` — General refinement endpoint

### Scoring (3 routes)
- `POST /api/score` — Score a single uploaded deck (PDF/PPTX via vision API)
- `POST /api/batch-score` — Submit batch scoring job
- `GET /api/batch-score/[id]` — Get batch job status and results

### Investor Matching & CRM (6 routes)
- `POST/GET /api/investors` — Add/list investor contacts (user's CRM)
- `GET/PUT/DELETE /api/investors/[id]` — Manage individual contact
- `POST /api/investors/[id]/outreach` — Log outreach activity (email/meeting/call/note)
- `GET /api/investors/match` — Match investors to deck/startup profile (Growth+ gated)
- `GET /api/investors/discover` — Discover investor profiles from database

### Workspace (7 routes)
- `POST/GET /api/workspace` — Create/list workspaces
- `GET/PATCH /api/workspace/[slug]` — Get/update workspace
- `GET/POST /api/workspace/[slug]/members` — List/add members
- `DELETE /api/workspace/[slug]/members/[id]` — Remove member
- `POST /api/workspace/[slug]/invite` — Send invitation
- `POST /api/workspace/[slug]/join` — Join workspace
- `PUT /api/workspace/[slug]/branding` — Update workspace branding

### Payments & Billing (6 routes)
- `POST /api/stripe/checkout` — Create Stripe checkout session (subscription)
- `GET /api/stripe/portal` — Redirect to Stripe customer portal
- `POST /api/stripe/webhook` — Stripe webhook handler (checkout completion, subscription changes, invoices, one-time payments for passes/credits)
- `GET /api/payg/status` — User's PAYG status (credit balance, active passes)
- `POST /api/payg/credits/checkout` — Purchase credit pack
- `POST /api/payg/pass/checkout` — Purchase period pass

### User & Settings (5 routes)
- `GET/PUT /api/settings` — User settings
- `GET /api/me/status` — Current user subscription/plan status
- `POST/PUT /api/startup-profile` — Create/update startup profile
- `GET /api/plans` — List subscription plans with pricing

### API Keys (2 routes)
- `POST/GET /api/api-keys` — Create/list API keys
- `DELETE /api/api-keys/[id]` — Revoke key

### Custom Domains (4 routes)
- `POST/GET /api/custom-domain` — Register/list custom domains
- `PUT/DELETE /api/custom-domain/[id]` — Update/remove domain
- `POST /api/custom-domain/[id]/verify` — Verify DNS configuration
- `GET /api/custom-domain/lookup` — Lookup domain owner (used by middleware)

### Practice Sessions (3 routes)
- `POST/GET /api/practice` — Start/list practice sessions
- `GET/PUT /api/practice/[id]` — Get/update session (record slide timings)
- `POST /api/practice/[id]/feedback` — Generate AI feedback

### Ideas (2 routes)
- `POST /api/ideas` — Generate startup ideas
- `POST /api/ideas/autofill` — AI-autofill form fields from partial input

### Dashboard & Analytics (2 routes)
- `GET /api/dashboard/analytics` — User dashboard metrics
- `GET /api/dashboard/investors` — Investor pipeline summary

### Misc (5 routes)
- `GET/PUT /api/notifications` — Get/mark-read notifications
- `POST /api/upload` — File upload (for scoring)
- `POST/GET /api/ab-test` — Create A/B test
- `GET /api/ab/[slug]` — A/B test redirect/tracking
- `POST /api/editor/smart-format` — AI formatting suggestions

### Public API v1 (3 routes)
- `POST/GET /api/v1/decks` — Create/list decks (API key auth)
- `GET /api/v1/decks/[shareId]` — Retrieve deck
- `POST /api/v1/score` — Score deck

### Admin API (26 routes)
- `POST /api/admin/login` / `POST /api/admin/logout` — Admin auth
- `POST /api/admin/seed` — Seed database
- `GET/POST /api/admin/settings` — Platform settings
- `POST /api/admin/stripe-sync` — Sync Stripe data
- `POST /api/admin/webhook-test` — Test webhook
- `GET/POST /api/admin/plans` / `POST /api/admin/plans/seed` — Plan management
- `GET/POST /api/admin/investors` — Investor profiles (CRUD, import, seed, activity)
- `GET /api/admin/decks` / `DELETE /api/admin/decks/[id]` — Deck management
- `GET/PUT /api/admin/users/[id]` — User management
- `GET /api/admin/analytics` — Platform analytics
- `GET/PUT /api/admin/matching-config` — Matching algorithm config
- `GET /api/admin/matching-analytics` — Matching metrics
- `GET/PUT /api/admin/payg/pricing` — PAYG config
- `GET/POST /api/admin/payg/passes` — Period pass management
- `POST /api/admin/payg/passes/[id]/extend` / `POST .../revoke` — Pass operations
- `POST /api/admin/payg/credits/grant` — Grant credits
- `GET /api/admin/payg/stats` — PAYG statistics

---

## 4. DATA MODELS (23 Prisma Models)

### Core
- **User** — Auth, profile, subscription (plan tier, Stripe IDs, branding settings, suspension status)
- **Deck** — Pitch deck with 40+ fields: company info, slides (JSON), PIQ score, theme, source (generated/uploaded), business metrics, fundraising data, team composition, smart-refine metadata, generation meta (DNA/narrative/visual system)
- **View** — Deck viewer analytics (IP, user agent, slide views, time spent)
- **Transaction** — Payment records (Stripe payment ID, amount, currency, status)

### Editor & Versioning
- **DeckVersion** — Slide snapshots with version numbers and change notes
- **DeckVariant** — Investor-type targeted variants (VC/Angel/Accelerator)
- **SlideComment** — Threaded comments on slides/blocks with resolved status

### Collaboration
- **Workspace** — Team container with branding config
- **WorkspaceMember** — Role-based access (owner/editor/viewer)
- **WorkspaceInvite** — Pending invitations with expiry tokens
- **ActivityLog** — Audit trail (workspace, deck, user, action, metadata)

### Investor System
- **InvestorProfile** — 50+ fields: identity, matching criteria, fund details, preferences, portfolio, activity metrics, contact info
- **InvestorContact** — User's personal CRM (pipeline stages, sentiment, deal probability, warm intros)
- **Outreach** — Contact communication log (email/meeting/call/note)
- **MatchEvent** — Match analytics (viewed/saved/dismissed/contacted with fit scores)
- **MatchingConfig** — Admin-tunable algorithm weights

### Monetization
- **PlanConfig** — Subscription tiers with 30+ feature flags and Stripe integration
- **PeriodPass** — Time-bound PAYG access (Basic/Growth/Full tiers with duration)
- **CreditBalance** — User's credit account (balance + lifetime total)
- **CreditTransaction** — Credit audit trail (purchase/usage/refund/bonus/expiry)
- **PaygConfig** — Admin-configurable PAYG pricing (key-value JSON)

### Auth & Infrastructure
- **Account** / **Session** / **VerificationToken** — NextAuth models
- **Setting** — Admin key-value configuration
- **ApiKey** — API authentication (hashed keys, scopes, rate limits, expiry)
- **BatchJob** — Batch scoring job tracking
- **CustomDomain** — Domain setup with DNS verification and SSL status
- **GenerationJob** — Generation pipeline tracking (phases, progress, skill results, critique results)
- **Notification** — User notifications (new matches, follow-up due, pipeline stale)
- **ABTest** — A/B test configuration
- **DeckAlert** — High-engagement and new-view alerts
- **PitchPracticeSession** — Practice session recordings with AI feedback
- **StartupProfile** — Founder self-profile for investor matching

---

## 5. CORE ENGINE MODULES

### Deck Generation Pipeline (`src/lib/generation/`)
A 6-phase pipeline replacing the original single-prompt approach:

1. **Company DNA Analysis** (`company-dna.ts`) — Classifies the company into a narrative archetype (8 types: disruptor, inevitable-trend, data-story, vision, secret-insight, proven-model, team-story, traction-machine) and visual personality (8 types: corporate-premium, bold-playful, clinical-clean, scientific-rigorous, futuristic-gradient, organic-hopeful, editorial-refined, startup-energetic).

2. **Narrative Architecture** (`narrative-architect.ts`) — Designs the slide sequence as a story arc: slide blueprints with emotional beats, archetype-specific structure, 25+ slide types replacing the original 12.

3. **Visual System** (`visual-system.ts`) — Generates a cohesive visual identity: brand colors, typography pairing, composition rules, 40+ composition patterns across 8 categories.

4. **Per-Slide Generation** (`slide-generator.ts`) — Generates each slide individually with full context of the narrative and visual system. Handles title, content, chart, team, metric, and other slide types.

5. **Coherence Review** (`coherence-reviewer.ts`) — Rule-based checks for narrative flow continuity and visual consistency across the deck.

6. **Image Intelligence** (`image-intelligence.ts`) — Image search, selection, and prompt enhancement for slide visuals.

Orchestrated by `coordinator.ts` with progress tracking via `GenerationJob`.

### Agent Skills System (`src/lib/generation/skills/`)
Multi-agent architecture with specialized skills dispatched by a coordinator:

- **Research Skills** — Market researcher, competitor analyst, financial modeler, industry data
- **Visual Skills** — Icon selector, diagram generator, image finder, mockup generator
- **Critique Skills** — Pitch coach, VC analyst, design reviewer, data credibility checker

Managed by a skill registry (`registry.ts`) with execution framework.

### PIQ Scoring Engine (`src/lib/piq-score.ts`)
8-dimension weighted scoring (0–100 scale): narrative clarity, market opportunity, differentiation, financial credibility, team strength, the ask, design quality, overall credibility. Uses Claude vision API for uploaded deck images. Returns letter grades and dimension-specific improvement suggestions.

### Investor Matching Engine (`src/lib/investor-matching.ts`)
16-dimension scoring on a 200-point scale (normalized to 0–100): stage fit, sector overlap, geography match, cheque size alignment, valuation range, revenue threshold, growth rate, team composition, deal structure, and more. Configurable weights with adjacency bonuses for near-matches. Currency conversion support.

### Smart Deck Refinement (`src/lib/refine-deck.ts`)
AI-guided improvements based on PIQ score feedback. Investor-type-specific structure guidance (VC vs Angel vs Accelerator). Targets the weakest scoring dimensions for focused improvement. Closes the upload → score → improve loop.

### Entitlements & Credits (`src/lib/entitlements.ts`, `credits.ts`, `credit-gate.ts`)
Unified entitlement resolution combining: active subscription plan → active period pass → credit balance. Plan hierarchy: starter < pro < growth < enterprise. Credit system with atomic add/deduct operations, idempotency, and full audit trail. Action costs: create_deck=5 credits, export=2, investor_match=3, etc.

### Export System (`src/lib/export/`)
- **PDF Export** — HTML2Canvas rendering with watermark support and branding toggle
- **PPTX Export** — Block-to-slide conversion with theme application and grid layout mapping
- **Social Export** — Twitter and LinkedIn optimized image sizing

---

## 6. INFRASTRUCTURE

### Authentication
- **User auth:** NextAuth with Google, GitHub, LinkedIn OAuth providers
- **Admin auth:** Separate bcrypt + HMAC session cookie system
- **API auth:** API keys with `piq_` prefix, SHA256 hashing, per-key rate limiting, scoped permissions

### Payments
- **Subscriptions:** Stripe checkout sessions with 4 tiers (Starter free, Pro $29/mo, Growth $79/mo, Enterprise $399/mo)
- **Period Passes:** One-time Stripe payments for time-bound access (Basic $5/day, Growth $12/day, Full $20/day)
- **Credit Packs:** One-time purchases (10/25/50/100 credits)
- **Webhook handling:** checkout.session.completed, subscription updates/deletions, invoice events

### Middleware
- Admin route protection (session cookie validation)
- Custom domain rewriting (domain → `/deck/[shareId]` routing)
- 5-minute TTL domain lookup cache

### Analytics
- Vercel Analytics and Speed Insights
- In-memory product event buffer (100-event ring buffer)
- Deck view tracking (slide views, time per slide)

### External Services
- **Anthropic Claude** (`@anthropic-ai/sdk`) — Deck generation, scoring, refinement, practice feedback, AI coaching
- **Stripe** — Payments, subscriptions, webhooks
- **Resend** — Transactional email
- **Extend.ai** — PDF parsing service
- **Vercel** — Hosting, analytics

### Key Dependencies
Next.js 14, React 18, TypeScript, Prisma 5.22, Tailwind CSS 3.4, Zustand 5 (state management), Immer (immutable state), Recharts 3.8 (charts), @dnd-kit (drag & drop), jsPDF (PDF generation), pptxgenjs (PPTX generation), html2canvas, Lucide React (icons), next-themes (dark mode), PapaParse (CSV), bcryptjs, nanoid.

---

## 7. COMPONENT COUNT SUMMARY

| Category | Count |
|---|---|
| Pages/Routes (user-facing) | 18 |
| Pages/Routes (admin) | 12 |
| API Routes | 93 |
| React Components (total) | 137 |
| — Root-level components | 41 |
| — Dashboard components | 18 |
| — Editor core components | 15 |
| — Editor AI components | 4 |
| — Editor block types | 31 |
| — Landing page sections | 12 |
| — Other (workspace, analytics, presentation, UI) | 16 |
| Prisma Models | 23+ |
| Lib Modules | 40+ |

---

*Generated from codebase analysis on March 25, 2026.*
