"use client";

import Link from "next/link";
import { useState, useCallback, useEffect } from "react";

const SCROLL_THRESHOLD_PX = 80;

export default function LandingNav() {
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
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <nav
        className={`fixed top-0 w-full z-50 glass transition-shadow transition-colors duration-200 ${
          scrolled ? "border-b border-navy-200/80 shadow-sm" : "border-b border-white/10"
        }`}
        aria-label="Main navigation"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
          >
            <div className="w-8 h-8 rounded-lg bg-electric-gradient flex items-center justify-center shadow-glow">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-xl tracking-tight text-navy">
              PitchIQ
            </span>
          </Link>

          {/* Desktop: same as before */}
          <div className="hidden md:flex items-center gap-1">
            <a
              href="#features"
              className="min-h-[44px] min-w-[44px] inline-flex items-center px-3 text-sm text-navy-500 hover:text-navy transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Features
            </a>
            <a
              href="#pricing"
              className="min-h-[44px] min-w-[44px] inline-flex items-center px-3 text-sm text-navy-500 hover:text-navy transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Pricing
            </a>
            <a
              href="https://github.com/davidoladeji/pitchiq"
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center gap-1.5 px-3 text-sm text-navy-500 hover:text-navy transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <span>GitHub</span>
            </a>
            <Link
              href="/ideas"
              className="min-h-[44px] inline-flex items-center px-3 py-2.5 rounded-lg text-sm text-navy-500 hover:text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Get Ideas
            </Link>
            <Link
              href="/create"
              className="min-h-[44px] inline-flex items-center px-6 py-2.5 rounded-lg bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-light hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Create Deck
            </Link>
          </div>

          {/* Mobile: hamburger + CTA */}
          <div className="flex md:hidden items-center gap-2">
            <Link
              href="/ideas"
              className="min-h-[44px] inline-flex items-center px-3 py-2.5 rounded-lg text-navy text-sm font-medium hover:bg-navy-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Ideas
            </Link>
            <Link
              href="/create"
              className="min-h-[44px] inline-flex items-center px-4 py-2.5 rounded-lg bg-electric text-white text-sm font-semibold shadow-sm hover:bg-electric-light hover:shadow-glow hover:shadow-electric/20 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Create Deck
            </Link>
            <button
              type="button"
              onClick={() => setIsMenuOpen((o) => !o)}
              className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center rounded-lg text-navy hover:bg-navy-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMenuOpen}
              aria-controls="nav-menu"
            >
              {isMenuOpen ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
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
        {/* Backdrop */}
        <button
          type="button"
          onClick={closeMenu}
          className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
          aria-label="Close menu"
        />
        {/* Panel */}
        <div
          className={`absolute top-16 left-0 right-0 bg-white border-b border-navy-100 shadow-premium-lg rounded-b-2xl px-6 py-4 transition-transform duration-200 ${
            isMenuOpen ? "translate-y-0" : "-translate-y-2"
          }`}
        >
          <div className="flex flex-col gap-1">
            <a
              href="#features"
              onClick={closeMenu}
              className="min-h-[44px] inline-flex items-center px-4 py-3 rounded-xl text-navy font-medium hover:bg-navy-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Features
            </a>
            <a
              href="#pricing"
              onClick={closeMenu}
              className="min-h-[44px] inline-flex items-center px-4 py-3 rounded-xl text-navy font-medium hover:bg-navy-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              Pricing
            </a>
            <a
              href="https://github.com/davidoladeji/pitchiq"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
              className="min-h-[44px] inline-flex items-center gap-2 px-4 py-3 rounded-xl text-navy font-medium hover:bg-navy-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <svg
                className="w-4 h-4"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
