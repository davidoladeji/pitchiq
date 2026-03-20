/**
 * Investor matching engine.
 * Scores InvestorProfiles against a founder's deck/company data.
 * Returns ranked matches with fit explanations.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface MatchInput {
  /** Startup stage: "pre-seed" | "seed" | "series-a" | "series-b" | "growth" */
  stage: string;
  /** Industry/sector keywords: "fintech", "saas", "healthtech", etc. */
  sectors: string[];
  /** Geography where the startup is based */
  geography: string;
  /** Funding ask in USD (parsed from "500K" → 500000, "$2M" → 2000000) */
  askAmount: number | null;
  /** Investor type preference: "vc" | "angel" | "accelerator" */
  investorType?: string;
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
}

export interface MatchReason {
  dimension: string;
  matched: boolean;
  detail: string;
  points: number;
}

export interface InvestorMatch {
  investor: InvestorForMatching;
  fitScore: number;          // 0-100
  reasons: MatchReason[];
  topReasons: string[];      // Top 3 human-readable reasons
}

// ---------------------------------------------------------------------------
// Scoring weights
// ---------------------------------------------------------------------------

const WEIGHTS = {
  stage: 30,
  sector: 25,
  geography: 15,
  cheque: 20,
  type: 10,
} as const;

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

/** Normalize a stage string to our canonical format */
function normalizeStage(s: string): string {
  const lower = s.toLowerCase().trim().replace(/\s+/g, "-");
  const aliases: Record<string, string> = {
    "pre-seed": "pre-seed",
    "preseed": "pre-seed",
    "idea": "pre-seed",
    "seed": "seed",
    "series-a": "series-a",
    "series a": "series-a",
    "a": "series-a",
    "series-b": "series-b",
    "series b": "series-b",
    "b": "series-b",
    "series-c": "growth",
    "growth": "growth",
    "late-stage": "growth",
    "late": "growth",
  };
  return aliases[lower] || lower;
}

/** Normalize a sector string for comparison */
function normalizeSector(s: string): string {
  const lower = s.toLowerCase().trim();
  const aliases: Record<string, string> = {
    "software": "saas",
    "software-as-a-service": "saas",
    "artificial-intelligence": "ai",
    "machine-learning": "ai",
    "ml": "ai",
    "financial-technology": "fintech",
    "financial services": "fintech",
    "health": "healthtech",
    "healthcare": "healthtech",
    "health-tech": "healthtech",
    "education": "edtech",
    "education-technology": "edtech",
    "ecommerce": "marketplace",
    "e-commerce": "marketplace",
    "retail": "consumer",
    "b2b": "enterprise",
    "cybersecurity": "security",
    "real-estate": "proptech",
    "blockchain": "crypto",
    "web3": "crypto",
    "food": "food-tech",
    "agriculture": "food-tech",
    "agtech": "food-tech",
    "transportation": "logistics",
    "mobility": "logistics",
    "insurance": "insurtech",
    "space": "aerospace",
  };
  return aliases[lower] || lower;
}

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
  // Split on common delimiters and normalize
  const parts = industry
    .split(/[,/;&|+]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map(normalizeSector);

  // Also check for keywords in the full string
  const lower = industry.toLowerCase();
  const keywords: Record<string, string> = {
    "fintech": "fintech",
    "saas": "saas",
    "ai": "ai",
    "artificial intelligence": "ai",
    "machine learning": "ai",
    "health": "healthtech",
    "crypto": "crypto",
    "blockchain": "crypto",
    "marketplace": "marketplace",
    "consumer": "consumer",
    "enterprise": "enterprise",
    "b2b": "enterprise",
    "climate": "climate",
    "cleantech": "climate",
    "edtech": "edtech",
    "education": "edtech",
    "biotech": "biotech",
    "security": "security",
    "gaming": "gaming",
    "proptech": "proptech",
    "real estate": "proptech",
    "food": "food-tech",
    "logistics": "logistics",
    "insurance": "insurtech",
    "defense": "defense",
    "robotics": "robotics",
    "hardware": "hardware",
    "infrastructure": "infrastructure",
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
  if (!geo) return "US"; // default
  const lower = geo.toLowerCase();
  if (lower.includes("us") || lower.includes("united states") || lower.includes("america")) return "US";
  if (lower.includes("europe") || lower.includes("uk") || lower.includes("eu")) return "Europe";
  if (lower.includes("india")) return "India";
  if (lower.includes("asia") || lower.includes("southeast asia")) return "Southeast Asia";
  if (lower.includes("china")) return "China";
  if (lower.includes("latin") || lower.includes("brazil") || lower.includes("mexico")) return "Latin America";
  if (lower.includes("africa") || lower.includes("nigeria") || lower.includes("kenya")) return "Africa";
  if (lower.includes("israel")) return "Israel";
  if (lower.includes("middle east") || lower.includes("mena") || lower.includes("dubai")) return "MENA";
  return "US";
}

// ---------------------------------------------------------------------------
// Core matching logic
// ---------------------------------------------------------------------------

function scoreInvestor(investor: InvestorForMatching, input: MatchInput): InvestorMatch {
  const reasons: MatchReason[] = [];
  let totalPoints = 0;

  const normalizedInputStage = normalizeStage(input.stage);
  const normalizedInputSectors = input.sectors.map(normalizeSector);
  const normalizedInvestorStages = investor.stages.map(normalizeStage);
  const normalizedInvestorSectors = investor.sectors.map(normalizeSector);

  // 1. STAGE MATCH (30 points)
  const stageMatch = normalizedInvestorStages.includes(normalizedInputStage);
  const stagePoints = stageMatch ? WEIGHTS.stage : 0;
  totalPoints += stagePoints;
  reasons.push({
    dimension: "Stage",
    matched: stageMatch,
    detail: stageMatch
      ? `Invests at ${input.stage} stage`
      : `Typically invests at ${investor.stages.join(", ")} — not ${input.stage}`,
    points: stagePoints,
  });

  // 2. SECTOR MATCH (25 points, scaled by overlap)
  const sectorOverlap = normalizedInputSectors.filter((s) =>
    normalizedInvestorSectors.includes(s)
  );
  const sectorRatio = normalizedInputSectors.length > 0
    ? sectorOverlap.length / normalizedInputSectors.length
    : 0;
  const sectorPoints = Math.round(WEIGHTS.sector * sectorRatio);
  totalPoints += sectorPoints;
  reasons.push({
    dimension: "Sector",
    matched: sectorOverlap.length > 0,
    detail: sectorOverlap.length > 0
      ? `Sector focus includes ${sectorOverlap.join(", ")}`
      : `Focuses on ${investor.sectors.slice(0, 3).join(", ")} — different from your sector`,
    points: sectorPoints,
  });

  // 3. GEOGRAPHY MATCH (15 points)
  const geoMatch = investor.geographies.some(
    (g) => g === input.geography || g === "Global"
  );
  const geoPoints = geoMatch ? WEIGHTS.geography : 0;
  totalPoints += geoPoints;
  reasons.push({
    dimension: "Geography",
    matched: geoMatch,
    detail: geoMatch
      ? `Invests in ${input.geography}`
      : `Focuses on ${investor.geographies.join(", ")} — not ${input.geography}`,
    points: geoPoints,
  });

  // 4. CHEQUE SIZE MATCH (20 points)
  let chequeMatch = false;
  let chequeDetail: string;
  if (input.askAmount && investor.chequeMin != null && investor.chequeMax != null) {
    chequeMatch = input.askAmount >= investor.chequeMin && input.askAmount <= investor.chequeMax;
    const fmt = formatAmount;
    chequeDetail = chequeMatch
      ? `Your ask fits their range (${fmt(investor.chequeMin)} - ${fmt(investor.chequeMax)})`
      : `Typical cheque: ${fmt(investor.chequeMin)} - ${fmt(investor.chequeMax)}`;
  } else if (input.askAmount && investor.chequeMin != null) {
    chequeMatch = input.askAmount >= investor.chequeMin;
    chequeDetail = chequeMatch
      ? `Your ask fits (min ${formatAmount(investor.chequeMin)})`
      : `Minimum cheque is ${formatAmount(investor.chequeMin)}`;
  } else {
    // No cheque data — give partial credit
    chequeMatch = true;
    chequeDetail = "Cheque range not specified";
  }
  const chequePoints = chequeMatch ? WEIGHTS.cheque : (input.askAmount ? 0 : Math.round(WEIGHTS.cheque * 0.5));
  totalPoints += chequePoints;
  reasons.push({
    dimension: "Cheque Size",
    matched: chequeMatch,
    detail: chequeDetail,
    points: chequePoints,
  });

  // 5. TYPE PREFERENCE (10 points)
  let typeMatch = true;
  let typeDetail = "";
  if (input.investorType) {
    typeMatch = investor.type === input.investorType;
    typeDetail = typeMatch
      ? `Matches your preference for ${input.investorType}`
      : `This is a ${investor.type}, you preferred ${input.investorType}`;
  } else {
    typeDetail = `${investor.type} investor`;
  }
  const typePoints = typeMatch ? WEIGHTS.type : 0;
  totalPoints += typePoints;
  reasons.push({
    dimension: "Investor Type",
    matched: typeMatch,
    detail: typeDetail,
    points: typePoints,
  });

  // Top reasons: matched dimensions sorted by weight
  const topReasons = reasons
    .filter((r) => r.matched && r.points > 0)
    .sort((a, b) => b.points - a.points)
    .slice(0, 3)
    .map((r) => r.detail);

  return {
    investor,
    fitScore: Math.min(100, totalPoints),
    reasons,
    topReasons,
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
): InvestorMatch[] {
  return investors
    .map((inv) => scoreInvestor(inv, input))
    .sort((a, b) => b.fitScore - a.fitScore);
}

/**
 * Build a MatchInput from Deck model fields.
 * Call this when generating matches for a specific deck.
 */
export function deckToMatchInput(deck: {
  stage: string;
  industry: string;
  fundingTarget: string;
  investorType?: string;
}): MatchInput {
  return {
    stage: deck.stage,
    sectors: extractSectors(deck.industry),
    geography: "US", // Default — could be extended with a geography field on Deck
    askAmount: parseFundingAmount(deck.fundingTarget),
    investorType: deck.investorType,
  };
}

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------

function formatAmount(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(0)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount}`;
}
