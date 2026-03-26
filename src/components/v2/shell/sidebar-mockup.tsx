"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, FolderOpen, Plus, Target, Lightbulb,
  Search, Users, Mic, FlaskConical,
  Building2, Settings, CreditCard, Coins,
  ChevronsLeft, ChevronsRight, Lock,
} from "lucide-react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;        // e.g. "Growth+"
  planGated?: boolean;   // show lock for starter users
}

interface NavSection {
  label: string;
  items: NavItem[];
}

export interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  userPlan?: string;
  userName?: string;
  creditBalance?: number;
}

/* ------------------------------------------------------------------ */
/*  Nav data — grouped by section                                      */
/* ------------------------------------------------------------------ */

const NAV_SECTIONS: NavSection[] = [
  {
    label: "MAIN",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "My Decks", href: "/dashboard/decks", icon: FolderOpen },
      { label: "Create Deck", href: "/create", icon: Plus },
      { label: "Score Deck", href: "/score", icon: Target },
      { label: "Ideas", href: "/ideas", icon: Lightbulb },
    ],
  },
  {
    label: "FUNDRAISE",
    items: [
      { label: "Investor Match", href: "/dashboard/investor-match", icon: Search, badge: "Growth+", planGated: true },
      { label: "Investor CRM", href: "/dashboard/investor-crm", icon: Users, badge: "Growth+", planGated: true },
      { label: "Practice", href: "/dashboard/practice", icon: Mic, badge: "Growth+", planGated: true },
      { label: "A/B Tests", href: "/dashboard/ab-tests", icon: FlaskConical, badge: "Growth+", planGated: true },
    ],
  },
  {
    label: "WORKSPACE",
    items: [
      { label: "Team", href: "/workspace", icon: Building2 },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

const PLAN_RANK: Record<string, number> = { starter: 0, pro: 1, growth: 2, enterprise: 3 };

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Sidebar({ collapsed: controlledCollapsed, onCollapsedChange, userPlan = "starter", userName, creditBalance }: SidebarProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const pathname = usePathname();
  const collapsed = controlledCollapsed ?? internalCollapsed;
  const userRank = PLAN_RANK[userPlan] ?? 0;

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
      {/* ── Logo ── */}
      <Link href="/dashboard" className="flex h-16 items-center gap-2.5 px-5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-primary text-xs font-bold text-white">
          P
        </div>
        {!collapsed && (
          <span className="text-gradient-primary text-base font-bold leading-tight">
            PitchIQ
          </span>
        )}
      </Link>

      {/* ── Sections ── */}
      <nav className="mt-1 flex flex-1 flex-col gap-0.5 overflow-y-auto px-3 pb-2">
        {NAV_SECTIONS.map((section, sIdx) => (
          <div key={section.label}>
            {/* Section header */}
            {!collapsed && (
              <div className={cn("px-3 pt-4 pb-1.5 text-[11px] font-semibold uppercase tracking-widest text-neutral-400", sIdx === 0 && "pt-2")}>
                {section.label}
              </div>
            )}
            {collapsed && sIdx > 0 && <div className="my-2 border-t border-neutral-200" />}

            {/* Items */}
            {section.items.map((item) => {
              const isActive = item.href === "/dashboard"
                ? pathname === "/dashboard"
                : pathname.startsWith(item.href);
              const isLocked = item.planGated && userRank < 2; // Growth+ required

              return (
                <NavButton
                  key={item.href}
                  item={item}
                  collapsed={collapsed}
                  active={isActive}
                  locked={isLocked}
                />
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── Bottom: user info + billing + credits ── */}
      <div className="border-t border-neutral-200 px-3 py-3 space-y-1">
        {/* Credits pill */}
        <Link
          href="/dashboard/credits"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100",
            collapsed && "justify-center px-0",
            pathname.startsWith("/dashboard/credits") && "bg-primary-50 text-primary-700",
          )}
          title={collapsed ? `${creditBalance ?? 0} credits` : undefined}
        >
          <Coins size={18} className="shrink-0 text-amber-500" />
          {!collapsed && <span>{creditBalance ?? 0} credits</span>}
        </Link>

        {/* Billing */}
        <Link
          href="/billing"
          className={cn(
            "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100",
            collapsed && "justify-center px-0",
            pathname.startsWith("/billing") && "bg-primary-50 text-primary-700",
          )}
          title={collapsed ? "Billing" : undefined}
        >
          <CreditCard size={18} className="shrink-0" />
          {!collapsed && <span>Billing</span>}
        </Link>

        {/* User info */}
        {!collapsed && userName && (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700">
              {userName.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-800 truncate">{userName}</p>
              <p className="text-[10px] text-neutral-400 capitalize">{userPlan}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Collapse toggle ── */}
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
  locked,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  locked?: boolean;
}) {
  const Icon = item.icon;

  return (
    <Link
      href={locked ? "/billing" : item.href}
      title={collapsed ? item.label : undefined}
      className={cn(
        "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-colors hover:bg-neutral-100",
        collapsed && "justify-center px-0",
        active && "bg-primary-50 text-primary-700 font-semibold hover:bg-primary-100",
        locked && "opacity-60",
      )}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {locked && item.badge && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-electric/10 text-electric">
              <Lock size={8} />
              {item.badge}
            </span>
          )}
        </>
      )}
    </Link>
  );
}
