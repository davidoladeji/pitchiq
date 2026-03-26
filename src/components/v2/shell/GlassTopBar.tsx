"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Search, Bell, Sparkles, Settings, CreditCard, LogOut, Coins, Menu } from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Glass Top Bar — ultra-minimal mission control header               */
/* ------------------------------------------------------------------ */

interface Notification {
  id: string; title: string; body: string; read: boolean; createdAt: string; href?: string;
}

export function GlassTopBar({ onCommandPalette, onMobileMenu }: { onCommandPalette?: () => void; onMobileMenu?: () => void }) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as { name?: string; email?: string; image?: string } | undefined;

  const [plan, setPlan] = useState("");
  const [credits, setCredits] = useState(0);
  const [insight, setInsight] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch dashboard data for plan, credits, insight
  useEffect(() => {
    fetch("/api/v2/dashboard")
      .then((r) => r.json())
      .then((d) => {
        setPlan(d.user?.plan || "starter");
        setCredits(d.user?.creditBalance ?? 0);
        // Build dynamic insight
        const views = d.stats?.totalViews || 0;
        const avg = d.stats?.avgScore || 0;
        const best = d.stats?.bestDeckTitle || "";
        if (views > 0 && best) setInsight(`${views} total views — strongest deck: ${best}`);
        else if (avg > 0) setInsight(`Average PIQ: ${avg}/100`);
        else setInsight("Create your first deck to begin");
      })
      .catch(() => {});

    fetch("/api/notifications?limit=5")
      .then((r) => r.json())
      .then((d) => { setNotifications(d.notifications || []); setUnreadCount(d.unreadCount || 0); })
      .catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const markAllRead = useCallback(async () => {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ all: true }) }).catch(() => {});
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
  })();

  const displayName = user?.name?.split(" ")[0] || "there";

  return (
    <header className="sticky top-0 z-20 void-glass px-6 py-3 flex items-center gap-4" style={{ borderBottom: "1px solid var(--void-border)" }}>
      {/* Mobile menu button */}
      <button onClick={onMobileMenu} className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors">
        <Menu size={18} style={{ color: "var(--void-text-muted)" }} />
      </button>

      {/* Left: Greeting + insight */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: "var(--void-text)" }}>
          {greeting}, {displayName}
        </p>
        {insight && (
          <p className="text-xs truncate mt-0.5" style={{ color: "var(--void-text-dim)" }}>
            <Sparkles size={10} className="inline mr-1" style={{ color: "var(--neon-cyan)" }} />
            {insight}
          </p>
        )}
      </div>

      {/* Center: Command bar trigger */}
      <button
        onClick={onCommandPalette}
        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl transition-all hover:bg-white/[0.06]"
        style={{ border: "1px solid var(--void-border)" }}
      >
        <Search size={14} style={{ color: "var(--void-text-dim)" }} />
        <span className="text-xs" style={{ color: "var(--void-text-dim)" }}>Search or ask Oracle...</span>
        <kbd className="ml-4 text-[10px] px-1.5 py-0.5 rounded" style={{ background: "var(--void-surface)", color: "var(--void-text-dim)", border: "1px solid var(--void-border)" }}>⌘K</kbd>
      </button>

      {/* Right: Plan + Credits + Bell + Avatar */}
      <div className="flex items-center gap-2">
        {/* Plan badge */}
        <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: "rgba(var(--neon-electric-rgb), 0.15)", color: "var(--neon-cyan)", border: "1px solid rgba(var(--neon-cyan-rgb), 0.2)" }}>
          {plan || "Starter"}
        </span>

        {/* Credits */}
        <Link href="/dashboard/credits" className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition-colors hover:bg-white/[0.06]" style={{ color: "var(--void-text-muted)" }}>
          <Coins size={12} />
          <span>{credits}</span>
        </Link>

        {/* Notifications */}
        <div ref={notifRef} className="relative">
          <button onClick={() => setNotifOpen((v) => !v)} className="relative w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/[0.06] transition-colors">
            <Bell size={16} style={{ color: "var(--void-text-muted)" }} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full ambient-pulse" style={{ background: "var(--neon-cyan)" }} />
            )}
          </button>
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-xl overflow-hidden void-glass z-50" style={{ border: "1px solid var(--void-border)" }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid var(--void-border)" }}>
                <span className="text-xs font-semibold" style={{ color: "var(--void-text)" }}>Notifications</span>
                {unreadCount > 0 && <button onClick={markAllRead} className="text-[10px] font-medium" style={{ color: "var(--neon-cyan)" }}>Mark all read</button>}
              </div>
              <div className="max-h-48 overflow-y-auto void-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center"><p className="text-xs" style={{ color: "var(--void-text-dim)" }}>No notifications</p></div>
                ) : notifications.map((n) => (
                  <div key={n.id} className="px-4 py-2.5 hover:bg-white/[0.03] cursor-pointer transition-colors" style={{ borderBottom: "1px solid var(--void-border)" }} onClick={() => { if (n.href) router.push(n.href); setNotifOpen(false); }}>
                    <p className="text-xs line-clamp-1" style={{ color: n.read ? "var(--void-text-muted)" : "var(--void-text)" }}>{n.title || n.body}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--void-text-dim)" }}>{timeAgo(n.createdAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Avatar */}
        <div ref={menuRef} className="relative">
          <button onClick={() => setMenuOpen((v) => !v)} className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-white/[0.08] hover:ring-white/20 transition-all">
            {user?.image ? (
              <img src={user.image} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[10px] font-bold" style={{ background: "var(--void-surface-active)", color: "var(--void-text-muted)" }}>
                {(user?.name || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-xl overflow-hidden void-glass z-50" style={{ border: "1px solid var(--void-border)" }}>
              <div className="px-3 py-2.5" style={{ borderBottom: "1px solid var(--void-border)" }}>
                <p className="text-xs font-medium truncate" style={{ color: "var(--void-text)" }}>{user?.name || "User"}</p>
                <p className="text-[10px] truncate" style={{ color: "var(--void-text-dim)" }}>{user?.email}</p>
              </div>
              <div className="py-1">
                {[
                  { icon: Settings, label: "Settings", href: "/settings" },
                  { icon: CreditCard, label: "Billing", href: "/billing" },
                  { icon: Coins, label: "Credits", href: "/dashboard/credits" },
                ].map((item) => (
                  <button key={item.href} onClick={() => { setMenuOpen(false); router.push(item.href); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-white/[0.04]" style={{ color: "var(--void-text-muted)" }}>
                    <item.icon size={14} /> {item.label}
                  </button>
                ))}
              </div>
              <div style={{ borderTop: "1px solid var(--void-border)" }} className="py-1">
                <button onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }} className="w-full flex items-center gap-2 px-3 py-2 text-xs transition-colors hover:bg-red-500/10 text-red-400">
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function timeAgo(d: string): string {
  try {
    const diff = Date.now() - new Date(d).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return "now";
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h`;
    return `${Math.floor(h / 24)}d`;
  } catch { return ""; }
}
