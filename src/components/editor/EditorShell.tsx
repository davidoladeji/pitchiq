"use client";

import { useEffect, useCallback, useState } from "react";
import { DeckData } from "@/lib/types";
import { useEditorStore } from "./state/editorStore";
import EditorToolbar from "./EditorToolbar";
import EditorSidebar from "./EditorSidebar";
import EditorCanvas from "./EditorCanvas";
import EditorProperties from "./EditorProperties";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";

interface EditorShellProps {
  deck: DeckData;
  plan: string;
  userName: string;
}

export default function EditorShell({ deck, plan, userName }: EditorShellProps) {
  const initDeck = useEditorStore((s) => s.initDeck);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const save = useEditorStore((s) => s.save);
  const removeSlide = useEditorStore((s) => s.removeSlide);
  const removeBlock = useEditorStore((s) => s.removeBlock);
  const selectedBlockId = useEditorStore((s) => s.selectedBlockId);
  const selectedSlideIndex = useEditorStore((s) => s.selectedSlideIndex);
  const reorderSlides = useEditorStore((s) => s.reorderSlides);
  const addBlock = useEditorStore((s) => s.addBlock);

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [mobilePanel, setMobilePanel] = useState<"canvas" | "slides" | "properties">("canvas");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  useEffect(() => {
    initDeck(deck);
  }, [deck, initDeck]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;

      // Ignore shortcuts when typing in inputs
      const tag = (e.target as HTMLElement).tagName;
      const isEditable =
        tag === "INPUT" ||
        tag === "TEXTAREA" ||
        tag === "SELECT" ||
        (e.target as HTMLElement).isContentEditable;

      if (isMeta && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }
      if (isMeta && e.key === "z" && e.shiftKey) {
        e.preventDefault();
        redo();
        return;
      }
      if (isMeta && (e.key === "Z")) {
        e.preventDefault();
        redo();
        return;
      }
      if (isMeta && e.key === "s") {
        e.preventDefault();
        save().catch(console.error);
        return;
      }
      if ((e.key === "Delete" || e.key === "Backspace") && !isEditable) {
        e.preventDefault();
        if (selectedBlockId) {
          removeBlock(selectedSlideIndex, selectedBlockId);
        }
      }
    },
    [undo, redo, save, selectedBlockId, selectedSlideIndex, removeBlock]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null);
    const { active, over } = event;
    if (!over) return;

    // Slide reordering
    if (
      String(active.id).startsWith("slide-") &&
      String(over.id).startsWith("slide-")
    ) {
      const fromIndex = parseInt(String(active.id).replace("slide-", ""), 10);
      const toIndex = parseInt(String(over.id).replace("slide-", ""), 10);
      if (fromIndex !== toIndex) {
        reorderSlides(fromIndex, toIndex);
      }
      return;
    }

    // Block template drop onto canvas
    if (
      String(active.id).startsWith("block-template-") &&
      String(over.id) === "editor-canvas-drop"
    ) {
      const blockType = String(active.id).replace("block-template-", "");
      const template = getBlockTemplate(blockType);
      if (template) {
        addBlock(selectedSlideIndex, template);
      }
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen w-screen bg-[#1a1a2e] flex flex-col overflow-hidden">
        <EditorToolbar plan={plan} />

        {/* Mobile tab bar */}
        <div className="flex lg:hidden border-b border-white/10 bg-[#0f0f23]">
          {(["slides", "canvas", "properties"] as const).map((panel) => (
            <button
              key={panel}
              onClick={() => setMobilePanel(panel)}
              className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${
                mobilePanel === panel
                  ? "text-white border-b-2 border-[#4361ee]"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {panel}
            </button>
          ))}
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Left sidebar - desktop always, mobile conditional */}
          <div
            className={`w-full lg:w-[280px] lg:block shrink-0 ${
              mobilePanel === "slides" ? "block" : "hidden"
            }`}
          >
            <EditorSidebar plan={plan} />
          </div>

          {/* Center canvas */}
          <div
            className={`flex-1 min-w-0 lg:block ${
              mobilePanel === "canvas" ? "block" : "hidden"
            }`}
          >
            <EditorCanvas />
          </div>

          {/* Right properties panel - desktop always, mobile conditional */}
          <div
            className={`w-full lg:w-[300px] lg:block shrink-0 ${
              mobilePanel === "properties" ? "block" : "hidden"
            }`}
          >
            <EditorProperties plan={plan} />
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeDragId && activeDragId.startsWith("block-template-") ? (
          <div className="px-3 py-2 bg-[#4361ee] text-white text-xs font-medium rounded-lg shadow-lg opacity-90">
            {activeDragId.replace("block-template-", "").replace("-", " ")}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

function getBlockTemplate(type: string) {
  const templates: Record<string, { type: string; content: string; properties: Record<string, unknown> }> = {
    text: {
      type: "text",
      content: "Enter your text here...",
      properties: { fontSize: 16, align: "left", bold: false, italic: false },
    },
    metric: {
      type: "metric",
      content: "",
      properties: { label: "Metric", value: "0", change: "", trend: "neutral" },
    },
    chart: {
      type: "chart",
      content: "",
      properties: {
        chartType: "bar",
        data: [
          { label: "A", value: 40 },
          { label: "B", value: 60 },
          { label: "C", value: 80 },
        ],
      },
    },
    "team-member": {
      type: "team-member",
      content: "",
      properties: { name: "Team Member", role: "Role", bio: "" },
    },
    "timeline-item": {
      type: "timeline-item",
      content: "",
      properties: { date: "Q1 2025", title: "Milestone", description: "", completed: false },
    },
    quote: {
      type: "quote",
      content: "Add your quote here...",
      properties: { author: "", source: "" },
    },
    "logo-grid": {
      type: "logo-grid",
      content: "",
      properties: { logos: ["Partner 1", "Partner 2", "Partner 3"] },
    },
    "comparison-row": {
      type: "comparison-row",
      content: "",
      properties: { label: "Feature", us: "Yes", them: "No" },
    },
  };

  const tmpl = templates[type];
  if (!tmpl) return null;

  return {
    id: "",
    type: tmpl.type as import("@/lib/types").SlideBlockType,
    content: tmpl.content,
    properties: tmpl.properties,
  };
}
