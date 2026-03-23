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

  const prompt = `Generate a professional 12-16 slide pitch deck for an investor presentation. Return ONLY valid JSON — no markdown, no code fences, no explanation.

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
- "type": one of: "title", "content", "stats", "comparison", "cta", "chart", "metrics", "team", "timeline", "image-content", "logo-grid", "table"
- "layout": one of: "default", "centered", "split", "two-column", "stat-highlight" (for "content" type slides ONLY — vary these across slides!)
- "accent": boolean (true for slides that should be visually emphasized)

PLUS these optional fields for visual slides:
- "chartData": { "type": "bar"|"pie"|"line"|"area", "data": [{"label":"string","value":number},...], "label":"string" } — for type "chart"
- "metrics": [{"label":"string","value":"string","change":"string","trend":"up"|"down"|"neutral"},...] — for type "metrics" (4-6 KPI cards)
- "team": [{"name":"string","role":"string","bio":"string"},...] — for type "team"
- "timeline": [{"date":"string","title":"string","description":"string","completed":boolean},...] — for type "timeline"
- "imagePrompt": string (descriptive prompt for stock photo, e.g. "modern SaaS dashboard on laptop screen", "diverse team collaborating in startup office") — for type "image-content"
- "logos": [{"name":"string"},...] — for type "logo-grid" (customer logos, partner brands, integrations)
- "tableData": { "columns": ["Feature","Us","Competitor A","Competitor B"], "rows": [["Feature 1","✓","✗","✗"],...] } — for type "table"

IMPORTANT about layout field for content slides: Vary the layout across content slides. NEVER use the same layout for consecutive content slides. Use "split" for problem/solution contrast, "centered" for feature highlights, "stat-highlight" when a slide leads with a key number or stat, "two-column" for lists of 6+ items, "default" for standard bullets. Write content items that mix styles — include stat-leading items (e.g. "85% of enterprises face..."), short punchy statements, and contextual explanations. Avoid making all bullets the same length. Assign accent:true to 3-5 slides spread across the deck, not consecutively.

VISUAL RICHNESS IS CRITICAL — investors see hundreds of text-heavy decks. Make this one STAND OUT:
- At least 2 "chart" slides with realistic chartData (market size, revenue projections, growth)
- At least 1 "metrics" slide with KPI cards (MRR, users, growth rate, etc)
- 1 "team" slide with team member details
- 1 "timeline" slide for milestones/roadmap
- 1-2 "image-content" slides with imagePrompt (for product, solution, or problem visualization)
- 1 "table" slide for competitive comparison (feature matrix with checkmarks ✓/✗)
- 1 "logo-grid" slide for social proof (customer logos, partners, integrations, or press mentions)
- Use "comparison" ONLY when a numbered list is better than a table
- Vary accent patterns — don't alternate predictably

Slide order (optimize for ${input.investorType} investors):
1. Title (type: "title") — bold opening
2. Problem (type: "image-content") — pain point with a vivid image (provide imagePrompt describing the problem visually)
3. Solution (type: "image-content", accent) — product screenshot concept (provide imagePrompt like "clean SaaS dashboard showing key features")
4. Market Opportunity (type: "chart") — TAM/SAM/SOM as bar or pie chart with real numbers
5. Product / How It Works (type: "content" or "timeline") — product walkthrough
6. Business Model (type: "content") — revenue mechanics
7. Traction & Metrics (type: "metrics") — KPI cards with growth numbers
8. Social Proof (type: "logo-grid") — customer logos, partners, press, or integrations
9. Growth Trajectory (type: "chart") — revenue or user growth as line/area chart
10. Competitive Landscape (type: "table") — feature comparison matrix with columns for you vs 2-3 competitors
11. Team (type: "team") — founder bios
12. Roadmap (type: "timeline") — next 12-18 months
13. Financial Projections (type: "chart") — revenue forecast as bar chart
14. The Ask (type: "content", accent) — funding amount and use of funds as pie chart
15. CTA (type: "cta") — closing

For "image-content" slides: Write an imagePrompt that describes a SPECIFIC, realistic scene or product UI relevant to the company. Be descriptive (e.g. "modern mobile app interface showing personalized nutrition recommendations with colorful food cards" NOT just "app screenshot"). The image will be fetched from Unsplash stock photos.

For "logo-grid" slides: Include 6-8 recognizable company names relevant to the industry as potential customers, partners, or integrations. Use real company names that make sense for the industry.

For "table" slides: Create a feature comparison with 4-6 rows and 3-4 columns. Use ✓, ✗, and descriptive values. Make your company clearly win on key differentiators.

Make content compelling and SPECIFIC to this company. Use realistic numbers (don't say "$X" — invent plausible figures). Generate names for team members if not provided. Chart data must have 4-7 data points with realistic values. Every deck should feel bespoke and visually premium.`;

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

    // Fetch stock images for image-content slides
    slides = await enrichSlidesWithImages(slides);

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

/**
 * Fetch stock images from Unsplash for slides with imagePrompt.
 */
async function enrichSlidesWithImages(slides: SlideData[]): Promise<SlideData[]> {
  const unsplashKey = process.env.UNSPLASH_ACCESS_KEY;
  const imageSlides = slides.filter((s) => s.type === "image-content" && s.imagePrompt && !s.imageUrl);

  if (imageSlides.length === 0 || !unsplashKey) return slides;

  await Promise.all(
    imageSlides.map(async (slide) => {
      try {
        const query = encodeURIComponent(slide.imagePrompt!.slice(0, 100));
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${query}&per_page=1&orientation=landscape`,
          { headers: { Authorization: `Client-ID ${unsplashKey}` } }
        );
        if (res.ok) {
          const data = await res.json();
          if (data.results?.[0]?.urls?.regular) {
            slide.imageUrl = data.results[0].urls.regular;
          }
        }
      } catch {
        // Image fetch failed — slide renders fine without image
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

  // Dynamic quarter/year
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentQ = Math.ceil((now.getMonth() + 1) / 3);
  const q = (offset: number) => {
    const q0 = currentQ - 1 + offset;
    return `Q${(q0 % 4) + 1} ${currentYear + Math.floor(q0 / 4)}`;
  };

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
      type: "image-content",
      layout: "split",
      imagePrompt: `${input.industry} industry pain point frustration concept`,
    },
    {
      title: "Our Solution",
      subtitle: `How ${input.companyName} solves it`,
      content: solutionBullets,
      type: "image-content",
      layout: "centered",
      accent: true,
      imagePrompt: `modern ${input.industry} software dashboard clean UI`,
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
      layout: "two-column",
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
      layout: "stat-highlight",
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
      title: "Trusted By Industry Leaders",
      subtitle: "Our growing ecosystem of partners and customers",
      content: ["Enterprise-ready platform with proven integrations"],
      type: "logo-grid",
      logos: [
        { name: "Salesforce" }, { name: "HubSpot" }, { name: "Slack" },
        { name: "Stripe" }, { name: "AWS" }, { name: "Google Cloud" },
      ],
    },
    {
      title: "Competitive Landscape",
      subtitle: "How we compare to alternatives",
      content: [
        solutionBullets[0] || input.solution.slice(0, 80),
        "Defensible moat through data and network effects",
      ],
      type: "table",
      tableData: {
        columns: ["Feature", input.companyName, "Competitor A", "Competitor B"],
        rows: [
          ["AI-Powered Analysis", "✓", "✗", "Partial"],
          ["Real-time Dashboard", "✓", "✓", "✗"],
          ["Enterprise SSO", "✓", "✗", "✓"],
          ["Custom Integrations", "✓", "Limited", "✗"],
          ["24/7 Support", "✓", "✗", "✗"],
        ],
      },
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
      accent: true,
      timeline: [
        { date: q(0), title: "Public Launch", description: "V1 release with core features", completed: true },
        { date: q(1), title: "Scale Growth", description: "10x user base, partnerships", completed: false },
        { date: q(2), title: "Enterprise", description: "B2B product, team features", completed: false },
        { date: q(3), title: "Profitability", description: "Break-even with expanding margins", completed: false },
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
          { label: String(currentYear), value: 450 },
          { label: String(currentYear + 1), value: 1800 },
          { label: String(currentYear + 2), value: 5200 },
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
