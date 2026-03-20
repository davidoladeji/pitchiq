/**
 * Investor matching API — scores investors against a deck's company data.
 * GET /api/investors/match?deckId=xxx
 * Plan-gated to Growth+ (investorCRM).
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-limits";
import { rankInvestors, deckToMatchInput } from "@/lib/investor-matching";
import type { InvestorForMatching } from "@/lib/investor-matching";
import { SEED_INVESTORS } from "@/lib/investor-seed-data";
import { trackEvent } from "@/lib/analytics/product-events";

export const dynamic = "force-dynamic";

/** Auto-seed investor profiles if the table is empty. */
async function ensureSeeded() {
  const count = await prisma.investorProfile.count();
  if (count > 0) return;

  for (const inv of SEED_INVESTORS) {
    await prisma.investorProfile.create({ data: inv });
  }
}

function parseJsonField(val: string | null): string[] {
  if (!val) return [];
  try {
    return JSON.parse(val) as string[];
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const limits = getPlanLimits(user.plan);
  if (!limits.investorCRM) {
    return NextResponse.json(
      { error: "Investor matching requires Growth plan or higher." },
      { status: 403 },
    );
  }

  const deckId = req.nextUrl.searchParams.get("deckId");
  if (!deckId) {
    return NextResponse.json(
      { error: "deckId query parameter is required." },
      { status: 400 },
    );
  }

  const deck = await prisma.deck.findFirst({
    where: { id: deckId, userId: session.user.id },
    select: { stage: true, industry: true, fundingTarget: true, investorType: true },
  });
  if (!deck) {
    return NextResponse.json(
      { error: "Deck not found or not owned by you." },
      { status: 404 },
    );
  }

  await ensureSeeded();

  // Load enabled investor profiles
  const rows = await prisma.investorProfile.findMany({
    where: { enabled: true },
  });

  const investors: InvestorForMatching[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    description: r.description,
    website: r.website,
    stages: parseJsonField(r.stages),
    sectors: parseJsonField(r.sectors),
    geographies: parseJsonField(r.geographies),
    chequeMin: r.chequeMin,
    chequeMax: r.chequeMax,
    thesis: r.thesis,
    notableDeals: parseJsonField(r.notableDeals),
    aum: r.aum,
    verified: r.verified,
  }));

  const matchInput = deckToMatchInput(deck);
  const matches = rankInvestors(investors, matchInput);

  trackEvent({ event: "investor.matched", properties: { count: matches.length } });

  return NextResponse.json({
    deckId,
    input: matchInput,
    matches: matches.map((m) => ({
      investorId: m.investor.id,
      name: m.investor.name,
      type: m.investor.type,
      description: m.investor.description,
      website: m.investor.website,
      fitScore: m.fitScore,
      topReasons: m.topReasons,
      reasons: m.reasons,
      notableDeals: m.investor.notableDeals,
      aum: m.investor.aum,
      verified: m.investor.verified,
      stages: m.investor.stages,
      sectors: m.investor.sectors,
      geographies: m.investor.geographies,
      chequeMin: m.investor.chequeMin,
      chequeMax: m.investor.chequeMax,
    })),
    total: matches.length,
  });
}
