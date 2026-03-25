"use client";

import { useDashboardVersion } from "@/lib/dashboard-version";

export default function DashboardVersionGate({
  classicComponent,
  newComponent,
}: {
  classicComponent: React.ReactNode;
  newComponent: React.ReactNode;
}) {
  const { version } = useDashboardVersion();
  return <>{version === "new" ? newComponent : classicComponent}</>;
}
