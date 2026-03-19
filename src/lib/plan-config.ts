/**
 * Central plan configuration module.
 * Loads plan configs from DB (PlanConfig table) with an in-memory cache.
 * Falls back to null when the table is empty so callers can use hardcoded defaults.
 */
import { prisma } from "@/lib/db";
import type { PlanLimits } from "./plan-limits";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PlanDisplayData {
  displayName: string;
  description: string;
  price: string;
  priceUnit: string;
  highlight: boolean;
  badge: string | null;
  ctaText: string;
  ctaHref: string;
  features: string[];
}

export interface PlanStripeData {
  stripePriceId: string | null;
  stripeAmount: number | null;
}

export interface PlanConfigFull extends PlanDisplayData, PlanLimits, PlanStripeData {
  planKey: string;
  sortOrder: number;
  enabled: boolean;
}

// ---------------------------------------------------------------------------
// In-memory cache (survives HMR via globalThis)
// ---------------------------------------------------------------------------

interface CacheEntry {
  data: Map<string, PlanConfigFull>;
  ts: number;
}

const CACHE_TTL_MS = 60_000; // 60 seconds

const globalCache = globalThis as unknown as { __planConfigCache?: CacheEntry };

function getCache(): CacheEntry | undefined {
  const entry = globalCache.__planConfigCache;
  if (!entry) return undefined;
  if (Date.now() - entry.ts > CACHE_TTL_MS) return undefined;
  return entry;
}

function setCache(data: Map<string, PlanConfigFull>): void {
  globalCache.__planConfigCache = { data, ts: Date.now() };
}

// ---------------------------------------------------------------------------
// DB helpers
// ---------------------------------------------------------------------------

/** Convert a DB row (with -1 representing Infinity) to a PlanConfigFull. */
function rowToConfig(row: Record<string, unknown>): PlanConfigFull {
  const toInf = (v: number): number => (v === -1 ? Infinity : v);

  return {
    planKey: row.planKey as string,
    sortOrder: row.sortOrder as number,
    enabled: row.enabled as boolean,

    // Display
    displayName: row.displayName as string,
    description: row.description as string,
    price: row.price as string,
    priceUnit: row.priceUnit as string,
    highlight: row.highlight as boolean,
    badge: (row.badge as string | null) ?? null,
    ctaText: row.ctaText as string,
    ctaHref: row.ctaHref as string,
    features: JSON.parse(row.features as string) as string[],

    // Stripe
    stripePriceId: (row.stripePriceId as string | null) ?? null,
    stripeAmount: (row.stripeAmount as number | null) ?? null,

    // Limits
    maxDecks: toInf(row.maxDecks as number),
    allowedThemes: JSON.parse(row.allowedThemes as string) as string[],
    piqScoreDetail: row.piqScoreDetail as "basic" | "full",
    showBranding: row.showBranding as boolean,
    pdfWatermark: row.pdfWatermark as boolean,
    pptxExport: row.pptxExport as boolean,
    analytics: row.analytics as boolean,
    investorVariants: row.investorVariants as boolean,
    abTesting: row.abTesting as boolean,
    followUpAlerts: row.followUpAlerts as boolean,
    investorCRM: row.investorCRM as boolean,
    fundraiseTracker: row.fundraiseTracker as boolean,
    editor: row.editor as boolean,
    aiCoachingPerSlide: row.aiCoachingPerSlide as boolean,
    investorLens: row.investorLens as boolean,
    pitchSimulator: row.pitchSimulator as boolean,
    maxVersionHistory: toInf(row.maxVersionHistory as number),
    smartBlocks: row.smartBlocks as boolean,
    deckTemplates: row.deckTemplates as boolean,
    appendixGenerator: row.appendixGenerator as boolean,
    teamCollaboration: row.teamCollaboration as boolean,
    maxWorkspaceMembers: toInf(row.maxWorkspaceMembers as number),
    customDomain: row.customDomain as boolean,
    apiAccess: row.apiAccess as boolean,
    batchScoring: row.batchScoring as boolean,
    maxApiKeys: row.maxApiKeys as number,
    apiRateLimit: row.apiRateLimit as number,
    maxBatchSize: row.maxBatchSize as number,
    pitchPractice: row.pitchPractice as boolean,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch all PlanConfig rows from the database.
 * Returns null if the table is empty (caller should fall back to hardcoded defaults).
 */
export async function loadPlanConfigsFromDB(): Promise<Map<string, PlanConfigFull> | null> {
  const rows = await prisma.planConfig.findMany({ orderBy: { sortOrder: "asc" } });
  if (rows.length === 0) return null;

  const map = new Map<string, PlanConfigFull>();
  for (const row of rows) {
    const config = rowToConfig(row as unknown as Record<string, unknown>);
    map.set(config.planKey, config);
  }
  return map;
}

/**
 * Get all plan configs (cached, 60s TTL).
 * Returns null when the PlanConfig table is empty.
 */
export async function getAllPlanConfigs(): Promise<Map<string, PlanConfigFull> | null> {
  const cached = getCache();
  if (cached) return cached.data;

  const data = await loadPlanConfigsFromDB();
  if (data) {
    setCache(data);
  }
  return data;
}

/**
 * Get a single plan config by key.
 * Returns null if not found or if the table is empty.
 */
export async function getPlanConfigByKey(planKey: string): Promise<PlanConfigFull | null> {
  const all = await getAllPlanConfigs();
  if (!all) return null;
  return all.get(planKey) ?? null;
}

/** Invalidate the in-memory cache (call after admin writes). */
export function invalidatePlanCache(): void {
  globalCache.__planConfigCache = undefined;
}

/**
 * Returns just the PlanLimits portion for a given plan key.
 * Returns null when the DB table is empty so the caller can fall back to hardcoded values.
 */
export async function getPlanLimitsFromConfig(planKey: string): Promise<PlanLimits | null> {
  const config = await getPlanConfigByKey(planKey);
  if (!config) return null;

  const {
    // Strip non-PlanLimits fields
    planKey: _pk,
    sortOrder: _so,
    enabled: _en,
    displayName: _dn,
    description: _desc,
    price: _p,
    priceUnit: _pu,
    highlight: _h,
    badge: _b,
    ctaText: _ct,
    ctaHref: _ch,
    features: _f,
    stripePriceId: _spi,
    stripeAmount: _sa,
    // Keep limits
    ...limits
  } = config;

  return limits;
}
