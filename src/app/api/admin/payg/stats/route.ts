/**
 * Admin PAYG stats API.
 * GET — returns PAYG revenue and usage statistics.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      passCount,
      passRevenue,
      activePassesByTier,
      creditPurchaseRevenue,
      creditsSold,
      creditsConsumed,
      creditsByAction,
      usersWithCredits,
    ] = await Promise.all([
      // 1. Total passes count
      prisma.periodPass.count(),

      // 2. Total pass revenue (sum amountCents)
      prisma.periodPass.aggregate({
        _sum: { amountCents: true },
      }),

      // 3. Active passes grouped by tier
      prisma.periodPass.groupBy({
        by: ["tier"],
        where: { status: "active" },
        _count: true,
      }),

      // 4. Total credit purchase revenue (sum amountCents where type = purchase)
      prisma.creditTransaction.aggregate({
        _sum: { amountCents: true },
        where: { type: "purchase" },
      }),

      // 5. Total credits sold (sum amount where type = purchase)
      prisma.creditTransaction.aggregate({
        _sum: { amount: true },
        where: { type: "purchase" },
      }),

      // 6. Total credits consumed (sum negative amounts where type = usage)
      prisma.creditTransaction.aggregate({
        _sum: { amount: true },
        where: { type: "usage" },
      }),

      // 7. Credits by action (group by action, sum abs(amount))
      prisma.creditTransaction.groupBy({
        by: ["action"],
        where: { type: "usage", action: { not: null } },
        _sum: { amount: true },
        _count: true,
      }),

      // 8. Users with credits (count of CreditBalance where balance > 0)
      prisma.creditBalance.count({
        where: { balance: { gt: 0 } },
      }),
    ]);

    return NextResponse.json({
      passCount,
      passRevenueCents: passRevenue._sum.amountCents ?? 0,
      activePassesByTier: activePassesByTier.map((g) => ({
        tier: g.tier,
        count: g._count,
      })),
      creditPurchaseRevenueCents: creditPurchaseRevenue._sum.amountCents ?? 0,
      creditsSold: creditsSold._sum.amount ?? 0,
      creditsConsumed: Math.abs(creditsConsumed._sum.amount ?? 0),
      creditsByAction: creditsByAction.map((g) => ({
        action: g.action,
        totalUsed: Math.abs(g._sum.amount ?? 0),
        count: g._count,
      })),
      usersWithCredits,
    });
  } catch (err) {
    console.error("[admin/payg/stats] Error:", err);
    return NextResponse.json(
      { error: "Failed to load stats" },
      { status: 500 },
    );
  }
}
