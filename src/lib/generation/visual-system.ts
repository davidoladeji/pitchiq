import type { CompanyDNA, VisualPersonality } from "./company-dna";
import type { ThemeDef } from "@/lib/themes";

/* ------------------------------------------------------------------ */
/*  Visual System — bespoke design language per deck                   */
/* ------------------------------------------------------------------ */

export interface VisualSystem {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    accent: string;
    chart: string[];
    gradient?: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    headingWeight: number;
    headingSizes: { h1: number; h2: number; h3: number };
    bodySize: number;
    lineHeight: number;
    letterSpacing: "tight" | "normal" | "wide";
    headingCase: "none" | "uppercase" | "capitalize";
  };
  spacing: {
    slideMargin: number;
    blockGap: number;
    cardPadding: number;
    cardRadius: number;
  };
  imageStyle: {
    treatment: "full-bleed" | "contained" | "rounded" | "circular" | "masked";
    overlay: "none" | "gradient" | "dark-overlay" | "color-tint";
    filterStyle: "none" | "slight-desaturate" | "high-contrast" | "duotone";
  };
  motifs: {
    dividerStyle: "solid" | "dashed" | "gradient" | "dots" | "none";
    iconStyle: "outline" | "filled" | "duotone" | "none";
    backgroundPattern: "none" | "dots" | "grid" | "gradient-mesh" | "noise";
    accentShape: "circle" | "rounded-rect" | "line" | "none";
  };
  dataViz: {
    chartStyle: "minimal" | "detailed" | "infographic";
    showGridLines: boolean;
    animateOnReveal: boolean;
    labelPosition: "inside" | "outside" | "tooltip";
  };
}

/* ------------------------------------------------------------------ */
/*  Personality Presets                                                 */
/* ------------------------------------------------------------------ */

const PERSONALITY_PRESETS: Record<VisualPersonality, VisualSystem> = {
  "corporate-premium": {
    colors: {
      primary: "#1e3a5f",
      secondary: "#4a90d9",
      background: "#ffffff",
      surface: "#f8fafc",
      text: "#0f172a",
      textMuted: "#64748b",
      accent: "#2563eb",
      chart: ["#2563eb", "#0ea5e9", "#06b6d4", "#14b8a6", "#8b5cf6", "#ec4899"],
      gradient: "linear-gradient(135deg, #1e3a5f, #2563eb)",
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: 700,
      headingSizes: { h1: 48, h2: 36, h3: 24 },
      bodySize: 16,
      lineHeight: 1.6,
      letterSpacing: "normal",
      headingCase: "none",
    },
    spacing: { slideMargin: 1.5, blockGap: 16, cardPadding: 24, cardRadius: 8 },
    imageStyle: { treatment: "contained", overlay: "none", filterStyle: "none" },
    motifs: { dividerStyle: "solid", iconStyle: "outline", backgroundPattern: "none", accentShape: "line" },
    dataViz: { chartStyle: "detailed", showGridLines: true, animateOnReveal: true, labelPosition: "outside" },
  },
  "bold-playful": {
    colors: {
      primary: "#ff6b35",
      secondary: "#004e98",
      background: "#fafafa",
      surface: "#ffffff",
      text: "#1a1a2e",
      textMuted: "#6b7280",
      accent: "#ff6b35",
      chart: ["#ff6b35", "#004e98", "#ffd166", "#06d6a0", "#ef476f", "#118ab2"],
      gradient: "linear-gradient(135deg, #ff6b35, #ffd166)",
    },
    typography: {
      headingFont: "Space Grotesk",
      bodyFont: "Inter",
      headingWeight: 800,
      headingSizes: { h1: 52, h2: 38, h3: 26 },
      bodySize: 16,
      lineHeight: 1.5,
      letterSpacing: "tight",
      headingCase: "none",
    },
    spacing: { slideMargin: 1, blockGap: 14, cardPadding: 20, cardRadius: 16 },
    imageStyle: { treatment: "rounded", overlay: "color-tint", filterStyle: "none" },
    motifs: { dividerStyle: "gradient", iconStyle: "filled", backgroundPattern: "gradient-mesh", accentShape: "circle" },
    dataViz: { chartStyle: "infographic", showGridLines: false, animateOnReveal: true, labelPosition: "inside" },
  },
  "clinical-clean": {
    colors: {
      primary: "#059669",
      secondary: "#0d9488",
      background: "#ffffff",
      surface: "#f0fdf4",
      text: "#1e293b",
      textMuted: "#64748b",
      accent: "#059669",
      chart: ["#059669", "#0d9488", "#0284c7", "#6366f1", "#f59e0b", "#ef4444"],
      gradient: "linear-gradient(135deg, #059669, #0d9488)",
    },
    typography: {
      headingFont: "DM Sans",
      bodyFont: "Inter",
      headingWeight: 700,
      headingSizes: { h1: 44, h2: 34, h3: 22 },
      bodySize: 15,
      lineHeight: 1.65,
      letterSpacing: "normal",
      headingCase: "none",
    },
    spacing: { slideMargin: 1.5, blockGap: 16, cardPadding: 24, cardRadius: 12 },
    imageStyle: { treatment: "contained", overlay: "none", filterStyle: "slight-desaturate" },
    motifs: { dividerStyle: "solid", iconStyle: "outline", backgroundPattern: "none", accentShape: "rounded-rect" },
    dataViz: { chartStyle: "detailed", showGridLines: true, animateOnReveal: false, labelPosition: "outside" },
  },
  "scientific-rigorous": {
    colors: {
      primary: "#334155",
      secondary: "#475569",
      background: "#ffffff",
      surface: "#f1f5f9",
      text: "#0f172a",
      textMuted: "#64748b",
      accent: "#6366f1",
      chart: ["#6366f1", "#3b82f6", "#14b8a6", "#f59e0b", "#ef4444", "#8b5cf6"],
    },
    typography: {
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      headingWeight: 700,
      headingSizes: { h1: 42, h2: 32, h3: 22 },
      bodySize: 15,
      lineHeight: 1.7,
      letterSpacing: "normal",
      headingCase: "none",
    },
    spacing: { slideMargin: 1.5, blockGap: 14, cardPadding: 20, cardRadius: 6 },
    imageStyle: { treatment: "contained", overlay: "none", filterStyle: "none" },
    motifs: { dividerStyle: "solid", iconStyle: "outline", backgroundPattern: "grid", accentShape: "line" },
    dataViz: { chartStyle: "detailed", showGridLines: true, animateOnReveal: false, labelPosition: "outside" },
  },
  "futuristic-gradient": {
    colors: {
      primary: "#7c3aed",
      secondary: "#06b6d4",
      background: "#0f0f23",
      surface: "#1a1a3e",
      text: "#f8fafc",
      textMuted: "#94a3b8",
      accent: "#7c3aed",
      chart: ["#7c3aed", "#06b6d4", "#f472b6", "#34d399", "#fbbf24", "#f87171"],
      gradient: "linear-gradient(135deg, #7c3aed, #06b6d4)",
    },
    typography: {
      headingFont: "Space Grotesk",
      bodyFont: "Inter",
      headingWeight: 700,
      headingSizes: { h1: 48, h2: 36, h3: 24 },
      bodySize: 16,
      lineHeight: 1.6,
      letterSpacing: "tight",
      headingCase: "none",
    },
    spacing: { slideMargin: 1, blockGap: 14, cardPadding: 20, cardRadius: 12 },
    imageStyle: { treatment: "rounded", overlay: "gradient", filterStyle: "high-contrast" },
    motifs: { dividerStyle: "gradient", iconStyle: "duotone", backgroundPattern: "gradient-mesh", accentShape: "circle" },
    dataViz: { chartStyle: "minimal", showGridLines: false, animateOnReveal: true, labelPosition: "tooltip" },
  },
  "organic-hopeful": {
    colors: {
      primary: "#166534",
      secondary: "#92400e",
      background: "#fefce8",
      surface: "#f0fdf4",
      text: "#1c1917",
      textMuted: "#78716c",
      accent: "#166534",
      chart: ["#166534", "#92400e", "#0369a1", "#7c3aed", "#e11d48", "#ea580c"],
      gradient: "linear-gradient(135deg, #166534, #22c55e)",
    },
    typography: {
      headingFont: "DM Sans",
      bodyFont: "Inter",
      headingWeight: 700,
      headingSizes: { h1: 46, h2: 34, h3: 24 },
      bodySize: 16,
      lineHeight: 1.65,
      letterSpacing: "normal",
      headingCase: "none",
    },
    spacing: { slideMargin: 1.5, blockGap: 16, cardPadding: 24, cardRadius: 12 },
    imageStyle: { treatment: "rounded", overlay: "none", filterStyle: "none" },
    motifs: { dividerStyle: "dots", iconStyle: "filled", backgroundPattern: "none", accentShape: "circle" },
    dataViz: { chartStyle: "infographic", showGridLines: false, animateOnReveal: true, labelPosition: "outside" },
  },
  "editorial-refined": {
    colors: {
      primary: "#1c1917",
      secondary: "#a8a29e",
      background: "#fafaf9",
      surface: "#ffffff",
      text: "#1c1917",
      textMuted: "#78716c",
      accent: "#dc2626",
      chart: ["#dc2626", "#1c1917", "#0369a1", "#166534", "#7c3aed", "#ea580c"],
    },
    typography: {
      headingFont: "Plus Jakarta Sans",
      bodyFont: "Inter",
      headingWeight: 800,
      headingSizes: { h1: 50, h2: 36, h3: 24 },
      bodySize: 16,
      lineHeight: 1.7,
      letterSpacing: "tight",
      headingCase: "capitalize",
    },
    spacing: { slideMargin: 1.5, blockGap: 18, cardPadding: 28, cardRadius: 4 },
    imageStyle: { treatment: "full-bleed", overlay: "dark-overlay", filterStyle: "high-contrast" },
    motifs: { dividerStyle: "solid", iconStyle: "none", backgroundPattern: "none", accentShape: "line" },
    dataViz: { chartStyle: "minimal", showGridLines: false, animateOnReveal: false, labelPosition: "outside" },
  },
  "startup-energetic": {
    colors: {
      primary: "#4f46e5",
      secondary: "#7c3aed",
      background: "#fafafa",
      surface: "#ffffff",
      text: "#111827",
      textMuted: "#6b7280",
      accent: "#4f46e5",
      chart: ["#4f46e5", "#06b6d4", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"],
      gradient: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    },
    typography: {
      headingFont: "Inter",
      bodyFont: "Inter",
      headingWeight: 800,
      headingSizes: { h1: 48, h2: 36, h3: 24 },
      bodySize: 16,
      lineHeight: 1.6,
      letterSpacing: "tight",
      headingCase: "none",
    },
    spacing: { slideMargin: 1, blockGap: 14, cardPadding: 20, cardRadius: 12 },
    imageStyle: { treatment: "rounded", overlay: "none", filterStyle: "none" },
    motifs: { dividerStyle: "gradient", iconStyle: "filled", backgroundPattern: "dots", accentShape: "rounded-rect" },
    dataViz: { chartStyle: "infographic", showGridLines: false, animateOnReveal: true, labelPosition: "inside" },
  },
};

/* ------------------------------------------------------------------ */
/*  Generator                                                          */
/* ------------------------------------------------------------------ */

export function generateVisualSystem(dna: CompanyDNA, theme?: ThemeDef): VisualSystem {
  // Start from personality preset
  const preset = structuredClone(PERSONALITY_PRESETS[dna.visualPersonality]);

  // Override with brand colors if provided
  if (dna.brandColor) {
    preset.colors.primary = dna.brandColor;
    preset.colors.accent = dna.brandColor;
    // Derive gradient from brand color
    preset.colors.gradient = `linear-gradient(135deg, ${dna.brandColor}, ${lighten(dna.brandColor, 0.2)})`;
    // Update first chart color to match brand
    preset.colors.chart[0] = dna.brandColor;
  }

  // Override with brand font if provided
  if (dna.brandFont) {
    preset.typography.headingFont = dna.brandFont;
  }

  // Apply existing PitchIQ theme colors if provided (for backward compatibility)
  if (theme) {
    preset.colors.accent = theme.accent;
    preset.colors.primary = theme.bgDark;
    preset.colors.text = theme.textPrimary;
    preset.colors.textMuted = theme.textSecondary;
    if (theme.headingFont) preset.typography.headingFont = theme.headingFont;
  }

  // Adjust information density settings
  if (dna.informationDensity === "data-heavy") {
    preset.dataViz.chartStyle = "detailed";
    preset.dataViz.showGridLines = true;
    preset.typography.bodySize = 14; // Smaller text to fit more data
  } else if (dna.informationDensity === "vision-heavy") {
    preset.dataViz.chartStyle = "minimal";
    preset.typography.headingSizes.h1 = Math.min(preset.typography.headingSizes.h1 + 4, 56);
  }

  return preset;
}

/* ------------------------------------------------------------------ */
/*  Color Utilities                                                    */
/* ------------------------------------------------------------------ */

function lighten(hex: string, amount: number): string {
  const h = hex.replace("#", "");
  const r = Math.min(255, parseInt(h.substring(0, 2), 16) + Math.round(255 * amount));
  const g = Math.min(255, parseInt(h.substring(2, 4), 16) + Math.round(255 * amount));
  const b = Math.min(255, parseInt(h.substring(4, 6), 16) + Math.round(255 * amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
