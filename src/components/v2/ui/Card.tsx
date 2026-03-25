import { forwardRef } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "inset";
  interactive?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", interactive, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl border transition-all duration-200",
          variant === "default" && "bg-[var(--surface-1)] border-[var(--border-default)]",
          variant === "glass" && "bg-[var(--surface-overlay)] backdrop-blur-xl border-[var(--border-subtle)]",
          variant === "inset" && "bg-[var(--surface-2)] border-[var(--border-subtle)]",
          interactive && "hover:-translate-y-0.5 hover:shadow-lg hover:border-[var(--border-interactive)] cursor-pointer",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-5 pt-5 pb-3", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("px-5 pb-5", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";
