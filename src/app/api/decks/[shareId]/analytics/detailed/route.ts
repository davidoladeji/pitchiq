import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-limits";

interface SlideViewEntry {
  slideIndex: number;
  time: number;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deck = await prisma.deck.findUnique({
      where: { shareId: params.shareId },
      include: {
        views: true,
        owner: { select: { plan: true } },
      },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    if (userId !== deck.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Plan gate
    const limits = getPlanLimits(deck.owner?.plan ?? "starter");
    if (!limits.analytics) {
      return NextResponse.json(
        {
          error: "Analytics requires a Growth or Enterprise plan",
          requiresUpgrade: true,
        },
        { status: 403 }
      );
    }

    const views = deck.views;
    const totalViews = views.length;
    const uniqueIps = new Set(views.map((v) => v.viewerIp));
    const uniqueViewers = uniqueIps.size;

    // Average time spent (seconds)
    const totalTimeSum = views.reduce((sum, v) => sum + v.totalTime, 0);
    const avgTimeSpent = totalViews > 0 ? Math.round(totalTimeSum / totalViews) : 0;

    // Parse all slideViews
    const parsedSlideViews: { viewIndex: number; slides: SlideViewEntry[] }[] =
      [];
    for (let i = 0; i < views.length; i++) {
      const raw = views[i].slideViews;
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw) as SlideViewEntry[];
        if (Array.isArray(parsed)) {
          parsedSlideViews.push({ viewIndex: i, slides: parsed });
        }
      } catch {
        // skip malformed entries
      }
    }

    // Completion rate: a view is "complete" if every slide index from 0..max was viewed
    let completedCount = 0;
    for (const pv of parsedSlideViews) {
      if (pv.slides.length === 0) continue;
      const maxIdx = Math.max(...pv.slides.map((s) => s.slideIndex));
      const viewedIndices = new Set(pv.slides.map((s) => s.slideIndex));
      let allViewed = true;
      for (let idx = 0; idx <= maxIdx; idx++) {
        if (!viewedIndices.has(idx)) {
          allViewed = false;
          break;
        }
      }
      if (allViewed) completedCount++;
    }
    const completionRate =
      totalViews > 0 ? Math.round((completedCount / totalViews) * 100) : 0;

    // Daily views for last 30 days
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const dailyMap: Record<string, number> = {};
    for (let d = 0; d < 30; d++) {
      const date = new Date(thirtyDaysAgo.getTime() + d * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split("T")[0];
      dailyMap[key] = 0;
    }
    for (const v of views) {
      const key = v.createdAt.toISOString().split("T")[0];
      if (key in dailyMap) {
        dailyMap[key]++;
      }
    }
    const dailyViews = Object.entries(dailyMap).map(([date, count]) => ({
      date,
      count,
    }));

    // Slide engagement aggregation
    const slideAggMap: Record<
      number,
      { totalTime: number; viewCount: number; viewersWithSlide: number }
    > = {};
    for (const pv of parsedSlideViews) {
      const seenInThisView = new Set<number>();
      for (const s of pv.slides) {
        if (!slideAggMap[s.slideIndex]) {
          slideAggMap[s.slideIndex] = {
            totalTime: 0,
            viewCount: 0,
            viewersWithSlide: 0,
          };
        }
        slideAggMap[s.slideIndex].totalTime += s.time;
        slideAggMap[s.slideIndex].viewCount++;
        if (!seenInThisView.has(s.slideIndex)) {
          slideAggMap[s.slideIndex].viewersWithSlide++;
          seenInThisView.add(s.slideIndex);
        }
      }
    }

    const slideEngagement = Object.entries(slideAggMap)
      .map(([idx, agg]) => ({
        slideIndex: Number(idx),
        avgTime:
          agg.viewersWithSlide > 0
            ? Math.round(agg.totalTime / agg.viewersWithSlide)
            : 0,
        views: agg.viewersWithSlide,
        revisits: agg.viewCount - agg.viewersWithSlide,
      }))
      .sort((a, b) => a.slideIndex - b.slideIndex);

    // Recent views
    const recentViews = views
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 20)
      .map((v) => {
        const slideData = v.slideViews ? JSON.parse(v.slideViews) : [];
        return {
          id: v.id,
          totalTime: v.totalTime,
          createdAt: v.createdAt.toISOString(),
          slideCount: Array.isArray(slideData) ? slideData.length : 0,
        };
      });

    return NextResponse.json({
      totalViews,
      uniqueViewers,
      avgTimeSpent,
      completionRate,
      dailyViews,
      slideEngagement,
      recentViews,
    });
  } catch (error) {
    console.error("Detailed analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch detailed analytics" },
      { status: 500 }
    );
  }
}
