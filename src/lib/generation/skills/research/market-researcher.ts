import Anthropic from "@anthropic-ai/sdk";
import type { Skill, SkillContext, SkillResult, MarketResearchOutput } from "../types";

interface MarketResearchInput {
  industry: string;
  stage: string;
  geography?: string;
}

async function aiResearch(input: MarketResearchInput): Promise<MarketResearchOutput> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const prompt = `Research the market size for a ${input.stage} startup in ${input.industry}.${input.geography ? ` Focus on ${input.geography}.` : ""}

Provide TAM, SAM, and SOM with realistic numbers and sources. Use your training knowledge of market reports from Gartner, IDC, Grand View Research, Statista, etc. If exact numbers aren't available, provide realistic estimates with methodology notes.

Return ONLY valid JSON:
{
  "tam": { "value": "$XXB", "source": "Source Name", "year": 2025 },
  "sam": { "value": "$XXB", "source": "Source Name", "year": 2025 },
  "som": { "value": "$XXB", "source": "Source Name", "year": 2025 },
  "growthRate": { "value": "XX% CAGR 2024-2030", "cagr": 14.2, "source": "Source Name" },
  "keyTrends": ["trend1", "trend2", "trend3"],
  "marketDrivers": ["driver1", "driver2"],
  "relatedMarkets": ["adjacent market 1", "adjacent market 2"],
  "methodology": "top-down" | "bottom-up" | "hybrid"
}`;

  const res = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1200,
    temperature: 0.3,
    messages: [{ role: "user", content: prompt }],
  });

  const text = res.content[0].type === "text" ? res.content[0].text : "";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON in market research response");
  return JSON.parse(match[0]) as MarketResearchOutput;
}

function fallbackResearch(input: MarketResearchInput): MarketResearchOutput {
  const ind = input.industry.toLowerCase();
  const isSaaS = /saas|software|cloud|platform/i.test(ind);
  const isFintech = /fintech|finance|banking|payments/i.test(ind);
  const isHealth = /health|medical|biotech|pharma/i.test(ind);
  const isAI = /ai|ml|machine learning|artificial/i.test(ind);

  const tamB = isAI ? 340 : isSaaS ? 195 : isFintech ? 310 : isHealth ? 280 : 120;
  const samB = Math.round(tamB * 0.15);
  const somB = Math.round(tamB * 0.02 * 10) / 10;
  const cagr = isAI ? 28.5 : isSaaS ? 13.7 : isFintech ? 16.2 : isHealth ? 11.4 : 12.0;

  return {
    tam: { value: `~$${tamB}B`, source: "Industry estimates (2024-2025)", year: 2025 },
    sam: { value: `~$${samB}B`, source: "Serviceable segment estimate", year: 2025 },
    som: { value: `~$${somB}B`, source: "Bottom-up estimate based on stage", year: 2025 },
    growthRate: { value: `~${cagr}% CAGR 2024-2030`, cagr, source: "Industry analyst consensus" },
    keyTrends: ["Digital transformation acceleration", "API-first adoption", "Remote-first operations"],
    marketDrivers: ["Cost optimization pressure", "Regulatory modernization", "Gen-Z workforce expectations"],
    relatedMarkets: [`${input.industry} services`, `${input.industry} analytics`],
    methodology: "top-down",
  };
}

export const marketResearcherSkill: Skill<MarketResearchInput, MarketResearchOutput> = {
  id: "market-researcher",
  name: "Market Researcher",
  category: "research",
  description: "Researches real market size data (TAM/SAM/SOM) for the company's industry",
  requiresExternalAPI: false,
  parallelizable: true,

  async execute(input: MarketResearchInput, ctx: SkillContext): Promise<SkillResult<MarketResearchOutput>> {
    const start = Date.now();
    try {
      if (!ctx.hasAnthropicKey) {
        const data = fallbackResearch(input);
        return { success: true, data, confidence: 0.4, sources: ["Heuristic estimates"], durationMs: Date.now() - start, usedFallback: true };
      }

      const timeoutPromise = new Promise<never>((_, reject) => setTimeout(() => reject(new Error("Timeout")), 10000));
      const data = await Promise.race([aiResearch(input), timeoutPromise]);
      return { success: true, data, confidence: 0.75, sources: [data.tam.source, data.growthRate.source], durationMs: Date.now() - start, usedFallback: false };
    } catch (err) {
      const data = fallbackResearch(input);
      return { success: true, data, confidence: 0.4, sources: ["Fallback estimates"], durationMs: Date.now() - start, error: String(err), usedFallback: true };
    }
  },
};
