/**
 * Seed the InvestorProfile table from canonical investor data.
 * POST — requireAdmin(), idempotent upsert on name.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { SEED_INVESTORS, SeedInvestor } from "@/lib/investor-seed-data";

export const dynamic = "force-dynamic";

function buildData(inv: SeedInvestor) {
  return {
    name: inv.name,
    type: inv.type,
    website: inv.website ?? null,
    description: inv.description ?? null,
    stages: inv.stages,
    sectors: inv.sectors,
    geographies: inv.geographies,
    chequeMin: inv.chequeMin ?? null,
    chequeMax: inv.chequeMax ?? null,
    thesis: inv.thesis ?? null,
    notableDeals: inv.notableDeals,
    aum: inv.aum ?? null,
    partnerCount: inv.partnerCount ?? null,
    linkedIn: inv.linkedIn ?? null,
    twitter: inv.twitter ?? null,
    source: inv.source,
    verified: inv.verified,
    enabled: inv.enabled,
    // New expanded fields
    country: inv.country ?? null,
    city: inv.city ?? null,
    currencies: inv.currencies ?? "[]",
    businessModels: inv.businessModels ?? "[]",
    revenueModels: inv.revenueModels ?? "[]",
    customerTypes: inv.customerTypes ?? "[]",
    dealStructures: inv.dealStructures ?? "[]",
    valuationMin: inv.valuationMin ?? null,
    valuationMax: inv.valuationMax ?? null,
    minRevenue: inv.minRevenue ?? null,
    minGrowthRate: inv.minGrowthRate ?? null,
    minTeamSize: inv.minTeamSize ?? null,
    fundVintage: inv.fundVintage ?? null,
    fundSize: inv.fundSize ?? null,
    deploymentPace: inv.deploymentPace ?? null,
    averageCheckCount: inv.averageCheckCount ?? null,
    leadPreference: inv.leadPreference ?? null,
    boardSeatRequired: inv.boardSeatRequired ?? false,
    syndicateOpen: inv.syndicateOpen ?? false,
    followOnReserve: inv.followOnReserve ?? true,
    impactFocus: inv.impactFocus ?? false,
    diversityLens: inv.diversityLens ?? false,
    thesisKeywords: inv.thesisKeywords ?? "[]",
    portfolioCompanies: inv.portfolioCompanies ?? "[]",
    portfolioConflictSectors: inv.portfolioConflictSectors ?? "[]",
    declinedSectors: inv.declinedSectors ?? "[]",
    coInvestors: inv.coInvestors ?? "[]",
    lpTypes: inv.lpTypes ?? "[]",
    avgResponseDays: inv.avgResponseDays ?? null,
    avgCloseWeeks: inv.avgCloseWeeks ?? null,
  };
}

export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results: Array<{ name: string; id: string }> = [];

    for (const investor of SEED_INVESTORS) {
      const data = buildData(investor);

      // Upsert by name — find existing, then create or update
      const existing = await prisma.investorProfile.findFirst({
        where: { name: investor.name },
      });

      if (existing) {
        await prisma.investorProfile.update({
          where: { id: existing.id },
          data,
        });
        results.push({ name: investor.name, id: existing.id });
      } else {
        const created = await prisma.investorProfile.create({ data });
        results.push({ name: investor.name, id: created.id });
      }
    }

    return NextResponse.json({ seeded: results.length, investors: results });
  } catch (err) {
    console.error("Failed to seed investors:", err);
    return NextResponse.json(
      { error: "Failed to seed investors", detail: err instanceof Error ? err.message : "unknown" },
      { status: 500 },
    );
  }
}
