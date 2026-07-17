import { rewrite, next } from "@vercel/edge"

// Host-based routing for the single build. The styleguide is the root index.html;
// the demo is demo.html. We do this in Edge Middleware, NOT vercel.json "rewrites",
// because vercel.json rewrites run AFTER the filesystem check: a request for "/"
// is answered by the existing index.html before any rewrite fires, so every host
// would show the styleguide. Middleware runs BEFORE the filesystem, so it can
// serve demo.html at the clean root "/" for the demo and client hosts.
//
// The demo reads its preset/lock from window.location (see DemoApp readParams +
// CLIENT_HOSTS): a rewrite keeps the browser URL clean, and the app locks the
// picker by hostname. Add a new client host below and to CLIENT_HOSTS; nothing
// else changes.

export const config = { matcher: "/" } // only the root path; assets pass through

const DEMO_HOSTS = new Set([
  "demo.onboardingloop.ai",
  "heatmap.onboardingloop.ai",
])

export default function middleware(request: Request) {
  const host = (request.headers.get("host") ?? "").toLowerCase()
  if (DEMO_HOSTS.has(host)) {
    return rewrite(new URL("/demo.html", request.url))
  }
  return next()
}
