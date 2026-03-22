# Claude Code Prompt: Pay-As-You-Go Billing System

> Paste this entire prompt into Claude Code in **Act mode**. Do not ask questions — implement everything described below.

---

## Context

You are working on the PitchIQ codebase (`usepitchiq.com`), a Next.js 14 + TypeScript + Prisma + PostgreSQL application with Stripe billing already integrated. The app currently has 4 subscription tiers: Starter (free), Pro ($29/mo), Growth ($79/mo), Enterprise ($399/mo).

Users have asked for **pay-as-you-go** options — they want to use PitchIQ when they need it (e.g., during fundraising) without committing to monthly subscriptions. You need to implement a **hybrid PAYG system** with two complementary models:

1. **Period Passes** — user picks a tier + duration, pays a flat rate for that window
2. **Credits** — user buys credit packs, individual actions consume credits

Both models coexist alongside subscriptions. A user might have a subscription, an active pass, AND a credit balance — the system should use the highest entitlement available.

---

## PHASE 1: Database Schema

### 1A. New Models (add to `prisma/schema.prisma`)

```prisma
// --- Period Pass: time-bound access at a tier level ---
model PeriodPass {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  tier          String   // "basic" | "growth" | "full"
  startsAt      DateTime
  expiresAt     DateTime
  durationDays  Int      // 1, 3, 7, 14, 30, etc.

  // Stripe
  stripePaymentId String?
  amountCents     Int      // What they paid
  currency        String   @default("usd")

  // Status
  status        String   @default("active") // "active" | "expired" | "refunded"
  autoRenew     Boolean  @default(false)

  createdAt     DateTime @default(now())

  @@index([userId])
  @@index([userId, status])
  @@index([expiresAt])
}

// --- Credit balance and transactions ---
model CreditBalance {
  id        String @id @default(uuid())
  userId    String @unique
  user      User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  balance   Int    @default(0)  // Current credit balance
  lifetime  Int    @default(0)  // Total credits ever purchased (for loyalty/stats)
  updatedAt DateTime @updatedAt

  @@index([userId])
}

model CreditTransaction {
  id          String   @id @default(uuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  type        String   // "purchase" | "usage" | "refund" | "bonus" | "expiry"
  amount      Int      // Positive for additions, negative for usage
  balanceAfter Int     // Balance after this transaction (for audit trail)

  // For purchases
  packId      String?  // Which credit pack was bought
  stripePaymentId String?
  amountCents Int?     // What they paid in cents

  // For usage
  action      String?  // "create_deck" | "ai_generation" | "export_pptx" | "export_pdf" | "investor_match" | "pitch_practice" | "ai_coaching" | "social_export"
  resourceId  String?  // ID of the deck/resource the credit was spent on

  description String?  // Human-readable: "Created deck 'Series A Pitch'"
  createdAt   DateTime @default(now())

  @@index([userId])
  @@index([userId, type])
  @@index([createdAt])
}

// --- Admin-configurable pricing ---
model PaygConfig {
  id    String @id @default(uuid())
  key   String @unique  // Config key
  value String          // JSON value
  updatedAt DateTime @updatedAt
}
```

### 1B. Add relations to the `User` model

Add these fields to the existing User model:
```
periodPasses      PeriodPass[]
creditBalance     CreditBalance?
creditTransactions CreditTransaction[]
```

### 1C. Run migration

```bash
npx prisma db push
```

---

## PHASE 2: PAYG Configuration System

### 2A. Create `src/lib/payg-config.ts`

This is the central configuration for all PAYG pricing. Store defaults in code, allow admin override via `PaygConfig` table.

```typescript
// ---------- PERIOD PASS TIERS ----------

export interface PassTier {
  id: string;          // "basic" | "growth" | "full"
  name: string;        // Display name
  description: string;
  /** Which subscription tier this maps to for feature access */
  equivalentPlan: string; // "pro" | "growth" | "enterprise"
  /** Base price per day in cents (USD). Actual price = baseDayRate × days × durationMultiplier */
  baseDayRateCents: number;
  /** Discount multipliers by duration — longer = cheaper per day */
  durationMultipliers: Record<number, number>;
  /** Features highlighted in UI */
  features: string[];
}

export const DEFAULT_PASS_TIERS: PassTier[] = [
  {
    id: "basic",
    name: "Basic Pass",
    description: "Editor, exports & AI coaching",
    equivalentPlan: "pro",
    baseDayRateCents: 500, // $5/day base
    durationMultipliers: {
      1: 1.0,     // 1 day = $5
      3: 0.87,    // 3 days = $13 ($4.33/day)
      7: 0.71,    // 7 days = $25 ($3.57/day)
      14: 0.57,   // 14 days = $40 ($2.86/day)
      30: 0.47,   // 30 days = $70 ($2.33/day) — cheaper than $29/mo sub to incentivize trying
    },
    features: [
      "Full editor with all 30 block types",
      "AI coaching per slide",
      "PPTX & PDF export",
      "All themes",
      "Up to 5 decks",
    ],
  },
  {
    id: "growth",
    name: "Growth Pass",
    description: "Everything in Basic + analytics & investor tools",
    equivalentPlan: "growth",
    baseDayRateCents: 1200, // $12/day base
    durationMultipliers: {
      1: 1.0,     // 1 day = $12
      3: 0.83,    // 3 days = $30 ($10/day)
      7: 0.68,    // 7 days = $57 ($8.14/day)
      14: 0.55,   // 14 days = $92 ($6.57/day)
      30: 0.44,   // 30 days = $158 ($5.27/day)
    },
    features: [
      "Everything in Basic",
      "Viewer analytics",
      "Investor matching & CRM",
      "A/B testing",
      "Pitch practice",
      "Unlimited decks",
    ],
  },
  {
    id: "full",
    name: "Full Access Pass",
    description: "Complete PitchIQ experience",
    equivalentPlan: "enterprise",
    baseDayRateCents: 2000, // $20/day base
    durationMultipliers: {
      1: 1.0,     // 1 day = $20
      3: 0.83,    // 3 days = $50
      7: 0.71,    // 7 days = $100
      14: 0.57,   // 14 days = $160
      30: 0.47,   // 30 days = $282
    },
    features: [
      "Everything in Growth",
      "Team collaboration",
      "Custom domain",
      "API access",
      "Batch scoring",
      "White-label exports",
    ],
  },
];

// ---------- CREDIT PACKS ----------

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  priceCents: number;  // USD
  /** Bonus credits (e.g., buy 50 get 5 free) */
  bonus: number;
  popular?: boolean;
}

export const DEFAULT_CREDIT_PACKS: CreditPack[] = [
  { id: "starter-10",  name: "10 Credits",  credits: 10,  priceCents: 999,   bonus: 0 },
  { id: "value-25",    name: "25 Credits",  credits: 25,  priceCents: 1999,  bonus: 2,  popular: true },
  { id: "pro-50",      name: "50 Credits",  credits: 50,  priceCents: 3499,  bonus: 5 },
  { id: "bulk-100",    name: "100 Credits", credits: 100, priceCents: 5999,  bonus: 15 },
];

// ---------- CREDIT COSTS PER ACTION ----------

export interface CreditAction {
  action: string;
  displayName: string;
  cost: number;
  description: string;
  /** Which minimum plan this action normally requires (for display) */
  requiredPlan: string;
}

export const DEFAULT_CREDIT_ACTIONS: CreditAction[] = [
  { action: "create_deck",     displayName: "Create Deck",            cost: 5,  description: "Create a new pitch deck",                  requiredPlan: "pro" },
  { action: "ai_generation",   displayName: "AI Deck Generation",     cost: 3,  description: "Generate deck content with AI",             requiredPlan: "pro" },
  { action: "ai_coaching",     displayName: "AI Slide Coaching",      cost: 1,  description: "Get AI feedback on a slide",                requiredPlan: "pro" },
  { action: "export_pptx",     displayName: "Export to PowerPoint",   cost: 2,  description: "Export deck as .pptx file",                 requiredPlan: "pro" },
  { action: "export_pdf",      displayName: "Export to PDF",          cost: 2,  description: "Export deck as .pdf file",                  requiredPlan: "pro" },
  { action: "social_export",   displayName: "Social Media Export",    cost: 1,  description: "Export slide as social media image",        requiredPlan: "pro" },
  { action: "investor_match",  displayName: "Investor Matching",      cost: 3,  description: "Run investor matching for a deck",          requiredPlan: "growth" },
  { action: "pitch_practice",  displayName: "Pitch Practice Session", cost: 2,  description: "AI-powered pitch practice session",         requiredPlan: "growth" },
  { action: "investor_lens",   displayName: "Investor Lens Analysis", cost: 2,  description: "AI analysis from investor perspective",     requiredPlan: "growth" },
  { action: "ab_test",         displayName: "A/B Test Creation",      cost: 2,  description: "Create an A/B test for deck variants",      requiredPlan: "growth" },
  { action: "analytics_view",  displayName: "View Analytics",         cost: 1,  description: "Access viewer analytics for a deck",        requiredPlan: "growth" },
];
```

### 2B. Helper functions in `src/lib/payg-config.ts`

```typescript
/**
 * Calculate the price for a period pass.
 * @returns price in cents (USD)
 */
export function calculatePassPrice(tier: PassTier, durationDays: number): number {
  // Find the nearest defined multiplier (round down to nearest bracket)
  const brackets = Object.keys(tier.durationMultipliers)
    .map(Number)
    .sort((a, b) => a - b);

  let multiplier = 1.0;
  for (const bracket of brackets) {
    if (durationDays >= bracket) {
      multiplier = tier.durationMultipliers[bracket];
    }
  }

  return Math.round(tier.baseDayRateCents * durationDays * multiplier);
}

/**
 * Get the credit cost for an action.
 * Returns 0 if action is unknown (fail-open for forward compat).
 */
export function getCreditCost(actionId: string): number {
  const action = DEFAULT_CREDIT_ACTIONS.find(a => a.action === actionId);
  return action?.cost ?? 0;
}

/**
 * Load PAYG config from database, falling back to defaults.
 * Admin can override any config via PaygConfig table.
 */
export async function getPaygConfig(): Promise<{
  passTiers: PassTier[];
  creditPacks: CreditPack[];
  creditActions: CreditAction[];
}> {
  // Implementation: try to load from PaygConfig table, merge with defaults
  // This allows admin to override pricing without code deploys
}
```

---

## PHASE 3: Entitlement Resolution

### 3A. Create `src/lib/entitlements.ts`

This is the **critical piece** — it replaces the simple `getPlanLimits(user.plan)` check with a layered entitlement system.

```typescript
import { getPlanLimits, PlanLimits } from "./plan-limits";

export interface EntitlementSource {
  type: "subscription" | "period_pass" | "credits";
  plan: string;           // The effective plan level
  expiresAt?: Date;       // When this entitlement expires (passes)
  creditsRemaining?: number; // For credit-based entitlement
}

export interface UserEntitlements {
  /** The effective plan limits (highest of subscription, pass, or credits) */
  limits: PlanLimits;
  /** What's providing the entitlement */
  source: EntitlementSource;
  /** All active entitlement sources (for display) */
  allSources: EntitlementSource[];
  /** Whether user has any active entitlement above starter */
  hasActiveEntitlement: boolean;
  /** Credit balance (0 if no credits) */
  creditBalance: number;
  /** Active period pass (null if none) */
  activePass: { tier: string; expiresAt: Date } | null;
}
```

The `resolveEntitlements(userId: string)` function should:

1. Fetch the user's subscription plan
2. Fetch any active period pass (status = "active" AND expiresAt > now) — take the highest tier if multiple
3. Fetch credit balance
4. Determine the **effective plan** = highest of:
   - Subscription plan
   - Active period pass equivalent plan
   - If credits > 0, the user gets "starter" access by default (credits unlock individual actions, not blanket access)
5. Return the merged `UserEntitlements`

**Plan hierarchy for comparison**: starter < pro < growth < enterprise

### 3B. Create `src/lib/credits.ts`

Credit operations:

```typescript
/**
 * Check if user can afford an action via credits.
 * Does NOT deduct — just checks.
 */
export async function canAffordAction(userId: string, action: string): Promise<boolean>

/**
 * Deduct credits for an action. Creates a CreditTransaction.
 * Returns false if insufficient balance.
 * MUST be called inside a transaction to prevent race conditions.
 */
export async function deductCredits(
  userId: string,
  action: string,
  resourceId?: string,
  description?: string,
): Promise<{ success: boolean; newBalance: number; error?: string }>

/**
 * Add credits to a user's balance. Creates a CreditTransaction.
 * Used for purchases, bonuses, and refunds.
 */
export async function addCredits(
  userId: string,
  amount: number,
  type: "purchase" | "bonus" | "refund",
  metadata?: { packId?: string; stripePaymentId?: string; amountCents?: number },
): Promise<{ newBalance: number }>

/**
 * Get a user's credit balance.
 */
export async function getCreditBalance(userId: string): Promise<number>

/**
 * Get credit transaction history for a user.
 */
export async function getCreditHistory(
  userId: string,
  options?: { limit?: number; offset?: number; type?: string },
): Promise<CreditTransaction[]>
```

### 3C. Update `src/lib/plan-limits.ts`

Add a new function that wraps the old `getPlanLimits`:

```typescript
/**
 * Get effective plan limits for a user, considering subscription + PAYG.
 * This is the NEW entry point — all feature gates should use this.
 */
export async function getEffectiveLimits(userId: string): Promise<UserEntitlements>
```

**IMPORTANT**: Do NOT break existing `getPlanLimits(plan)` — it's used everywhere. Instead, add `getEffectiveLimits` as the new preferred function and gradually migrate callsites. For this prompt, update all API routes under `/api/investors/`, `/api/dashboard/`, and the deck creation routes to use `getEffectiveLimits`.

### 3D. Credit Gating Middleware

Create `src/lib/credit-gate.ts`:

```typescript
/**
 * Middleware-style function for API routes that checks entitlements.
 * First checks if user has subscription/pass access, then falls back to credits.
 *
 * Usage in an API route:
 *   const gate = await checkAccess(userId, "investor_match", { resourceId: deckId });
 *   if (!gate.allowed) return NextResponse.json({ error: gate.error, upgradeOptions: gate.upgradeOptions }, { status: 403 });
 *   // If credits were used, gate.creditsUsed will be true
 */
export async function checkAccess(
  userId: string,
  action: string,
  options?: { resourceId?: string; description?: string },
): Promise<{
  allowed: boolean;
  source: "subscription" | "period_pass" | "credits" | "none";
  creditsUsed: boolean;
  creditsRemaining?: number;
  error?: string;
  upgradeOptions?: {
    subscription: { plan: string; priceMonthly: number };
    pass: { tier: string; priceDay: number };
    credits: { cost: number; packs: CreditPack[] };
  };
}>
```

The logic:
1. Check if user's subscription covers this action → allowed (no credit deduction)
2. Check if user has an active period pass that covers this action → allowed (no credit deduction)
3. Check if user has sufficient credits → deduct and allow
4. None of the above → denied, return upgrade options

---

## PHASE 4: Stripe Integration

### 4A. Period Pass Checkout

Create `src/app/api/payg/pass/checkout/route.ts`:

```typescript
// POST { tier: "growth", durationDays: 7 }
// Creates a Stripe Checkout session for a one-time payment
// On success → webhook creates PeriodPass record
```

Use `mode: "payment"` (not subscription). Include metadata:
```
{ userId, tier, durationDays, type: "period_pass" }
```

### 4B. Credit Pack Checkout

Create `src/app/api/payg/credits/checkout/route.ts`:

```typescript
// POST { packId: "value-25" }
// Creates a Stripe Checkout session for a one-time payment
// On success → webhook adds credits to balance
```

Use `mode: "payment"`. Include metadata:
```
{ userId, packId, credits, bonus, type: "credit_purchase" }
```

### 4C. Update Webhook Handler

Update `src/app/api/stripe/webhook/route.ts` to handle PAYG payments:

In `handleOneTimePayment`, check for metadata:
- If `type === "period_pass"` → Create PeriodPass record
- If `type === "credit_purchase"` → Call `addCredits()` with pack credits + bonus

### 4D. Pass Expiry

Create a utility (or edge function concept):
- On every API request that checks entitlements, also check if any active passes have expired
- If expired, update `status = "expired"`
- Optionally: if `autoRenew = true`, trigger a new Stripe payment (stretch goal — can skip for v1)

### 4E. PAYG Status API

Create `src/app/api/payg/status/route.ts`:

```typescript
// GET — returns user's full PAYG status
// Response:
{
  subscription: { plan: "starter", active: true },
  activePasses: [{ tier: "growth", expiresAt: "...", daysLeft: 5 }],
  creditBalance: 23,
  effectivePlan: "growth",  // Highest active entitlement
  creditHistory: [...last 10 transactions],
}
```

---

## PHASE 5: User-Facing UI

### 5A. PAYG Pricing Section

Add a PAYG section to the existing pricing page (or create a new tab). The design should show:

**Period Pass Selector:**
- Three tier cards side by side (Basic / Growth / Full Access)
- Each card has: name, description, feature list, base price
- Below the cards: a **duration slider or selector** (1 day, 3 days, 1 week, 2 weeks, 1 month, custom)
- As the user adjusts duration, the price updates in real-time on each card
- Show the per-day rate and total price
- Show comparison: "30-day Growth Pass: $158 vs Growth subscription: $79/mo" (honest — if subscription is better value for regular use, say so)
- "Get Pass" button → Stripe checkout

**Credit Pack Section:**
- Grid of 4 pack cards
- Each shows: credit count, bonus credits, price, price-per-credit
- Highlight the "popular" pack
- "Buy Credits" button → Stripe checkout

**Credit Cost Table:**
- Table showing what each action costs in credits
- Columns: Action, Credits, Equivalent plan required
- This helps users understand value before buying

### 5B. Dashboard PAYG Widget

Create `src/components/dashboard/PaygStatus.tsx`:

A compact widget in the dashboard sidebar or header showing:
- Active pass (if any): tier name, time remaining with countdown
- Credit balance with a "Buy More" link
- If no active entitlement: "Upgrade" prompt with pass/credit/subscription options
- Recent credit usage (last 3 transactions)

### 5C. Credit Usage Confirmation Modal

When a user tries to perform an action that will cost credits (and they don't have subscription/pass coverage), show a confirmation modal:

```
"This will use 3 credits (Investor Matching)
Your balance: 23 credits → 20 credits after
[Use Credits] [Buy a Pass Instead] [Cancel]"
```

Create `src/components/CreditConfirmModal.tsx` — a reusable modal that any feature can trigger.

### 5D. Paywall / Upgrade Modal

When `checkAccess` returns `allowed: false`, show an upgrade modal with three options:
1. **Subscribe** — monthly subscription at the required tier
2. **Get a Pass** — period pass with duration selector
3. **Buy Credits** — credit packs with "you need X credits for this action"

Create `src/components/UpgradeModal.tsx` — enhanced version of any existing upgrade prompt.

### 5E. Credit History Page

Create `src/app/dashboard/credits/page.tsx`:

- Credit balance prominently displayed
- Transaction history table: date, type (purchase/usage/bonus), amount (+/-), balance after, description
- Filter by type
- "Buy More Credits" button
- Pass history: list of all passes with status (active/expired)

---

## PHASE 6: Admin Interface

### 6A. PAYG Admin Dashboard

Create `src/app/admin/payg/page.tsx`:

**Revenue Overview:**
- Total PAYG revenue (passes + credits) vs subscription revenue
- Revenue trend chart (daily/weekly/monthly)
- Active passes count by tier
- Credit packs sold
- Average credits per user
- Credits consumed by action type (pie/bar chart)

**Pass Management:**
- List all active passes (user, tier, expires, amount paid)
- Ability to extend/revoke passes
- Refund button (creates Stripe refund + updates pass status)

**Credit Management:**
- List users by credit balance (desc)
- Grant bonus credits to a user
- View any user's credit history
- Bulk grant credits (e.g., promotional campaign)

### 6B. Pricing Configuration

Create `src/app/admin/payg/pricing/page.tsx`:

- Edit pass tier pricing (base day rate, duration multipliers, features)
- Edit credit pack pricing (price, credits, bonus)
- Edit credit action costs
- Preview: "What would a user pay for a 7-day Growth pass?" calculator
- Save to `PaygConfig` table (overrides code defaults)
- "Reset to Defaults" button

### 6C. Admin API Routes

- `GET /api/admin/payg/stats` — Revenue and usage statistics
- `GET /api/admin/payg/passes` — List all passes (with filtering)
- `POST /api/admin/payg/passes/[id]/extend` — Extend a pass
- `POST /api/admin/payg/passes/[id]/revoke` — Revoke a pass
- `POST /api/admin/payg/credits/grant` — Grant credits to user(s)
- `GET/PUT /api/admin/payg/pricing` — Read/update pricing config

---

## PHASE 7: Integration with Existing Features

### 7A. Update Feature Gates

Update these existing API routes to use `checkAccess` instead of simple plan checks:

**Deck creation** (`/api/decks` POST):
- Subscription/pass → allowed per maxDecks limit
- Credits → deduct `create_deck` (5 credits), allow regardless of limit (1 deck per credit purchase)

**Exports** (`/api/decks/[id]/export`):
- Check for `export_pptx` or `export_pdf` action

**Investor matching** (`/api/investors/match`):
- Check for `investor_match` action

**Analytics** (`/api/dashboard/`):
- Check for `analytics_view` action

**AI features** (coaching, investor lens, pitch practice):
- Check for respective credit actions

### 7B. Credit Deduction Points

Add credit deduction hooks at the point of actual value delivery (not on page load):

- **Deck creation**: Deduct when deck is saved, not when editor opens
- **Export**: Deduct when export file is generated
- **Investor match**: Deduct when match results are computed
- **AI coaching**: Deduct when AI response is returned
- **Analytics**: Deduct on first view per day (not every page refresh — use a daily cache key)

### 7C. Idempotency

Credit deductions MUST be idempotent:
- For exports: if user exports same deck within 1 hour, don't charge again
- For AI coaching: if user refreshes same slide coaching, don't charge again
- Use a `CreditTransaction` check: before deducting, look for an existing transaction with the same `action + resourceId` within the dedup window

---

## PHASE 8: Edge Cases & Polish

### 8A. Pass Overlap Handling

If a user buys a new pass while an existing one is active:
- If new pass is **same or lower tier**: extend the existing pass's expiration
- If new pass is **higher tier**: activate the new pass immediately, carry remaining days of old pass as a credit note or just let them overlap (simpler)

### 8B. Subscription + PAYG Interaction

- If user has a subscription AND a pass, the higher tier wins for feature access
- Credits are never consumed while a subscription or pass covers the action
- If user subscribes, don't invalidate their remaining credits — they can use them later if they cancel
- Show in UI: "Your Growth subscription covers this — no credits needed"

### 8C. Refunds

- Period pass refund: calculate prorated amount based on days remaining
- Credit refund: restore credits to balance, create refund transaction
- Admin can process both from the admin UI

### 8D. Low Balance Alerts

- When credit balance drops below 5, show a subtle alert: "Running low on credits — buy more"
- When a pass is expiring within 24 hours, show: "Your Growth Pass expires tomorrow"
- These should be non-intrusive banners in the dashboard, not blocking modals

### 8E. First-Time User Flow

- New users on Starter see the upgrade modal with ALL options: Subscribe, Get a Pass, or Buy Credits
- Show a comparison table: "Best for regular use → Subscribe | Best for one-time projects → Pass | Best for occasional use → Credits"
- Include a "Try with 5 free credits" option for new signups (create a welcome bonus system)

---

## Implementation Notes

- **Do NOT ask questions** — make reasonable decisions and implement
- **Do NOT break existing subscription billing** — PAYG is additive
- **Run `npx prisma db push`** after schema changes
- **Run `npm run build`** periodically to catch TypeScript errors
- **Stripe checkout sessions**: use `mode: "payment"` for PAYG (not subscription)
- **All prices in cents** (Stripe convention)
- **Use the existing UI patterns** — Tailwind, Lucide icons, shadcn-style components, dark theme
- **Credit operations must be atomic** — use Prisma transactions for deductions to prevent race conditions
- **The webhook handler must be idempotent** — handle duplicate Stripe events gracefully
- **Every credit deduction must create a CreditTransaction** — full audit trail
- **Period passes must auto-expire** — check `expiresAt` on every entitlement resolution, update status
