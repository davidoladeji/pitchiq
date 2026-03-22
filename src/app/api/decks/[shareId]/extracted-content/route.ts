/**
 * GET /api/decks/[shareId]/extracted-content
 * Returns the extracted content from a scored deck for prefilling the create form.
 * Requires authentication and ownership of the deck.
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { extractDeckContent, ExtractedDeckContent } from "@/lib/deck-content-extractor";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { shareId: string } },
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const deck = await prisma.deck.findFirst({
    where: { shareId: params.shareId, userId },
    select: {
      id: true,
      title: true,
      companyName: true,
      extractedContent: true,
      uploadedSlideTexts: true,
      piqScore: true,
      themeId: true,
    },
  });

  if (!deck) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  // If we already have extracted content, return it
  if (deck.extractedContent) {
    try {
      const content = JSON.parse(deck.extractedContent) as ExtractedDeckContent;
      return NextResponse.json({
        content,
        deckTitle: deck.title,
        themeId: deck.themeId,
        hasPiqScore: !!deck.piqScore,
      });
    } catch {
      // Fall through to extract
    }
  }

  // If we have slide texts, extract content now
  if (deck.uploadedSlideTexts) {
    try {
      const slideTexts = JSON.parse(deck.uploadedSlideTexts) as string[];
      const content = await extractDeckContent(slideTexts, deck.title ?? undefined);

      // Cache the extracted content for next time
      await prisma.deck.update({
        where: { id: deck.id },
        data: { extractedContent: JSON.stringify(content) },
      });

      return NextResponse.json({
        content,
        deckTitle: deck.title,
        themeId: deck.themeId,
        hasPiqScore: !!deck.piqScore,
      });
    } catch (err) {
      console.error("[extracted-content] Extraction failed:", err);
    }
  }

  // Fallback: return whatever basic info we have from the deck record
  const fallback: Partial<ExtractedDeckContent> = {
    companyName: deck.companyName || "",
    problem: "",
    solution: "",
    industry: "",
    stage: "",
    fundingTarget: "",
    keyMetrics: "",
    teamInfo: "",
    slideTexts: [],
    extractionConfidence: "low",
  };

  return NextResponse.json({
    content: fallback,
    deckTitle: deck.title,
    themeId: deck.themeId,
    hasPiqScore: !!deck.piqScore,
  });
}
