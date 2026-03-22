/**
 * Admin credit grant API.
 * POST — grant credits to a user.
 * Body: { userId: string, amount: number, reason?: string }
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { addCredits } from "@/lib/credits";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let body: { userId?: string; amount?: number; reason?: string };
    try {
      body = (await req.json()) as {
        userId?: string;
        amount?: number;
        reason?: string;
      };
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const { userId, amount, reason } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "userId is required" },
        { status: 400 },
      );
    }

    if (!amount || typeof amount !== "number" || amount < 1 || amount > 10000) {
      return NextResponse.json(
        { error: "amount must be between 1 and 10000" },
        { status: 400 },
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { newBalance } = await addCredits(userId, amount, "bonus", {
      description: reason || `Admin granted ${amount} credits`,
    });

    return NextResponse.json({
      success: true,
      userId,
      email: user.email,
      granted: amount,
      newBalance,
    });
  } catch (err) {
    console.error("[admin/payg/credits/grant] Error:", err);
    return NextResponse.json(
      { error: "Failed to grant credits" },
      { status: 500 },
    );
  }
}
