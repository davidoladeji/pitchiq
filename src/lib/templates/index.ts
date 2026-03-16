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

/* ------------------------------------------------------------------ */
/*  1. SaaS Startup  (12 slides)                                      */
/* ------------------------------------------------------------------ */
const saasSlides: SlideData[] = [
  {
    title: "{{companyName}}",
    subtitle: "AI-Powered Workflow Automation",
    content: ["Series A · $5M Raise", "Transforming enterprise productivity"],
    type: "title",
    accent: true,
  },
  {
    title: "The Problem",
    subtitle: "20+ hours wasted every week",
    content: [
      "Enterprises waste 20+ hours per week on repetitive manual workflows",
      "Legacy tools are fragmented and require constant maintenance",
      "$4.7T lost annually in productivity across knowledge workers",
    ],
    type: "content",
    layout: "split",
  },
  {
    title: "Our Solution",
    subtitle: "Automate in minutes, not months",
    content: [
      "AI-powered platform that automates complex workflows in minutes",
      "No-code builder for non-technical teams",
      "Integrates with 200+ enterprise tools out of the box",
    ],
    type: "content",
    layout: "two-column",
  },
  {
    title: "Market Opportunity",
    subtitle: "$47B TAM by 2028",
    content: [
      "Workflow automation market growing at 23.4% CAGR",
      "Enterprise segment is 65% of the market",
      "Only 15% of enterprises have adopted AI-powered automation",
    ],
    type: "chart",
    chartData: {
      type: "bar",
      data: [
        { label: "2024", value: 18 },
        { label: "2025", value: 23 },
        { label: "2026", value: 29 },
        { label: "2027", value: 37 },
        { label: "2028", value: 47 },
      ],
      label: "TAM ($B)",
    },
    accent: true,
  },
  {
    title: "Traction & Metrics",
    subtitle: "Strong product-market fit",
    content: [],
    type: "metrics",
    metrics: [
      { label: "ARR", value: "$1.2M", change: "+150%", trend: "up" },
      { label: "Customers", value: "200", change: "+85%", trend: "up" },
      { label: "NRR", value: "150%", change: "+12pts", trend: "up" },
      { label: "MoM Growth", value: "15%", trend: "up" },
    ],
  },
  {
    title: "Business Model",
    subtitle: "Land-and-expand SaaS",
    content: [
      "Subscription SaaS: $500–$5,000/mo per team",
      "Land-and-expand: avg deal size grew 3x in 12 months",
      "85% gross margins with efficient cloud infrastructure",
    ],
    type: "content",
    layout: "centered",
  },
  {
    title: "Go-to-Market",
    subtitle: "Product-led + enterprise sales",
    content: [
      "Freemium tier drives 40% of conversions",
      "Inside sales team for enterprise accounts ($50K+ ACV)",
      "Channel partnerships with Salesforce, ServiceNow, Microsoft",
    ],
    type: "content",
    layout: "default",
  },
  {
    title: "Competitive Landscape",
    subtitle: "Why we win",
    content: [
      "10x faster setup than Zapier Enterprise",
      "50% lower cost than ServiceNow workflows",
      "Only platform with native AI-powered decision trees",
      "Patent-pending workflow intelligence engine",
    ],
    type: "comparison",
    accent: true,
  },
  {
    title: "World-Class Team",
    subtitle: "Built to scale enterprise software",
    content: [],
    type: "team",
    team: [
      { name: "Sarah Chen", role: "CEO", bio: "2x founder, former AWS Principal Engineer" },
      { name: "Dr. James Okafor", role: "CTO", bio: "PhD in ML, ex-Google Brain" },
      { name: "Lisa Hartman", role: "VP Sales", bio: "Scaled Datadog from $10M to $100M ARR" },
    ],
  },
  {
    title: "Roadmap",
    subtitle: "Key milestones ahead",
    content: [],
    type: "timeline",
    timeline: [
      { date: "Q1 2026", title: "Series A close", description: "Close $5M round, expand engineering team", completed: true },
      { date: "Q2 2026", title: "Enterprise launch", description: "SOC 2 Type II, SSO, advanced RBAC" },
      { date: "Q4 2026", title: "AI Copilot v2", description: "Natural-language workflow builder" },
      { date: "Q2 2027", title: "International expansion", description: "EU and APAC launch" },
    ],
  },
  {
    title: "The Ask",
    subtitle: "$5M Series A",
    content: [
      "40% — Engineering & AI R&D",
      "30% — Sales & GTM expansion",
      "20% — Customer success",
      "10% — Operations",
    ],
    type: "content",
    layout: "stat-highlight",
    accent: true,
  },
  {
    title: "Let's Build the Future of Work",
    subtitle: "{{companyName}}",
    content: [
      "sarah@company.com · (415) 555-0120",
      "www.company.com",
    ],
    type: "cta",
  },
];

/* ------------------------------------------------------------------ */
/*  2. Biotech / Life Sciences  (10 slides)                            */
/* ------------------------------------------------------------------ */
const biotechSlides: SlideData[] = [
  {
    title: "{{companyName}}",
    subtitle: "AI-Powered Drug Discovery",
    content: ["Series A · $15M Raise", "Accelerating treatments for rare diseases"],
    type: "title",
    accent: true,
  },
  {
    title: "The Unmet Need",
    subtitle: "400M patients, almost no treatments",
    content: [
      "7,000+ rare diseases affect 400M people globally",
      "95% have no FDA-approved treatment",
      "Traditional drug discovery takes 12–15 years and $2.6B per drug",
    ],
    type: "content",
    layout: "split",
  },
  {
    title: "Our Platform",
    subtitle: "From years to weeks",
    content: [
      "Proprietary AI models trained on 50M+ molecular interactions",
      "Identifies novel therapeutic targets in weeks, not years",
      "Validated across 3 disease areas with pharma partners",
    ],
    type: "content",
    layout: "default",
  },
  {
    title: "Clinical Pipeline",
    subtitle: "Multi-stage development",
    content: [],
    type: "timeline",
    timeline: [
      { date: "Phase 1", title: "BIO-101", description: "Rare neurological disease (n=45)", completed: true },
      { date: "IND-enabling", title: "BIO-201", description: "Metabolic disorder candidate" },
      { date: "Preclinical", title: "12 Programs", description: "Broad rare disease portfolio" },
      { date: "Discovery", title: "Next-gen targets", description: "3 new AI-identified targets entering validation" },
    ],
  },
  {
    title: "Market Opportunity",
    subtitle: "Orphan drug market: $209B by 2028",
    content: [
      "11.3% CAGR in orphan drug segment",
      "7-year market exclusivity via orphan drug designation",
      "6 patents granted, 8 pending",
    ],
    type: "chart",
    chartData: {
      type: "bar",
      data: [
        { label: "2024", value: 140 },
        { label: "2025", value: 158 },
        { label: "2026", value: 175 },
        { label: "2027", value: 192 },
        { label: "2028", value: 209 },
      ],
      label: "Orphan Drug Market ($B)",
    },
    accent: true,
  },
  {
    title: "Key Results",
    subtitle: "Data that de-risks the program",
    content: [],
    type: "metrics",
    metrics: [
      { label: "Hit Rate", value: "12x", change: "vs. industry avg", trend: "up" },
      { label: "Phase 1 Response", value: "68%", change: "+23pts", trend: "up" },
      { label: "Pharma Deals", value: "$20M+", trend: "up" },
      { label: "Time to IND", value: "18 mo", change: "−36 mo", trend: "up" },
    ],
  },
  {
    title: "Regulatory & IP Strategy",
    subtitle: "Clear path to approval",
    content: [
      "Orphan drug designation for BIO-101 secured",
      "Breakthrough Therapy Designation application filed",
      "6 composition-of-matter patents with 15+ year runway",
      "FDA pre-IND meeting completed for BIO-201",
    ],
    type: "content",
    layout: "two-column",
  },
  {
    title: "Leadership Team",
    subtitle: "Deep biotech experience",
    content: [],
    type: "team",
    team: [
      { name: "Dr. Maria Santos", role: "CEO", bio: "Former Pfizer VP, 2 FDA-approved drugs" },
      { name: "Dr. Kevin Li", role: "CSO", bio: "MIT PhD, 50+ published papers in drug discovery" },
      { name: "Dr. Rachel Green", role: "CMO", bio: "15 years clinical development, rare disease specialist" },
    ],
  },
  {
    title: "The Ask",
    subtitle: "$15M Series A",
    content: [
      "50% — Clinical trials (Phase 1/2)",
      "25% — Platform R&D",
      "15% — Team expansion",
      "10% — Regulatory & operations",
    ],
    type: "content",
    layout: "stat-highlight",
    accent: true,
  },
  {
    title: "Transforming Rare Disease Treatment",
    subtitle: "{{companyName}}",
    content: [
      "maria@company.com · (617) 555-0130",
      "www.company.com",
    ],
    type: "cta",
  },
];

/* ------------------------------------------------------------------ */
/*  3. Marketplace  (11 slides)                                        */
/* ------------------------------------------------------------------ */
const marketplaceSlides: SlideData[] = [
  {
    title: "{{companyName}}",
    subtitle: "Where Businesses Find Expert Contractors",
    content: ["Seed Round · $3M Raise", "AI-powered specialist marketplace"],
    type: "title",
    accent: true,
  },
  {
    title: "The Problem",
    subtitle: "Broken contractor discovery",
    content: [
      "Small businesses spend 15+ hours finding qualified contractors",
      "78% of businesses report poor matches from existing platforms",
      "No platform specializes in verified niche expertise",
    ],
    type: "content",
    layout: "split",
  },
  {
    title: "Our Solution",
    subtitle: "Matched in minutes, not weeks",
    content: [
      "AI matching engine that pairs businesses with pre-vetted specialists",
      "Skills verification through real project assessments",
      "Managed payments with milestone-based escrow",
    ],
    type: "content",
    layout: "centered",
  },
  {
    title: "Key Metrics",
    subtitle: "Marketplace momentum",
    content: [],
    type: "metrics",
    metrics: [
      { label: "GMV (ann.)", value: "$2M", change: "+40% MoM", trend: "up" },
      { label: "Active Contractors", value: "5,000", change: "+120%", trend: "up" },
      { label: "Match Rate", value: "85%", change: "vs 35% avg", trend: "up" },
      { label: "NPS", value: "72", trend: "up" },
    ],
    accent: true,
  },
  {
    title: "Growth Trajectory",
    subtitle: "Compounding network effects",
    content: [
      "Liquidity flywheel: more supply → better matches → more demand",
      "Organic growth now accounts for 55% of new signups",
    ],
    type: "chart",
    chartData: {
      type: "line",
      data: [
        { label: "Jan", value: 80 },
        { label: "Mar", value: 150 },
        { label: "May", value: 290 },
        { label: "Jul", value: 520 },
        { label: "Sep", value: 920 },
        { label: "Nov", value: 1600 },
      ],
      label: "Monthly GMV ($K)",
    },
  },
  {
    title: "Business Model",
    subtitle: "Multiple revenue streams",
    content: [
      "15% take rate on transactions",
      "LTV:CAC ratio of 4.5x",
      "Average project size: $3,500",
      "65% of businesses return within 60 days",
    ],
    type: "content",
    layout: "two-column",
  },
  {
    title: "Competitive Advantage",
    subtitle: "Why we win",
    content: [
      "AI-verified skills vs. self-reported profiles",
      "85% match rate vs. industry average 35%",
      "Milestone-based escrow protects both sides",
      "Domain-specific matching (not one-size-fits-all)",
    ],
    type: "comparison",
  },
  {
    title: "Milestones & Roadmap",
    subtitle: "Proven execution",
    content: [],
    type: "timeline",
    timeline: [
      { date: "Q3 2025", title: "Marketplace launch", description: "First 500 contractors onboarded", completed: true },
      { date: "Q1 2026", title: "$2M GMV milestone", description: "85% match rate achieved", completed: true },
      { date: "Q3 2026", title: "Enterprise tier", description: "Managed staffing for mid-market companies" },
      { date: "Q1 2027", title: "International", description: "UK and Canada expansion" },
    ],
    accent: true,
  },
  {
    title: "The Team",
    subtitle: "Marketplace DNA",
    content: [],
    type: "team",
    team: [
      { name: "Alex Rivera", role: "CEO", bio: "Ex-Uber marketplace PM, scaled rider-driver matching" },
      { name: "Priya Sharma", role: "CTO", bio: "Stanford CS, built ML systems at LinkedIn" },
      { name: "Marcus Johnson", role: "COO", bio: "Previously scaled contractor marketplace to $50M GMV" },
    ],
  },
  {
    title: "The Ask",
    subtitle: "$3M Seed Round",
    content: [
      "45% — Engineering & AI matching",
      "30% — Supply acquisition (contractors)",
      "15% — Demand generation",
      "10% — Operations",
    ],
    type: "content",
    layout: "stat-highlight",
    accent: true,
  },
  {
    title: "Join the Future of Work",
    subtitle: "{{companyName}}",
    content: [
      "alex@company.com · (650) 555-0140",
      "www.company.com",
    ],
    type: "cta",
  },
];

/* ------------------------------------------------------------------ */
/*  4. FinTech  (11 slides)                                            */
/* ------------------------------------------------------------------ */
const fintechSlides: SlideData[] = [
  {
    title: "{{companyName}}",
    subtitle: "Payments + Capital for Small Business",
    content: ["Series A · $8M Raise", "The financial operating system for SMBs"],
    type: "title",
    accent: true,
  },
  {
    title: "The Problem",
    subtitle: "Broken SMB financial stack",
    content: [
      "SMBs pay 3–5% on payment processing with hidden fees",
      "83% of small businesses are denied traditional bank loans",
      "No integrated solution for payments, analytics, and working capital",
    ],
    type: "content",
    layout: "default",
  },
  {
    title: "Our Solution",
    subtitle: "One platform, total clarity",
    content: [
      "Transparent payment processing at 1.9% flat rate",
      "AI-powered revenue-based financing using real-time transaction data",
      "Unified dashboard: payments, analytics, cash flow forecasting",
    ],
    type: "content",
    layout: "split",
  },
  {
    title: "TPV Growth",
    subtitle: "Rapid merchant adoption",
    content: [
      "Total payment volume growing 25% month-over-month",
      "Expansion into new verticals: restaurants, retail, services",
    ],
    type: "chart",
    chartData: {
      type: "area",
      data: [
        { label: "Q1 '25", value: 8 },
        { label: "Q2 '25", value: 14 },
        { label: "Q3 '25", value: 24 },
        { label: "Q4 '25", value: 38 },
        { label: "Q1 '26", value: 50 },
      ],
      label: "TPV ($M)",
    },
    accent: true,
  },
  {
    title: "Unit Economics",
    subtitle: "Efficient, diversified revenue",
    content: [],
    type: "metrics",
    metrics: [
      { label: "Net Revenue", value: "$2M", change: "+180%", trend: "up" },
      { label: "NRR", value: "120%", change: "+8pts", trend: "up" },
      { label: "LTV:CAC", value: "5.2x", trend: "up" },
      { label: "Default Rate", value: "2.1%", change: "vs 7.5% avg", trend: "up" },
    ],
  },
  {
    title: "Regulatory & Compliance",
    subtitle: "Built for trust",
    content: [
      "Money transmitter licenses in 48 states",
      "SOC 2 Type II certified",
      "Default rate: 2.1% (industry avg: 7.5%)",
      "Partnership with FDIC-insured bank for lending",
    ],
    type: "content",
    layout: "two-column",
  },
  {
    title: "Why Not a Bank?",
    subtitle: "Head-to-head comparison",
    content: [
      "Approval in 24 hours vs. 6–8 weeks at a bank",
      "1.9% flat vs. 3–5% + hidden fees",
      "Real-time analytics vs. monthly PDF statements",
      "Revenue-based repayment vs. rigid loan schedules",
    ],
    type: "comparison",
    accent: true,
  },
  {
    title: "Regulatory Milestones",
    subtitle: "Building moat through compliance",
    content: [],
    type: "timeline",
    timeline: [
      { date: "Q2 2025", title: "48-state MTL", description: "Money transmitter licenses secured", completed: true },
      { date: "Q3 2025", title: "SOC 2 Type II", description: "Audit completed", completed: true },
      { date: "Q2 2026", title: "Banking charter", description: "OCC special-purpose charter application" },
      { date: "Q4 2026", title: "International", description: "EU PSD2 compliance for cross-border" },
    ],
  },
  {
    title: "The Team",
    subtitle: "Payments and risk veterans",
    content: [],
    type: "team",
    team: [
      { name: "David Kim", role: "CEO", bio: "Former Stripe engineering lead, built payment rails" },
      { name: "Nina Patel", role: "CTO", bio: "Ex-Square, built fraud detection for 10M+ merchants" },
      { name: "Robert Marsh", role: "CRO", bio: "Goldman Sachs credit risk, managed $2B lending portfolio" },
    ],
  },
  {
    title: "The Ask",
    subtitle: "$8M Series A",
    content: [
      "35% — Engineering & compliance",
      "30% — Lending capital (warehouse facility)",
      "25% — Sales & merchant acquisition",
      "10% — Operations",
    ],
    type: "content",
    layout: "stat-highlight",
    accent: true,
  },
  {
    title: "Banking, Reimagined for SMBs",
    subtitle: "{{companyName}}",
    content: [
      "david@company.com · (212) 555-0150",
      "www.company.com",
    ],
    type: "cta",
  },
];

/* ------------------------------------------------------------------ */
/*  5. Healthcare / MedTech  (9 slides)                                */
/* ------------------------------------------------------------------ */
const healthcareSlides: SlideData[] = [
  {
    title: "{{companyName}}",
    subtitle: "Intelligent Remote Patient Monitoring",
    content: ["Series A · $10M Raise", "Better outcomes, lower costs"],
    type: "title",
    accent: true,
  },
  {
    title: "The Crisis",
    subtitle: "Chronic disease is overwhelming healthcare",
    content: [
      "6 in 10 US adults have a chronic disease — costing $4.1T annually",
      "Hospital readmission rates sit at 15–20% within 30 days",
      "Rural and underserved populations lack access to specialist care",
    ],
    type: "content",
    layout: "split",
  },
  {
    title: "Our Platform",
    subtitle: "Continuous AI-powered care, anywhere",
    content: [
      "FDA-cleared wearable sensors stream vitals in real time",
      "AI risk engine predicts adverse events 48 hours in advance",
      "Integrated telehealth for instant clinician intervention",
    ],
    type: "content",
    layout: "centered",
  },
  {
    title: "Regulatory Pathway",
    subtitle: "De-risked through milestones",
    content: [],
    type: "timeline",
    timeline: [
      { date: "Q1 2025", title: "510(k) cleared", description: "Wearable sensor for cardiac monitoring", completed: true },
      { date: "Q3 2025", title: "Pilot success", description: "3 health systems, 2,000 patients", completed: true },
      { date: "Q2 2026", title: "De Novo submission", description: "AI risk-prediction algorithm" },
      { date: "Q4 2026", title: "CMS reimbursement", description: "RPM billing codes secured" },
    ],
    accent: true,
  },
  {
    title: "Clinical Evidence",
    subtitle: "Outcomes that matter",
    content: [],
    type: "metrics",
    metrics: [
      { label: "Readmission Reduction", value: "42%", change: "vs control", trend: "up" },
      { label: "Patients Monitored", value: "2,000+", change: "+300%", trend: "up" },
      { label: "Avg Cost Savings", value: "$8,400", change: "per patient/yr", trend: "up" },
      { label: "Clinician NPS", value: "81", trend: "up" },
    ],
  },
  {
    title: "Market Opportunity",
    subtitle: "RPM market: $117B by 2028",
    content: [
      "Remote patient monitoring growing at 25.6% CAGR",
      "CMS expanded RPM reimbursement codes in 2024",
      "Hospital systems actively seeking outsourced RPM solutions",
    ],
    type: "chart",
    chartData: {
      type: "bar",
      data: [
        { label: "2024", value: 45 },
        { label: "2025", value: 58 },
        { label: "2026", value: 75 },
        { label: "2027", value: 95 },
        { label: "2028", value: 117 },
      ],
      label: "RPM Market ($B)",
    },
  },
  {
    title: "Leadership Team",
    subtitle: "MedTech veterans",
    content: [],
    type: "team",
    team: [
      { name: "Dr. Amira Hassan", role: "CEO", bio: "Former Medtronic VP, 3 FDA-cleared devices" },
      { name: "Tom Reeves", role: "CTO", bio: "Ex-Apple Health, built HealthKit integrations" },
      { name: "Dr. Lydia Park", role: "CMO", bio: "Cardiologist, led remote monitoring at Mayo Clinic" },
    ],
  },
  {
    title: "The Ask",
    subtitle: "$10M Series A",
    content: [
      "40% — Clinical trials & regulatory",
      "25% — Engineering & AI R&D",
      "20% — Sales & health system partnerships",
      "15% — Manufacturing scale-up",
    ],
    type: "content",
    layout: "stat-highlight",
    accent: true,
  },
  {
    title: "Better Care, Everywhere",
    subtitle: "{{companyName}}",
    content: [
      "amira@company.com · (312) 555-0160",
      "www.company.com",
    ],
    type: "cta",
  },
];

/* ------------------------------------------------------------------ */
/*  6. EdTech / Education  (10 slides)                                 */
/* ------------------------------------------------------------------ */
const edtechSlides: SlideData[] = [
  {
    title: "{{companyName}}",
    subtitle: "Adaptive Learning for Every Student",
    content: ["Series A · $6M Raise", "Personalized education at scale"],
    type: "title",
    accent: true,
  },
  {
    title: "The Learning Gap",
    subtitle: "One-size-fits-all is failing students",
    content: [
      "65% of students are not proficient in reading by 4th grade",
      "Teachers manage 25–35 students with vastly different learning needs",
      "Existing edtech tools focus on content delivery, not comprehension",
    ],
    type: "content",
    layout: "two-column",
  },
  {
    title: "Our Solution",
    subtitle: "AI tutor that adapts in real time",
    content: [
      "Proprietary adaptive engine adjusts difficulty, pace, and modality per student",
      "Real-time teacher dashboard with intervention alerts",
      "Curriculum-aligned content for K–12 math and reading",
    ],
    type: "content",
    layout: "split",
  },
  {
    title: "Market Segments",
    subtitle: "K–12 EdTech: $85B by 2027",
    content: [
      "Largest segment: supplemental learning tools (38%)",
      "Fastest-growing: AI-powered adaptive platforms (32% CAGR)",
    ],
    type: "chart",
    chartData: {
      type: "pie",
      data: [
        { label: "Supplemental Learning", value: 38 },
        { label: "LMS / Admin", value: 24 },
        { label: "Assessment", value: 18 },
        { label: "Adaptive AI", value: 12 },
        { label: "Other", value: 8 },
      ],
      label: "K–12 EdTech Market Share",
    },
  },
  {
    title: "Why Us vs. Alternatives",
    subtitle: "Head-to-head comparison",
    content: [
      "Real-time adaptation vs. static content libraries",
      "Teacher co-pilot vs. teacher-replacement approach",
      "Evidence-based pedagogy vs. gamification-first",
      "District-level analytics vs. per-student only",
    ],
    type: "comparison",
    accent: true,
  },
  {
    title: "Engagement & Outcomes",
    subtitle: "Data from 120 classrooms",
    content: [],
    type: "metrics",
    metrics: [
      { label: "Test Score Lift", value: "+23%", change: "vs control group", trend: "up" },
      { label: "Daily Active Students", value: "45K", change: "+210%", trend: "up" },
      { label: "Teacher Retention", value: "94%", change: "YoY renewal", trend: "up" },
      { label: "Avg Session Time", value: "28 min", change: "+40%", trend: "up" },
    ],
  },
  {
    title: "Business Model",
    subtitle: "SaaS + content licensing",
    content: [
      "Per-student subscription: $8/student/month (district pricing)",
      "Content licensing to publishers and tutoring companies",
      "Average district contract: $120K/year, 3-year terms",
      "90% gross margins on software, 70% blended",
    ],
    type: "content",
    layout: "centered",
  },
  {
    title: "Our Team",
    subtitle: "Educators and engineers",
    content: [],
    type: "team",
    team: [
      { name: "Michelle Torres", role: "CEO", bio: "Former Teach For America, led product at Khan Academy" },
      { name: "Raj Mehta", role: "CTO", bio: "Ex-Duolingo, built adaptive learning algorithms" },
      { name: "Dr. Karen Whitfield", role: "Chief Learning Officer", bio: "20 years in curriculum design, former state DOE advisor" },
    ],
  },
  {
    title: "The Ask",
    subtitle: "$6M Series A",
    content: [
      "40% — Product & content development",
      "30% — Sales & district partnerships",
      "20% — Efficacy research & evidence",
      "10% — Operations",
    ],
    type: "content",
    layout: "stat-highlight",
    accent: true,
  },
  {
    title: "Every Student Deserves a Great Tutor",
    subtitle: "{{companyName}}",
    content: [
      "michelle@company.com · (510) 555-0170",
      "www.company.com",
    ],
    type: "cta",
  },
];

/* ------------------------------------------------------------------ */
/*  7. Climate / CleanTech  (11 slides)                                */
/* ------------------------------------------------------------------ */
const climateSlides: SlideData[] = [
  {
    title: "{{companyName}}",
    subtitle: "Next-Generation Carbon Capture",
    content: ["Series A · $12M Raise", "Scalable carbon removal for a net-zero world"],
    type: "title",
    accent: true,
  },
  {
    title: "The Climate Crisis",
    subtitle: "We need to remove 10 Gt CO₂/year by 2050",
    content: [
      "Global CO₂ emissions hit 37.4 Gt in 2025 — still rising",
      "Current carbon capture capacity: < 0.01 Gt/year",
      "Existing direct air capture costs $400–$600 per ton — too expensive to scale",
    ],
    type: "content",
    layout: "split",
  },
  {
    title: "Our Technology",
    subtitle: "Electrochemical capture at 1/3 the cost",
    content: [
      "Novel electrochemical sorbent reduces energy use by 65%",
      "Modular units deployable at industrial sites or standalone",
      "Captured CO₂ sold for concrete curing, SAF, and permanent storage",
    ],
    type: "content",
    layout: "default",
  },
  {
    title: "Impact at Scale",
    subtitle: "Measurable environmental outcomes",
    content: [
      "Each unit removes 500 tons CO₂/year",
      "Pilot plant operating since Q2 2025",
      "3 offtake agreements signed for captured CO₂",
    ],
    type: "stats",
  },
  {
    title: "Market Growth",
    subtitle: "Carbon removal: $135B by 2030",
    content: [
      "Compliance markets expanding as regulations tighten",
      "Voluntary carbon credit prices expected to 5x by 2030",
    ],
    type: "chart",
    chartData: {
      type: "area",
      data: [
        { label: "2024", value: 12 },
        { label: "2025", value: 22 },
        { label: "2026", value: 38 },
        { label: "2027", value: 62 },
        { label: "2028", value: 90 },
        { label: "2030", value: 135 },
      ],
      label: "Carbon Removal Market ($B)",
    },
    accent: true,
  },
  {
    title: "Unit Economics",
    subtitle: "Path to $100/ton",
    content: [],
    type: "metrics",
    metrics: [
      { label: "Current Cost", value: "$185/ton", change: "−60% vs DAC", trend: "up" },
      { label: "Target Cost", value: "$100/ton", change: "by 2028" },
      { label: "Revenue/Unit", value: "$240K/yr", trend: "up" },
      { label: "Gross Margin", value: "55%", change: "at scale", trend: "up" },
    ],
  },
  {
    title: "Go-to-Market",
    subtitle: "Dual revenue model",
    content: [
      "Hardware sales: modular carbon capture units to industrial buyers",
      "Carbon credits: sell verified removal credits on registries",
      "Offtake contracts: captured CO₂ sold to concrete and SAF producers",
      "Government incentives: 45Q tax credits ($180/ton for DAC)",
    ],
    type: "content",
    layout: "two-column",
  },
  {
    title: "Milestones & Roadmap",
    subtitle: "From pilot to commercial scale",
    content: [],
    type: "timeline",
    timeline: [
      { date: "Q2 2025", title: "Pilot operational", description: "500 ton/yr unit validated", completed: true },
      { date: "Q4 2025", title: "First offtake deals", description: "3 contracts worth $2.4M", completed: true },
      { date: "Q3 2026", title: "Commercial unit v1", description: "5,000 ton/yr modular system" },
      { date: "Q2 2027", title: "First deployment site", description: "50,000 ton/yr facility" },
    ],
  },
  {
    title: "The Team",
    subtitle: "Deep climate-tech expertise",
    content: [],
    type: "team",
    team: [
      { name: "Dr. Elena Vasquez", role: "CEO", bio: "Former CTO at Carbon Engineering, PhD in chemical engineering" },
      { name: "James Okonkwo", role: "CTO", bio: "15 years in electrochemistry, 12 patents in carbon capture" },
      { name: "Samantha Lee", role: "VP Business", bio: "Scaled Climeworks partnerships from $5M to $80M" },
    ],
  },
  {
    title: "The Ask",
    subtitle: "$12M Series A",
    content: [
      "45% — Commercial unit engineering & manufacturing",
      "25% — Pilot expansion & site development",
      "20% — Team & operations",
      "10% — Regulatory & certification",
    ],
    type: "content",
    layout: "stat-highlight",
    accent: true,
  },
  {
    title: "Building a Net-Zero Future",
    subtitle: "{{companyName}}",
    content: [
      "elena@company.com · (303) 555-0180",
      "www.company.com",
    ],
    type: "cta",
  },
];

/* ------------------------------------------------------------------ */
/*  8. D2C / Consumer  (10 slides)                                     */
/* ------------------------------------------------------------------ */
const d2cSlides: SlideData[] = [
  {
    title: "{{companyName}}",
    subtitle: "Premium Functional Wellness, Direct to You",
    content: ["Series A · $4M Raise", "The next iconic consumer wellness brand"],
    type: "title",
    accent: true,
  },
  {
    title: "The Wellness Paradox",
    subtitle: "Consumers want better — brands deliver noise",
    content: [
      "73% of consumers distrust supplement & wellness claims",
      "Average customer tries 4+ brands before finding one that works",
      "Legacy brands spend 60%+ of revenue on retail markups and middlemen",
    ],
    type: "content",
    layout: "centered",
  },
  {
    title: "Our Brand & Product",
    subtitle: "Clinically backed, beautifully designed",
    content: [
      "Functional wellness line: adaptogens, nootropics, and recovery",
      "Every SKU backed by third-party clinical trials",
      "DTC-first with curated retail partnerships (Erewhon, Whole Foods)",
    ],
    type: "content",
    layout: "split",
  },
  {
    title: "Brand Metrics",
    subtitle: "Organic love, not paid hype",
    content: [],
    type: "metrics",
    metrics: [
      { label: "Revenue (TTM)", value: "$3.2M", change: "+240%", trend: "up" },
      { label: "Repeat Rate", value: "52%", change: "+8pts QoQ", trend: "up" },
      { label: "CAC Payback", value: "45 days", trend: "up" },
      { label: "Instagram Followers", value: "185K", change: "80% organic", trend: "up" },
    ],
    accent: true,
  },
  {
    title: "Revenue Growth",
    subtitle: "Compounding month over month",
    content: [
      "Subscription revenue now 40% of total — growing fastest",
      "AOV increased 28% with bundle strategy",
    ],
    type: "chart",
    chartData: {
      type: "line",
      data: [
        { label: "Jan", value: 140 },
        { label: "Mar", value: 195 },
        { label: "May", value: 260 },
        { label: "Jul", value: 340 },
        { label: "Sep", value: 430 },
        { label: "Nov", value: 550 },
      ],
      label: "Monthly Revenue ($K)",
    },
  },
  {
    title: "Marketing & Distribution",
    subtitle: "Community-first growth engine",
    content: [
      "Ambassador program: 2,000 micro-influencers, $0.42 CPM",
      "Content engine: podcast, newsletter (85K subs), TikTok (1.2M views/mo)",
      "Retail: Erewhon, Whole Foods in 120 doors, expanding to 400+",
      "Subscription model with personalized reorder cadence",
    ],
    type: "content",
    layout: "two-column",
  },
  {
    title: "Why We Win",
    subtitle: "vs. legacy wellness brands",
    content: [
      "Clinical evidence vs. marketing claims",
      "52% repeat rate vs. industry avg 28%",
      "D2C margins (72%) vs. retail-dependent (40%)",
      "Community moat vs. paid-acquisition dependency",
    ],
    type: "comparison",
  },
  {
    title: "The Team",
    subtitle: "Brand builders and scientists",
    content: [],
    type: "team",
    team: [
      { name: "Jordan Blake", role: "CEO", bio: "Founded and sold D2C skincare brand ($45M exit)" },
      { name: "Dr. Ananya Gupta", role: "Chief Science Officer", bio: "PhD in nutritional biochemistry, 30+ published studies" },
      { name: "Carlos Mendez", role: "VP Growth", bio: "Scaled Glossier from $20M to $100M revenue" },
    ],
  },
  {
    title: "The Ask",
    subtitle: "$4M Series A",
    content: [
      "35% — New product R&D & clinical trials",
      "30% — Marketing & brand building",
      "20% — Retail expansion",
      "15% — Operations & supply chain",
    ],
    type: "content",
    layout: "stat-highlight",
    accent: true,
  },
  {
    title: "Wellness That Actually Works",
    subtitle: "{{companyName}}",
    content: [
      "jordan@company.com · (323) 555-0190",
      "www.company.com",
    ],
    type: "cta",
  },
];

/* ================================================================== */
/*  TEMPLATE DEFINITIONS                                               */
/* ================================================================== */

export const TEMPLATES: DeckTemplate[] = [
  /* 1 — SaaS Startup */
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
    slides: saasSlides,
  },

  /* 2 — Biotech / Life Sciences */
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
    slides: biotechSlides,
  },

  /* 3 — Marketplace */
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
    slides: marketplaceSlides,
  },

  /* 4 — FinTech */
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
    slides: fintechSlides,
  },

  /* 5 — Healthcare / MedTech */
  {
    id: "healthcare",
    name: "Healthcare / MedTech",
    description: "Medical device or digital health startup with regulatory pathway and clinical evidence.",
    industry: "Healthcare / MedTech",
    icon: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z",
    color: "text-teal-600",
    bg: "bg-teal-50",
    defaults: {
      industry: "Healthcare / MedTech",
      stage: "Series A",
      fundingTarget: "$10M",
      investorType: "vc",
      problem: "Chronic disease management costs $4.1T/year with 15-20% hospital readmission rates",
      solution: "AI-powered remote patient monitoring platform that predicts adverse events 48 hours early",
      keyMetrics: "2,000+ patients monitored, 42% readmission reduction, 3 health system pilots, FDA 510(k) cleared",
      teamInfo: "Former Medtronic VP, ex-Apple Health engineer, Mayo Clinic cardiologist",
    },
    slides: healthcareSlides,
  },

  /* 6 — EdTech / Education */
  {
    id: "edtech",
    name: "EdTech / Education",
    description: "Adaptive learning platform improving student outcomes through AI personalization.",
    industry: "EdTech / Education",
    icon: "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    defaults: {
      industry: "EdTech / Education",
      stage: "Series A",
      fundingTarget: "$6M",
      investorType: "vc",
      problem: "65% of students are not proficient in reading by 4th grade; teachers lack tools for personalization",
      solution: "AI-powered adaptive learning platform that adjusts difficulty, pace, and modality per student in real time",
      keyMetrics: "45K daily active students, +23% test score lift, 94% teacher retention, 120 school districts",
      teamInfo: "Former Khan Academy product lead, ex-Duolingo ML engineer, state DOE curriculum advisor",
    },
    slides: edtechSlides,
  },

  /* 7 — Climate / CleanTech */
  {
    id: "climate",
    name: "Climate / CleanTech",
    description: "Carbon capture or clean energy startup with breakthrough unit economics and clear scale path.",
    industry: "Climate / CleanTech",
    icon: "M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    defaults: {
      industry: "Climate / CleanTech",
      stage: "Series A",
      fundingTarget: "$12M",
      investorType: "vc",
      problem: "Current carbon capture costs $400-600/ton — too expensive to reach net-zero targets",
      solution: "Electrochemical carbon capture technology that operates at 1/3 the cost of existing solutions",
      keyMetrics: "$185/ton cost (vs $400+ industry), pilot operational, 3 offtake contracts worth $2.4M",
      teamInfo: "Former CTO at Carbon Engineering, 12 patents in carbon capture, ex-Climeworks biz dev lead",
    },
    slides: climateSlides,
  },

  /* 8 — D2C / Consumer */
  {
    id: "d2c",
    name: "D2C / Consumer",
    description: "Direct-to-consumer brand with strong community, repeat purchase, and category-defining product.",
    industry: "D2C / Consumer",
    icon: "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z",
    color: "text-pink-600",
    bg: "bg-pink-50",
    defaults: {
      industry: "D2C / Consumer",
      stage: "Series A",
      fundingTarget: "$4M",
      investorType: "vc",
      problem: "73% of consumers distrust wellness claims; average customer tries 4+ brands before finding one that works",
      solution: "Clinically-backed functional wellness brand sold direct-to-consumer with 52% repeat purchase rate",
      keyMetrics: "$3.2M TTM revenue (+240% YoY), 52% repeat rate, 45-day CAC payback, 185K organic Instagram followers",
      teamInfo: "D2C founder with $45M exit, PhD nutritional biochemistry, ex-Glossier growth lead",
    },
    slides: d2cSlides,
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
