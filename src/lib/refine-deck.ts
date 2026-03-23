import Anthropic from "@anthropic-ai/sdk";
import type { SlideData, PIQScore, DeckInput } from "@/lib/types";
import type { ExtractedDeckContent } from "@/lib/deck-content-extractor";
import { generateDeck } from "@/lib/generate-deck";

export interface RefinementInput {
  content: ExtractedDeckContent;
  piqScore: PIQScore;
  investorType: string;
  userGuidance?: string;
  focusAreas?: string[];
}

export interface RefinementResult {
  slides: SlideData[];
  improvements: Array<{
    dimension: string;
    originalScore: number;
    change: string;
  }>;
  summary: string;
}

/**
 * Build the investor-specific structural guidance for the refinement prompt.
 */
function getInvestorStructureGuidance(investorType: string): string {
  switch (investorType) {
    case "vc":
      return `STRUCTURE FOR VC INVESTORS:
- Lead with massive market opportunity (TAM/SAM/SOM with real numbers)
- Follow with traction and growth metrics — VCs want proof of momentum
- Then team credibility — relevant experience and domain expertise
- Financial projections with clear path to scale
- Use of funds tied to specific growth milestones
- Recommended order: Title -> Problem -> Market Opportunity -> Solution -> Traction -> Business Model -> Financials -> Team -> Competition -> Ask -> CTA`;

    case "angel":
      return `STRUCTURE FOR ANGEL INVESTORS:
- Lead with the founder's story and personal connection to the problem
- Emphasize the problem deeply — make it visceral and relatable
- Show early traction or validation, even if small
- Angels invest in people — make the team slide compelling
- Keep financial projections realistic for early stage
- Recommended order: Title -> Founder Story -> Problem -> Solution -> Early Traction -> Market -> Team -> Business Model -> Ask -> CTA`;

    case "accelerator":
      return `STRUCTURE FOR ACCELERATOR APPLICATIONS:
- Lead with traction and growth rate — accelerators want fast learners with momentum
- Emphasize team capability and coachability
- Show clear market understanding
- Demonstrate rapid iteration and learning velocity
- Recommended order: Title -> Traction -> Problem -> Solution -> Market -> Team -> Business Model -> Growth Plan -> Ask -> CTA`;

    default:
      return `STRUCTURE FOR GENERAL INVESTORS:
- Balance market opportunity, traction, and team
- Clear narrative arc from problem to solution to ask
- Recommended order: Title -> Problem -> Solution -> Market -> Traction -> Business Model -> Team -> Competition -> Ask -> CTA`;
  }
}

/**
 * Build dimension-specific improvement instructions based on PIQ scores.
 */
function buildDimensionInstructions(piqScore: PIQScore): string {
  const lines: string[] = [];

  for (const dim of piqScore.dimensions) {
    const priority = dim.score < 50 ? "CRITICAL" : dim.score < 70 ? "HIGH" : dim.score < 85 ? "MODERATE" : "MAINTAIN";
    lines.push(
      `- ${dim.label} (current: ${dim.score}/100, priority: ${priority}): ${dim.feedback || "No specific feedback"}`
    );

    // Add targeted fix instructions for weak dimensions
    if (dim.score < 70) {
      switch (dim.id) {
        case "narrative":
          lines.push(
            "  FIX: Ensure clear story arc (problem -> solution -> proof -> ask). Add transitions between slides. Open with a hook."
          );
          break;
        case "market":
          lines.push(
            "  FIX: Add TAM/SAM/SOM with specific dollar amounts and sources. Include market growth rate. Add a market size chart slide."
          );
          break;
        case "differentiation":
          lines.push(
            "  FIX: Add a comparison slide. Articulate 2-3 clear differentiators. Explain defensive moat (network effects, data, IP)."
          );
          break;
        case "financials":
          lines.push(
            "  FIX: Add unit economics (CAC, LTV, margins). Include revenue projections chart. Show path to profitability."
          );
          break;
        case "team":
          lines.push(
            "  FIX: Highlight relevant domain experience. Add specific achievements. Show why this team is uniquely qualified."
          );
          break;
        case "ask":
          lines.push(
            "  FIX: Break down use of funds with percentages. Tie funding to specific milestones. Include timeline for deployment."
          );
          break;
        case "design":
          lines.push(
            "  FIX: Vary slide types (charts, metrics, timeline). Use stat-highlight layouts for key numbers. Add visual variety."
          );
          break;
        case "credibility":
          lines.push(
            "  FIX: Add specific traction numbers with time frames. Include customer logos or testimonials. Cite data sources."
          );
          break;
      }
    }
  }

  return lines.join("\n");
}

const REFINEMENT_PROMPT_TEMPLATE = `You are an expert pitch deck consultant who has helped raise over $1B across 500+ decks. Refine this pitch deck to maximize investor impact.

ORIGINAL COMPANY DATA (PRESERVE ALL REAL DATA — never replace real metrics, names, or facts with generic text):
Company: {companyName}
Tagline: {tagline}
Problem: {problem}
Solution: {solution}
Industry: {industry}
Stage: {stage}
Funding Target: {fundingTarget}
Key Metrics: {keyMetrics}
Team: {teamInfo}
Business Model: {businessModel}
Revenue Model: {revenueModel}
Customer Type: {customerType}
Competitive Advantage: {competitiveAdvantage}
Traction: {traction}
Market Size: {marketSize}
Use of Funds: {useOfFunds}

CURRENT PIQ SCORE: {overallScore}/100 (Grade: {grade})

DIMENSION SCORES & IMPROVEMENT INSTRUCTIONS:
{dimensionInstructions}

TOP RECOMMENDATIONS:
{recommendations}

{investorGuidance}

{userGuidance}

{focusAreas}

CRITICAL RULES:
1. PRESERVE all specific data points from the original deck — real numbers, real team names, real metrics. If the founder said "42% MoM growth", keep "42% MoM growth" — do NOT replace it with generic text.
2. FIX weaknesses: Focus heavily on dimensions scoring below 70. Add missing content sections where needed.
3. ADD missing sections: If there's no competitive analysis slide, add one. If there's no market sizing, add it. If use of funds is missing, add it.
4. TARGET 80+ on every dimension. Make each slide count.
5. Generate 10-14 slides total. Every slide must earn its place.
6. Use a MIX of slide types for visual variety: content, chart, metrics, team, timeline, comparison, stats.
7. For each slide, vary the layout field across content slides — use split, centered, two-column, stat-highlight, default.

VISUAL RICHNESS: Use a MIX of slide types for a premium deck. Available types:
- "image-content": split layout with text + image. Include "imagePrompt" (descriptive stock photo query, e.g. "modern SaaS dashboard on laptop")
- "logo-grid": social proof with customer/partner logos. Include "logos": [{"name":"CompanyName"},...]
- "table": feature comparison matrix. Include "tableData": {"columns":["Feature","Us","Competitor A"],"rows":[["Feature 1","✓","✗"],...]}
- Plus all existing types: title, content, chart, metrics, team, timeline, comparison, stats, cta

You MUST include at least:
- 1-2 "image-content" slides (problem, solution, or product with imagePrompt)
- 1 "table" slide for competitive comparison (with actual feature matrix using ✓/✗)
- 1 "logo-grid" slide for social proof (6-8 real company names relevant to the industry)

Return ONLY valid JSON (no markdown fences, no explanation) with this exact structure:
{
  "slides": [
    {
      "title": "string",
      "subtitle": "string (optional)",
      "content": ["string", "string", ...],
      "type": "title" | "content" | "stats" | "comparison" | "cta" | "chart" | "metrics" | "team" | "timeline" | "image-content" | "logo-grid" | "table",
      "layout": "default" | "centered" | "split" | "two-column" | "stat-highlight" (for content slides only),
      "accent": true | false,
      "chartData": { "type": "bar"|"pie"|"line"|"area", "data": [{"label":"string","value":number},...], "label":"string" },
      "metrics": [{"label":"string","value":"string","change":"string","trend":"up"|"down"|"neutral"},...],
      "team": [{"name":"string","role":"string","bio":"string"},...],
      "timeline": [{"date":"string","title":"string","description":"string","completed":boolean},...],
      "imagePrompt": "string (descriptive stock photo prompt for image-content slides)",
      "logos": [{"name":"string"},...],
      "tableData": { "columns": ["string",...], "rows": [["string",...]] }
    }
  ],
  "improvements": [
    { "dimension": "string (dimension label)", "originalScore": number, "change": "string (description of what was improved)" }
  ],
  "summary": "string (2-3 sentence summary of key improvements made)"
}

Include chartData only for "chart" type slides, metrics only for "metrics" type, team only for "team" type, timeline only for "timeline" type, imagePrompt only for "image-content" type, logos only for "logo-grid" type, tableData only for "table" type. Include layout only for "content" type slides.`;

/**
 * Refine a pitch deck using AI analysis of content and PIQ feedback.
 * Falls back to generateDeck() when no API key is available.
 */
export async function refineDeck(
  input: RefinementInput
): Promise<RefinementResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.log("[refineDeck] No API key — using fallback refinement");
    return fallbackRefinement(input);
  }

  try {
    return await aiRefinement(input, apiKey);
  } catch (error) {
    console.error("[refineDeck] AI refinement failed:", error);
    return fallbackRefinement(input);
  }
}

async function aiRefinement(
  input: RefinementInput,
  apiKey: string
): Promise<RefinementResult> {
  const { content, piqScore, investorType, userGuidance, focusAreas } = input;

  const prompt = REFINEMENT_PROMPT_TEMPLATE
    .replace("{companyName}", content.companyName)
    .replace("{tagline}", content.tagline || "N/A")
    .replace("{problem}", content.problem || "Not specified")
    .replace("{solution}", content.solution || "Not specified")
    .replace("{industry}", content.industry || "Not specified")
    .replace("{stage}", content.stage || "Not specified")
    .replace("{fundingTarget}", content.fundingTarget || "Not specified")
    .replace("{keyMetrics}", content.keyMetrics || "No metrics available")
    .replace("{teamInfo}", content.teamInfo || "No team info available")
    .replace("{businessModel}", content.businessModel || "Not specified")
    .replace("{revenueModel}", content.revenueModel || "Not specified")
    .replace("{customerType}", content.customerType || "Not specified")
    .replace("{competitiveAdvantage}", content.competitiveAdvantage || "Not specified")
    .replace("{traction}", content.traction || "Not specified")
    .replace("{marketSize}", content.marketSize || "Not specified")
    .replace("{useOfFunds}", content.useOfFunds || "Not specified")
    .replace("{overallScore}", String(piqScore.overall))
    .replace("{grade}", piqScore.grade)
    .replace("{dimensionInstructions}", buildDimensionInstructions(piqScore))
    .replace("{recommendations}", piqScore.recommendations.map((r, i) => `${i + 1}. ${r}`).join("\n"))
    .replace("{investorGuidance}", getInvestorStructureGuidance(investorType))
    .replace(
      "{userGuidance}",
      userGuidance
        ? `USER GUIDANCE (prioritize this):\n${userGuidance}`
        : ""
    )
    .replace(
      "{focusAreas}",
      focusAreas && focusAreas.length > 0
        ? `FOCUS AREAS (give extra attention to these):\n${focusAreas.join(", ")}`
        : ""
    );

  const anthropic = new Anthropic({ apiKey });

  const msg = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 8000,
    temperature: 0.8,
    messages: [{ role: "user", content: prompt }],
  });

  const text = msg.content[0].type === "text" ? msg.content[0].text : "";

  // Parse JSON response (handle markdown fences)
  const cleaned = text
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("No JSON found in AI refinement response");
  }

  const parsed = JSON.parse(jsonMatch[0]) as {
    slides?: SlideData[];
    improvements?: Array<{
      dimension: string;
      originalScore: number;
      change: string;
    }>;
    summary?: string;
  };

  if (!parsed.slides || !Array.isArray(parsed.slides) || parsed.slides.length === 0) {
    throw new Error("AI response missing valid slides array");
  }

  // Validate and clean slides
  const slides = parsed.slides.map((slide) => {
    const clean: SlideData = {
      title: slide.title || "Untitled Slide",
      content: Array.isArray(slide.content) ? slide.content : [],
      type: isValidSlideType(slide.type) ? slide.type : "content",
    };

    if (slide.subtitle) clean.subtitle = slide.subtitle;
    if (slide.layout && clean.type === "content") clean.layout = slide.layout;
    if (slide.accent) clean.accent = true;
    if (slide.chartData && clean.type === "chart") clean.chartData = slide.chartData;
    if (slide.metrics && clean.type === "metrics") clean.metrics = slide.metrics;
    if (slide.team && clean.type === "team") clean.team = slide.team;
    if (slide.timeline && clean.type === "timeline") clean.timeline = slide.timeline;
    if (slide.imagePrompt && clean.type === "image-content") clean.imagePrompt = slide.imagePrompt;
    if (slide.logos && clean.type === "logo-grid") clean.logos = slide.logos;
    if (slide.tableData && clean.type === "table") clean.tableData = slide.tableData;

    return clean;
  });

  const improvements = Array.isArray(parsed.improvements) ? parsed.improvements : [];
  const summary = parsed.summary || "Deck refined based on PIQ score analysis.";

  console.log(
    `[refineDeck] AI refinement complete: ${slides.length} slides, ${improvements.length} improvements`
  );

  return { slides, improvements, summary };
}

function isValidSlideType(
  type: string
): type is SlideData["type"] {
  return [
    "title",
    "content",
    "stats",
    "comparison",
    "cta",
    "chart",
    "metrics",
    "team",
    "timeline",
    "image-content",
    "logo-grid",
    "table",
  ].includes(type);
}

/**
 * Fallback refinement: use generateDeck with extracted content mapped to DeckInput.
 * Returns generic improvement notes when AI is unavailable.
 */
async function fallbackRefinement(
  input: RefinementInput
): Promise<RefinementResult> {
  const { content, piqScore, investorType } = input;

  const deckInput: DeckInput = {
    companyName: content.companyName,
    industry: content.industry,
    stage: content.stage,
    fundingTarget: content.fundingTarget,
    investorType: (investorType === "vc" || investorType === "angel" || investorType === "accelerator")
      ? investorType
      : "vc",
    problem: content.problem,
    solution: content.solution,
    keyMetrics: content.keyMetrics,
    teamInfo: content.teamInfo,
  };

  console.log("[refineDeck] Using fallback deck generation");
  const slides = await generateDeck(deckInput);

  // Build generic improvements from weak dimensions
  const improvements = piqScore.dimensions
    .filter((dim) => dim.score < 75)
    .map((dim) => ({
      dimension: dim.label,
      originalScore: dim.score,
      change: `Restructured for ${investorType} investors with improved ${dim.label.toLowerCase()} coverage`,
    }));

  const weakDims = piqScore.dimensions
    .filter((d) => d.score < 70)
    .map((d) => d.label.toLowerCase());

  const summary = weakDims.length > 0
    ? `Deck regenerated targeting ${investorType} investors. Key areas addressed: ${weakDims.join(", ")}. Review and customize with your specific data.`
    : `Deck regenerated and restructured for ${investorType} investors. Review and customize with your specific data.`;

  return { slides, improvements, summary };
}
