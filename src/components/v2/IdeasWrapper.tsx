"use client";
import AppShellV2 from "./shell/AppShell";
import { DashboardVersionToggle } from "@/components/DashboardVersionToggle";
import IdeasPageClient from "@/components/IdeasPageClient";

export default function IdeasV2() {
  return (
    <AppShellV2 breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Ideas" }]}>
      <DashboardVersionToggle />
      <IdeasPageClient />
    </AppShellV2>
  );
}
