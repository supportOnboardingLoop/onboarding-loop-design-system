import * as React from "react"
import { SectionHeader } from "@/components/product/section-header"

import { cn } from "@/lib/utils"
import { Card, CardSurface, CardHeader, CardContent } from "@/components/base/card"
import { Icon } from "@/components/base/icon"
import { PinAction, AttachAction } from "./analytics-ui"
import { ChartBody, type ChartSpec, type TileDescriptor } from "./analytics-tiles"
import { useDrag } from "../drag"
import { useDemoIdentity, DEFAULT_SITES, type DemoSite } from "../identity"

// ============================================================================
// ANALYTICS · generated reports — the agent builds one of three reports from the
// chat's A/B/C choice, then a "ready" CTA opens it in the content area. The
// charts are the REAL analytics chart kit (components/product/charts.tsx) via the
// shared ChartSpec renderer, so a report card and its pinned dashboard copy are
// the same component. Everything is fluid: an @container grid + the kit's own
// container queries re-lay-out each card from a wide hero down to a mobile tile.
//
// The two site references (report "b" columns, "c" recommendation) come from the
// resolved DemoIdentity, so they read generic in the public demo and real in a
// client build.
// ============================================================================

// a report card = a titled chart on a half- or full-width cell, with an optional
// takeaway note. `spec` drives the plot; the same spec becomes the pinned tile.
type ReportCard = { title: string; w?: "half" | "full"; note?: string; spec: ChartSpec }
export type Report = { id: string; name: string; desc: string; intro: React.ReactNode; cards: ReportCard[]; prose: { lead?: string; text: string }[] }

const USD: { currency: string } = { currency: "$" }
const PCT: { unit: string } = { unit: "%" }

// Build the three reports for a given site portfolio. Only the site-named bits of
// reports b / c vary with the identity; ids / names are site-independent so the
// chat's report lookup stays stable.
export function makeReports(sites: DemoSite[]): Record<string, Report> {
  return {
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
        {
          title: "Recoverable / mo",
          w: "half",
          note: "Modeled from current traffic at benchmark conversion.",
          spec: { kind: "stat", label: "Across 3 sites", value: 225000, delta: 18, period: "vs last month", fmt: USD, spark: [140, 156, 150, 168, 182, 176, 198, 210, 205, 218, 222, 225] },
        },
        {
          title: "Fastest win",
          w: "half",
          note: "One theme rollback; roughly a 2-day turnaround.",
          spec: { kind: "stat", label: "Checkout CLS fix", value: 135000, delta: 42, period: "recoverable /mo", fmt: USD, spark: [40, 52, 60, 72, 88, 96, 104, 118, 122, 130, 132, 135] },
        },
        {
          title: "Recoverable revenue by funnel stage",
          w: "full",
          note: "Checkout drop-off alone accounts for 46% of the recoverable total.",
          spec: {
            kind: "bars",
            fmt: USD,
            data: [
              { label: "Checkout", value: 135000 },
              { label: "Account wall", value: 62000 },
              { label: "Hero", value: 48000 },
              { label: "Search", value: 27000 },
              { label: "PDP", value: 15000 },
            ],
          },
        },
        {
          title: "Where the leak sits",
          w: "half",
          note: "Fixing checkout first captures nearly half the opportunity.",
          spec: { kind: "donut", centerLabel: "Recoverable", fmt: USD, data: [{ label: "Checkout", value: 104000 }, { label: "Discovery", value: 70000 }, { label: "PDP", value: 51000 }] },
        },
        {
          title: "Recovery captured vs open",
          w: "half",
          note: "Nothing shipped yet — the full pool is still open.",
          spec: {
            kind: "meters",
            items: [
              { label: "Checkout CLS", value: 0, max: 135000, tone: "warning", fmt: USD },
              { label: "Account wall", value: 0, max: 62000, tone: "warning", fmt: USD },
              { label: "Buried search", value: 8000, max: 27000, tone: "brand", fmt: USD },
            ],
          },
        },
        {
          title: "Mobile checkout abandonment, 30 days",
          w: "full",
          note: "Abandonment climbed 23% over the window, starting the day after the theme update.",
          spec: {
            kind: "trend",
            fmt: PCT,
            stat: { label: "Current abandonment", value: "64%", delta: 23, period: "vs start of window", goodWhen: "down" },
            labels: ["Day 1", "Day 5", "Day 10", "Day 15", "Day 20", "Day 25", "Day 30"],
            series: [{ name: "Abandonment", values: [41, 43, 45, 48, 55, 60, 64], variant: "brand", area: true }],
          },
        },
        {
          title: "Mobile checkout funnel",
          w: "full",
          note: "The steepest drop is at the payment step — exactly where the layout shift lands.",
          spec: {
            kind: "funnel",
            summary: [
              { label: "Checkout completion", value: "28.6%" },
              { label: "Lost at payment", value: "$135K/mo" },
            ],
            steps: [
              { label: "Reached checkout", value: 24800 },
              { label: "Shipping info", value: 18200 },
              { label: "Payment", value: 12400 },
              { label: "Review", value: 9600 },
              { label: "Purchased", value: 7100 },
            ],
          },
        },
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
        {
          title: "Revenue by client, Q3 vs Q2",
          w: "full",
          note: `${sites[1].name} posted the largest quarter-over-quarter gain, up 18%.`,
          spec: {
            kind: "columns",
            fmt: USD,
            series: ["Q3", "Q2"],
            data: [
              { label: sites[0].initials, value: 1200000, compare: 1180000 },
              { label: sites[1].initials, value: 987000, compare: 836000 },
              { label: sites[2].initials, value: 612000, compare: 590000 },
              { label: sites[3].initials, value: 342000, compare: 358000 },
              { label: sites[4].initials, value: 289000, compare: 262000 },
            ],
          },
        },
        {
          title: "Portfolio conversion rate, 12 weeks",
          w: "full",
          note: "Blended CVR drifted down 17% even as revenue rose, offset by higher AOV.",
          spec: {
            kind: "trend",
            fmt: PCT,
            stat: { label: "Blended CVR", value: "2.15%", delta: -17, period: "over 12 weeks", goodWhen: "up" },
            labels: ["Wk 1", "Wk 3", "Wk 5", "Wk 7", "Wk 9", "Wk 11", "Wk 12"],
            series: [{ name: "CVR", values: [2.6, 2.5, 2.42, 2.3, 2.22, 2.16, 2.15], variant: "brand", area: true }],
          },
        },
        {
          title: "Revenue mix by platform",
          w: "half",
          note: "Plus stores drive over half of portfolio revenue.",
          spec: { kind: "donut", centerLabel: "Revenue", fmt: USD, data: [{ label: "Shopify Plus", value: 1784000 }, { label: "Shopify + H", value: 1132000 }, { label: "Shopify", value: 514000 }] },
        },
        {
          title: "Portfolio revenue",
          w: "half",
          note: "$3.43M this quarter vs $3.06M last.",
          spec: { kind: "stat", label: "This quarter", value: 3430000, delta: 12, period: "quarter over quarter", fmt: USD, spark: [2.9, 3.0, 2.95, 3.1, 3.05, 3.2, 3.28, 3.34, 3.3, 3.38, 3.41, 3.43] },
        },
        {
          title: "Revenue by product, 6 quarters",
          w: "full",
          note: "Enterprise is the fastest-growing line, more than doubling since Q1 last year.",
          spec: {
            kind: "stacked-cols",
            fmt: USD,
            series: ["Core", "Pro", "Enterprise", "Add-ons"],
            data: [
              { label: "Q2 '24", values: [420000, 280000, 180000, 90000] },
              { label: "Q3 '24", values: [450000, 310000, 220000, 100000] },
              { label: "Q4 '24", values: [470000, 340000, 260000, 120000] },
              { label: "Q1 '25", values: [510000, 380000, 310000, 140000] },
              { label: "Q2 '25", values: [540000, 420000, 350000, 150000] },
              { label: "Q3 '25", values: [580000, 470000, 410000, 170000] },
            ],
          },
        },
        {
          title: "Blended AOV",
          w: "half",
          note: "Carried the revenue gain despite softer conversion.",
          spec: { kind: "stat", label: "This quarter", value: 156, delta: 21, period: "quarter over quarter", fmt: USD, spark: [124, 128, 130, 136, 138, 142, 146, 149, 151, 153, 155, 156] },
        },
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
        {
          title: "Impact of the top 3 issues",
          w: "full",
          note: "The checkout fix is worth more than the other two combined.",
          spec: {
            kind: "bars",
            fmt: USD,
            data: [
              { label: "Checkout CLS", value: 135000 },
              { label: "Account wall", value: 62000 },
              { label: "Buried reviews", value: 41000 },
            ],
          },
        },
        {
          title: "Cumulative recovery if shipped, 8 weeks",
          w: "full",
          note: "Modeled monthly recovery building as each fix ships.",
          spec: {
            kind: "trend",
            fmt: USD,
            stat: { label: "Recovered by week 8", value: 238000, delta: 100, period: "of the top-3 pool", goodWhen: "up" },
            labels: ["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6", "Wk 7", "Wk 8"],
            series: [{ name: "Recovered", values: [0, 18000, 40000, 72000, 110000, 150000, 185000, 238000], variant: "brand", area: true }],
          },
        },
        {
          title: "Effort vs impact",
          w: "half",
          note: "High impact for modest engineering effort.",
          spec: { kind: "donut", centerLabel: "Split", fmt: PCT, data: [{ label: "Impact", value: 64 }, { label: "Effort", value: 36 }] },
        },
        {
          title: "Confidence",
          w: "half",
          note: "Backed by benchmark data on all three fixes.",
          spec: { kind: "gauge", label: "in the estimate", value: 88, tone: "success" },
        },
        {
          title: "Total / mo",
          w: "half",
          note: "A little over half of the full portfolio opportunity.",
          spec: { kind: "stat", label: "Top 3 combined", value: 238000, delta: 12, period: "recoverable /mo", fmt: USD, spark: [180, 190, 200, 210, 218, 224, 230, 234, 236, 237, 238, 238] },
        },
        {
          title: "Time to ship",
          w: "half",
          note: "All three are scoped and low-risk.",
          spec: { kind: "stat", label: "All three fixes", value: "~1 sprint" },
        },
      ],
      prose: [
        { lead: "Do this first.", text: `1) Roll back the checkout template. 2) Enable guest checkout on ${sites[4].name}. 3) Move reviews above the fold on ${sites[1].name}.` },
        { text: "Shipping all three in one sprint recovers an estimated $238K/mo." },
      ],
    },
  }
}

// Default reports on the generic sites; used only for the chat's site-independent
// name/id lookup. The content area rebuilds from the live identity (see ReportView).
export const REPORTS = makeReports(DEFAULT_SITES)

// ---- report card + view -----------------------------------------------------

/* One report card: a titled chart in a Card, with Pin / Attach and drag-to-agent.
   Pin carries the same `spec` as a tile descriptor, so pinning it drops the exact
   chart onto the dashboard. */
function ReportChartCard({ card }: { card: ReportCard }) {
  const { startDrag } = useDrag()
  const tile: TileDescriptor = { type: "chart", title: card.title, note: card.note, spec: card.spec }
  const ref = { id: `report:${card.title}`, title: card.title, tile }
  return (
    <Card
      className={cn("cursor-grab select-none active:cursor-grabbing", card.w === "full" && "@[620px]:[grid-column:span_2]")}
      onPointerDown={(e) => startDrag({ title: ref.title, sourceId: ref.id, tile }, e)}
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
      <CardSurface className="@container gap-3.5 p-5">
        <ChartBody spec={card.spec} />
        {card.note && <CardContent className="text-sm leading-relaxed text-muted-foreground">{card.note}</CardContent>}
      </CardSurface>
    </Card>
  )
}

export function ReportView({ id }: { id: string }) {
  // rebuild from the live identity so a client build shows its real site names
  const { sites } = useDemoIdentity()
  const rep = makeReports(sites)[id] ?? makeReports(sites).a
  return (
    <section className="flex flex-col gap-4">
      <SectionHeader title={rep.name} description={rep.desc} placement="inline" divider />

      <Card>
        <CardSurface className="flex-row items-start gap-3 border-[color-mix(in_srgb,var(--primary)_22%,transparent)] bg-[var(--accent-tint)] p-4">
          <Icon name="sparkles" size={20} className="mt-0.5 shrink-0 text-primary" />
          <div className="text-sm leading-relaxed text-foreground">{rep.intro}</div>
        </CardSurface>
      </Card>

      {/* an @container so the cards' col-span breakpoints track the content width,
          not the viewport (the content column narrows when the chat is open) */}
      <div className="@container">
        <div className="grid grid-cols-1 gap-4 @[620px]:grid-cols-2">
          {rep.cards.map((c, i) => (
            <ReportChartCard key={i} card={c} />
          ))}
        </div>
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
