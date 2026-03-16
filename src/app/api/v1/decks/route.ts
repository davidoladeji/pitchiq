import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { authenticateApiKey, requireScope } from "@/lib/api-auth";
import { generateDeck } from "@/lib/generate-deck";
import { scoreDeck } from "@/lib/piq-score";
import { nanoid } from "nanoid";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateApiKey(req);
    requireScope(auth.scopes, "decks:read");

    const decks = await prisma.deck.findMany({
      where: { userId: auth.user.id },
      select: {
        id: true,
        shareId: true,
        title: true,
        companyName: true,
        themeId: true,
        piqScore: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const formatted = decks.map((d) => {
      let piqScore = null;
      try {
        piqScore = JSON.parse(d.piqScore);
      } catch {}
      return {
        id: d.id,
        shareId: d.shareId,
        title: d.title,
        companyName: d.companyName,
        themeId: d.themeId,
        piqScore,
        createdAt: d.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ decks: formatted });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[v1/decks GET]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateApiKey(req);
    requireScope(auth.scopes, "decks:write");

    const body = await req.json();
    const { companyName, industry, stage, fundingTarget, investorType, problem, solution, keyMetrics, teamInfo } = body;

    if (!companyName) {
      return NextResponse.json({ error: "companyName is required" }, { status: 400 });
    }

    const deckInput = {
      companyName,
      industry: industry || "",
      stage: stage || "",
      fundingTarget: fundingTarget || "",
      investorType: investorType || "vc",
      problem: problem || "",
      solution: solution || "",
      keyMetrics: keyMetrics || "",
      teamInfo: teamInfo || "",
    };

    const slides = await generateDeck(deckInput);
    const shareId = nanoid(10);

    const piqScore = await scoreDeck(slides, deckInput);

    const deck = await prisma.deck.create({
      data: {
        shareId,
        title: `${companyName} Pitch Deck`,
        companyName,
        industry: deckInput.industry,
        stage: deckInput.stage,
        fundingTarget: deckInput.fundingTarget,
        investorType: deckInput.investorType,
        problem: deckInput.problem,
        solution: deckInput.solution,
        keyMetrics: deckInput.keyMetrics,
        teamInfo: deckInput.teamInfo,
        slides: JSON.stringify(slides),
        themeId: "midnight",
        piqScore: JSON.stringify(piqScore),
        source: "api",
        userId: auth.user.id,
      },
    });

    return NextResponse.json({
      id: deck.id,
      shareId: deck.shareId,
      title: deck.title,
      companyName: deck.companyName,
      slides,
      piqScore,
      createdAt: deck.createdAt.toISOString(),
    });
  } catch (err: unknown) {
    const e = err as { status?: number; message?: string };
    if (e.status) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    console.error("[v1/decks POST]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
