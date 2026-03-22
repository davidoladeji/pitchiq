/**
 * Admin PAYG pricing configuration API.
 * GET  — return current pricing config (merged with defaults)
 * PUT  — update pricing config (save to PaygConfig table)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import {
  getPaygConfig,
  type PassTier,
  type CreditPack,
  type CreditAction,
} from "@/lib/payg-config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const config = await getPaygConfig();
    return NextResponse.json(config);
  } catch (err) {
    console.error("[admin/payg/pricing] GET Error:", err);
    return NextResponse.json(
      { error: "Failed to load pricing config" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let body: {
      passTiers?: PassTier[];
      creditPacks?: CreditPack[];
      creditActions?: CreditAction[];
    };
    try {
      body = (await req.json()) as {
        passTiers?: PassTier[];
        creditPacks?: CreditPack[];
        creditActions?: CreditAction[];
      };
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const updates: { key: string; value: string }[] = [];

    if (body.passTiers) {
      updates.push({ key: "passTiers", value: JSON.stringify(body.passTiers) });
    }
    if (body.creditPacks) {
      updates.push({
        key: "creditPacks",
        value: JSON.stringify(body.creditPacks),
      });
    }
    if (body.creditActions) {
      updates.push({
        key: "creditActions",
        value: JSON.stringify(body.creditActions),
      });
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { error: "No pricing data provided" },
        { status: 400 },
      );
    }

    for (const { key, value } of updates) {
      await prisma.paygConfig.upsert({
        where: { key },
        create: { key, value },
        update: { value },
      });
    }

    // Return the freshly merged config
    const config = await getPaygConfig();
    return NextResponse.json(config);
  } catch (err) {
    console.error("[admin/payg/pricing] PUT Error:", err);
    return NextResponse.json(
      { error: "Failed to update pricing config" },
      { status: 500 },
    );
  }
}
