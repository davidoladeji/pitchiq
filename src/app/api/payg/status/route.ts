import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getCreditBalance, getCreditHistory } from "@/lib/credits";

/** Plan hierarchy for determining effective plan. */
const PLAN_RANK: Record<string, number> = {
  starter: 0,
  pro: 1,
  growth: 2,
  enterprise: 3,
};

function planFromRank(rank: number): string {
  const entry = Object.entries(PLAN_RANK).find(([, r]) => r === rank);
  return entry?.[0] ?? "starter";
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Sign in to view PAYG status" },
        { status: 401 },
      );
    }

    const now = new Date();

    // Fetch everything in parallel
    const [user, activePasses, creditBalance, recentCredits] =
      await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { plan: true },
        }),
        prisma.periodPass.findMany({
          where: {
            userId,
            status: "active",
            expiresAt: { gt: now },
          },
          orderBy: { expiresAt: "desc" },
        }),
        getCreditBalance(userId),
        getCreditHistory(userId, { limit: 10 }),
      ]);

    const userPlan = user?.plan ?? "starter";

    // Build active passes with daysLeft
    const passesWithDaysLeft = activePasses.map((pass) => ({
      tier: pass.tier,
      expiresAt: pass.expiresAt.toISOString(),
      daysLeft: Math.ceil(
        (pass.expiresAt.getTime() - now.getTime()) / 86_400_000,
      ),
      startsAt: pass.startsAt.toISOString(),
    }));

    // Determine effective plan: highest of subscription plan vs pass equivalents
    let highestRank = PLAN_RANK[userPlan] ?? 0;

    // Map pass tier IDs to their equivalent plan names
    const TIER_TO_PLAN: Record<string, string> = {
      basic: "pro",
      growth: "growth",
      full: "enterprise",
    };

    for (const pass of activePasses) {
      const equivalentPlan = TIER_TO_PLAN[pass.tier] ?? "starter";
      const rank = PLAN_RANK[equivalentPlan] ?? 0;
      if (rank > highestRank) {
        highestRank = rank;
      }
    }

    const effectivePlan = planFromRank(highestRank);

    return NextResponse.json({
      subscription: {
        plan: userPlan,
        active: userPlan !== "starter",
      },
      activePasses: passesWithDaysLeft,
      creditBalance,
      effectivePlan,
      recentCredits,
    });
  } catch (e) {
    console.error("PAYG status error:", e);
    return NextResponse.json(
      { error: "Failed to fetch PAYG status" },
      { status: 500 },
    );
  }
}
