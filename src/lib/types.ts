export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface MetricCard {
  label: string;
  value: string;
  change?: string; // e.g. "+24%" or "3x"
  trend?: "up" | "down" | "neutral";
}

export interface TeamMember {
  name: string;
  role: string;
  bio?: string;
}

export interface TimelineItem {
  date: string;
  title: string;
  description?: string;
  completed?: boolean;
}

export interface SlideData {
  title: string;
  subtitle?: string;
  content: string[];
  type: "title" | "content" | "stats" | "comparison" | "cta" | "chart" | "metrics" | "team" | "timeline" | "image-content";
  accent?: boolean;
  chartData?: {
    type: "bar" | "pie" | "line" | "area";
    data: ChartDataPoint[];
    label?: string; // y-axis or legend label
  };
  metrics?: MetricCard[];
  team?: TeamMember[];
  timeline?: TimelineItem[];
  imageUrl?: string;
  imagePrompt?: string; // For Thesys image generation
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
