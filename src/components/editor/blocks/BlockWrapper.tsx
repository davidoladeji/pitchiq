"use client";

import { useCallback, useState, type ReactNode, type CSSProperties } from "react";
import type { EditorBlock } from "@/lib/editor/block-types";
import { BLOCK_META } from "@/lib/editor/block-types";

interface BlockWrapperProps {
  block: EditorBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleLock: () => void;
  onDragStart?: (e: React.PointerEvent) => void;
  children: ReactNode;
}

/** Corner resize handle positions */
const HANDLES = [
  { cursor: "nw-resize", position: "top-0 left-0 -translate-x-1/2 -translate-y-1/2" },
  { cursor: "ne-resize", position: "top-0 right-0 translate-x-1/2 -translate-y-1/2" },
  { cursor: "sw-resize", position: "bottom-0 left-0 -translate-x-1/2 translate-y-1/2" },
  { cursor: "se-resize", position: "bottom-0 right-0 translate-x-1/2 translate-y-1/2" },
] as const;

export default function BlockWrapper({
  block,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onToggleLock,
  onDragStart,
  children,
}: BlockWrapperProps) {
  const [showActions, setShowActions] = useState(false);
  const meta = BLOCK_META[block.type as keyof typeof BLOCK_META];

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onSelect();
    },
    [onSelect]
  );

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (block.locked || !onDragStart) return;
      // Only start drag on primary button, not on toolbar buttons
      if (e.button !== 0) return;
      // Don't start drag if clicking on interactive content (contentEditable, buttons, inputs)
      const target = e.target as HTMLElement;
      if (
        target.isContentEditable ||
        target.tagName === "BUTTON" ||
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.closest("button") ||
        target.closest("[contenteditable]")
      ) return;
      onDragStart(e);
    },
    [block.locked, onDragStart]
  );

  // Grid position → CSS grid placement
  const gridStyle: CSSProperties = {
    gridColumn: `${Math.round(block.position.x) + 1} / span ${Math.round(block.position.width)}`,
    gridRow: `${Math.round(block.position.y) + 1} / span ${Math.max(Math.round(block.position.height), 1)}`,
    zIndex: block.position.zIndex,
    opacity: block.hidden ? 0.3 : (block.style.opacity ?? 1),
    backgroundColor: block.style.backgroundColor || undefined,
    borderRadius: block.style.borderRadius ? `${block.style.borderRadius}px` : undefined,
    padding: block.style.padding ? `${block.style.padding}px` : undefined,
    boxShadow:
      block.style.shadow === "sm"
        ? "0 1px 2px rgba(0,0,0,0.15)"
        : block.style.shadow === "md"
        ? "0 4px 6px rgba(0,0,0,0.2)"
        : block.style.shadow === "lg"
        ? "0 10px 15px rgba(0,0,0,0.25)"
        : undefined,
  };

  return (
    <div
      className={`relative group transition-all ${
        block.locked ? "pointer-events-none" : "cursor-grab active:cursor-grabbing"
      } ${isSelected ? "" : "hover:outline hover:outline-1 hover:outline-white/20 hover:outline-offset-1"}`}
      style={gridStyle}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Selection ring */}
      {isSelected && (
        <div className="absolute inset-0 rounded-lg outline outline-2 outline-[#4361EE] outline-offset-2 pointer-events-none z-20" />
      )}

      {/* Resize handles (selected only) */}
      {isSelected && !block.locked && (
        <>
          {HANDLES.map((h) => (
            <div
              key={h.cursor}
              className={`absolute ${h.position} w-2 h-2 bg-white border-2 border-[#4361EE] rounded-sm z-30 pointer-events-auto`}
              style={{ cursor: h.cursor }}
            />
          ))}
        </>
      )}

      {/* Floating action toolbar */}
      {isSelected && showActions && !block.locked && (
        <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-40 flex items-center gap-0.5 bg-[#1A1A24] border border-white/10 rounded-lg px-1 py-0.5 shadow-xl pointer-events-auto">
          {/* Block type label */}
          <span className="text-[9px] text-white/40 font-medium px-1.5 select-none">
            {meta?.label || block.type}
          </span>
          <div className="w-px h-4 bg-white/10" />
          {/* Duplicate */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors"
            title="Duplicate"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          {/* Lock */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
            className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors"
            title={block.locked ? "Unlock" : "Lock"}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {block.locked ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 119 0v3.75M3.75 21.75h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H3.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              )}
            </svg>
          </button>
          {/* Delete */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 text-white/50 hover:text-red-400 hover:bg-white/10 rounded transition-colors"
            title="Delete"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}

      {/* Lock indicator */}
      {block.locked && (
        <div className="absolute top-1 right-1 z-20 pointer-events-none">
          <svg className="w-3 h-3 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
      )}

      {/* Block content */}
      <div className="w-full h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}
