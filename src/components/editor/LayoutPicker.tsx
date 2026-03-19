"use client";

import { useState, useCallback } from "react";
import { useEditorStore } from "./state/editorStore";
import { LAYOUT_LIBRARY } from "@/lib/editor/layout/layout-library";
import {
  LAYOUT_CATEGORIES,
  type LayoutCategory,
  type SlideLayout,
  type LayoutZone,
} from "@/lib/editor/layout/layout-types";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GRID_COLS = 12;
const GRID_ROWS = 6;

const categoryKeys = Object.keys(LAYOUT_CATEGORIES) as LayoutCategory[];

/* ------------------------------------------------------------------ */
/*  Animated layout preview with zone labels on hover                  */
/* ------------------------------------------------------------------ */

function LayoutPreview({
  layout,
  isHovered,
}: {
  layout: SlideLayout;
  isHovered: boolean;
}) {
  const catColor = LAYOUT_CATEGORIES[layout.category].color;
  const pw = 160;
  const ph = 90;
  const cellW = pw / GRID_COLS;
  const cellH = ph / GRID_ROWS;
  const pad = 3;

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${pw} ${ph}`}
      className="rounded-md"
      aria-hidden="true"
    >
      <rect width={pw} height={ph} rx={3} fill="#12121A" />
      {/* Grid dots */}
      {Array.from({ length: (GRID_COLS + 1) * (GRID_ROWS + 1) }).map((_, i) => {
        const gx = i % (GRID_COLS + 1);
        const gy = Math.floor(i / (GRID_COLS + 1));
        return (
          <circle
            key={i}
            cx={gx * cellW}
            cy={gy * cellH}
            r={0.4}
            fill="white"
            opacity={isHovered ? 0.12 : 0.05}
            style={{ transition: "opacity 200ms" }}
          />
        );
      })}
      {layout.zones.map((zone: LayoutZone) => {
        const x = zone.x * cellW + pad;
        const y = zone.y * cellH + pad;
        const w = zone.width * cellW - pad * 2;
        const h = zone.height * cellH - pad * 2;
        return (
          <g key={zone.name}>
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx={2.5}
              fill={catColor}
              fillOpacity={isHovered ? 0.22 : 0.12}
              stroke={catColor}
              strokeOpacity={isHovered ? 0.6 : 0.3}
              strokeWidth={0.75}
              style={{ transition: "all 200ms" }}
            />
            {/* Zone label — only on hover and if zone is big enough */}
            {isHovered && w > 24 && h > 14 && (
              <text
                x={x + w / 2}
                y={y + h / 2 + 2.5}
                textAnchor="middle"
                fontSize={6.5}
                fontWeight={500}
                fill="white"
                opacity={0.55}
              >
                {zone.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Zone count badge                                                   */
/* ------------------------------------------------------------------ */

function ZoneCount({ count, color }: { count: number; color: string }) {
  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 rounded text-[8px] font-bold"
      style={{ backgroundColor: `${color}20`, color }}
    >
      {count}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  LayoutPicker                                                       */
/* ------------------------------------------------------------------ */

export default function LayoutPicker() {
  const [activeCategory, setActiveCategory] = useState<"all" | LayoutCategory>("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const applyLayoutToSlide = useEditorStore((s) => s.applyLayoutToSlide);
  const currentSlideId = useEditorStore((s) => s.currentSlideId);

  const filteredLayouts =
    activeCategory === "all"
      ? LAYOUT_LIBRARY
      : LAYOUT_LIBRARY.filter((l) => l.category === activeCategory);

  const handleApply = useCallback(
    (layout: SlideLayout) => {
      const slideId = currentSlideId();
      if (!slideId) return;
      applyLayoutToSlide(slideId, layout.id);
      setAppliedId(layout.id);
      setTimeout(() => setAppliedId(null), 1200);
    },
    [currentSlideId, applyLayoutToSlide],
  );

  // Category counts
  const categoryCounts: Record<string, number> = { all: LAYOUT_LIBRARY.length };
  for (const key of categoryKeys) {
    categoryCounts[key] = LAYOUT_LIBRARY.filter((l) => l.category === key).length;
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ---- Header ---- */}
      <div className="shrink-0 px-3 pt-3 pb-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-md bg-[#4361EE]/15 flex items-center justify-center">
            <svg className="w-3 h-3 text-[#4361EE]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xs font-semibold text-white leading-tight">Slide Layouts</h2>
            <p className="text-[10px] text-white/40">Click to apply to current slide</p>
          </div>
        </div>
      </div>

      {/* ---- Category filter ---- */}
      <div className="shrink-0 px-3 pb-2">
        <div className="flex gap-1 p-0.5 rounded-lg bg-white/[0.03]">
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`flex-1 flex items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-[10px] font-medium transition-all ${
              activeCategory === "all"
                ? "bg-white/10 text-white shadow-sm"
                : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
            }`}
          >
            All
            <span className="text-[9px] opacity-50">{categoryCounts.all}</span>
          </button>

          {categoryKeys.map((key) => {
            const cat = LAYOUT_CATEGORIES[key];
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={`flex-1 flex items-center justify-center gap-1 rounded-md px-1.5 py-1.5 text-[10px] font-medium transition-all ${
                  isActive
                    ? "bg-white/10 text-white shadow-sm"
                    : "text-white/40 hover:text-white/60 hover:bg-white/[0.04]"
                }`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: isActive ? cat.color : `${cat.color}80` }}
                />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- Category description ---- */}
      {activeCategory !== "all" && (
        <div className="shrink-0 px-3 pb-2">
          <p className="text-[10px] text-white/35 leading-relaxed">
            {LAYOUT_CATEGORIES[activeCategory].description}
          </p>
        </div>
      )}

      {/* ---- Layout grid ---- */}
      <div className="flex-1 overflow-y-auto px-3 pb-3">
        <div className="grid grid-cols-2 gap-2">
          {filteredLayouts.map((layout) => {
            const catColor = LAYOUT_CATEGORIES[layout.category].color;
            const isHovered = hoveredId === layout.id;
            const justApplied = appliedId === layout.id;

            return (
              <button
                key={layout.id}
                type="button"
                onClick={() => handleApply(layout)}
                onMouseEnter={() => setHoveredId(layout.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`group relative flex flex-col rounded-lg border text-left transition-all duration-150 overflow-hidden ${
                  justApplied
                    ? "border-emerald-500/50 bg-emerald-500/10"
                    : isHovered
                      ? "border-white/15 bg-white/[0.06] -translate-y-0.5 shadow-lg shadow-black/20"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
                }`}
              >
                {/* Preview */}
                <div className="p-2 pb-0">
                  <LayoutPreview layout={layout} isHovered={isHovered} />
                </div>

                {/* Info */}
                <div className="px-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <ZoneCount count={layout.zones.length} color={catColor} />
                    <span className="text-[11px] font-medium text-white/80 group-hover:text-white truncate">
                      {layout.name}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[9px] text-white/35 leading-tight line-clamp-1">
                    {layout.description}
                  </p>
                </div>

                {/* Applied checkmark overlay */}
                {justApplied && (
                  <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/10 backdrop-blur-[1px] rounded-lg">
                    <div className="flex items-center gap-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full px-3 py-1">
                      <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-[10px] font-semibold text-emerald-400">Applied</span>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {filteredLayouts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-3">
              <svg className="w-5 h-5 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
              </svg>
            </div>
            <p className="text-xs text-white/30">No layouts in this category</p>
          </div>
        )}
      </div>
    </div>
  );
}
