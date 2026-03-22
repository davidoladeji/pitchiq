import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { checkAccess } from "@/lib/credit-gate";
import { nanoid } from "nanoid";

/**
 * POST /api/ab-test
 * Create a new A/B test between two decks (Growth+ only).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const gate = await checkAccess(userId, "ab_test", { description: "Create A/B test" });
    if (!gate.allowed) {
      return NextResponse.json({ error: gate.error || "A/B testing requires Growth plan, a pass, or credits.", upgradeOptions: gate.upgradeOptions }, { status: 403 });
    }

    const { deckAShareId, deckBShareId } = (await req.json()) as {
      deckAShareId: string;
      deckBShareId: string;
    };

    if (!deckAShareId || !deckBShareId) {
      return NextResponse.json({ error: "Both deckAShareId and deckBShareId required" }, { status: 400 });
    }

    if (deckAShareId === deckBShareId) {
      return NextResponse.json({ error: "Decks must be different" }, { status: 400 });
    }

    // Verify both decks belong to the user
    const [deckA, deckB] = await Promise.all([
      prisma.deck.findUnique({ where: { shareId: deckAShareId }, select: { id: true, userId: true, title: true } }),
      prisma.deck.findUnique({ where: { shareId: deckBShareId }, select: { id: true, userId: true, title: true } }),
    ]);

    if (!deckA || !deckB) {
      return NextResponse.json({ error: "One or both decks not found" }, { status: 404 });
    }

    if (deckA.userId !== userId || deckB.userId !== userId) {
      return NextResponse.json({ error: "Both decks must belong to you" }, { status: 403 });
    }

    const shareSlug = nanoid(8);

    const test = await prisma.aBTest.create({
      data: {
        shareSlug,
        deckAId: deckA.id,
        deckBId: deckB.id,
        userId,
      },
    });

    return NextResponse.json({
      id: test.id,
      shareSlug: test.shareSlug,
      deckAId: deckA.id,
      deckBId: deckB.id,
      deckATitle: deckA.title,
      deckBTitle: deckB.title,
    });
  } catch (err) {
    console.error("[ab-test] Create error:", err);
    return NextResponse.json({ error: "Failed to create A/B test" }, { status: 500 });
  }
}

/**
 * GET /api/ab-test
 * List all A/B tests for the authenticated user.
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const tests = await prisma.aBTest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Get view counts for each deck
    const deckIds = Array.from(new Set(tests.flatMap((t) => [t.deckAId, t.deckBId])));
    const viewCounts = await prisma.view.groupBy({
      by: ["deckId"],
      where: { deckId: { in: deckIds } },
      _count: true,
    });
    const viewMap = Object.fromEntries(viewCounts.map((v) => [v.deckId, v._count]));

    // Get deck titles
    const decks = await prisma.deck.findMany({
      where: { id: { in: deckIds } },
      select: { id: true, shareId: true, title: true },
    });
    const deckMap = Object.fromEntries(decks.map((d) => [d.id, d]));

    const serialized = tests.map((t) => ({
      id: t.id,
      shareSlug: t.shareSlug,
      deckA: {
        id: t.deckAId,
        shareId: deckMap[t.deckAId]?.shareId,
        title: deckMap[t.deckAId]?.title || "Unknown",
        views: viewMap[t.deckAId] || 0,
      },
      deckB: {
        id: t.deckBId,
        shareId: deckMap[t.deckBId]?.shareId,
        title: deckMap[t.deckBId]?.title || "Unknown",
        views: viewMap[t.deckBId] || 0,
      },
      createdAt: t.createdAt.toISOString(),
    }));

    return NextResponse.json({ tests: serialized });
  } catch (err) {
    console.error("[ab-test] List error:", err);
    return NextResponse.json({ error: "Failed to list A/B tests" }, { status: 500 });
  }
}
