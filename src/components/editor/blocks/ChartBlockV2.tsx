"use client";

import { useState, useCallback, useRef, useMemo } from "react";
import type {
  ChartBlockData,
  ChartVariant,
  ChartAnnotation,
  ChartDataSeries,
} from "@/lib/editor/block-types";
import { CHART_COLORS, ELECTRIC_HEX } from "@/lib/design-tokens";
import Papa from "papaparse";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ScatterChart,
  Scatter,
  Treemap,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ------------------------------------------------------------------ */
/*  Types & constants                                                  */
/* ------------------------------------------------------------------ */

interface ChartBlockV2Props {
  data: ChartBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<ChartBlockData>) => void;
}

interface ChartTypeOption {
  value: ChartVariant;
  label: string;
}

interface ChartCategory {
  label: string;
  types: ChartTypeOption[];
}

const CHART_CATEGORIES: ChartCategory[] = [
  {
    label: "Standard",
    types: [
      { value: "bar", label: "Bar" },
      { value: "bar-horizontal", label: "Horiz. Bar" },
      { value: "line", label: "Line" },
      { value: "area", label: "Area" },
      { value: "pie", label: "Pie" },
      { value: "donut", label: "Donut" },
    ],
  },
  {
    label: "Comparison",
    types: [
      { value: "bar-stacked", label: "Stacked Bar" },
      { value: "bar-grouped", label: "Grouped Bar" },
      { value: "area-stacked", label: "Stacked Area" },
      { value: "combo", label: "Combo" },
    ],
  },
  {
    label: "Distribution",
    types: [
      { value: "scatter", label: "Scatter" },
      { value: "treemap", label: "Treemap" },
      { value: "funnel", label: "Funnel" },
    ],
  },
  {
    label: "Specialized",
    types: [
      { value: "waterfall", label: "Waterfall" },
      { value: "gauge", label: "Gauge" },
      { value: "sparkline", label: "Sparkline" },
    ],
  },
];

const TICK_STYLE = { fill: "rgba(255,255,255,0.6)", fontSize: 11 };
const GRID_STROKE = "rgba(255,255,255,0.1)";
const TOOLTIP_STYLE = {
  background: "rgba(15,23,42,0.95)",
  border: "1px solid rgba(128,128,128,0.2)",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "12px",
};

function colorAt(i: number, row?: ChartDataSeries): string {
  return row?.color || CHART_COLORS[i % CHART_COLORS.length];
}

/* ------------------------------------------------------------------ */
/*  Custom SVG chart renderers                                         */
/* ------------------------------------------------------------------ */

function FunnelSVG({ rows }: { rows: ChartDataSeries[] }) {
  if (!rows.length) return null;
  const maxVal = Math.max(...rows.map((r) => r.value), 1);
  const rowH = Math.min(48, 240 / rows.length);
  const totalH = rowH * rows.length;

  return (
    <svg viewBox={`0 0 400 ${totalH}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {rows.map((row, i) => {
        const topW = (row.value / maxVal) * 360;
        const botW = i < rows.length - 1 ? (rows[i + 1].value / maxVal) * 360 : topW * 0.6;
        const cx = 200;
        const y = i * rowH;
        const fill = colorAt(i, row);
        const points = [
          `${cx - topW / 2},${y}`,
          `${cx + topW / 2},${y}`,
          `${cx + botW / 2},${y + rowH}`,
          `${cx - botW / 2},${y + rowH}`,
        ].join(" ");
        return (
          <g key={i}>
            <polygon points={points} fill={fill} opacity={0.85} />
            <text
              x={cx}
              y={y + rowH / 2 + 4}
              textAnchor="middle"
              fill="#fff"
              fontSize={11}
              fontWeight={500}
            >
              {row.label} ({row.value})
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function WaterfallSVG({ rows }: { rows: ChartDataSeries[] }) {
  if (!rows.length) return null;
  const barW = Math.min(50, 360 / rows.length);
  const gap = 4;
  const chartW = rows.length * (barW + gap);

  let cumulative = 0;
  const segments = rows.map((row) => {
    const start = cumulative;
    cumulative += row.value;
    return { ...row, start, end: cumulative };
  });

  const allVals = segments.flatMap((s) => [s.start, s.end]);
  const minVal = Math.min(0, ...allVals);
  const maxVal = Math.max(1, ...allVals);
  const range = maxVal - minVal || 1;
  const chartH = 220;
  const padTop = 20;

  function yPos(v: number) {
    return padTop + chartH - ((v - minVal) / range) * chartH;
  }

  return (
    <svg viewBox={`0 0 ${chartW + 40} ${chartH + 60}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* zero line */}
      <line x1={20} y1={yPos(0)} x2={chartW + 20} y2={yPos(0)} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 2" />
      {segments.map((seg, i) => {
        const x = 20 + i * (barW + gap);
        const y1 = yPos(seg.start);
        const y2 = yPos(seg.end);
        const top = Math.min(y1, y2);
        const h = Math.abs(y2 - y1) || 2;
        const fill = seg.value >= 0 ? "#22c55e" : "#ef4444";

        return (
          <g key={i}>
            <rect x={x} y={top} width={barW} height={h} fill={fill} rx={3} opacity={0.85} />
            <text x={x + barW / 2} y={chartH + padTop + 14} textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize={9}>
              {seg.label}
            </text>
            <text x={x + barW / 2} y={top - 4} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={9}>
              {seg.value > 0 ? "+" : ""}
              {seg.value}
            </text>
            {/* connector */}
            {i < segments.length - 1 && (
              <line
                x1={x + barW}
                y1={yPos(seg.end)}
                x2={x + barW + gap}
                y2={yPos(seg.end)}
                stroke="rgba(255,255,255,0.25)"
                strokeDasharray="2 2"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}

function GaugeSVG({
  value,
  min,
  max,
}: {
  value: number;
  min: number;
  max: number;
}) {
  const range = max - min || 1;
  const pct = Math.max(0, Math.min(1, (value - min) / range));
  const startAngle = -225;
  const sweep = 270;
  const needleAngle = startAngle + pct * sweep;

  const cx = 120;
  const cy = 120;
  const r = 90;

  function polarToXY(deg: number, radius: number) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  const arcStart = polarToXY(startAngle, r);
  const arcEnd = polarToXY(startAngle + sweep, r);
  const filledEnd = polarToXY(startAngle + pct * sweep, r);

  const largeArcBg = sweep > 180 ? 1 : 0;
  const filledSweepDeg = pct * sweep;
  const largeArcFilled = filledSweepDeg > 180 ? 1 : 0;

  const needleTip = polarToXY(needleAngle, r - 10);

  return (
    <svg viewBox="0 0 240 160" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* background arc */}
      <path
        d={`M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 ${largeArcBg} 1 ${arcEnd.x} ${arcEnd.y}`}
        fill="none"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth={14}
        strokeLinecap="round"
      />
      {/* filled arc */}
      {pct > 0 && (
        <path
          d={`M ${arcStart.x} ${arcStart.y} A ${r} ${r} 0 ${largeArcFilled} 1 ${filledEnd.x} ${filledEnd.y}`}
          fill="none"
          stroke={ELECTRIC_HEX}
          strokeWidth={14}
          strokeLinecap="round"
        />
      )}
      {/* needle */}
      <line x1={cx} y1={cy} x2={needleTip.x} y2={needleTip.y} stroke="#fff" strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={5} fill="#fff" />
      {/* value */}
      <text x={cx} y={cy + 28} textAnchor="middle" fill="#fff" fontSize={22} fontWeight={700}>
        {value}
      </text>
      {/* min/max */}
      <text x={arcStart.x - 4} y={arcStart.y + 16} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={10}>
        {min}
      </text>
      <text x={arcEnd.x + 4} y={arcEnd.y + 16} textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize={10}>
        {max}
      </text>
    </svg>
  );
}

function SparklineSVG({ rows }: { rows: ChartDataSeries[] }) {
  if (rows.length < 2) return null;
  const vals = rows.map((r) => r.value);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;
  const w = 200;
  const h = 50;
  const points = vals
    .map((v, i) => {
      const x = (i / (vals.length - 1)) * w;
      const y = h - ((v - minV) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      <polyline points={points} fill="none" stroke={ELECTRIC_HEX} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Annotation overlay                                                 */
/* ------------------------------------------------------------------ */

function AnnotationOverlay({
  annotations,
  dataLen,
  containerWidth,
  containerHeight,
}: {
  annotations: ChartAnnotation[];
  dataLen: number;
  containerWidth: number;
  containerHeight: number;
}) {
  if (!annotations.length || !dataLen || !containerWidth) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={containerWidth}
      height={containerHeight}
      viewBox={`0 0 ${containerWidth} ${containerHeight}`}
    >
      {annotations.map((a) => {
        const xBase = ((a.dataIndex + 0.5) / dataLen) * containerWidth;
        const yBase = containerHeight * 0.35;
        const tx = xBase + a.offsetX;
        const ty = yBase + a.offsetY;

        return (
          <g key={a.id}>
            <line x1={xBase} y1={yBase} x2={tx} y2={ty} stroke="rgba(255,255,255,0.4)" strokeWidth={1} strokeDasharray="3 2" />
            <circle cx={xBase} cy={yBase} r={3} fill={ELECTRIC_HEX} />
            <rect x={tx - 4} y={ty - 14} width={a.label.length * 6.5 + 10} height={18} rx={4} fill="rgba(15,23,42,0.9)" stroke="rgba(255,255,255,0.15)" strokeWidth={0.5} />
            <text x={tx + 1} y={ty - 1} fill="#fff" fontSize={10} fontWeight={500}>
              {a.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Treemap custom content                                             */
/* ------------------------------------------------------------------ */

interface TreemapContentProps {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  index: number;
}

function TreemapContent({ x, y, width, height, name, index }: TreemapContentProps) {
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={CHART_COLORS[index % CHART_COLORS.length]} stroke="rgba(0,0,0,0.3)" strokeWidth={1} rx={4} />
      {width > 40 && height > 20 && (
        <text x={x + width / 2} y={y + height / 2 + 4} textAnchor="middle" fill="#fff" fontSize={Math.min(12, width / 6)} fontWeight={500}>
          {name}
        </text>
      )}
    </g>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function ChartBlockV2({
  data,
  isSelected,
  onDataChange,
}: ChartBlockV2Props) {
  const [editorOpen, setEditorOpen] = useState(false);
  const [annotationMode, setAnnotationMode] = useState(false);
  const chartContainerRef = useRef<HTMLDivElement>(null);

  /* ---- Data helpers ---- */

  const updateCell = useCallback(
    (index: number, field: keyof ChartDataSeries, raw: string) => {
      const newData = [...data.data];
      if (field === "label") {
        newData[index] = { ...newData[index], label: raw };
      } else if (field === "value") {
        newData[index] = { ...newData[index], value: parseFloat(raw) || 0 };
      } else if (field === "value2") {
        newData[index] = { ...newData[index], value2: parseFloat(raw) || 0 };
      } else if (field === "color") {
        newData[index] = { ...newData[index], color: raw || undefined };
      }
      onDataChange({ data: newData });
    },
    [data.data, onDataChange],
  );

  const addRow = useCallback(() => {
    onDataChange({
      data: [
        ...data.data,
        { label: `Item ${data.data.length + 1}`, value: 0 },
      ],
    });
  }, [data.data, onDataChange]);

  const removeRow = useCallback(
    (index: number) => {
      onDataChange({ data: data.data.filter((_, i) => i !== index) });
    },
    [data.data, onDataChange],
  );

  /* ---- CSV paste handler ---- */

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      const text = e.clipboardData.getData("text/plain");
      if (!text.includes("\t") && !text.includes(",") && !text.includes("\n")) return;
      e.preventDefault();

      const result = Papa.parse<string[]>(text, {
        header: false,
        skipEmptyLines: true,
        delimiter: text.includes("\t") ? "\t" : ",",
      });

      if (!result.data.length) return;

      const parsed: ChartDataSeries[] = result.data.map((row) => ({
        label: (row[0] ?? "").trim(),
        value: parseFloat(row[1] ?? "0") || 0,
        value2: row[2] !== undefined ? parseFloat(row[2]) || 0 : undefined,
      }));

      onDataChange({ data: parsed });
    },
    [onDataChange],
  );

  /* ---- Annotations ---- */

  const addAnnotation = useCallback(
    (dataIndex: number) => {
      const id = `ann-${Date.now()}`;
      const ann: ChartAnnotation = {
        id,
        dataIndex,
        label: `Note ${(data.annotations?.length ?? 0) + 1}`,
        offsetX: 0,
        offsetY: -40,
      };
      onDataChange({ annotations: [...(data.annotations ?? []), ann] });
    },
    [data.annotations, onDataChange],
  );

  const removeAnnotation = useCallback(
    (id: string) => {
      onDataChange({
        annotations: (data.annotations ?? []).filter((a) => a.id !== id),
      });
    },
    [data.annotations, onDataChange],
  );

  const updateAnnotation = useCallback(
    (id: string, field: keyof ChartAnnotation, val: string | number) => {
      onDataChange({
        annotations: (data.annotations ?? []).map((a) =>
          a.id === id ? { ...a, [field]: val } : a,
        ),
      });
    },
    [data.annotations, onDataChange],
  );

  /* ---- Needs value2 column ---- */

  const needsValue2 = useMemo(() => {
    const t = data.chartType;
    return (
      t === "bar-stacked" ||
      t === "bar-grouped" ||
      t === "area-stacked" ||
      t === "combo" ||
      t === "scatter"
    );
  }, [data.chartType]);

  /* ---- Chart rendering ---- */

  const gridEl = data.showGrid !== false ? (
    <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} />
  ) : null;

  const legendEl = data.showLegend ? <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }} /> : null;

  const renderChart = () => {
    const rows = data.data;
    if (!rows.length) {
      return (
        <div className="flex items-center justify-center h-full text-white/30 text-sm">
          No data. Add rows below.
        </div>
      );
    }

    const ct = data.chartType;

    /* -- Gauge -- */
    if (ct === "gauge") {
      const gMin = data.gaugeMin ?? 0;
      const gMax = data.gaugeMax ?? 100;
      const gVal = data.gaugeValue ?? rows[0]?.value ?? 0;
      return (
        <div className="flex items-center justify-center h-full">
          <GaugeSVG value={gVal} min={gMin} max={gMax} />
        </div>
      );
    }

    /* -- Sparkline -- */
    if (ct === "sparkline") {
      return (
        <div className="flex items-center justify-center h-full px-4">
          <SparklineSVG rows={rows} />
        </div>
      );
    }

    /* -- Funnel (custom SVG) -- */
    if (ct === "funnel") {
      return (
        <div className="flex items-center justify-center h-full px-2">
          <FunnelSVG rows={rows} />
        </div>
      );
    }

    /* -- Waterfall (custom SVG) -- */
    if (ct === "waterfall") {
      return (
        <div className="flex items-center justify-center h-full px-2">
          <WaterfallSVG rows={rows} />
        </div>
      );
    }

    /* -- Treemap (Recharts) -- */
    if (ct === "treemap") {
      const tmData = rows.map((r, i) => ({
        name: r.label,
        size: r.value,
        fill: colorAt(i, r),
      }));
      return (
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={tmData}
            dataKey="size"
            nameKey="name"
            content={<TreemapContent x={0} y={0} width={0} height={0} name="" index={0} />}
          >
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </Treemap>
        </ResponsiveContainer>
      );
    }

    /* -- Scatter (Recharts) -- */
    if (ct === "scatter") {
      const scatterData = rows.map((r) => ({
        x: r.value,
        y: r.value2 ?? 0,
        label: r.label,
      }));
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            {gridEl}
            <XAxis type="number" dataKey="x" tick={TICK_STYLE} axisLine={false} tickLine={false} name="Value" />
            <YAxis type="number" dataKey="y" tick={TICK_STYLE} axisLine={false} tickLine={false} name="Value2" />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            {legendEl}
            <Scatter data={scatterData} fill={ELECTRIC_HEX}>
              {scatterData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      );
    }

    /* -- Pie / Donut -- */
    if (ct === "pie" || ct === "donut") {
      const innerR = ct === "donut" ? "40%" : "0%";
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius="70%"
              innerRadius={innerR}
              paddingAngle={3}
            >
              {rows.map((r, i) => (
                <Cell key={i} fill={colorAt(i, r)} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            {legendEl}
          </PieChart>
        </ResponsiveContainer>
      );
    }

    /* -- Combo (Bar + Line via ComposedChart) -- */
    if (ct === "combo") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={rows}>
            {gridEl}
            <XAxis dataKey="label" tick={TICK_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} label={data.yAxisLabel ? { value: data.yAxisLabel, angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.5)", fontSize: 11 } : undefined} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            {legendEl}
            <Bar dataKey="value" name="Series 1" radius={[4, 4, 0, 0]}>
              {rows.map((r, i) => (
                <Cell key={i} fill={colorAt(i, r)} />
              ))}
            </Bar>
            <Line type="monotone" dataKey="value2" name="Series 2" stroke="#ec4899" strokeWidth={2.5} dot={{ fill: "#ec4899", r: 3 }} />
          </ComposedChart>
        </ResponsiveContainer>
      );
    }

    /* -- Line -- */
    if (ct === "line") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows}>
            {gridEl}
            <XAxis dataKey="label" tick={TICK_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} label={data.yAxisLabel ? { value: data.yAxisLabel, angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.5)", fontSize: 11 } : undefined} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            {legendEl}
            <Line type="monotone" dataKey="value" stroke={ELECTRIC_HEX} strokeWidth={3} dot={{ fill: ELECTRIC_HEX, r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    /* -- Area -- */
    if (ct === "area") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows}>
            <defs>
              <linearGradient id="v2AreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={ELECTRIC_HEX} stopOpacity={0.3} />
                <stop offset="95%" stopColor={ELECTRIC_HEX} stopOpacity={0} />
              </linearGradient>
            </defs>
            {gridEl}
            <XAxis dataKey="label" tick={TICK_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} label={data.yAxisLabel ? { value: data.yAxisLabel, angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.5)", fontSize: 11 } : undefined} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            {legendEl}
            <Area type="monotone" dataKey="value" stroke={ELECTRIC_HEX} strokeWidth={3} fill="url(#v2AreaGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    /* -- Area Stacked -- */
    if (ct === "area-stacked") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows}>
            <defs>
              <linearGradient id="v2AreaGradS1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS[0]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS[0]} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="v2AreaGradS2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={CHART_COLORS[1]} stopOpacity={0.3} />
                <stop offset="95%" stopColor={CHART_COLORS[1]} stopOpacity={0} />
              </linearGradient>
            </defs>
            {gridEl}
            <XAxis dataKey="label" tick={TICK_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} label={data.yAxisLabel ? { value: data.yAxisLabel, angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.5)", fontSize: 11 } : undefined} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            {legendEl}
            <Area type="monotone" dataKey="value" name="Series 1" stackId="1" stroke={CHART_COLORS[0]} strokeWidth={2} fill="url(#v2AreaGradS1)" />
            <Area type="monotone" dataKey="value2" name="Series 2" stackId="1" stroke={CHART_COLORS[1]} strokeWidth={2} fill="url(#v2AreaGradS2)" />
          </AreaChart>
        </ResponsiveContainer>
      );
    }

    /* -- Bar Horizontal -- */
    if (ct === "bar-horizontal") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical">
            {gridEl}
            <XAxis type="number" tick={TICK_STYLE} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="label" tick={TICK_STYLE} axisLine={false} tickLine={false} width={80} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            {legendEl}
            <Bar dataKey="value" radius={[0, 6, 6, 0]}>
              {rows.map((r, i) => (
                <Cell key={i} fill={colorAt(i, r)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      );
    }

    /* -- Bar Stacked -- */
    if (ct === "bar-stacked") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows}>
            {gridEl}
            <XAxis dataKey="label" tick={TICK_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} label={data.yAxisLabel ? { value: data.yAxisLabel, angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.5)", fontSize: 11 } : undefined} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            {legendEl}
            <Bar dataKey="value" name="Series 1" stackId="a" fill={CHART_COLORS[0]} radius={[0, 0, 0, 0]} />
            <Bar dataKey="value2" name="Series 2" stackId="a" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    /* -- Bar Grouped -- */
    if (ct === "bar-grouped") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows}>
            {gridEl}
            <XAxis dataKey="label" tick={TICK_STYLE} axisLine={false} tickLine={false} />
            <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} label={data.yAxisLabel ? { value: data.yAxisLabel, angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.5)", fontSize: 11 } : undefined} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            {legendEl}
            <Bar dataKey="value" name="Series 1" fill={CHART_COLORS[0]} radius={[4, 4, 0, 0]} />
            <Bar dataKey="value2" name="Series 2" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    /* -- Default: Bar -- */
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows}>
          {gridEl}
          <XAxis dataKey="label" tick={TICK_STYLE} axisLine={false} tickLine={false} />
          <YAxis tick={TICK_STYLE} axisLine={false} tickLine={false} label={data.yAxisLabel ? { value: data.yAxisLabel, angle: -90, position: "insideLeft", fill: "rgba(255,255,255,0.5)", fontSize: 11 } : undefined} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          {legendEl}
          <Bar dataKey="value" radius={[6, 6, 0, 0]}>
            {rows.map((r, i) => (
              <Cell key={i} fill={colorAt(i, r)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    );
  };

  /* ---- Container size for annotations ---- */

  const containerRect = chartContainerRef.current?.getBoundingClientRect();
  const cw = containerRect?.width ?? 0;
  const ch = containerRect?.height ?? 0;

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="w-full h-full rounded-xl overflow-hidden flex flex-col">
      {/* Chart area */}
      <div ref={chartContainerRef} className="flex-1 min-h-[160px] p-3 relative">
        {renderChart()}
        {(data.annotations?.length ?? 0) > 0 && (
          <AnnotationOverlay
            annotations={data.annotations ?? []}
            dataLen={data.data.length}
            containerWidth={cw}
            containerHeight={ch}
          />
        )}
      </div>

      {/* Controls (only when selected) */}
      {isSelected && (
        <div className="border-t border-white/10 p-3 space-y-3 max-h-[420px] overflow-y-auto">
          {/* ── Chart type switcher ── */}
          <div className="space-y-2">
            <span className="text-xs text-white/50 font-medium">Chart Type</span>
            <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-white/10">
              {CHART_CATEGORIES.map((cat) => (
                <div key={cat.label} className="flex-shrink-0 space-y-1">
                  <span className="text-[10px] text-white/30 font-medium uppercase tracking-wider">
                    {cat.label}
                  </span>
                  <div className="flex gap-1">
                    {cat.types.map((t) => (
                      <button
                        key={t.value}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDataChange({ chartType: t.value });
                        }}
                        className={`px-2 py-1.5 min-h-[32px] text-xs rounded-md transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE] ${
                          data.chartType === t.value
                            ? "bg-[#4361EE] text-white"
                            : "bg-white/5 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Options row ── */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setEditorOpen(!editorOpen);
              }}
              className={`px-3 min-h-[44px] text-xs rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE] ${
                editorOpen
                  ? "bg-[#4361EE]/20 text-[#4361EE]"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              {editorOpen ? "Hide Data" : "Edit Data"}
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAnnotationMode(!annotationMode);
              }}
              className={`px-3 min-h-[44px] text-xs rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE] ${
                annotationMode
                  ? "bg-[#4361EE]/20 text-[#4361EE]"
                  : "bg-white/5 text-white/60 hover:bg-white/10"
              }`}
            >
              Annotations
            </button>

            <label className="flex items-center gap-1.5 text-xs text-white/50 cursor-pointer ml-auto">
              <input
                type="checkbox"
                checked={data.showLegend ?? false}
                onChange={(e) => onDataChange({ showLegend: e.target.checked })}
                className="accent-[#4361EE] w-3.5 h-3.5"
              />
              Legend
            </label>

            <label className="flex items-center gap-1.5 text-xs text-white/50 cursor-pointer">
              <input
                type="checkbox"
                checked={data.showGrid !== false}
                onChange={(e) => onDataChange({ showGrid: e.target.checked })}
                className="accent-[#4361EE] w-3.5 h-3.5"
              />
              Grid
            </label>
          </div>

          {/* ── Gauge controls ── */}
          {data.chartType === "gauge" && (
            <div className="flex items-center gap-3 text-xs text-white/50">
              <label className="flex items-center gap-1">
                Min
                <input
                  type="number"
                  value={data.gaugeMin ?? 0}
                  onChange={(e) => onDataChange({ gaugeMin: parseFloat(e.target.value) || 0 })}
                  className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
                />
              </label>
              <label className="flex items-center gap-1">
                Max
                <input
                  type="number"
                  value={data.gaugeMax ?? 100}
                  onChange={(e) => onDataChange({ gaugeMax: parseFloat(e.target.value) || 100 })}
                  className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
                />
              </label>
              <label className="flex items-center gap-1">
                Value
                <input
                  type="number"
                  value={data.gaugeValue ?? data.data[0]?.value ?? 0}
                  onChange={(e) => onDataChange({ gaugeValue: parseFloat(e.target.value) || 0 })}
                  className="w-16 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
                />
              </label>
            </div>
          )}

          {/* ── Y-Axis label ── */}
          {data.chartType !== "gauge" && data.chartType !== "sparkline" && data.chartType !== "pie" && data.chartType !== "donut" && data.chartType !== "treemap" && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40 whitespace-nowrap">Y Label</span>
              <input
                type="text"
                value={data.yAxisLabel ?? ""}
                onChange={(e) => onDataChange({ yAxisLabel: e.target.value })}
                placeholder="e.g. Revenue ($M)"
                className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white placeholder:text-white/20 outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
              />
            </div>
          )}

          {/* ── Data table editor ── */}
          {editorOpen && (
            <div className="space-y-1.5">
              <div
                className={`grid gap-1.5 text-xs text-white/40 font-medium px-1 ${
                  needsValue2
                    ? "grid-cols-[1fr_72px_72px_32px]"
                    : "grid-cols-[1fr_80px_32px]"
                }`}
              >
                <span>Label</span>
                <span>Value</span>
                {needsValue2 && <span>Value2</span>}
                <span />
              </div>
              {data.data.map((row, i) => (
                <div
                  key={i}
                  className={`grid gap-1.5 ${
                    needsValue2
                      ? "grid-cols-[1fr_72px_72px_32px]"
                      : "grid-cols-[1fr_80px_32px]"
                  }`}
                >
                  <input
                    type="text"
                    value={row.label}
                    onChange={(e) => updateCell(i, "label", e.target.value)}
                    onPaste={handlePaste}
                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
                  />
                  <input
                    type="number"
                    value={row.value}
                    onChange={(e) => updateCell(i, "value", e.target.value)}
                    onPaste={handlePaste}
                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
                  />
                  {needsValue2 && (
                    <input
                      type="number"
                      value={row.value2 ?? 0}
                      onChange={(e) => updateCell(i, "value2", e.target.value)}
                      onPaste={handlePaste}
                      className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
                    />
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRow(i);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
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
                className="w-full min-h-[44px] text-xs text-white/40 hover:text-white/60 border border-dashed border-white/10 hover:border-white/20 rounded transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
              >
                + Add Row
              </button>
              <p className="text-[10px] text-white/25 px-1">
                Tip: paste CSV or TSV data into any cell to bulk-import.
              </p>
            </div>
          )}

          {/* ── Annotation editor ── */}
          {annotationMode && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/50 font-medium">
                  Annotations
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    addAnnotation(0);
                  }}
                  className="px-2 min-h-[32px] text-xs rounded-md bg-white/5 text-white/60 hover:bg-white/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
                >
                  + Add
                </button>
              </div>
              {(data.annotations ?? []).map((ann) => (
                <div key={ann.id} className="flex items-center gap-1.5">
                  <input
                    type="number"
                    value={ann.dataIndex}
                    onChange={(e) =>
                      updateAnnotation(
                        ann.id,
                        "dataIndex",
                        Math.max(0, Math.min(data.data.length - 1, parseInt(e.target.value) || 0)),
                      )
                    }
                    title="Data index"
                    className="w-12 bg-white/5 border border-white/10 rounded px-1.5 py-1 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
                  />
                  <input
                    type="text"
                    value={ann.label}
                    onChange={(e) => updateAnnotation(ann.id, "label", e.target.value)}
                    placeholder="Label"
                    className="flex-1 bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
                  />
                  <input
                    type="number"
                    value={ann.offsetX}
                    onChange={(e) => updateAnnotation(ann.id, "offsetX", parseFloat(e.target.value) || 0)}
                    title="X offset"
                    className="w-14 bg-white/5 border border-white/10 rounded px-1.5 py-1 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
                  />
                  <input
                    type="number"
                    value={ann.offsetY}
                    onChange={(e) => updateAnnotation(ann.id, "offsetY", parseFloat(e.target.value) || 0)}
                    title="Y offset"
                    className="w-14 bg-white/5 border border-white/10 rounded px-1.5 py-1 text-xs text-white outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeAnnotation(ann.id);
                    }}
                    className="w-7 h-7 flex items-center justify-center rounded text-white/30 hover:text-red-400 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
