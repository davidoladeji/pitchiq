"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { SlideData } from "@/lib/types";
import SlideThumb, { TYPE_LABELS } from "./SlideThumb";

// ─── Context Menu ───────────────────────────────────────────────────

interface ContextMenuState {
  x: number;
  y: number;
  slideIndex: number;
}

interface ContextMenuProps {
  state: ContextMenuState;
  onClose: () => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onAddAbove: (index: number) => void;
  onAddBelow: (index: number) => void;
}

function ContextMenu({ state, onClose, onDuplicate, onDelete, onAddAbove, onAddBelow }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const items = [
    { label: "Add slide above", icon: "\u2191", action: () => onAddAbove(state.slideIndex) },
    { label: "Add slide below", icon: "\u2193", action: () => onAddBelow(state.slideIndex) },
    { label: "Duplicate", icon: "\u2398", action: () => onDuplicate(state.slideIndex) },
    { label: "Delete", icon: "\u2715", action: () => onDelete(state.slideIndex), danger: true },
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] min-w-[180px] bg-navy-950 rounded-xl shadow-2xl border border-white/10 py-1.5 overflow-hidden"
      style={{ top: state.y, left: state.x }}
    >
      {items.map((item, i) => (
        <button
          key={i}
          type="button"
          onClick={() => {
            item.action();
            onClose();
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
            item.danger
              ? "text-red-400 hover:bg-red-500/10"
              : "text-white/80 hover:bg-white/5"
          }`}
        >
          <span className="w-4 text-center text-xs opacity-60">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── Sortable Slide Item ────────────────────────────────────────────

interface SortableSlideItemProps {
  slide: SlideData;
  index: number;
  themeId: string;
  isSelected: boolean;
  onSelect: (index: number) => void;
  onContextMenu: (e: React.MouseEvent, index: number) => void;
}

function SortableSlideItem({
  slide,
  index,
  themeId,
  isSelected,
  onSelect,
  onContextMenu,
}: SortableSlideItemProps) {
  const slideId = slide.id || `slide-${index}`;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slideId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative group flex items-center gap-2 p-2 rounded-xl cursor-pointer transition-all ${
        isSelected
          ? "ring-2 ring-electric bg-white/[0.06]"
          : "hover:bg-white/[0.04]"
      }`}
      onClick={() => onSelect(index)}
      onContextMenu={(e) => onContextMenu(e, index)}
    >
      {/* Drag handle */}
      <div
        {...attributes}
        {...listeners}
        className="flex flex-col items-center gap-0.5 px-1 py-2 cursor-grab active:cursor-grabbing text-white/20 hover:text-white/40 transition-colors shrink-0"
        title="Drag to reorder"
      >
        <svg className="w-3 h-3" viewBox="0 0 12 12" fill="currentColor">
          <circle cx="3" cy="2" r="1" />
          <circle cx="9" cy="2" r="1" />
          <circle cx="3" cy="6" r="1" />
          <circle cx="9" cy="6" r="1" />
          <circle cx="3" cy="10" r="1" />
          <circle cx="9" cy="10" r="1" />
        </svg>
      </div>

      {/* Slide number badge */}
      <div className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-navy-950 border border-white/10 flex items-center justify-center z-10">
        <span className="text-[9px] font-bold text-white/50">{index + 1}</span>
      </div>

      {/* Mini slide preview */}
      <div className="relative overflow-hidden rounded-md flex-shrink-0 shadow-sm">
        <SlideThumb slide={slide} themeId={themeId} width={160} />
      </div>

      {/* Type badge overlay */}
      <div className="absolute bottom-2.5 right-2.5">
        <span className="text-[9px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/40 text-white/50 backdrop-blur-sm">
          {TYPE_LABELS[slide.type]}
        </span>
      </div>
    </div>
  );
}

// ─── SlideList (main export) ────────────────────────────────────────

interface SlideListProps {
  slides: SlideData[];
  themeId: string;
  selectedIndex: number;
  onSelect: (index: number) => void;
  onDuplicate: (index: number) => void;
  onDelete: (index: number) => void;
  onAddAbove: (index: number) => void;
  onAddBelow: (index: number) => void;
}

export default function SlideList({
  slides,
  themeId,
  selectedIndex,
  onSelect,
  onDuplicate,
  onDelete,
  onAddAbove,
  onAddBelow,
}: SlideListProps) {
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null);

  const handleContextMenu = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, slideIndex: index });
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  // Build stable IDs for sortable context
  const sortableIds = slides.map((s, i) => s.id || `slide-${i}`);

  return (
    <div className="flex flex-col gap-2 p-2 overflow-y-auto">
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        {slides.map((slide, i) => (
          <SortableSlideItem
            key={sortableIds[i]}
            slide={slide}
            index={i}
            themeId={themeId}
            isSelected={i === selectedIndex}
            onSelect={onSelect}
            onContextMenu={handleContextMenu}
          />
        ))}
      </SortableContext>

      {contextMenu && (
        <ContextMenu
          state={contextMenu}
          onClose={closeContextMenu}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onAddAbove={onAddAbove}
          onAddBelow={onAddBelow}
        />
      )}
    </div>
  );
}
