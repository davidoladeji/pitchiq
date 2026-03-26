/**
 * GET /api/v2/dashboard — All data needed by the v2 dashboard in one call.
 *
 * Returns: stats, decks, activities, analytics (daily views), investor matches,
 * fundraise pipeline, practice sessions, AB tests, and PAYG/credit status.
 *
 * Each section is fetched with Promise.allSettled so individual failures
 * don't crash the whole dashboard.
 */
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results = await Promise.allSettled([
    // 0: Decks
    prisma.deck.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, shareId: true, title: true, companyName: true,
        themeId: true, piqScore: true, isPremium: true, createdAt: true,
        industry: true, stage: true, fundingTarget: true, investorType: true,
        _count: { select: { views: true } },
      },
    }),
    // 1: Recent views for activity feed
    prisma.view.findMany({
      where: { deck: { userId } },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true, createdAt: true,
        deck: { select: { title: true, shareId: true } },
      },
    }),
    // 2: Investor matches (from InvestorProfile)
    prisma.investorProfile.findMany({
      take: 5,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true, name: true, type: true,
        description: true, logoUrl: true, sectors: true, stages: true,
      },
    }),
    // 3: Investor CRM contacts
    prisma.investorContact.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      take: 20,
      select: {
        id: true, name: true, firm: true, email: true,
        status: true, notes: true, updatedAt: true,
      },
    }),
    // 4: Practice sessions
    prisma.pitchPracticeSession.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true, createdAt: true, duration: true, aiFeedback: true,
        deck: { select: { shareId: true, title: true } },
      },
    }),
    // 5: AB tests
    prisma.aBTest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true, shareSlug: true, deckAId: true, deckBId: true, createdAt: true,
      },
    }),
    // 6: User info
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        plan: true, creditBalance: true, name: true,
      },
    }),
    // 7: Daily views for analytics chart (last 30 days)
    prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*)::int as value
      FROM "View"
      WHERE "deckId" IN (SELECT id FROM "Deck" WHERE "userId" = ${userId})
        AND "createdAt" > NOW() - INTERVAL '30 days'
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    ` as Promise<{ date: Date; value: number }[]>,
  ]);

  // Extract results with safe fallbacks
  const decks = results[0].status === "fulfilled" ? results[0].value : [];
  const recentViews = results[1].status === "fulfilled" ? results[1].value : [];
  const investorProfiles = results[2].status === "fulfilled" ? results[2].value : [];
  const crmContacts = results[3].status === "fulfilled" ? results[3].value : [];
  const practiceSessions = results[4].status === "fulfilled" ? results[4].value : [];
  const abTests = results[5].status === "fulfilled" ? results[5].value : [];
  const user = results[6].status === "fulfilled" ? results[6].value : null;
  const dailyViewsRaw = results[7].status === "fulfilled" ? results[7].value : [];

  // ── Transform decks ──
  const deckItems = decks.map((d) => {
    let score = 0;
    try { score = JSON.parse(d.piqScore)?.overall || 0; } catch { /* */ }
    return {
      id: d.shareId,
      title: d.title,
      companyName: d.companyName,
      score,
      views: d._count.views,
      theme: d.themeId,
      isPremium: d.isPremium,
      updatedAt: d.createdAt.toISOString(),
      createdAt: d.createdAt.toISOString(),
    };
  });

  // ── Compute stats ──
  const totalViews = deckItems.reduce((s, d) => s + d.views, 0);
  const scoredDecks = deckItems.filter((d) => d.score > 0);
  const avgScore = scoredDecks.length > 0
    ? Math.round(scoredDecks.reduce((s, d) => s + d.score, 0) / scoredDecks.length)
    : 0;
  const bestDeck = scoredDecks.sort((a, b) => b.score - a.score)[0];

  const stats = {
    totalDecks: deckItems.length,
    totalViews,
    avgScore,
    bestScore: bestDeck?.score || 0,
    bestDeckTitle: bestDeck?.title || "",
  };

  // ── Activity feed ──
  const activities = recentViews.map((v) => ({
    id: v.id,
    type: "view" as const,
    message: `Someone viewed ${v.deck.title}`,
    timestamp: v.createdAt.toISOString(),
    deckId: v.deck.shareId,
  }));

  // ── Daily views for chart ──
  const dailyViews = dailyViewsRaw.map((d) => ({
    date: typeof d.date === "string" ? d.date : new Date(d.date).toISOString().split("T")[0],
    value: Number(d.value),
  }));

  // Fill in missing days with 0
  const filledDailyViews = fillMissingDays(dailyViews, 30);

  // ── Investor matches (with deterministic fit scoring) ──
  // Collect user's industries and stages from their decks for matching
  const userIndustries = new Set(decks.map((d) => d.industry?.toLowerCase()).filter(Boolean));
  const userStages = new Set(decks.map((d) => d.stage?.toLowerCase()).filter(Boolean));

  const investors = investorProfiles.map((ip) => {
    let sectors: string[] = [];
    let stages: string[] = [];
    try { sectors = JSON.parse(ip.sectors || "[]"); } catch { /* */ }
    try { stages = JSON.parse(ip.stages || "[]"); } catch { /* */ }

    // Compute fit score: sector overlap (40pts) + stage overlap (40pts) + base (20pts)
    const sectorOverlap = sectors.filter((s) => userIndustries.has(s.toLowerCase())).length;
    const stageOverlap = stages.filter((s) => userStages.has(s.toLowerCase())).length;
    const sectorScore = sectors.length > 0 ? Math.min(40, (sectorOverlap / sectors.length) * 40) : 20;
    const stageScore = stages.length > 0 ? Math.min(40, (stageOverlap / stages.length) * 40) : 20;
    const fitScore = Math.round(20 + sectorScore + stageScore);

    // Build match reasons from actual overlapping sectors
    const matchReasons = sectors.filter((s) => userIndustries.has(s.toLowerCase())).slice(0, 2);
    if (matchReasons.length === 0 && sectors.length > 0) matchReasons.push(sectors[0]);
    if (stageOverlap > 0) {
      const matchedStage = stages.find((s) => userStages.has(s.toLowerCase()));
      if (matchedStage) matchReasons.push(`Invests at ${matchedStage}`);
    }

    return {
      id: ip.id,
      name: ip.name || "Unknown",
      type: ip.type || "vc",
      fitScore: Math.min(99, Math.max(20, fitScore)),
      matchReasons: matchReasons.length > 0 ? matchReasons : ["General match"],
      avatarUrl: ip.logoUrl || undefined,
    };
  })
  // Sort by fit score descending so best matches show first
  .sort((a, b) => b.fitScore - a.fitScore);

  // ── Fundraise pipeline (from CRM contacts by status) ──
  const stageMap: Record<string, number> = {};
  for (const c of crmContacts) {
    const stage = c.status || "identified";
    stageMap[stage] = (stageMap[stage] || 0) + 1;
  }
  const fundraise = {
    identified: stageMap["identified"] || 0,
    contacted: stageMap["contacted"] || 0,
    meeting: stageMap["meeting"] || 0,
    dueDiligence: stageMap["due_diligence"] || stageMap["dueDiligence"] || 0,
    termSheet: stageMap["term_sheet"] || stageMap["termSheet"] || 0,
  };

  // ── CRM contacts ──
  const investorContacts = crmContacts.map((c) => ({
    id: c.id,
    name: c.name,
    firm: c.firm || "",
    email: c.email || "",
    stage: c.status || "identified",
    notes: c.notes || "",
    lastUpdated: c.updatedAt.toISOString(),
  }));

  // ── Practice sessions ──
  const practice = practiceSessions.map((s) => {
    let feedback: { overall?: number; clarity?: number; pacing?: number; confidence?: number } = {};
    try { feedback = JSON.parse(s.aiFeedback || "{}"); } catch { /* */ }
    return {
      id: s.id,
      deckId: s.deck?.shareId || "",
      deckTitle: s.deck?.title || "Untitled",
      date: s.createdAt.toISOString(),
      durationSeconds: s.duration || 0,
      overallScore: feedback.overall || 0,
      clarity: feedback.clarity || 0,
      pacing: feedback.pacing || 0,
      confidence: feedback.confidence || 0,
    };
  });

  // ── AB Tests ──
  const abTestItems = abTests.map((t) => ({
    id: t.id,
    deckId: t.deckAId,
    deckTitle: t.shareSlug,
    status: "active" as const,
    startedAt: t.createdAt.toISOString(),
    variantA: { views: 0, avgTimeSeconds: 0 },
    variantB: { views: 0, avgTimeSeconds: 0 },
  }));

  // ── Sparklines ──
  const sparklines = {
    decks: generateSparkline(deckItems.length),
    views: generateSparkline(totalViews),
  };

  return NextResponse.json({
    stats,
    sparklines,
    decks: deckItems,
    activities,
    dailyViews: filledDailyViews,
    investors,
    investorContacts,
    fundraise,
    practice,
    abTests: abTestItems,
    user: {
      plan: user?.plan || "starter",
      creditBalance: user?.creditBalance || 0,
      name: user?.name || "",
    },
  });
}

/* ── Helpers ── */

function fillMissingDays(data: { date: string; value: number }[], days: number): { date: string; value: number }[] {
  const map = new Map(data.map((d) => [d.date, d.value]));
  const result: { date: string; value: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    result.push({ date: key, value: map.get(key) || 0 });
  }
  return result;
}

function generateSparkline(total: number): number[] {
  const pts: number[] = [];
  for (let i = 0; i < 15; i++) {
    const base = (total / 15) * (i + 1);
    pts.push(Math.max(1, Math.round(base + (Math.random() - 0.5) * (total / 15) * 0.3)));
  }
  pts[pts.length - 1] = total;
  return pts;
}
