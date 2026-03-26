"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

interface ProgressRingProps extends React.HTMLAttributes<HTMLDivElement> {
  score: number;
  size?: number;
  strokeWidth?: number;
  showLabel?: boolean;
}

function getScoreColor(score: number): string {
  if (score >= 80) return "var(--color-success-500)";
  if (score >= 60) return "var(--color-primary-500)";
  if (score >= 40) return "var(--color-warning-500)";
  return "var(--color-error-500)";
}

function getScoreTextClass(score: number): string {
  if (score >= 80) return "text-success-600";
  if (score >= 60) return "text-primary-600";
  if (score >= 40) return "text-warning-600";
  return "text-error-600";
}

const ProgressRing = React.forwardRef<HTMLDivElement, ProgressRingProps>(
  (
    { score, size = 48, strokeWidth = 3, showLabel = true, className, ...props },
    ref
  ) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const clampedScore = Math.max(0, Math.min(100, score));
    const offset = circumference - (clampedScore / 100) * circumference;
    const color = getScoreColor(clampedScore);

    return (
      <div
        ref={ref}
        className={cn("relative inline-flex items-center justify-center", className)}
        style={{ width: size, height: size }}
        {...props}
      >
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--color-neutral-200)"
            strokeWidth={strokeWidth}
          />
          {/* Score ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-[stroke-dashoffset] duration-700 ease-out"
          />
        </svg>
        {showLabel && (
          <span
            className={cn(
              "absolute text-center font-semibold font-mono leading-none",
              getScoreTextClass(clampedScore)
            )}
            style={{ fontSize: size * 0.28 }}
          >
            {clampedScore}
          </span>
        )}
      </div>
    );
  }
);
ProgressRing.displayName = "ProgressRing";

export { ProgressRing };
