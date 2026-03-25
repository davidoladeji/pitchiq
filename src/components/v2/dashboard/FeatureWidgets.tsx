"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Search, Users, Mic, Split, CreditCard, Lock } from "lucide-react";

interface FeatureWidgetsProps {
  plan: string;
  className?: string;
}

interface Widget {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  minPlan: string; // minimum plan required
  color: string;
}

const WIDGETS: Widget[] = [
  {
    title: "Investor Match",
    description: "Find investors aligned with your startup",
    icon: Search,
    href: "/dashboard/investor-match",
    minPlan: "growth",
    color: "text-electric",
  },
  {
    title: "Investor CRM",
    description: "Track your fundraising pipeline",
    icon: Users,
    href: "/dashboard/investor-crm",
    minPlan: "growth",
    color: "text-violet",
  },
  {
    title: "Pitch Practice",
    description: "Rehearse your pitch with AI feedback",
    icon: Mic,
    href: "/dashboard/practice",
    minPlan: "growth",
    color: "text-emerald",
  },
  {
    title: "A/B Testing",
    description: "Test deck variants with real investors",
    icon: Split,
    href: "/dashboard/ab-tests",
    minPlan: "growth",
    color: "text-amber-500",
  },
];

const PLAN_RANK: Record<string, number> = {
  starter: 0,
  pro: 1,
  growth: 2,
  enterprise: 3,
};

/**
 * Feature widgets grid — shows plan-gated features with upgrade CTAs.
 * Phase 2.6 of the dashboard redesign.
 */
export function FeatureWidgets({ plan, className }: FeatureWidgetsProps) {
  const userRank = PLAN_RANK[plan] ?? 0;

  // Show widgets relevant to the user's plan
  const visibleWidgets = WIDGETS.slice(0, userRank >= 2 ? 4 : 3);

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3", className)}>
      {visibleWidgets.map((widget) => {
        const locked = userRank < (PLAN_RANK[widget.minPlan] ?? 0);
        const Icon = widget.icon;

        return (
          <Link
            key={widget.title}
            href={locked ? "/billing" : widget.href}
            className={cn(
              "group relative bg-[var(--surface-1)] rounded-xl border border-[var(--border-default)] p-4",
              "transition-all duration-200",
              locked
                ? "opacity-70"
                : "hover:border-[var(--border-interactive)] hover:shadow-elevation-2 hover:-translate-y-0.5",
            )}
          >
            {locked && (
              <div className="absolute top-3 right-3">
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-electric/10 text-electric">
                  <Lock className="w-2.5 h-2.5" />
                  Growth
                </span>
              </div>
            )}
            <div className={cn("mb-2", widget.color)}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-navy dark:text-white mb-0.5">
              {widget.title}
            </h3>
            <p className="text-xs text-navy-400 dark:text-white/40 leading-relaxed">
              {widget.description}
            </p>
          </Link>
        );
      })}

      {/* PAYG Credits widget — always visible */}
      <Link
        href="/dashboard/credits"
        className={cn(
          "group bg-[var(--surface-1)] rounded-xl border border-[var(--border-default)] p-4",
          "transition-all duration-200 hover:border-[var(--border-interactive)] hover:shadow-elevation-2 hover:-translate-y-0.5",
        )}
      >
        <div className="text-amber-500 mb-2">
          <CreditCard className="w-5 h-5" />
        </div>
        <h3 className="text-sm font-semibold text-navy dark:text-white mb-0.5">Credits</h3>
        <p className="text-xs text-navy-400 dark:text-white/40 leading-relaxed">
          Buy credits for extra generations
        </p>
      </Link>
    </div>
  );
}
