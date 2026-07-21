import * as React from "react"
import { Launcher } from "@/components/product/launcher"
import { NavItem } from "@/components/product/nav-item"
import { Choices } from "@/components/product/choices"
import { ScrollArea } from "@/components/base/scroll-area"
import { IconButton } from "@/components/base/icon-button"
import { DropdownEmpty } from "@/components/product/dropdown"
import { Button } from "@/components/base/button"
import { Icon } from "@/components/base/icon"
import type { LauncherApi } from "@/components/product/launcher-engine"
import { buildIndex, search, type SearchEntry } from "./index"
import { retrieveForAsk, askAgent, type AskSection } from "./ask"

/* ============================================================================
   SearchLauncher — the styleguide's launcher-agent with two capabilities:

     FIND (design system) — instant jump-to results.
     ASK  (protocols)     — a summary from Haiku + links to the source sections.

   It reuses the REAL <Launcher> (identical to the demo — no chrome divergence)
   and composes the design system's own components for everything below the
   composer: NavItem rows, Choices (the A/B/C option widget) for the Ask sources,
   ScrollArea for scrolling, IconButton for the close X. Nothing is hand-rolled.
   ========================================================================== */

type Props = {
  agentName?: string
  avatarSrc?: string
  dockRef: React.RefObject<HTMLElement | null>
  regionRef?: React.RefObject<HTMLElement | null>
  scrollRef?: React.RefObject<HTMLElement | null>
  onNavigate: (pageId: string, sectionId?: string) => void
}

type AskState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; text: string; sections: AskSection[] }
  | { status: "error"; error: string }

// keep the composer focused when a row is pressed (so the palette doesn't collapse)
const keepFocus = (e: React.MouseEvent) => e.preventDefault()

export function SearchLauncher({ agentName, avatarSrc, dockRef, regionRef, scrollRef, onNavigate }: Props) {
  const entries = React.useMemo(() => buildIndex(), [])
  const [query, setQuery] = React.useState("")
  const [results, setResults] = React.useState<SearchEntry[]>([])
  const [askHits, setAskHits] = React.useState<AskSection[]>([])
  const [active, setActive] = React.useState(0)
  const [ask, setAsk] = React.useState<AskState>({ status: "idle" })
  const apiRef = React.useRef<LauncherApi | null>(null)

  const stt = React.useRef({ query, results, askHits, active, ask })
  stt.current = { query, results, askHits, active, ask }

  React.useEffect(() => { apiRef.current?.resizeInput() }, [results, askHits, query, ask])

  const off = () => (stt.current.askHits.length > 0 ? 1 : 0)
  const navCount = () => off() + stt.current.results.length

  const onQuery = (v: string) => {
    setQuery(v)
    const q = v.trim()
    setResults(q ? search(v, entries) : [])
    setAskHits(q ? retrieveForAsk(v, entries) : [])
    setActive(0)
    setAsk({ status: "idle" })
  }

  const onNav = (dir: 1 | -1) => {
    if (stt.current.ask.status !== "idle") return
    setActive((a) => {
      const n = navCount()
      return n === 0 ? 0 : Math.max(0, Math.min(n - 1, a + dir))
    })
  }

  const goTo = (pageId: string, sectionId?: string) => {
    onNavigate(pageId, sectionId)
    apiRef.current?.clearInput()
    apiRef.current?.toDefault()
  }

  const runAsk = () => {
    const { query: q, askHits: hits } = stt.current
    if (!hits.length) return
    setAsk({ status: "loading" })
    askAgent(q, hits)
      .then((text) => setAsk({ status: "done", text, sections: hits }))
      .catch((e: unknown) => setAsk({ status: "error", error: e instanceof Error ? e.message : "Ask failed" }))
  }

  const commit = (): boolean => {
    const s = stt.current
    if (s.ask.status === "loading") return true
    if (s.ask.status === "done") {
      const src = s.ask.sections[0]
      if (src) goTo(src.pageId, src.sectionId)
      return true
    }
    const o = off()
    if (o === 1 && s.active === 0) { runAsk(); return true }
    const entry = s.results[s.active - o]
    if (entry) goTo(entry.pageId, entry.sectionId)
    return true
  }

  const trimmed = query.trim()
  const o = askHits.length > 0 ? 1 : 0

  // group results by page, preserving flat (arrow-nav) order
  const groups: { label: string; items: { e: SearchEntry; idx: number }[] }[] = []
  results.forEach((e, idx) => {
    let g = groups.find((x) => x.label === e.group)
    if (!g) { g = { label: e.group, items: [] }; groups.push(g) }
    g.items.push({ e, idx })
  })

  let inner: React.ReactNode = null
  if (trimmed) {
    if (ask.status === "loading") {
      inner = (
        <div className="flex items-center gap-2.5 px-2.5 py-3">
          <Icon name="sparkles" size={18} className="animate-pulse text-foreground" />
          <span className="text-sm text-muted-foreground">Reading the protocols…</span>
        </div>
      )
    } else if (ask.status === "done") {
      inner = (
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-1">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.04em] text-muted-foreground uppercase">
              <Icon name="sparkles" size={13} className="text-foreground" /> From the protocols
            </span>
            <IconButton icon="x" iconSize={13} size={26} onMouseDown={keepFocus} onClick={() => setAsk({ status: "idle" })} aria-label="Back to results" />
          </div>
          <ScrollArea className="max-h-[240px] shrink-0">
            <p className="px-1 text-sm leading-relaxed text-foreground">{ask.text}</p>
            {ask.sections.length > 0 && (
              <div className="mt-3" onMouseDown={keepFocus}>
                <Choices
                  value={null}
                  options={ask.sections.map((s, i) => ({ value: String(i), label: `${s.page} · ${s.title}` }))}
                  onValueChange={(v) => { const s = ask.sections[Number(v)]; if (s) goTo(s.pageId, s.sectionId) }}
                />
              </div>
            )}
          </ScrollArea>
        </div>
      )
    } else if (ask.status === "error") {
      inner = (
        <div className="flex flex-col items-start gap-2.5 px-1">
          <div className="flex w-full items-center justify-between">
            <span className="text-[11px] font-semibold tracking-[0.04em] text-muted-foreground uppercase">Ask</span>
            <IconButton icon="x" iconSize={13} size={26} onMouseDown={keepFocus} onClick={() => setAsk({ status: "idle" })} aria-label="Back to results" />
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground">{ask.error}</p>
          <Button variant="secondary" size="sm" onMouseDown={keepFocus} onClick={runAsk}>Try again</Button>
        </div>
      )
    } else {
      inner = (
        <ScrollArea className="max-h-[300px] shrink-0">
          {askHits.length > 0 && (
            <NavItem icon="sparkles" current={active === 0} onMouseEnter={() => setActive(0)} onMouseDown={keepFocus} onClick={runAsk}>
              Ask about “{trimmed}”
            </NavItem>
          )}
          {results.length === 0 && askHits.length === 0 ? (
            <DropdownEmpty>No matches for “{trimmed}”</DropdownEmpty>
          ) : (
            groups.map((g) => (
              <div key={g.label} className="flex flex-col">
                <div className="px-2.5 pt-2.5 pb-1 text-[11px] font-semibold tracking-[0.04em] text-muted-foreground uppercase">{g.label}</div>
                {g.items.map(({ e, idx }) => (
                  <NavItem
                    key={e.key}
                    icon={e.icon}
                    current={idx === active - o}
                    onMouseEnter={() => setActive(idx + o)}
                    onMouseDown={keepFocus}
                    onClick={() => goTo(e.pageId, e.sectionId)}
                  >
                    {e.title}
                  </NavItem>
                ))}
              </div>
            ))
          )}
        </ScrollArea>
      )
    }
  }

  // shrink-0: this is the flex child the engine measures — it must keep its height
  // (an overflow:auto descendant would otherwise let it collapse to 0 mid-measure)
  const panel = trimmed ? <div className="shrink-0 border-t border-border pt-2">{inner}</div> : null

  return (
    <Launcher
      agentName={agentName}
      avatarSrc={avatarSrc}
      label="Search the design system"
      searchMode
      placeholder="Search the design system…"
      dockRef={dockRef}
      regionRef={regionRef}
      scrollRef={scrollRef}
      resultsSlot={panel}
      onQuery={onQuery}
      onNav={onNav}
      onCommit={commit}
      onReady={(api) => { apiRef.current = api }}
    />
  )
}
