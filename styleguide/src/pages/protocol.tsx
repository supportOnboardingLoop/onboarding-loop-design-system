import { Fragment, type ReactNode } from "react"
import { Icon } from "@/components/base/icon"
import { PageSection, PageItem, Example, PageIntro, sectionId } from "../page-kit"

/* ============================================================================
   Protocol docs — render an Onboarding Loop toolkit Markdown file straight onto
   the page-kit, so a protocol reads as a real styleguide page (section headers
   on the grey, prose in Card surfaces) AND drives the two-tier "on this page"
   sub-nav for free.

   The MD files under /public/toolkit are the single source of truth: the same
   files the Toolkit page offers for download are imported here with `?raw` and
   parsed at build time, so there's only ever one copy.

   Heading → structure mapping (kept to the two tiers the sub-nav supports):
     • the first `#`      the doc title (dropped — the page header already names it)
     • a later `#`        a GROUP divider (PageSection). Its child `##` become items.
                          Used by Level Design Patterns: # Activation / # Retention /
                          # Expansion, each holding its numbered patterns.
     • a top-level `##`   a GROUP (PageSection). A leaf on its own; with `###`
                          children (e.g. "The Activation Protocol" → Step 1..6) it
                          becomes an accordion of items.
     • a `###`            an ITEM (PageItem) under the current group.

   Front matter that only makes sense in a printed PDF (the "Contents" page-number
   table, the "Cover" restatement) is skipped; the doc's bold subtitle is lifted
   into the page intro. Everything else renders verbatim — this is a renderer, it
   does not rewrite Bal's copy.
   ========================================================================== */

const SKIP_SECTIONS = ["contents", "cover"]

// ---------------------------------------------------------------------------
// Block model + tokenizer. Line-based; these docs keep one paragraph per line,
// lists/tables/quotes in contiguous runs, and blank lines between blocks.
// ---------------------------------------------------------------------------

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "tasks"; items: { checked: boolean; text: string }[] }
  | { type: "quote"; lines: string[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "hr" }

const splitRow = (s: string) =>
  s.replace(/^\||\|$/g, "").split("|").map((c) => c.trim())

// a table separator row, e.g. `|---|---|` or `| :--- | ---: |`
const isTableSep = (s: string) => s.includes("|") && s.includes("-") && /^[\s|:-]+$/.test(s)

const isHeading = (s: string) => /^#{1,6}\s+/.test(s)
const isHr = (s: string) => /^(-{3,}|\*{3,}|_{3,})$/.test(s)
const isUl = (s: string) => /^[-*]\s+/.test(s)
const isTask = (s: string) => /^[-*]\s+\[[ xX]\]\s+/.test(s)
const isOl = (s: string) => /^\d+\.\s+/.test(s)

function parseBlocks(md: string): Block[] {
  const lines = md.replace(/\r\n?/g, "\n").split("\n")
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const t = lines[i].trim()
    if (t === "") { i++; continue }

    const h = /^(#{1,6})\s+(.*)$/.exec(t)
    if (h) { blocks.push({ type: "heading", level: h[1].length, text: h[2].trim() }); i++; continue }

    if (isHr(t)) { blocks.push({ type: "hr" }); i++; continue }

    // table: a `|` row immediately followed by a separator row
    if (t.startsWith("|") && i + 1 < lines.length && isTableSep(lines[i + 1].trim())) {
      const head = splitRow(t)
      i += 2
      const rows: string[][] = []
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        rows.push(splitRow(lines[i].trim()))
        i++
      }
      blocks.push({ type: "table", head, rows })
      continue
    }

    // task list (checked before plain ul, since both start with `-`)
    if (isTask(t)) {
      const items: { checked: boolean; text: string }[] = []
      while (i < lines.length) {
        const m = /^[-*]\s+\[([ xX])\]\s+(.*)$/.exec(lines[i].trim())
        if (!m) break
        items.push({ checked: m[1].toLowerCase() === "x", text: m[2] })
        i++
      }
      blocks.push({ type: "tasks", items })
      continue
    }

    if (isUl(t)) {
      const items: string[] = []
      while (i < lines.length && isUl(lines[i].trim()) && !isTask(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""))
        i++
      }
      blocks.push({ type: "ul", items })
      continue
    }

    if (isOl(t)) {
      const items: string[] = []
      while (i < lines.length && isOl(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""))
        i++
      }
      blocks.push({ type: "ol", items })
      continue
    }

    if (t.startsWith(">")) {
      const qlines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        qlines.push(lines[i].trim().replace(/^>\s?/, ""))
        i++
      }
      blocks.push({ type: "quote", lines: qlines })
      continue
    }

    // paragraph: gather contiguous plain lines
    const plines: string[] = []
    while (i < lines.length) {
      const s = lines[i].trim()
      if (s === "" || isHeading(s) || isHr(s) || s.startsWith("|") || isUl(s) || isOl(s) || s.startsWith(">")) break
      plines.push(s)
      i++
    }
    blocks.push({ type: "p", text: plines.join(" ") })
  }

  return blocks
}

// ---------------------------------------------------------------------------
// Inline renderer: **bold**, *italic*, `code`, [text](url). Single left-to-right
// pass; markup in these docs does not nest, so non-greedy runs are enough.
// ---------------------------------------------------------------------------

function renderInline(text: string): ReactNode {
  const out: ReactNode[] = []
  let buf = ""
  let key = 0
  let i = 0
  const flush = () => { if (buf) { out.push(<Fragment key={key++}>{buf}</Fragment>); buf = "" } }

  while (i < text.length) {
    const rest = text.slice(i)
    let m: RegExpExecArray | null

    if ((m = /^\*\*([^*]+)\*\*/.exec(rest))) {
      flush()
      out.push(<strong key={key++} className="font-semibold text-foreground">{m[1]}</strong>)
      i += m[0].length
    } else if ((m = /^`([^`]+)`/.exec(rest))) {
      flush()
      out.push(<code key={key++} className="rounded-[5px] bg-fill px-1.5 py-0.5 font-mono text-[0.85em] text-foreground">{m[1]}</code>)
      i += m[0].length
    } else if ((m = /^\[([^\]]+)\]\(([^)]+)\)/.exec(rest))) {
      flush()
      out.push(
        <a key={key++} href={m[2]} target="_blank" rel="noopener noreferrer" className="font-medium text-foreground underline decoration-border-strong underline-offset-2 hover:decoration-foreground">
          {m[1]}
        </a>
      )
      i += m[0].length
    } else if ((m = /^\*([^*]+)\*/.exec(rest))) {
      flush()
      out.push(<em key={key++} className="italic">{m[1]}</em>)
      i += m[0].length
    } else {
      buf += text[i]
      i++
    }
  }
  flush()
  return out
}

// text with a single wrapping emphasis marker stripped, for section descriptions
function stripEmphasis(text: string): string | null {
  let m: RegExpExecArray | null
  if ((m = /^\*\*([^*]+)\*\*$/.exec(text))) return m[1]
  if ((m = /^\*([^*]+)\*$/.exec(text))) return m[1]
  if ((m = /^_([^_]+)_$/.exec(text))) return m[1]
  return null
}

// ---------------------------------------------------------------------------
// Block renderers (rendered inside a Card surface, gap-4 flow)
// ---------------------------------------------------------------------------

function renderBlock(b: Block, key: number): ReactNode {
  switch (b.type) {
    case "hr":
      return null
    case "heading":
      // stray sub-heading (rare) — render as a bold label
      return <p key={key} className="text-sm font-semibold text-foreground">{renderInline(b.text)}</p>
    case "p":
      return <p key={key} className="text-sm leading-relaxed text-muted-foreground">{renderInline(b.text)}</p>
    case "ul":
      return (
        <ul key={key} className="flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-muted-foreground/50">
          {b.items.map((it, j) => <li key={j} className="pl-0.5">{renderInline(it)}</li>)}
        </ul>
      )
    case "ol":
      return (
        <ol key={key} className="flex list-decimal flex-col gap-1.5 pl-5 text-sm leading-relaxed text-muted-foreground marker:text-muted-foreground/50">
          {b.items.map((it, j) => <li key={j} className="pl-0.5">{renderInline(it)}</li>)}
        </ol>
      )
    case "tasks":
      return (
        <ul key={key} className="flex flex-col gap-2.5">
          {b.items.map((it, j) => (
            <li key={j} className="flex gap-2.5 text-sm leading-relaxed text-muted-foreground">
              <span
                className={
                  "mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-[5px] [corner-shape:squircle] border " +
                  (it.checked ? "border-foreground bg-foreground text-background" : "border-border-strong")
                }
              >
                {it.checked && <Icon name="check" size={12} stroke={2.5} />}
              </span>
              <span>{renderInline(it.text)}</span>
            </li>
          ))}
        </ul>
      )
    case "quote":
      return (
        <div key={key} data-block="quote" className="flex flex-col gap-1 rounded-[14px] [corner-shape:squircle] border-l-2 border-border-strong bg-subtle py-3 pr-4 pl-4 text-sm leading-relaxed text-muted-foreground">
          {b.lines.map((ln, j) => <p key={j}>{renderInline(ln)}</p>)}
        </div>
      )
    case "table":
      return (
        <div key={key} className="overflow-x-auto rounded-[12px] [corner-shape:squircle] border border-border">
          <table className="w-full min-w-[480px] border-collapse text-sm">
            <thead>
              <tr>
                {b.head.map((c, j) => (
                  <th key={j} className="border-b border-border-strong bg-subtle px-3 py-2.5 text-left align-top font-semibold text-foreground">
                    {renderInline(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((c, ci) => (
                    <td key={ci} className="border-b border-border px-3 py-2.5 align-top leading-relaxed text-muted-foreground last:[&]:pr-3">
                      {renderInline(c)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )
  }
}

function Prose({ blocks }: { blocks: Block[] }) {
  return <div className="flex flex-col gap-4">{blocks.map((b, i) => renderBlock(b, i))}</div>
}

// ---------------------------------------------------------------------------
// Section machine: fold the flat block stream into the two-tier group/item
// tree the page-kit + sub-nav expect.
// ---------------------------------------------------------------------------

type Item = { title: string; desc: ReactNode | null; blocks: Block[] }
type Group = { title: string; fromH1: boolean; desc: ReactNode | null; blocks: Block[]; items: Item[] }

// lift a leading pure-emphasis paragraph off a section into its description
function liftDesc(blocks: Block[]): ReactNode | null {
  const first = blocks[0]
  if (first?.type === "p") {
    const inner = stripEmphasis(first.text)
    if (inner) {
      blocks.shift()
      return renderInline(inner)
    }
  }
  return null
}

// flatten a section's blocks to plain text, for the search index's haystack + snippet
export function blocksText(blocks: Block[]): string {
  const parts: string[] = []
  for (const b of blocks) {
    switch (b.type) {
      case "p":
      case "heading": parts.push(b.text); break
      case "ul":
      case "ol": parts.push(b.items.join(" ")); break
      case "tasks": parts.push(b.items.map((i) => i.text).join(" ")); break
      case "quote": parts.push(b.lines.join(" ")); break
      case "table": parts.push([...b.head, ...b.rows.flat()].join(" ")); break
      case "hr": break
    }
  }
  return parts.join(" ")
}

export function buildTree(md: string): { tagline: ReactNode | null; groups: Group[] } {
  const blocks = parseBlocks(md)
  const groups: Group[] = []
  let curGroup: Group | null = null
  let curItem: Item | null = null
  let started = false
  let dropping = false
  let sawTitle = false
  let tagline: ReactNode | null = null

  for (const b of blocks) {
    if (b.type === "heading") {
      if (b.level === 1) {
        if (!sawTitle) { sawTitle = true; continue } // doc title — drop
        if (!started) continue
        dropping = false
        curGroup = { title: b.text, fromH1: true, desc: null, blocks: [], items: [] }
        groups.push(curGroup)
        curItem = null
        continue
      }
      if (b.level === 2) {
        if (SKIP_SECTIONS.includes(b.text.trim().toLowerCase())) { dropping = true; continue }
        dropping = false
        started = true
        // Inside an H1 "zone" (Level Design Patterns: # Activation / # Retention /
        // # Expansion), a NUMBERED H2 is one of that zone's patterns → an item.
        // A non-numbered H2 (e.g. "Run this with your AI", "Closing") is an
        // epilogue that exits the zone and becomes its own top-level group.
        const isNumbered = /^\d+[.)]\s/.test(b.text)
        if (curGroup && curGroup.fromH1 && isNumbered) {
          curItem = { title: b.text, desc: null, blocks: [] }
          curGroup.items.push(curItem)
        } else {
          curGroup = { title: b.text, fromH1: false, desc: null, blocks: [], items: [] }
          groups.push(curGroup)
          curItem = null
        }
        continue
      }
      // level 3+ → an item under the current group
      if (!started || dropping) continue
      if (!curGroup) {
        curGroup = { title: b.text, fromH1: false, desc: null, blocks: [], items: [] }
        groups.push(curGroup)
      }
      curItem = { title: b.text, desc: null, blocks: [] }
      curGroup.items.push(curItem)
      continue
    }

    if (!started || dropping) {
      // capture the doc's bold subtitle as the page tagline while in front matter
      if (!tagline && b.type === "p") {
        const inner = stripEmphasis(b.text)
        if (inner && b.text.startsWith("**")) tagline = renderInline(inner)
      }
      continue
    }

    const target = curItem ?? curGroup
    if (target) target.blocks.push(b)
  }

  // lift leading emphasis lines into section descriptions
  for (const g of groups) {
    for (const it of g.items) it.desc = liftDesc(it.blocks)
    // only leaf groups lift a desc; a group with items keeps its intro prose intact
    if (g.items.length === 0) g.desc = liftDesc(g.blocks)
  }

  return { tagline, groups }
}

// ---------------------------------------------------------------------------
// The doc renderer
// ---------------------------------------------------------------------------

function ProtocolDoc({ markdown, intro }: { markdown: string; intro?: ReactNode }) {
  const { tagline, groups } = buildTree(markdown)

  return (
    <>
      {(intro ?? tagline) && <PageIntro>{intro ?? tagline}</PageIntro>}
      {groups.map((g, gi) => {
        const hasItems = g.items.length > 0
        return (
          <PageSection key={gi} title={g.title} desc={g.desc ?? undefined} id={sectionId(g.title)}>
            {g.blocks.length > 0 &&
              (hasItems ? (
                // a divider group's own intro rides on the grey, above its items
                <div className="-mt-1 max-w-2xl">
                  <Prose blocks={g.blocks} />
                </div>
              ) : (
                <Example>
                  <Prose blocks={g.blocks} />
                </Example>
              ))}
            {g.items.map((it, ii) => (
              <PageItem key={ii} title={it.title} desc={it.desc ?? undefined} id={sectionId(it.title)}>
                <Example>
                  <Prose blocks={it.blocks} />
                </Example>
              </PageItem>
            ))}
          </PageSection>
        )
      })}
    </>
  )
}

// ---------------------------------------------------------------------------
// Pages — one per toolkit doc. The MD is the single source of truth (also the
// download in the Toolkit); imported raw so it renders synchronously and the
// sub-nav can read its anchors on first paint.
// ---------------------------------------------------------------------------

import activationMd from "@/styleguide/public/toolkit/activation-protocol.md?raw"
import retentionMd from "@/styleguide/public/toolkit/retention-protocol.md?raw"
import expansionMd from "@/styleguide/public/toolkit/expansion-protocol.md?raw"
import levelDesignMd from "@/styleguide/public/toolkit/level-design-patterns.md?raw"

export function ActivationProtocolPage() {
  return <ProtocolDoc markdown={activationMd} />
}
export function RetentionProtocolPage() {
  return <ProtocolDoc markdown={retentionMd} />
}
export function ExpansionProtocolPage() {
  return <ProtocolDoc markdown={expansionMd} />
}
export function LevelDesignPatternsPage() {
  return <ProtocolDoc markdown={levelDesignMd} />
}
