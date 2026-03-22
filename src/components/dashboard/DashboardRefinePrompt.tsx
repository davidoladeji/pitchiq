"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function DashboardRefinePrompt({
  deckShareId,
  deckTitle,
  score,
}: {
  deckShareId: string;
  deckTitle: string;
  score: number;
}) {
  if (score >= 75) return null;

  return (
    <Link
      href={`/score?deck=${deckShareId}&refine=true`}
      title={`Generate an AI-improved version of "${deckTitle}"`}
      className="inline-flex items-center gap-1 text-xs text-[#4361EE] hover:underline transition-colors"
    >
      <Sparkles className="w-3 h-3" />
      <span>Improve</span>
    </Link>
  );
}
