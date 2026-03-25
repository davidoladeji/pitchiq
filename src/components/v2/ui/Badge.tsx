import { cn } from "@/lib/cn";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1 font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-navy/10 text-navy dark:bg-white/10 dark:text-white",
        electric: "bg-electric/10 text-electric",
        violet: "bg-violet/10 text-violet-600",
        emerald: "bg-emerald-500/10 text-emerald-600",
        amber: "bg-amber-500/10 text-amber-600",
        red: "bg-red-500/10 text-red-600",
        outline: "border border-[var(--border-emphasis)] text-navy-500 dark:text-white/60",
      },
      size: {
        sm: "text-[10px] px-1.5 py-0.5 rounded-md",
        md: "text-xs px-2 py-0.5 rounded-lg",
        lg: "text-sm px-2.5 py-1 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export function Badge({ className, variant, size, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size, className }))} {...props}>
      {dot && (
        <span
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === "emerald" && "bg-emerald-500",
            variant === "amber" && "bg-amber-500",
            variant === "red" && "bg-red-500",
            variant === "electric" && "bg-electric",
            variant === "violet" && "bg-violet-500",
            (!variant || variant === "default" || variant === "outline") && "bg-navy-400 dark:bg-white/40",
          )}
        />
      )}
      {children}
    </span>
  );
}
