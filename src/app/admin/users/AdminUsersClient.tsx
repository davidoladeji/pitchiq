"use client";

import { useState } from "react";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
  suspended: boolean;
  suspendedAt: string | null;
  suspendedReason: string | null;
  lastSeenAt: string | null;
  createdAt: string;
  hasSubscription: boolean;
  deckCount: number;
}

const PLAN_BADGES: Record<string, { bg: string; text: string }> = {
  starter: { bg: "bg-white/5", text: "text-white/40" },
  pro: { bg: "bg-electric/15", text: "text-electric" },
  growth: { bg: "bg-violet/15", text: "text-violet" },
  enterprise: { bg: "bg-amber-500/15", text: "text-amber-400" },
};

function formatRelativeTime(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMo = Math.floor(diffDay / 30);
  if (diffMo < 12) return `${diffMo}mo ago`;
  return new Date(iso).toLocaleDateString();
}

const ROLE_BADGES: Record<string, { bg: string; text: string }> = {
  user: { bg: "bg-white/5", text: "text-white/40" },
  admin: { bg: "bg-red-500/15", text: "text-red-400" },
};

export default function AdminUsersClient({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState("");
  const [editRole, setEditRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<{ id: string; type: "success" | "error"; msg: string } | null>(null);
  const [filterPlan, setFilterPlan] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [suspendModal, setSuspendModal] = useState<{ userId: string; email: string } | null>(null);
  const [suspendReason, setSuspendReason] = useState("");

  const filtered = users.filter((u) => {
    const matchesSearch = !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(search.toLowerCase()));
    const matchesPlan = filterPlan === "all" || filterPlan === "suspended"
      ? true
      : u.plan === filterPlan;
    const matchesSuspended = filterPlan === "suspended" ? u.suspended : true;
    return matchesSearch && matchesPlan && matchesSuspended;
  });

  function startEdit(user: AdminUser) {
    setEditingId(user.id);
    setEditPlan(user.plan);
    setEditRole(user.role);
    setFlash(null);
  }

  async function saveEdit(userId: string) {
    setSaving(true);
    setFlash(null);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: editPlan, role: editRole }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      const updated = await res.json();
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, plan: updated.plan, role: updated.role } : u))
      );
      setEditingId(null);
      setFlash({ id: userId, type: "success", msg: "Updated" });
      setTimeout(() => setFlash(null), 2000);
    } catch (err) {
      setFlash({ id: userId, type: "error", msg: err instanceof Error ? err.message : "Failed" });
    } finally {
      setSaving(false);
    }
  }

  async function handleSuspend(userId: string, suspend: boolean) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          suspended: suspend,
          suspendedReason: suspend ? suspendReason : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed");
      }
      const updated = await res.json();
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                suspended: updated.suspended,
                suspendedAt: updated.suspendedAt,
                suspendedReason: updated.suspendedReason,
              }
            : u
        )
      );
      setFlash({ id: userId, type: "success", msg: suspend ? "Suspended" : "Unsuspended" });
      setTimeout(() => setFlash(null), 2000);
    } catch (err) {
      setFlash({ id: userId, type: "error", msg: err instanceof Error ? err.message : "Failed" });
    } finally {
      setSaving(false);
      setSuspendModal(null);
      setSuspendReason("");
    }
  }

  async function handleDelete(userId: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setConfirmDelete(null);
    } catch (err) {
      setFlash({ id: userId, type: "error", msg: err instanceof Error ? err.message : "Failed" });
      setConfirmDelete(null);
    } finally {
      setSaving(false);
    }
  }

  const planCounts = users.reduce((acc, u) => {
    acc[u.plan] = (acc[u.plan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const suspendedCount = users.filter((u) => u.suspended).length;

  return (
    <section className="space-y-6" aria-labelledby="admin-users-heading">
      {/* Header */}
      <div>
        <h1 id="admin-users-heading" className="text-2xl font-bold text-white">
          Users
        </h1>
        <p className="text-sm text-white/30 mt-1">{users.length.toLocaleString()} total users</p>
      </div>

      {/* Quick stats */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(planCounts).map(([plan, count]) => {
          const style = PLAN_BADGES[plan] || PLAN_BADGES.starter;
          return (
            <button
              type="button"
              key={plan}
              onClick={() => setFilterPlan(filterPlan === plan ? "all" : plan)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold min-h-[44px] transition-all motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 ${
                filterPlan === plan
                  ? `${style.bg} ${style.text} ring-1 ring-current`
                  : `${style.bg} ${style.text} opacity-60 hover:opacity-100`
              }`}
              aria-label={`Filter by ${plan} plan`}
              aria-pressed={filterPlan === plan}
            >
              {plan}: {count}
            </button>
          );
        })}
        {suspendedCount > 0 && (
          <button
            type="button"
            onClick={() => setFilterPlan(filterPlan === "suspended" ? "all" : "suspended")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold min-h-[44px] transition-all motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 ${
              filterPlan === "suspended"
                ? "bg-red-500/15 text-red-400 ring-1 ring-current"
                : "bg-red-500/15 text-red-400 opacity-60 hover:opacity-100"
            }`}
            aria-pressed={filterPlan === "suspended"}
          >
            suspended: {suspendedCount}
          </button>
        )}
        {filterPlan !== "all" && (
          <button
            type="button"
            onClick={() => setFilterPlan("all")}
            className="px-3 py-1.5 rounded-lg text-xs text-white/30 hover:text-white/50 min-h-[44px] transition-colors motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
            aria-label="Clear plan filter"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email or name..."
          className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 outline-none focus:outline-none focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 w-full max-w-md"
          aria-label="Search users by email or name"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">User</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Plan</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Decks</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Last Seen</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Joined</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-white/30 text-sm">
                    {search ? "No users match your search." : "No users yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const isEditing = editingId === u.id;
                  const flashMsg = flash?.id === u.id ? flash : null;
                  const planStyle = PLAN_BADGES[u.plan] || PLAN_BADGES.starter;
                  const roleStyle = ROLE_BADGES[u.role] || ROLE_BADGES.user;

                  return (
                    <tr
                      key={u.id}
                      className={`border-b border-white/5 transition-colors motion-reduce:transition-none ${
                        u.suspended ? "bg-red-500/[0.03]" : "hover:bg-white/[0.02]"
                      }`}
                    >
                      <td className="px-5 py-3">
                        <div>
                          <p className={`text-sm font-medium ${u.suspended ? "text-white/50" : "text-white"}`}>
                            {u.email}
                          </p>
                          {u.name && <p className="text-xs text-white/30">{u.name}</p>}
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        {u.suspended ? (
                          <div>
                            <span className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-500/15 text-red-400">
                              <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9A7.902 7.902 0 014 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1A7.902 7.902 0 0120 12c0 4.42-3.58 8-8 8z" />
                              </svg>
                              Suspended
                            </span>
                            {u.suspendedReason && (
                              <p className="text-[10px] text-red-400/60 mt-0.5 max-w-[120px] truncate" title={u.suspendedReason}>
                                {u.suspendedReason}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-400">
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {isEditing ? (
                          <select
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value)}
                            className="rounded-lg bg-white/10 border border-white/10 px-2 py-1 text-xs text-white outline-none focus:outline-none focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
                            aria-label="Edit user role"
                          >
                            <option value="user" className="bg-navy-950">user</option>
                            <option value="admin" className="bg-navy-950">admin</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${roleStyle.bg} ${roleStyle.text}`}>
                            {u.role}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        {isEditing ? (
                          <select
                            value={editPlan}
                            onChange={(e) => setEditPlan(e.target.value)}
                            className="rounded-lg bg-white/10 border border-white/10 px-2 py-1 text-xs text-white outline-none focus:outline-none focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
                            aria-label="Edit user plan"
                          >
                            <option value="starter" className="bg-navy-950">starter</option>
                            <option value="pro" className="bg-navy-950">pro</option>
                            <option value="growth" className="bg-navy-950">growth</option>
                            <option value="enterprise" className="bg-navy-950">enterprise</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className={`inline-flex items-center rounded-lg px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${planStyle.bg} ${planStyle.text}`}>
                              {u.plan}
                            </span>
                            {u.hasSubscription && (
                              <span className="text-[10px] text-emerald-400" title="Active subscription">
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-white/50">{u.deckCount}</span>
                      </td>
                      <td className="px-5 py-3">
                        {u.lastSeenAt ? (
                          <span className="text-xs text-white/50" title={new Date(u.lastSeenAt).toLocaleString()}>
                            {formatRelativeTime(u.lastSeenAt)}
                          </span>
                        ) : (
                          <span className="text-xs text-white/20">Never</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-white/30">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => saveEdit(u.id)}
                                disabled={saving}
                                className="inline-flex items-center justify-center gap-2 min-h-[36px] px-3 py-1.5 rounded-lg bg-electric text-xs font-semibold text-white shadow-lg shadow-electric/25 hover:bg-electric-600 disabled:opacity-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-electric"
                              >
                                {saving ? "..." : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                disabled={saving}
                                className="px-2.5 py-1.5 rounded-lg bg-white/5 text-xs text-white/50 hover:text-white transition-colors disabled:opacity-50 focus:outline-none"
                              >
                                Cancel
                              </button>
                            </>
                          ) : confirmDelete === u.id ? (
                            <>
                              <span className="text-xs text-red-400 font-medium">Delete?</span>
                              <button
                                type="button"
                                onClick={() => handleDelete(u.id)}
                                disabled={saving}
                                className="px-2.5 py-1.5 rounded-lg bg-red-500/20 text-xs font-semibold text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 focus:outline-none"
                              >
                                {saving ? "..." : "Yes, delete"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDelete(null)}
                                className="px-2.5 py-1.5 rounded-lg bg-white/5 text-xs text-white/50 hover:text-white transition-colors focus:outline-none"
                              >
                                No
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => startEdit(u)}
                                className="px-2.5 py-1.5 rounded-lg bg-white/5 text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors focus:outline-none"
                                title="Edit plan & role"
                              >
                                Edit
                              </button>
                              {u.suspended ? (
                                <button
                                  type="button"
                                  onClick={() => handleSuspend(u.id, false)}
                                  disabled={saving}
                                  className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors disabled:opacity-50 focus:outline-none"
                                  title="Unsuspend account"
                                >
                                  Unsuspend
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSuspendModal({ userId: u.id, email: u.email });
                                    setSuspendReason("");
                                  }}
                                  className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-xs font-medium text-amber-400 hover:bg-amber-500/20 transition-colors focus:outline-none"
                                  title="Suspend account"
                                >
                                  Suspend
                                </button>
                              )}
                              {u.role !== "admin" && (
                                <button
                                  type="button"
                                  onClick={() => setConfirmDelete(u.id)}
                                  className="px-2.5 py-1.5 rounded-lg bg-red-500/10 text-xs font-medium text-red-400 hover:bg-red-500/20 transition-colors focus:outline-none"
                                  title="Delete account"
                                >
                                  Delete
                                </button>
                              )}
                            </>
                          )}
                          {flashMsg && (
                            <span className={`text-xs font-semibold ${flashMsg.type === "success" ? "text-emerald-400" : "text-red-400"}`}>
                              {flashMsg.msg}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspend modal */}
      {suspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#1A1A24] border border-white/10 rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-white mb-1">Suspend Account</h2>
            <p className="text-sm text-white/40 mb-4">
              Suspending <span className="text-white/70 font-medium">{suspendModal.email}</span> will
              freeze their account. They can still log in but cannot use any features.
            </p>
            <label className="block text-xs text-white/50 mb-1.5 font-medium">
              Reason (optional)
            </label>
            <textarea
              value={suspendReason}
              onChange={(e) => setSuspendReason(e.target.value)}
              placeholder="e.g. Terms of service violation, payment dispute..."
              rows={3}
              className="w-full rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/25 px-3 py-2 outline-none focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric resize-none mb-4"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSuspendModal(null)}
                className="px-4 py-2 rounded-lg bg-white/5 text-sm text-white/50 hover:text-white transition-colors focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSuspend(suspendModal.userId, true)}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-red-500/20 text-sm font-semibold text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50 focus:outline-none"
              >
                {saving ? "Suspending..." : "Suspend Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
