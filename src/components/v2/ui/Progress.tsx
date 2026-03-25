"use client";

import { cn } from "@/lib/cn";
import { motion } from "framer-motion";

interface ProgressProps {
  value: number; // 0-100
  max?: number;
  label?: string;
  showPercentage?: boolean;
  /** Colors based on score thresholds */
  scoreColored?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function getScoreColor(value: number): string {
  if (value >= 80) return "bg-emerald-500";
  if (value >= 60) return "bg-amber-500";
  return "bg-red-500";
}

/**
 * Animated progress bar with spring physics and score coloring.
 */
export function Progress({
  value,
  max = 100,
  label,
  showPercentage = false,
  scoreColored = false,
  size = "md",
  className,
}: ProgressProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const barColor = scoreColored ? getScoreColor(percent) : "bg-electric";
  const trackHeight = size === "sm" ? "h-1" : size === "lg" ? "h-3" : "h-2";

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-medium text-navy-500 dark:text-white/50">{label}</span>}
          {showPercentage && <span className="text-xs font-semibold text-navy dark:text-white">{Math.round(percent)}%</span>}
        </div>
      )}
      <div className={cn("w-full rounded-full bg-[var(--surface-2)] overflow-hidden", trackHeight)}>
        <motion.div
          className={cn("h-full rounded-full", barColor)}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
        />
      </div>
    </div>
  );
}
