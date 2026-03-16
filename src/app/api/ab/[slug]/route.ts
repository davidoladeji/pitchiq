import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/ab/[slug]
 * Public endpoint — randomly redirects to deck A or deck B.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const test = await prisma.aBTest.findUnique({
      where: { shareSlug: params.slug },
    });

    if (!test) {
      return NextResponse.json({ error: "A/B test not found" }, { status: 404 });
    }

    // Random 50/50 split
    const chosenDeckId = Math.random() < 0.5 ? test.deckAId : test.deckBId;

    const deck = await prisma.deck.findUnique({
      where: { id: chosenDeckId },
      select: { shareId: true },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    return NextResponse.redirect(`${base}/deck/${deck.shareId}`);
  } catch (err) {
    console.error("[ab-redirect] Error:", err);
    return NextResponse.json({ error: "Failed to redirect" }, { status: 500 });
  }
}
