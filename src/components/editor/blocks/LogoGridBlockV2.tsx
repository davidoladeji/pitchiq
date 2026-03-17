"use client";

import { useRef, useCallback, type KeyboardEvent } from "react";
import type { LogoGridBlockData } from "@/lib/editor/block-types";

interface LogoGridBlockV2Props {
  data: LogoGridBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<LogoGridBlockData>) => void;
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

export default function LogoGridBlockV2({
  data,
  isSelected,
  onDataChange,
}: LogoGridBlockV2Props) {
  const handleLogoChange = useCallback(
    (index: number, value: string) => {
      const newLogos = [...data.logos];
      newLogos[index] = value;
      onDataChange({ logos: newLogos });
    },
    [data.logos, onDataChange]
  );

  const addLogo = useCallback(() => {
    onDataChange({ logos: [...data.logos, `Partner ${data.logos.length + 1}`] });
  }, [data.logos, onDataChange]);

  const removeLogo = useCallback(
    (index: number) => {
      onDataChange({ logos: data.logos.filter((_, i) => i !== index) });
    },
    [data.logos, onDataChange]
  );

  return (
    <div className="w-full h-full flex flex-col justify-center">
      <div
        className="grid gap-3 p-3"
        style={{ gridTemplateColumns: `repeat(${data.columns}, 1fr)` }}
      >
        {data.logos.map((logo, i) => (
          <div
            key={i}
            className="relative group/logo px-4 py-2.5 rounded-lg text-xs font-medium text-center flex items-center justify-center"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <InlineEdit
              value={logo}
              onChange={(v) => handleLogoChange(i, v)}
            />
            {isSelected && (
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); removeLogo(i); }}
                className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center rounded-full bg-red-500/80 text-white text-[8px] opacity-0 group-hover/logo:opacity-100 transition-opacity"
              >
                \u00D7
              </button>
            )}
          </div>
        ))}
        {isSelected && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); addLogo(); }}
            className="px-4 py-2.5 rounded-lg border-2 border-dashed border-white/10 hover:border-white/20 text-white/20 hover:text-white/40 text-xs transition-colors"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}
