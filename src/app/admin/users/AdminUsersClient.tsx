"use client";

import { useState } from "react";

interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  plan: string;
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

  const filtered = users.filter((u) => {
    const matchesSearch = !search ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.name && u.name.toLowerCase().includes(search.toLowerCase()));
    const matchesPlan = filterPlan === "all" || u.plan === filterPlan;
    return matchesSearch && matchesPlan;
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

  const planCounts = users.reduce((acc, u) => {
    acc[u.plan] = (acc[u.plan] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
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
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 ${
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
        {filterPlan !== "all" && (
          <button
            type="button"
            onClick={() => setFilterPlan("all")}
            className="px-3 py-1.5 rounded-lg text-xs text-white/30 hover:text-white/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
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
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Role</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Plan</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Decks</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Joined</th>
                <th className="px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-white/30 text-sm">
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
                    <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-3">
                        <div>
                          <p className="text-sm font-medium text-white">{u.email}</p>
                          {u.name && <p className="text-xs text-white/30">{u.name}</p>}
                        </div>
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
                        <span className="text-xs text-white/30">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          {isEditing ? (
                            <>
                              <button
                                type="button"
                                onClick={() => saveEdit(u.id)}
                                disabled={saving}
                                className="px-2.5 py-1 rounded-lg bg-electric text-xs font-semibold text-white hover:bg-electric-600 disabled:opacity-50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
                                aria-label={saving ? "Saving" : "Save changes"}
                                aria-busy={saving}
                              >
                                {saving ? "..." : "Save"}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                disabled={saving}
                                className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-white/50 hover:text-white transition-colors disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
                                aria-label="Cancel edit"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            <button
                              type="button"
                              onClick={() => startEdit(u)}
                              className="px-2.5 py-1 rounded-lg bg-white/5 text-xs text-white/50 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
                              aria-label={`Edit user ${u.email}`}
                            >
                              Edit
                            </button>
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
    </div>
  );
}
