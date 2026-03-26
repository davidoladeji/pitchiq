"use client";

import * as React from "react";
import { cn } from "@/lib/cn";
import type { LucideIcon } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, icon: Icon, error, id, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium"
            style={{ color: "var(--void-text-muted, rgba(255,255,255,0.5))" }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--void-text-dim, rgba(255,255,255,0.3))" }} />
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "h-10 w-full rounded-lg border px-3 text-sm transition-colors focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50",
              Icon && "pl-9",
              error && "border-red-500/50 focus:border-red-500 focus:ring-red-500/20",
              className
            )}
            style={{
              background: "var(--void-surface, rgba(255,255,255,0.03))",
              borderColor: error ? undefined : "var(--void-border, rgba(255,255,255,0.06))",
              color: "var(--void-text, #E8E8ED)",
              ...(error ? {} : { "--tw-ring-color": "rgba(67,97,238,0.2)" } as React.CSSProperties),
            }}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-400">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
