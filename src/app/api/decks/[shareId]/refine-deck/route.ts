import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { checkAccess } from "@/lib/credit-gate";
import { extractDeckContent, ExtractedDeckContent } from "@/lib/deck-content-extractor";
import { refineDeck, RefinementResult } from "@/lib/refine-deck";
import { scoreDeck } from "@/lib/piq-score";
import type { PIQScore, SlideData } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(
  req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    // 1. Auth check
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Sign in to refine your deck", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    const { investorType, userGuidance, focusAreas } = (await req.json()) as {
      investorType?: string;
      userGuidance?: string;
      focusAreas?: string[];
    };

    // 2. Load the deck
    const deck = await prisma.deck.findUnique({
      where: { shareId: params.shareId },
      select: {
        id: true,
        title: true,
        userId: true,
        themeId: true,
        companyName: true,
        industry: true,
        stage: true,
        fundingTarget: true,
        problem: true,
        solution: true,
        keyMetrics: true,
        teamInfo: true,
        slides: true,
        piqScore: true,
        extractedContent: true,
        uploadedSlideTexts: true,
      },
    });

    if (!deck) {
      return NextResponse.json(
        { error: "Deck not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    // 3. Ownership check
    if (deck.userId !== userId) {
      return NextResponse.json(
        { error: "You do not own this deck", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    // 4. Credit gate
    const access = await checkAccess(userId, "deck_refinement", {
      resourceId: deck.id,
      description: "Smart Refine: " + deck.title,
    });

    if (!access.allowed) {
      return NextResponse.json(
        {
          error: access.error || "Insufficient access for deck refinement",
          code: "ACCESS_DENIED",
          upgradeOptions: access.upgradeOptions,
        },
        { status: 403 }
      );
    }

    // 5. Parse the existing PIQ score
    let piqScore: PIQScore | undefined;
    try {
      const parsed = JSON.parse(deck.piqScore);
      if (parsed.overall) piqScore = parsed as PIQScore;
    } catch {
      // No valid score — will use a default below
    }

    // refineDeck requires a PIQ score; build a minimal fallback if none exists
    if (!piqScore) {
      piqScore = {
        overall: 50,
        grade: "C",
        dimensions: [],
        recommendations: ["Score your deck first for better refinement results."],
      };
    }

    // 6. Get or extract content
    let content: ExtractedDeckContent;

    if (deck.extractedContent) {
      content = JSON.parse(deck.extractedContent) as ExtractedDeckContent;
    } else if (deck.uploadedSlideTexts) {
      const slideTexts = JSON.parse(deck.uploadedSlideTexts) as string[];
      content = await extractDeckContent(slideTexts, deck.title);
    } else {
      // Build from deck fields + slide data
      let slides: SlideData[] = [];
      try {
        slides = JSON.parse(deck.slides) as SlideData[];
      } catch {
        // slides parsing failed — proceed with empty
      }

      const slideTexts = slides.map((s) =>
        [s.title, s.subtitle, ...(s.content || [])].filter(Boolean).join("\n")
      );

      content = {
        companyName: deck.companyName,
        problem: deck.problem,
        solution: deck.solution,
        industry: deck.industry,
        stage: deck.stage,
        fundingTarget: deck.fundingTarget,
        keyMetrics: deck.keyMetrics,
        teamInfo: deck.teamInfo,
        slideTexts,
        extractionConfidence: "medium",
      };
    }

    // 7. Refine the deck
    let result: RefinementResult;
    try {
      result = await refineDeck({
        content,
        piqScore,
        investorType: investorType || "vc",
        userGuidance,
        focusAreas,
      });
    } catch (refineErr) {
      console.error("[refine-deck] Refinement failed:", refineErr);
      return NextResponse.json(
        { error: "Deck refinement failed. Please try again.", code: "REFINEMENT_FAILED" },
        { status: 500 }
      );
    }

    // 8. Create the refined deck record
    const newShareId = crypto.randomUUID().slice(0, 12);

    const newDeck = await prisma.deck.create({
      data: {
        shareId: newShareId,
        title: `${deck.title} (Refined)`,
        companyName: deck.companyName,
        industry: deck.industry,
        stage: deck.stage,
        fundingTarget: deck.fundingTarget,
        problem: deck.problem,
        solution: deck.solution,
        keyMetrics: deck.keyMetrics,
        teamInfo: deck.teamInfo,
        investorType: investorType || "vc",
        slides: JSON.stringify(result.slides),
        source: "refined",
        refinedFromId: deck.id,
        refinementNotes: JSON.stringify({
          improvements: result.improvements,
          summary: result.summary,
        }),
        userId,
        themeId: deck.themeId,
        isPremium: true,
        piqScore: "{}",
      },
    });

    // 9. Score the refined deck
    let newPiqScore: PIQScore | null = null;
    try {
      newPiqScore = await scoreDeck(result.slides, {
        companyName: deck.companyName,
        industry: deck.industry,
        stage: deck.stage,
        fundingTarget: deck.fundingTarget,
        problem: deck.problem,
        solution: deck.solution,
        keyMetrics: deck.keyMetrics,
        teamInfo: deck.teamInfo,
      });
    } catch (scoreErr) {
      console.error("[refine-deck] Post-refinement scoring failed (non-blocking):", scoreErr);
    }

    // 10. Update the new deck with the score
    if (newPiqScore) {
      await prisma.deck.update({
        where: { id: newDeck.id },
        data: { piqScore: JSON.stringify(newPiqScore) },
      });
    }

    // 11. Return results
    return NextResponse.json({
      newDeck: {
        id: newDeck.id,
        shareId: newShareId,
        title: newDeck.title,
        source: "refined",
      },
      improvements: result.improvements,
      summary: result.summary,
      scoreBefore: piqScore,
      scoreAfter: newPiqScore,
    });
  } catch (error) {
    console.error("[refine-deck] Unhandled error:", error instanceof Error ? error.stack : error);
    return NextResponse.json(
      { error: "Failed to refine deck. Please try again.", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
