/**
 * Admin investor profile management — single investor.
 * PATCH  — update an investor profile by ID
 * DELETE — delete an investor profile by ID
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Build partial update data — only include provided fields
  const data: Record<string, unknown> = {};

  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.type !== undefined) data.type = String(body.type).trim();
  if (body.website !== undefined) data.website = body.website ? String(body.website) : null;
  if (body.logoUrl !== undefined) data.logoUrl = body.logoUrl ? String(body.logoUrl) : null;
  if (body.description !== undefined) data.description = body.description ? String(body.description) : null;

  if (body.stages !== undefined) {
    data.stages = typeof body.stages === "string"
      ? body.stages
      : JSON.stringify(body.stages);
  }
  if (body.sectors !== undefined) {
    data.sectors = typeof body.sectors === "string"
      ? body.sectors
      : JSON.stringify(body.sectors);
  }
  if (body.geographies !== undefined) {
    data.geographies = typeof body.geographies === "string"
      ? body.geographies
      : JSON.stringify(body.geographies);
  }

  if (body.chequeMin !== undefined) data.chequeMin = body.chequeMin != null ? Number(body.chequeMin) : null;
  if (body.chequeMax !== undefined) data.chequeMax = body.chequeMax != null ? Number(body.chequeMax) : null;
  if (body.thesis !== undefined) data.thesis = body.thesis ? String(body.thesis) : null;

  if (body.notableDeals !== undefined) {
    data.notableDeals = typeof body.notableDeals === "string"
      ? body.notableDeals
      : JSON.stringify(body.notableDeals);
  }

  if (body.aum !== undefined) data.aum = body.aum ? String(body.aum) : null;
  if (body.partnerCount !== undefined) data.partnerCount = body.partnerCount != null ? Number(body.partnerCount) : null;
  if (body.contactEmail !== undefined) data.contactEmail = body.contactEmail ? String(body.contactEmail) : null;
  if (body.linkedIn !== undefined) data.linkedIn = body.linkedIn ? String(body.linkedIn) : null;
  if (body.twitter !== undefined) data.twitter = body.twitter ? String(body.twitter) : null;
  if (body.source !== undefined) data.source = String(body.source);
  if (body.verified !== undefined) data.verified = Boolean(body.verified);
  if (body.enabled !== undefined) data.enabled = Boolean(body.enabled);

  try {
    const investor = await prisma.investorProfile.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      investor: serializeInvestor(investor as unknown as Record<string, unknown>),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("Record to update not found")) {
      return NextResponse.json({ error: "Investor not found" }, { status: 404 });
    }
    console.error("Failed to update investor:", err);
    return NextResponse.json(
      { error: "Failed to update investor profile" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    await prisma.investorProfile.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    if (message.includes("Record to delete does not exist")) {
      return NextResponse.json({ error: "Investor not found" }, { status: 404 });
    }
    console.error("Failed to delete investor:", err);
    return NextResponse.json(
      { error: "Failed to delete investor profile" },
      { status: 500 },
    );
  }
}
