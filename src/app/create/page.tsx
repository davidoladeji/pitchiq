import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import CreatePageV2 from "@/components/v2/CreatePageClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Create deck | PitchIQ",
  description:
    "Create your AI-powered pitch deck in 60 seconds. Get a fundability-ready deck and your PIQ Score.",
};

export default async function CreatePage() {
  let userPlan = "starter";
  let deckCount = 0;

  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (userId) {
      const [user, count] = await Promise.all([
        prisma.user.findUnique({
          where: { id: userId },
          select: { plan: true },
        }),
        prisma.deck.count({ where: { userId } }),
      ]);
      userPlan = user?.plan || "starter";
      deckCount = count;
    }
  } catch {
    // If auth/db fails, default to starter
  }

  return <CreatePageV2 userPlan={userPlan} deckCount={deckCount} />;
}
