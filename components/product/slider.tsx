import * as React from "react"

import { cn } from "@/lib/utils"

// Ported from the kit (kit/widgets.css .bp-slider + widgets.js): a draggable
// rail. Sentiment mode colours red -> green and rides an emoji knob; plain mode
// uses the brand accent, no emoji, and shows an optional reading line for the
// current value. Emits 0-100 on change.
const STOPS: [number, string, string][] = [
  [0.2, "#d92d20", "☹️"],
  [0.4, "#dc6803", "😕"],
  [0.6, "#eab308", "😐"],
  [0.8, "#17b26a", "🙂"],
  [1.01, "#067647", "🤗"],
]
const stopFor = (v: number) => STOPS.find((s) => v <= s[0]) ?? STOPS[STOPS.length - 1]
const clamp = (v: number) => Math.max(0, Math.min(100, v))

type SliderProps = Omit<React.ComponentProps<"div">, "onChange" | "defaultValue"> & {
  plain?: boolean
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  /** plain mode only: the reading label under the rail for the current value */
  readFor?: (value: number) => React.ReactNode
}

function Slider({ plain = false, value, defaultValue = 50, onValueChange, readFor, className, ...props }: SliderProps) {
  const [internal, setInternal] = React.useState(defaultValue)
  const current = value !== undefined ? value : internal
  const railRef = React.useRef<HTMLDivElement>(null)
  const dragging = React.useRef(false)

  const set = (v: number) => {
    const next = clamp(Math.round(v))
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }
  const fromClientX = (clientX: number) => {
    const rail = railRef.current
    if (!rail) return
    const r = rail.getBoundingClientRect()
    set(((clientX - r.left) / r.width) * 100)
  }
  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    fromClientX(e.clientX)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragging.current) fromClientX(e.clientX)
  }
  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false
    e.currentTarget.releasePointerCapture(e.pointerId)
  }

  const stop = stopFor(current / 100)
  const color = plain ? "var(--primary)" : stop[1]
  const emoji = plain ? "" : stop[2]

  return (
    <div data-slot="slider" className={cn("flex w-full flex-col gap-1", className)} {...props}>
      <div
        ref={railRef}
        className="relative h-[34px] cursor-pointer touch-none"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#e9eaeb] dark:bg-white/12" />
        <div
          className="absolute top-1/2 left-0 h-1.5 -translate-y-1/2 rounded-full transition-[width,background] duration-75"
          style={{ width: `${current}%`, background: color }}
        />
        <div
          className="absolute top-1/2 grid size-[34px] -translate-x-1/2 -translate-y-1/2 cursor-grab place-items-center rounded-full [corner-shape:round] bg-white text-lg leading-none shadow-pop transition-[left] duration-75 active:cursor-grabbing"
          style={{ left: `${current}%` }}
        >
          {emoji}
        </div>
      </div>
      {plain && readFor && (
        <div className="mt-2 text-center text-sm leading-[18px] font-semibold text-primary">{readFor(current)}</div>
      )}
    </div>
  )
}

export { Slider }
export type { SliderProps }
