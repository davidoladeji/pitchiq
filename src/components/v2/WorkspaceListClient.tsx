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

export default function WorkspaceListV2({ userName, userPlan, workspaces }: Props) {
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
        <DashboardVersionToggle />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <WorkspaceListClientClassic workspaces={workspaces as any} plan={userPlan} />
      </PageTransition>
    </AppShellV2>
  );
}
