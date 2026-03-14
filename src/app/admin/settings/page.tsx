"use client";

import { useEffect, useState } from "react";

type SettingRow = { key: string; value: string; masked: boolean };

export default function AdminSettingsPage() {
  const [list, setList] = useState<SettingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<string | null>(null);
  const [formValue, setFormValue] = useState("");
  const [saveError, setSaveError] = useState("");

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
        r.key === key ? { ...r, value: r.masked ? formValue.slice(0, 7) + "••••••••" + formValue.slice(-4) : formValue } : r
      )
    );
    setEditing(null);
    setFormValue("");
  }

  if (loading) return <p className="text-gray-500">Loading…</p>;

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-gray-900">Settings</h1>
      <p className="mb-4 text-sm text-gray-600">
        Payment keys are stored server-side only. Secret key is never shown in full.
      </p>
      {saveError && (
        <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{saveError}</p>
      )}

      <div className="space-y-4">
        {["stripe_publishable_key", "stripe_secret_key"].map((key) => {
          const row = list.find((r) => r.key === key);
          const isEditing = editing === key;
          return (
            <div key={key} className="rounded-lg border bg-white p-4">
              <label className="block text-sm font-medium text-gray-700">
                {key.replace(/_/g, " ")}
              </label>
              {isEditing ? (
                <div className="mt-2 flex gap-2">
                  <input
                    type={key === "stripe_secret_key" ? "password" : "text"}
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    placeholder={key === "stripe_secret_key" ? "sk_live_…" : "pk_live_…"}
                    className="flex-1 rounded border border-gray-300 px-3 py-2"
                  />
                  <button
                    type="button"
                    onClick={() => handleSave(key)}
                    className="rounded bg-gray-900 px-3 py-2 text-white hover:bg-gray-800"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditing(null); setFormValue(""); }}
                    className="rounded border px-3 py-2 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2">
                  <span className="font-mono text-sm text-gray-600">
                    {row?.value ?? "(not set)"}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setEditing(key); setFormValue(""); }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {row ? "Change" : "Set"}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
