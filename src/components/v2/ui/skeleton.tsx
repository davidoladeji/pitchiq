"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/* ────────────────────── SkeletonLine ─────────────────────────── */

interface SkeletonLineProps extends React.HTMLAttributes<HTMLDivElement> {
  h?: string;
  w?: string;
}

function SkeletonLine({ h = "h-4", w = "w-full", className, ...props }: SkeletonLineProps) {
  return (
    <div
      className={cn("rounded bg-neutral-200 animate-pulse", h, w, className)}
      {...props}
    />
  );
}

/* ────────────────────── SkeletonCard ─────────────────────────── */

interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: number;
}

function SkeletonCard({ height = 120, className, style, ...props }: SkeletonCardProps) {
  return (
    <div
      className={cn("rounded-xl bg-neutral-100 animate-pulse", className)}
      style={{ height, ...style }}
      {...props}
    />
  );
}

/* ────────────────────── SkeletonTable ────────────────────────── */

interface SkeletonTableProps extends React.HTMLAttributes<HTMLDivElement> {
  rows?: number;
}

function SkeletonTable({ rows = 5, className, ...props }: SkeletonTableProps) {
  return (
    <div className={cn("w-full space-y-3", className)} {...props}>
      {/* Header */}
      <div className="flex gap-4">
        <SkeletonLine h="h-3" w="w-1/4" />
        <SkeletonLine h="h-3" w="w-1/4" />
        <SkeletonLine h="h-3" w="w-1/4" />
        <SkeletonLine h="h-3" w="w-1/4" />
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <SkeletonLine h="h-5" w="w-1/4" />
          <SkeletonLine h="h-5" w="w-1/4" />
          <SkeletonLine h="h-5" w="w-1/4" />
          <SkeletonLine h="h-5" w="w-1/4" />
        </div>
      ))}
    </div>
  );
}

/* ────────────────────── SkeletonChart ────────────────────────── */

interface SkeletonChartProps extends React.HTMLAttributes<HTMLDivElement> {}

function SkeletonChart({ className, ...props }: SkeletonChartProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-neutral-200/60 bg-surface-card p-5 space-y-4",
        className
      )}
      {...props}
    >
      {/* Header */}
      <div className="space-y-2">
        <SkeletonLine h="h-4" w="w-1/3" />
        <SkeletonLine h="h-3" w="w-1/5" />
      </div>
      {/* Chart area */}
      <div className="h-[240px] rounded-lg bg-neutral-100 animate-pulse" />
    </div>
  );
}

/* ────────────────────── SkeletonText ─────────────────────────── */

interface SkeletonTextProps extends React.HTMLAttributes<HTMLDivElement> {
  lines?: number;
}

const LINE_WIDTHS = ["w-full", "w-4/5", "w-3/5", "w-full", "w-2/3"];

function SkeletonText({ lines = 3, className, ...props }: SkeletonTextProps) {
  return (
    <div className={cn("space-y-2.5", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonLine
          key={i}
          h="h-3.5"
          w={LINE_WIDTHS[i % LINE_WIDTHS.length]}
        />
      ))}
    </div>
  );
}

export { SkeletonLine, SkeletonCard, SkeletonTable, SkeletonChart, SkeletonText };
