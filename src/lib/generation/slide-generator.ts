import Anthropic from "@anthropic-ai/sdk";
import type { DeckInput, SlideData } from "@/lib/types";
import type { CompanyDNA } from "./company-dna";
import type { SlideBlueprint, DeckNarrative } from "./narrative-architect";
import type { VisualSystem } from "./visual-system";
import { toLegacySlideType } from "./slide-types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface SlideGenerationContext {
  dna: CompanyDNA;
  blueprint: SlideBlueprint;
  visualSystem: VisualSystem;
  narrative: DeckNarrative;
  previousSlides: SlideData[];
  input: DeckInput;
  slideIndex: number;
  totalSlides: number;
}

/* ------------------------------------------------------------------ */
/*  Per-Slide AI Prompt                                                */
/* ------------------------------------------------------------------ */

function buildSlidePrompt(ctx: SlideGenerationContext): string {
  const { dna, blueprint, narrative, input, slideIndex, totalSlides, previousSlides } = ctx;
  const prevSlide = previousSlides[previousSlides.length - 1];
  const nextBlueprint = narrative.slides[slideIndex + 1];

  return `You are designing slide ${slideIndex + 1}/${totalSlides} of a pitch deck for ${dna.companyName}.

NARRATIVE CONTEXT:
- Archetype: ${dna.narrativeArchetype}
- Through-line: ${narrative.throughLine}
${prevSlide ? `- Previous slide: "${prevSlide.title}" (${prevSlide.type})` : "- This is the OPENING slide"}
- This slide's purpose: ${blueprint.purpose}
${nextBlueprint ? `- Next slide will cover: ${nextBlueprint.purpose}` : "- This is the FINAL slide"}

SLIDE BRIEF:
- Key message: ${blueprint.keyMessage}
- Emotional beat: ${blueprint.emotionalBeat} (audience should feel: ${BEAT_DESCRIPTIONS[blueprint.emotionalBeat]})
- Information density: ${blueprint.density}
- Content tone: ${dna.contentTone}
- Slide type: ${blueprint.slideType}

COMPANY DATA:
- Company: ${input.companyName}
- Industry: ${input.industry || "Not specified"}
- Stage: ${input.stage || "Not specified"}
- Funding Target: ${input.fundingTarget || "Not specified"}
- Problem: ${input.problem || "Not specified"}
- Solution: ${input.solution || "Not specified"}
- Key Metrics: ${input.keyMetrics || "No metrics provided"}
- Team: ${input.teamInfo || "No team info provided"}
- Investor Type: ${input.investorType || "vc"}

CONTENT HINTS: ${blueprint.contentHints.join("; ")}

Generate this single slide. Return ONLY valid JSON (no markdown fences):
{
  "title": "string (compelling heading)",
  "subtitle": "string (optional context line)",
  "content": ["bullet 1", "bullet 2", ...],
  "type": "${toLegacySlideType(blueprint.slideType)}",
  ${getTypeSpecificFields(blueprint)}
  "accent": ${blueprint.isVisualPeak}
}

RULES:
1. Use the company's REAL data — never invent metrics that weren't provided
2. For missing data, use industry-appropriate estimates clearly marked with "~" prefix
3. Write in ${dna.contentTone} tone — not generic business-speak
4. Title must be punchy and specific to this company (not "The Problem" — something like "85% of CFOs Waste 12 Hours Weekly on Manual Reconciliation")
5. Content bullets must vary in style — mix stats, statements, and explanations
6. This slide must advance the narrative from the previous slide
${blueprint.slideType.includes("image") ? '7. Include "imagePrompt": a SPECIFIC description for a stock photo (not generic — describe the exact scene)' : ""}
${blueprint.density === "splash" ? "7. Keep content minimal — this is a high-impact visual slide. Max 2-3 short bullet points." : ""}`;
}

const BEAT_DESCRIPTIONS: Record<string, string> = {
  hook: "intrigued, curious, can't look away",
  tension: "uncomfortable with the status quo, needing a solution",
  revelation: "aha moment, seeing the solution click",
  proof: "convinced by evidence, trust building",
  credibility: "reassured, this team/product is real",
  urgency: "fear of missing out, time-sensitive",
  excitement: "energized about the opportunity",
  confidence: "assured about the path forward",
  action: "ready to invest, clear next step",
};

function getTypeSpecificFields(blueprint: SlideBlueprint): string {
  const legacyType = toLegacySlideType(blueprint.slideType);
  const fields: string[] = [];

  if (legacyType === "chart") {
    fields.push('"chartData": { "type": "bar"|"pie"|"line"|"area", "data": [{"label":"string","value":number},...], "label":"string" }');
  }
  if (legacyType === "metrics") {
    fields.push('"metrics": [{"label":"string","value":"string","change":"string","trend":"up"|"down"|"neutral"},...]');
  }
  if (legacyType === "team") {
    fields.push('"team": [{"name":"string","role":"string","bio":"string"},...]');
  }
  if (legacyType === "timeline") {
    fields.push('"timeline": [{"date":"string","title":"string","description":"string","completed":boolean},...]');
  }
  if (legacyType === "image-content") {
    fields.push('"imagePrompt": "string (specific stock photo description)"');
  }
  if (legacyType === "logo-grid") {
    fields.push('"logos": [{"name":"string"},...]');
  }
  if (legacyType === "table") {
    fields.push('"tableData": {"columns":["string",...], "rows":[["string",...],...]  }');
  }

  return fields.length > 0 ? fields.join(",\n  ") + "," : "";
}

/* ------------------------------------------------------------------ */
/*  Single Slide Generator                                             */
/* ------------------------------------------------------------------ */

export async function generateSlide(ctx: SlideGenerationContext): Promise<SlideData> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return generateSlideHeuristic(ctx);

  try {
    const client = new Anthropic({ apiKey });
    const prompt = buildSlidePrompt(ctx);

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1500,
      temperature: 0.85,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in slide response");

    const parsed = JSON.parse(jsonMatch[0]) as SlideData;

    // Ensure required fields
    return {
      title: parsed.title || ctx.blueprint.keyMessage,
      subtitle: parsed.subtitle,
      content: Array.isArray(parsed.content) ? parsed.content : [],
      type: (parsed.type || toLegacySlideType(ctx.blueprint.slideType)) as SlideData["type"],
      layout: parsed.layout,
      accent: ctx.blueprint.isVisualPeak || parsed.accent,
      chartData: parsed.chartData,
      metrics: parsed.metrics,
      team: parsed.team,
      timeline: parsed.timeline,
      imagePrompt: parsed.imagePrompt,
      imageUrl: parsed.imageUrl,
      logos: parsed.logos,
      tableData: parsed.tableData,
    };
  } catch (error) {
    console.error(`[generateSlide] AI failed for slide ${ctx.slideIndex}:`, error);
    return generateSlideHeuristic(ctx);
  }
}

/* ------------------------------------------------------------------ */
/*  Batched Parallel Generation                                        */
/* ------------------------------------------------------------------ */

export async function generateAllSlides(
  dna: CompanyDNA,
  narrative: DeckNarrative,
  visualSystem: VisualSystem,
  input: DeckInput,
): Promise<SlideData[]> {
  const totalSlides = narrative.slides.length;
  const slides: SlideData[] = [];

  // Batch strategy: opening slides sequential (1-3), middle parallel, closing sequential
  const openingCount = Math.min(3, totalSlides);
  const closingCount = Math.min(2, totalSlides - openingCount);
  const middleStart = openingCount;
  const middleEnd = totalSlides - closingCount;

  // Phase 1: Opening slides (sequential for narrative flow)
  for (let i = 0; i < openingCount; i++) {
    const ctx: SlideGenerationContext = {
      dna, blueprint: narrative.slides[i], visualSystem, narrative,
      previousSlides: slides, input, slideIndex: i, totalSlides,
    };
    const slide = await generateSlide(ctx);
    slides.push(slide);
  }

  // Phase 2: Middle slides (parallel batch)
  if (middleStart < middleEnd) {
    const middleBlueprints = narrative.slides.slice(middleStart, middleEnd);
    const middleSlides = await Promise.all(
      middleBlueprints.map((blueprint, idx) => {
        const ctx: SlideGenerationContext = {
          dna, blueprint, visualSystem, narrative,
          previousSlides: slides, // Opening context available
          input, slideIndex: middleStart + idx, totalSlides,
        };
        return generateSlide(ctx);
      })
    );
    slides.push(...middleSlides);
  }

  // Phase 3: Closing slides (sequential)
  for (let i = middleEnd; i < totalSlides; i++) {
    const ctx: SlideGenerationContext = {
      dna, blueprint: narrative.slides[i], visualSystem, narrative,
      previousSlides: slides, input, slideIndex: i, totalSlides,
    };
    const slide = await generateSlide(ctx);
    slides.push(slide);
  }

  return slides;
}

/* ------------------------------------------------------------------ */
/*  Heuristic Fallback (no AI)                                         */
/* ------------------------------------------------------------------ */

function generateSlideHeuristic(ctx: SlideGenerationContext): SlideData {
  const { blueprint, input, dna } = ctx;
  const legacyType = toLegacySlideType(blueprint.slideType) as SlideData["type"];

  const now = new Date();
  const currentYear = now.getFullYear();
  const q = (offset: number) => {
    const q0 = Math.ceil((now.getMonth() + 1) / 3) - 1 + offset;
    return `Q${(q0 % 4) + 1} ${currentYear + Math.floor(q0 / 4)}`;
  };

  const base: SlideData = {
    title: blueprint.keyMessage,
    subtitle: blueprint.contentHints[0] || undefined,
    content: blueprint.contentHints,
    type: legacyType,
    accent: blueprint.isVisualPeak,
  };

  // Add type-specific defaults
  switch (legacyType) {
    case "chart":
      base.chartData = {
        type: "bar",
        data: [
          { label: "TAM", value: 48 }, { label: "SAM", value: 12 }, { label: "SOM", value: 2.4 },
        ],
        label: "Market Size ($B)",
      };
      break;
    case "metrics":
      base.metrics = [
        { label: "Revenue", value: "$12K MRR", change: "+180%", trend: "up" },
        { label: "Users", value: "2,400", change: "+64%", trend: "up" },
        { label: "Retention", value: "89%", change: "+12%", trend: "up" },
        { label: "CAC", value: "$24", change: "-33%", trend: "down" },
      ];
      break;
    case "team":
      base.team = (input.teamInfo || "Alex Chen, CEO; Jordan Patel, CTO")
        .split(";").map((s) => s.trim()).filter(Boolean).map((entry) => {
          const parts = entry.split(",").map((s) => s.trim());
          return { name: parts[0] || "Team Member", role: parts[1] || "Co-Founder", bio: parts[2] || "Experienced operator" };
        });
      break;
    case "timeline":
      base.timeline = [
        { date: q(0), title: "Launch", description: "V1 release", completed: true },
        { date: q(1), title: "Scale", description: "10x users", completed: false },
        { date: q(2), title: "Enterprise", description: "B2B product", completed: false },
        { date: q(3), title: "Profitability", description: "Break-even", completed: false },
      ];
      break;
    case "image-content":
      base.imagePrompt = `${dna.industry} ${blueprint.purpose} concept professional`;
      break;
    case "logo-grid":
      base.logos = [
        { name: "Salesforce" }, { name: "HubSpot" }, { name: "Slack" },
        { name: "Stripe" }, { name: "AWS" }, { name: "Google Cloud" },
      ];
      break;
    case "table":
      base.tableData = {
        columns: ["Feature", input.companyName, "Competitor A", "Competitor B"],
        rows: [
          ["Core Feature", "✓", "✗", "Partial"],
          ["Real-time", "✓", "✓", "✗"],
          ["Enterprise Ready", "✓", "✗", "✓"],
          ["API Access", "✓", "Limited", "✗"],
        ],
      };
      break;
  }

  // Set layout for content slides
  if (legacyType === "content") {
    const layouts: SlideData["layout"][] = ["split", "centered", "two-column", "stat-highlight", "default"];
    base.layout = layouts[ctx.slideIndex % layouts.length];
  }

  return base;
}
