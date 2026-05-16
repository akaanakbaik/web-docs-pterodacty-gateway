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
        paper: "#f8f7f3",
        ink: "#191816",
        muted: "#6f6a62",
        line: "#e7e1d7",
        card: "#fffdf8",
        clay: "#b98b62",
        sage: "#778371",
        slate: "#353a40"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(31, 27, 20, 0.08)",
        hair: "0 1px 0 rgba(25, 24, 22, 0.07)"
      },
      borderRadius: {
        inherit: "inherit"
      }
    }
  },
  plugins: []
};
