"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/*  Command Palette — ⌘K / Ctrl+K                                     */
/* ------------------------------------------------------------------ */

interface CommandPaletteProps {
  recentDecks?: { shareId: string; title: string; piqScore?: number }[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function CommandPalette({ recentDecks = [], open: controlledOpen, onOpenChange }: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = useCallback((v: boolean | ((prev: boolean) => boolean)) => {
    if (onOpenChange) {
      onOpenChange(typeof v === "function" ? v(open) : v);
    } else {
      setInternalOpen(v);
    }
  }, [onOpenChange, open]);
  const router = useRouter();

  // Global keyboard shortcut (only when uncontrolled)
  useEffect(() => {
    if (controlledOpen !== undefined) return; // Parent manages ⌘K
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev: boolean) => !prev);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [controlledOpen, setOpen]);

  const runCommand = useCallback(
    (cmd: () => void) => {
      setOpen(false);
      cmd();
    },
    [],
  );

  return (
    <>
      {/* Palette modal — trigger is in GlassTopBar, not here */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 z-[9998] bg-black/40 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />

            {/* Command dialog */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.2, ease: [0.2, 0, 0, 1] }}
              className="fixed inset-x-0 top-[20%] z-[9999] mx-auto w-full max-w-lg px-4"
            >
              <Command
                className="rounded-2xl border border-[var(--border-default)] bg-[var(--surface-1)] shadow-elevation-3 overflow-hidden"
                shouldFilter={true}
              >
                <div className="flex items-center gap-2 border-b border-[var(--border-default)] px-4">
                  <svg className="w-4 h-4 text-navy-400 dark:text-white/40 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <Command.Input
                    placeholder="Type a command or search..."
                    className="flex-1 py-3.5 text-sm bg-transparent text-navy dark:text-white placeholder:text-navy-400 dark:placeholder:text-white/30 outline-none"
                  />
                  <kbd className="px-1.5 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border-default)] text-[10px] font-mono text-navy-400 dark:text-white/30">
                    ESC
                  </kbd>
                </div>

                <Command.List className="max-h-[320px] overflow-y-auto p-2">
                  <Command.Empty className="py-8 text-center text-sm text-navy-400 dark:text-white/40">
                    No results found.
                  </Command.Empty>

                  {/* Navigation */}
                  <Command.Group heading="Navigation" className="mb-1">
                    <CommandItem
                      icon={<LayoutIcon />}
                      label="Dashboard"
                      shortcut="⌘D"
                      onSelect={() => runCommand(() => router.push("/dashboard"))}
                    />
                    <CommandItem
                      icon={<PlusIcon />}
                      label="Create Deck"
                      shortcut="⌘N"
                      onSelect={() => runCommand(() => router.push("/create"))}
                    />
                    <CommandItem
                      icon={<TargetIcon />}
                      label="Score Deck"
                      shortcut="⌘U"
                      onSelect={() => runCommand(() => router.push("/score"))}
                    />
                    <CommandItem
                      icon={<SettingsIcon />}
                      label="Settings"
                      shortcut="⌘,"
                      onSelect={() => runCommand(() => router.push("/settings"))}
                    />
                    <CommandItem
                      icon={<CreditCardIcon />}
                      label="Billing"
                      onSelect={() => runCommand(() => router.push("/billing"))}
                    />
                  </Command.Group>

                  {/* Actions */}
                  <Command.Group heading="Actions" className="mb-1">
                    <CommandItem
                      icon={<LightbulbIcon />}
                      label="Brainstorm Ideas"
                      onSelect={() => runCommand(() => router.push("/dashboard/ideas"))}
                    />
                    <CommandItem
                      icon={<MicIcon />}
                      label="Practice Pitch"
                      onSelect={() => runCommand(() => router.push("/dashboard/practice"))}
                    />
                  </Command.Group>

                  {/* Recent Decks */}
                  {recentDecks.length > 0 && (
                    <Command.Group heading="Recent Decks" className="mb-1">
                      {recentDecks.slice(0, 5).map((deck) => (
                        <CommandItem
                          key={deck.shareId}
                          icon={<FileIcon />}
                          label={deck.title}
                          badge={deck.piqScore ? `${deck.piqScore} PIQ` : undefined}
                          onSelect={() => runCommand(() => router.push(`/deck/${deck.shareId}`))}
                        />
                      ))}
                    </Command.Group>
                  )}
                </Command.List>
              </Command>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Command Item                                                       */
/* ------------------------------------------------------------------ */

function CommandItem({
  icon,
  label,
  shortcut,
  badge,
  onSelect,
}: {
  icon: React.ReactNode;
  label: string;
  shortcut?: string;
  badge?: string;
  onSelect: () => void;
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm cursor-pointer transition-colors",
        "text-navy-600 dark:text-white/70",
        "data-[selected=true]:bg-electric/5 data-[selected=true]:text-electric dark:data-[selected=true]:text-electric",
      )}
    >
      <span className="shrink-0 w-5 h-5 flex items-center justify-center text-navy-400 dark:text-white/40 data-[selected=true]:text-electric">
        {icon}
      </span>
      <span className="flex-1 truncate">{label}</span>
      {badge && (
        <span className="shrink-0 px-1.5 py-0.5 rounded-md bg-electric/10 text-electric text-[10px] font-semibold">
          {badge}
        </span>
      )}
      {shortcut && (
        <kbd className="shrink-0 px-1.5 py-0.5 rounded-md bg-[var(--surface-2)] border border-[var(--border-default)] text-[10px] font-mono text-navy-400 dark:text-white/30">
          {shortcut}
        </kbd>
      )}
    </Command.Item>
  );
}

/* ------------------------------------------------------------------ */
/*  Icons (inline SVG to avoid Lucide dependency in this file)         */
/* ------------------------------------------------------------------ */

const LayoutIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="4" rx="1" /><rect x="14" y="10" width="7" height="11" rx="1" /><rect x="3" y="13" width="7" height="8" rx="1" /></svg>;
const PlusIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12 5v14m-7-7h14" /></svg>;
const TargetIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>;
const SettingsIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>;
const CreditCardIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>;
const LightbulbIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M9 18h6m-5 4h4M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" /></svg>;
const MicIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>;
const FileIcon = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>;
