"use client";

import type { ShapeBlockData } from "@/lib/editor/block-types";

interface ShapeBlockProps {
  data: ShapeBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<ShapeBlockData>) => void;
}

export default function ShapeBlock({
  data,
  isSelected,
  onDataChange,
}: ShapeBlockProps) {
  const { shape, fill, stroke, strokeWidth } = data;

  const renderShape = () => {
    const common = {
      fill,
      stroke: stroke || "transparent",
      strokeWidth,
    };

    switch (shape) {
      case "circle":
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <circle cx="50" cy="50" r={48 - strokeWidth / 2} {...common} />
          </svg>
        );
      case "line":
        return (
          <svg viewBox="0 0 100 20" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <line x1="2" y1="10" x2="98" y2="10" stroke={fill} strokeWidth={strokeWidth || 2} />
          </svg>
        );
      case "arrow":
        return (
          <svg viewBox="0 0 100 30" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <line x1="2" y1="15" x2="85" y2="15" stroke={fill} strokeWidth={strokeWidth || 2} />
            <polygon points="80,5 98,15 80,25" fill={fill} />
          </svg>
        );
      case "rectangle":
      default:
        return (
          <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
            <rect
              x={strokeWidth / 2}
              y={strokeWidth / 2}
              width={100 - strokeWidth}
              height={100 - strokeWidth}
              rx={4}
              {...common}
            />
          </svg>
        );
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Shape picker (selected) */}
      {isSelected && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-50 flex gap-0.5 bg-[#1A1A24] border border-white/10 rounded-md px-0.5 py-0.5">
          {(["rectangle", "circle", "line", "arrow"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onDataChange({ shape: s });
              }}
              className={`px-1.5 py-0.5 text-[10px] capitalize rounded transition-colors ${
                data.shape === s
                  ? "bg-[#4361EE] text-white"
                  : "text-white/50 hover:bg-white/10"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
      {renderShape()}
    </div>
  );
}
