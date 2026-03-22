"use client";

import { useState, useEffect, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PassRow {
  id: string;
  userId: string;
  tier: string;
  startsAt: string;
  expiresAt: string;
  durationDays: number;
  amountCents: number;
  currency: string;
  status: string;
  autoRenew: boolean;
  createdAt: string;
  user: { email: string; name: string | null } | null;
}

interface Stats {
  passCount: number;
  passRevenueCents: number;
  activePassesByTier: { tier: string; count: number }[];
  creditPurchaseRevenueCents: number;
  creditsSold: number;
  creditsConsumed: number;
  creditsByAction: { action: string | null; totalUsed: number; count: number }[];
  usersWithCredits: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function daysLeft(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

function statusBadgeClass(status: string): string {
  switch (status) {
    case "active":
      return "bg-emerald-500/15 text-emerald-400 border-emerald-500/20";
    case "expired":
      return "bg-white/5 text-white/30 border-white/10";
    case "refunded":
      return "bg-red-500/15 text-red-400 border-red-500/20";
    default:
      return "bg-white/5 text-white/30 border-white/10";
  }
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  sub,
}: {
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-white/30">
        {label}
      </p>
      <p className="text-2xl font-bold text-white mt-1 tabular-nums">
        {value}
      </p>
      {sub && <p className="text-xs text-white/25 mt-0.5">{sub}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function StatSkeleton() {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-4 animate-pulse motion-reduce:animate-none">
      <div className="h-3 w-20 bg-white/5 rounded" />
      <div className="h-7 w-24 bg-white/5 rounded mt-2" />
    </div>
  );
}

function TableSkeleton() {
  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/5 p-6 animate-pulse motion-reduce:animate-none">
      <div className="h-4 w-40 bg-white/5 rounded mb-4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 py-3">
          <div className="h-3 w-40 bg-white/5 rounded" />
          <div className="h-3 w-16 bg-white/5 rounded" />
          <div className="h-3 w-20 bg-white/5 rounded" />
          <div className="h-3 w-20 bg-white/5 rounded" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Extend Modal
// ---------------------------------------------------------------------------

function ExtendModal({
  pass,
  onClose,
  onExtended,
}: {
  pass: PassRow;
  onClose: () => void;
  onExtended: () => void;
}) {
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExtend() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/payg/passes/${pass.id}/extend`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ days }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to extend pass");
      }
      onExtended();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to extend");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#0d1321] border border-white/10 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-lg font-semibold text-white mb-1">Extend Pass</h3>
        <p className="text-sm text-white/40 mb-4">
          {pass.user?.email ?? pass.userId} &mdash; {pass.tier}
        </p>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-2 text-sm text-red-400 mb-3">
            {error}
          </div>
        )}

        <label className="block text-xs text-white/50 mb-1">
          Days to extend
        </label>
        <input
          type="number"
          min={1}
          max={365}
          value={days}
          onChange={(e) => setDays(Number(e.target.value) || 1)}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white mb-4"
        />

        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-white/40 hover:text-white/60 transition-colors px-4 py-2"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExtend}
            disabled={loading}
            className="bg-electric text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-electric/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Extending..." : "Extend"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function AdminPaygClient() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [passes, setPasses] = useState<PassRow[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPasses, setLoadingPasses] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState("all");
  const [tierFilter, setTierFilter] = useState("");

  // Grant credits form
  const [grantEmail, setGrantEmail] = useState("");
  const [grantAmount, setGrantAmount] = useState(10);
  const [grantReason, setGrantReason] = useState("");
  const [granting, setGranting] = useState(false);
  const [grantFlash, setGrantFlash] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // Create pass form
  const [createEmail, setCreateEmail] = useState("");
  const [createTier, setCreateTier] = useState("basic");
  const [createDays, setCreateDays] = useState(7);
  const [creating, setCreating] = useState(false);
  const [createFlash, setCreateFlash] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Extend modal
  const [extendPass, setExtendPass] = useState<PassRow | null>(null);

  // Action flash
  const [actionFlash, setActionFlash] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // ── Fetch stats ──
  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/payg/stats");
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  // ── Fetch passes ──
  const fetchPasses = useCallback(async () => {
    setLoadingPasses(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (tierFilter) params.set("tier", tierFilter);
      params.set("limit", "100");

      const res = await fetch(
        `/api/admin/payg/passes?${params.toString()}`,
      );
      if (!res.ok) throw new Error("Failed");
      const data = await res.json();
      setPasses(data.passes ?? []);
    } catch {
      setPasses([]);
    } finally {
      setLoadingPasses(false);
    }
  }, [statusFilter, tierFilter]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchPasses();
  }, [fetchPasses]);

  // ── Revoke pass ──
  async function handleRevoke(pass: PassRow) {
    if (!confirm(`Revoke pass for ${pass.user?.email ?? pass.userId}?`)) return;
    setActionFlash(null);
    try {
      const res = await fetch(`/api/admin/payg/passes/${pass.id}/revoke`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to revoke");
      }
      setActionFlash({ type: "success", msg: "Pass revoked" });
      fetchPasses();
      fetchStats();
    } catch (err) {
      setActionFlash({
        type: "error",
        msg: err instanceof Error ? err.message : "Failed to revoke",
      });
    }
  }

  // ── Grant credits ──
  async function handleGrant(e: React.FormEvent) {
    e.preventDefault();
    setGranting(true);
    setGrantFlash(null);

    try {
      // Look up userId by email first
      const lookupRes = await fetch(
        `/api/admin/payg/credits/grant`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: grantEmail.trim(),
            amount: grantAmount,
            reason: grantReason.trim() || undefined,
          }),
        },
      );

      if (!lookupRes.ok) {
        const data = await lookupRes.json().catch(() => ({}));
        throw new Error(data.error || "Failed to grant credits");
      }

      const data = await lookupRes.json();
      setGrantFlash({
        type: "success",
        msg: `Granted ${grantAmount} credits to ${data.email ?? grantEmail}. New balance: ${data.newBalance}`,
      });
      setGrantEmail("");
      setGrantAmount(10);
      setGrantReason("");
      fetchStats();
    } catch (err) {
      setGrantFlash({
        type: "error",
        msg: err instanceof Error ? err.message : "Failed to grant credits",
      });
    } finally {
      setGranting(false);
    }
  }

  // ── Create pass ──
  async function handleCreatePass(e: React.FormEvent) {
    e.preventDefault();
    if (!createEmail.trim()) return;
    setCreating(true);
    setCreateFlash(null);
    try {
      const res = await fetch("/api/admin/payg/passes/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: createEmail.trim(), tier: createTier, durationDays: createDays }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create pass");
      setCreateFlash({ type: "success", msg: `Pass created for ${createEmail.trim()} — ${createTier} for ${createDays} days` });
      setCreateEmail("");
      fetchPasses();
      fetchStats();
    } catch (err) {
      setCreateFlash({ type: "error", msg: err instanceof Error ? err.message : "Failed to create pass" });
    } finally {
      setCreating(false);
    }
  }

  // ── Active passes count ──
  const activePassCount =
    stats?.activePassesByTier.reduce((sum, g) => sum + g.count, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">PAYG Management</h1>
        <p className="text-sm text-white/30 mt-1">
          Period passes, credits, and usage analytics
        </p>
      </div>

      {/* ── Stats Row ── */}
      {loadingStats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <StatSkeleton key={i} />
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard
            label="Active Passes"
            value={activePassCount}
            sub={`${stats.passCount} total`}
          />
          <StatCard
            label="Pass Revenue"
            value={formatCents(stats.passRevenueCents)}
          />
          <StatCard
            label="Credits Sold"
            value={stats.creditsSold.toLocaleString()}
          />
          <StatCard
            label="Credits Used"
            value={stats.creditsConsumed.toLocaleString()}
          />
          <StatCard
            label="Users w/ Credits"
            value={stats.usersWithCredits}
          />
          <StatCard
            label="Credit Revenue"
            value={formatCents(stats.creditPurchaseRevenueCents)}
          />
        </div>
      ) : (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-400">
          Failed to load stats
        </div>
      )}

      {/* ── Credits by Action (collapsible summary) ── */}
      {stats && stats.creditsByAction.length > 0 && (
        <div className="rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-3">
            Credit Usage by Action
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {stats.creditsByAction.map((a) => (
              <div key={a.action} className="text-sm">
                <span className="text-white/60">{a.action ?? "unknown"}</span>
                <span className="block text-white font-semibold tabular-nums">
                  {a.totalUsed.toLocaleString()} credits
                </span>
                <span className="text-[11px] text-white/25">
                  {a.count} transactions
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Create Pass Form ── */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-3">
          Create Period Pass
        </h3>
        {createFlash && (
          <div className={`rounded-lg px-3 py-2 text-xs mb-3 ${createFlash.type === "success" ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400" : "bg-red-500/10 border border-red-500/20 text-red-400"}`}>
            {createFlash.msg}
          </div>
        )}
        <form onSubmit={handleCreatePass} className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[11px] text-white/30 mb-1">User Email</label>
            <input
              type="email"
              value={createEmail}
              onChange={(e) => setCreateEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#4361EE]"
            />
          </div>
          <div className="w-32">
            <label className="block text-[11px] text-white/30 mb-1">Tier</label>
            <select
              value={createTier}
              onChange={(e) => setCreateTier(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            >
              <option value="basic">Basic</option>
              <option value="growth">Growth</option>
              <option value="full">Full</option>
            </select>
          </div>
          <div className="w-24">
            <label className="block text-[11px] text-white/30 mb-1">Days</label>
            <input
              type="number"
              value={createDays}
              onChange={(e) => setCreateDays(Number(e.target.value))}
              min={1}
              max={365}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            />
          </div>
          <button
            type="submit"
            disabled={creating || !createEmail.trim()}
            className="px-4 py-2 rounded-xl bg-[#4361EE] text-white text-sm font-semibold hover:bg-[#3651d4] disabled:opacity-40 transition-colors"
          >
            {creating ? "Creating..." : "Create Pass"}
          </button>
        </form>
      </div>

      {/* ── Action flash ── */}
      {actionFlash && (
        <div
          className={`rounded-xl px-4 py-2.5 text-sm ${
            actionFlash.type === "success"
              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border border-red-500/20 text-red-400"
          }`}
        >
          {actionFlash.msg}
        </div>
      )}

      {/* ── Passes Table ── */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex flex-col md:flex-row md:items-center gap-3">
          <h2 className="text-sm font-semibold text-white">Period Passes</h2>
          <div className="flex gap-2 ml-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="refunded">Refunded</option>
            </select>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs text-white"
            >
              <option value="">All tiers</option>
              <option value="basic">Basic</option>
              <option value="growth">Growth</option>
              <option value="full">Full</option>
            </select>
          </div>
        </div>

        {loadingPasses ? (
          <TableSkeleton />
        ) : passes.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-white/30">
            No passes found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left">
                  <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/30">
                    User
                  </th>
                  <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/30">
                    Tier
                  </th>
                  <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/30">
                    Starts
                  </th>
                  <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/30">
                    Expires
                  </th>
                  <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/30">
                    Days Left
                  </th>
                  <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/30">
                    Paid
                  </th>
                  <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/30">
                    Status
                  </th>
                  <th className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-white/30">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {passes.map((pass) => (
                  <tr
                    key={pass.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3 text-white/70 max-w-[200px] truncate">
                      {pass.user?.email ?? pass.userId}
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-xs font-medium text-white/50 bg-white/5 px-2 py-0.5 rounded">
                        {pass.tier}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-white/40 text-xs tabular-nums">
                      {formatDate(pass.startsAt)}
                    </td>
                    <td className="px-3 py-3 text-white/40 text-xs tabular-nums">
                      {formatDate(pass.expiresAt)}
                    </td>
                    <td className="px-3 py-3 text-white/50 text-xs tabular-nums">
                      {pass.status === "active"
                        ? daysLeft(pass.expiresAt)
                        : "—"}
                    </td>
                    <td className="px-3 py-3 text-white/50 text-xs tabular-nums">
                      {formatCents(pass.amountCents)}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${statusBadgeClass(pass.status)}`}
                      >
                        {pass.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => setExtendPass(pass)}
                          disabled={pass.status === "refunded"}
                          className="text-[11px] text-electric hover:text-electric/80 transition-colors disabled:text-white/10 disabled:cursor-not-allowed"
                        >
                          Extend
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRevoke(pass)}
                          disabled={pass.status === "refunded"}
                          className="text-[11px] text-red-400 hover:text-red-300 transition-colors disabled:text-white/10 disabled:cursor-not-allowed"
                        >
                          Revoke
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Grant Credits ── */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 px-5 py-5">
        <h2 className="text-sm font-semibold text-white mb-4">
          Grant Credits
        </h2>

        {grantFlash && (
          <div
            className={`rounded-xl px-4 py-2.5 text-sm mb-4 ${
              grantFlash.type === "success"
                ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}
          >
            {grantFlash.msg}
          </div>
        )}

        <form onSubmit={handleGrant} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-[11px] text-white/40 mb-1">
              User ID
            </label>
            <input
              type="text"
              value={grantEmail}
              onChange={(e) => setGrantEmail(e.target.value)}
              placeholder="user-uuid-here"
              required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20"
            />
          </div>
          <div className="w-28">
            <label className="block text-[11px] text-white/40 mb-1">
              Credits
            </label>
            <input
              type="number"
              min={1}
              max={10000}
              value={grantAmount}
              onChange={(e) => setGrantAmount(Number(e.target.value) || 1)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white"
            />
          </div>
          <div className="flex-1">
            <label className="block text-[11px] text-white/40 mb-1">
              Reason (optional)
            </label>
            <input
              type="text"
              value={grantReason}
              onChange={(e) => setGrantReason(e.target.value)}
              placeholder="Comp for support issue"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-white/20"
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={granting || !grantEmail.trim()}
              className="bg-electric text-white text-sm font-medium px-5 py-2 rounded-xl hover:bg-electric/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {granting ? "Granting..." : "Grant Credits"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Extend Modal ── */}
      {extendPass && (
        <ExtendModal
          pass={extendPass}
          onClose={() => setExtendPass(null)}
          onExtended={() => {
            setExtendPass(null);
            setActionFlash({ type: "success", msg: "Pass extended" });
            fetchPasses();
            fetchStats();
          }}
        />
      )}
    </div>
  );
}
