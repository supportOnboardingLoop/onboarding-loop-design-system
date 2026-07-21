/* ============================================================
   HeroSection — the hero scroll group (.g-hero): the hero content + the logo
   strip, which pin and scroll together as one unit.

   It is a section: it registers with the ScrollStage (via <Section>) and owns
   the two subsections (Hero, LogoStrip). In the motion pass it will also drive
   the blueprint shapes' scroll drift from the stage's per-frame signal (reading
   scrollY from the stage, never from window inside a subsection) and write
   --sx / --sr / --so onto the shape nodes it holds refs to.
   ============================================================ */
import * as React from "react"
import { useRef } from "react"

import { Section, useStageScroll } from "@/components/web/ScrollStage"
import { Hero, type HeroProps } from "@/components/web/Hero"
import { LogoStrip, type LogoStripProps } from "@/components/web/LogoStrip"

export interface HeroSectionProps extends Omit<HeroProps, "leftShapeRef" | "rightShapeRef"> {
  logoStrip: LogoStripProps
}

// Shape-drift constants, verbatim from the source: the shapes slide DIST and
// tilt ROT as you scroll off the top, fading linearly, reversing on the way up.
const DIST = 320
const ROT = 30
// back-in easing: winds up slightly negative near the start, lands exactly at 1
// so the full leave distance is preserved (the little anticipation bounce).
const easeInBack = (x: number) => {
  const s = 1.3
  return (s + 1) * x * x * x - s * x * x
}

export function HeroSection({ logoStrip, reveal, ...hero }: HeroSectionProps) {
  const leftShape = useRef<HTMLDivElement>(null)
  const rightShape = useRef<HTMLDivElement>(null)

  // Blueprint shapes drift out as the page scrolls off the top: the left one
  // slides + tilts left, the right one right, both fading, reversing on the way
  // back up (recomputed live). scrollY comes from the stage's per-frame signal,
  // not from window inside this component; the stage stays silent under reduced
  // motion, so at rest --sx/--sr/--so keep their CSS defaults (0 / 0deg / 1).
  useStageScroll(({ scrollY, vh }) => {
    const p = Math.min(1, Math.max(0, scrollY / (vh * 0.7)))
    const pe = easeInBack(p) // eased driver for the transform (with wind-up)
    const op = (1 - p).toFixed(3) // linear fade tracks raw scroll
    const l = leftShape.current
    const r = rightShape.current
    if (l) {
      l.style.setProperty("--sx", (-pe * DIST).toFixed(2) + "px")
      l.style.setProperty("--sr", (-pe * ROT).toFixed(2) + "deg")
      l.style.setProperty("--so", op)
    }
    if (r) {
      r.style.setProperty("--sx", (pe * DIST).toFixed(2) + "px")
      r.style.setProperty("--sr", (pe * ROT).toFixed(2) + "deg")
      r.style.setProperty("--so", op)
    }
  })

  return (
    <Section className="g-hero">
      <Hero {...hero} reveal={reveal} leftShapeRef={leftShape} rightShapeRef={rightShape} />
      <LogoStrip {...logoStrip} reveal={reveal} />
    </Section>
  )
}
