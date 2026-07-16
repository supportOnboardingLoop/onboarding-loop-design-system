"use client"

import { Separator as SeparatorPrimitive } from "@base-ui/react/separator"

import { cn } from "@/lib/utils"

// The `--border` token is now the kit's translucent .08 hairline. `strong`
// switches to the crisp .14 edge for control/panel dividers.
function Separator({
  className,
  orientation = "horizontal",
  strong = false,
  ...props
}: SeparatorPrimitive.Props & { strong?: boolean }) {
  return (
    <SeparatorPrimitive
      data-slot="separator"
      orientation={orientation}
      className={cn(
        "shrink-0 data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch",
        strong ? "bg-border-strong" : "bg-border",
        className
      )}
      {...props}
    />
  )
}

export { Separator }
