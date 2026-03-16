"use client";

import { useEffect, useState } from "react";

type SettingRow = { key: string; value: string; masked: boolean };

export default function AdminSettingsPage() {
  const [list, setList] = useState<SettingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formValue, setFormValue] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setList(data);
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(key: string) {
    setSaveError("");
    setSaveSuccess("");
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, value: formValue }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setSaveError(data.error || "Save failed");
      return;
    }
    setList((prev) =>
      prev.map((r) =>
        r.key === key
          ? { ...r, value: r.masked ? formValue.slice(0, 7) + "..." + formValue.slice(-4) : formValue }
          : r
      )
    );
    setEditing(null);
    setFormValue("");
    setSaveSuccess(`${key.replace(/_/g, " ")} updated successfully`);
    setTimeout(() => setSaveSuccess(""), 3000);
  }

  const ENV_VARS = [
    { key: "DATABASE_URL", label: "Database URL", value: process.env.DATABASE_URL ? "Configured" : "Not set", type: "env" },
    { key: "ADMIN_SESSION_SECRET", label: "Admin Session Secret", value: "Configured (hidden)", type: "env" },
    { key: "NEXTAUTH_SECRET", label: "NextAuth Secret", value: "Configured (hidden)", type: "env" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-white/30 mt-1">Manage system configuration</p>
      </div>

      {/* Alerts */}
      {saveError && (
        <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3">
          <p className="text-sm text-red-400">{saveError}</p>
        </div>
      )}
      {saveSuccess && (
        <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3">
          <p className="text-sm text-emerald-400">{saveSuccess}</p>
        </div>
      )}

      {/* Stripe Keys */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white">Payment Configuration</h2>
          <p className="text-xs text-white/30 mt-0.5">Stripe API keys for payment processing</p>
        </div>
        <div className="p-6 space-y-5">
          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-3 bg-white/5 rounded w-32 mb-2" />
                  <div className="h-10 bg-white/5 rounded-xl" />
                </div>
              ))}
            </div>
          ) : (
            ["stripe_publishable_key", "stripe_secret_key"].map((key) => {
              const row = list.find((r) => r.key === key);
              const isEditing = editing === key;
              const isSecret = key === "stripe_secret_key";

              return (
                <div key={key}>
                  <label className="block text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">
                    {key.replace(/_/g, " ")}
                  </label>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type={isSecret ? "password" : "text"}
                        value={formValue}
                        onChange={(e) => setFormValue(e.target.value)}
                        placeholder={isSecret ? "sk_live_..." : "pk_live_..."}
                        className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
                      />
                      <button
                        onClick={() => handleSave(key)}
                        className="px-4 py-2.5 rounded-xl bg-electric text-white text-sm font-semibold hover:bg-electric-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setEditing(null); setFormValue(""); }}
                        className="px-4 py-2.5 rounded-xl bg-white/5 text-white/50 text-sm hover:text-white transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <div className="flex-1 rounded-xl border border-white/5 bg-white/[0.02] px-4 py-2.5">
                        <span className="font-mono text-sm text-white/40">
                          {row?.value || "(not set)"}
                        </span>
                      </div>
                      <button
                        onClick={() => { setEditing(key); setFormValue(""); setSaveError(""); }}
                        className="px-4 py-2.5 rounded-xl bg-white/5 text-white/50 text-sm font-medium hover:text-white hover:bg-white/10 transition-colors"
                      >
                        {row?.value ? "Change" : "Set"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Environment */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-sm font-semibold text-white">Environment</h2>
          <p className="text-xs text-white/30 mt-0.5">Server environment variables (read-only)</p>
        </div>
        <div className="p-6 space-y-3">
          {ENV_VARS.map((env) => (
            <div key={env.key} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div>
                <p className="text-xs font-mono text-white/50">{env.key}</p>
              </div>
              <span className="text-xs text-emerald-400/60 font-medium">{env.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Danger Zone */}
      <div className="rounded-2xl bg-red-500/5 border border-red-500/10 overflow-hidden">
        <div className="px-6 py-4 border-b border-red-500/10">
          <h2 className="text-sm font-semibold text-red-400">Danger Zone</h2>
          <p className="text-xs text-red-400/40 mt-0.5">Destructive actions</p>
        </div>
        <div className="p-6">
          <p className="text-xs text-white/30 mb-3">
            To reset the admin password, update the user record via the database or re-run the seed endpoint.
          </p>
          <code className="block text-xs text-white/20 bg-white/[0.03] rounded-lg p-3 font-mono">
            POST /api/admin/seed (requires ALLOW_ADMIN_SEED=true in env)
          </code>
        </div>
      </div>
    </div>
  );
}
