"use client";

import { useState, useCallback } from "react";
import { useEditorStore } from "./state/editorStore";
import { SlideData } from "@/lib/types";
import { getTheme } from "@/lib/themes";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { nanoid } from "nanoid";
import BlockLibrary from "./blocks/BlockLibrary";
import LayoutPicker from "./LayoutPicker";
import NarrativeArcPanel from "./NarrativeArcPanel";
import AudiencePanel from "./AudiencePanel";
import SlideHealthPanel from "./SlideHealthPanel";

interface EditorSidebarProps {
  plan: string;
}

const SLIDE_TYPES: { value: SlideData["type"]; label: string }[] = [
  { value: "content", label: "Content" },
  { value: "title", label: "Title" },
  { value: "stats", label: "Stats" },
  { value: "metrics", label: "Metrics" },
  { value: "chart", label: "Chart" },
  { value: "comparison", label: "Comparison" },
  { value: "team", label: "Team" },
  { value: "timeline", label: "Timeline" },
  { value: "cta", label: "CTA" },
];

// Block templates now live in BlockLibrary component

function SortableSlide(props: {
  slide: SlideData;
  index: number;
  isSelected: boolean;
  themeId: string;
  companyName: string;
  onSelect: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}) {
  const { slide, index, isSelected, themeId, onSelect, onContextMenu } = props;
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `slide-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const theme = getTheme(themeId);
  const isDark = slide.type === "title" || slide.type === "cta" || slide.accent;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onSelect}
      onContextMenu={onContextMenu}
      className={`group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
        isSelected
          ? "ring-2 ring-electric border-electric"
          : "border-white/5 hover:border-white/15"
      }`}
    >
      {/* Mini slide preview */}
      <div
        className="aspect-[16/9] p-2 flex flex-col justify-center"
        style={{
          background: isDark ? theme.bgDark : theme.bgLight,
          color: isDark ? theme.textPrimary : theme.bgDark,
        }}
      >
        <p
          className="text-[7px] font-bold leading-tight line-clamp-2 mb-0.5"
          style={{ fontFamily: theme.headingFont }}
        >
          {slide.title}
        </p>
        {slide.subtitle && (
          <p className="text-[5px] opacity-50 line-clamp-1">{slide.subtitle}</p>
        )}
        {slide.content.length > 0 && (
          <div className="mt-1 space-y-0.5">
            {slide.content.slice(0, 3).map((item, i) => (
              <div key={i} className="flex items-start gap-0.5">
                <span
                  className="w-0.5 h-1.5 rounded-full mt-0.5 shrink-0"
                  style={{ background: theme.accent }}
                />
                <p className="text-[4px] opacity-60 line-clamp-1">{item}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overlay info */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-white/70 font-mono">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="text-[9px] text-white/50 bg-white/10 px-1.5 py-0.5 rounded-full capitalize">
            {slide.type}
          </span>
        </div>
      </div>

      {/* Design score health dot */}
      {slide.id && (
        <SlideHealthPanel slideIndex={index} slideId={slide.id} />
      )}
    </div>
  );
}

// DraggableBlockTemplate moved into BlockLibrary component

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function EditorSidebar({ plan }: EditorSidebarProps) {
  const slides = useEditorStore((s) => s.slides);
  const selectedSlideIndex = useEditorStore((s) => s.selectedSlideIndex);
  const themeId = useEditorStore((s) => s.themeId);
  const deck = useEditorStore((s) => s.deck);
  const selectSlide = useEditorStore((s) => s.selectSlide);
  const addSlide = useEditorStore((s) => s.addSlide);
  const removeSlide = useEditorStore((s) => s.removeSlide);
  const duplicateSlide = useEditorStore((s) => s.duplicateSlide);

  const [tab, setTab] = useState<"slides" | "blocks" | "layouts" | "ai">("slides");
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    index: number;
  } | null>(null);
  const [addSlideType, setAddSlideType] = useState<SlideData["type"]>("content");

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY, index });
    },
    []
  );

  function closeContextMenu() {
    setContextMenu(null);
  }

  function handleAddSlide() {
    const newSlide: SlideData = {
      id: nanoid(10),
      title: "New Slide",
      subtitle: "",
      content: [],
      type: addSlideType,
    };
    addSlide(selectedSlideIndex, newSlide);
  }

  const slideIds = slides.map((_, i) => `slide-${i}`);

  return (
    <div className="h-full bg-navy-900 border-r border-white/10 flex flex-col overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-white/10 shrink-0">
        <button
          type="button"
          onClick={() => setTab("slides")}
          aria-selected={tab === "slides"}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 ${
            tab === "slides"
              ? "text-white border-b-2 border-electric"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          Slides
        </button>
        <button
          type="button"
          onClick={() => setTab("blocks")}
          aria-selected={tab === "blocks"}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 ${
            tab === "blocks"
              ? "text-white border-b-2 border-electric"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          Blocks
        </button>
        <button
          type="button"
          onClick={() => setTab("layouts")}
          aria-selected={tab === "layouts"}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 ${
            tab === "layouts"
              ? "text-white border-b-2 border-electric"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          Layouts
        </button>
        <button
          type="button"
          onClick={() => setTab("ai")}
          aria-selected={tab === "ai"}
          className={`flex-1 py-2.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 ${
            tab === "ai"
              ? "text-white border-b-2 border-electric"
              : "text-white/40 hover:text-white/60"
          }`}
        >
          AI
        </button>
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {tab === "ai" ? (
          <div className="p-3 space-y-3">
            <NarrativeArcPanel />
            <AudiencePanel />
          </div>
        ) : tab === "layouts" ? (
          <LayoutPicker />
        ) : tab === "slides" ? (
          <div className="p-3 space-y-2">
            <SortableContext
              items={slideIds}
              strategy={verticalListSortingStrategy}
            >
              {slides.map((slide, index) => (
                <SortableSlide
                  key={slide.id || index}
                  slide={slide}
                  index={index}
                  isSelected={index === selectedSlideIndex}
                  themeId={themeId}
                  companyName={deck?.companyName || ""}
                  onSelect={() => selectSlide(index)}
                  onContextMenu={(e) => handleContextMenu(e, index)}
                />
              ))}
            </SortableContext>

            {/* Add slide controls */}
            <div className="pt-2 border-t border-white/5">
              <div className="flex gap-1.5 mb-2">
                <select
                  value={addSlideType}
                  onChange={(e) => setAddSlideType(e.target.value as SlideData["type"])}
                  aria-label="Slide type for new slide"
                  className="flex-1 bg-white/5 border border-white/10 rounded-lg text-white text-[11px] px-2 py-1.5 outline-none focus:outline-none focus-visible:border-electric focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
                >
                  {SLIDE_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={handleAddSlide}
                aria-label="Add new slide"
                className="w-full flex items-center justify-center gap-1.5 min-h-[44px] py-2 rounded-lg bg-electric hover:bg-electric-600 text-white text-xs font-semibold shadow-lg shadow-electric/25 hover:shadow-glow transition-all hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Slide
              </button>
            </div>
          </div>
        ) : (
          <BlockLibrary />
        )}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <>
          <div
            className="fixed inset-0 z-[100]"
            onClick={closeContextMenu}
          />
          <div
            className="fixed z-[101] bg-navy border border-white/10 rounded-xl shadow-xl py-1 min-w-[140px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            role="menu"
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                duplicateSlide(contextMenu.index);
                closeContextMenu();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-white text-xs hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-inset"
            >
              <svg
                className="w-3.5 h-3.5 text-white/40"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Duplicate
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                removeSlide(contextMenu.index);
                closeContextMenu();
              }}
              disabled={slides.length <= 1}
              aria-label="Delete slide"
              className="w-full flex items-center gap-2 px-3 py-2 text-red-400 text-xs hover:bg-white/5 transition-colors disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric focus-visible:ring-inset"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}
