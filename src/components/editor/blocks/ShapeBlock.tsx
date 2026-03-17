"use client";

import type { ShapeBlockData } from "@/lib/editor/block-types";

// Connector auto-routing is handled by the canvas layer using connectorSource/connectorTarget block IDs

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
  const {
    shape,
    fill,
    stroke,
    strokeWidth,
    opacity = 100,
    rotation = 0,
    borderRadius = 0,
    arrowHead = "single",
    connectorSource,
    connectorTarget,
  } = data;

  const isConnector = !!(connectorSource && connectorTarget);
  const svgOpacity = Math.min(100, Math.max(0, opacity)) / 100;

  const renderShape = () => {
    const sw = strokeWidth ?? 2;

    switch (shape) {
      case "circle":
        return (
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            style={{ opacity: svgOpacity }}
          >
            <circle
              cx="50"
              cy="50"
              r={Math.max(0, 48 - sw / 2)}
              fill={fill}
              stroke={stroke || "transparent"}
              strokeWidth={sw}
            />
          </svg>
        );

      case "line":
        return (
          <svg
            viewBox="0 0 100 20"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            style={{ opacity: svgOpacity }}
          >
            <line
              x1="2"
              y1="10"
              x2="98"
              y2="10"
              stroke={fill}
              strokeWidth={sw}
              strokeDasharray={isConnector ? "6 3" : undefined}
            />
          </svg>
        );

      case "arrow": {
        const headSize = Math.max(8, sw * 3);
        const midY = 15;
        const startX = arrowHead === "double" ? 2 + headSize : 2;
        const endX = arrowHead !== "none" ? 98 - headSize : 98;

        return (
          <svg
            viewBox="0 0 100 30"
            className="w-full h-full"
            preserveAspectRatio="xMidYMid meet"
            style={{ opacity: svgOpacity }}
          >
            <line
              x1={startX}
              y1={midY}
              x2={endX}
              y2={midY}
              stroke={fill}
              strokeWidth={sw}
              strokeDasharray={isConnector ? "6 3" : undefined}
            />
            {/* End arrowhead */}
            {arrowHead !== "none" && (
              <polygon
                points={`${98 - headSize},${midY - headSize / 2} 98,${midY} ${98 - headSize},${midY + headSize / 2}`}
                fill={fill}
              />
            )}
            {/* Start arrowhead (double) */}
            {arrowHead === "double" && (
              <polygon
                points={`${2 + headSize},${midY - headSize / 2} 2,${midY} ${2 + headSize},${midY + headSize / 2}`}
                fill={fill}
              />
            )}
          </svg>
        );
      }

      case "rectangle":
      default:
        return (
          <svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            preserveAspectRatio="none"
            style={{ opacity: svgOpacity }}
          >
            <rect
              x={sw / 2}
              y={sw / 2}
              width={Math.max(0, 100 - sw)}
              height={Math.max(0, 100 - sw)}
              rx={borderRadius}
              fill={fill}
              stroke={stroke || "transparent"}
              strokeWidth={sw}
              strokeDasharray={isConnector ? "6 3" : undefined}
            />
          </svg>
        );
    }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* Shape type picker */}
      {isSelected && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-50 flex gap-0.5 bg-[#1A1A24] border border-white/10 rounded-md px-0.5 py-0.5">
          {(["rectangle", "circle", "line", "arrow"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onDataChange({ shape: s });
              }}
              className={`px-1.5 py-0.5 text-[10px] capitalize rounded transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE] ${
                shape === s
                  ? "bg-[#4361EE] text-white"
                  : "text-white/50 hover:bg-white/10"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Controls panel */}
      {isSelected && (
        <div className="absolute -bottom-[168px] left-1/2 -translate-x-1/2 z-50 w-64 bg-[#1A1A24] border border-white/10 rounded-lg p-3 space-y-2">
          {/* Fill color */}
          <label className="flex items-center justify-between text-[10px] text-white/60">
            <span>Fill</span>
            <input
              type="text"
              value={fill}
              onChange={(e) => onDataChange({ fill: e.target.value })}
              className="w-20 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white text-right focus-visible:ring-2 focus-visible:ring-[#4361EE] outline-none"
            />
          </label>

          {/* Stroke color */}
          <label className="flex items-center justify-between text-[10px] text-white/60">
            <span>Stroke</span>
            <input
              type="text"
              value={stroke}
              onChange={(e) => onDataChange({ stroke: e.target.value })}
              className="w-20 bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] text-white text-right focus-visible:ring-2 focus-visible:ring-[#4361EE] outline-none"
            />
          </label>

          {/* Stroke width */}
          <label className="flex items-center justify-between text-[10px] text-white/60">
            <span>Stroke Width</span>
            <input
              type="range"
              min={0}
              max={10}
              step={0.5}
              value={strokeWidth}
              onChange={(e) =>
                onDataChange({ strokeWidth: parseFloat(e.target.value) })
              }
              className="w-20 accent-[#4361EE]"
            />
          </label>

          {/* Opacity */}
          <label className="flex items-center justify-between text-[10px] text-white/60">
            <span>Opacity</span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={opacity}
              onChange={(e) =>
                onDataChange({ opacity: parseInt(e.target.value, 10) })
              }
              className="w-20 accent-[#4361EE]"
            />
          </label>

          {/* Rotation */}
          <label className="flex items-center justify-between text-[10px] text-white/60">
            <span>Rotation</span>
            <input
              type="range"
              min={-360}
              max={360}
              step={1}
              value={rotation}
              onChange={(e) =>
                onDataChange({ rotation: parseInt(e.target.value, 10) })
              }
              className="w-20 accent-[#4361EE]"
            />
          </label>

          {/* Border radius — rectangle only */}
          {shape === "rectangle" && (
            <label className="flex items-center justify-between text-[10px] text-white/60">
              <span>Radius</span>
              <input
                type="range"
                min={0}
                max={50}
                step={1}
                value={borderRadius}
                onChange={(e) =>
                  onDataChange({ borderRadius: parseInt(e.target.value, 10) })
                }
                className="w-20 accent-[#4361EE]"
              />
            </label>
          )}

          {/* Arrow head style — arrow only */}
          {shape === "arrow" && (
            <div className="flex items-center justify-between text-[10px] text-white/60">
              <span>Arrow Head</span>
              <div className="flex gap-0.5">
                {(["single", "double", "none"] as const).map((ah) => (
                  <button
                    key={ah}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      onDataChange({ arrowHead: ah });
                    }}
                    className={`px-1.5 py-0.5 text-[10px] capitalize rounded transition-colors focus-visible:ring-2 focus-visible:ring-[#4361EE] ${
                      arrowHead === ah
                        ? "bg-[#4361EE] text-white"
                        : "text-white/50 hover:bg-white/10"
                    }`}
                  >
                    {ah}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Connector badge */}
      {isSelected && isConnector && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 z-50 bg-[#4361EE]/20 border border-[#4361EE]/40 text-[#4361EE] text-[9px] font-medium px-2 py-0.5 rounded-full">
          Connector
        </div>
      )}

      {/* Shape SVG with rotation */}
      <div
        className="w-full h-full"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {renderShape()}
      </div>
    </div>
  );
}
