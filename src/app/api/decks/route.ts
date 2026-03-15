import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { generateDeck } from "@/lib/generate-deck";
import { scoreDeck } from "@/lib/piq-score";
import { DeckInput } from "@/lib/types";
import { getPlanLimits } from "@/lib/plan-limits";
import { nanoid } from "nanoid";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(`deck-create:${ip}`, { maxRequests: 10, windowMs: 60 * 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
    }

    const body: DeckInput = await req.json();

    if (!body.companyName || !body.problem || !body.solution) {
      return NextResponse.json(
        { error: "Company name, problem, and solution are required" },
        { status: 400 }
      );
    }

    // Input length validation
    const MAX_FIELD_LEN = 2000;
    const MAX_LONG_FIELD_LEN = 5000;
    const textFields = ['companyName', 'industry', 'stage', 'fundingTarget', 'investorType'];
    const longFields = ['keyMetrics', 'teamInfo', 'problem', 'solution'];

    for (const field of textFields) {
      if (body[field as keyof DeckInput] && typeof body[field as keyof DeckInput] === 'string' && (body[field as keyof DeckInput] as string).length > MAX_FIELD_LEN) {
        return NextResponse.json({ error: `${field} exceeds maximum length` }, { status: 400 });
      }
    }
    for (const field of longFields) {
      if (body[field as keyof DeckInput] && typeof body[field as keyof DeckInput] === 'string' && (body[field as keyof DeckInput] as string).length > MAX_LONG_FIELD_LEN) {
        return NextResponse.json({ error: `${field} exceeds maximum length` }, { status: 400 });
      }
    }

    // Require authentication
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in to create a deck", code: "AUTH_REQUIRED" }, { status: 401 });
    }

    // Enforce plan limits
    let userPlan = "starter";
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    userPlan = user?.plan || "starter";

    const deckCount = await prisma.deck.count({ where: { userId } });
    const planLimits = getPlanLimits(userPlan);

    if (deckCount >= planLimits.maxDecks) {
      return NextResponse.json(
        {
          error: "You've reached your free deck limit. Upgrade to Pro for unlimited decks.",
          code: "PLAN_LIMIT",
        },
        { status: 403 }
      );
    }

    // Validate theme for ALL users (not just authenticated)
    const limits = getPlanLimits(userPlan);
    if (body.themeId && !limits.allowedThemes.includes(body.themeId)) {
      body.themeId = "midnight";
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
