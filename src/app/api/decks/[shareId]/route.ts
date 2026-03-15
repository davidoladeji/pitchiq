import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const deck = await prisma.deck.findUnique({
      where: { shareId: params.shareId },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    // Record view
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "";

    await prisma.view.create({
      data: {
        deckId: deck.id,
        viewerIp: ip,
        userAgent,
      },
    });

    let piqScore;
    try {
      piqScore = JSON.parse(deck.piqScore);
      if (!piqScore.overall) piqScore = undefined;
    } catch {
      piqScore = undefined;
    }

    return NextResponse.json({
      id: deck.id,
      shareId: deck.shareId,
      title: deck.title,
      companyName: deck.companyName,
      slides: JSON.parse(deck.slides),
      createdAt: deck.createdAt.toISOString(),
      isPremium: deck.isPremium,
      themeId: deck.themeId,
      piqScore,
    });
  } catch (error) {
    console.error("Deck fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deck" },
      { status: 500 }
    );
  }
}
