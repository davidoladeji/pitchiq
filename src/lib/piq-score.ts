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

/**
 * Score a deck using AI (Claude) if API key is available.
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
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: `You are an expert pitch deck evaluator. Score this pitch deck on 8 dimensions (0-100 each). Return ONLY valid JSON.

Company: ${input.companyName}
Industry: ${input.industry}
Stage: ${input.stage}
Funding Target: ${input.fundingTarget}
Problem: ${input.problem}
Solution: ${input.solution}
Key Metrics: ${input.keyMetrics}
Team: ${input.teamInfo}

SLIDES:
${slidesSummary}

Return this exact JSON structure:
{
  "dimensions": [
    {"id": "narrative", "score": <0-100>, "feedback": "<1 sentence>"},
    {"id": "market", "score": <0-100>, "feedback": "<1 sentence>"},
    {"id": "differentiation", "score": <0-100>, "feedback": "<1 sentence>"},
    {"id": "financials", "score": <0-100>, "feedback": "<1 sentence>"},
    {"id": "team", "score": <0-100>, "feedback": "<1 sentence>"},
    {"id": "ask", "score": <0-100>, "feedback": "<1 sentence>"},
    {"id": "design", "score": <0-100>, "feedback": "<1 sentence>"},
    {"id": "credibility", "score": <0-100>, "feedback": "<1 sentence>"}
  ],
  "recommendations": ["<actionable tip 1>", "<actionable tip 2>", "<actionable tip 3>"]
}`,
        },
      ],
    }),
  });

  if (!res.ok) throw new Error("AI scoring failed");

  const data = await res.json();
  const text = data.content?.[0]?.text || "";
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
    let score = 65; // base score since deck was AI-generated
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
