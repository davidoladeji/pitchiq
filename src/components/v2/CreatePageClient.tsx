"use client";

import { DashboardVersionToggle } from "@/components/DashboardVersionToggle";
import AppShellV2 from "./shell/AppShell";
import DeckForm from "@/components/DeckForm";
import GenerationProgress from "@/components/GenerationProgress";
import type { DeckInput, SlideData } from "@/lib/types";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  userPlan?: string;
  deckCount?: number;
  userName?: string;
}

type PageState = "form" | "generating" | "done";

export default function CreatePageV2({ userPlan = "starter", userName }: Props) {
  const router = useRouter();
  const [state, setState] = useState<PageState>("form");
  const [generatingInput, setGeneratingInput] = useState<DeckInput | null>(null);
  const [deck, setDeck] = useState<{
    shareId: string;
    slides: SlideData[];
    piqScore?: unknown;
  } | null>(null);

  // Pro+ users get the skill-powered generation with progress UI
  const enableSkills = userPlan !== "starter";

  const handleGenerated = useCallback(
    (data: { shareId: string; slides: SlideData[]; piqScore?: unknown }) => {
      setDeck(data);
      setState("done");
      // Auto-redirect after a brief pause to show success
      setTimeout(() => router.push(`/deck/${data.shareId}`), 1500);
    },
    [router],
  );

  // For skill-powered generation, intercept the form submission
  // and show GenerationProgress instead of the default inline loading
  const handleFormGenerated = useCallback(
    (data: { shareId: string; slides: SlideData[]; piqScore?: unknown; _input?: DeckInput }) => {
      // If skills are enabled and we have the input, we'd use the streaming
      // endpoint. But since DeckForm already handles the POST internally,
      // we just forward the result.
      handleGenerated(data);
    },
    [handleGenerated],
  );

  // Exposed for future use when DeckForm supports custom submit handlers
  const _handleSkillGeneration = useCallback((input: DeckInput) => {
    setGeneratingInput(input);
    setState("generating");
  }, []);
  void _handleSkillGeneration; // available for future integration

  return (
    <AppShellV2
      userName={userName}
      userPlan={userPlan}
      breadcrumbs={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Create Deck" },
      ]}
    >
      <div className="max-w-4xl mx-auto">
        <DashboardVersionToggle />

        {state === "form" && (
          <>
            <div className="mt-4">
              <h1 className="text-2xl font-bold text-navy dark:text-white mb-1">Create Your Pitch Deck</h1>
              <p className="text-sm text-navy-500 dark:text-white/50 mb-6">
                Fill in your company details and let AI craft an investor-ready deck.
                {enableSkills && (
                  <span className="ml-1 text-electric">
                    Enhanced with market research, competitor analysis, and expert review.
                  </span>
                )}
              </p>
            </div>

            <div className="bg-[var(--surface-1)] rounded-2xl border border-[var(--border-default)] p-6">
              <DeckForm
                onGenerated={handleFormGenerated}
                userPlan={userPlan}
              />
            </div>
          </>
        )}

        {state === "generating" && generatingInput && (
          <div className="mt-8">
            <GenerationProgress
              input={generatingInput}
              enableSkills={enableSkills}
              onComplete={(result) => {
                handleGenerated({
                  shareId: result.shareId,
                  slides: result.slides as SlideData[],
                  piqScore: result.piqScore,
                });
              }}
              onError={(error) => {
                console.error("Generation failed:", error);
                setState("form");
              }}
            />
          </div>
        )}

        {state === "done" && deck && (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-navy dark:text-white mb-2">Deck Created!</h2>
            <p className="text-sm text-navy-500 dark:text-white/50 mb-6">Redirecting to your new deck...</p>
            <Link
              href={`/deck/${deck.shareId}`}
              className="inline-flex items-center px-5 py-2.5 rounded-xl bg-electric text-white text-sm font-semibold hover:bg-electric-600 transition-colors"
            >
              View Deck →
            </Link>
          </div>
        )}
      </div>
    </AppShellV2>
  );
}
