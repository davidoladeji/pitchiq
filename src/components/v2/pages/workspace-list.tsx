"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Users, FolderOpen, Plus } from "lucide-react";
import { Card } from "@/components/v2/ui/card";
import { Button } from "@/components/v2/ui/button";
import { Input } from "@/components/v2/ui/input";
import { Badge } from "@/components/v2/ui/badge";

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

export default function WorkspaceListV2({
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--void-text)" }}>
            Workspaces
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--void-text-dim)" }}>
            Collaborate with your team on pitch decks
          </p>
        </div>
        {!showCreate && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus size={16} className="mr-2" /> New Workspace
          </Button>
        )}
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="p-6">
          <h2 className="font-bold text-sm mb-3" style={{ color: "var(--void-text)" }}>
            Create workspace
          </h2>
          <div className="flex gap-3">
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Ventures"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="flex-1"
            />
            <Button onClick={handleCreate} disabled={creating || !name.trim()}>
              {creating ? "Creating…" : "Create"}
            </Button>
            <Button
              variant="outline"
              onClick={() => { setShowCreate(false); setName(""); setError(""); }}
            >
              Cancel
            </Button>
          </div>
          {error && <p className="text-xs mt-2" style={{ color: "#ef4444" }}>{error}</p>}
          {!isEnterprise && (
            <p className="text-xs mt-2" style={{ color: "var(--void-text-dim)" }}>
              Workspaces are available on all plans. Upgrade to Enterprise for real-time collaboration.
            </p>
          )}
        </Card>
      )}

      {/* Workspace list */}
      {workspaces.length === 0 ? (
        <Card className="text-center py-16">
          <Building2 size={32} className="mx-auto mb-3" style={{ color: "var(--void-text-dim)" }} />
          <h2 className="text-lg font-bold mb-2" style={{ color: "var(--void-text)" }}>
            No workspaces yet
          </h2>
          <p className="text-sm max-w-sm mx-auto mb-4" style={{ color: "var(--void-text-dim)" }}>
            Create a workspace to collaborate with your team on pitch decks.
          </p>
          {!showCreate && (
            <Button onClick={() => setShowCreate(true)}>
              Create Your First Workspace
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {workspaces.map((ws) => (
            <Link key={ws.id} href={`/workspace/${ws.slug}`}>
              <Card className="p-5 hover-lift">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold truncate" style={{ color: "var(--void-text)" }}>
                        {ws.name}
                      </h3>
                      <Badge variant="default">{ws.role}</Badge>
                    </div>
                    {!ws.isOwner && (
                      <p className="text-xs" style={{ color: "var(--void-text-dim)" }}>
                        Owned by {ws.ownerName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs shrink-0" style={{ color: "var(--void-text-muted)" }}>
                    <span className="flex items-center gap-1">
                      <Users size={14} /> {ws.memberCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <FolderOpen size={14} /> {ws.deckCount}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
