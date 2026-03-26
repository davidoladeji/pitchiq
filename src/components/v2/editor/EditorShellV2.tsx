"use client";

/**
 * v2 Editor Shell — wraps the existing EditorShell with v2 enhancements:
 * - ToastProvider for toast notifications
 * - CommandPalette (⌘K) for quick navigation (self-manages its open state)
 */

import EditorShell from "@/components/editor/EditorShell";
import { ToastProvider } from "@/components/v2/ui/toast";
import CommandPalette from "@/components/v2/shell/CommandPalette";
import type { DeckData } from "@/lib/types";

interface Props {
  deck: DeckData;
  plan: string;
  userName: string;
}

export default function EditorShellV2({ deck, plan, userName }: Props) {
  return (
    <ToastProvider>
      <EditorShell deck={deck} plan={plan} userName={userName} />
      <CommandPalette
        recentDecks={[{ shareId: deck.shareId, title: deck.title }]}
      />
    </ToastProvider>
  );
}
