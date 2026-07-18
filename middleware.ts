import { rewrite, next } from "@vercel/edge"

// Host-based routing + a client password gate for the single build.
//
// Routing: the styleguide is the root index.html; the demo is demo.html. We do
// this in middleware, NOT vercel.json "rewrites", because vercel.json rewrites
// run AFTER the filesystem check: a request for "/" is answered by the existing
// index.html before any rewrite fires, so every host would show the styleguide.
// Middleware runs BEFORE the filesystem, so it serves demo.html at the clean
// root "/" for the demo and client hosts. The demo then reads its preset/lock
// from window.location (see DemoApp readParams + CLIENT_HOSTS): the rewrite keeps
// the browser URL clean, and the app locks the picker by hostname.
//
// No `config.matcher`: middleware runs on EVERY path so the password gate below
// covers the whole gated host (not just "/", which would leave /demo.html and
// assets reachable without the password).

const DEMO_HOSTS = new Set([
  "demo.onboardingloop.ai",
  "heatmap.onboardingloop.ai",
])

// In-progress client hosts behind a shared password (HTTP Basic Auth). Built in
// code because Vercel's own Password Protection is a $150/mo add-on. This is a
// soft "not public yet" gate for a client preview, not real security. To open a
// link to the public later, delete its line here and redeploy.
const CLIENT_GATE: Record<string, string> = {
  "heatmap.onboardingloop.ai": "password123", // shared with the Heatmap team
}

export default function middleware(request: Request) {
  const host = (request.headers.get("host") ?? "").toLowerCase()

  const password = CLIENT_GATE[host]
  if (password && !passwordOk(request, password)) {
    return new Response("Authorization required.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="Heatmap preview"' },
    })
  }

  if (DEMO_HOSTS.has(host) && new URL(request.url).pathname === "/") {
    return rewrite(new URL("/demo.html", request.url))
  }
  return next()
}

// Basic Auth check: any username, the password must match. Non-secret gate, so a
// plain compare is fine.
function passwordOk(request: Request, expected: string): boolean {
  const header = request.headers.get("authorization")
  if (!header?.startsWith("Basic ")) return false
  try {
    const decoded = atob(header.slice(6)) // "user:pass"
    return decoded.slice(decoded.indexOf(":") + 1) === expected
  } catch {
    return false
  }
}
