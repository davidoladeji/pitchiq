import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const practiceSession = await prisma.pitchPracticeSession.findUnique({
      where: { id: params.id },
      include: {
        deck: {
          select: {
            id: true,
            shareId: true,
            title: true,
            companyName: true,
            slides: true,
            themeId: true,
          },
        },
      },
    });

    if (!practiceSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (practiceSession.userId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({
      id: practiceSession.id,
      deckId: practiceSession.deckId,
      deck: {
        id: practiceSession.deck.id,
        shareId: practiceSession.deck.shareId,
        title: practiceSession.deck.title,
        companyName: practiceSession.deck.companyName,
        slides: JSON.parse(practiceSession.deck.slides),
        themeId: practiceSession.deck.themeId,
      },
      duration: practiceSession.duration,
      slideTimings: practiceSession.slideTimings,
      aiFeedback: practiceSession.aiFeedback,
      status: practiceSession.status,
      createdAt: practiceSession.createdAt.toISOString(),
    });
  } catch (error) {
    console.error("Practice GET [id] error:", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const practiceSession = await prisma.pitchPracticeSession.findUnique({
      where: { id: params.id },
      select: { userId: true },
    });

    if (!practiceSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (practiceSession.userId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (body.slideTimings !== undefined) {
      updateData.slideTimings = JSON.stringify(body.slideTimings);
    }
    if (body.duration !== undefined) {
      updateData.duration = Math.max(0, Math.round(body.duration));
    }
    if (body.status !== undefined) {
      const validStatuses = ["in_progress", "completed", "abandoned"];
      if (validStatuses.includes(body.status)) {
        updateData.status = body.status;
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.pitchPracticeSession.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({
      id: updated.id,
      duration: updated.duration,
      status: updated.status,
    });
  } catch (error) {
    console.error("Practice PATCH [id] error:", error);
    return NextResponse.json({ error: "Failed to update session" }, { status: 500 });
  }
}
