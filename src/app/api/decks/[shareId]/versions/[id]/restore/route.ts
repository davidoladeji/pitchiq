import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";

/**
 * POST /api/decks/[shareId]/versions/[id]/restore — Restore a previous version.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: { shareId: string; id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const deck = await prisma.deck.findUnique({
      where: { shareId: params.shareId },
      select: { id: true, userId: true, slides: true },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    if (deck.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Find the version to restore
    const version = await prisma.deckVersion.findFirst({
      where: { id: params.id, deckId: deck.id },
    });

    if (!version) {
      return NextResponse.json(
        { error: "Version not found" },
        { status: 404 }
      );
    }

    // Snapshot current state before overwriting
    const versionCount = await prisma.deckVersion.count({
      where: { deckId: deck.id },
    });

    await prisma.deckVersion.create({
      data: {
        deckId: deck.id,
        version: versionCount + 1,
        slides: deck.slides,
        changeNote: `Before restore to v${version.version}`,
      },
    });

    // Restore the deck slides
    await prisma.deck.update({
      where: { id: deck.id },
      data: { slides: version.slides },
    });

    let slides: unknown[] = [];
    try {
      slides = JSON.parse(version.slides);
    } catch {
      // leave as empty
    }

    return NextResponse.json({ success: true, slides });
  } catch (err) {
    console.error("[version-restore] Error:", err);
    return NextResponse.json(
      { error: "Failed to restore version" },
      { status: 500 }
    );
  }
}
