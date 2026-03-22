/**
 * Public investor discovery API (user-facing).
 * GET — return enabled investor profiles for the matching/discovery UI.
 * Plan-gated to Growth+ (requires investorCRM limit).
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { checkAccess } from "@/lib/credit-gate";
import { SEED_INVESTORS } from "@/lib/investor-seed-data";

export const dynamic = "force-dynamic";

/** Auto-seed investors if the table is empty, and fix corrupted cheque values. */
async function ensureSeeded() {
  const count = await prisma.investorProfile.count();

  if (count === 0) {
    for (const investor of SEED_INVESTORS) {
      await prisma.investorProfile.create({ data: investor });
    }
    return;
  }

  // Back-fill: fix corrupted cheque values (null, zero, or denormalized floats < $1)
  try {
    const seedRows = await prisma.investorProfile.findMany({
      where: { source: "seed" },
      select: { id: true, name: true, chequeMin: true, chequeMax: true },
    });
    const seedMap = new Map(SEED_INVESTORS.map((s) => [s.name, s]));
    for (const row of seedRows) {
      const seed = seedMap.get(row.name);
      if (!seed || (seed.chequeMin == null && seed.chequeMax == null)) continue;
      const minBad = row.chequeMin == null || row.chequeMin < 1;
      const maxBad = row.chequeMax == null || row.chequeMax < 1;
      if (minBad || maxBad) {
        await prisma.investorProfile.update({
          where: { id: row.id },
          data: { chequeMin: seed.chequeMin ?? null, chequeMax: seed.chequeMax ?? null },
        });
      }
    }
  } catch (e) {
    console.error("Failed to back-fill cheque values:", e);
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

  const gate = await checkAccess(userId, "investor_match", { description: "Investor discovery" });
  if (!gate.allowed) {
    return NextResponse.json(
      { error: gate.error || "Investor discovery requires Growth plan, a pass, or credits.", upgradeOptions: gate.upgradeOptions },
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
