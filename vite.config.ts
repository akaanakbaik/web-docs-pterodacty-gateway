import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: "0.0.0.0",
    allowedHosts: [".manus.computer"]
  },
  preview: {
    port: 4173,
    host: "0.0.0.0",
    allowedHosts: [".manus.computer"]
  },
  build: {
    target: "es2020",
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("/node_modules/react/") || id.includes("/node_modules/react-dom/") || id.includes("/node_modules/scheduler/")) return "react";
          if (id.includes("/node_modules/framer-motion/") || id.includes("/node_modules/motion-dom/") || id.includes("/node_modules/motion-utils/")) return "motion";
          if (id.includes("/node_modules/lucide-react/")) return "icons";
        }
      }
    }
  }
});
