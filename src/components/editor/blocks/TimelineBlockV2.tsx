"use client";

import { useRef, useCallback, type KeyboardEvent } from "react";
import type { TimelineItemBlockData } from "@/lib/editor/block-types";
import { ELECTRIC_HEX, EMERALD_HEX } from "@/lib/design-tokens";

interface TimelineBlockV2Props {
  data: TimelineItemBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<TimelineItemBlockData>) => void;
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
  const handleBlur = useCallback(() => { onChange(ref.current?.textContent || ""); }, [onChange]);
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLElement).blur(); }
  }, []);

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]/50 rounded transition-shadow ${className || ""}`}
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

export default function TimelineBlockV2({
  data,
  isSelected,
  onDataChange,
}: TimelineBlockV2Props) {
  const accentHex = ELECTRIC_HEX;

  return (
    <div className="w-full h-full flex items-start gap-4 p-2">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDataChange({ completed: !data.completed });
        }}
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 transition-colors cursor-pointer"
        style={{
          borderWidth: "2px",
          borderStyle: "solid",
          borderColor: data.completed ? EMERALD_HEX : accentHex,
          background: data.completed ? hexToRgba(EMERALD_HEX, 0.1) : hexToRgba(accentHex, 0.1),
        }}
        title={data.completed ? "Mark incomplete" : "Mark completed"}
      >
        {data.completed ? (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={EMERALD_HEX} strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: accentHex }} />
        )}
      </button>

      <div className="pt-1 min-w-0 flex-1">
        <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: accentHex }}>
          <InlineEdit
            value={data.date}
            onChange={(v) => onDataChange({ date: v })}
          />
        </p>
        <p className="font-bold text-sm">
          <InlineEdit
            value={data.title}
            onChange={(v) => onDataChange({ title: v })}
          />
        </p>
        {(data.description || isSelected) && (
          <p className="text-xs opacity-60 mt-0.5">
            <InlineEdit
              value={data.description || ""}
              onChange={(v) => onDataChange({ description: v })}
            />
          </p>
        )}
      </div>
    </div>
  );
}
