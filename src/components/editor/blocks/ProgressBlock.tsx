"use client";

import { useRef, useCallback, useState, type KeyboardEvent } from "react";
import type {
  ProgressBlockData,
  ProgressMilestone,
} from "@/lib/editor/block-types";

/* ── Props ─────────────────────────────────────────────────────────── */

interface ProgressBlockProps {
  data: ProgressBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<ProgressBlockData>) => void;
}

/* ── InlineField ───────────────────────────────────────────────────── */

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

/* ── Helpers ────────────────────────────────────────────────────────── */

function fillColor(data: ProgressBlockData): string {
  if (data.value >= data.target) return "#06D6A0";
  return data.color || "#4361EE";
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

/* ── Sub-components ─────────────────────────────────────────────────── */

function MilestoneMarkers({
  milestones,
}: {
  milestones: ProgressMilestone[];
}) {
  return (
    <>
      {milestones.map((m, i) => (
        <div
          key={i}
          className="absolute flex flex-col items-center"
          style={{ left: `${clamp(m.position, 0, 100)}%`, top: -4 }}
        >
          <div
            className="bg-white/60"
            style={{ width: 2, height: 20 }}
          />
          <span className="text-[10px] text-white/40 mt-0.5 whitespace-nowrap">
            {m.label}
          </span>
        </div>
      ))}
    </>
  );
}

/* ── Bar Format ─────────────────────────────────────────────────────── */

function BarFormat({ data }: { data: ProgressBlockData }) {
  const color = fillColor(data);
  const pct = clamp(data.value, 0, 100);

  return (
    <div className="w-full">
      {/* Percentage above */}
      <p className="text-center text-sm font-semibold text-white/70 mb-1">
        {Math.round(pct)}%
      </p>

      {/* Bar track */}
      <div className="relative">
        <div
          className="w-full rounded-full overflow-hidden"
          style={{ height: 12, background: "rgba(255,255,255,0.1)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              width: `${pct}%`,
              background: color,
              transition: "width 0.6s ease",
            }}
          />
        </div>

        {/* Milestones */}
        <MilestoneMarkers milestones={data.milestones} />
      </div>
    </div>
  );
}

/* ── Radial Format ──────────────────────────────────────────────────── */

function RadialFormat({ data }: { data: ProgressBlockData }) {
  const color = fillColor(data);
  const pct = clamp(data.value, 0, 100);
  const size = 120;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Progress ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
      </svg>

      {/* Center percentage (positioned over the SVG) */}
      <div
        className="flex items-center justify-center font-bold text-2xl text-white"
        style={{ marginTop: -((size + strokeWidth) / 2 + 12), height: size }}
      >
        {Math.round(pct)}%
      </div>
    </div>
  );
}

/* ── Stepped Format ─────────────────────────────────────────────────── */

function SteppedFormat({ data }: { data: ProgressBlockData }) {
  const color = fillColor(data);
  const totalSteps = data.steps || 5;
  const pct = clamp(data.value, 0, 100);
  const filledSteps = Math.round((pct / 100) * totalSteps);

  return (
    <div className="w-full">
      <p className="text-center text-sm font-semibold text-white/70 mb-1">
        {Math.round(pct)}%
      </p>
      <div className="relative">
        <div className="flex gap-[2px]">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height: 12,
                background:
                  i < filledSteps ? color : "rgba(255,255,255,0.1)",
                transition: "background 0.4s ease",
              }}
            />
          ))}
        </div>

        {/* Milestones */}
        <MilestoneMarkers milestones={data.milestones} />
      </div>
    </div>
  );
}

/* ── Editing toolbar ────────────────────────────────────────────────── */

function EditToolbar({
  data,
  onDataChange,
  editingValue,
  setEditingValue,
}: {
  data: ProgressBlockData;
  onDataChange: (patch: Partial<ProgressBlockData>) => void;
  editingValue: boolean;
  setEditingValue: (v: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleValueCommit = useCallback(() => {
    const raw = inputRef.current?.value ?? "";
    const n = parseInt(raw, 10);
    if (Number.isFinite(n)) {
      onDataChange({ value: clamp(n, 0, 100) });
    }
    setEditingValue(false);
  }, [onDataChange, setEditingValue]);

  const addMilestone = useCallback(() => {
    const next: ProgressMilestone = { label: "New", position: 50 };
    onDataChange({ milestones: [...data.milestones, next] });
  }, [data.milestones, onDataChange]);

  const removeLast = useCallback(() => {
    if (data.milestones.length === 0) return;
    onDataChange({ milestones: data.milestones.slice(0, -1) });
  }, [data.milestones, onDataChange]);

  const formats: Array<ProgressBlockData["format"]> = [
    "bar",
    "radial",
    "stepped",
  ];

  return (
    <div
      className="flex flex-wrap items-center gap-2 mt-3 pt-3"
      style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
    >
      {/* Format switcher */}
      {formats.map((f) => (
        <button
          key={f}
          type="button"
          onClick={() => onDataChange({ format: f })}
          className={`px-2 py-0.5 text-xs rounded font-medium transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE] ${
            data.format === f
              ? "bg-[#4361EE] text-white"
              : "bg-white/10 text-white/60 hover:bg-white/20"
          }`}
        >
          {f}
        </button>
      ))}

      {/* Value editor */}
      {editingValue ? (
        <input
          ref={inputRef}
          type="number"
          min={0}
          max={100}
          defaultValue={data.value}
          autoFocus
          onBlur={handleValueCommit}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleValueCommit();
          }}
          className="w-16 px-1.5 py-0.5 text-xs rounded bg-white/10 text-white outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
        />
      ) : (
        <button
          type="button"
          onClick={() => setEditingValue(true)}
          className="px-2 py-0.5 text-xs rounded bg-white/10 text-white/60 hover:bg-white/20 transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE]"
        >
          {Math.round(data.value)}%
        </button>
      )}

      {/* Milestone controls */}
      <button
        type="button"
        onClick={addMilestone}
        className="px-2 py-0.5 text-xs rounded bg-white/10 text-white/60 hover:bg-white/20 transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE]"
      >
        + Milestone
      </button>
      {data.milestones.length > 0 && (
        <button
          type="button"
          onClick={removeLast}
          className="px-2 py-0.5 text-xs rounded bg-white/10 text-white/60 hover:bg-white/20 transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE]"
        >
          - Milestone
        </button>
      )}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────────────── */

export default function ProgressBlock({
  data,
  isSelected,
  onDataChange,
}: ProgressBlockProps) {
  const [editingValue, setEditingValue] = useState(false);

  return (
    <div
      className="w-full h-full rounded-xl p-4 md:p-6 flex flex-col justify-center"
      style={{
        background: "var(--t-card-bg, rgba(255,255,255,0.05))",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      {/* Label */}
      {data.showLabel && (
        <p className="text-xs uppercase tracking-wider font-semibold text-white/50 mb-2">
          <InlineField
            value={data.label}
            onChange={(v) => onDataChange({ label: v })}
          />
        </p>
      )}

      {/* Format renderer */}
      {data.format === "bar" && <BarFormat data={data} />}
      {data.format === "radial" && <RadialFormat data={data} />}
      {data.format === "stepped" && <SteppedFormat data={data} />}

      {/* Editing toolbar (visible when selected) */}
      {isSelected && (
        <EditToolbar
          data={data}
          onDataChange={onDataChange}
          editingValue={editingValue}
          setEditingValue={setEditingValue}
        />
      )}
    </div>
  );
}
