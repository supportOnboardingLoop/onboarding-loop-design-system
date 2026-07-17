import * as React from "react"

import { cn } from "@/lib/utils"

// The sidebar brand: a squircle mark (an initial or a small logo) + the product
// name. Shared so the Demo and the styleguide frame render the identical mark
// (change it once, both move). Layout lives in components/workspace.css (.ws-brand*).
type BrandMarkProps = {
  /** the mark contents — an initial letter or a small node */
  mark: React.ReactNode
  className?: string
  children: React.ReactNode
}

function BrandMark({ mark, className, children }: BrandMarkProps) {
  return (
    <div data-slot="brand-mark" className={cn("ws-brand", className)}>
      <span className="ws-brand__mark">{mark}</span>
      <span className="ws-brand__name">{children}</span>
    </div>
  )
}

export { BrandMark }
export type { BrandMarkProps }
