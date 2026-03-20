import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [
    totalEvents,
    actionBreakdown,
    avgScore,
    topInvestors,
    dailyEvents,
  ] = await Promise.all([
    prisma.matchEvent.count(),
    prisma.matchEvent.groupBy({
      by: ["action"],
      _count: { id: true },
    }),
    prisma.matchEvent.aggregate({
      _avg: { fitScore: true },
      _min: { fitScore: true },
      _max: { fitScore: true },
    }),
    prisma.matchEvent.groupBy({
      by: ["investorProfileId"],
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
      take: 10,
    }),
    // Events in last 30 days by day
    prisma.$queryRaw`
      SELECT DATE(\"createdAt\") as date, COUNT(*)::int as count
      FROM "MatchEvent"
      WHERE "createdAt" > NOW() - INTERVAL '30 days'
      GROUP BY DATE("createdAt")
      ORDER BY date DESC
    ` as Promise<Array<{ date: string; count: number }>>,
  ]);

  return NextResponse.json({
    totalEvents,
    actions: Object.fromEntries(actionBreakdown.map((a) => [a.action, a._count.id])),
    scores: {
      avg: avgScore._avg.fitScore,
      min: avgScore._min.fitScore,
      max: avgScore._max.fitScore,
    },
    topInvestors,
    dailyEvents,
  });
}
