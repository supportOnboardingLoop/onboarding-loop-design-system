import type { SearchEntry } from "./index"

/* ============================================================================
   The "Ask" capability's client half. `retrieveForAsk` finds the protocol
   sections most relevant to a natural-language question (looser than the strict
   jump-to search — it drops stopwords and OR-matches, so "how do upgrades work"
   still finds the expansion sections). `askAgent` posts those sections + the
   query to /api/ask, which asks Haiku for a short grounded summary.
   ========================================================================== */

const STOP = new Set([
  "the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "is", "are", "be", "do", "does",
  "how", "what", "why", "when", "who", "which", "i", "my", "me", "we", "it", "its", "this", "that",
  "with", "can", "you", "your", "about", "should", "would", "could", "get", "use", "using",
  "work", "works", "want", "need", "make", "made", "help", "tell", "show", "explain",
])

export type AskSection = { title: string; page: string; pageId: string; sectionId?: string; text: string }

// the top-k protocol sections for a question (looser OR match over title + body)
export function retrieveForAsk(query: string, entries: SearchEntry[], k = 3): AskSection[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .map((t) => t.replace(/[^a-z0-9]/g, ""))
    .filter((t) => t.length > 2 && !STOP.has(t))
  if (terms.length === 0) return []

  const scored: { e: SearchEntry; score: number }[] = []
  for (const e of entries) {
    if (e.corpus !== "protocol" || e.kind !== "section") continue
    const title = e.title.toLowerCase()
    const body = (e.body || "").toLowerCase()
    let score = 0
    for (const t of terms) {
      if (title.includes(t)) score += 3
      if (body.includes(t)) score += 1
    }
    if (score > 0) scored.push({ e, score })
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, k).map(({ e }) => ({
    title: e.title,
    page: e.group,
    pageId: e.pageId,
    sectionId: e.sectionId,
    text: e.body || "",
  }))
}

// ask the agent (Haiku, via /api/ask) for a grounded summary; returns the answer text
export async function askAgent(query: string, sections: AskSection[]): Promise<string> {
  const res = await fetch("/api/ask", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      query,
      context: sections.map((s) => ({ title: s.title, page: s.page, text: s.text })),
    }),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error || `Ask failed (${res.status})`)
  }
  const data = (await res.json()) as { answer?: string }
  return data.answer || "I couldn't find an answer to that in the protocols."
}
