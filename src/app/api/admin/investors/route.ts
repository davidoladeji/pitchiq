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

/** Auto-seed investors if the table is empty so admin never sees a blank page. */
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

  try {
    const data = {
      name: name.trim(),
      type: type.trim(),
      website: body.website ? String(body.website) : null,
      logoUrl: body.logoUrl ? String(body.logoUrl) : null,
      description: body.description ? String(body.description) : null,
      stages: typeof body.stages === "string"
        ? body.stages
        : JSON.stringify(body.stages ?? []),
      sectors: typeof body.sectors === "string"
        ? body.sectors
        : JSON.stringify(body.sectors ?? []),
      geographies: typeof body.geographies === "string"
        ? body.geographies
        : JSON.stringify(body.geographies ?? []),
      chequeMin: body.chequeMin != null ? Number(body.chequeMin) : null,
      chequeMax: body.chequeMax != null ? Number(body.chequeMax) : null,
      thesis: body.thesis ? String(body.thesis) : null,
      notableDeals: typeof body.notableDeals === "string"
        ? body.notableDeals
        : JSON.stringify(body.notableDeals ?? []),
      aum: body.aum ? String(body.aum) : null,
      partnerCount: body.partnerCount != null ? Number(body.partnerCount) : null,
      contactEmail: body.contactEmail ? String(body.contactEmail) : null,
      linkedIn: body.linkedIn ? String(body.linkedIn) : null,
      twitter: body.twitter ? String(body.twitter) : null,
      source: body.source ? String(body.source) : "admin",
      verified: Boolean(body.verified ?? false),
      enabled: body.enabled !== false,
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
