/**
 * Public investor discovery API (user-facing).
 * GET — return enabled investor profiles for the matching/discovery UI.
 * Plan-gated to Growth+ (requires investorCRM limit).
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-limits";
import { SEED_INVESTORS } from "@/lib/investor-seed-data";

export const dynamic = "force-dynamic";

/** Auto-seed investors if the table is empty. */
async function ensureSeeded() {
  const count = await prisma.investorProfile.count();
  if (count > 0) return;

  for (const investor of SEED_INVESTORS) {
    await prisma.investorProfile.create({ data: investor });
  }
}

function parseJsonField(value: string | null | undefined): unknown[] {
  if (!value) return [];
  try {
    return JSON.parse(value);
  } catch {
    return [];
  }
}

/** Strip sensitive admin fields from investor profiles for public consumption. */
function serializePublicInvestor(investor: Record<string, unknown>) {
  return {
    id: investor.id,
    name: investor.name,
    type: investor.type,
    website: investor.website,
    logoUrl: investor.logoUrl,
    description: investor.description,
    stages: parseJsonField(investor.stages as string),
    sectors: parseJsonField(investor.sectors as string),
    geographies: parseJsonField(investor.geographies as string),
    chequeMin: investor.chequeMin,
    chequeMax: investor.chequeMax,
    thesis: investor.thesis,
    notableDeals: parseJsonField(investor.notableDeals as string),
    aum: investor.aum,
    partnerCount: investor.partnerCount,
    linkedIn: investor.linkedIn,
    twitter: investor.twitter,
  };
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check plan gating — investorCRM required (Growth+)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  const userPlan = user?.plan || "starter";
  const limits = getPlanLimits(userPlan);

  if (!limits.investorCRM) {
    return NextResponse.json(
      { error: "Investor discovery requires a Growth plan or higher" },
      { status: 403 },
    );
  }

  await ensureSeeded();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type")?.trim();
  const stage = searchParams.get("stage")?.trim();
  const sector = searchParams.get("sector")?.trim();
  const geography = searchParams.get("geography")?.trim();

  // Build where clause — only enabled investors
  const where: Record<string, unknown> = { enabled: true };

  if (type) {
    where.type = type;
  }

  if (stage) {
    where.stages = { contains: stage };
  }

  if (sector) {
    where.sectors = { contains: sector };
  }

  if (geography) {
    where.geographies = { contains: geography };
  }

  const investors = await prisma.investorProfile.findMany({
    where,
    orderBy: { name: "asc" },
  });

  return NextResponse.json({
    investors: investors.map((inv) =>
      serializePublicInvestor(inv as unknown as Record<string, unknown>),
    ),
  });
}
