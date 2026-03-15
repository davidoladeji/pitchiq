import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { generateDeck } from "@/lib/generate-deck";
import { scoreDeck } from "@/lib/piq-score";
import { DeckInput } from "@/lib/types";
import { getPlanLimits } from "@/lib/plan-limits";
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

    // Get the authenticated user (optional — decks can be created without login)
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id || null;

    // Enforce plan limits
    let userPlan = "starter";
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      });
      userPlan = user?.plan || "starter";

      const limits = getPlanLimits(userPlan);
      const deckCount = await prisma.deck.count({ where: { userId } });

      if (deckCount >= limits.maxDecks) {
        return NextResponse.json(
          {
            error: "You've reached your free deck limit. Upgrade to Pro for unlimited decks.",
            code: "PLAN_LIMIT",
          },
          { status: 403 }
        );
      }

      // Force allowed theme
      if (body.themeId && !limits.allowedThemes.includes(body.themeId)) {
        body.themeId = "midnight";
      }
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
        userId,
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
