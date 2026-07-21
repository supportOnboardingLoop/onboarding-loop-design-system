import * as React from "react"

import { cn } from "@/lib/utils"

/* ============================================================================
   SectionHeader — the label that sits OUTSIDE a Card, above the content it
   titles. The other half of the content-area treatment: a section header +
   description lives on the page grey; the content lives in Cards below it (a
   gray tray holding white surfaces). Shared so the styleguide's page sections
   and the Demo's content sections render the identical header — change it once,
   both move.

   Two placements:
     • "below"  (default) — title, then a description line under it. Used for the
                 styleguide's subsection / sub-subsection headers.
     • "inline" — title on the left, description truncating on the right of one
                 baseline row (the Demo's "Insights · what the AI found" row).

   `size` sets the title weight: "lg" for a top-level subsection, "md" for a
   nested one. `divider` draws the hairline underneath (the inline demo style).
   `action` is an optional right-hand cluster (buttons, a picker).
   ========================================================================== */
type SectionHeaderProps = React.ComponentProps<"div"> & {
  title: React.ReactNode
  description?: React.ReactNode
  size?: "lg" | "md"
  placement?: "below" | "inline"
  divider?: boolean
  action?: React.ReactNode
  /** heading element (defaults to h2) so pages keep a sane outline */
  as?: "h2" | "h3"
}

function SectionHeader({
  title,
  description,
  size = "md",
  placement = "below",
  divider = false,
  action,
  as: Heading = "h2",
  className,
  ...props
}: SectionHeaderProps) {
  const titleCls =
    size === "lg"
      ? "text-xl font-bold tracking-[-0.01em] text-foreground"
      : "text-md leading-6 font-semibold tracking-[-0.01em] text-foreground"

  if (placement === "inline") {
    return (
      <div
        data-slot="section-header"
        className={cn(
          "flex items-baseline justify-between gap-6 px-1",
          divider && "border-b border-border pb-3",
          className
        )}
        {...props}
      >
        <Heading className={cn("shrink-0", titleCls)}>{title}</Heading>
        {description && <p className="truncate text-sm text-muted-foreground">{description}</p>}
        {action && <div className="ml-auto flex shrink-0 items-center gap-2">{action}</div>}
      </div>
    )
  }

  return (
    <div
      data-slot="section-header"
      className={cn(divider && "border-b border-border pb-3", className)}
      {...props}
    >
      <div className="flex items-baseline justify-between gap-6">
        <Heading className={titleCls}>{title}</Heading>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </div>
      {description && (
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{description}</p>
      )}
    </div>
  )
}

export { SectionHeader }
export type { SectionHeaderProps }
