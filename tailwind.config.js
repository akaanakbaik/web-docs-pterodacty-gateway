/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Instrument Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "monospace"]
      },
      colors: {
        paper: "#111214",
        ink: "#f4efe7",
        muted: "#a9a29a",
        line: "#2a2b2e",
        card: "#18191c",
        clay: "#d1a06f",
        sage: "#9dad93",
        slate: "#d6d1c9"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(0, 0, 0, 0.32)",
        hair: "0 1px 0 rgba(255, 255, 255, 0.06)"
      },
      borderRadius: {
        inherit: "inherit"
      }
    }
  },
  plugins: []
};
