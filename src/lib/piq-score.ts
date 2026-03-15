import { SlideData, PIQScore, PIQDimension } from "@/lib/types";

const DIMENSIONS = [
  { id: "narrative", label: "Narrative Structure", weight: 15 },
  { id: "market", label: "Market Sizing", weight: 15 },
  { id: "differentiation", label: "Competitive Differentiation", weight: 12 },
  { id: "financials", label: "Financial Clarity", weight: 15 },
  { id: "team", label: "Team Presentation", weight: 10 },
  { id: "ask", label: "Ask Justification", weight: 13 },
  { id: "design", label: "Design Quality", weight: 10 },
  { id: "credibility", label: "Data Credibility", weight: 10 },
];

function getGrade(score: number): string {
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "A-";
  if (score >= 80) return "B+";
  if (score >= 75) return "B";
  if (score >= 70) return "B-";
  if (score >= 65) return "C+";
  if (score >= 60) return "C";
  if (score >= 55) return "C-";
  if (score >= 50) return "D+";
  if (score >= 45) return "D";
  return "F";
}

function parseAIResponse(text: string): PIQScore {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON in AI response");

  const parsed = JSON.parse(jsonMatch[0]);

  const dimensions: PIQDimension[] = DIMENSIONS.map((dim) => {
    const aiDim = parsed.dimensions?.find((d: { id: string }) => d.id === dim.id);
    return {
      id: dim.id,
      label: dim.label,
      weight: dim.weight,
      score: Math.min(100, Math.max(0, aiDim?.score ?? 50)),
      feedback: aiDim?.feedback ?? "",
    };
  });

  const overall = Math.round(
    dimensions.reduce((sum, d) => sum + d.score * (d.weight / 100), 0)
  );

  return {
    overall,
    grade: getGrade(overall),
    dimensions,
    recommendations: parsed.recommendations || [],
  };
}

const SCORING_PROMPT = `You are an expert pitch deck evaluator used by VCs and founders. Score this pitch deck on 8 dimensions (0-100 each).

DIMENSIONS & WEIGHTS:
1. Narrative Structure (15%) — Story flow, completeness, pacing, logical progression from problem → solution → traction → ask
2. Market Sizing (15%) — TAM/SAM/SOM clarity, market data quality, growth potential evidence
3. Competitive Differentiation (12%) — Unique value proposition, defensibility, competitive landscape awareness
4. Financial Clarity (15%) — Revenue model, projections, unit economics, realistic assumptions
5. Team Presentation (10%) — Founder credibility, relevant experience, completeness of team
6. Ask Justification (13%) — Funding amount rationale, use of funds, milestone alignment
7. Design Quality (10%) — Visual hierarchy, readability, professional polish, consistent branding, appropriate use of whitespace and imagery
8. Data Credibility (10%) — Traction evidence, validated metrics, social proof, data-backed claims

SCORING GUIDELINES:
- 90-100: Exceptional, investor-ready
- 75-89: Strong, minor improvements needed
- 60-74: Average, significant gaps
- 40-59: Below average, major issues
- 0-39: Poor, fundamental rework needed

Be honest and critical. Most decks should score 50-75. Only truly exceptional decks score above 85.

Return ONLY valid JSON in this exact structure:
{
  "dimensions": [
    {"id": "narrative", "score": <0-100>, "feedback": "<1 specific sentence>"},
    {"id": "market", "score": <0-100>, "feedback": "<1 specific sentence>"},
    {"id": "differentiation", "score": <0-100>, "feedback": "<1 specific sentence>"},
    {"id": "financials", "score": <0-100>, "feedback": "<1 specific sentence>"},
    {"id": "team", "score": <0-100>, "feedback": "<1 specific sentence>"},
    {"id": "ask", "score": <0-100>, "feedback": "<1 specific sentence>"},
    {"id": "design", "score": <0-100>, "feedback": "<1 specific sentence>"},
    {"id": "credibility", "score": <0-100>, "feedback": "<1 specific sentence>"}
  ],
  "recommendations": ["<actionable tip 1>", "<actionable tip 2>", "<actionable tip 3>"]
}`;

/**
 * Max raw PDF size we'll attempt to send to the vision API.
 * Base64 inflates by ~33%, plus the prompt text, so 20MB raw → ~27MB request (under 32MB API limit).
 */
const MAX_VISION_PDF_SIZE = 20 * 1024 * 1024; // 20MB

/**
 * Score an uploaded PDF deck visually using Claude's vision/document API.
 * Sends the raw PDF buffer so Claude can see layout, design, charts, and images.
 */
export async function scoreDeckWithVision(
  pdfBuffer: Buffer,
  companyName: string
): Promise<PIQScore> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY required for vision scoring");

  if (pdfBuffer.length > MAX_VISION_PDF_SIZE) {
    throw new Error(`PDF too large for vision scoring (${(pdfBuffer.length / 1024 / 1024).toFixed(1)}MB > 20MB limit)`);
  }

  const base64Pdf = pdfBuffer.toString("base64");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 55_000); // 55s timeout (Vercel function has 60s)

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: base64Pdf,
                },
              },
              {
                type: "text",
                text: `${SCORING_PROMPT}\n\nCompany name: ${companyName}\n\nAnalyze the pitch deck document above. You can see every slide visually — evaluate the design, layout, charts, imagery, and text content together.`,
              },
            ],
          },
        ],
      }),
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      console.error(`[scoreDeckWithVision] API error ${res.status}:`, errText);
      throw new Error(`Vision scoring API error ${res.status}`);
    }

    const data = await res.json();
    const text = data.content?.[0]?.text || "";
    return parseAIResponse(text);
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Score a deck using AI (Claude) from slide text data.
 * Falls back to heuristic scoring when no key is set.
 */
export async function scoreDeck(
  slides: SlideData[],
  input: {
    companyName: string;
    industry: string;
    stage: string;
    fundingTarget: string;
    problem: string;
    solution: string;
    keyMetrics: string;
    teamInfo: string;
  }
): Promise<PIQScore> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (apiKey) {
    try {
      return await aiScore(slides, input, apiKey);
    } catch {
      // Fall through to heuristic
    }
  }

  return heuristicScore(slides, input);
}

async function aiScore(
  slides: SlideData[],
  input: {
    companyName: string;
    industry: string;
    stage: string;
    fundingTarget: string;
    problem: string;
    solution: string;
    keyMetrics: string;
    teamInfo: string;
  },
  apiKey: string
): Promise<PIQScore> {
  const slidesSummary = slides
    .map((s, i) => `Slide ${i + 1} (${s.type}): ${s.title}${s.subtitle ? " — " + s.subtitle : ""}\n${s.content.join("\n")}`)
    .join("\n\n");

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      messages: [
        {
          role: "user",
          content: `${SCORING_PROMPT}

Company: ${input.companyName}
Industry: ${input.industry}
Stage: ${input.stage}
Funding Target: ${input.fundingTarget}
Problem: ${input.problem}
Solution: ${input.solution}
Key Metrics: ${input.keyMetrics}
Team: ${input.teamInfo}

SLIDES:
${slidesSummary}`,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error("AI scoring failed");

  const data = await res.json();
  const text = data.content?.[0]?.text || "";
  return parseAIResponse(text);
}

/**
 * Heuristic scoring — keyword and completeness checks.
 * Used when no AI API key is available.
 */
function heuristicScore(
  slides: SlideData[],
  input: {
    problem: string;
    solution: string;
    keyMetrics: string;
    teamInfo: string;
    fundingTarget: string;
    stage: string;
    industry: string;
    companyName: string;
  }
): PIQScore {
  const allContent = slides.flatMap((s) => [s.title, s.subtitle || "", ...s.content]).join(" ").toLowerCase();

  const scoreNarrative = () => {
    let score = 50;
    if (slides.length >= 5) score += 15;
    if (slides.some((s) => s.type === "title")) score += 10;
    if (slides.some((s) => s.type === "cta")) score += 10;
    if (input.problem.length > 50) score += 8;
    if (input.solution.length > 50) score += 7;
    return Math.min(100, score);
  };

  const scoreMarket = () => {
    let score = 40;
    const marketTerms = ["tam", "sam", "som", "market size", "billion", "million", "addressable", "growth"];
    for (const term of marketTerms) if (allContent.includes(term)) score += 8;
    if (input.industry.length > 0) score += 5;
    return Math.min(100, score);
  };

  const scoreDifferentiation = () => {
    let score = 50;
    const diffTerms = ["unique", "first", "only", "patent", "proprietary", "competitive", "moat", "advantage"];
    for (const term of diffTerms) if (allContent.includes(term)) score += 7;
    if (slides.some((s) => s.type === "comparison")) score += 10;
    return Math.min(100, score);
  };

  const scoreFinancials = () => {
    let score = 40;
    const finTerms = ["revenue", "mrr", "arr", "margin", "unit economics", "cac", "ltv", "runway", "burn"];
    for (const term of finTerms) if (allContent.includes(term)) score += 7;
    if (input.keyMetrics.length > 30) score += 10;
    return Math.min(100, score);
  };

  const scoreTeam = () => {
    let score = 45;
    if (input.teamInfo.length > 20) score += 15;
    if (input.teamInfo.length > 80) score += 10;
    const teamTerms = ["founder", "ceo", "cto", "experience", "years", "previously", "built"];
    for (const term of teamTerms) if (input.teamInfo.toLowerCase().includes(term)) score += 5;
    return Math.min(100, score);
  };

  const scoreAsk = () => {
    let score = 45;
    if (input.fundingTarget.length > 0) score += 15;
    const askTerms = ["raise", "funding", "use of funds", "allocation", "milestone", "18 months", "runway"];
    for (const term of askTerms) if (allContent.includes(term)) score += 6;
    return Math.min(100, score);
  };

  const scoreDesign = () => {
    let score = 65;
    if (slides.length >= 5) score += 10;
    if (slides.some((s) => s.type === "stats")) score += 8;
    if (slides.every((s) => s.title.length > 0)) score += 7;
    return Math.min(100, score);
  };

  const scoreCredibility = () => {
    let score = 40;
    const credTerms = ["customer", "user", "partner", "revenue", "growth", "data", "validated", "traction", "pilot"];
    for (const term of credTerms) if (allContent.includes(term)) score += 7;
    if (input.keyMetrics.length > 50) score += 10;
    return Math.min(100, score);
  };

  const scoreFns: Record<string, () => number> = {
    narrative: scoreNarrative,
    market: scoreMarket,
    differentiation: scoreDifferentiation,
    financials: scoreFinancials,
    team: scoreTeam,
    ask: scoreAsk,
    design: scoreDesign,
    credibility: scoreCredibility,
  };

  const dimensions: PIQDimension[] = DIMENSIONS.map((dim) => ({
    id: dim.id,
    label: dim.label,
    weight: dim.weight,
    score: scoreFns[dim.id](),
    feedback: "",
  }));

  const overall = Math.round(
    dimensions.reduce((sum, d) => sum + d.score * (d.weight / 100), 0)
  );

  return {
    overall,
    grade: getGrade(overall),
    dimensions,
    recommendations: [
      "Add specific market size data (TAM/SAM/SOM) to strengthen your market slide",
      "Include concrete traction metrics to boost credibility",
      "Detail your use of funds breakdown to justify your ask",
    ],
  };
}
