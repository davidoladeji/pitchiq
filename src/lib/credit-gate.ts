/**
 * Unified access check (credit gate).
 * Determines whether a user can perform an action by checking their
 * subscription, active period passes, and credit balance in order.
 * Automatically deducts credits when they are the access source.
 */
import { resolveEntitlements } from "@/lib/entitlements";
import { deductCredits, canAffordAction } from "@/lib/credits";
import {
  getCreditCost,
  DEFAULT_CREDIT_ACTIONS,
  DEFAULT_CREDIT_PACKS,
  DEFAULT_PASS_TIERS,
} from "@/lib/payg-config";
// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AccessResult {
  allowed: boolean;
  source: "subscription" | "period_pass" | "credits" | "none";
  creditsUsed: boolean;
  creditsRemaining?: number;
  error?: string;
  upgradeOptions?: {
    subscription: { plan: string; priceMonthly: number };
    pass: { tier: string; priceDayCents: number };
    credits: { cost: number; packs: typeof DEFAULT_CREDIT_PACKS };
  };
}

// ---------------------------------------------------------------------------
// Plan hierarchy helpers
// ---------------------------------------------------------------------------

const PLAN_HIERARCHY: string[] = ["starter", "pro", "growth", "enterprise"];

/**
 * Get the required plan for an action from DEFAULT_CREDIT_ACTIONS.
 * Defaults to "pro" if the action is unknown.
 */
export function actionRequiresPlan(action: string): string {
  const config = DEFAULT_CREDIT_ACTIONS.find((a) => a.action === action);
  return config?.requiredPlan ?? "pro";
}

/**
 * Check whether `userPlan` meets or exceeds `requiredPlan` in the hierarchy.
 */
export function planMeetsRequirement(
  userPlan: string,
  requiredPlan: string,
): boolean {
  const userIdx = PLAN_HIERARCHY.indexOf(userPlan);
  const reqIdx = PLAN_HIERARCHY.indexOf(requiredPlan);
  if (userIdx === -1) return false;
  if (reqIdx === -1) return false;
  return userIdx >= reqIdx;
}

// ---------------------------------------------------------------------------
// Subscription price mapping (for upgrade suggestions)
// ---------------------------------------------------------------------------

const SUBSCRIPTION_PRICES: Record<string, number> = {
  pro: 2900,
  growth: 7900,
  enterprise: 19900,
};

// ---------------------------------------------------------------------------
// Main access check
// ---------------------------------------------------------------------------

/**
 * Check whether a user is allowed to perform an action.
 *
 * Resolution order:
 * 1. Subscription plan — free if plan meets requirement
 * 2. Active period pass — free if pass tier meets requirement
 * 3. Credit balance — deducts credits if affordable
 * 4. Denied — returns upgrade options
 */
export async function checkAccess(
  userId: string,
  action: string,
  options?: { resourceId?: string; description?: string },
): Promise<AccessResult> {
  const entitlements = await resolveEntitlements(userId);
  const requiredPlan = actionRequiresPlan(action);

  // 1. Check subscription
  const subSource = entitlements.allSources.find(
    (s) => s.type === "subscription",
  );
  if (subSource && planMeetsRequirement(subSource.plan, requiredPlan)) {
    return {
      allowed: true,
      source: "subscription",
      creditsUsed: false,
      creditsRemaining: entitlements.creditBalance,
    };
  }

  // 2. Check active period passes
  const passSource = entitlements.allSources.find(
    (s) => s.type === "period_pass" && planMeetsRequirement(s.plan, requiredPlan),
  );
  if (passSource) {
    return {
      allowed: true,
      source: "period_pass",
      creditsUsed: false,
      creditsRemaining: entitlements.creditBalance,
    };
  }

  // 3. Check credits
  const cost = getCreditCost(action);
  if (cost > 0 && (await canAffordAction(userId, action))) {
    const result = await deductCredits(
      userId,
      action,
      options?.resourceId,
      options?.description,
    );
    if (result.success) {
      return {
        allowed: true,
        source: "credits",
        creditsUsed: true,
        creditsRemaining: result.newBalance,
      };
    }
    // Deduction failed (race condition — balance drained between check and deduct)
    return {
      allowed: false,
      source: "none",
      creditsUsed: false,
      creditsRemaining: result.newBalance,
      error: result.error ?? "Credit deduction failed",
    };
  }

  // 4. Denied — build upgrade options
  const suggestedPlan = requiredPlan;
  const suggestedTier =
    DEFAULT_PASS_TIERS.find((t) =>
      planMeetsRequirement(t.equivalentPlan, requiredPlan),
    ) ?? DEFAULT_PASS_TIERS[0];

  return {
    allowed: false,
    source: "none",
    creditsUsed: false,
    creditsRemaining: entitlements.creditBalance,
    error: "Insufficient access. Upgrade your plan, buy a pass, or add credits.",
    upgradeOptions: {
      subscription: {
        plan: suggestedPlan,
        priceMonthly: SUBSCRIPTION_PRICES[suggestedPlan] ?? 2900,
      },
      pass: {
        tier: suggestedTier.id,
        priceDayCents: suggestedTier.baseDayRateCents,
      },
      credits: {
        cost,
        packs: DEFAULT_CREDIT_PACKS,
      },
    },
  };
}
