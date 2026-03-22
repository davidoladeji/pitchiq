"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Coins, AlertTriangle, Loader2, X } from "lucide-react";

interface CreditConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: string;
  creditCost: number;
  currentBalance: number;
  loading?: boolean;
}

export default function CreditConfirmModal({
  open,
  onClose,
  onConfirm,
  action,
  creditCost,
  currentBalance,
  loading = false,
}: CreditConfirmModalProps) {
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

  // Trap focus inside modal
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

  const insufficient = currentBalance < creditCost;
  const balanceAfter = currentBalance - creditCost;

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
        aria-labelledby="credit-confirm-title"
        className="w-full max-w-sm bg-[#0d1321] border border-white/10 rounded-2xl p-6 shadow-2xl"
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-white/30 hover:text-white/60 transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
            <Coins className="w-5 h-5 text-amber-400" />
          </div>
          <h2
            id="credit-confirm-title"
            className="text-lg font-bold text-white"
          >
            Use Credits?
          </h2>
        </div>

        {/* Body */}
        <p className="text-sm text-white/60 leading-relaxed mb-4">
          This will use{" "}
          <span className="font-semibold text-white">{creditCost} credit{creditCost !== 1 ? "s" : ""}</span>{" "}
          for{" "}
          <span className="font-semibold text-white">{action}</span>.
        </p>

        <div className="rounded-xl bg-white/[0.03] border border-white/5 p-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/50">Your balance</span>
            <span className="font-semibold text-white tabular-nums">
              {currentBalance}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-white/50">After use</span>
            <span
              className={`font-semibold tabular-nums ${insufficient ? "text-red-400" : "text-white"}`}
            >
              {insufficient ? "Insufficient" : balanceAfter}
            </span>
          </div>
        </div>

        {/* Insufficient warning */}
        {insufficient && (
          <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 p-3 mb-4">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-400">
              Not enough credits. You need {creditCost - currentBalance} more
              credit{creditCost - currentBalance !== 1 ? "s" : ""}.
            </p>
          </div>
        )}

        {/* Footer buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-white/[0.04] text-white/60 text-sm font-medium hover:bg-white/[0.08] hover:text-white/80 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={insufficient || loading}
            className="flex-1 inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#4361EE] text-white text-sm font-semibold shadow-sm hover:bg-[#3651DE] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Coins className="w-4 h-4" />
            )}
            {loading ? "Using..." : "Use Credits"}
          </button>
        </div>

        {/* Pass upsell */}
        <Link
          href="/#payg"
          className="block text-center text-xs text-[#4361EE] hover:text-[#3651DE] mt-4 transition-colors"
        >
          Or get a pass for unlimited access &rarr;
        </Link>
      </div>
    </div>
  );
}
