"use client";

import { useRef, useState, useCallback, type KeyboardEvent } from "react";

interface MetricBlockProps {
  content: string;
  properties: Record<string, unknown>;
  isSelected: boolean;
  onUpdate: (content: string, properties?: Record<string, unknown>) => void;
  onSelect: () => void;
}

function EditableField({
  value,
  onChange,
  className,
  style,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [focused, setFocused] = useState(false);

  const handleBlur = useCallback(() => {
    setFocused(false);
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
      onFocus={() => setFocused(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`outline-none transition-shadow rounded ${
        focused ? "ring-2 ring-electric/50" : ""
      } ${className || ""}`}
      style={style}
      data-placeholder={placeholder}
    >
      {value}
    </span>
  );
}

export default function MetricBlock({
  content,
  properties,
  isSelected,
  onUpdate,
  onSelect,
}: MetricBlockProps) {
  const value = (properties.value as string) || "0";
  const label = (properties.label as string) || content;
  const change = (properties.change as string) || "";
  const trend = (properties.trend as string) || "neutral";

  const handleFieldUpdate = useCallback(
    (field: string, fieldValue: string) => {
      const newProps = { ...properties, [field]: fieldValue };
      const newContent = field === "label" ? fieldValue : content;
      onUpdate(newContent, newProps);
    },
    [properties, content, onUpdate]
  );

  const cycleTrend = useCallback(() => {
    const cycle = { up: "down", down: "neutral", neutral: "up" } as const;
    const next = cycle[trend as keyof typeof cycle] || "up";
    onUpdate(content, { ...properties, trend: next });
  }, [trend, content, properties, onUpdate]);

  const trendColor =
    trend === "up"
      ? "text-emerald-400"
      : trend === "down"
      ? "text-red-400"
      : "text-white/50";

  const trendArrow =
    trend === "up" ? "\u2191" : trend === "down" ? "\u2193" : "\u2192";

  return (
    <div
      className={`relative group transition-all rounded-xl p-4 md:p-6 flex flex-col justify-center ${
        isSelected
          ? "ring-2 ring-electric ring-offset-2"
          : "hover:ring-1 hover:ring-white/20"
      }`}
      style={{
        background: "var(--t-card-bg, rgba(255,255,255,0.05))",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
      onClick={onSelect}
    >
      <p className="text-xs md:text-sm uppercase tracking-wider font-semibold opacity-50 mb-1">
        <EditableField
          value={label}
          onChange={(v) => handleFieldUpdate("label", v)}
          placeholder="Metric Label"
        />
      </p>
      <p className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight" style={{ color: "var(--t-text, #fff)" }}>
        <EditableField
          value={value}
          onChange={(v) => handleFieldUpdate("value", v)}
          placeholder="0"
        />
      </p>
      {change && (
        <div className="flex items-center gap-1 mt-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              cycleTrend();
            }}
            className={`text-xs md:text-sm font-semibold ${trendColor} hover:opacity-80 transition-opacity`}
            title="Click to cycle trend direction"
          >
            {trendArrow}
          </button>
          <span className={`text-xs md:text-sm font-semibold ${trendColor}`}>
            <EditableField
              value={change}
              onChange={(v) => handleFieldUpdate("change", v)}
              placeholder="+0%"
            />
          </span>
        </div>
      )}
    </div>
  );
}
