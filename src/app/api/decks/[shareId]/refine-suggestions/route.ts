import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import type { PIQScore, PIQDimension } from "@/lib/types";

export const runtime = "nodejs";

// ─── Dimension-specific suggestion templates ────────────────────────────────

const DIMENSION_SUGGESTIONS: Record<string, string> = {
  narrative_structure: "Improve story flow with a clear problem-solution-traction arc",
  market_sizing: "Add TAM/SAM/SOM analysis with market data",
  financial_clarity: "Include unit economics, revenue model, and key financial metrics",
  team_credibility: "Highlight relevant experience, track record, and domain expertise",
  competitive_positioning: "Map the competitive landscape and articulate your moat",
  traction_evidence: "Quantify traction with specific metrics, growth rates, and milestones",
  ask_clarity: "Specify funding amount, use of funds, and expected milestones",
  visual_design: "Improve slide design consistency and data visualization",
  investor_fit: "Tailor messaging to your target investor profile",
  problem_definition: "Sharpen the problem statement with data-backed urgency",
};

const STRENGTH_REASONS: Record<string, string> = {
  narrative_structure: "Compelling storytelling with clear narrative arc",
  market_sizing: "Well-researched market data and sizing methodology",
  financial_clarity: "Strong unit economics and revenue projections",
  team_credibility: "Impressive team background and relevant expertise",
  competitive_positioning: "Clear competitive moat and differentiation strategy",
  traction_evidence: "Strong traction metrics demonstrating product-market fit",
  ask_clarity: "Clear funding ask with detailed use of funds",
  visual_design: "Professional design with effective data visualization",
  investor_fit: "Well-targeted messaging for investor audience",
  problem_definition: "Clearly defined problem with compelling urgency",
};

// ─── Investor type suggestion logic ─────────────────────────────────────────

function suggestInvestorType(stage: string, industry: string): string {
  const stageLower = (stage || "").toLowerCase();
  const industryLower = (industry || "").toLowerCase();

  if (stageLower.includes("idea") || stageLower.includes("concept")) {
    return "accelerator";
  }
  if (stageLower.includes("pre-seed") || stageLower.includes("pre seed")) {
    return "angel";
  }
  if (stageLower.includes("seed") && !stageLower.includes("pre")) {
    // Seed can go either way — check industry signals
    if (industryLower.includes("deep") || industryLower.includes("bio")) {
      return "vc";
    }
    return "angel";
  }
  if (
    stageLower.includes("series") ||
    stageLower.includes("growth") ||
    stageLower.includes("bridge")
  ) {
    return "vc";
  }

  // Default: VC for unknown/unspecified stages
  return "vc";
}

// ─── GET handler ────────────────────────────────────────────────────────────

export async function GET(
  req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    // 1. Auth check
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json(
        { error: "Sign in to view refinement suggestions", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    // 2. Load deck
    const deck = await prisma.deck.findUnique({
      where: { shareId: params.shareId },
      select: {
        id: true,
        userId: true,
        piqScore: true,
        industry: true,
        stage: true,
        extractedContent: true,
        companyName: true,
      },
    });

    if (!deck) {
      return NextResponse.json(
        { error: "Deck not found", code: "NOT_FOUND" },
        { status: 404 }
      );
    }

    if (deck.userId !== userId) {
      return NextResponse.json(
        { error: "You do not own this deck", code: "FORBIDDEN" },
        { status: 403 }
      );
    }

    // 3. Parse PIQ score
    let piqScore: PIQScore | null = null;
    try {
      const parsed = JSON.parse(deck.piqScore);
      if (parsed.overall) piqScore = parsed as PIQScore;
    } catch {
      // No valid score
    }

    if (!piqScore || !piqScore.dimensions || piqScore.dimensions.length === 0) {
      return NextResponse.json({
        weakDimensions: [],
        preservedStrengths: [],
        estimatedNewScore: null,
        suggestedInvestorType: suggestInvestorType(deck.stage, deck.industry),
        recommendedFocusAreas: [],
        available: false,
        reason: "No PIQ score available. Score your deck first.",
      });
    }

    // 4. Identify weak dimensions (score < 70) sorted ascending
    const weakDimensions = piqScore.dimensions
      .filter((d: PIQDimension) => d.score < 70)
      .sort((a: PIQDimension, b: PIQDimension) => a.score - b.score)
      .map((d: PIQDimension) => ({
        dimension: d.label,
        dimensionId: d.id,
        score: d.score,
        weight: d.weight,
        suggestedFix: DIMENSION_SUGGESTIONS[d.id] || d.feedback || "Improve this area",
      }));

    // 5. Identify preserved strengths (score >= 80)
    const preservedStrengths = piqScore.dimensions
      .filter((d: PIQDimension) => d.score >= 80)
      .sort((a: PIQDimension, b: PIQDimension) => b.score - a.score)
      .map((d: PIQDimension) => ({
        dimension: d.label,
        dimensionId: d.id,
        score: d.score,
        reason: STRENGTH_REASONS[d.id] || d.feedback || "Strong performance",
      }));

    // 6. Estimate new score
    // For weak dimensions, estimate improvement to 75-85 range
    // Strong dimensions stay as-is
    let estimatedWeightedSum = 0;
    let totalWeight = 0;

    for (const dim of piqScore.dimensions) {
      totalWeight += dim.weight;
      if (dim.score < 70) {
        // Estimate improvement: bring to 75-85 range based on how weak it is
        const improvement = Math.min(85, dim.score + 20 + Math.floor(Math.random() * 10));
        estimatedWeightedSum += improvement * dim.weight;
      } else {
        estimatedWeightedSum += dim.score * dim.weight;
      }
    }

    const estimatedNewScore = totalWeight > 0
      ? Math.round(estimatedWeightedSum / totalWeight)
      : piqScore.overall;

    // 7. Suggest investor type
    const suggestedInvestorType = suggestInvestorType(deck.stage, deck.industry);

    // 8. Recommended focus areas (from the weakest dimensions)
    const recommendedFocusAreas = weakDimensions
      .slice(0, 3)
      .map((d) => d.dimensionId);

    return NextResponse.json({
      weakDimensions,
      preservedStrengths,
      estimatedNewScore,
      currentScore: piqScore.overall,
      suggestedInvestorType,
      recommendedFocusAreas,
      available: true,
    });
  } catch (error) {
    console.error("[refine-suggestions] Error:", error instanceof Error ? error.stack : error);
    return NextResponse.json(
      { error: "Failed to generate suggestions", code: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
