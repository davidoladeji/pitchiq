"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function AuthButton() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-navy-200 animate-pulse" aria-hidden="true" />;
  }

  if (!session) {
    return (
      <button
        type="button"
        onClick={() => signIn()}
        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-current opacity-70 hover:opacity-100 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
        aria-label="Sign in to PitchIQ"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
        aria-label="User menu"
        aria-expanded={menuOpen}
      >
        {session.user.image ? (
          <Image
            src={session.user.image}
            alt=""
            width={32}
            height={32}
            className="w-8 h-8 rounded-full border border-navy-200"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-electric/10 border border-electric/20 flex items-center justify-center text-electric text-sm font-bold">
            {(session.user.name?.[0] || session.user.email?.[0] || "U").toUpperCase()}
          </div>
        )}
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-navy-100 shadow-premium-lg py-2 z-50">
          <div className="px-4 py-2 border-b border-navy-100">
            <p className="text-sm font-semibold text-navy truncate">
              {session.user.name || "User"}
            </p>
            <p className="text-xs text-navy-500 truncate">
              {session.user.email}
            </p>
          </div>
          <Link
            href="/dashboard"
            onClick={() => setMenuOpen(false)}
            className="min-h-[44px] flex items-center px-4 py-2.5 text-sm text-navy hover:bg-navy-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-inset"
            aria-label="Go to dashboard"
          >
            Dashboard
          </Link>
          <button
            type="button"
            onClick={() => signOut()}
            className="min-h-[44px] w-full text-left px-4 py-2.5 text-sm text-navy-500 hover:bg-navy-50 hover:text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-inset"
            aria-label="Sign out of PitchIQ"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
