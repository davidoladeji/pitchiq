import { DeckInput, SlideData } from "@/lib/types";

export interface DeckTemplate {
  id: string;
  name: string;
  description: string;
  industry: string;
  icon: string; // SVG path
  color: string; // Tailwind text color
  bg: string; // Tailwind bg color
  /** Pre-filled DeckInput defaults */
  defaults: Partial<DeckInput>;
  /** Pre-built slides for preview */
  slides: SlideData[];
}

export const TEMPLATES: DeckTemplate[] = [
  {
    id: "saas",
    name: "SaaS Startup",
    description: "B2B SaaS with recurring revenue model, product-led growth, and enterprise expansion.",
    industry: "SaaS / Software",
    icon: "M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z",
    color: "text-electric",
    bg: "bg-electric/5",
    defaults: {
      industry: "SaaS / Software",
      stage: "Series A",
      fundingTarget: "$5M",
      investorType: "vc",
      problem: "Enterprises waste 20+ hours/week on manual workflows that should be automated",
      solution: "AI-powered workflow automation platform that reduces manual work by 80%",
      keyMetrics: "$1.2M ARR, 150% NRR, 200 customers, 15% MoM growth",
      teamInfo: "Former AWS engineers, 2x founders, domain experts with 15+ years in enterprise software",
    },
    slides: [
      { title: "{{companyName}}", subtitle: "AI-Powered Workflow Automation", content: ["Series A · $5M Raise", "Transforming enterprise productivity"], type: "title" },
      { title: "The Problem", subtitle: "", content: ["Enterprises waste 20+ hours per week on repetitive manual workflows", "Legacy tools are fragmented and require constant maintenance", "$4.7T lost annually in productivity across knowledge workers"], type: "content" },
      { title: "Our Solution", subtitle: "", content: ["AI-powered platform that automates complex workflows in minutes", "No-code builder for non-technical teams", "Integrates with 200+ enterprise tools out of the box"], type: "content" },
      { title: "Market Opportunity", subtitle: "$47B TAM by 2028", content: ["Workflow automation market growing at 23.4% CAGR", "Enterprise segment is 65% of the market", "Only 15% of enterprises have adopted AI-powered automation"], type: "content" },
      { title: "Traction & Metrics", subtitle: "", content: ["$1.2M ARR with 150% net revenue retention", "200 enterprise customers across 12 industries", "15% month-over-month revenue growth", "NPS score of 72"], type: "metrics" },
      { title: "Business Model", subtitle: "", content: ["Subscription SaaS: $500-$5,000/mo per team", "Land-and-expand: avg deal size grew 3x in 12 months", "85% gross margins with efficient cloud infrastructure"], type: "content" },
      { title: "Go-to-Market", subtitle: "", content: ["Product-led growth with freemium tier driving 40% of conversions", "Inside sales team for enterprise accounts ($50K+ ACV)", "Channel partnerships with Salesforce, ServiceNow, Microsoft"], type: "content" },
      { title: "Competitive Landscape", subtitle: "", content: ["10x faster setup than Zapier Enterprise", "50% lower cost than ServiceNow workflows", "Only platform with native AI-powered decision trees", "Patent-pending workflow intelligence engine"], type: "content" },
      { title: "Team", subtitle: "", content: ["CEO: 2x founder, former AWS Principal Engineer", "CTO: PhD in ML, ex-Google Brain", "VP Sales: Scaled Datadog from $10M to $100M ARR", "15 engineers, 5 from FAANG companies"], type: "team" },
      { title: "The Ask", subtitle: "$5M Series A", content: ["40% — Engineering & AI R&D", "30% — Sales & GTM expansion", "20% — Customer success", "10% — Operations"], type: "content" },
    ],
  },
  {
    id: "biotech",
    name: "Biotech / Life Sciences",
    description: "Drug discovery or medical device startup with clinical pipeline and regulatory pathway.",
    industry: "Biotech / Healthcare",
    icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5",
    color: "text-teal-600",
    bg: "bg-teal-50",
    defaults: {
      industry: "Biotech / Life Sciences",
      stage: "Series A",
      fundingTarget: "$15M",
      investorType: "vc",
      problem: "Rare disease patients lack effective treatments due to failed drug discovery pipelines",
      solution: "AI-driven drug discovery platform that identifies novel therapeutic targets 5x faster",
      keyMetrics: "2 candidates in Phase 1, 12 preclinical programs, 3 pharma partnerships",
      teamInfo: "Former Pfizer VP, MIT biology PhD, 2 FDA-approved drugs in team's track record",
    },
    slides: [
      { title: "{{companyName}}", subtitle: "AI-Powered Drug Discovery", content: ["Series A · $15M Raise", "Accelerating treatments for rare diseases"], type: "title" },
      { title: "The Unmet Need", subtitle: "", content: ["7,000+ rare diseases affect 400M people globally", "95% have no FDA-approved treatment", "Traditional drug discovery takes 12-15 years and $2.6B per drug"], type: "content" },
      { title: "Our Platform", subtitle: "", content: ["Proprietary AI models trained on 50M+ molecular interactions", "Identifies novel therapeutic targets in weeks, not years", "Validated across 3 disease areas with pharma partners"], type: "content" },
      { title: "Clinical Pipeline", subtitle: "", content: ["Lead candidate BIO-101: Phase 1 for rare neurological disease (n=45)", "BIO-201: IND-enabling studies for metabolic disorder", "12 preclinical programs across rare disease portfolio"], type: "content" },
      { title: "Market & IP", subtitle: "", content: ["Orphan drug market: $209B by 2028 (11.3% CAGR)", "6 patents granted, 8 pending", "Orphan drug designation provides 7-year market exclusivity"], type: "content" },
      { title: "Partnerships", subtitle: "", content: ["Roche: $20M+ deal for 3 target discovery programs", "NIH: $3.2M grant for rare disease research", "Academic collaborations with Johns Hopkins and MIT"], type: "content" },
      { title: "Team", subtitle: "", content: ["CEO: Former Pfizer VP, 2 FDA-approved drugs", "CSO: MIT PhD, 50+ published papers in drug discovery", "CMO: 15 years clinical development, rare disease specialist"], type: "team" },
      { title: "Financials & Ask", subtitle: "$15M Series A", content: ["50% — Clinical trials (Phase 1/2)", "25% — Platform R&D", "15% — Team expansion", "10% — Regulatory & operations"], type: "content" },
    ],
  },
  {
    id: "marketplace",
    name: "Marketplace",
    description: "Two-sided marketplace connecting buyers and sellers with network effects.",
    industry: "Marketplace / E-Commerce",
    icon: "M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z",
    color: "text-orange-600",
    bg: "bg-orange-50",
    defaults: {
      industry: "Marketplace",
      stage: "Seed",
      fundingTarget: "$3M",
      investorType: "vc",
      problem: "Small businesses struggle to find and hire specialized contractors for niche projects",
      solution: "AI-matched marketplace connecting businesses with vetted specialist contractors",
      keyMetrics: "$2M GMV, 5,000 active contractors, 85% match success rate, 40% MoM growth",
      teamInfo: "Ex-Uber marketplace PM, Stanford CS, previously scaled marketplace to $50M GMV",
    },
    slides: [
      { title: "{{companyName}}", subtitle: "Where Businesses Find Expert Contractors", content: ["Seed Round · $3M Raise", "AI-powered specialist marketplace"], type: "title" },
      { title: "The Problem", subtitle: "", content: ["Small businesses spend 15+ hours finding qualified contractors", "78% of businesses report poor contractor matches from existing platforms", "No platform specializes in verified niche expertise"], type: "content" },
      { title: "Our Solution", subtitle: "", content: ["AI matching engine that pairs businesses with pre-vetted specialists", "Skills verification through real project assessments", "Managed payments with milestone-based escrow"], type: "content" },
      { title: "Traction", subtitle: "", content: ["$2M annualized GMV (40% MoM growth)", "5,000 active contractors across 150 specialties", "85% first-match success rate (industry avg: 35%)", "4.8/5 average rating from 2,000+ completed projects"], type: "metrics" },
      { title: "Unit Economics", subtitle: "", content: ["15% take rate on transactions", "LTV:CAC ratio of 4.5x", "Average project size: $3,500", "65% of businesses return within 60 days"], type: "content" },
      { title: "Market Size", subtitle: "", content: ["$1.5T freelance and contractor market globally", "Specialized services segment: $300B and growing 18% YoY", "Target SMB segment is severely underserved by current platforms"], type: "content" },
      { title: "Team", subtitle: "", content: ["CEO: Ex-Uber marketplace PM, scaled rider-driver matching", "CTO: Stanford CS, built ML systems at LinkedIn", "COO: Previously scaled contractor marketplace to $50M GMV"], type: "team" },
      { title: "The Ask", subtitle: "$3M Seed", content: ["45% — Engineering & AI matching", "30% — Supply acquisition (contractors)", "15% — Demand generation", "10% — Operations"], type: "content" },
    ],
  },
  {
    id: "fintech",
    name: "FinTech",
    description: "Financial technology startup disrupting banking, payments, or lending.",
    industry: "FinTech",
    icon: "M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z",
    color: "text-green-600",
    bg: "bg-green-50",
    defaults: {
      industry: "FinTech",
      stage: "Series A",
      fundingTarget: "$8M",
      investorType: "vc",
      problem: "Small businesses pay 3-5% on payment processing with no transparency or working capital support",
      solution: "Integrated payment and lending platform with transparent pricing and instant revenue-based financing",
      keyMetrics: "$50M TPV, 3,000 merchants, $2M net revenue, 120% NRR",
      teamInfo: "Ex-Stripe and Square engineers, former Goldman Sachs credit risk lead",
    },
    slides: [
      { title: "{{companyName}}", subtitle: "Payments + Capital for Small Business", content: ["Series A · $8M Raise", "The financial operating system for SMBs"], type: "title" },
      { title: "The Problem", subtitle: "", content: ["SMBs pay 3-5% on payment processing with hidden fees", "83% of small businesses are denied traditional bank loans", "No integrated solution for payments, analytics, and working capital"], type: "content" },
      { title: "Our Solution", subtitle: "", content: ["Transparent payment processing at 1.9% flat rate", "AI-powered revenue-based financing using real-time transaction data", "Unified dashboard: payments, analytics, cash flow forecasting"], type: "content" },
      { title: "Traction", subtitle: "", content: ["$50M total payment volume processed", "3,000 active merchants across 25 states", "$2M net revenue run rate", "120% net revenue retention"], type: "metrics" },
      { title: "Business Model", subtitle: "", content: ["Processing revenue: 1.9% per transaction ($950K/yr)", "Lending revenue: 8-15% APR on $10M outstanding ($1.1M/yr)", "SaaS revenue: $49/mo analytics dashboard ($360K/yr)"], type: "content" },
      { title: "Regulatory & Risk", subtitle: "", content: ["Money transmitter licenses in 48 states", "SOC 2 Type II certified", "Default rate: 2.1% (industry avg: 7.5%)", "Partnership with FDIC-insured bank for lending"], type: "content" },
      { title: "Team", subtitle: "", content: ["CEO: Former Stripe engineering lead, built payment rails", "CTO: Ex-Square, built fraud detection serving 10M+ merchants", "CRO: Goldman Sachs credit risk, managed $2B lending portfolio"], type: "team" },
      { title: "The Ask", subtitle: "$8M Series A", content: ["35% — Engineering & compliance", "30% — Lending capital (warehouse facility)", "25% — Sales & merchant acquisition", "10% — Operations"], type: "content" },
    ],
  },
];

export function getTemplate(id: string): DeckTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

/**
 * Apply template defaults with user overrides.
 */
export function applyTemplate(
  template: DeckTemplate,
  overrides: Partial<DeckInput>
): DeckInput {
  return {
    companyName: overrides.companyName || "My Company",
    industry: overrides.industry || template.defaults.industry || "",
    stage: overrides.stage || template.defaults.stage || "",
    fundingTarget: overrides.fundingTarget || template.defaults.fundingTarget || "",
    investorType: overrides.investorType || template.defaults.investorType || "vc",
    problem: overrides.problem || template.defaults.problem || "",
    solution: overrides.solution || template.defaults.solution || "",
    keyMetrics: overrides.keyMetrics || template.defaults.keyMetrics || "",
    teamInfo: overrides.teamInfo || template.defaults.teamInfo || "",
  };
}
