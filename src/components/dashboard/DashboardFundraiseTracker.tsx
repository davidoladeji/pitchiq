"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
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
}

const STATUSES = [
  { value: "identified", label: "Identified", color: "bg-navy-100 text-navy-600" },
  { value: "contacted", label: "Contacted", color: "bg-electric/15 text-electric" },
  { value: "meeting", label: "Meeting", color: "bg-indigo-100 text-indigo-700" },
  { value: "due_diligence", label: "Due Diligence", color: "bg-amber-100 text-amber-700" },
  { value: "term_sheet", label: "Term Sheet", color: "bg-violet/15 text-violet" },
  { value: "committed", label: "Committed", color: "bg-emerald/15 text-emerald" },
  { value: "passed", label: "Passed", color: "bg-red-100 text-red-600" },
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

export default function DashboardFundraiseTracker({ plan }: { plan: string }) {
  const limits = getPlanLimits(plan);
  const [contacts, setContacts] = useState<InvestorContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [addingOutreach, setAddingOutreach] = useState<string | null>(null);
  const [error, setError] = useState("");

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
    try {
      await fetch(`/api/investors/${contactId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchContacts();
    } catch {
      /* ignore */
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
    // Optimistic update
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
      fetchContacts(); // revert on failure
    }
  }

  async function handleFollowUpChange(contactId: string, date: string | null) {
    // Optimistic update
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
      <section className="rounded-2xl border border-navy-100 bg-white p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-navy flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
            </svg>
            Fundraise Tracker
          </h2>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-violet-100 text-violet-700">Growth</span>
        </div>
        <p className="text-xs text-navy-500">
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

  return (
    <section className="rounded-2xl border border-navy-100 bg-white p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-navy flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
          </svg>
          Fundraise Tracker
          <span className="text-xs font-normal text-navy-400">({contacts.length} contacts)</span>
        </h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1.5 rounded-lg bg-electric text-white text-xs font-semibold hover:bg-electric-600 transition-colors"
        >
          {showAddForm ? "Cancel" : "+ Add Contact"}
        </button>
      </div>

      {/* Overdue Follow-up Banner */}
      {overdueCount > 0 && (
        <button
          onClick={() => {
            setFilterOverdue(true);
            setSearchQuery("");
            setFilterTag("");
          }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-left transition-colors hover:bg-amber-100"
        >
          <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
          </svg>
          <span className="text-xs font-semibold text-amber-700">
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
          className="flex-1 min-w-[160px] px-3 py-1.5 rounded-lg border border-navy-200 text-xs bg-white outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:border-electric"
        />
        {allTags.length > 0 && (
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="px-2 py-1.5 rounded-lg border border-navy-200 text-xs bg-white outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:border-electric"
          >
            <option value="">All tags</option>
            {allTags.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        )}
        <label className="flex items-center gap-1.5 text-xs text-navy-500 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={filterOverdue}
            onChange={(e) => setFilterOverdue(e.target.checked)}
            className="rounded border-navy-300 text-electric focus:ring-electric"
          />
          Overdue
        </label>
        {(searchQuery || filterTag || filterOverdue) && (
          <button
            onClick={() => { setSearchQuery(""); setFilterTag(""); setFilterOverdue(false); }}
            className="text-[10px] text-navy-400 hover:text-navy-600 underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Add Contact Form */}
      {showAddForm && (
        <form onSubmit={handleAddContact} className="rounded-xl border border-navy-100 bg-navy-50/30 p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              placeholder="Contact name *"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="px-3 py-2 rounded-lg border border-navy-200 text-xs bg-white outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:border-electric"
              required
            />
            <input
              type="text"
              placeholder="Firm / Fund"
              value={newFirm}
              onChange={(e) => setNewFirm(e.target.value)}
              className="px-3 py-2 rounded-lg border border-navy-200 text-xs bg-white outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:border-electric"
            />
            <input
              type="email"
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="px-3 py-2 rounded-lg border border-navy-200 text-xs bg-white outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:border-electric"
            />
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="px-3 py-2 rounded-lg border border-navy-200 text-xs bg-white outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:border-electric"
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
            className="w-full px-3 py-2 rounded-lg border border-navy-200 text-xs bg-white outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:border-electric resize-none"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-electric text-white text-xs font-semibold hover:bg-electric-600 transition-colors"
          >
            Add Contact
          </button>
        </form>
      )}

      {/* Contacts List */}
      {loading ? (
        <div className="text-center py-8" role="status">
          <div
            className="w-5 h-5 border-2 border-electric border-t-transparent rounded-full animate-spin motion-reduce:animate-none motion-reduce:border-electric/40 mx-auto ring-2 ring-electric/15 ring-offset-2 ring-offset-white motion-reduce:ring-0"
            aria-hidden="true"
          />
          <span className="sr-only">Loading investor contacts</span>
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-sm text-navy-400">No investor contacts yet.</p>
          <p className="text-xs text-navy-300 mt-1">Add your first contact to start tracking your fundraise.</p>
        </div>
      ) : filteredContacts.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-sm text-navy-400">No contacts match your filters.</p>
          <button
            onClick={() => { setSearchQuery(""); setFilterTag(""); setFilterOverdue(false); }}
            className="text-xs text-electric hover:underline mt-1"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredContacts.map((contact) => {
            const statusConfig = getStatusConfig(contact.status);
            const isExpanded = expandedId === contact.id;
            const contactTags = parseTags(contact.tags);
            const overdue = isOverdue(contact.nextFollowUp);
            const hasFutureFollowUp = contact.nextFollowUp && !overdue;

            return (
              <div key={contact.id} className="rounded-xl border border-navy-100 bg-white overflow-hidden">
                {/* Contact Row */}
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-navy-50/50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : contact.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-navy truncate">{contact.name}</span>
                      {contact.firm && (
                        <span className="text-xs text-navy-400 truncate">@ {contact.firm}</span>
                      )}
                      {/* Tag chips in collapsed row */}
                      {contactTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-electric/10 text-electric"
                        >
                          {tag}
                        </span>
                      ))}
                      {contactTags.length > 3 && (
                        <span className="text-[9px] text-navy-400">+{contactTags.length - 3}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {contact.email && (
                        <p className="text-[10px] text-navy-400 truncate">{contact.email}</p>
                      )}
                      {/* Follow-up indicators */}
                      {overdue && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                          Overdue
                        </span>
                      )}
                      {hasFutureFollowUp && (
                        <span className="flex items-center gap-0.5 text-[10px] text-navy-400">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                          </svg>
                          {formatFollowUpDate(contact.nextFollowUp!)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] text-navy-300">
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
                      className={`w-4 h-4 text-navy-300 transition-transform ${isExpanded ? "rotate-180" : ""}`}
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
                  <div className="border-t border-navy-100 p-3 bg-navy-50/20 space-y-3">
                    {contact.notes && (
                      <p className="text-xs text-navy-500 italic">{contact.notes}</p>
                    )}

                    {/* Tags Section */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-navy">Tags</span>
                      {/* Existing tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {contactTags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-electric/10 text-electric"
                          >
                            {tag}
                            <button
                              onClick={() => removeTagFromContact(contact.id, contactTags, tag)}
                              className="hover:text-red-500 transition-colors leading-none"
                              aria-label={`Remove tag ${tag}`}
                            >
                              &times;
                            </button>
                          </span>
                        ))}
                      </div>
                      {/* Add tag input */}
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
                        className="w-full max-w-xs px-2 py-1 rounded-md border border-navy-200 text-[10px] bg-white outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:border-electric"
                      />
                      {/* Suggested tags */}
                      <div className="flex flex-wrap gap-1">
                        {SUGGESTED_TAGS.filter((t) => !contactTags.includes(t)).map((tag) => (
                          <button
                            key={tag}
                            onClick={() => addTagToContact(contact.id, contactTags, tag)}
                            className="px-1.5 py-0.5 rounded-full text-[9px] font-medium border border-navy-200 text-navy-400 hover:bg-electric/10 hover:text-electric hover:border-electric/30 transition-colors"
                          >
                            + {tag}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Follow-up Section */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-navy">Follow-up Reminder</span>
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
                          className="px-2 py-1 rounded-md border border-navy-200 text-[10px] bg-white outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:border-electric"
                        />
                        {contact.nextFollowUp && (
                          <button
                            onClick={() => handleFollowUpChange(contact.id, null)}
                            className="text-[10px] text-navy-400 hover:text-red-500 underline transition-colors"
                          >
                            Clear follow-up
                          </button>
                        )}
                        {overdue && (
                          <span className="text-[10px] font-bold text-red-600">Overdue</span>
                        )}
                      </div>
                    </div>

                    {/* Outreach Timeline */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-navy">Outreach History</span>
                        <button
                          onClick={() => setAddingOutreach(addingOutreach === contact.id ? null : contact.id)}
                          className="text-[10px] font-semibold text-electric hover:underline"
                        >
                          + Log Activity
                        </button>
                      </div>

                      {/* Add Outreach Form */}
                      {addingOutreach === contact.id && (
                        <form
                          onSubmit={(e) => handleAddOutreach(e, contact.id)}
                          className="flex flex-col gap-2 p-2 rounded-lg border border-navy-200 bg-white"
                        >
                          <div className="flex gap-2">
                            {OUTREACH_TYPES.map((t) => (
                              <button
                                key={t.value}
                                type="button"
                                onClick={() => setOutreachType(t.value)}
                                className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-colors ${
                                  outreachType === t.value
                                    ? "bg-electric/10 text-electric"
                                    : "text-navy-400 hover:text-navy"
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
                            className="w-full px-2 py-1.5 rounded-md border border-navy-200 text-xs bg-white outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:border-electric resize-none"
                            required
                          />
                          <button
                            type="submit"
                            className="self-end px-3 py-1 rounded-md bg-electric text-white text-[10px] font-semibold hover:bg-electric-600 transition-colors"
                          >
                            Save
                          </button>
                        </form>
                      )}

                      {/* Timeline */}
                      {contact.outreach.length > 0 ? (
                        <div className="space-y-1.5">
                          {contact.outreach.map((entry) => {
                            const typeConfig = OUTREACH_TYPES.find((t) => t.value === entry.type) || OUTREACH_TYPES[3];
                            return (
                              <div key={entry.id} className="flex items-start gap-2 text-xs">
                                <svg className="w-3.5 h-3.5 text-navy-300 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d={typeConfig.icon} />
                                </svg>
                                <div className="flex-1 min-w-0">
                                  <span className="text-navy-600">{entry.content}</span>
                                  <span className="text-navy-300 ml-2">
                                    {new Date(entry.sentAt).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                          {contact._count.outreach > 5 && (
                            <p className="text-[10px] text-navy-300 pl-5">
                              +{contact._count.outreach - 5} more
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-navy-300">No outreach logged yet.</p>
                      )}
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(contact.id)}
                      className="text-[10px] text-red-400 hover:text-red-600 transition-colors"
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
    </section>
  );
}
