/**
 * Admin: Create a test/manual period pass.
 * POST { email: string, tier: "basic"|"growth"|"full", durationDays: number }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { email, tier, durationDays } = body as {
      email?: string;
      tier?: string;
      durationDays?: number;
    };

    if (!email || !tier || !durationDays) {
      return NextResponse.json(
        { error: "email, tier, and durationDays are required" },
        { status: 400 },
      );
    }

    if (!["basic", "growth", "full"].includes(tier)) {
      return NextResponse.json(
        { error: "tier must be basic, growth, or full" },
        { status: 400 },
      );
    }

    if (durationDays < 1 || durationDays > 365) {
      return NextResponse.json(
        { error: "durationDays must be 1-365" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: `No user found with email: ${email}` },
        { status: 404 },
      );
    }

    const now = new Date();
    const pass = await prisma.periodPass.create({
      data: {
        userId: user.id,
        tier,
        startsAt: now,
        expiresAt: new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000),
        durationDays,
        amountCents: 0, // Manual/test pass — no charge
        currency: "usd",
        status: "active",
      },
      include: {
        user: { select: { email: true, name: true } },
      },
    });

    return NextResponse.json({ pass });
  } catch (err) {
    console.error("[admin/payg/passes/create] Error:", err);
    return NextResponse.json(
      { error: "Failed to create pass" },
      { status: 500 },
    );
  }
}
