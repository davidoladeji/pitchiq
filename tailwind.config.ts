import type { Config } from "tailwindcss";

const config: Config = {
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
          light: "#16213e",
          dark: "#0f0f1e",
          50: "#e8e8ef",
          100: "#d1d1df",
          200: "#a3a3bf",
          800: "#121225",
          900: "#0a0a16",
          950: "#060610",
        },
        electric: {
          DEFAULT: "#4361ee",
          light: "#5a7bf7",
          dark: "#3651d4",
          50: "#eef1fe",
          100: "#d5dbfc",
          200: "#a8b5f9",
          400: "#6b82f3",
          glow: "rgba(67, 97, 238, 0.15)",
        },
        violet: {
          DEFAULT: "#7c3aed",
          light: "#a78bfa",
          glow: "rgba(124, 58, 237, 0.15)",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
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
        "orbit": "orbit 20s linear infinite",
        "marquee": "marquee 35s linear infinite",
      },
      keyframes: {
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
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "hero-gradient":
          "linear-gradient(135deg, #0a0a16 0%, #1a1a2e 40%, #16213e 70%, #0f0f1e 100%)",
        "hero-gradient-v2":
          "linear-gradient(180deg, #0a0a16 0%, #121225 50%, #1a1a2e 100%)",
        "electric-gradient":
          "linear-gradient(135deg, #4361ee 0%, #5a7bf7 50%, #3651d4 100%)",
        "glass-gradient":
          "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        "cta-gradient":
          "linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #4361ee 100%)",
        "card-shine":
          "linear-gradient(135deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0) 100%)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(67, 97, 238, 0.15)",
        "glow-lg": "0 0 80px rgba(67, 97, 238, 0.25)",
        "glow-xl": "0 0 120px rgba(67, 97, 238, 0.2)",
        "card-hover":
          "0 20px 40px rgba(26, 26, 46, 0.08), 0 0 0 1px rgba(67, 97, 238, 0.05)",
        premium: "0 25px 50px -12px rgba(26, 26, 46, 0.15)",
        "premium-lg":
          "0 32px 64px -16px rgba(26, 26, 46, 0.2), 0 0 0 1px rgba(26, 26, 46, 0.05)",
        "inner-glow": "inset 0 1px 0 rgba(255, 255, 255, 0.08)",
        "dark-card":
          "0 8px 32px rgba(0, 0, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
export default config;
