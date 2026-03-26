"use client";

import { useState, useEffect } from "react";
import { IconRail } from "./IconRail";
import { GlassTopBar } from "./GlassTopBar";
import { ToastProvider } from "@/components/v2/ui/toast";
import CommandPalette from "./CommandPalette";

/* ------------------------------------------------------------------ */
/*  v2 App Shell — Void Command Center Layout                         */
/*                                                                     */
/*  ┌──────┬──────────────────────────────────────────────┐           */
/*  │ Rail │  Glass Top Bar                               │           */
/*  │ 64px ├──────────────────────────────────────────────┤           */
/*  │      │                                              │           */
/*  │      │  Main Canvas (infinite workspace)            │           */
/*  │      │                                              │           */
/*  │      │                                              │           */
/*  └──────┴──────────────────────────────────────────────┘           */
/* ------------------------------------------------------------------ */

interface AppShellProps {
  children: React.ReactNode;
  userName?: string;
  userPlan?: string;
  userImage?: string;
  creditBalance?: number;
  breadcrumbs?: { label: string; href?: string }[];
  recentDecks?: { shareId: string; title: string; piqScore?: number }[];
}

export default function AppShellV2({ children, recentDecks }: AppShellProps) {
  const [cmdOpen, setCmdOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Global ⌘K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCmdOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <div className="void-bg min-h-screen">
      {/* Ambient background orbs (fixed, behind everything) */}
      <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true" />

      {/* Desktop icon rail */}
      <div className="hidden lg:block">
        <IconRail />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileMenuOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 z-40 lg:hidden">
            <IconRail />
          </div>
        </>
      )}

      {/* Main content area */}
      <main className="lg:ml-[var(--rail-width)] min-h-screen flex flex-col relative z-10">
        {/* Glass top bar */}
        <GlassTopBar
          onCommandPalette={() => setCmdOpen(true)}
          onMobileMenu={() => setMobileMenuOpen((v) => !v)}
        />

        {/* Canvas */}
        <ToastProvider>
          <div className="flex-1 px-6 py-6 max-w-[1400px] w-full mx-auto">
            {children}
          </div>
        </ToastProvider>
      </main>

      {/* Command Palette */}
      <CommandPalette recentDecks={recentDecks} open={cmdOpen} onOpenChange={setCmdOpen} />
    </div>
  );
}
