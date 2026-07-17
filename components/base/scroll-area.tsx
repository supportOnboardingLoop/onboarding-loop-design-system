import * as React from "react"

import { cn } from "@/lib/utils"

// The DS scroll container — the canonical home of the ONE global scrollbar: a 2px
// thumb, transparent at rest, revealed ONLY while scrolling (styled in
// components/kit.css, driven by lib/scroll-reveal's installScrollReveal). It's just a
// native-overflow box: the treatment is global, so anywhere content overflows it
// applies automatically and most surfaces use `overflow-*` directly. Reach for
// <ScrollArea> when you want an explicit, self-contained scroll box (a fixed-size
// panel, a menu, the styleguide's Scroll-area showcase).
type ScrollAreaProps = React.ComponentProps<"div"> & {
  /** which axis scrolls (default vertical) */
  orientation?: "vertical" | "horizontal" | "both"
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(function ScrollArea(
  { orientation = "vertical", className, children, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      data-slot="scroll-area"
      className={cn(
        "scroll-thin min-h-0",
        orientation === "horizontal"
          ? "overflow-x-auto overflow-y-hidden"
          : orientation === "both"
            ? "overflow-auto"
            : "overflow-y-auto overflow-x-hidden",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})

export { ScrollArea }
export type { ScrollAreaProps }
