"use client";

import { useRef, useCallback, type KeyboardEvent } from "react";
import type { BulletListBlockData } from "@/lib/editor/block-types";

interface BulletListBlockProps {
  data: BulletListBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<BulletListBlockData>) => void;
}

const BULLET_ICONS: Record<BulletListBlockData["style"], string> = {
  disc: "\u2022",
  check: "\u2713",
  arrow: "\u2192",
  number: "", // handled inline
};

export default function BulletListBlock({
  data,
  isSelected,
  onDataChange,
}: BulletListBlockProps) {
  const itemRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const handleItemBlur = useCallback(
    (index: number) => {
      const text = itemRefs.current[index]?.textContent || "";
      if (text !== data.items[index]) {
        const newItems = [...data.items];
        newItems[index] = text;
        onDataChange({ items: newItems });
      }
    },
    [data.items, onDataChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent, index: number) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const newItems = [...data.items];
        newItems.splice(index + 1, 0, "");
        onDataChange({ items: newItems });
        // Focus new item after render
        requestAnimationFrame(() => {
          itemRefs.current[index + 1]?.focus();
        });
      }
      if (
        e.key === "Backspace" &&
        (itemRefs.current[index]?.textContent || "") === "" &&
        data.items.length > 1
      ) {
        e.preventDefault();
        const newItems = data.items.filter((_, i) => i !== index);
        onDataChange({ items: newItems });
        requestAnimationFrame(() => {
          const prevIdx = Math.max(0, index - 1);
          itemRefs.current[prevIdx]?.focus();
        });
      }
    },
    [data.items, onDataChange]
  );

  const bullet = (index: number) => {
    if (data.style === "number") return `${index + 1}.`;
    return BULLET_ICONS[data.style];
  };

  const Tag = data.ordered ? "ol" : "ul";

  return (
    <div className="relative w-full h-full flex flex-col justify-center">
      {/* Style toggle (visible when selected) */}
      {isSelected && (
        <div className="absolute -top-8 right-0 z-50 flex gap-0.5 bg-[#1A1A24] border border-white/10 rounded-md px-0.5 py-0.5">
          {(["disc", "check", "arrow", "number"] as const).map((s) => (
            <button
              key={s}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onDataChange({ style: s, ordered: s === "number" });
              }}
              className={`px-1.5 py-0.5 text-[10px] rounded transition-colors ${
                data.style === s
                  ? "bg-[#4361EE] text-white"
                  : "text-white/50 hover:bg-white/10"
              }`}
            >
              {s === "disc" ? "\u2022" : s === "check" ? "\u2713" : s === "arrow" ? "\u2192" : "1."}
            </button>
          ))}
        </div>
      )}

      <Tag className="space-y-1.5 px-2 py-1">
        {data.items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-base leading-relaxed">
            <span className="text-[#4361EE] font-bold shrink-0 w-5 text-center select-none mt-0.5 text-sm">
              {bullet(i)}
            </span>
            <span
              ref={(el) => { itemRefs.current[i] = el; }}
              contentEditable
              suppressContentEditableWarning
              onBlur={() => handleItemBlur(i)}
              onKeyDown={(e) => handleKeyDown(e, i)}
              className="flex-1 outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]/50 rounded px-0.5 transition-shadow"
            >
              {item}
            </span>
          </li>
        ))}
      </Tag>
    </div>
  );
}
