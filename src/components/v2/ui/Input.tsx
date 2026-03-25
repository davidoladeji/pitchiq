"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
}

/**
 * Clean input with animated focus border and optional label/error.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, icon, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-navy dark:text-white mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 dark:text-white/40">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full rounded-xl border bg-[var(--surface-interactive)] px-3.5 py-2.5 text-sm",
              "text-navy dark:text-white placeholder:text-navy-300 dark:placeholder:text-white/30",
              "transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-electric/30 focus:border-electric",
              error
                ? "border-red-400 focus:ring-red-400/30 focus:border-red-400"
                : "border-[var(--border-default)] hover:border-[var(--border-emphasis)]",
              icon && "pl-10",
              className,
            )}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
        </div>
        {hint && !error && (
          <p id={`${inputId}-hint`} className="mt-1 text-xs text-navy-400 dark:text-white/40">{hint}</p>
        )}
        {error && (
          <p id={`${inputId}-error`} className="mt-1 text-xs text-red-500" role="alert">{error}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
