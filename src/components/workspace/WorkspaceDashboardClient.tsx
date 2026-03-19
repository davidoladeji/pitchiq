"use client";

import { useState, useEffect, useCallback } from "react";
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

  // Branding state
  const [brandCompanyName, setBrandCompanyName] = useState("");
  const [brandLogoUrl, setBrandLogoUrl] = useState("");
  const [brandPrimaryColor, setBrandPrimaryColor] = useState("");
  const [brandAccentColor, setBrandAccentColor] = useState("");
  const [hidePitchiqBranding, setHidePitchiqBranding] = useState(false);
  const [brandLoading, setBrandLoading] = useState(false);
  const [brandSaving, setBrandSaving] = useState(false);
  const [brandError, setBrandError] = useState("");
  const [brandSuccess, setBrandSuccess] = useState("");
  const [brandNotEnterprise, setBrandNotEnterprise] = useState(false);

  const canManage = workspace.role === "owner" || workspace.role === "editor";
  const canAdmin = workspace.role === "owner";

  const fetchBranding = useCallback(async () => {
    if (!canAdmin) return;
    setBrandLoading(true);
    try {
      const res = await fetch(`/api/workspace/${workspace.slug}/branding`);
      if (res.ok) {
        const data = await res.json();
        const bc = data.brandConfig || {};
        setBrandCompanyName(bc.companyName || "");
        setBrandLogoUrl(bc.logoUrl || "");
        setBrandPrimaryColor(bc.primaryColor || "");
        setBrandAccentColor(bc.accentColor || "");
        setHidePitchiqBranding(!!bc.hidePitchiqBranding);
      }
    } catch { /* empty */ }
    setBrandLoading(false);
  }, [canAdmin, workspace.slug]);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  async function handleBrandSave() {
    setBrandSaving(true);
    setBrandError("");
    setBrandSuccess("");
    setBrandNotEnterprise(false);
    try {
      const res = await fetch(`/api/workspace/${workspace.slug}/branding`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: brandCompanyName || undefined,
          logoUrl: brandLogoUrl || undefined,
          primaryColor: brandPrimaryColor || undefined,
          accentColor: brandAccentColor || undefined,
          hidePitchiqBranding,
        }),
      });
      if (res.status === 403) {
        setBrandNotEnterprise(true);
        setBrandError("Upgrade to Enterprise for white-label branding");
      } else if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save branding");
      } else {
        setBrandSuccess("Branding saved.");
        setTimeout(() => setBrandSuccess(""), 3000);
      }
    } catch (e) {
      if (!brandNotEnterprise) {
        setBrandError(e instanceof Error ? e.message : "Something went wrong");
      }
    }
    setBrandSaving(false);
  }

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
      <main
        id="main"
        tabIndex={-1}
        className="pt-24 pb-16 px-4 sm:px-6 outline-none"
        aria-labelledby="workspace-dashboard-heading"
      >
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link
                  href="/workspace"
                  className="text-navy-400 hover:text-electric transition-colors motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded p-1 -m-1"
                  aria-label="Back to workspaces list"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </Link>
                <h1 id="workspace-dashboard-heading" className="text-2xl font-bold text-navy tracking-tight">
                  {workspace.name}
                </h1>
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
                    className="text-xs text-electric font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded px-1 py-0.5 min-h-[44px] inline-flex items-center"
                    aria-label="Add a deck to this workspace"
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
                        className="rounded-xl border border-navy-100 bg-white p-4 hover:border-electric/30 hover:shadow-sm transition-all motion-reduce:transition-none group"
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
                      className="text-xs text-electric font-medium hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded min-h-[44px] px-1"
                      aria-label={showInvite ? "Close invite form" : "Invite a member"}
                      aria-expanded={showInvite}
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
                      className="w-full px-3 py-1.5 rounded-lg border border-navy-200 text-xs text-navy outline-none focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                    />
                    <div className="flex gap-2">
                      <select
                        value={inviteRole}
                        onChange={(e) => setInviteRole(e.target.value)}
                        className="flex-1 px-2 py-1.5 rounded-lg border border-navy-200 text-xs text-navy outline-none focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                      >
                        <option value="editor">Editor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                      <button
                        type="button"
                        onClick={handleInvite}
                        disabled={inviting || !inviteEmail.trim()}
                        className="px-3 py-1.5 min-h-[44px] rounded-lg bg-electric text-white text-xs font-semibold disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:bg-electric-600 transition disabled:hover:bg-electric"
                        aria-label={inviting ? "Sending invite…" : "Send invite"}
                        aria-busy={inviting}
                      >
                        {inviting ? (
                          <span className="inline-flex items-center gap-1.5" role="status">
                            <span className="sr-only">Sending invite</span>
                            <svg className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none shrink-0" aria-hidden viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Sending…
                          </span>
                        ) : (
                          "Send"
                        )}
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
                            className="text-[10px] text-navy-400 bg-transparent border-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white rounded"
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

              {/* Branding settings (owner only) */}
              {canAdmin && (
                <div className="rounded-2xl border border-navy-100 bg-white p-5">
                  <h2 className="font-bold text-navy text-sm mb-4">Branding</h2>

                  {brandLoading ? (
                    <div className="space-y-3 animate-pulse motion-reduce:animate-none" role="status" aria-busy="true">
                      <span className="sr-only">Loading branding settings</span>
                      <div className="h-8 rounded-lg bg-navy-50" />
                      <div className="h-8 rounded-lg bg-navy-50" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {brandError && (
                        <p className="text-[10px] text-red-500 font-medium">{brandError}</p>
                      )}
                      {brandSuccess && (
                        <p className="text-[10px] text-emerald-600 font-medium">{brandSuccess}</p>
                      )}

                      {/* Hide PitchIQ branding toggle */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs text-navy">Hide PitchIQ branding</span>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={hidePitchiqBranding}
                          onClick={() => setHidePitchiqBranding(!hidePitchiqBranding)}
                          disabled={brandNotEnterprise}
                          className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors duration-200 ease-in-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed ${
                            hidePitchiqBranding ? "bg-electric" : "bg-navy-200"
                          }`}
                          aria-label={hidePitchiqBranding ? "PitchIQ branding hidden — click to show" : "PitchIQ branding shown — click to hide"}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out motion-reduce:transition-none ${
                              hidePitchiqBranding ? "translate-x-4" : "translate-x-0.5"
                            } mt-0.5`}
                          />
                        </button>
                      </div>

                      {/* Company name */}
                      <input
                        type="text"
                        value={brandCompanyName}
                        onChange={(e) => setBrandCompanyName(e.target.value)}
                        placeholder="Company name"
                        maxLength={100}
                        disabled={brandNotEnterprise}
                        className="w-full px-3 py-1.5 rounded-lg border border-navy-200 text-xs text-navy outline-none focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-navy-50"
                      />

                      {/* Logo URL */}
                      <input
                        type="url"
                        value={brandLogoUrl}
                        onChange={(e) => setBrandLogoUrl(e.target.value)}
                        placeholder="Logo URL"
                        maxLength={500}
                        disabled={brandNotEnterprise}
                        className="w-full px-3 py-1.5 rounded-lg border border-navy-200 text-xs text-navy outline-none focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-navy-50"
                      />

                      {/* Colors */}
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={brandPrimaryColor}
                          onChange={(e) => setBrandPrimaryColor(e.target.value)}
                          placeholder="Primary #hex"
                          maxLength={7}
                          disabled={brandNotEnterprise}
                          className="px-3 py-1.5 rounded-lg border border-navy-200 text-xs text-navy font-mono outline-none focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-navy-50"
                        />
                        <input
                          type="text"
                          value={brandAccentColor}
                          onChange={(e) => setBrandAccentColor(e.target.value)}
                          placeholder="Accent #hex"
                          maxLength={7}
                          disabled={brandNotEnterprise}
                          className="px-3 py-1.5 rounded-lg border border-navy-200 text-xs text-navy font-mono outline-none focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-navy-50"
                        />
                      </div>

                      {brandNotEnterprise && (
                        <p className="text-[10px] text-navy-400">
                          <Link href="/billing" className="text-electric hover:underline">Upgrade to Enterprise</Link> for white-label branding.
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={handleBrandSave}
                        disabled={brandSaving || brandNotEnterprise}
                        aria-busy={brandSaving}
                        aria-label={brandSaving ? "Saving branding…" : "Save branding settings"}
                        className="w-full min-h-[44px] px-3 py-1.5 rounded-lg bg-electric text-white text-xs font-semibold shadow-lg shadow-electric/25 hover:shadow-glow disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white hover:bg-electric-600 hover:-translate-y-0.5 active:translate-y-0 transition motion-reduce:transition-none disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:hover:bg-electric disabled:cursor-not-allowed"
                      >
                        {brandSaving ? (
                          <span className="inline-flex items-center justify-center gap-2" role="status">
                            <span className="sr-only">Saving branding</span>
                            <svg className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none shrink-0" aria-hidden viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Saving…
                          </span>
                        ) : (
                          "Save Branding"
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
