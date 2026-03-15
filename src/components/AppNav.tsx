"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import AuthButton from "@/components/AuthButton";

const SCROLL_THRESHOLD_PX = 80;

type NavVariant = "landing" | "app";

interface AppNavProps {
  variant?: NavVariant;
  /** Render right-side actions (e.g. copy link, export buttons) */
  actions?: React.ReactNode;
}

const logoBlock = (
  <Link
    href="/"
    className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
  >
    <div className="w-8 h-8 rounded-lg bg-electric-gradient flex items-center justify-center shadow-glow">
      <span className="text-white font-bold text-sm">P</span>
    </div>
    <span className="font-bold text-xl tracking-tight text-navy">PitchIQ</span>
  </Link>
);

export default function AppNav({ variant = "app", actions }: AppNavProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  useEffect(() => {
    if (!isMenuOpen) return;
    const onEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", onEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onEscape);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen, closeMenu]);

  useEffect(() => {
    if (variant !== "landing") return;
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [variant]);

  const isLanding = variant === "landing";

  const navBorder = isLanding
    ? scrolled
      ? "border-b border-gray-200/80 shadow-sm"
      : "border-b border-white/10"
    : "border-b border-white/10";

  // App variant: just show logo + optional actions
  if (!isLanding) {
    return (
      <nav
        className={`fixed top-0 w-full z-50 glass ${navBorder}`}
        aria-label="Main navigation"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {logoBlock}
          <div className="flex items-center gap-2 sm:gap-3">
            {actions}
            <AuthButton />
          </div>
        </div>
      </nav>
    );
  }

  // Landing variant: full nav with links + mobile menu
  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 glass transition-shadow transition-colors duration-200 ${navBorder}`}
        aria-label="Main navigation"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {logoBlock}

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            <a
              href="#features"
              aria-label="Jump to Features section"
              className="min-h-[44px] min-w-[44px] inline-flex items-center px-3 text-sm text-gray-500 hover:text-navy transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              Features
            </a>
            <a
              href="#pricing"
              aria-label="Jump to Pricing section"
              className="min-h-[44px] min-w-[44px] inline-flex items-center px-3 text-sm text-gray-500 hover:text-navy transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              Pricing
            </a>
            <Link
              href="/ideas"
              aria-current={pathname === "/ideas" ? "page" : undefined}
              className="min-h-[44px] inline-flex items-center px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              Get Ideas
            </Link>
            <AuthButton />
            <Link
              href="/create"
              aria-current={pathname === "/create" ? "page" : undefined}
              className="min-h-[44px] inline-flex items-center px-6 py-2.5 rounded-lg bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-light hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              Create Deck
            </Link>
          </div>

          {/* Mobile: hamburger + CTA */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/ideas"
              aria-current={pathname === "/ideas" ? "page" : undefined}
              className="min-h-[44px] inline-flex items-center px-3 py-2.5 rounded-lg text-navy text-sm font-medium hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              Ideas
            </Link>
            <Link
              href="/create"
              aria-current={pathname === "/create" ? "page" : undefined}
              className="min-h-[44px] inline-flex items-center px-4 py-2.5 rounded-lg bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-light hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              Create Deck
            </Link>
            <button
              type="button"
              onClick={() => setIsMenuOpen((o) => !o)}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-navy hover:bg-gray-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="nav-menu"
            >
              {isMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu panel */}
      <div
        id="nav-menu"
        aria-label="Navigation menu"
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-200 ${
          isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      >
        <button
          type="button"
          onClick={closeMenu}
          className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
          aria-label="Close menu"
        />
        <div
          className={`absolute top-16 left-0 right-0 bg-white border-b border-gray-100 shadow-premium-lg rounded-b-2xl px-6 py-4 transition-transform duration-200 ${
            isMenuOpen ? "translate-y-0" : "-translate-y-2"
          }`}
        >
          <div className="flex flex-col gap-1">
            <a
              href="#features"
              onClick={closeMenu}
              aria-label="Jump to Features section"
              className="min-h-[44px] inline-flex items-center px-4 py-3 rounded-xl text-navy font-medium hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={closeMenu}
              aria-label="Jump to Pricing section"
              className="min-h-[44px] inline-flex items-center px-4 py-3 rounded-xl text-navy font-medium hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              Pricing
            </a>
            <Link
              href="/ideas"
              onClick={closeMenu}
              aria-current={pathname === "/ideas" ? "page" : undefined}
              className="min-h-[44px] inline-flex items-center px-4 py-3 rounded-xl text-navy font-medium hover:bg-gray-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              Get Ideas
            </Link>
            <Link
              href="/create"
              onClick={closeMenu}
              aria-current={pathname === "/create" ? "page" : undefined}
              className="min-h-[44px] inline-flex items-center px-4 py-3 rounded-xl bg-electric text-white font-semibold hover:bg-electric-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
            >
              Create Deck
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
