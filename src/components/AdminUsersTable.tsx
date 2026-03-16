"use client";

import { useState } from "react";

interface AdminUser {
  id: string;
  email: string;
  role: string;
  plan: string;
  createdAt: string;
}

const PLAN_BADGES: Record<string, string> = {
  starter: "bg-gray-100 text-gray-700",
  pro: "bg-blue-100 text-blue-700",
  growth: "bg-purple-100 text-purple-700",
};

const ROLE_BADGES: Record<string, string> = {
  user: "bg-gray-100 text-gray-600",
  admin: "bg-amber-100 text-amber-700",
};

export default function AdminUsersTable({ initialUsers }: { initialUsers: AdminUser[] }) {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPlan, setEditPlan] = useState("");
  const [editRole, setEditRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [flash, setFlash] = useState<{ id: string; type: "success" | "error"; msg: string } | null>(null);

  function startEdit(user: AdminUser) {
    setEditingId(user.id);
    setEditPlan(user.plan);
    setEditRole(user.role);
    setFlash(null);
  }

  function cancelEdit() {
    setEditingId(null);
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

  return (
    <div className="overflow-x-auto rounded-lg border bg-white">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b bg-gray-50">
          <tr>
            <th className="px-4 py-2 font-medium text-gray-700">Email</th>
            <th className="px-4 py-2 font-medium text-gray-700">Role</th>
            <th className="px-4 py-2 font-medium text-gray-700">Plan</th>
            <th className="px-4 py-2 font-medium text-gray-700">Created</th>
            <th className="px-4 py-2 font-medium text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => {
            const isEditing = editingId === u.id;
            const flashMsg = flash?.id === u.id ? flash : null;

            return (
              <tr key={u.id} className="border-b last:border-0">
                <td className="px-4 py-2 font-medium">{u.email}</td>

                {/* Role */}
                <td className="px-4 py-2">
                  {isEditing ? (
                    <select
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                      className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  ) : (
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_BADGES[u.role] || ROLE_BADGES.user}`}>
                      {u.role}
                    </span>
                  )}
                </td>

                {/* Plan */}
                <td className="px-4 py-2">
                  {isEditing ? (
                    <select
                      value={editPlan}
                      onChange={(e) => setEditPlan(e.target.value)}
                      className="rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="starter">starter</option>
                      <option value="pro">pro</option>
                      <option value="growth">growth</option>
                    </select>
                  ) : (
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${PLAN_BADGES[u.plan] || PLAN_BADGES.starter}`}>
                      {u.plan}
                    </span>
                  )}
                </td>

                <td className="px-4 py-2 text-gray-500">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>

                {/* Actions */}
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    {isEditing ? (
                      <>
                        <button
                          onClick={() => saveEdit(u.id)}
                          disabled={saving}
                          className="rounded bg-blue-600 px-3 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                          {saving ? "Saving…" : "Save"}
                        </button>
                        <button
                          onClick={cancelEdit}
                          disabled={saving}
                          className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(u)}
                        className="rounded border border-gray-300 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        Edit
                      </button>
                    )}
                    {flashMsg && (
                      <span
                        className={`text-xs font-medium ${
                          flashMsg.type === "success" ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {flashMsg.msg}
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
