"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface Tier {
  name: string;
  plan?: string; // "pro" | "growth" — used for checkout
  price: string;
  unit: string;
  desc: string;
  highlight: boolean;
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
    features: [
      "Unlimited decks",
      "Full PIQ Score + coaching",
      "All 12+ themes",
      "PDF + PPTX export",
      "Brand customization",
      "Remove branding",
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
    features: [
      "Everything in Pro",
      "Engagement analytics",
      "Slide-level tracking",
      "Investor variants",
      "A/B testing",
      "Follow-up alerts",
    ],
    cta: "Start Free Trial",
    href: "/create",
  },
  {
    name: "Enterprise",
    price: "Custom",
    unit: "",
    desc: "For teams & programs",
    highlight: false,
    features: [
      "Everything in Growth",
      "Team collaboration",
      "API access",
      "White-label option",
      "SSO / SAML",
      "Dedicated support",
    ],
    cta: "Contact Sales",
    href: "#",
  },
];

export default function LandingPricing() {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
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
        // If not authenticated, redirect to sign in
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

  return (
    <section id="pricing" aria-label="Pricing and plans" className="section-py px-6 bg-white">
      <div className="max-w-3xl mx-auto" ref={ref}>
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.2em] uppercase text-navy-500 mb-4">PRICING</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display text-navy tracking-[-0.02em] mb-4">
            Start free, scale when ready
          </h2>
          <p className="text-navy-500 text-lg font-light">No surprises. Cancel anytime.</p>
          {error && (
            <p className="mt-3 text-red-500 text-sm font-medium" role="alert">
              {error}
            </p>
          )}
        </div>

        <div
          className={`grid md:grid-cols-2 gap-6 items-stretch transition-all duration-700 ease-out ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          {/* Starter Card — hover lift for perceived interactivity (conversion, premium minimalism) */}
          <div
            role="group"
            aria-label="Starter plan"
            className="relative flex flex-col rounded-2xl border border-navy-200 p-5 sm:p-8 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-card-hover hover:border-navy-300"
          >
            <h3 className="text-base font-bold tracking-tight text-navy">
              {starterTier.name}
            </h3>
            <p className="text-xs mt-1 mb-6 text-navy-500">
              {starterTier.desc}
            </p>

            <div className="flex items-baseline gap-0.5 mb-8">
              <span className="text-4xl font-bold tracking-tight text-navy">{starterTier.price}</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {starterTier.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <svg
                    className="w-4 h-4 shrink-0 text-electric"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-navy-500">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href={starterTier.href}
              aria-label="Get started with Starter plan"
              className="mt-auto w-full text-center min-h-[48px] flex items-center justify-center py-3 rounded-full font-semibold text-sm bg-navy-100 text-navy transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              {starterTier.cta}
            </Link>
          </div>

          {/* Pro Card — subtle glow + hover lift so recommended plan stands out (conversion) */}
          <div
            role="group"
            aria-label="Pro plan, most popular"
            className="relative flex flex-col rounded-2xl border border-electric p-5 sm:p-8 shadow-glow transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-glow-lg"
          >
            <div className="absolute -top-3 left-6 px-3 py-1 rounded-full bg-electric text-white text-[11px] font-semibold tracking-wide">
              Popular
            </div>

            <h3 className="text-base font-bold tracking-tight text-navy">
              {proTier.name}
            </h3>
            <p className="text-xs mt-1 mb-6 text-navy-500">
              {proTier.desc}
            </p>

            <div className="flex items-baseline gap-0.5 mb-8">
              <span className="text-4xl font-bold tracking-tight text-navy">{proTier.price}</span>
              <span className="text-sm text-navy-500">{proTier.unit}</span>
            </div>

            <ul className="space-y-3 mb-8 flex-1">
              {proTier.features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm">
                  <svg
                    className="w-4 h-4 shrink-0 text-electric"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-navy-500">{f}</span>
                </li>
              ))}
            </ul>

            {(() => {
              const isLoading = loadingPlan === proTier.plan;
              return (
                <button
                  type="button"
                  onClick={() => handleCheckout(proTier.plan!)}
                  disabled={!!loadingPlan}
                  aria-busy={isLoading}
                  aria-label={
                    isLoading
                      ? "Setting up Pro checkout..."
                      : "Start free trial — Pro plan"
                  }
                  className="mt-auto w-full text-center min-h-[48px] flex items-center justify-center py-3 rounded-full font-semibold text-sm bg-navy text-white transition-all hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-70 disabled:cursor-wait disabled:hover:translate-y-0"
                >
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Setting up...
                    </span>
                  ) : (
                    proTier.cta
                  )}
                </button>
              );
            })()}
          </div>
        </div>

        {/* Additional plans text */}
        <p
          className={`text-center mt-10 text-sm text-navy-500 transition-all duration-700 ease-out delay-200 ${
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          Need more?{" "}
          <button
            type="button"
            onClick={() => handleCheckout("growth")}
            disabled={!!loadingPlan}
            aria-label={loadingPlan === "growth" ? "Setting up Growth checkout..." : "Start free trial — Growth plan ($79/mo)"}
            aria-busy={loadingPlan === "growth"}
            className="text-electric hover:underline font-medium disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded px-0.5"
          >
            Growth ($79/mo)
          </button>{" "}
          and{" "}
          <Link href="#" className="text-electric hover:underline font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded px-0.5" aria-label="Contact sales for Enterprise plan">
            Enterprise
          </Link>{" "}
          plans available.
        </p>
      </div>
    </section>
  );
}
