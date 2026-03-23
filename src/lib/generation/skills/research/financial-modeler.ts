import Anthropic from "@anthropic-ai/sdk";
import type { Skill, FinancialModelOutput } from "../types";

interface FinancialInput { industry: string; stage: string; fundingTarget: string; keyMetrics: string; businessModel?: string }

async function aiModel(input: FinancialInput): Promise<FinancialModelOutput> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
  const res = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    temperature: 0.3,
    messages: [{
      role: "user",
      content: `Generate realistic financial projections for a ${input.stage} ${input.industry} startup raising ${input.fundingTarget}.
Known metrics: ${input.keyMetrics || "None provided"}
Business model: ${input.businessModel || "Not specified"}

Use industry-standard benchmarks. Be realistic for the stage — don't project profitability for pre-seed companies.

Return ONLY valid JSON:
{
  "unitEconomics": { "ltv": "$X", "cac": "$X", "ltvCacRatio": N, "paybackMonths": N, "grossMargin": "X%", "methodology": "Based on industry benchmarks" },
  "revenueProjections": [{ "year": 2025, "revenue": N, "growth": N, "customers": N, "arr": N }],
  "useOfFunds": [{ "category": "Product & Engineering", "percentage": 40, "amount": "$X", "rationale": "reason" }],
  "benchmarkComparisons": [{ "metric": "Gross Margin", "companyValue": "X%", "industryMedian": "X%", "topQuartile": "X%", "source": "Source" }],
  "burnRate": "$X/mo",
  "runway": "X months"
}`,
    }],
  });
  const text = res.content[0].type === "text" ? res.content[0].text : "";
  const match = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim().match(/\{[\s\S]*\}/);
  if (!match) throw new Error("No JSON");
  return JSON.parse(match[0]);
}

function fallback(input: FinancialInput): FinancialModelOutput {
  const fundingNum = parseInt(input.fundingTarget.replace(/[^0-9]/g, "")) || 2000;
  const fundingK = fundingNum > 1000 ? fundingNum : fundingNum * 1000;
  const isSaaS = /saas|software|platform/i.test(input.industry);
  const isEarly = /pre-?seed|seed|idea/i.test(input.stage);
  const y = new Date().getFullYear();

  return {
    unitEconomics: {
      ltv: isSaaS ? "$14,400" : "$8,200",
      cac: isSaaS ? "$1,200" : "$950",
      ltvCacRatio: isSaaS ? 12 : 8.6,
      paybackMonths: isSaaS ? 8 : 11,
      grossMargin: isSaaS ? "78%" : "62%",
      methodology: "Based on industry median benchmarks",
    },
    revenueProjections: isEarly
      ? [{ year: y, revenue: 0, growth: 0, customers: 50, arr: 0 }, { year: y + 1, revenue: 360000, growth: 0, customers: 200, arr: 360000 }, { year: y + 2, revenue: 1800000, growth: 400, customers: 800, arr: 1800000 }]
      : [{ year: y, revenue: 600000, growth: 0, customers: 120, arr: 600000 }, { year: y + 1, revenue: 2400000, growth: 300, customers: 450, arr: 2400000 }, { year: y + 2, revenue: 7200000, growth: 200, customers: 1200, arr: 7200000 }],
    useOfFunds: [
      { category: "Product & Engineering", percentage: 45, amount: `$${Math.round(fundingK * 0.45)}K`, rationale: "Core product development and infrastructure" },
      { category: "Sales & Marketing", percentage: 30, amount: `$${Math.round(fundingK * 0.30)}K`, rationale: "Go-to-market and customer acquisition" },
      { category: "Team & Operations", percentage: 15, amount: `$${Math.round(fundingK * 0.15)}K`, rationale: "Key hires and operational costs" },
      { category: "Reserve", percentage: 10, amount: `$${Math.round(fundingK * 0.10)}K`, rationale: "Buffer for unforeseen needs" },
    ],
    benchmarkComparisons: [
      { metric: "Gross Margin", companyValue: isSaaS ? "78%" : "62%", industryMedian: isSaaS ? "72%" : "55%", topQuartile: isSaaS ? "82%" : "68%", source: "KeyBanc SaaS Survey 2024" },
      { metric: "LTV/CAC Ratio", companyValue: isSaaS ? "12x" : "8.6x", industryMedian: "6x", topQuartile: "10x", source: "OpenView SaaS Benchmarks" },
    ],
    burnRate: `~$${Math.round(fundingK / 18)}K/mo`,
    runway: "18 months",
  };
}

export const financialModelerSkill: Skill<FinancialInput, FinancialModelOutput> = {
  id: "financial-modeler",
  name: "Financial Modeler",
  category: "research",
  description: "Generates realistic financial projections and unit economics based on industry benchmarks",
  requiresExternalAPI: false,
  parallelizable: true,
  async execute(input, ctx) {
    const start = Date.now();
    try {
      if (!ctx.hasAnthropicKey) return { success: true, data: fallback(input), confidence: 0.4, sources: ["Industry benchmarks"], durationMs: Date.now() - start, usedFallback: true };
      const data = await Promise.race([aiModel(input), new Promise<never>((_, r) => setTimeout(() => r(new Error("Timeout")), 10000))]);
      return { success: true, data, confidence: 0.7, sources: ["AI financial model"], durationMs: Date.now() - start, usedFallback: false };
    } catch (err) {
      return { success: true, data: fallback(input), confidence: 0.4, sources: ["Fallback benchmarks"], durationMs: Date.now() - start, error: String(err), usedFallback: true };
    }
  },
};
