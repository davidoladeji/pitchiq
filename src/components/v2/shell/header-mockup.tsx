"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Bell, Menu, Coins, Settings, CreditCard, LogOut, User } from "lucide-react";
import { Badge } from "@/components/v2/ui/badge";
import { Button } from "@/components/v2/ui/button";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface HeaderProps {
  onMenuClick?: () => void;
  showMenuButton?: boolean;
  userName?: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  href?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function Header({ onMenuClick, showMenuButton, userName }: HeaderProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const user = session?.user as { id?: string; name?: string; email?: string; image?: string; plan?: string } | undefined;

  // ── Real user data (self-fetched) ──
  const [plan, setPlan] = useState<string>("");
  const [credits, setCredits] = useState<number>(0);
  const [userImage, setUserImage] = useState<string>("");

  // ── Notifications ──
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // ── Avatar menu ──
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Fetch user data on mount
  useEffect(() => {
    fetch("/api/v2/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) {
          setPlan(d.user.plan || "starter");
          setCredits(d.user.creditBalance ?? 0);
        }
      })
      .catch(() => {});

    // Set image from session
    if (user?.image) setUserImage(user.image);
  }, [user?.image]);

  // Fetch notifications
  useEffect(() => {
    fetch("/api/notifications?limit=5")
      .then((r) => r.json())
      .then((d) => {
        setNotifications(d.notifications || []);
        setUnreadCount(d.unreadCount || 0);
      })
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
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    }).catch(() => {});
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  const displayName = userName || user?.name || "there";
  const initials = displayName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  const avatarSrc = userImage || user?.image || "";

  return (
    <header className="sticky top-0 z-20 bg-surface-page/95 backdrop-blur-sm border-b border-neutral-200/50 flex items-center justify-between py-5">
      {/* ── Left ── */}
      <div className="flex items-center gap-3">
        {showMenuButton && (
          <div className="lg:hidden">
            <Button variant="ghost" size="icon" onClick={onMenuClick} aria-label="Open menu">
              <Menu size={20} />
            </Button>
          </div>
        )}
        <h1 className="text-xl font-semibold text-neutral-900">
          {greeting}, {displayName}
        </h1>
      </div>

      {/* ── Right ── */}
      <div className="flex items-center gap-3">
        {/* Plan badge */}
        <Badge variant="primary" className="capitalize">{plan || "Starter"}</Badge>

        {/* Credits */}
        <Link
          href="/dashboard/credits"
          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          <Coins size={14} className="text-neutral-400" />
          {credits}
        </Link>

        {/* Notification bell */}
        <div ref={notifRef} className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            onClick={() => setNotifOpen((v) => !v)}
            className="relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </Button>

          {/* Notification dropdown */}
          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
                <span className="text-sm font-semibold text-neutral-900">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell size={20} className="text-neutral-300 mx-auto mb-2" />
                    <p className="text-xs text-neutral-400">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`px-4 py-3 border-b border-neutral-50 last:border-0 hover:bg-neutral-50 transition-colors cursor-pointer ${!n.read ? "bg-primary-50/30" : ""}`}
                      onClick={() => {
                        if (n.href) router.push(n.href);
                        setNotifOpen(false);
                      }}
                    >
                      <p className="text-sm text-neutral-800 line-clamp-2">{n.title || n.body}</p>
                      <p className="text-[10px] text-neutral-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Avatar + menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full overflow-hidden ring-2 ring-transparent hover:ring-primary-200 transition-all"
            aria-label="User menu"
          >
            {avatarSrc ? (
              <img src={avatarSrc} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-primary-100 flex items-center justify-center text-sm font-semibold text-primary-700">
                {initials}
              </div>
            )}
          </button>

          {/* User menu dropdown */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-neutral-200 shadow-lg overflow-hidden z-50">
              {/* User info */}
              <div className="px-4 py-3 border-b border-neutral-100">
                <p className="text-sm font-semibold text-neutral-900 truncate">{displayName}</p>
                <p className="text-xs text-neutral-400 truncate">{user?.email || ""}</p>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <MenuItem icon={User} label="Profile" onClick={() => { setMenuOpen(false); router.push("/settings"); }} />
                <MenuItem icon={Settings} label="Settings" onClick={() => { setMenuOpen(false); router.push("/settings"); }} />
                <MenuItem icon={CreditCard} label="Billing" onClick={() => { setMenuOpen(false); router.push("/billing"); }} />
                <MenuItem icon={Coins} label="Credits" onClick={() => { setMenuOpen(false); router.push("/dashboard/credits"); }} />
              </div>

              <div className="border-t border-neutral-100 py-1">
                <MenuItem
                  icon={LogOut}
                  label="Sign Out"
                  onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                  danger
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* ── Helpers ── */

function MenuItem({ icon: Icon, label, onClick, danger }: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors ${
        danger
          ? "text-red-600 hover:bg-red-50"
          : "text-neutral-700 hover:bg-neutral-50"
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

function timeAgo(dateStr: string): string {
  try {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  } catch {
    return "";
  }
}
