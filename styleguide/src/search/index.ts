import type { IconName } from "@/components/base/icon"
import { NAV, type NavPage } from "../showcases"
import { sectionId } from "../page-kit"
import { buildTree, blocksText } from "../pages/protocol"

import activationMd from "@/styleguide/public/toolkit/activation-protocol.md?raw"
import retentionMd from "@/styleguide/public/toolkit/retention-protocol.md?raw"
import expansionMd from "@/styleguide/public/toolkit/expansion-protocol.md?raw"
import levelDesignMd from "@/styleguide/public/toolkit/level-design-patterns.md?raw"

/* ============================================================================
   Design-system search index — the corpus the launcher's search capability filters.

   Two corpora, two jobs:
     • "design"   — the design system itself: every page + every component / foundation
                    section. This is a JUMP-TO corpus (take me to the Dropdown, to
                    Typography). Deterministic, ranked first.
     • "protocol" — the learning material (Activation / Retention / Expansion / Level
                    Design). Findable, but a section here is narrative, not a component;
                    the RIGHT experience is a query-specific summary + a link (the "Ask"
                    capability, coming). Ranked below design, clearly grouped.

   Section ids come from sectionId(title) — the SAME slug the pages render — so a result
   scrolls to the exact anchor. The design-section manifest below is hand-kept (with
   synonyms, for real findability); keep it in sync when a page gains/loses a section.
   ========================================================================== */

export type Corpus = "design" | "protocol"

export type SearchEntry = {
  key: string
  kind: "page" | "section"
  corpus: Corpus
  pageId: string
  sectionId?: string
  title: string
  group: string
  icon: IconName
  haystack: string
  snippet?: string
  /** raw section body text, kept for query-relevant snippets (protocol sections) */
  body?: string
}

// per-page synonyms so a page surfaces on the words people actually search for
const PAGE_KEYWORDS: Record<string, string> = {
  introduction: "overview start welcome getting started intro",
  links: "resources urls external",
  toolkit: "downloads pdf protocols skills assets resources",
  activation: "onboarding first value aha protocol",
  retention: "engagement churn habit retain protocol",
  expansion: "growth upsell revenue upgrade expand protocol",
  "level-design": "patterns levels game design mechanics",
  "style-guide": "brand color colors typography tokens foundations",
  base: "components primitives buttons inputs badges atoms molecules",
  charts: "data viz visualization graphs bar donut funnel dashboard",
  agent: "conversation chat composer assistant messages",
  product: "app shell workspace launcher dashboard navigation calendar",
  web: "website marketing landing",
}

const PROTOCOL_PAGE_IDS = new Set(["activation", "retention", "expansion", "level-design"])

// The design-system component / foundation sections. `t` is the EXACT PageSection /
// PageItem title (→ sectionId(t) matches the rendered anchor); `s` are extra search
// terms (synonyms). Titles pulled from the design pages; keep in sync on change.
const DESIGN_SECTIONS: Record<string, { t: string; s?: string }[]> = {
  base: [
    { t: "Atoms" },
    { t: "Icons", s: "iconography tabler glyph symbol" },
    { t: "Checkbox", s: "tick toggle form" },
    { t: "Checkmark", s: "tick check" },
    { t: "Badges & chips", s: "tag pill label status token" },
    { t: "Molecules" },
    { t: "Button", s: "cta action" },
    { t: "Input & label", s: "text field form textbox" },
    { t: "Textarea", s: "text field multiline input" },
    { t: "Select", s: "dropdown menu picker combobox" },
    { t: "Dropdown", s: "select menu picker combobox popover" },
    { t: "Surfaces" },
    { t: "Card", s: "surface panel container tray well" },
    { t: "CTA row", s: "actions buttons footer" },
    { t: "Separator", s: "divider rule hairline line" },
    { t: "Scroll area", s: "scrollbar overflow" },
  ],
  charts: [
    { t: "Stat & trend", s: "kpi metric" },
    { t: "Stat tiles", s: "kpi metric number tile card" },
    { t: "Trend", s: "sparkline line delta" },
    { t: "Bar charts", s: "bars" },
    { t: "Horizontal bars", s: "bar list ranking" },
    { t: "Columns & comparison", s: "column bar compare" },
    { t: "Part-to-whole", s: "share proportion composition" },
    { t: "Donut", s: "pie ring circle" },
    { t: "Stacked bar", s: "segmented stack" },
    { t: "Funnel", s: "conversion steps dropoff" },
    { t: "Distribution", s: "histogram spread range" },
    { t: "Salary explorer", s: "distribution example" },
    { t: "Compact", s: "small mini" },
    { t: "Progress & meters", s: "gauge bar meter" },
    { t: "Meters", s: "gauge progress bar" },
    { t: "Gauges", s: "dial meter radial" },
    { t: "Trends & composition" },
    { t: "Multi-series line", s: "line chart series" },
    { t: "Stacked columns", s: "stacked bar composition" },
    { t: "Heatmap", s: "grid matrix density" },
  ],
  agent: [
    { t: "Conversation", s: "chat thread messages" },
    { t: "Message row", s: "chat message" },
    { t: "Bubbles", s: "chat bubble message" },
    { t: "Thinking", s: "loading typing reasoning" },
    { t: "Conversation divider", s: "separator" },
    { t: "Models", s: "model picker llm" },
    { t: "Conversation (live)", s: "demo animated" },
    { t: "Answer widgets", s: "interactive controls" },
    { t: "Choices", s: "options buttons segmented" },
    { t: "Badge select", s: "chips tags multi-select" },
    { t: "Slider", s: "range input" },
    { t: "Score", s: "rating number" },
    { t: "Progress", s: "bar loading" },
    { t: "Conversation checklist", s: "tasks todo" },
    { t: "Checklist item", s: "task todo" },
    { t: "Composer", s: "input chat message box textarea send" },
    { t: "Agent chrome" },
    { t: "Agent header", s: "identity avatar name" },
    { t: "Tooltip", s: "coach mark popover hint" },
    { t: "Resource center", s: "help launcher menu" },
  ],
  "style-guide": [
    { t: "Color", s: "colour palette swatches hue" },
    { t: "Neutral scale", s: "gray grey neutral ramp" },
    { t: "Surface roles", s: "background card fill" },
    { t: "Text roles", s: "foreground muted type" },
    { t: "Status", s: "success error warning semantic" },
    { t: "Tokens", s: "variables css custom properties" },
    { t: "Typography", s: "type font text typeface scale" },
    { t: "Radius", s: "corner squircle rounding border-radius" },
    { t: "Spacing", s: "gap padding margin space layout" },
    { t: "Elevation", s: "shadow depth" },
    { t: "Motion", s: "animation transition easing" },
  ],
  product: [
    { t: "Navigation", s: "nav sidebar menu" },
    { t: "Nav item", s: "menu link" },
    { t: "Section", s: "collapsible accordion" },
    { t: "Scheduling", s: "calendar date booking" },
    { t: "Calendar", s: "date picker scheduling" },
    { t: "The launcher", s: "agent search command palette" },
    { t: "Launcher", s: "agent search command palette dock" },
  ],
}

const PROTOCOL_DOCS: { pageId: string; md: string }[] = [
  { pageId: "activation", md: activationMd },
  { pageId: "retention", md: retentionMd },
  { pageId: "expansion", md: expansionMd },
  { pageId: "level-design", md: levelDesignMd },
]

function stripMd(s: string): string {
  return s
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[*_`>#]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

let CACHE: SearchEntry[] | null = null

export function buildIndex(): SearchEntry[] {
  if (CACHE) return CACHE
  const pages: NavPage[] = NAV.flatMap((e) => (e.kind === "group" ? e.pages : [e.page]))
  const pageById = new Map(pages.map((p) => [p.id, p]))
  const entries: SearchEntry[] = []

  // 1) page-level entries (all NAV pages)
  for (const p of pages) {
    entries.push({
      key: "page:" + p.id,
      kind: "page",
      corpus: PROTOCOL_PAGE_IDS.has(p.id) ? "protocol" : "design",
      pageId: p.id,
      title: p.label,
      group: "Pages",
      icon: p.icon,
      haystack: (p.label + " " + (PAGE_KEYWORDS[p.id] ?? "")).toLowerCase(),
    })
  }

  // 2) design-system component / foundation sections (jump-to)
  for (const [pageId, secs] of Object.entries(DESIGN_SECTIONS)) {
    const page = pageById.get(pageId)
    if (!page) continue
    for (const sec of secs) {
      entries.push({
        key: "dsec:" + pageId + ":" + sectionId(sec.t),
        kind: "section",
        corpus: "design",
        pageId,
        sectionId: sectionId(sec.t),
        title: sec.t,
        group: page.label,
        icon: page.icon,
        haystack: (sec.t + " " + (sec.s ?? "")).toLowerCase(),
      })
    }
  }

  // 3) protocol sections (learning material) — headings + body, from the same buildTree
  //    the pages render, so sectionId(title) matches the rendered anchor exactly.
  for (const doc of PROTOCOL_DOCS) {
    const page = pageById.get(doc.pageId)
    if (!page) continue
    const { groups } = buildTree(doc.md)
    const push = (title: string, body: string) => {
      entries.push({
        key: "psec:" + doc.pageId + ":" + sectionId(title),
        kind: "section",
        corpus: "protocol",
        pageId: doc.pageId,
        sectionId: sectionId(title),
        title,
        group: page.label,
        icon: page.icon,
        haystack: (title + " " + body).toLowerCase(),
        body: stripMd(body),
      })
    }
    for (const g of groups) {
      push(g.title, blocksText(g.blocks) + " " + g.items.map((it) => it.title).join(" "))
      for (const it of g.items) push(it.title, blocksText(it.blocks))
    }
  }

  CACHE = entries
  return entries
}

// a query-relevant snippet: the first sentence of the body that mentions a query term
// (so a protocol result previews WHY it matched), falling back to the opening sentence.
function bestSnippet(body: string, terms: string[], len = 150): string {
  if (!body) return ""
  const sentences = body.split(/(?<=[.!?])\s+/)
  const hit = sentences.find((s) => terms.some((t) => s.toLowerCase().includes(t))) ?? sentences[0] ?? body
  const s = hit.trim()
  return s.length > len ? s.slice(0, len).trimEnd() + "…" : s
}

// display + arrow-nav order: pages, then the design pages, then the protocols
const GROUP_ORDER = [
  "Pages", "Introduction", "Style Guide", "Base", "Charts", "Agent", "Product", "Links", "Toolkit",
  "Activation Protocol", "Retention Protocol", "Expansion Protocol", "Level Design Patterns",
]
function groupRank(g: string): number {
  const i = GROUP_ORDER.indexOf(g)
  return i === -1 ? GROUP_ORDER.length : i
}

export function search(query: string, entries: SearchEntry[], limit = 16): SearchEntry[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  const terms = q.split(/\s+/).filter(Boolean)

  const scored: { e: SearchEntry; score: number }[] = []
  for (const e of entries) {
    const title = e.title.toLowerCase()
    let score = 0
    let ok = true
    for (const t of terms) {
      if (!e.haystack.includes(t)) { ok = false; break } // every term must appear (AND)
      if (title.includes(t)) score += 6
      else score += 2
      if (title.startsWith(t)) score += 4
    }
    if (!ok) continue
    if (title.includes(q)) score += 8
    if (title === q) score += 14                              // exact title match wins
    if (e.kind === "page") score += 3                         // pages are strong nav targets
    if (e.kind === "page" && title.includes(q)) score += 12   // a page whose name contains the query is the intended target
    if (e.kind === "section" && e.corpus === "design") score += 5 // component sections beat narrative
    scored.push({ e, score })
  }

  // bucket by group, rank members by score, then order GROUPS by their best member (so
  // the most relevant group leads), breaking ties with the fixed nav order. Flat order
  // then equals the grouped display order, which is what arrow-nav walks.
  const byGroup = new Map<string, { e: SearchEntry; score: number }[]>()
  for (const s of scored) {
    const arr = byGroup.get(s.e.group) ?? []
    arr.push(s)
    byGroup.set(s.e.group, arr)
  }
  const groups = [...byGroup.entries()].map(([label, arr]) => {
    arr.sort((a, b) => b.score - a.score || a.e.title.localeCompare(b.e.title))
    return { label, arr, best: arr[0].score }
  })
  groups.sort((a, b) => b.best - a.best || groupRank(a.label) - groupRank(b.label))

  const out: SearchEntry[] = []
  for (const g of groups) {
    for (const { e } of g.arr) {
      out.push(e.corpus === "protocol" && e.body ? { ...e, snippet: bestSnippet(e.body, terms) } : e)
      if (out.length >= limit) return out
    }
  }
  return out
}
