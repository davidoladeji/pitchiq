"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import AuthButton from "@/components/AuthButton";

const SCROLL_THRESHOLD_PX = 20;

type NavVariant = "landing" | "app";

interface AppNavProps {
  variant?: NavVariant;
  /** Render right-side actions (e.g. copy link, export buttons) */
  actions?: React.ReactNode;
}

export default function AppNav({ variant = "app", actions }: AppNavProps) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  /* Lock body scroll when mobile menu is open */
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

  /* Track scroll for glass transition */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isLanding = variant === "landing";

  /* --- Pill bar style --- */
  const pillBase =
    "rounded-full transition-all duration-300 ease-out border";

  const pillStyle = isLanding
    ? scrolled
      ? "bg-[#18181B]/95 border-white/[0.1] shadow-xl shadow-black/30 backdrop-blur-xl"
      : "bg-[#18181B]/80 border-white/[0.08] backdrop-blur-xl"
    : scrolled
      ? "glass border-gray-200/60 shadow-lg shadow-black/5"
      : "bg-white/60 border-gray-200/40 backdrop-blur-xl";

  const textColor = isLanding
    ? "text-zinc-400 hover:text-white"
    : "text-gray-500 hover:text-navy";

  const logoText = isLanding ? "text-white" : "text-navy";

  /* --- Logo --- */
  const logo = (
    <Link
      href="/"
      className="flex items-center gap-2 shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
      aria-label="PitchIQ home"
    >
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4361ee] to-[#8B5CF6] flex items-center justify-center shadow-md shadow-electric/25">
        <span className="text-white font-bold text-xs leading-none">P</span>
      </div>
      <span className={`font-display font-bold text-lg tracking-tight ${logoText}`}>
        PitchIQ
      </span>
    </Link>
  );

  /* --- Desktop link helper --- */
  const navLink = (
    href: string,
    label: string,
    opts?: { anchor?: boolean; current?: boolean }
  ) => {
    const Tag = opts?.anchor ? "a" : Link;
    return (
      <Tag
        href={href}
        {...(opts?.current !== undefined
          ? { "aria-current": opts.current ? ("page" as const) : undefined }
          : {})}
        className={`text-[13px] font-medium px-3.5 py-1.5 rounded-full transition-colors duration-200 ${textColor} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric`}
      >
        {label}
      </Tag>
    );
  };

  /* --- CTA button --- */
  const ctaButton = (
    <Link
      href="/create"
      aria-label="Get started — create your pitch deck"
      className={`inline-flex items-center px-4 py-1.5 rounded-full text-[13px] font-semibold shadow-sm active:scale-[0.99] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 ${
        isLanding
          ? "bg-white text-[#09090B] hover:bg-zinc-100 hover:shadow-md"
          : "bg-[#09090B] text-white hover:bg-[#09090B]/80 hover:shadow-md"
      }`}
    >
      Get Started
    </Link>
  );

  /* --- Hamburger icon --- */
  const hamburger = (
    <button
      type="button"
      onClick={() => setIsMenuOpen((o) => !o)}
      className={`w-9 h-9 inline-flex items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric ${
        isLanding
          ? "text-white/80 hover:text-white hover:bg-white/10"
          : "text-navy hover:bg-gray-100"
      }`}
      aria-label={isMenuOpen ? "Close menu" : "Open menu"}
      aria-expanded={isMenuOpen}
      aria-controls="nav-menu"
    >
      {isMenuOpen ? (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      )}
    </button>
  );

  /* --- Mobile overlay link helper --- */
  const mobileLink = (
    href: string,
    label: string,
    opts?: { anchor?: boolean; current?: boolean }
  ) => {
    const Tag = opts?.anchor ? "a" : Link;
    return (
      <Tag
        href={href}
        onClick={closeMenu}
        {...(opts?.current !== undefined
          ? { "aria-current": opts.current ? ("page" as const) : undefined }
          : {})}
        className="block px-2 py-4 text-2xl font-display font-semibold text-white/90 hover:text-white transition-colors border-b border-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
      >
        {label}
      </Tag>
    );
  };

  /* =======================
     APP VARIANT
     ======================= */
  if (!isLanding) {
    return (
      <nav className="fixed top-0 left-0 right-0 z-50 py-3 px-4" aria-label="Main navigation">
        <div
          className={`max-w-3xl mx-auto px-5 h-12 flex items-center justify-between ${pillBase} ${pillStyle}`}
        >
          {logo}
          <div className="flex items-center gap-2">
            {actions}
            <AuthButton />
          </div>
        </div>
      </nav>
    );
  }

  /* =======================
     LANDING VARIANT
     ======================= */
  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 py-4 px-4" aria-label="Main navigation">
        <div
          className={`max-w-3xl mx-auto px-5 h-12 flex items-center justify-between ${pillBase} ${pillStyle}`}
        >
          {/* Left: logo */}
          {logo}

          {/* Center: desktop links */}
          <div className="hidden md:flex items-center gap-0.5">
            {navLink("#features", "Features", { anchor: true })}
            {navLink("#pricing", "Pricing", { anchor: true })}
          </div>

          {/* Right: CTA + auth + mobile hamburger */}
          <div className="flex items-center gap-2">
            <div className={`hidden md:flex items-center gap-2 ${isLanding ? "text-white" : "text-navy"}`}>
              <AuthButton />
              {ctaButton}
            </div>
            <div className="md:hidden flex items-center gap-1.5">
              {ctaButton}
              {hamburger}
            </div>
          </div>
        </div>
      </nav>

      {/* ---- Full-screen mobile overlay ---- */}
      <div
        id="nav-menu"
        aria-label="Navigation menu"
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          isMenuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <button
          type="button"
          onClick={closeMenu}
          className="absolute inset-0 bg-[#1a1a2e]/90 backdrop-blur-2xl"
          aria-label="Close menu"
        />

        {/* Menu content */}
        <div
          className={`relative z-10 flex flex-col justify-between h-full pt-24 pb-10 px-8 transition-transform duration-300 ${
            isMenuOpen ? "translate-y-0" : "-translate-y-4"
          }`}
        >
          <div className="flex flex-col">
            {mobileLink("#features", "Features", { anchor: true })}
            {mobileLink("#pricing", "Pricing", { anchor: true })}
            {mobileLink("/ideas", "Get Ideas", {
              current: pathname === "/ideas",
            })}
            {mobileLink("/score", "Score Deck", {
              current: pathname === "/score",
            })}
            {mobileLink("/create", "Create Deck", {
              current: pathname === "/create",
            })}
          </div>

          {/* Bottom section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <AuthButton />
            </div>
            <Link
              href="/create"
              onClick={closeMenu}
              aria-label="Get started — create your pitch deck"
              className="w-full text-center py-3.5 rounded-full bg-gradient-to-r from-[#4361ee] to-[#8B5CF6] text-white font-semibold text-base shadow-lg shadow-electric/25 hover:shadow-xl hover:shadow-electric/30 active:scale-[0.99] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
