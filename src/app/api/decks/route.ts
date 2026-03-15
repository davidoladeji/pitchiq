import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateDeck } from "@/lib/generate-deck";
import { scoreDeck } from "@/lib/piq-score";
import { DeckInput } from "@/lib/types";
import { nanoid } from "nanoid";

export async function POST(req: NextRequest) {
  try {
    const body: DeckInput = await req.json();

    if (!body.companyName || !body.problem || !body.solution) {
      return NextResponse.json(
        { error: "Company name, problem, and solution are required" },
        { status: 400 }
      );
    }

    const slides = await generateDeck(body);
    const shareId = nanoid(10);

    // Score the deck
    const piqScore = await scoreDeck(slides, {
      companyName: body.companyName,
      industry: body.industry || "",
      stage: body.stage || "",
      fundingTarget: body.fundingTarget || "",
      problem: body.problem,
      solution: body.solution,
      keyMetrics: body.keyMetrics || "",
      teamInfo: body.teamInfo || "",
    });

    const deck = await prisma.deck.create({
      data: {
        shareId,
        title: `${body.companyName} Pitch Deck`,
        companyName: body.companyName,
        industry: body.industry || "",
        stage: body.stage || "",
        fundingTarget: body.fundingTarget || "",
        investorType: body.investorType || "vc",
        problem: body.problem,
        solution: body.solution,
        keyMetrics: body.keyMetrics || "",
        teamInfo: body.teamInfo || "",
        slides: JSON.stringify(slides),
        themeId: body.themeId || "midnight",
        piqScore: JSON.stringify(piqScore),
      },
    });

    return NextResponse.json({
      id: deck.id,
      shareId: deck.shareId,
      title: deck.title,
      companyName: deck.companyName,
      slides,
      createdAt: deck.createdAt.toISOString(),
      isPremium: deck.isPremium,
      themeId: deck.themeId,
      piqScore,
    });
  } catch (error) {
    console.error("Deck generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate deck" },
      { status: 500 }
    );
  }
}
