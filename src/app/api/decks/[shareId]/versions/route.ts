import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-limits";

/**
 * GET /api/decks/[shareId]/versions — List version history for a deck.
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

    const deck = await prisma.deck.findUnique({
      where: { shareId: params.shareId },
      select: { id: true, userId: true },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    if (deck.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Determine version limit from plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    const limits = getPlanLimits(user?.plan || "starter");

    const versions = await prisma.deckVersion.findMany({
      where: { deckId: deck.id },
      orderBy: { version: "desc" },
      take:
        limits.maxVersionHistory === Infinity
          ? undefined
          : limits.maxVersionHistory,
    });

    return NextResponse.json({
      versions: versions.map((v) => {
        let slideCount = 0;
        try {
          const parsed = JSON.parse(v.slides);
          slideCount = Array.isArray(parsed) ? parsed.length : 0;
        } catch {
          // leave as 0
        }

        // Extract overall PIQ score from version snapshot
        let piqScoreOverall: number | null = null;
        try {
          const piq = JSON.parse(v.piqScore);
          if (piq && typeof piq.overall === "number") {
            piqScoreOverall = piq.overall;
          }
        } catch {
          // leave as null
        }

        return {
          id: v.id,
          version: v.version,
          slideCount,
          piqScore: piqScoreOverall,
          changeNote: v.changeNote,
          createdAt: v.createdAt.toISOString(),
        };
      }),
    });
  } catch (err) {
    console.error("[versions] List error:", err);
    return NextResponse.json(
      { error: "Failed to fetch versions" },
      { status: 500 }
    );
  }
}
