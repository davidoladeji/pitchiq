/**
 * Entitlement resolution.
 * Determines a user's effective access level by combining their subscription,
 * any active period passes, and credit balance into a unified entitlement.
 */
import { prisma } from "@/lib/db";
import { getPlanLimits, type PlanLimits } from "@/lib/plan-limits";
import { DEFAULT_PASS_TIERS } from "@/lib/payg-config";
import { getCreditBalance } from "@/lib/credits";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EntitlementSource {
  type: "subscription" | "period_pass" | "credits";
  plan: string;
  expiresAt?: Date;
  creditsRemaining?: number;
}

export interface UserEntitlements {
  limits: PlanLimits;
  source: EntitlementSource;
  allSources: EntitlementSource[];
  hasActiveEntitlement: boolean;
  creditBalance: number;
  activePass: { tier: string; expiresAt: Date } | null;
}

// ---------------------------------------------------------------------------
// Plan hierarchy
// ---------------------------------------------------------------------------

const PLAN_HIERARCHY: string[] = ["starter", "pro", "growth", "enterprise"];

function planIndex(plan: string): number {
  const idx = PLAN_HIERARCHY.indexOf(plan);
  return idx === -1 ? 0 : idx;
}

function highestPlan(plans: string[]): string {
  let best = "starter";
  let bestIdx = 0;
  for (const p of plans) {
    const idx = planIndex(p);
    if (idx > bestIdx) {
      bestIdx = idx;
      best = p;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Main resolver
// ---------------------------------------------------------------------------

/**
 * Resolve the full entitlement picture for a user by combining:
 * 1. Their subscription plan
 * 2. Any active period passes
 * 3. Their credit balance
 *
 * The effective plan is the highest tier across all sources.
 */
export async function resolveEntitlements(
  userId: string,
): Promise<UserEntitlements> {
  const now = new Date();

  // Fetch user and active passes in parallel
  const [user, activePasses, creditBalance] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { plan: true },
    }),
    prisma.periodPass.findMany({
      where: {
        userId,
        status: "active",
        expiresAt: { gt: now },
      },
    }),
    getCreditBalance(userId),
  ]);

  // Auto-expire stale passes (status still "active" but past expiry)
  await prisma.periodPass.updateMany({
    where: {
      userId,
      status: "active",
      expiresAt: { lte: now },
    },
    data: { status: "expired" },
  });

  // Build all entitlement sources
  const allSources: EntitlementSource[] = [];

  // 1. Subscription
  allSources.push({
    type: "subscription",
    plan: user.plan,
  });

  // 2. Period passes
  let activePass: { tier: string; expiresAt: Date } | null = null;
  for (const pass of activePasses) {
    const tierConfig = DEFAULT_PASS_TIERS.find((t) => t.id === pass.tier);
    const equivalentPlan = tierConfig?.equivalentPlan ?? "starter";
    allSources.push({
      type: "period_pass",
      plan: equivalentPlan,
      expiresAt: pass.expiresAt,
    });
    // Track the pass for the response (use the latest-expiring one)
    if (!activePass || pass.expiresAt > activePass.expiresAt) {
      activePass = { tier: pass.tier, expiresAt: pass.expiresAt };
    }
  }

  // 3. Credits
  if (creditBalance > 0) {
    allSources.push({
      type: "credits",
      plan: "starter",
      creditsRemaining: creditBalance,
    });
  }

  // Determine effective plan (highest across all sources)
  const effectivePlan = highestPlan(allSources.map((s) => s.plan));
  const limits = getPlanLimits(effectivePlan);

  // The primary source is the one providing the effective plan
  const primarySource =
    allSources.find((s) => s.plan === effectivePlan) ?? allSources[0];

  const hasActiveEntitlement = effectivePlan !== "starter" || creditBalance > 0;

  return {
    limits,
    source: primarySource,
    allSources,
    hasActiveEntitlement,
    creditBalance,
    activePass,
  };
}
