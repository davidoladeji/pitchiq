import type { DeckInput, SlideData } from "@/lib/types";
import type {
  SkillContext, SkillResult, GenerationProgressEvent,
  MarketResearchOutput, CompetitorAnalysisOutput, FinancialModelOutput, IndustryDataOutput,
  VCAnalysisOutput, PitchCoachOutput, DataCredibilityOutput, DesignReviewOutput,
  ImageFinderOutput, MockupOutput,
} from "./skills/types";
import { skillRegistry, SKILL_TIERS, API_CALL_BUDGETS } from "./skills/registry";
import { analyzeCompanyDNA } from "./company-dna";
import type { CompanyDNA } from "./company-dna";
import { designNarrative } from "./narrative-architect";
import type { DeckNarrative } from "./narrative-architect";
import { generateVisualSystem } from "./visual-system";
import type { VisualSystem } from "./visual-system";
import { generateAllSlides } from "./slide-generator";
import { reviewDeckCoherence } from "./coherence-reviewer";
import { getTheme } from "@/lib/themes";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface GenerationPlan {
  phases: { name: string; skills: { skillId: string; input: unknown }[]; parallel: boolean }[];
  estimatedTimeMs: number;
  totalAPICalls: number;
}

export interface GenerationResult {
  slides: SlideData[];
  skillOutputs: Map<string, SkillResult<unknown>>;
  critique: {
    vcAnalysis?: VCAnalysisOutput;
    pitchCoach?: PitchCoachOutput;
    dataCredibility?: DataCredibilityOutput;
    designReview?: DesignReviewOutput;
  };
  meta: {
    totalTimeMs: number;
    skillsRun: string[];
    skillsSkipped: string[];
    apiCallsUsed: number;
    dna: CompanyDNA;
    narrative: DeckNarrative;
    visualSystem: VisualSystem;
  };
}

/* ------------------------------------------------------------------ */
/*  Plan Generation                                                    */
/* ------------------------------------------------------------------ */

export function planGeneration(
  input: DeckInput,
  capabilities: { hasWebSearch: boolean; hasImageGen: boolean; planTier: string },
): GenerationPlan {
  const tier = capabilities.planTier as keyof typeof SKILL_TIERS;
  const allowedSkills = new Set(SKILL_TIERS[tier] || []);
  const budget = API_CALL_BUDGETS[tier] || 1;

  if (allowedSkills.size === 0) {
    return { phases: [], estimatedTimeMs: 8000, totalAPICalls: 1 };
  }

  const phases: GenerationPlan["phases"] = [];

  // Phase 1: Research (parallel)
  const researchSkills: { skillId: string; input: unknown }[] = [];
  if (allowedSkills.has("market-researcher")) researchSkills.push({ skillId: "market-researcher", input: { industry: input.industry, stage: input.stage } });
  if (allowedSkills.has("competitor-analyst")) researchSkills.push({ skillId: "competitor-analyst", input: { industry: input.industry, solution: input.solution, companyName: input.companyName } });
  if (allowedSkills.has("financial-modeler")) researchSkills.push({ skillId: "financial-modeler", input: { industry: input.industry, stage: input.stage, fundingTarget: input.fundingTarget, keyMetrics: input.keyMetrics, businessModel: "" } });
  if (allowedSkills.has("industry-data")) researchSkills.push({ skillId: "industry-data", input: { industry: input.industry, problem: input.problem, solution: input.solution } });
  if (researchSkills.length > 0) phases.push({ name: "Research", skills: researchSkills, parallel: true });

  // Phase 2: Visual enrichment (after slides are generated — skills are dispatched post-generation)
  const visualSkills: { skillId: string; input: unknown }[] = [];
  if (allowedSkills.has("icon-selector")) visualSkills.push({ skillId: "icon-selector", input: { concepts: [] } });
  if (allowedSkills.has("image-finder")) visualSkills.push({ skillId: "image-finder", input: {} });
  if (allowedSkills.has("diagram-generator")) visualSkills.push({ skillId: "diagram-generator", input: {} });
  if (allowedSkills.has("mockup-generator")) visualSkills.push({ skillId: "mockup-generator", input: {} });
  if (visualSkills.length > 0) phases.push({ name: "Visual Enhancement", skills: visualSkills, parallel: true });

  // Phase 3: Critique (parallel)
  const critiqueSkills: { skillId: string; input: unknown }[] = [];
  if (allowedSkills.has("vc-analyst")) critiqueSkills.push({ skillId: "vc-analyst", input: {} });
  if (allowedSkills.has("pitch-coach")) critiqueSkills.push({ skillId: "pitch-coach", input: {} });
  if (allowedSkills.has("data-credibility")) critiqueSkills.push({ skillId: "data-credibility", input: {} });
  if (allowedSkills.has("design-reviewer")) critiqueSkills.push({ skillId: "design-reviewer", input: {} });
  if (critiqueSkills.length > 0) phases.push({ name: "Expert Review", skills: critiqueSkills, parallel: true });

  return {
    phases,
    estimatedTimeMs: phases.length * 3000 + 5000,
    totalAPICalls: budget,
  };
}

/* ------------------------------------------------------------------ */
/*  Execution                                                          */
/* ------------------------------------------------------------------ */

export async function executeGeneration(
  input: DeckInput,
  plan: GenerationPlan,
  planTier: string,
  onProgress?: (event: GenerationProgressEvent) => void,
): Promise<GenerationResult> {
  const startTime = Date.now();
  const skillOutputs = new Map<string, SkillResult<unknown>>();
  const skillsRun: string[] = [];
  const skillsSkipped: string[] = [];
  let apiCallsUsed = 0;
  const budget = API_CALL_BUDGETS[planTier] || 1;

  const emit = (e: Partial<GenerationProgressEvent>) => {
    onProgress?.({ phase: "", skill: "", status: "started", message: "", progress: 0, ...e });
  };

  // Build context
  const ctx: SkillContext = {
    companyName: input.companyName,
    industry: input.industry || "",
    stage: input.stage || "",
    problem: input.problem || "",
    solution: input.solution || "",
    keyMetrics: input.keyMetrics || "",
    teamInfo: input.teamInfo || "",
    fundingTarget: input.fundingTarget || "",
    investorType: input.investorType || "vc",
    hasAnthropicKey: !!process.env.ANTHROPIC_API_KEY,
    hasUnsplashKey: !!process.env.UNSPLASH_ACCESS_KEY,
    hasSearchAPI: false,
    apiCallBudget: budget,
    previousOutputs: new Map(),
  };

  // Phase 0: Company DNA + Narrative + Visual System
  emit({ phase: "Analysis", skill: "company-dna", status: "started", message: "Analyzing company DNA...", progress: 5 });
  const dna = await analyzeCompanyDNA(input);
  apiCallsUsed++;
  emit({ phase: "Analysis", skill: "company-dna", status: "completed", message: `Archetype: ${dna.narrativeArchetype}`, progress: 10 });

  const narrative = designNarrative(dna);
  const theme = getTheme(input.themeId || "midnight");
  const visualSystem = generateVisualSystem(dna, theme);

  // Phase 1: Research skills (parallel)
  const researchPhase = plan.phases.find((p) => p.name === "Research");
  if (researchPhase && researchPhase.skills.length > 0) {
    emit({ phase: "Research", skill: "", status: "started", message: "Researching market data...", progress: 15 });

    const results = await Promise.all(
      researchPhase.skills.map(async ({ skillId, input: skillInput }) => {
        if (apiCallsUsed >= budget) { skillsSkipped.push(skillId); return; }
        const skill = skillRegistry.getSkill(skillId);
        if (!skill) { skillsSkipped.push(skillId); return; }

        emit({ phase: "Research", skill: skillId, status: "started", message: `Running ${skill.name}...`, progress: 20 });
        try {
          const result = await skill.execute(skillInput, ctx);
          skillOutputs.set(skillId, result);
          ctx.previousOutputs.set(skillId, result.data);
          skillsRun.push(skillId);
          apiCallsUsed++;
          const msg = summarizeResult(skillId, result);
          emit({ phase: "Research", skill: skillId, status: "completed", message: msg, progress: 30 });
        } catch (err) {
          emit({ phase: "Research", skill: skillId, status: "failed", message: String(err), progress: 30 });
          skillsSkipped.push(skillId);
        }
      })
    );
    void results;
  }

  // Phase 2: Generate slides with enriched data
  emit({ phase: "Generation", skill: "slide-generator", status: "started", message: "Generating slides with enriched data...", progress: 35 });
  const enrichedInput = enrichInputFromResearch(input, ctx.previousOutputs);
  let slides = await generateAllSlides(dna, narrative, visualSystem, enrichedInput);
  apiCallsUsed++;
  emit({ phase: "Generation", skill: "slide-generator", status: "completed", message: `Generated ${slides.length} slides`, progress: 55 });

  // Phase 3: Coherence review
  const { adjustedSlides } = await reviewDeckCoherence(slides, narrative, visualSystem);
  slides = adjustedSlides;

  // Phase 4: Visual enrichment (parallel)
  const visualPhase = plan.phases.find((p) => p.name === "Visual Enhancement");
  if (visualPhase && visualPhase.skills.length > 0 && apiCallsUsed < budget) {
    emit({ phase: "Visual Enhancement", skill: "", status: "started", message: "Enhancing visuals...", progress: 60 });

    await Promise.all(
      visualPhase.skills.map(async ({ skillId }) => {
        if (apiCallsUsed >= budget) { skillsSkipped.push(skillId); return; }
        const skill = skillRegistry.getSkill(skillId);
        if (!skill) return;

        // Build skill-specific input from generated slides
        const skillInput = buildVisualInput(skillId, slides, input, dna, visualSystem);
        emit({ phase: "Visual Enhancement", skill: skillId, status: "started", message: `Running ${skill.name}...`, progress: 65 });
        try {
          const result = await skill.execute(skillInput, ctx);
          skillOutputs.set(skillId, result);
          skillsRun.push(skillId);
          apiCallsUsed++;
          applyVisualResults(skillId, result, slides);
          emit({ phase: "Visual Enhancement", skill: skillId, status: "completed", message: `${skill.name} done`, progress: 70 });
        } catch {
          skillsSkipped.push(skillId);
        }
      })
    );
  }

  // Phase 5: Critique (parallel)
  const critiquePhase = plan.phases.find((p) => p.name === "Expert Review");
  const critique: GenerationResult["critique"] = {};

  if (critiquePhase && critiquePhase.skills.length > 0 && apiCallsUsed < budget) {
    emit({ phase: "Expert Review", skill: "", status: "started", message: "Running expert review...", progress: 75 });

    await Promise.all(
      critiquePhase.skills.map(async ({ skillId }) => {
        if (apiCallsUsed >= budget) { skillsSkipped.push(skillId); return; }
        const skill = skillRegistry.getSkill(skillId);
        if (!skill) return;

        const skillInput = buildCritiqueInput(skillId, slides, input);
        emit({ phase: "Expert Review", skill: skillId, status: "started", message: `Running ${skill.name}...`, progress: 80 });
        try {
          const result = await skill.execute(skillInput, ctx);
          skillOutputs.set(skillId, result);
          skillsRun.push(skillId);
          apiCallsUsed++;

          if (skillId === "vc-analyst" && result.data) critique.vcAnalysis = result.data as VCAnalysisOutput;
          if (skillId === "pitch-coach" && result.data) critique.pitchCoach = result.data as PitchCoachOutput;
          if (skillId === "data-credibility" && result.data) critique.dataCredibility = result.data as DataCredibilityOutput;
          if (skillId === "design-reviewer" && result.data) critique.designReview = result.data as DesignReviewOutput;

          emit({ phase: "Expert Review", skill: skillId, status: "completed", message: summarizeResult(skillId, result), progress: 85 });
        } catch {
          skillsSkipped.push(skillId);
        }
      })
    );

    // Phase 6: Auto-fix critical issues (Enterprise only, max 1 cycle)
    if (planTier === "enterprise") {
      const fixes = collectCriticalFixes(critique);
      if (fixes.length > 0) {
        emit({ phase: "Auto-Fix", skill: "auto-fix", status: "started", message: `Fixing ${fixes.length} critical issues...`, progress: 90 });
        // Apply fixes by updating slide content
        for (const fix of fixes.slice(0, 5)) {
          if (fix.slideIndex >= 0 && fix.slideIndex < slides.length) {
            slides[fix.slideIndex].content = [
              ...slides[fix.slideIndex].content.slice(0, -1),
              fix.suggestedFix,
            ];
          }
        }
        emit({ phase: "Auto-Fix", skill: "auto-fix", status: "completed", message: `Applied ${Math.min(fixes.length, 5)} fixes`, progress: 95 });
      }
    }
  }

  emit({ phase: "Complete", skill: "", status: "completed", message: "Deck ready!", progress: 100 });

  return {
    slides,
    skillOutputs,
    critique,
    meta: {
      totalTimeMs: Date.now() - startTime,
      skillsRun,
      skillsSkipped,
      apiCallsUsed,
      dna,
      narrative,
      visualSystem,
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function enrichInputFromResearch(input: DeckInput, outputs: Map<string, unknown>): DeckInput {
  const enriched = { ...input };
  const market = outputs.get("market-researcher") as MarketResearchOutput | undefined;
  const competitors = outputs.get("competitor-analyst") as CompetitorAnalysisOutput | undefined;
  const financial = outputs.get("financial-modeler") as FinancialModelOutput | undefined;
  const industry = outputs.get("industry-data") as IndustryDataOutput | undefined;

  // Enrich problem with hook stats
  if (industry?.hookStats?.length) {
    const hookLine = industry.hookStats[0].stat;
    if (!enriched.problem.includes(hookLine)) {
      enriched.problem = `${hookLine}\n\n${enriched.problem}`;
    }
  }

  // Enrich metrics with market data
  if (market?.tam) {
    const marketLine = `TAM: ${market.tam.value} (${market.tam.source}), SAM: ${market.sam.value}, SOM: ${market.som.value}, Growth: ${market.growthRate.value}`;
    enriched.keyMetrics = enriched.keyMetrics ? `${enriched.keyMetrics}\n\nMarket: ${marketLine}` : marketLine;
  }

  // Add financial projections context
  if (financial?.unitEconomics) {
    const econLine = `Unit Economics: LTV=${financial.unitEconomics.ltv}, CAC=${financial.unitEconomics.cac}, LTV/CAC=${financial.unitEconomics.ltvCacRatio}x, Gross Margin=${financial.unitEconomics.grossMargin}`;
    enriched.keyMetrics = enriched.keyMetrics ? `${enriched.keyMetrics}\n\n${econLine}` : econLine;
  }

  // Store competitor data for later use in comparison slides
  if (competitors) {
    (enriched as DeckInput & { _competitors?: CompetitorAnalysisOutput })._competitors = competitors;
  }

  return enriched;
}

function buildVisualInput(skillId: string, slides: SlideData[], input: DeckInput, dna: CompanyDNA, vs: VisualSystem): unknown {
  switch (skillId) {
    case "image-finder":
      return { slides: slides.map((s, i) => ({ id: `slide-${i}`, purpose: s.title, type: s.type, imagePrompt: s.imagePrompt })), industry: input.industry, visualPersonality: dna.visualPersonality };
    case "diagram-generator":
      return { slides: slides.map((s, i) => ({ id: `slide-${i}`, purpose: s.title, content: s.content, type: s.type })), colors: vs.colors, headingFont: vs.typography.headingFont };
    case "mockup-generator":
      return { slides: slides.map((s, i) => ({ id: `slide-${i}`, purpose: s.title, content: s.content })), solution: input.solution, industry: input.industry };
    case "icon-selector": {
      const concepts = slides.flatMap((s, i) => s.content.slice(0, 3).map((c, j) => ({ concept: c.slice(0, 50), context: `slide-${i}-item-${j}` })));
      return { concepts: concepts.slice(0, 20) };
    }
    default: return {};
  }
}

function applyVisualResults(skillId: string, result: SkillResult<unknown>, slides: SlideData[]): void {
  if (!result.success || !result.data) return;

  if (skillId === "image-finder") {
    const imgResult = result.data as ImageFinderOutput;
    for (const img of imgResult.images) {
      const idx = parseInt(img.slideId.replace("slide-", ""));
      if (!isNaN(idx) && idx < slides.length && img.primaryImage) {
        slides[idx].imageUrl = img.primaryImage.url;
      }
    }
  }

  if (skillId === "mockup-generator") {
    const mockResult = result.data as MockupOutput;
    for (const mockup of mockResult.mockups) {
      const idx = parseInt(mockup.slideId.replace("slide-", ""));
      if (!isNaN(idx) && idx < slides.length) {
        slides[idx].imagePrompt = mockup.screenContent;
      }
    }
  }
}

function buildCritiqueInput(skillId: string, slides: SlideData[], input: DeckInput): unknown {
  switch (skillId) {
    case "vc-analyst": return { slides, companyName: input.companyName, industry: input.industry, stage: input.stage, fundingTarget: input.fundingTarget };
    case "pitch-coach": return { slides, companyName: input.companyName };
    case "data-credibility": return { slides, industry: input.industry, stage: input.stage };
    case "design-reviewer": return { slides };
    default: return {};
  }
}

function collectCriticalFixes(critique: GenerationResult["critique"]): { slideIndex: number; suggestedFix: string }[] {
  const fixes: { slideIndex: number; suggestedFix: string }[] = [];
  if (critique.vcAnalysis?.criticalWeaknesses) {
    for (const w of critique.vcAnalysis.criticalWeaknesses) {
      if (w.severity === "critical") fixes.push({ slideIndex: w.slideIndex, suggestedFix: w.suggestedFix });
    }
  }
  if (critique.dataCredibility?.issues) {
    for (const i of critique.dataCredibility.issues) {
      if (i.issue === "implausible" || i.issue === "inconsistent") fixes.push({ slideIndex: i.slideIndex, suggestedFix: i.suggestedFix });
    }
  }
  return fixes;
}

function summarizeResult(skillId: string, result: SkillResult<unknown>): string {
  if (!result.success || !result.data) return "Failed";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const d = result.data as any;
  switch (skillId) {
    case "market-researcher": return `TAM: ${d.tam?.value || "—"}`;
    case "competitor-analyst": return `${(d.directCompetitors || []).length} competitors mapped`;
    case "financial-modeler": return `LTV/CAC: ${d.unitEconomics?.ltvCacRatio || "—"}x`;
    case "industry-data": return `${(d.hookStats || []).length} data points found`;
    case "vc-analyst": return `Assessment: ${d.overallAssessment || "—"}`;
    case "pitch-coach": return `Narrative score: ${d.narrativeScore || "—"}/100`;
    case "data-credibility": return `Credibility: ${d.overallCredibility || "—"}/100`;
    default: return "Done";
  }
}
