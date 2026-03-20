/**
 * Investor Matching Engine v2
 *
 * Multi-dimensional scoring system (200-point scale, normalized 0-100).
 * Scores InvestorProfiles against a founder's deck / startup profile and
 * returns ranked matches with granular fit explanations.
 *
 * 16 scoring dimensions with configurable weights, adjacency bonuses,
 * negative signals, and graceful missing-data handling.
 */

import { convertToUSD } from "./currency";
import { countryToRegion } from "./geography";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MatchInput {
  /** Startup stage: "pre-seed" | "seed" | "series-a" | "series-b" | "series-c" | "growth" */
  stage: string;
  /** Industry/sector keywords: "fintech", "saas", "healthtech", etc. */
  sectors: string[];
  /** Geography where the startup is based (kept for backward compat) */
  geography: string;
  /** Funding ask in USD (parsed from "500K" -> 500000, "$2M" -> 2000000) */
  askAmount: number | null;
  /** Investor type preference: "vc" | "angel" | "accelerator" */
  investorType?: string;

  // --- New fields (all optional for backward compat) ---
  country?: string;
  city?: string;
  currency?: string;
  targetMarkets?: string[];
  businessModel?: string;
  revenueModel?: string;
  customerType?: string;
  monthlyRevenue?: number;
  revenueGrowthRate?: number;
  dealStructure?: string;
  preMoneyValuation?: number;
  teamSize?: number;
  founderDiversity?: string[];
  hasRepeatFounder?: boolean;
  hasTechnicalFounder?: boolean;
  leadNeeded?: boolean;
  boardSeatOk?: boolean;
}

export interface InvestorForMatching {
  id: string;
  name: string;
  type: string;
  description: string | null;
  website: string | null;
  stages: string[];
  sectors: string[];
  geographies: string[];
  chequeMin: number | null;
  chequeMax: number | null;
  thesis: string | null;
  notableDeals: string[];
  aum: string | null;
  verified: boolean;

  // --- New fields (all optional) ---
  country?: string | null;
  city?: string | null;
  currencies?: string[];
  businessModels?: string[];
  revenueModels?: string[];
  customerTypes?: string[];
  dealStructures?: string[];
  valuationMin?: number | null;
  valuationMax?: number | null;
  minRevenue?: number | null;
  minGrowthRate?: number | null;
  minTeamSize?: number | null;
  deploymentPace?: string | null;
  leadPreference?: string | null;
  boardSeatRequired?: boolean;
  impactFocus?: boolean;
  diversityLens?: boolean;
  thesisKeywords?: string[];
  portfolioCompanies?: string[];
  portfolioConflictSectors?: string[];
  declinedSectors?: string[];
  lastActiveDate?: string | null;
  fundSize?: number | null;
  fundVintage?: number | null;
  syndicateOpen?: boolean;
  followOnReserve?: boolean;
  coInvestors?: string[];
  // Display-only fields (not used in scoring, carried through for UI)
  linkedIn?: string | null;
  twitter?: string | null;
  contactEmail?: string | null;
  logoUrl?: string | null;
  partnerCount?: number | null;
  avgResponseDays?: number | null;
  avgCloseWeeks?: number | null;
}

export type MatchSeverity = "positive" | "neutral" | "warning" | "dealbreaker";

export interface MatchReason {
  dimension: string;
  score: number;
  maxScore: number;
  matched: boolean;
  detail: string;
  severity: MatchSeverity;
  /** Legacy alias kept for backward compat with existing consumers */
  points: number;
}

export type CompatibilityLabel =
  | "Excellent Fit"
  | "Strong Fit"
  | "Moderate Fit"
  | "Weak Fit"
  | "Poor Fit";

export interface InvestorMatch {
  investor: InvestorForMatching;
  /** 0-100 normalized score */
  fitScore: number;
  reasons: MatchReason[];
  /** Top 3 positive reasons (human-readable) */
  topReasons: string[];
  /** Negative signals */
  warnings: string[];
  /** Hard incompatibilities */
  dealbreakers: string[];
  compatibilityLabel: CompatibilityLabel;
}

// ---------------------------------------------------------------------------
// Scoring configuration
// ---------------------------------------------------------------------------

export interface ScoringConfig {
  stage: number;
  sector: number;
  geography: number;
  cheque: number;
  businessModel: number;
  customerType: number;
  revenueModel: number;
  traction: number;
  dealStructure: number;
  valuation: number;
  leadFollow: number;
  fundActivity: number;
  portfolioConflict: number;
  diversityImpact: number;
  thesisKeyword: number;
  currency: number;
}

export const DEFAULT_SCORING_CONFIG: ScoringConfig = {
  stage: 30,
  sector: 25,
  geography: 20,
  cheque: 20,
  businessModel: 15,
  customerType: 10,
  revenueModel: 10,
  traction: 15,
  dealStructure: 10,
  valuation: 10,
  leadFollow: 10,
  fundActivity: 5,
  portfolioConflict: -20,
  diversityImpact: 5,
  thesisKeyword: 10,
  currency: 5,
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STAGE_ORDER: string[] = [
  "pre-seed",
  "seed",
  "series-a",
  "series-b",
  "series-c",
  "growth",
];

const BUSINESS_MODEL_ADJACENCY: [string, string][] = [
  ["saas", "marketplace"],
  ["consumer", "d2c"],
  ["hardware", "deeptech"],
  ["services", "marketplace"],
];

const REVENUE_MODEL_ADJACENCY: [string, string][] = [
  ["subscription", "usage-based"],
  ["transactional", "marketplace-fee"],
  ["freemium", "subscription"],
  ["licensing", "subscription"],
];

// ---------------------------------------------------------------------------
// Normalization helpers (exported — used elsewhere)
// ---------------------------------------------------------------------------

/** Normalize a stage string to our canonical format */
export function normalizeStage(s: string): string {
  const lower = s.toLowerCase().trim().replace(/\s+/g, "-");
  const aliases: Record<string, string> = {
    "pre-seed": "pre-seed",
    preseed: "pre-seed",
    idea: "pre-seed",
    seed: "seed",
    "series-a": "series-a",
    "series a": "series-a",
    a: "series-a",
    "series-b": "series-b",
    "series b": "series-b",
    b: "series-b",
    "series-c": "series-c",
    "series c": "series-c",
    c: "series-c",
    growth: "growth",
    "late-stage": "growth",
    late: "growth",
    ipo: "growth",
  };
  return aliases[lower] || lower;
}

/** Normalize a sector string for comparison */
export function normalizeSector(s: string): string {
  const lower = s.toLowerCase().trim();
  const aliases: Record<string, string> = {
    software: "saas",
    "software-as-a-service": "saas",
    "artificial-intelligence": "ai",
    "machine-learning": "ai",
    ml: "ai",
    "financial-technology": "fintech",
    "financial services": "fintech",
    health: "healthtech",
    healthcare: "healthtech",
    "health-tech": "healthtech",
    education: "edtech",
    "education-technology": "edtech",
    ecommerce: "marketplace",
    "e-commerce": "marketplace",
    retail: "consumer",
    b2b: "enterprise",
    cybersecurity: "security",
    "real-estate": "proptech",
    blockchain: "crypto",
    web3: "crypto",
    food: "food-tech",
    agriculture: "food-tech",
    agtech: "food-tech",
    transportation: "logistics",
    mobility: "logistics",
    insurance: "insurtech",
    space: "aerospace",
  };
  return aliases[lower] || lower;
}

function normalizeBusinessModel(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, "-");
}

function normalizeRevenueModel(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, "-");
}

function normalizeCustomerType(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, "-");
}

// ---------------------------------------------------------------------------
// Parsing helpers (exported — used elsewhere)
// ---------------------------------------------------------------------------

/** Parse a funding target string into USD amount */
export function parseFundingAmount(target: string): number | null {
  if (!target) return null;
  const cleaned = target.replace(/[^0-9.kmb]/gi, "").toLowerCase();
  if (!cleaned) return null;

  const match = cleaned.match(/^([\d.]+)\s*([kmb])?$/i);
  if (!match) {
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }

  const num = parseFloat(match[1]);
  if (isNaN(num)) return null;

  const multiplier = match[2];
  if (multiplier === "k") return num * 1_000;
  if (multiplier === "m") return num * 1_000_000;
  if (multiplier === "b") return num * 1_000_000_000;
  return num;
}

/** Detect sectors from industry string and deck content */
export function extractSectors(industry: string): string[] {
  if (!industry) return [];
  const parts = industry
    .split(/[,/;&|+]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(normalizeSector);

  const lower = industry.toLowerCase();
  const keywords: Record<string, string> = {
    fintech: "fintech",
    saas: "saas",
    ai: "ai",
    "artificial intelligence": "ai",
    "machine learning": "ai",
    health: "healthtech",
    crypto: "crypto",
    blockchain: "crypto",
    marketplace: "marketplace",
    consumer: "consumer",
    enterprise: "enterprise",
    b2b: "enterprise",
    climate: "climate",
    cleantech: "climate",
    edtech: "edtech",
    education: "edtech",
    biotech: "biotech",
    security: "security",
    gaming: "gaming",
    proptech: "proptech",
    "real estate": "proptech",
    food: "food-tech",
    logistics: "logistics",
    insurance: "insurtech",
    defense: "defense",
    robotics: "robotics",
    hardware: "hardware",
    infrastructure: "infrastructure",
  };

  for (const [keyword, sector] of Object.entries(keywords)) {
    if (lower.includes(keyword) && !parts.includes(sector)) {
      parts.push(sector);
    }
  }

  return Array.from(new Set(parts));
}

/** Detect geography from a string */
export function extractGeography(geo: string): string {
  if (!geo) return "US";
  const lower = geo.toLowerCase();
  if (
    lower.includes("us") ||
    lower.includes("united states") ||
    lower.includes("america")
  )
    return "US";
  if (lower.includes("europe") || lower.includes("uk") || lower.includes("eu"))
    return "Europe";
  if (lower.includes("india")) return "India";
  if (lower.includes("asia") || lower.includes("southeast asia"))
    return "Southeast Asia";
  if (lower.includes("china")) return "China";
  if (
    lower.includes("latin") ||
    lower.includes("brazil") ||
    lower.includes("mexico")
  )
    return "Latin America";
  if (
    lower.includes("africa") ||
    lower.includes("nigeria") ||
    lower.includes("kenya")
  )
    return "Africa";
  if (lower.includes("israel")) return "Israel";
  if (
    lower.includes("middle east") ||
    lower.includes("mena") ||
    lower.includes("dubai")
  )
    return "MENA";
  return "US";
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatAmount(amount: number): string {
  if (amount >= 1_000_000_000)
    return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}

// ---------------------------------------------------------------------------
// Individual scoring functions
// ---------------------------------------------------------------------------

function makeReason(
  dimension: string,
  score: number,
  maxScore: number,
  matched: boolean,
  detail: string,
  severity: MatchSeverity,
): MatchReason {
  return { dimension, score, maxScore, matched, detail, severity, points: score };
}

/**
 * Check whether a dimension is scorable (both sides have the necessary data).
 * Returns false if either side is missing data — the dimension should be
 * excluded from the denominator entirely.
 */
type DimensionScorer = (
  input: MatchInput,
  investor: InvestorForMatching,
  weight: number,
) => MatchReason | null;

// 1. Stage fit (30 pts) - Binary with adjacency
const scoreStage: DimensionScorer = (input, investor, weight) => {
  if (!input.stage || investor.stages.length === 0) return null;

  const inputStage = normalizeStage(input.stage);
  const investorStages = investor.stages.map(normalizeStage);

  if (investorStages.includes(inputStage)) {
    return makeReason(
      "Stage",
      weight,
      weight,
      true,
      `Invests at ${input.stage} stage`,
      "positive",
    );
  }

  // Adjacency scoring
  const inputIdx = STAGE_ORDER.indexOf(inputStage);
  if (inputIdx >= 0) {
    let minDistance = Infinity;
    for (const invStage of investorStages) {
      const invIdx = STAGE_ORDER.indexOf(invStage);
      if (invIdx >= 0) {
        minDistance = Math.min(minDistance, Math.abs(inputIdx - invIdx));
      }
    }

    if (minDistance === 1) {
      const score = Math.round(weight * 0.6);
      return makeReason(
        "Stage",
        score,
        weight,
        true,
        `Adjacent stage investor (typically ${investor.stages.join(", ")}; you're ${input.stage})`,
        "neutral",
      );
    }
    if (minDistance === 2) {
      const score = Math.round(weight * 0.2);
      return makeReason(
        "Stage",
        score,
        weight,
        false,
        `Stage mismatch: invests at ${investor.stages.join(", ")}, you're at ${input.stage}`,
        "warning",
      );
    }
  }

  return makeReason(
    "Stage",
    0,
    weight,
    false,
    `Stage mismatch: invests at ${investor.stages.join(", ")}, not ${input.stage}`,
    "warning",
  );
};

// 2. Sector alignment (25 pts) - Proportional overlap + thesis keyword bonus
const scoreSector: DimensionScorer = (input, investor, weight) => {
  if (input.sectors.length === 0 && investor.sectors.length === 0) return null;

  const inputSectors = input.sectors.map(normalizeSector);
  const investorSectors = investor.sectors.map(normalizeSector);

  if (inputSectors.length === 0 || investorSectors.length === 0) {
    return makeReason(
      "Sector",
      Math.round(weight * 0.3),
      weight,
      false,
      "Sector data incomplete — partial credit applied",
      "neutral",
    );
  }

  // Check for declined sectors (hard no)
  if (investor.declinedSectors && investor.declinedSectors.length > 0) {
    const declinedNorm = investor.declinedSectors.map(normalizeSector);
    const declined = inputSectors.filter((s) => declinedNorm.includes(s));
    if (declined.length > 0) {
      return makeReason(
        "Sector",
        0,
        weight,
        false,
        `Investor has explicitly declined ${declined.join(", ")} sector(s)`,
        "dealbreaker",
      );
    }
  }

  const overlap = inputSectors.filter((s) => investorSectors.includes(s));
  const overlapRatio =
    inputSectors.length > 0 ? overlap.length / inputSectors.length : 0;

  // Thesis keyword bonus: up to 20% extra within sector weight
  let thesisBonus = 0;
  if (investor.thesis && inputSectors.length > 0) {
    const thesisLower = investor.thesis.toLowerCase();
    const thesisHits = inputSectors.filter((s) => thesisLower.includes(s));
    if (thesisHits.length > 0) {
      thesisBonus = Math.round(weight * 0.2 * (thesisHits.length / inputSectors.length));
    }
  }

  const rawScore = Math.round(weight * overlapRatio) + thesisBonus;
  const score = Math.min(rawScore, weight);

  if (overlap.length > 0) {
    return makeReason(
      "Sector",
      score,
      weight,
      true,
      `Sector focus includes ${overlap.join(", ")}${thesisBonus > 0 ? " (thesis alignment bonus)" : ""}`,
      "positive",
    );
  }

  return makeReason(
    "Sector",
    0,
    weight,
    false,
    `Focuses on ${investor.sectors.slice(0, 4).join(", ")} — different from your sectors`,
    "warning",
  );
};

// 3. Geography compatibility (20 pts) - Graduated
const scoreGeography: DimensionScorer = (input, investor, weight) => {
  if (!input.geography && !input.country && !input.city) return null;
  if (investor.geographies.length === 0 && !investor.country && !investor.city) return null;

  // Same city = 100%
  if (input.city && investor.city) {
    if (input.city.toLowerCase() === investor.city.toLowerCase()) {
      return makeReason(
        "Geography",
        weight,
        weight,
        true,
        `Same city: ${input.city}`,
        "positive",
      );
    }
  }

  // Same country = 85%
  if (input.country && investor.country) {
    if (input.country.toLowerCase() === investor.country.toLowerCase()) {
      const score = Math.round(weight * 0.85);
      return makeReason(
        "Geography",
        score,
        weight,
        true,
        `Same country: ${input.country}`,
        "positive",
      );
    }
  }

  // Same region = 60%
  const inputRegion = input.country
    ? countryToRegion(input.country)
    : input.geography;
  const investorRegions = investor.geographies.length > 0
    ? investor.geographies
    : investor.country
      ? [countryToRegion(investor.country)]
      : [];

  // Check for "Global" investor
  if (investorRegions.some((g) => g.toLowerCase() === "global")) {
    const score = Math.round(weight * 0.5);
    return makeReason(
      "Geography",
      score,
      weight,
      true,
      "Global investor — invests worldwide",
      "positive",
    );
  }

  if (inputRegion) {
    const regionMatch = investorRegions.some(
      (g) => g.toLowerCase() === inputRegion.toLowerCase(),
    );
    if (regionMatch) {
      const score = Math.round(weight * 0.6);
      return makeReason(
        "Geography",
        score,
        weight,
        true,
        `Same region: ${inputRegion}`,
        "positive",
      );
    }
  }

  // Legacy fallback: direct geography string match
  const geoMatch = investor.geographies.some(
    (g) =>
      g.toLowerCase() === (input.geography || "").toLowerCase() ||
      g.toLowerCase() === "global",
  );
  if (geoMatch) {
    const score = Math.round(weight * 0.6);
    return makeReason(
      "Geography",
      score,
      weight,
      true,
      `Invests in ${input.geography}`,
      "positive",
    );
  }

  return makeReason(
    "Geography",
    0,
    weight,
    false,
    `Focuses on ${investorRegions.length > 0 ? investorRegions.join(", ") : "other regions"} — not your geography`,
    "warning",
  );
};

// 4. Cheque size fit (20 pts) - Graduated
const scoreCheque: DimensionScorer = (input, investor, weight) => {
  if (input.askAmount == null) return null;
  if (investor.chequeMin == null && investor.chequeMax == null) return null;

  const ask = input.currency
    ? convertToUSD(input.askAmount, input.currency)
    : input.askAmount;

  const min = investor.chequeMin ?? 0;
  const max = investor.chequeMax ?? Infinity;

  // Perfect range: ask is within [min, max]
  if (ask >= min && ask <= max) {
    return makeReason(
      "Cheque Size",
      weight,
      weight,
      true,
      `Your ask (${formatAmount(ask)}) fits their range (${formatAmount(min)} - ${max === Infinity ? "unlimited" : formatAmount(max)})`,
      "positive",
    );
  }

  // Within 2x range on either side: partial credit
  const lowerBound = min / 2;
  const upperBound = max === Infinity ? Infinity : max * 2;

  if (ask >= lowerBound && ask <= upperBound) {
    const score = Math.round(weight * 0.5);
    const detail =
      ask < min
        ? `Your ask (${formatAmount(ask)}) is below their minimum (${formatAmount(min)}) but within range`
        : `Your ask (${formatAmount(ask)}) exceeds their max (${formatAmount(max)}) but is within 2x`;
    return makeReason("Cheque Size", score, weight, true, detail, "neutral");
  }

  return makeReason(
    "Cheque Size",
    0,
    weight,
    false,
    `Your ask (${formatAmount(ask)}) is outside their range (${formatAmount(min)} - ${max === Infinity ? "unlimited" : formatAmount(max)})`,
    "warning",
  );
};

// 5. Business model match (15 pts) - Binary with adjacency
const scoreBusinessModel: DimensionScorer = (input, investor, weight) => {
  if (!input.businessModel) return null;
  if (!investor.businessModels || investor.businessModels.length === 0)
    return null;

  const inputModel = normalizeBusinessModel(input.businessModel);
  const investorModels = investor.businessModels.map(normalizeBusinessModel);

  if (investorModels.includes(inputModel)) {
    return makeReason(
      "Business Model",
      weight,
      weight,
      true,
      `Invests in ${input.businessModel} businesses`,
      "positive",
    );
  }

  // Adjacency check
  const isAdjacent = BUSINESS_MODEL_ADJACENCY.some(
    ([a, b]) =>
      (inputModel === a && investorModels.includes(b)) ||
      (inputModel === b && investorModels.includes(a)),
  );

  if (isAdjacent) {
    const score = Math.round(weight * 0.5);
    return makeReason(
      "Business Model",
      score,
      weight,
      true,
      `Related business model: invests in ${investor.businessModels.join(", ")}`,
      "neutral",
    );
  }

  return makeReason(
    "Business Model",
    0,
    weight,
    false,
    `Prefers ${investor.businessModels.join(", ")} — not ${input.businessModel}`,
    "neutral",
  );
};

// 6. Customer type match (10 pts) - Binary
const scoreCustomerType: DimensionScorer = (input, investor, weight) => {
  if (!input.customerType) return null;
  if (!investor.customerTypes || investor.customerTypes.length === 0)
    return null;

  const inputType = normalizeCustomerType(input.customerType);
  const investorTypes = investor.customerTypes.map(normalizeCustomerType);

  if (investorTypes.includes(inputType)) {
    return makeReason(
      "Customer Type",
      weight,
      weight,
      true,
      `Invests in ${input.customerType} companies`,
      "positive",
    );
  }

  return makeReason(
    "Customer Type",
    0,
    weight,
    false,
    `Prefers ${investor.customerTypes.join(", ")} customers — you target ${input.customerType}`,
    "neutral",
  );
};

// 7. Revenue model match (10 pts) - Binary with partial
const scoreRevenueModel: DimensionScorer = (input, investor, weight) => {
  if (!input.revenueModel) return null;
  if (!investor.revenueModels || investor.revenueModels.length === 0)
    return null;

  const inputModel = normalizeRevenueModel(input.revenueModel);
  const investorModels = investor.revenueModels.map(normalizeRevenueModel);

  if (investorModels.includes(inputModel)) {
    return makeReason(
      "Revenue Model",
      weight,
      weight,
      true,
      `Invests in ${input.revenueModel} revenue models`,
      "positive",
    );
  }

  const isAdjacent = REVENUE_MODEL_ADJACENCY.some(
    ([a, b]) =>
      (inputModel === a && investorModels.includes(b)) ||
      (inputModel === b && investorModels.includes(a)),
  );

  if (isAdjacent) {
    const score = Math.round(weight * 0.5);
    return makeReason(
      "Revenue Model",
      score,
      weight,
      true,
      `Related revenue model: prefers ${investor.revenueModels.join(", ")}`,
      "neutral",
    );
  }

  return makeReason(
    "Revenue Model",
    0,
    weight,
    false,
    `Prefers ${investor.revenueModels.join(", ")} — not ${input.revenueModel}`,
    "neutral",
  );
};

// 8. Traction threshold (15 pts) - Graduated
const scoreTraction: DimensionScorer = (input, investor, weight) => {
  const hasRevenue = input.monthlyRevenue != null;
  const hasGrowth = input.revenueGrowthRate != null;
  if (!hasRevenue && !hasGrowth) return null;
  if (investor.minRevenue == null && investor.minGrowthRate == null) return null;

  let revenueScore = 0;
  let growthScore = 0;
  let revenueDetail = "";
  let growthDetail = "";
  let scorablePortions = 0;

  // Revenue component
  if (hasRevenue && investor.minRevenue != null) {
    scorablePortions++;
    const mrr = input.monthlyRevenue!;
    const minRev = investor.minRevenue;
    if (mrr >= minRev * 1.5) {
      revenueScore = 1.0; // exceeds
      revenueDetail = `Revenue (${formatAmount(mrr)}/mo) exceeds threshold`;
    } else if (mrr >= minRev) {
      revenueScore = 0.75; // meets
      revenueDetail = `Revenue (${formatAmount(mrr)}/mo) meets threshold`;
    } else if (mrr >= minRev * 0.5) {
      revenueScore = 0.4; // approaching
      revenueDetail = `Revenue (${formatAmount(mrr)}/mo) approaching threshold (${formatAmount(minRev)})`;
    } else {
      revenueScore = 0.1; // below
      revenueDetail = `Revenue (${formatAmount(mrr)}/mo) below threshold (${formatAmount(minRev)})`;
    }
  }

  // Growth rate component
  if (hasGrowth && investor.minGrowthRate != null) {
    scorablePortions++;
    const rate = input.revenueGrowthRate!;
    const minRate = investor.minGrowthRate;
    if (rate >= minRate * 1.5) {
      growthScore = 1.0;
      growthDetail = `Growth rate (${rate}%) exceeds expectations`;
    } else if (rate >= minRate) {
      growthScore = 0.75;
      growthDetail = `Growth rate (${rate}%) meets threshold`;
    } else if (rate >= minRate * 0.5) {
      growthScore = 0.4;
      growthDetail = `Growth rate (${rate}%) approaching threshold (${minRate}%)`;
    } else {
      growthScore = 0.1;
      growthDetail = `Growth rate (${rate}%) below threshold (${minRate}%)`;
    }
  }

  const avgScore =
    scorablePortions > 0
      ? (revenueScore + growthScore) / scorablePortions
      : 0;
  const score = Math.round(weight * avgScore);
  const detail = [revenueDetail, growthDetail].filter(Boolean).join("; ");
  const severity: MatchSeverity =
    avgScore >= 0.75 ? "positive" : avgScore >= 0.4 ? "neutral" : "warning";

  return makeReason("Traction", score, weight, avgScore >= 0.4, detail, severity);
};

// 9. Deal structure compatibility (10 pts) - Binary
const scoreDealStructure: DimensionScorer = (input, investor, weight) => {
  if (!input.dealStructure) return null;
  if (!investor.dealStructures || investor.dealStructures.length === 0)
    return null;

  const inputDeal = input.dealStructure.toLowerCase().trim();
  const investorDeals = investor.dealStructures.map((d) =>
    d.toLowerCase().trim(),
  );

  if (investorDeals.includes(inputDeal)) {
    return makeReason(
      "Deal Structure",
      weight,
      weight,
      true,
      `Compatible deal structure: ${input.dealStructure}`,
      "positive",
    );
  }

  return makeReason(
    "Deal Structure",
    0,
    weight,
    false,
    `Prefers ${investor.dealStructures.join(", ")} — you need ${input.dealStructure}`,
    "warning",
  );
};

// 10. Valuation range fit (10 pts) - Graduated
const scoreValuation: DimensionScorer = (input, investor, weight) => {
  if (input.preMoneyValuation == null) return null;
  if (investor.valuationMin == null && investor.valuationMax == null)
    return null;

  const val = input.preMoneyValuation;
  const min = investor.valuationMin ?? 0;
  const max = investor.valuationMax ?? Infinity;

  // In range
  if (val >= min && val <= max) {
    return makeReason(
      "Valuation",
      weight,
      weight,
      true,
      `Valuation (${formatAmount(val)}) fits their range`,
      "positive",
    );
  }

  // Within 30% on either side
  const lowerBound = min * 0.7;
  const upperBound = max === Infinity ? Infinity : max * 1.3;

  if (val >= lowerBound && val <= upperBound) {
    const score = Math.round(weight * 0.5);
    return makeReason(
      "Valuation",
      score,
      weight,
      true,
      `Valuation (${formatAmount(val)}) is close to their range (within 30%)`,
      "neutral",
    );
  }

  return makeReason(
    "Valuation",
    0,
    weight,
    false,
    `Valuation (${formatAmount(val)}) is outside their range (${formatAmount(min)} - ${max === Infinity ? "unlimited" : formatAmount(max)})`,
    "warning",
  );
};

// 11. Lead/follow alignment (10 pts) - Binary
const scoreLeadFollow: DimensionScorer = (input, investor, weight) => {
  if (input.leadNeeded == null) return null;
  if (!investor.leadPreference) return null;

  const pref = investor.leadPreference.toLowerCase().trim();

  if (input.leadNeeded) {
    // Founder needs a lead
    if (pref === "lead" || pref === "either" || pref === "both") {
      return makeReason(
        "Lead/Follow",
        weight,
        weight,
        true,
        "Can lead rounds",
        "positive",
      );
    }
    return makeReason(
      "Lead/Follow",
      0,
      weight,
      false,
      "Follow-only investor — you need a lead",
      "warning",
    );
  }

  // Founder doesn't need a lead — any preference works
  return makeReason(
    "Lead/Follow",
    weight,
    weight,
    true,
    `${pref === "lead" ? "Lead" : "Follow"} investor`,
    "positive",
  );
};

// 12. Fund activity (5 pts) - Graduated
const scoreFundActivity: DimensionScorer = (input, investor, weight) => {
  if (!investor.deploymentPace && !investor.lastActiveDate) return null;

  // Check deployment pace directly
  if (investor.deploymentPace) {
    const pace = investor.deploymentPace.toLowerCase().trim();
    if (pace === "active" || pace === "actively-deploying") {
      return makeReason(
        "Fund Activity",
        weight,
        weight,
        true,
        "Actively deploying capital",
        "positive",
      );
    }
    if (pace === "moderate") {
      return makeReason(
        "Fund Activity",
        Math.round(weight * 0.7),
        weight,
        true,
        "Moderate deployment pace",
        "neutral",
      );
    }
    if (pace === "slow") {
      return makeReason(
        "Fund Activity",
        Math.round(weight * 0.3),
        weight,
        false,
        "Slow deployment pace",
        "warning",
      );
    }
    if (pace === "fully-deployed" || pace === "closed") {
      return makeReason(
        "Fund Activity",
        0,
        weight,
        false,
        "Fund is fully deployed — unlikely to make new investments",
        "dealbreaker",
      );
    }
  }

  // Fallback: check last active date
  if (investor.lastActiveDate) {
    const lastActive = new Date(investor.lastActiveDate);
    const now = new Date();
    const monthsAgo =
      (now.getFullYear() - lastActive.getFullYear()) * 12 +
      (now.getMonth() - lastActive.getMonth());

    if (monthsAgo <= 3) {
      return makeReason(
        "Fund Activity",
        weight,
        weight,
        true,
        "Recently active (last 3 months)",
        "positive",
      );
    }
    if (monthsAgo <= 9) {
      return makeReason(
        "Fund Activity",
        Math.round(weight * 0.6),
        weight,
        true,
        `Last active ${monthsAgo} months ago`,
        "neutral",
      );
    }
    return makeReason(
      "Fund Activity",
      Math.round(weight * 0.2),
      weight,
      false,
      `No activity in ${monthsAgo} months`,
      "warning",
    );
  }

  return null;
};

// 13. Portfolio conflict (-20 pts) - NEGATIVE
const scorePortfolioConflict: DimensionScorer = (input, investor, weight) => {
  // weight is negative (-20)
  if (input.sectors.length === 0) return null;
  if (
    (!investor.portfolioCompanies || investor.portfolioCompanies.length === 0) &&
    (!investor.portfolioConflictSectors ||
      investor.portfolioConflictSectors.length === 0)
  )
    return null;

  const inputSectors = input.sectors.map(normalizeSector);

  // Check portfolio conflict sectors
  const conflictSectors = (investor.portfolioConflictSectors || []).map(
    normalizeSector,
  );
  const sectorConflicts = inputSectors.filter((s) =>
    conflictSectors.includes(s),
  );

  if (sectorConflicts.length > 0) {
    return makeReason(
      "Portfolio Conflict",
      weight, // negative
      0,
      false,
      `Investor has competing portfolio companies in ${sectorConflicts.join(", ")}`,
      "dealbreaker",
    );
  }

  // No conflict detected — no points added or removed
  return makeReason(
    "Portfolio Conflict",
    0,
    0,
    true,
    "No portfolio conflicts detected",
    "positive",
  );
};

// 14. Diversity/Impact bonus (5 pts)
const scoreDiversityImpact: DimensionScorer = (input, investor, weight) => {
  if (!investor.diversityLens && !investor.impactFocus) return null;

  let score = 0;
  const details: string[] = [];

  if (
    investor.diversityLens &&
    input.founderDiversity &&
    input.founderDiversity.length > 0
  ) {
    score += Math.round(weight * 0.6);
    details.push("Diversity-focused investor matches your founder profile");
  }

  if (investor.impactFocus) {
    // Impact investors generally welcome impact-aligned startups
    score += Math.round(weight * 0.4);
    details.push("Impact-focused investor");
  }

  score = Math.min(score, weight);

  if (score > 0) {
    return makeReason(
      "Diversity/Impact",
      score,
      weight,
      true,
      details.join("; "),
      "positive",
    );
  }

  return null;
};

// 15. Thesis keyword match (10 pts) - Proportional
const scoreThesisKeywords: DimensionScorer = (input, investor, weight) => {
  if (!investor.thesisKeywords || investor.thesisKeywords.length === 0)
    return null;
  if (input.sectors.length === 0 && !input.businessModel && !input.customerType)
    return null;

  // Build a set of startup keywords from all available fields
  const startupKeywords = new Set<string>();
  for (const s of input.sectors) {
    startupKeywords.add(normalizeSector(s));
  }
  if (input.businessModel)
    startupKeywords.add(normalizeBusinessModel(input.businessModel));
  if (input.customerType)
    startupKeywords.add(normalizeCustomerType(input.customerType));
  if (input.revenueModel)
    startupKeywords.add(normalizeRevenueModel(input.revenueModel));
  if (input.targetMarkets) {
    for (const m of input.targetMarkets) {
      startupKeywords.add(m.toLowerCase().trim());
    }
  }

  const investorKws = investor.thesisKeywords.map((k) =>
    k.toLowerCase().trim(),
  );

  const startupKwArray = Array.from(startupKeywords);

  let matchCount = 0;
  const matched: string[] = [];
  for (const kw of investorKws) {
    for (const sk of startupKwArray) {
      if (sk.includes(kw) || kw.includes(sk)) {
        matchCount++;
        matched.push(kw);
        break;
      }
    }
  }

  const ratio =
    investorKws.length > 0 ? matchCount / investorKws.length : 0;
  const score = Math.round(weight * ratio);

  if (matchCount > 0) {
    return makeReason(
      "Thesis Keywords",
      score,
      weight,
      true,
      `Thesis alignment: ${matched.slice(0, 4).join(", ")}`,
      "positive",
    );
  }

  return makeReason(
    "Thesis Keywords",
    0,
    weight,
    false,
    `Thesis keywords (${investorKws.slice(0, 3).join(", ")}) don't align with your profile`,
    "neutral",
  );
};

// 16. Currency compatibility (5 pts) - Binary
const scoreCurrency: DimensionScorer = (input, investor, weight) => {
  if (!input.currency) return null;
  if (!investor.currencies || investor.currencies.length === 0) return null;

  const inputCur = input.currency.toUpperCase().trim();
  const investorCurs = investor.currencies.map((c) => c.toUpperCase().trim());

  if (investorCurs.includes(inputCur) || investorCurs.includes("USD")) {
    return makeReason(
      "Currency",
      weight,
      weight,
      true,
      `Supports ${inputCur} investments`,
      "positive",
    );
  }

  return makeReason(
    "Currency",
    0,
    weight,
    false,
    `Invests in ${investorCurs.join(", ")} — you need ${inputCur}`,
    "neutral",
  );
};

// ---------------------------------------------------------------------------
// Core matching logic
// ---------------------------------------------------------------------------

function getCompatibilityLabel(score: number): CompatibilityLabel {
  if (score >= 80) return "Excellent Fit";
  if (score >= 65) return "Strong Fit";
  if (score >= 50) return "Moderate Fit";
  if (score >= 35) return "Weak Fit";
  return "Poor Fit";
}

const DIMENSION_SCORERS: Array<{
  key: keyof ScoringConfig;
  scorer: DimensionScorer;
}> = [
  { key: "stage", scorer: scoreStage },
  { key: "sector", scorer: scoreSector },
  { key: "geography", scorer: scoreGeography },
  { key: "cheque", scorer: scoreCheque },
  { key: "businessModel", scorer: scoreBusinessModel },
  { key: "customerType", scorer: scoreCustomerType },
  { key: "revenueModel", scorer: scoreRevenueModel },
  { key: "traction", scorer: scoreTraction },
  { key: "dealStructure", scorer: scoreDealStructure },
  { key: "valuation", scorer: scoreValuation },
  { key: "leadFollow", scorer: scoreLeadFollow },
  { key: "fundActivity", scorer: scoreFundActivity },
  { key: "portfolioConflict", scorer: scorePortfolioConflict },
  { key: "diversityImpact", scorer: scoreDiversityImpact },
  { key: "thesisKeyword", scorer: scoreThesisKeywords },
  { key: "currency", scorer: scoreCurrency },
];

function scoreInvestor(
  investor: InvestorForMatching,
  input: MatchInput,
  config: ScoringConfig = DEFAULT_SCORING_CONFIG,
): InvestorMatch {
  const reasons: MatchReason[] = [];
  let totalEarned = 0;
  let totalPossible = 0;

  for (const { key, scorer } of DIMENSION_SCORERS) {
    const weight = config[key];
    const result = scorer(input, investor, weight);

    if (result !== null) {
      reasons.push(result);

      if (weight < 0) {
        // Negative dimensions (portfolio conflict): only subtract, don't add to denominator
        totalEarned += result.score; // will be negative
      } else {
        totalEarned += result.score;
        totalPossible += Math.abs(weight);
      }
    }
    // If result is null, dimension is skipped — not counted in denominator
  }

  // Normalize to 0-100 based on actual scored dimensions
  const rawScore =
    totalPossible > 0
      ? Math.round((totalEarned / totalPossible) * 100)
      : 0;
  const fitScore = Math.max(0, Math.min(100, rawScore));

  // Extract top reasons, warnings, and dealbreakers
  const topReasons = reasons
    .filter((r) => r.severity === "positive" && r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((r) => r.detail);

  const warnings = reasons
    .filter((r) => r.severity === "warning")
    .map((r) => r.detail);

  const dealbreakers = reasons
    .filter((r) => r.severity === "dealbreaker")
    .map((r) => r.detail);

  return {
    investor,
    fitScore,
    reasons,
    topReasons,
    warnings,
    dealbreakers,
    compatibilityLabel: getCompatibilityLabel(fitScore),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Score and rank all investors against the founder's company data.
 * Returns matches sorted by fitScore descending.
 */
export function rankInvestors(
  investors: InvestorForMatching[],
  input: MatchInput,
  config?: ScoringConfig,
): InvestorMatch[] {
  const scoringConfig = config ?? DEFAULT_SCORING_CONFIG;
  return investors
    .map((inv) => scoreInvestor(inv, input, scoringConfig))
    .sort((a, b) => {
      // Primary: fitScore desc
      if (b.fitScore !== a.fitScore) return b.fitScore - a.fitScore;
      // Secondary: fewer dealbreakers
      if (a.dealbreakers.length !== b.dealbreakers.length)
        return a.dealbreakers.length - b.dealbreakers.length;
      // Tertiary: more positive reasons
      return b.topReasons.length - a.topReasons.length;
    });
}

/**
 * Build a MatchInput from Deck model fields.
 * Backward-compatible with the existing Deck schema.
 */
export function deckToMatchInput(deck: {
  stage: string;
  industry: string;
  fundingTarget: string;
  investorType?: string;
  geography?: string;
  country?: string;
  city?: string;
  currency?: string;
  businessModel?: string;
  revenueModel?: string;
  customerType?: string;
  monthlyRevenue?: number;
  revenueGrowthRate?: number;
  dealStructure?: string;
  preMoneyValuation?: number;
  teamSize?: number;
  founderDiversity?: string[];
  hasRepeatFounder?: boolean;
  hasTechnicalFounder?: boolean;
  leadNeeded?: boolean;
  boardSeatOk?: boolean;
  targetMarkets?: string[];
}): MatchInput {
  return {
    stage: deck.stage,
    sectors: extractSectors(deck.industry),
    geography: deck.geography ?? extractGeography(deck.country ?? ""),
    askAmount: parseFundingAmount(deck.fundingTarget),
    investorType: deck.investorType,
    country: deck.country,
    city: deck.city,
    currency: deck.currency,
    targetMarkets: deck.targetMarkets,
    businessModel: deck.businessModel,
    revenueModel: deck.revenueModel,
    customerType: deck.customerType,
    monthlyRevenue: deck.monthlyRevenue,
    revenueGrowthRate: deck.revenueGrowthRate,
    dealStructure: deck.dealStructure,
    preMoneyValuation: deck.preMoneyValuation,
    teamSize: deck.teamSize,
    founderDiversity: deck.founderDiversity,
    hasRepeatFounder: deck.hasRepeatFounder,
    hasTechnicalFounder: deck.hasTechnicalFounder,
    leadNeeded: deck.leadNeeded,
    boardSeatOk: deck.boardSeatOk,
  };
}

/**
 * Build a MatchInput from a full startup profile.
 * New function for richer matching when more data is available.
 */
export function startupProfileToMatchInput(profile: {
  stage: string;
  sectors: string[];
  country: string;
  city?: string;
  currency?: string;
  askAmount: number;
  targetMarkets?: string[];
  businessModel?: string;
  revenueModel?: string;
  customerType?: string;
  monthlyRevenue?: number;
  revenueGrowthRate?: number;
  dealStructure?: string;
  preMoneyValuation?: number;
  teamSize?: number;
  founderDiversity?: string[];
  hasRepeatFounder?: boolean;
  hasTechnicalFounder?: boolean;
  leadNeeded?: boolean;
  boardSeatOk?: boolean;
  investorType?: string;
}): MatchInput {
  return {
    stage: profile.stage,
    sectors: profile.sectors.map(normalizeSector),
    geography: countryToRegion(profile.country),
    askAmount: profile.askAmount,
    investorType: profile.investorType,
    country: profile.country,
    city: profile.city,
    currency: profile.currency,
    targetMarkets: profile.targetMarkets,
    businessModel: profile.businessModel,
    revenueModel: profile.revenueModel,
    customerType: profile.customerType,
    monthlyRevenue: profile.monthlyRevenue,
    revenueGrowthRate: profile.revenueGrowthRate,
    dealStructure: profile.dealStructure,
    preMoneyValuation: profile.preMoneyValuation,
    teamSize: profile.teamSize,
    founderDiversity: profile.founderDiversity,
    hasRepeatFounder: profile.hasRepeatFounder,
    hasTechnicalFounder: profile.hasTechnicalFounder,
    leadNeeded: profile.leadNeeded,
    boardSeatOk: profile.boardSeatOk,
  };
}
