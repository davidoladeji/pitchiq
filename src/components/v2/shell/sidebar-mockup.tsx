"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderOpen,
  BarChart3,
  Users,
  Target,
  Mic,
  FlaskConical,
  Coins,
  Settings,
  CreditCard,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

export interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

/* ------------------------------------------------------------------ */
/*  Nav data                                                           */
/* ------------------------------------------------------------------ */

const mainNav: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Decks", href: "/dashboard/decks", icon: FolderOpen },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Investors", href: "/dashboard/investors", icon: Users },
  { label: "Fundraise", href: "/dashboard/fundraise", icon: Target },
  { label: "Practice", href: "/dashboard/practice", icon: Mic },
  { label: "A/B Tests", href: "/dashboard/ab-tests", icon: FlaskConical },
  { label: "Credits", href: "/dashboard/credits", icon: Coins },
];

const bottomNav: NavItem[] = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Billing", href: "/dashboard/billing", icon: CreditCard },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Sidebar({ collapsed: controlledCollapsed, onCollapsedChange }: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const pathname = usePathname();

  const collapsed = controlledCollapsed ?? internalCollapsed;

  function toggle() {
    const next = !collapsed;
    setInternalCollapsed(next);
    onCollapsedChange?.(next);
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 260 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed inset-y-0 left-0 z-40 flex flex-col border-r border-neutral-200 bg-surface-card"
    >
      {/* ── Logo ─────────────────────────────────────────────── */}
      <Link href="/dashboard" className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-primary text-xs font-bold text-white">
          P
        </div>
        {!collapsed && (
          <div className="flex flex-col overflow-hidden">
            <span className="text-gradient-primary text-base font-bold leading-tight">
              PitchIQ
            </span>
            <span className="text-[11px] font-medium text-neutral-400">
              Dashboard
            </span>
          </div>
        )}
      </Link>

      {/* ── Main nav ─────────────────────────────────────────── */}
      <nav className="mt-2 flex flex-1 flex-col gap-0.5 px-3">
        {mainNav.map((item) => (
          <NavButton
            key={item.href}
            item={item}
            collapsed={collapsed}
            active={
              item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href)
            }
          />
        ))}

        {/* separator */}
        <div className="my-2 border-t border-neutral-200" />

        {bottomNav.map((item) => (
          <NavButton
            key={item.href}
            item={item}
            collapsed={collapsed}
            active={pathname.startsWith(item.href)}
          />
        ))}
      </nav>

      {/* ── Collapse toggle ──────────────────────────────────── */}
      <button
        onClick={toggle}
        className="flex h-12 items-center justify-center border-t border-neutral-200 text-neutral-400 transition-colors hover:text-neutral-600"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronsRight size={18} /> : <ChevronsLeft size={18} />}
      </button>
    </motion.aside>
  );
}

/* ------------------------------------------------------------------ */
/*  NavButton                                                          */
/* ------------------------------------------------------------------ */

function NavButton({
  item,
  collapsed,
  active,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100",
        collapsed && "justify-center px-0",
        active && "bg-primary-50 text-primary-700 font-semibold hover:bg-primary-100",
      )}
    >
      <Icon size={20} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}
