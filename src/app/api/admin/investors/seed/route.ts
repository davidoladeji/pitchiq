/**
 * Seed the InvestorProfile table from canonical investor data.
 * POST — requireAdmin(), idempotent upsert on name.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { SEED_INVESTORS } from "@/lib/investor-seed-data";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results: Array<{ name: string; id: string }> = [];

    for (const investor of SEED_INVESTORS) {
      // Upsert by name — find existing, then create or update
      const existing = await prisma.investorProfile.findFirst({
        where: { name: investor.name },
      });

      if (existing) {
        await prisma.investorProfile.update({
          where: { id: existing.id },
          data: investor,
        });
        results.push({ name: investor.name, id: existing.id });
      } else {
        const created = await prisma.investorProfile.create({
          data: investor,
        });
        results.push({ name: investor.name, id: created.id });
      }
    }

    return NextResponse.json({ seeded: results.length, investors: results });
  } catch (err) {
    console.error("Failed to seed investors:", err);
    return NextResponse.json(
      { error: "Failed to seed investors" },
      { status: 500 },
    );
  }
}
