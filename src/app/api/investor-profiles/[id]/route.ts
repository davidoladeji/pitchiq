import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";

/**
 * GET /api/investor-profiles/[id] — fetch a single investor profile with full details
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const profile = await prisma.investorProfile.findUnique({
    where: { id: params.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Parse JSON fields
  const parse = (v: string | null) => { try { return JSON.parse(v || "[]"); } catch { return []; } };

  return NextResponse.json({
    id: profile.id,
    name: profile.name,
    type: profile.type,
    website: profile.website,
    logoUrl: profile.logoUrl,
    description: profile.description,
    thesis: profile.thesis,
    stages: parse(profile.stages),
    sectors: parse(profile.sectors),
    geographies: parse(profile.geographies),
    chequeMin: profile.chequeMin,
    chequeMax: profile.chequeMax,
    country: profile.country,
    city: profile.city,
    businessModels: parse(profile.businessModels),
    revenueModels: parse(profile.revenueModels),
    customerTypes: parse(profile.customerTypes),
    dealStructures: parse(profile.dealStructures),
    valuationMin: profile.valuationMin,
    valuationMax: profile.valuationMax,
    minRevenue: profile.minRevenue,
    minGrowthRate: profile.minGrowthRate,
    fundSize: profile.fundSize,
    fundVintage: profile.fundVintage,
    deploymentPace: profile.deploymentPace,
    averageCheckCount: profile.averageCheckCount,
    leadPreference: profile.leadPreference,
    boardSeatRequired: profile.boardSeatRequired,
    syndicateOpen: profile.syndicateOpen,
    followOnReserve: profile.followOnReserve,
    impactFocus: profile.impactFocus,
    diversityLens: profile.diversityLens,
    thesisKeywords: parse(profile.thesisKeywords),
    portfolioCompanies: parse(profile.portfolioCompanies),
  });
}
