import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-limits";
import crypto from "crypto";

export const dynamic = "force-dynamic";

/**
 * GET /api/dashboard/investors
 * Aggregate viewer engagement data grouped by hashed IP.
 * Growth+ only.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });

    const limits = getPlanLimits(user?.plan || "starter");
    if (!limits.investorVariants) {
      // Use investorVariants as proxy for Growth+ features
      return NextResponse.json({ error: "Upgrade to Growth for Investor CRM" }, { status: 403 });
    }

    // Get all views for user's decks
    const views = await prisma.view.findMany({
      where: {
        deck: { userId },
      },
      select: {
        id: true,
        viewerIp: true,
        totalTime: true,
        createdAt: true,
        deck: {
          select: { shareId: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 1000,
    });

    // Group by hashed IP
    const viewerMap = new Map<
      string,
      {
        viewerId: string;
        decksViewed: Map<string, { shareId: string; title: string; views: number; totalTime: number }>;
        totalViews: number;
        totalTime: number;
        lastSeen: Date;
      }
    >();

    for (const view of views) {
      const hash = crypto.createHash("sha256").update(view.viewerIp + userId).digest("hex").slice(0, 12);

      if (!viewerMap.has(hash)) {
        viewerMap.set(hash, {
          viewerId: hash,
          decksViewed: new Map(),
          totalViews: 0,
          totalTime: 0,
          lastSeen: view.createdAt,
        });
      }

      const viewer = viewerMap.get(hash)!;
      viewer.totalViews++;
      viewer.totalTime += view.totalTime;
      if (view.createdAt > viewer.lastSeen) {
        viewer.lastSeen = view.createdAt;
      }

      const deckKey = view.deck.shareId;
      if (!viewer.decksViewed.has(deckKey)) {
        viewer.decksViewed.set(deckKey, {
          shareId: view.deck.shareId,
          title: view.deck.title,
          views: 0,
          totalTime: 0,
        });
      }
      const deckEntry = viewer.decksViewed.get(deckKey)!;
      deckEntry.views++;
      deckEntry.totalTime += view.totalTime;
    }

    // Convert to array and sort by engagement
    const investors = Array.from(viewerMap.values())
      .map((v) => ({
        viewerId: v.viewerId,
        totalViews: v.totalViews,
        totalTime: v.totalTime,
        lastSeen: v.lastSeen.toISOString(),
        decksViewed: Array.from(v.decksViewed.values()),
      }))
      .sort((a, b) => b.totalTime - a.totalTime)
      .slice(0, 100);

    return NextResponse.json({ investors });
  } catch (err) {
    console.error("[investor-crm] Error:", err);
    return NextResponse.json({ error: "Failed to fetch investor data" }, { status: 500 });
  }
}
