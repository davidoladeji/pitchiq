import type {
  DashboardStats,
  DeckItem,
  ActivityItem,
  InvestorMatch,
  FundraisePipeline,
  PracticeSession,
  ABTest,
  DailyDataPoint,
  InvestorContact,
  AnalyticsDetail,
  UserProfile,
  NotificationPrefs,
  PlanInfo,
  Invoice,
  PlanFeature,
  PipelineActivity,
} from "@/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const TODAY = "2026-03-22";

function daysAgo(n: number): string {
  const d = new Date(`${TODAY}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString();
}

function hoursAgo(n: number): string {
  const d = new Date(`${TODAY}T14:30:00Z`);
  d.setUTCHours(d.getUTCHours() - n);
  return d.toISOString();
}

/**
 * Generate a realistic-looking daily time-series going back `days` days from
 * 2026-03-22. Values oscillate between `min` and `max` with a slight upward
 * trend and day-to-day noise.
 */
export function generateTimeSeries(
  days: number,
  min: number,
  max: number,
): DailyDataPoint[] {
  const points: DailyDataPoint[] = [];
  const range = max - min;

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(`${TODAY}T00:00:00Z`);
    d.setUTCDate(d.getUTCDate() - i);
    const date = d.toISOString().slice(0, 10);

    // slight upward trend + sine wobble + random noise
    const progress = 1 - i / days;
    const trend = progress * range * 0.4;
    const wobble = Math.sin((i / days) * Math.PI * 4) * range * 0.15;
    const noise = (Math.sin(i * 7.3 + 2.1) * 0.5 + 0.5) * range * 0.2;
    const value = Math.round(
      Math.min(max, Math.max(min, min + trend + wobble + noise)),
    );

    points.push({ date, value });
  }

  return points;
}

// ---------------------------------------------------------------------------
// 1. Dashboard stats
// ---------------------------------------------------------------------------

export const mockStats: DashboardStats = {
  totalDecks: 12,
  totalViews: 487,
  avgScore: 78,
  bestScore: 92,
  bestDeckTitle: "Series A Pitch",
};

// ---------------------------------------------------------------------------
// 2. Sparkline data
// ---------------------------------------------------------------------------

export const mockSparklines = {
  decks: [7, 7, 8, 8, 9, 9, 10, 10, 10, 11, 11, 11, 11, 12, 12],
  views: [20, 22, 21, 24, 25, 23, 27, 26, 28, 29, 30, 28, 31, 33, 35],
};

// ---------------------------------------------------------------------------
// 3. Decks
// ---------------------------------------------------------------------------

export const mockDecks: DeckItem[] = [
  {
    id: "deck-001",
    title: "Series A Pitch",
    companyName: "TechVenture AI",
    score: 92,
    views: 142,
    theme: "modern",
    isPremium: true,
    updatedAt: daysAgo(1),
    createdAt: daysAgo(45),
  },
  {
    id: "deck-002",
    title: "Seed Round",
    companyName: "GreenFlow",
    score: 78,
    views: 89,
    theme: "minimal",
    isPremium: true,
    updatedAt: daysAgo(3),
    createdAt: daysAgo(30),
  },
  {
    id: "deck-003",
    title: "Growth Strategy",
    companyName: "DataSync Pro",
    score: 85,
    views: 67,
    theme: "bold",
    isPremium: true,
    updatedAt: daysAgo(5),
    createdAt: daysAgo(22),
  },
  {
    id: "deck-004",
    title: "Angel Deck v2",
    companyName: "FoodTech Labs",
    score: 45,
    views: 12,
    theme: "classic",
    isPremium: false,
    updatedAt: daysAgo(14),
    createdAt: daysAgo(60),
  },
  {
    id: "deck-005",
    title: "Demo Presentation",
    companyName: "CloudBase",
    score: 67,
    views: 225,
    theme: "modern",
    isPremium: true,
    updatedAt: daysAgo(2),
    createdAt: daysAgo(18),
  },
  {
    id: "deck-006",
    title: "Pre-Seed Pitch",
    companyName: "HealthAI",
    score: 71,
    views: 34,
    theme: "minimal",
    isPremium: false,
    updatedAt: daysAgo(7),
    createdAt: daysAgo(40),
  },
];

// ---------------------------------------------------------------------------
// 4. Analytics
// ---------------------------------------------------------------------------

export const mockAnalytics = {
  dailyViews: generateTimeSeries(30, 8, 35),
};

// ---------------------------------------------------------------------------
// 5. Activity feed
// ---------------------------------------------------------------------------

export const mockActivity: ActivityItem[] = [
  {
    id: "act-001",
    type: "view",
    message: "Series A Pitch was viewed by an investor",
    timestamp: hoursAgo(1),
    deckId: "deck-001",
  },
  {
    id: "act-002",
    type: "score",
    message: "Growth Strategy score improved to 85",
    timestamp: hoursAgo(3),
    deckId: "deck-003",
  },
  {
    id: "act-003",
    type: "view",
    message: "Demo Presentation received 5 new views",
    timestamp: hoursAgo(6),
    deckId: "deck-005",
  },
  {
    id: "act-004",
    type: "create",
    message: "You created a new deck: Pre-Seed Pitch",
    timestamp: hoursAgo(12),
    deckId: "deck-006",
  },
  {
    id: "act-005",
    type: "view",
    message: "Seed Round was shared via link and viewed 3 times",
    timestamp: hoursAgo(18),
    deckId: "deck-002",
  },
  {
    id: "act-006",
    type: "score",
    message: "Series A Pitch reached a score of 92",
    timestamp: hoursAgo(24),
    deckId: "deck-001",
  },
  {
    id: "act-007",
    type: "view",
    message: "Angel Deck v2 was viewed for the first time",
    timestamp: hoursAgo(48),
    deckId: "deck-004",
  },
  {
    id: "act-008",
    type: "create",
    message: "You duplicated Demo Presentation as a template",
    timestamp: hoursAgo(72),
    deckId: "deck-005",
  },
  {
    id: "act-009",
    type: "score",
    message: "Seed Round score updated to 78",
    timestamp: hoursAgo(96),
    deckId: "deck-002",
  },
  {
    id: "act-010",
    type: "view",
    message: "Growth Strategy was viewed by 2 new visitors",
    timestamp: hoursAgo(120),
    deckId: "deck-003",
  },
];

// ---------------------------------------------------------------------------
// 6. Investor matches
// ---------------------------------------------------------------------------

export const mockInvestors: InvestorMatch[] = [
  {
    id: "inv-001",
    name: "Sequoia Capital",
    type: "vc",
    fitScore: 92,
    matchReasons: ["Stage match", "Sector alignment", "Geography fit"],
  },
  {
    id: "inv-002",
    name: "Andreessen Horowitz",
    type: "vc",
    fitScore: 87,
    matchReasons: ["Sector alignment", "Cheque size match"],
  },
  {
    id: "inv-003",
    name: "First Round Capital",
    type: "vc",
    fitScore: 84,
    matchReasons: ["Stage match", "Thesis alignment"],
  },
  {
    id: "inv-004",
    name: "Y Combinator",
    type: "accelerator",
    fitScore: 81,
    matchReasons: ["Stage match", "Sector alignment"],
  },
  {
    id: "inv-005",
    name: "Hustle Fund",
    type: "vc",
    fitScore: 76,
    matchReasons: ["Stage match", "Geography fit"],
  },
];

// ---------------------------------------------------------------------------
// 7. Fundraise pipeline
// ---------------------------------------------------------------------------

export const mockFundraise: FundraisePipeline = {
  identified: 8,
  contacted: 5,
  meeting: 3,
  dueDiligence: 1,
  termSheet: 0,
};

// ---------------------------------------------------------------------------
// 8. Practice sessions
// ---------------------------------------------------------------------------

export const mockPractice: PracticeSession[] = [
  {
    id: "prac-001",
    deckId: "deck-001",
    deckTitle: "Series A Pitch",
    date: daysAgo(2),
    durationSeconds: 420,
    overallScore: 88,
    clarity: 90,
    pacing: 85,
    confidence: 89,
  },
  {
    id: "prac-002",
    deckId: "deck-002",
    deckTitle: "Seed Round",
    date: daysAgo(5),
    durationSeconds: 360,
    overallScore: 74,
    clarity: 78,
    pacing: 70,
    confidence: 73,
  },
  {
    id: "prac-003",
    deckId: "deck-003",
    deckTitle: "Growth Strategy",
    date: daysAgo(8),
    durationSeconds: 510,
    overallScore: 81,
    clarity: 83,
    pacing: 79,
    confidence: 82,
  },
];

// ---------------------------------------------------------------------------
// 9. A/B tests
// ---------------------------------------------------------------------------

export const mockABTests: ABTest[] = [
  {
    id: "ab-001",
    deckId: "deck-001",
    deckTitle: "Series A Pitch",
    status: "running",
    startedAt: daysAgo(7),
    variantA: {
      label: "Original intro slide",
      views: 68,
      avgTimeSeconds: 45,
    },
    variantB: {
      label: "Story-driven intro slide",
      views: 74,
      avgTimeSeconds: 62,
    },
  },
];

// ---------------------------------------------------------------------------
// 10. Investor contacts (pipeline)
// ---------------------------------------------------------------------------

export const mockInvestorContacts: InvestorContact[] = [
  { id: "c1", name: "Sarah Chen", firm: "Sequoia Capital", email: "sarah@sequoia.com", stage: "meeting", notes: "Interested in our AI capabilities. Follow up on technical demo.", lastUpdated: daysAgo(1) },
  { id: "c2", name: "Michael Park", firm: "Andreessen Horowitz", email: "mpark@a16z.com", stage: "contacted", notes: "Sent intro deck. Waiting for response.", lastUpdated: daysAgo(3) },
  { id: "c3", name: "Lisa Zhang", firm: "First Round Capital", email: "lisa@firstround.com", stage: "identified", notes: "Met at TechCrunch Disrupt. Strong sector fit.", lastUpdated: daysAgo(5) },
  { id: "c4", name: "James Wilson", firm: "Y Combinator", email: "james@yc.com", stage: "due_diligence", notes: "Reviewing financials. Need to send updated projections.", lastUpdated: daysAgo(2) },
  { id: "c5", name: "Amy Roberts", firm: "Hustle Fund", email: "amy@hustlefund.vc", stage: "contacted", notes: "Warm intro from portfolio founder.", lastUpdated: daysAgo(4) },
  { id: "c6", name: "David Kim", firm: "Lightspeed Ventures", email: "dkim@lsvp.com", stage: "identified", notes: "Active in our vertical. Research their recent investments.", lastUpdated: daysAgo(7) },
  { id: "c7", name: "Rachel Green", firm: "Accel Partners", email: "rachel@accel.com", stage: "meeting", notes: "Second meeting scheduled. Preparing detailed product demo.", lastUpdated: daysAgo(1) },
  { id: "c8", name: "Tom Anderson", firm: "Benchmark", email: "tom@benchmark.com", stage: "identified", notes: "Reached out via LinkedIn. No response yet.", lastUpdated: daysAgo(10) },
];

// ---------------------------------------------------------------------------
// 11. Analytics detail
// ---------------------------------------------------------------------------

export const mockAnalyticsDetail: AnalyticsDetail = {
  uniqueViewers: 234,
  avgEngagementMinutes: 4.2,
  topDeckTitle: "Series A Pitch",
  viewsByDeck: [
    { deckTitle: "Series A Pitch", views: 142 },
    { deckTitle: "Demo Presentation", views: 225 },
    { deckTitle: "Seed Round", views: 89 },
    { deckTitle: "Growth Strategy", views: 67 },
    { deckTitle: "Pre-Seed Pitch", views: 34 },
  ],
  trafficSources: [
    { source: "Direct Link", count: 245 },
    { source: "Shared", count: 142 },
    { source: "Embedded", count: 67 },
    { source: "Social", count: 33 },
  ],
};

// ---------------------------------------------------------------------------
// 12. User profile
// ---------------------------------------------------------------------------

export const mockUserProfile: UserProfile = {
  name: "David Oladeji",
  email: "david@techventure.ai",
  plan: "growth",
  company: "TechVenture AI",
};

// ---------------------------------------------------------------------------
// 13. Notification preferences
// ---------------------------------------------------------------------------

export const mockNotificationPrefs: NotificationPrefs = {
  deckViewed: true,
  scoreUpdated: true,
  investorMatch: false,
  weeklyDigest: true,
};

// ---------------------------------------------------------------------------
// 14. Plan info
// ---------------------------------------------------------------------------

export const mockPlanInfo: PlanInfo = {
  name: "Growth",
  price: 29,
  interval: "month",
  renewalDate: "2026-04-22",
  cardLast4: "1487",
  cardBrand: "Visa",
};

// ---------------------------------------------------------------------------
// 15. Invoices
// ---------------------------------------------------------------------------

export const mockInvoices: Invoice[] = [
  { id: "inv-001", date: "2026-03-22", amount: 2900, status: "paid" },
  { id: "inv-002", date: "2026-02-22", amount: 2900, status: "paid" },
  { id: "inv-003", date: "2026-01-22", amount: 2900, status: "paid" },
  { id: "inv-004", date: "2025-12-22", amount: 2900, status: "paid" },
  { id: "inv-005", date: "2025-11-22", amount: 2900, status: "paid" },
];

// ---------------------------------------------------------------------------
// 16. Plan features
// ---------------------------------------------------------------------------

export const mockPlanFeatures: PlanFeature[] = [
  { name: "Pitch Decks", starter: "1", pro: "5", growth: "10", enterprise: "Unlimited" },
  { name: "PIQ Scoring", starter: true, pro: true, growth: true, enterprise: true },
  { name: "Deck Editor", starter: false, pro: true, growth: true, enterprise: true },
  { name: "PDF/PPTX Export", starter: false, pro: true, growth: true, enterprise: true },
  { name: "Analytics", starter: false, pro: false, growth: true, enterprise: true },
  { name: "Investor Matching", starter: false, pro: false, growth: true, enterprise: true },
  { name: "A/B Testing", starter: false, pro: false, growth: true, enterprise: true },
  { name: "Pitch Practice", starter: false, pro: false, growth: true, enterprise: true },
  { name: "Custom Domain", starter: false, pro: false, growth: true, enterprise: true },
  { name: "API Access", starter: false, pro: false, growth: false, enterprise: true },
  { name: "Batch Scoring", starter: false, pro: false, growth: false, enterprise: true },
  { name: "Support", starter: "Community", pro: "Email", growth: "Priority", enterprise: "Dedicated" },
];

// ---------------------------------------------------------------------------
// 17. Pipeline activity
// ---------------------------------------------------------------------------

export const mockPipelineActivity: PipelineActivity[] = [
  { id: "pa1", description: "Sarah Chen moved to Meeting stage", timestamp: hoursAgo(2) },
  { id: "pa2", description: "Added Rachel Green to pipeline", timestamp: hoursAgo(8) },
  { id: "pa3", description: "James Wilson moved to Due Diligence", timestamp: daysAgo(1) },
  { id: "pa4", description: "Sent follow-up email to Michael Park", timestamp: daysAgo(2) },
  { id: "pa5", description: "Amy Roberts responded to outreach", timestamp: daysAgo(3) },
];

// ---------------------------------------------------------------------------
// 18. Additional time series
// ---------------------------------------------------------------------------

export const mockAnalytics7d = { dailyViews: generateTimeSeries(7, 12, 35) };
export const mockAnalytics90d = { dailyViews: generateTimeSeries(90, 5, 40) };

// ---------------------------------------------------------------------------
// Combined export
// ---------------------------------------------------------------------------

export const mockDashboardData = {
  stats: mockStats,
  sparklines: mockSparklines,
  decks: mockDecks,
  analytics: mockAnalytics,
  activity: mockActivity,
  investors: mockInvestors,
  fundraise: mockFundraise,
  practice: mockPractice,
  abTests: mockABTests,
  investorContacts: mockInvestorContacts,
  analyticsDetail: mockAnalyticsDetail,
  userProfile: mockUserProfile,
  notificationPrefs: mockNotificationPrefs,
  planInfo: mockPlanInfo,
  invoices: mockInvoices,
  planFeatures: mockPlanFeatures,
  pipelineActivity: mockPipelineActivity,
  analytics7d: mockAnalytics7d,
  analytics90d: mockAnalytics90d,
};
