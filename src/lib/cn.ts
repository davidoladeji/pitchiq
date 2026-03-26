import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Human-readable relative time */
export function relativeTime(date: string): string {
  const diffMs = Date.now() - new Date(date).getTime();
  if (diffMs < 0) return "just now";
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(date));
}

/** Format cents to dollar string — 2900 → "$29.00" */
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(cents / 100);
}

/** Format a number as a signed percent — 12 → "+12%", -5 → "-5%" */
export function formatPercent(value: number): string {
  return `${value > 0 ? "+" : ""}${Math.round(value)}%`;
}

/** Format large numbers compactly — 1200 → "1.2K", 3800000 → "3.8M" */
export function formatCompact(n: number): string {
  if (Math.abs(n) >= 1_000_000) return `${parseFloat((n / 1_000_000).toFixed(1))}M`;
  if (Math.abs(n) >= 1_000) return `${parseFloat((n / 1_000).toFixed(1))}K`;
  return String(n);
}
