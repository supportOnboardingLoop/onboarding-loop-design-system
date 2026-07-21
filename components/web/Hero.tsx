/* ============================================================
   Hero — the hero content subsection (badge · headline · trusted · sub · CTA),
   flanked by the two hand-drawn blueprint shapes.

   A subsection: it renders only its own markup and takes content as props. The
   scroll-driven shape drift is NOT computed here (a subsection must not read
   window.scrollY); the parent HeroSection drives the shapes through the refs
   handed down on leftShapeRef / rightShapeRef.
   ============================================================ */
import * as React from "react"

import { cn } from "@/lib/utils"
import { Cta } from "@/components/web/Cta"

export interface HeadlineParts {
  before: string
  /** the emphasised word, wrapped in the yellow marker */
  mark: string
  after: string
}

export interface HeroProps {
  badge: string
  headline: HeadlineParts
  trusted: string
  sub: string
  cta?: { href?: string; label?: string }
  /** the two blueprint shape image srcs (decorative hero chrome) */
  shapes?: { left: string; right: string }
  /** handed down by HeroSection so it can drive the scroll drift on these nodes */
  leftShapeRef?: React.Ref<HTMLDivElement>
  rightShapeRef?: React.Ref<HTMLDivElement>
  /** reveal-stagger delays (ms); omitted in the static pass, set in the motion pass */
  reveal?: boolean
}

const DEFAULT_SHAPES = { left: "/assets/blueprintShape_01.png", right: "/assets/blueprintShape_02.png" }

// reveal-in delays, matching the source's inline --d values
const D = { badge: 60, h1: 130, mark: 360, trusted: 300, sub: 380, cta: 460, shapeL: 240, shapeR: 360 }
// reveal delay as a style var, only when the reveal pass is on (no className here
// so the element keeps its own class; `reveal` is merged in via cn at the call site)
const d = (on: boolean, ms: number) => (on ? ({ "--d": `${ms}ms` } as React.CSSProperties) : undefined)

export function Hero({
  badge,
  headline,
  trusted,
  sub,
  cta,
  shapes = DEFAULT_SHAPES,
  leftShapeRef,
  rightShapeRef,
  reveal = false,
}: HeroProps) {
  return (
    <section className="hero" data-bar="white" data-dock="hero">
      <div className="hero-shape hs-1" aria-hidden="true" ref={leftShapeRef}>
        <img src={shapes.left} alt="" style={reveal ? ({ "--d": `${D.shapeL}ms` } as React.CSSProperties) : undefined} />
      </div>
      <div className="hero-shape hs-2" aria-hidden="true" ref={rightShapeRef}>
        <img src={shapes.right} alt="" style={reveal ? ({ "--d": `${D.shapeR}ms` } as React.CSSProperties) : undefined} />
      </div>
      <div className="hero-inner">
        <div className={cn("badge", reveal && "reveal")} style={d(reveal, D.badge)}>{badge}</div>
        <h1 className={reveal ? "reveal" : undefined} style={d(reveal, D.h1)}>
          {headline.before}
          <span className="mark" style={d(reveal, D.mark)}>{headline.mark}</span>
          {headline.after}
        </h1>
        <p className={cn("trusted", reveal && "reveal")} style={d(reveal, D.trusted)}>{trusted}</p>
        <p className={cn("sub", reveal && "reveal")} style={d(reveal, D.sub)}>{sub}</p>
        <Cta href={cta?.href} className={reveal ? "reveal" : undefined} style={d(reveal, D.cta)}>
          {cta?.label ?? "Get the Full Stack"}
        </Cta>
      </div>
    </section>
  )
}
