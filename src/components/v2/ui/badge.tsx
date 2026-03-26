import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-white/[0.06] text-[var(--void-text-muted,rgba(255,255,255,0.5))]",
        primary: "bg-[rgba(67,97,238,0.15)] text-[var(--neon-cyan,#00F0FF)]",
        success: "bg-[rgba(0,255,157,0.1)] text-[var(--neon-emerald,#00FF9D)]",
        warning: "bg-[rgba(251,191,36,0.12)] text-[#FBBF24]",
        error: "bg-[rgba(248,113,113,0.12)] text-[#F87171]",
        outline:
          "border border-[var(--void-border,rgba(255,255,255,0.06))] text-[var(--void-text-muted,rgba(255,255,255,0.5))] bg-transparent",
      },
      size: {
        sm: "text-[10px] px-1.5 py-0.5",
        default: "text-xs px-2 py-0.5",
        lg: "text-sm px-2.5 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(badgeVariants({ variant, size }), className)}
      {...props}
    />
  )
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
