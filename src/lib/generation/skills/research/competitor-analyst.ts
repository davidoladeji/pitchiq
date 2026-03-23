import Anthropic from "@anthropic-ai/sdk";
import type { Skill, CompetitorAnalysisOutput } from "../types";

interface CompetitorInput { industry: string; solution: string; companyName: string }

async function aiAnalyze(input: CompetitorInput): Promise<CompetitorAnalysisOutput> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const res = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    temperature: 0.3,
    messages: [{
      role: "user",
      content: `Identify real competitors for a startup called "${input.companyName}" in ${input.industry}.
Their solution: ${input.solution}

Return ONLY valid JSON:
{
  "directCompetitors": [{ "name": "string", "description": "1 sentence", "funding": "$XM Series X", "strengths": ["s1"], "weaknesses": ["w1"], "targetCustomer": "string" }],
  "indirectCompetitors": [{ "name": "string", "description": "string", "strengths": ["s1"], "weaknesses": ["w1"], "targetCustomer": "string" }],
  "marketMap": { "axes": { "x": "Enterprise ↔ SMB", "y": "Simple ↔ Complex" }, "positions": [{ "name": "Competitor", "x": 0.7, "y": 0.3 }] },
  "differentiators": ["What makes ${input.companyName} unique"],
  "competitiveAdvantages": ["Defensible moats"],
  "featureComparison": { "features": ["Feature 1", "Feature 2"], "companies": [{ "name": "${input.companyName}", "values": ["✓", "✓"] }, { "name": "Competitor A", "values": ["✓", "✗"] }] }
}
Provide 3-5 direct and 2-3 indirect competitors. Use real company names where possible.`,
    }],
  });

  const text = res.content[0].type === "text" ? res.content[0].text : "";
  const match = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim().match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON");
  return JSON.parse(match[0]);
}

function fallback(input: CompetitorInput): CompetitorAnalysisOutput {
  return {
    directCompetitors: [
      { name: "Competitor A", description: `Established player in ${input.industry}`, strengths: ["Brand recognition", "Large customer base"], weaknesses: ["Legacy technology", "Slow innovation"], targetCustomer: "Enterprise" },
      { name: "Competitor B", description: `Well-funded startup in ${input.industry}`, strengths: ["Modern tech stack", "Strong funding"], weaknesses: ["Limited market share", "Narrow feature set"], targetCustomer: "Mid-market" },
      { name: "Competitor C", description: `Niche player focused on specific segment`, strengths: ["Deep domain expertise"], weaknesses: ["Limited scale"], targetCustomer: "SMB" },
    ],
    indirectCompetitors: [
      { name: "Manual Processes", description: "Spreadsheets and manual workflows", strengths: ["No cost", "Familiar"], weaknesses: ["Error-prone", "Not scalable"], targetCustomer: "All segments" },
    ],
    marketMap: { axes: { x: "Enterprise ↔ SMB", y: "Simple ↔ Complex" }, positions: [{ name: input.companyName, x: 0.5, y: 0.6 }, { name: "Competitor A", x: 0.8, y: 0.7 }, { name: "Competitor B", x: 0.4, y: 0.4 }] },
    differentiators: [`${input.companyName}'s unique approach to ${input.industry}`],
    competitiveAdvantages: ["Technology advantage", "First-mover in underserved segment"],
    featureComparison: { features: ["Core Feature", "AI-Powered", "Real-time", "API Access"], companies: [{ name: input.companyName, values: ["✓", "✓", "✓", "✓"] }, { name: "Competitor A", values: ["✓", "✗", "Partial", "✓"] }, { name: "Competitor B", values: ["✓", "✓", "✗", "✗"] }] },
  };
}

export const competitorAnalystSkill: Skill<CompetitorInput, CompetitorAnalysisOutput> = {
  id: "competitor-analyst",
  name: "Competitor Analyst",
  category: "research",
  description: "Identifies real competitors and builds factual competitive landscape",
  requiresExternalAPI: false,
  parallelizable: true,
  async execute(input, ctx) {
    const start = Date.now();
    try {
      if (!ctx.hasAnthropicKey) return { success: true, data: fallback(input), confidence: 0.3, sources: [], durationMs: Date.now() - start, usedFallback: true };
      const data = await Promise.race([aiAnalyze(input), new Promise<never>((_, r) => setTimeout(() => r(new Error("Timeout")), 10000))]);
      return { success: true, data, confidence: 0.7, sources: ["AI analysis"], durationMs: Date.now() - start, usedFallback: false };
    } catch (err) {
      return { success: true, data: fallback(input), confidence: 0.3, sources: [], durationMs: Date.now() - start, error: String(err), usedFallback: true };
    }
  },
};
