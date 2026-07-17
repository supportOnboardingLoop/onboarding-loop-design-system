import * as React from "react"
import { createPortal } from "react-dom"

import { Icon } from "@/components/base/icon"
import type { LauncherApi } from "@/components/product/launcher-engine"
import type { Attachment } from "@/components/product/attach-chip"

// ============================================================================
// Card drag-to-launcher — the pointer-drag that carries a content card to the
// agent launcher (new chat), a dashboard row (pin), or the open chat (attach).
//
// Two touches beyond the old portal:
//   • the ghost card SWINGS — it tilts from the smoothed horizontal velocity of
//     the pointer and settles upright when you stop, so it reads as physical;
//   • the launcher is MAGNETIC — while dragging it leans toward the pointer
//     (a clamped, eased translate) so it's obvious where to drop, then springs
//     back on release.
//
// The whole thing is imperative (rAF + refs) for per-frame smoothness; React
// state only toggles the ghost's existence. The launcher is a fixed singleton
// (`.launcher`) so it's found by query; drops resolve via elementFromPoint
// (the ghost is pointer-events:none, so it never occludes the target).
// ============================================================================

export type DragPayload = Attachment

type Zone =
  | { type: "launcher" }
  | { type: "dashboard"; id: string; name: string }
  | { type: "chat" }
  | null

export type DragCallbacks = {
  onDropLauncher: (p: DragPayload) => void
  onDropDashboard: (id: string, name: string, p: DragPayload) => void
  onDropChat: (p: DragPayload) => void
  launcher: React.RefObject<LauncherApi | null>
}

const Ctx = React.createContext<{ startDrag: (p: DragPayload, e: React.PointerEvent) => void }>({
  startDrag: () => {},
})
export const useDrag = () => React.useContext(Ctx)

const BACK = "cubic-bezier(.68,-0.6,.32,1.6)"

export function DragProvider({ children, cb }: { children: React.ReactNode; cb: DragCallbacks }) {
  const cbRef = React.useRef(cb)
  cbRef.current = cb
  const [dragging, setDragging] = React.useState(false)
  const ghostRef = React.useRef<HTMLDivElement>(null)

  const s = React.useRef({
    active: false,
    payload: null as DragPayload | null,
    x: 0,
    y: 0, // live cursor
    gx: 0,
    gy: 0, // ghost pos (lags the cursor a touch)
    vx: 0, // smoothed horizontal velocity
    angle: 0,
    lox: 0,
    loy: 0, // current launcher offset
    sourceEl: null as HTMLElement | null,
    zoneEl: null as HTMLElement | null,
    zone: null as Zone,
    raf: 0,
  })

  const launcherEl = () => document.querySelector<HTMLElement>(".launcher")

  const updateZone = () => {
    const d = s.current
    const under = document.elementFromPoint(d.x, d.y) as HTMLElement | null
    let zoneEl: HTMLElement | null = null
    let zone: Zone = null
    if (under) {
      const dash = under.closest<HTMLElement>('[data-drop="dashboard"]')
      const chat = under.closest<HTMLElement>('[data-drop="chat"]')
      const onLauncher = under.closest<HTMLElement>(".launcher")
      if (onLauncher) {
        zone = { type: "launcher" }
        zoneEl = onLauncher
      } else if (dash) {
        zone = { type: "dashboard", id: dash.dataset.dashId || "", name: dash.dataset.dashName || "" }
        zoneEl = dash
      } else if (chat) {
        zone = { type: "chat" }
        zoneEl = chat
      }
    }
    // launcher hit-padding: near it counts too (the magnetism pulls it toward you)
    if (!zone) {
      const L = launcherEl()
      if (L) {
        const r = L.getBoundingClientRect()
        const pad = 46
        if (d.x > r.left - pad && d.x < r.right + pad && d.y > r.top - pad && d.y < r.bottom + pad) {
          zone = { type: "launcher" }
          zoneEl = L
        }
      }
    }
    if (d.zoneEl !== zoneEl) {
      d.zoneEl?.classList.remove("is-drop")
      zoneEl?.classList.add("is-drop")
      d.zoneEl = zoneEl
    }
    d.zone = zone
  }

  const loop = () => {
    const d = s.current
    if (!d.active) return
    // ghost trails the cursor slightly; velocity comes from that lag
    const dx = d.x - d.gx
    const dy = d.y - d.gy
    d.gx += dx * 0.35
    d.gy += dy * 0.35
    d.vx = d.vx * 0.72 + dx * 0.28
    const target = Math.max(-22, Math.min(22, d.vx * 1.1))
    d.angle += (target - d.angle) * 0.18
    const g = ghostRef.current
    if (g) g.style.transform = `translate3d(${Math.round(d.gx + 16)}px, ${Math.round(d.gy + 16)}px, 0) rotate(${d.angle.toFixed(2)}deg)`

    // launcher magnetism: it's a magnet — the pull toward the card grows sharply
    // the closer the card gets, so the launcher visibly reaches out to meet it.
    // Very close, it vibrates playfully (excited for the drop).
    const L = launcherEl()
    if (L) {
      const r = L.getBoundingClientRect()
      const cx = r.left + r.width / 2 - d.lox // resting centre (undo the live offset + jitter isn't stored)
      const cy = r.top + r.height / 2 - d.loy
      const dx = d.x - cx
      const dy = d.y - cy
      const dist = Math.hypot(dx, dy) || 1
      const near = Math.max(0, 1 - dist / 460) // 0 far → 1 at the centre
      const strength = 0.1 + near * near * 0.55 // eased: a gentle far pull, a strong near one
      const tox = Math.max(-76, Math.min(76, dx * strength))
      const toy = Math.max(-60, Math.min(60, dy * strength))
      d.lox += (tox - d.lox) * 0.2
      d.loy += (toy - d.loy) * 0.2
      // excitement: within the last ~90px it wiggles + scales up, ramping with closeness
      const ex = Math.max(0, (near - 0.8) / 0.2)
      let jx = 0
      let jy = 0
      let rot = 0
      let scale = 1
      if (ex > 0) {
        const t = performance.now()
        const amp = ex * 3
        jx = Math.sin(t / 26) * amp
        jy = Math.cos(t / 21) * amp
        rot = Math.sin(t / 34) * ex * 2
        scale = 1 + ex * 0.025
      }
      L.classList.toggle("is-excited", ex > 0.15)
      L.style.transform = `translate(${(d.lox + jx).toFixed(1)}px, ${(d.loy + jy).toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${scale.toFixed(3)})`
    }

    updateZone()
    d.raf = requestAnimationFrame(loop)
  }

  const end = (commit: boolean) => {
    const d = s.current
    if (!d.active) return
    d.active = false
    cancelAnimationFrame(d.raf)
    if (commit && d.zone && d.payload) {
      const p = d.payload
      if (d.zone.type === "launcher") cbRef.current.onDropLauncher(p)
      else if (d.zone.type === "dashboard") cbRef.current.onDropDashboard(d.zone.id, d.zone.name, p)
      else if (d.zone.type === "chat") cbRef.current.onDropChat(p)
    }
    d.zoneEl?.classList.remove("is-drop")
    d.zoneEl = null
    d.zone = null
    if (d.sourceEl) {
      d.sourceEl.style.opacity = ""
      d.sourceEl = null
    }
    document.body.style.userSelect = ""
    document.body.classList.remove("is-dragging-card")
    // spring the launcher back to its dock (drop the drag outline + excited wiggle)
    const L = launcherEl()
    if (L) {
      L.classList.remove("is-drag-active", "is-excited")
      L.style.transition = `transform .42s ${BACK}`
      L.style.transform = "translate(0px, 0px) rotate(0deg) scale(1)"
      window.setTimeout(() => {
        if (L && !s.current.active) L.style.transition = ""
      }, 440)
    }
    d.payload = null
    setDragging(false)
  }

  const startDrag = (payload: DragPayload, e: React.PointerEvent) => {
    if (e.button !== 0) return
    const target = e.target as HTMLElement
    if (target.closest("button, a, input, textarea, [role='button']")) return // let controls handle it
    const sourceEl = e.currentTarget as HTMLElement
    const sx = e.clientX
    const sy = e.clientY
    let started = false

    const move = (ev: PointerEvent) => {
      if (!started) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < 6) return
        started = true
        const d = s.current
        d.active = true
        d.payload = payload
        d.x = d.gx = ev.clientX
        d.y = d.gy = ev.clientY
        d.vx = 0
        d.angle = 0
        d.lox = 0
        d.loy = 0
        d.sourceEl = sourceEl
        sourceEl.style.transition = "opacity .15s ease"
        sourceEl.style.opacity = ".4"
        document.body.style.userSelect = "none"
        document.body.classList.add("is-dragging-card")
        const L = launcherEl()
        if (L) {
          L.style.transition = "" // we drive transform per-frame while dragging
          L.classList.add("is-drag-active") // outline goes primary the moment a drag begins
        }
        setDragging(true)
        d.raf = requestAnimationFrame(loop)
      }
      s.current.x = ev.clientX
      s.current.y = ev.clientY
      ev.preventDefault()
    }
    const cleanup = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("keydown", key)
    }
    const up = () => {
      cleanup()
      if (started) end(true)
    }
    const key = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        cleanup()
        if (started) end(false)
      }
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    window.addEventListener("keydown", key)
  }

  const p = s.current.payload
  return (
    <Ctx.Provider value={{ startDrag }}>
      {children}
      {dragging &&
        p &&
        createPortal(
          <div ref={ghostRef} className="drag-ghost" aria-hidden="true">
            <span className="drag-ghost__clip">
              <Icon name="paperclip" size={15} />
            </span>
            {p.accent && <span className="drag-ghost__accent">{p.accent}</span>}
            <span className="drag-ghost__title">{p.title}</span>
          </div>,
          document.body
        )}
    </Ctx.Provider>
  )
}
