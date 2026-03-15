import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import DashboardClient from "@/components/DashboardClient";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { upgraded?: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const [decks, user] = await Promise.all([
    prisma.deck.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        shareId: true,
        title: true,
        companyName: true,
        themeId: true,
        piqScore: true,
        isPremium: true,
        createdAt: true,
        _count: { select: { views: true } },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, stripeSubscriptionId: true },
    }),
  ]);

  const serialized = decks.map((d) => ({
    id: d.id,
    shareId: d.shareId,
    title: d.title,
    companyName: d.companyName,
    themeId: d.themeId,
    piqScore: d.piqScore,
    isPremium: d.isPremium,
    createdAt: d.createdAt.toISOString(),
    viewCount: d._count.views,
  }));

  return (
    <DashboardClient
      decks={serialized}
      userName={session.user.name || "there"}
      plan={user?.plan || "starter"}
      hasSubscription={!!user?.stripeSubscriptionId}
      upgradedPlan={searchParams.upgraded}
    />
  );
}
