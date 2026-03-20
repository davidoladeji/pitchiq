/**
 * Public plans API — returns enabled plan configs for pricing pages.
 * Strips Stripe-specific fields. Cacheable at CDN edge.
 * Auto-seeds the PlanConfig table on first request if empty.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { invalidatePlanCache } from "@/lib/plan-config";
import { SEED_PLANS } from "@/lib/plan-seed-data";

export const dynamic = "force-dynamic";

/**
 * Auto-seed the PlanConfig table if it's empty.
 * Uses the canonical SEED_PLANS so admin and public surfaces always agree.
 */
async function ensureSeeded() {
  const count = await prisma.planConfig.count();
  if (count > 0) return;

  for (const plan of SEED_PLANS) {
    const { planKey, ...data } = plan;
    await prisma.planConfig.upsert({
      where: { planKey },
      create: { planKey, ...data },
      update: {},            // no-op if row already exists (race condition guard)
    });
  }

  invalidatePlanCache();
}

export async function GET() {
  await ensureSeeded();

  const rows = await prisma.planConfig.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: "asc" },
  });

  const plans = rows.map((row) => ({
    planKey: row.planKey,
    sortOrder: row.sortOrder,
    displayName: row.displayName,
    description: row.description,
    price: row.price,
    priceUnit: row.priceUnit,
    highlight: row.highlight,
    badge: row.badge,
    ctaText: row.ctaText,
    ctaHref: row.ctaHref,
    features: JSON.parse(row.features) as string[],
  }));

  return NextResponse.json(
    { plans },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
