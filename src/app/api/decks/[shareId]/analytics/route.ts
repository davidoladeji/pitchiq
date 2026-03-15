import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const deck = await prisma.deck.findUnique({
      where: { shareId: params.shareId },
      include: { views: true },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId || userId !== deck.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Premium gate — return limited data for free tier
    if (!deck.isPremium) {
      return NextResponse.json({
        totalViews: deck.views.length,
        isPremium: false,
        message: "Upgrade to Pro to see detailed analytics",
      });
    }

    const uniqueIps = new Set(deck.views.map((v) => v.viewerIp));
    const totalTime = deck.views.reduce((sum, v) => sum + v.totalTime, 0);

    return NextResponse.json({
      totalViews: deck.views.length,
      uniqueViewers: uniqueIps.size,
      avgTimeSpent: deck.views.length ? Math.round(totalTime / deck.views.length) : 0,
      isPremium: true,
      recentViews: deck.views
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 20)
        .map((v) => ({
          id: v.id,
          totalTime: v.totalTime,
          createdAt: v.createdAt.toISOString(),
        })),
    });
  } catch (error) {
    console.error("Analytics error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(
  req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const { viewId, slideViews, totalTime } = await req.json();

    if (!viewId) {
      return NextResponse.json({ error: "viewId required" }, { status: 400 });
    }

    const deck = await prisma.deck.findUnique({
      where: { shareId: params.shareId },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId || userId !== deck.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.view.update({
      where: { id: viewId, deckId: deck.id },
      data: {
        slideViews: JSON.stringify(slideViews || []),
        totalTime: totalTime || 0,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics update error:", error);
    return NextResponse.json(
      { error: "Failed to update analytics" },
      { status: 500 }
    );
  }
}
