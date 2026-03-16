import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

/**
 * GET /api/ab/[slug]
 * Public endpoint — redirects to deck A or deck B.
 * Uses a cookie to keep the same visitor on the same variant (sticky assignment).
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

    // Cookie name unique to this A/B test
    const cookieName = `ab_${params.slug}`;
    const existingVariant = req.cookies.get(cookieName)?.value;

    let chosenDeckId: string;

    if (existingVariant === "A") {
      chosenDeckId = test.deckAId;
    } else if (existingVariant === "B") {
      chosenDeckId = test.deckBId;
    } else {
      // First visit — random 50/50 split
      const isA = Math.random() < 0.5;
      chosenDeckId = isA ? test.deckAId : test.deckBId;

      const deck = await prisma.deck.findUnique({
        where: { id: chosenDeckId },
        select: { shareId: true },
      });

      if (!deck) {
        return NextResponse.json({ error: "Deck not found" }, { status: 404 });
      }

      const url = new URL(`/deck/${deck.shareId}`, req.url);
      const response = NextResponse.redirect(url.toString());
      // Set cookie for 30 days so return visitors see the same variant
      response.cookies.set(cookieName, isA ? "A" : "B", {
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
      return response;
    }

    const deck = await prisma.deck.findUnique({
      where: { id: chosenDeckId },
      select: { shareId: true },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const url = new URL(`/deck/${deck.shareId}`, req.url);
    return NextResponse.redirect(url.toString());
  } catch (err) {
    console.error("[ab-redirect] Error:", err);
    return NextResponse.json({ error: "Failed to redirect" }, { status: 500 });
  }
}
