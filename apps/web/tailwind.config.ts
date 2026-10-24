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
        accent: {
          DEFAULT: "#76FB91",
          hover: "#5de87a",
          subtle: "#DFFFE6",
          glow: "rgba(118, 251, 145, 0.4)",
        },
        background: {
          DEFAULT: "#FFFFFF",
          secondary: "#EDEDED",
          tertiary: "#F7F7F8",
        },
        neutral: {
          gray: "#CCCCCC",
          light: "#E5E5E5",
          border: "#E0E0E0",
          card: "#FFFFFF",
        },
        primary: {
          text: "#000000",
          muted: "#666666",
          subtle: "#888888",
        },
        status: {
          normal: "#76FB91",
          warning: "#F59E0B",
          critical: "#EF4444",
          info: "#3B82F6",
        },
      },
      borderRadius: {
        "panel-lg": "32px",
        "panel-xl": "36px",
        "panel-md": "24px",
        "card-sm": "16px",
        "card-md": "20px",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(110deg, #76FB91 0%, #DFFFE6 42%, #FFFFFF 85%)",
        "card-subtle": "linear-gradient(180deg, #FFFFFF 0%, #FAFAFA 100%)",
        "green-glow": "radial-gradient(circle at 50% 0%, rgba(118, 251, 145, 0.28) 0%, transparent 70%)",
        "pill-gradient": "linear-gradient(90deg, #76FB91 0%, #A2FFB6 100%)",
      },
      boxShadow: {
        "soft-card": "0 4px 20px -2px rgba(0, 0, 0, 0.05), 0 2px 6px -1px rgba(0, 0, 0, 0.02)",
        "hover-card": "0 12px 32px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)",
        "accent-glow": "0 0 28px -4px rgba(118, 251, 145, 0.55)",
        "pill-glow": "0 4px 14px rgba(118, 251, 145, 0.45)",
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "Outfit", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
