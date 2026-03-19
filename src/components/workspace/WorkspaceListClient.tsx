"use client";

import { useState } from "react";
import Link from "next/link";
import AppNav from "@/components/AppNav";

interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  role: string;
  isOwner: boolean;
  memberCount: number;
  deckCount: number;
  ownerName: string;
}

export default function WorkspaceListClient({
  workspaces: initialWorkspaces,
  plan,
}: {
  workspaces: WorkspaceSummary[];
  plan: string;
}) {
  const [workspaces, setWorkspaces] = useState(initialWorkspaces);
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const isEnterprise = plan === "enterprise";

  async function handleCreate() {
    if (!name.trim()) return;
    setCreating(true);
    setError("");

    try {
      const res = await fetch("/api/workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create workspace");
      }

      const data = await res.json();
      setWorkspaces((prev) => [
        {
          id: data.id,
          name: data.name,
          slug: data.slug,
          role: "owner",
          isOwner: true,
          memberCount: 1,
          deckCount: 0,
          ownerName: "You",
        },
        ...prev,
      ]);
      setShowCreate(false);
      setName("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-50">
      <AppNav />
      <main
        id="main"
        tabIndex={-1}
        className="pt-24 pb-16 px-4 sm:px-6 outline-none"
        aria-labelledby="workspace-list-heading"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 id="workspace-list-heading" className="text-2xl font-bold text-navy tracking-tight">
                Workspaces
              </h1>
              <p className="text-navy-500 text-sm mt-1">Collaborate with your team on pitch decks</p>
            </div>
            {!showCreate && (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                aria-label="Create a new workspace"
                className="min-h-[44px] inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-electric text-white text-sm font-semibold shadow-lg shadow-electric/25 hover:bg-electric-600 hover:shadow-glow transition-all hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                New Workspace
              </button>
            )}
          </div>

          {/* Create form */}
          {showCreate && (
            <div className="rounded-2xl border border-navy-100 bg-white p-6 mb-6 animate-fade-in motion-reduce:animate-none">
              <h2 className="font-bold text-navy text-sm mb-3">Create workspace</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Ventures"
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  className="flex-1 px-4 py-2 rounded-xl border border-navy-200 text-sm text-navy placeholder:text-navy-400 outline-none focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                />
                <button
                  type="button"
                  onClick={handleCreate}
                  disabled={creating || !name.trim()}
                  aria-label={creating ? "Creating workspace…" : "Create workspace"}
                  aria-busy={creating}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-electric text-white text-sm font-semibold shadow-lg shadow-electric/25 hover:shadow-glow hover:bg-electric-600 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  {creating ? (
                    <span className="inline-flex items-center gap-2" role="status">
                      <span className="sr-only">Creating workspace</span>
                      <svg className="h-4 w-4 animate-spin motion-reduce:animate-none shrink-0" aria-hidden viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Creating…
                    </span>
                  ) : (
                    "Create"
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowCreate(false); setName(""); setError(""); }}
                  className="px-4 py-2 rounded-xl bg-navy-50 text-navy-400 text-sm font-semibold hover:text-navy transition-colors"
                >
                  Cancel
                </button>
              </div>
              {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
              {!isEnterprise && (
                <p className="text-xs text-navy-400 mt-2">
                  💡 Workspaces are available on all plans. Upgrade to Enterprise for real-time collaboration.
                </p>
              )}
            </div>
          )}

          {/* Workspace list */}
          {workspaces.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-navy-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-navy-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-navy mb-2">No workspaces yet</h2>
              <p className="text-navy-500 text-sm max-w-sm mx-auto mb-4">
                Create a workspace to collaborate with your team on pitch decks.
              </p>
              {!showCreate && (
                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  aria-label="Create your first workspace"
                  className="min-h-[44px] inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-electric text-white text-sm font-semibold shadow-lg shadow-electric/25 hover:shadow-glow hover:bg-electric-600 hover:-translate-y-0.5 active:translate-y-0 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                >
                  Create Your First Workspace
                </button>
              )}
            </div>
          ) : (
            <div className="grid gap-4">
              {workspaces.map((ws) => (
                <Link
                  key={ws.id}
                  href={`/workspace/${ws.slug}`}
                  className="rounded-2xl border border-navy-100 bg-white p-5 hover:border-electric/30 hover:shadow-sm transition-all motion-reduce:transition-none group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-navy group-hover:text-electric transition-colors truncate">
                          {ws.name}
                        </h3>
                        <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase bg-navy-50 text-navy-400">
                          {ws.role}
                        </span>
                      </div>
                      {!ws.isOwner && (
                        <p className="text-xs text-navy-400">Owned by {ws.ownerName}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-navy-400 shrink-0">
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                        {ws.memberCount}
                      </span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" />
                        </svg>
                        {ws.deckCount}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
