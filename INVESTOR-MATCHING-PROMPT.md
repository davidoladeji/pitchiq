# Claude Code Prompt: Investor Matching System Overhaul

> Paste this entire prompt into Claude Code in **Act mode**. Do not ask questions — implement everything described below.

---

## Context

You are working on the PitchIQ codebase (`usepitchiq.com`), a Next.js 14 + TypeScript + Prisma + PostgreSQL application. The investor matching system already exists but is severely limited — it only matches on 5 binary dimensions (stage, sector, geography, cheque size, investor type) totaling 100 points, geography is hardcoded to "US" because the Deck model has no location field, there's no currency handling, and the scoring is mostly pass/fail rather than graduated.

Your job is to overhaul the matching system into a world-class investor discovery engine. This is a **complete upgrade** across schema, algorithm, admin UI, and user experience.

---

## PHASE 1: Schema Expansion

### 1A. Expand the `Deck` model (prisma/schema.prisma)

Add these fields to the Deck model (all optional to maintain backward compatibility):

```
// Location & market
country           String?            // ISO 3166-1 alpha-2: "US", "GB", "NG", "IN"
city              String?            // "San Francisco", "Lagos", "London"
currency          String?  @default("USD")  // ISO 4217: USD, EUR, GBP, NGN, INR, etc.
targetMarkets     String?  @default("[]")   // JSON: ["US", "Europe", "Global"]

// Business model & traction
businessModel     String?            // "saas" | "marketplace" | "hardware" | "services" | "consumer" | "deeptech" | "biotech" | "media"
revenueModel      String?            // "subscription" | "transactional" | "advertising" | "licensing" | "freemium" | "usage-based" | "hybrid"
customerType      String?            // "b2b" | "b2c" | "b2b2c" | "b2g" | "d2c"
monthlyRevenue    Float?             // MRR in home currency
annualRevenue     Float?             // ARR in home currency
revenueGrowthRate Float?             // Month-over-month % (e.g., 15.5 = 15.5%)
userCount         Int?               // Total users/customers
teamSize          Int?
foundedYear       Int?

// Fundraising specifics
dealStructure     String?            // "equity" | "safe" | "convertible_note" | "revenue_based"
preMoneyValuation Float?             // In home currency
previousRaised    Float?             // Total previously raised, home currency
hasLeadInvestor   Boolean? @default(false)

// Team characteristics
founderCount      Int?
hasRepeatFounder  Boolean? @default(false)
hasTechnicalFounder Boolean? @default(false)
founderDiversity  String?  @default("[]")  // JSON: ["gender-diverse", "ethnicity-diverse", "immigrant-founded"]
```

### 1B. Expand the `InvestorProfile` model

Add these fields:

```
// Granular location
country           String?            // ISO 3166-1 alpha-2: "US", "GB", "SG"
city              String?            // "Menlo Park", "London"
currencies        String?  @default("[]")   // JSON: ["USD", "EUR"] — currencies they deploy in

// Investment preferences
businessModels    String?  @default("[]")   // JSON: ["saas", "marketplace", "deeptech"]
revenueModels     String?  @default("[]")   // JSON: ["subscription", "transactional"]
customerTypes     String?  @default("[]")   // JSON: ["b2b", "b2c"]
dealStructures    String?  @default("[]")   // JSON: ["equity", "safe", "convertible_note"]
valuationMin      Float?                     // Min pre-money they'll consider (USD)
valuationMax      Float?                     // Max pre-money they'll consider (USD)

// Traction thresholds
minRevenue        Float?             // Minimum MRR they look for (USD)
minGrowthRate     Float?             // Minimum MoM growth % they want
minTeamSize       Int?

// Fund characteristics
fundVintage       Int?               // Year current fund was raised
fundSize          Float?             // Total fund size in USD
deploymentPace    String?            // "active" | "moderate" | "slow" | "fully-deployed"
averageCheckCount Int?               // Deals per year
leadPreference    String?            // "lead-only" | "co-lead" | "follow" | "any"
boardSeatRequired Boolean? @default(false)
syndicateOpen     Boolean? @default(false) // Open to syndication
followOnReserve   Boolean? @default(true)  // Reserves capital for follow-on

// Thesis & focus
impactFocus       Boolean? @default(false) // ESG/impact-focused
diversityLens     Boolean? @default(false) // Invests with diversity thesis
thesisKeywords    String?  @default("[]")  // JSON: ["API-first", "developer tools", "vertical SaaS"]

// Portfolio intelligence
portfolioCompanies String? @default("[]")  // JSON: full portfolio for conflict detection
portfolioConflictSectors String? @default("[]") // JSON: sectors where they have competing bets

// Activity & responsiveness
lastActiveDate    DateTime?          // Last known investment date
avgResponseDays   Int?               // Average days to first response
avgCloseWeeks     Int?               // Average weeks from first meeting to close
declinedSectors   String?  @default("[]")  // JSON: sectors they explicitly avoid

// Network
coInvestors       String?  @default("[]")  // JSON: frequent co-investor names
lpTypes           String?  @default("[]")  // JSON: ["endowment", "pension", "sovereign-wealth", "corporate"]
```

### 1C. Expand the `InvestorContact` model

Add:
```
warmIntro         Boolean? @default(false)  // User has a warm intro path
introSource       String?                    // "mutual connection", "portfolio founder", etc.
sentimentScore    Int?                       // -2 to +2 based on latest interaction
lastInteractionAt DateTime?
dealProbability   Int?                       // 0-100 user estimate
expectedCloseDate DateTime?
termSheetReceived Boolean? @default(false)
commitAmount      Float?                     // Amount committed if status = committed
```

### 1D. Create a new `StartupProfile` model

This is **separate from the Deck** — it's the founder's company profile used for matching, so they don't need a different match per deck:

```
model StartupProfile {
  id                String   @id @default(uuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  // Core identity
  companyName       String
  tagline           String?
  country           String             // ISO 3166-1 alpha-2
  city              String?
  currency          String   @default("USD") // ISO 4217

  // Classification
  industry          String             // Primary industry
  sectors           String   @default("[]") // JSON: normalized sector tags
  businessModel     String?            // saas | marketplace | hardware | etc.
  revenueModel      String?            // subscription | transactional | etc.
  customerType      String?            // b2b | b2c | b2b2c | b2g

  // Stage & traction
  stage             String             // pre-seed | seed | series-a | etc.
  monthlyRevenue    Float?             // MRR in home currency
  annualRevenue     Float?             // ARR in home currency
  revenueGrowthRate Float?             // MoM %
  userCount         Int?
  teamSize          Int?
  foundedYear       Int?

  // Fundraising
  fundingTarget     Float?             // Amount seeking, home currency
  dealStructure     String?            // equity | safe | convertible_note
  preMoneyValuation Float?
  previousRaised    Float?
  hasLeadInvestor   Boolean @default(false)
  targetMarkets     String  @default("[]") // JSON: ["US", "Europe"]

  // Team
  founderCount      Int?
  hasRepeatFounder  Boolean @default(false)
  hasTechnicalFounder Boolean @default(false)
  founderDiversity  String  @default("[]") // JSON

  // Preferences
  investorTypePrefs String  @default("[]") // JSON: ["vc", "angel"]
  leadNeeded        Boolean @default(true)
  boardSeatOk       Boolean @default(true)

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([userId])
}
```

Add `startupProfile StartupProfile?` to the `User` model.

### 1E. Create a `MatchEvent` model for analytics

```
model MatchEvent {
  id               String   @id @default(uuid())
  userId           String
  investorProfileId String
  deckId           String?
  fitScore         Int                // Score at time of match
  action           String             // "viewed" | "saved" | "dismissed" | "contacted"
  createdAt        DateTime @default(now())

  @@index([userId])
  @@index([investorProfileId])
  @@index([createdAt])
}
```

Run `npx prisma db push` after schema changes (use `--accept-data-loss` if needed in dev).

---

## PHASE 2: Matching Algorithm Rewrite

Rewrite `src/lib/investor-matching.ts` completely. The new algorithm should:

### 2A. New Scoring Dimensions (200-point scale, normalized to 0-100 for display)

| Dimension | Max Points | Type |
|-----------|-----------|------|
| Stage fit | 30 | Binary with adjacency bonus (±1 stage = half credit) |
| Sector alignment | 25 | Proportional overlap + thesis keyword bonus |
| Geography compatibility | 20 | Graduated: same city > same country > same region > global |
| Cheque size fit | 20 | Graduated: perfect range = full, within 2x = partial |
| Business model match | 15 | Binary with partial for adjacent models |
| Customer type match | 10 | Binary |
| Revenue model match | 10 | Binary with partial |
| Traction threshold | 15 | Graduated: exceeds > meets > approaching > below |
| Deal structure compatibility | 10 | Binary |
| Valuation range fit | 10 | Graduated: in range > within 30% > outside |
| Lead/follow alignment | 10 | Binary: startup needs lead → investor leads |
| Fund activity | 5 | Graduated: active > moderate > slow > fully-deployed |
| Portfolio conflict | -20 | **Negative**: deduct if investor has competing portfolio co |
| Diversity/impact bonus | 5 | Bonus if investor has diversity/impact lens AND startup qualifies |
| Thesis keyword match | 10 | Proportional: how many thesis keywords match deck content |
| Currency compatibility | 5 | Binary: investor deploys in startup's currency |
| **Total possible** | **200** | Normalized to 0-100 |

### 2B. Currency Conversion

Create `src/lib/currency.ts`:
- Maintain a static exchange rate table (USD, EUR, GBP, NGN, INR, BRL, KES, ZAR, SGD, AED, JPY, CNY, CAD, AUD, CHF, SEK, KRW, MXN, COP, EGP, GHS, TZS, RWF, PKR, BDT, IDR, VND, THB, PHP, MYR, HKD, TWD, NZD, PLN, CZK, HUF, ILS, SAR, QAR, KWD)
- Function `convertToUSD(amount: number, currency: string): number`
- Function `formatCurrency(amount: number, currency: string): string` — locale-aware formatting
- Function `currencySymbol(code: string): string`
- All cheque/revenue/valuation comparisons must normalize to USD before comparing
- Update this table monthly (leave a comment with the date for admins)

### 2C. Geography Intelligence

Create `src/lib/geography.ts`:
- Map countries to regions (use a comprehensive mapping: all ISO 3166-1 alpha-2 codes → region)
- Regions: "North America", "Europe", "UK", "India", "Southeast Asia", "East Asia", "China", "Japan/Korea", "MENA", "Sub-Saharan Africa", "Latin America", "Oceania", "Israel", "Central Asia"
- Function `countryToRegion(countryCode: string): string`
- Function `geoDistance(a: string, b: string): "same-city" | "same-country" | "same-region" | "cross-region" | "global"`
- Function `parseLocation(text: string): { country: string; city?: string; region: string }`
- Migrate old geography strings ("US", "Europe", etc.) to the new system in seed data

### 2D. Portfolio Conflict Detection

In the scoring function:
- If an investor's `portfolioCompanies` or `portfolioConflictSectors` overlap with the startup's sector/industry, apply the -20 penalty
- Generate a reason like "⚠️ Portfolio conflict: Investor backed [CompanyX] in same space"
- Surface this prominently in the UI (it's a dealbreaker signal)

### 2E. Adjacency Scoring

For stage matching:
- Exact match = full points
- ±1 stage = 60% points (e.g., seed investor for a pre-seed startup)
- ±2 stages = 20% points
- Further = 0

For business model:
- Exact match = full points
- Related models (e.g., saas↔marketplace, consumer↔d2c) = 50% points

### 2F. Match Explanations

Every `MatchReason` should include:
- `dimension`: name
- `score`: points earned
- `maxScore`: points possible
- `matched`: boolean
- `detail`: human-readable explanation
- `severity`: "positive" | "neutral" | "warning" | "dealbreaker"

The `InvestorMatch` result should include:
- `fitScore`: 0-100 normalized
- `reasons`: all dimension breakdowns
- `topReasons`: top 3 positive reasons
- `warnings`: any negative signals (portfolio conflict, fund fully deployed, etc.)
- `dealbreakers`: hard incompatibilities
- `compatibilityLabel`: "Excellent Fit" (80+) | "Strong Fit" (65-79) | "Moderate Fit" (50-64) | "Weak Fit" (35-49) | "Poor Fit" (<35)

---

## PHASE 3: Startup Profile Builder (User-Facing)

### 3A. Create the onboarding flow

Create `src/app/dashboard/startup-profile/page.tsx` — a multi-step wizard:

**Step 1: Company Basics**
- Company name (pre-fill from deck if available)
- Tagline
- Country (searchable dropdown with flag emoji, ALL countries)
- City (text input with autocomplete feel)
- Currency (auto-set from country, but overridable)
- Founded year

**Step 2: Classification**
- Industry (searchable, multi-select from canonical list)
- Business model (single select: SaaS, Marketplace, Hardware, Services, Consumer, DeepTech, BioTech, Media, Other)
- Revenue model (single select: Subscription, Transactional, Advertising, Licensing, Freemium, Usage-Based, Hybrid)
- Customer type (single select: B2B, B2C, B2B2C, B2G, D2C)
- Target markets (multi-select countries/regions)

**Step 3: Traction**
- Monthly revenue (currency-aware input, shows both local and USD equivalent)
- Annual revenue
- Revenue growth rate (% MoM)
- User count
- Team size

**Step 4: Fundraising**
- Stage (pre-seed through Series C+)
- Funding target (currency-aware)
- Deal structure preference
- Pre-money valuation (optional)
- Previously raised (optional)
- Do you have a lead investor? (yes/no)
- Need a lead? (yes/no)
- OK with board seat? (yes/no)

**Step 5: Team**
- Number of founders
- Repeat founder? (yes/no)
- Technical founder? (yes/no)
- Diversity characteristics (optional, multi-select, clearly marked as optional and used only for matching with diversity-focused investors)

**Step 6: Investor Preferences**
- Preferred investor types (multi-select: VC, Angel, Accelerator, Family Office, Corporate VC)

The wizard should:
- Save progress on each step (don't lose data on navigation)
- Show a progress bar
- Allow going back to previous steps
- Pre-fill from the user's most recent deck data where possible
- Show a "Profile Completeness" score (more data = better matches)
- POST to `/api/startup-profile` endpoint

### 3B. API Route

Create `src/app/api/startup-profile/route.ts`:
- GET: Return user's startup profile (or null)
- POST: Create/update startup profile
- Growth+ plan gating

---

## PHASE 4: Enhanced Matching UI

### 4A. Upgrade `DashboardInvestorMatch.tsx`

The current component shows basic cards. Upgrade to:

**Match Quality Indicators:**
- Color-coded fit score badge (green 80+, blue 65-79, yellow 50-64, orange 35-49, red <35)
- Compatibility label text
- Animated score ring/gauge

**Detailed Breakdown View (expandable):**
- Bar chart or radar chart showing score per dimension
- Each dimension as a row with score bar, icon, and explanation
- Warnings highlighted in amber
- Dealbreakers highlighted in red with ⚠️ icon
- Portfolio conflicts shown prominently

**Filtering & Sorting:**
- Filter by: investor type, region, stage, sector, min score, lead preference, active status
- Sort by: fit score, cheque size, fund activity, recently active
- Search by investor name
- Toggle: "Hide investors with dealbreakers"
- Toggle: "Only show lead investors" (when startup needs a lead)

**Investor Cards should show:**
- Name, logo, type badge, verified badge
- Fit score gauge
- Top 3 match reasons
- Cheque range (in startup's currency with USD equivalent if different)
- Geography with flag emoji
- Key warning if any (portfolio conflict, fully deployed, etc.)
- "Save to Pipeline" button
- "View Details" expansion
- "Dismiss" (tracks in MatchEvent, removes from list)

### 4B. Investor Detail Modal

When clicking "View Details", show a modal/slide-over with:
- Full profile (description, thesis, notable deals)
- Complete scoring breakdown (all dimensions)
- Portfolio companies (with conflict warnings)
- Fund information (size, vintage, deployment pace)
- Co-investor network
- Link to website, LinkedIn, Twitter
- "Similar Investors" section (3-5 investors with similar profiles)
- Action buttons: Save to Pipeline, Log Outreach, Dismiss

### 4C. Match Source Toggle

Allow matching from:
1. **Startup Profile** (default, recommended) — uses the StartupProfile model
2. **Specific Deck** — uses deck fields (backward compatible with current system)

Show a toggle/dropdown at the top: "Matching based on: [Your Startup Profile ▾]"

---

## PHASE 5: Admin Interface Expansion

### 5A. Upgrade `AdminInvestorsClient.tsx`

Add these capabilities:

**Bulk Import:**
- CSV upload with column mapping UI (drag columns to fields)
- Support importing from: CSV, JSON
- Preview first 5 rows before confirming import
- Validation: flag missing required fields, duplicate names
- POST to `/api/admin/investors/import`

**Enhanced Editing:**
- All new fields in the edit form, organized in tabs:
  - Tab 1: Basic Info (name, type, website, description, logo)
  - Tab 2: Investment Criteria (stages, sectors, business models, customer types, cheque range, deal structures, valuations)
  - Tab 3: Geography & Currency (country, city, geographies, currencies)
  - Tab 4: Fund Details (fund size, vintage, deployment pace, deals/year, lead preference, board seat, syndication, follow-on)
  - Tab 5: Thesis & Focus (thesis text, thesis keywords, impact focus, diversity lens, declined sectors)
  - Tab 6: Portfolio (notable deals, full portfolio list, conflict sectors)
  - Tab 7: Activity (last active, response time, close time, co-investors)
  - Tab 8: Contact (email, LinkedIn, Twitter, LP types, source)
- Inline validation for all fields
- Auto-save on blur (debounced)

**Matching Analytics Dashboard (admin):**
Create `src/app/admin/matching-analytics/page.tsx`:
- Total matches generated (from MatchEvent model)
- Average fit score distribution (histogram)
- Most-matched investors (top 20)
- Most-dismissed investors (identify bad data)
- Conversion funnel: Matched → Saved → Contacted → Meeting → Term Sheet
- Match-to-contact rate by investor type, region, stage
- Users without startup profiles (prompt them)
- Stale investor profiles (no `lastActiveDate` update in 12+ months)

**Algorithm Tuning (admin):**
Create `src/app/admin/matching-config/page.tsx`:
- UI to adjust scoring weights per dimension
- Store weights in a `MatchingConfig` model or JSON config
- Preview: show how weight changes affect top 10 matches for a sample deck
- A/B test toggle: "experimental weights" for a % of users

### 5B. New Admin API Routes

- `POST /api/admin/investors/import` — bulk CSV/JSON import
- `GET /api/admin/matching-analytics` — aggregated match analytics
- `GET/PUT /api/admin/matching-config` — algorithm weight configuration
- `POST /api/admin/investors/[id]/activity` — update investor activity data

---

## PHASE 6: Enhanced CRM & Pipeline

### 6A. Upgrade the InvestorContact / Pipeline experience

The pipeline should feel like a lightweight fundraising CRM:

**Kanban Board View:**
- Columns: Identified → Contacted → Meeting → Due Diligence → Term Sheet → Committed → Passed
- Drag-and-drop between columns
- Each card shows: investor name, firm, fit score, commitment amount (if any), days since last interaction, sentiment emoji, warm intro badge
- Column totals: count + total committed amount

**List View (alternative):**
- Sortable table with all fields
- Inline editing for status, notes, sentiment
- Bulk actions: change status, add tag, set follow-up

**Contact Detail Panel:**
- All outreach history (timeline view)
- Linked InvestorProfile data (if saved from matching)
- Warm intro tracking
- Follow-up reminders with dates
- Deal probability slider (0-100%)
- Expected close date
- Notes (rich text)
- File attachments placeholder (future)

**Pipeline Analytics:**
- Total pipeline value (sum of expected commitments × probability)
- Conversion rates between stages
- Average time in each stage
- Activity log (recent outreach across all contacts)

### 6B. Smart Notifications

Create a notification system that alerts users:
- "3 new investors match your profile" (when admin adds new InvestorProfiles)
- "Follow up with [Name] — it's been 7 days since your meeting"
- "Your pipeline has [X] contacts with no activity in 14+ days"
- Store in a `Notification` model, show in dashboard header

---

## PHASE 7: Seed Data Update

### 7A. Update `src/lib/investor-seed-data.ts`

Update ALL 60+ existing investor profiles with the new fields. Research and populate:
- Accurate country/city for each firm
- Currencies they deploy in
- Business model preferences
- Customer type preferences
- Revenue model preferences
- Deal structure preferences
- Fund size and vintage (approximate)
- Lead/follow preference
- Portfolio companies (at least 10 per firm for conflict detection)
- Thesis keywords (3-5 per firm)
- Whether they're impact/diversity focused
- Deployment pace
- Co-investors (frequent partners)

### 7B. Add 40+ More Investors

Expand the seed database to 100+ investors with geographic diversity:
- **Africa**: Partech Africa, TLcom Capital, Ventures Platform, Novastar, 54 Collective, Algebra Ventures (Egypt), Sawari Ventures, CRE Venture Capital
- **Latin America**: SoftBank Latin America, Kaszek, Monashees, Valor Capital, ALLVP, Magma Partners
- **Southeast Asia**: Sequoia SEA (now Peak XV for India), East Ventures, Golden Gate Ventures, Jungle Ventures, AC Ventures, Openspace
- **MENA**: BECO Capital, Global Founders Capital, Wamda, 500 Global MENA, Vision Ventures
- **Europe (more)**: Atomico, Accel Europe, EQT Ventures, Northzone, Cherry Ventures, Point Nine, Speedinvest, Creandum
- **Japan/Korea**: SoftBank Vision Fund, Global Brain, Kakao Ventures, STIC Investments
- **Corporate VCs**: Google Ventures, Intel Capital, Salesforce Ventures, Microsoft M12, Samsung NEXT, Qualcomm Ventures
- **Family Offices**: Emerson Collective, Kapor Capital, Omidyar Network, Draper Associates

Each with ALL new fields populated as accurately as possible.

---

## PHASE 8: Migration & Backward Compatibility

### 8A. Data Migration

- All new Deck fields are optional — existing decks work unchanged
- All new InvestorProfile fields are optional — existing profiles work unchanged
- The matching algorithm should gracefully handle missing data:
  - Missing dimension = skip that scoring dimension and reduce the denominator
  - Example: if a startup has no `businessModel`, don't score on business model match — just score on available dimensions and normalize
- Create a migration script that backfills `country: "US"` and `currency: "USD"` for existing data where geography was "US"

### 8B. The `deckToMatchInput` function

Update to pull from StartupProfile first, fall back to Deck fields, handle all new dimensions. The function signature should accept either a StartupProfile or a Deck.

---

## Implementation Notes

- **Do NOT ask questions** — make reasonable decisions and implement
- **Maintain backward compatibility** — the current matching endpoint must still work for users without a startup profile
- **Run `npx prisma db push`** after schema changes
- **Run `npm run build`** periodically to catch TypeScript errors
- **Update investor-seed-data.ts** with real, researched data (not placeholder/fake data)
- **Use the existing UI patterns** — Tailwind, Lucide icons, shadcn-style components, dark theme from the dashboard
- **Plan gating**: All investor features remain Growth+ plan gated
- **Keep the existing API routes working** — add new routes alongside them, update existing ones to use the new algorithm
- **Scoring weights should be configurable** — store in a config object, not hardcoded throughout the algorithm
