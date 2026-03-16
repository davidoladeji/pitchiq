import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-limits";
import { generateDeck } from "@/lib/generate-deck";
import { scoreDeck } from "@/lib/piq-score";
import { nanoid } from "nanoid";

const VALID_TYPES = ["vc", "angel", "accelerator"];

/**
 * POST /api/decks/[shareId]/variants
 * Generate investor-targeted deck variants (Growth+ only).
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const deck = await prisma.deck.findUnique({
      where: { shareId: params.shareId },
      include: {
        owner: { select: { plan: true } },
        parentVariants: { include: { variantDeck: { select: { shareId: true } } } },
      },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    if (deck.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const plan = deck.owner?.plan || "starter";
    const limits = getPlanLimits(plan);
    if (!limits.investorVariants) {
      return NextResponse.json(
        { error: "Upgrade to Growth to generate investor variants" },
        { status: 403 }
      );
    }

    const { investorTypes } = (await req.json()) as { investorTypes: string[] };
    if (!Array.isArray(investorTypes) || investorTypes.length === 0) {
      return NextResponse.json({ error: "investorTypes array required" }, { status: 400 });
    }

    const validTypes = investorTypes.filter((t) => VALID_TYPES.includes(t));
    if (validTypes.length === 0) {
      return NextResponse.json({ error: "Invalid investor types" }, { status: 400 });
    }

    // Skip types that already have variants
    const existingTypes = deck.parentVariants.map((v) => v.investorType);
    const newTypes = validTypes.filter((t) => !existingTypes.includes(t));

    if (newTypes.length === 0) {
      // Return existing variants instead
      const existing = deck.parentVariants.map((v) => ({
        shareId: v.variantDeck.shareId,
        investorType: v.investorType,
      }));
      return NextResponse.json({ variants: existing, created: 0 });
    }

    // Generate variants sequentially (each is an AI call)
    const variants: { shareId: string; investorType: string }[] = [];

    for (const investorType of newTypes) {
      try {
        const slides = await generateDeck({
          companyName: deck.companyName,
          industry: deck.industry,
          stage: deck.stage,
          fundingTarget: deck.fundingTarget,
          investorType: investorType as "vc" | "angel" | "accelerator",
          keyMetrics: deck.keyMetrics,
          teamInfo: deck.teamInfo,
          problem: deck.problem,
          solution: deck.solution,
        });

        const piqScore = await scoreDeck(slides, {
          companyName: deck.companyName,
          industry: deck.industry,
          stage: deck.stage,
          fundingTarget: deck.fundingTarget,
          problem: deck.problem,
          solution: deck.solution,
          keyMetrics: deck.keyMetrics,
          teamInfo: deck.teamInfo,
        });

        const variantShareId = nanoid(10);

        const variantDeck = await prisma.deck.create({
          data: {
            shareId: variantShareId,
            title: `${deck.title} (${investorType.toUpperCase()} variant)`,
            companyName: deck.companyName,
            industry: deck.industry,
            stage: deck.stage,
            fundingTarget: deck.fundingTarget,
            investorType,
            keyMetrics: deck.keyMetrics,
            teamInfo: deck.teamInfo,
            problem: deck.problem,
            solution: deck.solution,
            slides: JSON.stringify(slides),
            piqScore: JSON.stringify(piqScore),
            themeId: deck.themeId,
            isPremium: deck.isPremium,
            source: "generated",
            userId,
          },
        });

        await prisma.deckVariant.create({
          data: {
            parentDeckId: deck.id,
            variantDeckId: variantDeck.id,
            investorType,
          },
        });

        variants.push({ shareId: variantShareId, investorType });
      } catch (err) {
        console.error(`[variants] Failed to generate ${investorType} variant:`, err);
        // Continue with other types
      }
    }

    // Also include existing variants in response
    const allVariants = [
      ...deck.parentVariants.map((v) => ({
        shareId: v.variantDeck.shareId,
        investorType: v.investorType,
      })),
      ...variants,
    ];

    return NextResponse.json({
      variants: allVariants,
      created: variants.length,
    });
  } catch (err) {
    console.error("[variants] Error:", err);
    return NextResponse.json({ error: "Failed to generate variants" }, { status: 500 });
  }
}

/**
 * GET /api/decks/[shareId]/variants
 * List existing variants for a deck.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const deck = await prisma.deck.findUnique({
      where: { shareId: params.shareId },
      include: {
        parentVariants: {
          include: {
            variantDeck: {
              select: { shareId: true, title: true, piqScore: true, createdAt: true },
            },
          },
        },
      },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    const variants = deck.parentVariants.map((v) => {
      let score = null;
      try {
        const parsed = JSON.parse(v.variantDeck.piqScore);
        score = parsed.overall ?? null;
      } catch { /* empty */ }

      return {
        shareId: v.variantDeck.shareId,
        title: v.variantDeck.title,
        investorType: v.investorType,
        piqScore: score,
        createdAt: v.variantDeck.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ variants });
  } catch (err) {
    console.error("[variants] Error:", err);
    return NextResponse.json({ error: "Failed to fetch variants" }, { status: 500 });
  }
}
