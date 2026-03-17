"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useEditorStore } from "../editor/state/editorStore";
import { getTheme, type ThemeDef } from "@/lib/themes";
import type {
  EditorBlock,
  BlocksRecord,
  HeadingBlockData,
  TextBlockData,
  BulletListBlockData,
  MetricBlockData,
  ImageBlockData,
  QuoteBlockData,
  CalloutBlockData,
  TeamMemberBlockData,
  TimelineItemBlockData,
  ComparisonRowBlockData,
  CardGroupBlockData,
  TableBlockData,
  DividerBlockData,
  SpacerBlockData,
} from "@/lib/editor/block-types";
import type { SlideData } from "@/lib/types";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface PresentModeProps {
  onClose: () => void;
}

/* ------------------------------------------------------------------ */
/*  Metric count-up hook                                               */
/* ------------------------------------------------------------------ */

function useCountUp(target: number, duration: number, active: boolean): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      setValue(Math.round(target * progress));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, active]);

  return value;
}

/* ------------------------------------------------------------------ */
/*  MetricValue — animated count-up component                          */
/* ------------------------------------------------------------------ */

function MetricValue({
  data,
  active,
}: {
  data: MetricBlockData;
  active: boolean;
}) {
  const numericValue = parseFloat(data.value.replace(/[^0-9.-]/g, ""));
  const isNumeric = !isNaN(numericValue);
  const counted = useCountUp(
    isNumeric ? numericValue : 0,
    1200,
    active && isNumeric
  );

  const display = isNumeric
    ? `${data.prefix ?? ""}${counted.toLocaleString()}${data.suffix ?? ""}`
    : data.value;

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-5xl font-bold tracking-tight">{display}</span>
      {data.change && (
        <span className="text-sm opacity-60">{data.change}</span>
      )}
      <span className="text-sm opacity-70">{data.label}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Block renderer                                                     */
/* ------------------------------------------------------------------ */

function renderBlock(
  block: EditorBlock,
  theme: ThemeDef,
  active: boolean
): React.ReactNode {
  const { type, data } = block;

  switch (type) {
    case "heading": {
      const d = data as HeadingBlockData;
      const Tag = d.level === 1 ? "h1" : d.level === 2 ? "h2" : "h3";
      const sizes = { 1: "text-5xl", 2: "text-3xl", 3: "text-2xl" } as const;
      return (
        <Tag
          className={`${sizes[d.level]} font-bold leading-tight`}
          style={{
            fontFamily: theme.headingFont,
            fontWeight: theme.headingWeight,
            textAlign: d.align,
          }}
        >
          {d.text}
        </Tag>
      );
    }

    case "text": {
      const d = data as TextBlockData;
      return (
        <p
          style={{
            fontSize: d.fontSize,
            textAlign: d.align,
            fontWeight: d.bold ? 700 : 400,
            fontStyle: d.italic ? "italic" : "normal",
          }}
        >
          {d.text}
        </p>
      );
    }

    case "bullet-list": {
      const d = data as BulletListBlockData;
      const ListTag = d.ordered ? "ol" : "ul";
      return (
        <ListTag className={`space-y-2 pl-6 ${d.ordered ? "list-decimal" : "list-disc"}`}>
          {d.items.map((item, i) => (
            <li key={i} className="text-lg">
              {item}
            </li>
          ))}
        </ListTag>
      );
    }

    case "metric": {
      const d = data as MetricBlockData;
      return <MetricValue data={d} active={active} />;
    }

    case "chart": {
      return (
        <div
          className="flex items-center justify-center rounded-lg border border-white/10"
          style={{ minHeight: 120, backgroundColor: "rgba(255,255,255,0.03)" }}
        >
          <span className="text-sm opacity-40">Chart</span>
        </div>
      );
    }

    case "image": {
      const d = data as ImageBlockData;
      return (
        <img
          src={d.src}
          alt={d.alt}
          className="max-h-full max-w-full"
          style={{
            objectFit: d.fit,
            borderRadius: d.borderRadius ?? 0,
          }}
        />
      );
    }

    case "quote": {
      const d = data as QuoteBlockData;
      return (
        <blockquote
          className="border-l-4 pl-6 italic opacity-90"
          style={{ borderColor: theme.accent }}
        >
          <p className="text-xl leading-relaxed">&ldquo;{d.text}&rdquo;</p>
          {d.author && (
            <footer className="mt-2 text-sm opacity-60">
              &mdash; {d.author}
              {d.source && <span>, {d.source}</span>}
            </footer>
          )}
        </blockquote>
      );
    }

    case "callout": {
      const d = data as CalloutBlockData;
      const variantColors: Record<string, string> = {
        info: "rgba(59,130,246,0.15)",
        warning: "rgba(245,158,11,0.15)",
        success: "rgba(34,197,94,0.15)",
        tip: "rgba(139,92,246,0.15)",
      };
      return (
        <div
          className="rounded-lg p-4"
          style={{ backgroundColor: variantColors[d.variant] ?? variantColors.info }}
        >
          <p className="text-base">{d.text}</p>
        </div>
      );
    }

    case "team-member": {
      const d = data as TeamMemberBlockData;
      return (
        <div className="flex flex-col items-center gap-2 text-center">
          {d.avatarUrl && (
            <img
              src={d.avatarUrl}
              alt={d.name}
              className="h-16 w-16 rounded-full object-cover"
            />
          )}
          <div className="text-lg font-semibold">{d.name}</div>
          <div className="text-sm opacity-60">{d.role}</div>
          {d.bio && <div className="text-sm opacity-50">{d.bio}</div>}
        </div>
      );
    }

    case "timeline-item": {
      const d = data as TimelineItemBlockData;
      return (
        <div className="flex gap-4">
          <div
            className="flex-shrink-0 text-sm font-medium opacity-60"
            style={{ minWidth: 80 }}
          >
            {d.date}
          </div>
          <div>
            <div className="font-semibold">{d.title}</div>
            {d.description && (
              <div className="mt-1 text-sm opacity-60">{d.description}</div>
            )}
          </div>
        </div>
      );
    }

    case "comparison-row": {
      const d = data as ComparisonRowBlockData;
      return (
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="text-sm opacity-60">{d.them}</div>
          <div className="font-semibold">{d.label}</div>
          <div className="text-sm" style={{ color: theme.accent }}>
            {d.us}
          </div>
        </div>
      );
    }

    case "card-group": {
      const d = data as CardGroupBlockData;
      return (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${d.columns}, 1fr)` }}
        >
          {d.cards.map((card, i) => (
            <div
              key={i}
              className="rounded-lg p-4"
              style={{ backgroundColor: "rgba(255,255,255,0.05)" }}
            >
              <div className="mb-1 font-semibold">{card.title}</div>
              <div className="text-sm opacity-70">{card.body}</div>
            </div>
          ))}
        </div>
      );
    }

    case "table": {
      const d = data as TableBlockData;
      return (
        <table className="w-full text-sm">
          <thead>
            <tr>
              {d.columns.map((col) => (
                <th
                  key={col.key}
                  className="border-b border-white/10 px-3 py-2 text-left font-semibold"
                  style={{ textAlign: col.align ?? "left" }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {d.rows.map((row, ri) => (
              <tr key={ri} className={d.striped && ri % 2 === 1 ? "bg-white/5" : ""}>
                {d.columns.map((col) => (
                  <td
                    key={col.key}
                    className="border-b border-white/5 px-3 py-2"
                    style={{ textAlign: col.align ?? "left" }}
                  >
                    {row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    case "divider": {
      const d = data as DividerBlockData;
      return (
        <hr
          style={{
            borderStyle: d.style === "gradient" ? "solid" : d.style,
            borderWidth: d.thickness,
            borderColor: d.color ?? theme.accent,
            opacity: 0.3,
          }}
        />
      );
    }

    case "spacer": {
      const d = data as SpacerBlockData;
      return <div style={{ height: d.height * 60 }} />;
    }

    default:
      return null;
  }
}

/* ------------------------------------------------------------------ */
/*  Slide background helper                                            */
/* ------------------------------------------------------------------ */

function getSlideBackground(
  slide: SlideData,
  theme: ThemeDef
): { bg: string; fg: string } {
  const isAccent =
    slide.accent === true ||
    slide.type === "title" ||
    slide.type === "cta";
  return {
    bg: isAccent ? theme.bgDark : theme.bgLight,
    fg: isAccent ? theme.textPrimary : theme.textOnLight,
  };
}

/* ------------------------------------------------------------------ */
/*  Presenter notes window                                             */
/* ------------------------------------------------------------------ */

function openPresenterNotes(
  slides: SlideData[],
  currentIndex: number,
  startTime: number,
  deckTitle: string
) {
  const slide = slides[currentIndex];
  const nextSlide = slides[currentIndex + 1];
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  const html = `<!DOCTYPE html>
<html><head><title>${deckTitle} - Presenter Notes</title>
<style>
  body { font-family: system-ui, sans-serif; background: #111; color: #fff; padding: 32px; margin: 0; }
  h1 { font-size: 14px; opacity: 0.5; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
  .slide-num { font-size: 48px; font-weight: 800; margin-bottom: 4px; }
  .slide-title { font-size: 24px; font-weight: 600; margin-bottom: 32px; }
  .next { opacity: 0.6; margin-bottom: 32px; }
  .timer { font-family: monospace; font-size: 64px; font-weight: 700; opacity: 0.8; }
</style>
</head><body>
  <h1>Current Slide</h1>
  <div class="slide-num">${currentIndex + 1} / ${slides.length}</div>
  <div class="slide-title">${slide?.title ?? "Untitled"}</div>
  <h1>Next Slide</h1>
  <div class="next">${nextSlide?.title ?? "End of presentation"}</div>
  <h1>Elapsed</h1>
  <div class="timer">${mm}:${ss}</div>
</body></html>`;

  const w = window.open("", "presenter-notes", "width=480,height=400");
  if (w) {
    w.document.open();
    w.document.write(html);
    w.document.close();
  }
}

/* ------------------------------------------------------------------ */
/*  PresentMode component                                              */
/* ------------------------------------------------------------------ */

export default function PresentMode({ onClose }: PresentModeProps) {
  const slides = useEditorStore((s) => s.slides);
  const slideBlocks = useEditorStore((s) => s.slideBlocks);
  const slideBlockOrder = useEditorStore((s) => s.slideBlockOrder);
  const themeId = useEditorStore((s) => s.themeId);
  const deck = useEditorStore((s) => s.deck);

  const theme = getTheme(themeId);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [visible, setVisible] = useState(true);
  const startTimeRef = useRef(Date.now());
  const totalSlides = slides.length;

  /* ---- fullscreen on mount ---- */
  useEffect(() => {
    document.documentElement.requestFullscreen?.().catch(() => {
      /* fullscreen denied — continue anyway */
    });
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
      }
    };
  }, []);

  /* ---- listen for fullscreen exit ---- */
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) {
        onClose();
      }
    };
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, [onClose]);

  /* ---- slide transition ---- */
  const goTo = useCallback(
    (index: number) => {
      if (index < 0 || index >= totalSlides) return;
      setVisible(false);
      setTimeout(() => {
        setCurrentSlide(index);
        setVisible(true);
      }, 150);
    },
    [totalSlides]
  );

  /* ---- keyboard navigation ---- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
        case " ":
          e.preventDefault();
          goTo(currentSlide + 1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          goTo(currentSlide - 1);
          break;
        case "Escape":
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen?.().catch(() => {});
          }
          onClose();
          break;
        case "Home":
          e.preventDefault();
          goTo(0);
          break;
        case "End":
          e.preventDefault();
          goTo(totalSlides - 1);
          break;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentSlide, totalSlides, goTo, onClose]);

  /* ---- current slide data ---- */
  const slide = slides[currentSlide];
  if (!slide) return null;

  const slideId = slide.id ?? "";
  const blocks: BlocksRecord = slideBlocks[slideId] ?? {};
  const blockOrder: string[] = slideBlockOrder[slideId] ?? [];
  const orderedBlocks = blockOrder
    .map((id) => blocks[id])
    .filter((b): b is EditorBlock => b != null && !b.hidden);
  const hasV2Blocks = orderedBlocks.length > 0;

  const { bg, fg } = getSlideBackground(slide, theme);
  const progressPct =
    totalSlides > 1 ? ((currentSlide) / (totalSlides - 1)) * 100 : 100;

  const deckTitle = deck?.title ?? "Presentation";

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col select-none"
      style={{ backgroundColor: "#000", fontFamily: theme.fontFamily }}
    >
      {/* ---- Slide area ---- */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden p-8">
        <div
          className="relative h-full w-full max-w-[1280px] overflow-hidden rounded-lg shadow-2xl"
          style={{
            backgroundColor: bg,
            color: fg,
            aspectRatio: "16 / 9",
            maxHeight: "calc(100vh - 80px)",
            opacity: visible ? 1 : 0,
            transition: "opacity 300ms ease",
          }}
        >
          {hasV2Blocks ? (
            /* ---- v2 block rendering (positioned) ---- */
            <div className="relative h-full w-full">
              {orderedBlocks.map((block, idx) => {
                const pos = block.position;
                return (
                  <div
                    key={block.id}
                    className="absolute"
                    style={{
                      left: `${(pos.x / 12) * 100}%`,
                      top: `${(pos.y / 6) * 100}%`,
                      width: `${(pos.width / 12) * 100}%`,
                      height:
                        pos.height > 0
                          ? `${(pos.height / 6) * 100}%`
                          : "auto",
                      zIndex: pos.zIndex,
                      padding: block.style.padding ?? 12,
                      backgroundColor: block.style.backgroundColor,
                      borderRadius: block.style.borderRadius,
                      opacity: block.style.opacity ?? 1,
                      transition: "opacity 500ms ease, transform 500ms ease",
                      transitionDelay: `${idx * 100}ms`,
                      ...(visible
                        ? { transform: "translateY(0)", animationFillMode: "forwards" as const }
                        : { transform: "translateY(8px)" }),
                    }}
                  >
                    {renderBlock(block, theme, visible)}
                  </div>
                );
              })}
            </div>
          ) : (
            /* ---- Fallback: legacy slide data ---- */
            <div className="flex h-full flex-col items-center justify-center gap-4 p-12 text-center">
              <h1
                className="text-4xl font-bold"
                style={{
                  fontFamily: theme.headingFont,
                  fontWeight: theme.headingWeight,
                }}
              >
                {slide.title}
              </h1>
              {slide.subtitle && (
                <p className="text-xl opacity-60">{slide.subtitle}</p>
              )}
              {slide.content.length > 0 && (
                <ul className="mt-4 space-y-2 text-lg opacity-80">
                  {slide.content.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ---- Bottom bar ---- */}
      <div className="flex h-12 flex-shrink-0 items-center gap-4 px-6">
        {/* Presenter notes button */}
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded opacity-40 hover:opacity-80"
          style={{ color: "#fff" }}
          onClick={() =>
            openPresenterNotes(slides, currentSlide, startTimeRef.current, deckTitle)
          }
          title="Presenter notes"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="2" y="2" width="12" height="12" rx="1" />
            <line x1="5" y1="6" x2="11" y2="6" />
            <line x1="5" y1="9" x2="9" y2="9" />
          </svg>
        </button>

        {/* Navigation arrows */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded opacity-50 transition-opacity hover:opacity-100 disabled:opacity-20"
            style={{ color: "#fff" }}
            disabled={currentSlide === 0}
            onClick={() => goTo(currentSlide - 1)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="11,4 6,9 11,14" />
            </svg>
          </button>
          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded opacity-50 transition-opacity hover:opacity-100 disabled:opacity-20"
            style={{ color: "#fff" }}
            disabled={currentSlide === totalSlides - 1}
            onClick={() => goTo(currentSlide + 1)}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="7,4 12,9 7,14" />
            </svg>
          </button>
        </div>

        {/* Progress bar */}
        <div className="flex-1">
          <div
            className="h-[2px] w-full overflow-hidden rounded-full"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{
                width: `${progressPct}%`,
                backgroundColor: theme.accent,
              }}
            />
          </div>
        </div>

        {/* Slide counter */}
        <div
          className="text-xs tabular-nums opacity-50"
          style={{ fontFamily: "monospace", color: "#fff" }}
        >
          {String(currentSlide + 1).padStart(2, "0")} /{" "}
          {String(totalSlides).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}
