/**
 * Admin investor profile management API.
 * GET  — list all investor profiles (with filtering)
 * POST — create a new investor profile
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { SEED_INVESTORS } from "@/lib/investor-seed-data";

export const dynamic = "force-dynamic";

/** Auto-seed investors if the table is empty so admin never sees a blank page.
 *  Also back-fills missing cheque values on existing records. */
async function ensureSeeded() {
  const count = await prisma.investorProfile.count();

  if (count === 0) {
    // Fresh install — create all investors
    for (const investor of SEED_INVESTORS) {
      await prisma.investorProfile.create({ data: investor });
    }
    return;
  }

  // Back-fill: update any seed investors whose chequeMin/chequeMax are still null
  const nullCheque = await prisma.investorProfile.findMany({
    where: {
      source: "seed",
      OR: [{ chequeMin: null }, { chequeMax: null }],
    },
    select: { id: true, name: true },
  });

  if (nullCheque.length === 0) return;

  const seedMap = new Map(SEED_INVESTORS.map((s) => [s.name, s]));

  for (const row of nullCheque) {
    const seed = seedMap.get(row.name);
    if (!seed || (seed.chequeMin == null && seed.chequeMax == null)) continue;
    await prisma.investorProfile.update({
      where: { id: row.id },
      data: {
        chequeMin: seed.chequeMin ?? null,
        chequeMax: seed.chequeMax ?? null,
      },
    });
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

function serializeInvestor(investor: Record<string, unknown>) {
  return {
    ...investor,
    stages: parseJsonField(investor.stages as string),
    sectors: parseJsonField(investor.sectors as string),
    geographies: parseJsonField(investor.geographies as string),
    notableDeals: parseJsonField(investor.notableDeals as string),
  };
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureSeeded();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search")?.trim();
  const type = searchParams.get("type")?.trim();
  const stage = searchParams.get("stage")?.trim();
  const sector = searchParams.get("sector")?.trim();
  const geography = searchParams.get("geography")?.trim();

  // Build Prisma where clause
  const where: Record<string, unknown> = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
      { thesis: { contains: search, mode: "insensitive" } },
    ];
  }

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
    investors: investors.map((inv) => serializeInvestor(inv as unknown as Record<string, unknown>)),
  });
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const name = body.name as string | undefined;
  const type = body.type as string | undefined;

  if (!name || !name.trim()) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  if (!type || !type.trim()) {
    return NextResponse.json({ error: "type is required" }, { status: 400 });
  }

  // Helper to serialize arrays to JSON strings
  function toJsonStr(val: unknown): string {
    if (typeof val === "string") return val;
    if (Array.isArray(val)) return JSON.stringify(val);
    return "[]";
  }

  try {
    const data = {
      name: name.trim(),
      type: type.trim(),
      website: body.website ? String(body.website) : null,
      logoUrl: body.logoUrl ? String(body.logoUrl) : null,
      description: body.description ? String(body.description) : null,
      stages: toJsonStr(body.stages),
      sectors: toJsonStr(body.sectors),
      geographies: toJsonStr(body.geographies),
      chequeMin: body.chequeMin != null ? Number(body.chequeMin) : null,
      chequeMax: body.chequeMax != null ? Number(body.chequeMax) : null,
      thesis: body.thesis ? String(body.thesis) : null,
      notableDeals: toJsonStr(body.notableDeals),
      aum: body.aum ? String(body.aum) : null,
      partnerCount: body.partnerCount != null ? Number(body.partnerCount) : null,
      contactEmail: body.contactEmail ? String(body.contactEmail) : null,
      linkedIn: body.linkedIn ? String(body.linkedIn) : null,
      twitter: body.twitter ? String(body.twitter) : null,
      source: body.source ? String(body.source) : "admin",
      verified: Boolean(body.verified ?? false),
      enabled: body.enabled !== false,
      // Extended fields
      country: body.country ? String(body.country) : null,
      city: body.city ? String(body.city) : null,
      currencies: toJsonStr(body.currencies),
      businessModels: toJsonStr(body.businessModels),
      revenueModels: toJsonStr(body.revenueModels),
      customerTypes: toJsonStr(body.customerTypes),
      dealStructures: toJsonStr(body.dealStructures),
      valuationMin: body.valuationMin != null ? Number(body.valuationMin) : null,
      valuationMax: body.valuationMax != null ? Number(body.valuationMax) : null,
      minRevenue: body.minRevenue != null ? Number(body.minRevenue) : null,
      minGrowthRate: body.minGrowthRate != null ? Number(body.minGrowthRate) : null,
      minTeamSize: body.minTeamSize != null ? Number(body.minTeamSize) : null,
      fundVintage: body.fundVintage != null ? Number(body.fundVintage) : null,
      fundSize: body.fundSize != null ? Number(body.fundSize) : null,
      deploymentPace: body.deploymentPace ? String(body.deploymentPace) : null,
      averageCheckCount: body.averageCheckCount != null ? Number(body.averageCheckCount) : null,
      leadPreference: body.leadPreference ? String(body.leadPreference) : null,
      boardSeatRequired: Boolean(body.boardSeatRequired ?? false),
      syndicateOpen: Boolean(body.syndicateOpen ?? false),
      followOnReserve: body.followOnReserve !== false,
      impactFocus: Boolean(body.impactFocus ?? false),
      diversityLens: Boolean(body.diversityLens ?? false),
      thesisKeywords: toJsonStr(body.thesisKeywords),
      portfolioCompanies: toJsonStr(body.portfolioCompanies),
      portfolioConflictSectors: toJsonStr(body.portfolioConflictSectors),
      declinedSectors: toJsonStr(body.declinedSectors),
      coInvestors: toJsonStr(body.coInvestors),
      lpTypes: toJsonStr(body.lpTypes),
    };

    const investor = await prisma.investorProfile.create({ data });

    return NextResponse.json({
      investor: serializeInvestor(investor as unknown as Record<string, unknown>),
    });
  } catch (err) {
    console.error("Failed to create investor:", err);
    return NextResponse.json(
      { error: "Failed to create investor profile" },
      { status: 500 },
    );
  }
}
