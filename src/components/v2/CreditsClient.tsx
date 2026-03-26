"use client";

import AppShellV2 from "./shell/AppShell";
import { PageTransition } from "./shared/PageTransition";
import { DashboardVersionToggle } from "@/components/DashboardVersionToggle";
import CreditsPageMockup from "./pages/credits";

export default function CreditsV2() {
  return (
    <AppShellV2
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Credits" },
      ]}
    >
      <PageTransition>
        <DashboardVersionToggle />
        <CreditsPageMockup />
      </PageTransition>
    </AppShellV2>
  );
}
