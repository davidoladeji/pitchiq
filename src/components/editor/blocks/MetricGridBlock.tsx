"use client";

import { useRef, useCallback, useMemo, type KeyboardEvent } from "react";
import type { MetricGridBlockData } from "@/lib/editor/block-types";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface MetricGridBlockProps {
  data: MetricGridBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<MetricGridBlockData>) => void;
}

type SingleMetric = MetricGridBlockData["metrics"][number];

/* ------------------------------------------------------------------ */
/*  InlineField                                                        */
/* ------------------------------------------------------------------ */

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

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatValue(raw: string, prefix?: string, suffix?: string): string {
  const num = Number(raw.replace(/[^0-9.\-]/g, ""));
  if (Number.isNaN(num)) return `${prefix || ""}${raw}${suffix || ""}`;
  const formatted = new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(num);
  return `${prefix || ""}${formatted}${suffix || ""}`;
}

function getGridColumns(count: number): string {
  if (count <= 1) return "1fr";
  if (count === 2) return "repeat(2, 1fr)";
  if (count === 3) return "repeat(3, 1fr)";
  if (count === 4) return "repeat(2, 1fr)";
  if (count === 5) return "repeat(3, 1fr)";
  return "repeat(3, 1fr)";
}

function trendColor(trend?: "up" | "down" | "neutral"): string {
  if (trend === "up") return "text-emerald-400";
  if (trend === "down") return "text-red-400";
  return "text-white/50";
}

function trendArrow(trend?: "up" | "down" | "neutral"): string {
  if (trend === "up") return "\u2191";
  if (trend === "down") return "\u2193";
  return "\u2192";
}

/* ------------------------------------------------------------------ */
/*  Sparkline SVG                                                      */
/* ------------------------------------------------------------------ */

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const w = 50;
  const h = 16;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="inline-block align-middle">
      <polyline
        points={points}
        fill="none"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Target Progress Bar                                                */
/* ------------------------------------------------------------------ */

function TargetBar({ current, target }: { current: string; target: number }) {
  const num = Number(current.replace(/[^0-9.\-]/g, ""));
  const pct = Number.isNaN(num) || target === 0 ? 0 : Math.min(100, (num / target) * 100);

  return (
    <div className="mt-2 w-full h-[3px] rounded-full" style={{ background: "rgba(255,255,255,0.1)" }}>
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${pct}%`,
          background: pct >= 100 ? "#06D6A0" : "#4361EE",
        }}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Single Metric Card                                                 */
/* ------------------------------------------------------------------ */

function MetricCard({
  metric,
  index,
  variant,
  large,
  onFieldChange,
  onCycleTrend,
  onRemove,
}: {
  metric: SingleMetric;
  index: number;
  variant: MetricGridBlockData["variant"];
  large?: boolean;
  onFieldChange: (idx: number, field: keyof SingleMetric, value: string) => void;
  onCycleTrend: (idx: number) => void;
  onRemove: (idx: number) => void;
}) {
  const isCards = variant === "cards" || (variant === "featured" && large);
  const valueSizeClass = large ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl";

  const wrapperStyle: React.CSSProperties = isCards
    ? {
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "0.75rem",
        padding: "1rem 1.25rem",
      }
    : {};

  const formattedDisplay = formatValue(metric.value, metric.prefix, metric.suffix);

  return (
    <div className="relative group" style={wrapperStyle}>
      {/* Remove button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(index);
        }}
        className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded text-white/30 hover:text-white/80 hover:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity text-xs focus-visible:ring-2 focus-visible:ring-[#4361EE]"
        title="Remove metric"
      >
        &times;
      </button>

      {/* Label */}
      <p className="text-xs uppercase tracking-wider font-semibold text-white/50 mb-1">
        <InlineField
          value={metric.label}
          onChange={(v) => onFieldChange(index, "label", v)}
        />
      </p>

      {/* Value row */}
      <div className="flex items-center gap-2">
        <p className={`${valueSizeClass} font-bold tracking-tight text-white`}>
          <InlineField
            value={metric.value}
            onChange={(v) => onFieldChange(index, "value", v)}
          />
        </p>
        {metric.sparklineData && metric.sparklineData.length > 1 && (
          <Sparkline data={metric.sparklineData} />
        )}
      </div>

      {/* Formatted preview */}
      {(metric.prefix || metric.suffix) && (
        <p className="text-[10px] text-white/30 mt-0.5">{formattedDisplay}</p>
      )}

      {/* Change + trend */}
      {metric.change && (
        <div className="flex items-center gap-1 mt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCycleTrend(index);
            }}
            className={`text-xs font-semibold ${trendColor(metric.trend)} hover:opacity-80 transition-opacity focus-visible:ring-2 focus-visible:ring-[#4361EE]`}
            title="Click to cycle trend"
          >
            {trendArrow(metric.trend)}
          </button>
          <span className={`text-xs font-semibold ${trendColor(metric.trend)}`}>
            <InlineField
              value={metric.change}
              onChange={(v) => onFieldChange(index, "change", v)}
            />
          </span>
        </div>
      )}

      {/* Target progress */}
      {metric.targetValue != null && (
        <TargetBar current={metric.value} target={metric.targetValue} />
      )}

      {/* Minimal variant: bottom divider */}
      {variant === "minimal" && (
        <div
          className="mt-3"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function MetricGridBlock({
  data,
  isSelected: _isSelected,
  onDataChange,
}: MetricGridBlockProps) {
  void _isSelected;

  const { metrics, variant } = data;

  const updateMetric = useCallback(
    (idx: number, field: keyof SingleMetric, value: string) => {
      const next = metrics.map((m, i) => (i === idx ? { ...m, [field]: value } : m));
      onDataChange({ metrics: next });
    },
    [metrics, onDataChange],
  );

  const cycleTrend = useCallback(
    (idx: number) => {
      const cycle = { up: "down", down: "neutral", neutral: "up" } as const;
      const current = metrics[idx].trend || "neutral";
      const next = metrics.map((m, i) =>
        i === idx ? { ...m, trend: cycle[current] } : m,
      );
      onDataChange({ metrics: next });
    },
    [metrics, onDataChange],
  );

  const removeMetric = useCallback(
    (idx: number) => {
      if (metrics.length <= 1) return;
      const next = metrics.filter((_, i) => i !== idx);
      onDataChange({ metrics: next });
    },
    [metrics, onDataChange],
  );

  const addMetric = useCallback(() => {
    const next = [
      ...metrics,
      { label: "New Metric", value: "0", trend: "neutral" as const },
    ];
    onDataChange({ metrics: next });
  }, [metrics, onDataChange]);

  const gridStyle = useMemo((): React.CSSProperties => {
    if (variant === "featured") {
      return {
        display: "grid",
        gridTemplateColumns: metrics.length > 2 ? getGridColumns(metrics.length - 1) : "1fr",
        gap: "0.75rem",
      };
    }
    return {
      display: "grid",
      gridTemplateColumns: getGridColumns(metrics.length),
      gap: "0.75rem",
    };
  }, [variant, metrics.length]);

  return (
    <div className="w-full h-full flex flex-col gap-3">
      {/* Featured: first metric full-width */}
      {variant === "featured" && metrics.length > 0 && (
        <MetricCard
          metric={metrics[0]}
          index={0}
          variant={variant}
          large
          onFieldChange={updateMetric}
          onCycleTrend={cycleTrend}
          onRemove={removeMetric}
        />
      )}

      {/* Grid */}
      <div style={gridStyle}>
        {(variant === "featured" ? metrics.slice(1) : metrics).map((m, i) => {
          const realIndex = variant === "featured" ? i + 1 : i;
          return (
            <MetricCard
              key={realIndex}
              metric={m}
              index={realIndex}
              variant={variant}
              onFieldChange={updateMetric}
              onCycleTrend={cycleTrend}
              onRemove={removeMetric}
            />
          );
        })}
      </div>

      {/* Add metric */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          addMetric();
        }}
        className="self-center mt-1 px-3 py-1 text-xs text-white/40 hover:text-white/70 rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE]"
        style={{ background: "rgba(255,255,255,0.05)" }}
      >
        + Add Metric
      </button>
    </div>
  );
}
