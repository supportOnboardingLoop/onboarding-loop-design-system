/* ============================================================
   CtaBand — the dark closing CTA band: a Feijoa headline with the gold marker,
   a sub, the 4-cube spread strip, the was/now/save price, and the inverted
   (white) CTA button. Presentational + standalone (no footer, no ScrollStage), so
   it drops onto any page; the landing composes it inside its closing scroll group
   (CtaSection) and a standard page (the case study) renders it inline.

   Ported from protocol-stack (CTA markup + CSS 587-642, reused from the landing
   in web.css step 10). The cube strip only springs open->flush while `spring`
   (the landing, driven by useCubeSpring off the ScrollStage frame); off it, the
   cubes rest flush (--s=0), matching the source's static case-study CTA. The
   button reuses the DS <Cta> flipped to the inverted palette via `.ol-cta--inv`.
   ============================================================ */
import * as React from "react"
import { useRef } from "react"

import { cn } from "@/lib/utils"
import { useRevealUp } from "@/components/web/ScrollStage"
import { Cta } from "@/components/web/Cta"
import { useCubeSpring } from "@/components/web/useCubeSpring"

export interface CtaBandProps {
  headline: { before: string; mark: string; after: string }
  sub: string
  price: { was: string; now: string; save: string }
  cta: { href: string; label: string }
  reveal?: boolean
  /** run the cube-spread spring (landing, inside a ScrollStage); off = flush. */
  spring?: boolean
  /** decorative data-dock passthrough (the landing tags its floor group "final"). */
  dock?: string
}

export function CtaBand({ headline, sub, price, cta, reveal = false, spring = false, dock }: CtaBandProps) {
  const ctaRef = useRef<HTMLElement>(null)
  const cubesRef = useRef<HTMLDivElement>(null)
  useRevealUp(ctaRef, reveal)
  useCubeSpring(cubesRef, spring)

  const d = (ms: number) => (reveal ? ({ "--d": `${ms}ms` } as React.CSSProperties) : undefined)

  return (
    <section className="cta" data-bar="dark" data-dock={dock} ref={ctaRef}>
      <div className="cta-in">
        <h2 className={cn(reveal && "reveal-up")}>
          {headline.before}
          <span className="mark">{headline.mark}</span>
          {headline.after}
        </h2>
        <p className={cn("cta-sub", reveal && "reveal-up")} style={d(60)}>
          {sub}
        </p>
        <div className={cn("cta-boxes cta-cubes", reveal && "reveal-up")} style={d(120)} aria-hidden="true" ref={cubesRef}>
          <span className="cube" />
          <span className="cube" />
          <span className="cube" />
          <span className="cube" />
        </div>
        <div className={cn("cta-price", reveal && "reveal-up")} style={d(180)}>
          <span className="was">{price.was}</span>
          <span className="now">{price.now}</span>
          <span className="save">{price.save}</span>
        </div>
        <Cta href={cta.href} className={cn("ol-cta--inv", reveal && "reveal-up")} style={d(240)}>
          {cta.label}
        </Cta>
      </div>
    </section>
  )
}
