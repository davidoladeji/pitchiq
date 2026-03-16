"use client";

import { useState, useCallback } from "react";
import type { ChartDataPoint } from "@/lib/types";
import { CHART_COLORS, ELECTRIC_HEX } from "@/lib/design-tokens";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface ChartBlockProps {
  content: string;
  properties: Record<string, unknown>;
  isSelected: boolean;
  onUpdate: (content: string, properties?: Record<string, unknown>) => void;
  onSelect: () => void;
}

type ChartType = "bar" | "pie" | "line" | "area";

const CHART_TYPE_OPTIONS: { value: ChartType; label: string }[] = [
  { value: "bar", label: "Bar" },
  { value: "pie", label: "Pie" },
  { value: "line", label: "Line" },
  { value: "area", label: "Area" },
];

export default function ChartBlock({
  content,
  properties,
  isSelected,
  onUpdate,
  onSelect,
}: ChartBlockProps) {
  const chartType = (properties.chartType as ChartType) || "bar";
  const data = (properties.data as ChartDataPoint[]) || [];
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const yAxisLabel = (properties.yAxisLabel as string) || "";
  const [isEditing, setIsEditing] = useState(false);

  const handleChartTypeChange = useCallback(
    (newType: ChartType) => {
      onUpdate(content, { ...properties, chartType: newType });
    },
    [content, properties, onUpdate]
  );

  const handleDataChange = useCallback(
    (index: number, field: "label" | "value", val: string) => {
      const newData = [...data];
      if (field === "value") {
        newData[index] = { ...newData[index], value: parseFloat(val) || 0 };
      } else {
        newData[index] = { ...newData[index], label: val };
      }
      onUpdate(content, { ...properties, data: newData });
    },
    [content, data, properties, onUpdate]
  );

  const addRow = useCallback(() => {
    const newData = [...data, { label: `Item ${data.length + 1}`, value: 0 }];
    onUpdate(content, { ...properties, data: newData });
  }, [content, data, properties, onUpdate]);

  const removeRow = useCallback(
    (index: number) => {
      const newData = data.filter((_, i) => i !== index);
      onUpdate(content, { ...properties, data: newData });
    },
    [content, data, properties, onUpdate]
  );

  const tickStyle = { fill: "rgba(255,255,255,0.6)", fontSize: 11 };
  const gridStroke = "rgba(255,255,255,0.1)";
  const tooltipStyle = {
    background: "rgba(15,23,42,0.95)",
    border: "1px solid rgba(128,128,128,0.2)",
    borderRadius: "8px",
    color: "#fff",
    fontSize: "12px",
  };

  const renderChart = () => {
    if (!data.length) {
      return (
        <div className="flex items-center justify-center h-full text-white/30 text-sm">
          No data yet. Add rows below.
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        {chartType === "pie" ? (
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius="70%"
              innerRadius="40%"
              paddingAngle={3}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        ) : chartType === "line" ? (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="label" tick={tickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="value" stroke={ELECTRIC_HEX} strokeWidth={3} dot={{ fill: ELECTRIC_HEX, r: 4 }} />
          </LineChart>
        ) : chartType === "area" ? (
          <AreaChart data={data}>
            <defs>
              <linearGradient id="editorAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ELECTRIC_HEX} stopOpacity={0.3} />
                <stop offset="95%" stopColor={ELECTRIC_HEX} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="label" tick={tickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="value" stroke={ELECTRIC_HEX} strokeWidth={3} fill="url(#editorAreaGrad)" />
          </AreaChart>
        ) : (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="label" tick={tickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    );
  };

  return (
    <div
      className={`relative group transition-all rounded-xl overflow-hidden ${
        isSelected
          ? "ring-2 ring-electric ring-offset-2"
          : "hover:ring-1 hover:ring-white/20"
      }`}
      onClick={onSelect}
    >
      {/* Chart preview */}
      <div className="h-[280px] p-4">{renderChart()}</div>

      {/* Controls */}
      {isSelected && (
        <div className="border-t border-white/10 p-3 space-y-3">
          {/* Chart type selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50 font-medium">Type:</span>
            <div className="flex gap-1">
              {CHART_TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleChartTypeChange(opt.value);
                  }}
                  className={`px-2.5 py-1 text-xs rounded-md transition-colors ${
                    chartType === opt.value
                      ? "bg-electric text-white"
                      : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditing(!isEditing);
              }}
              className="ml-auto px-2.5 py-1 text-xs rounded-md bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
            >
              {isEditing ? "Hide Data" : "Edit Data"}
            </button>
          </div>

          {/* Data table */}
          {isEditing && (
            <div className="space-y-1.5">
              <div className="grid grid-cols-[1fr_80px_32px] gap-1.5 text-xs text-white/40 font-medium px-1">
                <span>Label</span>
                <span>Value</span>
                <span />
              </div>
              {data.map((row, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_32px] gap-1.5">
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => handleDataChange(i, "label", e.target.value)}
                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-electric/50"
                  />
                  <input
                    type="number"
                    value={row.value}
                    onChange={(e) => handleDataChange(i, "value", e.target.value)}
                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus:ring-1 focus:ring-electric/50"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRow(i);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950"
                    title="Remove row"
                    aria-label="Remove row"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addRow();
                }}
                className="w-full py-1.5 text-xs text-white/40 hover:text-white/60 border border-dashed border-white/10 hover:border-white/20 rounded transition-colors"
              >
                + Add Row
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
