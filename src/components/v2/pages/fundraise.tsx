"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  X,
  ChevronRight,
  User,
  Building2,
  Mail,
  Pencil,
  Trash2,
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import { Badge } from "@/components/v2/ui/badge";
import { Button } from "@/components/v2/ui/button";
import { Card, CardContent } from "@/components/v2/ui/card";
import { Input } from "@/components/v2/ui/input";
import { staggerContainer, fadeInUp } from "@/lib/animations";
import { relativeTime } from "@/lib/cn";
import { useDashboardData } from "@/components/v2/shell/DashboardDataContext";
import type { FundraisePipeline, InvestorContact } from "@/types";

/* ------------------------------------------------------------------ */
/*  Stage config — no green; dim / amber / electric / cyan / violet    */
/* ------------------------------------------------------------------ */

const STAGES: {
  key: InvestorContact["stage"];
  pipelineKey: keyof FundraisePipeline;
  label: string;
  color: string;
}[] = [
  { key: "identified", pipelineKey: "identified", label: "Identified", color: "var(--void-text-dim, rgba(255,255,255,0.3))" },
  { key: "contacted", pipelineKey: "contacted", label: "Contacted", color: "#FBBF24" },
  { key: "meeting", pipelineKey: "meeting", label: "Meeting", color: "var(--neon-electric, #4361EE)" },
  { key: "due_diligence", pipelineKey: "dueDiligence", label: "Due Diligence", color: "var(--neon-cyan, #00F0FF)" },
  { key: "term_sheet", pipelineKey: "termSheet", label: "Term Sheet", color: "#8B5CF6" },
];

function stageLabel(stage: InvestorContact["stage"]): string {
  return STAGES.find((s) => s.key === stage)?.label ?? stage;
}

function stageColor(stage: InvestorContact["stage"]): string {
  return STAGES.find((s) => s.key === stage)?.color ?? "var(--void-text-dim)";
}

function badgeVariantForStage(stage: InvestorContact["stage"]) {
  switch (stage) {
    case "contacted":
      return "warning" as const;
    case "meeting":
      return "primary" as const;
    case "due_diligence":
      return "primary" as const;
    case "term_sheet":
      return "primary" as const;
    default:
      return "default" as const;
  }
}

/* ------------------------------------------------------------------ */
/*  Inline form for add / edit                                         */
/* ------------------------------------------------------------------ */

interface InvestorFormData {
  name: string;
  firm: string;
  email: string;
  stage: InvestorContact["stage"];
  notes: string;
}

const EMPTY_FORM: InvestorFormData = { name: "", firm: "", email: "", stage: "identified", notes: "" };

function InvestorForm({
  initial,
  onSubmit,
  onCancel,
  loading,
  submitLabel,
}: {
  initial: InvestorFormData;
  onSubmit: (data: InvestorFormData) => void;
  onCancel: () => void;
  loading: boolean;
  submitLabel: string;
}) {
  const [form, setForm] = useState<InvestorFormData>(initial);
  const set = (key: keyof InvestorFormData, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.25 }}
      className="overflow-hidden"
    >
      <Card className="border" style={{ borderColor: "var(--void-border, rgba(255,255,255,0.06))" }}>
        <CardContent className="pt-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Name"
              icon={User}
              placeholder="Jane Smith"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
            <Input
              label="Firm"
              icon={Building2}
              placeholder="Sequoia Capital"
              value={form.firm}
              onChange={(e) => set("firm", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email"
              icon={Mail}
              placeholder="jane@sequoia.com"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
            <div className="w-full">
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: "var(--void-text-muted, rgba(255,255,255,0.5))" }}
              >
                Stage
              </label>
              <select
                className="h-10 w-full rounded-lg border px-3 text-sm transition-colors focus:outline-none focus:ring-2"
                style={{
                  background: "var(--void-surface, rgba(255,255,255,0.03))",
                  borderColor: "var(--void-border, rgba(255,255,255,0.06))",
                  color: "var(--void-text, #E8E8ED)",
                }}
                value={form.stage}
                onChange={(e) => set("stage", e.target.value as InvestorContact["stage"])}
              >
                {STAGES.map((s) => (
                  <option key={s.key} value={s.key} style={{ background: "#1a1a2e" }}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="w-full">
            <label
              className="mb-1.5 block text-sm font-medium"
              style={{ color: "var(--void-text-muted, rgba(255,255,255,0.5))" }}
            >
              Notes
            </label>
            <textarea
              className="w-full rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 resize-none"
              style={{
                background: "var(--void-surface, rgba(255,255,255,0.03))",
                borderColor: "var(--void-border, rgba(255,255,255,0.06))",
                color: "var(--void-text, #E8E8ED)",
                minHeight: 72,
              }}
              placeholder="Warm intro from..."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3 pt-1">
            <Button onClick={() => onSubmit(form)} loading={loading} disabled={!form.name.trim()}>
              {submitLabel}
            </Button>
            <Button variant="ghost" onClick={onCancel} disabled={loading}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Detail panel                                                       */
/* ------------------------------------------------------------------ */

function ContactDetail({
  contact,
  onClose,
  onUpdate,
  onDelete,
  updating,
  deleting,
}: {
  contact: InvestorContact;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<InvestorFormData>) => void;
  onDelete: (id: string) => void;
  updating: boolean;
  deleting: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<InvestorFormData>({
    name: contact.name,
    firm: contact.firm,
    email: contact.email,
    stage: contact.stage,
    notes: contact.notes,
  });
  const set = (key: keyof InvestorFormData, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    onUpdate(contact.id, form);
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 12 }}
      transition={{ duration: 0.2 }}
    >
      <Card>
        <CardContent className="pt-5 space-y-5">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold"
                style={{ background: `${stageColor(contact.stage)}20`, color: stageColor(contact.stage) }}
              >
                {contact.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-base font-semibold" style={{ color: "var(--void-text)" }}>
                  {contact.name}
                </h3>
                <p className="text-xs" style={{ color: "var(--void-text-dim)" }}>
                  {contact.firm}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setEditing((e) => !e)} disabled={updating}>
                <Pencil size={15} />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X size={15} />
              </Button>
            </div>
          </div>

          {!editing ? (
            <>
              {/* Read-only fields */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs mb-1" style={{ color: "var(--void-text-dim)" }}>
                    Email
                  </span>
                  <span style={{ color: "var(--void-text)" }}>{contact.email || "---"}</span>
                </div>
                <div>
                  <span className="block text-xs mb-1" style={{ color: "var(--void-text-dim)" }}>
                    Stage
                  </span>
                  <Badge
                    variant={badgeVariantForStage(contact.stage)}
                    style={{ borderColor: stageColor(contact.stage), color: stageColor(contact.stage) }}
                  >
                    {stageLabel(contact.stage)}
                  </Badge>
                </div>
                <div className="col-span-2">
                  <span className="block text-xs mb-1" style={{ color: "var(--void-text-dim)" }}>
                    Notes
                  </span>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: "var(--void-text-muted)" }}>
                    {contact.notes || "No notes yet."}
                  </p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs" style={{ color: "var(--void-text-dim)" }}>
                    Last updated {relativeTime(contact.lastUpdated)}
                  </span>
                </div>
              </div>

              {/* Quick stage change */}
              <div>
                <span className="block text-xs mb-2" style={{ color: "var(--void-text-dim)" }}>
                  Move to stage
                </span>
                <div className="flex flex-wrap gap-2">
                  {STAGES.filter((s) => s.key !== contact.stage).map((s) => (
                    <Button
                      key={s.key}
                      variant="outline"
                      size="sm"
                      disabled={updating}
                      onClick={() => onUpdate(contact.id, { stage: s.key })}
                      style={{ borderColor: s.color, color: s.color }}
                    >
                      {updating ? <Loader2 size={12} className="animate-spin mr-1" /> : null}
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Delete */}
              <div className="pt-2 border-t" style={{ borderColor: "var(--void-border)" }}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:text-red-300"
                  disabled={deleting}
                  onClick={() => onDelete(contact.id)}
                >
                  {deleting ? <Loader2 size={14} className="animate-spin mr-1" /> : <Trash2 size={14} className="mr-1" />}
                  Remove contact
                </Button>
              </div>
            </>
          ) : (
            /* Edit mode */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Name" icon={User} value={form.name} onChange={(e) => set("name", e.target.value)} />
                <Input label="Firm" icon={Building2} value={form.firm} onChange={(e) => set("firm", e.target.value)} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Email" icon={Mail} value={form.email} onChange={(e) => set("email", e.target.value)} />
                <div className="w-full">
                  <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--void-text-muted)" }}>
                    Stage
                  </label>
                  <select
                    className="h-10 w-full rounded-lg border px-3 text-sm focus:outline-none focus:ring-2"
                    style={{
                      background: "var(--void-surface)",
                      borderColor: "var(--void-border)",
                      color: "var(--void-text)",
                    }}
                    value={form.stage}
                    onChange={(e) => set("stage", e.target.value as InvestorContact["stage"])}
                  >
                    {STAGES.map((s) => (
                      <option key={s.key} value={s.key} style={{ background: "#1a1a2e" }}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium" style={{ color: "var(--void-text-muted)" }}>
                  Notes
                </label>
                <textarea
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
                  style={{
                    background: "var(--void-surface)",
                    borderColor: "var(--void-border)",
                    color: "var(--void-text)",
                    minHeight: 72,
                  }}
                  value={form.notes}
                  onChange={(e) => set("notes", e.target.value)}
                />
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={handleSave} loading={updating} disabled={!form.name.trim()}>
                  Save changes
                </Button>
                <Button variant="ghost" onClick={() => setEditing(false)} disabled={updating}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                          */
/* ------------------------------------------------------------------ */

export default function FundraisePage() {
  const { data: dashData } = useDashboardData();

  // Local state seeded from dashboard context
  const [contacts, setContacts] = useState<InvestorContact[]>(() => (dashData?.investorContacts as InvestorContact[]) || []);
  const [pipeline, setPipeline] = useState<FundraisePipeline>(
    () => (dashData?.fundraise as FundraisePipeline) || { identified: 0, contacted: 0, meeting: 0, dueDiligence: 0, termSheet: 0 },
  );

  // Sync if dashboard data loads after mount
  const [seeded, setSeeded] = useState(!!dashData);
  if (dashData && !seeded) {
    setContacts((dashData.investorContacts as InvestorContact[]) || []);
    setPipeline((dashData.fundraise as FundraisePipeline) || { identified: 0, contacted: 0, meeting: 0, dueDiligence: 0, termSheet: 0 });
    setSeeded(true);
  }

  // UI state
  const [showAdd, setShowAdd] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [filterStage, setFilterStage] = useState<InvestorContact["stage"] | "all">("all");

  const selected = contacts.find((c) => c.id === selectedId) ?? null;

  const total = Object.values(pipeline).reduce((s, v) => s + v, 0);

  // Pipeline key mapping (stage uses underscore, pipeline uses camelCase)
  const pipelineKeyFor = (stage: InvestorContact["stage"]): keyof FundraisePipeline => {
    return STAGES.find((s) => s.key === stage)!.pipelineKey;
  };

  /* ---------- API helpers ---------- */

  const handleAdd = useCallback(
    async (data: InvestorFormData) => {
      setAdding(true);
      setError(null);
      try {
        const res = await fetch("/api/investors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: data.name, firm: data.firm, email: data.email, status: data.stage, notes: data.notes }),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to add investor");
        }
        const created: InvestorContact = await res.json();
        setContacts((prev) => [created, ...prev]);
        setPipeline((prev) => ({ ...prev, [pipelineKeyFor(created.stage)]: prev[pipelineKeyFor(created.stage)] + 1 }));
        setShowAdd(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setAdding(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleUpdate = useCallback(
    async (id: string, data: Partial<InvestorFormData>) => {
      setUpdating(true);
      setError(null);
      try {
        const payload: Record<string, string | undefined> = {};
        if (data.name !== undefined) payload.name = data.name;
        if (data.firm !== undefined) payload.firm = data.firm;
        if (data.email !== undefined) payload.email = data.email;
        if (data.stage !== undefined) payload.status = data.stage;
        if (data.notes !== undefined) payload.notes = data.notes;

        const res = await fetch(`/api/investors/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to update investor");
        }
        const updated: InvestorContact = await res.json();
        setContacts((prev) => {
          const old = prev.find((c) => c.id === id);
          if (old && old.stage !== updated.stage) {
            setPipeline((p) => ({
              ...p,
              [pipelineKeyFor(old.stage)]: Math.max(0, p[pipelineKeyFor(old.stage)] - 1),
              [pipelineKeyFor(updated.stage)]: p[pipelineKeyFor(updated.stage)] + 1,
            }));
          }
          return prev.map((c) => (c.id === id ? updated : c));
        });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setUpdating(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      setDeleting(true);
      setError(null);
      try {
        const res = await fetch(`/api/investors/${id}`, { method: "DELETE" });
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Failed to delete investor");
        }
        setContacts((prev) => {
          const removed = prev.find((c) => c.id === id);
          if (removed) {
            setPipeline((p) => ({
              ...p,
              [pipelineKeyFor(removed.stage)]: Math.max(0, p[pipelineKeyFor(removed.stage)] - 1),
            }));
          }
          return prev.filter((c) => c.id !== id);
        });
        setSelectedId(null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setDeleting(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  /* ---------- Filtered list ---------- */

  const filtered = contacts.filter((c) => {
    if (filterStage !== "all" && c.stage !== filterStage) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.firm.toLowerCase().includes(q) || c.email.toLowerCase().includes(q);
    }
    return true;
  });

  /* ---------- Render ---------- */

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-6">
      {/* Header */}
      <motion.div variants={fadeInUp} className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: "var(--void-text)" }}>
            Fundraise Pipeline
          </h2>
          <p className="text-sm mt-1" style={{ color: "var(--void-text-dim)" }}>
            {total} investor{total !== 1 ? "s" : ""} in pipeline
          </p>
        </div>
        <Button onClick={() => { setShowAdd((v) => !v); setSelectedId(null); }}>
          {showAdd ? <X size={16} className="mr-2" /> : <Plus size={16} className="mr-2" />}
          {showAdd ? "Cancel" : "Add Investor"}
        </Button>
      </motion.div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="rounded-lg border border-red-500/30 px-4 py-3 text-sm text-red-400"
            style={{ background: "rgba(248,113,113,0.06)" }}
          >
            {error}
            <button className="ml-3 underline text-xs" onClick={() => setError(null)}>
              dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add investor form */}
      <AnimatePresence>
        {showAdd && (
          <InvestorForm
            initial={EMPTY_FORM}
            onSubmit={handleAdd}
            onCancel={() => setShowAdd(false)}
            loading={adding}
            submitLabel="Add Investor"
          />
        )}
      </AnimatePresence>

      {/* Pipeline bars */}
      <motion.div variants={fadeInUp}>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-3">
              {STAGES.map((s) => {
                const count = pipeline[s.pipelineKey] || 0;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={s.key} className="flex items-center gap-3">
                    <span className="text-xs w-28" style={{ color: "var(--void-text-muted)" }}>
                      {s.label}
                    </span>
                    <div
                      className="flex-1 h-6 rounded-full overflow-hidden"
                      style={{ background: "var(--void-surface)" }}
                    >
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%`, background: s.color }}
                      />
                    </div>
                    <span className="text-sm font-semibold w-8 text-right" style={{ color: "var(--void-text)" }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Search & filter */}
      <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input icon={Search} placeholder="Search contacts..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} style={{ color: "var(--void-text-dim)" }} />
          <select
            className="h-10 rounded-lg border px-3 text-sm focus:outline-none focus:ring-2"
            style={{
              background: "var(--void-surface)",
              borderColor: "var(--void-border)",
              color: "var(--void-text)",
            }}
            value={filterStage}
            onChange={(e) => setFilterStage(e.target.value as InvestorContact["stage"] | "all")}
          >
            <option value="all" style={{ background: "#1a1a2e" }}>All stages</option>
            {STAGES.map((s) => (
              <option key={s.key} value={s.key} style={{ background: "#1a1a2e" }}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Contact list + detail panel */}
      <motion.div variants={fadeInUp} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Contact list */}
        <div className={selected ? "lg:col-span-2 space-y-2" : "lg:col-span-3 space-y-2"}>
          <h3 className="text-lg font-semibold mb-3" style={{ color: "var(--void-text)" }}>
            Contacts{filtered.length !== contacts.length ? ` (${filtered.length})` : ""}
          </h3>

          {filtered.length === 0 ? (
            <Card className="text-center py-8">
              <p className="text-sm" style={{ color: "var(--void-text-dim)" }}>
                {contacts.length === 0
                  ? "No contacts yet. Add investors to track your pipeline."
                  : "No contacts match your search."}
              </p>
            </Card>
          ) : (
            <div className="space-y-2">
              {filtered.map((c) => (
                <Card
                  key={c.id}
                  className="p-3 flex items-center gap-3 cursor-pointer transition-colors hover:bg-white/[0.03]"
                  style={selectedId === c.id ? { borderColor: stageColor(c.stage), borderWidth: 1 } : {}}
                  onClick={() => { setSelectedId(c.id); setShowAdd(false); }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
                    style={{ background: `${stageColor(c.stage)}20`, color: stageColor(c.stage) }}
                  >
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "var(--void-text)" }}>
                      {c.name}
                    </p>
                    <p className="text-xs truncate" style={{ color: "var(--void-text-dim)" }}>
                      {c.firm}
                    </p>
                  </div>
                  <Badge variant={badgeVariantForStage(c.stage)} style={{ color: stageColor(c.stage) }}>
                    {stageLabel(c.stage)}
                  </Badge>
                  <span className="text-xs hidden sm:inline shrink-0" style={{ color: "var(--void-text-dim)" }}>
                    {relativeTime(c.lastUpdated)}
                  </span>
                  <ChevronRight size={14} className="shrink-0" style={{ color: "var(--void-text-dim)" }} />
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Detail panel */}
        <AnimatePresence>
          {selected && (
            <div className="lg:col-span-1">
              <ContactDetail
                key={selected.id}
                contact={selected}
                onClose={() => setSelectedId(null)}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                updating={updating}
                deleting={deleting}
              />
            </div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
