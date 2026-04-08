import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/next-auth";
import DashboardShellClient from "@/components/v2/shell/DashboardShellClient";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;
  if (!userId) redirect("/auth/signin");

  return <DashboardShellClient />;
}
