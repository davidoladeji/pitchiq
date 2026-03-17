"use client";

import { useRef, useCallback, type KeyboardEvent } from "react";
import { ELECTRIC_HEX, EMERALD_HEX } from "@/lib/design-tokens";

interface TimelineBlockProps {
  content: string;
  properties: Record<string, unknown>;
  isSelected: boolean;
  onUpdate: (content: string, properties?: Record<string, unknown>) => void;
  onSelect: () => void;
  accentHex?: string;
}

function InlineEdit({
  value,
  onChange,
  className,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  const handleBlur = useCallback(() => {
    onChange(ref.current?.textContent || "");
  }, [onChange]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      (e.target as HTMLElement).blur();
    }
  }, []);

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 rounded transition-shadow ${className || ""}`}
      style={style}
    >
      {value}
    </span>
  );
}

function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export default function TimelineBlock({
  content,
  properties,
  isSelected,
  onUpdate,
  onSelect,
  accentHex = ELECTRIC_HEX,
}: TimelineBlockProps) {
  const date = (properties.date as string) || "Q1 2026";
  const title = (properties.title as string) || content || "Milestone";
  const description = (properties.description as string) || "";
  const completed = !!(properties.completed as boolean);

  const handleFieldUpdate = useCallback(
    (field: string, value: string | boolean) => {
      const newProps = { ...properties, [field]: value };
      const newContent = field === "title" ? (value as string) : content;
      onUpdate(newContent, newProps);
    },
    [properties, content, onUpdate]
  );

  const toggleCompleted = useCallback(() => {
    handleFieldUpdate("completed", !completed);
  }, [completed, handleFieldUpdate]);

  return (
    <div
      className={`relative group flex items-start gap-4 transition-all rounded-lg p-2 ${
        isSelected
          ? "ring-2 ring-electric ring-offset-2"
          : "hover:ring-1 hover:ring-white/20"
      }`}
      onClick={onSelect}
    >
      {/* Timeline dot */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          toggleCompleted();
        }}
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors cursor-pointer"
        style={{
          borderWidth: "2px",
          borderStyle: "solid",
          borderColor: completed ? EMERALD_HEX : accentHex,
          background: completed ? hexToRgba(EMERALD_HEX, 0.1) : hexToRgba(accentHex, 0.1),
        }}
        title={completed ? "Mark as incomplete" : "Mark as completed"}
      >
        {completed ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={EMERALD_HEX} strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: accentHex }} />
        )}
      </button>

      {/* Content */}
      <div className="pt-1 min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: accentHex }}>
          <InlineEdit
            value={date}
            onChange={(v) => handleFieldUpdate("date", v)}
          />
        </p>
        <p className="font-bold text-sm md:text-base">
          <InlineEdit
            value={title}
            onChange={(v) => handleFieldUpdate("title", v)}
          />
        </p>
        {(description || isSelected) && (
          <p className="text-xs md:text-sm opacity-60 mt-0.5">
            <InlineEdit
              value={description}
              onChange={(v) => handleFieldUpdate("description", v)}
            />
          </p>
        )}
      </div>
    </div>
  );
}
