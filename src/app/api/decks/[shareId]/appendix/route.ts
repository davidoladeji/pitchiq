import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-limits";
import Anthropic from "@anthropic-ai/sdk";

const APPENDIX_PROMPTS: Record<string, string> = {
  financials:
    "Generate a detailed financial appendix slide with projected revenue, expenses, and key financial metrics for the next 3 years. Include a revenue model breakdown, unit economics (CAC, LTV, margins), and burn rate projections.",
  market_research:
    "Generate a market research appendix slide with detailed TAM/SAM/SOM analysis, market growth trends, industry benchmarks, and competitive positioning data. Include specific data points and sources.",
  competitive_matrix:
    "Generate a competitive analysis appendix slide with a detailed feature comparison matrix against 4-5 key competitors. Include pricing comparison, market positioning, and key differentiators.",
};

/**
 * POST /api/decks/[shareId]/appendix
 * Generate appendix slides using AI. Pro+ only.
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
      include: { owner: { select: { plan: true } } },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    if (deck.userId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const plan = deck.owner?.plan || "starter";
    const limits = getPlanLimits(plan);
    if (!limits.piqScoreDetail) {
      // Pro+ feature — use piqScoreDetail as proxy for Pro+
      return NextResponse.json(
        { error: "Upgrade to Pro to generate appendix slides" },
        { status: 403 }
      );
    }

    const { types } = (await req.json()) as {
      types: string[];
    };

    if (!Array.isArray(types) || types.length === 0) {
      return NextResponse.json({ error: "types array required" }, { status: 400 });
    }

    const validTypes = types.filter((t) => t in APPENDIX_PROMPTS);
    if (validTypes.length === 0) {
      return NextResponse.json(
        { error: "Invalid types. Use: financials, market_research, competitive_matrix" },
        { status: 400 }
      );
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI service not configured" },
        { status: 501 }
      );
    }

    const client = new Anthropic({ apiKey });
    const slides: Array<{ title: string; subtitle: string; content: string[]; type: string }> = [];

    for (const appendixType of validTypes) {
      try {
        const prompt = `You are generating an appendix slide for a pitch deck.

Company: ${deck.companyName}
Industry: ${deck.industry}
Stage: ${deck.stage}
Funding Target: ${deck.fundingTarget}
Problem: ${deck.problem}
Solution: ${deck.solution}
Key Metrics: ${deck.keyMetrics}

${APPENDIX_PROMPTS[appendixType]}

Return a JSON object with exactly this structure (no markdown, no code fences):
{
  "title": "slide title",
  "subtitle": "optional subtitle",
  "content": ["bullet point 1", "bullet point 2", ...]
}

Make the content specific and data-rich. Use realistic projections based on the company info. Include 6-10 bullet points.`;

        const response = await client.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        });

        const text =
          response.content[0]?.type === "text" ? response.content[0].text : "";
        const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        slides.push({
          title: parsed.title || `Appendix: ${appendixType}`,
          subtitle: parsed.subtitle || "",
          content: Array.isArray(parsed.content) ? parsed.content : [],
          type: "content",
        });
      } catch (err) {
        console.error(`[appendix] Failed to generate ${appendixType}:`, err);
        // Continue with other types
      }
    }

    if (slides.length === 0) {
      return NextResponse.json(
        { error: "Failed to generate appendix slides" },
        { status: 502 }
      );
    }

    return NextResponse.json({ slides, generated: slides.length });
  } catch (err) {
    console.error("[appendix] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate appendix" },
      { status: 500 }
    );
  }
}
