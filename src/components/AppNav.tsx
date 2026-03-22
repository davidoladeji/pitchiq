"use client";

import Link from "next/link";
import { useState, useCallback, useEffect } from "react";
import AuthButton from "@/components/AuthButton";
import NotificationBell from "@/components/dashboard/NotificationBell";

const SCROLL_THRESHOLD_PX = 20;

type NavVariant = "landing" | "app";

interface AppNavProps {
  variant?: NavVariant;
}

export default function AppNav({ variant = "app" }: AppNavProps) {
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
      ? "bg-navy/95 border-white/10 shadow-xl shadow-black/30 backdrop-blur-xl"
      : "bg-navy/80 border-white/[0.08] backdrop-blur-xl"
    : scrolled
      ? "glass border-navy-200/60 shadow-lg shadow-black/5"
      : "bg-white/60 border-navy-200/40 backdrop-blur-xl";

  const textColor = isLanding
    ? "text-white/70 hover:text-white"
    : "text-navy-500 hover:text-navy";

  const logoText = isLanding ? "text-white" : "text-navy";

  /* --- Logo --- */
  const logo = (
    <Link
      href="/"
      className="flex items-center gap-2 shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      aria-label="PitchIQ home"
    >
      <span className={`font-display font-bold text-lg tracking-tight ${logoText}`}>
        PitchIQ
      </span>
    </Link>
  );

  /* --- Desktop link helper --- */
  const navLink = (
    href: string,
    label: string,
    opts?: { anchor?: boolean; current?: boolean; badge?: string; ariaLabel?: string }
  ) => {
    const Tag = opts?.anchor ? "a" : Link;
    return (
      <Tag
        href={href}
        aria-label={opts?.ariaLabel}
        {...(opts?.current !== undefined
          ? { "aria-current": opts.current ? ("page" as const) : undefined }
          : {})}
        className={`text-[13px] font-medium px-3.5 py-1.5 rounded-full transition-colors duration-200 min-h-[44px] inline-flex items-center ${textColor} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white ${opts?.badge ? "gap-1" : ""}`}
      >
        {label}
        {opts?.badge && (
          <sup className="text-[8px] font-bold tracking-wider text-electric leading-none -top-0.5 relative">
            {opts.badge}
          </sup>
        )}
      </Tag>
    );
  };

  /* --- CTA button — 44px touch target (WCAG 2.1 AA); translate-only feedback; focus ring visible on dark bar --- */
  const ctaButton = (
    <Link
      href="/create"
      aria-label="Get started — create your pitch deck"
      className={`min-h-[44px] inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[13px] font-semibold shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
        isLanding
          ? "bg-white text-navy hover:bg-navy-100 hover:shadow-md"
          : "bg-navy text-white hover:bg-navy/80 hover:shadow-md"
      }`}
    >
      Get Started
    </Link>
  );

  /* --- Hamburger: min 44×44px touch target (WCAG 2.1); focus ring visible on dark bar --- */
  const hamburger = (
    <button
      type="button"
      onClick={() => setIsMenuOpen((o) => !o)}
      className={`min-w-[44px] min-h-[44px] w-11 h-11 inline-flex items-center justify-center rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white ${
        isLanding
          ? "text-white/80 hover:text-white hover:bg-white/10"
          : "text-navy hover:bg-navy-100"
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
    opts?: { anchor?: boolean; current?: boolean; badge?: string; ariaLabel?: string }
  ) => {
    const Tag = opts?.anchor ? "a" : Link;
    return (
      <Tag
        href={href}
        onClick={closeMenu}
        aria-label={opts?.ariaLabel}
        {...(opts?.current !== undefined
          ? { "aria-current": opts.current ? ("page" as const) : undefined }
          : {})}
        className="min-h-[44px] flex items-center px-2 py-4 text-2xl font-display font-semibold text-white/90 hover:text-white transition-colors border-b border-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
      >
        {label}
        {opts?.badge && (
          <sup className="text-[10px] font-bold tracking-wider text-electric ml-1 -top-2 relative">
            {opts.badge}
          </sup>
        )}
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
            <NotificationBell />
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
            {navLink("#about", "About", { anchor: true, badge: "PIQ", ariaLabel: "Go to About PitchIQ" })}
            {navLink("#how-it-works", "How", { anchor: true, ariaLabel: "Go to How it works" })}
            {navLink("#features", "Features", { anchor: true, ariaLabel: "Go to Features" })}
            {navLink("#pricing", "Pricing", { anchor: true, ariaLabel: "Go to Pricing" })}
          </div>

          {/* Right: CTA + auth + mobile hamburger */}
          <div className="flex items-center gap-2">
            <div className={`hidden md:flex items-center gap-2 ${isLanding ? "text-white" : "text-navy"}`}>
              <AuthButton />
              {ctaButton}
            </div>
            <div className="md:hidden flex items-center">
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
          className="absolute inset-0 bg-navy/90 backdrop-blur-2xl"
          aria-label="Close menu"
        />

        {/* Menu content */}
        <div
          className={`relative z-10 flex flex-col justify-between h-full pt-24 pb-10 px-6 sm:px-8 transition-transform duration-300 motion-reduce:transition-none ${
            isMenuOpen ? "translate-y-0" : "-translate-y-4"
          }`}
        >
          <div className="flex flex-col">
            {mobileLink("#about", "About", { anchor: true, badge: "PIQ", ariaLabel: "Go to About PitchIQ" })}
            {mobileLink("#how-it-works", "How", { anchor: true, ariaLabel: "Go to How it works" })}
            {mobileLink("#features", "Features", { anchor: true, ariaLabel: "Go to Features" })}
            {mobileLink("#pricing", "Pricing", { anchor: true, ariaLabel: "Go to Pricing" })}
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
              className="min-h-[44px] w-full inline-flex items-center justify-center py-3.5 rounded-full bg-electric hover:bg-electric-600 text-white font-semibold text-base shadow-lg shadow-electric/25 hover:shadow-glow transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 motion-reduce:transition-none motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
