import Anthropic from "@anthropic-ai/sdk";
import type { Skill, DiagramOutput } from "../types";

interface DiagramInput {
  slides: { id: string; purpose: string; content: string[]; type: string }[];
  colors: { primary: string; accent: string; background: string; text: string };
  headingFont: string;
}

const DIAGRAM_ELIGIBLE = new Set(["how-it-works", "process-flow", "business-model", "go-to-market", "solution-reveal"]);

export const diagramGeneratorSkill: Skill<DiagramInput, DiagramOutput> = {
  id: "diagram-generator",
  name: "Diagram Generator",
  category: "visual",
  description: "Generates SVG diagrams, flowcharts, and infographics as code",
  requiresExternalAPI: false,
  parallelizable: true,
  async execute(input, ctx) {
    const start = Date.now();
    const eligible = input.slides.filter((s) => DIAGRAM_ELIGIBLE.has(s.purpose) || s.type === "timeline");

    if (eligible.length === 0 || !ctx.hasAnthropicKey) {
      return { success: true, data: { diagrams: [] }, confidence: 0, sources: [], durationMs: Date.now() - start, usedFallback: true };
    }

    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
      const diagrams = await Promise.all(
        eligible.slice(0, 3).map(async (slide) => {
          const type = slide.purpose.includes("process") || slide.purpose.includes("how-it-works") ? "process"
            : slide.purpose.includes("business") ? "flowchart"
            : slide.purpose.includes("go-to") ? "funnel" : "process";

          try {
            const res = await client.messages.create({
              model: "claude-sonnet-4-20250514",
              max_tokens: 2000,
              temperature: 0.5,
              messages: [{
                role: "user",
                content: `Generate an SVG diagram for a pitch deck slide.

Slide purpose: ${slide.purpose}
Content: ${slide.content.join("; ")}
Diagram type: ${type}
Colors: primary=${input.colors.primary}, accent=${input.colors.accent}, bg=${input.colors.background}, text=${input.colors.text}
Font: ${input.headingFont}
Canvas: 600x340

Rules: Clean minimal design. Max 5-8 elements. Rounded rectangles + circles + arrows. Min 14px text. Use the color palette. Return ONLY the SVG code.`,
              }],
            });
            const text = res.content[0].type === "text" ? res.content[0].text : "";
            const svgMatch = text.match(/<svg[\s\S]*?<\/svg>/);
            return {
              slideId: slide.id,
              type: type as DiagramOutput["diagrams"][0]["type"],
              svgCode: svgMatch ? svgMatch[0] : "",
              description: `${type} diagram for ${slide.purpose}`,
            };
          } catch {
            return { slideId: slide.id, type: type as DiagramOutput["diagrams"][0]["type"], svgCode: "", description: "" };
          }
        })
      );

      const valid = diagrams.filter((d) => d.svgCode);
      return { success: true, data: { diagrams: valid }, confidence: valid.length / Math.max(eligible.length, 1), sources: ["AI-generated SVG"], durationMs: Date.now() - start, usedFallback: false };
    } catch (err) {
      return { success: true, data: { diagrams: [] }, confidence: 0, sources: [], durationMs: Date.now() - start, error: String(err), usedFallback: true };
    }
  },
};
