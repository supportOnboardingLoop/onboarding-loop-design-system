"use client"

import * as React from "react"
import { Popover } from "@base-ui/react/popover"

import { cn } from "@/lib/utils"
import { Icon } from "../base/icon"
import { Input } from "../base/input"

// ============================================================
// The solid-color picker. A control-family dropdown: the trigger is the SAME
// secondary-button shell as <SelectTrigger> (--ctl-face gradient + edge, accent
// ring + flipped chevron when open) carrying a swatch and the current hex; the
// popup is the SAME shadow-pop surface as every other dropdown.
//
// Deliberately solid-only: no gradient/image tabs, no eyedropper, no alpha, no
// saved swatches. Just a saturation/value field, a hue rail, and the hex field,
// which lives HERE rather than beside the trigger so one control owns the color.
//
// LEGIBILITY GATE (`minContrast`) — the picked color is used as a fill under
// WHITE text (--primary-foreground), so colors that are too light are unusable.
// The gate is on relative LUMINANCE, not on the value axis: #0000ff and #ffff00
// sit at the identical HSV value, yet score 8.6:1 and 1.1:1 against white. A cap
// on the V slider would therefore block good blues and still allow bad yellows.
// Luminance makes the boundary hue-dependent, so it barely clips the blues and
// cuts deep into the yellows. The out-of-range region is scrimmed rather than
// hidden, and dragging into it rides the boundary instead of stopping dead.
// ============================================================

type HSV = { h: number; s: number; v: number }

const HEX6 = /^#([0-9a-f]{6})$/i
const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

function hsvToRgb({ h, s, v }: HSV): number[] {
  const c = v * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = v - c
  const [r, g, b] = [
    [c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x],
  ][Math.floor(h / 60) % 6]
  return [r + m, g + m, b + m]
}

function hsvToHex(hsv: HSV): string {
  const to = (n: number) => Math.round(n * 255).toString(16).padStart(2, "0")
  const [r, g, b] = hsvToRgb(hsv)
  return `#${to(r)}${to(g)}${to(b)}`
}

function hexToHsv(hex: string): HSV {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  let h = 0
  if (d !== 0) {
    const raw = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
    h = (raw * 60 + 360) % 360
  }
  return { h, s: max === 0 ? 0 : d / max, v: max }
}

/** WCAG contrast of a color against white text sitting on top of it. `quantize`
 *  measures the 8-bit color that will actually ship, since rounding to hex can
 *  nudge a borderline pick just over the line. */
function contrastOnWhite(hsv: HSV, quantize = false): number {
  const [r, g, b] = hsvToRgb(hsv)
    .map((c) => (quantize ? Math.round(c * 255) / 255 : c))
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4))
  return 1.05 / (0.2126 * r + 0.7152 * g + 0.0722 * b + 0.05)
}

/** the lightest V still legible at this hue+saturation; contrast falls as V rises,
 *  so the crossing point is a clean binary search (1 = no limit at all here) */
function maxValue(h: number, s: number, minContrast: number): number {
  if (contrastOnWhite({ h, s, v: 1 }, true) >= minContrast) return 1
  let lo = 0
  let hi = 1
  for (let i = 0; i < 20; i++) {
    const mid = (lo + hi) / 2
    if (contrastOnWhite({ h, s, v: mid }, true) >= minContrast) lo = mid
    else hi = mid
  }
  return lo
}

/** drag anywhere on a rail/field: pointer capture + normalized 0..1 coordinates */
function useDrag(onMove: (x: number, y: number) => void) {
  const ref = React.useRef<HTMLDivElement>(null)
  const dragging = React.useRef(false)
  const emit = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    onMove(clamp01((e.clientX - r.left) / r.width), clamp01((e.clientY - r.top) / r.height))
  }
  return {
    ref,
    onPointerDown: (e: React.PointerEvent) => {
      dragging.current = true
      e.currentTarget.setPointerCapture(e.pointerId)
      emit(e)
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (dragging.current) emit(e)
    },
    onPointerUp: (e: React.PointerEvent) => {
      dragging.current = false
      e.currentTarget.releasePointerCapture(e.pointerId)
    },
  }
}

type ColorPickerProps = {
  /** the current color as #rrggbb; anything invalid falls back to `fallback` */
  value?: string
  onValueChange?: (hex: string) => void
  /** shown on the trigger when `value` is empty (e.g. the inherited brand color) */
  fallback?: string
  /** trigger label when there is no explicit value yet */
  placeholder?: string
  /** minimum contrast the color must hold against white text sitting on it.
   *  2.5 keeps every shipped brand valid while ruling out white, pale tints,
   *  yellows and cyans; 3 is the WCAG floor for UI, 4.5 for normal text. */
  minContrast?: number
  className?: string
  /** extra classes for the Positioner (higher z inside another fixed layer) */
  positionerClassName?: string
}

function ColorPicker({
  value = "",
  onValueChange,
  fallback = "#737373",
  placeholder = "Pick a color",
  minContrast = 2.5,
  className,
  positionerClassName,
}: ColorPickerProps) {
  const resolved = HEX6.test(value) ? value : fallback
  // HSV is held locally so dragging into black or grey doesn't throw away the
  // hue (every dark color is #000 in hex). It re-syncs only when the incoming
  // value is genuinely a different color, e.g. a named brand was chosen.
  const [hsv, setHsv] = React.useState<HSV>(() => hexToHsv(resolved))
  React.useEffect(() => {
    if (resolved.toLowerCase() !== hsvToHex(hsv).toLowerCase()) setHsv(hexToHsv(resolved))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolved])

  // the hex field keeps its own draft so a half-typed value isn't fought by
  // state. The popup is portalled, so closing it unmounts the field WITHOUT a
  // blur; the draft is therefore cleared on close, otherwise reopening would
  // show whatever was last typed instead of the color actually in force.
  const [draft, setDraft] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState(false)

  // every path into the color goes through here, so the legibility gate holds
  // for dragging, for hue changes that make the current V too light, and for
  // typed hex alike. Nothing can set an illegible color.
  const clamp = (next: HSV): HSV => ({ ...next, v: Math.min(next.v, maxValue(next.h, next.s, minContrast)) })

  const commit = (next: HSV) => {
    const gated = clamp(next)
    setHsv(gated)
    setDraft(null)
    onValueChange?.(hsvToHex(gated))
  }

  const field = useDrag((x, y) => commit({ ...hsv, s: x, v: 1 - y }))
  const rail = useDrag((x) => commit({ ...hsv, h: x * 360 }))

  const hueHex = hsvToHex({ h: hsv.h, s: 1, v: 1 })

  // the out-of-range region, traced across the field as a percentage polygon.
  // Recomputed per hue: a shallow wedge over the washed-out blues, a deep band
  // over the yellows. `clip` masks the veil, `line` draws the boundary hairline.
  const limit = React.useMemo(() => {
    const STEPS = 40
    const pts: { x: number; y: number }[] = []
    for (let i = STEPS; i >= 0; i--) {
      const s = i / STEPS
      pts.push({ x: s * 100, y: (1 - maxValue(hsv.h, s, minContrast)) * 100 })
    }
    const n = (v: number) => v.toFixed(2)
    return {
      clip: `polygon(0% 0%, 100% 0%, ${pts.map((p) => `${n(p.x)}% ${n(p.y)}%`).join(", ")})`,
      line: `M${pts.map((p) => `${n(p.x)},${n(p.y)}`).join(" L")}`,
      empty: pts.every((p) => p.y <= 0.01),
    }
  }, [hsv.h, minContrast])

  return (
    <Popover.Root open={open} onOpenChange={(next) => { setOpen(next); if (!next) setDraft(null) }}>
      <Popover.Trigger
        data-slot="color-picker-trigger"
        className={cn(
          // identical shell to <SelectTrigger> so the two stack as one family
          "group/trigger bp-chev-host flex h-[34px] w-full items-center gap-2 rounded-lg border border-[var(--ctl-line)] bg-[linear-gradient(180deg,var(--ctl-face),var(--ctl-face-2))] px-3.5 text-base font-medium whitespace-nowrap text-[var(--ctl-ink)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] outline-none transition-[border-color,box-shadow,background]",
          "hover:border-[var(--ctl-line-hover)] hover:bg-[linear-gradient(180deg,var(--ctl-face),var(--ctl-face-hover))]",
          "data-[popup-open]:border-primary data-[popup-open]:shadow-[0_0_0_3px_var(--accent-tint)]",
          className
        )}
      >
        <span
          aria-hidden
          className="size-4 shrink-0 rounded-full [corner-shape:round] ring-1 ring-black/10 ring-inset"
          style={{ background: resolved }}
        />
        <span className="min-w-0 flex-1 truncate text-left">
          {HEX6.test(value) ? value.toUpperCase() : placeholder}
        </span>
        <span className="ml-auto flex shrink-0 text-muted-foreground transition-transform duration-200 group-data-[popup-open]/trigger:rotate-180">
          <Icon name="chevron-down" size={18} className="bp-chev" />
        </span>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Positioner
          side="bottom"
          align="start"
          sideOffset={6}
          className={cn("z-[60] outline-none", positionerClassName)}
        >
          <Popover.Popup
            data-slot="color-picker-content"
            className={cn(
              "w-[var(--anchor-width)] min-w-[212px] origin-[var(--transform-origin)] rounded-[var(--ctl-radius)] [corner-shape:squircle] border border-border-strong bg-popover p-2.5 text-popover-foreground shadow-card outline-none",
              "transition-[transform,opacity] data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0"
            )}
          >
            {/* saturation (x) x value (y), over the pure hue */}
            <div
              ref={field.ref}
              onPointerDown={field.onPointerDown}
              onPointerMove={field.onPointerMove}
              onPointerUp={field.onPointerUp}
              data-slot="color-picker-field"
              role="application"
              aria-label="Saturation and brightness"
              className="relative h-[132px] w-full cursor-crosshair touch-none rounded-lg [corner-shape:squircle] ring-1 ring-black/10 ring-inset"
              style={{
                background: `linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, ${hueHex})`,
              }}
            >
              {/* the too-light zone. Veiled in the popup's own surface color (so it
                  recedes in light AND dark) plus a hatch, because up here the colors
                  are already near-white and a veil alone would read as a blank hole
                  rather than something deliberately unavailable. Clipped by its own
                  wrapper so the field keeps its squircle and the knob stays free. */}
              {!limit.empty && (
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg [corner-shape:squircle]">
                  <div
                    className="absolute inset-0"
                    style={{
                      clipPath: limit.clip,
                      backgroundColor: "color-mix(in srgb, var(--popover) 62%, transparent)",
                      backgroundImage:
                        "repeating-linear-gradient(45deg, transparent 0 5px, color-mix(in srgb, var(--muted-foreground) 38%, transparent) 5px 6px)",
                    }}
                  />
                  <svg
                    data-slot="color-picker-limit"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full"
                  >
                    <path
                      d={limit.line}
                      fill="none"
                      stroke="var(--border-strong)"
                      strokeWidth="1"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                </div>
              )}
              <span
                aria-hidden
                className="pointer-events-none absolute size-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full [corner-shape:round] border-2 border-white shadow-[0_1px_3px_rgba(0,0,0,0.4)]"
                style={{ left: `${hsv.s * 100}%`, top: `${(1 - hsv.v) * 100}%`, background: hsvToHex(hsv) }}
              />
            </div>

            {/* hue rail — the slider knob metrics, scaled to the rail */}
            <div
              ref={rail.ref}
              onPointerDown={rail.onPointerDown}
              onPointerMove={rail.onPointerMove}
              onPointerUp={rail.onPointerUp}
              data-slot="color-picker-hue"
              role="application"
              aria-label="Hue"
              className="relative mt-2.5 h-3.5 w-full cursor-pointer touch-none rounded-full [corner-shape:round]"
              style={{
                background:
                  "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
              }}
            >
              <span
                aria-hidden
                className="pointer-events-none absolute top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2 rounded-full [corner-shape:round] border-2 border-white shadow-[0_1px_3px_rgba(0,0,0,0.35)]"
                style={{ left: `${(hsv.h / 360) * 100}%`, background: hueHex }}
              />
            </div>

            {/* the hex field lives inside the picker, not beside the trigger. A
                too-light hex snaps to the boundary rather than being rejected, so
                the knob visibly lands on the darkest legible version of it. */}
            <Input
              value={draft ?? hsvToHex(hsv).toUpperCase()}
              onChange={(e) => {
                const typed = e.target.value
                setDraft(typed)
                const norm = typed.startsWith("#") ? typed : `#${typed}`
                if (!HEX6.test(norm)) return
                const gated = clamp(hexToHsv(norm))
                const out = hsvToHex(gated)
                setHsv(gated)
                // snapped? drop the draft so the field shows what was actually taken
                if (out.toLowerCase() !== norm.toLowerCase()) setDraft(null)
                onValueChange?.(out)
              }}
              onBlur={() => setDraft(null)}
              spellCheck={false}
              aria-label="Hex color"
              className="mt-2.5 h-8 px-2.5 text-sm"
            />
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  )
}

export { ColorPicker, hexToHsv, hsvToHex, contrastOnWhite, maxValue }
export type { ColorPickerProps }
