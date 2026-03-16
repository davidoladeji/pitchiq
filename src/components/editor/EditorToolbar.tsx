"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useEditorStore } from "./state/editorStore";
import { THEMES } from "@/lib/themes";

export type AIPanel = "coach" | "investor-lens" | "simulator" | null;

interface EditorToolbarProps {
  plan: string;
  activeAIPanel: AIPanel;
  onToggleAIPanel: (panel: AIPanel) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function EditorToolbar({ plan, activeAIPanel, onToggleAIPanel }: EditorToolbarProps) {
  const deck = useEditorStore((s) => s.deck);
  const isDirty = useEditorStore((s) => s.isDirty);
  const saving = useEditorStore((s) => s.saving);
  const savedAt = useEditorStore((s) => s.savedAt);
  const undoStack = useEditorStore((s) => s.undoStack);
  const redoStack = useEditorStore((s) => s.redoStack);
  const themeId = useEditorStore((s) => s.themeId);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const save = useEditorStore((s) => s.save);
  const setTheme = useEditorStore((s) => s.setTheme);
  const setTitle = useEditorStore((s) => s.setTitle);

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [themeOpen, setThemeOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const titleInputRef = useRef<HTMLInputElement>(null);
  const themeRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const aiRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (themeRef.current && !themeRef.current.contains(e.target as Node)) setThemeOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
      if (aiRef.current && !aiRef.current.contains(e.target as Node)) setAiOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function startEditTitle() {
    setTitleValue(deck?.title || "");
    setEditingTitle(true);
  }

  function commitTitle() {
    setEditingTitle(false);
    if (titleValue.trim() && titleValue !== deck?.title) {
      setTitle(titleValue.trim());
    }
  }

  async function handleSave() {
    setSaveError(null);
    try {
      await save();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Save failed");
    }
  }

  const currentTheme = THEMES.find((t) => t.id === themeId) || THEMES[0];

  const savedRecently = savedAt && Date.now() - savedAt < 3000;

  return (
    <div className="h-14 bg-navy-950 border-b border-white/10 flex items-center px-3 md:px-4 gap-2 md:gap-3 shrink-0">
      {/* Back button */}
      <Link
        href="/dashboard"
        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition-colors text-white/60 hover:text-white shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
        title="Back to dashboard"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </Link>

      {/* Title */}
      <div className="min-w-0 flex-shrink">
        {editingTitle ? (
          <input
            ref={titleInputRef}
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={commitTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitTitle();
              if (e.key === "Escape") setEditingTitle(false);
            }}
            className="bg-white/10 text-white text-sm font-semibold px-2 py-1 rounded-md border border-white/20 outline-none focus:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 w-full max-w-[240px]"
          />
        ) : (
          <button
            onClick={startEditTitle}
            className="text-white text-sm font-semibold truncate max-w-[200px] hover:bg-white/5 px-2 py-1 rounded-md transition-colors"
            title="Click to rename"
          >
            {deck?.title || "Untitled Deck"}
          </button>
        )}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Theme selector */}
      <div className="relative hidden md:block" ref={themeRef}>
        <button
          onClick={() => setThemeOpen(!themeOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 transition-colors text-white text-xs font-medium"
        >
          <span
            className="w-3 h-3 rounded-full border border-white/20"
            style={{ background: currentTheme.accent }}
          />
          <span className="hidden sm:inline">{currentTheme.name}</span>
          <svg className="w-3 h-3 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {themeOpen && (
          <div className="absolute top-full right-0 mt-1 w-52 bg-navy border border-white/10 rounded-xl shadow-xl z-50 py-1 max-h-80 overflow-y-auto">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setThemeOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-white/5 transition-colors ${
                  t.id === themeId ? "bg-white/10" : ""
                }`}
              >
                <span
                  className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                  style={{ background: t.accent }}
                />
                <span className="text-white text-xs font-medium">{t.name}</span>
                {t.id === themeId && (
                  <svg className="w-3.5 h-3.5 text-electric ml-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={undo}
          disabled={undoStack.length === 0}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a5 5 0 015 5v2M3 10l4-4M3 10l4 4" />
          </svg>
        </button>
        <button
          onClick={redo}
          disabled={redoStack.length === 0}
          className="w-8 h-8 flex items-center justify-center rounded-lg text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
          title="Redo (Ctrl+Shift+Z)"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a5 5 0 00-5 5v2M21 10l-4-4M21 10l-4 4" />
          </svg>
        </button>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving || !isDirty}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 ${
          savedRecently && !isDirty
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            : isDirty
            ? "bg-electric text-white hover:bg-electric-600"
            : "bg-white/10 text-white/40"
        }`}
        title="Save (Ctrl+S)"
      >
        {saving ? (
          <>
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Saving...
          </>
        ) : savedRecently && !isDirty ? (
          <>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            Saved
          </>
        ) : (
          "Save"
        )}
      </button>

      {saveError && (
        <span className="text-xs text-red-400 hidden md:inline">{saveError}</span>
      )}

      {/* Preview */}
      <a
        href={deck ? `/deck/${deck.shareId}` : "#"}
        target="_blank"
        rel="noopener noreferrer"
        className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        Preview
      </a>

      {/* Export dropdown */}
      <div className="relative hidden md:block" ref={exportRef}>
        <button
          onClick={() => setExportOpen(!exportOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
          <svg className="w-3 h-3 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {exportOpen && (
          <div className="absolute top-full right-0 mt-1 w-44 bg-navy border border-white/10 rounded-xl shadow-xl z-50 py-1">
            <a
              href={deck ? `/deck/${deck.shareId}` : "#"}
              className="flex items-center gap-2 px-3 py-2 text-white text-xs hover:bg-white/5 transition-colors"
              onClick={() => setExportOpen(false)}
            >
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              Export PDF
            </a>
            <a
              href={deck ? `/deck/${deck.shareId}` : "#"}
              className="flex items-center gap-2 px-3 py-2 text-white text-xs hover:bg-white/5 transition-colors"
              onClick={() => setExportOpen(false)}
            >
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
              Export PPTX
            </a>
          </div>
        )}
      </div>

      {/* AI dropdown */}
      <div className="relative hidden md:block" ref={aiRef}>
        <button
          onClick={() => setAiOpen(!aiOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 ${
            activeAIPanel
              ? "bg-gradient-to-r from-electric to-violet ring-2 ring-electric/50 ring-offset-1 ring-offset-navy-950"
              : "bg-gradient-to-r from-electric to-violet hover:from-electric-600 hover:to-violet"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI
          <svg className="w-3 h-3 text-white/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {aiOpen && (
          <div className="absolute top-full right-0 mt-1 w-52 bg-navy border border-white/10 rounded-xl shadow-xl z-50 py-1">
            <div className="px-3 py-2 text-white/40 text-[10px] uppercase tracking-wider font-semibold">
              AI Assistant
            </div>
            {([
              { id: "coach" as const, label: "Coach this slide", icon: "M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z", gradient: "from-amber-400 to-orange-500" },
              { id: "investor-lens" as const, label: "Investor Lens", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", gradient: "from-blue-500 to-purple-500" },
              { id: "simulator" as const, label: "Pitch Simulator", icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", gradient: "from-red-500 to-rose-600" },
            ]).map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onToggleAIPanel(activeAIPanel === item.id ? null : item.id);
                  setAiOpen(false);
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-xs transition-colors group ${
                  activeAIPanel === item.id
                    ? "bg-white/10 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <div className={`w-5 h-5 rounded flex items-center justify-center bg-gradient-to-br ${item.gradient}`}>
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                </div>
                {item.label}
                {activeAIPanel === item.id && (
                  <span className="ml-auto text-[10px] bg-electric/20 text-electric px-1.5 py-0.5 rounded-full font-semibold">
                    Active
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
