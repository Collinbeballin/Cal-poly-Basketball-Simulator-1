import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#05070a",
          900: "#0a0d12",
          850: "#0e1218",
          800: "#12161d",
          700: "#1a1f28",
          600: "#252b36",
          500: "#3a4150",
        },
        accent: {
          DEFAULT: "#c9a24a",
          bright: "#e6c364",
          dim: "#8a7133",
        },
        cp: {
          green: "#154734",
          gold: "#c9a24a",
        },
        signal: {
          correct: "#3ecf8e",
          incorrect: "#e5484d",
        },
      },
      fontFamily: {
        display: [
          "var(--font-display)",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "hud-xl": ["clamp(2.5rem, 6vw, 5rem)", { lineHeight: "1.02", letterSpacing: "-0.02em" }],
        "hud-lg": ["clamp(1.5rem, 3.2vw, 2.5rem)", { lineHeight: "1.05", letterSpacing: "-0.01em" }],
      },
      boxShadow: {
        panel: "0 8px 40px rgba(0,0,0,0.55)",
      },
      backdropBlur: {
        hud: "10px",
      },
    },
  },
  plugins: [],
};

export default config;
