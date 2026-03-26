import * as React from "react";
import { cn } from "@/lib/cn";

/* ─────────────────────────── Card ─────────────────────────── */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  gradient?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover, gradient, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border shadow-sm",
        "border-[var(--void-border,rgba(255,255,255,0.06))] bg-[var(--void-surface,rgba(255,255,255,0.03))]",
        hover && "hover-lift",
        gradient && "bg-gradient-primary-soft",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

/* ─────────────────────── CardHeader ──────────────────────── */

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-5", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/* ──────────────────────── CardTitle ──────────────────────── */

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-base font-semibold", className)}
    style={{ color: "var(--void-text, #E8E8ED)" }}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/* ────────────────────── CardDescription ─────────────────── */

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm", className)}
    style={{ color: "var(--void-text-dim, rgba(255,255,255,0.3))" }}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/* ─────────────────────── CardContent ────────────────────── */

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("px-5 pb-5", className)} {...props} />
));
CardContent.displayName = "CardContent";

/* ──────────────────────── CardFooter ────────────────────── */

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center px-5 pb-5", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
