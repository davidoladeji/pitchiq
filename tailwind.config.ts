import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#1a1a2e",
          light: "#252542",
          dark: "#0f0f1a",
          50: "#F5F5F7",
          100: "#E8E8ED",
          200: "#D0D0DA",
          300: "#A8A8B8",
          400: "#787890",
          500: "#505068",
          600: "#383850",
          700: "#28283C",
          800: "#1e1e30",
          900: "#1a1a2e",
          950: "#0f0f1a",
        },
        electric: {
          DEFAULT: "#4361ee",
          light: "#5a7aef",
          dark: "#3651d4",
          50: "#EBEFFF",
          100: "#D6DFFE",
          200: "#A8BCFC",
          300: "#7A99FA",
          400: "#5a7aef",
          500: "#4361ee",
          600: "#3651d4",
          glow: "rgba(67, 97, 238, 0.15)",
        },
        violet: {
          DEFAULT: "#8B5CF6",
          light: "#A78BFA",
          glow: "rgba(139, 92, 246, 0.15)",
        },
        emerald: {
          DEFAULT: "#10B981",
          light: "#34D399",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
        display: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-xl": ["clamp(3.5rem, 8vw, 6rem)", { lineHeight: "1.05", letterSpacing: "-0.04em" }],
        "display-lg": ["clamp(2.5rem, 5vw, 4rem)", { lineHeight: "1.1", letterSpacing: "-0.03em" }],
        "display-md": ["clamp(2rem, 4vw, 3rem)", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "fade-in-up": "fadeInUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "fade-in-down": "fadeInDown 0.4s ease-out forwards",
        "slide-up": "slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "scale-in": "scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        shimmer: "shimmer 2.5s linear infinite",
        float: "float 6s ease-in-out infinite",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite",
        "gradient-shift": "gradientShift 8s ease-in-out infinite",
        "gradient-text": "gradientText 4s ease-in-out infinite",
        orbit: "orbit 20s linear infinite",
        marquee: "marquee 35s linear infinite",
        "glow-pulse": "glowPulse 4s ease-in-out infinite",
        "border-flow": "borderFlow 3s linear infinite",
        "spin-slow": "spin 20s linear infinite",
        "bounce-subtle": "bounceSubtle 2s ease-in-out infinite",
        "slide-in-right": "slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        // v2 design system animations
        "v2-enter": "v2Enter 0.3s ease-out forwards",
        "v2-exit": "v2Exit 0.2s ease-in forwards",
        "v2-slide-in-bottom": "v2SlideInBottom 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "v2-scale-in": "v2ScaleIn 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "v2-progress-fill": "v2ProgressFill 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "v2-number-tick": "v2NumberTick 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "v2-shimmer": "shimmer 2s linear infinite",
      },
      keyframes: {
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        bounceSubtle: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(4px)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(40px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(67, 97, 238, 0.15)" },
          "50%": { boxShadow: "0 0 50px rgba(67, 97, 238, 0.3)" },
        },
        gradientShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        gradientText: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        orbit: {
          "0%": { transform: "rotate(0deg) translateX(120px) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(120px) rotate(-360deg)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        borderFlow: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        // v2 keyframes
        v2Enter: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        v2Exit: {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-4px)" },
        },
        v2SlideInBottom: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        v2ScaleIn: {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        v2ProgressFill: {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        v2NumberTick: {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient":
          "radial-gradient(ellipse 60% 40% at 50% -10%, rgba(67, 97, 238, 0.18) 0%, transparent 55%)",
        "hero-mesh":
          "radial-gradient(at 20% 30%, rgba(67, 97, 238, 0.12) 0px, transparent 50%), radial-gradient(at 80% 20%, rgba(139, 92, 246, 0.08) 0px, transparent 50%), radial-gradient(at 50% 80%, rgba(67, 97, 238, 0.05) 0px, transparent 50%)",
        "electric-gradient":
          "linear-gradient(135deg, #4361ee 0%, #5a7aef 50%, #3651d4 100%)",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
        "cta-gradient":
          "linear-gradient(135deg, #1a1a2e 0%, #252542 50%, #1e1b4b 100%)",
        "card-shine":
          "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0) 100%)",
        "section-fade":
          "linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(67, 97, 238, 0.15)",
        "glow-lg": "0 0 80px rgba(67, 97, 238, 0.2)",
        "glow-xl": "0 0 120px rgba(67, 97, 238, 0.15)",
        "glow-electric": "0 0 0 1px rgba(67,97,238,0.12), 0 4px 16px rgba(67,97,238,0.15)",
        "glow-violet": "0 0 0 1px rgba(139,92,246,0.12), 0 4px 16px rgba(139,92,246,0.15)",
        "card-hover":
          "0 20px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(67, 97, 238, 0.1)",
        premium: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
        "premium-lg":
          "0 32px 64px -16px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)",
        "inner-glow": "inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        "dark-card":
          "0 8px 32px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
        subtle: "0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)",
        // v2 design system elevation levels
        "elevation-1": "0 1px 2px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.06)",
        "elevation-2": "0 2px 4px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.06)",
        "elevation-3": "0 4px 8px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.08)",
      },
      borderRadius: {
        "xl2": "0.875rem",  // 14px
        "2.5xl": "1.25rem", // 20px
        "3xl": "1.5rem",    // 24px
        "4xl": "2rem",
      },
      spacing: {
        "4.5": "1.125rem",
        "13": "3.25rem",
        "15": "3.75rem",
        "18": "4.5rem",
        "22": "5.5rem",
        "26": "6.5rem",
        "30": "7.5rem",
      },
      transitionTimingFunction: {
        "ease-spring": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "ease-out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      backdropBlur: {
        "2xl": "40px",
        "3xl": "64px",
      },
    },
  },
  plugins: [],
};
export default config;
