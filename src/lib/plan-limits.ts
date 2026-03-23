import { THEMES } from "@/lib/themes";

export interface PlanLimits {
  /* Existing */
  maxDecks: number;
  allowedThemes: string[];
  piqScoreDetail: "basic" | "full";
  showBranding: boolean;
  pdfWatermark: boolean;
  pptxExport: boolean;
  analytics: boolean;

  /* Growth tier features */
  investorVariants: boolean;
  abTesting: boolean;
  followUpAlerts: boolean;
  investorCRM: boolean;
  fundraiseTracker: boolean;

  /* Editor features */
  editor: boolean;
  aiCoachingPerSlide: boolean;
  investorLens: boolean;
  pitchSimulator: boolean;
  maxVersionHistory: number;
  smartBlocks: boolean;
  deckTemplates: boolean;
  appendixGenerator: boolean;

  /* Enterprise features */
  teamCollaboration: boolean;
  maxWorkspaceMembers: number;
  customDomain: boolean;
  apiAccess: boolean;
  batchScoring: boolean;
  maxApiKeys: number;
  apiRateLimit: number; // requests per minute
  maxBatchSize: number;
  pitchPractice: boolean;
  maxStartupProfiles: number;

  /* Generation skills (agentic pipeline) */
  generationSkills: "none" | "basic" | "full" | "premium";
  generationAPICalls: number;
}

const ALL_THEME_IDS = THEMES.map((t) => t.id);

const PLAN_CONFIGS: Record<string, PlanLimits> = {
  starter: {
    maxDecks: 1,
    allowedThemes: ["midnight"],
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
    maxStartupProfiles: 0,
    generationSkills: "none",
    generationAPICalls: 1,
  },
  pro: {
    maxDecks: 5,
    allowedThemes: ALL_THEME_IDS,
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
    maxStartupProfiles: 1,
    generationSkills: "basic",
    generationAPICalls: 5,
  },
  growth: {
    maxDecks: Infinity,
    allowedThemes: ALL_THEME_IDS,
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
    maxVersionHistory: Infinity,
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
    maxStartupProfiles: 3,
    generationSkills: "full",
    generationAPICalls: 15,
  },
  enterprise: {
    maxDecks: Infinity,
    allowedThemes: ALL_THEME_IDS,
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
    maxVersionHistory: Infinity,
    smartBlocks: true,
    deckTemplates: true,
    appendixGenerator: true,
    teamCollaboration: true,
    maxWorkspaceMembers: Infinity,
    customDomain: true,
    apiAccess: true,
    batchScoring: true,
    maxApiKeys: 10,
    apiRateLimit: 100,
    maxBatchSize: 50,
    pitchPractice: true,
    maxStartupProfiles: Infinity,
    generationSkills: "premium",
    generationAPICalls: 25,
  },
};

/**
 * Get plan limits — synchronous. Checks in-memory plan config cache first
 * (populated from DB by plan-config.ts), falls back to hardcoded defaults.
 */
export function getPlanLimits(plan: string): PlanLimits {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const gc = globalThis as any;
    const cached = gc.__planConfigCache?.data?.get(plan);
    if (cached) return cached as PlanLimits;
  } catch {
    // Cache not available
  }
  return PLAN_CONFIGS[plan] || PLAN_CONFIGS.starter;
}

/** Ordered plan hierarchy for comparison. */
const PLAN_HIERARCHY: string[] = ["starter", "pro", "growth", "enterprise"];

/**
 * Check if a plan is at least the given minimum tier.
 * e.g. isPlanAtLeast("enterprise", "growth") → true
 *      isPlanAtLeast("pro", "growth") → false
 */
export function isPlanAtLeast(plan: string, minPlan: string): boolean {
  const planIndex = PLAN_HIERARCHY.indexOf(plan);
  const minIndex = PLAN_HIERARCHY.indexOf(minPlan);
  if (planIndex === -1) return false;
  if (minIndex === -1) return false;
  return planIndex >= minIndex;
}

/**
 * Get effective plan limits for a user, considering subscription + PAYG.
 * This is the NEW entry point — resolves subscription, period passes, and credits.
 * Falls back to getPlanLimits(user.plan) if entitlement resolution fails.
 */
export async function getEffectiveLimits(userId: string) {
  try {
    const { resolveEntitlements } = await import("@/lib/entitlements");
    return resolveEntitlements(userId);
  } catch (e) {
    console.error("[getEffectiveLimits] Failed, falling back to plan-based limits:", e);
    // Fallback: just use the user's subscription plan
    const { prisma } = await import("@/lib/db");
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    });
    const plan = user?.plan || "starter";
    const limits = getPlanLimits(plan);
    return {
      limits,
      source: { type: "subscription" as const, plan },
      allSources: [{ type: "subscription" as const, plan }],
      hasActiveEntitlement: plan !== "starter",
      creditBalance: 0,
      activePass: null,
    };
  }
}
