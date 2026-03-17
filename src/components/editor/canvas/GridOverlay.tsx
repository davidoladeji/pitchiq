"use client";

/**
 * GridOverlay — 12-column × 6-row SVG grid shown during drag/resize.
 * Renders dashed lines at low opacity to help users align blocks.
 */

interface GridOverlayProps {
  visible: boolean;
  columns?: number;
  rows?: number;
}

export default function GridOverlay({
  visible,
  columns = 12,
  rows = 6,
}: GridOverlayProps) {
  if (!visible) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none z-[5] transition-opacity"
      style={{ opacity: visible ? 1 : 0 }}
      preserveAspectRatio="none"
    >
      {/* Vertical column lines */}
      {Array.from({ length: columns + 1 }, (_, i) => {
        const x = `${(i / columns) * 100}%`;
        return (
          <line
            key={`col-${i}`}
            x1={x}
            y1="0%"
            x2={x}
            y2="100%"
            stroke="rgba(67, 97, 238, 0.15)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        );
      })}

      {/* Horizontal row lines */}
      {Array.from({ length: rows + 1 }, (_, i) => {
        const y = `${(i / rows) * 100}%`;
        return (
          <line
            key={`row-${i}`}
            x1="0%"
            y1={y}
            x2="100%"
            y2={y}
            stroke="rgba(67, 97, 238, 0.15)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
        );
      })}
    </svg>
  );
}
