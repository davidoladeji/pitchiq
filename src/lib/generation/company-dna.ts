import Anthropic from "@anthropic-ai/sdk";
import type { DeckInput } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type NarrativeArchetype =
  | "disruptor"
  | "inevitable-trend"
  | "data-story"
  | "vision"
  | "secret-insight"
  | "proven-model"
  | "team-story"
  | "traction-machine";

export type VisualPersonality =
  | "corporate-premium"
  | "bold-playful"
  | "clinical-clean"
  | "scientific-rigorous"
  | "futuristic-gradient"
  | "organic-hopeful"
  | "editorial-refined"
  | "startup-energetic";

export interface CompanyDNA {
  // Core identity
  companyName: string;
  industry: string;
  stage: string;
  fundingTarget: string;

  // Derived intelligence
  narrativeArchetype: NarrativeArchetype;
  visualPersonality: VisualPersonality;
  informationDensity: "data-heavy" | "vision-heavy" | "balanced";
  contentTone: "technical" | "visionary" | "professional" | "bold" | "scientific";
  keyTension: string;
  uniqueAngle: string;
  audienceProfile: string;

  // Content strength assessment
  hasTraction: boolean;
  hasProduct: boolean;
  hasRevenue: boolean;
  hasTeamCredibility: boolean;
  hasCompetitiveMoat: boolean;
  hasMarketData: boolean;

  // Visual inputs
  brandColor?: string;
  brandFont?: string;
  brandLogo?: string;
}

/* ------------------------------------------------------------------ */
/*  AI Analysis (uses Haiku for speed)                                 */
/* ------------------------------------------------------------------ */

const DNA_PROMPT = `Analyze this startup and determine the best storytelling strategy for their pitch deck.

Company: {companyName}
Industry: {industry}
Stage: {stage}
Funding Target: {fundingTarget}
Problem: {problem}
Solution: {solution}
Key Metrics: {keyMetrics}
Team: {teamInfo}
Investor Type: {investorType}

Return ONLY valid JSON (no markdown fences):
{
  "narrativeArchetype": one of "disruptor" | "inevitable-trend" | "data-story" | "vision" | "secret-insight" | "proven-model" | "team-story" | "traction-machine",
  "visualPersonality": one of "corporate-premium" | "bold-playful" | "clinical-clean" | "scientific-rigorous" | "futuristic-gradient" | "organic-hopeful" | "editorial-refined" | "startup-energetic",
  "informationDensity": one of "data-heavy" | "vision-heavy" | "balanced",
  "contentTone": one of "technical" | "visionary" | "professional" | "bold" | "scientific",
  "keyTension": "one sentence describing the central conflict this deck resolves",
  "uniqueAngle": "what makes this company's story different from competitors",
  "audienceProfile": "what this investor type cares about most",
  "hasTraction": boolean,
  "hasProduct": boolean,
  "hasRevenue": boolean,
  "hasTeamCredibility": boolean,
  "hasCompetitiveMoat": boolean,
  "hasMarketData": boolean
}

Rules for archetype selection:
- Series A+ with strong metrics → "traction-machine" or "data-story"
- Pre-seed with big vision but little traction → "vision" or "disruptor"
- Angel with strong founder story → "team-story"
- Company in emerging trend (AI, climate, crypto, etc.) → "inevitable-trend"
- Company with non-obvious insight → "secret-insight"
- Applying proven model to new market → "proven-model"

Rules for visual personality:
- Fintech, enterprise SaaS, B2B → "corporate-premium"
- Consumer apps, social, gaming, D2C → "bold-playful"
- Healthtech, medtech → "clinical-clean"
- Deeptech, hardware, robotics → "scientific-rigorous"
- Crypto, AI/ML platform, frontier tech → "futuristic-gradient"
- Climate, sustainability, agtech, food-tech → "organic-hopeful"
- Media, content, marketplace → "editorial-refined"
- General early-stage, accelerator pitch → "startup-energetic"`;

export async function analyzeCompanyDNA(input: DeckInput): Promise<CompanyDNA> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return analyzeCompanyDNAHeuristic(input);
  }

  try {
    const client = new Anthropic({ apiKey });
    const prompt = DNA_PROMPT
      .replace("{companyName}", input.companyName)
      .replace("{industry}", input.industry || "Not specified")
      .replace("{stage}", input.stage || "Not specified")
      .replace("{fundingTarget}", input.fundingTarget || "Not specified")
      .replace("{problem}", input.problem || "Not specified")
      .replace("{solution}", input.solution || "Not specified")
      .replace("{keyMetrics}", input.keyMetrics || "No metrics provided")
      .replace("{teamInfo}", input.teamInfo || "No team info provided")
      .replace("{investorType}", input.investorType || "vc");

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 800,
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in DNA response");

    const parsed = JSON.parse(jsonMatch[0]);

    const dna: CompanyDNA = {
      companyName: input.companyName,
      industry: input.industry || "",
      stage: input.stage || "",
      fundingTarget: input.fundingTarget || "",
      narrativeArchetype: validateArchetype(parsed.narrativeArchetype),
      visualPersonality: validatePersonality(parsed.visualPersonality),
      informationDensity: validateDensity(parsed.informationDensity),
      contentTone: validateTone(parsed.contentTone),
      keyTension: parsed.keyTension || "Solving a critical market need",
      uniqueAngle: parsed.uniqueAngle || "Unique approach to the problem",
      audienceProfile: parsed.audienceProfile || "Growth-focused investors",
      hasTraction: !!parsed.hasTraction,
      hasProduct: !!parsed.hasProduct,
      hasRevenue: !!parsed.hasRevenue,
      hasTeamCredibility: !!parsed.hasTeamCredibility,
      hasCompetitiveMoat: !!parsed.hasCompetitiveMoat,
      hasMarketData: !!parsed.hasMarketData,
      brandColor: input.brandPrimaryColor,
      brandFont: input.brandFont,
      brandLogo: input.brandLogo,
    };

    // Apply user overrides if provided
    applyUserOverrides(dna, input);
    return dna;
  } catch (error) {
    console.error("[analyzeCompanyDNA] AI failed, using heuristic:", error);
    return analyzeCompanyDNAHeuristic(input);
  }
}

/* ------------------------------------------------------------------ */
/*  Heuristic Fallback (no API key)                                    */
/* ------------------------------------------------------------------ */

export function analyzeCompanyDNAHeuristic(input: DeckInput): CompanyDNA {
  const industry = (input.industry || "").toLowerCase();
  const stage = (input.stage || "").toLowerCase();
  const metrics = (input.keyMetrics || "").toLowerCase();
  const investorType = input.investorType || "vc";

  // Visual personality from industry keywords
  const visualPersonality = deriveVisualPersonality(industry);

  // Narrative archetype from stage + metrics + investor
  const narrativeArchetype = deriveNarrativeArchetype(stage, metrics, investorType, input);

  // Content strength assessment
  const hasTraction = /\d+[kKmMbB]|\d+%|revenue|mrr|arr|users|customer/i.test(metrics);
  const hasRevenue = /revenue|mrr|arr|\$\d+/i.test(metrics);
  const hasProduct = /launch|live|beta|users|product|app|platform/i.test(input.solution + " " + metrics);
  const hasTeamCredibility = /ex-|former|founded|sold|exit|years|phd|professor|cto at/i.test(input.teamInfo || "");
  const hasCompetitiveMoat = /patent|proprietary|network effect|first mover|data advantage/i.test(input.solution || "");
  const hasMarketData = /tam|sam|som|billion|million|market size|growing/i.test(input.problem + " " + metrics);

  // Information density
  const informationDensity: CompanyDNA["informationDensity"] =
    hasTraction && hasRevenue ? "data-heavy" :
    !hasTraction && !hasProduct ? "vision-heavy" : "balanced";

  // Content tone
  const contentTone: CompanyDNA["contentTone"] =
    /biotech|pharma|medical|research|scientific/i.test(industry) ? "scientific" :
    /ai|ml|deep\s?tech|robotics|quantum/i.test(industry) ? "technical" :
    /consumer|social|gaming|entertainment|media/i.test(industry) ? "bold" :
    /crypto|web3|blockchain|defi/i.test(industry) ? "visionary" : "professional";

  const dna: CompanyDNA = {
    companyName: input.companyName,
    industry: input.industry || "",
    stage: input.stage || "",
    fundingTarget: input.fundingTarget || "",
    narrativeArchetype,
    visualPersonality,
    informationDensity,
    contentTone,
    keyTension: `The ${input.industry || "market"} is broken — ${input.companyName} fixes it`,
    uniqueAngle: input.solution?.slice(0, 100) || "Novel approach to the problem",
    audienceProfile: investorType === "angel" ? "People and passion" : investorType === "accelerator" ? "Speed and learning velocity" : "Market size and scalability",
    hasTraction,
    hasProduct,
    hasRevenue,
    hasTeamCredibility,
    hasCompetitiveMoat,
    hasMarketData,
    brandColor: input.brandPrimaryColor,
    brandFont: input.brandFont,
    brandLogo: input.brandLogo,
  };

  // Apply user overrides if provided
  applyUserOverrides(dna, input);
  return dna;
}

/* ------------------------------------------------------------------ */
/*  User Override Application                                          */
/* ------------------------------------------------------------------ */

function applyUserOverrides(dna: CompanyDNA, input: DeckInput): void {
  if (input.narrativeStyle && VALID_ARCHETYPES.includes(input.narrativeStyle as NarrativeArchetype)) {
    dna.narrativeArchetype = input.narrativeStyle as NarrativeArchetype;
  }
  if (input.visualStyle && VALID_PERSONALITIES.includes(input.visualStyle as VisualPersonality)) {
    dna.visualPersonality = input.visualStyle as VisualPersonality;
  }
  if (input.emphasis) {
    dna.informationDensity = input.emphasis === "data-heavy" ? "data-heavy" : input.emphasis === "visual" ? "vision-heavy" : "balanced";
  }
}

/* ------------------------------------------------------------------ */
/*  Derivation Helpers                                                 */
/* ------------------------------------------------------------------ */

function deriveVisualPersonality(industry: string): VisualPersonality {
  if (/fintech|banking|insurance|finance|payments/i.test(industry)) return "corporate-premium";
  if (/enterprise|b2b|saas|erp|crm/i.test(industry)) return "corporate-premium";
  if (/consumer|social|gaming|entertainment|d2c|fashion|food.*delivery/i.test(industry)) return "bold-playful";
  if (/health|medical|biotech|pharma|clinical|wellness/i.test(industry)) return "clinical-clean";
  if (/deep\s?tech|hardware|robotics|semiconductor|quantum|aerospace/i.test(industry)) return "scientific-rigorous";
  if (/crypto|web3|blockchain|ai|ml|machine learning|frontier/i.test(industry)) return "futuristic-gradient";
  if (/climate|clean\s?tech|sustainability|agtech|energy|solar|ev/i.test(industry)) return "organic-hopeful";
  if (/media|content|marketplace|e-?commerce|publishing/i.test(industry)) return "editorial-refined";
  return "startup-energetic";
}

function deriveNarrativeArchetype(
  stage: string,
  metrics: string,
  investorType: string,
  input: DeckInput,
): NarrativeArchetype {
  const hasStrongMetrics = /\d+[kKmMbB]|\d+%|revenue|mrr|arr/i.test(metrics);
  const isEarlyStage = /pre-?seed|idea|concept/i.test(stage);
  const isSeriesA = /series\s?[a-c]|growth/i.test(stage);
  const hasTrend = /ai|climate|web3|crypto|ev|autonomous/i.test(input.industry || "");

  if (isSeriesA && hasStrongMetrics) return "traction-machine";
  if (hasStrongMetrics && !isEarlyStage) return "data-story";
  if (investorType === "angel") return "team-story";
  if (hasTrend) return "inevitable-trend";
  if (isEarlyStage && !hasStrongMetrics) return "vision";
  if (/disrupt|revolutionary|first/i.test(input.solution || "")) return "disruptor";
  if (/proven|existing|adapting/i.test(input.solution || "")) return "proven-model";
  return "vision";
}

/* ------------------------------------------------------------------ */
/*  Validators                                                         */
/* ------------------------------------------------------------------ */

const VALID_ARCHETYPES: NarrativeArchetype[] = [
  "disruptor", "inevitable-trend", "data-story", "vision",
  "secret-insight", "proven-model", "team-story", "traction-machine",
];

const VALID_PERSONALITIES: VisualPersonality[] = [
  "corporate-premium", "bold-playful", "clinical-clean", "scientific-rigorous",
  "futuristic-gradient", "organic-hopeful", "editorial-refined", "startup-energetic",
];

function validateArchetype(v: string): NarrativeArchetype {
  return VALID_ARCHETYPES.includes(v as NarrativeArchetype) ? v as NarrativeArchetype : "vision";
}

function validatePersonality(v: string): VisualPersonality {
  return VALID_PERSONALITIES.includes(v as VisualPersonality) ? v as VisualPersonality : "startup-energetic";
}

function validateDensity(v: string): CompanyDNA["informationDensity"] {
  return (["data-heavy", "vision-heavy", "balanced"] as const).includes(v as CompanyDNA["informationDensity"])
    ? v as CompanyDNA["informationDensity"] : "balanced";
}

function validateTone(v: string): CompanyDNA["contentTone"] {
  return (["technical", "visionary", "professional", "bold", "scientific"] as const).includes(v as CompanyDNA["contentTone"])
    ? v as CompanyDNA["contentTone"] : "professional";
}
