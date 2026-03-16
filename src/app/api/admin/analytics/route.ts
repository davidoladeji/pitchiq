import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/analytics
 * System-wide analytics for the admin dashboard.
 */
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const prevThirtyDays = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalDecks,
      totalViews,
      totalTransactions,
      recentUsers,
      prevPeriodUsers,
      recentDecks,
      prevPeriodDecks,
      recentViews,
      revenue,
      planDistribution,
      recentSignups,
      recentDeckCreations,
      recentTransactions,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.deck.count(),
      prisma.view.count(),
      prisma.transaction.count(),
      // Recent 30 day counts for trends
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: prevThirtyDays, lt: thirtyDaysAgo } } }),
      prisma.deck.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.deck.count({ where: { createdAt: { gte: prevThirtyDays, lt: thirtyDaysAgo } } }),
      prisma.view.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      // Revenue
      prisma.transaction.aggregate({
        _sum: { amountCents: true },
        where: { status: "succeeded" },
      }),
      // Plan distribution
      prisma.user.groupBy({
        by: ["plan"],
        _count: true,
      }),
      // Recent signups for chart (last 30 days, grouped by day)
      prisma.user.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      // Recent deck creations for chart
      prisma.deck.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
      }),
      // Recent transactions for activity feed
      prisma.transaction.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: {
          user: { select: { email: true } },
          deck: { select: { title: true } },
        },
      }),
    ]);

    // Group signups by day
    const signupsByDay = groupByDay(recentSignups.map((u) => u.createdAt), thirtyDaysAgo, now);
    const decksByDay = groupByDay(recentDeckCreations.map((d) => d.createdAt), thirtyDaysAgo, now);

    // Plan distribution map
    const plans: Record<string, number> = {};
    planDistribution.forEach((p) => {
      plans[p.plan] = p._count;
    });

    // Recent activity
    const recentActivity = recentTransactions.map((t) => ({
      id: t.id,
      type: "transaction" as const,
      description: `${t.user?.email || "Unknown"} - ${t.deck?.title || "Unknown deck"}`,
      amount: t.amountCents / 100,
      currency: t.currency,
      status: t.status,
      createdAt: t.createdAt.toISOString(),
    }));

    // Trends (percentage change)
    const userTrend = prevPeriodUsers > 0 ? ((recentUsers - prevPeriodUsers) / prevPeriodUsers) * 100 : recentUsers > 0 ? 100 : 0;
    const deckTrend = prevPeriodDecks > 0 ? ((recentDecks - prevPeriodDecks) / prevPeriodDecks) * 100 : recentDecks > 0 ? 100 : 0;

    return NextResponse.json({
      stats: {
        totalUsers,
        totalDecks,
        totalViews,
        totalTransactions,
        totalRevenue: (revenue._sum.amountCents || 0) / 100,
        recentUsers,
        recentDecks,
        recentViews,
        userTrend: Math.round(userTrend),
        deckTrend: Math.round(deckTrend),
      },
      charts: {
        signupsByDay,
        decksByDay,
      },
      planDistribution: plans,
      recentActivity,
    });
  } catch (err) {
    console.error("[Admin Analytics]", err);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}

function groupByDay(dates: Date[], from: Date, to: Date): { date: string; count: number }[] {
  const map: Record<string, number> = {};

  // Initialize all days to 0
  const cursor = new Date(from);
  while (cursor <= to) {
    const key = cursor.toISOString().slice(0, 10);
    map[key] = 0;
    cursor.setDate(cursor.getDate() + 1);
  }

  // Count occurrences
  dates.forEach((d) => {
    const key = d.toISOString().slice(0, 10);
    if (map[key] !== undefined) {
      map[key]++;
    }
  });

  return Object.entries(map).map(([date, count]) => ({ date, count }));
}
