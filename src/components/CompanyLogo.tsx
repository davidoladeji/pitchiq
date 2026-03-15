"use client";

/**
 * Procedural company logo generator — creates unique geometric logos
 * based on company name hash. Deterministic: same name → same logo.
 */

interface CompanyLogoProps {
  companyName: string;
  size?: number; // px, default 64
  accentColor?: string; // hex
  className?: string;
}

/** Simple deterministic hash from string → number */
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

// Logo shape generators — each returns SVG elements
type ShapeGen = (h: number, accent: string, light: string) => JSX.Element;

const shapes: ShapeGen[] = [
  // 0: Rounded square with cutout
  (h, accent, light) => (
    <>
      <rect x="8" y="8" width="48" height="48" rx="14" fill={accent} />
      <rect x="18" y="18" width="20" height="20" rx="6" fill={light} opacity="0.25" />
    </>
  ),
  // 1: Hexagon
  (h, accent, light) => (
    <>
      <polygon points="32,6 56,18 56,46 32,58 8,46 8,18" fill={accent} />
      <polygon points="32,16 46,24 46,40 32,48 18,40 18,24" fill={light} opacity="0.2" />
    </>
  ),
  // 2: Circle with arc
  (h, accent, light) => (
    <>
      <circle cx="32" cy="32" r="26" fill={accent} />
      <path d="M 32 6 A 26 26 0 0 1 58 32" stroke={light} strokeWidth="4" fill="none" opacity="0.4" />
      <circle cx="32" cy="32" r="12" fill={light} opacity="0.15" />
    </>
  ),
  // 3: Diamond
  (h, accent, light) => (
    <>
      <rect x="10" y="10" width="44" height="44" rx="4" fill={accent} transform="rotate(45 32 32)" />
      <rect x="20" y="20" width="24" height="24" rx="2" fill={light} opacity="0.2" transform="rotate(45 32 32)" />
    </>
  ),
  // 4: Stacked bars
  (h, accent, light) => (
    <>
      <rect x="8" y="8" width="48" height="48" rx="12" fill={accent} />
      <rect x="14" y="18" width="36" height="6" rx="3" fill={light} opacity="0.35" />
      <rect x="14" y="29" width="28" height="6" rx="3" fill={light} opacity="0.25" />
      <rect x="14" y="40" width="20" height="6" rx="3" fill={light} opacity="0.15" />
    </>
  ),
  // 5: Shield
  (h, accent, light) => (
    <>
      <path d="M 32 6 L 56 16 L 56 36 Q 56 54 32 58 Q 8 54 8 36 L 8 16 Z" fill={accent} />
      <path d="M 32 16 L 46 22 L 46 34 Q 46 46 32 48 Q 18 46 18 34 L 18 22 Z" fill={light} opacity="0.15" />
    </>
  ),
  // 6: Rounded square with triangle accent
  (h, accent, light) => (
    <>
      <rect x="8" y="8" width="48" height="48" rx="14" fill={accent} />
      <polygon points="20,44 32,18 44,44" fill={light} opacity="0.25" />
    </>
  ),
  // 7: Circle segments
  (h, accent, light) => (
    <>
      <circle cx="32" cy="32" r="26" fill={accent} />
      <path d="M 32 32 L 32 6 A 26 26 0 0 1 58 32 Z" fill={light} opacity="0.2" />
      <path d="M 32 32 L 58 32 A 26 26 0 0 1 32 58 Z" fill={light} opacity="0.1" />
    </>
  ),
];

export default function CompanyLogo({
  companyName,
  size = 64,
  accentColor = "#4361ee",
  className = "",
}: CompanyLogoProps) {
  const h = hashStr(companyName);
  const light = adjustColor(accentColor, 80);
  const shape = pick(shapes, h);
  const initials = companyName
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

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
        {shape(h, accentColor, light)}
      </svg>
      <span
        className="relative z-10 font-bold select-none"
        style={{
          fontSize: size * (initials.length > 1 ? 0.3 : 0.38),
          color: "#fff",
          textShadow: "0 1px 2px rgba(0,0,0,0.2)",
          letterSpacing: initials.length > 1 ? "0.04em" : undefined,
        }}
      >
        {initials}
      </span>
    </div>
  );
}
