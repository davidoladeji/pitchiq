"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Badge } from "../ui/Badge";
import {
  LayoutDashboard, Layers, Plus, Target, Lightbulb,
  Search, Users, Mic, Split, Building2, Settings,
  ChevronLeft, ChevronRight, LogOut, CreditCard,
  Sparkles, X,
} from "lucide-react";

interface SidebarProps {
  userName?: string;
  userPlan?: string;
  userImage?: string;
  creditBalance?: number;
  onMobileClose?: () => void;
  isMobileOpen?: boolean;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
  gated?: boolean;
}

const MAIN_NAV: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { label: "My Decks", href: "/dashboard#decks", icon: <Layers size={20} /> },
  { label: "Create Deck", href: "/create", icon: <Plus size={20} /> },
  { label: "Score Deck", href: "/score", icon: <Target size={20} /> },
  { label: "Ideas", href: "/ideas", icon: <Lightbulb size={20} /> },
];

const FUNDRAISE_NAV: NavItem[] = [
  { label: "Investor Match", href: "/investors", icon: <Search size={20} />, badge: "Growth+", gated: true },
  { label: "Investor CRM", href: "/crm", icon: <Users size={20} />, badge: "Growth+", gated: true },
  { label: "Practice", href: "/practice", icon: <Mic size={20} />, badge: "Growth+", gated: true },
  { label: "A/B Tests", href: "/ab-tests", icon: <Split size={20} />, badge: "Growth+", gated: true },
];

const WORKSPACE_NAV: NavItem[] = [
  { label: "Team", href: "/workspace", icon: <Building2 size={20} /> },
  { label: "Settings", href: "/settings", icon: <Settings size={20} /> },
];

export function Sidebar({ userName, userPlan = "starter", creditBalance, onMobileClose, isMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  // Persist collapsed state
  useEffect(() => {
    const saved = localStorage.getItem("pitchiq-sidebar-collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  const toggleCollapse = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem("pitchiq-sidebar-collapsed", String(next));
  };

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const isPro = userPlan !== "starter";

  const renderNavItem = (item: NavItem) => {
    const active = isActive(item.href);
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onMobileClose}
        className={cn(
          "flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-medium transition-all duration-150 relative group",
          active
            ? "bg-electric/8 text-electric"
            : "text-navy-500 dark:text-white/60 hover:bg-[var(--surface-2)] hover:text-navy dark:hover:text-white",
        )}
      >
        {active && (
          <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-full bg-electric" />
        )}
        <span className="shrink-0">{item.icon}</span>
        {!collapsed && <span className="truncate">{item.label}</span>}
        {!collapsed && item.badge && (
          <Badge variant="violet" size="sm" className="ml-auto">{item.badge}</Badge>
        )}
      </Link>
    );
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-4 h-14 flex items-center justify-between border-b border-[var(--border-default)]">
        {!collapsed ? (
          <Link href="/dashboard" className="text-lg font-bold text-navy dark:text-white">
            PitchIQ
          </Link>
        ) : (
          <Link href="/dashboard" className="text-lg font-bold text-electric mx-auto">
            P
          </Link>
        )}
        {/* Desktop collapse toggle */}
        <button
          onClick={toggleCollapse}
          className="hidden lg:flex w-7 h-7 items-center justify-center rounded-lg hover:bg-[var(--surface-2)] text-navy-400 dark:text-white/40"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
        {/* Mobile close */}
        {isMobileOpen && (
          <button onClick={onMobileClose} className="lg:hidden w-7 h-7 flex items-center justify-center text-navy-400 dark:text-white/40">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {/* Main */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-navy-400 dark:text-white/30">
              Main
            </p>
          )}
          {MAIN_NAV.map(renderNavItem)}
        </div>

        {/* Fundraise */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-navy-400 dark:text-white/30">
              Fundraise
            </p>
          )}
          {FUNDRAISE_NAV.map(renderNavItem)}
        </div>

        {/* Workspace */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="px-3 mb-2 text-[11px] font-semibold uppercase tracking-widest text-navy-400 dark:text-white/30">
              Workspace
            </p>
          )}
          {WORKSPACE_NAV.map(renderNavItem)}
        </div>
      </nav>

      {/* Upgrade CTA (starter only) */}
      {!isPro && !collapsed && (
        <div className="px-3 pb-3">
          <Link
            href="/pricing"
            className="block p-3 rounded-xl border border-electric/20 bg-electric/5 dark:bg-electric/10 text-center hover:border-electric/40 transition-colors"
          >
            <Sparkles size={16} className="inline text-electric mb-1" />
            <p className="text-xs font-semibold text-navy dark:text-white">Go Pro</p>
            <p className="text-[10px] text-navy-400 dark:text-white/40">Unlock exports & more</p>
          </Link>
        </div>
      )}

      {/* User section */}
      <div className="px-3 pb-4 border-t border-[var(--border-default)] pt-3">
        {!collapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-electric/10 flex items-center justify-center text-sm font-bold text-electric">
              {(userName || "U")[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-navy dark:text-white truncate">{userName || "User"}</p>
              <div className="flex items-center gap-2">
                <Badge variant="electric" size="sm">{userPlan}</Badge>
                {typeof creditBalance === "number" && (
                  <span className="text-[10px] text-navy-400 dark:text-white/40">{creditBalance} cr</span>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-9 h-9 rounded-full bg-electric/10 flex items-center justify-center text-sm font-bold text-electric">
              {(userName || "U")[0].toUpperCase()}
            </div>
          </div>
        )}

        {!collapsed && (
          <div className="mt-3 flex gap-1">
            <Link
              href="/billing"
              className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg text-[11px] text-navy-400 dark:text-white/40 hover:bg-[var(--surface-2)] transition-colors"
            >
              <CreditCard size={12} /> Billing
            </Link>
            <Link
              href="/auth/signout"
              className="flex-1 flex items-center justify-center gap-1 h-8 rounded-lg text-[11px] text-navy-400 dark:text-white/40 hover:bg-[var(--surface-2)] transition-colors"
            >
              <LogOut size={12} /> Sign Out
            </Link>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden lg:flex flex-col h-screen bg-[var(--surface-1)] border-r border-[var(--border-default)] transition-all duration-200 shrink-0",
          collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]",
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden" onClick={onMobileClose} />
          <aside className="fixed inset-y-0 left-0 w-[280px] z-50 flex flex-col bg-[var(--surface-1)] border-r border-[var(--border-default)] lg:hidden shadow-2xl">
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
}
