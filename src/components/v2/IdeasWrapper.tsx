"use client";
import AppShellV2 from "./shell/AppShell";
import { DashboardVersionToggle } from "@/components/DashboardVersionToggle";
import IdeasPageV2 from "@/components/v2/pages/ideas";

export default function IdeasV2() {
  return (
    <AppShellV2 breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Ideas" }]}>
      <DashboardVersionToggle />
      <IdeasPageV2 />
    </AppShellV2>
  );
}
