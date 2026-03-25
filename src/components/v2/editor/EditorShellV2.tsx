"use client";

/**
 * v2 Editor Shell — wraps the existing EditorShell with v2 design tokens.
 * The editor has its own full-screen layout (sidebar, canvas, toolbars)
 * so we don't use AppShellV2. Instead we apply the ToastProvider and
 * CommandPalette for consistency with the v2 experience.
 */

import EditorShell from "@/components/editor/EditorShell";
import { ToastProvider } from "@/components/v2/ui/Toast";
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
    </ToastProvider>
  );
}
