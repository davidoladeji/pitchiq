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

/** Block types for the pitch deck editor */
export type SlideBlockType =
  | "text"
  | "metric"
  | "chart"
  | "team-member"
  | "timeline-item"
  | "image"
  | "quote"
  | "logo-grid"
  | "comparison-row";

/** An individually addressable block within a slide (used by the editor) */
export interface SlideBlock {
  id: string; // nanoid
  type: SlideBlockType;
  content: string; // primary text content
  properties: Record<string, unknown>; // type-specific props (fontSize, color, chartData, etc.)
}

export interface SlideData {
  id?: string; // stable slide ID for editor reference
  title: string;
  subtitle?: string;
  content: string[];
  type: "title" | "content" | "stats" | "comparison" | "cta" | "chart" | "metrics" | "team" | "timeline" | "image-content" | "logo-grid" | "table";
  layout?: "default" | "centered" | "split" | "two-column" | "stat-highlight";
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
  imagePrompt?: string; // For AI/stock image generation
  logos?: { name: string; url?: string }[]; // For logo-grid slides (trusted by / partners)
  tableData?: { columns: string[]; rows: string[][] }; // For table slides (competitive comparison)
  editorBlocks?: SlideBlock[]; // structured block data for editor (when present, editor uses this)
  editorBlocksV2?: Record<string, unknown>; // v2 typed blocks (runtime-only, stripped before API save)
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
