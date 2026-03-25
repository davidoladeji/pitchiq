"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/cn";
import { Menu, Search, Plus, Bell } from "lucide-react";

interface TopBarProps {
  onMenuClick: () => void;
  breadcrumbs?: { label: string; href?: string }[];
}

export function TopBar({ onMenuClick, breadcrumbs }: TopBarProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 h-14 flex items-center justify-between px-4 lg:px-6 transition-all duration-200",
        scrolled
          ? "bg-[var(--surface-overlay)] backdrop-blur-xl border-b border-[var(--border-subtle)]"
          : "bg-transparent",
      )}
    >
      {/* Left: Hamburger + breadcrumbs */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--surface-2)] text-navy-500 dark:text-white/60"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>

        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="hidden sm:flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <span className="text-navy-300 dark:text-white/20">/</span>}
                {crumb.href ? (
                  <a
                    href={crumb.href}
                    className="text-navy-400 dark:text-white/40 hover:text-navy dark:hover:text-white transition-colors"
                  >
                    {crumb.label}
                  </a>
                ) : (
                  <span className="text-navy dark:text-white font-medium">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
      </div>

      {/* Right: Search + quick-create + notifications */}
      <div className="flex items-center gap-2">
        {/* Search bar trigger */}
        <button
          className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-xl bg-[var(--surface-2)] border border-[var(--border-default)] text-navy-400 dark:text-white/40 text-sm hover:border-[var(--border-emphasis)] transition-colors"
          onClick={() => {
            // Dispatch ⌘K event
            document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
          }}
        >
          <Search size={14} />
          <span>Search...</span>
          <kbd className="hidden md:inline text-[10px] font-mono bg-[var(--surface-1)] border border-[var(--border-default)] rounded px-1 py-0.5">
            &#8984;K
          </kbd>
        </button>

        {/* Quick create */}
        <a
          href="/create"
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-electric text-white hover:bg-electric-600 transition-colors"
          aria-label="Create new deck"
        >
          <Plus size={18} />
        </a>

        {/* Notifications */}
        <button
          className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-[var(--surface-2)] text-navy-400 dark:text-white/40 transition-colors relative"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
      </div>
    </header>
  );
}
