"use client";

import { Clock, Coins } from "lucide-react";

import { Badge } from "@/components/v2/ui/badge";
import { Card, CardContent } from "@/components/v2/ui/card";
import { useToast } from "@/components/v2/ui/toast";

/* ────────────────────── Mock data ────────────────────────── */

const MOCK_TRANSACTIONS = [
  { label: "Investor Match", amount: -3, timeAgo: "2h ago" },
  { label: "AI Coaching", amount: -1, timeAgo: "5h ago" },
];

/* ═══════════════════ PaygStatusWidget ═══════════════════════ */

export function PaygStatusWidget() {
  const { addToast } = useToast();

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* ── Pass + Credits ─────────────────────────────── */}
          <div className="flex flex-wrap items-center gap-4">
            {/* Active pass */}
            <div className="flex items-center gap-2">
              <Badge variant="primary">Growth Pass</Badge>
              <span className="flex items-center gap-1 text-sm text-neutral-500">
                <Clock size={14} />
                5 days left
              </span>
            </div>

            {/* Divider */}
            <div className="hidden h-5 w-px bg-neutral-200 sm:block" />

            {/* Credit balance */}
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-sm font-semibold text-neutral-900">
                <Coins size={14} className="text-primary-500" />
                23 credits
              </span>
              <button
                onClick={() => addToast({ type: "info", title: "Credit Store", description: "Opening credit pack selection..." })}
                className="text-xs font-medium text-primary-600 hover:underline"
              >
                Buy More
              </button>
            </div>
          </div>

          {/* ── Recent transactions ────────────────────────── */}
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            {MOCK_TRANSACTIONS.map((tx) => (
              <span key={tx.label} className="whitespace-nowrap">
                {tx.label}{" "}
                <span className="text-neutral-700">{tx.amount} credits</span>
                {" "}· {tx.timeAgo}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
