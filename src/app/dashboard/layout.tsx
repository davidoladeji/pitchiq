import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import DashboardShellClient from "@/components/v2/shell/DashboardShellClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) redirect("/auth/signin");

  // Read version from cookie first (fast path — no DB query)
  const cookieStore = await cookies();
  const versionCookie = cookieStore.get("dashboard_version")?.value;

  let isV2: boolean;
  if (versionCookie === "new" || versionCookie === "classic") {
    // Cookie exists — trust it, skip DB
    isV2 = versionCookie === "new";
  } else {
    // First visit or no cookie — check DB once
    // Cookie will be set client-side by DashboardVersionProvider on mount
    let dbVersion = "classic";
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { dashboardVersion: true },
      });
      dbVersion = user?.dashboardVersion || "classic";
    } catch { /* default to classic */ }
    isV2 = dbVersion === "new";
  }

  if (isV2) {
    return <DashboardShellClient />;
  }

  return <>{children}</>;
}
