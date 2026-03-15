import { THEMES } from "@/lib/themes";

export interface PlanLimits {
  maxDecks: number;
  allowedThemes: string[];
  piqScoreDetail: "basic" | "full";
  showBranding: boolean;
  pdfWatermark: boolean;
  pptxExport: boolean;
  analytics: boolean;
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
  },
  pro: {
    maxDecks: Infinity,
    allowedThemes: ALL_THEME_IDS,
    piqScoreDetail: "full",
    showBranding: false,
    pdfWatermark: false,
    pptxExport: true,
    analytics: false,
  },
  growth: {
    maxDecks: Infinity,
    allowedThemes: ALL_THEME_IDS,
    piqScoreDetail: "full",
    showBranding: false,
    pdfWatermark: false,
    pptxExport: true,
    analytics: true,
  },
};

export function getPlanLimits(plan: string): PlanLimits {
  return PLAN_CONFIGS[plan] || PLAN_CONFIGS.starter;
}
