/**
 * Admin PAYG pass extension API.
 * POST — extend a pass by N days.
 * Body: { days: number }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    let body: { days?: number };
    try {
      body = (await req.json()) as { days?: number };
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const days = Number(body.days);
    if (!days || days < 1 || days > 365) {
      return NextResponse.json(
        { error: "days must be between 1 and 365" },
        { status: 400 },
      );
    }

    const pass = await prisma.periodPass.findUnique({ where: { id } });
    if (!pass) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    const baseTime = Math.max(pass.expiresAt.getTime(), Date.now());
    const newExpiresAt = new Date(baseTime + days * 86_400_000);

    const updated = await prisma.periodPass.update({
      where: { id },
      data: { expiresAt: newExpiresAt, status: "active" },
    });

    return NextResponse.json({ pass: updated });
  } catch (err) {
    console.error("[admin/payg/passes/extend] Error:", err);
    return NextResponse.json(
      { error: "Failed to extend pass" },
      { status: 500 },
    );
  }
}
