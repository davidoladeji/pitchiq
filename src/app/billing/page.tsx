import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import BillingClient from "@/components/BillingClient";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/billing");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true,
      planExpiresAt: true,
      createdAt: true,
      _count: { select: { decks: true } },
    },
  });

  return (
    <BillingClient
      plan={user?.plan || "starter"}
      hasSubscription={!!user?.stripeSubscriptionId}
      planExpiresAt={user?.planExpiresAt?.toISOString() || null}
      memberSince={user?.createdAt?.toISOString() || null}
      deckCount={user?._count.decks || 0}
    />
  );
}
