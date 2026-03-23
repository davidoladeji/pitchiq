import Anthropic from "@anthropic-ai/sdk";
import type { Skill, VCAnalysisOutput } from "../types";
import type { SlideData } from "@/lib/types";

interface VCInput { slides: SlideData[]; companyName: string; industry: string; stage: string; fundingTarget: string }

export const vcAnalystSkill: Skill<VCInput, VCAnalysisOutput> = {
  id: "vc-analyst",
  name: "VC Analyst",
  category: "critique",
  description: "Reviews the deck from a senior VC partner's perspective",
  requiresExternalAPI: false,
  parallelizable: true,
  async execute(input, ctx) {
    const start = Date.now();
    if (!ctx.hasAnthropicKey) {
      return { success: true, data: fallback(input), confidence: 0.3, sources: [], durationMs: Date.now() - start, usedFallback: true };
    }
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
      const slideSummary = input.slides.map((s, i) => `Slide ${i + 1} (${s.type}): "${s.title}" — ${s.content.slice(0, 2).join("; ")}`).join("\n");
      const res = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        temperature: 0.4,
        messages: [{
          role: "user",
          content: `You are a senior partner at a top-tier VC firm. You've seen thousands of pitch decks. Review this ${input.stage} ${input.industry} startup "${input.companyName}" raising ${input.fundingTarget}.

Slides:
${slideSummary}

Return ONLY valid JSON:
{
  "overallAssessment": "strong"|"promising"|"needs-work"|"pass",
  "investmentThesis": "One sentence on why you'd invest (or not)",
  "strengthsVCsCareAbout": ["strength1", "strength2"],
  "criticalWeaknesses": [{ "issue": "string", "severity": "critical"|"moderate"|"minor", "slideIndex": N, "suggestedFix": "string" }],
  "questionsInvestorsWillAsk": [{ "question": "string", "why": "string", "suggestedAnswer": "string" }],
  "competitivePositioning": "How this compares to other pitches",
  "dealbreakers": ["If any"]
}
Be brutally honest but constructive. Reference specific slides.`,
        }],
      });
      const text = res.content[0].type === "text" ? res.content[0].text : "";
      const match = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim().match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON");
      const data = JSON.parse(match[0]) as VCAnalysisOutput;
      return { success: true, data, confidence: 0.8, sources: ["AI VC analysis"], durationMs: Date.now() - start, usedFallback: false };
    } catch (err) {
      return { success: true, data: fallback(input), confidence: 0.3, sources: [], durationMs: Date.now() - start, error: String(err), usedFallback: true };
    }
  },
};

function fallback(input: VCInput): VCAnalysisOutput {
  return {
    overallAssessment: "promising",
    investmentThesis: `${input.companyName} addresses a real need in ${input.industry}, but needs stronger traction evidence.`,
    strengthsVCsCareAbout: ["Clear problem definition", "Identifiable market"],
    criticalWeaknesses: [{ issue: "Market sizing needs validation", severity: "moderate", slideIndex: 3, suggestedFix: "Add bottom-up market calculation with clear assumptions" }],
    questionsInvestorsWillAsk: [{ question: "What's your net dollar retention?", why: "Indicates product-market fit strength", suggestedAnswer: "Address retention metrics in traction slide" }],
    competitivePositioning: "Standard for stage — needs more differentiation",
    dealbreakers: [],
  };
}
