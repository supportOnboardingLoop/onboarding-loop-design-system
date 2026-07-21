import * as React from "react"
import { SectionHeader } from "@/components/product/section-header"

import { cn } from "@/lib/utils"
import { Card, CardSurface, CardHeader, CardFooter, CardTitle } from "@/components/base/card"
import { Badge } from "@/components/base/badge"
import { Icon } from "@/components/base/icon"
import { CardAction, PinAction, AttachAction, Sparkline } from "./analytics-ui"
import { useDrag } from "../drag"
import { useDemoIdentity } from "../identity"

// ============================================================================
// ANALYTICS · Portfolio view — the benchmark-aware Scorecard (health gauge + KPI
// cards) and the client table, on the settled card pattern (section header
// outside; each item its own Card = pure-content surface + a footer for meta).
// Migrated from the old portal #viewPortfolio.
// ============================================================================

type Delta = { text: string; tone: "up" | "down" | "muted" }
type Kpi = {
  name: string
  status: "ok" | "watch"
  value: string
  bench: string
  spark: "ok" | "warn"
  delta: Delta
}

const KPIS: Kpi[] = [
  { name: "Portfolio Revenue", status: "ok", value: "$4M", bench: "No benchmark configured", spark: "ok", delta: { text: "Baseline pending", tone: "muted" } },
  { name: "Conversion Rate", status: "watch", value: "2.15%", bench: "Benchmark 2.80%", spark: "warn", delta: { text: "23.1% below benchmark", tone: "down" } },
  { name: "Revenue per Session", status: "watch", value: "$3.36", bench: "Benchmark $4.20", spark: "warn", delta: { text: "20.1% below benchmark", tone: "down" } },
  { name: "Average Order Value", status: "ok", value: "$155.92", bench: "Benchmark $87.00", spark: "ok", delta: { text: "79.2% vs benchmark", tone: "up" } },
  { name: "Active Leads", status: "ok", value: "1", bench: "No benchmark configured", spark: "ok", delta: { text: "Baseline pending", tone: "muted" } },
  { name: "Active Facets", status: "ok", value: "41", bench: "No benchmark configured", spark: "ok", delta: { text: "Baseline pending", tone: "muted" } },
  { name: "MRR Opportunity", status: "ok", value: "$119,658", bench: "No benchmark configured", spark: "ok", delta: { text: "Baseline pending", tone: "muted" } },
  { name: "Bounce Rate", status: "watch", value: "41.00%", bench: "Benchmark 42.00%", spark: "ok", delta: { text: "2.4% better than benchmark", tone: "up" } },
]

function DeltaLine({ delta }: { delta: Delta }) {
  if (delta.tone === "muted") return <span className="text-sm font-medium text-muted-foreground">{delta.text}</span>
  const up = delta.tone === "up"
  return (
    <span className={cn("inline-flex min-w-0 items-center gap-1 text-sm font-semibold", up ? "text-success" : "text-destructive")}>
      <Icon name={up ? "trending-up" : "trending-down"} size={15} stroke={2} className="shrink-0" />
      <span className="truncate">{delta.text}</span>
    </span>
  )
}

function KpiCard({ kpi }: { kpi: Kpi }) {
  const { startDrag } = useDrag()
  const card = {
    id: kpi.name,
    title: kpi.name,
    accent: kpi.value,
    tile: { type: "kpi" as const, name: kpi.name, value: kpi.value, bench: kpi.bench, status: kpi.status, sparkTone: kpi.spark, delta: kpi.delta },
  }
  return (
    <Card
      className="cursor-grab select-none active:cursor-grabbing"
      onPointerDown={(e) => startDrag({ title: card.title, accent: card.accent, sourceId: card.id, tile: card.tile }, e)}
    >
      <CardHeader
        title={kpi.name}
        action={
          <Badge variant={kpi.status === "ok" ? "success" : "warning"}>{kpi.status === "ok" ? "Healthy" : "Watch"}</Badge>
        }
      />
      <CardSurface className="p-5">
        <div className="flex items-end justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="text-[26px] leading-none font-semibold tracking-[-0.02em] text-foreground">{kpi.value}</div>
            <div className="truncate text-xs text-muted-foreground">{kpi.bench}</div>
          </div>
          <Sparkline tone={kpi.spark} />
        </div>
      </CardSurface>
      <CardFooter action={<div className="flex items-center gap-0.5"><PinAction card={card} /><AttachAction card={card} /></div>}>
        <DeltaLine delta={kpi.delta} />
      </CardFooter>
    </Card>
  )
}

/* The portfolio-health gauge card: a success ring at 87%, the score in the centre,
   and Sites / Alerts stats. The ring is a real circle (not squircled). */
function HealthGauge() {
  return (
    <Card>
      <CardHeader title="Portfolio Health" action={<span className="text-sm font-medium text-muted-foreground">Updated Jul 9</span>} />
      <CardSurface className="items-center gap-4 p-5">
        <div className="relative grid place-items-center">
          <svg viewBox="0 0 120 120" className="size-[124px] [corner-shape:round]" aria-hidden="true">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--success-tint)" strokeWidth="10" />
            <circle
              cx="60"
              cy="60"
              r="52"
              fill="none"
              stroke="var(--success)"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray="284 327"
              transform="rotate(-90 60 60)"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <b className="text-3xl leading-none font-semibold tracking-[-0.02em] text-foreground">87</b>
            <span className="mt-1 text-sm font-medium text-success">Healthy</span>
          </div>
        </div>
        <div className="flex w-full items-center justify-center gap-8">
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Sites</span>
            <span className="text-lg font-semibold text-foreground">8</span>
          </div>
          <div className="h-8 w-px bg-border" />
          <div className="flex flex-col items-center gap-0.5">
            <span className="text-xs font-medium text-muted-foreground">Alerts</span>
            <span className="text-lg font-semibold text-foreground">1</span>
          </div>
        </div>
      </CardSurface>
    </Card>
  )
}

// ---- the client table ------------------------------------------------------

type Platform = "Shopify Plus" | "Shopify + H" | "Shopify"
// `siteIndex` points into the resolved DemoIdentity sites (name + initials); no
// client site name is baked here.
type Row = {
  siteIndex: number
  joined: string
  platform: Platform
  sessions: string
  revenue: string
  cvr: string
  cvrDelta: { text: string; up: boolean }
  rps: string
  status: { label: string; variant: "success" | "warning" | "error" | "neutral" }
}

const ROWS: Row[] = [
  { siteIndex: 0, joined: "Mar 2025", platform: "Shopify Plus", sessions: "503,164", revenue: "$1.2M", cvr: "1.5%", cvrDelta: { text: "-0.18pp", up: false }, rps: "$2.46", status: { label: "Needs Attention", variant: "warning" } },
  { siteIndex: 1, joined: "Jan 2025", platform: "Shopify + H", sessions: "218,440", revenue: "$987K", cvr: "3.21%", cvrDelta: { text: "+1.2pp", up: true }, rps: "$4.52", status: { label: "Healthy", variant: "success" } },
  { siteIndex: 2, joined: "Feb 2025", platform: "Shopify Plus", sessions: "144,820", revenue: "$612K", cvr: "2.87%", cvrDelta: { text: "+0.9pp", up: true }, rps: "$4.23", status: { label: "Healthy", variant: "success" } },
  { siteIndex: 3, joined: "Apr 2025", platform: "Shopify", sessions: "98,210", revenue: "$342K", cvr: "1.92%", cvrDelta: { text: "-0.3pp", up: false }, rps: "$3.48", status: { label: "At risk", variant: "error" } },
  { siteIndex: 4, joined: "May 2025", platform: "Shopify", sessions: "74,330", revenue: "$289K", cvr: "2.41%", cvrDelta: { text: "+0.4pp", up: true }, rps: "$3.89", status: { label: "Onboarding", variant: "neutral" } },
  { siteIndex: 5, joined: "Jan 2025", platform: "Shopify + H", sessions: "61,880", revenue: "$218K", cvr: "2.18%", cvrDelta: { text: "+0.7pp", up: true }, rps: "$3.53", status: { label: "Healthy", variant: "success" } },
  { siteIndex: 6, joined: "Jun 2025", platform: "Shopify", sessions: "51,200", revenue: "$187K", cvr: "2.22%", cvrDelta: { text: "+0.2pp", up: true }, rps: "$3.66", status: { label: "Healthy", variant: "success" } },
  { siteIndex: 7, joined: "Jul 2025", platform: "Shopify Plus", sessions: "44,100", revenue: "$143K", cvr: "1.98%", cvrDelta: { text: "+0.1pp", up: true }, rps: "$3.25", status: { label: "Onboarding", variant: "neutral" } },
]

function PortfolioTable() {
  const { startDrag } = useDrag()
  const { sites } = useDemoIdentity()
  const th = "px-3 py-2.5 text-xs font-semibold text-muted-foreground whitespace-nowrap"
  const td = "px-3 py-3 text-base text-foreground whitespace-nowrap align-middle"
  return (
    <Card>
      <CardSurface padded={false}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border">
                <th className={cn(th, "pl-5")}>Client</th>
                <th className={th}>Platform</th>
                <th className={cn(th, "text-right")}>Sessions</th>
                <th className={cn(th, "text-right")}>Revenue</th>
                <th className={cn(th, "text-right")}>CVR</th>
                <th className={cn(th, "text-right")}>RPS</th>
                <th className={th}>Status</th>
                <th className={cn(th, "pr-5 text-right")}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => {
                const site = sites[r.siteIndex]
                const name = site?.name ?? ""
                const initials = site?.initials ?? ""
                const rowCard = {
                  id: name,
                  title: name,
                  accent: r.revenue,
                  tile: { type: "chart" as const, title: name, note: `${r.platform} · ${r.status.label}`, spec: { kind: "stat" as const, label: "Revenue", value: r.revenue } },
                }
                return (
                <tr
                  key={name}
                  className="cursor-grab border-b border-border transition-colors select-none last:border-0 hover:bg-[var(--ctl-hover)] active:cursor-grabbing"
                  onPointerDown={(e) => startDrag({ title: name, accent: r.revenue, sourceId: name, tile: rowCard.tile }, e)}
                >
                  <td className={cn(td, "pl-5")}>
                    <div className="flex items-center gap-2.5">
                      <span className="grid size-9 shrink-0 place-items-center rounded-full [corner-shape:round] bg-subtle text-xs font-semibold text-muted-foreground">
                        {initials}
                      </span>
                      <span className="flex flex-col leading-tight">
                        <span className="font-medium text-foreground">{name}</span>
                        <span className="text-xs text-muted-foreground">{r.joined}</span>
                      </span>
                    </div>
                  </td>
                  <td className={td}>
                    <span className="inline-flex items-center rounded-md [corner-shape:squircle] border border-border bg-subtle px-2 py-0.5 text-xs font-medium text-muted-foreground">
                      {r.platform}
                    </span>
                  </td>
                  <td className={cn(td, "text-right tabular-nums")}>{r.sessions}</td>
                  <td className={cn(td, "text-right font-semibold tabular-nums")}>{r.revenue}</td>
                  <td className={cn(td, "text-right tabular-nums")}>
                    <span className="inline-flex items-baseline gap-1.5">
                      {r.cvr}
                      <span className={cn("text-xs font-medium", r.cvrDelta.up ? "text-success" : "text-destructive")}>{r.cvrDelta.text}</span>
                    </span>
                  </td>
                  <td className={cn(td, "text-right tabular-nums")}>{r.rps}</td>
                  <td className={td}>
                    <Badge variant={r.status.variant}>{r.status.label}</Badge>
                  </td>
                  <td className={cn(td, "pr-4")}>
                    <div className="flex items-center justify-end gap-0.5">
                      <PinAction card={rowCard} />
                      <AttachAction card={rowCard} />
                      <CardAction icon="dots-vertical" label="More actions" />
                    </div>
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </CardSurface>
    </Card>
  )
}

export function PortfolioView() {
  return (
    <>
      {/* Scorecard */}
      <section className="flex flex-col gap-4">
        <SectionHeader title="Scorecard" description="Benchmark-aware portfolio health" placement="inline" divider />
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
          <HealthGauge />
          {KPIS.map((k) => (
            <KpiCard key={k.name} kpi={k} />
          ))}
        </div>
      </section>

      {/* Portfolio table */}
      <section className="flex flex-col gap-4">
        <SectionHeader title="Portfolio" description="Every client, health-first" placement="inline" divider />
        <PortfolioTable />
      </section>
    </>
  )
}
