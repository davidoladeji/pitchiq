/**
 * Admin PAYG passes API.
 * GET — list all passes with user info.
 * Query params: status (active/expired/all), tier, limit (default 50)
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { Prisma } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") ?? "all";
    const tier = url.searchParams.get("tier");
    const limit = Math.min(Number(url.searchParams.get("limit") ?? 50), 200);

    const where: Prisma.PeriodPassWhereInput = {};

    if (status && status !== "all") {
      where.status = status;
    }
    if (tier) {
      where.tier = tier;
    }

    const passes = await prisma.periodPass.findMany({
      where,
      include: {
        user: { select: { email: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });

    return NextResponse.json({ passes });
  } catch (err) {
    console.error("[admin/payg/passes] Error:", err);
    return NextResponse.json(
      { error: "Failed to load passes" },
      { status: 500 },
    );
  }
}
