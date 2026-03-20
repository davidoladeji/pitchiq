"use client";

import { useRef, useCallback, useState, useEffect, type KeyboardEvent } from "react";
import type { MetricBlockData } from "@/lib/editor/block-types";

interface MetricBlockV2Props {
  data: MetricBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<MetricBlockData>) => void;
}

/* ── InlineField (contentEditable span) ────────────────────────────── */

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
      className={`outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]/50 rounded transition-shadow ${className || ""}`}
    >
      {value}
    </span>
  );
}

/* ── Helpers ───────────────────────────────────────────────────────── */

/** Extract leading numeric value from a string like "$1,200,000" or "45000%" */
function parseNumericValue(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9.\-]/g, "");
  const n = parseFloat(cleaned);
  return Number.isFinite(n) ? n : null;
}

/** Returns true when the value string is purely numeric (ignoring commas/spaces) */
function isPurelyNumeric(raw: string): boolean {
  return /^\s*-?[\d,]+(\.\d+)?\s*$/.test(raw);
}

/** Compact-format large numbers: 1200000 → "1.2M" */
function formatCompact(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
}

/** Build SVG polyline points from sparkline data normalised to the viewBox */
function sparklinePoints(data: number[], width: number, height: number): string {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = width / Math.max(data.length - 1, 1);

  return data
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

/* ── useCountUp hook ───────────────────────────────────────────────── */

function useCountUp(target: number, enabled: boolean, duration = 1500): number {
  const [display, setDisplay] = useState(enabled ? 0 : target);
  const prevTarget = useRef(target);

  useEffect(() => {
    if (!enabled) {
      setDisplay(target);
      return;
    }

    // Animate when target changes or on mount
    const startVal = prevTarget.current !== target ? 0 : 0;
    prevTarget.current = target;

    let start: number | null = null;
    let rafId: number;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (ts: number) => {
      if (start === null) start = ts;
      const elapsed = ts - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      setDisplay(startVal + (target - startVal) * eased);
      if (progress < 1) {
        rafId = requestAnimationFrame(tick);
      }
    };

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [target, enabled, duration]);

  return display;
}

/* ── Component ─────────────────────────────────────────────────────── */

export default function MetricBlockV2({
  data,
  isSelected: _isSelected,
  onDataChange,
}: MetricBlockV2Props) {
  void _isSelected;

  /* Trend cycling */
  const cycleTrend = useCallback(() => {
    const cycle = { up: "down", down: "neutral", neutral: "up" } as const;
    const current = data.trend || "neutral";
    onDataChange({ trend: cycle[current] });
  }, [data.trend, onDataChange]);

  /* Trend visuals */
  const trendColor =
    data.trend === "up"
      ? "text-emerald-400"
      : data.trend === "down"
        ? "text-red-400"
        : "text-white/50";

  const trendArrow =
    data.trend === "up" ? "\u2191" : data.trend === "down" ? "\u2193" : "\u2192";

  /* Numeric parsing */
  const rawNumeric = parseNumericValue(data.value);
  const isNumeric = isPurelyNumeric(data.value);

  /* Count-up animation (hook always called, controlled by `enabled`) */
  const countUpEnabled = Boolean(data.animateCountUp && rawNumeric !== null);
  const animatedValue = useCountUp(rawNumeric ?? 0, countUpEnabled);

  /* Build displayed value */
  const displayValue = (() => {
    if (countUpEnabled) {
      const num = isNumeric ? formatCompact(animatedValue) : Math.round(animatedValue).toString();
      return `${data.prefix ?? ""}${num}${data.suffix ?? ""}`;
    }
    if (isNumeric && rawNumeric !== null) {
      return `${data.prefix ?? ""}${formatCompact(rawNumeric)}${data.suffix ?? ""}`;
    }
    return `${data.prefix ?? ""}${data.value}${data.suffix ?? ""}`;
  })();

  /* Target / progress */
  const progressPct =
    data.targetValue != null && rawNumeric !== null
      ? Math.min((rawNumeric / data.targetValue) * 100, 120)
      : null;

  const progressBarColor =
    progressPct !== null && progressPct >= 100 ? "#34d399" : "#4361EE";

  /* Sparkline */
  const hasSparkline =
    Array.isArray(data.sparklineData) && data.sparklineData.length > 1;

  return (
    <div
      className="w-full h-full rounded-xl p-4 md:p-6 flex flex-col justify-center"
      style={{
        background: "var(--t-card-bg, rgba(255,255,255,0.05))",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 0 0 1px rgba(255,255,255,0.04) inset",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Label */}
      <p className="text-xs uppercase tracking-wider font-semibold opacity-50 mb-1">
        <InlineField
          value={data.label}
          onChange={(v) => onDataChange({ label: v })}
        />
      </p>

      {/* Value + sparkline row */}
      <div className="flex items-center gap-3">
        <p
          className="text-2xl md:text-3xl font-bold tracking-tight"
          style={{ color: "var(--t-text, #fff)" }}
        >
          {countUpEnabled || (isNumeric && (data.prefix || data.suffix)) ? (
            <span>{displayValue}</span>
          ) : (
            <InlineField
              value={data.value}
              onChange={(v) => onDataChange({ value: v })}
            />
          )}
        </p>

        {hasSparkline && (
          <svg
            width={60}
            height={20}
            viewBox="0 0 60 20"
            className="shrink-0"
            aria-hidden="true"
          >
            <polyline
              points={sparklinePoints(data.sparklineData!, 60, 20)}
              fill="none"
              stroke="#4361EE"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>

      {/* Progress bar toward target */}
      {progressPct !== null && (
        <div
          className="w-full mt-2 rounded-full overflow-hidden"
          style={{
            height: 4,
            background: "rgba(255,255,255,0.1)",
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(progressPct, 100)}%`,
              background: progressBarColor,
            }}
          />
        </div>
      )}

      {/* Trend badge + change */}
      {data.change && (
        <div className="flex items-center gap-1 mt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              cycleTrend();
            }}
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
