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
        background: "#060B16",
        "background-secondary": "#0B1220",
        "card-bg": "#111C2E",
        "primary-blue": "#3B82F6",
        cyan: {
          DEFAULT: "#22D3EE",
          glow: "#06B6D4",
        },
        violet: {
          DEFAULT: "#8B5CF6",
        },
        success: {
          DEFAULT: "#22C55E",
          subtle: "rgba(34, 197, 94, 0.15)",
        },
        warning: {
          DEFAULT: "#F59E0B",
          subtle: "rgba(245, 158, 11, 0.15)",
        },
        critical: {
          DEFAULT: "#EF4444",
          subtle: "rgba(239, 68, 68, 0.15)",
        },
        text: {
          primary: "#F8FAFC",
          secondary: "#94A3B8",
          muted: "#64748B",
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.08)",
          hover: "rgba(59, 130, 246, 0.4)",
        },
      },
      backgroundImage: {
        "radial-glow": "radial-gradient(circle at 50% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 70%)",
        "card-gradient": "linear-gradient(180deg, rgba(17, 28, 46, 0.8) 0%, rgba(11, 18, 32, 0.9) 100%)",
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(59, 130, 246, 0.3)",
        "glow-cyan": "0 0 25px -5px rgba(34, 211, 238, 0.3)",
        "glow-critical": "0 0 25px -5px rgba(239, 68, 68, 0.35)",
        "glass-panel": "0 8px 32px 0 rgba(0, 0, 0, 0.45)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Menlo", "Monaco", "Consolas", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
