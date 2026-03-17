import { create } from "zustand";
import { produce } from "immer";
import { SlideData, DeckData, SlideBlock } from "@/lib/types";
import { nanoid } from "nanoid";
import type {
  BlockType,
  EditorBlock,
  BlocksRecord,
  BlockPosition,
  BlockStyle,
} from "@/lib/editor/block-types";
import { createDefaultEditorBlock } from "@/lib/editor/block-defaults";
import { migrateSlideToV2, syncBlocksToSlideData } from "@/lib/editor/block-migration";
import { getLayoutById } from "@/lib/editor/layout/layout-library";
import { applyLayout as applyLayoutFn, createBlocksFromLayout } from "@/lib/editor/layout/apply-layout";

const MAX_UNDO = 50;

/* ------------------------------------------------------------------ */
/*  Undo snapshot — captures both legacy slides and v2 block state     */
/* ------------------------------------------------------------------ */

interface UndoSnapshot {
  slides: SlideData[];
  slideBlocks: Record<string, BlocksRecord>;
  slideBlockOrder: Record<string, string[]>;
}

/* ------------------------------------------------------------------ */
/*  Store interface                                                     */
/* ------------------------------------------------------------------ */

export interface EditorState {
  deck: DeckData | null;
  slides: SlideData[];
  selectedSlideIndex: number;
  selectedBlockId: string | null;
  isDirty: boolean;
  saving: boolean;
  savedAt: number | null;
  undoStack: UndoSnapshot[];
  redoStack: UndoSnapshot[];
  themeId: string;

  // v2 block state: keyed by slideId
  slideBlocks: Record<string, BlocksRecord>;
  slideBlockOrder: Record<string, string[]>;

  // Init
  initDeck: (deck: DeckData) => void;

  // Slide actions
  selectSlide: (index: number) => void;
  updateSlide: (index: number, patch: Partial<SlideData>) => void;
  addSlide: (afterIndex: number, slide: SlideData) => void;
  removeSlide: (index: number) => void;
  duplicateSlide: (index: number) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;

  // Legacy block actions (still used by current canvas/components)
  selectBlock: (blockId: string | null) => void;
  addBlock: (slideIndex: number, block: SlideBlock) => void;
  updateBlock: (slideIndex: number, blockId: string, patch: Partial<SlideBlock>) => void;
  removeBlock: (slideIndex: number, blockId: string) => void;

  // v2 block actions
  addBlockV2: (slideId: string, block: EditorBlock) => void;
  addBlockOfType: (slideId: string, type: BlockType) => void;
  updateBlockV2: (slideId: string, blockId: string, patch: Partial<EditorBlock>) => void;
  updateBlockData: (slideId: string, blockId: string, dataPatch: Record<string, unknown>) => void;
  updateBlockPosition: (slideId: string, blockId: string, position: Partial<BlockPosition>) => void;
  updateBlockStyle: (slideId: string, blockId: string, style: Partial<BlockStyle>) => void;
  removeBlockV2: (slideId: string, blockId: string) => void;
  duplicateBlock: (slideId: string, blockId: string) => void;
  reorderBlocks: (slideId: string, fromIdx: number, toIdx: number) => void;
  toggleBlockLocked: (slideId: string, blockId: string) => void;
  toggleBlockHidden: (slideId: string, blockId: string) => void;

  // Layout
  applyLayoutToSlide: (slideId: string, layoutId: string) => void;

  // Helpers
  getSlideBlocks: (slideId: string) => EditorBlock[];
  getBlock: (slideId: string, blockId: string) => EditorBlock | undefined;
  currentSlideId: () => string | undefined;

  // Theme
  setTheme: (themeId: string) => void;

  // Title
  setTitle: (title: string) => void;

  // Undo/Redo
  undo: () => void;
  redo: () => void;

  // Save
  save: () => Promise<void>;
}

/* ------------------------------------------------------------------ */
/*  Undo helpers                                                       */
/* ------------------------------------------------------------------ */

function takeSnapshot(state: EditorState): UndoSnapshot {
  return {
    slides: state.slides.map((s) => ({ ...s })),
    slideBlocks: JSON.parse(JSON.stringify(state.slideBlocks)),
    slideBlockOrder: JSON.parse(JSON.stringify(state.slideBlockOrder)),
  };
}

function pushUndo(state: EditorState): Pick<EditorState, "undoStack" | "redoStack"> {
  const stack = [...state.undoStack, takeSnapshot(state)];
  if (stack.length > MAX_UNDO) stack.shift();
  return { undoStack: stack, redoStack: [] };
}

/* ------------------------------------------------------------------ */
/*  Store                                                              */
/* ------------------------------------------------------------------ */

export const useEditorStore = create<EditorState>((set, get) => ({
  deck: null,
  slides: [],
  selectedSlideIndex: 0,
  selectedBlockId: null,
  isDirty: false,
  saving: false,
  savedAt: null,
  undoStack: [],
  redoStack: [],
  themeId: "midnight",
  slideBlocks: {},
  slideBlockOrder: {},

  /* ---------------------------------------------------------------- */
  /*  initDeck — migrates all slides to v2 block format               */
  /* ---------------------------------------------------------------- */
  initDeck: (deck) => {
    const slides = deck.slides.map((s) => ({
      ...s,
      id: s.id || nanoid(10),
    }));

    const slideBlocks: Record<string, BlocksRecord> = {};
    const slideBlockOrder: Record<string, string[]> = {};

    for (const slide of slides) {
      const { blocks, order } = migrateSlideToV2(slide);
      slideBlocks[slide.id] = blocks;
      slideBlockOrder[slide.id] = order;
    }

    set({
      deck,
      slides,
      selectedSlideIndex: 0,
      selectedBlockId: null,
      isDirty: false,
      saving: false,
      savedAt: null,
      undoStack: [],
      redoStack: [],
      themeId: deck.themeId || "midnight",
      slideBlocks,
      slideBlockOrder,
    });
  },

  /* ---------------------------------------------------------------- */
  /*  Slide actions                                                    */
  /* ---------------------------------------------------------------- */

  selectSlide: (index) => {
    const { slides } = get();
    if (index >= 0 && index < slides.length) {
      set({ selectedSlideIndex: index, selectedBlockId: null });
    }
  },

  updateSlide: (index, patch) => {
    const state = get();
    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        Object.assign(draft.slides[index], patch);
        draft.isDirty = true;
      })
    );
  },

  addSlide: (afterIndex, slide) => {
    const state = get();
    const newSlide = { ...slide, id: slide.id || nanoid(10) };
    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        draft.slides.splice(afterIndex + 1, 0, newSlide);
        draft.selectedSlideIndex = afterIndex + 1;
        draft.selectedBlockId = null;
        // Initialize empty v2 block state for new slide
        draft.slideBlocks[newSlide.id] = {};
        draft.slideBlockOrder[newSlide.id] = [];
        draft.isDirty = true;
      })
    );
  },

  removeSlide: (index) => {
    const state = get();
    if (state.slides.length <= 1) return;
    const slideId = state.slides[index]?.id;
    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        draft.slides.splice(index, 1);
        // Clean up v2 block state
        if (slideId) {
          delete draft.slideBlocks[slideId];
          delete draft.slideBlockOrder[slideId];
        }
        draft.selectedSlideIndex = Math.min(
          draft.selectedSlideIndex,
          draft.slides.length - 1
        );
        draft.selectedBlockId = null;
        draft.isDirty = true;
      })
    );
  },

  duplicateSlide: (index) => {
    const state = get();
    const original = state.slides[index];
    if (!original) return;
    const newSlideId = nanoid(10);
    const clone: SlideData = {
      ...JSON.parse(JSON.stringify(original)),
      id: newSlideId,
    };
    if (clone.editorBlocks) {
      clone.editorBlocks = clone.editorBlocks.map((b: SlideBlock) => ({
        ...b,
        id: nanoid(10),
      }));
    }

    // Deep-clone v2 blocks with new IDs
    const origId = original.id || "";
    const origBlocks = origId ? state.slideBlocks[origId] || {} : {};
    const origOrder = origId ? state.slideBlockOrder[origId] || [] : [];
    const newBlocks: BlocksRecord = {};
    const newOrder: string[] = [];
    const idMap: Record<string, string> = {};

    for (const oldId of origOrder) {
      const newId = nanoid(10);
      idMap[oldId] = newId;
      newBlocks[newId] = {
        ...JSON.parse(JSON.stringify(origBlocks[oldId])),
        id: newId,
      };
      newOrder.push(newId);
    }

    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        draft.slides.splice(index + 1, 0, clone);
        draft.slideBlocks[newSlideId] = newBlocks;
        draft.slideBlockOrder[newSlideId] = newOrder;
        draft.selectedSlideIndex = index + 1;
        draft.selectedBlockId = null;
        draft.isDirty = true;
      })
    );
  },

  reorderSlides: (fromIndex, toIndex) => {
    const state = get();
    if (fromIndex === toIndex) return;
    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        const [moved] = draft.slides.splice(fromIndex, 1);
        draft.slides.splice(toIndex, 0, moved);
        draft.selectedSlideIndex = toIndex;
        draft.isDirty = true;
      })
    );
  },

  /* ---------------------------------------------------------------- */
  /*  Legacy block actions (unchanged — for current canvas compat)     */
  /* ---------------------------------------------------------------- */

  selectBlock: (blockId) => {
    set({ selectedBlockId: blockId });
  },

  addBlock: (slideIndex, block) => {
    const state = get();
    const newBlock = { ...block, id: block.id || nanoid(10) };
    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        const slide = draft.slides[slideIndex];
        if (!slide.editorBlocks) slide.editorBlocks = [];
        slide.editorBlocks.push(newBlock);
        draft.selectedBlockId = newBlock.id;
        draft.isDirty = true;
      })
    );
  },

  updateBlock: (slideIndex, blockId, patch) => {
    const state = get();
    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        const slide = draft.slides[slideIndex];
        const block = slide.editorBlocks?.find((b: SlideBlock) => b.id === blockId);
        if (block) {
          Object.assign(block, patch);
        }
        draft.isDirty = true;
      })
    );
  },

  removeBlock: (slideIndex, blockId) => {
    const state = get();
    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        const slide = draft.slides[slideIndex];
        if (slide.editorBlocks) {
          slide.editorBlocks = slide.editorBlocks.filter(
            (b: SlideBlock) => b.id !== blockId
          );
        }
        if (draft.selectedBlockId === blockId) {
          draft.selectedBlockId = null;
        }
        draft.isDirty = true;
      })
    );
  },

  /* ---------------------------------------------------------------- */
  /*  v2 Block actions                                                 */
  /* ---------------------------------------------------------------- */

  addBlockV2: (slideId, block) => {
    const state = get();
    const newBlock = { ...block, id: block.id || nanoid(10) };
    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        if (!draft.slideBlocks[slideId]) draft.slideBlocks[slideId] = {};
        if (!draft.slideBlockOrder[slideId]) draft.slideBlockOrder[slideId] = [];
        draft.slideBlocks[slideId][newBlock.id] = newBlock;
        draft.slideBlockOrder[slideId].push(newBlock.id);
        draft.selectedBlockId = newBlock.id;
        draft.isDirty = true;
      })
    );
  },

  addBlockOfType: (slideId, type) => {
    const state = get();
    const order = state.slideBlockOrder[slideId] || [];
    const block = createDefaultEditorBlock(type, order.length);
    get().addBlockV2(slideId, block);
  },

  updateBlockV2: (slideId, blockId, patch) => {
    const state = get();
    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        const block = draft.slideBlocks[slideId]?.[blockId];
        if (block) {
          Object.assign(block, patch);
          // Keep id/type immutable
          block.id = blockId;
        }
        draft.isDirty = true;
      })
    );
  },

  updateBlockData: (slideId, blockId, dataPatch) => {
    const state = get();
    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        const block = draft.slideBlocks[slideId]?.[blockId];
        if (block) {
          Object.assign(block.data, dataPatch);
        }
        draft.isDirty = true;
      })
    );
  },

  updateBlockPosition: (slideId, blockId, position) => {
    const state = get();
    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        const block = draft.slideBlocks[slideId]?.[blockId];
        if (block) {
          Object.assign(block.position, position);
        }
        draft.isDirty = true;
      })
    );
  },

  updateBlockStyle: (slideId, blockId, style) => {
    const state = get();
    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        const block = draft.slideBlocks[slideId]?.[blockId];
        if (block) {
          Object.assign(block.style, style);
        }
        draft.isDirty = true;
      })
    );
  },

  removeBlockV2: (slideId, blockId) => {
    const state = get();
    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        if (draft.slideBlocks[slideId]) {
          delete draft.slideBlocks[slideId][blockId];
        }
        if (draft.slideBlockOrder[slideId]) {
          draft.slideBlockOrder[slideId] = draft.slideBlockOrder[slideId].filter(
            (id) => id !== blockId
          );
        }
        if (draft.selectedBlockId === blockId) {
          draft.selectedBlockId = null;
        }
        draft.isDirty = true;
      })
    );
  },

  duplicateBlock: (slideId, blockId) => {
    const state = get();
    const block = state.slideBlocks[slideId]?.[blockId];
    if (!block) return;
    const newId = nanoid(10);
    const clone: EditorBlock = {
      ...JSON.parse(JSON.stringify(block)),
      id: newId,
      position: {
        ...block.position,
        y: block.position.y + block.position.height,
      },
    };
    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        draft.slideBlocks[slideId][newId] = clone;
        const order = draft.slideBlockOrder[slideId];
        const idx = order.indexOf(blockId);
        order.splice(idx + 1, 0, newId);
        draft.selectedBlockId = newId;
        draft.isDirty = true;
      })
    );
  },

  reorderBlocks: (slideId, fromIdx, toIdx) => {
    const state = get();
    if (fromIdx === toIdx) return;
    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        const order = draft.slideBlockOrder[slideId];
        if (!order) return;
        const [moved] = order.splice(fromIdx, 1);
        order.splice(toIdx, 0, moved);
        draft.isDirty = true;
      })
    );
  },

  toggleBlockLocked: (slideId, blockId) => {
    const state = get();
    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        const block = draft.slideBlocks[slideId]?.[blockId];
        if (block) block.locked = !block.locked;
        draft.isDirty = true;
      })
    );
  },

  toggleBlockHidden: (slideId, blockId) => {
    const state = get();
    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        const block = draft.slideBlocks[slideId]?.[blockId];
        if (block) block.hidden = !block.hidden;
        draft.isDirty = true;
      })
    );
  },

  /* ---------------------------------------------------------------- */
  /*  Layout application                                               */
  /* ---------------------------------------------------------------- */

  applyLayoutToSlide: (slideId, layoutId) => {
    const state = get();
    const layout = getLayoutById(layoutId);
    if (!layout) return;

    const existingBlocks = state.slideBlocks[slideId] || {};
    const existingOrder = state.slideBlockOrder[slideId] || [];

    let result: { blocks: BlocksRecord; order: string[] };

    if (existingOrder.length > 0) {
      // Re-layout existing blocks into the new zones
      result = applyLayoutFn(layout, existingBlocks, existingOrder);
    } else {
      // Fresh slide — create blocks from scratch
      result = createBlocksFromLayout(layout);
    }

    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        draft.slideBlocks[slideId] = result.blocks;
        draft.slideBlockOrder[slideId] = result.order;
        draft.selectedBlockId = null;
        draft.isDirty = true;
      })
    );
  },

  /* ---------------------------------------------------------------- */
  /*  Helpers                                                          */
  /* ---------------------------------------------------------------- */

  getSlideBlocks: (slideId) => {
    const state = get();
    const blocks = state.slideBlocks[slideId] || {};
    const order = state.slideBlockOrder[slideId] || [];
    return order.map((id) => blocks[id]).filter(Boolean) as EditorBlock[];
  },

  getBlock: (slideId, blockId) => {
    return get().slideBlocks[slideId]?.[blockId];
  },

  currentSlideId: () => {
    const state = get();
    return state.slides[state.selectedSlideIndex]?.id;
  },

  /* ---------------------------------------------------------------- */
  /*  Theme + Title                                                    */
  /* ---------------------------------------------------------------- */

  setTheme: (themeId) => {
    const state = get();
    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        draft.themeId = themeId;
        draft.isDirty = true;
      })
    );
  },

  setTitle: (title) => {
    set(
      produce((draft: EditorState) => {
        if (draft.deck) draft.deck.title = title;
        draft.isDirty = true;
      })
    );
  },

  /* ---------------------------------------------------------------- */
  /*  Undo / Redo                                                      */
  /* ---------------------------------------------------------------- */

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;
    const prev = state.undoStack[state.undoStack.length - 1];
    const current = takeSnapshot(state);
    set({
      slides: prev.slides,
      slideBlocks: prev.slideBlocks,
      slideBlockOrder: prev.slideBlockOrder,
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, current],
      isDirty: true,
      selectedBlockId: null,
    });
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;
    const next = state.redoStack[state.redoStack.length - 1];
    const current = takeSnapshot(state);
    set({
      slides: next.slides,
      slideBlocks: next.slideBlocks,
      slideBlockOrder: next.slideBlockOrder,
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, current],
      isDirty: true,
      selectedBlockId: null,
    });
  },

  /* ---------------------------------------------------------------- */
  /*  Save — syncs v2 blocks back to legacy format before sending      */
  /* ---------------------------------------------------------------- */

  save: async () => {
    const { deck, slides, themeId, slideBlocks, slideBlockOrder } = get();
    if (!deck) return;
    set({ saving: true });
    try {
      // Sync v2 blocks back into legacy SlideData fields for each slide
      const syncedSlides = slides.map((slide) => {
        const sid = slide.id;
        if (!sid) return slide;
        const blocks = slideBlocks[sid];
        const order = slideBlockOrder[sid];
        if (blocks && order && order.length > 0) {
          const orderedBlocks = order
            .map((id: string) => blocks[id])
            .filter(Boolean) as EditorBlock[];
          return syncBlocksToSlideData(slide, orderedBlocks);
        }
        return slide;
      });

      const res = await fetch(`/api/decks/${deck.shareId}/slides`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slides: syncedSlides,
          themeId,
          title: deck.title,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Save failed");
      }
      set({ isDirty: false, saving: false, savedAt: Date.now() });
    } catch (err) {
      set({ saving: false });
      throw err;
    }
  },
}));
