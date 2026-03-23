/* ------------------------------------------------------------------ */
/*  Skill System — Core Types                                          */
/* ------------------------------------------------------------------ */

export interface Skill<TInput, TOutput> {
  id: string;
  name: string;
  category: "research" | "visual" | "critique" | "enrichment";
  description: string;
  requiresExternalAPI: boolean;
  parallelizable: boolean;
  execute(input: TInput, context: SkillContext): Promise<SkillResult<TOutput>>;
}

export interface SkillContext {
  companyName: string;
  industry: string;
  stage: string;
  problem: string;
  solution: string;
  keyMetrics: string;
  teamInfo: string;
  fundingTarget: string;
  investorType: string;
  hasAnthropicKey: boolean;
  hasUnsplashKey: boolean;
  hasSearchAPI: boolean;
  apiCallBudget: number;
  previousOutputs: Map<string, unknown>;
}

export interface SkillResult<T> {
  success: boolean;
  data: T | null;
  confidence: number;
  sources: string[];
  durationMs: number;
  error?: string;
  usedFallback: boolean;
}

export interface SkillRegistry {
  getSkill(id: string): Skill<unknown, unknown> | undefined;
  getAllSkills(): Skill<unknown, unknown>[];
  getByCategory(category: string): Skill<unknown, unknown>[];
}

/* ------------------------------------------------------------------ */
/*  Research Skill Output Types                                        */
/* ------------------------------------------------------------------ */

export interface MarketResearchOutput {
  tam: { value: string; source: string; year: number };
  sam: { value: string; source: string; year: number };
  som: { value: string; source: string; year: number };
  growthRate: { value: string; cagr: number; source: string };
  keyTrends: string[];
  marketDrivers: string[];
  relatedMarkets: string[];
  methodology: "top-down" | "bottom-up" | "hybrid";
}

export interface CompetitorProfile {
  name: string;
  description: string;
  funding?: string;
  founded?: string;
  headquarters?: string;
  strengths: string[];
  weaknesses: string[];
  pricing?: string;
  targetCustomer: string;
}

export interface CompetitorAnalysisOutput {
  directCompetitors: CompetitorProfile[];
  indirectCompetitors: CompetitorProfile[];
  marketMap: {
    axes: { x: string; y: string };
    positions: { name: string; x: number; y: number }[];
  };
  differentiators: string[];
  competitiveAdvantages: string[];
  featureComparison: {
    features: string[];
    companies: { name: string; values: string[] }[];
  };
}

export interface FinancialModelOutput {
  unitEconomics: {
    ltv: string;
    cac: string;
    ltvCacRatio: number;
    paybackMonths: number;
    grossMargin: string;
    methodology: string;
  };
  revenueProjections: {
    year: number;
    revenue: number;
    growth: number;
    customers: number;
    arr?: number;
  }[];
  useOfFunds: {
    category: string;
    percentage: number;
    amount: string;
    rationale: string;
  }[];
  benchmarkComparisons: {
    metric: string;
    companyValue: string;
    industryMedian: string;
    topQuartile: string;
    source: string;
  }[];
  burnRate?: string;
  runway?: string;
}

export interface IndustryDataOutput {
  hookStats: { stat: string; source: string; context: string }[];
  trends: { trend: string; evidence: string; source: string }[];
  regulatory: string[];
  techShifts: string[];
  painPoints: { point: string; evidence: string }[];
}

/* ------------------------------------------------------------------ */
/*  Visual Skill Output Types                                          */
/* ------------------------------------------------------------------ */

export interface ImageFinderOutput {
  images: {
    slideId: string;
    purpose: string;
    primaryImage: { url: string; alt: string; attribution: string } | null;
    alternateImages: { url: string; alt: string }[];
    searchQueries: string[];
  }[];
}

export interface DiagramOutput {
  diagrams: {
    slideId: string;
    type: "flowchart" | "process" | "comparison" | "hierarchy" | "cycle" | "funnel" | "venn" | "timeline" | "architecture";
    svgCode: string;
    description: string;
  }[];
}

export interface MockupOutput {
  mockups: {
    slideId: string;
    deviceType: "laptop" | "phone" | "tablet" | "browser" | "dashboard";
    screenContent: string;
    svgFrame: string;
    contentZone: { x: number; y: number; width: number; height: number };
  }[];
}

export interface IconSelectionOutput {
  icons: {
    concept: string;
    iconName: string;
    context: string;
  }[];
}

/* ------------------------------------------------------------------ */
/*  Critique Skill Output Types                                        */
/* ------------------------------------------------------------------ */

export interface VCAnalysisOutput {
  overallAssessment: "strong" | "promising" | "needs-work" | "pass";
  investmentThesis: string;
  strengthsVCsCareAbout: string[];
  criticalWeaknesses: {
    issue: string;
    severity: "critical" | "moderate" | "minor";
    slideIndex: number;
    suggestedFix: string;
  }[];
  questionsInvestorsWillAsk: {
    question: string;
    why: string;
    suggestedAnswer: string;
  }[];
  competitivePositioning: string;
  dealbreakers: string[];
}

export interface PitchCoachOutput {
  narrativeScore: number;
  emotionalArc: {
    slideIndex: number;
    emotion: string;
    intensity: number;
    issue?: string;
  }[];
  flowIssues: {
    between: [number, number];
    issue: string;
    fix: string;
  }[];
  slideSpecificFeedback: {
    slideIndex: number;
    strength: string;
    improvement: string;
  }[];
  openingHookRating: number;
  closingImpactRating: number;
  overallRecommendation: string;
}

export interface DataCredibilityOutput {
  issues: {
    slideIndex: number;
    claim: string;
    issue: "implausible" | "inconsistent" | "unsourced" | "outdated" | "vague";
    explanation: string;
    suggestedFix: string;
  }[];
  consistencyChecks: {
    check: string;
    passed: boolean;
    details: string;
  }[];
  overallCredibility: number;
}

export interface DesignReviewOutput {
  compositionVariety: number;
  informationDensityRhythm: number;
  visualImpactMoments: number;
  issues: {
    slideIndex: number;
    issue: string;
    category: "density" | "variety" | "alignment" | "whitespace" | "contrast";
    suggestedFix: string;
  }[];
}

/* ------------------------------------------------------------------ */
/*  Coordinator Types                                                  */
/* ------------------------------------------------------------------ */

export interface GenerationProgressEvent {
  phase: string;
  skill: string;
  status: "started" | "completed" | "failed" | "skipped";
  message: string;
  progress: number;
}
