import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { generatePracticeFeedback, SlideTiming } from "@/lib/practice-feedback";
import { SlideData } from "@/lib/types";

export const maxDuration = 60;

export async function POST(
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
      include: {
        deck: {
          select: { slides: true },
        },
      },
    });

    if (!practiceSession) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (practiceSession.userId !== userId) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await req.json();
    const { slideTimings, totalDuration, targetDuration } = body as {
      slideTimings: SlideTiming[];
      totalDuration: number;
      targetDuration: number;
    };

    if (!slideTimings || !totalDuration || !targetDuration) {
      return NextResponse.json(
        { error: "slideTimings, totalDuration, and targetDuration are required" },
        { status: 400 }
      );
    }

    let slides: SlideData[];
    try {
      slides = JSON.parse(practiceSession.deck.slides);
    } catch {
      return NextResponse.json({ error: "Failed to parse deck slides" }, { status: 500 });
    }

    const feedback = await generatePracticeFeedback({
      slides,
      slideTimings,
      targetDuration,
      totalDuration,
    });

    // Save feedback and mark session as completed
    await prisma.pitchPracticeSession.update({
      where: { id: params.id },
      data: {
        aiFeedback: JSON.stringify(feedback),
        slideTimings: JSON.stringify(slideTimings),
        duration: Math.max(0, Math.round(totalDuration)),
        status: "completed",
      },
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Practice feedback error:", error);
    return NextResponse.json(
      { error: "Failed to generate practice feedback" },
      { status: 500 }
    );
  }
}
