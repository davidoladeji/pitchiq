import Anthropic from "@anthropic-ai/sdk";
import type { Skill, DataCredibilityOutput } from "../types";
import type { SlideData } from "@/lib/types";

interface DataCredibilityInput { slides: SlideData[]; industry: string; stage: string }

export const dataCredibilitySkill: Skill<DataCredibilityInput, DataCredibilityOutput> = {
  id: "data-credibility",
  name: "Data Credibility Reviewer",
  category: "critique",
  description: "Checks that all numbers, claims, and data points are plausible and consistent",
  requiresExternalAPI: false,
  parallelizable: true,
  async execute(input, ctx) {
    const start = Date.now();
    if (!ctx.hasAnthropicKey) {
      return { success: true, data: { issues: [], consistencyChecks: [], overallCredibility: 70 }, confidence: 0.3, sources: [], durationMs: Date.now() - start, usedFallback: true };
    }
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
      const slideSummary = input.slides.map((s, i) => {
        let details = `Slide ${i + 1} "${s.title}": ${s.content.join("; ")}`;
        if (s.chartData) details += ` [Chart: ${JSON.stringify(s.chartData.data)}]`;
        if (s.metrics) details += ` [Metrics: ${s.metrics.map((m) => `${m.label}=${m.value}`).join(", ")}]`;
        return details;
      }).join("\n");

      const res = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1500,
        temperature: 0.2,
        messages: [{
          role: "user",
          content: `You are a due diligence analyst. Check every number, claim, and data point in this ${input.stage} ${input.industry} pitch deck for plausibility and consistency.

${slideSummary}

Check for: TAM bigger than GDP, growth rates that don't match revenue, unit economics that don't add up, claims without sources, and metrics that seem fabricated.

Return ONLY valid JSON:
{
  "issues": [{ "slideIndex": N, "claim": "the specific claim", "issue": "implausible"|"inconsistent"|"unsourced"|"outdated"|"vague", "explanation": "why", "suggestedFix": "how to fix" }],
  "consistencyChecks": [{ "check": "Revenue growth matches user growth", "passed": true|false, "details": "explanation" }],
  "overallCredibility": 0-100
}`,
        }],
      });
      const text = res.content[0].type === "text" ? res.content[0].text : "";
      const match = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim().match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON");
      return { success: true, data: JSON.parse(match[0]), confidence: 0.8, sources: ["AI credibility check"], durationMs: Date.now() - start, usedFallback: false };
    } catch (err) {
      return { success: true, data: { issues: [], consistencyChecks: [], overallCredibility: 70 }, confidence: 0.3, sources: [], durationMs: Date.now() - start, error: String(err), usedFallback: true };
    }
  },
};
