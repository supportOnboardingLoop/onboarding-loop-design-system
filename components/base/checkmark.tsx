import * as React from "react"

import { cn } from "@/lib/utils"

// The kit's shared checkmark glyph (kit/widgets.css .bp-checkmark). One data-URI
// tick, masked so it inherits whatever colour the element paints.
export const TICK_MASK =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M5 13l4 4L19 7' fill='none' stroke='black' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")"

function maskStyle(glyphPx: number): React.CSSProperties {
  return {
    WebkitMaskImage: TICK_MASK,
    maskImage: TICK_MASK,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskPosition: "center",
    maskPosition: "center",
    WebkitMaskSize: `${glyphPx}px ${glyphPx}px`,
    maskSize: `${glyphPx}px ${glyphPx}px`,
  }
}

// The "approve" mark: a real 50% circle (never squircled). Rests either as a
// filled accent disc with a knocked-out white tick, or — for the choice / menu
// reveal — as a hollow outline ring with a muted line tick that fills to the
// disc on select. Colour transitions are smooth so the outline -> filled swap
// doesn't flash.
function Checkmark({
  filled = true,
  size = 20,
  className,
  ...props
}: React.ComponentProps<"span"> & { filled?: boolean; size?: number }) {
  const glyph = Math.round(size * 0.6)
  return (
    <span
      data-slot="checkmark"
      aria-hidden="true"
      className={cn(
        "relative block shrink-0 rounded-full [corner-shape:round] transition-[background,box-shadow] duration-150",
        filled ? "bg-primary" : "bg-transparent shadow-[inset_0_0_0_1.5px_var(--border-strong)]",
        className
      )}
      style={{ width: size, height: size }}
      {...props}
    >
      <span
        className="absolute inset-0 transition-colors duration-150"
        style={{
          background: filled ? "var(--primary-foreground)" : "var(--muted-foreground)",
          ...maskStyle(glyph),
        }}
      />
    </span>
  )
}

export { Checkmark, maskStyle }
