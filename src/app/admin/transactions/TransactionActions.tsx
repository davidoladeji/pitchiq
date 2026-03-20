"use client";

import { useState } from "react";
import Link from "next/link";

export default function TransactionActions() {
  const [syncing, setSyncing] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleSync() {
    setSyncing(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/stripe-sync", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, message: `Synced ${data.synced} transaction(s) from Stripe.` });
        if (data.synced > 0) {
          // Reload to show new transactions
          window.location.reload();
        }
      } else {
        setResult({ ok: false, message: data.error || "Sync failed" });
      }
    } catch {
      setResult({ ok: false, message: "Network error" });
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
      <Link
        href="/admin/webhooks"
        className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
      >
        Webhook not working? Check webhook configuration &rarr;
      </Link>
      <div className="flex items-center gap-3">
        {result && (
          <span className={`text-xs ${result.ok ? "text-emerald-400" : "text-red-400"}`}>
            {result.message}
          </span>
        )}
        <button
          onClick={handleSync}
          disabled={syncing}
          className="rounded-xl bg-[#4361EE] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4361EE]/90 transition-colors disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "Sync from Stripe"}
        </button>
      </div>
    </div>
  );
}
