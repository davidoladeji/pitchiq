import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import AppShellV2 from "@/components/v2/shell/AppShell";
import InvestorsPage from "@/components/v2/pages/investors";

export const dynamic = "force-dynamic";

export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard/investor-match");
  return <AppShellV2><InvestorsPage /></AppShellV2>;
}
