"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getPlanLimits } from "@/lib/plan-limits";

interface PracticeSession {
  id: string;
  deckId: string;
  deckTitle: string;
  deckShareId: string;
  companyName: string;
  duration: number;
  status: string;
  aiFeedback: string;
  createdAt: string;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function parseScore(aiFeedback: string): number | null {
  try {
    const fb = JSON.parse(aiFeedback);
    if (typeof fb.overallScore === "number") return fb.overallScore;
  } catch {
    // ignore
  }
  return null;
}

export default function DashboardPitchPractice({
  plan,
  decks,
}: {
  plan: string;
  decks?: { shareId: string; title: string }[];
}) {
  const limits = getPlanLimits(plan);
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch("/api/practice");
      if (!res.ok) return;
      const data = await res.json();
      setSessions((data.sessions || []).slice(0, 3));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (limits.pitchPractice) fetchSessions();
    else setLoading(false);
  }, [limits.pitchPractice, fetchSessions]);

  // Locked state for non-growth users
  if (!limits.pitchPractice) {
    return (
      <section className="rounded-2xl border border-navy-100 bg-white p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-navy flex items-center gap-2">
            <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
            Pitch Practice
          </h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">
            Growth
          </span>
        </div>
        <p className="text-xs text-navy-500 mb-4">
          Practice your pitch with AI feedback on pacing, timing, and delivery.
          Upgrade to Growth to unlock.
        </p>
        <Link
          href="/billing"
          className="min-h-[44px] inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-electric text-white text-sm font-semibold shadow-lg shadow-electric/25 hover:bg-electric-600 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          aria-label="View plans and upgrade to Growth for Pitch Practice"
        >
          Upgrade to Growth
        </Link>
      </section>
    );
  }

  // Determine CTA link
  const practiceLink =
    decks && decks.length > 0 ? `/practice/${decks[0].shareId}` : null;

  return (
    <section className="rounded-2xl border border-navy-100 bg-white p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-navy flex items-center gap-2">
          <svg className="w-5 h-5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
          </svg>
          Pitch Practice
        </h2>
        {practiceLink && (
          <Link
            href={practiceLink}
            className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-4 py-2 rounded-xl bg-electric text-white text-xs font-semibold shadow-lg shadow-electric/25 hover:bg-electric-600 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Practice a deck with AI feedback"
          >
            Practice a Deck
          </Link>
        )}
      </div>

      {loading ? (
        <div className="text-center py-6">
          <div className="w-5 h-5 border-2 border-electric border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-navy-400">No practice sessions yet.</p>
          {practiceLink ? (
            <Link
              href={practiceLink}
              className="text-xs text-electric font-semibold hover:underline mt-1 inline-block"
            >
              Start your first practice
            </Link>
          ) : (
            <p className="text-xs text-navy-300 mt-1">
              Create a deck first, then practice your pitch.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {sessions.map((s) => {
            const score = parseScore(s.aiFeedback);
            return (
              <Link
                key={s.id}
                href={`/practice/${s.deckShareId}`}
                className="flex items-center justify-between p-3 rounded-xl border border-navy-100 hover:bg-navy-50/50 transition-colors group"
              >
                <div className="min-w-0">
                  <span className="text-sm font-medium text-navy group-hover:text-electric transition-colors truncate block">
                    {s.deckTitle}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-navy-400 mt-0.5">
                    <span>{formatTime(s.duration)}</span>
                    <span>&middot;</span>
                    <span>
                      {new Date(s.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <span
                      className={`px-1.5 py-0.5 rounded-full font-semibold ${
                        s.status === "completed"
                          ? "bg-emerald-50 text-emerald-600"
                          : s.status === "in_progress"
                            ? "bg-amber-50 text-amber-600"
                            : "bg-navy-100 text-navy-400"
                      }`}
                    >
                      {s.status === "completed"
                        ? "Done"
                        : s.status === "in_progress"
                          ? "In progress"
                          : "Abandoned"}
                    </span>
                  </div>
                </div>
                {score !== null && (
                  <span
                    className={`text-sm font-bold shrink-0 ${
                      score >= 80
                        ? "text-emerald-600"
                        : score >= 60
                          ? "text-amber-600"
                          : "text-red-600"
                    }`}
                  >
                    {score}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
