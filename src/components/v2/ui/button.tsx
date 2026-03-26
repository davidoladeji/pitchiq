import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "text-white shadow-[0_4px_20px_rgba(67,97,238,0.3)]",
        secondary:
          "text-[var(--void-text-muted,rgba(255,255,255,0.5))] hover:bg-white/[0.08]",
        outline:
          "border bg-transparent border-[var(--void-border,rgba(255,255,255,0.06))] text-[var(--void-text-muted,rgba(255,255,255,0.5))] hover:bg-white/[0.06] hover:border-white/[0.12]",
        ghost: "text-[var(--void-text-muted,rgba(255,255,255,0.5))] hover:bg-white/[0.06]",
        destructive: "bg-red-500/80 text-white hover:bg-red-500",
        link: "text-[var(--neon-cyan,#00F0FF)] underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        default: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, disabled, style, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || loading}
      style={{
        ...(variant === "default" || variant === undefined ? { background: "var(--neon-electric, #4361EE)" } : {}),
        ...(variant === "secondary" ? { background: "var(--void-surface, rgba(255,255,255,0.03))" } : {}),
        ...style,
      }}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  )
);
Button.displayName = "Button";

export { Button, buttonVariants };
