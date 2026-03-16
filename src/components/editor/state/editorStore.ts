import { create } from "zustand";
import { produce } from "immer";
import { SlideData, DeckData, SlideBlock } from "@/lib/types";
import { nanoid } from "nanoid";

const MAX_UNDO = 50;

export interface EditorState {
  deck: DeckData | null;
  slides: SlideData[];
  selectedSlideIndex: number;
  selectedBlockId: string | null;
  isDirty: boolean;
  saving: boolean;
  savedAt: number | null;
  undoStack: SlideData[][];
  redoStack: SlideData[][];
  themeId: string;

  // Init
  initDeck: (deck: DeckData) => void;

  // Slide actions
  selectSlide: (index: number) => void;
  updateSlide: (index: number, patch: Partial<SlideData>) => void;
  addSlide: (afterIndex: number, slide: SlideData) => void;
  removeSlide: (index: number) => void;
  duplicateSlide: (index: number) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;

  // Block actions
  selectBlock: (blockId: string | null) => void;
  addBlock: (slideIndex: number, block: SlideBlock) => void;
  updateBlock: (slideIndex: number, blockId: string, patch: Partial<SlideBlock>) => void;
  removeBlock: (slideIndex: number, blockId: string) => void;

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

function pushUndo(state: EditorState): Pick<EditorState, "undoStack" | "redoStack"> {
  const stack = [...state.undoStack, state.slides.map((s) => ({ ...s }))];
  if (stack.length > MAX_UNDO) stack.shift();
  return { undoStack: stack, redoStack: [] };
}

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

  initDeck: (deck) => {
    const slides = deck.slides.map((s) => ({
      ...s,
      id: s.id || nanoid(10),
    }));
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
    });
  },

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
        draft.isDirty = true;
      })
    );
  },

  removeSlide: (index) => {
    const state = get();
    if (state.slides.length <= 1) return;
    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        draft.slides.splice(index, 1);
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
    const clone: SlideData = {
      ...JSON.parse(JSON.stringify(original)),
      id: nanoid(10),
    };
    if (clone.editorBlocks) {
      clone.editorBlocks = clone.editorBlocks.map((b: SlideBlock) => ({
        ...b,
        id: nanoid(10),
      }));
    }
    set(
      produce((draft: EditorState) => {
        Object.assign(draft, pushUndo(state));
        draft.slides.splice(index + 1, 0, clone);
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

  undo: () => {
    const { undoStack, slides } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    set({
      slides: prev,
      undoStack: undoStack.slice(0, -1),
      redoStack: [...get().redoStack, slides],
      isDirty: true,
      selectedBlockId: null,
    });
  },

  redo: () => {
    const { redoStack, slides } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    set({
      slides: next,
      redoStack: redoStack.slice(0, -1),
      undoStack: [...get().undoStack, slides],
      isDirty: true,
      selectedBlockId: null,
    });
  },

  save: async () => {
    const { deck, slides, themeId } = get();
    if (!deck) return;
    set({ saving: true });
    try {
      const res = await fetch(`/api/decks/${deck.shareId}/slides`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slides,
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
