import Anthropic from "@anthropic-ai/sdk";
import { DeckInput, SlideData } from "./types";

const INVESTOR_PROMPTS: Record<string, string> = {
  vc: "Structure the deck to lead with market size/TAM, then traction, then team. VCs care about massive markets and scalability.",
  angel: "Structure the deck to lead with founder story and vision, then problem/solution, then traction. Angels invest in people and passion.",
  accelerator: "Structure the deck to lead with traction and growth rate, then team capability, then market. Accelerators want fast learners with momentum.",
};

export async function generateDeck(input: DeckInput): Promise<SlideData[]> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return generateFallbackDeck(input);
  }

  const client = new Anthropic({ apiKey });

  const investorGuidance = INVESTOR_PROMPTS[input.investorType] || INVESTOR_PROMPTS.vc;

  const prompt = `Generate a professional 10-12 slide pitch deck for an investor presentation. Return ONLY valid JSON — no markdown, no code fences, no explanation.

Company: ${input.companyName}
Industry: ${input.industry}
Stage: ${input.stage}
Funding Target: ${input.fundingTarget}
Problem: ${input.problem}
Solution: ${input.solution}
Key Metrics: ${input.keyMetrics || "Early stage"}
Team: ${input.teamInfo || "Founding team"}
Target Investor: ${input.investorType}

${investorGuidance}

Return a JSON array of slide objects. Each slide has:
- "title": string (slide heading)
- "subtitle": string (optional subheading)
- "content": string[] (array of bullet points or paragraphs)
- "type": one of "title", "content", "stats", "comparison", "cta"
- "accent": boolean (true for slides that should be visually emphasized)

Include these slides in an order optimized for the target investor:
1. Title slide (type: "title")
2. Problem
3. Solution
4. Market Opportunity / TAM
5. Product / How It Works
6. Business Model
7. Traction / Metrics
8. Competition / Differentiation
9. Team
10. Financial Projections
11. The Ask / Use of Funds
12. Contact / CTA (type: "cta")

Make the content compelling, concise, and investor-ready. Use specific numbers where possible. Each bullet should be a single clear statement.

Important: Every deck must feel unique. Use company-specific language, varied sentence structures, and avoid generic filler (e.g. no "Step 1: Identify the need" or "Unique technology moat" unless the input justifies it). Vary tone and framing so no two decks read the same.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.9,
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    return JSON.parse(cleaned) as SlideData[];
  } catch {
    return generateFallbackDeck(input);
  }
}

function toBullets(text: string, max = 4): string[] {
  const parts = text
    .split(/[.!?]\s+|[;\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts.slice(0, max) : [text || "—"];
}

function generateFallbackDeck(input: DeckInput): SlideData[] {
  const problemBullets = toBullets(input.problem);
  const solutionBullets = toBullets(input.solution);
  const metricsBullets = (input.keyMetrics || "Early stage — building MVP")
    .split(/[,;]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  const teamBullets = (input.teamInfo || "Founding team")
    .split(/[,;]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

  return [
    {
      title: input.companyName,
      subtitle: [input.industry, input.stage].filter(Boolean).join(" · ") || "Pitch deck",
      content: [`Raising ${input.fundingTarget}`, `Investor-ready deck — ${input.companyName}`],
      type: "title",
      accent: true,
    },
    {
      title: "The Problem",
      subtitle: "Why it matters",
      content: problemBullets,
      type: "content",
    },
    {
      title: "Our Solution",
      subtitle: `${input.companyName} in one line`,
      content: solutionBullets,
      type: "content",
      accent: true,
    },
    {
      title: "Market Opportunity",
      subtitle: input.industry || "Market",
      content: [
        input.industry ? `Serving the ${input.industry} space` : "Large addressable market",
        ...toBullets(input.solution, 2).map((s) => `Opportunity: ${s}`),
      ].slice(0, 4),
      type: "stats",
    },
    {
      title: "How It Works",
      subtitle: "From problem to solution",
      content: [
        problemBullets[0] ? `Today: ${problemBullets[0]}` : "Current state",
        solutionBullets[0] || "Our approach",
        ...solutionBullets.slice(1, 3),
      ].filter(Boolean).slice(0, 4),
      type: "content",
    },
    {
      title: "Business Model",
      subtitle: `Raising ${input.fundingTarget}`,
      content: [
        `Stage: ${input.stage}`,
        `Funding target: ${input.fundingTarget}`,
        ...toBullets(input.solution, 1).map((s) => `Value: ${s}`),
      ].filter(Boolean).slice(0, 4),
      type: "content",
    },
    {
      title: "Traction & Metrics",
      subtitle: "Where we are",
      content: metricsBullets.length ? metricsBullets : ["Early stage", "Building MVP", "Key metrics in development"],
      type: "stats",
      accent: true,
    },
    {
      title: "Why We Win",
      subtitle: "Differentiation",
      content: [
        solutionBullets[0] || input.solution.slice(0, 80),
        ...problemBullets.slice(0, 2).map((p) => `We address: ${p}`),
      ].filter(Boolean).slice(0, 4),
      type: "comparison",
    },
    {
      title: "The Team",
      subtitle: input.companyName,
      content: teamBullets.length ? teamBullets : ["Founding team", "Domain expertise", "Execution focus"],
      type: "content",
    },
    {
      title: "The Ask",
      subtitle: input.fundingTarget,
      content: [
        `Raising ${input.fundingTarget}`,
        `Stage: ${input.stage}`,
        "Use of funds aligned to milestones",
        "Next steps: discuss and align",
      ],
      type: "content",
      accent: true,
    },
    {
      title: "Let's Talk",
      subtitle: input.companyName,
      content: ["Ready for next steps", `${input.companyName} — ${solutionBullets[0] || "Get in touch"}`],
      type: "cta",
      accent: true,
    },
  ];
}
