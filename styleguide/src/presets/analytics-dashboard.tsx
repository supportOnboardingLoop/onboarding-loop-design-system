import * as React from "react"
import { createPortal } from "react-dom"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/components/base/icon"
import { Button } from "@/components/base/button"
import { Input } from "@/components/base/input"
import { IconButton } from "@/components/base/icon-button"
import { Card, CardSurface, CardHeader } from "@/components/base/card"
import { CardAction, useCardActions, type CardRef } from "./analytics-ui"
import { TileBody, tileTitle, tileSubtitle, type TileDescriptor, type ChartSpec } from "./analytics-tiles"

// ============================================================================
// ANALYTICS · Dashboard — a saved dashboard is a grid of pinned TILES the user
// owns: they can be reordered (drag the grip), resized (drag the right edge, 1..6
// grid columns), commented on (a thread pops beside the card), and topped with
// banners. A tile is just a pinned card re-rendered from its TileDescriptor via
// the shared TileBody, so a report chart and its pinned copy are the same thing.
//
// The Demo renderer (DemoApp) owns the dashboards state + every mutation; this
// file is pure presentation + local pointer gestures (reorder / resize / thread
// positioning). Grid columns are measured, so "6 spots" means 6 when the content
// column is wide and gracefully fewer when it is narrow (chat open, mobile).
// ============================================================================

// ---- model ------------------------------------------------------------------

export type BannerTone = "good" | "warn" | "error"
export type Banner = { id: string; headline: string; subline: string; tone: BannerTone }
export type DashComment = { id: string; author: string; me?: boolean; text: string; time: string }
/** one placed tile: a pinned card (`sourceId` = origin, for pin membership) with
 *  a display `size` (grid columns) and its own comment thread. */
export type DashTile = { id: string; sourceId: string; desc: TileDescriptor; size: number; comments: DashComment[]; unread?: boolean }
export type Dashboard = { id: string; name: string; tiles: DashTile[]; banners: Banner[] }

let _uid = 0
export const nextId = (p: string) => `${p}-${++_uid}`

/** a good default column span for a freshly-pinned tile, by content type. */
export function defaultTileSize(desc: TileDescriptor): number {
  if (desc.type === "chart") {
    const k = desc.spec.kind
    if (k === "stat" || k === "gauge") return 2
    if (k === "donut" || k === "meters" || k === "stacked-bar" || k === "bars") return 3
    return 4 // columns, trend, funnel, stacked-cols read best wide
  }
  return 2 // insight / kpi
}

/** build a placed tile from a pinnable card (falls back to a bare stat tile). */
export function makeTileFromCard(card: CardRef): DashTile {
  const desc: TileDescriptor =
    card.tile ?? { type: "chart", title: card.title, note: undefined, spec: { kind: "stat", value: card.accent ?? "—" } as ChartSpec }
  return { id: nextId("tile"), sourceId: card.id, desc, size: defaultTileSize(desc), comments: [] }
}

// ---- seed: the one populated default dashboard --------------------------------

const chartTile = (title: string, spec: ChartSpec, note?: string): DashTile => {
  const desc: TileDescriptor = { type: "chart", title, note, spec }
  return { id: nextId("seed"), sourceId: nextId("src"), desc, size: defaultTileSize(desc), comments: [] }
}

/** The default dashboard the demo boots with: a believable store-performance
 *  board, with two tiles already carrying a comment thread. */
export function makeSeedDashboard(): Dashboard {
  const traffic = chartTile(
    "Traffic by channel",
    { kind: "donut", centerLabel: "Sessions", data: [
      { label: "Organic", value: 48200 }, { label: "Direct", value: 31100 }, { label: "Referral", value: 19400 }, { label: "Social", value: 12400 },
    ] },
    "Organic is carrying the quarter — over a third of sessions."
  )
  traffic.comments = [
    { id: nextId("c"), author: "You", me: true, text: "Pulled traffic by channel for the QBR — organic is carrying us.", time: "2d" },
    { id: nextId("c"), author: "Mara Chen", text: "Nice. Can we add paid social next to this? Want to compare CAC.", time: "4h" },
  ]
  traffic.unread = true

  const pages = chartTile(
    "Top pages by revenue",
    { kind: "bars", fmt: { currency: "$" }, data: [
      { label: "Home", value: 42000 }, { label: "PDP · Wool cap", value: 38000 }, { label: "Collections", value: 22000 }, { label: "Blog", value: 9000 },
    ] },
    "The PDP is punching above its traffic share."
  )
  pages.comments = [
    { id: nextId("c"), author: "Devin Ross", text: "PDP revenue looks high vs last month — attribution window?", time: "1d" },
    { id: nextId("c"), author: "You", me: true, text: "It's on 7-day click. Switching to last-touch and refreshing now.", time: "5h" },
    { id: nextId("c"), author: "Devin Ross", text: "Perfect, thanks. Let's review Thursday.", time: "1h" },
  ]
  pages.unread = true

  return {
    id: nextId("dash"),
    name: "Store Performance",
    banners: [],
    tiles: [
      chartTile("Sessions", { kind: "stat", label: "Last 30 days", value: 128400, delta: 6.2, period: "vs prior 30 days", spark: [3.6, 3.9, 3.7, 4.2, 4.6, 4.4, 5.1, 5.4, 5.2, 5.9, 6.1, 6.4] }),
      chartTile("Revenue", { kind: "stat", label: "Last 30 days", value: 264000, delta: 8.4, period: "vs prior 30 days", fmt: { currency: "$" }, spark: [6, 6.4, 6.1, 7, 7.4, 7.2, 8, 8.3, 8.1, 8.8, 9.1, 9.4] }),
      chartTile("Conversion rate", { kind: "stat", label: "Last 30 days", value: 2.9, delta: 4.1, period: "vs prior 30 days", fmt: { unit: "%" }, spark: [2.4, 2.5, 2.45, 2.6, 2.62, 2.7, 2.74, 2.78, 2.8, 2.84, 2.88, 2.9] }),
      chartTile("Revenue, last 30 days", { kind: "trend", fmt: { currency: "$" }, stat: { label: "Gross revenue", value: 264000, delta: 8.4, period: "vs prior period" }, labels: ["Day 1", "Day 6", "Day 11", "Day 16", "Day 21", "Day 26", "Day 30"], series: [{ name: "Revenue", values: [7200, 7600, 7100, 8200, 8600, 9100, 9400], variant: "brand", area: true }] }),
      traffic,
      pages,
      chartTile("Signup funnel", { kind: "funnel", summary: [{ label: "Visit → account", value: "4.2%" }], steps: [
        { label: "Visited", value: 128400 }, { label: "Viewed product", value: 61200 }, { label: "Added to cart", value: 24800 }, { label: "Checkout", value: 11600 }, { label: "Purchased", value: 5400 },
      ] }),
    ],
  }
}

// ---- comment thread popover -------------------------------------------------

function Avatar({ name, me }: { name: string; me?: boolean }) {
  const initials = me ? "ME" : name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
  return (
    <span className={cn("grid size-7 shrink-0 place-items-center rounded-full [corner-shape:round] text-[11px] font-semibold", me ? "bg-primary text-primary-foreground" : "bg-subtle text-muted-foreground")}>
      {initials}
    </span>
  )
}

function CommentPopover({ anchor, tile, meName, onSend, onClose }: { anchor: HTMLElement; tile: DashTile; meName: string; onSend: (text: string) => void; onClose: () => void }) {
  const [pos, setPos] = React.useState<{ left: number; top: number } | null>(null)
  const [text, setText] = React.useState("")
  const panelRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const W = 320

  const place = React.useCallback(() => {
    const r = anchor.getBoundingClientRect()
    const h = panelRef.current?.offsetHeight ?? 340
    const roomRight = window.innerWidth - r.right
    const left = roomRight > W + 16 ? r.right + 10 : Math.max(12, r.left - W - 10)
    const top = Math.min(Math.max(12, r.top - 8), window.innerHeight - h - 12)
    setPos({ left, top })
  }, [anchor])

  React.useLayoutEffect(() => { place() }, [place, tile.comments.length])
  React.useEffect(() => {
    place()
    const on = () => place()
    window.addEventListener("scroll", on, true)
    window.addEventListener("resize", on)
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    const onDown = (e: PointerEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return
      if (anchor.contains(e.target as Node)) return
      onClose()
    }
    window.addEventListener("keydown", onKey)
    window.addEventListener("pointerdown", onDown, true)
    return () => {
      window.removeEventListener("scroll", on, true)
      window.removeEventListener("resize", on)
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("pointerdown", onDown, true)
    }
  }, [place, anchor, onClose])

  React.useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight }) }, [tile.comments.length])

  const send = () => {
    const t = text.trim()
    if (!t) return
    onSend(t)
    setText("")
  }

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Comments"
      className="fixed z-[70] flex w-80 flex-col overflow-hidden rounded-2xl [corner-shape:squircle] border border-border bg-popover text-popover-foreground shadow-[var(--shadow-lg)]"
      style={{ left: pos?.left ?? -9999, top: pos?.top ?? -9999, maxHeight: "min(70vh, 460px)" }}
    >
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-2.5">
        <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Icon name="message" size={16} className="text-muted-foreground" />
          Comments
          <span className="text-muted-foreground">· {tile.comments.length}</span>
        </span>
        <IconButton icon="x" motion="rotate" size={32} aria-label="Close comments" onClick={onClose} className="-mr-1.5" />
      </div>

      <div ref={listRef} className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto px-4 py-3.5">
        {tile.comments.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No comments yet. Start the thread.</p>}
        {tile.comments.map((c) => (
          <div key={c.id} className="flex gap-2.5">
            <Avatar name={c.author} me={c.me} />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <span className="flex items-baseline gap-2 text-sm leading-none">
                <b className="font-semibold text-foreground">{c.me ? meName : c.author}</b>
                <span className="text-xs text-muted-foreground">{c.time}</span>
              </span>
              <p className="text-sm leading-relaxed text-foreground">{c.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 border-t border-border p-2.5">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send() } }}
          placeholder="Add a comment…"
          className="h-9 flex-1"
          autoFocus
        />
        <IconButton icon="send" size={36} aria-label="Send comment" onClick={send} disabled={!text.trim()} />
      </div>
    </div>,
    document.body
  )
}

// ---- one dashboard tile -----------------------------------------------------

function TileActions({ tile, onUnpin, onOpenThread, threadOpen }: { tile: DashTile; onUnpin: () => void; onOpenThread: (el: HTMLElement) => void; threadOpen: boolean }) {
  const { isAttached, onToggleAttach } = useCardActions()
  const attached = isAttached(tile.sourceId)
  const card: CardRef = { id: tile.sourceId, title: tileTitle(tile.desc) }
  const btnRef = React.useRef<HTMLButtonElement>(null)
  return (
    <div className="flex items-center gap-0.5">
      {/* pinned INTO this dashboard → always filled; click removes it */}
      <CardAction icon="pin-filled" filled active label="Unpin from dashboard" onClick={onUnpin} />
      <CardAction icon="paperclip" active={attached} label={attached ? "Unattach" : "Attach to chat"} onClick={() => onToggleAttach(card)} />
      <span className="relative inline-flex">
        <button
          ref={btnRef}
          type="button"
          aria-label="Comments"
          title="Comments"
          aria-pressed={threadOpen || undefined}
          onClick={() => btnRef.current && onOpenThread(btnRef.current)}
          className={cn(
            "bp-navicon-host grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg [corner-shape:squircle] border border-transparent outline-none transition-colors hover:border-[color-mix(in_oklab,var(--foreground)_12%,transparent)] hover:text-primary focus-visible:shadow-[0_0_0_3px_var(--accent-tint)]",
            threadOpen ? "text-primary" : "text-[var(--ctl-icon)]"
          )}
        >
          <Icon name="message" size={17} stroke={1.5} className="bp-navicon" />
        </button>
        {tile.unread && (
          <span className="pointer-events-none absolute right-[5px] top-[5px] size-2 rounded-full [corner-shape:round] bg-[var(--success)] shadow-[0_0_0_2px_var(--canvas)]" />
        )}
      </span>
    </div>
  )
}

function DashTileCard({
  tile,
  span,
  dragging,
  onReorderStart,
  onResizeStart,
  onUnpin,
  openThreadFor,
  onOpenThread,
}: {
  tile: DashTile
  span: number
  dragging: boolean
  onReorderStart: (e: React.PointerEvent, id: string) => void
  onResizeStart: (e: React.PointerEvent, id: string) => void
  onUnpin: () => void
  openThreadFor: string | null
  onOpenThread: (id: string, el: HTMLElement) => void
}) {
  return (
    <Card
      data-tile-id={tile.id}
      style={{ gridColumn: `span ${span}` }}
      className={cn(
        "group/tile relative transition-[opacity,box-shadow] duration-150",
        dragging && "opacity-40 shadow-[0_0_0_2px_var(--primary)]"
      )}
    >
      <CardHeader
        className="pr-1.5 pl-2"
        title={
          <span className="flex min-w-0 items-center gap-1">
            {/* reorder grip — the tile's drag handle */}
            <span
              onPointerDown={(e) => onReorderStart(e, tile.id)}
              className="grid size-6 shrink-0 cursor-grab place-items-center rounded-md text-[var(--ctl-icon)] opacity-40 transition-opacity hover:bg-[var(--ctl-hover)] hover:opacity-100 active:cursor-grabbing group-hover/tile:opacity-70"
              aria-label="Drag to reorder"
              title="Drag to reorder"
            >
              <Icon name="grip-vertical" size={16} stroke={1.75} />
            </span>
            <span className="min-w-0 truncate">{tileTitle(tile.desc)}</span>
          </span>
        }
        action={
          <TileActions
            tile={tile}
            onUnpin={onUnpin}
            threadOpen={openThreadFor === tile.id}
            onOpenThread={(el) => onOpenThread(tile.id, el)}
          />
        }
      />
      {/* grow the surface so tiles in the same grid row match height (like the
          portfolio cards); the chart sits at the top of the well */}
      <CardSurface className="@container grow gap-3.5 p-5">
        <TileBody desc={tile.desc} />
      </CardSurface>

      {/* resize handle — drag the right edge to grow / shrink (1..cols columns) */}
      <span
        onPointerDown={(e) => onResizeStart(e, tile.id)}
        className="absolute inset-y-2 right-[-3px] z-10 flex w-3 cursor-col-resize touch-none items-center justify-center opacity-0 transition-opacity group-hover/tile:opacity-100"
        aria-label="Drag to resize"
        title="Drag to resize"
      >
        <span className="h-10 w-1 rounded-full bg-border-strong transition-colors hover:bg-primary" />
      </span>
    </Card>
  )
}

// ---- banners ----------------------------------------------------------------

const BANNER_TONES: Record<BannerTone, { label: string; icon: IconName; bg: string; border: string; fg: string }> = {
  good: { label: "Good news", icon: "circle-check", bg: "var(--success-tint)", border: "var(--success)", fg: "var(--success)" },
  warn: { label: "Warning", icon: "alert-triangle", bg: "var(--warning-tint)", border: "var(--warning)", fg: "var(--warning)" },
  error: { label: "Error", icon: "alert-hexagon", bg: "var(--destructive-tint)", border: "var(--destructive)", fg: "var(--destructive)" },
}

function BannerRow({ banner, onRemove }: { banner: Banner; onRemove: () => void }) {
  const t = BANNER_TONES[banner.tone]
  return (
    <Card>
      <CardSurface
        padded={false}
        className="flex-row items-start gap-3 p-4"
        style={{ background: t.bg, borderColor: `color-mix(in srgb, ${t.border} 40%, transparent)` }}
      >
        <span className="mt-px grid size-6 shrink-0 place-items-center" style={{ color: t.fg }}>
          <Icon name={t.icon} size={20} stroke={1.75} />
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-sm font-semibold text-foreground">{banner.headline}</span>
          {banner.subline && <span className="text-sm leading-relaxed text-muted-foreground">{banner.subline}</span>}
        </div>
        <IconButton icon="x" motion="rotate" size={32} aria-label="Dismiss banner" onClick={onRemove} className="-mr-1 -mt-0.5 shrink-0" />
      </CardSurface>
    </Card>
  )
}

function BannerComposer({ onAdd, onCancel }: { onAdd: (b: Omit<Banner, "id">) => void; onCancel: () => void }) {
  const [headline, setHeadline] = React.useState("")
  const [subline, setSubline] = React.useState("")
  const [tone, setTone] = React.useState<BannerTone>("good")
  const add = () => {
    if (!headline.trim()) return
    onAdd({ headline: headline.trim(), subline: subline.trim(), tone })
  }
  return (
    <Card>
      <CardHeader title="New banner" />
      <CardSurface className="gap-3.5 p-5">
        <Input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="Headline" autoFocus onKeyDown={(e) => e.key === "Enter" && add()} />
        <Input value={subline} onChange={(e) => setSubline(e.target.value)} placeholder="Supporting line (optional)" onKeyDown={(e) => e.key === "Enter" && add()} />
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(BANNER_TONES) as BannerTone[]).map((k) => {
            const t = BANNER_TONES[k]
            const on = tone === k
            return (
              <button
                key={k}
                type="button"
                onClick={() => setTone(k)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-lg [corner-shape:squircle] border px-2.5 py-1.5 text-sm font-medium transition-colors",
                  on ? "text-foreground" : "border-border text-muted-foreground hover:border-border-strong"
                )}
                style={on ? { background: t.bg, borderColor: t.border } : undefined}
              >
                <Icon name={t.icon} size={16} style={{ color: t.fg }} />
                {t.label}
              </button>
            )
          })}
        </div>
        <div className="mt-0.5 flex items-center justify-end gap-2">
          <Button variant="secondary" size="sm" onClick={onCancel}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={add} disabled={!headline.trim()}>Add banner</Button>
        </div>
      </CardSurface>
    </Card>
  )
}

// ---- the dashboard view -----------------------------------------------------

export type DashboardHandlers = {
  onReorder: (tiles: DashTile[]) => void
  onResize: (tileId: string, size: number) => void
  onUnpinTile: (tileId: string) => void
  onAddComment: (tileId: string, text: string) => void
  onMarkRead: (tileId: string) => void
  onAddBanner: (b: Omit<Banner, "id">) => void
  onRemoveBanner: (bannerId: string) => void
}

export function DashboardView({
  dashboard,
  handlers,
  meName = "You",
  bannerComposerOpen = false,
  onCloseBannerComposer,
}: {
  dashboard: Dashboard
  handlers: DashboardHandlers
  meName?: string
  bannerComposerOpen?: boolean
  onCloseBannerComposer?: () => void
}) {
  const gridRef = React.useRef<HTMLDivElement>(null)
  const [cols, setCols] = React.useState(4)
  const [dragId, setDragId] = React.useState<string | null>(null)
  const [thread, setThread] = React.useState<{ id: string; el: HTMLElement } | null>(null)

  const tiles = dashboard.tiles
  const tilesRef = React.useRef(tiles)
  tilesRef.current = tiles

  // measure the grid → how many columns fit (up to 6). Narrow content = fewer.
  React.useEffect(() => {
    const el = gridRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth
      setCols(Math.max(1, Math.min(6, Math.floor(w / 150))))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // FLIP: when tiles change slot / size, animate every OTHER tile from its old
  // box to its new one (the dragged tile snaps, so it stays under the pointer).
  const posRef = React.useRef<Map<string, { left: number; top: number }>>(new Map())
  const dragIdRef = React.useRef<string | null>(null)
  dragIdRef.current = dragId
  React.useLayoutEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const prev = posRef.current
    const next = new Map<string, { left: number; top: number }>()
    grid.querySelectorAll<HTMLElement>("[data-tile-id]").forEach((el) => {
      const id = el.dataset.tileId!
      const r = el.getBoundingClientRect()
      next.set(id, { left: r.left, top: r.top })
      const old = prev.get(id)
      if (old && id !== dragIdRef.current) {
        const dx = old.left - r.left
        const dy = old.top - r.top
        if (dx || dy) {
          el.style.transition = "none"
          el.style.transform = `translate(${dx}px, ${dy}px)`
          requestAnimationFrame(() => {
            el.style.transition = "transform 240ms cubic-bezier(.2,.8,.2,1)"
            el.style.transform = ""
          })
        }
      }
    })
    posRef.current = next
  })

  // ---- reorder (drag the grip) ----
  const reorder = React.useRef<{ id: string; sx: number; sy: number; started: boolean } | null>(null)
  const onReorderStart = (e: React.PointerEvent, id: string) => {
    if (e.button !== 0) return
    e.preventDefault()
    reorder.current = { id, sx: e.clientX, sy: e.clientY, started: false }
    const move = (ev: PointerEvent) => {
      const d = reorder.current
      if (!d) return
      if (!d.started) {
        if (Math.hypot(ev.clientX - d.sx, ev.clientY - d.sy) < 6) return
        d.started = true
        setDragId(d.id)
        document.body.style.userSelect = "none"
      }
      const overEl = (document.elementFromPoint(ev.clientX, ev.clientY) as HTMLElement | null)?.closest<HTMLElement>("[data-tile-id]")
      const overId = overEl?.getAttribute("data-tile-id")
      if (!overId || overId === d.id) return
      const cur = tilesRef.current
      const from = cur.findIndex((t) => t.id === d.id)
      const dragged = cur[from]
      if (!dragged) return
      const r = overEl!.getBoundingClientRect()
      const after = ev.clientX > r.left + r.width / 2
      const without = cur.filter((t) => t.id !== d.id)
      let idx = without.findIndex((t) => t.id === overId)
      if (after) idx += 1
      const next = [...without.slice(0, idx), dragged, ...without.slice(idx)]
      if (next.some((t, i) => t.id !== cur[i]?.id)) handlers.onReorder(next)
    }
    const up = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      reorder.current = null
      setDragId(null)
      document.body.style.userSelect = ""
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
  }

  // ---- resize (drag the right edge) ----
  const onResizeStart = (e: React.PointerEvent, id: string) => {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    const grid = gridRef.current
    const tileEl = (e.currentTarget as HTMLElement).closest<HTMLElement>("[data-tile-id]")
    if (!grid || !tileEl) return
    const gap = 16
    const gw = grid.clientWidth
    const step = (gw - gap * (cols - 1)) / cols + gap
    const tileLeft = tileEl.getBoundingClientRect().left
    document.body.style.userSelect = "none"
    document.body.style.cursor = "col-resize"
    let lastSpan = -1
    const move = (ev: PointerEvent) => {
      const span = Math.max(1, Math.min(cols, Math.round((ev.clientX - tileLeft) / step)))
      // only commit when the snapped column span actually changes (keeps the FLIP
      // animation to one step per column crossed, not one per pixel)
      if (span !== lastSpan) {
        lastSpan = span
        handlers.onResize(id, span)
      }
    }
    const up = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      document.body.style.userSelect = ""
      document.body.style.cursor = ""
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
  }

  const openThread = (id: string, el: HTMLElement) => {
    setThread((t) => (t?.id === id ? null : { id, el }))
    handlers.onMarkRead(id)
  }
  const threadTile = thread ? tiles.find((t) => t.id === thread.id) ?? null : null
  React.useEffect(() => {
    // close the thread if its tile was removed
    if (thread && !tiles.some((t) => t.id === thread.id)) setThread(null)
  }, [tiles, thread])

  return (
    <section className="@container flex flex-col gap-4">
      {/* the banner composer — opened from the content header's "Create banner" */}
      {bannerComposerOpen && (
        <BannerComposer
          onAdd={(b) => { handlers.onAddBanner(b); onCloseBannerComposer?.() }}
          onCancel={() => onCloseBannerComposer?.()}
        />
      )}

      {/* banners — pinned to the top of the board */}
      {dashboard.banners.map((b) => (
        <BannerRow key={b.id} banner={b} onRemove={() => handlers.onRemoveBanner(b.id)} />
      ))}

      {tiles.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-border-strong bg-canvas/40 px-6 py-16 text-center">
          <span className="grid size-11 place-items-center rounded-2xl [corner-shape:squircle] bg-subtle text-muted-foreground">
            <Icon name="layout-dashboard" size={22} stroke={1.5} />
          </span>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold text-foreground">This dashboard is empty</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Pin cards from Overview, Portfolio, or a report — with the pin button or by dragging them onto this dashboard in the sidebar — and they'll land here.
            </p>
          </div>
        </div>
      ) : (
        <div
          ref={gridRef}
          className="grid items-stretch gap-4"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {tiles.map((t) => (
            <DashTileCard
              key={t.id}
              tile={t}
              span={Math.min(t.size, cols)}
              dragging={dragId === t.id}
              onReorderStart={onReorderStart}
              onResizeStart={onResizeStart}
              onUnpin={() => handlers.onUnpinTile(t.id)}
              openThreadFor={thread?.id ?? null}
              onOpenThread={openThread}
            />
          ))}
        </div>
      )}

      {thread && threadTile && (
        <CommentPopover
          anchor={thread.el}
          tile={threadTile}
          meName={meName}
          onSend={(text) => handlers.onAddComment(threadTile.id, text)}
          onClose={() => setThread(null)}
        />
      )}
    </section>
  )
}
