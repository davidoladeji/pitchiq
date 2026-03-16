"use client";

import { useRef, useState, useCallback, useEffect, type CSSProperties } from "react";

interface TextBlockProps {
  content: string;
  properties: Record<string, unknown>;
  isSelected: boolean;
  onUpdate: (content: string, properties?: Record<string, unknown>) => void;
  onSelect: () => void;
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
  onAlignChange: (a: string) => void;
}) {
  return (
    <div className="absolute -top-10 left-0 z-50 bg-navy-950 rounded-lg shadow-xl border border-white/10 p-1 flex gap-1">
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onToggleBold(); }}
        aria-pressed={bold}
        aria-label="Bold"
        className={`w-7 h-7 flex items-center justify-center rounded text-xs font-bold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 ${bold ? "bg-electric text-white" : "text-white/70 hover:bg-white/10"}`}
        title="Bold"
      >
        B
      </button>
      <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onToggleItalic(); }}
        aria-pressed={italic}
        aria-label="Italic"
        className={`w-7 h-7 flex items-center justify-center rounded text-xs italic transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 ${italic ? "bg-electric text-white" : "text-white/70 hover:bg-white/10"}`}
        title="Italic"
      >
        I
      </button>
      <div className="w-px bg-white/10 mx-0.5" aria-hidden />
      {(["left", "center", "right"] as const).map((a) => (
        <button
          key={a}
          type="button"
          onMouseDown={(e) => { e.preventDefault(); onAlignChange(a); }}
          aria-pressed={align === a}
          aria-label={`Align ${a}`}
          className={`w-7 h-7 flex items-center justify-center rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-950 ${align === a ? "bg-electric text-white" : "text-white/70 hover:bg-white/10"}`}
          title={`Align ${a}`}
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
            {a === "left" && (
              <>
                <rect x="1" y="2" width="14" height="1.5" rx="0.5" />
                <rect x="1" y="6" width="10" height="1.5" rx="0.5" />
                <rect x="1" y="10" width="12" height="1.5" rx="0.5" />
                <rect x="1" y="14" width="8" height="1.5" rx="0.5" />
              </>
            )}
            {a === "center" && (
              <>
                <rect x="1" y="2" width="14" height="1.5" rx="0.5" />
                <rect x="3" y="6" width="10" height="1.5" rx="0.5" />
                <rect x="2" y="10" width="12" height="1.5" rx="0.5" />
                <rect x="4" y="14" width="8" height="1.5" rx="0.5" />
              </>
            )}
            {a === "right" && (
              <>
                <rect x="1" y="2" width="14" height="1.5" rx="0.5" />
                <rect x="5" y="6" width="10" height="1.5" rx="0.5" />
                <rect x="3" y="10" width="12" height="1.5" rx="0.5" />
                <rect x="7" y="14" width="8" height="1.5" rx="0.5" />
              </>
            )}
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function TextBlock({
  content,
  properties,
  isSelected,
  onUpdate,
  onSelect,
}: TextBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [localBold, setLocalBold] = useState(!!properties.bold);
  const [localItalic, setLocalItalic] = useState(!!properties.italic);
  const [localAlign, setLocalAlign] = useState((properties.align as string) || "left");

  // Sync from props when not focused
  useEffect(() => {
    if (!isFocused && ref.current && ref.current.textContent !== content) {
      ref.current.textContent = content;
    }
  }, [content, isFocused]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const text = ref.current?.textContent || "";
    onUpdate(text, {
      ...properties,
      bold: localBold,
      italic: localItalic,
      align: localAlign,
    });
  }, [onUpdate, properties, localBold, localItalic, localAlign]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    onSelect();
  }, [onSelect]);

  const handleToggleBold = useCallback(() => {
    setLocalBold((v) => !v);
  }, []);

  const handleToggleItalic = useCallback(() => {
    setLocalItalic((v) => !v);
  }, []);

  const handleAlignChange = useCallback((a: string) => {
    setLocalAlign(a);
  }, []);

  const fontSize = (properties.fontSize as number) || 18;

  const style: CSSProperties = {
    fontSize: `${fontSize}px`,
    fontWeight: localBold ? 700 : 400,
    fontStyle: localItalic ? "italic" : "normal",
    textAlign: localAlign as CSSProperties["textAlign"],
    minHeight: "1.5em",
  };

  const isEmpty = !content || content.trim() === "";

  return (
    <div
      className={`relative group transition-all rounded-lg ${
        isSelected
          ? "ring-2 ring-electric ring-offset-2"
          : "hover:ring-1 hover:ring-white/20"
      }`}
      onClick={onSelect}
    >
      {isFocused && (
        <FormattingToolbar
          bold={localBold}
          italic={localItalic}
          align={localAlign}
          onToggleBold={handleToggleBold}
          onToggleItalic={handleToggleItalic}
          onAlignChange={handleAlignChange}
        />
      )}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`outline-none px-3 py-2 rounded-lg transition-shadow ${
          isFocused ? "ring-2 ring-electric/50" : ""
        } ${isEmpty && !isFocused ? "text-white/30" : ""}`}
        style={style}
        data-placeholder="Enter your text here..."
      >
        {content}
      </div>
      {isEmpty && !isFocused && (
        <div
          className="absolute inset-0 flex items-center px-3 py-2 pointer-events-none text-white/30"
          style={{ fontSize: `${fontSize}px` }}
        >
          Enter your text here...
        </div>
      )}
    </div>
  );
}
