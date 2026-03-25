"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { DashboardVersionProvider } from "@/lib/dashboard-version";
import SuspendedOverlay from "./SuspendedOverlay";

export default function Providers({
  children,
  dashboardVersion = "classic",
}: {
  children: React.ReactNode;
  dashboardVersion?: "classic" | "new";
}) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <DashboardVersionProvider initialVersion={dashboardVersion}>
          {children}
          <SuspendedOverlay />
        </DashboardVersionProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
