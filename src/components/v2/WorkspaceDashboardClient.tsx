"use client";

import AppShellV2 from "./shell/AppShell";
import { PageTransition } from "./shared/PageTransition";
import { DashboardVersionToggle } from "@/components/DashboardVersionToggle";
import WorkspaceDashboardClientClassic from "@/components/workspace/WorkspaceDashboardClient";

interface Props {
  workspace: unknown;
  members: unknown[];
  decks: unknown[];
  userRole: string;
  userPlan: string;
  currentUserId: string;
  userName?: string;
}

export default function WorkspaceDashboardV2({ userName, userPlan, ...rest }: Props) {
  return (
    <AppShellV2
      userName={userName}
      userPlan={userPlan}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Workspaces", href: "/workspace" },
        { label: "Workspace" },
      ]}
    >
      <PageTransition>
        <div className="max-w-6xl mx-auto">
          <DashboardVersionToggle />
          <div className="mt-4">
            <WorkspaceDashboardClientClassic {...rest} userRole={rest.userRole} userPlan={userPlan} currentUserId={rest.currentUserId} />
          </div>
        </div>
      </PageTransition>
    </AppShellV2>
  );
}
