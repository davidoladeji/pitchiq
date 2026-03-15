"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const TIERS = [
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

  return (
    <section id="pricing" aria-label="Pricing and plans" className="py-24 md:py-32 px-6">
      <div className="max-w-5xl mx-auto" ref={ref}>
        <div className="text-center mb-16">
          <p className="text-electric font-semibold text-xs uppercase tracking-[0.2em] mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-navy tracking-tight mb-4">
            Start free, scale when ready
          </h2>
          <p className="text-gray-500 text-lg">No surprises. Cancel anytime.</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5 items-stretch">
          {TIERS.map((tier, i) => (
            <div
              key={tier.name}
              role="group"
              aria-label={tier.highlight ? `${tier.name} plan, most popular` : `${tier.name} plan`}
              className={`relative flex flex-col rounded-2xl p-6 transition-all duration-500 h-full ${
                tier.highlight
                  ? "bg-navy text-white shadow-xl ring-1 ring-white/10 lg:scale-[1.04] lg:-my-2"
                  : "bg-white border border-gray-200"
              } ${inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
              style={{ transitionDelay: inView ? `${i * 80}ms` : "0ms" }}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-electric text-white text-[10px] font-bold tracking-wide shadow-lg shadow-electric/30" aria-hidden="true">
                  Most Popular
                </div>
              )}

              <h3 className={`text-base font-bold tracking-tight ${tier.highlight ? "text-white" : "text-navy"}`}>
                {tier.name}
              </h3>
              <p className={`text-xs mt-0.5 mb-4 ${tier.highlight ? "text-gray-400" : "text-gray-500"}`}>
                {tier.desc}
              </p>

              <div className="flex items-baseline gap-0.5 mb-5">
                <span className="text-3xl font-bold tracking-tight">{tier.price}</span>
                {tier.unit && (
                  <span className={`text-sm ${tier.highlight ? "text-gray-400" : "text-gray-500"}`}>{tier.unit}</span>
                )}
              </div>

              <ul className="space-y-2.5 mb-6 flex-1">
                {tier.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <svg
                      className={`w-3.5 h-3.5 shrink-0 ${tier.highlight ? "text-electric-200" : "text-electric"}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className={tier.highlight ? "text-gray-300" : "text-gray-500"}>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={tier.href}
                aria-label={
                  tier.cta === "Contact Sales"
                    ? "Contact sales for Enterprise plan"
                    : tier.cta === "Start Free Trial"
                    ? `Start free trial — ${tier.name} plan`
                    : `Get started with ${tier.name} plan`
                }
                className={`mt-auto w-full text-center min-h-[44px] flex items-center justify-center py-2.5 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 ${
                  tier.highlight
                    ? "bg-electric text-white shadow-lg shadow-electric/25 hover:shadow-xl hover:shadow-electric/30 focus-visible:ring-offset-navy"
                    : "bg-gray-50 text-navy border border-gray-200 hover:border-electric/20 hover:shadow-sm"
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
