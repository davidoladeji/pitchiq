/**
 * Seed the PlanConfig table from hardcoded plan data.
 * POST — requireAdmin(), idempotent upsert on planKey.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { invalidatePlanCache } from "@/lib/plan-config";

export const dynamic = "force-dynamic";

const ALL_THEME_IDS = [
  "midnight", "arctic", "ember", "forest", "sunset",
  "ocean", "slate", "neon", "corporate", "pastel",
  "gradient", "dark-gradient",
];

interface SeedPlan {
  planKey: string;
  sortOrder: number;
  enabled: boolean;
  displayName: string;
  description: string;
  price: string;
  priceUnit: string;
  highlight: boolean;
  badge: string | null;
  ctaText: string;
  ctaHref: string;
  features: string;
  stripePriceId: string | null;
  stripeAmount: number;
  allowedThemes: string;
  // Limits
  maxDecks: number;
  piqScoreDetail: string;
  showBranding: boolean;
  pdfWatermark: boolean;
  pptxExport: boolean;
  analytics: boolean;
  investorVariants: boolean;
  abTesting: boolean;
  followUpAlerts: boolean;
  investorCRM: boolean;
  fundraiseTracker: boolean;
  editor: boolean;
  aiCoachingPerSlide: boolean;
  investorLens: boolean;
  pitchSimulator: boolean;
  maxVersionHistory: number;
  smartBlocks: boolean;
  deckTemplates: boolean;
  appendixGenerator: boolean;
  teamCollaboration: boolean;
  maxWorkspaceMembers: number;
  customDomain: boolean;
  apiAccess: boolean;
  batchScoring: boolean;
  maxApiKeys: number;
  apiRateLimit: number;
  maxBatchSize: number;
  pitchPractice: boolean;
}

const SEED_PLANS: SeedPlan[] = [
  {
    planKey: "starter",
    sortOrder: 0,
    enabled: true,
    displayName: "Starter",
    description: "Get your score",
    price: "Free",
    priceUnit: "",
    highlight: false,
    badge: null,
    ctaText: "Get Started",
    ctaHref: "/create",
    features: JSON.stringify([
      "1 AI-generated deck",
      "PDF export",
      "Basic PIQ Score",
      "1 design theme",
      "Shareable link",
    ]),
    stripePriceId: null,
    stripeAmount: 0,
    allowedThemes: JSON.stringify(["midnight"]),
    maxDecks: 1,
    piqScoreDetail: "basic",
    showBranding: true,
    pdfWatermark: true,
    pptxExport: false,
    analytics: false,
    investorVariants: false,
    abTesting: false,
    followUpAlerts: false,
    investorCRM: false,
    fundraiseTracker: false,
    editor: false,
    aiCoachingPerSlide: false,
    investorLens: false,
    pitchSimulator: false,
    maxVersionHistory: 0,
    smartBlocks: false,
    deckTemplates: false,
    appendixGenerator: false,
    teamCollaboration: false,
    maxWorkspaceMembers: 0,
    customDomain: false,
    apiAccess: false,
    batchScoring: false,
    maxApiKeys: 0,
    apiRateLimit: 0,
    maxBatchSize: 0,
    pitchPractice: false,
  },
  {
    planKey: "pro",
    sortOrder: 1,
    enabled: true,
    displayName: "Pro",
    description: "For active fundraisers",
    price: "$29",
    priceUnit: "/mo",
    highlight: true,
    badge: "Popular",
    ctaText: "Start Free Trial",
    ctaHref: "/create",
    features: JSON.stringify([
      "Up to 5 decks",
      "Full PIQ Score + coaching",
      "All 12+ themes",
      "PDF + PPTX export",
      "Brand customization",
      "Remove branding",
      "Pitch deck editor",
      "Smart Blocks",
      "AI coaching per slide",
      "10 version history",
    ]),
    stripePriceId: null,
    stripeAmount: 2900,
    allowedThemes: JSON.stringify(ALL_THEME_IDS),
    maxDecks: 5,
    piqScoreDetail: "full",
    showBranding: false,
    pdfWatermark: false,
    pptxExport: true,
    analytics: false,
    investorVariants: false,
    abTesting: false,
    followUpAlerts: false,
    investorCRM: false,
    fundraiseTracker: false,
    editor: true,
    aiCoachingPerSlide: true,
    investorLens: false,
    pitchSimulator: false,
    maxVersionHistory: 10,
    smartBlocks: true,
    deckTemplates: true,
    appendixGenerator: true,
    teamCollaboration: false,
    maxWorkspaceMembers: 0,
    customDomain: false,
    apiAccess: false,
    batchScoring: false,
    maxApiKeys: 0,
    apiRateLimit: 0,
    maxBatchSize: 0,
    pitchPractice: false,
  },
  {
    planKey: "growth",
    sortOrder: 2,
    enabled: true,
    displayName: "Growth",
    description: "Full intelligence suite",
    price: "$79",
    priceUnit: "/mo",
    highlight: false,
    badge: "Best Value",
    ctaText: "Start Free Trial",
    ctaHref: "/create",
    features: JSON.stringify([
      "Everything in Pro",
      "Unlimited decks",
      "Engagement analytics",
      "Slide-level tracking",
      "Investor variants",
      "A/B testing",
      "Follow-up alerts",
      "Investor CRM",
      "Investor Lens AI",
      "Pitch Simulator",
      "Unlimited version history",
      "Custom domain",
    ]),
    stripePriceId: null,
    stripeAmount: 7900,
    allowedThemes: JSON.stringify(ALL_THEME_IDS),
    maxDecks: -1,
    piqScoreDetail: "full",
    showBranding: false,
    pdfWatermark: false,
    pptxExport: true,
    analytics: true,
    investorVariants: true,
    abTesting: true,
    followUpAlerts: true,
    investorCRM: true,
    fundraiseTracker: true,
    editor: true,
    aiCoachingPerSlide: true,
    investorLens: true,
    pitchSimulator: true,
    maxVersionHistory: -1,
    smartBlocks: true,
    deckTemplates: true,
    appendixGenerator: true,
    teamCollaboration: false,
    maxWorkspaceMembers: 0,
    customDomain: true,
    apiAccess: false,
    batchScoring: false,
    maxApiKeys: 0,
    apiRateLimit: 0,
    maxBatchSize: 0,
    pitchPractice: true,
  },
  {
    planKey: "enterprise",
    sortOrder: 3,
    enabled: true,
    displayName: "Enterprise",
    description: "For teams & programs",
    price: "$399",
    priceUnit: "/mo",
    highlight: false,
    badge: null,
    ctaText: "Start Free Trial",
    ctaHref: "/create",
    features: JSON.stringify([
      "Everything in Growth",
      "Team collaboration",
      "Unlimited workspace members",
      "API access",
      "Batch scoring",
      "White-label option",
      "SSO / SAML",
      "Dedicated support",
    ]),
    stripePriceId: null,
    stripeAmount: 39900,
    allowedThemes: JSON.stringify(ALL_THEME_IDS),
    maxDecks: -1,
    piqScoreDetail: "full",
    showBranding: false,
    pdfWatermark: false,
    pptxExport: true,
    analytics: true,
    investorVariants: true,
    abTesting: true,
    followUpAlerts: true,
    investorCRM: true,
    fundraiseTracker: true,
    editor: true,
    aiCoachingPerSlide: true,
    investorLens: true,
    pitchSimulator: true,
    maxVersionHistory: -1,
    smartBlocks: true,
    deckTemplates: true,
    appendixGenerator: true,
    teamCollaboration: true,
    maxWorkspaceMembers: -1,
    customDomain: true,
    apiAccess: true,
    batchScoring: true,
    maxApiKeys: 10,
    apiRateLimit: 100,
    maxBatchSize: 50,
    pitchPractice: true,
  },
];

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
