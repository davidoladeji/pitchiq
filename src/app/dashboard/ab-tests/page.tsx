import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import AppShellV2 from "@/components/v2/shell/AppShell";
import ABTestsPage from "@/components/v2/pages/ab-tests";
export const dynamic = "force-dynamic";
export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard/ab-tests");
  return <AppShellV2><ABTestsPage /></AppShellV2>;
}
