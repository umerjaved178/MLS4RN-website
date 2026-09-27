import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// mls-ts ships a WebAssembly build that loads via `new URL(..., import.meta.url)`.
// Excluding it from dep pre-bundling lets Vite emit and resolve that wasm asset
// correctly in both dev and the production build.
export default defineConfig({
  // Served from the custom domain https://mls4rn.dev/ (root).
  base: "/",
  plugins: [react()],
  optimizeDeps: { exclude: ["mls-ts"] },
});
