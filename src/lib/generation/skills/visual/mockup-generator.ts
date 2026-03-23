import Anthropic from "@anthropic-ai/sdk";
import type { Skill, MockupOutput } from "../types";

interface MockupInput {
  slides: { id: string; purpose: string; content: string[] }[];
  solution: string;
  industry: string;
}

const MOCKUP_ELIGIBLE = new Set(["product-showcase", "product-demo", "solution-reveal"]);

const DEVICE_FRAMES: Record<string, { svg: string; zone: { x: number; y: number; width: number; height: number } }> = {
  browser: {
    svg: `<svg viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg"><rect width="600" height="380" rx="12" fill="#1e1e30" stroke="#383850"/><rect y="0" width="600" height="36" rx="12" fill="#28283C"/><circle cx="20" cy="18" r="5" fill="#ef4444"/><circle cx="36" cy="18" r="5" fill="#f59e0b"/><circle cx="52" cy="18" r="5" fill="#22c55e"/><rect x="100" y="10" width="400" height="16" rx="8" fill="#1e1e30"/><rect x="8" y="44" width="584" height="328" rx="4" fill="#fff"/></svg>`,
    zone: { x: 8, y: 44, width: 584, height: 328 },
  },
  laptop: {
    svg: `<svg viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg"><rect x="60" y="10" width="480" height="300" rx="8" fill="#1e1e30" stroke="#383850" stroke-width="2"/><rect x="68" y="18" width="464" height="284" rx="2" fill="#fff"/><path d="M30 310 H570 L600 350 Q600 370 580 370 H20 Q0 370 0 350 Z" fill="#28283C"/></svg>`,
    zone: { x: 68, y: 18, width: 464, height: 284 },
  },
  phone: {
    svg: `<svg viewBox="0 0 200 400" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="400" rx="24" fill="#1e1e30" stroke="#383850" stroke-width="2"/><rect x="8" y="40" width="184" height="320" rx="4" fill="#fff"/><rect x="70" y="10" width="60" height="6" rx="3" fill="#383850"/></svg>`,
    zone: { x: 8, y: 40, width: 184, height: 320 },
  },
};

export const mockupGeneratorSkill: Skill<MockupInput, MockupOutput> = {
  id: "mockup-generator",
  name: "Product Mockup Generator",
  category: "visual",
  description: "Generates device frame mockups for product/solution slides",
  requiresExternalAPI: false,
  parallelizable: true,
  async execute(input, ctx) {
    const start = Date.now();
    const eligible = input.slides.filter((s) => MOCKUP_ELIGIBLE.has(s.purpose));
    if (eligible.length === 0) {
      return { success: true, data: { mockups: [] }, confidence: 1, sources: [], durationMs: Date.now() - start, usedFallback: false };
    }

    const isMobile = /mobile|app|ios|android/i.test(input.solution + " " + input.industry);
    const deviceType = isMobile ? "phone" : "browser";
    const frame = DEVICE_FRAMES[deviceType] || DEVICE_FRAMES.browser;

    let screenDesc = `A ${input.industry} dashboard showing ${input.solution}`;
    if (ctx.hasAnthropicKey) {
      try {
        const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });
        const res = await client.messages.create({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 200,
          temperature: 0.5,
          messages: [{ role: "user", content: `Describe in 2 sentences what a ${input.industry} product UI would look like for: ${input.solution}. Be specific about UI elements visible.` }],
        });
        screenDesc = res.content[0].type === "text" ? res.content[0].text : screenDesc;
      } catch { /* use default */ }
    }

    const mockups = eligible.map((slide) => ({
      slideId: slide.id,
      deviceType: deviceType as MockupOutput["mockups"][0]["deviceType"],
      screenContent: screenDesc,
      svgFrame: frame.svg,
      contentZone: frame.zone,
    }));

    return { success: true, data: { mockups }, confidence: 0.7, sources: ["SVG device frames"], durationMs: Date.now() - start, usedFallback: false };
  },
};
