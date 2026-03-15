"use client";

import Link from "next/link";
import AppNav from "@/components/AppNav";

interface DeckSummary {
  id: string;
  shareId: string;
  title: string;
  companyName: string;
  themeId: string;
  piqScore: string;
  isPremium: boolean;
  createdAt: string;
  viewCount: number;
}

function parsePiqOverall(piqJson: string): number | null {
  try {
    const parsed = JSON.parse(piqJson);
    return typeof parsed.overall === "number" ? parsed.overall : null;
  } catch {
    return null;
  }
}

export default function DashboardClient({
  decks,
  userName,
}: {
  decks: DeckSummary[];
  userName: string;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:rounded-lg focus:ring-2 focus:ring-electric focus:ring-offset-2 focus:bg-white focus:font-medium focus:text-navy"
      >
        Skip to main content
      </a>
      <AppNav
        actions={
          <Link
            href="/create"
            aria-label="Create new pitch deck"
            className="min-h-[44px] inline-flex items-center px-5 py-2.5 rounded-lg bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-light hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          >
            New Deck
          </Link>
        }
      />

      <main id="main" tabIndex={-1} className="pt-24 pb-16 px-4 sm:px-6 outline-none">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-navy mb-1 tracking-tight">
            Hey {userName}
          </h1>
          <p className="text-gray-500 text-sm mb-8">
            {decks.length === 0
              ? "You haven't created any decks yet."
              : `${decks.length} deck${decks.length === 1 ? "" : "s"}`}
          </p>

          {decks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-electric/5 border border-electric/10 flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-electric"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4.5v15m7.5-7.5h-15"
                  />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-navy mb-2">
                Create your first deck
              </h2>
              <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                Describe your startup and get an AI-generated pitch deck with a
                PIQ Score in 60 seconds.
              </p>
              <Link
                href="/create"
                aria-label="Create your first pitch deck"
                className="inline-flex items-center px-6 py-3 rounded-xl bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-light hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
              >
                Create Deck
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {decks.map((deck) => {
                const piqOverall = parsePiqOverall(deck.piqScore);
                return (
                  <Link
                    key={deck.id}
                    href={`/deck/${deck.shareId}`}
                    aria-label={`View deck: ${deck.title}`}
                    className="group bg-white rounded-2xl border border-gray-100 p-5 sm:p-6 hover:border-electric/20 hover:shadow-card-hover transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h2 className="font-bold text-navy text-base mb-1 truncate group-hover:text-electric transition-colors">
                          {deck.title}
                        </h2>
                        <p className="text-gray-500 text-sm">
                          {deck.companyName}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        {piqOverall !== null && (
                          <div className="text-center">
                            <div className="text-lg font-bold text-electric tabular-nums">
                              {piqOverall}
                            </div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                              PIQ
                            </div>
                          </div>
                        )}
                        <div className="text-center">
                          <div className="text-lg font-bold text-navy tabular-nums">
                            {deck.viewCount}
                          </div>
                          <div className="text-[10px] text-gray-500 uppercase tracking-wider">
                            Views
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                      <span>
                        {new Date(deck.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      <span className="capitalize">{deck.themeId} theme</span>
                      {deck.isPremium && (
                        <span className="px-1.5 py-0.5 rounded bg-electric/8 text-electric font-bold text-[10px] uppercase">
                          Pro
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
