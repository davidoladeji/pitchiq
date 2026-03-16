"use client";

import { useEditorStore } from "./state/editorStore";
import { SlideData, SlideBlock } from "@/lib/types";

interface EditorPropertiesProps {
  plan: string;
}

export default function EditorProperties({ plan: _plan }: EditorPropertiesProps) {
  const slides = useEditorStore((s) => s.slides);
  const selectedSlideIndex = useEditorStore((s) => s.selectedSlideIndex);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const updateSlide = useEditorStore((s) => s.updateSlide);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  const removeBlock = useEditorStore((s) => s.removeBlock);

  const slide = slides[selectedSlideIndex];
  if (!slide) {
    return (
      <div className="h-full bg-white border-l border-navy-200 flex items-center justify-center p-6">
        <p className="text-navy-500 text-sm text-center">No slide selected</p>
      </div>
    );
  }

  const selectedBlock = selectedBlockId
    ? slide.editorBlocks?.find((b) => b.id === selectedBlockId)
    : null;

  return (
    <div className="h-full bg-white border-l border-navy-200 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-navy-100 shrink-0">
        <h3 className="text-sm font-bold text-navy">
          {selectedBlock ? "Block Properties" : "Slide Properties"}
        </h3>
        <p className="text-xs text-navy-500 mt-0.5">
          {selectedBlock
            ? `${selectedBlock.type} block`
            : `Slide ${selectedSlideIndex + 1} of ${slides.length}`}
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-5">
        {selectedBlock ? (
          <BlockProperties
            block={selectedBlock}
            slideIndex={selectedSlideIndex}
            updateBlock={updateBlock}
            removeBlock={removeBlock}
          />
        ) : (
          <SlideProperties
            slide={slide}
            slideIndex={selectedSlideIndex}
            updateSlide={updateSlide}
          />
        )}
      </div>
    </div>
  );
}

function SlideProperties({
  slide,
  slideIndex,
  updateSlide,
}: {
  slide: SlideData;
  slideIndex: number;
  updateSlide: (index: number, patch: Partial<SlideData>) => void;
}) {
  const slideTypes: { value: SlideData["type"]; label: string }[] = [
    { value: "content", label: "Content" },
    { value: "title", label: "Title" },
    { value: "stats", label: "Stats" },
    { value: "metrics", label: "Metrics" },
    { value: "chart", label: "Chart" },
    { value: "comparison", label: "Comparison" },
    { value: "team", label: "Team" },
    { value: "timeline", label: "Timeline" },
    { value: "cta", label: "CTA" },
    { value: "image-content", label: "Image + Content" },
  ];

  const layouts: { value: NonNullable<SlideData["layout"]>; label: string }[] = [
    { value: "default", label: "Default" },
    { value: "centered", label: "Centered" },
    { value: "split", label: "Split" },
    { value: "two-column", label: "Two Column" },
    { value: "stat-highlight", label: "Stat Highlight" },
  ];

  return (
    <>
      <Field label="Title">
        <input
          type="text"
          value={slide.title}
          onChange={(e) => updateSlide(slideIndex, { title: e.target.value })}
          className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus:ring-1 focus:ring-electric/20 focus-visible:ring-offset-white transition-colors"
        />
      </Field>

      <Field label="Subtitle">
        <input
          type="text"
          value={slide.subtitle || ""}
          onChange={(e) => updateSlide(slideIndex, { subtitle: e.target.value })}
          placeholder="Optional subtitle"
          className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus:ring-1 focus:ring-electric/20 focus-visible:ring-offset-white transition-colors placeholder:text-navy-400"
        />
      </Field>

      <Field label="Type">
        <select
          value={slide.type}
          onChange={(e) => updateSlide(slideIndex, { type: e.target.value as SlideData["type"] })}
          className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus:ring-1 focus:ring-electric/20 focus-visible:ring-offset-white transition-colors bg-white"
        >
          {slideTypes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Layout">
        <select
          value={slide.layout || "default"}
          onChange={(e) => updateSlide(slideIndex, { layout: e.target.value as SlideData["layout"] })}
          className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus:ring-1 focus:ring-electric/20 focus-visible:ring-offset-white transition-colors bg-white"
        >
          {layouts.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Accent (Dark)">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={slide.accent || false}
            onChange={(e) => updateSlide(slideIndex, { accent: e.target.checked })}
            className="w-4 h-4 rounded border-navy-300 text-electric focus:ring-[#4361ee]/20"
          />
          <span className="text-sm text-navy-600">Use dark accent background</span>
        </label>
      </Field>

      {/* Content items editor */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-navy-500 uppercase tracking-wider">
            Content Items
          </label>
          <button
            onClick={() => {
              const newContent = [...slide.content, "New item"];
              updateSlide(slideIndex, { content: newContent });
            }}
            className="text-xs text-electric font-semibold hover:text-electric-600 transition-colors"
          >
            + Add
          </button>
        </div>
        <div className="space-y-2">
          {slide.content.map((item, i) => (
            <div key={i} className="flex gap-1.5">
              <input
                type="text"
                value={item}
                onChange={(e) => {
                  const newContent = [...slide.content];
                  newContent[i] = e.target.value;
                  updateSlide(slideIndex, { content: newContent });
                }}
                className="flex-1 px-3 py-1.5 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white transition-colors"
              />
              <button
                onClick={() => {
                  const newContent = slide.content.filter((_, idx) => idx !== i);
                  updateSlide(slideIndex, { content: newContent });
                }}
                className="w-8 h-8 flex items-center justify-center rounded-lg border border-navy-200 text-navy-500 hover:text-red-500 hover:border-red-200 transition-colors shrink-0"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {slide.content.length === 0 && (
            <p className="text-xs text-navy-400 italic">No content items</p>
          )}
        </div>
      </div>

      {/* Metrics editor */}
      {slide.type === "metrics" && (
        <MetricsEditor slide={slide} slideIndex={slideIndex} updateSlide={updateSlide} />
      )}

      {/* Team editor */}
      {slide.type === "team" && (
        <TeamEditor slide={slide} slideIndex={slideIndex} updateSlide={updateSlide} />
      )}

      {/* Timeline editor */}
      {slide.type === "timeline" && (
        <TimelineEditor slide={slide} slideIndex={slideIndex} updateSlide={updateSlide} />
      )}

      {/* Chart data editor */}
      {slide.type === "chart" && (
        <ChartEditor slide={slide} slideIndex={slideIndex} updateSlide={updateSlide} />
      )}
    </>
  );
}

function MetricsEditor({
  slide,
  slideIndex,
  updateSlide,
}: {
  slide: SlideData;
  slideIndex: number;
  updateSlide: (index: number, patch: Partial<SlideData>) => void;
}) {
  const metrics = slide.metrics || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-navy-500 uppercase tracking-wider">
          Metrics
        </label>
        <button
          onClick={() => {
            const newMetrics = [...metrics, { label: "New Metric", value: "0", change: "", trend: "neutral" as const }];
            updateSlide(slideIndex, { metrics: newMetrics });
          }}
          className="text-xs text-electric font-semibold hover:text-electric-600 transition-colors"
        >
          + Add
        </button>
      </div>
      <div className="space-y-3">
        {metrics.map((metric, i) => (
          <div key={i} className="p-3 bg-navy-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-navy-500 font-semibold uppercase">Metric {i + 1}</span>
              <button
                onClick={() => {
                  updateSlide(slideIndex, { metrics: metrics.filter((_, idx) => idx !== i) });
                }}
                className="text-navy-500 hover:text-red-500 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              type="text"
              value={metric.label}
              onChange={(e) => {
                const newMetrics = [...metrics];
                newMetrics[i] = { ...metric, label: e.target.value };
                updateSlide(slideIndex, { metrics: newMetrics });
              }}
              placeholder="Label"
              className="w-full px-2 py-1 rounded border border-navy-200 text-xs outline-none focus:border-electric focus-visible:ring-offset-white"
            />
            <input
              type="text"
              value={metric.value}
              onChange={(e) => {
                const newMetrics = [...metrics];
                newMetrics[i] = { ...metric, value: e.target.value };
                updateSlide(slideIndex, { metrics: newMetrics });
              }}
              placeholder="Value"
              className="w-full px-2 py-1 rounded border border-navy-200 text-xs outline-none focus:border-electric focus-visible:ring-offset-white"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={metric.change || ""}
                onChange={(e) => {
                  const newMetrics = [...metrics];
                  newMetrics[i] = { ...metric, change: e.target.value };
                  updateSlide(slideIndex, { metrics: newMetrics });
                }}
                placeholder="Change (e.g. +24%)"
                className="flex-1 px-2 py-1 rounded border border-navy-200 text-xs outline-none focus:border-electric focus-visible:ring-offset-white"
              />
              <select
                value={metric.trend || "neutral"}
                onChange={(e) => {
                  const newMetrics = [...metrics];
                  newMetrics[i] = { ...metric, trend: e.target.value as "up" | "down" | "neutral" };
                  updateSlide(slideIndex, { metrics: newMetrics });
                }}
                className="px-2 py-1 rounded border border-navy-200 text-xs outline-none focus:border-electric focus-visible:ring-offset-white bg-white"
              >
                <option value="up">Up</option>
                <option value="down">Down</option>
                <option value="neutral">Neutral</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TeamEditor({
  slide,
  slideIndex,
  updateSlide,
}: {
  slide: SlideData;
  slideIndex: number;
  updateSlide: (index: number, patch: Partial<SlideData>) => void;
}) {
  const team = slide.team || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-navy-500 uppercase tracking-wider">
          Team Members
        </label>
        <button
          onClick={() => {
            updateSlide(slideIndex, {
              team: [...team, { name: "New Member", role: "Role", bio: "" }],
            });
          }}
          className="text-xs text-electric font-semibold hover:text-electric-600 transition-colors"
        >
          + Add
        </button>
      </div>
      <div className="space-y-3">
        {team.map((member, i) => (
          <div key={i} className="p-3 bg-navy-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-navy-500 font-semibold uppercase">Member {i + 1}</span>
              <button
                onClick={() => {
                  updateSlide(slideIndex, { team: team.filter((_, idx) => idx !== i) });
                }}
                className="text-navy-500 hover:text-red-500 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <input
              type="text"
              value={member.name}
              onChange={(e) => {
                const newTeam = [...team];
                newTeam[i] = { ...member, name: e.target.value };
                updateSlide(slideIndex, { team: newTeam });
              }}
              placeholder="Name"
              className="w-full px-2 py-1 rounded border border-navy-200 text-xs outline-none focus:border-electric focus-visible:ring-offset-white"
            />
            <input
              type="text"
              value={member.role}
              onChange={(e) => {
                const newTeam = [...team];
                newTeam[i] = { ...member, role: e.target.value };
                updateSlide(slideIndex, { team: newTeam });
              }}
              placeholder="Role"
              className="w-full px-2 py-1 rounded border border-navy-200 text-xs outline-none focus:border-electric focus-visible:ring-offset-white"
            />
            <textarea
              value={member.bio || ""}
              onChange={(e) => {
                const newTeam = [...team];
                newTeam[i] = { ...member, bio: e.target.value };
                updateSlide(slideIndex, { team: newTeam });
              }}
              placeholder="Bio (optional)"
              rows={2}
              className="w-full px-2 py-1 rounded border border-navy-200 text-xs outline-none focus:border-electric focus-visible:ring-offset-white resize-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function TimelineEditor({
  slide,
  slideIndex,
  updateSlide,
}: {
  slide: SlideData;
  slideIndex: number;
  updateSlide: (index: number, patch: Partial<SlideData>) => void;
}) {
  const timeline = slide.timeline || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-navy-500 uppercase tracking-wider">
          Timeline
        </label>
        <button
          onClick={() => {
            updateSlide(slideIndex, {
              timeline: [...timeline, { date: "Q1 2025", title: "Milestone", description: "", completed: false }],
            });
          }}
          className="text-xs text-electric font-semibold hover:text-electric-600 transition-colors"
        >
          + Add
        </button>
      </div>
      <div className="space-y-3">
        {timeline.map((item, i) => (
          <div key={i} className="p-3 bg-navy-50 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-navy-500 font-semibold uppercase">Item {i + 1}</span>
              <button
                onClick={() => {
                  updateSlide(slideIndex, { timeline: timeline.filter((_, idx) => idx !== i) });
                }}
                className="text-navy-500 hover:text-red-500 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={item.date}
                onChange={(e) => {
                  const newTimeline = [...timeline];
                  newTimeline[i] = { ...item, date: e.target.value };
                  updateSlide(slideIndex, { timeline: newTimeline });
                }}
                placeholder="Date"
                className="flex-1 px-2 py-1 rounded border border-navy-200 text-xs outline-none focus:border-electric focus-visible:ring-offset-white"
              />
              <label className="flex items-center gap-1 text-xs text-navy-500">
                <input
                  type="checkbox"
                  checked={item.completed || false}
                  onChange={(e) => {
                    const newTimeline = [...timeline];
                    newTimeline[i] = { ...item, completed: e.target.checked };
                    updateSlide(slideIndex, { timeline: newTimeline });
                  }}
                  className="w-3.5 h-3.5 rounded border-navy-300 text-electric"
                />
                Done
              </label>
            </div>
            <input
              type="text"
              value={item.title}
              onChange={(e) => {
                const newTimeline = [...timeline];
                newTimeline[i] = { ...item, title: e.target.value };
                updateSlide(slideIndex, { timeline: newTimeline });
              }}
              placeholder="Title"
              className="w-full px-2 py-1 rounded border border-navy-200 text-xs outline-none focus:border-electric focus-visible:ring-offset-white"
            />
            <input
              type="text"
              value={item.description || ""}
              onChange={(e) => {
                const newTimeline = [...timeline];
                newTimeline[i] = { ...item, description: e.target.value };
                updateSlide(slideIndex, { timeline: newTimeline });
              }}
              placeholder="Description (optional)"
              className="w-full px-2 py-1 rounded border border-navy-200 text-xs outline-none focus:border-electric focus-visible:ring-offset-white"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartEditor({
  slide,
  slideIndex,
  updateSlide,
}: {
  slide: SlideData;
  slideIndex: number;
  updateSlide: (index: number, patch: Partial<SlideData>) => void;
}) {
  const chartData = slide.chartData || { type: "bar" as const, data: [], label: "" };

  return (
    <div>
      <Field label="Chart Type">
        <select
          value={chartData.type}
          onChange={(e) => {
            updateSlide(slideIndex, {
              chartData: { ...chartData, type: e.target.value as "bar" | "pie" | "line" | "area" },
            });
          }}
          className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white bg-white"
        >
          <option value="bar">Bar</option>
          <option value="pie">Pie</option>
          <option value="line">Line</option>
          <option value="area">Area</option>
        </select>
      </Field>

      <Field label="Y-Axis Label">
        <input
          type="text"
          value={chartData.label || ""}
          onChange={(e) => {
            updateSlide(slideIndex, {
              chartData: { ...chartData, label: e.target.value },
            });
          }}
          placeholder="e.g., Revenue ($M)"
          className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white placeholder:text-navy-400"
        />
      </Field>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold text-navy-500 uppercase tracking-wider">
            Data Points
          </label>
          <button
            onClick={() => {
              updateSlide(slideIndex, {
                chartData: {
                  ...chartData,
                  data: [...chartData.data, { label: `Item ${chartData.data.length + 1}`, value: 50 }],
                },
              });
            }}
            className="text-xs text-electric font-semibold hover:text-electric-600 transition-colors"
          >
            + Add
          </button>
        </div>
        <div className="space-y-2">
          {chartData.data.map((point, i) => (
            <div key={i} className="flex gap-1.5 items-center">
              <input
                type="text"
                value={point.label}
                onChange={(e) => {
                  const newData = [...chartData.data];
                  newData[i] = { ...point, label: e.target.value };
                  updateSlide(slideIndex, { chartData: { ...chartData, data: newData } });
                }}
                placeholder="Label"
                className="flex-1 px-2 py-1 rounded border border-navy-200 text-xs outline-none focus:border-electric focus-visible:ring-offset-white"
              />
              <input
                type="number"
                value={point.value}
                onChange={(e) => {
                  const newData = [...chartData.data];
                  newData[i] = { ...point, value: Number(e.target.value) };
                  updateSlide(slideIndex, { chartData: { ...chartData, data: newData } });
                }}
                className="w-16 px-2 py-1 rounded border border-navy-200 text-xs outline-none focus:border-electric focus-visible:ring-offset-white"
              />
              <button
                onClick={() => {
                  const newData = chartData.data.filter((_, idx) => idx !== i);
                  updateSlide(slideIndex, { chartData: { ...chartData, data: newData } });
                }}
                className="w-6 h-6 flex items-center justify-center rounded border border-navy-200 text-navy-500 hover:text-red-500 hover:border-red-200 transition-colors shrink-0"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function BlockProperties({
  block,
  slideIndex,
  updateBlock,
  removeBlock,
}: {
  block: SlideBlock;
  slideIndex: number;
  updateBlock: (slideIndex: number, blockId: string, patch: Partial<SlideBlock>) => void;
  removeBlock: (slideIndex: number, blockId: string) => void;
}) {
  function updateProp(key: string, value: unknown) {
    updateBlock(slideIndex, block.id, {
      properties: { ...block.properties, [key]: value },
    });
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-navy-500 uppercase tracking-wider capitalize">
          {block.type.replace("-", " ")}
        </span>
        <button
          onClick={() => removeBlock(slideIndex, block.id)}
          className="text-xs text-red-400 hover:text-red-600 font-semibold transition-colors"
        >
          Remove
        </button>
      </div>

      {block.type === "text" && (
        <>
          <Field label="Content">
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(slideIndex, block.id, { content: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white resize-none"
            />
          </Field>
          <Field label="Font Size">
            <input
              type="number"
              value={(block.properties.fontSize as number) || 16}
              onChange={(e) => updateProp("fontSize", Number(e.target.value))}
              min={8}
              max={72}
              className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white"
            />
          </Field>
          <Field label="Alignment">
            <div className="flex gap-1">
              {(["left", "center", "right"] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => updateProp("align", align)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    block.properties.align === align
                      ? "bg-electric text-white border-electric"
                      : "bg-white text-navy-600 border-navy-200 hover:border-navy-300"
                  }`}
                >
                  {align.charAt(0).toUpperCase() + align.slice(1)}
                </button>
              ))}
            </div>
          </Field>
          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!block.properties.bold}
                onChange={(e) => updateProp("bold", e.target.checked)}
                className="w-4 h-4 rounded border-navy-300 text-electric"
              />
              <span className="text-sm text-navy-600 font-bold">B</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!block.properties.italic}
                onChange={(e) => updateProp("italic", e.target.checked)}
                className="w-4 h-4 rounded border-navy-300 text-electric"
              />
              <span className="text-sm text-navy-600 italic">I</span>
            </label>
          </div>
        </>
      )}

      {block.type === "metric" && (
        <>
          <Field label="Label">
            <input
              type="text"
              value={(block.properties.label as string) || ""}
              onChange={(e) => updateProp("label", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white"
            />
          </Field>
          <Field label="Value">
            <input
              type="text"
              value={(block.properties.value as string) || ""}
              onChange={(e) => updateProp("value", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white"
            />
          </Field>
          <Field label="Change">
            <input
              type="text"
              value={(block.properties.change as string) || ""}
              onChange={(e) => updateProp("change", e.target.value)}
              placeholder="e.g., +24%"
              className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white placeholder:text-navy-400"
            />
          </Field>
          <Field label="Trend">
            <select
              value={(block.properties.trend as string) || "neutral"}
              onChange={(e) => updateProp("trend", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white bg-white"
            >
              <option value="up">Up</option>
              <option value="down">Down</option>
              <option value="neutral">Neutral</option>
            </select>
          </Field>
        </>
      )}

      {block.type === "chart" && (
        <>
          <Field label="Chart Type">
            <select
              value={(block.properties.chartType as string) || "bar"}
              onChange={(e) => updateProp("chartType", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white bg-white"
            >
              <option value="bar">Bar</option>
              <option value="pie">Pie</option>
              <option value="line">Line</option>
              <option value="area">Area</option>
            </select>
          </Field>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-navy-500 uppercase tracking-wider">
                Data Points
              </label>
              <button
                onClick={() => {
                  const data = (block.properties.data as Array<{ label: string; value: number }>) || [];
                  updateProp("data", [...data, { label: `Item ${data.length + 1}`, value: 50 }]);
                }}
                className="text-xs text-electric font-semibold hover:text-electric-600 transition-colors"
              >
                + Add
              </button>
            </div>
            <div className="space-y-2">
              {((block.properties.data as Array<{ label: string; value: number }>) || []).map((point, i) => (
                <div key={i} className="flex gap-1.5 items-center">
                  <input
                    type="text"
                    value={point.label}
                    onChange={(e) => {
                      const data = [...((block.properties.data as Array<{ label: string; value: number }>) || [])];
                      data[i] = { ...point, label: e.target.value };
                      updateProp("data", data);
                    }}
                    className="flex-1 px-2 py-1 rounded border border-navy-200 text-xs outline-none focus:border-electric focus-visible:ring-offset-white"
                  />
                  <input
                    type="number"
                    value={point.value}
                    onChange={(e) => {
                      const data = [...((block.properties.data as Array<{ label: string; value: number }>) || [])];
                      data[i] = { ...point, value: Number(e.target.value) };
                      updateProp("data", data);
                    }}
                    className="w-16 px-2 py-1 rounded border border-navy-200 text-xs outline-none focus:border-electric focus-visible:ring-offset-white"
                  />
                  <button
                    onClick={() => {
                      const data = ((block.properties.data as Array<{ label: string; value: number }>) || []).filter((_, idx) => idx !== i);
                      updateProp("data", data);
                    }}
                    className="w-6 h-6 flex items-center justify-center rounded border border-navy-200 text-navy-500 hover:text-red-500 transition-colors shrink-0"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {block.type === "team-member" && (
        <>
          <Field label="Name">
            <input
              type="text"
              value={(block.properties.name as string) || ""}
              onChange={(e) => updateProp("name", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white"
            />
          </Field>
          <Field label="Role">
            <input
              type="text"
              value={(block.properties.role as string) || ""}
              onChange={(e) => updateProp("role", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white"
            />
          </Field>
          <Field label="Bio">
            <textarea
              value={(block.properties.bio as string) || ""}
              onChange={(e) => updateProp("bio", e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white resize-none"
            />
          </Field>
        </>
      )}

      {block.type === "timeline-item" && (
        <>
          <Field label="Date">
            <input
              type="text"
              value={(block.properties.date as string) || ""}
              onChange={(e) => updateProp("date", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white"
            />
          </Field>
          <Field label="Title">
            <input
              type="text"
              value={(block.properties.title as string) || ""}
              onChange={(e) => updateProp("title", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white"
            />
          </Field>
          <Field label="Description">
            <input
              type="text"
              value={(block.properties.description as string) || ""}
              onChange={(e) => updateProp("description", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white"
            />
          </Field>
          <Field label="Completed">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!!block.properties.completed}
                onChange={(e) => updateProp("completed", e.target.checked)}
                className="w-4 h-4 rounded border-navy-300 text-electric"
              />
              <span className="text-sm text-navy-600">Mark as completed</span>
            </label>
          </Field>
        </>
      )}

      {block.type === "quote" && (
        <>
          <Field label="Quote Text">
            <textarea
              value={block.content}
              onChange={(e) => updateBlock(slideIndex, block.id, { content: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white resize-none"
            />
          </Field>
          <Field label="Author">
            <input
              type="text"
              value={(block.properties.author as string) || ""}
              onChange={(e) => updateProp("author", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white"
            />
          </Field>
          <Field label="Source">
            <input
              type="text"
              value={(block.properties.source as string) || ""}
              onChange={(e) => updateProp("source", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white"
            />
          </Field>
        </>
      )}

      {block.type === "logo-grid" && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-navy-500 uppercase tracking-wider">
              Logos / Partners
            </label>
            <button
              onClick={() => {
                const logos = (block.properties.logos as string[]) || [];
                updateProp("logos", [...logos, `Partner ${logos.length + 1}`]);
              }}
              className="text-xs text-electric font-semibold hover:text-electric-600 transition-colors"
            >
              + Add
            </button>
          </div>
          <div className="space-y-2">
            {((block.properties.logos as string[]) || []).map((logo, i) => (
              <div key={i} className="flex gap-1.5">
                <input
                  type="text"
                  value={logo}
                  onChange={(e) => {
                    const logos = [...((block.properties.logos as string[]) || [])];
                    logos[i] = e.target.value;
                    updateProp("logos", logos);
                  }}
                  className="flex-1 px-2 py-1 rounded border border-navy-200 text-xs outline-none focus:border-electric focus-visible:ring-offset-white"
                />
                <button
                  onClick={() => {
                    const logos = ((block.properties.logos as string[]) || []).filter((_, idx) => idx !== i);
                    updateProp("logos", logos);
                  }}
                  className="w-6 h-6 flex items-center justify-center rounded border border-navy-200 text-navy-500 hover:text-red-500 transition-colors shrink-0"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {block.type === "comparison-row" && (
        <>
          <Field label="Feature Label">
            <input
              type="text"
              value={(block.properties.label as string) || ""}
              onChange={(e) => updateProp("label", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white"
            />
          </Field>
          <Field label="Us">
            <input
              type="text"
              value={(block.properties.us as string) || ""}
              onChange={(e) => updateProp("us", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white"
            />
          </Field>
          <Field label="Them">
            <input
              type="text"
              value={(block.properties.them as string) || ""}
              onChange={(e) => updateProp("them", e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-navy-200 text-sm text-navy outline-none focus:border-electric focus-visible:ring-offset-white"
            />
          </Field>
        </>
      )}
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs font-semibold text-navy-500 uppercase tracking-wider block mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}
