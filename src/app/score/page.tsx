import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import ScorePageClient from "@/components/ScorePageClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Score Your Pitch Deck — PitchIQ",
  description:
    "Upload your existing pitch deck and get an instant PIQ fundability score with actionable feedback.",
};

export default async function ScorePage() {
  let userPlan = "starter";

  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id?: string })?.id;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { plan: true },
      });
      userPlan = user?.plan || "starter";
    }
  } catch {
    // default to starter
  }

  return <ScorePageClient userPlan={userPlan} />;
}
