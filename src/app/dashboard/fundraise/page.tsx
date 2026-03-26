import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import AppShellV2 from "@/components/v2/shell/AppShell";
import FundraisePage from "@/components/v2/pages/fundraise";
export const dynamic = "force-dynamic";
export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard/fundraise");
  return <AppShellV2><FundraisePage /></AppShellV2>;
}
