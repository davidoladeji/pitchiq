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
  },
  {
    id: "market",
    label: "Market Sizing",
    weight: 15,
    description:
      "TAM/SAM/SOM clarity, market data quality, and growth potential evidence.",
    tip: "Use a bottoms-up approach: show your SAM as a realistic subset of TAM with credible data sources.",
    icon: "M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941",
  },
  {
    id: "differentiation",
    label: "Competitive Differentiation",
    weight: 12,
    description:
      "Unique value proposition, defensibility, and competitive landscape awareness.",
    tip: "Don\u2019t just list competitors \u2014 show your unfair advantage and why it\u2019s hard to replicate.",
    icon: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z",
  },
  {
    id: "financials",
    label: "Financial Clarity",
    weight: 15,
    description:
      "Revenue model, projections, unit economics, and realistic assumptions.",
    tip: "Show unit economics (CAC, LTV, margins) and a clear path to profitability with realistic assumptions.",
    icon: "M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  {
    id: "team",
    label: "Team Presentation",
    weight: 10,
    description:
      "Founder credibility, relevant experience, and completeness of the team.",
    tip: "Highlight why YOUR team is uniquely positioned to solve this problem \u2014 domain expertise matters most.",
    icon: "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  },
  {
    id: "ask",
    label: "Ask Justification",
    weight: 13,
    description:
      "Funding amount rationale, use of funds breakdown, and milestone alignment.",
    tip: "Tie every dollar to a specific milestone \u2014 show exactly what the raise unlocks.",
    icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
  },
  {
    id: "design",
    label: "Design Quality",
    weight: 10,
    description:
      "Visual hierarchy, readability, professional polish, consistent branding, and appropriate whitespace.",
    tip: "Less is more. One key message per slide with clean visuals beats cluttered data dumps.",
    icon: "M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z",
  },
  {
    id: "credibility",
    label: "Data Credibility",
    weight: 10,
    description:
      "Traction evidence, validated metrics, social proof, and data-backed claims.",
    tip: "Use real numbers. \u201C340% MoM growth\u201D beats \u201Crapid growth\u201D every time.",
    icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
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

/** Scoring guidelines text for display */
export const SCORING_GUIDELINES = [
  { range: "90\u2013100", label: "Exceptional", description: "Investor-ready, compelling on all dimensions" },
  { range: "75\u201389", label: "Strong", description: "Minor improvements needed, fundable deck" },
  { range: "60\u201374", label: "Average", description: "Significant gaps that need addressing" },
  { range: "40\u201359", label: "Below Average", description: "Major issues, substantial rework required" },
  { range: "0\u201339", label: "Poor", description: "Fundamental rework needed across the board" },
];
