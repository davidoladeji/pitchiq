"use client";
import AppShellV2 from "./shell/AppShell";
import IdeasPageV2 from "@/components/v2/pages/ideas";

export default function IdeasV2() {
  return (
    <AppShellV2 breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Ideas" }]}>
      <IdeasPageV2 />
    </AppShellV2>
  );
}
