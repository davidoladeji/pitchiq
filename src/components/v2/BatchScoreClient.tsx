"use client";

import AppShellV2 from "./shell/AppShell";
import { PageTransition } from "./shared/PageTransition";
import { DashboardVersionToggle } from "@/components/DashboardVersionToggle";
import BatchScoreClientClassic from "@/components/BatchScoreClient";

interface Props {
  userPlan: string;
  batchEnabled: boolean;
  maxBatchSize: number;
  userName?: string;
}

export default function BatchScoreV2({ userName, userPlan, ...rest }: Props) {
  return (
    <AppShellV2
      userName={userName}
      userPlan={userPlan}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Batch Score" },
      ]}
    >
      <PageTransition>
        <div className="max-w-5xl mx-auto">
          <DashboardVersionToggle />
          <div className="mt-4 mb-6">
            <h1 className="text-2xl font-bold text-navy dark:text-white">Batch Scoring</h1>
            <p className="text-sm text-navy-400 dark:text-white/40 mt-1">Score multiple pitch decks at once</p>
          </div>
          <div className="bg-[var(--surface-1)] rounded-2xl border border-[var(--border-default)] p-5">
            <BatchScoreClientClassic plan={userPlan} batchEnabled={rest.batchEnabled} maxBatchSize={rest.maxBatchSize} initialJobs={[]} />
          </div>
        </div>
      </PageTransition>
    </AppShellV2>
  );
}
