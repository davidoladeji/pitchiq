/**
 * PAYG (Pay-As-You-Go) pricing configuration.
 * Defines pass tiers, credit packs, and credit action costs.
 * Admin-overridable via the PaygConfig table.
 */
import { prisma } from "@/lib/db";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PassTier {
  id: string;
  name: string;
  description: string;
  equivalentPlan: string;
  baseDayRateCents: number;
  durationMultipliers: Record<number, number>;
  features: string[];
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  priceCents: number;
  bonus: number;
  popular?: boolean;
}

export interface CreditAction {
  action: string;
  displayName: string;
  cost: number;
  description: string;
  requiredPlan: string;
}

// ---------------------------------------------------------------------------
// Default pass tiers
// ---------------------------------------------------------------------------

export const DEFAULT_PASS_TIERS: PassTier[] = [
  {
    id: "basic",
    name: "Basic Pass",
    description: "Full editor access with AI coaching and exports",
    equivalentPlan: "pro",
    baseDayRateCents: 500,
    durationMultipliers: { 1: 1.0, 3: 0.87, 7: 0.71, 14: 0.57, 30: 0.47 },
    features: [
      "Pitch deck editor",
      "AI coaching per slide",
      "PDF & PPTX exports",
      "All themes",
      "Up to 5 decks",
    ],
  },
  {
    id: "growth",
    name: "Growth Pass",
    description: "Analytics, investor tools, and unlimited decks",
    equivalentPlan: "growth",
    baseDayRateCents: 1200,
    durationMultipliers: { 1: 1.0, 3: 0.83, 7: 0.68, 14: 0.55, 30: 0.44 },
    features: [
      "Everything in Basic",
      "Deck analytics",
      "Investor matching & CRM",
      "A/B testing",
      "Pitch practice",
      "Unlimited decks",
    ],
  },
  {
    id: "full",
    name: "Full Access Pass",
    description: "Complete platform access including team and API features",
    equivalentPlan: "enterprise",
    baseDayRateCents: 2000,
    durationMultipliers: { 1: 1.0, 3: 0.83, 7: 0.71, 14: 0.57, 30: 0.47 },
    features: [
      "Everything in Growth",
      "Team collaboration",
      "Custom domain",
      "API access",
      "Batch scoring",
      "White-label options",
    ],
  },
];

// ---------------------------------------------------------------------------
// Default credit packs
// ---------------------------------------------------------------------------

export const DEFAULT_CREDIT_PACKS: CreditPack[] = [
  { id: "starter-10", name: "Starter", credits: 10, priceCents: 999, bonus: 0 },
  { id: "value-25", name: "Value", credits: 25, priceCents: 1999, bonus: 2, popular: true },
  { id: "pro-50", name: "Pro", credits: 50, priceCents: 3499, bonus: 5 },
  { id: "bulk-100", name: "Bulk", credits: 100, priceCents: 5999, bonus: 15 },
];

// ---------------------------------------------------------------------------
// Default credit actions
// ---------------------------------------------------------------------------

export const DEFAULT_CREDIT_ACTIONS: CreditAction[] = [
  { action: "create_deck", displayName: "Create Deck", cost: 5, description: "Create a new pitch deck", requiredPlan: "pro" },
  { action: "ai_generation", displayName: "AI Generation", cost: 3, description: "Generate content with AI", requiredPlan: "pro" },
  { action: "ai_coaching", displayName: "AI Coaching", cost: 1, description: "Get AI coaching feedback on a slide", requiredPlan: "pro" },
  { action: "export_pptx", displayName: "Export PPTX", cost: 2, description: "Export deck as PowerPoint", requiredPlan: "pro" },
  { action: "export_pdf", displayName: "Export PDF", cost: 2, description: "Export deck as PDF", requiredPlan: "pro" },
  { action: "social_export", displayName: "Social Export", cost: 1, description: "Export slides for social media", requiredPlan: "pro" },
  { action: "investor_match", displayName: "Investor Match", cost: 3, description: "Run investor matching", requiredPlan: "growth" },
  { action: "pitch_practice", displayName: "Pitch Practice", cost: 2, description: "Start a pitch practice session", requiredPlan: "growth" },
  { action: "investor_lens", displayName: "Investor Lens", cost: 2, description: "View deck through investor perspective", requiredPlan: "growth" },
  { action: "ab_test", displayName: "A/B Test", cost: 2, description: "Create an A/B test for a deck", requiredPlan: "growth" },
  { action: "analytics_view", displayName: "Analytics View", cost: 1, description: "View deck analytics", requiredPlan: "growth" },
  { action: "deck_refinement", displayName: "Smart Deck Refinement", cost: 5, description: "AI-powered deck improvement from PIQ feedback", requiredPlan: "pro" },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Calculate the price for a period pass given a tier and duration in days.
 * Finds the nearest bracket multiplier (rounds down to nearest defined bracket).
 */
export function calculatePassPrice(tier: PassTier, durationDays: number): number {
  const brackets = Object.keys(tier.durationMultipliers)
    .map(Number)
    .sort((a, b) => a - b);

  // Find the nearest bracket that is <= durationDays
  let multiplier = 1.0;
  for (const bracket of brackets) {
    if (bracket <= durationDays) {
      multiplier = tier.durationMultipliers[bracket];
    } else {
      break;
    }
  }

  return Math.round(tier.baseDayRateCents * durationDays * multiplier);
}

/**
 * Look up the credit cost for an action by its ID.
 * Returns 0 if the action is unknown.
 */
export function getCreditCost(actionId: string): number {
  const action = DEFAULT_CREDIT_ACTIONS.find((a) => a.action === actionId);
  return action?.cost ?? 0;
}

/**
 * Load PAYG configuration, merging admin overrides from the PaygConfig table
 * with hardcoded defaults. Falls back entirely to defaults on error.
 */
export async function getPaygConfig(): Promise<{
  passTiers: PassTier[];
  creditPacks: CreditPack[];
  creditActions: CreditAction[];
}> {
  try {
    const rows = await prisma.paygConfig.findMany();
    const configMap = new Map<string, string>();
    for (const row of rows) {
      configMap.set(row.key, row.value);
    }

    const passTiers = configMap.has("passTiers")
      ? (JSON.parse(configMap.get("passTiers")!) as PassTier[])
      : DEFAULT_PASS_TIERS;

    const creditPacks = configMap.has("creditPacks")
      ? (JSON.parse(configMap.get("creditPacks")!) as CreditPack[])
      : DEFAULT_CREDIT_PACKS;

    const creditActions = configMap.has("creditActions")
      ? (JSON.parse(configMap.get("creditActions")!) as CreditAction[])
      : DEFAULT_CREDIT_ACTIONS;

    return { passTiers, creditPacks, creditActions };
  } catch {
    // DB not available or table missing — fall back to defaults
    return {
      passTiers: DEFAULT_PASS_TIERS,
      creditPacks: DEFAULT_CREDIT_PACKS,
      creditActions: DEFAULT_CREDIT_ACTIONS,
    };
  }
}
