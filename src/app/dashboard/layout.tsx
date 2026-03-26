import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import DashboardShellClient from "@/components/v2/shell/DashboardShellClient";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) redirect("/auth/signin");

  // Check dashboard version preference
  let isV2 = false;
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { dashboardVersion: true },
    });
    isV2 = user?.dashboardVersion === "new";
  } catch {
    // Default to classic on error
  }

  if (isV2) {
    // v2: Render tab-based shell — children from route files are not used
    return <DashboardShellClient />;
  }

  // Classic: passthrough to individual route pages
  return <>{children}</>;
}
