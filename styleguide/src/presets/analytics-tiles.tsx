import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon } from "@/components/base/icon"
import {
  StatTile,
  BarList,
  ColumnChart,
  TrendChart,
  DonutChart,
  StackedBar,
  StackedColumns,
  FunnelChart,
  Meter,
  Gauge,
} from "@/components/product/charts"

// ============================================================================
// ANALYTICS · shared tile content — the ONE renderer for a chart/insight/KPI,
// used by BOTH the generated Report view and the Dashboard grid. A pinnable card
// carries a serializable `TileDescriptor`; pin it and the dashboard re-renders it
// from the same descriptor, so a report card and its pinned copy never drift.
//
// `ChartSpec` is a small union over the real chart kit (components/product/
// charts.tsx). `ChartBody` renders the plot only (no card chrome) so the report
// and the dashboard each wrap it in their own card + actions.
// ============================================================================

export type Fmt = { currency?: string; unit?: string; decimals?: number }
type TrendSeriesSpec = { name: string; values: number[]; variant?: "brand" | "compare"; area?: boolean }

export type ChartSpec =
  | { kind: "stat"; label?: string; value: number | string; delta?: number; period?: string; goodWhen?: "up" | "down"; spark?: number[]; fmt?: Fmt }
  | { kind: "bars"; data: { label: string; value: number }[]; fmt?: Fmt }
  | { kind: "columns"; series?: [string, string]; data: { label: string; value: number; compare?: number }[]; fmt?: Fmt; height?: number }
  | { kind: "trend"; series: TrendSeriesSpec[]; labels: string[]; stat?: { label?: string; value: number | string; delta?: number; period?: string; goodWhen?: "up" | "down" }; fmt?: Fmt; height?: number }
  | { kind: "donut"; centerLabel?: string; data: { label: string; value: number }[]; fmt?: Fmt }
  | { kind: "stacked-bar"; data: { label: string; value: number }[]; fmt?: Fmt }
  | { kind: "stacked-cols"; series: string[]; data: { label: string; values: number[] }[]; fmt?: Fmt; height?: number }
  | { kind: "funnel"; steps: { label: string; value: number }[]; summary?: { label: string; value: string }[]; fmt?: Fmt; height?: number }
  | { kind: "meters"; items: { label: string; value: number; max?: number; tone?: "brand" | "success" | "warning" | "danger"; target?: number; fmt?: Fmt }[] }
  | { kind: "gauge"; label?: string; value: number; max?: number; tone?: "brand" | "success" | "warning" | "danger" }

/* Render a ChartSpec's plot (no card chrome). Compact charts (donut, funnel,
   trend, columns) get a shorter height so they still read in a small tile. */
export function ChartBody({ spec, compact }: { spec: ChartSpec; compact?: boolean }) {
  switch (spec.kind) {
    case "stat":
      return <StatTile label={spec.label} value={spec.value} delta={spec.delta} period={spec.period} goodWhen={spec.goodWhen} spark={spec.spark} fmt={spec.fmt} />
    case "bars":
      return <BarList data={spec.data} fmt={spec.fmt} />
    case "columns":
      return <ColumnChart data={spec.data} series={spec.series} fmt={spec.fmt} height={spec.height ?? (compact ? 168 : 210)} />
    case "trend":
      return <TrendChart series={spec.series} labels={spec.labels} stat={spec.stat} fmt={spec.fmt} height={spec.height ?? (compact ? 150 : 190)} />
    case "donut":
      return <DonutChart data={spec.data} centerLabel={spec.centerLabel} fmt={spec.fmt} />
    case "stacked-bar":
      return <StackedBar data={spec.data} fmt={spec.fmt} />
    case "stacked-cols":
      return <StackedColumns data={spec.data} series={spec.series} fmt={spec.fmt} height={spec.height ?? (compact ? 168 : 220)} />
    case "funnel":
      return <FunnelChart steps={spec.steps} summary={spec.summary} fmt={spec.fmt} height={spec.height ?? (compact ? 220 : 288)} />
    case "meters":
      return (
        <div className="flex flex-col gap-5">
          {spec.items.map((m, i) => (
            <Meter key={i} label={m.label} value={m.value} max={m.max} tone={m.tone} target={m.target} fmt={m.fmt} />
          ))}
        </div>
      )
    case "gauge":
      return (
        <div className="flex items-center justify-center py-1">
          <Gauge label={spec.label} value={spec.value} max={spec.max} tone={spec.tone} />
        </div>
      )
  }
}

// ---- tile descriptor: everything a dashboard needs to re-render a pinned card --

export type TileDescriptor =
  | { type: "chart"; title: string; note?: string; spec: ChartSpec }
  | { type: "insight"; money: string; site: string; title: string; body: string }
  | { type: "kpi"; name: string; value: string; bench: string; status: "ok" | "watch"; sparkTone: "ok" | "warn"; delta: { text: string; tone: "up" | "down" | "muted" } }

/* The hero money figure reused by the insight tile (mirrors analytics-content). */
function MoneyFigure({ amount }: { amount: string }) {
  return (
    <div className="flex items-center gap-2">
      <Icon name="trending-up" size={26} stroke={2} className="shrink-0 text-primary" />
      <div className="flex items-baseline gap-1">
        <span className="text-[30px] font-semibold leading-none tracking-[-0.02em] text-primary">{amount}</span>
        <span className="text-sm font-medium text-muted-foreground">/mo</span>
      </div>
    </div>
  )
}

const SPARK_UP = "M0,32 L12,27 L24,30 L36,20 L48,24 L60,14 L72,18 L84,8 L100,5"
const SPARK_DOWN = "M0,9 L12,12 L24,10 L36,17 L48,15 L60,22 L72,20 L84,26 L100,29"
function MiniSpark({ tone }: { tone: "ok" | "warn" }) {
  const ok = tone === "ok"
  const d = ok ? SPARK_UP : SPARK_DOWN
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true" className="h-9 w-[84px] shrink-0">
      <path d={d} fill="none" stroke={ok ? "var(--success)" : "var(--warning)"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

/* The BODY of a dashboard tile (the white surface content), switched on the
   descriptor. Chart tiles reuse ChartBody; insight / KPI tiles mirror their
   source cards so a pinned card looks like itself on the board. */
export function TileBody({ desc }: { desc: TileDescriptor }) {
  if (desc.type === "chart") {
    return (
      <div className="flex flex-col gap-3.5">
        <ChartBody spec={desc.spec} compact />
        {desc.note && <p className="text-sm leading-relaxed text-muted-foreground">{desc.note}</p>}
      </div>
    )
  }
  if (desc.type === "insight") {
    return (
      <div className="flex flex-col gap-3">
        <MoneyFigure amount={desc.money} />
        <div className="flex flex-col gap-1.5">
          <div className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-foreground">{desc.title}</div>
          <p className="text-sm leading-relaxed text-muted-foreground">{desc.body}</p>
        </div>
      </div>
    )
  }
  // kpi
  const d = desc.delta
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end justify-between gap-3">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="text-[26px] font-semibold leading-none tracking-[-0.02em] text-foreground">{desc.value}</div>
          <div className="truncate text-xs text-muted-foreground">{desc.bench}</div>
        </div>
        <MiniSpark tone={desc.sparkTone} />
      </div>
      {d.tone === "muted" ? (
        <span className="text-sm font-medium text-muted-foreground">{d.text}</span>
      ) : (
        <span className={cn("inline-flex items-center gap-1 text-sm font-semibold", d.tone === "up" ? "text-success" : "text-destructive")}>
          <Icon name={d.tone === "up" ? "trending-up" : "trending-down"} size={15} stroke={2} className="shrink-0" />
          {d.text}
        </span>
      )}
    </div>
  )
}

/* The tile's meta line (shown in the tile footer / header subtitle). */
export function tileSubtitle(desc: TileDescriptor): string {
  if (desc.type === "insight") return desc.site
  if (desc.type === "kpi") return desc.status === "ok" ? "Healthy" : "Watch"
  return ""
}

export function tileTitle(desc: TileDescriptor): string {
  if (desc.type === "chart") return desc.title
  if (desc.type === "insight") return desc.title
  return desc.name
}
