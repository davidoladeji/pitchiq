import { cn } from "@/lib/cn";

interface KbdProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Keyboard shortcut hint component.
 * Renders like ⌘K with subtle styling.
 */
export function Kbd({ children, className }: KbdProps) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center justify-center min-w-[1.5rem] h-5 px-1.5 rounded",
        "border border-[var(--border-default)] bg-[var(--surface-2)]",
        "text-[10px] font-medium text-navy-400 dark:text-white/40",
        "font-mono leading-none",
        className,
      )}
    >
      {children}
    </kbd>
  );
}
