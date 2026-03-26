"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Calendar, ArrowRight, Coins, CheckCircle2 } from "lucide-react";
import AppShellV2 from "./shell/AppShell";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface Props {
  plan: string;
  hasSubscription: boolean;
  planExpiresAt: string | null;
  memberSince: string | null;
  deckCount: number;
  userName?: string;
}

interface PlanConfig {
  planKey: string;
  displayName: string;
  description: string;
  price: string;
  priceUnit: string;
  features: string[];
  highlight?: boolean;
}

export default function BillingV2({ userName, ...props }: Props) {
  const router = useRouter();
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/plans")
      .then((r) => r.json())
      .then((d) => {
        if (d.plans) {
          setPlans(d.plans.map((p: Record<string, unknown>) => ({
            planKey: p.planKey as string,
            displayName: p.displayName as string,
            description: p.description as string,
            price: p.price as string,
            priceUnit: p.priceUnit as string,
            features: typeof p.features === "string" ? JSON.parse(p.features as string) : (p.features as string[]) || [],
            highlight: p.highlight as boolean,
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleUpgrade = async (planKey: string) => {
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planKey }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch { /* */ }
  };

  const handleManage = async () => {
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch { /* */ }
  };

  return (
    <AppShellV2
      userName={userName}
      userPlan={props.plan}
      breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Billing" }]}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Billing & Plans</h1>
          <p className="text-sm text-neutral-500 mt-1">Manage your subscription and payment details</p>
        </div>

        {/* Current plan card */}
        <Card className="p-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                <CreditCard size={20} className="text-primary-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-neutral-900 capitalize">{props.plan}</h2>
                  <Badge variant="primary">{props.hasSubscription ? "Active" : "Free"}</Badge>
                </div>
                {props.planExpiresAt && (
                  <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
                    <Calendar size={12} /> Renews {new Date(props.planExpiresAt).toLocaleDateString()}
                  </p>
                )}
                {props.memberSince && (
                  <p className="text-xs text-neutral-400">Member since {new Date(props.memberSince).toLocaleDateString()}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {props.hasSubscription && (
                <Button variant="outline" onClick={handleManage}>Manage Subscription</Button>
              )}
              <Button variant="outline" onClick={() => router.push("/dashboard/credits")}>
                <Coins size={14} className="mr-1.5" /> Credits
              </Button>
            </div>
          </div>

          {/* Usage bar */}
          <div className="mt-4 pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-neutral-500">Decks used</span>
              <span className="text-xs font-semibold text-neutral-700">{props.deckCount}</span>
            </div>
            <div className="h-2 rounded-full bg-neutral-100 overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (props.deckCount / (props.plan === "starter" ? 3 : props.plan === "pro" ? 10 : 100)) * 100)}%` }}
              />
            </div>
          </div>
        </Card>

        {/* Plan cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-64 rounded-xl bg-neutral-100 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {plans.filter((p) => p.planKey !== "enterprise").map((plan) => {
              const isCurrent = plan.planKey === props.plan;
              return (
                <Card
                  key={plan.planKey}
                  className={`p-5 relative ${plan.highlight ? "ring-2 ring-primary-500" : ""}`}
                >
                  {plan.highlight && (
                    <span className="absolute -top-2.5 left-4 px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary-500 text-white">Best Value</span>
                  )}
                  <h3 className="text-base font-semibold text-neutral-900">{plan.displayName}</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">{plan.description}</p>
                  <div className="mt-3">
                    <span className="text-2xl font-bold text-neutral-900">{plan.price}</span>
                    {plan.priceUnit && <span className="text-sm text-neutral-400">{plan.priceUnit}</span>}
                  </div>
                  <ul className="mt-4 space-y-1.5">
                    {plan.features.slice(0, 6).map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5 text-xs text-neutral-600">
                        <CheckCircle2 size={12} className="text-emerald-500 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4">
                    {isCurrent ? (
                      <Button variant="outline" className="w-full" disabled>Current Plan</Button>
                    ) : (
                      <Button className="w-full" onClick={() => handleUpgrade(plan.planKey)}>
                        Upgrade <ArrowRight size={14} className="ml-1" />
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShellV2>
  );
}
