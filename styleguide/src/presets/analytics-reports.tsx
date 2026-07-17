import * as React from "react"

import { cn } from "@/lib/utils"
import { Card, CardSurface, CardHeader, CardContent } from "@/components/base/card"
import { Icon } from "@/components/base/icon"
import { PinAction, AttachAction } from "./analytics-ui"
import { useDrag } from "../drag"

// ============================================================================
// ANALYTICS · generated reports — Wilson builds one of three reports from the
// chat's A/B/C choice, then a "ready" CTA opens it in the content area. Charts
// are hand-rolled inline SVG/CSS on the Card system. Migrated from the old
// portal REPORTS + the report-build flow.
// ============================================================================

type Tone = "accent" | "warn" | "ok"
type Seg = { v: number; color: string; label: string }
type ReportCard =
  | { type: "bars"; wide?: boolean; title: string; tone: Tone; vals: number[]; labels: string[]; note?: string }
  | { type: "line"; wide?: boolean; title: string; tone: Tone; vals: number[]; note?: string }
  | { type: "donut"; title: string; segs: Seg[]; note?: string }
  | { type: "stat"; title: string; big: string; sub: string; note?: string }
export type Report = { id: string; name: string; desc: string; intro: React.ReactNode; cards: ReportCard[]; prose: { lead?: string; text: string }[] }

const toneColor = (t: Tone) => (t === "warn" ? "var(--warning)" : t === "ok" ? "var(--success)" : "var(--primary)")

export const REPORTS: Record<string, Report> = {
  a: {
    id: "a",
    name: "Revenue Leak Report",
    desc: "Where money is leaking across the selected sites, ranked by recoverable revenue.",
    intro: (
      <>
        <b>$225K/mo</b> in recoverable revenue identified across 3 sites. The single largest pool is mobile checkout,
        where a post-update layout shift is interrupting the pay CTA.
      </>
    ),
    cards: [
      { type: "bars", wide: true, title: "Recoverable revenue by funnel stage", tone: "accent", vals: [135, 62, 48, 27, 15], labels: ["Checkout", "Account", "Hero", "Search", "PDP"], note: "Checkout drop-off alone accounts for 46% of the recoverable total." },
      { type: "line", title: "Mobile checkout abandonment, 30 days", tone: "warn", vals: [41, 43, 42, 45, 48, 52, 55, 58, 60, 63, 61, 64], note: "Abandonment climbed 23% over the window, starting the day after the theme update." },
      { type: "donut", title: "Where the leak sits", segs: [{ v: 46, color: "var(--primary)", label: "Checkout" }, { v: 31, color: "var(--warning)", label: "Discovery" }, { v: 23, color: "var(--success)", label: "PDP" }], note: "Fixing checkout first captures nearly half the opportunity." },
      { type: "stat", title: "Recoverable / mo", big: "$225K", sub: "across 3 sites", note: "Modeled from current traffic at benchmark conversion." },
      { type: "stat", title: "Fastest win", big: "$135K", sub: "checkout CLS fix", note: "One theme rollback; roughly a 2-day turnaround." },
    ],
    prose: [
      { lead: "Recommendation.", text: "Roll back the checkout template to restore the tap target, then re-test CLS on mobile. This is the highest-value, lowest-effort fix in the set." },
      { text: "Secondary: surface guest checkout and move site search above the fold. Together those recover a further ~$110K/mo at low engineering cost." },
    ],
  },
  b: {
    id: "b",
    name: "Quarter-over-Quarter Comparison",
    desc: "This quarter against last, across the portfolio's headline metrics.",
    intro: (
      <>
        Portfolio revenue is <b>up 12%</b> quarter over quarter, but conversion slipped on two sites. The gain is
        concentrated in AOV, not throughput.
      </>
    ),
    cards: [
      { type: "bars", wide: true, title: "Revenue by client, Q3 vs Q2", tone: "accent", vals: [1200, 987, 612, 342, 289], labels: ["LL", "GR", "PL", "BW", "VL"], note: "gearrush.com posted the largest quarter-over-quarter gain, up 18%." },
      { type: "line", title: "Portfolio conversion rate, 12 weeks", tone: "warn", vals: [2.6, 2.55, 2.5, 2.48, 2.42, 2.38, 2.3, 2.28, 2.22, 2.2, 2.16, 2.15], note: "Blended CVR drifted down 17% even as revenue rose, offset by higher AOV." },
      { type: "donut", title: "Revenue mix by platform", segs: [{ v: 52, color: "var(--primary)", label: "Shopify Plus" }, { v: 33, color: "var(--success)", label: "Shopify + H" }, { v: 15, color: "var(--warning)", label: "Shopify" }], note: "Plus stores drive over half of portfolio revenue." },
      { type: "stat", title: "Portfolio revenue", big: "+12%", sub: "quarter over quarter", note: "$3.43M this quarter vs $3.06M last." },
      { type: "stat", title: "Blended AOV", big: "+21%", sub: "quarter over quarter", note: "Carried the revenue gain despite softer conversion." },
    ],
    prose: [
      { lead: "Read.", text: "Growth this quarter is AOV-led, not traffic- or conversion-led. That is durable if merchandising holds, but fragile if the conversion slide continues." },
      { text: "Protect the quarter by addressing the two sites dragging CVR before the next promo cycle." },
    ],
  },
  c: {
    id: "c",
    name: "Top 3 Issues Summary",
    desc: "The three highest-impact issues right now, with the money attached.",
    intro: (
      <>
        Three issues account for <b>$238K/mo</b> of the total opportunity. All three are fixable inside a single sprint.
      </>
    ),
    cards: [
      { type: "bars", wide: true, title: "Impact of the top 3 issues", tone: "accent", vals: [135, 62, 41], labels: ["Checkout CLS", "Account wall", "Buried reviews"], note: "The checkout fix is worth more than the other two combined." },
      { type: "line", title: "Cumulative recovery if shipped, 8 weeks", tone: "ok", vals: [0, 18, 40, 72, 110, 150, 185, 238], note: "Modeled monthly recovery building as each fix ships." },
      { type: "donut", title: "Effort vs impact", segs: [{ v: 64, color: "var(--primary)", label: "Impact" }, { v: 36, color: "var(--warning)", label: "Effort" }], note: "High impact for modest engineering effort." },
      { type: "stat", title: "Total / mo", big: "$238K", sub: "top 3 combined", note: "A little over half of the full portfolio opportunity." },
      { type: "stat", title: "Time to ship", big: "~1", sub: "sprint", note: "All three are scoped and low-risk." },
    ],
    prose: [
      { lead: "Do this first.", text: "1) Roll back the checkout template. 2) Enable guest checkout on vaultleather. 3) Move reviews above the fold on gearrush." },
      { text: "Shipping all three in one sprint recovers an estimated $238K/mo." },
    ],
  },
}

// ---- chart primitives -------------------------------------------------------

function BarChart({ vals, labels, tone }: { vals: number[]; labels: string[]; tone: Tone }) {
  const max = Math.max(...vals)
  const color = toneColor(tone)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex h-[130px] items-end gap-2.5">
        {vals.map((v, i) => (
          <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground tabular-nums">{v}</span>
            <div
              className="w-full rounded-t-[6px] [corner-shape:squircle]"
              style={{ height: `${Math.max(3, (v / max) * 100)}%`, background: color }}
            />
          </div>
        ))}
      </div>
      <div className="flex gap-2.5">
        {labels.map((l, i) => (
          <span key={i} className="flex-1 truncate text-center text-xs text-muted-foreground">
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}

function LineChart({ vals, tone }: { vals: number[]; tone: Tone }) {
  const uid = React.useId().replace(/:/g, "")
  const W = 300
  const H = 120
  const pad = 6
  const max = Math.max(...vals)
  const min = Math.min(...vals)
  const rng = max - min || 1
  const pts = vals.map((v, i) => [pad + i * ((W - pad * 2) / (vals.length - 1)), 12 + (1 - (v - min) / rng) * (H - 28)])
  const d = pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + "," + p[1].toFixed(1)).join(" ")
  const area = `${d} L${pts[pts.length - 1][0].toFixed(1)},${H - 12} L${pts[0][0].toFixed(1)},${H - 12} Z`
  const color = toneColor(tone)
  return (
    <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="h-[120px] w-full" aria-hidden="true">
      <defs>
        <linearGradient id={`ln${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.18" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#ln${uid})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

function DonutChart({ segs }: { segs: Seg[] }) {
  const C = 2 * Math.PI * 42
  let off = 0
  const rings = segs.map((s, i) => {
    const len = C * (s.v / 100)
    const node = (
      <circle
        key={i}
        cx="60"
        cy="60"
        r="42"
        fill="none"
        strokeWidth="15"
        stroke={s.color}
        strokeDasharray={`${len.toFixed(1)} ${(C - len).toFixed(1)}`}
        strokeDashoffset={(-off).toFixed(1)}
        transform="rotate(-90 60 60)"
      />
    )
    off += len
    return node
  })
  return (
    <div className="flex items-center gap-5">
      <svg viewBox="0 0 120 120" className="size-[112px] shrink-0 [corner-shape:round]" aria-hidden="true">
        <circle cx="60" cy="60" r="42" fill="none" strokeWidth="15" stroke="var(--subtle)" />
        {rings}
      </svg>
      <div className="flex min-w-0 flex-col gap-2">
        {segs.map((s, i) => (
          <span key={i} className="flex items-center gap-2 text-sm">
            <span className="size-2.5 shrink-0 rounded-full [corner-shape:round]" style={{ background: s.color }} />
            <b className="font-semibold text-foreground tabular-nums">{s.v}%</b>
            <span className="truncate text-muted-foreground">{s.label}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

// ---- report card + view -----------------------------------------------------

function ReportChartCard({ card }: { card: ReportCard }) {
  const { startDrag } = useDrag()
  const body =
    card.type === "bars" ? (
      <BarChart vals={card.vals} labels={card.labels} tone={card.tone} />
    ) : card.type === "line" ? (
      <LineChart vals={card.vals} tone={card.tone} />
    ) : card.type === "donut" ? (
      <DonutChart segs={card.segs} />
    ) : (
      <div className="flex items-baseline gap-2.5">
        <span className="text-[32px] leading-none font-semibold tracking-[-0.02em] text-primary">{card.big}</span>
        <span className="text-sm text-muted-foreground">{card.sub}</span>
      </div>
    )
  const ref = { id: `report:${card.title}`, title: card.title }
  return (
    <Card
      className={cn("cursor-grab select-none active:cursor-grabbing", card.type !== "donut" && (card as { wide?: boolean }).wide && "[grid-column:span_2]")}
      onPointerDown={(e) => startDrag({ title: ref.title, sourceId: ref.id }, e)}
    >
      <CardHeader
        title={card.title}
        action={
          <div className="flex items-center gap-0.5">
            <PinAction card={ref} />
            <AttachAction card={ref} />
          </div>
        }
      />
      <CardSurface className="gap-3.5 p-5">
        {body}
        {card.note && <CardContent className="text-sm leading-relaxed text-muted-foreground">{card.note}</CardContent>}
      </CardSurface>
    </Card>
  )
}

export function ReportView({ id }: { id: string }) {
  const rep = REPORTS[id] ?? REPORTS.a
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-6 border-b border-border px-1 pb-3">
        <h2 className="shrink-0 text-md font-semibold tracking-[-0.01em] text-foreground">{rep.name}</h2>
        <p className="truncate text-sm text-muted-foreground">{rep.desc}</p>
      </div>

      <Card>
        <CardSurface className="flex-row items-start gap-3 border-[color-mix(in_srgb,var(--primary)_22%,transparent)] bg-[var(--accent-tint)] p-4">
          <Icon name="sparkles" size={20} className="mt-0.5 shrink-0 text-primary" />
          <div className="text-sm leading-relaxed text-foreground">{rep.intro}</div>
        </CardSurface>
      </Card>

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
        {rep.cards.map((c, i) => (
          <ReportChartCard key={i} card={c} />
        ))}
      </div>

      <Card>
        <CardHeader title="Recommendation" />
        <CardSurface className="gap-3 p-5">
          {rep.prose.map((p, i) => (
            <CardContent key={i} className="text-base leading-relaxed text-foreground">
              {p.lead && <b className="font-semibold">{p.lead} </b>}
              {p.text}
            </CardContent>
          ))}
        </CardSurface>
      </Card>
    </section>
  )
}

// ---- the in-chat report-build widget ---------------------------------------

// Progress fills ~2.2s, then a "ready" CTA opens the report in the content area.
export function ReportBuild({ rep, onOpen }: { rep: Report; onOpen: () => void }) {
  const [pct, setPct] = React.useState(0)
  const [ready, setReady] = React.useState(false)
  const [opened, setOpened] = React.useState(false)

  React.useEffect(() => {
    let raf = 0
    let t0 = 0
    const dur = 2200
    const step = (ts: number) => {
      if (!t0) t0 = ts
      const e = Math.min(1, (ts - t0) / dur)
      setPct(Math.round(e * 100))
      if (e < 1) raf = requestAnimationFrame(step)
      else raf = window.setTimeout(() => setReady(true), 320) as unknown as number
    }
    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(raf)
    }
  }, [])

  if (!ready) {
    return (
      <div className="rgen flex flex-col gap-2 rounded-2xl [corner-shape:squircle] border border-border bg-card p-3.5">
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-foreground">Building report</span>
          <span className="tabular-nums text-muted-foreground">{pct}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-border">
          <div className="h-full rounded-full bg-primary transition-none" style={{ width: `${pct}%` }} />
        </div>
      </div>
    )
  }
  return (
    <button
      type="button"
      onClick={() => {
        onOpen()
        setOpened(true)
      }}
      className="group/rr flex w-full items-center gap-3 rounded-2xl [corner-shape:squircle] border border-border-strong bg-card p-3 text-left shadow-xs transition-colors hover:border-primary"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl [corner-shape:squircle] bg-accent-tint text-primary">
        <Icon name="file-text" size={18} stroke={1.6} />
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-semibold text-foreground">{rep.name}</span>
        <span className="text-xs text-muted-foreground">{opened ? "Opened · click to reopen" : "Report ready · click to open"}</span>
      </span>
      <Icon name="arrow-right" size={18} className="shrink-0 text-muted-foreground transition-transform group-hover/rr:translate-x-0.5" />
    </button>
  )
}
