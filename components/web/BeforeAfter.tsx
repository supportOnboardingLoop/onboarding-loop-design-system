/* ============================================================
   BeforeAfter — the before/after comparison slider.

   Ported verbatim (behavior + geometry) from
   protocol-stack/case-study-corebee.html (CSS 149-197, JS 680-747). The After
   image sizes the frame in flow so the frame is always the image's exact aspect
   ratio — the whole image shows, never cropped. The Before image is clipped on
   top and revealed by a draggable handle that rides OUTSIDE the rounded clip; a
   dashed divider + corner plus-marks track the split, overshooting the frame.

   Interaction, all carried over unchanged, only ids -> refs:
     - mouse: click anywhere on the image jumps the split; drag the handle to
       scrub; a "magnet" leans the handle toward the cursor while it is over the
       image (full strength across it, easing off in a 120px margin) so it reads
       as grabbable. Mouse only; stands down while dragging / under reduced motion.
     - touch: the page keeps scrolling (touch-action: pan-y); the split only
       moves by dragging the handle itself.
     - keyboard: the handle is a role="slider"; Left/Right step 4 (Shift 10),
       Home/End jump to 0/100.

   Presentational styling lives in components/web/web.css (.ba*), scoped .ol-web.
   ============================================================ */
import * as React from "react"
import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

export interface BeforeAfterProps {
  before: { src: string; alt: string }
  after: { src: string; alt: string }
  beforeLabel?: string
  afterLabel?: string
  /** CSS aspect-ratio of the frame; must match the true image dims so the whole
   *  image shows and the bottom plus-mark sits on the frame's bottom edge. */
  aspect?: string
  ariaLabel?: string
  className?: string
  style?: React.CSSProperties
}

export function BeforeAfter({
  before,
  after,
  beforeLabel = "Before",
  afterLabel = "After",
  aspect = "3024 / 1722",
  ariaLabel,
  className,
  style,
}: BeforeAfterProps) {
  const baRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const ba = baRef.current
    const handle = handleRef.current
    if (!ba || !handle) return

    let pos = 50
    let dragging = false

    const set = (p: number) => {
      pos = Math.max(0, Math.min(100, p))
      ba.style.setProperty("--pos", pos + "%")
      handle.setAttribute("aria-valuenow", String(Math.round(pos)))
    }
    const clearMagnet = () => {
      handle.style.setProperty("--mx", "0px")
      handle.style.setProperty("--my", "0px")
    }
    const posFromEvent = (clientX: number) => {
      const r = ba.getBoundingClientRect()
      return ((clientX - r.left) / r.width) * 100
    }

    const onDown = (e: PointerEvent) => {
      // on touch, let the page scroll and drag only from the handle; mouse gets
      // click-anywhere-to-jump
      if (e.pointerType === "touch") return
      dragging = true
      clearMagnet()
      set(posFromEvent(e.clientX))
      e.preventDefault()
    }
    const onMove = (e: PointerEvent) => {
      if (dragging) set(posFromEvent(e.clientX))
    }
    const onUp = () => {
      dragging = false
    }

    ba.addEventListener("pointerdown", onDown)
    window.addEventListener("pointermove", onMove, { passive: true })
    window.addEventListener("pointerup", onUp)
    window.addEventListener("pointercancel", onUp)

    const onKey = (e: KeyboardEvent) => {
      const step = e.shiftKey ? 10 : 4
      if (e.key === "ArrowLeft") {
        set(pos - step)
        e.preventDefault()
      } else if (e.key === "ArrowRight") {
        set(pos + step)
        e.preventDefault()
      } else if (e.key === "Home") {
        set(0)
        e.preventDefault()
      } else if (e.key === "End") {
        set(100)
        e.preventDefault()
      }
    }
    handle.addEventListener("keydown", onKey)

    // don't let a click on the handle bubble into a "jump"
    const onHandleDown = (e: PointerEvent) => {
      e.stopPropagation()
      dragging = true
      clearMagnet()
      e.preventDefault()
      handle.focus()
    }
    handle.addEventListener("pointerdown", onHandleDown)

    // magnet: the handle leans toward the cursor whenever it's anywhere over the
    // image (full strength across the whole image, easing off in a margin just
    // outside it). Offset measured from the handle's resting position, capped so
    // it stays kissing the divider line. Mouse only; off while dragging / reduced.
    let magnetMove: ((e: PointerEvent) => void) | null = null
    const onBlur = clearMagnet
    if (!window.matchMedia("(prefers-reduced-motion:reduce)").matches) {
      const MAXX = 22,
        MAXY = 15,
        K = 0.6,
        MARGIN = 120
      let mpx = 0,
        mpy = 0,
        mpend = false
      const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v))
      const tick = () => {
        mpend = false
        if (dragging) {
          clearMagnet()
          return
        }
        const br = ba.getBoundingClientRect()
        const restX = br.left + (pos / 100) * br.width,
          restY = br.top + br.height / 2
        // distance the cursor sits OUTSIDE the image (0 while over it) -> ramp the
        // pull down past the edge
        const out = Math.hypot(
          Math.max(br.left - mpx, mpx - br.right, 0),
          Math.max(br.top - mpy, mpy - br.bottom, 0),
        )
        const fac = out <= 0 ? 1 : Math.max(0, 1 - out / MARGIN)
        handle.style.setProperty("--mx", (clamp((mpx - restX) * K, MAXX) * fac).toFixed(1) + "px")
        handle.style.setProperty("--my", (clamp((mpy - restY) * K, MAXY) * fac).toFixed(1) + "px")
      }
      magnetMove = (e: PointerEvent) => {
        if (e.pointerType && e.pointerType !== "mouse") return
        mpx = e.clientX
        mpy = e.clientY
        if (!mpend) {
          mpend = true
          requestAnimationFrame(tick)
        }
      }
      window.addEventListener("pointermove", magnetMove, { passive: true })
      window.addEventListener("blur", onBlur)
    }

    set(50)

    return () => {
      ba.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      window.removeEventListener("pointercancel", onUp)
      handle.removeEventListener("keydown", onKey)
      handle.removeEventListener("pointerdown", onHandleDown)
      if (magnetMove) window.removeEventListener("pointermove", magnetMove)
      window.removeEventListener("blur", onBlur)
    }
  }, [])

  return (
    <div ref={baRef} className={cn("ba", className)} style={style} aria-label={ariaLabel}>
      {/* .ba-media clips everything into the rounded frame; the handle sits outside it.
          AFTER is the base layer; BEFORE is clipped on top and revealed by the handle. */}
      <div className="ba-media" style={{ aspectRatio: aspect }}>
        <img className="ba-after-img" src={after.src} alt={after.alt} draggable={false} />
        <span className="ba-tag after">{afterLabel}</span>
        <div className="ba-before">
          <img src={before.src} alt={before.alt} draggable={false} />
          <span className="ba-tag before">{beforeLabel}</span>
        </div>
      </div>
      {/* divider + corner plus-marks ride outside .ba-media so they overshoot the edges */}
      <div className="ba-divide" aria-hidden="true" />
      <span className="ba-plus t" aria-hidden="true" />
      <span className="ba-plus b" aria-hidden="true" />
      <button
        ref={handleRef}
        className="ba-handle"
        type="button"
        role="slider"
        aria-label="Reveal more of the before or after image"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={50}
      >
        <svg viewBox="0 0 11 15" aria-hidden="true">
          <path d="M9.5 2 2 7.5 9.5 13Z" />
        </svg>
        <svg viewBox="0 0 11 15" aria-hidden="true">
          <path d="M1.5 2 9 7.5 1.5 13Z" />
        </svg>
      </button>
    </div>
  )
}
