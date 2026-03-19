/**
 * Admin plan management API.
 * GET  — list all plan configs (ordered by sortOrder)
 * PUT  — upsert a single plan config by planKey
 */
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { invalidatePlanCache } from "@/lib/plan-config";

export const dynamic = "force-dynamic";

const VALID_PLAN_KEYS = ["starter", "pro", "growth", "enterprise"] as const;

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const plans = await prisma.planConfig.findMany({ orderBy: { sortOrder: "asc" } });
  return NextResponse.json({ plans });
}

export async function PUT(req: NextRequest) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const planKey = body.planKey as string | undefined;
  if (!planKey || !(VALID_PLAN_KEYS as readonly string[]).includes(planKey)) {
    return NextResponse.json(
      { error: `planKey must be one of: ${VALID_PLAN_KEYS.join(", ")}` },
      { status: 400 },
    );
  }

  // Convert Infinity to -1 for numeric fields stored in DB
  const toDb = (v: unknown): number => {
    if (v === Infinity || v === "Infinity") return -1;
    return Number(v);
  };

  const data = {
    sortOrder: Number(body.sortOrder ?? 0),
    enabled: body.enabled !== false,

    // Display
    displayName: String(body.displayName ?? planKey),
    description: String(body.description ?? ""),
    price: String(body.price ?? "Free"),
    priceUnit: String(body.priceUnit ?? ""),
    highlight: Boolean(body.highlight),
    badge: body.badge ? String(body.badge) : null,
    ctaText: String(body.ctaText ?? "Start Free Trial"),
    ctaHref: String(body.ctaHref ?? "/create"),
    features: typeof body.features === "string"
      ? body.features
      : JSON.stringify(body.features ?? []),

    // Stripe
    stripePriceId: body.stripePriceId ? String(body.stripePriceId) : null,
    stripeAmount: body.stripeAmount != null ? Number(body.stripeAmount) : null,

    // Limits
    maxDecks: toDb(body.maxDecks ?? 1),
    allowedThemes: typeof body.allowedThemes === "string"
      ? body.allowedThemes
      : JSON.stringify(body.allowedThemes ?? ["midnight"]),
    piqScoreDetail: String(body.piqScoreDetail ?? "basic"),
    showBranding: Boolean(body.showBranding ?? true),
    pdfWatermark: Boolean(body.pdfWatermark ?? true),
    pptxExport: Boolean(body.pptxExport),
    analytics: Boolean(body.analytics),
    investorVariants: Boolean(body.investorVariants),
    abTesting: Boolean(body.abTesting),
    followUpAlerts: Boolean(body.followUpAlerts),
    investorCRM: Boolean(body.investorCRM),
    fundraiseTracker: Boolean(body.fundraiseTracker),
    editor: Boolean(body.editor),
    aiCoachingPerSlide: Boolean(body.aiCoachingPerSlide),
    investorLens: Boolean(body.investorLens),
    pitchSimulator: Boolean(body.pitchSimulator),
    maxVersionHistory: toDb(body.maxVersionHistory ?? 0),
    smartBlocks: Boolean(body.smartBlocks),
    deckTemplates: Boolean(body.deckTemplates),
    appendixGenerator: Boolean(body.appendixGenerator),
    teamCollaboration: Boolean(body.teamCollaboration),
    maxWorkspaceMembers: toDb(body.maxWorkspaceMembers ?? 0),
    customDomain: Boolean(body.customDomain),
    apiAccess: Boolean(body.apiAccess),
    batchScoring: Boolean(body.batchScoring),
    maxApiKeys: Number(body.maxApiKeys ?? 0),
    apiRateLimit: Number(body.apiRateLimit ?? 0),
    maxBatchSize: Number(body.maxBatchSize ?? 0),
    pitchPractice: Boolean(body.pitchPractice),
  };

  const plan = await prisma.planConfig.upsert({
    where: { planKey },
    create: { planKey, ...data },
    update: data,
  });

  invalidatePlanCache();

  return NextResponse.json({ plan });
}
