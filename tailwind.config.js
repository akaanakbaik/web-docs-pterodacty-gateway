import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["IBM Plex Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Bricolage Grotesque", "IBM Plex Sans", "ui-sans-serif", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      colors: {
        paper: "#F3F1E8",
        ink: "#141612",
        muted: "#5C6157",
        line: "#D5D2C5",
        card: "#FBFAF4",
        signal: "#B9E36A",
        clay: "#B9E36A",
        sage: "#6D756A",
        slate: "#3B4036"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(20, 22, 18, 0.22)",
        hair: "0 1px 0 rgba(20, 22, 18, 0.05)"
      }
    }
  },
  plugins: []
} satisfies Config;
