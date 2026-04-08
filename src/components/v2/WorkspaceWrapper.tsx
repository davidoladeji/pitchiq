"use client";
import AppShellV2 from "./shell/AppShell";

interface Props {
  children: React.ReactNode;
}

export default function WorkspaceV2({ children }: Props) {
  return (
    <AppShellV2 breadcrumbs={[{ label: "Dashboard", href: "/dashboard" }, { label: "Team" }]}>
      {children}
    </AppShellV2>
  );
}
