"use client";

import Link from "next/link";
import { getPlanLimits } from "@/lib/plan-limits";

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  minPlan?: string; // "growth" | "enterprise"
}

const BASE_ACTIONS: QuickAction[] = [
  {
    label: "Create Deck",
    description: "AI-generated pitch deck from your idea",
    href: "/create",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
    color: "text-electric",
    bgColor: "bg-electric/10",
  },
  {
    label: "Upload & Score",
    description: "Score an existing deck with PIQ",
    href: "/score",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
  {
    label: "Explore Ideas",
    description: "Get inspired with AI startup ideas",
    href: "/ideas",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
      </svg>
    ),
    color: "text-amber-600",
    bgColor: "bg-amber-50",
  },
  {
    label: "From GitHub",
    description: "Generate a deck from your repo README",
    href: "/create?mode=github",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
      </svg>
    ),
    color: "text-navy",
    bgColor: "bg-navy-100",
  },
  {
    label: "Batch Score",
    description: "Score multiple decks at once",
    href: "/batch-score",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
      </svg>
    ),
    color: "text-rose-600",
    bgColor: "bg-rose-50",
    minPlan: "enterprise",
  },
  {
    label: "API Docs",
    description: "Integrate PitchIQ into your workflow",
    href: "/docs/api",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    color: "text-teal-600",
    bgColor: "bg-teal-50",
    minPlan: "enterprise",
  },
];

function hasPlan(plan: string, minPlan: string): boolean {
  const tiers = ["starter", "pro", "growth", "enterprise"];
  return tiers.indexOf(plan) >= tiers.indexOf(minPlan);
}

export default function DashboardQuickActions({ plan = "starter" }: { plan?: string }) {
  const limits = getPlanLimits(plan);
  const actions = BASE_ACTIONS.filter((a) => {
    if (!a.minPlan) return true;
    if (a.label === "Batch Score") return limits.batchScoring;
    if (a.label === "API Docs") return limits.apiAccess;
    return hasPlan(plan, a.minPlan);
  });

  return (
    <section aria-label="Quick actions">
      <h2 className="text-lg font-bold text-navy font-display mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="group bg-white rounded-2xl border border-navy-200 p-4 sm:p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl ${action.bgColor} flex items-center justify-center mb-3 ${action.color} group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <h3 className="text-sm font-bold text-navy group-hover:text-electric transition-colors">
              {action.label}
            </h3>
            <p className="text-xs text-navy-500 mt-0.5 line-clamp-2">
              {action.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
