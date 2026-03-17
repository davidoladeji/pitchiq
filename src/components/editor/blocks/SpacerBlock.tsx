"use client";

import type { SpacerBlockData } from "@/lib/editor/block-types";

interface SpacerBlockProps {
  data: SpacerBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<SpacerBlockData>) => void;
}

export default function SpacerBlock({
  data,
  isSelected,
}: SpacerBlockProps) {
  return (
    <div
      className={`w-full h-full transition-all ${
        isSelected
          ? "border border-dashed border-white/30 rounded-lg"
          : "border border-dashed border-transparent hover:border-white/10 rounded-lg"
      }`}
    >
      {isSelected && (
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-[10px] text-white/30 font-mono select-none">
            spacer ({data.height}r)
          </span>
        </div>
      )}
    </div>
  );
}
