import Anthropic from "@anthropic-ai/sdk";
import { DeckInput, SlideData } from "./types";
import { generateChartData } from "./thesys";

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

  const prompt = `Generate a professional 10-14 slide pitch deck for an investor presentation. Return ONLY valid JSON — no markdown, no code fences, no explanation.

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

Return a JSON array of slide objects. Each slide MUST have:
- "title": string (slide heading)
- "subtitle": string (optional subheading)
- "content": string[] (bullet points — always include even for visual slides)
- "type": one of: "title", "content", "stats", "comparison", "cta", "chart", "metrics", "team", "timeline"
- "accent": boolean (true for slides that should be visually emphasized)

PLUS these optional fields for visual slides:
- "chartData": { "type": "bar"|"pie"|"line"|"area", "data": [{"label":"string","value":number},...], "label":"string" } — for type "chart"
- "metrics": [{"label":"string","value":"string","change":"string","trend":"up"|"down"|"neutral"},...] — for type "metrics" (4-6 KPI cards)
- "team": [{"name":"string","role":"string","bio":"string"},...] — for type "team"
- "timeline": [{"date":"string","title":"string","description":"string","completed":boolean},...] — for type "timeline"

IMPORTANT: Make each deck UNIQUE and VISUALLY DIVERSE. You MUST use a MIX of slide types:
- At least 2 "chart" slides with realistic chartData (market size, revenue projections, growth)
- At least 1 "metrics" slide with KPI cards (MRR, users, growth rate, etc)
- 1 "team" slide with team member details
- 1 "timeline" slide for milestones/roadmap
- Use "comparison" for competitive positioning
- Vary accent patterns — don't alternate predictably

Slide order (optimize for ${input.investorType} investors):
1. Title (type: "title") — bold opening
2. Problem (type: "content") — pain point
3. Solution (type: "content", accent) — your answer
4. Market Opportunity (type: "chart") — TAM/SAM/SOM as bar or pie chart with real numbers
5. Product / How It Works (type: "content" or "timeline") — product walkthrough
6. Business Model (type: "content") — revenue mechanics
7. Traction & Metrics (type: "metrics") — KPI cards with growth numbers
8. Growth Trajectory (type: "chart") — revenue or user growth as line/area chart
9. Competition (type: "comparison") — why you win
10. Team (type: "team") — founder bios
11. Roadmap (type: "timeline") — next 12-18 months
12. Financial Projections (type: "chart") — revenue forecast as bar chart
13. The Ask (type: "content", accent) — funding amount and use of funds
14. CTA (type: "cta") — closing

Make content compelling and SPECIFIC to this company. Use realistic numbers (don't say "$X" — invent plausible figures). Generate names for team members if not provided. Chart data must have 4-7 data points with realistic values. Every deck should feel bespoke.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 6000,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.9,
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";

  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    let slides = JSON.parse(cleaned) as SlideData[];

    // Enrich chart slides with Thesys-generated data if available
    slides = await enrichChartsWithThesys(slides, input);

    return slides;
  } catch {
    return generateFallbackDeck(input);
  }
}

/**
 * Use Thesys API to enrich any chart slides that are missing chartData
 * or to enhance existing chart data.
 */
async function enrichChartsWithThesys(slides: SlideData[], input: DeckInput): Promise<SlideData[]> {
  const chartSlides = slides.filter((s) => s.type === "chart" && !s.chartData?.data?.length);

  if (chartSlides.length === 0) return slides;

  await Promise.all(
    chartSlides.map(async (slide) => {
      const chartData = await generateChartData(
        `${slide.title}: ${slide.subtitle || slide.content.join(", ")}`,
        input.companyName,
        input.industry
      );
      if (chartData) {
        slide.chartData = chartData;
      }
    })
  );

  return slides;
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

  const teamNames = (input.teamInfo || "Alex Chen, CEO; Jordan Patel, CTO; Sam Rivera, COO")
    .split(/[;]/)
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
      subtitle: "A growing pain point",
      content: problemBullets,
      type: "content",
    },
    {
      title: "Our Solution",
      subtitle: `How ${input.companyName} solves it`,
      content: solutionBullets,
      type: "content",
      accent: true,
    },
    {
      title: "Market Opportunity",
      subtitle: `${input.industry || "Market"} TAM/SAM/SOM`,
      content: ["Total addressable market with strong tailwinds", "Growing demand across segments"],
      type: "chart",
      chartData: {
        type: "bar",
        data: [
          { label: "TAM", value: 48 },
          { label: "SAM", value: 12 },
          { label: "SOM", value: 2.4 },
        ],
        label: "Market Size ($B)",
      },
    },
    {
      title: "How It Works",
      subtitle: "From problem to solution in 3 steps",
      content: [
        problemBullets[0] ? `Today: ${problemBullets[0]}` : "Current state is broken",
        solutionBullets[0] || "Our approach streamlines everything",
        ...solutionBullets.slice(1, 3),
      ].filter(Boolean).slice(0, 4),
      type: "content",
    },
    {
      title: "Business Model",
      subtitle: "How we make money",
      content: [
        `Stage: ${input.stage}`,
        `Target: ${input.fundingTarget}`,
        ...toBullets(input.solution, 1).map((s) => `Value driver: ${s}`),
      ].filter(Boolean).slice(0, 4),
      type: "content",
    },
    {
      title: "Traction & KPIs",
      subtitle: "Key metrics at a glance",
      content: metricsBullets.length ? metricsBullets : ["Building MVP", "Early user testing"],
      type: "metrics",
      accent: true,
      metrics: [
        { label: "Monthly Revenue", value: "$12K", change: "+180%", trend: "up" as const },
        { label: "Active Users", value: "2,400", change: "+64%", trend: "up" as const },
        { label: "Retention", value: "89%", change: "+12%", trend: "up" as const },
        { label: "CAC", value: "$24", change: "-33%", trend: "down" as const },
      ],
    },
    {
      title: "Growth Trajectory",
      subtitle: "Revenue growth over last 6 months",
      content: ["Strong month-over-month growth", "Path to profitability by Q4"],
      type: "chart",
      chartData: {
        type: "area",
        data: [
          { label: "Jan", value: 2 },
          { label: "Feb", value: 4.5 },
          { label: "Mar", value: 6 },
          { label: "Apr", value: 8.5 },
          { label: "May", value: 12 },
          { label: "Jun", value: 18 },
        ],
        label: "MRR ($K)",
      },
    },
    {
      title: "Why We Win",
      subtitle: "Competitive advantage",
      content: [
        solutionBullets[0] || input.solution.slice(0, 80),
        ...problemBullets.slice(0, 2).map((p) => `We address: ${p}`),
        "Defensible moat through data and network effects",
      ].filter(Boolean).slice(0, 4),
      type: "comparison",
    },
    {
      title: "The Team",
      subtitle: `The people behind ${input.companyName}`,
      content: teamNames,
      type: "team",
      team: teamNames.map((entry) => {
        const parts = entry.split(",").map((s) => s.trim());
        return {
          name: parts[0] || "Team Member",
          role: parts[1] || "Co-Founder",
          bio: parts[2] || "Experienced operator with deep domain expertise",
        };
      }),
    },
    {
      title: "Roadmap",
      subtitle: "Next 12 months",
      content: ["Launch → Scale → Expand"],
      type: "timeline",
      timeline: [
        { date: "Q1 2025", title: "Public Launch", description: "V1 release with core features", completed: true },
        { date: "Q2 2025", title: "Scale Growth", description: "10x user base, partnerships", completed: false },
        { date: "Q3 2025", title: "Enterprise", description: "B2B product, team features", completed: false },
        { date: "Q4 2025", title: "Profitability", description: "Break-even with expanding margins", completed: false },
      ],
    },
    {
      title: "Financial Projections",
      subtitle: "3-year revenue forecast",
      content: ["Conservative estimates based on current trajectory"],
      type: "chart",
      chartData: {
        type: "bar",
        data: [
          { label: "2025", value: 450 },
          { label: "2026", value: 1800 },
          { label: "2027", value: 5200 },
        ],
        label: "Revenue ($K)",
      },
    },
    {
      title: "The Ask",
      subtitle: input.fundingTarget,
      content: [
        `Raising ${input.fundingTarget}`,
        `Stage: ${input.stage}`,
        "40% Product development",
        "30% Go-to-market & sales",
        "20% Team expansion",
        "10% Operations & infrastructure",
      ],
      type: "chart",
      accent: true,
      chartData: {
        type: "pie",
        data: [
          { label: "Product", value: 40 },
          { label: "GTM & Sales", value: 30 },
          { label: "Team", value: 20 },
          { label: "Operations", value: 10 },
        ],
        label: "Use of Funds",
      },
    },
    {
      title: "Let's Build Together",
      subtitle: input.companyName,
      content: ["Ready for the next chapter", `${input.companyName} — ${solutionBullets[0] || "Get in touch"}`],
      type: "cta",
      accent: true,
    },
  ];
}
