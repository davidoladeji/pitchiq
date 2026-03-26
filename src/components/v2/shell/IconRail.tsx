"use client";

import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  LayoutDashboard, FolderOpen, Plus, Target, Lightbulb,
  Search, Users, Mic, FlaskConical, Building2, Settings,
  Coins,
} from "lucide-react";
import { useDashboardTab, TAB_TO_PATH } from "./DashboardTabContext";

/* ------------------------------------------------------------------ */
/*  Icon Rail — Tesla-style vertical icon navigation                   */
/* ------------------------------------------------------------------ */

interface NavItem {
  icon: React.ElementType;
  label: string;
  href: string;
  badge?: string;
  accent?: boolean;
}

const MAIN_NAV: NavItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FolderOpen, label: "My Decks", href: "/dashboard/decks" },
  { icon: Plus, label: "Create", href: "/create", accent: true },
  { icon: Target, label: "Score", href: "/score" },
  { icon: Lightbulb, label: "Ideas", href: "/ideas" },
];

const FUNDRAISE_NAV: NavItem[] = [
  { icon: Search, label: "Match", href: "/dashboard/investor-match" },
  { icon: Users, label: "CRM", href: "/dashboard/investor-crm" },
  { icon: Mic, label: "Practice", href: "/dashboard/practice" },
  { icon: FlaskConical, label: "A/B Test", href: "/dashboard/ab-tests" },
];

const WORKSPACE_NAV: NavItem[] = [
  { icon: Building2, label: "Team", href: "/workspace" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

/** Reverse-lookup: path → tab key */
const PATH_TO_TAB: Record<string, string> = {};
for (const [tab, path] of Object.entries(TAB_TO_PATH)) {
  PATH_TO_TAB[path] = tab;
}

export function IconRail() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as { image?: string; name?: string } | undefined;

  // Try to use tab context (available when inside dashboard layout)
  let tabCtx: { activeTab: string; setActiveTab: (t: string) => void } | null = null;
  try {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    tabCtx = useDashboardTab();
  } catch {
    // Not inside DashboardTabProvider (e.g., /settings, /billing pages that render their own AppShellV2)
  }

  const isActive = (href: string) => {
    if (tabCtx) {
      const tab = PATH_TO_TAB[href];
      if (tab) return tabCtx.activeTab === tab;
    }
    // Fallback for non-dashboard routes
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const handleNav = (href: string, e: React.MouseEvent) => {
    const tab = PATH_TO_TAB[href];
    if (tab && tabCtx) {
      e.preventDefault();
      tabCtx.setActiveTab(tab);
    }
    // Non-dashboard hrefs: let the <a> / <Link> do its normal thing
  };

  return (
    <nav className="fixed left-0 top-0 bottom-0 z-30 flex flex-col items-center w-[var(--rail-width)] py-4 void-glass void-scrollbar"
      style={{ borderRight: "1px solid var(--void-border)" }}
    >
      {/* Logo */}
      <a
        href="/dashboard"
        onClick={(e) => handleNav("/dashboard", e)}
        className="w-10 h-10 rounded-xl flex items-center justify-center mb-6 glow-electric"
        style={{ background: "var(--neon-electric)" }}
      >
        <span className="text-white font-black text-sm">P</span>
      </a>

      {/* Main nav */}
      <div className="flex-1 flex flex-col items-center gap-1 w-full px-2">
        {MAIN_NAV.map((item) => (
          <RailItem key={item.href} item={item} active={isActive(item.href)} onNav={handleNav} />
        ))}

        {/* Separator */}
        <div className="w-6 h-px bg-white/[0.06] my-2" />

        {FUNDRAISE_NAV.map((item) => (
          <RailItem key={item.href} item={item} active={isActive(item.href)} onNav={handleNav} />
        ))}

        {/* Separator */}
        <div className="w-6 h-px bg-white/[0.06] my-2" />

        {WORKSPACE_NAV.map((item) => (
          <RailItem key={item.href} item={item} active={isActive(item.href)} onNav={handleNav} />
        ))}
      </div>

      {/* Bottom: Credits + Avatar */}
      <div className="flex flex-col items-center gap-2 mt-auto px-2">
        <a
          href="/dashboard/credits"
          onClick={(e) => handleNav("/dashboard/credits", e)}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/[0.06]"
          title="Credits"
        >
          <Coins size={18} className="text-white/40" />
        </a>

        <button
          onClick={() => router.push("/settings")}
          className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-white/20 transition-all"
          title={user?.name || "Profile"}
        >
          {user?.image ? (
            <img src={user.image} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold" style={{ background: "var(--void-surface-active)", color: "var(--void-text-muted)" }}>
              {(user?.name || "U").charAt(0).toUpperCase()}
            </div>
          )}
        </button>
      </div>
    </nav>
  );
}

function RailItem({ item, active, onNav }: { item: NavItem; active: boolean; onNav: (href: string, e: React.MouseEvent) => void }) {
  const Icon = item.icon;
  const isDashboardRoute = item.href.startsWith("/dashboard");

  // Accent items (Create) get a filled neon background — always use Link (non-dashboard)
  if (item.accent) {
    return (
      <Link href={item.href} title={item.label}
        className="relative group w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:scale-105"
        style={{ background: "var(--neon-electric)", boxShadow: "0 0 16px rgba(var(--neon-electric-rgb), 0.3)" }}
      >
        <Icon size={20} className="text-white" />
        <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background: "var(--void-3)", color: "var(--void-text)", border: "1px solid var(--void-border)" }}>
          {item.label}
        </span>
      </Link>
    );
  }

  // Shared inner content
  const cls = `relative group w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
    active ? "bg-white/[0.08]" : "hover:bg-white/[0.04]"
  }`;
  const inner = (
    <>
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-[3px] w-[3px] h-5 rounded-full" style={{ background: "var(--neon-cyan)", boxShadow: "0 0 8px rgba(var(--neon-cyan-rgb), 0.5)" }} />
      )}
      <Icon size={20} className={active ? "text-white" : "text-white/40 group-hover:text-white/70"} style={active ? { filter: "drop-shadow(0 0 4px rgba(var(--neon-cyan-rgb), 0.3))" } : undefined} />
      <span className="absolute left-full ml-3 px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" style={{ background: "var(--void-3)", color: "var(--void-text)", border: "1px solid var(--void-border)" }}>
        {item.label}
      </span>
    </>
  );

  // Dashboard routes: use <a> with tab switching; others: use <Link>
  if (isDashboardRoute) {
    return (
      <a href={item.href} onClick={(e) => onNav(item.href, e)} className={cls} title={item.label}>
        {inner}
      </a>
    );
  }

  return (
    <Link href={item.href} className={cls} title={item.label}>
      {inner}
    </Link>
  );
}
