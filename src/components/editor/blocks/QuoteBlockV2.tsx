"use client";

import { useRef, useState, useCallback, useEffect, type KeyboardEvent } from "react";
import type { QuoteBlockData } from "@/lib/editor/block-types";

interface QuoteBlockV2Props {
  data: QuoteBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<QuoteBlockData>) => void;
}

function InlineEdit({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const handleBlur = useCallback(() => { onChange(ref.current?.textContent || ""); }, [onChange]);
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Enter") { e.preventDefault(); (e.target as HTMLElement).blur(); }
  }, []);

  return (
    <span
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]/50 rounded transition-shadow ${className || ""}`}
    >
      {value}
    </span>
  );
}

export default function QuoteBlockV2({
  data,
  isSelected: _isSelected,
  onDataChange,
}: QuoteBlockV2Props) {
  void _isSelected;
  const ref = useRef<HTMLParagraphElement>(null);
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

  return (
    <div
      className="w-full h-full p-4 border-l-4 rounded-r-lg flex flex-col justify-center"
      style={{
        borderColor: "var(--t-accent, #4361EE)",
        background: "rgba(255,255,255,0.03)",
      }}
    >
      <p
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => setIsFocused(true)}
        onBlur={handleBlur}
        className={`italic text-base opacity-80 outline-none rounded transition-shadow ${
          isFocused ? "ring-2 ring-[#4361EE]/50" : ""
        }`}
      >
        {data.text}
      </p>
      <p className="text-xs mt-2 opacity-50 font-semibold">
        &mdash;{" "}
        <InlineEdit
          value={data.author}
          onChange={(v) => onDataChange({ author: v })}
        />
        {data.source && (
          <span className="opacity-70">
            {", "}
            <InlineEdit
              value={data.source}
              onChange={(v) => onDataChange({ source: v })}
            />
          </span>
        )}
      </p>
    </div>
  );
}
