// @ts-check
import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath, URL } from "node:url"

// The marketing site is a second consumer of the design system, alongside the
// product styleguide/demo. It imports component SOURCE directly through the same
// "@" -> repo-root alias vite.config.ts already uses, so an edit to a shared
// component reaches both without any publish/copy step. Dev runs on 4330 so it
// can sit beside the live vanilla site (served on 4321) for side-by-side compare.
export default defineConfig({
  integrations: [react()],
  server: { port: 4330 },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("../", import.meta.url)),
      },
      // React lives at the repo root (used by the styleguide too); the site has
      // no react of its own, so it resolves up to that one copy. Dedupe makes
      // sure the island renderer and the aliased components share it (one React).
      dedupe: ["react", "react-dom"],
    },
  },
})
