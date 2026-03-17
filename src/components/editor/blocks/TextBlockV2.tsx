"use client";

import { useRef, useState, useCallback, useEffect, type CSSProperties } from "react";
import type { TextBlockData } from "@/lib/editor/block-types";

interface TextBlockV2Props {
  data: TextBlockData;
  isSelected: boolean;
  onDataChange: (patch: Partial<TextBlockData>) => void;
}

function FormattingToolbar({
  bold,
  italic,
  align,
  onToggleBold,
  onToggleItalic,
  onAlignChange,
}: {
  bold: boolean;
  italic: boolean;
  align: string;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onAlignChange: (a: "left" | "center" | "right") => void;
}) {
  return (
    <div className="absolute -top-10 left-0 z-50 bg-[#1A1A24] rounded-lg shadow-xl border border-white/10 p-1 flex gap-1">
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onToggleBold(); }}
        aria-pressed={bold}
        className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-colors ${bold ? "bg-[#4361EE] text-white" : "text-white/70 hover:bg-white/10"}`}
        title="Bold"
      >
        B
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onToggleItalic(); }}
        aria-pressed={italic}
        className={`w-7 h-7 flex items-center justify-center rounded text-xs italic transition-colors ${italic ? "bg-[#4361EE] text-white" : "text-white/70 hover:bg-white/10"}`}
        title="Italic"
      >
        I
      </button>
      <div className="w-px bg-white/10 mx-0.5" />
      {(["left", "center", "right"] as const).map((a) => (
        <button
          key={a}
          type="button"
          onMouseDown={(e) => { e.preventDefault(); onAlignChange(a); }}
          aria-pressed={align === a}
          className={`w-7 h-7 flex items-center justify-center rounded transition-colors ${align === a ? "bg-[#4361EE] text-white" : "text-white/70 hover:bg-white/10"}`}
          title={`Align ${a}`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
            {a === "left" && (<><rect x="1" y="2" width="14" height="1.5" rx="0.5" /><rect x="1" y="6" width="10" height="1.5" rx="0.5" /><rect x="1" y="10" width="12" height="1.5" rx="0.5" /><rect x="1" y="14" width="8" height="1.5" rx="0.5" /></>)}
            {a === "center" && (<><rect x="1" y="2" width="14" height="1.5" rx="0.5" /><rect x="3" y="6" width="10" height="1.5" rx="0.5" /><rect x="2" y="10" width="12" height="1.5" rx="0.5" /><rect x="4" y="14" width="8" height="1.5" rx="0.5" /></>)}
            {a === "right" && (<><rect x="1" y="2" width="14" height="1.5" rx="0.5" /><rect x="5" y="6" width="10" height="1.5" rx="0.5" /><rect x="3" y="10" width="12" height="1.5" rx="0.5" /><rect x="7" y="14" width="8" height="1.5" rx="0.5" /></>)}
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function TextBlockV2({
  data,
  isSelected: _isSelected,
  onDataChange,
}: TextBlockV2Props) {
  void _isSelected;
  const ref = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [localBold, setLocalBold] = useState(data.bold);
  const [localItalic, setLocalItalic] = useState(data.italic);
  const [localAlign, setLocalAlign] = useState(data.align);

  useEffect(() => {
    setLocalBold(data.bold);
    setLocalItalic(data.italic);
    setLocalAlign(data.align);
  }, [data.bold, data.italic, data.align]);

  useEffect(() => {
    if (!isFocused && ref.current && ref.current.textContent !== data.text) {
      ref.current.textContent = data.text;
    }
  }, [data.text, isFocused]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const text = ref.current?.textContent || "";
    onDataChange({
      text,
      bold: localBold,
      italic: localItalic,
      align: localAlign,
    });
  }, [onDataChange, localBold, localItalic, localAlign]);

  const style: CSSProperties = {
    fontSize: `${data.fontSize}px`,
    fontWeight: localBold ? 700 : 400,
    fontStyle: localItalic ? "italic" : "normal",
    textAlign: localAlign,
    minHeight: "1.5em",
  };

  const isEmpty = !data.text || data.text.trim() === "";

  return (
    <div className="relative w-full h-full flex flex-col justify-center">
      {isFocused && (
        <FormattingToolbar
          bold={localBold}
          italic={localItalic}
          align={localAlign}
          onToggleBold={() => setLocalBold((v) => !v)}
          onToggleItalic={() => setLocalItalic((v) => !v)}
          onAlignChange={setLocalAlign}
        />
      )}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onFocus={() => { setIsFocused(true); }}
        onBlur={handleBlur}
        className={`outline-none px-3 py-2 rounded-lg transition-shadow ${
          isFocused ? "ring-2 ring-[#4361EE]/50" : ""
        } ${isEmpty && !isFocused ? "text-white/30" : ""}`}
        style={style}
      >
        {data.text}
      </div>
      {isEmpty && !isFocused && (
        <div
          className="absolute inset-0 flex items-center px-3 py-2 pointer-events-none text-white/30"
          style={{ fontSize: `${data.fontSize}px` }}
        >
          Enter your text here...
        </div>
      )}
    </div>
  );
}
