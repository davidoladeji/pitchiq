"use client";

import { useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";

interface Member {
  id: string;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
}

interface DeckSummary {
  id: string;
  shareId: string;
  title: string;
  companyName: string;
  themeId: string;
  piqScore: string;
  createdAt: string;
  viewCount: number;
}

interface WorkspaceData {
  id: string;
  name: string;
  slug: string;
  role: string;
  isOwner: boolean;
  members: Member[];
  decks: DeckSummary[];
  pendingInvites: number;
}

export default function WorkspaceDashboardClient({
  workspace,
}: {
  workspace: WorkspaceData;
}) {
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("editor");
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteSuccess, setInviteSuccess] = useState("");
  const [members, setMembers] = useState(workspace.members);

  const canManage = workspace.role === "owner" || workspace.role === "editor";
  const canAdmin = workspace.role === "owner";

  async function handleInvite() {
    if (!inviteEmail.trim()) return;
    setInviting(true);
    setInviteError("");
    setInviteSuccess("");

    try {
      const res = await fetch(`/api/workspace/${workspace.slug}/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to send invite");
      }

      setInviteSuccess(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (e) {
      setInviteError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setInviting(false);
    }
  }

  async function handleRemoveMember(memberId: string) {
    if (!confirm("Remove this member?")) return;
    try {
      const res = await fetch(`/api/workspace/${workspace.slug}/members/${memberId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
      }
    } catch {
      // silently fail
    }
  }

  async function handleRoleChange(memberId: string, newRole: string) {
    try {
      await fetch(`/api/workspace/${workspace.slug}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
      );
    } catch {
      // silently fail
    }
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <AppNav />
      <main className="pt-24 pb-16 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/workspace" className="text-navy-400 hover:text-electric transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </Link>
                <h1 className="text-2xl font-bold text-navy tracking-tight">{workspace.name}</h1>
              </div>
              <p className="text-navy-500 text-sm">
                {workspace.decks.length} deck{workspace.decks.length !== 1 ? "s" : ""} ·{" "}
                {members.length} member{members.length !== 1 ? "s" : ""}
                {workspace.pendingInvites > 0 && (
                  <span className="text-amber-600"> · {workspace.pendingInvites} pending invite{workspace.pendingInvites !== 1 ? "s" : ""}</span>
                )}
              </p>
            </div>
            <span className="shrink-0 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide bg-navy-100 text-navy-500">
              {workspace.role}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main: Decks */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-navy text-sm">Shared Decks</h2>
                {canManage && (
                  <Link
                    href="/create"
                    className="text-xs text-electric font-medium hover:underline"
                  >
                    + Add Deck
                  </Link>
                )}
              </div>

              {workspace.decks.length === 0 ? (
                <div className="rounded-2xl border border-navy-100 bg-white p-8 text-center">
                  <p className="text-navy-400 text-sm">No decks in this workspace yet.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {workspace.decks.map((deck) => {
                    let score: number | null = null;
                    try {
                      const parsed = JSON.parse(deck.piqScore);
                      score = parsed.overall ?? null;
                    } catch { /* empty */ }

                    return (
                      <Link
                        key={deck.id}
                        href={`/deck/${deck.shareId}`}
                        className="rounded-xl border border-navy-100 bg-white p-4 hover:border-electric/30 hover:shadow-sm transition-all group"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="font-semibold text-navy text-sm group-hover:text-electric transition-colors truncate">
                              {deck.title}
                            </h3>
                            <p className="text-xs text-navy-400 mt-0.5">{deck.companyName}</p>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            {score !== null && (
                              <span className="text-xs font-bold text-electric bg-electric/5 px-2 py-1 rounded-lg">
                                PIQ {score}
                              </span>
                            )}
                            <span className="text-[11px] text-navy-400">
                              {deck.viewCount} view{deck.viewCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Sidebar: Members */}
            <div className="space-y-4">
              <div className="rounded-2xl border border-navy-100 bg-white p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-navy text-sm">Members</h2>
                  {canAdmin && (
                    <button
                      type="button"
                      onClick={() => setShowInvite(!showInvite)}
                      className="text-xs text-electric font-medium hover:underline"
                    >
                      + Invite
                    </button>
                  )}
                </div>

                {/* Invite form */}
                {showInvite && canAdmin && (
                  <div className="rounded-xl bg-navy-50/50 border border-navy-100 p-3 mb-4 space-y-2">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@company.com"
                      className="w-full px-3 py-1.5 rounded-lg border border-navy-200 text-xs text-navy focus:border-electric focus:ring-1 focus:ring-electric/20 outline-none"
                    />
                    <div className="flex gap-2">
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="flex-1 px-2 py-1.5 rounded-lg border border-navy-200 text-xs text-navy focus:border-electric outline-none"
                      >
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleInvite}
                        disabled={inviting || !inviteEmail.trim()}
                        className="px-3 py-1.5 rounded-lg bg-electric text-white text-xs font-semibold disabled:opacity-50"
                      >
                        {inviting ? "..." : "Send"}
                      </button>
                    </div>
                    {inviteError && <p className="text-[10px] text-red-500">{inviteError}</p>}
                    {inviteSuccess && <p className="text-[10px] text-green-600">{inviteSuccess}</p>}
                  </div>
                )}

                {/* Member list */}
                <div className="space-y-2">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 py-1.5">
                      <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center overflow-hidden shrink-0">
                        {member.image ? (
                          <img src={member.image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-navy-400">
                            {(member.name || member.email)?.[0]?.toUpperCase() || "?"}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-navy truncate">{member.name}</p>
                        <p className="text-[10px] text-navy-400 truncate">{member.email}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {canAdmin && member.role !== "owner" ? (
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                            className="text-[10px] text-navy-400 bg-transparent border-none cursor-pointer focus:outline-none"
                          >
                            <option value="editor">Editor</option>
                            <option value="viewer">Viewer</option>
                          </select>
                        ) : (
                          <span className="text-[10px] text-navy-400 font-medium capitalize">
                            {member.role}
                          </span>
                        )}
                        {canAdmin && member.role !== "owner" && (
                          <button
                            type="button"
                            onClick={() => handleRemoveMember(member.id)}
                            className="text-navy-300 hover:text-red-500 transition-colors ml-1"
                            aria-label="Remove member"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
