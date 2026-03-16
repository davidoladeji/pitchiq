"use client";

/**
 * Professional monogram-style company logo generator.
 * Creates unique geometric logos based on company name hash.
 * Deterministic: same name always produces the same logo.
 */

interface CompanyLogoProps {
  companyName: string;
  size?: number; // px, default 64
  accentColor?: string; // hex — overrides hash-selected color
  className?: string;
}

/** Simple deterministic hash from string to number */
function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Pick from array using hash */
function pick<T>(arr: T[], hash: number, offset = 0): T {
  return arr[(hash + offset) % arr.length];
}

/** Lighten/darken hex color */
function adjustColor(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const r = Math.min(255, Math.max(0, parseInt(h.substring(0, 2), 16) + amount));
  const g = Math.min(255, Math.max(0, parseInt(h.substring(2, 4), 16) + amount));
  const b = Math.min(255, Math.max(0, parseInt(h.substring(4, 6), 16) + amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

/** Curated professional color palette */
const PALETTE = [
  "#4361ee", "#7c3aed", "#2563eb", "#0891b2",
  "#059669", "#d97706", "#dc2626", "#e11d48",
  "#6366f1", "#8b5cf6", "#0284c7", "#0d9488",
  "#16a34a", "#ca8a04", "#ea580c", "#9333ea",
];

// Shape generators — each returns SVG elements for a unique logo shape
// All shapes use a 64x64 viewBox coordinate system
type ShapeGen = (h: number, primary: string, tint: string) => JSX.Element;

const shapes: ShapeGen[] = [
  // 0: Rounded rectangle with inner dot grid
  (_h, primary, tint) => (
    <>
      <rect x="6" y="6" width="52" height="52" rx="14" fill={primary} />
      <rect x="12" y="12" width="40" height="40" rx="10" fill={tint} opacity="0.12" />
      <circle cx="22" cy="22" r="2.5" fill="#fff" opacity="0.18" />
      <circle cx="32" cy="22" r="2.5" fill="#fff" opacity="0.18" />
      <circle cx="42" cy="22" r="2.5" fill="#fff" opacity="0.18" />
      <circle cx="22" cy="32" r="2.5" fill="#fff" opacity="0.12" />
      <circle cx="42" cy="32" r="2.5" fill="#fff" opacity="0.12" />
    </>
  ),
  // 1: Split-tone vertical
  (_h, primary, tint) => (
    <>
      <rect x="6" y="6" width="52" height="52" rx="14" fill={primary} />
      <rect x="33" y="6" width="25" height="52" rx="0" fill={tint} opacity="0.18"
        clipPath="inset(0 0 0 0 round 0 14px 14px 0)" />
      <rect x="33" y="6" width="25" height="52" fill="#000" opacity="0.08"
        style={{ clipPath: "inset(0 0 0 0 round 0 14px 14px 0)" }} />
    </>
  ),
  // 2: Concentric rings with gap
  (_h, primary, tint) => (
    <>
      <circle cx="32" cy="32" r="28" fill={primary} />
      <circle cx="32" cy="32" r="22" fill="none" stroke={tint} strokeWidth="2.5" opacity="0.3" />
      <circle cx="32" cy="32" r="16" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.15" />
      <path d="M 32 4 A 28 28 0 0 1 60 32" stroke="#fff" strokeWidth="3" fill="none" opacity="0.2"
        strokeLinecap="round" />
    </>
  ),
  // 3: Lettermark frame — rounded rect with inset border
  (_h, primary, tint) => (
    <>
      <rect x="6" y="6" width="52" height="52" rx="13" fill={primary} />
      <rect x="10" y="10" width="44" height="44" rx="9" fill="none" stroke="#fff" strokeWidth="2" opacity="0.2" />
      <rect x="14" y="14" width="36" height="36" rx="6" fill={tint} opacity="0.08" />
    </>
  ),
  // 4: Abstract interlocking — two overlapping rounded rects
  (_h, primary, tint) => (
    <>
      <rect x="6" y="10" width="36" height="36" rx="10" fill={primary} />
      <rect x="22" y="18" width="36" height="36" rx="10" fill={tint} opacity="0.35" />
      <rect x="22" y="18" width="20" height="28" rx="6" fill={primary} opacity="0.5" />
    </>
  ),
  // 5: Squircle with subtle gradient layer
  (_h, primary, tint) => (
    <>
      <rect x="6" y="6" width="52" height="52" rx="18" fill={primary} />
      <rect x="6" y="6" width="52" height="26" rx="18" fill="#fff" opacity="0.08" />
      <rect x="14" y="14" width="36" height="36" rx="12" fill={tint} opacity="0.1" />
    </>
  ),
  // 6: Octagon with notch
  (_h, primary, tint) => (
    <>
      <polygon points="20,4 44,4 60,20 60,44 44,60 20,60 4,44 4,20" fill={primary} />
      <polygon points="24,10 40,10 52,24 52,40 40,52 24,52 12,40 12,24" fill={tint} opacity="0.12" />
      <rect x="28" y="4" width="8" height="8" fill={adjustColor(primary, -30)} opacity="0.6" />
    </>
  ),
  // 7: Pill / stadium shape
  (_h, primary, tint) => (
    <>
      <rect x="4" y="14" width="56" height="36" rx="18" fill={primary} />
      <rect x="8" y="18" width="48" height="28" rx="14" fill={tint} opacity="0.1" />
      <circle cx="22" cy="32" r="8" fill="#fff" opacity="0.08" />
      <circle cx="42" cy="32" r="8" fill="#fff" opacity="0.08" />
    </>
  ),
  // 8: Stacked layers with depth
  (_h, primary, tint) => (
    <>
      <rect x="10" y="14" width="48" height="44" rx="12" fill={adjustColor(primary, -20)} opacity="0.4" />
      <rect x="6" y="10" width="48" height="44" rx="12" fill={adjustColor(primary, -10)} opacity="0.6" />
      <rect x="4" y="6" width="48" height="44" rx="12" fill={primary} />
      <rect x="10" y="12" width="36" height="32" rx="8" fill={tint} opacity="0.1" />
    </>
  ),
  // 9: Shield with inner chevron
  (_h, primary, tint) => (
    <>
      <path d="M 32 4 L 58 14 L 58 36 Q 58 56 32 62 Q 6 56 6 36 L 6 14 Z" fill={primary} />
      <path d="M 32 14 L 48 20 L 48 34 Q 48 48 32 52 Q 16 48 16 34 L 16 20 Z" fill={tint} opacity="0.12" />
      <path d="M 22 34 L 32 26 L 42 34" stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.2"
        strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  // 10: Split-tone diagonal
  (_h, primary, _tint) => (
    <>
      <rect x="6" y="6" width="52" height="52" rx="14" fill={primary} />
      <polygon points="6,6 58,6 58,58" fill="#000" opacity="0.1"
        style={{ clipPath: "inset(0 round 14px)" }} />
      <rect x="12" y="12" width="40" height="40" rx="10" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.15" />
    </>
  ),
  // 11: Hexagon with inner hexagon
  (_h, primary, tint) => (
    <>
      <polygon points="32,4 56,18 56,46 32,60 8,46 8,18" fill={primary} />
      <polygon points="32,14 46,22 46,42 32,50 18,42 18,22" fill={tint} opacity="0.15" />
      <polygon points="32,22 38,26 38,38 32,42 26,38 26,26" fill="#fff" opacity="0.08" />
    </>
  ),
  // 12: Circle with quarter accent
  (_h, primary, tint) => (
    <>
      <circle cx="32" cy="32" r="28" fill={primary} />
      <path d="M 32 32 L 32 4 A 28 28 0 0 1 60 32 Z" fill="#fff" opacity="0.12" />
      <circle cx="32" cy="32" r="18" fill="none" stroke={tint} strokeWidth="2" opacity="0.2" />
    </>
  ),
  // 13: Rounded square with corner dots
  (_h, primary, tint) => (
    <>
      <rect x="6" y="6" width="52" height="52" rx="14" fill={primary} />
      <circle cx="16" cy="16" r="4" fill="#fff" opacity="0.15" />
      <circle cx="48" cy="16" r="4" fill="#fff" opacity="0.15" />
      <circle cx="16" cy="48" r="4" fill="#fff" opacity="0.15" />
      <circle cx="48" cy="48" r="4" fill="#fff" opacity="0.15" />
      <rect x="14" y="14" width="36" height="36" rx="8" fill={tint} opacity="0.08" />
    </>
  ),
  // 14: Diamond with inner line
  (_h, primary, tint) => (
    <>
      <rect x="9" y="9" width="46" height="46" rx="6" fill={primary} transform="rotate(45 32 32)" />
      <rect x="16" y="16" width="32" height="32" rx="4" fill={tint} opacity="0.12" transform="rotate(45 32 32)" />
      <line x1="32" y1="14" x2="32" y2="50" stroke="#fff" strokeWidth="2" opacity="0.15" />
    </>
  ),
  // 15: Circle with horizontal bar
  (_h, primary, tint) => (
    <>
      <circle cx="32" cy="32" r="28" fill={primary} />
      <rect x="4" y="26" width="56" height="12" rx="6" fill="#fff" opacity="0.1" />
      <circle cx="32" cy="32" r="20" fill="none" stroke={tint} strokeWidth="1.5" opacity="0.2" />
      <circle cx="32" cy="32" r="28" fill="none" stroke="#fff" strokeWidth="1" opacity="0.1" />
    </>
  ),
];

export default function CompanyLogo({
  companyName,
  size = 64,
  accentColor,
  className = "",
}: CompanyLogoProps) {
  const h = hashStr(companyName);

  // Select primary color: use accentColor override or pick from curated palette
  const primary = accentColor || pick(PALETTE, h);
  const tint = adjustColor(primary, 60);

  const shape = pick(shapes, h);

  const initials = companyName
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const fontSize = size * (initials.length > 1 ? 0.4 : 0.45);

  // Unique filter ID to avoid SVG ID collisions when multiple logos render
  const filterId = `logo-shadow-${h % 10000}`;

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 64 64"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        <defs>
          <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.18" />
          </filter>
        </defs>
        <g filter={`url(#${filterId})`}>
          {shape(h, primary, tint)}
        </g>
      </svg>
      <span
        className="relative z-10 select-none"
        style={{
          fontSize,
          fontWeight: 800,
          color: "#fff",
          textShadow: "0 1px 3px rgba(0,0,0,0.25), 0 0px 1px rgba(0,0,0,0.15)",
          letterSpacing: initials.length > 1 ? "0.06em" : undefined,
          lineHeight: 1,
        }}
      >
        {initials}
      </span>
    </div>
  );
}
