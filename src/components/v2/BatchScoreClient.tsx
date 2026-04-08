"use client";

import AppShellV2 from "./shell/AppShell";
import { PageTransition } from "./shared/PageTransition";
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
          <div className="mt-4 mb-6">
            <h1 className="text-2xl font-bold" style={{ color: "var(--void-text, #E8E8ED)" }}>Batch Scoring</h1>
            <p className="text-sm mt-1" style={{ color: "var(--void-text-dim, rgba(255,255,255,0.3))" }}>Score multiple pitch decks at once</p>
          </div>
          <div className="rounded-2xl p-5" style={{ background: "var(--void-surface, rgba(255,255,255,0.03))", border: "1px solid var(--void-border, rgba(255,255,255,0.06))" }}>
            <BatchScoreClientClassic plan={userPlan} batchEnabled={rest.batchEnabled} maxBatchSize={rest.maxBatchSize} initialJobs={[]} />
          </div>
        </div>
      </PageTransition>
    </AppShellV2>
  );
}
