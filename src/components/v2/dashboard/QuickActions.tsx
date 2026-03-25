"use client";

import Link from "next/link";
import { cn } from "@/lib/cn";
import { Sparkles, Target, Search, Lightbulb, Lock } from "lucide-react";
import { Badge } from "../ui/Badge";

interface Props {
  plan: string;
}

const ACTIONS = [
  { label: "Create Deck", href: "/create", icon: <Sparkles size={20} />, gated: false },
  { label: "Score Deck", href: "/score", icon: <Target size={20} />, gated: false },
  { label: "Find Investors", href: "/investors", icon: <Search size={20} />, gated: true, minPlan: "growth" },
  { label: "Ideas", href: "/ideas", icon: <Lightbulb size={20} />, gated: false },
];

export function QuickActions({ plan }: Props) {
  const isGrowth = plan === "growth" || plan === "enterprise";

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {ACTIONS.map((action) => {
        const locked = action.gated && !isGrowth;
        return (
          <Link
            key={action.href}
            href={locked ? "/pricing" : action.href}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] transition-all duration-150",
              locked
                ? "opacity-60"
                : "hover:border-[var(--border-interactive)] hover:bg-electric/5",
            )}
          >
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center",
              locked ? "bg-navy/5 dark:bg-white/5 text-navy-400 dark:text-white/30" : "bg-electric/10 text-electric",
            )}>
              {locked ? <Lock size={18} /> : action.icon}
            </div>
            <span className="text-xs font-semibold text-navy dark:text-white">{action.label}</span>
            {locked && <Badge variant="violet" size="sm">Growth+</Badge>}
          </Link>
        );
      })}
    </div>
  );
}
