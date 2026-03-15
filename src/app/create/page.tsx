import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import CreatePageClient from "@/components/CreatePageClient";

export const dynamic = "force-dynamic";

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

  return <CreatePageClient userPlan={userPlan} deckCount={deckCount} />;
}
