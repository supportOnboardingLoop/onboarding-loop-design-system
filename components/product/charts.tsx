import * as React from "react"

import { cn } from "@/lib/utils"
import { Card, CardHeader, CardSurface } from "@/components/base/card"
import { Icon } from "@/components/base/icon"

/* ============================================================================
   Charts — a flexible analytics chart kit, built ON the Card system.

   Every chart lives in a <ChartCard>: the title rides the grey tray header, the
   plot lives in the white surface well below it. The bodies are hand-rolled
   inline SVG / CSS (no chart library) so they inherit the design tokens, the
   squircle language and both themes for free, and stay crisp at any size.

   Colour, by job (the curated-hybrid palette):
     • single series / current period  → the BRAND hue (--chart-brand), so the
       chart re-skins with the client. The comparison period is the SAME hue,
       lightened (--chart-compare) — never a second colour.
     • part-to-whole / discrete categories (donut, stacked) → the curated
       CATEGORICAL set (--chart-cat-1..6), assigned in fixed order.
   Text (labels, values, axes, legends) always wears text tokens, never the
   series colour; identity comes from the swatch/mark beside it. Gridlines are a
   recessive hairline; marks carry 4px rounded data-ends and 2px surface gaps.

   Responsiveness is by CARD size, not viewport: the surfaces are `@container`s,
   so a chart re-lays-out (donut legend wraps under, labels shrink) whether it is
   a wide hero card or a small tile in a grid — and it all still reads on mobile.
   ========================================================================== */

// ---- number formatting ------------------------------------------------------

type Fmt = { currency?: string; unit?: string; decimals?: number }

/** Compact axis / label form: 1,284 → 1.3K, 4.2M, $250K. */
export function compact(n: number, { currency = "", unit = "", decimals = 1 }: Fmt = {}) {
  const sign = n < 0 ? "-" : ""
  const abs = Math.abs(n)
  const trim = (x: number) => x.toFixed(decimals).replace(/\.0+$/, "")
  let body: string
  if (abs >= 1e9) body = trim(abs / 1e9) + "B"
  else if (abs >= 1e6) body = trim(abs / 1e6) + "M"
  else if (abs >= 1e3) body = trim(abs / 1e3) + "K"
  else body = String(Math.round(abs * 10) / 10)
  return `${sign}${currency}${body}${unit}`
}

/** Full, comma-grouped form for tooltips + legends: 1,284 → $1,284. */
export function full(n: number, { currency = "", unit = "" }: Fmt = {}) {
  return `${currency}${n.toLocaleString("en-US")}${unit}`
}

const CAT = Array.from({ length: 6 }, (_, i) => `var(--chart-cat-${i + 1})`)

// ---- ChartCard: the shared frame -------------------------------------------

/** Card tray + a title in the header + one white surface well for the plot. */
export function ChartCard({
  title,
  action,
  children,
  className,
  tray,
  padded = true,
}: {
  title: React.ReactNode
  action?: React.ReactNode
  children: React.ReactNode
  className?: string
  tray?: string
  padded?: boolean
}) {
  return (
    <Card className={tray}>
      <CardHeader title={title} action={action} />
      <CardSurface padded={false} className={cn("@container", padded && "p-5", className)}>
        {children}
      </CardSurface>
    </Card>
  )
}

// ---- shared bits: tooltip, legend, delta ------------------------------------

type TipState = { x: number; y: number; node: React.ReactNode } | null

/** A pointer-anchored tooltip scoped to a `relative` chart wrapper. */
function useTip(ref: React.RefObject<HTMLElement | null>) {
  const [tip, setTip] = React.useState<TipState>(null)
  const move = (e: React.PointerEvent | React.MouseEvent, node: React.ReactNode) => {
    const r = ref.current?.getBoundingClientRect()
    if (!r) return
    setTip({ x: e.clientX - r.left, y: e.clientY - r.top, node })
  }
  return { tip, move, hide: () => setTip(null) }
}

function Tip({ tip }: { tip: TipState }) {
  if (!tip) return null
  return (
    <div
      role="tooltip"
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[calc(100%+12px)] rounded-xl [corner-shape:squircle] border border-border bg-popover px-2.5 py-1.5 text-xs whitespace-nowrap text-popover-foreground shadow-[var(--shadow-sm)]"
      style={{ left: tip.x, top: tip.y }}
    >
      {tip.node}
    </div>
  )
}

/** name · value row for a tooltip, with the mark's colour dot. */
function TipRow({ color, label, value }: { color: string; label: React.ReactNode; value: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <span className="size-2 shrink-0 rounded-full [corner-shape:round]" style={{ background: color }} />
      <span className="text-muted-foreground">{label}</span>
      <b className="ml-auto pl-3 font-semibold tabular-nums text-foreground">{value}</b>
    </span>
  )
}

function Swatch({ color, shape = "dot" }: { color: string; shape?: "dot" | "line" }) {
  if (shape === "line")
    return <span className="inline-block h-[3px] w-3.5 shrink-0 rounded-full [corner-shape:round]" style={{ background: color }} />
  return <span className="size-2.5 shrink-0 rounded-full [corner-shape:round]" style={{ background: color }} />
}

/** A signed change chip, coloured by whether the movement is good. */
export function Delta({
  value,
  period,
  goodWhen = "up",
  className,
}: {
  value: number
  period?: React.ReactNode
  goodWhen?: "up" | "down"
  className?: string
}) {
  const up = value >= 0
  const good = goodWhen === "up" ? up : !up
  return (
    <span className={cn("inline-flex items-baseline gap-1 text-sm", className)}>
      <span className={cn("inline-flex items-center gap-0.5 font-semibold", good ? "text-success" : "text-destructive")}>
        <Icon name={up ? "trending-up" : "trending-down"} size={15} className="translate-y-[1px]" />
        {Math.abs(value)}%
      </span>
      {period && <span className="text-muted-foreground">{period}</span>}
    </span>
  )
}

/** Nice, rounded axis ticks (0 … max) for a value range. */
function niceTicks(max: number, count = 4) {
  if (max <= 0) return [0, 1]
  const raw = max / (count - 1)
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const norm = raw / mag
  const step = (norm >= 5 ? 10 : norm >= 2 ? 5 : norm >= 1 ? 2 : 1) * mag
  const top = Math.ceil(max / step) * step
  const ticks: number[] = []
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(Math.round(v * 1e6) / 1e6)
  return ticks
}

// ---- 1 · StatTile: the headline number -------------------------------------

/** A single KPI: label, hero value, optional delta + inline sparkline. */
export function StatTile({
  label,
  value,
  delta,
  period,
  goodWhen = "up",
  spark,
  fmt,
}: {
  label: React.ReactNode
  value: number | string
  delta?: number
  period?: React.ReactNode
  goodWhen?: "up" | "down"
  spark?: number[]
  fmt?: Fmt
}) {
  const shown = typeof value === "number" ? compact(value, fmt) : value
  return (
    <div className="flex flex-col gap-2.5">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
        <span className="text-[2rem] leading-none font-semibold tracking-[-0.02em] text-foreground">{shown}</span>
        {spark && spark.length > 1 && <Sparkline values={spark} />}
      </div>
      {delta !== undefined && <Delta value={delta} period={period ?? "vs last period"} goodWhen={goodWhen} />}
    </div>
  )
}

function Sparkline({ values }: { values: number[] }) {
  const W = 96
  const H = 30
  const min = Math.min(...values)
  const max = Math.max(...values)
  const rng = max - min || 1
  const pts = values.map((v, i) => [
    (i / (values.length - 1)) * W,
    H - 3 - ((v - min) / rng) * (H - 6),
  ] as const)
  const d = smoothPath(pts)
  const last = pts[pts.length - 1]
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="overflow-visible" aria-hidden>
      <path d={d} fill="none" stroke="var(--chart-brand)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r={3} fill="var(--chart-brand)" stroke="var(--surface)" strokeWidth={2} />
    </svg>
  )
}

// ---- 2 · BarList: horizontal magnitude bars --------------------------------

/** Ranked horizontal bars — magnitude by length, value at the tip. Single series
    → brand gradient. Great for "top N by amount". */
export function BarList({
  data,
  fmt,
  max: maxProp,
}: {
  data: { label: React.ReactNode; value: number }[]
  fmt?: Fmt
  max?: number
}) {
  const wrap = React.useRef<HTMLDivElement>(null)
  const { tip, move, hide } = useTip(wrap)
  const max = maxProp ?? Math.max(...data.map((d) => d.value), 0)
  const [active, setActive] = React.useState<number | null>(null)
  return (
    <div ref={wrap} className="relative flex flex-col gap-5">
      {data.map((d, i) => {
        const pct = max > 0 ? (d.value / max) * 82 : 0
        return (
          <div
            key={i}
            className="flex flex-col gap-2"
            onPointerMove={(e) => move(e, <TipRow color="var(--chart-brand)" label={d.label} value={full(d.value, fmt)} />)}
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => { setActive(null); hide() }}
          >
            <span className="text-sm font-medium text-muted-foreground">{d.label}</span>
            <div className="flex items-center">
              <div
                className="h-2.5 min-w-[6px] rounded-full [corner-shape:squircle] transition-[opacity,width] duration-300"
                style={{
                  width: `${Math.max(pct, 1.5)}%`,
                  background: "linear-gradient(90deg, var(--chart-brand), var(--chart-brand-2))",
                  opacity: active === null || active === i ? 1 : 0.4,
                }}
              />
              <span className="ml-2.5 text-base font-semibold tabular-nums text-foreground">{compact(d.value, fmt)}</span>
            </div>
          </div>
        )
      })}
      <Tip tip={tip} />
    </div>
  )
}

// ---- 3 · ColumnChart: vertical bars, optional comparison --------------------

/** Vertical columns over categories, optionally a comparison series (current =
    brand, comparison = lighter same hue). Y gridlines + ticks, legend when 2. */
export function ColumnChart({
  data,
  series = ["Current", "Previous"],
  fmt,
  height = 210,
}: {
  data: { label: React.ReactNode; value: number; compare?: number }[]
  series?: [string, string]
  fmt?: Fmt
  height?: number
}) {
  const wrap = React.useRef<HTMLDivElement>(null)
  const { tip, move, hide } = useTip(wrap)
  const hasCompare = data.some((d) => d.compare !== undefined)
  const max = Math.max(...data.flatMap((d) => [d.value, d.compare ?? 0]), 0)
  const ticks = niceTicks(max)
  const top = ticks[ticks.length - 1]
  return (
    <div className="flex flex-col gap-3">
      <div ref={wrap} className="relative flex gap-2.5" style={{ height }}>
        {/* y-axis ticks */}
        <div className="flex w-9 shrink-0 flex-col justify-between py-[2px] text-right text-xs tabular-nums text-muted-foreground">
          {[...ticks].reverse().map((t) => (
            <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0 leading-none">
              {compact(t, fmt)}
            </span>
          ))}
        </div>
        {/* plot */}
        <div className="relative flex-1">
          {/* gridlines */}
          {ticks.map((t) => (
            <div
              key={t}
              className="absolute inset-x-0 h-px bg-[var(--chart-grid)]"
              style={{ bottom: `${(t / top) * 100}%` }}
            />
          ))}
          {/* columns */}
          <div className="absolute inset-0 flex items-end justify-around gap-2">
            {data.map((d, i) => (
              <div
                key={i}
                className="flex h-full flex-1 items-end justify-center gap-[3px]"
                onPointerMove={(e) =>
                  move(
                    e,
                    <span className="flex flex-col gap-1">
                      <span className="mb-0.5 font-semibold text-foreground">{d.label}</span>
                      <TipRow color="var(--chart-brand)" label={series[0]} value={full(d.value, fmt)} />
                      {hasCompare && d.compare !== undefined && (
                        <TipRow color="var(--chart-compare)" label={series[1]} value={full(d.compare, fmt)} />
                      )}
                    </span>
                  )
                }
                onPointerLeave={hide}
              >
                <Column heightPct={(d.value / top) * 100} color="var(--chart-brand)" />
                {hasCompare && d.compare !== undefined && (
                  <Column heightPct={(d.compare / top) * 100} color="var(--chart-compare)" />
                )}
              </div>
            ))}
          </div>
        </div>
        <Tip tip={tip} />
      </div>
      {/* x labels */}
      <div className="flex gap-2.5">
        <span className="w-9 shrink-0" />
        <div className="flex flex-1 justify-around gap-2">
          {data.map((d, i) => (
            <span key={i} className="flex-1 truncate text-center text-xs text-muted-foreground">{d.label}</span>
          ))}
        </div>
      </div>
      {hasCompare && <Legend items={[{ color: "var(--chart-brand)", label: series[0] }, { color: "var(--chart-compare)", label: series[1] }]} />}
    </div>
  )
}

function Column({ heightPct, color }: { heightPct: number; color: string }) {
  return (
    <div
      className="w-full max-w-6 rounded-t-[4px] [corner-shape:squircle] transition-[height] duration-500 ease-out group-hover:opacity-90"
      style={{ height: `${Math.max(heightPct, 1)}%`, background: color }}
    />
  )
}

// ---- 4 · TrendChart: line / area over time ---------------------------------

type TrendSeries = { name: string; values: number[]; variant?: "brand" | "compare"; area?: boolean }

/** A time trend: 1–2 line/area series (current solid brand + comparison dashed
    lighter), y gridlines, x labels, an optional hero stat above the plot. */
export function TrendChart({
  series,
  labels,
  stat,
  fmt,
  height = 190,
}: {
  series: TrendSeries[]
  labels: string[]
  stat?: { label?: React.ReactNode; value: number | string; delta?: number; period?: React.ReactNode; goodWhen?: "up" | "down" }
  fmt?: Fmt
  height?: number
}) {
  const wrap = React.useRef<HTMLDivElement>(null)
  const { tip, move, hide } = useTip(wrap)
  const [hoverX, setHoverX] = React.useState<number | null>(null)
  const uid = React.useId().replace(/:/g, "")
  const W = 640
  const H = height
  const padT = 10
  const padB = 6
  const all = series.flatMap((s) => s.values)
  const max = Math.max(...all, 0)
  const ticks = niceTicks(max, 4)
  const top = ticks[ticks.length - 1]
  const n = labels.length
  const xOf = (i: number) => (n <= 1 ? W / 2 : (i / (n - 1)) * W)
  const yOf = (v: number) => padT + (1 - v / top) * (H - padT - padB)

  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = wrap.current?.getBoundingClientRect()
    if (!r) return
    const rel = (e.clientX - r.left) / r.width
    const i = Math.max(0, Math.min(n - 1, Math.round(rel * (n - 1))))
    setHoverX(i)
    move(
      e,
      <span className="flex flex-col gap-1">
        <span className="mb-0.5 font-semibold text-foreground">{labels[i]}</span>
        {series.map((s) => (
          <TipRow
            key={s.name}
            color={s.variant === "compare" ? "var(--chart-compare)" : "var(--chart-brand)"}
            label={s.name}
            value={full(s.values[i], fmt)}
          />
        ))}
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-3.5">
      {stat && (
        <div className="flex flex-col gap-1.5">
          {stat.label && <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>}
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[1.75rem] leading-none font-semibold tracking-[-0.02em] text-foreground">
              {typeof stat.value === "number" ? compact(stat.value, fmt) : stat.value}
            </span>
            {stat.delta !== undefined && <Delta value={stat.delta} period={stat.period} goodWhen={stat.goodWhen} />}
          </div>
        </div>
      )}
      <div className="flex gap-2.5">
        {/* y ticks */}
        <div className="flex shrink-0 flex-col justify-between text-right text-xs tabular-nums text-muted-foreground" style={{ height: H, paddingTop: padT, paddingBottom: padB }}>
          {[...ticks].reverse().map((t) => (
            <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0 leading-none">{compact(t, fmt)}</span>
          ))}
        </div>
        <div
          ref={wrap}
          className="relative min-w-0 flex-1"
          onPointerMove={onMove}
          onPointerLeave={() => { setHoverX(null); hide() }}
        >
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height={H} className="overflow-visible">
            <defs>
              <linearGradient id={`area${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--chart-brand)" stopOpacity="0.16" />
                <stop offset="1" stopColor="var(--chart-brand)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* gridlines */}
            {ticks.map((t) => (
              <line key={t} x1="0" x2={W} y1={yOf(t)} y2={yOf(t)} stroke="var(--chart-grid)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            ))}
            {series.map((s) => {
              const pts = s.values.map((v, i) => [xOf(i), yOf(v)] as const)
              const d = smoothPath(pts)
              const compare = s.variant === "compare"
              const color = compare ? "var(--chart-compare)" : "var(--chart-brand)"
              return (
                <g key={s.name}>
                  {s.area && !compare && (
                    <path d={`${d} L${W},${H - padB} L0,${H - padB} Z`} fill={`url(#area${uid})`} />
                  )}
                  <path
                    d={d}
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray={compare ? "2 5" : undefined}
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              )
            })}
            {/* hover crosshair + markers */}
            {hoverX !== null && (
              <>
                <line x1={xOf(hoverX)} x2={xOf(hoverX)} y1={padT} y2={H - padB} stroke="var(--chart-axis)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                {series.map((s) => (
                  <circle
                    key={s.name}
                    cx={xOf(hoverX)}
                    cy={yOf(s.values[hoverX])}
                    r="4"
                    fill={s.variant === "compare" ? "var(--chart-compare)" : "var(--chart-brand)"}
                    stroke="var(--surface)"
                    strokeWidth="2"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </>
            )}
          </svg>
          <Tip tip={tip} />
        </div>
      </div>
      {/* x labels */}
      <div className="flex gap-2.5">
        <span className="shrink-0" style={{ width: `${String(compact(top, fmt)).length * 7 + 8}px` }} />
        <div className="flex min-w-0 flex-1 justify-between text-xs text-muted-foreground">
          {labels.map((l, i) => (
            <span key={i} className={cn(i === 0 && "text-left", i === labels.length - 1 && "text-right")}>{l}</span>
          ))}
        </div>
      </div>
      {series.length > 1 && (
        <Legend items={series.map((s) => ({ color: s.variant === "compare" ? "var(--chart-compare)" : "var(--chart-brand)", label: s.name, shape: "line" as const, dashed: s.variant === "compare" }))} />
      )}
    </div>
  )
}

// ---- 5 · DonutChart: part-to-whole ring ------------------------------------

/** A ring with the total in the hole + a value legend beside it (wraps under on
    a narrow card). Categories in the curated categorical palette. */
export function DonutChart({
  data,
  centerLabel = "Total",
  maxLegend = 4,
  fmt,
}: {
  data: { label: React.ReactNode; value: number }[]
  centerLabel?: React.ReactNode
  maxLegend?: number
  fmt?: Fmt
}) {
  const wrap = React.useRef<HTMLDivElement>(null)
  const { tip, move, hide } = useTip(wrap)
  const [active, setActive] = React.useState<number | null>(null)
  const total = data.reduce((s, d) => s + d.value, 0)
  const R = 60
  const SW = 20
  const r = R - SW / 2
  const C = 2 * Math.PI * r
  const gap = 2 // px surface gap between segments
  let acc = 0
  const shown = data.slice(0, maxLegend)
  const rest = data.slice(maxLegend)
  const restSum = rest.reduce((s, d) => s + d.value, 0)

  return (
    <div ref={wrap} className="relative flex flex-col items-center gap-6 @[380px]:flex-row @[380px]:gap-7">
      {/* ring */}
      <div className="relative shrink-0" style={{ width: 128, height: 128 }}>
        <svg viewBox="0 0 120 120" width={128} height={128} className="-rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--chart-track)" strokeWidth={SW} />
          {data.map((d, i) => {
            const frac = total > 0 ? d.value / total : 0
            const len = Math.max(C * frac - gap, 0)
            const node = (
              <circle
                key={i}
                cx="60"
                cy="60"
                r={r}
                fill="none"
                stroke={CAT[i % CAT.length]}
                strokeWidth={SW}
                strokeDasharray={`${len} ${C - len}`}
                strokeDashoffset={-acc}
                className="transition-opacity duration-200"
                style={{ opacity: active === null || active === i ? 1 : 0.35 }}
                onPointerMove={(e) => { setActive(i); move(e, <TipRow color={CAT[i % CAT.length]} label={d.label} value={`${full(d.value, fmt)} · ${Math.round(frac * 100)}%`} />) }}
                onPointerLeave={() => { setActive(null); hide() }}
              />
            )
            acc += C * frac
            return node
          })}
        </svg>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-xl leading-none font-semibold tracking-[-0.02em] text-foreground">{compact(total, fmt)}</span>
          <span className="text-xs text-muted-foreground">{centerLabel}</span>
        </div>
      </div>
      {/* legend */}
      <div className="flex w-full min-w-0 flex-col gap-2.5">
        {shown.map((d, i) => (
          <div
            key={i}
            className="flex items-center gap-2.5 text-sm"
            onPointerMove={(e) => { setActive(i); move(e, <TipRow color={CAT[i % CAT.length]} label={d.label} value={full(d.value, fmt)} />) }}
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => { setActive(null); hide() }}
          >
            <Swatch color={CAT[i % CAT.length]} />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">{d.label}</span>
            <b className="shrink-0 font-semibold tabular-nums text-foreground">{full(d.value, fmt)}</b>
          </div>
        ))}
        {rest.length > 0 && (
          <span className="pl-[22px] text-sm text-muted-foreground">
            +{rest.length} more<span className="tabular-nums"> · {full(restSum, fmt)}</span>
          </span>
        )}
      </div>
      <Tip tip={tip} />
    </div>
  )
}

// ---- 6 · StackedBar: 100% proportion ---------------------------------------

/** A single 100%-width segmented bar with a value legend above it. Categories in
    the categorical palette; 2px surface gaps separate the segments. */
export function StackedBar({
  data,
  maxLegend = 4,
  fmt,
}: {
  data: { label: React.ReactNode; value: number }[]
  maxLegend?: number
  fmt?: Fmt
}) {
  const wrap = React.useRef<HTMLDivElement>(null)
  const { tip, move, hide } = useTip(wrap)
  const [active, setActive] = React.useState<number | null>(null)
  const total = data.reduce((s, d) => s + d.value, 0)
  const shown = data.slice(0, maxLegend)
  const rest = data.slice(maxLegend)
  const restSum = rest.reduce((s, d) => s + d.value, 0)
  return (
    <div ref={wrap} className="relative flex flex-col gap-5">
      {/* legend grid */}
      <div className="grid grid-cols-2 gap-x-6 gap-y-3.5 @[420px]:grid-cols-4">
        {shown.map((d, i) => (
          <div
            key={i}
            className="flex flex-col gap-1"
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => setActive(null)}
          >
            <span className="flex items-center gap-2 text-sm">
              <Swatch color={CAT[i % CAT.length]} />
              <span className="min-w-0 truncate text-muted-foreground">{d.label}</span>
            </span>
            <b className="pl-[18px] text-base font-semibold tabular-nums text-foreground">{compact(d.value, fmt)}</b>
          </div>
        ))}
        {rest.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">+{rest.length} more</span>
            <b className="text-base font-semibold tabular-nums text-muted-foreground">{compact(restSum, fmt)}</b>
          </div>
        )}
      </div>
      {/* the bar */}
      <div className="flex h-4 w-full gap-[2px] overflow-hidden">
        {data.map((d, i) => (
          <div
            key={i}
            className={cn(
              "h-full min-w-[3px] [corner-shape:squircle] transition-opacity duration-200 first:rounded-l-[5px] last:rounded-r-[5px]"
            )}
            style={{
              flexGrow: d.value,
              flexBasis: 0,
              background: CAT[i % CAT.length],
              opacity: active === null || active === i ? 1 : 0.35,
            }}
            onPointerMove={(e) => { setActive(i); move(e, <TipRow color={CAT[i % CAT.length]} label={d.label} value={`${full(d.value, fmt)} · ${Math.round((d.value / total) * 100)}%`} />) }}
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => { setActive(null); hide() }}
          />
        ))}
      </div>
      <Tip tip={tip} />
    </div>
  )
}

// ---- 7 · FunnelChart: stage-to-stage conversion ----------------------------

/** A conversion funnel: each stage a column scaled to the top of funnel, with a
    light "loss" region carrying the drop from the prior stage, a % · count chip,
    and stage labels. Brand hue (re-skins with the client). */
export function FunnelChart({
  steps,
  summary,
  fmt,
  height = 288,
}: {
  steps: { label: React.ReactNode; value: number }[]
  summary?: { label: React.ReactNode; value: React.ReactNode }[]
  fmt?: Fmt
  height?: number
}) {
  const wrap = React.useRef<HTMLDivElement>(null)
  const { tip, move, hide } = useTip(wrap)
  const first = steps[0]?.value || 1
  // headroom: the tallest column reaches 82% of the plot so its floating chip
  // clears the top instead of colliding with the summary row above the plot.
  const scale = 0.82
  return (
    <div className="flex flex-col gap-5">
      {summary && summary.length > 0 && (
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          {summary.map((s, i) => (
            <div key={i} className="flex flex-col gap-1">
              <span className="text-xs font-medium text-muted-foreground">{s.label}</span>
              <span className="text-lg font-semibold tracking-[-0.01em] text-foreground">{s.value}</span>
            </div>
          ))}
        </div>
      )}
      <div ref={wrap} className="relative flex items-end gap-1.5 @[440px]:gap-2 @[520px]:gap-3" style={{ height }}>
        {steps.map((s, i) => {
          const prev = i === 0 ? s.value : steps[i - 1].value
          const solidH = (s.value / first) * 100 * scale
          const lossH = (prev / first) * 100 * scale
          const conv = prev > 0 ? (s.value / prev) * 100 : 0
          return (
            <div
              key={i}
              className="group relative flex h-full flex-1 items-end justify-center"
              onPointerMove={(e) =>
                move(
                  e,
                  <span className="flex flex-col gap-1">
                    <span className="mb-0.5 font-semibold text-foreground">{s.label}</span>
                    <TipRow color="var(--chart-brand)" label="Reached" value={full(s.value, fmt)} />
                    <span className="text-muted-foreground">{conv.toFixed(1)}% from previous</span>
                  </span>
                )
              }
              onPointerLeave={hide}
            >
              {/* loss region (from prior stage) */}
              <div className="absolute inset-x-1 bottom-0 rounded-t-[4px] [corner-shape:squircle] bg-[var(--chart-track)]" style={{ height: `${lossH}%` }} />
              {/* converted */}
              <div
                className="absolute inset-x-1 bottom-0 rounded-t-[4px] [corner-shape:squircle] transition-[height] duration-500 ease-out group-hover:opacity-90"
                style={{ height: `${Math.max(solidH, 1.2)}%`, background: "var(--chart-brand)" }}
              />
              {/* chip — floats just above the converted bar */}
              <div
                className="absolute left-1/2 -translate-x-1/2 rounded-lg [corner-shape:squircle] border border-border bg-popover px-2 py-1 text-center shadow-[var(--shadow-xs)] @max-[440px]:px-1.5 @max-[440px]:py-0.5"
                style={{ bottom: `calc(${solidH}% + 8px)` }}
              >
                <div className="text-xs font-semibold tabular-nums text-foreground @max-[440px]:text-[11px]">{conv.toFixed(conv >= 10 ? 1 : 2)}%</div>
                <div className="text-[11px] leading-tight tabular-nums text-muted-foreground @max-[440px]:hidden">{full(s.value, fmt)}</div>
              </div>
            </div>
          )
        })}
        <Tip tip={tip} />
      </div>
      {/* stage labels */}
      <div className="flex gap-1.5 @[440px]:gap-2 @[520px]:gap-3">
        {steps.map((s, i) => (
          <span key={i} className="flex-1 text-center text-xs leading-tight text-muted-foreground">
            <b className="font-semibold text-foreground">{i + 1}.</b> {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}

// ---- 8 · DistributionChart: a distribution with low / median / high markers -

/** A distribution (histogram) of thin pill columns forming a curve, with LOW /
    MEDIAN / HIGH annotation markers (pill + dashed leader) and min/median/max
    axis captions. Colour is a sequential brand ramp light→dark across the range,
    so it re-skins with the client (neutral by default). Great for salary /
    comp spreads, score distributions, anything with a low–median–high story. */
export function DistributionChart({
  data,
  low,
  median = {},
  high,
  range,
  fmt,
  height = 300,
}: {
  data: number[]
  low?: { marker?: string; caption?: React.ReactNode }
  median?: { index?: number; marker?: string; caption?: React.ReactNode }
  high?: { marker?: string; caption?: React.ReactNode }
  /** numeric [min,max] of the x-axis, so a hover can name the comp at that point */
  range?: [number, number]
  fmt?: Fmt
  height?: number
}) {
  const wrap = React.useRef<HTMLDivElement>(null)
  const { tip, move, hide } = useTip(wrap)
  const [active, setActive] = React.useState<number | null>(null)
  const n = data.length
  const max = Math.max(...data, 1)
  const argmax = data.reduce((bi, v, i) => (v > data[bi] ? i : bi), 0)
  const medianIdx = median.index ?? argmax
  const TOP = 46 // headroom above the plot for the marker pills

  const xOf = (i: number) => ((i + 0.5) / n) * 100
  const barH = (i: number) => Math.max((data[i] / max) * height, 6)
  const hueAt = (i: number) => `color-mix(in oklab, var(--chart-brand) ${(32 + 68 * (n <= 1 ? 1 : i / (n - 1))).toFixed(1)}%, var(--surface))`
  const valAt = (i: number) => (range ? range[0] + (i / (n - 1)) * (range[1] - range[0]) : null)

  const markers = [
    low && { kind: "low" as const, idx: 0, label: low.marker ?? "LOW", align: "left" as const },
    { kind: "median" as const, idx: medianIdx, label: median.marker ?? "MEDIAN", align: "center" as const },
    high && { kind: "high" as const, idx: n - 1, label: high.marker ?? "HIGH", align: "right" as const },
  ].filter(Boolean) as { kind: "low" | "median" | "high"; idx: number; label: string; align: "left" | "center" | "right" }[]

  return (
    <div className="flex flex-col">
      <div ref={wrap} className="relative" style={{ height: TOP + height }}>
        {/* gridlines */}
        {[0.22, 0.45, 0.68, 0.9].map((f) => (
          <div key={f} className="absolute inset-x-0 h-px bg-[var(--chart-grid)]" style={{ bottom: f * height }} />
        ))}
        {/* bars */}
        <div className="absolute inset-x-0 bottom-0 flex items-end gap-[2px]" style={{ height }}>
          {data.map((v, i) => (
            <div
              key={i}
              className="flex h-full flex-1 items-end justify-center"
              onPointerMove={(e) => { setActive(i); move(e, <TipRow color={hueAt(i)} label={valAt(i) != null ? "Total comp" : `Bucket ${i + 1}`} value={valAt(i) != null ? `≈ ${compact(valAt(i)!, fmt)}` : full(v)} />) }}
              onPointerEnter={() => setActive(i)}
              onPointerLeave={() => { setActive(null); hide() }}
            >
              <div
                className="w-full max-w-[14px] rounded-full transition-opacity duration-200"
                style={{ height: barH(i), background: hueAt(i), opacity: active === null || active === i ? 1 : 0.4 }}
              />
            </div>
          ))}
        </div>
        {/* dashed leader lines */}
        {markers.map((m) => {
          const barTopFromTop = TOP + (height - barH(m.idx))
          const color = m.kind === "median" ? "var(--neutral-500)" : "var(--neutral-400)"
          return (
            <div
              key={"l" + m.kind}
              className="absolute w-px -translate-x-1/2"
              style={{ left: `${xOf(m.idx)}%`, top: 26, height: Math.max(barTopFromTop - 26, 0), backgroundImage: `repeating-linear-gradient(to bottom, ${color} 0 4px, transparent 4px 8px)` }}
            />
          )
        })}
        {/* pills */}
        {markers.map((m) => (
          <div
            key={"p" + m.kind}
            className={cn(
              "absolute top-0 rounded-md [corner-shape:squircle] px-1.5 py-[3px] text-[11px] leading-none font-bold tracking-wide whitespace-nowrap",
              m.kind === "median" ? "bg-foreground text-background" : "bg-[var(--text-muted)] text-[var(--surface)]"
            )}
            style={{ left: `${xOf(m.idx)}%`, transform: m.align === "left" ? "translateX(-8px)" : m.align === "right" ? "translateX(calc(-100% + 8px))" : "translateX(-50%)" }}
          >
            {m.label}
          </div>
        ))}
        <Tip tip={tip} />
      </div>
      {/* axis captions */}
      {(low?.caption || median.caption || high?.caption) && (
        <div className="relative mt-3 h-5 text-xs">
          {low?.caption && <span className="absolute left-0 font-medium text-muted-foreground">{low.caption}</span>}
          {median.caption && (
            <span className="absolute -translate-x-1/2 font-semibold text-foreground" style={{ left: `${xOf(medianIdx)}%` }}>{median.caption}</span>
          )}
          {high?.caption && <span className="absolute right-0 font-medium text-muted-foreground">{high.caption}</span>}
        </div>
      )}
    </div>
  )
}

// ---- 9 · Meter + Gauge: a metric against a target --------------------------

const TONE: Record<string, string> = {
  brand: "var(--chart-brand)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--destructive)",
}
type Tone = keyof typeof TONE

/** A linear progress meter. The fill carries the value (brand by default, or a
    severity tone); the track is the quiet well. An optional `target` draws a
    tick, turning it into a bullet-style goal bar. */
export function Meter({
  label,
  value,
  max = 100,
  fmt,
  tone = "brand",
  target,
  showValue = true,
}: {
  label?: React.ReactNode
  value: number
  max?: number
  fmt?: Fmt
  tone?: Tone
  target?: number
  showValue?: boolean
}) {
  const pct = Math.max(0, Math.min(1, value / max))
  return (
    <div className="flex flex-col gap-2.5">
      {(label || showValue) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && <span className="text-sm font-medium text-muted-foreground">{label}</span>}
          {showValue && (
            <span className="text-sm tabular-nums text-foreground">
              <b className="font-semibold">{compact(value, fmt)}</b>
              <span className="text-muted-foreground"> / {compact(max, fmt)}</span>
            </span>
          )}
        </div>
      )}
      <div className="relative h-2.5 w-full rounded-full bg-[var(--chart-track)]">
        <div className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-500" style={{ width: `${pct * 100}%`, background: TONE[tone] }} />
        {target != null && (
          <div
            className="absolute inset-y-[-3px] w-[2px] rounded-full bg-foreground"
            style={{ left: `calc(${Math.max(0, Math.min(1, target / max)) * 100}% - 1px)` }}
            title={`Target ${compact(target, fmt)}`}
          />
        )}
      </div>
    </div>
  )
}

/** A radial 270° gauge: a track arc + a value arc, the percentage in the middle.
    Same severity tones as the meter. */
export function Gauge({
  label,
  value,
  max = 100,
  tone = "brand",
  size = 150,
}: {
  label?: React.ReactNode
  value: number
  max?: number
  tone?: Tone
  size?: number
}) {
  const pct = Math.max(0, Math.min(1, value / max))
  const r = 48
  const C = 2 * Math.PI * r
  const track = C * 0.75 // 270° sweep, gap at the bottom
  const val = track * pct
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120" width={size} height={size} style={{ transform: "rotate(135deg)" }} aria-hidden>
          <circle cx="60" cy="60" r={r} fill="none" stroke="var(--chart-track)" strokeWidth="12" strokeLinecap="round" strokeDasharray={`${track} ${C - track}`} />
          <circle cx="60" cy="60" r={r} fill="none" stroke={TONE[tone]} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${val} ${C - val}`} className="transition-[stroke-dasharray] duration-500" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-2xl leading-none font-semibold tracking-[-0.02em] text-foreground">{Math.round(pct * 100)}%</span>
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
        </div>
      </div>
    </div>
  )
}

// ---- 10 · MultiLineChart: several entities over time -----------------------

/** N distinct series over time in the categorical palette, with a legend and a
    hover crosshair that reads every series at the hovered x. */
export function MultiLineChart({
  series,
  labels,
  fmt,
  height = 220,
}: {
  series: { name: string; values: number[] }[]
  labels: string[]
  fmt?: Fmt
  height?: number
}) {
  const wrap = React.useRef<HTMLDivElement>(null)
  const { tip, move, hide } = useTip(wrap)
  const [hoverX, setHoverX] = React.useState<number | null>(null)
  const W = 640
  const H = height
  const padT = 10
  const padB = 6
  const max = Math.max(...series.flatMap((s) => s.values), 0)
  const ticks = niceTicks(max, 4)
  const top = ticks[ticks.length - 1]
  const n = labels.length
  const xOf = (i: number) => (n <= 1 ? W / 2 : (i / (n - 1)) * W)
  const yOf = (v: number) => padT + (1 - v / top) * (H - padT - padB)
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = wrap.current?.getBoundingClientRect()
    if (!r) return
    const i = Math.max(0, Math.min(n - 1, Math.round(((e.clientX - r.left) / r.width) * (n - 1))))
    setHoverX(i)
    move(
      e,
      <span className="flex flex-col gap-1">
        <span className="mb-0.5 font-semibold text-foreground">{labels[i]}</span>
        {series.map((s, si) => (
          <TipRow key={s.name} color={CAT[si % CAT.length]} label={s.name} value={full(s.values[i], fmt)} />
        ))}
      </span>
    )
  }
  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex gap-2.5">
        <div className="flex shrink-0 flex-col justify-between text-right text-xs tabular-nums text-muted-foreground" style={{ height: H, paddingTop: padT, paddingBottom: padB }}>
          {[...ticks].reverse().map((t) => (
            <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0 leading-none">{compact(t, fmt)}</span>
          ))}
        </div>
        <div ref={wrap} className="relative min-w-0 flex-1" onPointerMove={onMove} onPointerLeave={() => { setHoverX(null); hide() }}>
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" width="100%" height={H} className="overflow-visible">
            {ticks.map((t) => (
              <line key={t} x1="0" x2={W} y1={yOf(t)} y2={yOf(t)} stroke="var(--chart-grid)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            ))}
            {series.map((s, si) => (
              <path key={s.name} d={smoothPath(s.values.map((v, i) => [xOf(i), yOf(v)] as const))} fill="none" stroke={CAT[si % CAT.length]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            ))}
            {hoverX !== null && (
              <>
                <line x1={xOf(hoverX)} x2={xOf(hoverX)} y1={padT} y2={H - padB} stroke="var(--chart-axis)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
                {series.map((s, si) => (
                  <circle key={s.name} cx={xOf(hoverX)} cy={yOf(s.values[hoverX])} r="4" fill={CAT[si % CAT.length]} stroke="var(--surface)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                ))}
              </>
            )}
          </svg>
          <Tip tip={tip} />
        </div>
      </div>
      <div className="flex gap-2.5">
        <span className="shrink-0" style={{ width: `${String(compact(top, fmt)).length * 7 + 8}px` }} />
        <div className="flex min-w-0 flex-1 justify-between text-xs text-muted-foreground">
          {labels.map((l, i) => (
            <span key={i} className={cn(i === 0 && "text-left", i === labels.length - 1 && "text-right")}>{l}</span>
          ))}
        </div>
      </div>
      <Legend items={series.map((s, si) => ({ color: CAT[si % CAT.length], label: s.name, shape: "line" as const }))} />
    </div>
  )
}

// ---- 11 · StackedColumns: composition over time ----------------------------

/** Columns over a time/category axis, each split into stacked categorical
    segments (2px surface gaps). Hover a column for its full breakdown + total. */
export function StackedColumns({
  data,
  series,
  fmt,
  height = 220,
}: {
  data: { label: React.ReactNode; values: number[] }[]
  series: string[]
  fmt?: Fmt
  height?: number
}) {
  const wrap = React.useRef<HTMLDivElement>(null)
  const { tip, move, hide } = useTip(wrap)
  const totals = data.map((d) => d.values.reduce((a, b) => a + b, 0))
  const ticks = niceTicks(Math.max(...totals, 0))
  const top = ticks[ticks.length - 1]
  return (
    <div className="flex flex-col gap-3">
      <div ref={wrap} className="relative flex gap-2.5" style={{ height }}>
        <div className="flex w-9 shrink-0 flex-col justify-between py-[2px] text-right text-xs tabular-nums text-muted-foreground">
          {[...ticks].reverse().map((t) => (
            <span key={t} className="-translate-y-1/2 first:translate-y-0 last:translate-y-0 leading-none">{compact(t, fmt)}</span>
          ))}
        </div>
        <div className="relative flex-1">
          {ticks.map((t) => (
            <div key={t} className="absolute inset-x-0 h-px bg-[var(--chart-grid)]" style={{ bottom: `${(t / top) * 100}%` }} />
          ))}
          <div className="absolute inset-0 flex items-end justify-around gap-2">
            {data.map((d, i) => (
              <div
                key={i}
                className="flex h-full flex-1 items-end justify-center"
                onPointerMove={(e) =>
                  move(
                    e,
                    <span className="flex flex-col gap-1">
                      <span className="mb-0.5 font-semibold text-foreground">{d.label}</span>
                      {series.map((s, si) => (
                        <TipRow key={s} color={CAT[si % CAT.length]} label={s} value={full(d.values[si] ?? 0, fmt)} />
                      ))}
                      <span className="mt-0.5 flex items-center gap-2 border-t border-border pt-1 text-muted-foreground">
                        Total<b className="ml-auto font-semibold tabular-nums text-foreground">{full(totals[i], fmt)}</b>
                      </span>
                    </span>
                  )
                }
                onPointerLeave={hide}
              >
                <div className="flex h-full w-full max-w-[44px] flex-col-reverse gap-[2px]">
                  {d.values.map((v, si) => (
                    <div
                      key={si}
                      className="w-full [corner-shape:squircle] first:rounded-b-[4px] last:rounded-t-[4px]"
                      style={{ height: `${(v / top) * 100}%`, background: CAT[si % CAT.length] }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <Tip tip={tip} />
      </div>
      <div className="flex gap-2.5">
        <span className="w-9 shrink-0" />
        <div className="flex flex-1 justify-around gap-2">
          {data.map((d, i) => (
            <span key={i} className="flex-1 truncate text-center text-xs text-muted-foreground">{d.label}</span>
          ))}
        </div>
      </div>
      <Legend items={series.map((s, si) => ({ color: CAT[si % CAT.length], label: s }))} />
    </div>
  )
}

// ---- 12 · Heatmap: value on a grid -----------------------------------------

/** A row×col grid of cells shaded on the sequential brand ramp (light→dark =
    low→high). Great for activity (day×hour), cohort retention, correlation. */
export function Heatmap({
  rows,
  cols,
  data,
  fmt,
  max: maxProp,
}: {
  rows: string[]
  cols: string[]
  data: number[][]
  fmt?: Fmt
  max?: number
}) {
  const wrap = React.useRef<HTMLDivElement>(null)
  const { tip, move, hide } = useTip(wrap)
  const max = maxProp ?? Math.max(...data.flat(), 1)
  const hue = (v: number) => `color-mix(in oklab, var(--chart-brand) ${(10 + 85 * (v / max)).toFixed(1)}%, var(--surface))`
  return (
    <div ref={wrap} className="relative flex flex-col gap-4">
      <div className="grid gap-[3px]" style={{ gridTemplateColumns: `auto repeat(${cols.length}, minmax(0,1fr))` }}>
        <span />
        {cols.map((c) => (
          <span key={c} className="pb-0.5 text-center text-[11px] text-muted-foreground">{c}</span>
        ))}
        {rows.map((rlabel, r) => (
          <React.Fragment key={rlabel}>
            <span className="flex items-center justify-end pr-2 text-[11px] whitespace-nowrap text-muted-foreground">{rlabel}</span>
            {cols.map((clabel, c) => {
              const v = data[r]?.[c] ?? 0
              return (
                <div
                  key={clabel}
                  className="aspect-square rounded-[6px] [corner-shape:squircle] transition-transform duration-150 hover:scale-[1.08]"
                  style={{ background: hue(v) }}
                  onPointerMove={(e) => move(e, <TipRow color={hue(v)} label={`${rlabel} · ${clabel}`} value={full(v, fmt)} />)}
                  onPointerLeave={hide}
                />
              )
            })}
          </React.Fragment>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>Less</span>
        <span className="h-2.5 w-28 rounded-full" style={{ background: "linear-gradient(90deg, color-mix(in oklab, var(--chart-brand) 10%, var(--surface)), var(--chart-brand))" }} />
        <span>More</span>
      </div>
      <Tip tip={tip} />
    </div>
  )
}

// ---- shared: legend + smooth path ------------------------------------------

function Legend({
  items,
}: {
  items: { color: string; label: React.ReactNode; shape?: "dot" | "line"; dashed?: boolean }[]
}) {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
      {items.map((it, i) => (
        <span key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
          {it.dashed ? (
            <span className="inline-flex h-[3px] w-4 items-center gap-[3px]" aria-hidden>
              <span className="h-[3px] w-1 rounded-full" style={{ background: it.color }} />
              <span className="h-[3px] w-1 rounded-full" style={{ background: it.color }} />
            </span>
          ) : (
            <Swatch color={it.color} shape={it.shape} />
          )}
          {it.label}
        </span>
      ))}
    </div>
  )
}

/** Cardinal-spline smoothing through points → an SVG path. */
function smoothPath(pts: readonly (readonly [number, number])[]) {
  if (pts.length < 2) return pts.length ? `M${pts[0][0]},${pts[0][1]}` : ""
  const t = 0.18
  const d = [`M${pts[0][0]},${pts[0][1]}`]
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i]
    const p1 = pts[i]
    const p2 = pts[i + 1]
    const p3 = pts[i + 2] ?? p2
    const c1x = p1[0] + (p2[0] - p0[0]) * t
    const c1y = p1[1] + (p2[1] - p0[1]) * t
    const c2x = p2[0] - (p3[0] - p1[0]) * t
    const c2y = p2[1] - (p3[1] - p1[1]) * t
    d.push(`C${c1x.toFixed(2)},${c1y.toFixed(2)} ${c2x.toFixed(2)},${c2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`)
  }
  return d.join(" ")
}
