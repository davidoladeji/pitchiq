/**
 * Investor matching API — scores investors against a deck or startup profile.
 * GET /api/investors/match?deckId=xxx
 * GET /api/investors/match?source=profile
 * Plan-gated to Growth+ (investorCRM).
 */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { checkAccess } from "@/lib/credit-gate";
import {
  rankInvestors,
  deckToMatchInput,
  startupProfileToMatchInput,
  extractSectors,
} from "@/lib/investor-matching";
import type { InvestorForMatching } from "@/lib/investor-matching";
import { SEED_INVESTORS } from "@/lib/investor-seed-data";
import { trackEvent } from "@/lib/analytics/product-events";

export const dynamic = "force-dynamic";

/** Auto-seed investor profiles if the table is empty, and fix corrupted cheque values. */
async function ensureSeeded() {
  const count = await prisma.investorProfile.count();

  if (count === 0) {
    for (const inv of SEED_INVESTORS) {
      try {
        await prisma.investorProfile.create({
          data: {
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
            country: inv.country ?? null,
            city: inv.city ?? null,
            currencies: inv.currencies ?? "[]",
            businessModels: inv.businessModels ?? "[]",
            revenueModels: inv.revenueModels ?? "[]",
            customerTypes: inv.customerTypes ?? "[]",
            dealStructures: inv.dealStructures ?? "[]",
            thesisKeywords: inv.thesisKeywords ?? "[]",
            portfolioCompanies: inv.portfolioCompanies ?? "[]",
            portfolioConflictSectors: inv.portfolioConflictSectors ?? "[]",
            declinedSectors: inv.declinedSectors ?? "[]",
            coInvestors: inv.coInvestors ?? "[]",
            lpTypes: inv.lpTypes ?? "[]",
            fundVintage: inv.fundVintage ?? null,
            fundSize: inv.fundSize ?? null,
            deploymentPace: inv.deploymentPace ?? null,
            leadPreference: inv.leadPreference ?? null,
            impactFocus: inv.impactFocus ?? false,
            diversityLens: inv.diversityLens ?? false,
          },
        });
      } catch (e) {
        console.error(`Failed to seed ${inv.name}:`, e);
      }
    }
    return;
  }

  // Back-fill: fix corrupted cheque values (null, zero, or denormalized floats < $1)
  try {
    const seedRows = await prisma.investorProfile.findMany({
      where: { source: "seed" },
      select: { id: true, name: true, chequeMin: true, chequeMax: true },
    });
    const seedMap = new Map(SEED_INVESTORS.map((s) => [s.name, s]));
    for (const row of seedRows) {
      const seed = seedMap.get(row.name);
      if (!seed || (seed.chequeMin == null && seed.chequeMax == null)) continue;
      const minBad = row.chequeMin == null || row.chequeMin < 1;
      const maxBad = row.chequeMax == null || row.chequeMax < 1;
      if (minBad || maxBad) {
        await prisma.investorProfile.update({
          where: { id: row.id },
          data: { chequeMin: seed.chequeMin ?? null, chequeMax: seed.chequeMax ?? null },
        });
      }
    }
  } catch (e) {
    console.error("Failed to back-fill cheque values:", e);
  }
}

function parseJsonField(val: string | null): string[] {
  if (!val) return [];
  try {
    return JSON.parse(val) as string[];
  } catch {
    return [];
  }
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const source = req.nextUrl.searchParams.get("source");
  const deckId = req.nextUrl.searchParams.get("deckId");

  const gate = await checkAccess(session.user.id, "investor_match", { resourceId: deckId || undefined, description: "Investor matching" });
  if (!gate.allowed) {
    return NextResponse.json(
      { error: gate.error || "Investor matching requires Growth plan, a pass, or credits.", upgradeOptions: gate.upgradeOptions },
      { status: 403 },
    );
  }
  const profileId = req.nextUrl.searchParams.get("profileId");

  // Build match input from either startup profile or deck
  let matchInput;
  let matchSource: "profile" | "deck" = "deck";

  if (source === "profile") {
    // Fetch startup profile — specific or most recent
    const profile = profileId
      ? await prisma.startupProfile.findUnique({ where: { id: profileId } })
      : await prisma.startupProfile.findFirst({
          where: { userId: session.user.id },
          orderBy: { updatedAt: "desc" },
        });
    if (profile && profile.userId !== session.user.id) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }
    if (!profile) {
      return NextResponse.json(
        { error: "No startup profile found. Create one first." },
        { status: 404 },
      );
    }

    let sectorList: string[] = [];
    try { sectorList = JSON.parse(profile.sectors); } catch { /* ignore */ }
    if (sectorList.length === 0) {
      sectorList = extractSectors(profile.industry);
    }

    let investorTypePrefs: string[] = [];
    try { investorTypePrefs = JSON.parse(profile.investorTypePrefs); } catch { /* ignore */ }

    let founderDiv: string[] = [];
    try { founderDiv = JSON.parse(profile.founderDiversity); } catch { /* ignore */ }

    let targetMarkets: string[] = [];
    try { targetMarkets = JSON.parse(profile.targetMarkets); } catch { /* ignore */ }

    matchInput = startupProfileToMatchInput({
      stage: profile.stage,
      sectors: sectorList,
      country: profile.country,
      city: profile.city ?? undefined,
      currency: profile.currency ?? undefined,
      askAmount: profile.fundingTarget ?? 0,
      targetMarkets,
      businessModel: profile.businessModel ?? undefined,
      revenueModel: profile.revenueModel ?? undefined,
      customerType: profile.customerType ?? undefined,
      monthlyRevenue: profile.monthlyRevenue ?? undefined,
      revenueGrowthRate: profile.revenueGrowthRate ?? undefined,
      dealStructure: profile.dealStructure ?? undefined,
      preMoneyValuation: profile.preMoneyValuation ?? undefined,
      teamSize: profile.teamSize ?? undefined,
      founderDiversity: founderDiv,
      hasRepeatFounder: profile.hasRepeatFounder,
      hasTechnicalFounder: profile.hasTechnicalFounder,
      leadNeeded: profile.leadNeeded,
      boardSeatOk: profile.boardSeatOk,
      investorType: investorTypePrefs[0],
    });
    matchSource = "profile";
  } else {
    // Deck-based matching (legacy path)
    if (!deckId) {
      return NextResponse.json(
        { error: "deckId query parameter is required when source is not 'profile'." },
        { status: 400 },
      );
    }

    const deck = await prisma.deck.findFirst({
      where: { id: deckId, userId: session.user.id },
      select: {
        stage: true,
        industry: true,
        fundingTarget: true,
        investorType: true,
        country: true,
        city: true,
        currency: true,
        businessModel: true,
        revenueModel: true,
        customerType: true,
        monthlyRevenue: true,
        revenueGrowthRate: true,
        dealStructure: true,
        preMoneyValuation: true,
        teamSize: true,
        hasLeadInvestor: true,
        founderDiversity: true,
        targetMarkets: true,
      },
    });
    if (!deck) {
      return NextResponse.json(
        { error: "Deck not found or not owned by you." },
        { status: 404 },
      );
    }

    let founderDiv: string[] = [];
    if (deck.founderDiversity) {
      try { founderDiv = JSON.parse(deck.founderDiversity); } catch { /* ignore */ }
    }
    let targetMarkets: string[] = [];
    if (deck.targetMarkets) {
      try { targetMarkets = JSON.parse(deck.targetMarkets); } catch { /* ignore */ }
    }

    matchInput = deckToMatchInput({
      stage: deck.stage,
      industry: deck.industry,
      fundingTarget: deck.fundingTarget,
      investorType: deck.investorType,
      country: deck.country ?? undefined,
      city: deck.city ?? undefined,
      currency: deck.currency ?? undefined,
      businessModel: deck.businessModel ?? undefined,
      revenueModel: deck.revenueModel ?? undefined,
      customerType: deck.customerType ?? undefined,
      monthlyRevenue: deck.monthlyRevenue ?? undefined,
      revenueGrowthRate: deck.revenueGrowthRate ?? undefined,
      dealStructure: deck.dealStructure ?? undefined,
      preMoneyValuation: deck.preMoneyValuation ?? undefined,
      teamSize: deck.teamSize ?? undefined,
      founderDiversity: founderDiv,
      hasRepeatFounder: undefined,
      hasTechnicalFounder: undefined,
      leadNeeded: deck.hasLeadInvestor === true ? false : undefined,
      boardSeatOk: undefined,
      targetMarkets,
    });
  }

  await ensureSeeded();

  // Load enabled investor profiles with all fields
  const rows = await prisma.investorProfile.findMany({
    where: { enabled: true },
  });

  const investors: InvestorForMatching[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    type: r.type,
    description: r.description,
    website: r.website,
    stages: parseJsonField(r.stages),
    sectors: parseJsonField(r.sectors),
    geographies: parseJsonField(r.geographies),
    chequeMin: r.chequeMin,
    chequeMax: r.chequeMax,
    thesis: r.thesis,
    notableDeals: parseJsonField(r.notableDeals),
    aum: r.aum,
    verified: r.verified,
    // Extended fields
    country: r.country,
    city: r.city,
    currencies: parseJsonField(r.currencies),
    businessModels: parseJsonField(r.businessModels),
    revenueModels: parseJsonField(r.revenueModels),
    customerTypes: parseJsonField(r.customerTypes),
    dealStructures: parseJsonField(r.dealStructures),
    thesisKeywords: parseJsonField(r.thesisKeywords),
    portfolioCompanies: parseJsonField(r.portfolioCompanies),
    portfolioConflictSectors: parseJsonField(r.portfolioConflictSectors),
    declinedSectors: parseJsonField(r.declinedSectors),
    deploymentPace: r.deploymentPace,
    leadPreference: r.leadPreference,
    impactFocus: r.impactFocus,
    diversityLens: r.diversityLens,
    fundSize: r.fundSize,
    fundVintage: r.fundVintage,
    minRevenue: r.minRevenue,
    minGrowthRate: r.minGrowthRate,
    minTeamSize: r.minTeamSize,
    valuationMin: r.valuationMin,
    valuationMax: r.valuationMax,
    boardSeatRequired: r.boardSeatRequired,
    lastActiveDate: r.lastActiveDate?.toISOString() ?? null,
    coInvestors: parseJsonField(r.coInvestors),
  }));

  // Build a lookup for extra display fields not on InvestorForMatching
  const extraFieldsMap = new Map(rows.map((r) => [r.id, {
    contactEmail: r.contactEmail,
    linkedIn: r.linkedIn,
    twitter: r.twitter,
    logoUrl: r.logoUrl,
    partnerCount: r.partnerCount,
    avgResponseDays: r.avgResponseDays,
    avgCloseWeeks: r.avgCloseWeeks,
    syndicateOpen: r.syndicateOpen,
    followOnReserve: r.followOnReserve,
    portfolioCompanies: parseJsonField(r.portfolioCompanies),
  }]));

  const matches = rankInvestors(investors, matchInput);

  // Record match events
  try {
    const matchEventsData = matches.slice(0, 50).map((m) => ({
      userId: session.user!.id!,
      investorProfileId: m.investor.id,
      deckId: deckId || null,
      fitScore: m.fitScore,
      action: "viewed" as const,
    }));
    if (matchEventsData.length > 0) {
      await prisma.matchEvent.createMany({ data: matchEventsData });
    }
  } catch {
    // Non-critical — don't block response
  }

  trackEvent({ event: "investor.matched", properties: { count: matches.length, source: matchSource } });

  return NextResponse.json({
    deckId: deckId || null,
    source: matchSource,
    input: matchInput,
    matches: matches.map((m) => {
      const extra = extraFieldsMap.get(m.investor.id);
      return {
        investorId: m.investor.id,
        name: m.investor.name,
        type: m.investor.type,
        description: m.investor.description,
        website: m.investor.website,
        fitScore: m.fitScore,
        topReasons: m.topReasons,
        reasons: m.reasons,
        warnings: m.warnings,
        dealbreakers: m.dealbreakers,
        compatibilityLabel: m.compatibilityLabel,
        notableDeals: m.investor.notableDeals,
        aum: m.investor.aum,
        verified: m.investor.verified,
        stages: m.investor.stages,
        sectors: m.investor.sectors,
        geographies: m.investor.geographies,
        chequeMin: m.investor.chequeMin,
        chequeMax: m.investor.chequeMax,
        // Extended fields for detail modal
        country: m.investor.country,
        city: m.investor.city,
        thesis: m.investor.thesis,
        fundSize: m.investor.fundSize,
        leadPreference: m.investor.leadPreference,
        deploymentPace: m.investor.deploymentPace,
        portfolioCompanies: extra?.portfolioCompanies ?? [],
        linkedIn: extra?.linkedIn ?? null,
        twitter: extra?.twitter ?? null,
        contactEmail: extra?.contactEmail ?? null,
        logoUrl: extra?.logoUrl ?? null,
        coInvestors: m.investor.coInvestors,
        avgResponseDays: extra?.avgResponseDays ?? null,
        avgCloseWeeks: extra?.avgCloseWeeks ?? null,
      };
    }),
    total: matches.length,
  });
}
