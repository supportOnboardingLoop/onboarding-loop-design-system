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
// Gate: a CUSTOM password-only page, NOT HTTP Basic Auth. The browser's native
// Basic Auth dialog always shows a username field we can't remove, which confused
// the client. So we serve our own page with a single password field, validate it
// server-side, and set an HttpOnly cookie holding a hash of the password (the
// plaintext never reaches the client). Still a soft "not public yet" gate for a
// client preview, not real security. To open a link to the public later, delete
// its CLIENT_GATE line and redeploy.
//
// No `config.matcher`: middleware runs on EVERY path so the gate covers the whole
// gated host (not just "/", which would leave /demo.html and assets reachable
// without the password).

const DEMO_HOSTS = new Set([
  "demo.onboardingloop.ai",
  "heatmap.onboardingloop.ai",
])

const CLIENT_GATE: Record<string, string> = {
  "heatmap.onboardingloop.ai": "password123", // shared with the Heatmap team
}

const GATE_COOKIE = "ol_gate"
const GATE_PATH = "/__gate" // the password form posts here

export default async function middleware(request: Request) {
  const url = new URL(request.url)
  const host = (request.headers.get("host") ?? "").toLowerCase()

  const password = CLIENT_GATE[host]
  if (password) {
    const expected = await gateToken(password)
    const authed = readCookie(request, GATE_COOKIE) === expected

    if (!authed) {
      // Login submission: validate the password, set the cookie, redirect in.
      if (request.method === "POST" && url.pathname === GATE_PATH) {
        let entered = ""
        try {
          const form = await request.formData()
          entered = String(form.get("password") ?? "")
        } catch {
          entered = ""
        }
        if (entered === password) {
          return new Response(null, {
            status: 303,
            headers: {
              "set-cookie": `${GATE_COOKIE}=${expected}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000`,
              location: "/",
            },
          })
        }
        return gatePage(true)
      }
      // Any other request while locked -> show the password page.
      return gatePage(false)
    }
  }

  if (DEMO_HOSTS.has(host) && url.pathname === "/") {
    return rewrite(new URL("/demo.html", request.url))
  }
  return next()
}

// Read one cookie value off the request.
function readCookie(request: Request, name: string): string | null {
  const raw = request.headers.get("cookie")
  if (!raw) return null
  for (const part of raw.split(";")) {
    const eq = part.indexOf("=")
    if (eq === -1) continue
    if (part.slice(0, eq).trim() === name) return part.slice(eq + 1).trim()
  }
  return null
}

// SHA-256 of the password (salted + versioned) -> the cookie token. Derived so
// the plaintext is never stored in the browser, and the cookie can't be forged
// without knowing the password. Web Crypto is available in the edge runtime.
async function gateToken(password: string): Promise<string> {
  const data = new TextEncoder().encode("ol-gate:v1:" + password)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// The password-only gate page. Single field, no username. Green = Heatmap brand.
function gatePage(error: boolean): Response {
  const err = error ? "Incorrect password. Try again." : ""
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>Heatmap preview</title>
<style>
  :root { color-scheme: light dark; }
  * { box-sizing: border-box; }
  body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, system-ui, sans-serif;
    background: #f5f5f4; color: #1c1c1a; }
  .card { width: 100%; max-width: 360px; background: #fff; border: 1px solid #e7e5e4;
    border-radius: 16px; padding: 28px; box-shadow: 0 1px 2px rgba(0,0,0,.05); }
  h1 { font-size: 17px; margin: 0 0 6px; font-weight: 600; letter-spacing: -0.01em; }
  p { font-size: 13px; color: #78716c; margin: 0 0 18px; line-height: 1.45; }
  label { display: block; font-size: 12px; font-weight: 500; color: #57534e; margin: 0 0 6px; }
  input { width: 100%; height: 42px; padding: 0 12px; font-size: 14px; color: inherit;
    border: 1px solid #d6d3d1; border-radius: 10px; background: #fff; outline: none; }
  input:focus { border-color: #10b068; box-shadow: 0 0 0 3px rgba(16,176,104,.15); }
  .err { color: #dc2626; font-size: 12.5px; margin-top: 10px; min-height: 1.1em; }
  button { margin-top: 6px; width: 100%; height: 42px; border: 0; border-radius: 10px;
    background: #10b068; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; }
  button:hover { background: #0e9d5d; }
  @media (prefers-color-scheme: dark) {
    body { background: #1c1c1a; color: #f5f5f4; }
    .card { background: #262624; border-color: #3a3a37; box-shadow: none; }
    p { color: #a8a29e; } label { color: #d6d3d1; }
    input { background: #1c1c1a; border-color: #44403c; }
  }
</style>
</head>
<body>
  <form class="card" method="POST" action="${GATE_PATH}">
    <h1>Heatmap preview</h1>
    <p>This preview is private. Enter the password to view the demo.</p>
    <label for="pw">Password</label>
    <input id="pw" type="password" name="password" autocomplete="current-password" autofocus required />
    <div class="err">${err}</div>
    <button type="submit">View demo</button>
  </form>
</body>
</html>`
  return new Response(html, {
    status: 200,
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "x-robots-tag": "noindex",
    },
  })
}
