export interface SlideData {
  title: string;
  subtitle?: string;
  content: string[];
  type: "title" | "content" | "stats" | "comparison" | "cta";
  accent?: boolean;
}

export interface DeckInput {
  companyName: string;
  industry: string;
  stage: string;
  fundingTarget: string;
  investorType: "vc" | "angel" | "accelerator";
  problem: string;
  solution: string;
  keyMetrics: string;
  teamInfo: string;
  themeId?: string;
  brandLogo?: string;
  brandPrimaryColor?: string;
  brandFont?: string;
}

export interface DeckData {
  id: string;
  shareId: string;
  title: string;
  companyName: string;
  slides: SlideData[];
  createdAt: string;
  isPremium: boolean;
  themeId?: string;
  piqScore?: PIQScore;
}

/** PIQ Score — 0-100 fundability rating */
export interface PIQScore {
  overall: number;
  grade: string; // A+ through F
  dimensions: PIQDimension[];
  recommendations: string[];
}

export interface PIQDimension {
  id: string;
  label: string;
  score: number; // 0-100
  weight: number; // percentage weight (sums to 100)
  feedback: string;
}

export interface ViewAnalytics {
  totalViews: number;
  uniqueViewers: number;
  avgTimeSpent: number;
  slideEngagement: { slideIndex: number; avgTime: number; views: number }[];
}

/** Business idea generator: question id → user answer */
export interface IdeaQuestionAnswer {
  questionId: string;
  answer: string;
}

/** Single generated business idea (from questions flow) */
export interface BusinessIdea {
  name: string;
  oneLiner: string;
  problem: string;
  solution: string;
  targetCustomer: string;
  whyNow?: string;
}
