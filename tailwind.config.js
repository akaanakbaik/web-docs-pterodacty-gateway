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
        paper: "#060d19",
        ink: "#edf4ff",
        muted: "#98abc9",
        line: "#233754",
        card: "#101b2e",
        clay: "#61a8ff",
        sage: "#4fd6b0",
        slate: "#cfddf6"
      },
      boxShadow: {
        soft: "0 24px 80px rgba(0, 0, 0, 0.35)",
        hair: "0 1px 0 rgba(255, 255, 255, 0.06)"
      },
      borderRadius: {
        inherit: "inherit"
      }
    }
  },
  plugins: []
};
