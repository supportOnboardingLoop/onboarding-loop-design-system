// Shared core for the launcher-agent's "Ask" capability: build a grounded prompt
// from retrieved protocol excerpts and ask Haiku for a short, query-specific
// summary. Imported by both the Vercel Edge function (api/ask.ts) and the vite
// dev middleware, so the dev and production answers come from the same logic.
//
// Model: Haiku 4.5 (fast + cheap for a 2-4 sentence grounded summary). No
// thinking / effort params — Haiku 4.5 doesn't support them.

export type AskContext = { title: string; page: string; text: string }

const MODEL = "claude-haiku-4-5"

const SYSTEM =
  "You are the Onboarding Loop assistant. Answer the user's question using ONLY the protocol excerpts provided below. " +
  "Be concise: 2 to 4 sentences of plain prose, no preamble, no headings, no lists, no restating the question. " +
  "Write for someone who hasn't read the protocol, so the answer stands on its own. " +
  "If the excerpts do not contain the answer, say you can only answer questions covered by the Onboarding Loop protocols. " +
  "Never invent specifics that aren't in the excerpts."

export function buildUserPrompt(query: string, context: AskContext[]): string {
  const excerpts = context
    .map((c) => `[${c.page} — ${c.title}]\n${(c.text || "").slice(0, 1200)}`)
    .join("\n\n")
  return `Question: ${query}\n\nProtocol excerpts:\n${excerpts}`
}

// Ask Haiku for a grounded summary. Returns the answer text; throws on API error
// or refusal so the caller can surface a friendly message.
export async function askClaude(apiKey: string, query: string, context: AskContext[]): Promise<string> {
  const resp = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 400,
      system: SYSTEM,
      messages: [{ role: "user", content: buildUserPrompt(query, context) }],
    }),
  })

  if (!resp.ok) {
    const detail = await resp.text().catch(() => "")
    throw new Error(`Anthropic API ${resp.status}: ${detail.slice(0, 200)}`)
  }

  const data = (await resp.json()) as {
    stop_reason?: string
    content?: { type: string; text?: string }[]
  }
  if (data.stop_reason === "refusal") throw new Error("The assistant declined to answer that.")

  const text = (data.content || []).find((b) => b.type === "text")?.text?.trim()
  return text || "I couldn't find an answer to that in the protocols."
}
