"use client";

import { useRef, useCallback, type KeyboardEvent } from "react";
import type { MetricBlockData } from "@/lib/editor/block-types";

interface MetricBlockV2Props {
  data: MetricBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<MetricBlockData>) => void;
}

function InlineField({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const handleBlur = useCallback(() => {
    onChange(ref.current?.textContent || "");
  }, [onChange]);
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
    >
      {value}
    </span>
  );
}

export default function MetricBlockV2({
  data,
  isSelected: _isSelected,
  onDataChange,
}: MetricBlockV2Props) {
  void _isSelected;
  const cycleTrend = useCallback(() => {
    const cycle = { up: "down", down: "neutral", neutral: "up" } as const;
    const current = data.trend || "neutral";
    onDataChange({ trend: cycle[current] });
  }, [data.trend, onDataChange]);

  const trendColor =
    data.trend === "up" ? "text-emerald-400" :
    data.trend === "down" ? "text-red-400" :
    "text-white/50";

  const trendArrow =
    data.trend === "up" ? "\u2191" :
    data.trend === "down" ? "\u2193" :
    "\u2192";

  return (
    <div
      className="w-full h-full rounded-xl p-4 md:p-6 flex flex-col justify-center"
      style={{
        background: "var(--t-card-bg, rgba(255,255,255,0.05))",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <p className="text-xs uppercase tracking-wider font-semibold opacity-50 mb-1">
        <InlineField
          value={data.label}
          onChange={(v) => onDataChange({ label: v })}
        />
      </p>
      <p className="text-2xl md:text-3xl font-bold tracking-tight" style={{ color: "var(--t-text, #fff)" }}>
        <InlineField
          value={data.value}
          onChange={(v) => onDataChange({ value: v })}
        />
      </p>
      {data.change && (
        <div className="flex items-center gap-1 mt-1">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); cycleTrend(); }}
            className={`text-xs font-semibold ${trendColor} hover:opacity-80 transition-opacity`}
            title="Click to cycle trend"
          >
            {trendArrow}
          </button>
          <span className={`text-xs font-semibold ${trendColor}`}>
            <InlineField
              value={data.change}
              onChange={(v) => onDataChange({ change: v })}
            />
          </span>
        </div>
      )}
    </div>
  );
}
