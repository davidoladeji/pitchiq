import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-limits";
import { sendEmail } from "@/lib/email";
import { highEngagementAlert } from "@/lib/email-templates";

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

/**
 * POST /api/decks/[shareId]/analytics
 * Update view engagement data. Auth: viewId serves as an unguessable token
 * (UUID created when the view was recorded). No session auth required — this
 * is called from the viewer's browser as they engage with the deck.
 */
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
      select: { id: true, title: true, shareId: true, userId: true },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    // Validate the viewId belongs to this deck (viewId is an unguessable UUID)
    const view = await prisma.view.findFirst({
      where: { id: viewId, deckId: deck.id },
    });

    if (!view) {
      return NextResponse.json({ error: "Invalid viewId" }, { status: 403 });
    }

    await prisma.view.update({
      where: { id: viewId },
      data: {
        slideViews: JSON.stringify(slideViews || []),
        totalTime: totalTime || 0,
      },
    });

    // === Follow-up alert for high engagement (>5 min) ===
    if (totalTime && totalTime > 300 && deck.userId) {
      // Fire and forget — don't block the response
      triggerHighEngagementAlert(deck.id, deck.title, deck.shareId, deck.userId, viewId).catch(
        (err) => console.error("[alert] Failed:", err)
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Analytics update error:", error);
    return NextResponse.json(
      { error: "Failed to update analytics" },
      { status: 500 }
    );
  }
}

/**
 * Check if we should send a high engagement alert and send it.
 */
async function triggerHighEngagementAlert(
  deckId: string,
  deckTitle: string,
  deckShareId: string,
  ownerId: string,
  viewId: string
) {
  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
    select: { plan: true, email: true },
  });

  if (!owner?.email) return;

  const limits = getPlanLimits(owner.plan);
  if (!limits.followUpAlerts) return;

  // Check if alert already exists for this view
  const existing = await prisma.deckAlert.findFirst({
    where: { deckId, viewId, type: "high_engagement" },
  });

  if (existing) return;

  // Create alert record
  await prisma.deckAlert.create({
    data: {
      deckId,
      type: "high_engagement",
      viewId,
    },
  });

  // Send email
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://www.usepitchiq.com");
  const view = await prisma.view.findUnique({
    where: { id: viewId },
    select: { totalTime: true },
  });

  await sendEmail({
    to: owner.email,
    subject: `High engagement on "${deckTitle}"`,
    html: highEngagementAlert({
      deckTitle,
      totalTimeSeconds: view?.totalTime || 300,
      deckShareId,
      appUrl,
    }),
  });
}
