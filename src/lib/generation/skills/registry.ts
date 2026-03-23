import type { Skill, SkillRegistry } from "./types";
import { marketResearcherSkill } from "./research/market-researcher";
import { competitorAnalystSkill } from "./research/competitor-analyst";
import { financialModelerSkill } from "./research/financial-modeler";
import { industryDataSkill } from "./research/industry-data";
import { imageFinderSkill } from "./visual/image-finder";
import { diagramGeneratorSkill } from "./visual/diagram-generator";
import { mockupGeneratorSkill } from "./visual/mockup-generator";
import { iconSelectorSkill } from "./visual/icon-selector";
import { vcAnalystSkill } from "./critique/vc-analyst";
import { pitchCoachSkill } from "./critique/pitch-coach";
import { dataCredibilitySkill } from "./critique/data-credibility";
import { designReviewerSkill } from "./critique/design-reviewer";

/* eslint-disable @typescript-eslint/no-explicit-any */
const ALL_SKILLS: Skill<any, any>[] = [
  marketResearcherSkill,
  competitorAnalystSkill,
  financialModelerSkill,
  industryDataSkill,
  imageFinderSkill,
  diagramGeneratorSkill,
  mockupGeneratorSkill,
  iconSelectorSkill,
  vcAnalystSkill,
  pitchCoachSkill,
  dataCredibilitySkill,
  designReviewerSkill,
];
/* eslint-enable @typescript-eslint/no-explicit-any */

export const skillRegistry: SkillRegistry = {
  getSkill: (id) => ALL_SKILLS.find((s) => s.id === id) as Skill<unknown, unknown> | undefined,
  getAllSkills: () => ALL_SKILLS as Skill<unknown, unknown>[],
  getByCategory: (cat) => ALL_SKILLS.filter((s) => s.category === cat) as Skill<unknown, unknown>[],
};

/** Skill IDs by tier */
export const SKILL_TIERS = {
  starter: [] as string[],
  pro: ["financial-modeler", "industry-data", "icon-selector"],
  growth: [
    "market-researcher", "competitor-analyst", "financial-modeler", "industry-data",
    "image-finder", "diagram-generator", "mockup-generator", "icon-selector",
    "vc-analyst", "pitch-coach", "data-credibility", "design-reviewer",
  ],
  enterprise: [
    "market-researcher", "competitor-analyst", "financial-modeler", "industry-data",
    "image-finder", "diagram-generator", "mockup-generator", "icon-selector",
    "vc-analyst", "pitch-coach", "data-credibility", "design-reviewer",
  ],
} as const;

/** API call budget per tier */
export const API_CALL_BUDGETS: Record<string, number> = {
  starter: 1,
  pro: 5,
  growth: 15,
  enterprise: 25,
};
