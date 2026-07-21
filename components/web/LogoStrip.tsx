/* ============================================================
   LogoStrip — "Created from two decades of work…" + the logo wall.

   A subsection inside the hero group. Content (intro line + logos) comes in as
   props; per-logo optical heights live in web.css keyed by the img alt, exactly
   as the source did. One logo may carry a hand-drawn circle overlay (Google).
   ============================================================ */
import * as React from "react"
import { useRef } from "react"

import { cn } from "@/lib/utils"
import { useRevealUp } from "@/components/web/ScrollStage"

export interface LogoItem {
  src: string
  alt: string
  /** optional hand-drawn circle overlay src (the Google treatment) */
  circle?: string
}

export interface LogoStripProps {
  intro: string
  logos: LogoItem[]
  /** reveal-up on scroll into view; off in the static pass */
  reveal?: boolean
}

// reveal-up stagger for the logo items, matching the source's inline --d values
const ITEM_DELAY = [40, 80, 120, 160, 200, 240]

export function LogoStrip({ intro, logos, reveal = false }: LogoStripProps) {
  const root = useRef<HTMLElement>(null)
  // reveal the intro + logos as the strip scrolls into view (one-shot)
  useRevealUp(root, reveal)
  return (
    <section className="logostrip" data-bar="paper" data-dock="hero" ref={root}>
      <div className="wrap-lg">
        <p className={reveal ? "reveal-up" : undefined}>{intro}</p>
        <div className="logos">
          {logos.map((l, i) => (
            <span
              key={l.alt}
              className={cn("lg-item", l.circle && "lg-google", reveal && "reveal-up")}
              style={reveal ? ({ "--d": `${ITEM_DELAY[i] ?? 0}ms` } as React.CSSProperties) : undefined}
            >
              {l.circle && <img className="circle" src={l.circle} alt="" />}
              <img src={l.src} alt={l.alt} />
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
