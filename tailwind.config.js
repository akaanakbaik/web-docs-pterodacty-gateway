import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Instrument Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      colors: {
        paper: "#f4f0e8",
        ink: "#152033",
        muted: "#687083",
        line: "#d8d0c3",
        card: "#fbfaf6",
        clay: "#c96f52",
        sage: "#3d8c7a",
        slate: "#435267"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(35, 37, 42, 0.14)",
        hair: "0 1px 0 rgba(21, 32, 51, 0.05)"
      }
    }
  },
  plugins: []
} satisfies Config;
