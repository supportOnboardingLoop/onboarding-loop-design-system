import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { fileURLToPath, URL } from "node:url"
import { askClaude } from "./api/_ask-core"

// Dev-only middleware for the launcher-agent's "Ask" capability. `vite dev`
// doesn't run the Vercel /api function, so serve it here from the SAME core:
// call Haiku when ANTHROPIC_API_KEY is set locally, otherwise return a clearly
// marked mock so the UI flow works without a key. No effect on the build.
function askDevApi(): Plugin {
  return {
    name: "ask-dev-api",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split("?")[0] !== "/api/ask") return next()
        if (req.method !== "POST") { res.statusCode = 405; res.end("Method not allowed"); return }
        let body = ""
        req.on("data", (c) => (body += c))
        req.on("end", async () => {
          res.setHeader("content-type", "application/json")
          try {
            const { query, context } = JSON.parse(body || "{}") as {
              query?: string
              context?: { title: string; page: string; text: string }[]
            }
            const key = process.env.ANTHROPIC_API_KEY
            let answer: string
            if (key) {
              answer = await askClaude(key, query ?? "", context ?? [])
            } else {
              const s = context?.[0]
              answer =
                `Dev preview (no ANTHROPIC_API_KEY set): based on ${s?.page ?? "the protocols"}, ` +
                `${(s?.text ?? "").replace(/\s+/g, " ").slice(0, 160)}…`
            }
            res.end(JSON.stringify({ answer }))
          } catch (e) {
            res.statusCode = 502
            res.end(JSON.stringify({ error: e instanceof Error ? e.message : "Ask failed" }))
          }
        })
      })
    },
  }
}

// Dev-only styleguide. Serves ./styleguide, resolves "@/..." to the repo root
// (so the real components import "@/lib/utils" etc.), and runs Tailwind v4.
// Baked in at build time. Every Vercel deploy runs a fresh `vite build`, so this
// timestamp equals the moment the site last went live — that's the "Last updated"
// date shown in the nav footer. Injected as a global constant via `define`.
const BUILD_DATE = new Date().toISOString()

export default defineConfig({
  root: "styleguide",
  plugins: [react(), tailwindcss(), askDevApi()],
  define: {
    __BUILD_DATE__: JSON.stringify(BUILD_DATE),
  },
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
