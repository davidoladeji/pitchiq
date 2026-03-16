"use client";

import { useCallback, useEffect, useState } from "react";

interface DomainRecord {
  id: string;
  domain: string;
  status: string;
  verificationToken: string;
  verifiedAt: string | null;
  sslStatus: string;
  createdAt: string;
}

export default function DashboardCustomDomain({ plan }: { plan: string }) {
  const hasAccess = plan === "growth" || plan === "enterprise";

  const [domains, setDomains] = useState<DomainRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchDomains = useCallback(async () => {
    try {
      const res = await fetch("/api/custom-domain");
      if (res.ok) {
        const data = await res.json();
        setDomains(data.domains || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasAccess) fetchDomains();
    else setLoading(false);
  }, [hasAccess, fetchDomains]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    setError("");
    setAdding(true);
    try {
      const res = await fetch("/api/custom-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: newDomain.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to add domain");
      } else {
        setDomains((prev) => [data.domain, ...prev]);
        setNewDomain("");
        setExpandedId(data.domain.id);
      }
    } catch {
      setError("Network error");
    } finally {
      setAdding(false);
    }
  };

  const handleVerify = async (id: string) => {
    setVerifying(id);
    setError("");
    try {
      const res = await fetch(`/api/custom-domain/${id}/verify`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Verification failed");
        // Refresh to pick up status change
        fetchDomains();
      } else {
        setDomains((prev) =>
          prev.map((d) => (d.id === id ? data.domain : d))
        );
      }
    } catch {
      setError("Network error");
    } finally {
      setVerifying(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remove this custom domain?")) return;
    try {
      const res = await fetch(`/api/custom-domain/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDomains((prev) => prev.filter((d) => d.id !== id));
      }
    } catch {
      // ignore
    }
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700",
      active: "bg-emerald/15 text-emerald",
      failed: "bg-red-100 text-red-700",
    };
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${map[status] || "bg-navy-100 text-navy-600"}`}
      >
        {status}
      </span>
    );
  };

  // Locked / gated state
  if (!hasAccess) {
    return (
      <section className="bg-white rounded-2xl border border-navy-200 p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-3">
          <svg
            className="w-5 h-5 text-navy-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0v-9m-4.5 4.5h9"
            />
          </svg>
          <h2 className="text-lg font-bold text-navy">Custom Domain</h2>
        </div>
        <div className="relative overflow-hidden rounded-xl bg-navy-50/60 p-6 text-center">
          <div className="absolute inset-0 backdrop-blur-[2px]" />
          <div className="relative z-10">
            <svg
              className="mx-auto mb-2 h-8 w-8 text-navy-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
            <p className="text-sm text-navy-500">
              Serve decks from your own domain.{" "}
              <span className="font-semibold text-navy">
                Available on Growth &amp; Enterprise.
              </span>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white rounded-2xl border border-navy-200 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <svg
          className="w-5 h-5 text-navy-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 21a9 9 0 100-18 9 9 0 000 18zm0 0v-9m-4.5 4.5h9"
          />
        </svg>
        <h2 className="text-lg font-bold text-navy">Custom Domain</h2>
      </div>

      {/* Add domain form */}
      <form onSubmit={handleAdd} className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="decks.yourcompany.com"
          value={newDomain}
          onChange={(e) => setNewDomain(e.target.value)}
          className="flex-1 rounded-lg border border-navy-200 bg-navy-50/40 px-3 py-2 text-sm text-navy placeholder:text-navy-400 focus:border-electric focus:outline-none focus:ring-1 focus:ring-electric"
        />
        <button
          type="submit"
          disabled={adding || !newDomain.trim()}
          className="rounded-lg bg-electric px-4 py-2 text-sm font-semibold text-white transition hover:bg-electric/90 disabled:opacity-50"
        >
          {adding ? "Adding..." : "Add Domain"}
        </button>
      </form>

      {error && (
        <p className="mb-3 text-sm text-red-600">{error}</p>
      )}

      {/* Domain list */}
      {loading ? (
        <div className="py-8 text-center text-sm text-navy-400">
          Loading domains...
        </div>
      ) : domains.length === 0 ? (
        <div className="py-8 text-center text-sm text-navy-400">
          No custom domains yet. Add one above to serve your decks from your own
          domain.
        </div>
      ) : (
        <ul className="space-y-3">
          {domains.map((d) => (
            <li
              key={d.id}
              className="rounded-xl border border-navy-100 bg-navy-50/30 p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {d.status === "active" && (
                    <svg
                      className="h-4 w-4 text-emerald-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M4.5 12.75l6 6 9-13.5"
                      />
                    </svg>
                  )}
                  <span className="font-medium text-navy text-sm">
                    {d.domain}
                  </span>
                  {statusBadge(d.status)}
                </div>
                <div className="flex items-center gap-2">
                  {d.status !== "active" && (
                    <button
                      type="button"
                      onClick={() => handleVerify(d.id)}
                      disabled={verifying === d.id}
                      aria-label={verifying === d.id ? "Verifying DNS" : "Verify DNS for this domain"}
                      className="rounded-lg border border-electric/30 bg-electric/5 px-3 py-1 text-xs font-semibold text-electric transition hover:bg-electric/10 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    >
                      {verifying === d.id ? "Verifying..." : "Verify DNS"}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedId(expandedId === d.id ? null : d.id)
                    }
                    aria-expanded={expandedId === d.id}
                    aria-label={expandedId === d.id ? "Hide DNS info" : "Show DNS info"}
                    className="rounded-lg border border-navy-200 px-3 py-1 text-xs font-medium text-navy-500 transition hover:bg-navy-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    {expandedId === d.id ? "Hide" : "DNS Info"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(d.id)}
                    aria-label="Remove this custom domain"
                    className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-500 transition hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* DNS instructions */}
              {expandedId === d.id && (
                <div className="mt-3 rounded-lg bg-navy-50 border border-navy-100 p-3">
                  <p className="text-xs font-semibold text-navy-600 mb-1">
                    DNS Configuration
                  </p>
                  <div className="space-y-1 text-xs text-navy-500">
                    <p>
                      <span className="font-medium">Type:</span> TXT
                    </p>
                    <p>
                      <span className="font-medium">Name:</span>{" "}
                      <code className="rounded bg-navy-100 px-1 py-0.5 text-navy font-mono">
                        _pitchiq-verify.{d.domain}
                      </code>
                    </p>
                    <p>
                      <span className="font-medium">Value:</span>{" "}
                      <code className="rounded bg-navy-100 px-1 py-0.5 text-navy font-mono break-all">
                        {d.verificationToken}
                      </code>
                    </p>
                  </div>
                  <p className="mt-2 text-xs text-navy-400">
                    Also add a CNAME record pointing{" "}
                    <code className="font-mono">{d.domain}</code> to{" "}
                    <code className="font-mono">cname.pitchiq.com</code>. DNS
                    changes can take up to 48 hours to propagate.
                  </p>
                </div>
              )}

              {/* Active domain message */}
              {d.status === "active" && (
                <p className="mt-2 text-xs text-emerald-600">
                  Your decks are accessible at{" "}
                  <code className="font-mono font-medium">
                    https://{d.domain}/
                    <span className="text-navy-400">{"<shareId>"}</span>
                  </code>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
