"use client";

import type { CSSProperties } from "react";
import type { SlideData } from "@/lib/types";
import { getTheme, type ThemeDef } from "@/lib/themes";

function themeVars(theme: ThemeDef): CSSProperties {
  return {
    "--t-bg-dark": theme.bgDark,
    "--t-bg-light": theme.bgLight,
    "--t-text": theme.textPrimary,
    "--t-text-secondary": theme.textSecondary,
    "--t-accent": theme.accent,
    "--t-accent-light": theme.accentLight,
    "--t-card-bg": theme.cardBg,
    "--t-heading-font": theme.headingFont,
    "--t-heading-weight": String(theme.headingWeight),
  } as CSSProperties;
}

const TYPE_ICONS: Record<SlideData["type"], string> = {
  title: "T",
  content: "\u00b6",
  stats: "#",
  comparison: "\u2194",
  cta: "\u2197",
  chart: "\u2593",
  metrics: "\u2261",
  team: "\u263A",
  timeline: "\u23F1",
  "image-content": "\u25A3",
};

const TYPE_LABELS: Record<SlideData["type"], string> = {
  title: "Title",
  content: "Content",
  stats: "Stats",
  comparison: "Compare",
  cta: "CTA",
  chart: "Chart",
  metrics: "Metrics",
  team: "Team",
  timeline: "Timeline",
  "image-content": "Image",
};

interface SlideThumbProps {
  slide: SlideData;
  themeId: string;
  width?: number;
}

/**
 * Lightweight miniature slide preview. Shows the theme colors, truncated title,
 * type icon, and a basic layout hint. No interactivity.
 */
export default function SlideThumb({ slide, themeId, width = 192 }: SlideThumbProps) {
  const theme = getTheme(themeId);
  const height = Math.round(width * (9 / 16));

  const isDarkSlide =
    slide.type === "title" ||
    slide.type === "cta" ||
    !!slide.accent;

  const bg = isDarkSlide ? theme.bgDark : theme.bgLight;
  const fg = isDarkSlide ? theme.textPrimary : theme.bgDark;
  const accent = isDarkSlide ? theme.accentLight : theme.accent;

  // Scale factor for the inner "slide" content
  const scaleFactor = width / 1280;

  return (
    <div
      className="relative overflow-hidden rounded-md flex-shrink-0"
      style={{
        width,
        height,
        ...themeVars(theme),
      }}
    >
      {/* Background */}
      <div className="absolute inset-0" style={{ background: bg }} />

      {/* Content preview at scaled size */}
      <div className="absolute inset-0 p-[8%] flex flex-col justify-between overflow-hidden">
        {/* Title area */}
        <div className="min-w-0">
          <div
            className="font-bold truncate leading-tight"
            style={{
              fontSize: `${Math.max(10, Math.round(36 * scaleFactor))}px`,
              color: fg,
              fontFamily: theme.headingFont,
              fontWeight: theme.headingWeight,
            }}
          >
            {slide.title || "Untitled"}
          </div>
          {slide.subtitle && (
            <div
              className="truncate leading-tight mt-[2px]"
              style={{
                fontSize: `${Math.max(7, Math.round(18 * scaleFactor))}px`,
                color: isDarkSlide ? theme.textSecondary : `${theme.bgDark}99`,
              }}
            >
              {slide.subtitle}
            </div>
          )}
        </div>

        {/* Layout hint: show content lines or icons */}
        <div className="flex-1 min-h-0 mt-[4%] overflow-hidden">
          {(slide.type === "content" || slide.type === "stats" || slide.type === "comparison") &&
            slide.content.slice(0, 3).map((_, i) => (
              <div
                key={i}
                className="rounded-sm mb-[2px]"
                style={{
                  height: `${Math.max(2, Math.round(8 * scaleFactor))}px`,
                  width: `${60 + (i % 3) * 10}%`,
                  background: `${fg}15`,
                }}
              />
            ))}
          {(slide.type === "metrics" || slide.type === "chart") && (
            <div className="flex gap-[2px] mt-[2%]">
              {[1, 2, 3, 4].map((h) => (
                <div
                  key={h}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${Math.max(4, Math.round((12 + h * 8) * scaleFactor))}px`,
                    background: accent,
                    opacity: 0.3 + h * 0.1,
                    alignSelf: "flex-end",
                  }}
                />
              ))}
            </div>
          )}
          {slide.type === "team" && (
            <div className="flex gap-[3px] mt-[4%]">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{
                    width: `${Math.max(6, Math.round(24 * scaleFactor))}px`,
                    height: `${Math.max(6, Math.round(24 * scaleFactor))}px`,
                    background: accent,
                    opacity: 0.4,
                  }}
                />
              ))}
            </div>
          )}
          {slide.type === "timeline" && (
            <div className="flex flex-col gap-[2px] mt-[2%]">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-[2px]">
                  <div
                    className="rounded-full shrink-0"
                    style={{
                      width: `${Math.max(3, Math.round(8 * scaleFactor))}px`,
                      height: `${Math.max(3, Math.round(8 * scaleFactor))}px`,
                      background: accent,
                      opacity: 0.5,
                    }}
                  />
                  <div
                    className="rounded-sm"
                    style={{
                      height: `${Math.max(2, Math.round(5 * scaleFactor))}px`,
                      width: `${50 + i * 15}%`,
                      background: `${fg}12`,
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Type badge */}
        <div className="flex items-center justify-between mt-auto pt-[2%]">
          <div
            className="flex items-center gap-[2px] rounded-sm px-[3px] py-[1px]"
            style={{
              fontSize: `${Math.max(6, Math.round(10 * scaleFactor))}px`,
              background: `${accent}20`,
              color: accent,
            }}
          >
            <span>{TYPE_ICONS[slide.type]}</span>
            <span className="font-medium">{TYPE_LABELS[slide.type]}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export { TYPE_LABELS, TYPE_ICONS };
