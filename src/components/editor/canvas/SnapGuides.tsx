"use client";

/**
 * SnapGuides — Renders dynamic alignment guides during block drag/resize.
 * Each guide is a thin colored line that appears when a block edge aligns
 * with a grid line, another block, or the slide center.
 */

import type { SnapGuide } from "@/lib/editor/snap-engine";

interface SnapGuidesProps {
  guides: SnapGuide[];
}

const GUIDE_COLORS: Record<SnapGuide["type"], string> = {
  grid: "rgba(67, 97, 238, 0.4)",        // electric blue
  "block-edge": "rgba(247, 37, 133, 0.6)", // pink/magenta
  "block-center": "rgba(114, 9, 183, 0.5)", // violet
  "slide-center": "rgba(6, 214, 160, 0.6)", // emerald
};

export default function SnapGuides({ guides }: SnapGuidesProps) {
  if (guides.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-[15]"
      preserveAspectRatio="none"
    >
      {guides.map((guide, i) => {
        const color = GUIDE_COLORS[guide.type];

        if (guide.axis === "x") {
          // Vertical line
          return (
            <line
              key={`snap-${i}`}
              x1={`${guide.position}%`}
              y1="0%"
              x2={`${guide.position}%`}
              y2="100%"
              stroke={color}
              strokeWidth={1}
              strokeDasharray={guide.type === "slide-center" ? "6 3" : "3 3"}
            />
          );
        }

        // Horizontal line
        return (
          <line
            key={`snap-${i}`}
            x1="0%"
            y1={`${guide.position}%`}
            x2="100%"
            y2={`${guide.position}%`}
            stroke={color}
            strokeWidth={1}
            strokeDasharray={guide.type === "slide-center" ? "6 3" : "3 3"}
          />
        );
      })}
    </svg>
  );
}
