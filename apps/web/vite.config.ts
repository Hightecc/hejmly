import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      "@": resolve(import.meta.dirname, "src"),
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": { target: "http://localhost:3000", ws: true, changeOrigin: true },
      "/mcp": { target: "http://localhost:3000", changeOrigin: true },
    },
  },
});
