"use client";

import { useRef, useCallback, useState, type KeyboardEvent } from "react";
import type { FunnelBlockData, FunnelStage } from "@/lib/editor/block-types";

interface FunnelBlockProps {
  data: FunnelBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<FunnelBlockData>) => void;
}

const PALETTE = ["#4361EE", "#7209B7", "#06D6A0", "#FF9F1C", "#F72585"];

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

function getColor(index: number, stage: FunnelStage): string {
  return stage.color || PALETTE[index % PALETTE.length];
}

function FunnelSVG({
  stages,
  showPercentages,
  showConversionRates,
  inverted,
}: {
  stages: FunnelStage[];
  showPercentages: boolean;
  showConversionRates: boolean;
  inverted: boolean;
}) {
  if (stages.length === 0) {
    return (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        <text x="200" y="150" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="14">
          No stages. Add stages below.
        </text>
      </svg>
    );
  }

  const baseValue = stages[0].value || 1;
  const stageCount = stages.length;
  const conversionSlotH = showConversionRates ? 16 : 0;
  const totalH = 280;
  const stageH = (totalH - conversionSlotH * Math.max(0, stageCount - 1)) / stageCount;
  const minWidth = 40;
  const maxWidth = 360;
  const cx = 200;

  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      {stages.map((stage, i) => {
        const ratio = baseValue > 0 ? stage.value / baseValue : 0;
        const nextRatio = i < stageCount - 1 && baseValue > 0
          ? stages[i + 1].value / baseValue
          : 0;

        let topW: number;
        let botW: number;

        if (inverted) {
          // Inverted: narrowest at top, widest at bottom
          topW = minWidth + (maxWidth - minWidth) * (i / Math.max(1, stageCount - 1));
          botW = minWidth + (maxWidth - minWidth) * ((i + 1) / Math.max(1, stageCount - 1));
          if (i === stageCount - 1) botW = topW;
        } else {
          // Normal funnel: widest at top proportional to value
          topW = minWidth + (maxWidth - minWidth) * ratio;
          botW = i < stageCount - 1
            ? minWidth + (maxWidth - minWidth) * nextRatio
            : minWidth;
        }

        const y = 10 + i * (stageH + conversionSlotH);
        const color = getColor(i, stage);

        const x1 = cx - topW / 2;
        const x2 = cx + topW / 2;
        const x3 = cx + botW / 2;
        const x4 = cx - botW / 2;

        const pct = baseValue > 0 ? Math.round((stage.value / baseValue) * 100) : 0;
        const convRate =
          showConversionRates && i < stageCount - 1 && stage.value > 0
            ? Math.round((stages[i + 1].value / stage.value) * 100)
            : null;

        const labelY = y + stageH / 2;
        const label = showPercentages
          ? `${stage.label} - ${stage.value} (${pct}%)`
          : `${stage.label} - ${stage.value}`;

        return (
          <g key={i}>
            <polygon
              points={`${x1},${y} ${x2},${y} ${x3},${y + stageH} ${x4},${y + stageH}`}
              fill={color}
              opacity={0.85}
            />
            <text
              x={cx}
              y={labelY + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#fff"
              fontSize="11"
              fontWeight="600"
            >
              {label}
            </text>
            {convRate !== null && (
              <text
                x={cx}
                y={y + stageH + conversionSlotH / 2 + 2}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.45)"
                fontSize="9"
              >
                {convRate}% conversion
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function ConcentricCirclesSVG({
  stages,
  showPercentages,
}: {
  stages: FunnelStage[];
  showPercentages: boolean;
}) {
  if (stages.length === 0) {
    return (
      <svg viewBox="0 0 400 300" className="w-full h-full">
        <text x="200" y="150" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="14">
          No stages. Add stages below.
        </text>
      </svg>
    );
  }

  const cx = 200;
  const cy = 150;
  const maxR = 130;
  const minR = 30;
  const stageCount = stages.length;
  const baseValue = stages[0].value || 1;

  return (
    <svg viewBox="0 0 400 300" className="w-full h-full">
      {stages.map((stage, i) => {
        const r = maxR - ((maxR - minR) * i) / Math.max(1, stageCount - 1);
        const color = getColor(i, stage);
        const pct = baseValue > 0 ? Math.round((stage.value / baseValue) * 100) : 0;
        const labelX = cx + r + 4;
        const label = showPercentages
          ? `${stage.label} (${pct}%)`
          : stage.label;

        return (
          <g key={i}>
            <circle cx={cx} cy={cy} r={r} fill={color} opacity={0.25} stroke={color} strokeWidth={2} />
            <text
              x={labelX}
              y={cy - r + 14}
              fill={color}
              fontSize="10"
              fontWeight="600"
            >
              {label}
            </text>
          </g>
        );
      })}
      {/* Center value label */}
      <text
        x={cx}
        y={cy - 6}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#fff"
        fontSize="14"
        fontWeight="700"
      >
        {stages[stages.length - 1].label}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="rgba(255,255,255,0.6)"
        fontSize="11"
      >
        {stages[stages.length - 1].value}
      </text>
    </svg>
  );
}

export default function FunnelBlock({
  data,
  isSelected,
  onDataChange,
}: FunnelBlockProps) {
  const [isEditing, setIsEditing] = useState(false);

  const updateStage = useCallback(
    (index: number, field: "label" | "value", val: string) => {
      const newStages = [...data.stages];
      if (field === "value") {
        newStages[index] = { ...newStages[index], value: parseFloat(val) || 0 };
      } else {
        newStages[index] = { ...newStages[index], label: val };
      }
      onDataChange({ stages: newStages });
    },
    [data.stages, onDataChange]
  );

  const addStage = useCallback(() => {
    const newStage: FunnelStage = {
      label: `Stage ${data.stages.length + 1}`,
      value: 0,
    };
    onDataChange({ stages: [...data.stages, newStage] });
  }, [data.stages, onDataChange]);

  const removeStage = useCallback(
    (index: number) => {
      onDataChange({ stages: data.stages.filter((_, i) => i !== index) });
    },
    [data.stages, onDataChange]
  );

  const togglePercentages = useCallback(() => {
    onDataChange({ showPercentages: !data.showPercentages });
  }, [data.showPercentages, onDataChange]);

  const toggleConversionRates = useCallback(() => {
    onDataChange({ showConversionRates: !data.showConversionRates });
  }, [data.showConversionRates, onDataChange]);

  const renderVisualization = () => {
    if (data.variant === "concentric-circles") {
      return (
        <ConcentricCirclesSVG
          stages={data.stages}
          showPercentages={data.showPercentages}
        />
      );
    }

    return (
      <FunnelSVG
        stages={data.stages}
        showPercentages={data.showPercentages}
        showConversionRates={data.showConversionRates}
        inverted={data.variant === "inverted-pyramid"}
      />
    );
  };

  return (
    <div className="w-full h-full rounded-xl overflow-hidden flex flex-col">
      <div className="flex-1 min-h-[200px] p-3">
        {renderVisualization()}
      </div>

      {isSelected && (
        <div className="border-t border-white/10 p-3 space-y-3">
          {/* Variant switcher */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-white/50 font-medium">Variant:</span>
            <div className="flex gap-1">
              {(["funnel", "inverted-pyramid", "concentric-circles"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDataChange({ variant: v }); }}
                  className={`px-2 py-1 text-xs rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE] ${
                    data.variant === v
                      ? "bg-[#4361EE] text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {v === "funnel" ? "Funnel" : v === "inverted-pyramid" ? "Inv. Pyramid" : "Circles"}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle options */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); togglePercentages(); }}
              className={`px-2 py-1 text-xs rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE] ${
                data.showPercentages
                  ? "bg-[#4361EE] text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              Percentages
            </button>
            {data.variant !== "concentric-circles" && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); toggleConversionRates(); }}
                className={`px-2 py-1 text-xs rounded-md transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE] ${
                  data.showConversionRates
                    ? "bg-[#4361EE] text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10"
                }`}
              >
                Conversion Rates
              </button>
            )}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }}
              className="ml-auto px-2 py-1 text-xs rounded-md bg-white/5 text-white/60 hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE]"
            >
              {isEditing ? "Hide Data" : "Edit Data"}
            </button>
          </div>

          {/* Stage editor */}
          {isEditing && (
            <div className="space-y-1.5">
              <div className="grid grid-cols-[1fr_80px_32px] gap-1.5 text-xs text-white/40 font-medium px-1">
                <span>Label</span><span>Value</span><span />
              </div>
              {data.stages.map((stage, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_32px] gap-1.5">
                  <span className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white flex items-center">
                    <InlineField
                      value={stage.label}
                      onChange={(v) => updateStage(i, "label", v)}
                      className="flex-1"
                    />
                  </span>
                  <input
                    type="number"
                    value={stage.value}
                    onChange={(e) => updateStage(i, "value", e.target.value)}
                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeStage(i); }}
                    className="w-7 h-7 flex items-center justify-center rounded text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE]"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); addStage(); }}
                className="w-full py-1.5 text-xs text-white/40 hover:text-white/60 border border-dashed border-white/10 hover:border-white/20 rounded transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE]"
              >
                + Add Stage
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
