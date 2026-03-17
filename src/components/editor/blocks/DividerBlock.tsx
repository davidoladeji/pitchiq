"use client";

import type { DividerBlockData } from "@/lib/editor/block-types";

interface DividerBlockProps {
  data: DividerBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<DividerBlockData>) => void;
}

export default function DividerBlock({
  data,
  isSelected,
  onDataChange,
}: DividerBlockProps) {
  const color = data.color || "rgba(255,255,255,0.2)";

  const borderStyle =
    data.style === "gradient"
      ? "solid"
      : data.style;

  const background =
    data.style === "gradient"
      ? `linear-gradient(90deg, transparent, ${color}, transparent)`
      : undefined;

  return (
    <div className="relative w-full h-full flex items-center justify-center px-4">
      {/* Style picker when selected */}
      {isSelected && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-50 flex gap-0.5 bg-[#1A1A24] border border-white/10 rounded-md px-0.5 py-0.5">
          {(["solid", "dashed", "dotted", "gradient"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onDataChange({ style: s });
              }}
              className={`px-1.5 py-0.5 text-[10px] capitalize rounded transition-colors ${
                data.style === s
                  ? "bg-[#4361EE] text-white"
                  : "text-white/50 hover:bg-white/10"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {data.style === "gradient" ? (
        <div
          className="w-full rounded"
          style={{
            height: `${data.thickness}px`,
            background,
          }}
        />
      ) : (
        <hr
          className="w-full border-0"
          style={{
            borderTopWidth: `${data.thickness}px`,
            borderTopStyle: borderStyle,
            borderTopColor: color,
          }}
        />
      )}
    </div>
  );
}
