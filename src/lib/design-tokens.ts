/**
 * Hex values for SVG, Recharts, and inline styles where Tailwind classes cannot be used.
 * Matches tailwind.config.ts and globals.css (navy #1a1a2e, electric #4361ee).
 * Single source of truth for design-system color hex in JS/TS.
 */
export const NAVY_HEX = "#1a1a2e";
export const ELECTRIC_HEX = "#4361ee";
export const VIOLET_HEX = "#8B5CF6";
export const EMERALD_HEX = "#22c55e";
export const AMBER_HEX = "#f59e0b";
export const RED_HEX = "#ef4444";

/** Chart/series palette (Recharts, SVG) — electric, violet, emerald, amber, red, cyan, pink */
export const CHART_COLORS = [
  ELECTRIC_HEX,
  "#7c3aed",
  "#10b981",
  AMBER_HEX,
  RED_HEX,
  "#06b6d4",
  "#ec4899",
];

/**
 * Returns hex for PIQ score tier (gauge/radar stroke, SVG fill).
 * 80+ emerald, 60+ electric, 40+ amber, else red.
 */
export function scoreColorHex(score: number): string {
  if (score >= 80) return EMERALD_HEX;
  if (score >= 60) return ELECTRIC_HEX;
  if (score >= 40) return AMBER_HEX;
  return RED_HEX;
}
