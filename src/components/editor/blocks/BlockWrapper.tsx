"use client";

import { useCallback, useState, useRef, useEffect, type ReactNode, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import type { EditorBlock } from "@/lib/editor/block-types";
import { BLOCK_META } from "@/lib/editor/block-types";
import {
  getAIActionsForBlock,
  executeAIAction,
  type AIActionDef,
} from "@/lib/editor/ai/block-ai-actions";

interface BlockWrapperProps {
  block: EditorBlock;
  isSelected: boolean;
  onSelect: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onToggleLock: () => void;
  onDragStart?: (e: React.PointerEvent) => void;
  onUpdateData?: (dataPatch: Record<string, unknown>) => void;
  children: ReactNode;
}

/** Toolbar height + gap used for positioning */
const TOOLBAR_H = 36; // height of toolbar bar
const TOOLBAR_GAP = 4; // space between toolbar and block

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
  onUpdateData,
  children,
}: BlockWrapperProps) {
  const [showActions, setShowActions] = useState(false);
  const [showAIMenu, setShowAIMenu] = useState(false);
  const [aiLoading, setAILoading] = useState<string | null>(null);
  const [toolbarBelow, setToolbarBelow] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const aiMenuRef = useRef<HTMLDivElement>(null);
  const aiDropdownRef = useRef<HTMLDivElement>(null);
  const aiBtnRef = useRef<HTMLButtonElement>(null);
  const meta = BLOCK_META[block.type as keyof typeof BLOCK_META];
  const aiActions = getAIActionsForBlock(block.type);

  // Detect whether block is too close to the top of its scrollable ancestor
  // so we can flip the toolbar below the block instead of above.
  useEffect(() => {
    if (!isSelected || !wrapperRef.current) return;
    const el = wrapperRef.current;
    const rect = el.getBoundingClientRect();
    // Find the nearest overflow-hidden ancestor (the slide canvas)
    let ancestor = el.parentElement;
    while (ancestor && getComputedStyle(ancestor).overflow !== "hidden") {
      ancestor = ancestor.parentElement;
    }
    if (ancestor) {
      const parentRect = ancestor.getBoundingClientRect();
      const spaceAbove = rect.top - parentRect.top;
      setToolbarBelow(spaceAbove < TOOLBAR_H + TOOLBAR_GAP + 8);
    } else {
      setToolbarBelow(rect.top < TOOLBAR_H + TOOLBAR_GAP + 8);
    }
  }, [isSelected, block.position.y]);

  // Close AI menu on outside click — check both the toolbar button area AND the portal dropdown
  useEffect(() => {
    if (!showAIMenu) return;
    function handleClick(e: MouseEvent) {
      const target = e.target as Node;
      const inButton = aiMenuRef.current?.contains(target);
      const inDropdown = aiDropdownRef.current?.contains(target);
      if (!inButton && !inDropdown) {
        setShowAIMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showAIMenu]);

  const handleAIAction = useCallback(
    async (action: AIActionDef) => {
      if (!onUpdateData) return;
      setAILoading(action.id);
      try {
        // TODO: Replace with real LLM API call
        const patch = await executeAIAction(
          block.type,
          action.id,
          block.data as unknown as Record<string, unknown>,
        );
        if (Object.keys(patch).length > 0) {
          onUpdateData(patch);
        }
      } finally {
        setAILoading(null);
        setShowAIMenu(false);
      }
    },
    [block.type, block.data, onUpdateData],
  );

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
      ref={wrapperRef}
      className={`relative group transition-all ${
        block.locked ? "cursor-default" : "cursor-grab active:cursor-grabbing"
      } ${isSelected ? "" : "hover:outline hover:outline-1 hover:outline-white/20 hover:outline-offset-1"}`}
      style={gridStyle}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={(e) => {
        // Don't hide if moving to the toolbar (which extends above/below the block)
        const rect = e.currentTarget.getBoundingClientRect();
        const extend = 44;
        const top = toolbarBelow ? rect.top - 8 : rect.top - extend;
        const bottom = toolbarBelow ? rect.bottom + extend : rect.bottom + 8;
        if (
          e.clientY >= top &&
          e.clientY <= bottom &&
          e.clientX >= rect.left - 8 &&
          e.clientX <= rect.right + 8
        ) {
          return;
        }
        setShowActions(false);
      }}
    >
      {/* Invisible hover bridge to toolbar — prevents toolbar from disappearing when moving mouse to it */}
      {isSelected && !block.locked && (
        <div className={`absolute left-0 right-0 h-11 z-30 ${toolbarBelow ? "-bottom-11" : "-top-11"}`} />
      )}

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
      {isSelected && showActions && (
        <div className={`absolute left-1/2 -translate-x-1/2 z-40 flex items-center gap-0.5 bg-[#1A1A24] border border-white/10 rounded-lg px-1 py-0.5 shadow-xl pointer-events-auto ${toolbarBelow ? "-bottom-9" : "-top-9"}`}>
          {/* Block type label */}
          <span className="text-[9px] text-white/40 font-medium px-1.5 select-none">
            {meta?.label || block.type}
            {block.locked && (
              <span className="ml-1 text-amber-400/60">locked</span>
            )}
          </span>
          <div className="w-px h-4 bg-white/10" />
          {/* Unlock/Lock — always available */}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
            className={`p-1 rounded transition-colors ${
              block.locked
                ? "text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
                : "text-white/50 hover:text-white hover:bg-white/10"
            }`}
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
          {/* Remaining tools only when unlocked */}
          {!block.locked && (
            <>
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
              {/* AI Actions (Wand2 icon) */}
              {aiActions.length > 0 && (
                <div className="relative" ref={aiMenuRef}>
                  <button
                    ref={aiBtnRef}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowAIMenu(!showAIMenu); }}
                    className={`p-1 rounded transition-colors ${
                      showAIMenu || aiLoading
                        ? "text-[#4361EE] bg-[#4361EE]/20"
                        : "text-white/50 hover:text-[#4361EE] hover:bg-white/10"
                    }`}
                    title="AI Actions"
                  >
                    {aiLoading ? (
                      <svg className="w-3.5 h-3.5 animate-spin motion-reduce:animate-none" fill="none" viewBox="0 0 24 24" aria-hidden>
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zM12 2.25V4.5m5.834.166l-1.591 1.591M20.25 10.5H18M7.757 14.743l-1.59 1.59M6 10.5H3.75m4.007-4.243l-1.59-1.59" />
                      </svg>
                    )}
                  </button>

                  {/* AI Actions dropdown — rendered in a portal to escape overflow:hidden */}
                  {showAIMenu && <AIDropdownPortal
                    anchorRef={aiBtnRef}
                    aiActions={aiActions}
                    aiLoading={aiLoading}
                    onAction={handleAIAction}
                    dropdownRef={aiDropdownRef}
                  />}
                </div>
              )}
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
            </>
          )}
        </div>
      )}

      {/* Lock indicator — clickable to unlock */}
      {block.locked && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onSelect(); onToggleLock(); }}
          className="absolute top-1 right-1 z-20 p-1 rounded hover:bg-white/10 transition-colors group/lock"
          title="Click to unlock"
        >
          <svg className="w-3 h-3 text-amber-400/50 group-hover/lock:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </button>
      )}

      {/* Block content */}
      <div className="w-full h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AI Actions dropdown rendered in a portal (escapes overflow:hidden) */
/* ------------------------------------------------------------------ */

function AIDropdownPortal({
  anchorRef,
  aiActions,
  aiLoading,
  onAction,
  dropdownRef,
}: {
  anchorRef: React.RefObject<HTMLButtonElement | null>;
  aiActions: AIActionDef[];
  aiLoading: string | null;
  onAction: (action: AIActionDef) => void;
  dropdownRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [adjusted, setAdjusted] = useState(false);

  // Initial position: place temporarily to measure height
  useEffect(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    const menuW = 192;
    let left = rect.left + rect.width / 2 - menuW / 2;
    left = Math.max(8, Math.min(left, window.innerWidth - menuW - 8));
    // Temporarily place at button top (will adjust after measuring)
    setPos({ top: rect.top, left });
    setAdjusted(false);
  }, [anchorRef]);

  // Adjust position after first render to place above or below button
  useEffect(() => {
    if (adjusted || !pos || !dropdownRef.current || !anchorRef.current) return;
    const dropH = dropdownRef.current.offsetHeight;
    const btnRect = anchorRef.current.getBoundingClientRect();
    const topAbove = btnRect.top - dropH - 4;
    if (topAbove >= 0) {
      setPos({ top: topAbove, left: pos.left });
    } else {
      setPos({ top: btnRect.bottom + 4, left: pos.left });
    }
    setAdjusted(true);
  }, [adjusted, pos, dropdownRef, anchorRef]);

  if (!pos) return null;

  return createPortal(
    <div
      ref={(el) => { (dropdownRef as React.MutableRefObject<HTMLDivElement | null>).current = el; }}
      className="fixed w-48 bg-[#1A1A24] border border-white/10 rounded-lg shadow-2xl py-1"
      style={{ top: pos.top, left: pos.left, zIndex: 99999 }}
    >
      <div className="px-2.5 py-1.5 text-[9px] text-white/40 uppercase tracking-wider font-semibold">
        AI Actions
      </div>
      {aiActions.map((action) => (
        <button
          key={action.id}
          type="button"
          disabled={!!aiLoading}
          onClick={(e) => {
            e.stopPropagation();
            onAction(action);
          }}
          className="w-full flex flex-col items-start px-2.5 py-1.5 text-left hover:bg-white/5 transition-colors disabled:opacity-40"
        >
          <span className="text-[11px] text-white/80 font-medium">
            {aiLoading === action.id ? "Processing..." : action.label}
          </span>
          <span className="text-[9px] text-white/40 leading-tight">
            {action.description}
          </span>
        </button>
      ))}
    </div>,
    document.body,
  );
}
