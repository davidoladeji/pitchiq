import Anthropic from "@anthropic-ai/sdk";
import type { Skill, PitchCoachOutput } from "../types";
import type { SlideData } from "@/lib/types";

interface PitchCoachInput { slides: SlideData[]; companyName: string }

export const pitchCoachSkill: Skill<PitchCoachInput, PitchCoachOutput> = {
  id: "pitch-coach",
  name: "Pitch Coach",
  category: "critique",
  description: "Reviews the deck's storytelling, flow, and persuasive structure",
  requiresExternalAPI: false,
  parallelizable: true,
  async execute(input, ctx) {
    const start = Date.now();
    if (!ctx.hasAnthropicKey) {
      return { success: true, data: fallback(input), confidence: 0.3, sources: [], durationMs: Date.now() - start, usedFallback: true };
    }
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
      const slideSummary = input.slides.map((s, i) => `${i + 1}. "${s.title}" (${s.type})`).join("\n");
      const res = await client.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1800,
        temperature: 0.4,
        messages: [{
          role: "user",
          content: `You are an elite pitch coach who has prepared founders for YC Demo Day, TechCrunch Disrupt, and Series A presentations. Review this deck's storytelling and flow.

${input.companyName} — ${input.slides.length} slides:
${slideSummary}

Return ONLY valid JSON:
{
  "narrativeScore": 0-100,
  "emotionalArc": [{ "slideIndex": N, "emotion": "string", "intensity": 0-10, "issue": "optional string" }],
  "flowIssues": [{ "between": [N, N], "issue": "string", "fix": "string" }],
  "slideSpecificFeedback": [{ "slideIndex": N, "strength": "string", "improvement": "string" }],
  "openingHookRating": 0-10,
  "closingImpactRating": 0-10,
  "overallRecommendation": "string"
}`,
        }],
      });
      const text = res.content[0].type === "text" ? res.content[0].text : "";
      const match = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim().match(/\{[\s\S]*\}/);
      if (!match) throw new Error("No JSON");
      return { success: true, data: JSON.parse(match[0]), confidence: 0.8, sources: ["AI pitch coach"], durationMs: Date.now() - start, usedFallback: false };
    } catch (err) {
      return { success: true, data: fallback(input), confidence: 0.3, sources: [], durationMs: Date.now() - start, error: String(err), usedFallback: true };
    }
  },
};

function fallback(input: PitchCoachInput): PitchCoachOutput {
  return {
    narrativeScore: 65,
    emotionalArc: input.slides.map((_, i) => ({ slideIndex: i, emotion: "neutral", intensity: 5 })),
    flowIssues: [],
    slideSpecificFeedback: [{ slideIndex: 0, strength: "Clear title", improvement: "Add a hook statistic" }],
    openingHookRating: 6,
    closingImpactRating: 6,
    overallRecommendation: "Solid foundation — strengthen the opening hook and closing urgency.",
  };
}
