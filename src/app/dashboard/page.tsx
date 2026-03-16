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

  const [decks, user, recentViews] = await Promise.all([
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
    // Fetch recent views across all user decks for the activity feed
    prisma.view.findMany({
      where: {
        deck: { userId: session.user.id },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        createdAt: true,
        deck: {
          select: { title: true },
        },
      },
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

  // Build activity feed from recent views + deck creations
  const viewActivities = recentViews.map((v) => ({
    type: "view" as const,
    title: "Someone viewed your deck",
    deckTitle: v.deck.title,
    time: v.createdAt.toISOString(),
  }));

  const deckCreationActivities = decks.slice(0, 5).map((d) => ({
    type: "created" as const,
    title: "You created a new deck",
    deckTitle: d.title,
    time: d.createdAt.toISOString(),
  }));

  // Deck scoring activities (decks with a non-empty piqScore)
  const scoredActivities = decks
    .filter((d) => {
      try {
        const parsed = JSON.parse(d.piqScore);
        return typeof parsed.overall === "number";
      } catch {
        return false;
      }
    })
    .slice(0, 5)
    .map((d) => ({
      type: "scored" as const,
      title: "PIQ scored your deck",
      deckTitle: d.title,
      time: d.createdAt.toISOString(),
    }));

  // Merge and sort by time, take top 10
  const activities = [...viewActivities, ...deckCreationActivities, ...scoredActivities]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10);

  return (
    <DashboardClient
      decks={serialized}
      userName={session.user.name || "there"}
      plan={user?.plan || "starter"}
      hasSubscription={!!user?.stripeSubscriptionId}
      upgradedPlan={searchParams.upgraded}
      activities={activities}
    />
  );
}
