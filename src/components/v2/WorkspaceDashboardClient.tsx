"use client";

import AppShellV2 from "./shell/AppShell";
import { PageTransition } from "./shared/PageTransition";
import { DashboardVersionToggle } from "@/components/DashboardVersionToggle";
import WorkspaceDashboardClientClassic from "@/components/workspace/WorkspaceDashboardClient";

interface Props {
  workspace: unknown;
  userName?: string;
  userPlan?: string;
}

export default function WorkspaceDashboardV2({ userName, userPlan, workspace }: Props) {
  return (
    <AppShellV2
      userName={userName}
      userPlan={userPlan}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Workspace" },
      ]}
    >
      <PageTransition>
        <DashboardVersionToggle />
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <WorkspaceDashboardClientClassic workspace={workspace as any} />
      </PageTransition>
    </AppShellV2>
  );
}
