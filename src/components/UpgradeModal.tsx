"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  X,
  Sparkles,
  Calendar,
  Coins,
  ArrowRight,
  Lock,
} from "lucide-react";
import { DEFAULT_PASS_TIERS } from "@/lib/payg-config";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
  requiredPlan?: string;
  creditCost?: number;
}

export default function UpgradeModal({
  open,
  onClose,
  feature,
  requiredPlan,
  creditCost,
}: UpgradeModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  // Find the cheapest pass that meets the required plan
  const planRank: Record<string, number> = {
    starter: 0,
    pro: 1,
    growth: 2,
    enterprise: 3,
  };
  const requiredRank = planRank[requiredPlan ?? "pro"] ?? 1;

  const suggestedTier = DEFAULT_PASS_TIERS.find((t) => {
    const tierPlanRank = planRank[t.equivalentPlan] ?? 0;
    return tierPlanRank >= requiredRank;
  });

  const passFromPrice = suggestedTier
    ? ((suggestedTier.baseDayRateCents * suggestedTier.durationMultipliers[1]) / 100).toFixed(2)
    : "5.00";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-modal-title"
        className="relative w-full max-w-lg bg-[#0d1321] border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-[#4361EE]/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-[#4361EE]" />
          </div>
          <div>
            <h2
              id="upgrade-modal-title"
              className="text-lg font-bold text-white"
            >
              Unlock {feature || "this feature"}
            </h2>
            {requiredPlan && (
              <p className="text-xs text-white/40 mt-0.5">
                Requires{" "}
                <span className="capitalize font-medium text-white/60">
                  {requiredPlan}
                </span>{" "}
                plan or higher
              </p>
            )}
          </div>
        </div>

        {/* Three option cards */}
        <div className="space-y-3">
          {/* 1. Subscribe */}
          <Link
            href="/#pricing"
            onClick={onClose}
            className="group flex items-center gap-4 rounded-xl bg-white/[0.02] border border-white/5 p-4 hover:bg-white/[0.04] hover:border-white/10 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-[#4361EE]/10 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#4361EE]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white">Subscribe</h3>
              <p className="text-xs text-white/40 mt-0.5">
                Best for regular use &mdash; monthly plans with full feature access
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-[#4361EE] transition-colors shrink-0" />
          </Link>

          {/* 2. Get a Pass */}
          <Link
            href="/#payg"
            onClick={onClose}
            className="group flex items-center gap-4 rounded-xl bg-white/[0.02] border border-white/5 p-4 hover:bg-white/[0.04] hover:border-white/10 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-violet-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white">Get a Pass</h3>
              <p className="text-xs text-white/40 mt-0.5">
                Best for one-time projects &mdash;{" "}
                {suggestedTier?.name ?? "Pass"} from ${passFromPrice}/day
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-violet-400 transition-colors shrink-0" />
          </Link>

          {/* 3. Use Credits */}
          <Link
            href="/dashboard/credits"
            onClick={onClose}
            className="group flex items-center gap-4 rounded-xl bg-white/[0.02] border border-white/5 p-4 hover:bg-white/[0.04] hover:border-white/10 transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Coins className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white">Use Credits</h3>
              <p className="text-xs text-white/40 mt-0.5">
                Best for occasional use
                {creditCost ? (
                  <> &mdash; {creditCost} credit{creditCost !== 1 ? "s" : ""} needed</>
                ) : null}
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-amber-400 transition-colors shrink-0" />
          </Link>
        </div>
      </div>
    </div>
  );
}
