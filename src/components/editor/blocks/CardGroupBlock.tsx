"use client";

import { useRef, useCallback } from "react";
import type { CardGroupBlockData } from "@/lib/editor/block-types";

interface CardGroupBlockProps {
  data: CardGroupBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<CardGroupBlockData>) => void;
}

export default function CardGroupBlock({
  data,
  isSelected,
  onDataChange,
}: CardGroupBlockProps) {
  const titleRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const bodyRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const handleTitleBlur = useCallback(
    (index: number) => {
      const text = titleRefs.current[index]?.textContent || "";
      if (text !== data.cards[index]?.title) {
        const newCards = [...data.cards];
        newCards[index] = { ...newCards[index], title: text };
        onDataChange({ cards: newCards });
      }
    },
    [data.cards, onDataChange]
  );

  const handleBodyBlur = useCallback(
    (index: number) => {
      const text = bodyRefs.current[index]?.textContent || "";
      if (text !== data.cards[index]?.body) {
        const newCards = [...data.cards];
        newCards[index] = { ...newCards[index], body: text };
        onDataChange({ cards: newCards });
      }
    },
    [data.cards, onDataChange]
  );

  const addCard = useCallback(() => {
    const newCards = [...data.cards, { title: "New Card", body: "Description" }];
    onDataChange({ cards: newCards });
  }, [data.cards, onDataChange]);

  const removeCard = useCallback(
    (index: number) => {
      if (data.cards.length <= 1) return;
      const newCards = data.cards.filter((_, i) => i !== index);
      onDataChange({ cards: newCards });
    },
    [data.cards, onDataChange]
  );

  return (
    <div className="relative w-full h-full flex flex-col justify-center">
      {/* Column count toggle */}
      {isSelected && (
        <div className="absolute -top-8 right-0 z-50 flex gap-0.5 bg-[#1A1A24] border border-white/10 rounded-md px-0.5 py-0.5">
          {([2, 3, 4] as const).map((cols) => (
            <button
              key={cols}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                onDataChange({ columns: cols });
              }}
              className={`w-6 h-6 flex items-center justify-center rounded text-[10px] font-bold transition-colors ${
                data.columns === cols
                  ? "bg-[#4361EE] text-white"
                  : "text-white/50 hover:bg-white/10"
              }`}
            >
              {cols}
            </button>
          ))}
        </div>
      )}

      <div
        className="grid gap-3 px-2 py-1"
        style={{ gridTemplateColumns: `repeat(${data.columns}, 1fr)` }}
      >
        {data.cards.map((card, i) => (
          <div
            key={i}
            className="relative rounded-xl p-4 flex flex-col gap-1.5 group/card"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Remove card button */}
            {isSelected && data.cards.length > 1 && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  removeCard(i);
                }}
                className="absolute top-1 right-1 w-5 h-5 flex items-center justify-center rounded text-white/20 hover:text-red-400 hover:bg-white/5 opacity-0 group-hover/card:opacity-100 transition-all z-10"
                title="Remove card"
              >
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z" />
                </svg>
              </button>
            )}

            {card.icon && (
              <span className="text-lg select-none">{card.icon}</span>
            )}
            <span
              ref={(el) => { titleRefs.current[i] = el; }}
              contentEditable
              suppressContentEditableWarning
              onBlur={() => handleTitleBlur(i)}
              className="font-bold text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]/50 rounded px-0.5 transition-shadow"
            >
              {card.title}
            </span>
            <span
              ref={(el) => { bodyRefs.current[i] = el; }}
              contentEditable
              suppressContentEditableWarning
              onBlur={() => handleBodyBlur(i)}
              className="text-xs opacity-60 leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-[#4361EE]/50 rounded px-0.5 transition-shadow"
            >
              {card.body}
            </span>
          </div>
        ))}

        {/* Add card button */}
        {isSelected && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              addCard();
            }}
            className="rounded-xl border-2 border-dashed border-white/10 hover:border-white/20 flex items-center justify-center min-h-[80px] text-white/20 hover:text-white/40 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
