import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/next-auth";
import { prisma } from "@/lib/db";
import { getPlanLimits } from "@/lib/plan-limits";
import { SlideData } from "@/lib/types";
import PitchPracticeClient from "@/components/PitchPracticeClient";
import AppNav from "@/components/AppNav";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Practice pitch | PitchIQ",
  description:
    "Practice your pitch with AI-powered timing and feedback. Growth plan feature.",
};

export default async function PracticePage({
  params,
}: {
  params: { shareId: string };
}) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string })?.id;

  if (!userId) {
    redirect(`/auth/signin?callbackUrl=/practice/${params.shareId}`);
  }

  // Load deck by shareId
  const deck = await prisma.deck.findUnique({
    where: { shareId: params.shareId },
    select: {
      id: true,
      shareId: true,
      title: true,
      companyName: true,
      slides: true,
      themeId: true,
      userId: true,
    },
  });

  if (!deck) {
    redirect("/dashboard");
  }

  // Verify ownership
  if (deck.userId !== userId) {
    redirect("/dashboard");
  }

  // Check plan
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true, name: true },
  });
  const plan = user?.plan || "starter";
  const limits = getPlanLimits(plan);

  let slides: SlideData[] = [];
  try {
    slides = JSON.parse(deck.slides);
  } catch {
    slides = [];
  }

  // Load past sessions for this deck (table may not exist if migration hasn't run)
  let pastSessions: { id: string; duration: number; aiFeedback: string; status: string; createdAt: Date }[] = [];
  try {
    pastSessions = await prisma.pitchPracticeSession.findMany({
      where: { userId, deckId: deck.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        duration: true,
        aiFeedback: true,
        status: true,
        createdAt: true,
      },
    });
  } catch {
    pastSessions = [];
  }

  const formattedSessions = pastSessions.map((s) => {
    let score: number | null = null;
    try {
      const fb = JSON.parse(s.aiFeedback);
      if (fb.overallScore) score = fb.overallScore;
    } catch {
      // ignore
    }
    return {
      id: s.id,
      duration: s.duration,
      score,
      status: s.status,
      createdAt: s.createdAt.toISOString(),
    };
  });

  if (!limits.pitchPractice) {
    return (
      <div className="min-h-screen bg-navy-50">
        <AppNav />
        <main id="main" tabIndex={-1} className="max-w-3xl mx-auto px-4 pt-24 pb-16 text-center" aria-label="Main content">
          <div className="rounded-2xl border border-navy-100 bg-white p-10 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-violet-100 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-navy">Pitch Practice</h1>
            <p className="text-navy-500 max-w-md mx-auto">
              Practice your pitch with AI-powered feedback on pacing, timing, and delivery.
              Available on Growth and Enterprise plans.
            </p>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-electric text-white font-semibold hover:bg-electric-600 transition-colors"
            >
              Upgrade to Growth
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  if (slides.length === 0) {
    return (
      <div className="min-h-screen bg-navy-50">
        <AppNav />
        <main id="main" tabIndex={-1} className="max-w-3xl mx-auto px-4 pt-24 pb-16 text-center" aria-label="Main content">
          <div className="rounded-2xl border border-navy-100 bg-white p-10 space-y-4">
            <h1 className="text-2xl font-bold text-navy">No Slides Found</h1>
            <p className="text-navy-500">This deck has no slides to practice with.</p>
            <Link
              href={`/deck/${deck.shareId}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-electric text-white font-semibold hover:bg-electric-600 transition-colors"
            >
              View Deck
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <PitchPracticeClient
      deck={{
        id: deck.id,
        shareId: deck.shareId,
        title: deck.title,
        companyName: deck.companyName,
        slides,
        themeId: deck.themeId,
      }}
      pastSessions={formattedSessions}
    />
  );
}
