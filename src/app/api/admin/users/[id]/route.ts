import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

const VALID_PLANS = ["starter", "pro", "growth", "enterprise"] as const;
const VALID_ROLES = ["user", "admin"] as const;
const PAID_PLANS: string[] = ["pro", "growth", "enterprise"];

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updates: Record<string, unknown> = {};

    if (body.plan !== undefined) {
      if (!VALID_PLANS.includes(body.plan)) {
        return NextResponse.json(
          { error: `Invalid plan. Must be one of: ${VALID_PLANS.join(", ")}` },
          { status: 400 }
        );
      }
      updates.plan = body.plan;
    }

    if (body.role !== undefined) {
      if (!VALID_ROLES.includes(body.role)) {
        return NextResponse.json(
          { error: `Invalid role. Must be one of: ${VALID_ROLES.join(", ")}` },
          { status: 400 }
        );
      }
      updates.role = body.role;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update. Provide 'plan' or 'role'." },
        { status: 400 }
      );
    }

    // Handle plan-specific side effects
    if (updates.plan) {
      const newPlan = updates.plan as string;

      if (newPlan === "starter") {
        // Downgrading to starter: clear subscription info
        updates.stripeSubscriptionId = null;
        updates.planExpiresAt = null;
      } else {
        // Admin setting a paid plan without Stripe: no expiry
        updates.planExpiresAt = null;
      }
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updates,
      select: { id: true, email: true, role: true, plan: true, createdAt: true },
    });

    // Update isPremium flag on all user's decks when plan changes
    if (updates.plan) {
      const isPremium = PAID_PLANS.includes(updates.plan as string);
      await prisma.deck.updateMany({
        where: { userId: params.id },
        data: { isPremium },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
}
