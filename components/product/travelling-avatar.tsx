"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

// The ONE travelling agent avatar: a fixed, floating PNG (a sibling of the shell)
// that rAF-lerps between the agent-home header slot (while the column is open) and
// the content-header landing slot (while it's collapsed). Promoted out of the Demo
// so any surface with an agent home can reuse the exact travel behavior. The host
// wires the two slot refs + the collapsed flag; it triggers follow()/travel(0) for
// OTHER layout shifts (a nav collapse, a chat opening, a resize drag) via the
// handle. Layout lives in components/workspace.css (.ws-agent-av).

export type TravellingAvatarHandle = {
  /** ease to the active slot over `dur` ms (0 = snap) */
  travel: (dur: number) => void
  /** track the active slot for `dur` ms as it moves under a grid transition */
  follow: (dur: number) => void
}

type TravellingAgentAvatarProps = {
  src: string
  alt?: string
  /** true while the agent home is collapsed (avatar rides the content-header slot) */
  collapsed: boolean
  /** slot shown while the agent home is OPEN (its identity header) */
  openSlotRef: React.RefObject<HTMLElement | null>
  /** slot shown while the agent home is COLLAPSED (the content header) */
  collapsedSlotRef: React.RefObject<HTMLElement | null>
  /** click while collapsed reopens the agent home */
  onReopen?: () => void
  className?: string
}

const TravellingAgentAvatar = React.forwardRef<TravellingAvatarHandle, TravellingAgentAvatarProps>(
  function TravellingAgentAvatar({ src, alt = "", collapsed, openSlotRef, collapsedSlotRef, onReopen, className }, ref) {
    const imgRef = React.useRef<HTMLImageElement>(null)
    const collapsedRef = React.useRef(collapsed)
    collapsedRef.current = collapsed
    const ctl = React.useRef<TravellingAvatarHandle | null>(null)

    React.useEffect(() => {
      const av = imgRef.current
      if (!av) return
      let raf = 0
      const activeSlot = () => (collapsedRef.current ? collapsedSlotRef.current : openSlotRef.current)
      // The avatar's disc = its full width but the canvas has headroom on top (the
      // head overflows up), so the disc sits at the BOTTOM of the image. The slots
      // are disc-sized, so seat the disc in the slot by lifting the image by its
      // headroom: (naturalH - naturalW)/naturalW * width. 0 for a square avatar.
      const headroom = () => (av.naturalWidth ? (av.naturalHeight - av.naturalWidth) / av.naturalWidth : 0)
      const topFor = (top: number, w: number) => top - w * headroom()
      const apply = (l: number, t: number, w: number) => {
        av.style.left = l + "px"
        av.style.top = t + "px"
        av.style.width = w + "px"
      }
      const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
      const travel = (dur: number) => {
        const slot = activeSlot()
        if (!slot) return
        if (raf) cancelAnimationFrame(raf)
        if (!dur) {
          const r = slot.getBoundingClientRect()
          apply(r.left, topFor(r.top, r.width), r.width)
          return
        }
        const from = av.getBoundingClientRect()
        let start: number | null = null
        const frame = (ts: number) => {
          if (start === null) start = ts
          const t = Math.min(1, (ts - start) / dur)
          const e = ease(t)
          const d = slot.getBoundingClientRect()
          apply(from.left + (d.left - from.left) * e, from.top + (topFor(d.top, d.width) - from.top) * e, from.width + (d.width - from.width) * e)
          raf = t < 1 ? requestAnimationFrame(frame) : 0
        }
        raf = requestAnimationFrame(frame)
      }
      const follow = (dur: number) => {
        const slot = activeSlot()
        if (!slot) return
        if (raf) cancelAnimationFrame(raf)
        let end: number | null = null
        const frame = (ts: number) => {
          if (end === null) end = ts + dur
          const d = slot.getBoundingClientRect()
          apply(d.left, topFor(d.top, d.width), d.width)
          raf = ts < end ? requestAnimationFrame(frame) : 0
        }
        raf = requestAnimationFrame(frame)
      }
      ctl.current = { travel, follow }
      const place = () => travel(0)
      const onResize = () => travel(0)
      window.addEventListener("resize", onResize)
      if (av.complete) requestAnimationFrame(place)
      else av.addEventListener("load", () => requestAnimationFrame(place))
      requestAnimationFrame(place)
      return () => {
        if (raf) cancelAnimationFrame(raf)
        window.removeEventListener("resize", onResize)
        ctl.current = null
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // travel to the new active slot whenever collapse toggles
    const firstCollapse = React.useRef(true)
    React.useEffect(() => {
      if (firstCollapse.current) {
        firstCollapse.current = false
        return
      }
      ctl.current?.travel(380)
    }, [collapsed])

    React.useImperativeHandle(
      ref,
      (): TravellingAvatarHandle => ({
        travel: (d) => ctl.current?.travel(d),
        follow: (d) => ctl.current?.follow(d),
      }),
      []
    )

    return (
      <img
        ref={imgRef}
        data-slot="travelling-avatar"
        className={cn("ws-agent-av", collapsed && "is-clickable", className)}
        src={src}
        alt={alt}
        onClick={() => collapsedRef.current && onReopen?.()}
      />
    )
  }
)

export { TravellingAgentAvatar }
export type { TravellingAgentAvatarProps }
