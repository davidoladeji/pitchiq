"use client";

import Link from "next/link";

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

function scoreRingColor(score: number): string {
  if (score >= 80) return "stroke-green-500";
  if (score >= 60) return "stroke-blue-500";
  if (score >= 40) return "stroke-orange-500";
  return "stroke-red-500";
}

function scoreBgColor(score: number): string {
  if (score >= 80) return "text-green-600";
  if (score >= 60) return "text-blue-600";
  if (score >= 40) return "text-orange-500";
  return "text-red-500";
}

function ScoreRing({ score }: { score: number }) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-12 h-12 shrink-0">
      <svg className="w-12 h-12 -rotate-90" viewBox="0 0 44 44">
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth="3"
        />
        <circle
          cx="22"
          cy="22"
          r={radius}
          fill="none"
          className={scoreRingColor(score)}
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold tabular-nums ${scoreBgColor(score)}`}>
        {score}
      </div>
    </div>
  );
}

export default function DashboardDeckGrid({ decks }: { decks: DeckSummary[] }) {
  if (decks.length === 0) {
    return (
      <section aria-label="Your decks">
        <h2 className="text-lg font-bold text-[#09090B] font-display mb-4">Your Decks</h2>
        <div className="bg-white rounded-2xl border border-[#e5e7eb] p-10 sm:p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#4361ee]/5 border border-[#4361ee]/10 flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-[#4361ee]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-[#09090B] mb-2">Create your first deck</h3>
          <p className="text-sm text-[#6b7280] mb-5 max-w-sm mx-auto">
            Describe your startup and get an AI-generated pitch deck with a PIQ Score in 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/create"
              className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 rounded-xl bg-[#4361ee] text-white text-sm font-semibold shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              Create Deck
            </Link>
            <Link
              href="/ideas"
              className="inline-flex items-center justify-center min-h-[44px] px-5 py-2.5 rounded-xl border border-[#e5e7eb] text-[#6b7280] text-sm font-medium hover:border-[#4361ee]/30 hover:text-[#4361ee] transition-all"
            >
              Explore ideas first
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Your decks">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-[#09090B] font-display">Your Decks</h2>
        <span className="text-xs text-[#6b7280]">{decks.length} deck{decks.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="grid gap-3">
        {decks.map((deck) => {
          const piqOverall = parsePiqOverall(deck.piqScore);
          return (
            <div
              key={deck.id}
              className="group bg-white rounded-2xl border border-[#e5e7eb] p-4 sm:p-5 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="flex items-center gap-4">
                {/* Score ring */}
                {piqOverall !== null && <ScoreRing score={piqOverall} />}

                {/* Title + meta */}
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/deck/${deck.shareId}`}
                    className="font-bold text-[#09090B] text-sm sm:text-base hover:text-[#4361ee] transition-colors truncate block"
                  >
                    {deck.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-[#6b7280]">{deck.companyName}</span>
                    <span className="text-[#e5e7eb]">|</span>
                    <span className="text-xs text-[#6b7280] capitalize">{deck.themeId}</span>
                    {deck.isPremium && (
                      <span className="px-1.5 py-0.5 rounded bg-[#4361ee]/8 text-[#4361ee] font-bold text-[10px] uppercase">
                        Pro
                      </span>
                    )}
                  </div>
                </div>

                {/* View count */}
                <div className="text-center shrink-0 hidden sm:block">
                  <div className="text-sm font-bold text-[#09090B] tabular-nums">{deck.viewCount}</div>
                  <div className="text-[10px] text-[#6b7280] uppercase tracking-wider">Views</div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/editor/${deck.shareId}`}
                    className="hidden sm:inline-flex items-center px-3 py-1.5 rounded-lg border border-[#e5e7eb] text-xs font-medium text-[#6b7280] hover:border-[#4361ee]/30 hover:text-[#4361ee] transition-all"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/deck/${deck.shareId}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#4361ee]/5 text-xs font-medium text-[#4361ee] hover:bg-[#4361ee]/10 transition-all"
                  >
                    View
                  </Link>
                </div>
              </div>

              {/* Bottom row: date + mobile views */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f3f4f6]">
                <span className="text-[11px] text-[#6b7280]">
                  {new Date(deck.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="text-[11px] text-[#6b7280] sm:hidden tabular-nums">
                  {deck.viewCount} view{deck.viewCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
