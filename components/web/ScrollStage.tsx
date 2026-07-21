/* ============================================================
   ScrollStage — the pinned scroll-group engine, rebuilt as a
   registration-based React island.

   The vanilla landing page pinned a fixed, hand-named list of groups
   (.g-hero … .g-e) and assigned each a hardcoded z-index (1 … 9). That only
   works in one order. Here the stage owns the engine and sections REGISTER
   with it (a DOM ref); the stage sorts the registered nodes into live document
   order every layout pass and derives both the pin `top` and the z-index from
   that order. Remove a section, reorder two, add one: the rest restacks with
   no other edit, because nothing is named or numbered in shared code.

   What is preserved verbatim from the source (see lib/scroll-stage.ts):
     - pin top = min(0, viewportHeight * 0.5 - groupHeight)
     - the last group in document order does NOT pin (it is the floor the
       others stack onto); in the source that was `.g-e2 { position:relative }`,
       here it is "last in registration order", so it is not a per-section rule.
     - reduced motion disables pinning entirely (CSS drops .grp to relative).

   Motion state flows DOWN only: the stage reads window.scrollY once per frame
   and broadcasts { scrollY, vh } to subscribed sections. A section computes its
   own progress from its own geometry and passes that to its subsections. No
   section or subsection attaches its own scroll listener or reads scrollY.
   ============================================================ */
import * as React from "react"
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"

import { cn } from "@/lib/utils"
import { inDocumentOrder, pinTop, type StageFrame } from "@/lib/scroll-stage"

interface StageContextValue {
  /** Register a group element with the stage. Returns an unregister cleanup.
   *  A no-op when there is no stage above (standalone / styleguide render). */
  register: (el: HTMLElement) => () => void
  /** Subscribe to the per-frame scroll signal. Returns an unsubscribe cleanup. */
  subscribe: (fn: (frame: StageFrame) => void) => () => void
  /** Force a re-layout (e.g. after a section's content height changes). */
  relayout: () => void
  /** True when the stage is actively pinning (false standalone / reduced motion). */
  enabled: boolean
}

const noopStage: StageContextValue = {
  register: () => () => {},
  subscribe: () => () => {},
  relayout: () => {},
  enabled: false,
}

const StageContext = createContext<StageContextValue>(noopStage)

/** Read the stage from a section. Falls back to a no-op stage when rendered
 *  standalone, so every section renders outside the stage without throwing. */
export function useStage(): StageContextValue {
  return useContext(StageContext)
}

/** Subscribe to the stage's per-frame scroll signal. The callback is invoked on
 *  every scroll/resize frame with the shared { scrollY, vh }. Sections use this
 *  and read their OWN ref geometry inside the callback; subsections never call
 *  it (they receive progress as a prop from their section). */
export function useStageScroll(fn: (frame: StageFrame) => void): void {
  const stage = useStage()
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => {
    return stage.subscribe((frame) => ref.current(frame))
  }, [stage])
}

/**
 * Reveal `.reveal-up` descendants of `ref` as they scroll into view (add
 * `.is-in`, one-shot), matching the source's IntersectionObserver (threshold
 * .2, rootMargin 0 0 -12% 0). It is scoped to the given root so a section works
 * standalone (outside the page/stage), and it observes intersection, not scroll,
 * so it obeys the "no subsection scroll listener" rule. Reduced motion / no IO:
 * reveal everything immediately.
 */
export function useRevealUp(ref: React.RefObject<HTMLElement | null>, enabled = true): void {
  useEffect(() => {
    const root = ref.current
    if (!root || !enabled) return
    const els = root.querySelectorAll<HTMLElement>(".reveal-up")
    if (!els.length) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      els.forEach((e) => e.classList.add("is-in"))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-in")
            io.unobserve(e.target)
          }
        })
      },
      { threshold: 0.2, rootMargin: "0px 0px -12% 0px" },
    )
    els.forEach((e) => io.observe(e))
    return () => io.disconnect()
  }, [ref, enabled])
}

export interface ScrollStageProps {
  children: React.ReactNode
  className?: string
}

export function ScrollStage({ children, className }: ScrollStageProps) {
  const registry = useRef<Set<HTMLElement>>(new Set())
  const subscribers = useRef<Set<(frame: StageFrame) => void>>(new Set())
  // layoutRef is populated by the effect below; the context callbacks (created
  // during render, before the effect runs) delegate to it.
  const layoutRef = useRef<() => void>(() => {})
  const [enabled, setEnabled] = useState(false)

  const register = useCallback((el: HTMLElement) => {
    registry.current.add(el)
    layoutRef.current()
    return () => {
      registry.current.delete(el)
      layoutRef.current()
    }
  }, [])

  const subscribe = useCallback((fn: (frame: StageFrame) => void) => {
    subscribers.current.add(fn)
    return () => {
      subscribers.current.delete(fn)
    }
  }, [])

  const relayout = useCallback(() => layoutRef.current(), [])

  useEffect(() => {
    const reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)")

    // Clear any inline pin styles the engine wrote, so CSS (.grp -> relative
    // under reduced motion) governs the static fallback.
    const clearStyles = () => {
      registry.current.forEach((el) => {
        el.style.position = ""
        el.style.top = ""
        el.style.zIndex = ""
      })
    }

    // Pin + stack pass. Sort registered nodes into live document order, then:
    //   - every node but the last pins sticky at top = min(0, 0.5vh - height)
    //     and takes an ascending z-index (later in the document paints on top),
    //   - the last node in order is the floor: it flows (relative), nothing
    //     scrolls over it. All of this is derived from order, never named.
    const layout = () => {
      if (reduceMq.matches) {
        clearStyles()
        return
      }
      const nodes = inDocumentOrder(Array.from(registry.current))
      const vh = window.innerHeight
      const last = nodes.length - 1
      nodes.forEach((el, i) => {
        if (i === last) {
          el.style.position = "relative"
          el.style.top = "auto"
        } else {
          el.style.position = "sticky"
          el.style.top = pinTop(vh, el.offsetHeight) + "px"
        }
        el.style.zIndex = String(i + 1)
      })
    }
    layoutRef.current = layout

    const notify = () => {
      // Under reduced motion the stage is inert: no pinning, and no per-frame
      // signal, so scroll-driven section effects (e.g. the hero shape drift)
      // never run and their CSS custom properties stay at their resting values.
      if (reduceMq.matches) return
      if (!subscribers.current.size) return
      const frame: StageFrame = { scrollY: window.scrollY, vh: window.innerHeight }
      subscribers.current.forEach((fn) => fn(frame))
    }

    let raf = 0
    const onFrame = () => {
      raf = 0
      layout()
      notify()
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(onFrame)
    }

    // A section's content height can change (accordion open, image load); the
    // ResizeObserver re-pins across those transitions so revealed content stays
    // on screen. This replaces the source's manual 34-frame relayout loop, and
    // needs no cooperation from the section (fully order/registration driven).
    const ro = new ResizeObserver(schedule)
    registry.current.forEach((el) => ro.observe(el))
    // Keep the observer's set of watched nodes in sync as sections mount/unmount.
    const syncObserved = () => {
      ro.disconnect()
      registry.current.forEach((el) => ro.observe(el))
    }

    const applyMode = () => {
      const on = !reduceMq.matches
      setEnabled(on)
      // Re-observe current nodes and lay out (or clear) for the new mode.
      syncObserved()
      schedule()
    }

    applyMode()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule, { passive: true })
    window.addEventListener("load", schedule)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(schedule)
    }
    reduceMq.addEventListener("change", applyMode)

    // Expose a hook so a newly-registered section re-observes too. We wrap the
    // context register by re-running syncObserved on every layout, cheaply.
    const origLayout = layoutRef.current
    layoutRef.current = () => {
      syncObserved()
      origLayout()
    }

    return () => {
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
      window.removeEventListener("load", schedule)
      reduceMq.removeEventListener("change", applyMode)
      ro.disconnect()
      if (raf) cancelAnimationFrame(raf)
      layoutRef.current = () => {}
    }
  }, [])

  const value = useMemo<StageContextValue>(
    () => ({ register, subscribe, relayout, enabled }),
    [register, subscribe, relayout, enabled],
  )

  return (
    <StageContext.Provider value={value}>
      <div className={cn("ol-web ol-stage", className)}>{children}</div>
    </StageContext.Provider>
  )
}

export interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The section's content. Renders inside the pinning `.grp` group wrapper. */
  children: React.ReactNode
}

/**
 * Section — the pinning group wrapper (`.grp`). Registers its own element with
 * the stage on mount and lets the stage drive its `top`/`z-index`/`position`
 * imperatively. Rendered standalone (no stage), register is a no-op and CSS
 * leaves it in normal flow, which is also the reduced-motion fallback. Section
 * components (Hero, Problem, …) compose this and place their subsections inside.
 */
export function Section({ children, className, ...rest }: SectionProps) {
  const stage = useStage()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    return stage.register(el)
  }, [stage])

  return (
    <div ref={ref} className={cn("grp", className)} {...rest}>
      {children}
    </div>
  )
}
