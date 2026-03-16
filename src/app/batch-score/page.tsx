import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-limits";
import BatchScoreClient from "@/components/BatchScoreClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Batch Scoring — PitchIQ",
  description:
    "Score multiple pitch decks at once with PitchIQ batch scoring.",
};

export default async function BatchScorePage() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  if (!userId) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  const plan = user?.plan || "starter";
  const limits = getPlanLimits(plan);

  // Load recent batch jobs
  const recentJobs = await prisma.batchJob.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const serializedJobs = recentJobs.map((j) => ({
    id: j.id,
    name: j.name,
    status: j.status,
    totalDecks: j.totalDecks,
    completed: j.completed,
    failed: j.failed,
    results: JSON.parse(j.results),
    createdAt: j.createdAt.toISOString(),
  }));

  return (
    <BatchScoreClient
      plan={plan}
      batchEnabled={limits.batchScoring}
      maxBatchSize={limits.maxBatchSize}
      initialJobs={serializedJobs}
    />
  );
}
