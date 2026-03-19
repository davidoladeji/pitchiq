"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* ─── tier data ─── */

interface Tier {
  name: string;
  plan?: string; // "pro" | "growth" — used for checkout
  price: string;
  unit: string;
  desc: string;
  highlight: boolean;
  badge?: string;
  features: string[];
  cta: string;
  href: string;
}

const TIERS: Tier[] = [
  {
    name: "Starter",
    price: "Free",
    unit: "",
    desc: "Try it out",
    highlight: false,
    features: [
      "1 AI-generated deck",
      "PDF export",
      "Basic PIQ Score",
      "1 design theme",
      "Shareable link",
    ],
    cta: "Get Started",
    href: "/create",
  },
  {
    name: "Pro",
    plan: "pro",
    price: "$29",
    unit: "/mo",
    desc: "For active fundraisers",
    highlight: true,
    badge: "Popular",
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
    cta: "Start Free Trial",
    href: "/create",
  },
  {
    name: "Growth",
    plan: "growth",
    price: "$79",
    unit: "/mo",
    desc: "Full intelligence suite",
    highlight: false,
    badge: "Best Value",
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
    cta: "Start Free Trial",
    href: "/create",
  },
  {
    name: "Enterprise",
    price: "$399",
    unit: "/mo",
    desc: "For teams & programs",
    highlight: false,
    plan: "enterprise",
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
    cta: "Start Free Trial",
    href: "/create",
  },
];

/* ─── feature comparison table rows ─── */

interface CompareRow {
  label: string;
  starter: string | boolean;
  pro: string | boolean;
  growth: string | boolean;
  enterprise: string | boolean;
}

const COMPARE_ROWS: CompareRow[] = [
  { label: "AI-Generated Decks", starter: "1", pro: "Up to 5", growth: "Unlimited", enterprise: "Unlimited" },
  { label: "Design Themes", starter: "1", pro: "All 12+", growth: "All 12+", enterprise: "All 12+" },
  { label: "PIQ Score", starter: "Overall only", pro: "Full breakdown", growth: "Full breakdown", enterprise: "Full breakdown" },
  { label: "PDF Export", starter: "Watermarked", pro: true, growth: true, enterprise: true },
  { label: "PPTX Export", starter: false, pro: true, growth: true, enterprise: true },
  { label: "Pitch Deck Editor", starter: false, pro: true, growth: true, enterprise: true },
  { label: "Smart Blocks", starter: false, pro: true, growth: true, enterprise: true },
  { label: "AI Coaching per Slide", starter: false, pro: true, growth: true, enterprise: true },
  { label: "Version History", starter: false, pro: "10 versions", growth: "Unlimited", enterprise: "Unlimited" },
  { label: "Deck Templates", starter: false, pro: true, growth: true, enterprise: true },
  { label: "Remove Branding", starter: false, pro: true, growth: true, enterprise: true },
  { label: "Engagement Analytics", starter: false, pro: false, growth: true, enterprise: true },
  { label: "Slide-Level Tracking", starter: false, pro: false, growth: true, enterprise: true },
  { label: "Investor Variants", starter: false, pro: false, growth: true, enterprise: true },
  { label: "A/B Testing", starter: false, pro: false, growth: true, enterprise: true },
  { label: "Follow-Up Alerts", starter: false, pro: false, growth: true, enterprise: true },
  { label: "Investor CRM", starter: false, pro: false, growth: true, enterprise: true },
  { label: "Investor Lens AI", starter: false, pro: false, growth: true, enterprise: true },
  { label: "Pitch Simulator", starter: false, pro: false, growth: true, enterprise: true },
  { label: "Custom Domain", starter: false, pro: false, growth: true, enterprise: true },
  { label: "Team Collaboration", starter: false, pro: false, growth: false, enterprise: true },
  { label: "API Access", starter: false, pro: false, growth: false, enterprise: true },
  { label: "Batch Scoring", starter: false, pro: false, growth: false, enterprise: true },
  { label: "White-Label", starter: false, pro: false, growth: false, enterprise: true },
  { label: "SSO / SAML", starter: false, pro: false, growth: false, enterprise: true },
  { label: "Dedicated Support", starter: false, pro: false, growth: false, enterprise: true },
];

/* ─── cell renderer ─── */

function CompareCell({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <svg className="w-5 h-5 text-electric mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    );
  }
  if (value === false) {
    return <span className="block w-1.5 h-1.5 rounded-full bg-navy-200 mx-auto" aria-hidden />;
  }
  return <span className="text-navy-600 text-xs font-medium">{value}</span>;
}

/* ─── component ─── */

export default function LandingPricing() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [showAllPlans, setShowAllPlans] = useState(false);
  const [showCompare, setShowCompare] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleCheckout = async (plan: string) => {
    setLoadingPlan(plan);
    setError("");
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = `/auth/signin?callbackUrl=${encodeURIComponent(`/?upgrade=${plan}#pricing`)}`;
          return;
        }
        throw new Error(data.error || "Checkout failed");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoadingPlan(null);
    }
  };

  const starterTier = TIERS[0];
  const proTier = TIERS[1];
  const growthTier = TIERS[2];
  const enterpriseTier = TIERS[3];

  return (
    <section id="pricing" aria-labelledby="pricing-heading" className="section-py px-6 bg-background">
      <div className="max-w-5xl mx-auto" ref={ref}>
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.2em] uppercase text-navy-500 mb-4">PRICING</p>
          <h2 id="pricing-heading" className="text-3xl sm:text-4xl md:text-5xl font-display text-navy tracking-[-0.02em] mb-4">
            Start free, scale when ready
          </h2>
          <p className="text-navy-500 text-lg font-light">No surprises. Cancel anytime.</p>
          {error && (
            <p className="mt-3 text-red-500 text-sm font-medium" role="alert">
              {error}
            </p>
          )}
        </div>

        {/* ── Primary cards: Starter + Pro ── */}
        <div
          className={`grid md:grid-cols-2 gap-6 items-stretch max-w-3xl mx-auto transition-all duration-700 ease-out ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Starter */}
          <div
            role="group"
            aria-label="Starter plan"
            className="relative flex flex-col rounded-2xl border border-navy-200 p-5 sm:p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-card-hover hover:border-navy-300"
          >
            <h3 className="text-base font-bold tracking-tight text-navy">{starterTier.name}</h3>
            <p className="text-xs mt-1 mb-6 text-navy-500">{starterTier.desc}</p>
            <div className="flex items-baseline gap-0.5 mb-8">
              <span className="text-4xl font-bold tracking-tight text-navy">{starterTier.price}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {starterTier.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 shrink-0 text-electric" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-navy-500">{f}</span>
                </li>
              ))}
            </ul>
            <Link
              href={starterTier.href}
              className="mt-auto w-full text-center min-h-[48px] flex items-center justify-center py-3 rounded-full font-semibold text-sm bg-navy-100 text-navy transition-all hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="Get started with Starter plan — create your first deck"
            >
              {starterTier.cta}
            </Link>
          </div>

          {/* Pro */}
          <div
            role="group"
            aria-label="Pro plan, most popular"
            className="relative flex flex-col rounded-2xl border border-electric p-5 sm:p-8 shadow-glow transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-glow-lg"
          >
            <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-electric text-white text-[11px] font-semibold tracking-wide" aria-hidden="true">
              Popular
            </div>
            <h3 className="text-base font-bold tracking-tight text-navy">{proTier.name}</h3>
            <p className="text-xs mt-1 mb-6 text-navy-500">{proTier.desc}</p>
            <div className="flex items-baseline gap-0.5 mb-8">
              <span className="text-4xl font-bold tracking-tight text-navy">{proTier.price}</span>
              <span className="text-sm text-navy-500">{proTier.unit}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {proTier.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 shrink-0 text-electric" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-navy-500">{f}</span>
                </li>
              ))}
            </ul>
            {(() => {
              const isLoading = loadingPlan === proTier.plan;
              return (
                <>
                  <button
                    type="button"
                    onClick={() => handleCheckout(proTier.plan!)}
                    disabled={!!loadingPlan}
                    aria-busy={isLoading}
                    aria-label={isLoading ? "Setting up Pro plan…" : "Start free trial for Pro plan"}
                    className="mt-auto w-full text-center min-h-[48px] flex items-center justify-center py-3 rounded-full font-semibold text-sm bg-navy text-white transition-all hover:-translate-y-0.5 hover:shadow-glow hover:shadow-electric/10 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-70 disabled:cursor-wait disabled:hover:translate-y-0 disabled:hover:shadow-none"
                  >
                    {isLoading ? (
                      <span className="inline-flex items-center gap-2">
                        <svg className="animate-spin motion-reduce:animate-none w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden>
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Setting up...
                      </span>
                    ) : (
                      proTier.cta
                    )}
                  </button>
                  <p className="mt-2 text-xs text-navy-500 text-center" aria-hidden="true">
                    14-day free trial &middot; Cancel anytime
                  </p>
                </>
              );
            })()}
          </div>
        </div>

        {/* ── "See all plans" toggle ── */}
        <div
          className={`text-center mt-10 transition-all duration-700 ease-out delay-200 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <button
            type="button"
            onClick={() => setShowAllPlans(!showAllPlans)}
            aria-expanded={showAllPlans}
            aria-controls="growth-enterprise-plans"
            aria-label={showAllPlans ? "Hide Growth and Enterprise plans" : "Show Growth and Enterprise plans"}
            className="inline-flex items-center gap-2 text-sm text-navy-500 hover:text-electric font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-lg px-4 py-2"
          >
            {showAllPlans ? "Hide" : "See"} Growth &amp; Enterprise plans
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${showAllPlans ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* ── Growth + Enterprise cards ── */}
        <div
          id="growth-enterprise-plans"
          className={`grid md:grid-cols-2 gap-6 items-stretch max-w-3xl mx-auto transition-all duration-500 ease-out ${
            showAllPlans ? "mt-8 pt-4 max-h-[2000px] opacity-100" : "mt-0 max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          {/* Growth */}
          <div
            role="group"
            aria-label="Growth plan, best value"
            className="relative flex flex-col rounded-2xl border border-violet/40 p-5 sm:p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-card-hover hover:border-violet"
          >
            <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-electric text-white text-[11px] font-semibold tracking-wide" aria-hidden="true">
              Best Value
            </div>
            <h3 className="text-base font-bold tracking-tight text-navy">{growthTier.name}</h3>
            <p className="text-xs mt-1 mb-6 text-navy-500">{growthTier.desc}</p>
            <div className="flex items-baseline gap-0.5 mb-8">
              <span className="text-4xl font-bold tracking-tight text-navy">{growthTier.price}</span>
              <span className="text-sm text-navy-500">{growthTier.unit}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {growthTier.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 shrink-0 text-violet" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-navy-500">{f}</span>
                </li>
              ))}
            </ul>
            {(() => {
              const isLoading = loadingPlan === growthTier.plan;
              return (
                <button
                  type="button"
                  onClick={() => handleCheckout(growthTier.plan!)}
                  disabled={!!loadingPlan}
                  aria-busy={isLoading}
                  aria-label={isLoading ? "Setting up Growth plan…" : "Start free trial for Growth plan"}
                  className="mt-auto w-full text-center min-h-[48px] flex items-center justify-center py-3 rounded-full font-semibold text-sm bg-electric hover:bg-electric-600 text-white shadow-lg shadow-electric/25 hover:shadow-glow transition-all hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-70 disabled:cursor-wait disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin motion-reduce:animate-none w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Setting up...
                    </span>
                  ) : (
                    growthTier.cta
                  )}
                </button>
              );
            })()}
          </div>

          {/* Enterprise */}
          <div
            role="group"
            aria-label="Enterprise plan"
            className="relative flex flex-col rounded-2xl border border-navy-200 bg-navy-50/50 p-5 sm:p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-card-hover hover:border-navy-300"
          >
            <h3 className="text-base font-bold tracking-tight text-navy">{enterpriseTier.name}</h3>
            <p className="text-xs mt-1 mb-6 text-navy-500">{enterpriseTier.desc}</p>
            <div className="flex items-baseline gap-0.5 mb-8">
              <span className="text-4xl font-bold tracking-tight text-navy">{enterpriseTier.price}</span>
              <span className="text-sm text-navy-500">{enterpriseTier.unit}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {enterpriseTier.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <svg className="w-4 h-4 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-navy-500">{f}</span>
                </li>
              ))}
            </ul>
            {(() => {
              const isLoading = loadingPlan === "enterprise";
              return (
                <button
                  type="button"
                  onClick={() => handleCheckout("enterprise")}
                  disabled={!!loadingPlan}
                  aria-busy={isLoading}
                  aria-label={isLoading ? "Setting up Enterprise plan…" : "Start free trial for Enterprise plan"}
                  className="mt-auto w-full text-center min-h-[48px] flex items-center justify-center py-3 rounded-full font-semibold text-sm bg-navy text-white transition-all hover:-translate-y-0.5 hover:shadow-glow hover:shadow-electric/10 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-wait disabled:hover:translate-y-0 disabled:hover:shadow-none"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin motion-reduce:animate-none w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Setting up...
                    </span>
                  ) : (
                    enterpriseTier.cta
                  )}
                </button>
              );
            })()}
          </div>
        </div>

        {/* ── Compare all features toggle ── */}
        <div
          className={`text-center mt-10 transition-all duration-700 ease-out delay-300 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <button
            type="button"
            onClick={() => setShowCompare(!showCompare)}
            aria-expanded={showCompare}
            aria-controls="pricing-compare-table"
            aria-label={showCompare ? "Hide feature comparison table" : "Show feature comparison table"}
            className="inline-flex items-center gap-2 text-sm font-semibold text-electric hover:text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded-lg px-5 py-2.5 border border-electric/20 hover:border-electric/40 bg-electric/5 hover:bg-electric/10"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
            {showCompare ? "Hide" : "Compare all"} features
            <svg
              className={`w-4 h-4 transition-transform duration-300 ${showCompare ? "rotate-180" : ""}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* ── Feature comparison table ── */}
        <div
          id="pricing-compare-table"
          className={`overflow-hidden transition-all duration-500 ease-out ${
            showCompare ? "mt-8 max-h-[3000px] opacity-100" : "mt-0 max-h-0 opacity-0"
          }`}
        >
          <div className="rounded-2xl border border-navy-200 overflow-hidden">
            {/* Sticky header */}
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[640px]">
                <thead>
                  <tr className="bg-navy-50 border-b border-navy-200">
                    <th className="px-5 py-4 text-xs font-semibold text-navy-500 uppercase tracking-wider w-[35%]">
                      Feature
                    </th>
                    <th className="px-3 py-4 text-center w-[16%]">
                      <div className="text-xs font-bold text-navy">Starter</div>
                      <div className="text-[10px] text-navy-400 mt-0.5">Free</div>
                    </th>
                    <th className="px-3 py-4 text-center w-[16%]">
                      <div className="text-xs font-bold text-electric">Pro</div>
                      <div className="text-[10px] text-navy-400 mt-0.5">$29/mo</div>
                    </th>
                    <th className="px-3 py-4 text-center w-[16%]">
                      <div className="text-xs font-bold text-violet">Growth</div>
                      <div className="text-[10px] text-navy-400 mt-0.5">$79/mo</div>
                    </th>
                    <th className="px-3 py-4 text-center w-[16%]">
                      <div className="text-xs font-bold text-navy">Enterprise</div>
                      <div className="text-[10px] text-navy-400 mt-0.5">$399/mo</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row, i) => (
                    <tr
                      key={row.label}
                      className={`border-b border-navy-100 ${i % 2 === 0 ? "bg-white" : "bg-navy-50/30"}`}
                    >
                      <td className="px-5 py-3 text-sm text-navy-600 font-medium">{row.label}</td>
                      <td className="px-3 py-3 text-center"><CompareCell value={row.starter} /></td>
                      <td className="px-3 py-3 text-center bg-electric/[0.03]"><CompareCell value={row.pro} /></td>
                      <td className="px-3 py-3 text-center bg-violet/5"><CompareCell value={row.growth} /></td>
                      <td className="px-3 py-3 text-center"><CompareCell value={row.enterprise} /></td>
                    </tr>
                  ))}
                </tbody>
                {/* CTA row at bottom */}
                <tfoot>
                  <tr className="bg-navy-50 border-t border-navy-200">
                    <td className="px-5 py-4" />
                    <td className="px-3 py-4 text-center">
                      <Link
                        href="/create"
                        aria-label="Get started with Starter plan"
                        className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-4 py-2 rounded-full text-xs font-semibold bg-navy-100 text-navy hover:-translate-y-0.5 active:translate-y-0 transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      >
                        Get Started
                      </Link>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleCheckout("pro")}
                        disabled={!!loadingPlan}
                        aria-label={loadingPlan === "pro" ? "Setting up Pro plan…" : "Start free trial for Pro plan"}
                        aria-busy={!!loadingPlan && loadingPlan === "pro"}
                        className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-4 py-2 rounded-full text-xs font-semibold bg-navy text-white hover:-translate-y-0.5 hover:shadow-glow hover:shadow-electric/10 active:translate-y-0 transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-wait disabled:hover:translate-y-0 disabled:hover:shadow-none"
                      >
                        {loadingPlan === "pro" ? "..." : "Start Trial"}
                      </button>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleCheckout("growth")}
                        disabled={!!loadingPlan}
                        aria-label={loadingPlan === "growth" ? "Setting up Growth plan…" : "Start free trial for Growth plan"}
                        aria-busy={!!loadingPlan && loadingPlan === "growth"}
                        className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-4 py-2 rounded-full text-xs font-semibold bg-electric hover:bg-electric-600 text-white shadow-lg shadow-electric/25 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-wait disabled:hover:translate-y-0 disabled:hover:shadow-none"
                      >
                        {loadingPlan === "growth" ? "..." : "Start Trial"}
                      </button>
                    </td>
                    <td className="px-3 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleCheckout("enterprise")}
                        disabled={!!loadingPlan}
                        aria-label={loadingPlan === "enterprise" ? "Setting up Enterprise plan…" : "Start free trial for Enterprise plan"}
                        aria-busy={!!loadingPlan && loadingPlan === "enterprise"}
                        className="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-4 py-2 rounded-full text-xs font-semibold bg-navy text-white hover:-translate-y-0.5 hover:shadow-glow hover:shadow-electric/10 active:translate-y-0 transition-all motion-reduce:transition-none motion-reduce:hover:translate-y-0 disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-wait disabled:hover:translate-y-0 disabled:hover:shadow-none"
                      >
                        {loadingPlan === "enterprise" ? "..." : "Start Trial"}
                      </button>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
