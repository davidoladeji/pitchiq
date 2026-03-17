"use client";

import { useRef, useCallback, type KeyboardEvent } from "react";
import type { ComparisonRowBlockData } from "@/lib/editor/block-types";

interface ComparisonBlockV2Props {
  data: ComparisonRowBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<ComparisonRowBlockData>) => void;
}

function InlineEdit({
  value,
  onChange,
  className,
  style,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  style?: React.CSSProperties;
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
      style={style}
    >
      {value}
    </span>
  );
}

export default function ComparisonBlockV2({
  data,
  // isSelected reserved for future selection styling
  isSelected: _isSelected,
  onDataChange,
}: ComparisonBlockV2Props) {
  void _isSelected;
  return (
    <div
      className="w-full h-full grid grid-cols-3 gap-4 p-3 rounded-lg items-center"
      style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <InlineEdit
        value={data.label}
        onChange={(v) => onDataChange({ label: v })}
        className="font-semibold text-sm"
      />
      <InlineEdit
        value={data.us}
        onChange={(v) => onDataChange({ us: v })}
        className="text-sm text-center font-medium"
        style={{ color: "var(--t-accent, #4361EE)" }}
      />
      <InlineEdit
        value={data.them}
        onChange={(v) => onDataChange({ them: v })}
        className="text-sm text-center opacity-50"
      />
    </div>
  );
}
