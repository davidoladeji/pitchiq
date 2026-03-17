"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import type { CalloutBlockData } from "@/lib/editor/block-types";

interface CalloutBlockProps {
  data: CalloutBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<CalloutBlockData>) => void;
}

const VARIANT_COLORS: Record<CalloutBlockData["variant"], { border: string; bg: string; icon: string }> = {
  info: { border: "#4361EE", bg: "rgba(67, 97, 238, 0.08)", icon: "\u2139\uFE0F" },
  warning: { border: "#FF9F1C", bg: "rgba(255, 159, 28, 0.08)", icon: "\u26A0\uFE0F" },
  success: { border: "#06D6A0", bg: "rgba(6, 214, 160, 0.08)", icon: "\u2705" },
  tip: { border: "#7209B7", bg: "rgba(114, 9, 183, 0.08)", icon: "\uD83D\uDCA1" },
};

const VARIANT_ICONS: Record<CalloutBlockData["variant"], string> = {
  info: "i",
  warning: "!",
  success: "\u2713",
  tip: "\u2726",
};

export default function CalloutBlock({
  data,
  isSelected,
  onDataChange,
}: CalloutBlockProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const colors = VARIANT_COLORS[data.variant];

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
    <div className="relative w-full h-full flex flex-col justify-center">
      {/* Variant picker */}
      {isSelected && (
        <div className="absolute -top-8 right-0 z-50 flex gap-0.5 bg-[#1A1A24] border border-white/10 rounded-md px-0.5 py-0.5">
          {(["info", "warning", "success", "tip"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onDataChange({ variant: v });
              }}
              className={`px-1.5 py-0.5 text-[10px] capitalize rounded transition-colors ${
                data.variant === v
                  ? "bg-[#4361EE] text-white"
                  : "text-white/50 hover:bg-white/10"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      )}

      <div
        className="flex items-start gap-3 rounded-lg p-4 border-l-4"
        style={{
          borderLeftColor: colors.border,
          backgroundColor: colors.bg,
        }}
      >
        <span
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
          style={{ background: colors.border, color: "#fff" }}
        >
          {VARIANT_ICONS[data.variant]}
        </span>
        <p
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onFocus={() => setIsFocused(true)}
          onBlur={handleBlur}
          className={`flex-1 outline-none text-sm leading-relaxed rounded px-1 transition-shadow ${
            isFocused ? "ring-2 ring-[#4361EE]/50" : ""
          }`}
        >
          {data.text}
        </p>
      </div>
    </div>
  );
}
