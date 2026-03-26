export interface DashboardStats {
  totalDecks: number;
  totalViews: number;
  avgScore: number;
  bestScore: number;
  bestDeckTitle: string;
}

export interface DeckItem {
  id: string;
  title: string;
  companyName: string;
  score: number;
  views: number;
  theme: string;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityItem {
  id: string;
  type: "view" | "create" | "score";
  message: string;
  timestamp: string;
  deckId: string;
}

export interface InvestorMatch {
  id: string;
  name: string;
  type: string;
  fitScore: number;
  matchReasons: string[];
  avatarUrl?: string;
}

export interface FundraisePipeline {
  identified: number;
  contacted: number;
  meeting: number;
  dueDiligence: number;
  termSheet: number;
}

export interface PracticeSession {
  id: string;
  deckId: string;
  deckTitle: string;
  date: string;
  durationSeconds: number;
  overallScore: number;
  clarity: number;
  pacing: number;
  confidence: number;
}

export interface ABTestVariant {
  label: string;
  views: number;
  avgTimeSeconds: number;
}

export interface ABTest {
  id: string;
  deckId: string;
  deckTitle: string;
  status: string;
  startedAt: string;
  variantA: ABTestVariant;
  variantB: ABTestVariant;
}

export interface DailyDataPoint {
  date: string;
  value: number;
}

export interface InvestorContact {
  id: string;
  name: string;
  firm: string;
  email: string;
  stage: "identified" | "contacted" | "meeting" | "due_diligence" | "term_sheet";
  notes: string;
  lastUpdated: string;
}

export interface AnalyticsDetail {
  uniqueViewers: number;
  avgEngagementMinutes: number;
  topDeckTitle: string;
  viewsByDeck: { deckTitle: string; views: number }[];
  trafficSources: { source: string; count: number }[];
}

export interface UserProfile {
  name: string;
  email: string;
  plan: string;
  avatarUrl?: string;
  company?: string;
}

export interface NotificationPrefs {
  deckViewed: boolean;
  scoreUpdated: boolean;
  investorMatch: boolean;
  weeklyDigest: boolean;
}

export interface PlanInfo {
  name: string;
  price: number;
  interval: "month" | "year";
  renewalDate: string;
  cardLast4: string;
  cardBrand: string;
}

export interface Invoice {
  id: string;
  date: string;
  amount: number;
  status: "paid" | "pending" | "failed";
}

export interface PlanFeature {
  name: string;
  starter: string | boolean;
  pro: string | boolean;
  growth: string | boolean;
  enterprise: string | boolean;
}

export interface PipelineActivity {
  id: string;
  description: string;
  timestamp: string;
}
