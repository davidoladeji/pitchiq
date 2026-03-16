import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-limits";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const sessions = await prisma.pitchPracticeSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        deck: {
          select: { id: true, shareId: true, title: true, companyName: true },
        },
      },
    });

    const formatted = sessions.map((s) => ({
      id: s.id,
      deckId: s.deckId,
      deckTitle: s.deck.title,
      deckShareId: s.deck.shareId,
      companyName: s.deck.companyName,
      duration: s.duration,
      status: s.status,
      aiFeedback: s.aiFeedback,
      createdAt: s.createdAt.toISOString(),
    }));

    return NextResponse.json({ sessions: formatted });
  } catch (error) {
    console.error("Practice GET error:", error);
    return NextResponse.json({ error: "Failed to fetch practice sessions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    // Check plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    const plan = user?.plan || "starter";
    const limits = getPlanLimits(plan);

    if (!limits.pitchPractice) {
      return NextResponse.json(
        { error: "Pitch Practice requires a Growth or Enterprise plan.", code: "PLAN_LIMIT" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { deckId, targetDuration } = body;

    if (!deckId) {
      return NextResponse.json({ error: "deckId is required" }, { status: 400 });
    }

    // Verify deck ownership
    const deck = await prisma.deck.findUnique({
      where: { id: deckId },
      select: { id: true, userId: true },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    if (deck.userId !== userId) {
      return NextResponse.json({ error: "You do not own this deck" }, { status: 403 });
    }

    const practiceSession = await prisma.pitchPracticeSession.create({
      data: {
        userId,
        deckId,
        duration: 0,
        slideTimings: "[]",
        aiFeedback: JSON.stringify({ targetDuration: targetDuration || 300 }),
        status: "in_progress",
      },
    });

    return NextResponse.json({ id: practiceSession.id });
  } catch (error) {
    console.error("Practice POST error:", error);
    return NextResponse.json({ error: "Failed to create practice session" }, { status: 500 });
  }
}
