import { askClaude, type AskContext } from "./_ask-core"

// The launcher-agent's "Ask" capability, as a Vercel Edge function. The client
// (SearchLauncher) retrieves the most relevant protocol sections locally and
// posts them here with the query; we ask Haiku for a short grounded summary.
// Needs the ANTHROPIC_API_KEY env var set on the deployment.

export const config = { runtime: "edge" }

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  })
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405)

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return json({ error: "The Ask assistant isn't configured yet (missing ANTHROPIC_API_KEY)." }, 503)

  let payload: { query?: string; context?: AskContext[] }
  try {
    payload = await req.json()
  } catch {
    return json({ error: "Invalid JSON body" }, 400)
  }

  const query = (payload.query || "").trim()
  const context = Array.isArray(payload.context) ? payload.context : []
  if (!query) return json({ error: "Empty query" }, 400)
  if (context.length === 0) return json({ error: "No protocol context to answer from." }, 400)

  try {
    const answer = await askClaude(apiKey, query, context)
    return json({ answer })
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Ask failed" }, 502)
  }
}
