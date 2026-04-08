"use client";

import AppShellV2 from "./shell/AppShell";
import { PageTransition } from "./shared/PageTransition";
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
        <CreditsPageMockup />
      </PageTransition>
    </AppShellV2>
  );
}
