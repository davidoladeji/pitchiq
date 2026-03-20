/**
 * Seed the PlanConfig table from canonical plan data.
 * POST — requireAdmin(), idempotent upsert on planKey.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { invalidatePlanCache } from "@/lib/plan-config";
import { SEED_PLANS } from "@/lib/plan-seed-data";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results: Array<{ planKey: string; id: string }> = [];

    for (const plan of SEED_PLANS) {
      const { planKey, ...data } = plan;

      const upserted = await prisma.planConfig.upsert({
        where: { planKey },
        create: { planKey, ...data },
        update: data,
      });

      results.push({ planKey, id: upserted.id });
    }

    invalidatePlanCache();

    return NextResponse.json({ seeded: results.length, plans: results });
  } catch (err) {
    console.error("Failed to seed plans:", err);
    return NextResponse.json(
      { error: "Failed to seed plans" },
      { status: 500 },
    );
  }
}
