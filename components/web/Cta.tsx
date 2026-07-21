/* ============================================================
   Cta — the marketing "Get the Full Stack" button.

   It is the design system's primary Button (identical gradient formula) at the
   new `lg` tier, rendered as an anchor, with the draw-in reveal arrow. The web
   layer paints it in the marketing brand solid (#404040) via --primary and adds
   font-semibold (the vanilla .btn is 600; the DS button is 500). Shared by the
   top bar and the hero so the two stay in lockstep.
   ============================================================ */
import * as React from "react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/base/button"
import { Icon } from "@/components/base/icon"

export interface CtaProps {
  href?: string
  children?: React.ReactNode
  className?: string
  style?: React.CSSProperties
}

export function Cta({ href = "#stack", children = "Get the Full Stack", className, style }: CtaProps) {
  return (
    <a
      href={href}
      style={style}
      className={cn(buttonVariants({ variant: "primary" }), "ol-cta gap-0 font-semibold", className)}
    >
      {children}
      <span className="bp-reveal-slot bp-reveal-slot--trail">
        <Icon name="arrow-right" size={20} className="bp-reveal-ico" />
      </span>
    </a>
  )
}
