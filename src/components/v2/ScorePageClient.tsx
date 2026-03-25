"use client";

import { DashboardVersionToggle } from "@/components/DashboardVersionToggle";
import AppShellV2 from "./shell/AppShell";

/**
 * v2 Score Page — wraps the existing ScorePageClient in the new app shell.
 * The scoring flow is reused from classic — only the chrome changes.
 */
import ScorePageClientClassic from "@/components/ScorePageClient";

interface Props {
  userPlan?: string;
  userName?: string;
}

export default function ScorePageV2({ userPlan = "starter", userName }: Props) {
  return (
    <AppShellV2
      userName={userName}
      userPlan={userPlan}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Score Deck" },
      ]}
    >
      <div className="max-w-4xl mx-auto">
        <DashboardVersionToggle />
        <div className="mt-4">
          {/* Reuse the existing score page — it has the full upload + scoring flow */}
          <ScorePageClientClassic userPlan={userPlan} />
        </div>
      </div>
    </AppShellV2>
  );
}
