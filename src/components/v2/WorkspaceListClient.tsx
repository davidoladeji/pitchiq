"use client";

import AppShellV2 from "./shell/AppShell";
import { PageTransition } from "./shared/PageTransition";
import { DashboardVersionToggle } from "@/components/DashboardVersionToggle";
import WorkspaceListClientClassic from "@/components/workspace/WorkspaceListClient";

interface Props {
  workspaces: unknown[];
  ownedWorkspaces: unknown[];
  userPlan: string;
  userName?: string;
}

export default function WorkspaceListV2({ userName, userPlan, ...rest }: Props) {
  return (
    <AppShellV2
      userName={userName}
      userPlan={userPlan}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Workspaces" },
      ]}
    >
      <PageTransition>
        <div className="max-w-5xl mx-auto">
          <DashboardVersionToggle />
          <div className="mt-4 mb-6">
            <h1 className="text-2xl font-bold text-navy dark:text-white">Workspaces</h1>
            <p className="text-sm text-navy-400 dark:text-white/40 mt-1">Collaborate on decks with your team</p>
          </div>
          <div className="bg-[var(--surface-1)] rounded-2xl border border-[var(--border-default)] p-5">
            <WorkspaceListClientClassic {...rest} userPlan={userPlan} />
          </div>
        </div>
      </PageTransition>
    </AppShellV2>
  );
}
