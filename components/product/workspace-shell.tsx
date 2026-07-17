import * as React from "react"

import { cn } from "@/lib/utils"

// WorkspaceShell — the promoted 4-column agent-workspace layout.
//
// Owns the MECHANICS (per Bal's "capture once"): the CSS-grid with custom-prop
// tracks so every edge animates in one motion, the drag-to-resize gutters, the
// responsive drawers, and the scrim. It takes the four columns as SLOTS
// (primaryNav / agentHome / content / chat) and splices the resize gutters
// between them itself, so the columns can't be misordered.
//
// State is CONTROLLED by the host: collapse booleans + the compact drawer flags
// flow in as props (so the host's own effects — a travelling avatar, a docked
// launcher — react to them). The shell reflects them as classes and, while a
// gutter is dragged, fires onResize() each frame so the host can relayout. The
// hard parts (grid tracks, resize maths, drawer transforms) never leave the DS,
// so a layout change here reaches both the Demo and the styleguide showcase.
//
// Layout metrics live in components/workspace.css (ws-*).

export type WorkspaceColumn = "nav" | "sub" | "work"

export type WorkspaceShellApi = {
  /** the shell root element */
  readonly el: HTMLDivElement | null
  /** current pixel width of a resizable column */
  getWidth: (which: WorkspaceColumn) => number
}

type Slot = React.ReactElement<{ className?: string }>

type ResizeClamp = { min: number; max: number }

type WorkspaceShellProps = {
  /** COLUMN 1 — the primary nav (a LayoutColumn) */
  primaryNav: Slot
  /** COLUMN 2 — the agent home / sub-nav (a LayoutColumn) */
  agentHome: Slot
  /** COLUMN 3 — the content pane (a LayoutColumn variant="canvas") */
  content: Slot
  /** COLUMN 4 — the chat side panel (a LayoutColumn); width is driven by workOpen */
  chat?: Slot

  navCollapsed?: boolean
  subCollapsed?: boolean
  workOpen?: boolean

  /** compact (<1024px) drawers */
  navOpen?: boolean
  agentOpen?: boolean
  onNavOpenChange?: (open: boolean) => void
  onAgentOpenChange?: (open: boolean) => void

  /** drag-to-resize the nav / sub / work gutters (default true) */
  resizable?: boolean
  /** clamps for the resizable OPEN widths + the min content width that starves last */
  clamps?: { nav?: ResizeClamp; sub?: ResizeClamp; work?: ResizeClamp; minContent?: number }
  /** fired on every resize frame — relayout a docked launcher, follow an avatar, … */
  onResize?: () => void

  apiRef?: React.Ref<WorkspaceShellApi>
  className?: string
  /** passthrough for bounding the shell (e.g. a fixed-height embed in the styleguide) */
  style?: React.CSSProperties
}

const GUTTER = 4
const DEFAULT_CLAMPS = {
  nav: { min: 228, max: 360 },
  sub: { min: 272, max: 400 },
  // the work column is measured against the collapsed-nav + sub + gutter baseline
  work: { min: 68 + 272 + GUTTER, max: 360 + 400 + GUTTER }, // 344 .. 764
  minContent: 300,
}
const VAR: Record<WorkspaceColumn, string> = {
  nav: "--c-nav-open",
  sub: "--c-sub-open",
  work: "--c-work-open",
}
const SEL: Record<WorkspaceColumn, string> = {
  nav: ".ws-col--nav",
  sub: ".ws-col--sub",
  work: ".ws-col--work",
}

function WorkspaceShell({
  primaryNav,
  agentHome,
  content,
  chat,
  navCollapsed,
  subCollapsed,
  workOpen,
  navOpen,
  agentOpen,
  onNavOpenChange,
  onAgentOpenChange,
  resizable = true,
  clamps,
  onResize,
  apiRef,
  className,
  style,
}: WorkspaceShellProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)

  // keep the resize callback fresh without re-installing the pointer effect
  const onResizeRef = React.useRef(onResize)
  onResizeRef.current = onResize
  const clampsRef = React.useRef(clamps)
  clampsRef.current = clamps

  React.useImperativeHandle(
    apiRef,
    (): WorkspaceShellApi => ({
      get el() {
        return rootRef.current
      },
      getWidth: (which) => {
        const el = rootRef.current?.querySelector<HTMLElement>(SEL[which])
        return el ? el.getBoundingClientRect().width : 0
      },
    }),
    []
  )

  /* ---- drag a gutter edge to resize the nav / sub / work panels. Widths clamp
     to per-panel min/max AND a content-area floor so the middle never starves.
     The shell owns this entirely; the host only reacts via onResize(). ---- */
  React.useEffect(() => {
    if (!resizable) return
    const app = rootRef.current
    if (!app) return
    const contentCol = app.querySelector<HTMLElement>(".ws-col--content")
    if (!contentCol) return

    const c = clampsRef.current
    const MIN: Record<WorkspaceColumn, number> = {
      nav: c?.nav?.min ?? DEFAULT_CLAMPS.nav.min,
      sub: c?.sub?.min ?? DEFAULT_CLAMPS.sub.min,
      work: c?.work?.min ?? DEFAULT_CLAMPS.work.min,
    }
    const MAX: Record<WorkspaceColumn, number> = {
      nav: c?.nav?.max ?? DEFAULT_CLAMPS.nav.max,
      sub: c?.sub?.max ?? DEFAULT_CLAMPS.sub.max,
      work: c?.work?.max ?? DEFAULT_CLAMPS.work.max,
    }
    const MIN_CONTENT = c?.minContent ?? DEFAULT_CLAMPS.minContent
    const EL: Record<WorkspaceColumn, HTMLElement | null> = {
      nav: app.querySelector(".ws-col--nav"),
      sub: app.querySelector(".ws-col--sub"),
      work: app.querySelector(".ws-col--work"),
    }

    let drag: { which: WorkspaceColumn; handle: HTMLElement; x0: number; w0: number; content0: number } | null = null
    const onMove = (e: PointerEvent) => {
      if (!drag) return
      const dx = e.clientX - drag.x0
      const desired = drag.which === "work" ? drag.w0 - dx : drag.w0 + dx // work grows leftward
      const maxByContent = drag.w0 + (drag.content0 - MIN_CONTENT)
      const w = Math.max(MIN[drag.which], Math.min(Math.min(MAX[drag.which], maxByContent), desired))
      app.style.setProperty(VAR[drag.which], Math.round(w) + "px")
      onResizeRef.current?.()
    }
    const onUp = () => {
      if (!drag) return
      drag.handle.classList.remove("is-dragging")
      app.classList.remove("is-resizing")
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
      drag = null
    }
    const handles = Array.from(app.querySelectorAll<HTMLElement>(".ws-resize"))
    const offs = handles.map((h) => {
      const onDown = (e: PointerEvent) => {
        const which = h.dataset.resize as WorkspaceColumn
        e.preventDefault()
        drag = {
          which,
          handle: h,
          x0: e.clientX,
          w0: (EL[which] as HTMLElement).getBoundingClientRect().width,
          content0: contentCol.getBoundingClientRect().width,
        }
        h.classList.add("is-dragging")
        app.classList.add("is-resizing")
        document.body.style.cursor = "ew-resize"
        document.body.style.userSelect = "none"
        window.addEventListener("pointermove", onMove)
        window.addEventListener("pointerup", onUp)
      }
      h.addEventListener("pointerdown", onDown)
      return () => h.removeEventListener("pointerdown", onDown)
    })
    return () => {
      offs.forEach((o) => o())
      window.removeEventListener("pointermove", onMove)
      window.removeEventListener("pointerup", onUp)
    }
  }, [resizable])

  // splice each slot into its grid cell (the placement class carries grid-column +
  // the collapse-border behavior); cloneElement preserves the host's ref + children
  const place = (slot: Slot | undefined, cls: string) =>
    slot ? React.cloneElement(slot, { className: cn(slot.props.className, cls) }) : null

  return (
    <div
      ref={rootRef}
      data-slot="workspace-shell"
      style={style}
      className={cn(
        "ws-shell",
        navCollapsed && "is-nav-collapsed",
        subCollapsed && "is-sub-collapsed",
        workOpen && "is-work-open",
        navOpen && "is-nav-open",
        agentOpen && "is-agent-open",
        className
      )}
    >
      {place(primaryNav, "ws-col--nav")}
      {place(agentHome, "ws-col--sub")}
      {place(content, "ws-col--content")}
      {place(chat, "ws-col--work")}

      {resizable && (
        <>
          <div className="ws-resize ws-resize--nav" data-resize="nav" aria-hidden="true" />
          <div className="ws-resize ws-resize--sub" data-resize="sub" aria-hidden="true" />
          <div className="ws-resize ws-resize--work" data-resize="work" aria-hidden="true" />
        </>
      )}

      {/* compact-only scrim: tap to close a drawer / the nav sheet */}
      <div
        className="ws-scrim"
        aria-hidden="true"
        onClick={() => {
          onNavOpenChange?.(false)
          onAgentOpenChange?.(false)
        }}
      />
    </div>
  )
}

export { WorkspaceShell }
export type { WorkspaceShellProps }
