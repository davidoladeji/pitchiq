import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { SlideData } from "@/lib/types";

export async function PUT(
  req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const deck = await prisma.deck.findUnique({
      where: { shareId: params.shareId },
      select: { id: true, userId: true, slides: true },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    if (deck.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { slides, themeId, title } = body as {
      slides: SlideData[];
      themeId?: string;
      title?: string;
    };

    if (!Array.isArray(slides)) {
      return NextResponse.json(
        { error: "slides must be an array" },
        { status: 400 }
      );
    }

    // Build update payload
    const updateData: Record<string, unknown> = {
      slides: JSON.stringify(slides),
    };
    if (themeId) updateData.themeId = themeId;
    if (title) updateData.title = title;

    // Create a version snapshot before saving
    try {
      const versionCount = await prisma.deckVersion.count({
        where: { deckId: deck.id },
      });
      await prisma.deckVersion.create({
        data: {
          deckId: deck.id,
          version: versionCount + 1,
          slides: deck.slides, // snapshot of previous state
          changeNote: "Editor save",
        },
      });
    } catch {
      // Version creation is non-critical — don't block save
    }

    const updated = await prisma.deck.update({
      where: { shareId: params.shareId },
      data: updateData,
    });

    return NextResponse.json({
      shareId: updated.shareId,
      title: updated.title,
      themeId: updated.themeId,
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Save slides error:", error);
    return NextResponse.json(
      { error: "Failed to save slides" },
      { status: 500 }
    );
  }
}
