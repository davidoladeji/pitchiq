import type { Metadata } from "next";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import DashboardClient from "@/components/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard | PitchIQ",
  description:
    "Manage your pitch decks, view PIQ scores, and access Pitch Practice and fundraise tools.",
};

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { upgraded?: string };
}) {
  // V2 users: layout renders DashboardShellClient which ignores children.
  // Skip the expensive server-side queries entirely.
  const cookieStore = await cookies();
  if (cookieStore.get("dashboard_version")?.value === "new") {
    return null;
  }

  // Classic dashboard — fetch data server-side
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const results = await Promise.allSettled([
    prisma.deck.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true, shareId: true, title: true, companyName: true,
        themeId: true, piqScore: true, isPremium: true, createdAt: true,
        industry: true, stage: true, fundingTarget: true, investorType: true,
        _count: { select: { views: true } },
      },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, stripeSubscriptionId: true },
    }),
    prisma.view.findMany({
      where: { deck: { userId: session.user.id } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, createdAt: true, deck: { select: { title: true } } },
    }),
    prisma.startupProfile.count({ where: { userId: session.user.id } }),
  ]);

  const decks = results[0].status === "fulfilled" ? results[0].value : [];
  const user = results[1].status === "fulfilled" ? results[1].value : null;
  const recentViews = results[2].status === "fulfilled" ? results[2].value : [];
  const startupProfile = results[3].status === "fulfilled" ? results[3].value : 0;

  const serialized = decks.map((d) => ({
    id: d.id, shareId: d.shareId, title: d.title, companyName: d.companyName,
    themeId: d.themeId, piqScore: d.piqScore, isPremium: d.isPremium,
    createdAt: d.createdAt.toISOString(), viewCount: d._count.views,
    industry: d.industry, stage: d.stage, fundingTarget: d.fundingTarget, investorType: d.investorType,
  }));

  const viewActivities = recentViews.map((v) => ({
    type: "view" as const, title: "Someone viewed your deck",
    deckTitle: v.deck.title, time: v.createdAt.toISOString(),
  }));
  const deckCreationActivities = decks.slice(0, 5).map((d) => ({
    type: "created" as const, title: "You created a new deck",
    deckTitle: d.title, time: d.createdAt.toISOString(),
  }));
  const scoredActivities = decks
    .filter((d) => { try { const p = JSON.parse(d.piqScore); return typeof p.overall === "number"; } catch { return false; } })
    .slice(0, 5)
    .map((d) => ({ type: "scored" as const, title: "PIQ scored your deck", deckTitle: d.title, time: d.createdAt.toISOString() }));

  const activities = [...viewActivities, ...deckCreationActivities, ...scoredActivities]
    .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
    .slice(0, 10);

  return (
    <DashboardClient
      decks={serialized}
      userName={session.user.name || "there"}
      plan={user?.plan || "starter"}
      upgradedPlan={searchParams.upgraded}
      activities={activities}
      hasProfile={startupProfile > 0}
      profileCount={startupProfile}
    />
  );
}
