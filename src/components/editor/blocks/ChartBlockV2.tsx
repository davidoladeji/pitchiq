"use client";

import { useState, useCallback } from "react";
import type { ChartBlockData } from "@/lib/editor/block-types";
import { CHART_COLORS, ELECTRIC_HEX } from "@/lib/design-tokens";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

interface ChartBlockV2Props {
  data: ChartBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<ChartBlockData>) => void;
}

type ChartType = ChartBlockData["chartType"];

export default function ChartBlockV2({
  data,
  isSelected,
  onDataChange,
}: ChartBlockV2Props) {
  const [isEditing, setIsEditing] = useState(false);

  const handleDataChange = useCallback(
    (index: number, field: "label" | "value", val: string) => {
      const newData = [...data.data];
      if (field === "value") {
        newData[index] = { ...newData[index], value: parseFloat(val) || 0 };
      } else {
        newData[index] = { ...newData[index], label: val };
      }
      onDataChange({ data: newData });
    },
    [data.data, onDataChange]
  );

  const addRow = useCallback(() => {
    onDataChange({ data: [...data.data, { label: `Item ${data.data.length + 1}`, value: 0 }] });
  }, [data.data, onDataChange]);

  const removeRow = useCallback(
    (index: number) => {
      onDataChange({ data: data.data.filter((_, i) => i !== index) });
    },
    [data.data, onDataChange]
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
    if (!data.data.length) {
      return (
        <div className="flex items-center justify-center h-full text-white/30 text-sm">
          No data. Add rows below.
        </div>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        {data.chartType === "pie" ? (
          <PieChart>
            <Pie data={data.data} dataKey="value" nameKey="label" cx="50%" cy="50%" outerRadius="70%" innerRadius="40%" paddingAngle={3}>
              {data.data.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
            </Pie>
            <Tooltip contentStyle={tooltipStyle} />
          </PieChart>
        ) : data.chartType === "line" ? (
          <LineChart data={data.data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="label" tick={tickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="value" stroke={ELECTRIC_HEX} strokeWidth={3} dot={{ fill: ELECTRIC_HEX, r: 4 }} />
          </LineChart>
        ) : data.chartType === "area" ? (
          <AreaChart data={data.data}>
            <defs>
              <linearGradient id="v2AreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ELECTRIC_HEX} stopOpacity={0.3} />
                <stop offset="95%" stopColor={ELECTRIC_HEX} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="label" tick={tickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Area type="monotone" dataKey="value" stroke={ELECTRIC_HEX} strokeWidth={3} fill="url(#v2AreaGrad)" />
          </AreaChart>
        ) : (
          <BarChart data={data.data}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="label" tick={tickStyle} axisLine={false} tickLine={false} />
            <YAxis tick={tickStyle} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {data.data.map((_, i) => (<Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />))}
            </Bar>
          </BarChart>
        )}
      </ResponsiveContainer>
    );
  };

  return (
    <div className="w-full h-full rounded-xl overflow-hidden flex flex-col">
      <div className="flex-1 min-h-[160px] p-3">{renderChart()}</div>

      {isSelected && (
        <div className="border-t border-white/10 p-3 space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/50 font-medium">Type:</span>
            <div className="flex gap-1">
              {(["bar", "pie", "line", "area"] as ChartType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onDataChange({ chartType: t }); }}
                  className={`px-2 py-1 text-xs rounded-md transition-colors ${
                    data.chartType === t ? "bg-[#4361EE] text-white" : "bg-white/5 text-white/60 hover:bg-white/10"
                  }`}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsEditing(!isEditing); }}
              className="ml-auto px-2 py-1 text-xs rounded-md bg-white/5 text-white/60 hover:bg-white/10 transition-colors"
            >
              {isEditing ? "Hide Data" : "Edit Data"}
            </button>
          </div>

          {isEditing && (
            <div className="space-y-1.5">
              <div className="grid grid-cols-[1fr_80px_32px] gap-1.5 text-xs text-white/40 font-medium px-1">
                <span>Label</span><span>Value</span><span />
              </div>
              {data.data.map((row, i) => (
                <div key={i} className="grid grid-cols-[1fr_80px_32px] gap-1.5">
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => handleDataChange(i, "label", e.target.value)}
                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
                  />
                  <input
                    type="number"
                    value={row.value}
                    onChange={(e) => handleDataChange(i, "value", e.target.value)}
                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
                  />
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeRow(i); }}
                    className="w-7 h-7 flex items-center justify-center rounded text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); addRow(); }}
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
