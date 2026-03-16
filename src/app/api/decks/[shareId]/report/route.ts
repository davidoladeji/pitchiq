import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-limits";

/**
 * GET /api/decks/[shareId]/report — comprehensive analytics data for PDF report
 * Growth+ only
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
    const limits = getPlanLimits(user?.plan ?? "starter");
    if (!limits.analytics) {
      return NextResponse.json({ error: "Upgrade to Growth to download reports" }, { status: 403 });
    }

    const deck = await prisma.deck.findUnique({
      where: { shareId: params.shareId },
      include: { views: true },
    });

    if (!deck || deck.userId !== userId) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const views = deck.views;
    const totalViews = views.length;
    const uniqueIps = new Set(views.map((v) => v.viewerIp));
    const totalTime = views.reduce((sum, v) => sum + v.totalTime, 0);
    const avgTime = totalViews ? Math.round(totalTime / totalViews) : 0;

    // Views by day (last 30 days)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dailyViews: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dailyViews[d.toISOString().slice(0, 10)] = 0;
    }
    views
      .filter((v) => v.createdAt >= thirtyDaysAgo)
      .forEach((v) => {
        const day = v.createdAt.toISOString().slice(0, 10);
        if (dailyViews[day] !== undefined) dailyViews[day]++;
      });

    // Slide-level engagement
    const slideEngagement: Record<number, { views: number; totalTime: number }> = {};
    views.forEach((v) => {
      try {
        const sv = JSON.parse(v.slideViews) as { slideIndex: number; timeSpent: number }[];
        sv.forEach((s) => {
          if (!slideEngagement[s.slideIndex]) {
            slideEngagement[s.slideIndex] = { views: 0, totalTime: 0 };
          }
          slideEngagement[s.slideIndex].views++;
          slideEngagement[s.slideIndex].totalTime += s.timeSpent;
        });
      } catch { /* ignore */ }
    });

    // Engagement buckets
    const highEngagement = views.filter((v) => v.totalTime > 300).length;
    const medEngagement = views.filter((v) => v.totalTime > 60 && v.totalTime <= 300).length;
    const lowEngagement = views.filter((v) => v.totalTime <= 60).length;

    // Bounce rate (viewed < 10 seconds)
    const bounces = views.filter((v) => v.totalTime < 10).length;
    const bounceRate = totalViews ? Math.round((bounces / totalViews) * 100) : 0;

    // PIQ Score
    let piqScore = null;
    try {
      const parsed = JSON.parse(deck.piqScore);
      if (parsed.overall) piqScore = parsed;
    } catch { /* ignore */ }

    // Parse slides for titles
    let slideTitles: string[] = [];
    try {
      const slides = JSON.parse(deck.slides);
      slideTitles = slides.map((s: { title?: string }, i: number) => s.title || `Slide ${i + 1}`);
    } catch { /* ignore */ }

    return NextResponse.json({
      deck: {
        title: deck.title,
        companyName: deck.companyName,
        shareId: deck.shareId,
        createdAt: deck.createdAt.toISOString(),
      },
      summary: {
        totalViews,
        uniqueViewers: uniqueIps.size,
        avgTimeSpent: avgTime,
        totalTimeSpent: totalTime,
        bounceRate,
        highEngagement,
        medEngagement,
        lowEngagement,
      },
      dailyViews: Object.entries(dailyViews)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
      slideEngagement: Object.entries(slideEngagement)
        .map(([idx, data]) => ({
          slideIndex: parseInt(idx),
          title: slideTitles[parseInt(idx)] || `Slide ${parseInt(idx) + 1}`,
          views: data.views,
          avgTime: data.views ? Math.round(data.totalTime / data.views) : 0,
        }))
        .sort((a, b) => a.slideIndex - b.slideIndex),
      piqScore,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[report] Error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
