"use client";

import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Button } from "@/components/v2/ui/button";
import type { LucideIcon } from "lucide-react";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
  className,
  ...props
}: EmptyStateProps) {
  const actionButton = actionLabel ? (
    <Button variant="default">{actionLabel}</Button>
  ) : null;

  return (
    <div
      className={cn("flex flex-col items-center justify-center py-16", className)}
      {...props}
    >
      <Icon className="mx-auto mb-4 h-12 w-12 text-neutral-300" />
      <h3 className="mb-2 text-lg font-semibold text-neutral-700">{title}</h3>
      <p className="mx-auto mb-6 max-w-md text-center text-sm text-neutral-500">
        {description}
      </p>
      {actionButton &&
        (actionHref ? (
          <Link href={actionHref}>{actionButton}</Link>
        ) : (
          actionButton
        ))}
    </div>
  );
}

export { EmptyState };
