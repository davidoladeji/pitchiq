import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 30 requests per minute per user
    const rl = rateLimit(`dashboard-analytics:${userId}`, {
      maxRequests: 30,
      windowMs: 60_000,
    });
    if (!rl.success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    // Get all user decks with their views
    const decks = await prisma.deck.findMany({
      where: { userId },
      select: {
        id: true,
        shareId: true,
        title: true,
        views: {
          select: {
            id: true,
            viewerIp: true,
            totalTime: true,
            createdAt: true,
          },
        },
      },
    });

    // Flatten all views across all decks
    const allViews = decks.flatMap((d) =>
      d.views.map((v) => ({ ...v, deckId: d.id, deckTitle: d.title, deckShareId: d.shareId }))
    );

    // Total views
    const totalViews = allViews.length;

    // Unique viewers by IP
    const uniqueIps = new Set(allViews.map((v) => v.viewerIp).filter(Boolean));
    const uniqueViewers = uniqueIps.size;

    // Average engagement time
    const totalTime = allViews.reduce((sum, v) => sum + v.totalTime, 0);
    const avgEngagementTime = totalViews > 0 ? Math.round(totalTime / totalViews) : 0;

    // Daily views for last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const dailyMap = new Map<string, number>();
    // Pre-fill all 30 days with 0
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().slice(0, 10);
      dailyMap.set(key, 0);
    }

    for (const v of allViews) {
      if (v.createdAt >= thirtyDaysAgo) {
        const key = v.createdAt.toISOString().slice(0, 10);
        dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
      }
    }

    const dailyViews = Array.from(dailyMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));

    // Top decks by view count
    const topDecks = decks
      .map((d) => ({
        shareId: d.shareId,
        title: d.title,
        views: d.views.length,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    return NextResponse.json({
      dailyViews,
      totalViews,
      uniqueViewers,
      avgEngagementTime,
      topDecks,
    });
  } catch (error) {
    console.error("Dashboard analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
