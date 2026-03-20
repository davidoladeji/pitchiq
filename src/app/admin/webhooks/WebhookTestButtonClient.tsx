"use client";

import { useState } from "react";

export default function WebhookTestButtonClient() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);

  async function handleTest() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/webhook-test", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setResult({ ok: true, message: `Stripe connected. ${data.eventCount} recent events found.` });
      } else {
        setResult({ ok: false, message: data.error || "Connection failed" });
      }
    } catch {
      setResult({ ok: false, message: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      {result && (
        <span className={`text-xs ${result.ok ? "text-emerald-400" : "text-red-400"}`}>
          {result.message}
        </span>
      )}
      <button
        onClick={handleTest}
        disabled={loading}
        className="rounded-xl bg-[#4361EE] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4361EE]/90 transition-colors disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test Connection"}
      </button>
    </div>
  );
}
