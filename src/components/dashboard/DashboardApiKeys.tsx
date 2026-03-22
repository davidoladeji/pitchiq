"use client";

import { useState, useEffect, useCallback } from "react";

interface ApiKeyItem {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string;
  lastUsedAt: string | null;
  createdAt: string;
  revoked: boolean;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DashboardApiKeys({
  hasApiAccess,
}: {
  hasApiAccess: boolean;
}) {
  const [keys, setKeys] = useState<ApiKeyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKeys = useCallback(async () => {
    try {
      const res = await fetch("/api/api-keys");
      if (!res.ok) return;
      const data = await res.json();
      setKeys(data.keys || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasApiAccess) fetchKeys();
    else setLoading(false);
  }, [hasApiAccess, fetchKeys]);

  async function handleCreate() {
    setError(null);
    setCreating(true);
    try {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newKeyName || "Default" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create key");
        return;
      }
      setRevealedKey(data.key);
      setNewKeyName("");
      fetchKeys();
    } catch {
      setError("Failed to create API key");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(id: string) {
    if (!confirm("Revoke this API key? This cannot be undone.")) return;
    try {
      const res = await fetch(`/api/api-keys/${id}`, { method: "DELETE" });
      if (res.ok) fetchKeys();
    } catch {
      // silently fail
    }
  }

  function handleCopy() {
    if (!revealedKey) return;
    navigator.clipboard.writeText(revealedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // Locked state for non-enterprise users
  if (!hasApiAccess) {
    return (
      <div className="bg-white dark:bg-navy-800 rounded-2xl border border-navy-200 dark:border-white/10 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-lg font-bold text-navy dark:text-white">API Access</h2>
        </div>
        <div className="text-center py-8">
          <div className="w-12 h-12 rounded-full bg-navy-100 dark:bg-navy-900 flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>
          <p className="text-navy-600 dark:text-navy-200 text-sm mb-1 font-medium">Enterprise Feature</p>
          <p className="text-navy-400 text-xs mb-4">
            Programmatic access to deck generation and scoring via REST API.
          </p>
          <a
            href="/pricing"
            className="min-h-[44px] inline-flex items-center justify-center px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-electric shadow-lg shadow-electric/25 hover:bg-electric-600 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            aria-label="Upgrade to Enterprise for API access"
          >
            Upgrade to Enterprise
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-navy-800 rounded-2xl border border-navy-200 dark:border-white/10 p-5 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-electric" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <h2 className="text-lg font-bold text-navy dark:text-white">API Keys</h2>
        </div>
        <a
          href="/docs/api"
          className="text-xs text-electric hover:underline font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded"
          aria-label="View API documentation"
        >
          View Docs
        </a>
      </div>

      {/* Revealed key banner */}
      {revealedKey && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-xs font-semibold text-amber-800 mb-2">
            Copy your API key now. It will not be shown again.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-white dark:bg-navy-900 border border-amber-300 dark:border-amber-600 rounded-lg px-3 py-2 font-mono text-navy dark:text-white break-all select-all">
              {revealedKey}
            </code>
            <button
              type="button"
              onClick={handleCopy}
              className="flex-shrink-0 px-3 py-2 text-xs font-semibold rounded-lg bg-navy text-white hover:bg-navy-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label={copied ? "Copied" : "Copy API key"}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setRevealedKey(null)}
            className="mt-2 text-xs text-amber-600 hover:text-amber-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded"
            aria-label="Dismiss revealed key message"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Create form */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Key name (optional)"
          value={newKeyName}
          onChange={(e) => setNewKeyName(e.target.value)}
          className="flex-1 text-sm border border-navy-200 dark:border-white/10 rounded-lg px-3 py-2 text-navy dark:text-white dark:bg-navy-900 placeholder:text-navy-300 dark:placeholder:text-navy-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-navy-800 focus-visible:border-electric"
          maxLength={100}
          aria-label="API key name (optional)"
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="flex-shrink-0 min-h-[44px] px-5 py-2.5 text-sm font-semibold rounded-xl bg-electric text-white shadow-lg shadow-electric/25 hover:bg-electric-600 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:pointer-events-none focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          aria-label={creating ? "Creating API key" : "Create API key"}
          aria-busy={creating}
        >
          {creating ? "Creating..." : "Create Key"}
        </button>
      </div>

      {error && (
        <p className="text-xs text-red-600 mb-3">{error}</p>
      )}

      {/* Keys list */}
      {loading ? (
        <>
          <p className="sr-only" role="status" aria-live="polite">
            Loading API keys
          </p>
          <div className="space-y-2" aria-hidden="true">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl border border-navy-200 dark:border-white/10 bg-white dark:bg-navy-800"
              >
                <div className="min-w-0 flex-1">
                  <div className="h-4 w-32 rounded bg-navy-100 dark:bg-navy-900 animate-pulse motion-reduce:animate-none" />
                  <div className="flex items-center gap-3 mt-2">
                    <div className="h-3 w-24 rounded bg-navy-50 dark:bg-navy-950 animate-pulse motion-reduce:animate-none" />
                    <div className="h-3 w-20 rounded bg-navy-50 dark:bg-navy-950 animate-pulse motion-reduce:animate-none" />
                  </div>
                </div>
                <div className="h-6 w-14 rounded bg-navy-100 dark:bg-navy-900 animate-pulse motion-reduce:animate-none flex-shrink-0" />
              </div>
            ))}
          </div>
        </>
      ) : keys.length === 0 ? (
        <div className="py-8 text-center text-navy-400 text-sm">
          No API keys yet. Create one to get started.
        </div>
      ) : (
        <div className="space-y-2">
          {keys.map((k) => (
            <div
              key={k.id}
              className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border ${
                k.revoked
                  ? "border-navy-100 dark:border-white/5 bg-navy-50 dark:bg-navy-950 opacity-60"
                  : "border-navy-200 dark:border-white/10 bg-white dark:bg-navy-800"
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-navy dark:text-white truncate">
                    {k.name}
                  </span>
                  {k.revoked && (
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-red-500 bg-red-50 px-1.5 py-0.5 rounded">
                      Revoked
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <code className="text-xs text-navy-500 dark:text-navy-300 font-mono">
                    {k.keyPrefix}...
                  </code>
                  <span className="text-[11px] text-navy-400">
                    Created {formatDate(k.createdAt)}
                  </span>
                  {k.lastUsedAt && (
                    <span className="text-[11px] text-navy-400">
                      Last used {formatDate(k.lastUsedAt)}
                    </span>
                  )}
                </div>
              </div>
              {!k.revoked && (
                <button
                  type="button"
                  onClick={() => handleRevoke(k.id)}
                  className="flex-shrink-0 text-xs text-red-500 hover:text-red-700 font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded"
                  aria-label={`Revoke API key ${k.name}`}
                >
                  Revoke
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
