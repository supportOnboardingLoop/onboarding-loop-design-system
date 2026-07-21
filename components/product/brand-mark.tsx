import * as React from "react"

import { cn } from "@/lib/utils"

// The sidebar brand: a squircle mark (an initial or a small logo) + the product
// name. Shared so the Demo and the styleguide frame render the identical mark
// (change it once, both move). Layout lives in components/workspace.css (.ws-brand*).
//
// A client build passes `logo` (a src under public/brand/): the logo replaces the
// letter mark in the square slot (where the "C" is), and the name text beside it
// becomes the client's name. Omit `logo` and the default letter-mark path renders
// unchanged (the public demo).
type BrandMarkProps = {
  /** the mark contents — an initial letter or a small node */
  mark: React.ReactNode
  /** optional client logomark src; when set, it replaces the letter in the mark slot */
  logo?: string
  className?: string
  children: React.ReactNode
}

function BrandMark({ mark, logo, className, children }: BrandMarkProps) {
  return (
    <div data-slot="brand-mark" className={cn("ws-brand", className)}>
      {logo ? (
        <img className="ws-brand__mark-logo" src={logo} alt="" />
      ) : (
        <span className="ws-brand__mark">{mark}</span>
      )}
      <span className="ws-brand__name">{children}</span>
    </div>
  )
}

export { BrandMark }
export type { BrandMarkProps }
