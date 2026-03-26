"use client";

import AppShellV2 from "./shell/AppShell";
import { PageTransition } from "./shared/PageTransition";
import { DashboardVersionToggle } from "@/components/DashboardVersionToggle";
import IdeasPageClientClassic from "@/components/IdeasPageClient";

export default function IdeasPageV2() {
  return (
    <AppShellV2
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Ideas" },
      ]}
    >
      <PageTransition>
        <div className="max-w-4xl mx-auto">
          <DashboardVersionToggle />
          <div className="mt-4 mb-6">
            <h1 className="text-2xl font-bold text-navy dark:text-white">Startup Ideas</h1>
            <p className="text-sm text-navy-400 dark:text-white/40 mt-1">Answer a few questions and get AI-generated startup ideas</p>
          </div>
          <div className="bg-[var(--surface-1)] rounded-2xl border border-[var(--border-default)] p-5">
            <IdeasPageClientClassic />
          </div>
        </div>
      </PageTransition>
    </AppShellV2>
  );
}
