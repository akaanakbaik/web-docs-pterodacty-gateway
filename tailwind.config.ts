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
        ink: "#171717",
        muted: "#6f6a61",
        paper: "#f8f7f3",
        card: "#ffffff",
        line: "#e8e2d8",
        soft: "#f0ebe2",
        cocoa: "#6d5a44",
        moss: "#596a53",
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
