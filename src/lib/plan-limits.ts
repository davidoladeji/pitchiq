import { THEMES } from "@/lib/themes";

export interface PlanLimits {
  /* Existing */
  maxDecks: number;
  allowedThemes: string[];
  piqScoreDetail: "basic" | "full";
  showBranding: boolean;
  pdfWatermark: boolean;
  pptxExport: boolean;
  analytics: boolean;

  /* Growth tier features */
  investorVariants: boolean;
  abTesting: boolean;
  followUpAlerts: boolean;
  investorCRM: boolean;

  /* Editor features */
  editor: boolean;
  aiCoachingPerSlide: boolean;
  investorLens: boolean;
  pitchSimulator: boolean;
  maxVersionHistory: number;
  smartBlocks: boolean;
  deckTemplates: boolean;
  appendixGenerator: boolean;

  /* Enterprise features */
  teamCollaboration: boolean;
  maxWorkspaceMembers: number;
  customDomain: boolean;
  apiAccess: boolean;
  batchScoring: boolean;
}

const ALL_THEME_IDS = THEMES.map((t) => t.id);

const PLAN_CONFIGS: Record<string, PlanLimits> = {
  starter: {
    maxDecks: 1,
    allowedThemes: ["midnight"],
    piqScoreDetail: "basic",
    showBranding: true,
    pdfWatermark: true,
    pptxExport: false,
    analytics: false,
    investorVariants: false,
    abTesting: false,
    followUpAlerts: false,
    investorCRM: false,
    editor: false,
    aiCoachingPerSlide: false,
    investorLens: false,
    pitchSimulator: false,
    maxVersionHistory: 0,
    smartBlocks: false,
    deckTemplates: false,
    appendixGenerator: false,
    teamCollaboration: false,
    maxWorkspaceMembers: 0,
    customDomain: false,
    apiAccess: false,
    batchScoring: false,
  },
  pro: {
    maxDecks: Infinity,
    allowedThemes: ALL_THEME_IDS,
    piqScoreDetail: "full",
    showBranding: false,
    pdfWatermark: false,
    pptxExport: true,
    analytics: false,
    investorVariants: false,
    abTesting: false,
    followUpAlerts: false,
    investorCRM: false,
    editor: true,
    aiCoachingPerSlide: true,
    investorLens: false,
    pitchSimulator: false,
    maxVersionHistory: 10,
    smartBlocks: true,
    deckTemplates: true,
    appendixGenerator: true,
    teamCollaboration: false,
    maxWorkspaceMembers: 0,
    customDomain: false,
    apiAccess: false,
    batchScoring: false,
  },
  growth: {
    maxDecks: Infinity,
    allowedThemes: ALL_THEME_IDS,
    piqScoreDetail: "full",
    showBranding: false,
    pdfWatermark: false,
    pptxExport: true,
    analytics: true,
    investorVariants: true,
    abTesting: true,
    followUpAlerts: true,
    investorCRM: true,
    editor: true,
    aiCoachingPerSlide: true,
    investorLens: true,
    pitchSimulator: true,
    maxVersionHistory: Infinity,
    smartBlocks: true,
    deckTemplates: true,
    appendixGenerator: true,
    teamCollaboration: false,
    maxWorkspaceMembers: 0,
    customDomain: true,
    apiAccess: false,
    batchScoring: false,
  },
  enterprise: {
    maxDecks: Infinity,
    allowedThemes: ALL_THEME_IDS,
    piqScoreDetail: "full",
    showBranding: false,
    pdfWatermark: false,
    pptxExport: true,
    analytics: true,
    investorVariants: true,
    abTesting: true,
    followUpAlerts: true,
    investorCRM: true,
    editor: true,
    aiCoachingPerSlide: true,
    investorLens: true,
    pitchSimulator: true,
    maxVersionHistory: Infinity,
    smartBlocks: true,
    deckTemplates: true,
    appendixGenerator: true,
    teamCollaboration: true,
    maxWorkspaceMembers: Infinity,
    customDomain: true,
    apiAccess: true,
    batchScoring: true,
  },
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_CONFIGS[plan] || PLAN_CONFIGS.starter;
}
