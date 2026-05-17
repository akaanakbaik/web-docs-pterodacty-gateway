import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Instrument Sans", "Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      colors: {
        ink: "#e8eefc",
        muted: "#9aa8c7",
        paper: "#0f1726",
        card: "#172133",
        line: "#2a3954",
        soft: "#111c2d",
        cocoa: "#c79a64",
        moss: "#7fb596",
        slatepremium: "#2d3135"
      },
      boxShadow: {
        soft: "0 18px 60px rgba(41, 37, 31, 0.08)",
        hairline: "inset 0 0 0 1px rgba(70, 61, 47, 0.08)"
      }
    }
  },
  plugins: []
} satisfies Config;
