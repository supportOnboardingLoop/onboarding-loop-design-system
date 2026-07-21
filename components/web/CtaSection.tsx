/* ============================================================
   CtaSection (step 10) — the closing group (`.g-e2`, the LAST/floor section).
   Ported from protocol-stack/index.html (CTA markup 3690-3704; CSS 587-642). ONE
   registered <Section> (g-e2) holding the dark closing CTA band followed by the
   shared <Footer>. Both halves are their own reusable components now: the band is
   <CtaBand> (used standalone on the case study) and the footer is <Footer> (used
   standalone on every other page). Here they are the two halves of the closing
   group.

   As the last section in registration order it is the stage FLOOR (position
   relative), so nothing pins over it. The band's cube strip springs open→flush on
   entry via useCubeSpring, so it runs with `spring` here (inside the ScrollStage).
   Content comes from the manifest.
   ============================================================ */
import * as React from "react"

import { Section } from "@/components/web/ScrollStage"
import { CtaBand } from "@/components/web/CtaBand"
import { Footer } from "@/components/web/Footer"

export interface CtaSectionProps {
  headline: { before: string; mark: string; after: string }
  sub: string
  price: { was: string; now: string; save: string }
  cta: { href: string; label: string }
  reveal?: boolean
  /** which footer nav to render. "global" (System · Product · Service · View Demo
   *  + Terms · Privacy · support) now that the landing lives at /system on the
   *  global chrome; "landing" (numbered section links) is the legacy default. */
  footerVariant?: "landing" | "global"
}

export function CtaSection({ headline, sub, price, cta, reveal = false, footerVariant = "landing" }: CtaSectionProps) {
  return (
    <Section className="g-e2">
      {/* CLOSING CTA band — cube spread springs on entry (inside the stage) */}
      <CtaBand headline={headline} sub={sub} price={price} cta={cta} reveal={reveal} spring dock="final" />

      {/* FOOTER — the shared component; global variant on /system (route links) */}
      <Footer reveal={reveal} variant={footerVariant} />
    </Section>
  )
}
