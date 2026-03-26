"use client";

import { Bell, Menu, Coins } from "lucide-react";
import { Badge } from "@/components/v2/ui/badge";
import { Button } from "@/components/v2/ui/button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  userName?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Header({ onMenuClick, showMenuButton, userName }: HeaderProps) {
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();
  const initials = (userName || "U").split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <header className="sticky top-0 z-20 bg-surface-page/95 backdrop-blur-sm border-b border-neutral-200/50 flex items-center justify-between py-5">
      {/* ── Left ──────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </Button>
          </div>
        )}
        <h1 className="text-xl font-semibold text-neutral-900">
          {greeting}, {userName || "there"}
        </h1>
      </div>

      {/* ── Right ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <Badge variant="primary">Growth</Badge>

        <span className="flex items-center gap-1 text-sm text-neutral-500">
          <Coins size={14} className="text-neutral-400" />
          23
        </span>

        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell size={20} />
        </Button>

        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100 text-sm font-semibold text-primary-700">
          {initials}
        </div>
      </div>
    </header>
  );
}
