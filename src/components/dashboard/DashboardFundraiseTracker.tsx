"use client";

import { useState, useEffect, useCallback, useMemo, DragEvent } from "react";
import { getPlanLimits } from "@/lib/plan-limits";

interface OutreachEntry {
  id: string;
  type: string;
  content: string;
  sentAt: string;
}

interface InvestorContact {
  id: string;
  name: string;
  firm: string | null;
  email: string | null;
  status: string;
  notes: string;
  tags: string;
  nextFollowUp: string | null;
  outreach: OutreachEntry[];
  _count: { outreach: number };
  createdAt: string;
  updatedAt: string;
  // Enhanced CRM fields
  warmIntro?: boolean | null;
  introSource?: string | null;
  sentimentScore?: number | null;
  lastInteractionAt?: string | null;
  dealProbability?: number | null;
  expectedCloseDate?: string | null;
  termSheetReceived?: boolean | null;
  commitAmount?: number | null;
}

const STATUSES = [
  { value: "identified", label: "Identified", color: "bg-white/[0.06] text-white/50", darkColor: "border-white/10" },
  { value: "contacted", label: "Contacted", color: "bg-[#4361EE]/15 text-[#4361EE]", darkColor: "border-[#4361EE]/30" },
  { value: "meeting", label: "Meeting", color: "bg-indigo-500/15 text-indigo-400", darkColor: "border-indigo-500/30" },
  { value: "due_diligence", label: "Due Diligence", color: "bg-amber-500/15 text-amber-400", darkColor: "border-amber-500/30" },
  { value: "term_sheet", label: "Term Sheet", color: "bg-violet-500/15 text-violet-400", darkColor: "border-violet-500/30" },
  { value: "committed", label: "Committed", color: "bg-emerald-500/15 text-emerald-400", darkColor: "border-emerald-500/30" },
  { value: "passed", label: "Passed", color: "bg-red-500/15 text-red-400", darkColor: "border-red-500/30" },
];

const OUTREACH_TYPES = [
  { value: "email", label: "Email", icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" },
  { value: "meeting", label: "Meeting", icon: "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" },
  { value: "call", label: "Call", icon: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" },
  { value: "note", label: "Note", icon: "M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" },
];

const SUGGESTED_TAGS = [
  "Tier 1",
  "Tier 2",
  "Warm Intro",
  "Cold Outreach",
  "Lead Investor",
  "Follow-on",
  "Angel",
  "Strategic",
];

const SENTIMENT_EMOJIS: Record<number, string> = {
  [-2]: "\uD83D\uDE21",
  [-1]: "\uD83D\uDE1F",
  [0]: "\uD83D\uDE10",
  [1]: "\uD83D\uDE42",
  [2]: "\uD83D\uDE04",
};

function sentimentLabel(score: number): string {
  if (score <= -2) return "Very Negative";
  if (score === -1) return "Negative";
  if (score === 0) return "Neutral";
  if (score === 1) return "Positive";
  return "Very Positive";
}

function getStatusConfig(status: string) {
  return STATUSES.find((s) => s.value === status) || STATUSES[0];
}

function parseTags(tagsStr: string): string[] {
  try {
    const parsed = JSON.parse(tagsStr);
    if (Array.isArray(parsed)) return parsed.filter((t): t is string => typeof t === "string");
  } catch {
    /* ignore */
  }
  return [];
}

function isOverdue(nextFollowUp: string | null): boolean {
  if (!nextFollowUp) return false;
  return new Date(nextFollowUp) < new Date(new Date().toDateString());
}

function formatFollowUpDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatAmount(amount: number): string {
  if (amount >= 1_000_000_000) return `$${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(0)}K`;
  return `$${amount.toLocaleString()}`;
}

function daysSince(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = Date.now() - new Date(dateStr).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ---------------------------------------------------------------------------
// Kanban Card
// ---------------------------------------------------------------------------

function KanbanCard({
  contact,
  onDragStart,
  onClick,
}: {
  contact: InvestorContact;
  onDragStart: (e: DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
}) {
  const lastDays = daysSince(contact.lastInteractionAt || contact.updatedAt);
  const sentiment = contact.sentimentScore != null ? SENTIMENT_EMOJIS[contact.sentimentScore] : null;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="px-3 py-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06] cursor-grab active:cursor-grabbing hover:bg-white/[0.05] transition-colors"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-white truncate">{contact.name}</span>
        {sentiment && <span className="text-sm">{sentiment}</span>}
      </div>
      {contact.firm && (
        <span className="text-[10px] text-white/30 block truncate">{contact.firm}</span>
      )}
      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
        {contact.warmIntro && (
          <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-400">
            Warm Intro
          </span>
        )}
        {contact.dealProbability != null && (
          <span className="text-[9px] text-white/30">{contact.dealProbability}% prob</span>
        )}
        {lastDays != null && (
          <span className={`text-[9px] ${lastDays > 14 ? "text-amber-400" : "text-white/30"}`}>
            {lastDays}d ago
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Kanban Board
// ---------------------------------------------------------------------------

function KanbanBoard({
  contacts,
  onStatusChange,
  onExpand,
}: {
  contacts: InvestorContact[];
  onStatusChange: (id: string, status: string) => void;
  onExpand: (id: string) => void;
}) {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  const columns = STATUSES.map((s) => ({
    ...s,
    contacts: contacts.filter((c) => c.status === s.value),
  }));

  // Committed column total
  const committedTotal = contacts
    .filter((c) => c.status === "committed" && c.commitAmount != null)
    .reduce((sum, c) => sum + (c.commitAmount || 0), 0);

  function handleDragStart(e: DragEvent<HTMLDivElement>, contactId: string) {
    setDraggedId(contactId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>, status: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(status);
  }

  function handleDragLeave() {
    setDragOverCol(null);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>, targetStatus: string) {
    e.preventDefault();
    setDragOverCol(null);
    if (draggedId) {
      const contact = contacts.find((c) => c.id === draggedId);
      if (contact && contact.status !== targetStatus) {
        onStatusChange(draggedId, targetStatus);
      }
    }
    setDraggedId(null);
  }

  return (
    <div className="overflow-x-auto -mx-6 px-6">
      <div className="flex gap-3 min-w-max pb-2">
        {columns.map((col) => (
          <div
            key={col.value}
            className={`w-52 shrink-0 rounded-xl border ${
              dragOverCol === col.value ? "border-[#4361EE]/40 bg-[#4361EE]/5" : "border-white/[0.06] bg-white/[0.02]"
            } transition-colors`}
            onDragOver={(e) => handleDragOver(e, col.value)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.value)}
          >
            {/* Column header */}
            <div className="px-3 py-2.5 border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-white/60">{col.label}</span>
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${col.color}`}>
                  {col.contacts.length}
                </span>
              </div>
              {col.value === "committed" && committedTotal > 0 && (
                <span className="text-[10px] text-emerald-400 font-medium">{formatAmount(committedTotal)}</span>
              )}
            </div>
            {/* Cards */}
            <div className="p-2 space-y-2 min-h-[80px]">
              {col.contacts.map((contact) => (
                <KanbanCard
                  key={contact.id}
                  contact={contact}
                  onDragStart={(e) => handleDragStart(e, contact.id)}
                  onClick={() => onExpand(contact.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Pipeline Analytics Banner
// ---------------------------------------------------------------------------

function PipelineAnalytics({ contacts }: { contacts: InvestorContact[] }) {
  const nonPassed = contacts.filter((c) => c.status !== "passed");
  const pipelineValue = nonPassed.reduce((sum, c) => {
    const amount = c.commitAmount || 0;
    const prob = c.dealProbability || 0;
    return sum + (amount * prob / 100);
  }, 0);

  const stageConversions = STATUSES.slice(0, -1).map((s, i) => {
    const thisCount = contacts.filter((c) => c.status === s.value).length;
    const nextStatus = STATUSES[i + 1];
    const nextCount = nextStatus
      ? contacts.filter((c) => c.status === nextStatus.value).length
      : 0;
    const laterStatuses = STATUSES.slice(i + 1).filter((st) => st.value !== "passed");
    const laterCount = contacts.filter((c) =>
      laterStatuses.some((st) => st.value === c.status)
    ).length;
    return {
      from: s.label,
      to: nextStatus?.label || "",
      rate: thisCount > 0 ? Math.round((laterCount / (thisCount + laterCount)) * 100) : 0,
      count: thisCount,
    };
  });

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 mb-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Pipeline value */}
        <div>
          <span className="text-[10px] text-white/30 block">Pipeline Value</span>
          <span className="text-lg font-bold text-white">{formatAmount(pipelineValue)}</span>
        </div>
        {/* Stage counts */}
        <div className="flex items-center gap-3 ml-auto">
          {stageConversions.filter((s) => s.count > 0).map((s) => (
            <div key={s.from} className="text-center">
              <span className="text-[10px] text-white/30 block">{s.from}</span>
              <span className="text-sm font-semibold text-white">{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Enhanced Edit Modal
// ---------------------------------------------------------------------------

function EditContactModal({
  contact,
  onClose,
  onSave,
}: {
  contact: InvestorContact;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
}) {
  const [warmIntro, setWarmIntro] = useState(contact.warmIntro ?? false);
  const [introSource, setIntroSource] = useState(contact.introSource || "");
  const [sentiment, setSentiment] = useState(contact.sentimentScore ?? 0);
  const [dealProb, setDealProb] = useState(contact.dealProbability ?? 50);
  const [expectedClose, setExpectedClose] = useState(
    contact.expectedCloseDate ? new Date(contact.expectedCloseDate).toISOString().split("T")[0] : ""
  );
  const [termSheet, setTermSheet] = useState(contact.termSheetReceived ?? false);
  const [commitAmt, setCommitAmt] = useState(contact.commitAmount?.toString() || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({
      warmIntro,
      introSource: introSource || null,
      sentimentScore: sentiment,
      dealProbability: dealProb,
      expectedCloseDate: expectedClose ? new Date(expectedClose + "T00:00:00").toISOString() : null,
      termSheetReceived: termSheet,
      commitAmount: commitAmt ? parseFloat(commitAmt) : null,
      lastInteractionAt: new Date().toISOString(),
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative bg-[#0F0F14] border border-white/[0.06] rounded-2xl w-full max-w-md p-6 space-y-4 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-sm font-semibold text-white">Edit Deal Details - {contact.name}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Warm intro */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
              <input
                type="checkbox"
                checked={warmIntro}
                onChange={(e) => setWarmIntro(e.target.checked)}
                className="rounded border-white/20 bg-white/5 text-[#4361EE] focus:ring-[#4361EE] w-3.5 h-3.5"
              />
              Warm Intro Available
            </label>
          </div>
          {warmIntro && (
            <input
              type="text"
              placeholder="Intro source (e.g., mutual connection, portfolio founder)"
              value={introSource}
              onChange={(e) => setIntroSource(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
            />
          )}

          {/* Sentiment */}
          <div>
            <label className="text-[11px] text-white/40 block mb-1.5">
              Sentiment: {SENTIMENT_EMOJIS[sentiment]} {sentimentLabel(sentiment)}
            </label>
            <div className="flex items-center gap-2">
              {[-2, -1, 0, 1, 2].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSentiment(s)}
                  className={`w-8 h-8 rounded-lg text-base transition-colors ${
                    sentiment === s ? "bg-[#4361EE]/20 ring-1 ring-[#4361EE]" : "bg-white/[0.04] hover:bg-white/[0.08]"
                  }`}
                >
                  {SENTIMENT_EMOJIS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Deal probability */}
          <div>
            <label className="text-[11px] text-white/40 block mb-1.5">
              Deal Probability: {dealProb}%
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={dealProb}
              onChange={(e) => setDealProb(Number(e.target.value))}
              className="w-full h-1.5 rounded-full appearance-none bg-white/[0.06] accent-[#4361EE]"
            />
          </div>

          {/* Expected close date */}
          <div>
            <label className="text-[11px] text-white/40 block mb-1.5">Expected Close Date</label>
            <input
              type="date"
              value={expectedClose}
              onChange={(e) => setExpectedClose(e.target.value)}
              className="px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white/70 focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
            />
          </div>

          {/* Term sheet */}
          <label className="flex items-center gap-2 text-xs text-white/60 cursor-pointer">
            <input
              type="checkbox"
              checked={termSheet}
              onChange={(e) => setTermSheet(e.target.checked)}
              className="rounded border-white/20 bg-white/5 text-[#4361EE] focus:ring-[#4361EE] w-3.5 h-3.5"
            />
            Term Sheet Received
          </label>

          {/* Commit amount */}
          <div>
            <label className="text-[11px] text-white/40 block mb-1.5">Commit Amount (USD)</label>
            <input
              type="number"
              placeholder="e.g., 500000"
              value={commitAmt}
              onChange={(e) => setCommitAmt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/[0.04] border border-white/[0.08] text-xs text-white/70 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#4361EE]"
            />
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#4361EE]/10 text-[#4361EE] text-xs font-semibold hover:bg-[#4361EE]/20 transition-colors"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-white/[0.04] text-white/40 text-xs font-medium hover:text-white/60 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function DashboardFundraiseTracker({ plan }: { plan: string }) {
  const limits = getPlanLimits(plan);
  const [contacts, setContacts] = useState<InvestorContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addingOutreach, setAddingOutreach] = useState<string | null>(null);
  const [editModalId, setEditModalId] = useState<string | null>(null);
  const [error, setError] = useState("");

  // View toggle
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");

  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [filterOverdue, setFilterOverdue] = useState(false);

  // Form state
  const [newName, setNewName] = useState("");
  const [newFirm, setNewFirm] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newStatus, setNewStatus] = useState("identified");
  const [newNotes, setNewNotes] = useState("");

  // Tag input state per contact
  const [tagInput, setTagInput] = useState("");

  // Outreach form state
  const [outreachType, setOutreachType] = useState("email");
  const [outreachContent, setOutreachContent] = useState("");

  const fetchContacts = useCallback(async () => {
    try {
      const res = await fetch("/api/investors");
      if (!res.ok) return;
      const data = await res.json();
      setContacts(data.contacts || []);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (limits.fundraiseTracker) fetchContacts();
    else setLoading(false);
  }, [limits.fundraiseTracker, fetchContacts]);

  // Derived data
  const overdueCount = useMemo(
    () => contacts.filter((c) => isOverdue(c.nextFollowUp)).length,
    [contacts]
  );

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    contacts.forEach((c) => parseTags(c.tags).forEach((t) => tagSet.add(t)));
    return Array.from(tagSet).sort();
  }, [contacts]);

  const filteredContacts = useMemo(() => {
    let result = contacts;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.firm && c.firm.toLowerCase().includes(q))
      );
    }
    if (filterTag) {
      result = result.filter((c) => parseTags(c.tags).includes(filterTag));
    }
    if (filterOverdue) {
      result = result.filter((c) => isOverdue(c.nextFollowUp));
    }
    return result;
  }, [contacts, searchQuery, filterTag, filterOverdue]);

  async function handleAddContact(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    setError("");

    try {
      const res = await fetch("/api/investors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          firm: newFirm,
          email: newEmail,
          status: newStatus,
          notes: newNotes,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add contact");
      }

      setNewName("");
      setNewFirm("");
      setNewEmail("");
      setNewStatus("identified");
      setNewNotes("");
      setShowAddForm(false);
      fetchContacts();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  async function handleStatusChange(contactId: string, status: string) {
    // Optimistic update
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, status } : c))
    );
    try {
      await fetch(`/api/investors/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchContacts();
    } catch {
      fetchContacts(); // revert
    }
  }

  async function handleDelete(contactId: string) {
    try {
      await fetch(`/api/investors/${contactId}`, { method: "DELETE" });
      fetchContacts();
    } catch {
      /* ignore */
    }
  }

  async function handleAddOutreach(e: React.FormEvent, contactId: string) {
    e.preventDefault();
    if (!outreachContent.trim()) return;

    try {
      await fetch(`/api/investors/${contactId}/outreach`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: outreachType, content: outreachContent }),
      });
      // Also update lastInteractionAt
      await fetch(`/api/investors/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lastInteractionAt: new Date().toISOString() }),
      });
      setOutreachType("email");
      setOutreachContent("");
      setAddingOutreach(null);
      fetchContacts();
    } catch {
      /* ignore */
    }
  }

  async function handleTagsChange(contactId: string, newTags: string[]) {
    const tagsJson = JSON.stringify(newTags);
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, tags: tagsJson } : c))
    );
    try {
      await fetch(`/api/investors/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tags: tagsJson }),
      });
    } catch {
      fetchContacts();
    }
  }

  async function handleFollowUpChange(contactId: string, date: string | null) {
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, nextFollowUp: date } : c))
    );
    try {
      await fetch(`/api/investors/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nextFollowUp: date }),
      });
    } catch {
      fetchContacts();
    }
  }

  async function handleEditSave(contactId: string, data: Record<string, unknown>) {
    try {
      await fetch(`/api/investors/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setEditModalId(null);
      fetchContacts();
    } catch {
      /* ignore */
    }
  }

  function addTagToContact(contactId: string, currentTags: string[], tag: string) {
    const trimmed = tag.trim();
    if (!trimmed || currentTags.includes(trimmed)) return;
    handleTagsChange(contactId, [...currentTags, trimmed]);
  }

  function removeTagFromContact(contactId: string, currentTags: string[], tag: string) {
    handleTagsChange(contactId, currentTags.filter((t) => t !== tag));
  }

  if (!limits.fundraiseTracker) {
    return (
      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            Fundraise Tracker
          </h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-400">Growth</span>
        </div>
        <p className="text-xs text-white/40">
          Track investor conversations, manage your pipeline, and log outreach activities.
          Upgrade to Growth to unlock.
        </p>
      </section>
    );
  }

  // Pipeline summary
  const pipeline = STATUSES.map((s) => ({
    ...s,
    count: contacts.filter((c) => c.status === s.value).length,
  }));

  const editContact = editModalId ? contacts.find((c) => c.id === editModalId) : null;

  return (
    <section className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
          Fundraise Tracker
          <span className="text-xs font-normal text-white/30">({contacts.length} contacts)</span>
        </h2>
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center rounded-lg border border-white/[0.06] overflow-hidden">
            <button
              onClick={() => setViewMode("list")}
              className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${
                viewMode === "list" ? "bg-[#4361EE]/10 text-[#4361EE]" : "text-white/40 hover:text-white/60"
              }`}
            >
              List
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${
                viewMode === "kanban" ? "bg-[#4361EE]/10 text-[#4361EE]" : "text-white/40 hover:text-white/60"
              }`}
            >
              Kanban
            </button>
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-3 py-1.5 rounded-lg bg-[#4361EE]/10 text-[#4361EE] text-xs font-semibold hover:bg-[#4361EE]/20 transition-colors"
          >
            {showAddForm ? "Cancel" : "+ Add Contact"}
          </button>
        </div>
      </div>

      {/* Pipeline Analytics */}
      {contacts.length > 0 && <PipelineAnalytics contacts={contacts} />}

      {/* Overdue Follow-up Banner */}
      {overdueCount > 0 && (
        <button
          onClick={() => {
            setFilterOverdue(true);
            setSearchQuery("");
            setFilterTag("");
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-500/20 bg-amber-500/5 text-left transition-colors hover:bg-amber-500/10"
        >
          <svg className="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span className="text-xs font-semibold text-amber-400">
            {overdueCount} {overdueCount === 1 ? "contact needs" : "contacts need"} follow-up
          </span>
        </button>
      )}

      {/* Pipeline Overview */}
      <div className="flex flex-wrap gap-2">
        {pipeline.map((s) => (
          <div key={s.value} className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold ${s.color}`}>
            {s.label}: {s.count}
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="text"
          placeholder="Search by name or firm..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 min-w-[160px] px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-xs text-white/70 placeholder:text-white/20 outline-none focus:ring-1 focus:ring-[#4361EE]"
        />
        {allTags.length > 0 && (
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-xs text-white/60 outline-none focus:ring-1 focus:ring-[#4361EE]"
          >
            <option value="">All tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}
        <label className="flex items-center gap-1.5 text-xs text-white/40 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filterOverdue}
            onChange={(e) => setFilterOverdue(e.target.checked)}
            className="rounded border-white/20 bg-white/5 text-[#4361EE] focus:ring-[#4361EE] w-3 h-3"
          />
          Overdue
        </label>
        {(searchQuery || filterTag || filterOverdue) && (
          <button
            onClick={() => { setSearchQuery(""); setFilterTag(""); setFilterOverdue(false); }}
            className="text-[10px] text-white/30 hover:text-white/50 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Add Contact Form */}
      {showAddForm && (
        <form onSubmit={handleAddContact} className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Contact name *"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.04] text-xs text-white/70 placeholder:text-white/20 outline-none focus:ring-1 focus:ring-[#4361EE]"
              required
            />
            <input
              type="text"
              placeholder="Firm / Fund"
              value={newFirm}
              onChange={(e) => setNewFirm(e.target.value)}
              className="px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.04] text-xs text-white/70 placeholder:text-white/20 outline-none focus:ring-1 focus:ring-[#4361EE]"
            />
            <input
              type="email"
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.04] text-xs text-white/70 placeholder:text-white/20 outline-none focus:ring-1 focus:ring-[#4361EE]"
            />
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.04] text-xs text-white/60 outline-none focus:ring-1 focus:ring-[#4361EE]"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <textarea
            placeholder="Notes"
            value={newNotes}
            onChange={(e) => setNewNotes(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-white/[0.08] bg-white/[0.04] text-xs text-white/70 placeholder:text-white/20 outline-none focus:ring-1 focus:ring-[#4361EE] resize-none"
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-[#4361EE]/10 text-[#4361EE] text-xs font-semibold hover:bg-[#4361EE]/20 transition-colors"
          >
            Add Contact
          </button>
        </form>
      )}

      {/* Content */}
      {loading ? (
        <div className="text-center py-8" role="status">
          <div className="w-5 h-5 border-2 border-[#4361EE] border-t-transparent rounded-full animate-spin mx-auto" aria-hidden="true" />
          <span className="sr-only">Loading investor contacts</span>
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-white/40">No investor contacts yet.</p>
          <p className="text-xs text-white/25 mt-1">Add your first contact to start tracking your fundraise.</p>
        </div>
      ) : viewMode === "kanban" ? (
        /* Kanban View */
        <KanbanBoard
          contacts={filteredContacts}
          onStatusChange={handleStatusChange}
          onExpand={(id) => setExpandedId(expandedId === id ? null : id)}
        />
      ) : filteredContacts.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-white/40">No contacts match your filters.</p>
          <button
            onClick={() => { setSearchQuery(""); setFilterTag(""); setFilterOverdue(false); }}
            className="text-xs text-[#4361EE] hover:underline mt-1"
          >
            Clear filters
          </button>
        </div>
      ) : (
        /* List View */
        <div className="space-y-2">
          {filteredContacts.map((contact) => {
            const statusConfig = getStatusConfig(contact.status);
            const isExpanded = expandedId === contact.id;
            const contactTags = parseTags(contact.tags);
            const overdue = isOverdue(contact.nextFollowUp);
            const hasFutureFollowUp = contact.nextFollowUp && !overdue;
            const sentiment = contact.sentimentScore != null ? SENTIMENT_EMOJIS[contact.sentimentScore] : null;

            return (
              <div key={contact.id} className="rounded-xl border border-white/[0.06] bg-white/[0.02] overflow-hidden">
                {/* Contact Row */}
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : contact.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-white truncate">{contact.name}</span>
                      {contact.firm && (
                        <span className="text-xs text-white/30 truncate">@ {contact.firm}</span>
                      )}
                      {sentiment && <span className="text-sm">{sentiment}</span>}
                      {contact.warmIntro && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-emerald-500/10 text-emerald-400">
                          Warm Intro
                        </span>
                      )}
                      {contactTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-[#4361EE]/10 text-[#4361EE]"
                        >
                          {tag}
                        </span>
                      ))}
                      {contactTags.length > 3 && (
                        <span className="text-[9px] text-white/30">+{contactTags.length - 3}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {contact.email && (
                        <p className="text-[10px] text-white/30 truncate">{contact.email}</p>
                      )}
                      {contact.dealProbability != null && (
                        <span className="text-[10px] text-white/30">{contact.dealProbability}% prob</span>
                      )}
                      {overdue && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400">
                          Overdue
                        </span>
                      )}
                      {hasFutureFollowUp && (
                        <span className="flex items-center gap-0.5 text-[10px] text-white/30">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                          {formatFollowUpDate(contact.nextFollowUp!)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-white/20">
                      {contact._count.outreach} outreach
                    </span>
                    <select
                      value={contact.status}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleStatusChange(contact.id, e.target.value);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border-0 cursor-pointer ${statusConfig.color}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <svg
                      className={`w-4 h-4 text-white/20 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-white/[0.04] p-3 bg-white/[0.01] space-y-3">
                    {contact.notes && (
                      <p className="text-xs text-white/40 italic">{contact.notes}</p>
                    )}

                    {/* Deal details row */}
                    <div className="flex flex-wrap gap-3">
                      {contact.dealProbability != null && (
                        <div className="text-center">
                          <span className="text-[9px] text-white/20 block">Probability</span>
                          <span className="text-xs font-semibold text-white/60">{contact.dealProbability}%</span>
                        </div>
                      )}
                      {contact.commitAmount != null && (
                        <div className="text-center">
                          <span className="text-[9px] text-white/20 block">Commit</span>
                          <span className="text-xs font-semibold text-emerald-400">{formatAmount(contact.commitAmount)}</span>
                        </div>
                      )}
                      {contact.termSheetReceived && (
                        <div className="text-center">
                          <span className="text-[9px] text-white/20 block">Term Sheet</span>
                          <span className="text-xs font-semibold text-violet-400">Received</span>
                        </div>
                      )}
                      {contact.warmIntro && contact.introSource && (
                        <div className="text-center">
                          <span className="text-[9px] text-white/20 block">Intro Source</span>
                          <span className="text-xs text-white/50">{contact.introSource}</span>
                        </div>
                      )}
                      {contact.expectedCloseDate && (
                        <div className="text-center">
                          <span className="text-[9px] text-white/20 block">Expected Close</span>
                          <span className="text-xs text-white/50">{formatFollowUpDate(contact.expectedCloseDate)}</span>
                        </div>
                      )}
                    </div>

                    {/* Edit deal button */}
                    <button
                      onClick={() => setEditModalId(contact.id)}
                      className="text-[10px] font-semibold text-[#4361EE] hover:underline"
                    >
                      Edit Deal Details
                    </button>

                    {/* Tags Section */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-white/50">Tags</span>
                      <div className="flex flex-wrap gap-1.5">
                        {contactTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#4361EE]/10 text-[#4361EE]"
                          >
                            {tag}
                            <button
                              onClick={() => removeTagFromContact(contact.id, contactTags, tag)}
                              className="hover:text-red-400 transition-colors leading-none"
                              aria-label={`Remove tag ${tag}`}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Add tag (Enter or comma)"
                        value={expandedId === contact.id ? tagInput : ""}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            const value = tagInput.replace(/,/g, "").trim();
                            if (value) {
                              addTagToContact(contact.id, contactTags, value);
                              setTagInput("");
                            }
                          }
                        }}
                        className="w-full max-w-xs px-2 py-1 rounded-md border border-white/[0.08] bg-white/[0.04] text-[10px] text-white/60 placeholder:text-white/20 outline-none focus:ring-1 focus:ring-[#4361EE]"
                      />
                      <div className="flex flex-wrap gap-1">
                        {SUGGESTED_TAGS.filter((t) => !contactTags.includes(t)).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => addTagToContact(contact.id, contactTags, tag)}
                            className="px-1.5 py-0.5 rounded-full text-[9px] font-medium border border-white/[0.08] text-white/30 hover:bg-[#4361EE]/10 hover:text-[#4361EE] hover:border-[#4361EE]/30 transition-colors"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Follow-up Section */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-white/50">Follow-up Reminder</span>
                      <div className="flex items-center gap-2">
                        <input
                          type="date"
                          value={
                            contact.nextFollowUp
                              ? new Date(contact.nextFollowUp).toISOString().split("T")[0]
                              : ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            handleFollowUpChange(
                              contact.id,
                              val ? new Date(val + "T00:00:00").toISOString() : null
                            );
                          }}
                          className="px-2 py-1 rounded-md border border-white/[0.08] bg-white/[0.04] text-[10px] text-white/60 outline-none focus:ring-1 focus:ring-[#4361EE]"
                        />
                        {contact.nextFollowUp && (
                          <button
                            onClick={() => handleFollowUpChange(contact.id, null)}
                            className="text-[10px] text-white/30 hover:text-red-400 underline transition-colors"
                          >
                            Clear follow-up
                          </button>
                        )}
                        {overdue && (
                          <span className="text-[10px] font-bold text-red-400">Overdue</span>
                        )}
                      </div>
                    </div>

                    {/* Outreach Timeline */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-white/50">Outreach History</span>
                        <button
                          onClick={() => setAddingOutreach(addingOutreach === contact.id ? null : contact.id)}
                          className="text-[10px] font-semibold text-[#4361EE] hover:underline"
                        >
                          + Log Activity
                        </button>
                      </div>

                      {addingOutreach === contact.id && (
                        <form
                          onSubmit={(e) => handleAddOutreach(e, contact.id)}
                          className="flex flex-col gap-2 p-2 rounded-lg border border-white/[0.06] bg-white/[0.02]"
                        >
                          <div className="flex gap-2">
                            {OUTREACH_TYPES.map((t) => (
                              <button
                                key={t.value}
                                type="button"
                                onClick={() => setOutreachType(t.value)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                                  outreachType === t.value
                                    ? "bg-[#4361EE]/10 text-[#4361EE]"
                                    : "text-white/40 hover:text-white/60"
                                }`}
                              >
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d={t.icon} />
                                </svg>
                                {t.label}
                              </button>
                            ))}
                          </div>
                          <textarea
                            placeholder="What happened?"
                            value={outreachContent}
                            onChange={(e) => setOutreachContent(e.target.value)}
                            rows={2}
                            className="w-full px-2 py-1.5 rounded-md border border-white/[0.08] bg-white/[0.04] text-xs text-white/70 placeholder:text-white/20 outline-none focus:ring-1 focus:ring-[#4361EE] resize-none"
                            required
                          />
                          <button
                            type="submit"
                            className="self-end px-3 py-1 rounded-md bg-[#4361EE]/10 text-[#4361EE] text-[10px] font-semibold hover:bg-[#4361EE]/20 transition-colors"
                          >
                            Save
                          </button>
                        </form>
                      )}

                      {contact.outreach.length > 0 ? (
                        <div className="space-y-1.5">
                          {contact.outreach.map((entry) => {
                            const typeConfig = OUTREACH_TYPES.find((t) => t.value === entry.type) || OUTREACH_TYPES[3];
                            return (
                              <div key={entry.id} className="flex items-start gap-2 text-xs">
                                <svg className="w-3.5 h-3.5 text-white/20 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d={typeConfig.icon} />
                                </svg>
                                <div className="flex-1 min-w-0">
                                  <span className="text-white/50">{entry.content}</span>
                                  <span className="text-white/20 ml-2">
                                    {new Date(entry.sentAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          {contact._count.outreach > 5 && (
                            <p className="text-[10px] text-white/20 pl-5">
                              +{contact._count.outreach - 5} more
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-white/20">No outreach logged yet.</p>
                      )}
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors"
                    >
                      Delete contact
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Edit Modal */}
      {editContact && (
        <EditContactModal
          contact={editContact}
          onClose={() => setEditModalId(null)}
          onSave={(data) => handleEditSave(editContact.id, data)}
        />
      )}
    </section>
  );
}
