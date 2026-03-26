import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import AppShellV2 from "@/components/v2/shell/AppShell";
import PracticePage from "@/components/v2/pages/practice";
export const dynamic = "force-dynamic";
export default async function Page() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard/practice");
  return <AppShellV2><PracticePage /></AppShellV2>;
}
