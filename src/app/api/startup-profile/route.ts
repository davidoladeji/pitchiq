import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-limits";

export const dynamic = "force-dynamic";

/**
 * GET /api/startup-profile — return the authenticated user's startup profile
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
    const limits = getPlanLimits(user?.plan ?? "starter");
    if (!limits.investorCRM) {
      return NextResponse.json({ error: "Upgrade to Growth to access Startup Profile" }, { status: 403 });
    }

    const profile = await prisma.startupProfile.findUnique({ where: { userId } });
    return NextResponse.json({ profile });
  } catch (error) {
    console.error("[startup-profile] GET error:", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

/**
 * POST /api/startup-profile — create or update the startup profile
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;
    if (!userId) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
    const limits = getPlanLimits(user?.plan ?? "starter");
    if (!limits.investorCRM) {
      return NextResponse.json({ error: "Upgrade to Growth to access Startup Profile" }, { status: 403 });
    }

    const body = await req.json();

    // Validate required fields
    const { companyName, country, industry, stage } = body;
    const missing: string[] = [];
    if (!companyName?.trim()) missing.push("companyName");
    if (!country?.trim()) missing.push("country");
    if (!industry?.trim()) missing.push("industry");
    if (!stage?.trim()) missing.push("stage");
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 },
      );
    }

    const data = {
      companyName: companyName.trim(),
      tagline: body.tagline?.trim() || null,
      country: country.trim(),
      city: body.city?.trim() || null,
      currency: body.currency?.trim() || "USD",
      industry: industry.trim(),
      sectors: typeof body.sectors === "string" ? body.sectors : JSON.stringify(body.sectors ?? []),
      businessModel: body.businessModel || null,
      revenueModel: body.revenueModel || null,
      customerType: body.customerType || null,
      stage: stage.trim(),
      monthlyRevenue: body.monthlyRevenue != null ? Number(body.monthlyRevenue) || null : null,
      annualRevenue: body.annualRevenue != null ? Number(body.annualRevenue) || null : null,
      revenueGrowthRate: body.revenueGrowthRate != null ? Number(body.revenueGrowthRate) || null : null,
      userCount: body.userCount != null ? Math.floor(Number(body.userCount)) || null : null,
      teamSize: body.teamSize != null ? Math.floor(Number(body.teamSize)) || null : null,
      foundedYear: body.foundedYear != null ? Math.floor(Number(body.foundedYear)) || null : null,
      fundingTarget: body.fundingTarget != null ? Number(body.fundingTarget) || null : null,
      dealStructure: body.dealStructure || null,
      preMoneyValuation: body.preMoneyValuation != null ? Number(body.preMoneyValuation) || null : null,
      previousRaised: body.previousRaised != null ? Number(body.previousRaised) || null : null,
      hasLeadInvestor: body.hasLeadInvestor ?? false,
      targetMarkets: typeof body.targetMarkets === "string" ? body.targetMarkets : JSON.stringify(body.targetMarkets ?? []),
      founderCount: body.founderCount != null ? Math.floor(Number(body.founderCount)) || null : null,
      hasRepeatFounder: body.hasRepeatFounder ?? false,
      hasTechnicalFounder: body.hasTechnicalFounder ?? false,
      founderDiversity: typeof body.founderDiversity === "string" ? body.founderDiversity : JSON.stringify(body.founderDiversity ?? []),
      investorTypePrefs: typeof body.investorTypePrefs === "string" ? body.investorTypePrefs : JSON.stringify(body.investorTypePrefs ?? []),
      leadNeeded: body.leadNeeded ?? true,
      boardSeatOk: body.boardSeatOk ?? true,
    };

    const profile = await prisma.startupProfile.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    });

    return NextResponse.json({ profile }, { status: 200 });
  } catch (error) {
    console.error("[startup-profile] POST error:", error);
    return NextResponse.json({ error: "Failed to save profile" }, { status: 500 });
  }
}
