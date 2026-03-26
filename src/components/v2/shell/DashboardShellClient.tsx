"use client";

import { DashboardDataProvider } from "./DashboardDataContext";
import { DashboardTabProvider } from "./DashboardTabContext";
import AppShellV2 from "./AppShell";
import DashboardTabRenderer from "./DashboardTabRenderer";

/* ------------------------------------------------------------------ */
/*  Dashboard Shell Client — composes contexts + shell + tab renderer  */
/* ------------------------------------------------------------------ */

export default function DashboardShellClient() {
  return (
    <DashboardDataProvider>
      <DashboardTabProvider>
        <AppShellV2>
          <DashboardTabRenderer />
        </AppShellV2>
      </DashboardTabProvider>
    </DashboardDataProvider>
  );
}
