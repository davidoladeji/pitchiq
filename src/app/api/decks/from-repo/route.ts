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
import { extractRepoData, repoDataToFormFields } from "@/lib/github-extract";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const rl = rateLimit(`deck-repo:${ip}`, { maxRequests: 5, windowMs: 60 * 60 * 1000 });
    if (!rl.success) {
      return NextResponse.json({ error: "Rate limit exceeded. Please try again later." }, { status: 429 });
    }

    const body = await req.json();
    const { repoUrl, themeId } = body as { repoUrl: string; themeId?: string };

    if (!repoUrl || !repoUrl.match(/github\.com\/[^\/]+\/[^\/\?#]+/)) {
      return NextResponse.json(
        { error: "A valid GitHub repository URL is required" },
        { status: 400 }
      );
    }

    // Require authentication
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in to create a deck", code: "AUTH_REQUIRED" }, { status: 401 });
    }

    // Look up GitHub account for access token
    const githubAccount = await prisma.account.findFirst({
      where: { userId, provider: "github" },
    });
    if (!githubAccount || !githubAccount.access_token) {
      return NextResponse.json(
        { error: "No GitHub account linked. Please sign in with GitHub first." },
        { status: 403 }
      );
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

    // Extract repo data from GitHub API
    const repoData = await extractRepoData(repoUrl, githubAccount.access_token);
    const repoFields = repoDataToFormFields(repoData);

    // Build DeckInput from repo data
    const deckInput: DeckInput = {
      companyName: repoFields.companyName,
      industry: repoFields.industry,
      stage: "Pre-seed",
      fundingTarget: repoFields.fundingTarget,
      investorType: "vc",
      problem: repoFields.problem,
      solution: repoFields.solution,
      keyMetrics: repoFields.traction,
      teamInfo: repoFields.teamBackground,
      themeId: themeId || "midnight",
    };

    // Validate theme
    const limits = getPlanLimits(userPlan);
    if (deckInput.themeId && !limits.allowedThemes.includes(deckInput.themeId)) {
      deckInput.themeId = "midnight";
    }

    const slides = await generateDeck(deckInput);
    const shareId = nanoid(10);

    // Score the deck
    const piqScore = await scoreDeck(slides, {
      companyName: deckInput.companyName,
      industry: deckInput.industry || "",
      stage: deckInput.stage || "",
      fundingTarget: deckInput.fundingTarget || "",
      problem: deckInput.problem,
      solution: deckInput.solution,
      keyMetrics: deckInput.keyMetrics || "",
      teamInfo: deckInput.teamInfo || "",
    });

    const deck = await prisma.deck.create({
      data: {
        shareId,
        title: `${deckInput.companyName} Pitch Deck`,
        companyName: deckInput.companyName,
        industry: deckInput.industry || "",
        stage: deckInput.stage || "",
        fundingTarget: deckInput.fundingTarget || "",
        investorType: deckInput.investorType || "vc",
        problem: deckInput.problem,
        solution: deckInput.solution,
        keyMetrics: deckInput.keyMetrics || "",
        teamInfo: deckInput.teamInfo || "",
        slides: JSON.stringify(slides),
        themeId: deckInput.themeId || "midnight",
        piqScore: JSON.stringify(piqScore),
        source: "github",
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
    console.error("GitHub deck generation error:", error);
    const message = error instanceof Error ? error.message : "Failed to generate deck from repository";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
