import * as React from "react"

import { cn } from "@/lib/utils"

// Ported from the kit (kit/cta.css .bp-cta): layout only. A row of real Buttons
// stretched to share the width. `split` lets the quiet tiers (secondary /
// tertiary / ghost) hug their label while the primary takes the rest.
function CtaRow({
  className,
  split = false,
  ...props
}: React.ComponentProps<"div"> & { split?: boolean }) {
  return (
    <div
      data-slot="cta"
      className={cn(
        "flex w-full gap-2 [&>[data-slot=button]]:min-w-0 [&>[data-slot=button]]:flex-1",
        split &&
          "[&>[data-variant=ghost]]:flex-none [&>[data-variant=secondary]]:flex-none [&>[data-variant=tertiary]]:flex-none",
        className
      )}
      {...props}
    />
  )
}

export { CtaRow }
