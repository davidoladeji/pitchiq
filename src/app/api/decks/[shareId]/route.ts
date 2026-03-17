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
