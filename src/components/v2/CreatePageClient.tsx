"use client";

import { DashboardVersionToggle } from "@/components/DashboardVersionToggle";
import AppShellV2 from "./shell/AppShell";

/**
 * v2 Create Page — wraps the existing CreatePageClient in the new app shell.
 * The form itself (DeckForm) is reused from classic — only the chrome changes.
 * A full form redesign (progressive single-page) is Phase 3.2 (future).
 */

// Import the existing form — it's shared between classic and v2
import DeckForm from "@/components/DeckForm";
import { SlideData } from "@/lib/types";
import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  userPlan?: string;
  deckCount?: number; // eslint-disable-line @typescript-eslint/no-unused-vars
  userName?: string;
}

export default function CreatePageV2({ userPlan = "starter", userName }: Props) {
  const router = useRouter();
  const [deck, setDeck] = useState<{
    shareId: string;
    slides: SlideData[];
    piqScore?: unknown;
  } | null>(null);

  const handleGenerated = useCallback(
    (data: { shareId: string; slides: SlideData[]; piqScore?: unknown }) => {
      setDeck(data);
      // Navigate to the new deck
      router.push(`/deck/${data.shareId}`);
    },
    [router],
  );

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

        <div className="mt-4">
          <h1 className="text-2xl font-bold text-navy dark:text-white mb-1">Create Your Pitch Deck</h1>
          <p className="text-sm text-navy-500 dark:text-white/50 mb-6">
            Fill in your company details and let AI craft an investor-ready deck.
          </p>
        </div>

        {!deck ? (
          <div className="bg-[var(--surface-1)] rounded-2xl border border-[var(--border-default)] p-6">
            <DeckForm
              onGenerated={handleGenerated}
              userPlan={userPlan}
            />
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-navy dark:text-white mb-2">Deck Created!</h2>
            <p className="text-sm text-navy-500 dark:text-white/50 mb-6">Redirecting to your new deck...</p>
            <Link
              href={`/deck/${deck.shareId}`}
              className="inline-flex items-center px-4 py-2 rounded-xl bg-electric text-white text-sm font-semibold hover:bg-electric-600 transition-colors"
            >
              View Deck
            </Link>
          </div>
        )}
      </div>
    </AppShellV2>
  );
}
