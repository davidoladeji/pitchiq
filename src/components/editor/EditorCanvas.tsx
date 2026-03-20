"use client";

import { useRef, useState, useCallback, useEffect, CSSProperties } from "react";
import { useEditorStore } from "./state/editorStore";
import { getTheme, ThemeDef } from "@/lib/themes";
import { SlideData, SlideBlock } from "@/lib/types";
import { useDroppable } from "@dnd-kit/core";
import type { EditorBlock, BlockPosition } from "@/lib/editor/block-types";
import { computeSnap, computeAutoSpacing, GRID_COLUMNS, GRID_ROWS } from "@/lib/editor/snap-engine";
import type { SnapGuide } from "@/lib/editor/snap-engine";
import GridOverlay from "./canvas/GridOverlay";
import SnapGuides from "./canvas/SnapGuides";
import BlockWrapper from "./blocks/BlockWrapper";
import BlockRenderer from "./blocks/BlockRenderer";

function themeVars(theme: ThemeDef): CSSProperties {
  return {
    "--t-bg-dark": theme.bgDark,
    "--t-bg-light": theme.bgLight,
    "--t-text": theme.textPrimary,
    "--t-text-secondary": theme.textSecondary,
    "--t-accent": theme.accent,
    "--t-accent-light": theme.accentLight,
    "--t-card-bg": theme.cardBg,
    "--t-heading-font": theme.headingFont,
    "--t-heading-weight": String(theme.headingWeight),
  } as CSSProperties;
}

const headingStyle: CSSProperties = {
  fontFamily: "var(--t-heading-font)",
  fontWeight: "var(--t-heading-weight)" as unknown as number,
};

export default function EditorCanvas() {
  const slides = useEditorStore((s) => s.slides);
  const selectedSlideIndex = useEditorStore((s) => s.selectedSlideIndex);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const themeId = useEditorStore((s) => s.themeId);
  const deck = useEditorStore((s) => s.deck);
  const updateSlide = useEditorStore((s) => s.updateSlide);
  const selectBlock = useEditorStore((s) => s.selectBlock);
  const updateBlock = useEditorStore((s) => s.updateBlock);
  // v2 actions
  const slideBlocks = useEditorStore((s) => s.slideBlocks);
  const slideBlockOrder = useEditorStore((s) => s.slideBlockOrder);
  const updateBlockData = useEditorStore((s) => s.updateBlockData);
  const updateBlockPosition = useEditorStore((s) => s.updateBlockPosition);
  const removeBlockV2 = useEditorStore((s) => s.removeBlockV2);
  const duplicateBlock = useEditorStore((s) => s.duplicateBlock);
  const toggleBlockLocked = useEditorStore((s) => s.toggleBlockLocked);
  const getSlideBlocks = useEditorStore((s) => s.getSlideBlocks);

  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const theme = getTheme(themeId);
  const slide = slides[selectedSlideIndex];

  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: "editor-canvas-drop",
  });

  // Calculate scale to fit canvas in available space
  useEffect(() => {
    function resize() {
      if (!containerRef.current) return;
      const containerW = containerRef.current.clientWidth - 64;
      const containerH = containerRef.current.clientHeight - 64;
      const slideW = 960;
      const slideH = 540;
      const s = Math.min(containerW / slideW, containerH / slideH, 1);
      setScale(Math.max(s, 0.3));
    }
    resize();
    const ro = new ResizeObserver(resize);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  if (!slide || !deck) {
    return (
      <div className="h-full bg-navy-800 flex items-center justify-center">
        <p className="text-white/30 text-sm">No slide selected</p>
      </div>
    );
  }

  const isDark = slide.type === "title" || slide.type === "cta" || !!slide.accent;
  const slideId = slide.id || "";

  // Check if this slide has v2 blocks
  const v2Blocks = slideId ? slideBlocks[slideId] : undefined;
  const v2Order = slideId ? slideBlockOrder[slideId] : undefined;
  const hasV2Blocks = v2Blocks && v2Order && v2Order.length > 0;

  return (
    <div
      ref={containerRef}
      className="h-full bg-navy-800 flex items-center justify-center overflow-hidden relative"
    >
      <div
        ref={setDropRef}
        className={`relative rounded-xl overflow-hidden shadow-2xl transition-shadow ${
          isOver ? "ring-2 ring-electric ring-offset-2 ring-offset-navy-800" : ""
        }`}
        style={{
          width: 960 * scale,
          height: 540 * scale,
        }}
      >
        {/* Actual slide content at native size, scaled down */}
        <div
          className="origin-top-left"
          style={{
            width: 960,
            height: 540,
            transform: `scale(${scale})`,
            ...themeVars(theme),
          }}
        >
          {hasV2Blocks ? (
            <V2SlideCanvas
              slide={slide}
              slideId={slideId}
              blocks={v2Blocks}
              order={v2Order}
              isDark={isDark}
              selectedBlockId={selectedBlockId}
              onSelectBlock={selectBlock}
              onUpdateBlockData={updateBlockData}
              onUpdateBlockPosition={updateBlockPosition}
              onRemoveBlock={removeBlockV2}
              onDuplicateBlock={duplicateBlock}
              onToggleLock={toggleBlockLocked}
              getSlideBlocks={getSlideBlocks}
            />
          ) : (
            <LegacyEditableSlide
              slide={slide}
              slideIndex={selectedSlideIndex}
              companyName={deck.companyName}
              theme={theme}
              isDark={isDark}
              selectedBlockId={selectedBlockId}
              onUpdateSlide={updateSlide}
              onSelectBlock={selectBlock}
              onUpdateBlock={updateBlock}
            />
          )}
        </div>

        {/* Slide number overlay */}
        <div className="absolute bottom-2 right-3 text-[10px] opacity-30 font-mono text-white z-20 pointer-events-none">
          {String(selectedSlideIndex + 1).padStart(2, "0")} /{" "}
          {String(slides.length).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  V2 Grid Canvas (new block system)                                  */
/* ------------------------------------------------------------------ */

function V2SlideCanvas(props: {
  slide: SlideData;
  slideId: string;
  blocks: Record<string, EditorBlock>;
  order: string[];
  isDark: boolean;
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onUpdateBlockData: (slideId: string, blockId: string, patch: Record<string, unknown>) => void;
  onUpdateBlockPosition: (slideId: string, blockId: string, position: Partial<BlockPosition>) => void;
  onRemoveBlock: (slideId: string, blockId: string) => void;
  onDuplicateBlock: (slideId: string, blockId: string) => void;
  onToggleLock: (slideId: string, blockId: string) => void;
  getSlideBlocks: (slideId: string) => EditorBlock[];
}) {
  const {
    slide, slideId, blocks, order, isDark,
    selectedBlockId,
    onSelectBlock, onUpdateBlockData, onUpdateBlockPosition,
    onRemoveBlock, onDuplicateBlock, onToggleLock, getSlideBlocks,
  } = props;

  const gridRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [activeGuides, setActiveGuides] = useState<SnapGuide[]>([]);
  const [dragBlockId, setDragBlockId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPos, setDragPos] = useState<BlockPosition | null>(null);

  const bg = isDark ? "var(--t-bg-dark)" : "var(--t-bg-light)";
  const accent = isDark ? "var(--t-accent-light)" : "var(--t-accent)";

  // Convert pixel position to grid coordinates
  const pxToGrid = useCallback((px: number, py: number): { gx: number; gy: number } => {
    if (!gridRef.current) return { gx: 0, gy: 0 };
    const rect = gridRef.current.getBoundingClientRect();
    const gx = ((px - rect.left) / rect.width) * GRID_COLUMNS;
    const gy = ((py - rect.top) / rect.height) * GRID_ROWS;
    return { gx, gy };
  }, []);

  // Start dragging a block
  const handleDragStart = useCallback((blockId: string, e: React.PointerEvent) => {
    const block = blocks[blockId];
    if (!block || block.locked) return;

    e.preventDefault();
    e.stopPropagation();

    const { gx, gy } = pxToGrid(e.clientX, e.clientY);
    setDragBlockId(blockId);
    setDragOffset({ x: gx - block.position.x, y: gy - block.position.y });
    setDragPos(block.position);
    setIsDragging(true);
    onSelectBlock(blockId);
  }, [blocks, pxToGrid, onSelectBlock]);

  // During drag
  useEffect(() => {
    if (!isDragging || !dragBlockId) return;

    const handleMove = (e: PointerEvent) => {
      const { gx, gy } = pxToGrid(e.clientX, e.clientY);
      const block = blocks[dragBlockId];
      if (!block) return;

      const proposedX = Math.max(0, Math.min(GRID_COLUMNS - block.position.width, gx - dragOffset.x));
      const proposedY = Math.max(0, Math.min(GRID_ROWS - block.position.height, gy - dragOffset.y));

      const proposed: BlockPosition = {
        ...block.position,
        x: proposedX,
        y: proposedY,
      };

      const allBlocks = getSlideBlocks(slideId);
      const { snappedPosition, guides } = computeSnap(proposed, dragBlockId, allBlocks);

      setDragPos(snappedPosition);
      setActiveGuides(guides);
    };

    const handleUp = () => {
      if (dragBlockId && dragPos) {
        onUpdateBlockPosition(slideId, dragBlockId, {
          x: Math.round(dragPos.x * 4) / 4,
          y: Math.round(dragPos.y * 4) / 4,
        });

        // Auto-spacing: nudge neighbors
        const allBlocks = getSlideBlocks(slideId);
        const movedBlock = allBlocks.find((b) => b.id === dragBlockId);
        if (movedBlock) {
          const updatedBlock = { ...movedBlock, position: { ...movedBlock.position, ...dragPos } };
          const nudges = computeAutoSpacing(updatedBlock, allBlocks);
          nudges.forEach((nudge, id) => {
            onUpdateBlockPosition(slideId, id, nudge);
          });
        }
      }
      setIsDragging(false);
      setDragBlockId(null);
      setDragPos(null);
      setActiveGuides([]);
    };

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [isDragging, dragBlockId, dragOffset, dragPos, blocks, slideId, pxToGrid, getSlideBlocks, onUpdateBlockPosition]);

  // Get the display position for a block (use drag position if actively dragging)
  const getBlockPosition = useCallback((block: EditorBlock) => {
    if (isDragging && dragBlockId === block.id && dragPos) {
      return dragPos;
    }
    return block.position;
  }, [isDragging, dragBlockId, dragPos]);

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: bg, color: isDark ? "var(--t-text)" : "var(--t-bg-dark)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onSelectBlock(null);
      }}
    >
      {/* Decorative grid for dark slides */}
      {isDark && (
        <div className="absolute inset-0 bg-grid-dark opacity-10 pointer-events-none" />
      )}

      {/* Accent line */}
      {isDark && slide.type !== "title" && slide.type !== "cta" && (
        <div
          className="absolute top-0 left-0 right-0 h-1 pointer-events-none"
          style={{ background: accent }}
        />
      )}

      {/* Glow for title / CTA */}
      {(slide.type === "title" || slide.type === "cta") && (
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[220px] rounded-full blur-[90px] opacity-20 pointer-events-none"
          style={{ background: "var(--t-accent)" }}
        />
      )}

      {/* Slide title/subtitle — always visible as contextual header */}
      {slide.title && (
        <div className="absolute top-0 left-0 right-0 z-[5] px-8 pt-6 pb-2 pointer-events-none">
          <h2
            className="text-2xl font-bold tracking-tight leading-tight opacity-90"
            style={{
              ...headingStyle,
              color: isDark ? "var(--t-text)" : "var(--t-bg-dark)",
            }}
          >
            {slide.title}
          </h2>
          {slide.subtitle && (
            <p
              className="text-sm mt-1 leading-relaxed opacity-50"
              style={{ color: isDark ? "var(--t-text-secondary)" : "var(--t-bg-dark)" }}
            >
              {slide.subtitle}
            </p>
          )}
        </div>
      )}

      {/* Grid overlay during drag */}
      <GridOverlay visible={isDragging} />

      {/* Snap guides during drag */}
      <SnapGuides guides={activeGuides} />

      {/* 12-column × 6-row grid */}
      <div
        ref={gridRef}
        className="relative z-10 w-full h-full px-4 pb-4"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gridTemplateRows: "repeat(6, 1fr)",
          gap: "4px",
          paddingTop: slide.title ? "64px" : "16px",
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onSelectBlock(null);
        }}
      >
        {order.map((blockId) => {
          const block = blocks[blockId];
          if (!block || block.hidden) return null;

          const displayPos = getBlockPosition(block);
          const displayBlock = displayPos !== block.position
            ? { ...block, position: displayPos }
            : block;

          return (
            <BlockWrapper
              key={blockId}
              block={displayBlock}
              isSelected={blockId === selectedBlockId}
              onSelect={() => onSelectBlock(blockId)}
              onDelete={() => onRemoveBlock(slideId, blockId)}
              onDuplicate={() => onDuplicateBlock(slideId, blockId)}
              onToggleLock={() => onToggleLock(slideId, blockId)}
              onDragStart={(e) => handleDragStart(blockId, e)}
              onUpdateData={(patch) => onUpdateBlockData(slideId, blockId, patch)}
            >
              <BlockRenderer
                block={block}
                isSelected={blockId === selectedBlockId}
                onDataChange={(patch) => onUpdateBlockData(slideId, blockId, patch)}
              />
            </BlockWrapper>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Legacy Editable Slide (backward compat for slides without v2)      */
/* ------------------------------------------------------------------ */

function LegacyEditableSlide(props: {
  slide: SlideData;
  slideIndex: number;
  companyName: string;
  theme: ThemeDef;
  isDark: boolean;
  selectedBlockId: string | null;
  onUpdateSlide: (index: number, patch: Partial<SlideData>) => void;
  onSelectBlock: (blockId: string | null) => void;
  onUpdateBlock: (slideIndex: number, blockId: string, patch: Partial<SlideBlock>) => void;
}) {
  const { slide, slideIndex, theme, isDark, selectedBlockId, onUpdateSlide, onSelectBlock, onUpdateBlock } = props;
  const bg = isDark ? "var(--t-bg-dark)" : "var(--t-bg-light)";
  const fg = isDark ? "var(--t-text)" : "var(--t-bg-dark)";
  const sub = isDark ? "var(--t-text-secondary)" : undefined;
  const accent = isDark ? "var(--t-accent-light)" : "var(--t-accent)";

  function handleTitleBlur(e: React.FocusEvent<HTMLHeadingElement>) {
    const text = e.currentTarget.textContent || "";
    if (text !== slide.title) {
      onUpdateSlide(slideIndex, { title: text });
    }
  }

  function handleSubtitleBlur(e: React.FocusEvent<HTMLParagraphElement>) {
    const text = e.currentTarget.textContent || "";
    if (text !== (slide.subtitle || "")) {
      onUpdateSlide(slideIndex, { subtitle: text });
    }
  }

  function handleContentItemBlur(index: number, e: React.FocusEvent<HTMLParagraphElement>) {
    const text = e.currentTarget.textContent || "";
    if (text !== slide.content[index]) {
      const newContent = [...slide.content];
      newContent[index] = text;
      onUpdateSlide(slideIndex, { content: newContent });
    }
  }

  function handleSlideClick(e: React.MouseEvent) {
    if (e.target === e.currentTarget) {
      onSelectBlock(null);
    }
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={{ background: bg, color: fg }}
      onClick={handleSlideClick}
    >
      {isDark && (
        <div className="absolute inset-0 bg-grid-dark opacity-10 pointer-events-none" />
      )}
      {isDark && slide.type !== "title" && slide.type !== "cta" && (
        <div className="absolute top-0 left-0 right-0 h-1 pointer-events-none" style={{ background: accent }} />
      )}
      {(slide.type === "title" || slide.type === "cta") && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] h-[220px] rounded-full blur-[90px] opacity-20 pointer-events-none" style={{ background: "var(--t-accent)" }} />
      )}

      <div className={`relative z-10 flex flex-col h-full p-8 ${
        slide.type === "title" || slide.type === "cta" ? "items-center justify-center text-center" : ""
      }`}>
        <h2
          contentEditable suppressContentEditableWarning onBlur={handleTitleBlur}
          className={`outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 rounded px-1 -mx-1 ${
            slide.type === "title" || slide.type === "cta" ? "text-4xl mb-3" : "text-3xl mb-2"
          }`}
          style={{ ...headingStyle, caretColor: theme.accent }}
        >
          {slide.title}
        </h2>

        {(slide.subtitle !== undefined) && (
          <p
            contentEditable suppressContentEditableWarning onBlur={handleSubtitleBlur}
            className={`outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 rounded px-1 -mx-1 opacity-60 leading-relaxed ${
              slide.type === "title" || slide.type === "cta" ? "text-lg mb-6 max-w-2xl" : "text-base mb-4"
            }`}
            style={{ color: sub, caretColor: theme.accent }}
          >
            {slide.subtitle || "Add subtitle..."}
          </p>
        )}

        {slide.content.length > 0 && slide.type !== "chart" && slide.type !== "metrics" && slide.type !== "team" && slide.type !== "timeline" && (
          <div className={`flex-1 flex flex-col justify-center space-y-2.5 ${
            slide.type === "title" || slide.type === "cta" ? "items-center max-w-xl" : "max-w-3xl"
          }`}>
            {slide.content.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                {slide.type !== "title" && slide.type !== "cta" && (
                  <span className="w-1 rounded-full mt-2 shrink-0 min-h-[1rem]" style={{ background: accent }} />
                )}
                <p
                  contentEditable suppressContentEditableWarning
                  onBlur={(e) => handleContentItemBlur(i, e)}
                  className="text-base leading-relaxed opacity-90 outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 rounded px-1 -mx-1 flex-1"
                  style={{ caretColor: theme.accent }}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>
        )}

        {slide.type === "metrics" && slide.metrics && (
          <div className="flex-1 grid grid-cols-2 gap-3 items-stretch">
            {slide.metrics.map((metric, i) => (
              <div key={i} className="p-5 rounded-xl flex flex-col justify-center" style={{
                background: isDark ? "var(--t-card-bg)" : "rgba(0,0,0,0.02)",
                border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
              }}>
                <p className="text-xs uppercase tracking-wider font-semibold opacity-50 mb-1">{metric.label}</p>
                <p className="text-3xl font-bold tracking-tight">{metric.value}</p>
                {metric.change && (
                  <p className={`text-xs font-semibold mt-1 ${metric.trend === "up" ? "text-emerald-400" : metric.trend === "down" ? "text-red-400" : "text-white/50"}`}>
                    {metric.trend === "up" ? "\u2191" : metric.trend === "down" ? "\u2193" : "\u2192"} {metric.change}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {slide.type === "team" && slide.team && (
          <div className="flex-1 grid grid-cols-3 gap-4 items-stretch">
            {slide.team.map((member, i) => (
              <div key={i} className="flex flex-col items-center text-center p-4 rounded-xl" style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.06)" }}>
                <div className="w-14 h-14 rounded-full flex items-center justify-center mb-3 text-white font-bold text-lg" style={{ background: ["#4361ee", "#7c3aed", "#10b981", "#f59e0b"][i % 4] }}>
                  {member.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </div>
                <p className="font-bold text-sm">{member.name}</p>
                <p className="text-xs font-medium opacity-60" style={{ color: theme.accent }}>{member.role}</p>
                {member.bio && <p className="text-[10px] opacity-50 mt-1 leading-relaxed line-clamp-2">{member.bio}</p>}
              </div>
            ))}
          </div>
        )}

        {slide.type === "timeline" && slide.timeline && (
          <div className="flex-1 flex flex-col justify-center">
            <div className="relative">
              <div className="absolute left-[18px] top-2 bottom-2 w-0.5" style={{ background: `${theme.accent}40` }} />
              <div className="space-y-3">
                {slide.timeline.map((item, i) => (
                  <div key={i} className="flex items-start gap-4 relative">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10 border-2" style={{
                      borderColor: item.completed ? "#34d399" : theme.accent,
                      background: item.completed ? "rgba(52,211,153,0.1)" : `${theme.accent}15`,
                    }}>
                      {item.completed ? (
                        <svg className="w-4 h-4 text-emerald" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: theme.accent }} />
                      )}
                    </div>
                    <div className="pt-1 min-w-0 flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color: theme.accent }}>{item.date}</p>
                      <p className="font-bold text-sm">{item.title}</p>
                      {item.description && <p className="text-xs opacity-60 mt-0.5">{item.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {slide.type === "chart" && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center opacity-40">
              <svg className="w-16 h-16 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
              </svg>
              <p className="text-sm font-medium">Chart Preview</p>
              <p className="text-xs mt-1">Charts render in full in the preview view</p>
            </div>
          </div>
        )}

        {slide.editorBlocks && slide.editorBlocks.length > 0 && (
          <div className="mt-4 space-y-2">
            {slide.editorBlocks.map((block) => (
              <LegacyEditableBlock
                key={block.id}
                block={block}
                isSelected={block.id === selectedBlockId}
                slideIndex={slideIndex}
                onSelect={() => onSelectBlock(block.id)}
                onUpdate={(patch) => onUpdateBlock(slideIndex, block.id, patch)}
                theme={theme}
                isDark={isDark}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Legacy Editable Block (unchanged from original)                    */
/* ------------------------------------------------------------------ */

function LegacyEditableBlock(props: {
  block: SlideBlock;
  isSelected: boolean;
  slideIndex: number;
  onSelect: () => void;
  onUpdate: (patch: Partial<SlideBlock>) => void;
  theme: ThemeDef;
  isDark: boolean;
}) {
  const { block, isSelected, onSelect, onUpdate, theme, isDark } = props;
  const accent = isDark ? "var(--t-accent-light)" : "var(--t-accent)";

  function handleContentBlur(e: React.FocusEvent) {
    const text = e.currentTarget.textContent || "";
    if (text !== block.content) {
      onUpdate({ content: text });
    }
  }

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      className={`relative rounded-lg transition-all cursor-pointer ${
        isSelected
          ? "outline outline-2 outline-electric outline-offset-2"
          : "hover:outline hover:outline-1 hover:outline-white/20 hover:outline-offset-2"
      }`}
    >
      {block.type === "text" && (
        <p contentEditable suppressContentEditableWarning onBlur={handleContentBlur}
          className="outline-none px-2 py-1 rounded"
          style={{
            fontSize: (block.properties.fontSize as number) || 16,
            textAlign: (block.properties.align as "left" | "center" | "right") || "left",
            fontWeight: block.properties.bold ? "bold" : "normal",
            fontStyle: block.properties.italic ? "italic" : "normal",
            caretColor: theme.accent,
          }}
        >
          {block.content}
        </p>
      )}

      {block.type === "metric" && (
        <div className="p-4 rounded-xl" style={{
          background: isDark ? "var(--t-card-bg)" : "rgba(0,0,0,0.02)",
          border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
        }}>
          <p className="text-xs uppercase tracking-wider font-semibold opacity-50 mb-1">{(block.properties.label as string) || "Metric"}</p>
          <p className="text-2xl font-bold">{(block.properties.value as string) || "0"}</p>
          {typeof block.properties.change === "string" && block.properties.change && (
            <p className={`text-xs font-semibold mt-1 ${block.properties.trend === "up" ? "text-emerald-400" : block.properties.trend === "down" ? "text-red-400" : "opacity-50"}`}>
              {block.properties.trend === "up" ? "\u2191" : block.properties.trend === "down" ? "\u2193" : "\u2192"} {String(block.properties.change)}
            </p>
          )}
        </div>
      )}

      {block.type === "quote" && (
        <div className="p-4 border-l-4 rounded-r-lg" style={{ borderColor: accent, background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)" }}>
          <p contentEditable suppressContentEditableWarning onBlur={handleContentBlur}
            className="italic text-base opacity-80 outline-none" style={{ caretColor: theme.accent }}>
            {block.content || "Add quote..."}
          </p>
          {typeof block.properties.author === "string" && block.properties.author && (
            <p className="text-xs mt-2 opacity-50 font-semibold">-- {String(block.properties.author)}</p>
          )}
        </div>
      )}

      {block.type === "team-member" && (
        <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: isDark ? "var(--t-card-bg)" : "rgba(0,0,0,0.02)" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{ background: theme.accent }}>
            {((block.properties.name as string) || "?").split(" ").map((n) => n[0]).join("").slice(0, 2)}
          </div>
          <div>
            <p className="font-bold text-sm">{(block.properties.name as string) || "Name"}</p>
            <p className="text-xs opacity-60" style={{ color: theme.accent }}>{(block.properties.role as string) || "Role"}</p>
          </div>
        </div>
      )}

      {block.type === "timeline-item" && (
        <div className="flex items-start gap-3 p-2">
          <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0" style={{ borderColor: theme.accent }}>
            <span className="w-2 h-2 rounded-full" style={{ background: theme.accent }} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.accent }}>{(block.properties.date as string) || "Date"}</p>
            <p className="font-bold text-sm">{(block.properties.title as string) || "Milestone"}</p>
            {typeof block.properties.description === "string" && block.properties.description && (
              <p className="text-xs opacity-60">{String(block.properties.description)}</p>
            )}
          </div>
        </div>
      )}

      {block.type === "logo-grid" && (
        <div className="flex flex-wrap gap-3 p-3">
          {((block.properties.logos as string[]) || []).map((logo, i) => (
            <div key={i} className="px-4 py-2 rounded-lg text-xs font-medium" style={{
              background: isDark ? "var(--t-card-bg)" : "rgba(0,0,0,0.04)",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.08)",
            }}>
              {logo}
            </div>
          ))}
        </div>
      )}

      {block.type === "comparison-row" && (
        <div className="grid grid-cols-3 gap-4 p-3 rounded-lg" style={{
          background: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
          border: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,0,0,0.05)",
        }}>
          <p className="font-semibold text-sm">{(block.properties.label as string) || "Feature"}</p>
          <p className="text-sm text-center font-medium" style={{ color: theme.accent }}>{(block.properties.us as string) || "Us"}</p>
          <p className="text-sm text-center opacity-50">{(block.properties.them as string) || "Them"}</p>
        </div>
      )}

      {block.type === "chart" && (
        <div className="p-4 flex items-center justify-center opacity-40">
          <div className="text-center">
            <svg className="w-10 h-10 mx-auto mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
            </svg>
            <p className="text-xs">Chart Block</p>
          </div>
        </div>
      )}

      {isSelected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-electric rounded-full border-2 border-white pointer-events-none" />
      )}
    </div>
  );
}
