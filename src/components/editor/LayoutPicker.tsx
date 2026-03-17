"use client";

import { useState } from "react";
import { useEditorStore } from "./state/editorStore";
import { LAYOUT_LIBRARY } from "@/lib/editor/layout/layout-library";
import {
  LAYOUT_CATEGORIES,
  type LayoutCategory,
  type SlideLayout,
} from "@/lib/editor/layout/layout-types";

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const GRID_COLS = 12;
const GRID_ROWS = 6;
const PREVIEW_W = 120;
const PREVIEW_H = 67.5; // 16:9
const CELL_W = PREVIEW_W / GRID_COLS;
const CELL_H = PREVIEW_H / GRID_ROWS;

const categoryKeys = Object.keys(LAYOUT_CATEGORIES) as LayoutCategory[];

/* ------------------------------------------------------------------ */
/*  Mini layout preview                                                */
/* ------------------------------------------------------------------ */

function LayoutPreview({ layout }: { layout: SlideLayout }) {
  const catColor = LAYOUT_CATEGORIES[layout.category].color;

  return (
    <svg
      width={PREVIEW_W}
      height={PREVIEW_H}
      viewBox={`0 0 ${PREVIEW_W} ${PREVIEW_H}`}
      className="rounded"
      aria-hidden="true"
    >
      <rect
        width={PREVIEW_W}
        height={PREVIEW_H}
        rx={2}
        fill="#1A1A24"
      />
      {layout.zones.map((zone) => (
        <rect
          key={zone.name}
          x={zone.x * CELL_W + 1}
          y={zone.y * CELL_H + 1}
          width={zone.width * CELL_W - 2}
          height={zone.height * CELL_H - 2}
          rx={1.5}
          fill={catColor}
          fillOpacity={0.18}
          stroke={catColor}
          strokeOpacity={0.4}
          strokeWidth={0.75}
        />
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  LayoutPicker                                                       */
/* ------------------------------------------------------------------ */

export default function LayoutPicker() {
  const [activeCategory, setActiveCategory] = useState<
    "all" | LayoutCategory
  >("all");

  const applyLayoutToSlide = useEditorStore((s) => s.applyLayoutToSlide);
  const currentSlideId = useEditorStore((s) => s.currentSlideId);

  const filteredLayouts =
    activeCategory === "all"
      ? LAYOUT_LIBRARY
      : LAYOUT_LIBRARY.filter((l) => l.category === activeCategory);

  function handleApply(layout: SlideLayout) {
    const slideId = currentSlideId();
    if (!slideId) return;
    applyLayoutToSlide(slideId, layout.id);
  }

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[#0F0F14]">
      {/* ---- Header ---- */}
      <div className="shrink-0 px-4 pt-4 pb-2">
        <h2 className="text-sm font-semibold tracking-wide text-white">
          Layouts
        </h2>
        <p className="mt-0.5 text-xs text-white/50">
          Apply a layout to the current slide
        </p>
      </div>

      {/* ---- Category tabs ---- */}
      <div className="shrink-0 px-4 pb-3">
        <div className="flex flex-wrap gap-1.5">
          {/* "All" tab */}
          <button
            type="button"
            onClick={() => setActiveCategory("all")}
            className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE] ${
              activeCategory === "all"
                ? "bg-white/10 text-white"
                : "bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/70"
            }`}
          >
            All
          </button>

          {categoryKeys.map((key) => {
            const cat = LAYOUT_CATEGORIES[key];
            const isActive = activeCategory === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveCategory(key)}
                className={`inline-flex min-h-[44px] items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE] ${
                  isActive
                    ? "bg-white/10 text-white"
                    : "bg-white/[0.04] text-white/50 hover:bg-white/[0.08] hover:text-white/70"
                }`}
              >
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: cat.color }}
                  aria-hidden="true"
                />
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- Layout grid ---- */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-2 gap-3">
          {filteredLayouts.map((layout) => {
            const catColor = LAYOUT_CATEGORIES[layout.category].color;
            return (
              <button
                key={layout.id}
                type="button"
                onClick={() => handleApply(layout)}
                className="group flex min-h-[44px] flex-col items-start rounded-lg bg-white/[0.03] p-2.5 text-left transition-colors hover:bg-white/[0.07] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]"
              >
                {/* Preview */}
                <div className="mb-2 w-full">
                  <LayoutPreview layout={layout} />
                </div>

                {/* Name */}
                <span className="flex items-center gap-1.5 text-xs font-medium text-white/80 group-hover:text-white">
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: catColor }}
                    aria-hidden="true"
                  />
                  {layout.name}
                </span>

                {/* Description */}
                <span className="mt-0.5 text-[11px] leading-tight text-white/40">
                  {layout.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
