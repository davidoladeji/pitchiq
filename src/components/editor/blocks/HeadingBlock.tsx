"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import type { HeadingBlockData } from "@/lib/editor/block-types";

interface HeadingBlockProps {
  data: HeadingBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<HeadingBlockData>) => void;
}

const LEVEL_SIZES: Record<1 | 2 | 3, string> = {
  1: "text-3xl md:text-4xl",
  2: "text-2xl md:text-3xl",
  3: "text-xl md:text-2xl",
};

const LEVEL_TAGS = { 1: "h1", 2: "h2", 3: "h3" } as const;

export default function HeadingBlock({
  data,
  isSelected,
  onDataChange,
}: HeadingBlockProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!isFocused && ref.current && ref.current.textContent !== data.text) {
      ref.current.textContent = data.text;
    }
  }, [data.text, isFocused]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const text = ref.current?.textContent || "";
    if (text !== data.text) {
      onDataChange({ text });
    }
  }, [data.text, onDataChange]);

  const Tag = LEVEL_TAGS[data.level];

  return (
    <div className="relative w-full h-full flex flex-col justify-center">
      {/* Level toggle (visible when selected) */}
      {isSelected && (
        <div className="absolute -top-8 right-0 z-50 flex gap-0.5 bg-[#1A1A24] border border-white/10 rounded-md px-0.5 py-0.5">
          {([1, 2, 3] as const).map((lvl) => (
            <button
              key={lvl}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onDataChange({ level: lvl });
              }}
              className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold transition-colors ${
                data.level === lvl
                  ? "bg-[#4361EE] text-white"
                  : "text-white/50 hover:bg-white/10"
              }`}
            >
              H{lvl}
            </button>
          ))}
        </div>
      )}
      <Tag
        ref={ref as React.RefObject<HTMLHeadingElement>}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        className={`outline-none font-bold tracking-tight leading-tight px-2 py-1 rounded transition-shadow ${
          LEVEL_SIZES[data.level]
        } ${isFocused ? "ring-2 ring-[#4361EE]/50" : ""}`}
        style={{
          textAlign: data.align,
          fontFamily: "var(--t-heading-font)",
          fontWeight: "var(--t-heading-weight)" as unknown as number,
        }}
      >
        {data.text}
      </Tag>
    </div>
  );
}
