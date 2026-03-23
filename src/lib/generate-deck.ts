import { DeckInput, SlideData } from "./types";
import { generateChartData } from "./thesys";
import { getTheme } from "./themes";
import {
  analyzeCompanyDNA,
  analyzeCompanyDNAHeuristic,
  designNarrative,
  generateVisualSystem,
  generateAllSlides,
  reviewDeckCoherence,
  enrichSlidesWithImages,
  mapSlideToBlocks,
} from "./generation";
import type { CompanyDNA, DeckNarrative, VisualSystem } from "./generation";

/* ------------------------------------------------------------------ */
/*  Public Interface                                                   */
/* ------------------------------------------------------------------ */

export interface GenerationResult {
  slides: SlideData[];
  dna: CompanyDNA;
  narrative: DeckNarrative;
  visualSystem: VisualSystem;
}

/**
 * Multi-phase deck generation pipeline.
 *
 * 1. Analyze Company DNA (Haiku — fast classification)
 * 2. Design Narrative Architecture (deterministic — archetype framework)
 * 3. Generate Visual System (deterministic — personality preset + brand)
 * 4. Generate Slides (Sonnet — per-slide, batched parallel)
 * 5. Coherence Review (deterministic rule-based checks)
 * 6. Enrichment (images, chart data)
 *
 * Backward-compatible: API route still calls `generateDeck(input)` and
 * receives `SlideData[]`. Full pipeline metadata stored separately.
 */
export async function generateDeck(input: DeckInput): Promise<SlideData[]> {
  const result = await generateDeckFull(input);
  return result.slides;
}

/**
 * Full pipeline returning all generation metadata.
 * Used internally and by the API route to store generationMeta.
 */
export async function generateDeckFull(input: DeckInput): Promise<GenerationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return generateHeuristicDeck(input);
  }

  try {
    // Phase 1: Analyze Company DNA (fast — Haiku)
    console.log("[generateDeck] Phase 1: Analyzing company DNA...");
    const dna = await analyzeCompanyDNA(input);
    console.log(`[generateDeck] DNA: archetype=${dna.narrativeArchetype}, personality=${dna.visualPersonality}`);

    // Phase 2: Design Narrative Architecture
    console.log("[generateDeck] Phase 2: Designing narrative...");
    const narrative = designNarrative(dna);
    console.log(`[generateDeck] Narrative: ${narrative.slideCount} slides, archetype=${narrative.archetype}`);

    // Phase 3: Generate Visual System
    console.log("[generateDeck] Phase 3: Generating visual system...");
    const theme = getTheme(input.themeId || "midnight");
    const visualSystem = generateVisualSystem(dna, theme);

    // Phase 4: Generate Slides (batched parallel)
    console.log("[generateDeck] Phase 4: Generating slides...");
    const rawSlides = await generateAllSlides(dna, narrative, visualSystem, input);
    console.log(`[generateDeck] Generated ${rawSlides.length} slides`);

    // Phase 5: Coherence Review + Adjustments
    console.log("[generateDeck] Phase 5: Reviewing coherence...");
    const { adjustedSlides, issues } = await reviewDeckCoherence(rawSlides, narrative, visualSystem);
    if (issues.length > 0) {
      console.log(`[generateDeck] Fixed ${issues.length} coherence issues`);
    }

    // Phase 6: Enrichment (images, chart data)
    console.log("[generateDeck] Phase 6: Enriching slides...");
    const enrichedSlides = await enrichSlides(adjustedSlides, dna, visualSystem, narrative, input);

    // Attach composition metadata to each slide
    for (let i = 0; i < enrichedSlides.length; i++) {
      const blueprint = narrative.slides[i];
      if (blueprint) {
        enrichedSlides[i].editorBlocksV2 = mapSlideToBlocks(
          enrichedSlides[i],
          blueprint.composition,
          visualSystem,
        );
      }
    }

    console.log("[generateDeck] Pipeline complete.");
    return { slides: enrichedSlides, dna, narrative, visualSystem };
  } catch (error) {
    console.error("[generateDeck] Pipeline failed, using heuristic fallback:", error);
    return generateHeuristicDeck(input);
  }
}

/* ------------------------------------------------------------------ */
/*  Enrichment Phase                                                   */
/* ------------------------------------------------------------------ */

async function enrichSlides(
  slides: SlideData[],
  dna: CompanyDNA,
  _visualSystem: VisualSystem,
  _narrative: DeckNarrative,
  input: DeckInput,
): Promise<SlideData[]> {
  // Parallel enrichment: images + chart data
  await Promise.all([
    enrichSlidesWithImages(slides, dna.industry, dna.visualPersonality),
    enrichChartsWithThesys(slides, input),
  ]);

  return slides;
}

/**
 * Use Thesys API to enrich any chart slides missing chartData.
 */
async function enrichChartsWithThesys(slides: SlideData[], input: DeckInput): Promise<void> {
  const chartSlides = slides.filter((s) => s.type === "chart" && !s.chartData?.data?.length);
  if (chartSlides.length === 0) return;

  await Promise.all(
    chartSlides.map(async (slide) => {
      const chartData = await generateChartData(
        `${slide.title}: ${slide.subtitle || slide.content.join(", ")}`,
        input.companyName,
        input.industry,
      );
      if (chartData) slide.chartData = chartData;
    })
  );
}

/* ------------------------------------------------------------------ */
/*  Heuristic Fallback (no API key)                                    */
/* ------------------------------------------------------------------ */

function generateHeuristicDeck(input: DeckInput): GenerationResult {
  const dna = analyzeCompanyDNAHeuristic(input);
  const narrative = designNarrative(dna);
  const theme = getTheme(input.themeId || "midnight");
  const visualSystem = generateVisualSystem(dna, theme);

  // Build slides from the narrative blueprints using heuristic content
  const slides = generateFallbackSlides(input, narrative);

  return { slides, dna, narrative, visualSystem };
}

function generateFallbackSlides(input: DeckInput, narrative: DeckNarrative): SlideData[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const q = (offset: number) => {
    const q0 = Math.ceil((now.getMonth() + 1) / 3) - 1 + offset;
    return `Q${(q0 % 4) + 1} ${currentYear + Math.floor(q0 / 4)}`;
  };

  const toBullets = (text: string, max = 4): string[] => {
    const parts = text.split(/[.!?]\s+|[;\n]/).map((s) => s.trim()).filter(Boolean);
    return parts.length ? parts.slice(0, max) : [text || "—"];
  };

  const problemBullets = toBullets(input.problem);
  const solutionBullets = toBullets(input.solution);

  // Map narrative blueprints to actual slide content
  return narrative.slides.map((blueprint, index) => {
    const legacyType = blueprint.composition.density === "splash"
      ? (index === 0 ? "title" : index === narrative.slides.length - 1 ? "cta" : "content")
      : blueprint.slideType.includes("chart") || blueprint.slideType.includes("market") || blueprint.slideType.includes("growth") || blueprint.slideType.includes("economics")
        ? "chart" as const
        : blueprint.slideType.includes("metric") || blueprint.slideType.includes("dashboard")
          ? "metrics" as const
          : blueprint.slideType.includes("team")
            ? "team" as const
            : blueprint.slideType.includes("timeline") || blueprint.slideType.includes("roadmap")
              ? "timeline" as const
              : blueprint.slideType.includes("image") || blueprint.slideType.includes("product") || blueprint.slideType.includes("problem-visual")
                ? "image-content" as const
                : blueprint.slideType.includes("social") || blueprint.slideType.includes("logo")
                  ? "logo-grid" as const
                  : blueprint.slideType.includes("competitive") || blueprint.slideType.includes("matrix")
                    ? "table" as const
                    : "content" as const;

    const base: SlideData = {
      title: blueprint.keyMessage,
      subtitle: blueprint.contentHints[0],
      content: blueprint.contentHints,
      type: legacyType,
      accent: blueprint.isVisualPeak,
    };

    // Type-specific data
    switch (legacyType) {
      case "title":
        base.title = input.companyName;
        base.subtitle = [input.industry, input.stage].filter(Boolean).join(" · ");
        base.content = [`Raising ${input.fundingTarget}`];
        break;
      case "chart":
        if (blueprint.purpose.includes("market") || blueprint.purpose.includes("sizing")) {
          base.chartData = { type: "bar", data: [{ label: "TAM", value: 48 }, { label: "SAM", value: 12 }, { label: "SOM", value: 2.4 }], label: "Market Size ($B)" };
        } else if (blueprint.purpose.includes("growth") || blueprint.purpose.includes("trajectory")) {
          base.chartData = { type: "area", data: [{ label: "Jan", value: 2 }, { label: "Feb", value: 4.5 }, { label: "Mar", value: 6 }, { label: "Apr", value: 8.5 }, { label: "May", value: 12 }, { label: "Jun", value: 18 }], label: "MRR ($K)" };
        } else if (blueprint.purpose.includes("ask") || blueprint.purpose.includes("fund")) {
          base.chartData = { type: "pie", data: [{ label: "Product", value: 40 }, { label: "GTM", value: 30 }, { label: "Team", value: 20 }, { label: "Ops", value: 10 }], label: "Use of Funds" };
        } else {
          base.chartData = { type: "bar", data: [{ label: String(currentYear), value: 450 }, { label: String(currentYear + 1), value: 1800 }, { label: String(currentYear + 2), value: 5200 }], label: "Revenue ($K)" };
        }
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
        base.team = (input.teamInfo || "Alex Chen, CEO; Jordan Patel, CTO; Sam Rivera, COO")
          .split(";").map((s) => s.trim()).filter(Boolean).map((entry) => {
            const parts = entry.split(",").map((s) => s.trim());
            return { name: parts[0] || "Team Member", role: parts[1] || "Co-Founder", bio: parts[2] || "Experienced operator" };
          });
        break;
      case "timeline":
        base.timeline = [
          { date: q(0), title: "Launch", description: "V1 release", completed: true },
          { date: q(1), title: "Scale", description: "10x user base", completed: false },
          { date: q(2), title: "Enterprise", description: "B2B features", completed: false },
          { date: q(3), title: "Profitability", description: "Break-even", completed: false },
        ];
        break;
      case "image-content":
        base.content = blueprint.purpose.includes("problem") ? problemBullets : solutionBullets;
        base.imagePrompt = `${input.industry} ${blueprint.purpose} professional concept`;
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
            ["Enterprise", "✓", "✗", "✓"],
            ["API Access", "✓", "Limited", "✗"],
          ],
        };
        break;
      case "cta":
        base.title = "Let's Build Together";
        base.subtitle = input.companyName;
        base.content = ["Ready for the next chapter", `${input.companyName} — ${solutionBullets[0] || "Get in touch"}`];
        break;
      case "content":
      default: {
        const layouts: SlideData["layout"][] = ["split", "centered", "two-column", "stat-highlight", "default"];
        base.layout = layouts[index % layouts.length];
        if (blueprint.purpose.includes("problem")) base.content = problemBullets;
        else if (blueprint.purpose.includes("solution") || blueprint.purpose.includes("bridge")) base.content = solutionBullets;
        else if (blueprint.purpose.includes("model")) base.content = [`Stage: ${input.stage}`, `Target: ${input.fundingTarget}`, ...solutionBullets.slice(0, 2)];
        break;
      }
    }

    return base;
  });
}
