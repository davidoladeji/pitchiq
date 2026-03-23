import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { getPlanLimits } from "@/lib/plan-limits";

export async function GET(
  req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const deck = await prisma.deck.findUnique({
      where: { shareId: params.shareId },
      include: {
        owner: { select: { id: true, plan: true, brandingEnabled: true } },
        workspace: { select: { brandConfig: true } },
        parentVariants: {
          include: { variantDeck: { select: { shareId: true, title: true, piqScore: true } } },
        },
      },
    });

    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }

    // Record view
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const userAgent = req.headers.get("user-agent") || "";

    const viewRecord = await prisma.view.create({
      data: {
        deckId: deck.id,
        viewerIp: ip,
        userAgent,
      },
    });

    let piqScore;
    try {
      piqScore = JSON.parse(deck.piqScore);
      if (!piqScore.overall) piqScore = undefined;
    } catch {
      piqScore = undefined;
    }

    // Check if current viewer is the deck owner
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as { id?: string })?.id;
    const isOwner = !!(currentUserId && deck.userId && currentUserId === deck.userId);
    const ownerPlan = isOwner ? (deck.owner?.plan ?? "starter") : undefined;

    // Layered branding: plan-enforced > workspace setting > user preference
    const ownerLimits = getPlanLimits(deck.owner?.plan ?? "starter");
    let showBranding: boolean;
    if (ownerLimits.showBranding) {
      // Free plan: always show branding, no override
      showBranding = true;
    } else if (deck.workspace) {
      // Workspace deck (Enterprise): workspace hidePitchiqBranding takes priority
      let wsBrand: { hidePitchiqBranding?: boolean } = {};
      try { wsBrand = JSON.parse(deck.workspace.brandConfig || "{}"); } catch { /* empty */ }
      showBranding = !wsBrand.hidePitchiqBranding;
    } else {
      // Individual paid user: user preference controls
      showBranding = deck.owner?.brandingEnabled ?? true;
    }

    // Parse generationMeta if present
    let generationMeta;
    try { generationMeta = deck.generationMeta ? JSON.parse(deck.generationMeta) : undefined; } catch { /* empty */ }

    return NextResponse.json({
      id: deck.id,
      shareId: deck.shareId,
      title: deck.title,
      companyName: deck.companyName,
      slides: JSON.parse(deck.slides),
      createdAt: deck.createdAt.toISOString(),
      isPremium: deck.isPremium,
      showBranding,
      themeId: deck.themeId,
      piqScore,
      isOwner,
      ownerPlan,
      viewId: viewRecord.id,
      // Form input fields for DeckInfoPanel
      industry: deck.industry,
      stage: deck.stage,
      fundingTarget: deck.fundingTarget,
      investorType: deck.investorType,
      problem: deck.problem,
      solution: deck.solution,
      keyMetrics: deck.keyMetrics,
      teamInfo: deck.teamInfo,
      source: deck.source,
      foundedYear: deck.foundedYear,
      businessModel: deck.businessModel,
      revenueModel: deck.revenueModel,
      customerType: deck.customerType,
      generationMeta,
      slideCount: JSON.parse(deck.slides).length,
      variants: isOwner
        ? deck.parentVariants.map((v) => {
            let score = null;
            try {
              const p = JSON.parse(v.variantDeck.piqScore);
              score = p.overall ?? null;
            } catch { /* empty */ }
            return {
              shareId: v.variantDeck.shareId,
              title: v.variantDeck.title,
              investorType: v.investorType,
              piqScore: score,
            };
          })
        : undefined,
    });
  } catch (error) {
    console.error("Deck fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch deck" },
      { status: 500 }
    );
  }
}

/* ------------------------------------------------------------------ */
/*  PATCH — Update deck form fields (owner only)                       */
/* ------------------------------------------------------------------ */

const ALLOWED_FIELDS = new Set([
  "title", "companyName", "industry", "stage", "fundingTarget", "investorType",
  "problem", "solution", "keyMetrics", "teamInfo",
  "businessModel", "revenueModel", "customerType",
  "foundedYear", "teamSize",
]);
const MAX_SHORT = 2000;
const MAX_LONG = 5000;
const LONG_FIELDS = new Set(["problem", "solution", "keyMetrics", "teamInfo"]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: { shareId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const deck = await prisma.deck.findUnique({
      where: { shareId: params.shareId },
      select: { id: true, userId: true },
    });
    if (!deck) {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }
    if (deck.userId !== userId) {
      return NextResponse.json({ error: "Not authorized" }, { status: 403 });
    }

    const body = await req.json();

    // Whitelist and validate fields
    const updates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(body)) {
      if (!ALLOWED_FIELDS.has(key)) continue;

      // Integer fields
      if (key === "foundedYear" || key === "teamSize") {
        const num = Number(value);
        if (!Number.isNaN(num) && Number.isInteger(num)) {
          updates[key] = num;
        }
        continue;
      }

      // String fields
      if (typeof value === "string") {
        const maxLen = LONG_FIELDS.has(key) ? MAX_LONG : MAX_SHORT;
        if (value.length > maxLen) {
          return NextResponse.json({ error: `${key} exceeds maximum length (${maxLen})` }, { status: 400 });
        }
        updates[key] = value;
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await prisma.deck.update({
      where: { id: deck.id },
      data: updates,
      select: {
        id: true, shareId: true, title: true, companyName: true, industry: true,
        stage: true, fundingTarget: true, investorType: true, problem: true,
        solution: true, keyMetrics: true, teamInfo: true, businessModel: true,
        revenueModel: true, customerType: true, foundedYear: true, teamSize: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Deck PATCH error:", error);
    return NextResponse.json({ error: "Failed to update deck" }, { status: 500 });
  }
}
