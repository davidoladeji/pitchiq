/**
 * Public plans API — returns enabled plan configs for pricing pages.
 * Strips Stripe-specific fields. Cacheable at CDN edge.
 */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

/** Hardcoded fallback when the PlanConfig table has not been seeded yet. */
const FALLBACK_PLANS = [
  {
    planKey: "starter",
    sortOrder: 0,
    displayName: "Starter",
    description: "Get your score",
    price: "Free",
    priceUnit: "",
    highlight: false,
    badge: null,
    ctaText: "Get Started",
    ctaHref: "/create",
    features: [
      "1 AI-generated deck",
      "PDF export",
      "Basic PIQ Score",
      "1 design theme",
      "Shareable link",
    ],
  },
  {
    planKey: "pro",
    sortOrder: 1,
    displayName: "Pro",
    description: "For active fundraisers",
    price: "$29",
    priceUnit: "/mo",
    highlight: true,
    badge: "Popular",
    ctaText: "Start Free Trial",
    ctaHref: "/create",
    features: [
      "Up to 5 decks",
      "Full PIQ Score + coaching",
      "All 12+ themes",
      "PDF + PPTX export",
      "Brand customization",
      "Remove branding",
      "Pitch deck editor",
      "Smart Blocks",
      "AI coaching per slide",
      "10 version history",
    ],
  },
  {
    planKey: "growth",
    sortOrder: 2,
    displayName: "Growth",
    description: "Full intelligence suite",
    price: "$79",
    priceUnit: "/mo",
    highlight: false,
    badge: "Best Value",
    ctaText: "Start Free Trial",
    ctaHref: "/create",
    features: [
      "Everything in Pro",
      "Unlimited decks",
      "Engagement analytics",
      "Slide-level tracking",
      "Investor variants",
      "A/B testing",
      "Follow-up alerts",
      "Investor CRM",
      "Investor Lens AI",
      "Pitch Simulator",
      "Unlimited version history",
      "Custom domain",
    ],
  },
  {
    planKey: "enterprise",
    sortOrder: 3,
    displayName: "Enterprise",
    description: "For teams & programs",
    price: "$399",
    priceUnit: "/mo",
    highlight: false,
    badge: null,
    ctaText: "Start Free Trial",
    ctaHref: "/create",
    features: [
      "Everything in Growth",
      "Team collaboration",
      "Unlimited workspace members",
      "API access",
      "Batch scoring",
      "White-label option",
      "SSO / SAML",
      "Dedicated support",
    ],
  },
];

export async function GET() {
  const rows = await prisma.planConfig.findMany({
    where: { enabled: true },
    orderBy: { sortOrder: "asc" },
  });

  let plans;
  if (rows.length === 0) {
    plans = FALLBACK_PLANS;
  } else {
    plans = rows.map((row) => ({
      planKey: row.planKey,
      sortOrder: row.sortOrder,
      displayName: row.displayName,
      description: row.description,
      price: row.price,
      priceUnit: row.priceUnit,
      highlight: row.highlight,
      badge: row.badge,
      ctaText: row.ctaText,
      ctaHref: row.ctaHref,
      features: JSON.parse(row.features) as string[],
    }));
  }

  return NextResponse.json(
    { plans },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
