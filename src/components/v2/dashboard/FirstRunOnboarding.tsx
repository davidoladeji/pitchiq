"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

/**
 * First-run onboarding for users with zero decks.
 * Shows 3 action cards + startup profile nudge.
 */

interface FirstRunOnboardingProps {
  userName?: string;
  className?: string;
}

export function FirstRunOnboarding({ userName, className }: FirstRunOnboardingProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.2, 0, 0, 1] }}
      >
        <h1 className="text-2xl font-bold text-navy dark:text-white">
          Welcome to PitchIQ{userName ? `, ${userName}` : ""}
        </h1>
        <p className="text-sm text-navy-500 dark:text-white/50 mt-1">
          Let&apos;s get your fundraising started. Pick how you&apos;d like to begin:
        </p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {ONBOARDING_CARDS.map((card, i) => (
          <motion.div
            key={card.href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 + i * 0.1, ease: [0.2, 0, 0, 1] }}
          >
            <Link href={card.href} className="block group">
              <div className="bg-[var(--surface-1)] rounded-2xl border border-[var(--border-default)] p-5 h-full transition-all hover:border-[var(--border-interactive)] hover:shadow-elevation-2 hover:-translate-y-0.5">
                <div className="w-10 h-10 rounded-xl bg-electric/10 flex items-center justify-center mb-3 text-lg">
                  {card.emoji}
                </div>
                <h3 className="text-sm font-semibold text-navy dark:text-white mb-1 group-hover:text-electric transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-navy-500 dark:text-white/50 leading-relaxed">
                  {card.description}
                </p>
                <div className="mt-3 text-xs font-semibold text-electric">
                  {card.cta} →
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Startup Profile nudge */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5, ease: [0.2, 0, 0, 1] }}
      >
        <Link href="/dashboard/startup-profile" className="block">
          <div className="bg-[var(--surface-1)] rounded-2xl border border-[var(--border-default)] p-4 flex items-center justify-between gap-4 transition-all hover:border-[var(--border-interactive)]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-sm">
                🏢
              </div>
              <div>
                <p className="text-sm font-medium text-navy dark:text-white">Complete your Startup Profile</p>
                <p className="text-xs text-navy-400 dark:text-white/40">Unlock investor matching and personalized recommendations</p>
              </div>
            </div>
            <span className="shrink-0 text-xs font-semibold text-electric">Set Up →</span>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}

const ONBOARDING_CARDS = [
  {
    emoji: "🚀",
    title: "Create a Pitch Deck",
    description: "Build from scratch with AI guidance. Enter your company details and get an investor-ready deck in minutes.",
    cta: "Start",
    href: "/create",
  },
  {
    emoji: "📄",
    title: "Score an Existing Deck",
    description: "Upload your deck and get a PIQ fundability score with actionable improvement suggestions.",
    cta: "Upload",
    href: "/score",
  },
  {
    emoji: "💡",
    title: "Brainstorm Ideas",
    description: "Not sure yet? Let AI help you brainstorm your value proposition, competitive edge, and pitch angle.",
    cta: "Explore",
    href: "/dashboard/ideas",
  },
];
