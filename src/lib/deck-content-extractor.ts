import Anthropic from "@anthropic-ai/sdk";

export interface ExtractedDeckContent {
  companyName: string;
  tagline?: string;
  problem: string;
  solution: string;
  industry: string;
  stage: string;
  fundingTarget: string;
  keyMetrics: string;
  teamInfo: string;
  businessModel?: string;
  revenueModel?: string;
  customerType?: string;
  competitiveAdvantage?: string;
  traction?: string;
  marketSize?: string;
  useOfFunds?: string;
  slideTexts: string[];
  extractionConfidence: "high" | "medium" | "low";
}

const EXTRACTION_PROMPT = `You are an expert pitch deck analyst. Extract structured company information from the following slide texts.

Return ONLY valid JSON with these fields (use empty string "" if the information is not found — never omit a field):
{
  "companyName": "string — the startup/company name",
  "tagline": "string — company tagline or one-liner if present",
  "problem": "string — the problem being addressed",
  "solution": "string — the proposed solution",
  "industry": "string — industry or sector (e.g. FinTech, HealthTech, SaaS)",
  "stage": "string — funding stage (e.g. Pre-seed, Seed, Series A)",
  "fundingTarget": "string — how much they are raising (e.g. $2M)",
  "keyMetrics": "string — key traction metrics, KPIs, numbers",
  "teamInfo": "string — team members, roles, backgrounds",
  "businessModel": "string — how the company makes money",
  "revenueModel": "string — pricing, subscription, transaction model details",
  "customerType": "string — target customer segment (B2B, B2C, enterprise, SMB)",
  "competitiveAdvantage": "string — moat, differentiators, unique advantages",
  "traction": "string — customers, revenue, growth, partnerships",
  "marketSize": "string — TAM, SAM, SOM, market data",
  "useOfFunds": "string — how funding will be allocated"
}

Important:
- Extract REAL data from the slides — never invent or hallucinate information.
- If a field is partially present, include what you find.
- Combine information from multiple slides when relevant.
- Handle messy formatting, OCR artifacts, and incomplete decks gracefully.`;

/**
 * Determines extraction confidence based on how many optional fields are filled.
 */
function computeConfidence(
  data: Record<string, string | undefined>
): "high" | "medium" | "low" {
  const optionalFields = [
    "tagline",
    "businessModel",
    "revenueModel",
    "customerType",
    "competitiveAdvantage",
    "traction",
    "marketSize",
    "useOfFunds",
  ];
  const requiredFields = [
    "companyName",
    "problem",
    "solution",
    "industry",
    "stage",
    "fundingTarget",
    "keyMetrics",
    "teamInfo",
  ];

  let filled = 0;
  for (const f of [...requiredFields, ...optionalFields]) {
    if (data[f] && data[f]!.trim().length > 0) filled++;
  }

  if (filled >= 8) return "high";
  if (filled >= 4) return "medium";
  return "low";
}

/**
 * Heuristic fallback: extract company info from slide texts using pattern matching.
 * Used when no API key is available or AI extraction fails.
 */
function heuristicExtract(
  slideTexts: string[],
  deckTitle?: string
): ExtractedDeckContent {
  const allText = slideTexts.join("\n");
  const allLower = allText.toLowerCase();

  // Company name: first meaningful line from first slide, or deck title
  let companyName = deckTitle || "";
  if (!companyName) {
    for (const line of slideTexts[0]?.split("\n") || []) {
      const trimmed = line.trim();
      if (
        trimmed.length > 2 &&
        !/^slide\s*\d/i.test(trimmed) &&
        !/^\d+$/.test(trimmed)
      ) {
        companyName = trimmed;
        break;
      }
    }
  }

  // Pattern-based extraction helpers
  const findSection = (patterns: RegExp[]): string => {
    for (const text of slideTexts) {
      for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
          // Return the text after the matched label, or the full slide text
          const afterLabel = text.slice((match.index ?? 0) + match[0].length).trim();
          return afterLabel.split("\n").slice(0, 4).join(" ").trim() || text.trim();
        }
      }
    }
    return "";
  };

  const problem = findSection([
    /\bproblem\b[:\s-]*/i,
    /\bpain\s*point\b[:\s-]*/i,
    /\bchallenge\b[:\s-]*/i,
  ]);

  const solution = findSection([
    /\bsolution\b[:\s-]*/i,
    /\bhow\s+(it|we)\s+work/i,
    /\bour\s+approach\b[:\s-]*/i,
  ]);

  const teamInfo = findSection([
    /\bteam\b[:\s-]*/i,
    /\bfounders?\b[:\s-]*/i,
    /\bleadership\b[:\s-]*/i,
  ]);

  // Funding stage detection
  let stage = "";
  const stagePatterns = [
    /\b(pre[-\s]?seed)\b/i,
    /\b(seed)\b/i,
    /\b(series\s*[a-d])\b/i,
    /\b(bridge)\b/i,
  ];
  for (const p of stagePatterns) {
    const m = allText.match(p);
    if (m) {
      stage = m[1];
      break;
    }
  }

  // Funding target: look for dollar amounts near "raise", "raising", "seeking"
  let fundingTarget = "";
  const fundingMatch = allText.match(
    /(?:rais(?:e|ing)|seek(?:ing)?|target(?:ing)?)\s+\$[\d,.]+\s*[mkb]?(?:illion)?/i
  );
  if (fundingMatch) {
    const amountMatch = fundingMatch[0].match(/\$[\d,.]+\s*[mkb]?(?:illion)?/i);
    fundingTarget = amountMatch ? amountMatch[0] : "";
  }
  if (!fundingTarget) {
    // Fallback: find any prominent dollar amount
    const dollarMatch = allText.match(/\$[\d,.]+\s*[mkb](?:illion)?/i);
    if (dollarMatch) fundingTarget = dollarMatch[0];
  }

  // Key metrics: find numbers and percentages
  let keyMetrics = "";
  const metricMatches = allText.match(
    /\d+[%xX]|\$[\d,.]+[mkb]?|\d+[\d,]*\+?\s*(?:users?|customers?|mrr|arr|revenue)/gi
  );
  if (metricMatches) {
    keyMetrics = Array.from(new Set(metricMatches)).slice(0, 5).join(", ");
  }

  // Industry detection
  let industry = "";
  const industryTerms: Record<string, string[]> = {
    FinTech: ["fintech", "financial", "banking", "payments", "lending"],
    HealthTech: ["health", "medical", "clinical", "patient", "healthcare"],
    EdTech: ["education", "learning", "school", "student", "training"],
    SaaS: ["saas", "software as a service", "subscription platform"],
    "E-Commerce": ["ecommerce", "e-commerce", "marketplace", "retail"],
    AI: ["artificial intelligence", "machine learning", "ai-powered", "ml"],
    CleanTech: ["clean energy", "sustainability", "carbon", "green"],
  };
  for (const [label, terms] of Object.entries(industryTerms)) {
    if (terms.some((t) => allLower.includes(t))) {
      industry = label;
      break;
    }
  }

  // Market size
  let marketSize = "";
  const tamMatch = allText.match(/\b(?:tam|total\s+addressable\s+market)[:\s]*\$?[\d,.]+\s*[bmk]?(?:illion)?/i);
  if (tamMatch) marketSize = tamMatch[0];

  const data: Record<string, string> = {
    companyName,
    problem,
    solution,
    industry,
    stage,
    fundingTarget,
    keyMetrics,
    teamInfo,
    marketSize,
  };

  return {
    companyName: companyName || "Unknown Company",
    problem,
    solution,
    industry,
    stage,
    fundingTarget,
    keyMetrics,
    teamInfo,
    marketSize: marketSize || undefined,
    slideTexts,
    extractionConfidence: computeConfidence(data),
  };
}

/**
 * Extract structured company information from raw slide texts using AI.
 * Falls back to heuristic pattern matching when no API key is available or AI fails.
 */
export async function extractDeckContent(
  slideTexts: string[],
  deckTitle?: string
): Promise<ExtractedDeckContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.log("[extractDeckContent] No API key — using heuristic extraction");
    return heuristicExtract(slideTexts, deckTitle);
  }

  try {
    const anthropic = new Anthropic({ apiKey });

    const slideContent = slideTexts
      .map((text, i) => `--- Slide ${i + 1} ---\n${text}`)
      .join("\n\n");

    const msg = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: `${EXTRACTION_PROMPT}\n\n${deckTitle ? `Deck title: ${deckTitle}\n\n` : ""}SLIDE TEXTS:\n${slideContent}`,
        },
      ],
    });

    const text = msg.content[0].type === "text" ? msg.content[0].text : "";

    // Parse JSON from response (handle potential markdown fences)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.warn("[extractDeckContent] No JSON found in AI response — falling back to heuristic");
      return heuristicExtract(slideTexts, deckTitle);
    }

    const parsed = JSON.parse(jsonMatch[0]) as Record<string, string>;

    const confidence = computeConfidence(parsed);

    return {
      companyName: parsed.companyName || deckTitle || "Unknown Company",
      tagline: parsed.tagline || undefined,
      problem: parsed.problem || "",
      solution: parsed.solution || "",
      industry: parsed.industry || "",
      stage: parsed.stage || "",
      fundingTarget: parsed.fundingTarget || "",
      keyMetrics: parsed.keyMetrics || "",
      teamInfo: parsed.teamInfo || "",
      businessModel: parsed.businessModel || undefined,
      revenueModel: parsed.revenueModel || undefined,
      customerType: parsed.customerType || undefined,
      competitiveAdvantage: parsed.competitiveAdvantage || undefined,
      traction: parsed.traction || undefined,
      marketSize: parsed.marketSize || undefined,
      useOfFunds: parsed.useOfFunds || undefined,
      slideTexts,
      extractionConfidence: confidence,
    };
  } catch (error) {
    console.error("[extractDeckContent] AI extraction failed:", error);
    return heuristicExtract(slideTexts, deckTitle);
  }
}
