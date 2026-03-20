"use client";

import { useEffect, useRef } from "react";
import { useEditorStore } from "./editorStore";

const AUTOSAVE_INTERVAL_MS = 30_000; // 30 seconds
const DEBOUNCE_MS = 2_000; // 2-second debounce after last change

/**
 * Autosave hook — starts a 30-second interval that calls autosave()
 * when the editor is dirty. Also debounces: if changes happen rapidly,
 * it waits 2 seconds of inactivity before the interval fires.
 *
 * Mount this once in the editor layout/page component.
 */
export function useAutosave() {
  const autosave = useEditorStore((s) => s.autosave);
  const isDirty = useEditorStore((s) => s.isDirty);

  // Track when isDirty last became true (for debounce)
  const lastDirtyAt = useRef<number>(0);

  // Update dirty timestamp whenever isDirty transitions to true
  useEffect(() => {
    if (isDirty) {
      lastDirtyAt.current = Date.now();
    }
  }, [isDirty]);

  // Main autosave interval
  useEffect(() => {
    const interval = setInterval(() => {
      const store = useEditorStore.getState();
      if (!store.isDirty || store.saving) return;

      // Debounce: only autosave if last change was > DEBOUNCE_MS ago
      const elapsed = Date.now() - lastDirtyAt.current;
      if (elapsed < DEBOUNCE_MS) return;

      autosave();
    }, AUTOSAVE_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [autosave]);

  // Clear "saved" status after 3 seconds so the indicator fades
  const autosaveStatus = useEditorStore((s) => s.autosaveStatus);
  useEffect(() => {
    if (autosaveStatus === "saved") {
      const timeout = setTimeout(() => {
        useEditorStore.setState({ autosaveStatus: "idle" });
      }, 3_000);
      return () => clearTimeout(timeout);
    }
  }, [autosaveStatus]);
}
