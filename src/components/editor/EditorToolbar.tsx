"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useEditorStore } from "./state/editorStore";
import { useAutosave } from "./state/useAutosave";
import { THEMES } from "@/lib/themes";
import DesignScoreWidget from "./DesignScoreWidget";

export type AIPanel = "coach" | "investor-lens" | "simulator" | null;
export type EditorPanel = "analytics" | "comments" | "versions" | null;

interface EditorToolbarProps {
  plan: string;
  activeAIPanel: AIPanel;
  onToggleAIPanel: (panel: AIPanel) => void;
  activeEditorPanel: EditorPanel;
  onToggleEditorPanel: (panel: EditorPanel) => void;
  onPresent: () => void;
  onSocialExport: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function EditorToolbar({ plan, activeAIPanel, onToggleAIPanel, activeEditorPanel, onToggleEditorPanel, onPresent, onSocialExport }: EditorToolbarProps) {
  const deck = useEditorStore((s) => s.deck);
  const slides = useEditorStore((s) => s.slides);
  const slideBlocks = useEditorStore((s) => s.slideBlocks);
  const slideBlockOrder = useEditorStore((s) => s.slideBlockOrder);
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
  const autosaveStatus = useEditorStore((s) => s.autosaveStatus);

  // Start the autosave interval
  useAutosave();

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");
  const [themeOpen, setThemeOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [exportingPptx, setExportingPptx] = useState(false);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [copied, setCopied] = useState(false);

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
            className="bg-white/10 text-white text-sm font-semibold px-2 py-1 rounded-md border border-white/20 outline-none focus:outline-none focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 w-full max-w-[240px]"
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

      {/* Design Score */}
      <div className="hidden md:block">
        <DesignScoreWidget />
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={saving || !isDirty}
        aria-busy={saving}
        aria-label={saving ? "Saving deck" : savedRecently && !isDirty ? "Deck saved" : isDirty ? "Save deck" : "Save disabled, no changes"}
        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all motion-reduce:transition-none flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 ${
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
            <svg className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none" fill="none" viewBox="0 0 24 24" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span className="sr-only">Saving, please wait</span>
            <span aria-hidden>Saving...</span>
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

      {/* Autosave status indicator */}
      {autosaveStatus !== "idle" && (
        <span
          className={`hidden md:flex items-center gap-1.5 text-[11px] font-medium transition-opacity duration-300 ${
            autosaveStatus === "saving"
              ? "text-white/50"
              : autosaveStatus === "saved"
              ? "text-emerald-400/70"
              : "text-red-400/70"
          }`}
          aria-live="polite"
        >
          {autosaveStatus === "saving" && (
            <>
              <svg className="w-3 h-3 animate-spin motion-reduce:animate-none" fill="none" viewBox="0 0 24 24" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Autosaving...
            </>
          )}
          {autosaveStatus === "saved" && (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Autosaved
            </>
          )}
          {autosaveStatus === "error" && (
            <>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Autosave failed
            </>
          )}
        </span>
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

      {/* Analytics button */}
      <button
        onClick={() => onToggleEditorPanel(activeEditorPanel === "analytics" ? null : "analytics")}
        className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          activeEditorPanel === "analytics"
            ? "bg-white/15 text-white"
            : "bg-white/10 hover:bg-white/15 text-white/70 hover:text-white"
        }`}
        title="Deck Analytics"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      </button>

      {/* Comments button */}
      <button
        onClick={() => onToggleEditorPanel(activeEditorPanel === "comments" ? null : "comments")}
        className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          activeEditorPanel === "comments"
            ? "bg-white/15 text-white"
            : "bg-white/10 hover:bg-white/15 text-white/70 hover:text-white"
        }`}
        title="Comments"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
        </svg>
      </button>

      {/* Version History button */}
      <button
        onClick={() => onToggleEditorPanel(activeEditorPanel === "versions" ? null : "versions")}
        className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
          activeEditorPanel === "versions"
            ? "bg-white/15 text-white"
            : "bg-white/10 hover:bg-white/15 text-white/70 hover:text-white"
        }`}
        title="Version History"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

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
          <div className="absolute top-full right-0 mt-1 w-56 bg-navy border border-white/10 rounded-xl shadow-xl z-50 py-1">
            {/* PowerPoint */}
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors disabled:opacity-40"
              disabled={exportingPptx}
              onClick={async () => {
                setExportingPptx(true);
                try {
                  const { exportPptx } = await import("@/lib/export/pptx-exporter");
                  await exportPptx({
                    slides,
                    slideBlocks,
                    slideBlockOrder,
                    themeId,
                    deckTitle: deck?.title || "pitch-deck",
                    companyName: deck?.companyName || "",
                  });
                } catch (err) {
                  console.error("PPTX export failed:", err);
                } finally {
                  setExportingPptx(false);
                  setExportOpen(false);
                }
              }}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/15">
                <svg className="w-3.5 h-3.5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-white">
                  {exportingPptx ? "Exporting..." : "PowerPoint (.pptx)"}
                </div>
                <div className="text-[10px] text-white/40">Editable slides</div>
              </div>
            </button>

            {/* PDF */}
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors disabled:opacity-40"
              disabled={exportingPdf}
              onClick={async () => {
                setExportingPdf(true);
                try {
                  const { exportPdf } = await import("@/lib/export/pdf-exporter");
                  await exportPdf({
                    deckTitle: deck?.title || "pitch-deck",
                    companyName: deck?.companyName || "",
                    slideCount: slides.length,
                    watermark: plan === "starter",
                    showBranding: plan === "starter",
                  });
                } catch (err) {
                  console.error("PDF export failed:", err);
                } finally {
                  setExportingPdf(false);
                  setExportOpen(false);
                }
              }}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-500/15">
                <svg className="w-3.5 h-3.5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-white">
                  {exportingPdf ? "Exporting..." : "PDF"}
                </div>
                <div className="text-[10px] text-white/40">High-quality document</div>
              </div>
            </button>

            <div className="my-1 border-t border-white/[0.06]" />

            {/* Present */}
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
              onClick={() => {
                setExportOpen(false);
                onPresent();
              }}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#4361EE]/15">
                <svg className="w-3.5 h-3.5 text-[#4361EE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-white">Present</div>
                <div className="text-[10px] text-white/40">Fullscreen with animations</div>
              </div>
            </button>

            {/* Social Media */}
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
              onClick={() => {
                setExportOpen(false);
                onSocialExport();
              }}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-500/15">
                <svg className="w-3.5 h-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                </svg>
              </div>
              <div>
                <div className="text-xs font-medium text-white">Social Media</div>
                <div className="text-[10px] text-white/40">LinkedIn, Twitter, Instagram</div>
              </div>
            </button>

            <div className="my-1 border-t border-white/[0.06]" />

            {/* Copy Link */}
            <button
              className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-white/5 transition-colors"
              onClick={async () => {
                if (deck?.shareId) {
                  const url = `${window.location.origin}/deck/${deck.shareId}`;
                  await navigator.clipboard.writeText(url);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }
                setExportOpen(false);
              }}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15">
                {copied ? (
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-3.572a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.34 8.374" />
                  </svg>
                )}
              </div>
              <div>
                <div className="text-xs font-medium text-white">
                  {copied ? "Copied!" : "Copy Link"}
                </div>
                <div className="text-[10px] text-white/40">Share your deck URL</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* AI dropdown */}
      <div className="relative hidden md:block" ref={aiRef}>
        <button
          onClick={() => setAiOpen(!aiOpen)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 ${
            activeAIPanel
              ? "bg-electric ring-2 ring-electric/50 ring-offset-1 ring-offset-navy-950"
              : "bg-electric hover:bg-electric-600"
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
              { id: "investor-lens" as const, label: "Investor Lens", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z", gradient: "from-electric to-violet-500" },
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
