"use client";

import { useEditorStore } from "./state/editorStore";
import type {
  EditorBlock,
  BlockType as BType,
  TextBlockData,
  HeadingBlockData,
  BulletListBlockData,
  QuoteBlockData,
  CalloutBlockData,
  MetricBlockData,
  MetricGridBlockData,
  ChartBlockData,
  ChartVariant,
  ComparisonRowBlockData,
  FunnelBlockData,
  TableBlockData,
  ProgressBlockData,
  ImageBlockData,
  IconBlockData,
  LogoGridBlockData,
  ShapeBlockData,
  VideoEmbedBlockData,
  DeviceMockupBlockData,
  TeamMemberBlockData,
  TimelineItemBlockData,
  DividerBlockData,
  SpacerBlockData,
  CardGroupBlockData,
} from "@/lib/editor/block-types";
import { BLOCK_META } from "@/lib/editor/block-types";

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface BlockPropertiesV2Props {
  block: EditorBlock;
  slideId: string;
}

/* ------------------------------------------------------------------ */
/*  Shared classes                                                     */
/* ------------------------------------------------------------------ */

const CLS = {
  input:
    "w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white",
  select:
    "w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white bg-white",
  label: "text-xs font-semibold text-navy-500 uppercase tracking-wider block mb-1.5",
  sectionHeader: "text-xs font-semibold text-navy-500 uppercase tracking-wider",
  textarea:
    "w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-white resize-none",
  checkbox: "w-4 h-4 rounded border-navy-300 text-electric",
  removeBtn: "text-xs text-red-400 hover:text-red-600 font-semibold",
  addBtn: "text-xs text-electric font-semibold hover:text-electric-600",
  arrayDeleteBtn:
    "w-6 h-6 rounded border border-navy-200 flex items-center justify-center text-navy-400 hover:text-red-500 hover:border-red-300 shrink-0",
} as const;

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={CLS.label}>{label}</label>
      {children}
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string | undefined;
  onChange: (v: string) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex gap-2 items-center">
        <input
          type="color"
          value={value || "#000000"}
          onChange={(e) => onChange(e.target.value)}
          className="w-9 h-9 rounded-lg border border-navy-200 cursor-pointer p-0.5"
        />
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
          className={CLS.input}
        />
      </div>
    </Field>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step ?? 1}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1"
        />
        <span className="text-xs text-navy-500 w-12 text-right tabular-nums">
          {value}
          {suffix ?? ""}
        </span>
      </div>
    </Field>
  );
}

function AlignToggle({
  value,
  onChange,
}: {
  value: "left" | "center" | "right";
  onChange: (v: "left" | "center" | "right") => void;
}) {
  const opts: { key: "left" | "center" | "right"; label: string }[] = [
    { key: "left", label: "L" },
    { key: "center", label: "C" },
    { key: "right", label: "R" },
  ];
  return (
    <Field label="Align">
      <div className="flex gap-1">
        {opts.map((o) => (
          <button
            key={o.key}
            type="button"
            onClick={() => onChange(o.key)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md border transition-colors ${
              value === o.key
                ? "bg-electric text-white border-electric"
                : "bg-white text-navy-500 border-navy-200 hover:border-navy-300"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </Field>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function BlockPropertiesV2({ block, slideId }: BlockPropertiesV2Props) {
  const updateBlockData = useEditorStore((s) => s.updateBlockData);
  const updateBlockPosition = useEditorStore((s) => s.updateBlockPosition);
  const updateBlockStyle = useEditorStore((s) => s.updateBlockStyle);
  const removeBlockV2 = useEditorStore((s) => s.removeBlockV2);
  const toggleBlockLocked = useEditorStore((s) => s.toggleBlockLocked);
  const toggleBlockHidden = useEditorStore((s) => s.toggleBlockHidden);

  const meta = BLOCK_META[block.type as BType] ?? { label: block.type, icon: "Box" };

  function setData(patch: Record<string, unknown>) {
    updateBlockData(slideId, block.id, patch);
  }

  function setPos(patch: Partial<EditorBlock["position"]>) {
    updateBlockPosition(slideId, block.id, patch);
  }

  function setStyle(patch: Partial<EditorBlock["style"]>) {
    updateBlockStyle(slideId, block.id, patch);
  }

  /* ---------------------------------------------------------------- */
  /*  Common section                                                   */
  /* ---------------------------------------------------------------- */

  const commonSection = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-navy">{meta.label}</h3>
          <p className="text-xs text-navy-400 mt-0.5">{block.type}</p>
        </div>
        <button
          type="button"
          onClick={() => removeBlockV2(slideId, block.id)}
          className={CLS.removeBtn}
        >
          Remove
        </button>
      </div>

      {/* Position & Size */}
      <details className="group">
        <summary className={`${CLS.sectionHeader} cursor-pointer select-none py-1`}>
          Position &amp; Size
        </summary>
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="X">
              <input
                type="number"
                min={0}
                max={11}
                value={block.position.x}
                onChange={(e) => setPos({ x: Number(e.target.value) })}
                className={CLS.input}
              />
            </Field>
            <Field label="Y">
              <input
                type="number"
                min={0}
                value={block.position.y}
                onChange={(e) => setPos({ y: Number(e.target.value) })}
                className={CLS.input}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Width">
              <input
                type="number"
                min={1}
                max={12}
                value={block.position.width}
                onChange={(e) => setPos({ width: Number(e.target.value) })}
                className={CLS.input}
              />
            </Field>
            <Field label="Height">
              <input
                type="number"
                min={0}
                value={block.position.height}
                onChange={(e) => setPos({ height: Number(e.target.value) })}
                className={CLS.input}
              />
            </Field>
          </div>
          <Field label="Z-Index">
            <input
              type="number"
              value={block.position.zIndex}
              onChange={(e) => setPos({ zIndex: Number(e.target.value) })}
              className={CLS.input}
            />
          </Field>
        </div>
      </details>

      {/* Appearance */}
      <details className="group">
        <summary className={`${CLS.sectionHeader} cursor-pointer select-none py-1`}>
          Appearance
        </summary>
        <div className="mt-3 space-y-3">
          <ColorField
            label="Background Color"
            value={block.style.backgroundColor}
            onChange={(v) => setStyle({ backgroundColor: v })}
          />
          <Field label="Border Radius">
            <input
              type="number"
              min={0}
              max={50}
              value={block.style.borderRadius ?? 0}
              onChange={(e) => setStyle({ borderRadius: Number(e.target.value) })}
              className={CLS.input}
            />
          </Field>
          <Field label="Shadow">
            <select
              value={block.style.shadow ?? "none"}
              onChange={(e) =>
                setStyle({ shadow: e.target.value as "none" | "sm" | "md" | "lg" })
              }
              className={CLS.select}
            >
              <option value="none">None</option>
              <option value="sm">Small</option>
              <option value="md">Medium</option>
              <option value="lg">Large</option>
            </select>
          </Field>
          <RangeField
            label="Opacity"
            value={block.style.opacity ?? 100}
            min={0}
            max={100}
            suffix="%"
            onChange={(v) => setStyle({ opacity: v })}
          />
          <Field label="Padding">
            <input
              type="number"
              min={0}
              max={100}
              value={block.style.padding ?? 0}
              onChange={(e) => setStyle({ padding: Number(e.target.value) })}
              className={CLS.input}
            />
          </Field>
        </div>
      </details>

      {/* Toggles */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 text-xs text-navy-600 cursor-pointer">
          <input
            type="checkbox"
            checked={block.locked}
            onChange={() => toggleBlockLocked(slideId, block.id)}
            className={CLS.checkbox}
          />
          Locked
        </label>
        <label className="flex items-center gap-2 text-xs text-navy-600 cursor-pointer">
          <input
            type="checkbox"
            checked={block.hidden}
            onChange={() => toggleBlockHidden(slideId, block.id)}
            className={CLS.checkbox}
          />
          Hidden
        </label>
      </div>
    </>
  );

  /* ---------------------------------------------------------------- */
  /*  Type-specific sections                                           */
  /* ---------------------------------------------------------------- */

  function renderTypeFields(): React.ReactNode {
    switch (block.type as BType) {
      /* ============================================================ */
      /*  CONTENT BLOCKS                                               */
      /* ============================================================ */

      case "text": {
        const d = block.data as TextBlockData;
        return (
          <div className="space-y-3">
            <Field label="Text">
              <textarea
                rows={4}
                value={d.text}
                onChange={(e) => setData({ text: e.target.value })}
                className={CLS.textarea}
              />
            </Field>
            <Field label="Font Size">
              <input
                type="number"
                min={8}
                max={72}
                value={d.fontSize}
                onChange={(e) => setData({ fontSize: Number(e.target.value) })}
                className={CLS.input}
              />
            </Field>
            <AlignToggle value={d.align} onChange={(v) => setData({ align: v })} />
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-xs text-navy-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={d.bold}
                  onChange={(e) => setData({ bold: e.target.checked })}
                  className={CLS.checkbox}
                />
                Bold
              </label>
              <label className="flex items-center gap-2 text-xs text-navy-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={d.italic}
                  onChange={(e) => setData({ italic: e.target.checked })}
                  className={CLS.checkbox}
                />
                Italic
              </label>
            </div>
          </div>
        );
      }

      case "heading": {
        const d = block.data as HeadingBlockData;
        return (
          <div className="space-y-3">
            <Field label="Text">
              <input
                type="text"
                value={d.text}
                onChange={(e) => setData({ text: e.target.value })}
                className={CLS.input}
              />
            </Field>
            <Field label="Level">
              <select
                value={d.level}
                onChange={(e) => setData({ level: Number(e.target.value) as 1 | 2 | 3 })}
                className={CLS.select}
              >
                <option value={1}>H1</option>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
              </select>
            </Field>
            <AlignToggle value={d.align} onChange={(v) => setData({ align: v })} />
          </div>
        );
      }

      case "bullet-list": {
        const d = block.data as BulletListBlockData;
        const items = d.items ?? [];
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className={CLS.sectionHeader}>Items</span>
              <button
                type="button"
                onClick={() => setData({ items: [...items, ""] })}
                className={CLS.addBtn}
              >
                + Add
              </button>
            </div>
            {items.map((item, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const next = [...items];
                    next[i] = e.target.value;
                    setData({ items: next });
                  }}
                  className={CLS.input}
                />
                <button
                  type="button"
                  onClick={() => setData({ items: items.filter((_, idx) => idx !== i) })}
                  className={CLS.arrayDeleteBtn}
                >
                  &times;
                </button>
              </div>
            ))}
            <label className="flex items-center gap-2 text-xs text-navy-600 cursor-pointer">
              <input
                type="checkbox"
                checked={d.ordered}
                onChange={(e) => setData({ ordered: e.target.checked })}
                className={CLS.checkbox}
              />
              Ordered
            </label>
            <Field label="Style">
              <select
                value={d.style}
                onChange={(e) => setData({ style: e.target.value })}
                className={CLS.select}
              >
                <option value="disc">Disc</option>
                <option value="check">Check</option>
                <option value="arrow">Arrow</option>
                <option value="number">Number</option>
              </select>
            </Field>
          </div>
        );
      }

      case "quote": {
        const d = block.data as QuoteBlockData;
        return (
          <div className="space-y-3">
            <Field label="Text">
              <textarea
                rows={3}
                value={d.text}
                onChange={(e) => setData({ text: e.target.value })}
                className={CLS.textarea}
              />
            </Field>
            <Field label="Author">
              <input
                type="text"
                value={d.author}
                onChange={(e) => setData({ author: e.target.value })}
                className={CLS.input}
              />
            </Field>
            <Field label="Source">
              <input
                type="text"
                value={d.source ?? ""}
                onChange={(e) => setData({ source: e.target.value })}
                className={CLS.input}
              />
            </Field>
          </div>
        );
      }

      case "callout": {
        const d = block.data as CalloutBlockData;
        return (
          <div className="space-y-3">
            <Field label="Text">
              <textarea
                rows={3}
                value={d.text}
                onChange={(e) => setData({ text: e.target.value })}
                className={CLS.textarea}
              />
            </Field>
            <Field label="Variant">
              <select
                value={d.variant}
                onChange={(e) => setData({ variant: e.target.value })}
                className={CLS.select}
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
                <option value="tip">Tip</option>
              </select>
            </Field>
          </div>
        );
      }

      /* ============================================================ */
      /*  DATA BLOCKS                                                  */
      /* ============================================================ */

      case "metric": {
        const d = block.data as MetricBlockData;
        return (
          <div className="space-y-3">
            <Field label="Label">
              <input
                type="text"
                value={d.label}
                onChange={(e) => setData({ label: e.target.value })}
                className={CLS.input}
              />
            </Field>
            <Field label="Value">
              <input
                type="text"
                value={d.value}
                onChange={(e) => setData({ value: e.target.value })}
                className={CLS.input}
              />
            </Field>
            <Field label="Change">
              <input
                type="text"
                value={d.change ?? ""}
                placeholder="+24%"
                onChange={(e) => setData({ change: e.target.value })}
                className={CLS.input}
              />
            </Field>
            <Field label="Trend">
              <select
                value={d.trend ?? "neutral"}
                onChange={(e) => setData({ trend: e.target.value })}
                className={CLS.select}
              >
                <option value="up">Up</option>
                <option value="down">Down</option>
                <option value="neutral">Neutral</option>
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Prefix">
                <input
                  type="text"
                  value={d.prefix ?? ""}
                  onChange={(e) => setData({ prefix: e.target.value })}
                  className={CLS.input}
                />
              </Field>
              <Field label="Suffix">
                <input
                  type="text"
                  value={d.suffix ?? ""}
                  onChange={(e) => setData({ suffix: e.target.value })}
                  className={CLS.input}
                />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-xs text-navy-600 cursor-pointer">
              <input
                type="checkbox"
                checked={d.animateCountUp ?? false}
                onChange={(e) => setData({ animateCountUp: e.target.checked })}
                className={CLS.checkbox}
              />
              Animate Count Up
            </label>
          </div>
        );
      }

      case "metric-grid": {
        const d = block.data as MetricGridBlockData;
        const metrics = d.metrics ?? [];
        return (
          <div className="space-y-3">
            <Field label="Variant">
              <select
                value={d.variant}
                onChange={(e) => setData({ variant: e.target.value })}
                className={CLS.select}
              >
                <option value="cards">Cards</option>
                <option value="minimal">Minimal</option>
                <option value="featured">Featured</option>
              </select>
            </Field>
            <div className="flex items-center justify-between">
              <span className={CLS.sectionHeader}>Metrics</span>
              <button
                type="button"
                onClick={() =>
                  setData({
                    metrics: [
                      ...metrics,
                      { label: "", value: "", change: "", trend: "neutral" as const },
                    ],
                  })
                }
                className={CLS.addBtn}
              >
                + Add
              </button>
            </div>
            {metrics.map((m, i) => (
              <div key={i} className="p-3 border border-navy-100 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-navy-400">#{i + 1}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setData({ metrics: metrics.filter((_, idx) => idx !== i) })
                    }
                    className={CLS.arrayDeleteBtn}
                  >
                    &times;
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Label"
                  value={m.label}
                  onChange={(e) => {
                    const next = [...metrics];
                    next[i] = { ...next[i], label: e.target.value };
                    setData({ metrics: next });
                  }}
                  className={CLS.input}
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={m.value}
                  onChange={(e) => {
                    const next = [...metrics];
                    next[i] = { ...next[i], value: e.target.value };
                    setData({ metrics: next });
                  }}
                  className={CLS.input}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Change"
                    value={m.change ?? ""}
                    onChange={(e) => {
                      const next = [...metrics];
                      next[i] = { ...next[i], change: e.target.value };
                      setData({ metrics: next });
                    }}
                    className={CLS.input}
                  />
                  <select
                    value={m.trend ?? "neutral"}
                    onChange={(e) => {
                      const next = [...metrics];
                      next[i] = {
                        ...next[i],
                        trend: e.target.value as "up" | "down" | "neutral",
                      };
                      setData({ metrics: next });
                    }}
                    className={CLS.select}
                  >
                    <option value="up">Up</option>
                    <option value="down">Down</option>
                    <option value="neutral">Neutral</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        );
      }

      case "chart": {
        const d = block.data as ChartBlockData;
        const series = d.data ?? [];
        const isGauge = (d.chartType ?? "").includes("gauge");

        const chartTypeOptions: { group: string; types: { value: ChartVariant; label: string }[] }[] = [
          {
            group: "Bar",
            types: [
              { value: "bar", label: "Bar" },
              { value: "bar-horizontal", label: "Bar Horizontal" },
              { value: "bar-stacked", label: "Bar Stacked" },
              { value: "bar-grouped", label: "Bar Grouped" },
            ],
          },
          {
            group: "Line & Area",
            types: [
              { value: "line", label: "Line" },
              { value: "area", label: "Area" },
              { value: "area-stacked", label: "Area Stacked" },
            ],
          },
          {
            group: "Circular",
            types: [
              { value: "pie", label: "Pie" },
              { value: "donut", label: "Donut" },
            ],
          },
          {
            group: "Specialized",
            types: [
              { value: "funnel", label: "Funnel" },
              { value: "waterfall", label: "Waterfall" },
              { value: "scatter", label: "Scatter" },
              { value: "treemap", label: "Treemap" },
              { value: "gauge", label: "Gauge" },
              { value: "combo", label: "Combo" },
              { value: "sparkline", label: "Sparkline" },
            ],
          },
        ];

        return (
          <div className="space-y-3">
            <Field label="Chart Type">
              <select
                value={d.chartType}
                onChange={(e) => setData({ chartType: e.target.value })}
                className={CLS.select}
              >
                {chartTypeOptions.map((g) => (
                  <optgroup key={g.group} label={g.group}>
                    {g.types.map((t) => (
                      <option key={t.value} value={t.value}>
                        {t.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
            <Field label="Y Axis Label">
              <input
                type="text"
                value={d.yAxisLabel ?? ""}
                onChange={(e) => setData({ yAxisLabel: e.target.value })}
                className={CLS.input}
              />
            </Field>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-xs text-navy-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={d.showLegend ?? true}
                  onChange={(e) => setData({ showLegend: e.target.checked })}
                  className={CLS.checkbox}
                />
                Legend
              </label>
              <label className="flex items-center gap-2 text-xs text-navy-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={d.showGrid ?? true}
                  onChange={(e) => setData({ showGrid: e.target.checked })}
                  className={CLS.checkbox}
                />
                Grid
              </label>
            </div>

            {isGauge && (
              <div className="space-y-3 p-3 border border-navy-100 rounded-lg">
                <span className={CLS.sectionHeader}>Gauge Settings</span>
                <div className="grid grid-cols-3 gap-2">
                  <Field label="Min">
                    <input
                      type="number"
                      value={d.gaugeMin ?? 0}
                      onChange={(e) => setData({ gaugeMin: Number(e.target.value) })}
                      className={CLS.input}
                    />
                  </Field>
                  <Field label="Max">
                    <input
                      type="number"
                      value={d.gaugeMax ?? 100}
                      onChange={(e) => setData({ gaugeMax: Number(e.target.value) })}
                      className={CLS.input}
                    />
                  </Field>
                  <Field label="Value">
                    <input
                      type="number"
                      value={d.gaugeValue ?? 0}
                      onChange={(e) => setData({ gaugeValue: Number(e.target.value) })}
                      className={CLS.input}
                    />
                  </Field>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className={CLS.sectionHeader}>Data Series</span>
              <button
                type="button"
                onClick={() =>
                  setData({
                    data: [...series, { label: "", value: 0, value2: undefined, color: "" }],
                  })
                }
                className={CLS.addBtn}
              >
                + Add
              </button>
            </div>
            {series.map((s, i) => (
              <div key={i} className="p-3 border border-navy-100 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-navy-400">#{i + 1}</span>
                  <button
                    type="button"
                    onClick={() => setData({ data: series.filter((_, idx) => idx !== i) })}
                    className={CLS.arrayDeleteBtn}
                  >
                    &times;
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Label"
                  value={s.label}
                  onChange={(e) => {
                    const next = [...series];
                    next[i] = { ...next[i], label: e.target.value };
                    setData({ data: next });
                  }}
                  className={CLS.input}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Value"
                    value={s.value}
                    onChange={(e) => {
                      const next = [...series];
                      next[i] = { ...next[i], value: Number(e.target.value) };
                      setData({ data: next });
                    }}
                    className={CLS.input}
                  />
                  <input
                    type="number"
                    placeholder="Value 2"
                    value={s.value2 ?? ""}
                    onChange={(e) => {
                      const next = [...series];
                      next[i] = {
                        ...next[i],
                        value2: e.target.value ? Number(e.target.value) : undefined,
                      };
                      setData({ data: next });
                    }}
                    className={CLS.input}
                  />
                </div>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={s.color || "#4361EE"}
                    onChange={(e) => {
                      const next = [...series];
                      next[i] = { ...next[i], color: e.target.value };
                      setData({ data: next });
                    }}
                    className="w-9 h-9 rounded-lg border border-navy-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    placeholder="Color"
                    value={s.color ?? ""}
                    onChange={(e) => {
                      const next = [...series];
                      next[i] = { ...next[i], color: e.target.value };
                      setData({ data: next });
                    }}
                    className={CLS.input}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      }

      case "comparison-row": {
        const d = block.data as ComparisonRowBlockData;
        return (
          <div className="space-y-3">
            <Field label="Label">
              <input
                type="text"
                value={d.label}
                onChange={(e) => setData({ label: e.target.value })}
                className={CLS.input}
              />
            </Field>
            <Field label="Us">
              <input
                type="text"
                value={d.us}
                onChange={(e) => setData({ us: e.target.value })}
                className={CLS.input}
              />
            </Field>
            <Field label="Them">
              <input
                type="text"
                value={d.them}
                onChange={(e) => setData({ them: e.target.value })}
                className={CLS.input}
              />
            </Field>
          </div>
        );
      }

      case "funnel": {
        const d = block.data as FunnelBlockData;
        const stages = d.stages ?? [];
        return (
          <div className="space-y-3">
            <Field label="Variant">
              <select
                value={d.variant}
                onChange={(e) => setData({ variant: e.target.value })}
                className={CLS.select}
              >
                <option value="funnel">Funnel</option>
                <option value="inverted-pyramid">Inverted Pyramid</option>
                <option value="concentric-circles">Concentric Circles</option>
              </select>
            </Field>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-xs text-navy-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={d.showPercentages}
                  onChange={(e) => setData({ showPercentages: e.target.checked })}
                  className={CLS.checkbox}
                />
                Percentages
              </label>
              <label className="flex items-center gap-2 text-xs text-navy-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={d.showConversionRates}
                  onChange={(e) => setData({ showConversionRates: e.target.checked })}
                  className={CLS.checkbox}
                />
                Conversion Rates
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className={CLS.sectionHeader}>Stages</span>
              <button
                type="button"
                onClick={() =>
                  setData({
                    stages: [...stages, { label: "", value: 0, color: "" }],
                  })
                }
                className={CLS.addBtn}
              >
                + Add
              </button>
            </div>
            {stages.map((s, i) => (
              <div key={i} className="p-3 border border-navy-100 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-navy-400">#{i + 1}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setData({ stages: stages.filter((_, idx) => idx !== i) })
                    }
                    className={CLS.arrayDeleteBtn}
                  >
                    &times;
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Label"
                  value={s.label}
                  onChange={(e) => {
                    const next = [...stages];
                    next[i] = { ...next[i], label: e.target.value };
                    setData({ stages: next });
                  }}
                  className={CLS.input}
                />
                <input
                  type="number"
                  placeholder="Value"
                  value={s.value}
                  onChange={(e) => {
                    const next = [...stages];
                    next[i] = { ...next[i], value: Number(e.target.value) };
                    setData({ stages: next });
                  }}
                  className={CLS.input}
                />
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={s.color || "#4361EE"}
                    onChange={(e) => {
                      const next = [...stages];
                      next[i] = { ...next[i], color: e.target.value };
                      setData({ stages: next });
                    }}
                    className="w-9 h-9 rounded-lg border border-navy-200 cursor-pointer p-0.5"
                  />
                  <input
                    type="text"
                    placeholder="Color"
                    value={s.color ?? ""}
                    onChange={(e) => {
                      const next = [...stages];
                      next[i] = { ...next[i], color: e.target.value };
                      setData({ stages: next });
                    }}
                    className={CLS.input}
                  />
                </div>
              </div>
            ))}
          </div>
        );
      }

      case "table": {
        const d = block.data as TableBlockData;
        const columns = d.columns ?? [];
        const rows = d.rows ?? [];
        return (
          <div className="space-y-3">
            <Field label="Header Variant">
              <select
                value={d.headerVariant}
                onChange={(e) => setData({ headerVariant: e.target.value })}
                className={CLS.select}
              >
                <option value="default">Default</option>
                <option value="bold">Bold</option>
                <option value="accent">Accent</option>
                <option value="minimal">Minimal</option>
              </select>
            </Field>
            <label className="flex items-center gap-2 text-xs text-navy-600 cursor-pointer">
              <input
                type="checkbox"
                checked={d.striped}
                onChange={(e) => setData({ striped: e.target.checked })}
                className={CLS.checkbox}
              />
              Striped Rows
            </label>

            {/* Columns */}
            <div className="flex items-center justify-between">
              <span className={CLS.sectionHeader}>Columns</span>
              <button
                type="button"
                onClick={() => {
                  const key = `col_${Date.now()}`;
                  setData({
                    columns: [...columns, { key, header: "", align: "left" as const }],
                  });
                }}
                className={CLS.addBtn}
              >
                + Add
              </button>
            </div>
            {columns.map((col, i) => (
              <div key={col.key} className="p-3 border border-navy-100 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-navy-400">
                    {col.key}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setData({ columns: columns.filter((_, idx) => idx !== i) })
                    }
                    className={CLS.arrayDeleteBtn}
                  >
                    &times;
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Header"
                  value={col.header}
                  onChange={(e) => {
                    const next = [...columns];
                    next[i] = { ...next[i], header: e.target.value };
                    setData({ columns: next });
                  }}
                  className={CLS.input}
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Width"
                    value={col.width ?? ""}
                    onChange={(e) => {
                      const next = [...columns];
                      next[i] = {
                        ...next[i],
                        width: e.target.value ? Number(e.target.value) : undefined,
                      };
                      setData({ columns: next });
                    }}
                    className={CLS.input}
                  />
                  <select
                    value={col.align ?? "left"}
                    onChange={(e) => {
                      const next = [...columns];
                      next[i] = {
                        ...next[i],
                        align: e.target.value as "left" | "center" | "right",
                      };
                      setData({ columns: next });
                    }}
                    className={CLS.select}
                  >
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                  </select>
                </div>
              </div>
            ))}

            {/* Rows */}
            <div className="flex items-center justify-between">
              <span className={CLS.sectionHeader}>Rows</span>
              <button
                type="button"
                onClick={() => {
                  const emptyRow: Record<string, string> = {};
                  columns.forEach((c) => (emptyRow[c.key] = ""));
                  setData({ rows: [...rows, emptyRow] });
                }}
                className={CLS.addBtn}
              >
                + Add Row
              </button>
            </div>
            {rows.map((row, ri) => (
              <div
                key={ri}
                className="p-3 border border-navy-100 rounded-lg space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-navy-400">Row {ri + 1}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setData({ rows: rows.filter((_, idx) => idx !== ri) })
                    }
                    className={CLS.arrayDeleteBtn}
                  >
                    &times;
                  </button>
                </div>
                {columns.map((col) => (
                  <input
                    key={col.key}
                    type="text"
                    placeholder={col.header || col.key}
                    value={row[col.key] ?? ""}
                    onChange={(e) => {
                      const nextRows = [...rows];
                      nextRows[ri] = { ...nextRows[ri], [col.key]: e.target.value };
                      setData({ rows: nextRows });
                    }}
                    className={CLS.input}
                  />
                ))}
              </div>
            ))}
          </div>
        );
      }

      case "progress": {
        const d = block.data as ProgressBlockData;
        const milestones = d.milestones ?? [];
        return (
          <div className="space-y-3">
            <Field label="Label">
              <input
                type="text"
                value={d.label}
                onChange={(e) => setData({ label: e.target.value })}
                className={CLS.input}
              />
            </Field>
            <RangeField
              label="Value"
              value={d.value}
              min={0}
              max={100}
              suffix="%"
              onChange={(v) => setData({ value: v })}
            />
            <RangeField
              label="Target"
              value={d.target}
              min={0}
              max={100}
              suffix="%"
              onChange={(v) => setData({ target: v })}
            />
            <Field label="Format">
              <select
                value={d.format}
                onChange={(e) => setData({ format: e.target.value })}
                className={CLS.select}
              >
                <option value="bar">Bar</option>
                <option value="radial">Radial</option>
                <option value="stepped">Stepped</option>
              </select>
            </Field>
            <label className="flex items-center gap-2 text-xs text-navy-600 cursor-pointer">
              <input
                type="checkbox"
                checked={d.showLabel}
                onChange={(e) => setData({ showLabel: e.target.checked })}
                className={CLS.checkbox}
              />
              Show Label
            </label>
            <ColorField
              label="Color"
              value={d.color}
              onChange={(v) => setData({ color: v })}
            />
            <div className="flex items-center justify-between">
              <span className={CLS.sectionHeader}>Milestones</span>
              <button
                type="button"
                onClick={() =>
                  setData({
                    milestones: [...milestones, { label: "", position: 50 }],
                  })
                }
                className={CLS.addBtn}
              >
                + Add
              </button>
            </div>
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Label"
                  value={m.label}
                  onChange={(e) => {
                    const next = [...milestones];
                    next[i] = { ...next[i], label: e.target.value };
                    setData({ milestones: next });
                  }}
                  className={CLS.input}
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder="Pos"
                  value={m.position}
                  onChange={(e) => {
                    const next = [...milestones];
                    next[i] = { ...next[i], position: Number(e.target.value) };
                    setData({ milestones: next });
                  }}
                  className={`${CLS.input} w-20`}
                />
                <button
                  type="button"
                  onClick={() =>
                    setData({ milestones: milestones.filter((_, idx) => idx !== i) })
                  }
                  className={CLS.arrayDeleteBtn}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        );
      }

      /* ============================================================ */
      /*  VISUAL BLOCKS                                                */
      /* ============================================================ */

      case "image": {
        const d = block.data as ImageBlockData;
        const filters = d.filters ?? {};
        return (
          <div className="space-y-3">
            <Field label="Source URL">
              <input
                type="text"
                value={d.src}
                onChange={(e) => setData({ src: e.target.value })}
                placeholder="https://..."
                className={CLS.input}
              />
            </Field>
            <Field label="Alt Text">
              <input
                type="text"
                value={d.alt}
                onChange={(e) => setData({ alt: e.target.value })}
                className={CLS.input}
              />
            </Field>
            <Field label="Fit">
              <select
                value={d.fit}
                onChange={(e) => setData({ fit: e.target.value })}
                className={CLS.select}
              >
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="fill">Fill</option>
              </select>
            </Field>
            <Field label="Border Radius">
              <input
                type="number"
                min={0}
                value={d.borderRadius ?? 0}
                onChange={(e) => setData({ borderRadius: Number(e.target.value) })}
                className={CLS.input}
              />
            </Field>
            <Field label="Shadow">
              <select
                value={d.shadow ?? "none"}
                onChange={(e) => setData({ shadow: e.target.value })}
                className={CLS.select}
              >
                <option value="none">None</option>
                <option value="sm">Small</option>
                <option value="md">Medium</option>
                <option value="lg">Large</option>
              </select>
            </Field>
            <RangeField
              label="Opacity"
              value={d.opacity ?? 100}
              min={0}
              max={100}
              suffix="%"
              onChange={(v) => setData({ opacity: v })}
            />
            <Field label="Caption">
              <input
                type="text"
                value={d.caption ?? ""}
                onChange={(e) => setData({ caption: e.target.value })}
                className={CLS.input}
              />
            </Field>
            <Field label="Mask">
              <select
                value={d.mask ?? "none"}
                onChange={(e) => setData({ mask: e.target.value })}
                className={CLS.select}
              >
                <option value="none">None</option>
                <option value="circle">Circle</option>
                <option value="rounded">Rounded</option>
              </select>
            </Field>

            {/* Filters */}
            <details>
              <summary className={`${CLS.sectionHeader} cursor-pointer select-none py-1`}>
                Filters
              </summary>
              <div className="mt-3 space-y-3">
                <RangeField
                  label="Grayscale"
                  value={filters.grayscale ?? 0}
                  min={0}
                  max={100}
                  suffix="%"
                  onChange={(v) =>
                    setData({ filters: { ...filters, grayscale: v } })
                  }
                />
                <RangeField
                  label="Blur"
                  value={filters.blur ?? 0}
                  min={0}
                  max={20}
                  suffix="px"
                  onChange={(v) =>
                    setData({ filters: { ...filters, blur: v } })
                  }
                />
                <RangeField
                  label="Brightness"
                  value={filters.brightness ?? 100}
                  min={0}
                  max={200}
                  suffix="%"
                  onChange={(v) =>
                    setData({ filters: { ...filters, brightness: v } })
                  }
                />
                <RangeField
                  label="Contrast"
                  value={filters.contrast ?? 100}
                  min={0}
                  max={200}
                  suffix="%"
                  onChange={(v) =>
                    setData({ filters: { ...filters, contrast: v } })
                  }
                />
                <RangeField
                  label="Saturate"
                  value={filters.saturate ?? 100}
                  min={0}
                  max={200}
                  suffix="%"
                  onChange={(v) =>
                    setData({ filters: { ...filters, saturate: v } })
                  }
                />
              </div>
            </details>
          </div>
        );
      }

      case "icon": {
        const d = block.data as IconBlockData;
        return (
          <div className="space-y-3">
            <Field label="Icon Name">
              <input
                type="text"
                value={d.iconName}
                onChange={(e) => setData({ iconName: e.target.value })}
                className={CLS.input}
              />
            </Field>
            <Field label="Size">
              <input
                type="number"
                min={8}
                value={d.size}
                onChange={(e) => setData({ size: Number(e.target.value) })}
                className={CLS.input}
              />
            </Field>
            <ColorField
              label="Color"
              value={d.color}
              onChange={(v) => setData({ color: v })}
            />
            <ColorField
              label="Background Color"
              value={d.backgroundColor}
              onChange={(v) => setData({ backgroundColor: v })}
            />
            <Field label="Background Shape">
              <select
                value={d.backgroundShape}
                onChange={(e) => setData({ backgroundShape: e.target.value })}
                className={CLS.select}
              >
                <option value="none">None</option>
                <option value="circle">Circle</option>
                <option value="rounded-square">Rounded Square</option>
                <option value="square">Square</option>
              </select>
            </Field>
            <Field label="Stroke Width">
              <input
                type="number"
                min={0}
                value={d.strokeWidth}
                onChange={(e) => setData({ strokeWidth: Number(e.target.value) })}
                className={CLS.input}
              />
            </Field>
          </div>
        );
      }

      case "logo-grid": {
        const d = block.data as LogoGridBlockData;
        const logos = d.logos ?? [];
        return (
          <div className="space-y-3">
            <Field label="Header">
              <input
                type="text"
                value={d.header ?? ""}
                onChange={(e) => setData({ header: e.target.value })}
                className={CLS.input}
              />
            </Field>
            <Field label="Columns">
              <input
                type="number"
                min={1}
                max={6}
                value={d.columns}
                onChange={(e) => setData({ columns: Number(e.target.value) })}
                className={CLS.input}
              />
            </Field>
            <Field label="Variant">
              <select
                value={d.variant}
                onChange={(e) => setData({ variant: e.target.value })}
                className={CLS.select}
              >
                <option value="default">Default</option>
                <option value="grayscale">Grayscale</option>
              </select>
            </Field>
            <div className="flex items-center justify-between">
              <span className={CLS.sectionHeader}>Logos</span>
              <button
                type="button"
                onClick={() =>
                  setData({ logos: [...logos, { name: "", url: "" }] })
                }
                className={CLS.addBtn}
              >
                + Add
              </button>
            </div>
            {logos.map((logo, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-1">
                  <input
                    type="text"
                    placeholder="Name"
                    value={logo.name}
                    onChange={(e) => {
                      const next = [...logos];
                      next[i] = { ...next[i], name: e.target.value };
                      setData({ logos: next });
                    }}
                    className={CLS.input}
                  />
                  <input
                    type="text"
                    placeholder="URL"
                    value={logo.url ?? ""}
                    onChange={(e) => {
                      const next = [...logos];
                      next[i] = { ...next[i], url: e.target.value };
                      setData({ logos: next });
                    }}
                    className={CLS.input}
                  />
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setData({ logos: logos.filter((_, idx) => idx !== i) })
                  }
                  className={`${CLS.arrayDeleteBtn} mt-1`}
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        );
      }

      case "shape": {
        const d = block.data as ShapeBlockData;
        return (
          <div className="space-y-3">
            <Field label="Shape">
              <select
                value={d.shape}
                onChange={(e) => setData({ shape: e.target.value })}
                className={CLS.select}
              >
                <option value="rectangle">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="line">Line</option>
                <option value="arrow">Arrow</option>
              </select>
            </Field>
            <ColorField
              label="Fill"
              value={d.fill}
              onChange={(v) => setData({ fill: v })}
            />
            <ColorField
              label="Stroke"
              value={d.stroke}
              onChange={(v) => setData({ stroke: v })}
            />
            <Field label="Stroke Width">
              <input
                type="number"
                min={0}
                value={d.strokeWidth}
                onChange={(e) => setData({ strokeWidth: Number(e.target.value) })}
                className={CLS.input}
              />
            </Field>
            <RangeField
              label="Opacity"
              value={d.opacity ?? 100}
              min={0}
              max={100}
              suffix="%"
              onChange={(v) => setData({ opacity: v })}
            />
            <Field label="Rotation">
              <input
                type="number"
                min={-360}
                max={360}
                value={d.rotation ?? 0}
                onChange={(e) => setData({ rotation: Number(e.target.value) })}
                className={CLS.input}
              />
            </Field>
            <Field label="Border Radius">
              <input
                type="number"
                min={0}
                value={d.borderRadius ?? 0}
                onChange={(e) => setData({ borderRadius: Number(e.target.value) })}
                className={CLS.input}
              />
            </Field>
          </div>
        );
      }

      case "video-embed": {
        const d = block.data as VideoEmbedBlockData;
        return (
          <div className="space-y-3">
            <Field label="URL">
              <input
                type="text"
                value={d.url}
                onChange={(e) => setData({ url: e.target.value })}
                placeholder="https://youtube.com/..."
                className={CLS.input}
              />
            </Field>
            <label className="flex items-center gap-2 text-xs text-navy-600 cursor-pointer">
              <input
                type="checkbox"
                checked={d.autoplay}
                onChange={(e) => setData({ autoplay: e.target.checked })}
                className={CLS.checkbox}
              />
              Autoplay
            </label>
            <Field label="Start Time (seconds)">
              <input
                type="number"
                min={0}
                value={d.startTime ?? 0}
                onChange={(e) => setData({ startTime: Number(e.target.value) })}
                className={CLS.input}
              />
            </Field>
            <Field label="Aspect Ratio">
              <select
                value={d.aspectRatio}
                onChange={(e) => setData({ aspectRatio: e.target.value })}
                className={CLS.select}
              >
                <option value="16:9">16:9</option>
                <option value="4:3">4:3</option>
                <option value="1:1">1:1</option>
              </select>
            </Field>
          </div>
        );
      }

      case "device-mockup": {
        const d = block.data as DeviceMockupBlockData;
        return (
          <div className="space-y-3">
            <Field label="Device">
              <select
                value={d.device}
                onChange={(e) => setData({ device: e.target.value })}
                className={CLS.select}
              >
                <option value="iphone">iPhone</option>
                <option value="macbook">MacBook</option>
                <option value="ipad">iPad</option>
                <option value="browser">Browser</option>
              </select>
            </Field>
            <Field label="Screenshot URL">
              <input
                type="text"
                value={d.screenshotSrc}
                onChange={(e) => setData({ screenshotSrc: e.target.value })}
                placeholder="https://..."
                className={CLS.input}
              />
            </Field>
            <Field label="Color Variant">
              <select
                value={d.colorVariant}
                onChange={(e) => setData({ colorVariant: e.target.value })}
                className={CLS.select}
              >
                <option value="silver">Silver</option>
                <option value="space-gray">Space Gray</option>
              </select>
            </Field>
            <Field label="Orientation">
              <select
                value={d.orientation}
                onChange={(e) => setData({ orientation: e.target.value })}
                className={CLS.select}
              >
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </Field>
          </div>
        );
      }

      /* ============================================================ */
      /*  STORY BLOCKS                                                 */
      /* ============================================================ */

      case "team-member": {
        const d = block.data as TeamMemberBlockData;
        return (
          <div className="space-y-3">
            <Field label="Name">
              <input
                type="text"
                value={d.name}
                onChange={(e) => setData({ name: e.target.value })}
                className={CLS.input}
              />
            </Field>
            <Field label="Role">
              <input
                type="text"
                value={d.role}
                onChange={(e) => setData({ role: e.target.value })}
                className={CLS.input}
              />
            </Field>
            <Field label="Bio">
              <textarea
                rows={3}
                value={d.bio ?? ""}
                onChange={(e) => setData({ bio: e.target.value })}
                className={CLS.textarea}
              />
            </Field>
            <Field label="Avatar URL">
              <input
                type="text"
                value={d.avatarUrl ?? ""}
                onChange={(e) => setData({ avatarUrl: e.target.value })}
                placeholder="https://..."
                className={CLS.input}
              />
            </Field>
          </div>
        );
      }

      case "timeline-item": {
        const d = block.data as TimelineItemBlockData;
        return (
          <div className="space-y-3">
            <Field label="Date">
              <input
                type="text"
                value={d.date}
                onChange={(e) => setData({ date: e.target.value })}
                className={CLS.input}
              />
            </Field>
            <Field label="Title">
              <input
                type="text"
                value={d.title}
                onChange={(e) => setData({ title: e.target.value })}
                className={CLS.input}
              />
            </Field>
            <Field label="Description">
              <input
                type="text"
                value={d.description ?? ""}
                onChange={(e) => setData({ description: e.target.value })}
                className={CLS.input}
              />
            </Field>
            <label className="flex items-center gap-2 text-xs text-navy-600 cursor-pointer">
              <input
                type="checkbox"
                checked={d.completed ?? false}
                onChange={(e) => setData({ completed: e.target.checked })}
                className={CLS.checkbox}
              />
              Completed
            </label>
          </div>
        );
      }

      /* ============================================================ */
      /*  LAYOUT BLOCKS                                                */
      /* ============================================================ */

      case "divider": {
        const d = block.data as DividerBlockData;
        return (
          <div className="space-y-3">
            <Field label="Style">
              <select
                value={d.style}
                onChange={(e) => setData({ style: e.target.value })}
                className={CLS.select}
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
                <option value="gradient">Gradient</option>
              </select>
            </Field>
            <Field label="Thickness">
              <input
                type="number"
                min={1}
                max={10}
                value={d.thickness}
                onChange={(e) => setData({ thickness: Number(e.target.value) })}
                className={CLS.input}
              />
            </Field>
            <ColorField
              label="Color"
              value={d.color}
              onChange={(v) => setData({ color: v })}
            />
          </div>
        );
      }

      case "spacer": {
        const d = block.data as SpacerBlockData;
        return (
          <div className="space-y-3">
            <Field label="Height (row units)">
              <input
                type="number"
                min={1}
                max={6}
                value={d.height}
                onChange={(e) => setData({ height: Number(e.target.value) })}
                className={CLS.input}
              />
            </Field>
          </div>
        );
      }

      case "card-group": {
        const d = block.data as CardGroupBlockData;
        const cards = d.cards ?? [];
        return (
          <div className="space-y-3">
            <Field label="Columns">
              <select
                value={d.columns}
                onChange={(e) => setData({ columns: Number(e.target.value) as 2 | 3 | 4 })}
                className={CLS.select}
              >
                <option value={2}>2</option>
                <option value={3}>3</option>
                <option value={4}>4</option>
              </select>
            </Field>
            <div className="flex items-center justify-between">
              <span className={CLS.sectionHeader}>Cards</span>
              <button
                type="button"
                onClick={() =>
                  setData({
                    cards: [...cards, { title: "", body: "", icon: "" }],
                  })
                }
                className={CLS.addBtn}
              >
                + Add
              </button>
            </div>
            {cards.map((card, i) => (
              <div key={i} className="p-3 border border-navy-100 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-navy-400">#{i + 1}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setData({ cards: cards.filter((_, idx) => idx !== i) })
                    }
                    className={CLS.arrayDeleteBtn}
                  >
                    &times;
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Title"
                  value={card.title}
                  onChange={(e) => {
                    const next = [...cards];
                    next[i] = { ...next[i], title: e.target.value };
                    setData({ cards: next });
                  }}
                  className={CLS.input}
                />
                <textarea
                  rows={2}
                  placeholder="Body"
                  value={card.body}
                  onChange={(e) => {
                    const next = [...cards];
                    next[i] = { ...next[i], body: e.target.value };
                    setData({ cards: next });
                  }}
                  className={CLS.textarea}
                />
                <input
                  type="text"
                  placeholder="Icon (optional)"
                  value={card.icon ?? ""}
                  onChange={(e) => {
                    const next = [...cards];
                    next[i] = { ...next[i], icon: e.target.value };
                    setData({ cards: next });
                  }}
                  className={CLS.input}
                />
              </div>
            ))}
          </div>
        );
      }

      default:
        return (
          <p className="text-xs text-navy-400 italic">
            No editable properties for this block type.
          </p>
        );
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div className="space-y-5">
      {commonSection}
      <hr className="border-navy-100" />
      <div>
        <h4 className={`${CLS.sectionHeader} mb-3`}>{meta.label} Properties</h4>
        {renderTypeFields()}
      </div>
    </div>
  );
}
