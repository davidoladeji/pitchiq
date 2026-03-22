/**
 * Admin PAYG pass revocation API.
 * POST — revoke (refund status) a pass.
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const pass = await prisma.periodPass.findUnique({ where: { id } });
    if (!pass) {
      return NextResponse.json({ error: "Pass not found" }, { status: 404 });
    }

    const updated = await prisma.periodPass.update({
      where: { id },
      data: { status: "refunded" },
    });

    return NextResponse.json({ pass: updated });
  } catch (err) {
    console.error("[admin/payg/passes/revoke] Error:", err);
    return NextResponse.json(
      { error: "Failed to revoke pass" },
      { status: 500 },
    );
  }
}
