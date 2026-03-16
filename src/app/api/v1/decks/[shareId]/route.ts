import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateApiKey, requireScope } from "@/lib/api-auth";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(
  req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const auth = await authenticateApiKey(req);
    requireScope(auth.scopes, "decks:read");

    const deck = await prisma.deck.findFirst({
      where: { shareId: params.shareId, userId: auth.user.id },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    let slides = [];
    try {
      slides = JSON.parse(deck.slides);
    } catch {}

    let piqScore = null;
    try {
      piqScore = JSON.parse(deck.piqScore);
    } catch {}

    return NextResponse.json({
      id: deck.id,
      shareId: deck.shareId,
      title: deck.title,
      companyName: deck.companyName,
      industry: deck.industry,
      stage: deck.stage,
      fundingTarget: deck.fundingTarget,
      investorType: deck.investorType,
      themeId: deck.themeId,
      slides,
      piqScore,
      source: deck.source,
      createdAt: deck.createdAt.toISOString(),
      updatedAt: deck.updatedAt.toISOString(),
    });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[v1/decks/:shareId GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const auth = await authenticateApiKey(req);
    requireScope(auth.scopes, "decks:write");

    const deck = await prisma.deck.findFirst({
      where: { shareId: params.shareId, userId: auth.user.id },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    await prisma.deck.delete({ where: { id: deck.id } });

    return NextResponse.json({ success: true, deletedId: deck.id });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[v1/decks/:shareId DELETE]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
