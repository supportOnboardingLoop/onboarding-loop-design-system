/* ============================================================
   useCubeSpring — the closing/stack CTA cube spread, a damped spring.

   Verbatim port of the vanilla driver (protocol-stack/index.html ~4289): four
   tiles start a full cube-width apart (--s=1) and lock flush (--s=0) as the row
   reaches the viewport centre, reversing on scroll-up. K/DAMP are underdamped so
   --s overshoots past "locked" and settles back — the little bounce. Only spreads
   on the way IN: once the row passes centre, target is 0 and stays 0 as you keep
   scrolling down.

   Wired the DS way: the target is recomputed from the row's OWN live rect
   (section-relative, no window.scrollY) on each stage frame; an independent rAF
   spring settles the overshoot between scroll events (the stage only signals on
   scroll/resize). Silent under reduced motion — the stage never fires, so --s
   rests at 0 and the CSS `@media(reduce){.cube{transform:none}}` keeps the cubes
   flush regardless.
   ============================================================ */
import * as React from "react"
import { useEffect, useRef } from "react"

import { useStageScroll } from "@/components/web/ScrollStage"

const K = 140 // stiffness
const DAMP = 15 // damping — ~1 overshoot (underdamped)

export function useCubeSpring(ref: React.RefObject<HTMLElement | null>, enabled = true) {
  const st = useRef({ s: 0, v: 0, tgt: 0, raf: 0, last: 0 })
  const kickRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    // Disabled (e.g. a standalone page with no ScrollStage to signal scroll): the
    // cubes rest flush (--s = 0), matching the source's static case-study CTA.
    if (!enabled) {
      ref.current?.style.setProperty("--s", "0")
      return
    }
    const s = st.current

    // target spread 0..1 from live geometry: signed offset of the row's centre
    // from the viewport centre. >0 while still BELOW the middle (entering), 0 once
    // it has reached/passed the middle.
    const target = () => {
      const el = ref.current
      if (!el) return 0
      const r = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      const signed = r.top + r.height / 2 - vh / 2
      if (signed <= 0) return 0
      const t = signed / (vh * 0.5)
      return t > 1 ? 1 : t
    }

    const frame = (ts: number) => {
      const dt = s.last ? Math.min(0.032, (ts - s.last) / 1000) : 0.016
      s.last = ts
      s.v += (K * (s.tgt - s.s) - DAMP * s.v) * dt
      s.s += s.v * dt
      ref.current?.style.setProperty("--s", s.s.toFixed(4))
      if (Math.abs(s.tgt - s.s) > 0.0004 || Math.abs(s.v) > 0.0004) {
        s.raf = requestAnimationFrame(frame)
      } else {
        s.s = s.tgt
        ref.current?.style.setProperty("--s", s.s.toFixed(4))
        s.raf = 0
        s.last = 0
      }
    }

    kickRef.current = () => {
      s.tgt = target()
      if (!s.raf) {
        s.last = 0
        s.raf = requestAnimationFrame(frame)
      }
    }

    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) {
      ref.current?.style.setProperty("--s", "0")
      return
    }
    // seed s at the current target so it doesn't jump on the first frame, then kick
    s.s = target()
    s.tgt = s.s
    ref.current?.style.setProperty("--s", s.s.toFixed(4))
    kickRef.current()

    return () => {
      if (s.raf) cancelAnimationFrame(s.raf)
      s.raf = 0
      kickRef.current = null
    }
  }, [ref, enabled])

  // the stage's per-frame signal (scroll/resize) → recompute target + run spring
  useStageScroll(() => {
    kickRef.current?.()
  })
}
