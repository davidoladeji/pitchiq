/**
 * PIQ Score dimensions — single source of truth for scoring engine + UI.
 * Imported by piq-score.ts and landing/dashboard components.
 */

export interface DimensionDef {
  id: string;
  label: string;
  weight: number; // percentage (sums to 100)
  description: string; // what it measures
  tip: string; // actionable advice
  icon: string; // SVG path (heroicon outline 24x24)
  longDescription: string; // expanded 2-3 sentence explanation
  investorPerspective: string; // what investors specifically look for
  commonMistakes: string[]; // top 3 founder mistakes
  scoreExamples: { excellent: string; average: string; poor: string };
}

export const PIQ_DIMENSIONS: DimensionDef[] = [
  {
    id: "narrative",
    label: "Narrative Structure",
    weight: 15,
    description:
      "Story flow, completeness, and pacing. Logical progression from problem to solution to traction to ask.",
    tip: "Open with a compelling problem that investors can relate to, then build a clear arc to your ask.",
    icon: "M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25",
    longDescription:
      "Narrative structure measures how well your deck tells a cohesive story from problem identification through to your funding ask. VCs read hundreds of decks per month \u2014 the ones that stick follow a logical arc that builds conviction slide by slide. This dimension evaluates slide ordering, information hierarchy, and whether each section naturally leads to the next.",
    investorPerspective:
      "Investors want to understand the problem in the first 30 seconds, see a clear solution, and feel momentum building toward the ask. They penalize decks that jump between topics or bury the lead.",
    commonMistakes: [
      "Starting with the solution before establishing the problem",
      "Placing the team slide too early, breaking narrative momentum",
      "Missing a clear transition from traction to funding rationale",
    ],
    scoreExamples: {
      excellent: "Problem \u2192 Solution \u2192 Market \u2192 Traction \u2192 Business Model \u2192 Team \u2192 Ask, with each slide building on the previous.",
      average: "All required sections present but ordering feels arbitrary. Reader has to mentally re-sequence the story.",
      poor: "Key sections missing or duplicated. No clear arc \u2014 reads like a collection of slides, not a narrative.",
    },
  },
  {
    id: "market",
    label: "Market Sizing",
    weight: 15,
    description:
      "TAM/SAM/SOM clarity, market data quality, and growth potential evidence.",
    tip: "Use a bottoms-up approach: show your SAM as a realistic subset of TAM with credible data sources.",
    icon: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941",
    longDescription:
      "Market sizing evaluates whether you\u2019ve defined a credible, large-enough opportunity. Investors use TAM/SAM/SOM to gauge the ceiling of your business. This dimension checks for realistic estimates, credible data sources, and whether your serviceable market is clearly articulated rather than hand-waved with a top-down \u201C$100B market\u201D claim.",
    investorPerspective:
      "VCs want a bottoms-up SAM calculation showing how many customers you can realistically serve, at what price point, within a defined geography or vertical. They discount top-down TAM numbers from analyst reports.",
    commonMistakes: [
      "Citing only TAM with no SAM/SOM breakdown",
      "Using outdated or uncredited market data",
      "Conflating addressable market with total industry revenue",
    ],
    scoreExamples: {
      excellent: "Bottoms-up SAM with clear methodology: \u201C50K SMBs in NA spending $2K/yr on X = $100M SAM.\u201D Sources cited.",
      average: "TAM and SAM mentioned but derived top-down from analyst reports. No bottoms-up validation.",
      poor: "Single \u201C$50B market\u201D claim with no breakdown, sourcing, or explanation of serviceable segment.",
    },
  },
  {
    id: "differentiation",
    label: "Competitive Differentiation",
    weight: 12,
    description:
      "Unique value proposition, defensibility, and competitive landscape awareness.",
    tip: "Don\u2019t just list competitors \u2014 show your unfair advantage and why it\u2019s hard to replicate.",
    icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
    longDescription:
      "Competitive differentiation assesses whether you clearly articulate why your solution wins over alternatives. This includes direct competitors, adjacent solutions, and the status quo (\u201Cdoing nothing\u201D). VCs need to believe you have a defensible moat \u2014 whether through technology, network effects, data advantages, or regulatory positioning.",
    investorPerspective:
      "Investors specifically look for: (1) awareness that competition exists, (2) a clear articulation of your unfair advantage, and (3) evidence that the advantage is durable, not just a feature gap that incumbents can close.",
    commonMistakes: [
      "Claiming \u201Cno competitors\u201D \u2014 this signals ignorance, not opportunity",
      "Using a feature comparison matrix without explaining why those features matter",
      "Focusing on product features instead of structural advantages (network effects, data, IP)",
    ],
    scoreExamples: {
      excellent: "Named competitors acknowledged, clear moat articulated (e.g., proprietary data from 10K users), and explained why it compounds over time.",
      average: "Competitors listed with a feature grid, but no clear narrative about defensibility or why you win long-term.",
      poor: "No competition slide, or \u201Cwe have no competitors\u201D claim. No moat articulation.",
    },
  },
  {
    id: "financials",
    label: "Financial Clarity",
    weight: 15,
    description:
      "Revenue model, projections, unit economics, and realistic assumptions.",
    tip: "Show unit economics (CAC, LTV, margins) and a clear path to profitability with realistic assumptions.",
    icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
    longDescription:
      "Financial clarity measures how well you present your business model, revenue projections, and unit economics. This is not about having perfect numbers \u2014 it\u2019s about demonstrating financial literacy and realistic planning. Investors want to see that you understand your cost structure, can articulate how you make money, and have projections grounded in defensible assumptions.",
    investorPerspective:
      "VCs focus on unit economics (CAC, LTV, LTV/CAC ratio, payback period), gross margin trajectory, and whether revenue projections are built from realistic growth assumptions rather than hockey-stick fantasies.",
    commonMistakes: [
      "Projecting revenue without explaining the underlying assumptions",
      "Ignoring unit economics entirely \u2014 revenue without margins is meaningless",
      "Showing a hockey-stick graph with no explanation of what drives the inflection",
    ],
    scoreExamples: {
      excellent: "Clear revenue model, CAC/LTV breakdown, gross margins shown, 3-year projections tied to specific growth levers.",
      average: "Revenue projections present but assumptions not clearly stated. Unit economics mentioned but incomplete.",
      poor: "No financial data, or a single revenue projection chart with no supporting assumptions or unit economics.",
    },
  },
  {
    id: "team",
    label: "Team Presentation",
    weight: 10,
    description:
      "Founder credibility, relevant experience, and completeness of the team.",
    tip: "Highlight why YOUR team is uniquely positioned to solve this problem \u2014 domain expertise matters most.",
    icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    longDescription:
      "Team presentation evaluates how effectively you showcase the people behind the company. At pre-seed and seed stages, the team is often the primary investment thesis. This dimension checks for relevant domain expertise, complementary skill sets, notable credentials, and whether you\u2019ve addressed any obvious gaps (e.g., no technical co-founder for a deep-tech startup).",
    investorPerspective:
      "Investors ask: \u201CWhy is this the team to solve this problem?\u201D They look for founder-market fit, prior exits or relevant experience, and complementary skills across the founding team.",
    commonMistakes: [
      "Listing job titles without explaining relevant domain expertise",
      "Including too many advisors to compensate for a thin founding team",
      "Not addressing obvious skill gaps (e.g., no CTO for a technical product)",
    ],
    scoreExamples: {
      excellent: "Founders with clear domain expertise, complementary skills, prior relevant experience. Skill gaps acknowledged with a hiring plan.",
      average: "Team bios present but generic. Hard to see why this specific team is uniquely suited to the problem.",
      poor: "No team slide, or only names and titles with no relevant background information.",
    },
  },
  {
    id: "ask",
    label: "Ask Justification",
    weight: 13,
    description:
      "Funding amount rationale, use of funds breakdown, and milestone alignment.",
    tip: "Tie every dollar to a specific milestone \u2014 show exactly what the raise unlocks.",
    icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
    longDescription:
      "Ask justification evaluates whether your funding request is clearly rationalized. It\u2019s not just about stating an amount \u2014 it\u2019s about connecting every dollar to a milestone that de-risks the business and sets up the next raise. This dimension checks for a clear use-of-funds breakdown, a realistic runway calculation, and alignment between the ask and what it will achieve.",
    investorPerspective:
      "VCs want to know: what milestones will this money hit, how long will the runway last, and what will the company look like when it\u2019s time to raise again? A vague \u201C$2M for growth\u201D is a red flag.",
    commonMistakes: [
      "Stating a round size without a use-of-funds breakdown",
      "Not connecting the raise to specific, measurable milestones",
      "Asking for too much or too little relative to the stage and market",
    ],
    scoreExamples: {
      excellent: "Clear ask with percentage-based use of funds (40% eng, 30% go-to-market, 20% ops, 10% buffer), tied to 18-month milestones.",
      average: "Ask amount stated with a general use of funds slide, but milestones are vague or not tied to specific outcomes.",
      poor: "No ask slide, or just a number with no rationale, breakdown, or milestone alignment.",
    },
  },
  {
    id: "design",
    label: "Design Quality",
    weight: 10,
    description:
      "Visual hierarchy, readability, professional polish, consistent branding, and appropriate whitespace.",
    tip: "Less is more. One key message per slide with clean visuals beats cluttered data dumps.",
    icon: "M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z",
    longDescription:
      "Design quality measures the visual professionalism of your deck. This isn\u2019t about aesthetics for their own sake \u2014 it\u2019s about whether design choices support or hinder communication. Poor design creates cognitive friction that makes investors work harder to extract your message. Good design is invisible: it guides attention, creates hierarchy, and builds trust.",
    investorPerspective:
      "VCs form impressions in seconds. A polished deck signals operational rigor. They look for: consistent typography, adequate whitespace, readable charts, and professional color usage. Cluttered slides suggest cluttered thinking.",
    commonMistakes: [
      "Cramming too much text on a single slide \u2014 if you need to squint, there\u2019s too much",
      "Inconsistent fonts, colors, or layouts across slides",
      "Using clip art, stock photos, or default PowerPoint templates",
    ],
    scoreExamples: {
      excellent: "Consistent design system, clear visual hierarchy, one key message per slide, professional charts and diagrams.",
      average: "Generally clean but inconsistent \u2014 some slides polished, others feel rushed. Minor readability issues.",
      poor: "Default template, wall-of-text slides, inconsistent branding, unreadable charts or graphs.",
    },
  },
  {
    id: "credibility",
    label: "Data Credibility",
    weight: 10,
    description:
      "Traction evidence, validated metrics, social proof, and data-backed claims.",
    tip: "Use real numbers. \u201C340% MoM growth\u201D beats \u201Crapid growth\u201D every time.",
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
    longDescription:
      "Data credibility assesses whether your claims are backed by evidence. Investors are pattern-matching for founders who understand their metrics and can present data honestly. This dimension checks for traction evidence (revenue, users, growth rates), cited sources for market claims, social proof (logos, partnerships, press), and whether numbers are specific rather than vague.",
    investorPerspective:
      "VCs discount vague claims (\u201Cgrowing fast\u201D) and reward specificity (\u201C340% MoM growth, 2.1K MAU, $48K MRR\u201D). They also check for consistency \u2014 do the numbers across slides tell a coherent story?",
    commonMistakes: [
      "Using qualitative language (\u201Crapid growth\u201D) instead of specific metrics",
      "Presenting inflated or cherry-picked numbers that don\u2019t hold up to scrutiny",
      "Making market claims without citing sources or methodology",
    ],
    scoreExamples: {
      excellent: "Specific metrics throughout (MRR, growth rate, CAC, retention), sources cited, logo wall of real customers/partners.",
      average: "Some real numbers but mixed with vague claims. Sources present for some data but not all.",
      poor: "No traction data, or only qualitative claims. Unverifiable numbers with no context or sourcing.",
    },
  },
];

/** Grade scale with color coding */
export const GRADE_SCALE = [
  { grade: "A+", min: 95, max: 100, color: "#22c55e", label: "Exceptional" },
  { grade: "A", min: 90, max: 94, color: "#22c55e", label: "Exceptional" },
  { grade: "A-", min: 85, max: 89, color: "#4ade80", label: "Excellent" },
  { grade: "B+", min: 80, max: 84, color: "#4361ee", label: "Strong" },
  { grade: "B", min: 75, max: 79, color: "#4361ee", label: "Good" },
  { grade: "B-", min: 70, max: 74, color: "#60a5fa", label: "Above Average" },
  { grade: "C+", min: 65, max: 69, color: "#f59e0b", label: "Average" },
  { grade: "C", min: 60, max: 64, color: "#f59e0b", label: "Average" },
  { grade: "C-", min: 55, max: 59, color: "#fb923c", label: "Below Average" },
  { grade: "D+", min: 50, max: 54, color: "#ef4444", label: "Weak" },
  { grade: "D", min: 45, max: 49, color: "#ef4444", label: "Poor" },
  { grade: "F", min: 0, max: 44, color: "#dc2626", label: "Needs Rework" },
];

/** PIQ Score benchmarks by startup stage */
export const PIQ_BENCHMARKS = [
  { label: "Top YC Companies", score: 84, grade: "B+", color: "#22c55e" },
  { label: "Average Seed Startup", score: 67, grade: "C+", color: "#4361ee" },
  { label: "Average Pre-seed Startup", score: 52, grade: "D+", color: "#f59e0b" },
  { label: "First-time Founder (no feedback)", score: 41, grade: "D", color: "#ef4444" },
];

/** Scoring guidelines text for display */
export const SCORING_GUIDELINES = [
  { range: "90\u2013100", label: "Exceptional", description: "Investor-ready, compelling on all dimensions" },
  { range: "75\u201389", label: "Strong", description: "Minor improvements needed, fundable deck" },
  { range: "60\u201374", label: "Average", description: "Significant gaps that need addressing" },
  { range: "40\u201359", label: "Below Average", description: "Major issues, substantial rework required" },
  { range: "0\u201339", label: "Poor", description: "Fundamental rework needed across the board" },
];
