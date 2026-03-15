"use client";

import { SlideData } from "@/lib/types";
import { getTheme, ThemeDef } from "@/lib/themes";
import { useState, useEffect, useCallback, CSSProperties } from "react";

interface SlideRendererProps {
  slides: SlideData[];
  companyName: string;
  showBranding?: boolean;
  themeId?: string;
}

function themeVars(theme: ThemeDef): CSSProperties {
  return {
    "--t-bg-dark": theme.bgDark,
    "--t-bg-light": theme.bgLight,
    "--t-text": theme.textPrimary,
    "--t-text-secondary": theme.textSecondary,
    "--t-accent": theme.accent,
    "--t-accent-light": theme.accentLight,
    "--t-card-bg": theme.cardBg,
  } as CSSProperties;
}

function TitleSlide({
  slide,
  companyName,
}: {
  slide: SlideData;
  companyName: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full p-8 md:p-10 lg:p-12 relative overflow-hidden"
      style={{ background: "var(--t-bg-dark)", color: "var(--t-text)" }}
    >
      <div className="absolute inset-0 bg-grid-dark opacity-15" aria-hidden="true" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[220px] rounded-full blur-[90px] opacity-20"
        style={{ background: "var(--t-accent)" }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl">
        <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 md:mb-8 shadow-dark-card" aria-hidden="true">
          <span className="text-xl md:text-2xl font-bold" style={{ color: "var(--t-accent-light)" }}>
            {companyName[0]}
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 tracking-tight leading-[1.1]">
          {slide.title}
        </h1>
        {slide.subtitle && (
          <p className="text-base sm:text-lg md:text-xl mb-6 md:mb-8 max-w-2xl leading-relaxed opacity-70" style={{ color: "var(--t-text-secondary)" }}>
            {slide.subtitle}
          </p>
        )}
        <div className="space-y-2 max-w-xl">
          {slide.content.map((item, i) => (
            <p key={i} className="text-sm sm:text-base leading-relaxed opacity-50" style={{ color: "var(--t-text-secondary)" }}>
              {item}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function ContentSlide({
  slide,
  accent,
}: {
  slide: SlideData;
  accent?: boolean;
}) {
  return (
    <div
      className="flex flex-col h-full p-8 md:p-10 lg:p-12 relative"
      style={{
        background: accent ? "var(--t-bg-dark)" : "var(--t-bg-light)",
        color: accent ? "var(--t-text)" : "var(--t-bg-dark)",
      }}
    >
      {accent && (
        <div className="absolute inset-0 bg-grid-dark opacity-10 pointer-events-none" aria-hidden="true" />
      )}
      <div className="mb-6 md:mb-8 relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 text-balance">
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="text-sm sm:text-base md:text-lg leading-relaxed opacity-60" style={{ color: accent ? "var(--t-text-secondary)" : undefined }}>
            {slide.subtitle}
          </p>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-center space-y-3 md:space-y-4 relative z-10 max-w-3xl">
        {slide.content.map((item, i) => (
          <div key={i} className="flex items-start gap-3 md:gap-4">
            <span
              className="w-1 rounded-full mt-2 shrink-0 min-h-[1rem]"
              style={{ background: accent ? "var(--t-accent-light)" : "var(--t-accent)" }}
              aria-hidden="true"
            />
            <p className="text-sm sm:text-base md:text-lg leading-relaxed opacity-90">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsSlide({
  slide,
  accent,
}: {
  slide: SlideData;
  accent?: boolean;
}) {
  return (
    <div
      className="flex flex-col h-full p-8 md:p-10 lg:p-12 relative"
      style={{
        background: accent ? "var(--t-bg-dark)" : "var(--t-bg-light)",
        color: accent ? "var(--t-text)" : "var(--t-bg-dark)",
      }}
    >
      {accent && (
        <div className="absolute inset-0 bg-grid-dark opacity-10 pointer-events-none" aria-hidden="true" />
      )}
      <div className="mb-6 md:mb-8 relative z-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 text-balance">
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="text-sm sm:text-base md:text-lg leading-relaxed opacity-60" style={{ color: accent ? "var(--t-text-secondary)" : undefined }}>
            {slide.subtitle}
          </p>
        )}
      </div>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 items-stretch relative z-10">
        {slide.content.map((item, i) => (
          <div
            key={i}
            className="p-4 md:p-6 rounded-xl flex items-center"
            style={{
              background: accent ? "var(--t-card-bg)" : "var(--t-bg-light)",
              border: accent ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <p className="text-sm sm:text-base md:text-lg font-medium leading-relaxed opacity-90">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComparisonSlide({ slide }: { slide: SlideData }) {
  return (
    <div
      className="flex flex-col h-full p-8 md:p-10 lg:p-12"
      style={{ background: "var(--t-bg-light)", color: "var(--t-bg-dark)" }}
    >
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2 text-balance">
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="text-sm sm:text-base md:text-lg opacity-60 leading-relaxed">
            {slide.subtitle}
          </p>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-center space-y-3 md:space-y-4 max-w-3xl">
        {slide.content.map((item, i) => (
          <div
            key={i}
            className="flex items-start gap-3 md:gap-4 p-4 md:p-5 rounded-xl border transition-colors"
            style={{ borderColor: "rgba(0,0,0,0.06)", background: "rgba(0,0,0,0.02)" }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: "color-mix(in srgb, var(--t-accent) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--t-accent) 20%, transparent)" }}
              aria-hidden="true"
            >
              <span className="font-bold text-sm" style={{ color: "var(--t-accent)" }}>
                {i + 1}
              </span>
            </div>
            <p className="text-sm sm:text-base md:text-lg leading-relaxed opacity-70 pt-0.5">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CtaSlide({
  slide,
  companyName,
}: {
  slide: SlideData;
  companyName: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full p-8 md:p-10 lg:p-12 relative overflow-hidden"
      style={{ background: "var(--t-bg-dark)", color: "var(--t-text)" }}
    >
      <div className="absolute inset-0 bg-grid-dark opacity-15" aria-hidden="true" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[220px] rounded-full blur-[90px] opacity-15"
        style={{ background: "var(--t-accent)" }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight leading-tight text-balance">
          {slide.title}
        </h2>
        {slide.subtitle && (
          <p className="text-lg md:text-xl mb-6 md:mb-8 leading-relaxed opacity-60" style={{ color: "var(--t-text-secondary)" }}>
            {slide.subtitle}
          </p>
        )}
        <div className="space-y-2 md:space-y-3 mb-8 max-w-xl">
          {slide.content.map((item, i) => (
            <p key={i} className="text-sm sm:text-base md:text-lg leading-relaxed opacity-50" style={{ color: "var(--t-text-secondary)" }}>
              {item}
            </p>
          ))}
        </div>
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shadow-dark-card" aria-hidden="true">
          <span className="text-base md:text-xl font-bold" style={{ color: "var(--t-accent-light)" }}>
            {companyName[0]}
          </span>
        </div>
      </div>
    </div>
  );
}

function renderSlide(slide: SlideData, companyName: string) {
  switch (slide.type) {
    case "title":
      return <TitleSlide slide={slide} companyName={companyName} />;
    case "stats":
      return <StatsSlide slide={slide} accent={slide.accent} />;
    case "comparison":
      return <ComparisonSlide slide={slide} />;
    case "cta":
      return <CtaSlide slide={slide} companyName={companyName} />;
    default:
      return <ContentSlide slide={slide} accent={slide.accent} />;
  }
}

export default function SlideRenderer({
  slides,
  companyName,
  showBranding = true,
  themeId,
}: SlideRendererProps) {
  const theme = getTheme(themeId || "midnight");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      if (
        index >= 0 &&
        index < slides.length &&
        index !== currentSlide &&
        !isTransitioning
      ) {
        setIsTransitioning(true);
        setCurrentSlide(index);
        setTimeout(() => setIsTransitioning(false), 300);
      }
    },
    [slides.length, currentSlide, isTransitioning]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goTo(currentSlide - 1);
      } else if (
        e.key === "ArrowRight" ||
        e.key === "ArrowDown" ||
        e.key === " "
      ) {
        e.preventDefault();
        goTo(currentSlide + 1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSlide, goTo]);

  return (
    <div className="relative" style={themeVars(theme)}>
      {/* Slide display */}
      <div
        id="slide-container"
        className="relative aspect-[16/9] w-full max-w-5xl mx-auto rounded-2xl overflow-hidden shadow-premium-lg border border-gray-200/50"
      >
        <div
          className={`absolute inset-0 transition-opacity duration-300 ease-out ${
            isTransitioning ? "opacity-90" : "opacity-100"
          }`}
        >
          {renderSlide(slides[currentSlide], companyName)}
        </div>

        {/* Slide number */}
        <div className="absolute bottom-3 md:bottom-4 right-3 md:right-4 text-xs md:text-sm opacity-30 font-medium font-mono tracking-wider">
          {String(currentSlide + 1).padStart(2, "0")} /{" "}
          {String(slides.length).padStart(2, "0")}
        </div>

        {/* Branding */}
        {showBranding && (
          <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 text-[10px] md:text-xs opacity-25 font-medium tracking-wide">
            Made with PitchIQ
          </div>
        )}

        {/* Click zones for navigation */}
        <button
          onClick={() => goTo(currentSlide - 1)}
          className="absolute left-0 top-0 w-1/4 h-full cursor-w-resize opacity-0 hover:opacity-100 transition-opacity"
          aria-label="Previous slide"
        >
          <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-sm">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </div>
        </button>
        <button
          onClick={() => goTo(currentSlide + 1)}
          className="absolute right-0 top-0 w-1/4 h-full cursor-e-resize opacity-0 hover:opacity-100 transition-opacity"
          aria-label="Next slide"
        >
          <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/20 flex items-center justify-center backdrop-blur-sm">
            <svg
              className="w-4 h-4 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </button>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4 mt-6" role="group" aria-label="Slide navigation">
        <button
          onClick={() => goTo(currentSlide - 1)}
          disabled={currentSlide === 0}
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-white border border-gray-200 text-navy disabled:opacity-25 hover:border-gray-300 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          aria-label="Previous slide"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        {/* Slide indicators */}
        <div className="flex gap-1.5 items-center">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 ${
                i === currentSlide
                  ? "bg-navy w-6 h-2.5"
                  : "bg-gray-200 hover:bg-gray-300 w-2.5 h-2.5"
              }`}
              aria-label={`Go to slide ${i + 1}`}
              aria-current={i === currentSlide ? "true" : undefined}
            />
          ))}
        </div>

        <button
          onClick={() => goTo(currentSlide + 1)}
          disabled={currentSlide === slides.length - 1}
          className="min-h-[44px] min-w-[44px] p-2.5 rounded-xl bg-white border border-gray-200 text-navy disabled:opacity-25 hover:border-gray-300 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2"
          aria-label="Next slide"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      {/* Keyboard nav hint */}
      <p className="text-center text-xs text-gray-500 mt-3 hidden md:block">
        Use{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-500 text-[11px] font-mono">
          &larr;
        </kbd>{" "}
        <kbd className="px-1.5 py-0.5 rounded bg-gray-100 border border-gray-200 text-gray-500 text-[11px] font-mono">
          &rarr;
        </kbd>{" "}
        to navigate
      </p>
    </div>
  );
}
