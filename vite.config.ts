import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath, URL } from "node:url"

// Dev-only styleguide. Serves ./styleguide, resolves "@/..." to the repo root
// (so the real components import "@/lib/utils" etc.), and runs Tailwind v4.
export default defineConfig({
  root: "styleguide",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  build: {
    // two entries: the docs styleguide (index.html) and the full-viewport DEMO
    // (demo.html — the design system + agent in action, reachable at /demo.html)
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL("./styleguide/index.html", import.meta.url)),
        demo: fileURLToPath(new URL("./styleguide/demo.html", import.meta.url)),
      },
    },
  },
})
