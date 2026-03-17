import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-limits";
import { DeckData, SlideData, PIQScore } from "@/lib/types";
import EditorShell from "@/components/editor/EditorShell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Edit deck | PitchIQ",
  description:
    "Edit your pitch deck slides, theme, and content. Export to PDF or PPTX.",
};

export default async function EditorPage({
  params,
}: {
  params: { shareId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, plan: true, name: true },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  const limits = getPlanLimits(user.plan);
  if (!limits.editor) {
    redirect("/pricing?reason=editor");
  }

  const deck = await prisma.deck.findUnique({
    where: { shareId: params.shareId },
  });

  if (!deck) {
    redirect("/dashboard");
  }

  if (deck.userId !== session.user.id) {
    redirect("/dashboard");
  }

  let slides: SlideData[] = [];
  try {
    slides = JSON.parse(deck.slides);
  } catch {
    slides = [];
  }

  let piqScore: PIQScore | undefined;
  try {
    const parsed = JSON.parse(deck.piqScore);
    if (parsed.overall) piqScore = parsed;
  } catch {
    piqScore = undefined;
  }

  const deckData: DeckData = {
    id: deck.id,
    shareId: deck.shareId,
    title: deck.title,
    companyName: deck.companyName,
    slides,
    createdAt: deck.createdAt.toISOString(),
    isPremium: deck.isPremium,
    themeId: deck.themeId,
    piqScore,
  };

  return (
    <EditorShell
      deck={deckData}
      plan={user.plan}
      userName={user.name || "there"}
    />
  );
}
