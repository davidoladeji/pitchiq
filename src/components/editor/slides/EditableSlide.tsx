"use client";

import {
  useState,
  useCallback,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import { getTheme, type ThemeDef } from "@/lib/themes";
import type { SlideData, SlideBlock } from "@/lib/types";
import TextBlock from "../blocks/TextBlock";
import MetricBlock from "../blocks/MetricBlock";
import ChartBlock from "../blocks/ChartBlock";
import TeamBlock from "../blocks/TeamBlock";
import TimelineBlock from "../blocks/TimelineBlock";

// ─── Theme variable system (mirrors SlideRenderer) ──────────────────

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

const headingStyle: CSSProperties = {
  fontFamily: "var(--t-heading-font)",
  fontWeight: "var(--t-heading-weight)" as unknown as number,
};

// ─── Formatting Toolbar ─────────────────────────────────────────────

function FormattingToolbar({
  bold,
  italic,
  align,
  onToggleBold,
  onToggleItalic,
  onAlignChange,
}: {
  bold: boolean;
  italic: boolean;
  align: string;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onAlignChange: (a: string) => void;
}) {
  return (
    <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-50 bg-navy-950 rounded-lg shadow-xl border border-white/10 p-1 flex gap-1">
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onToggleBold(); }}
        className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 ${bold ? "bg-electric text-white" : "text-white/70 hover:bg-white/10"}`}
      >
        B
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onToggleItalic(); }}
        className={`w-7 h-7 flex items-center justify-center rounded text-xs italic transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 ${italic ? "bg-electric text-white" : "text-white/70 hover:bg-white/10"}`}
      >
        I
      </button>
      <div className="w-px bg-white/10 mx-0.5" />
      {(["left", "center", "right"] as const).map((a) => (
        <button
          key={a}
          type="button"
          onMouseDown={(e) => { e.preventDefault(); onAlignChange(a); }}
          className={`w-7 h-7 flex items-center justify-center rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 ${align === a ? "bg-electric text-white" : "text-white/70 hover:bg-white/10"}`}
          title={`Align ${a}`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
            {a === "left" && <><rect x="1" y="2" width="14" height="1.5" rx="0.5" /><rect x="1" y="6" width="10" height="1.5" rx="0.5" /><rect x="1" y="10" width="12" height="1.5" rx="0.5" /></>}
            {a === "center" && <><rect x="1" y="2" width="14" height="1.5" rx="0.5" /><rect x="3" y="6" width="10" height="1.5" rx="0.5" /><rect x="2" y="10" width="12" height="1.5" rx="0.5" /></>}
            {a === "right" && <><rect x="1" y="2" width="14" height="1.5" rx="0.5" /><rect x="5" y="6" width="10" height="1.5" rx="0.5" /><rect x="3" y="10" width="12" height="1.5" rx="0.5" /></>}
          </svg>
        </button>
      ))}
    </div>
  );
}

// ─── Inline editable text helper ────────────────────────────────────

function InlineEditable({
  value,
  onChange,
  className,
  style,
  placeholder,
  tag: Tag = "div",
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  style?: CSSProperties;
  placeholder?: string;
  tag?: "div" | "h1" | "h2" | "p" | "span";
}) {
  const ref = useRef<HTMLElement>(null);
  const [focused, setFocused] = useState(false);
  const [formatting, setFormatting] = useState({ bold: false, italic: false, align: "left" });

  const handleBlur = useCallback(() => {
    setFocused(false);
    const text = ref.current?.textContent || "";
    if (text !== value) {
      onChange(text);
    }
  }, [onChange, value]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  }, []);

  const isEmpty = !value || value.trim() === "";

  return (
    <div className="relative">
      {focused && (
        <FormattingToolbar
          bold={formatting.bold}
          italic={formatting.italic}
          align={formatting.align}
          onToggleBold={() => setFormatting((f) => ({ ...f, bold: !f.bold }))}
          onToggleItalic={() => setFormatting((f) => ({ ...f, italic: !f.italic }))}
          onAlignChange={(a) => setFormatting((f) => ({ ...f, align: a }))}
        />
      )}
      <Tag
        ref={ref as React.RefObject<HTMLDivElement>}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setFocused(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`outline-none transition-shadow rounded ${
          focused ? "ring-2 ring-electric/50" : ""
        } ${className || ""} ${isEmpty && !focused ? "opacity-30" : ""}`}
        style={{
          ...style,
          fontWeight: formatting.bold ? 700 : (style?.fontWeight ?? undefined),
          fontStyle: formatting.italic ? "italic" : undefined,
          textAlign: formatting.align as CSSProperties["textAlign"],
        }}
        data-placeholder={placeholder}
      >
        {value || placeholder}
      </Tag>
    </div>
  );
}

// ─── Selectable Block Wrapper ───────────────────────────────────────

function BlockWrapper({
  isSelected,
  onSelect,
  children,
}: {
  isSelected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative group transition-all rounded-lg ${
        isSelected
          ? "ring-2 ring-electric ring-offset-2"
          : "hover:ring-1 hover:ring-white/20"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
      {children}
      {/* Resize handles (visual only) */}
      {isSelected && (
        <>
          <div className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-electric rounded-full border-2 border-white cursor-nw-resize" />
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-electric rounded-full border-2 border-white cursor-ne-resize" />
          <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-electric rounded-full border-2 border-white cursor-sw-resize" />
          <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-electric rounded-full border-2 border-white cursor-se-resize" />
        </>
      )}
    </div>
  );
}

// ─── Hex to RGBA helper ─────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Block Renderer ─────────────────────────────────────────────────

function renderEditorBlock(
  block: SlideBlock,
  index: number,
  selectedBlockId: string | null,
  onSelectBlock: (id: string) => void,
  onUpdateBlock: (id: string, content: string, properties?: Record<string, unknown>) => void,
  accentHex: string
) {
  const isSelected = selectedBlockId === block.id;
  const handleUpdate = (content: string, properties?: Record<string, unknown>) => {
    onUpdateBlock(block.id, content, properties);
  };
  const handleSelect = () => onSelectBlock(block.id);

  switch (block.type) {
    case "text":
    case "quote":
    case "comparison-row":
    case "logo-grid":
    case "image":
      return (
        <BlockWrapper key={block.id} isSelected={isSelected} onSelect={handleSelect}>
          <TextBlock
            content={block.content}
            properties={block.properties}
            isSelected={isSelected}
            onUpdate={handleUpdate}
            onSelect={handleSelect}
          />
        </BlockWrapper>
      );

    case "metric":
      return (
        <BlockWrapper key={block.id} isSelected={isSelected} onSelect={handleSelect}>
          <MetricBlock
            content={block.content}
            properties={block.properties}
            isSelected={isSelected}
            onUpdate={handleUpdate}
            onSelect={handleSelect}
          />
        </BlockWrapper>
      );

    case "chart":
      return (
        <BlockWrapper key={block.id} isSelected={isSelected} onSelect={handleSelect}>
          <ChartBlock
            content={block.content}
            properties={block.properties}
            isSelected={isSelected}
            onUpdate={handleUpdate}
            onSelect={handleSelect}
          />
        </BlockWrapper>
      );

    case "team-member":
      return (
        <BlockWrapper key={block.id} isSelected={isSelected} onSelect={handleSelect}>
          <TeamBlock
            content={block.content}
            properties={block.properties}
            isSelected={isSelected}
            onUpdate={handleUpdate}
            onSelect={handleSelect}
            index={index}
          />
        </BlockWrapper>
      );

    case "timeline-item":
      return (
        <BlockWrapper key={block.id} isSelected={isSelected} onSelect={handleSelect}>
          <TimelineBlock
            content={block.content}
            properties={block.properties}
            isSelected={isSelected}
            onUpdate={handleUpdate}
            onSelect={handleSelect}
            accentHex={accentHex}
          />
        </BlockWrapper>
      );

    default:
      return (
        <BlockWrapper key={block.id} isSelected={isSelected} onSelect={handleSelect}>
          <TextBlock
            content={block.content}
            properties={block.properties}
            isSelected={isSelected}
            onUpdate={handleUpdate}
            onSelect={handleSelect}
          />
        </BlockWrapper>
      );
  }
}

// ─── Per-type Editable Slide Content ────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function EditableTitleSlide({
  slide,
  onUpdate,
  accentHex,
}: {
  slide: SlideData;
  onUpdate: (patch: Partial<SlideData>) => void;
  accentHex: string;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full p-12 relative overflow-hidden"
      style={{ background: "var(--t-bg-dark)", color: "var(--t-text)" }}
    >
      <div className="absolute inset-0 bg-grid-dark opacity-15" aria-hidden="true" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[220px] rounded-full blur-[90px] opacity-20"
        style={{ background: "var(--t-accent)" }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col items-center text-center max-w-3xl w-full">
        <InlineEditable
          value={slide.title}
          onChange={(v) => onUpdate({ title: v })}
          className="text-5xl lg:text-6xl mb-4 tracking-tight leading-[1.1] w-full"
          style={headingStyle}
          placeholder="Your Title Here"
          tag="h1"
        />
        <InlineEditable
          value={slide.subtitle || ""}
          onChange={(v) => onUpdate({ subtitle: v })}
          className="text-xl mb-8 max-w-2xl leading-relaxed w-full"
          style={{ color: "var(--t-text-secondary)" }}
          placeholder="Add a subtitle..."
          tag="p"
        />
        <div className="space-y-2 max-w-xl w-full">
          {slide.content.map((item, i) => (
            <InlineEditable
              key={i}
              value={item}
              onChange={(v) => {
                const newContent = [...slide.content];
                newContent[i] = v;
                onUpdate({ content: newContent });
              }}
              className="text-base leading-relaxed opacity-50"
              style={{ color: "var(--t-text-secondary)" }}
              placeholder="Add content..."
              tag="p"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function EditableContentSlide({
  slide,
  onUpdate,
}: {
  slide: SlideData;
  onUpdate: (patch: Partial<SlideData>) => void;
}) {
  const isDark = !!slide.accent;
  const bg = isDark ? "var(--t-bg-dark)" : "var(--t-bg-light)";
  const fg = isDark ? "var(--t-text)" : "var(--t-bg-dark)";
  const accentColor = isDark ? "var(--t-accent-light)" : "var(--t-accent)";
  const subColor = isDark ? "var(--t-text-secondary)" : undefined;

  return (
    <div
      className="flex flex-col h-full p-12 relative overflow-hidden"
      style={{ background: bg, color: fg }}
    >
      {isDark && <div className="absolute inset-0 bg-grid-dark opacity-10 pointer-events-none" aria-hidden="true" />}
      {isDark && <div className="absolute top-0 left-0 right-0 h-1" style={{ background: accentColor }} aria-hidden="true" />}
      <div className="mb-6 relative z-10 shrink-0">
        <InlineEditable
          value={slide.title}
          onChange={(v) => onUpdate({ title: v })}
          className="text-4xl tracking-tight mb-2 text-balance"
          style={headingStyle}
          placeholder="Section Title"
          tag="h2"
        />
        {(slide.subtitle || true) && (
          <InlineEditable
            value={slide.subtitle || ""}
            onChange={(v) => onUpdate({ subtitle: v })}
            className="text-lg leading-relaxed opacity-60"
            style={{ color: subColor }}
            placeholder="Add subtitle..."
            tag="p"
          />
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center space-y-4 relative z-10 max-w-3xl">
        {slide.content.map((item, i) => (
          <div key={i} className="flex items-start gap-4">
            <span className="w-1 rounded-full mt-2 shrink-0 min-h-[1rem]" style={{ background: accentColor }} aria-hidden="true" />
            <InlineEditable
              value={item}
              onChange={(v) => {
                const newContent = [...slide.content];
                newContent[i] = v;
                onUpdate({ content: newContent });
              }}
              className="text-lg leading-relaxed opacity-90 flex-1"
              placeholder="Add bullet point..."
              tag="p"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => onUpdate({ content: [...slide.content, ""] })}
          className="flex items-center gap-2 text-sm opacity-30 hover:opacity-60 transition-opacity mt-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
          </svg>
          Add bullet
        </button>
      </div>
    </div>
  );
}

function EditableStatsSlide({
  slide,
  onUpdate,
}: {
  slide: SlideData;
  onUpdate: (patch: Partial<SlideData>) => void;
}) {
  const isDark = !!slide.accent;

  return (
    <div
      className="flex flex-col h-full p-12 relative overflow-hidden"
      style={{
        background: isDark ? "var(--t-bg-dark)" : "var(--t-bg-light)",
        color: isDark ? "var(--t-text)" : "var(--t-bg-dark)",
      }}
    >
      {isDark && <div className="absolute inset-0 bg-grid-dark opacity-10 pointer-events-none" aria-hidden="true" />}
      <div className="mb-8 relative z-10">
        <InlineEditable
          value={slide.title}
          onChange={(v) => onUpdate({ title: v })}
          className="text-4xl tracking-tight mb-2 text-balance"
          style={headingStyle}
          placeholder="Key Statistics"
          tag="h2"
        />
        <InlineEditable
          value={slide.subtitle || ""}
          onChange={(v) => onUpdate({ subtitle: v })}
          className="text-lg leading-relaxed opacity-60"
          style={{ color: isDark ? "var(--t-text-secondary)" : undefined }}
          placeholder="Add context..."
          tag="p"
        />
      </div>
      <div className="flex-1 grid grid-cols-2 gap-4 items-stretch relative z-10">
        {slide.content.map((item, i) => (
          <div
            key={i}
            className="p-6 rounded-xl flex items-center"
            style={{
              background: isDark ? "var(--t-card-bg)" : "var(--t-bg-light)",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
            }}
          >
            <InlineEditable
              value={item}
              onChange={(v) => {
                const newContent = [...slide.content];
                newContent[i] = v;
                onUpdate({ content: newContent });
              }}
              className="text-lg font-medium leading-relaxed opacity-90"
              placeholder="Stat..."
              tag="p"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function EditableChartSlide({
  slide,
  onUpdate,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  accentHex,
}: {
  slide: SlideData;
  onUpdate: (patch: Partial<SlideData>) => void;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onUpdateBlock: (id: string, content: string, properties?: Record<string, unknown>) => void;
  accentHex: string;
}) {
  const isDark = !!slide.accent;

  // If we have editor blocks, render the chart block
  const chartBlock = slide.editorBlocks?.find((b) => b.type === "chart");

  return (
    <div
      className="flex flex-col h-full p-12 relative"
      style={{
        background: isDark ? "var(--t-bg-dark)" : "var(--t-bg-light)",
        color: isDark ? "var(--t-text)" : "var(--t-bg-dark)",
      }}
    >
      {isDark && <div className="absolute inset-0 bg-grid-dark opacity-10 pointer-events-none" aria-hidden="true" />}
      <div className="mb-6 relative z-10">
        <InlineEditable
          value={slide.title}
          onChange={(v) => onUpdate({ title: v })}
          className="text-4xl tracking-tight mb-2 text-balance"
          style={headingStyle}
          placeholder="Chart Title"
          tag="h2"
        />
        <InlineEditable
          value={slide.subtitle || ""}
          onChange={(v) => onUpdate({ subtitle: v })}
          className="text-lg leading-relaxed opacity-60"
          style={{ color: isDark ? "var(--t-text-secondary)" : undefined }}
          placeholder="Add subtitle..."
          tag="p"
        />
      </div>
      <div className="flex-1 relative z-10 min-h-0">
        {chartBlock ? (
          renderEditorBlock(
            chartBlock,
            0,
            selectedBlockId,
            onSelectBlock,
            onUpdateBlock,
            accentHex
          )
        ) : (
          <div className="h-full flex items-center justify-center text-white/20 text-sm">
            No chart data. Add a Chart block.
          </div>
        )}
      </div>
    </div>
  );
}

function EditableMetricsSlide({
  slide,
  onUpdate,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  accentHex,
}: {
  slide: SlideData;
  onUpdate: (patch: Partial<SlideData>) => void;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onUpdateBlock: (id: string, content: string, properties?: Record<string, unknown>) => void;
  accentHex: string;
}) {
  const isDark = !!slide.accent;
  const metricBlocks = (slide.editorBlocks || []).filter((b) => b.type === "metric");

  return (
    <div
      className="flex flex-col h-full p-12 relative overflow-hidden"
      style={{
        background: isDark ? "var(--t-bg-dark)" : "var(--t-bg-light)",
        color: isDark ? "var(--t-text)" : "var(--t-bg-dark)",
      }}
    >
      {isDark && <div className="absolute inset-0 bg-grid-dark opacity-10 pointer-events-none" aria-hidden="true" />}
      <div className="mb-8 relative z-10">
        <InlineEditable
          value={slide.title}
          onChange={(v) => onUpdate({ title: v })}
          className="text-4xl tracking-tight mb-2 text-balance"
          style={headingStyle}
          placeholder="Key Metrics"
          tag="h2"
        />
        <InlineEditable
          value={slide.subtitle || ""}
          onChange={(v) => onUpdate({ subtitle: v })}
          className="text-lg leading-relaxed opacity-60"
          style={{ color: isDark ? "var(--t-text-secondary)" : undefined }}
          placeholder="Performance summary..."
          tag="p"
        />
      </div>
      <div className="flex-1 grid grid-cols-2 gap-4 items-stretch relative z-10">
        {metricBlocks.length > 0
          ? metricBlocks.map((block, i) =>
              renderEditorBlock(block, i, selectedBlockId, onSelectBlock, onUpdateBlock, accentHex)
            )
          : slide.metrics?.map((metric, i) => (
              <div
                key={i}
                className="p-6 rounded-xl flex flex-col justify-center"
                style={{
                  background: isDark ? "var(--t-card-bg)" : "rgba(0,0,0,0.02)",
                  border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <p className="text-xs uppercase tracking-wider font-semibold opacity-50 mb-1">{metric.label}</p>
                <p className="text-3xl font-bold tracking-tight">{metric.value}</p>
                {metric.change && (
                  <p className={`text-sm font-semibold mt-1 ${metric.trend === "up" ? "text-emerald-400" : metric.trend === "down" ? "text-red-400" : "text-white/50"}`}>
                    {metric.trend === "up" ? "\u2191" : metric.trend === "down" ? "\u2193" : "\u2192"} {metric.change}
                  </p>
                )}
              </div>
            ))}
      </div>
    </div>
  );
}

function EditableTeamSlide({
  slide,
  onUpdate,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  accentHex,
}: {
  slide: SlideData;
  onUpdate: (patch: Partial<SlideData>) => void;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onUpdateBlock: (id: string, content: string, properties?: Record<string, unknown>) => void;
  accentHex: string;
}) {
  const teamBlocks = (slide.editorBlocks || []).filter((b) => b.type === "team-member");

  return (
    <div className="flex flex-col h-full p-12" style={{ background: "var(--t-bg-light)", color: "var(--t-bg-dark)" }}>
      <div className="mb-8">
        <InlineEditable
          value={slide.title}
          onChange={(v) => onUpdate({ title: v })}
          className="text-4xl tracking-tight mb-2 text-balance"
          style={headingStyle}
          placeholder="Our Team"
          tag="h2"
        />
        <InlineEditable
          value={slide.subtitle || ""}
          onChange={(v) => onUpdate({ subtitle: v })}
          className="text-lg opacity-60 leading-relaxed"
          placeholder="The people behind the product"
          tag="p"
        />
      </div>
      <div className={`flex-1 grid gap-4 items-stretch ${teamBlocks.length <= 3 ? "grid-cols-3" : "grid-cols-3 lg:grid-cols-4"}`}>
        {teamBlocks.length > 0
          ? teamBlocks.map((block, i) =>
              renderEditorBlock(block, i, selectedBlockId, onSelectBlock, onUpdateBlock, accentHex)
            )
          : slide.team?.map((member, i) => (
              <div key={i} className="flex flex-col items-center text-center p-5 rounded-xl" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)" }}>
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-3 text-white font-bold text-xl"
                  style={{ background: ["#4361ee", "#7c3aed", "#10b981", "#f59e0b", "#ef4444"][i % 5] }}
                >
                  {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <p className="font-bold text-base">{member.name}</p>
                <p className="text-sm font-medium opacity-60" style={{ color: "var(--t-accent)" }}>{member.role}</p>
                {member.bio && <p className="text-xs opacity-50 mt-2 leading-relaxed">{member.bio}</p>}
              </div>
            ))}
      </div>
    </div>
  );
}

function EditableTimelineSlide({
  slide,
  onUpdate,
  selectedBlockId,
  onSelectBlock,
  onUpdateBlock,
  accentHex,
}: {
  slide: SlideData;
  onUpdate: (patch: Partial<SlideData>) => void;
  selectedBlockId: string | null;
  onSelectBlock: (id: string) => void;
  onUpdateBlock: (id: string, content: string, properties?: Record<string, unknown>) => void;
  accentHex: string;
}) {
  const isDark = !!slide.accent;
  const timelineBlocks = (slide.editorBlocks || []).filter((b) => b.type === "timeline-item");

  return (
    <div
      className="flex flex-col h-full p-12 overflow-hidden"
      style={{
        background: isDark ? "var(--t-bg-dark)" : "var(--t-bg-light)",
        color: isDark ? "var(--t-text)" : "var(--t-bg-dark)",
      }}
    >
      {isDark && <div className="absolute inset-0 bg-grid-dark opacity-10 pointer-events-none" aria-hidden="true" />}
      <div className="mb-6 shrink-0 relative z-10">
        <InlineEditable
          value={slide.title}
          onChange={(v) => onUpdate({ title: v })}
          className="text-4xl tracking-tight mb-2 text-balance"
          style={headingStyle}
          placeholder="Roadmap"
          tag="h2"
        />
        <InlineEditable
          value={slide.subtitle || ""}
          onChange={(v) => onUpdate({ subtitle: v })}
          className="text-lg opacity-60 leading-relaxed"
          style={{ color: isDark ? "var(--t-text-secondary)" : undefined }}
          placeholder="Our journey ahead"
          tag="p"
        />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center relative z-10">
        <div className="relative">
          <div className="absolute left-[18px] top-2 bottom-2 w-0.5" style={{ background: hexToRgba(accentHex, 0.25) }} />
          <div className="space-y-4">
            {timelineBlocks.length > 0
              ? timelineBlocks.map((block, i) =>
                  renderEditorBlock(block, i, selectedBlockId, onSelectBlock, onUpdateBlock, accentHex)
                )
              : slide.timeline?.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10"
                      style={{
                        borderWidth: "2px",
                        borderStyle: "solid",
                        borderColor: item.completed ? "#34d399" : accentHex,
                        background: item.completed ? "rgba(52,211,153,0.1)" : hexToRgba(accentHex, 0.1),
                      }}
                    >
                      {item.completed ? (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#10b981" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: accentHex }} />
                      )}
                    </div>
                    <div className="pt-1 min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: accentHex }}>{item.date}</p>
                      <p className="font-bold text-base">{item.title}</p>
                      {item.description && <p className="text-sm opacity-60 mt-0.5">{item.description}</p>}
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function EditableComparisonSlide({
  slide,
  onUpdate,
  accentHex,
}: {
  slide: SlideData;
  onUpdate: (patch: Partial<SlideData>) => void;
  accentHex: string;
}) {
  const items = slide.content.slice(0, 6);

  return (
    <div className="flex flex-col h-full p-12 overflow-hidden" style={{ background: "var(--t-bg-light)", color: "var(--t-bg-dark)" }}>
      <div className="mb-6 shrink-0">
        <InlineEditable
          value={slide.title}
          onChange={(v) => onUpdate({ title: v })}
          className="text-4xl tracking-tight mb-2 text-balance"
          style={headingStyle}
          placeholder="Why Us"
          tag="h2"
        />
        <InlineEditable
          value={slide.subtitle || ""}
          onChange={(v) => onUpdate({ subtitle: v })}
          className="text-lg opacity-60 leading-relaxed"
          placeholder="How we compare"
          tag="p"
        />
      </div>
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col justify-center space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3 p-4 rounded-xl" style={{ border: "1px solid rgba(0,0,0,0.08)", background: "rgba(0,0,0,0.02)" }}>
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ background: hexToRgba(accentHex, 0.1), border: `1px solid ${hexToRgba(accentHex, 0.2)}` }}
            >
              <span className="font-bold text-xs" style={{ color: accentHex }}>{i + 1}</span>
            </div>
            <InlineEditable
              value={item}
              onChange={(v) => {
                const newContent = [...slide.content];
                newContent[i] = v;
                onUpdate({ content: newContent });
              }}
              className="text-base leading-relaxed pt-1 flex-1"
              placeholder="Comparison point..."
              tag="p"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => onUpdate({ content: [...slide.content, ""] })}
          className="flex items-center gap-2 text-sm opacity-30 hover:opacity-60 transition-opacity mt-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
          </svg>
          Add row
        </button>
      </div>
    </div>
  );
}

function EditableCtaSlide({
  slide,
  onUpdate,
}: {
  slide: SlideData;
  onUpdate: (patch: Partial<SlideData>) => void;
}) {
  return (
    <div
      className="flex flex-col items-center justify-center h-full p-12 relative overflow-hidden"
      style={{ background: "var(--t-bg-dark)", color: "var(--t-text)" }}
    >
      <div className="absolute inset-0 bg-grid-dark opacity-15" aria-hidden="true" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[220px] rounded-full blur-[90px] opacity-15"
        style={{ background: "var(--t-accent)" }}
        aria-hidden="true"
      />
      <div className="relative z-10 flex flex-col items-center text-center max-w-2xl w-full">
        <InlineEditable
          value={slide.title}
          onChange={(v) => onUpdate({ title: v })}
          className="text-5xl mb-4 tracking-tight leading-tight text-balance w-full"
          style={headingStyle}
          placeholder="Let's Build Together"
          tag="h2"
        />
        <InlineEditable
          value={slide.subtitle || ""}
          onChange={(v) => onUpdate({ subtitle: v })}
          className="text-xl mb-8 leading-relaxed opacity-60 w-full"
          style={{ color: "var(--t-text-secondary)" }}
          placeholder="Your call to action..."
          tag="p"
        />
        <div className="space-y-3 mb-8 max-w-xl w-full">
          {slide.content.map((item, i) => (
            <InlineEditable
              key={i}
              value={item}
              onChange={(v) => {
                const newContent = [...slide.content];
                newContent[i] = v;
                onUpdate({ content: newContent });
              }}
              className="text-lg leading-relaxed opacity-50"
              style={{ color: "var(--t-text-secondary)" }}
              placeholder="Contact info..."
              tag="p"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main EditableSlide Component ───────────────────────────────────

interface EditableSlideProps {
  slide: SlideData;
  themeId: string;
  isSelected: boolean;
  onUpdate: (patch: Partial<SlideData>) => void;
}

export default function EditableSlide({
  slide,
  themeId,
  isSelected,
  onUpdate,
}: EditableSlideProps) {
  const theme = getTheme(themeId);
  const accentHex = theme.accent;
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const handleUpdateBlock = useCallback(
    (blockId: string, content: string, properties?: Record<string, unknown>) => {
      if (!slide.editorBlocks) return;
      const newBlocks = slide.editorBlocks.map((b) =>
        b.id === blockId
          ? { ...b, content, ...(properties ? { properties: { ...b.properties, ...properties } } : {}) }
          : b
      );
      onUpdate({ editorBlocks: newBlocks });
    },
    [slide.editorBlocks, onUpdate]
  );

  const handleSelectBlock = useCallback((id: string) => {
    setSelectedBlockId(id);
  }, []);

  // Deselect block when clicking the slide background
  const handleSlideClick = useCallback(() => {
    setSelectedBlockId(null);
  }, []);

  // If the slide has editorBlocks, render the blocks-based editing for block-supporting types
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const hasBlocks = slide.editorBlocks && slide.editorBlocks.length > 0;

  const blockProps = {
    selectedBlockId,
    onSelectBlock: handleSelectBlock,
    onUpdateBlock: handleUpdateBlock,
    accentHex,
  };

  const renderSlideContent = () => {
    switch (slide.type) {
      case "title":
        return <EditableTitleSlide slide={slide} onUpdate={onUpdate} accentHex={accentHex} />;
      case "cta":
        return <EditableCtaSlide slide={slide} onUpdate={onUpdate} />;
      case "content":
        return <EditableContentSlide slide={slide} onUpdate={onUpdate} />;
      case "stats":
        return <EditableStatsSlide slide={slide} onUpdate={onUpdate} />;
      case "comparison":
        return <EditableComparisonSlide slide={slide} onUpdate={onUpdate} accentHex={accentHex} />;
      case "chart":
        return <EditableChartSlide slide={slide} onUpdate={onUpdate} {...blockProps} />;
      case "metrics":
        return <EditableMetricsSlide slide={slide} onUpdate={onUpdate} {...blockProps} />;
      case "team":
        return <EditableTeamSlide slide={slide} onUpdate={onUpdate} {...blockProps} />;
      case "timeline":
        return <EditableTimelineSlide slide={slide} onUpdate={onUpdate} {...blockProps} />;
      default:
        return <EditableContentSlide slide={slide} onUpdate={onUpdate} />;
    }
  };

  return (
    <div
      className={`relative w-[1280px] h-[720px] overflow-hidden transition-shadow ${
        isSelected ? "shadow-2xl" : "shadow-xl"
      }`}
      style={themeVars(theme)}
      onClick={handleSlideClick}
    >
      {renderSlideContent()}
    </div>
  );
}
