import * as React from "react"
import { Popover } from "@base-ui/react/popover"

import { cn } from "@/lib/utils"
import { Icon } from "../base/icon"
import { Button } from "../base/button"

// Ported from the kit (kit/calendar.js + calendar.css .bp-cal): a month grid
// with a selectable date RANGE. Two clicks set the range (order-independent);
// future dates (after `max`, default today) are disabled. Quick presets sit
// under the month header. Emits onValueChange({ start, end, preset }).
export type DateRange = { start: Date; end: Date }

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
const WD = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

const midnight = (d: Date) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
const addDays = (d: Date, n: number) => {
  const x = midnight(d)
  x.setDate(x.getDate() + n)
  return x
}
const key = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`

type CalendarProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  value?: DateRange
  defaultValue?: DateRange
  onValueChange?: (range: DateRange & { preset: string | null }) => void
  max?: Date
  presets?: boolean
}

function Calendar({ value, defaultValue, onValueChange, max: maxProp, presets = true, className, ...props }: CalendarProps) {
  const max = React.useMemo(() => midnight(maxProp ?? new Date()), [maxProp])
  const initial = value ??
    defaultValue ?? { start: addDays(max, -29), end: max }
  const [range, setRange] = React.useState<DateRange>(initial)
  const [view, setView] = React.useState(() => new Date(initial.end.getFullYear(), initial.end.getMonth(), 1))
  const phase = React.useRef(0)
  const current = value ?? range

  const commit = (next: DateRange, preset: string | null) => {
    if (value === undefined) setRange(next)
    onValueChange?.({ ...next, preset })
  }
  const applyPreset = (days: number, label: string) => {
    const next = { start: addDays(max, -(days - 1)), end: max }
    setView(new Date(next.end.getFullYear(), next.end.getMonth(), 1))
    phase.current = 0
    commit(next, label)
  }
  const pick = (d: Date) => {
    if (d > max) return
    let next: DateRange
    if (phase.current === 0) {
      next = { start: d, end: d }
      phase.current = 1
    } else {
      next = d < current.start ? { start: d, end: current.start } : { start: current.start, end: d }
      phase.current = 0
    }
    commit(next, null)
  }

  const y = view.getFullYear()
  const m = view.getMonth()
  const first = new Date(y, m, 1).getDay()
  const days = new Date(y, m + 1, 0).getDate()
  const prevDays = new Date(y, m, 0).getDate()
  const trail = (7 - ((first + days) % 7)) % 7

  type Cell = { day: number; date?: Date; muted?: boolean }
  const cells: Cell[] = []
  for (let i = 0; i < first; i++) cells.push({ day: prevDays - first + 1 + i, muted: true })
  for (let day = 1; day <= days; day++) cells.push({ day, date: midnight(new Date(y, m, day)) })
  for (let t = 1; t <= trail; t++) cells.push({ day: t, muted: true })

  return (
    <div data-slot="calendar" className={cn("w-[280px] select-none", className)} {...props}>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          aria-label="Previous month"
          onClick={() => setView(new Date(y, m - 1, 1))}
          className="grid size-8 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)] hover:text-foreground"
        >
          <Icon name="chevron-left" size={18} stroke={1.75} />
        </button>
        <span className="text-base font-semibold text-foreground">
          {MONTHS[m]} {y}
        </span>
        <button
          type="button"
          aria-label="Next month"
          onClick={() => setView(new Date(y, m + 1, 1))}
          className="grid size-8 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)] hover:text-foreground"
        >
          <Icon name="chevron-right" size={18} stroke={1.75} />
        </button>
      </div>

      {presets && (
        <div className="mb-2.5 flex gap-2">
          <Button variant="tertiary" size="sm" className="flex-1" onClick={() => applyPreset(30, "Last 30 days")}>Last 30 days</Button>
          <Button variant="tertiary" size="sm" className="flex-1" onClick={() => applyPreset(7, "Last 7 days")}>Last 7 days</Button>
        </div>
      )}

      <div className="grid grid-cols-7">
        {WD.map((d) => (
          <div key={d} className="grid h-[34px] place-items-center text-xs font-medium text-muted-foreground">{d}</div>
        ))}
        {cells.map((c, i) => {
          if (c.muted || !c.date) {
            return (
              <div key={i} className="grid h-[38px] place-items-center">
                <span className="pointer-events-none grid size-[34px] place-items-center rounded-full [corner-shape:round] text-[13px] text-muted-foreground opacity-45">{c.day}</span>
              </div>
            )
          }
          const d = c.date
          const isStart = key(d) === key(current.start)
          const isEnd = key(d) === key(current.end)
          const selected = isStart || isEnd
          const inSpan = d >= current.start && d <= current.end && key(current.start) !== key(current.end)
          const col = d.getDay()
          const disabled = d > max
          const today = key(d) === key(max)
          const rl = inSpan && (col === 0 || isStart)
          const rr = inSpan && (col === 6 || isEnd)
          return (
            <div
              key={i}
              className={cn(
                "grid h-[38px] place-items-center",
                inSpan && "bg-accent-tint",
                rl && "rounded-l-full",
                rr && "rounded-r-full"
              )}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={() => pick(d)}
                className={cn(
                  "relative grid size-[34px] place-items-center rounded-full [corner-shape:round] text-[13px] text-foreground transition-colors",
                  !disabled && !selected && "hover:bg-accent-tint",
                  selected && "bg-primary font-semibold text-primary-foreground",
                  today && !selected && "font-semibold",
                  disabled && "pointer-events-none text-muted-foreground opacity-35"
                )}
              >
                {c.day}
                {today && (
                  <span
                    className={cn(
                      "absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full [corner-shape:round]",
                      selected ? "bg-primary-foreground" : "bg-primary"
                    )}
                  />
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// The dropdown form: the kit's date-range picker (a dropdown trigger with a
// calendar leading icon opening the range Calendar in a shadow-pop popup).
const FMT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" })
function formatRange(r: DateRange) {
  const s = FMT.format(r.start)
  const e = FMT.format(r.end)
  const yr = r.end.getFullYear()
  return s === e ? `${s}, ${yr}` : `${s} – ${e}, ${yr}`
}

function DateRangePicker({
  defaultValue,
  max,
  className,
  placeholder = "Pick a range",
}: {
  defaultValue?: DateRange
  max?: Date
  className?: string
  placeholder?: string
}) {
  const [range, setRange] = React.useState<DateRange | undefined>(defaultValue)
  const [label, setLabel] = React.useState<string>(defaultValue ? formatRange(defaultValue) : placeholder)

  return (
    <Popover.Root>
      <Popover.Trigger
        data-slot="date-range-trigger"
        className={cn(
          "group/trigger flex h-[34px] w-full items-center gap-2 rounded-lg border border-[#dcdcdc] bg-[linear-gradient(180deg,#ffffff,#f7f7f7)] px-3.5 text-base font-medium text-[#26262a] shadow-[0_1px_2px_rgba(10,13,18,0.05)] outline-none transition-[border-color,box-shadow,background]",
          "hover:border-[#cfcfcf] hover:bg-[linear-gradient(180deg,#ffffff,#f1f1f1)]",
          "data-[popup-open]:border-primary data-[popup-open]:shadow-[0_0_0_3px_var(--accent-tint)]",
          className
        )}
      >
        <Icon name="calendar" size={18} className="shrink-0 text-muted-foreground" />
        <span className="min-w-0 flex-1 truncate text-left">{label}</span>
        <Icon name="chevron-down" size={18} className="shrink-0 text-muted-foreground transition-transform duration-200 group-data-[popup-open]/trigger:rotate-180" />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={6} align="start" className="isolate z-50 outline-none">
          <Popover.Popup className="origin-[var(--transform-origin)] rounded-xl border border-border-strong bg-popover p-4 shadow-pop outline-none transition-[transform,opacity] data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0">
            <Calendar
              value={range}
              max={max}
              onValueChange={(r) => {
                setRange({ start: r.start, end: r.end })
                setLabel(r.preset ?? formatRange(r))
              }}
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

export { Calendar, DateRangePicker }
export type { CalendarProps }
