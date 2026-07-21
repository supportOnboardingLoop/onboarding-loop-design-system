/* ============================================================
   scroll-stage — pin math for the scroll-stacking stage.

   Why this is a module, not inline in a component: the pin-and-overlap
   behaviour is a conversation between sibling sections (one freezes, the
   next scrolls up and covers it), so the numbers cannot live inside any one
   section. They are lifted here verbatim from the vanilla landing page's
   group engine (protocol-stack/index.html, the ".grp" scroll-stacking block)
   so the React stage and any standalone consumer share the exact same math.

   The rule, unchanged from the original: each group pins at
       top = min(0, viewportHeight * 0.5 - groupHeight)
   Tall groups (taller than half the viewport) pin bottom-aligned: you scroll
   through them and they freeze once their bottom reaches the vertical middle.
   Short groups pin at the top. The divider between a frozen group and the next
   sits at 50% of the viewport when it locks. 0.5 is the single tuning knob and
   is kept identical to the source ("var usable = window.innerHeight*0.5").
   ============================================================ */

/** Fraction of the viewport height used as the pin line. Verbatim from the
 *  original engine (`window.innerHeight * 0.5`). */
export const STAGE_PIN_FRACTION = 0.5

/**
 * The sticky `top` (in px) for a group of the given height, at the given
 * viewport height. Negative for groups taller than the pin line (bottom
 * aligned), clamped to 0 for short groups (top aligned). Same formula and
 * clamp as the source: `Math.min(0, usable - g.offsetHeight)`.
 */
export function pinTop(
  viewportHeight: number,
  groupHeight: number,
  fraction: number = STAGE_PIN_FRACTION,
): number {
  return Math.min(0, viewportHeight * fraction - groupHeight)
}

/** Sort a list of registered stage nodes into live document order. Stacking is
 *  derived from this order at layout time (not a hardcoded z-index ladder), so
 *  removing or reordering a section restacks the rest automatically. */
export function inDocumentOrder<T extends Node>(nodes: T[]): T[] {
  return nodes.slice().sort((a, b) => {
    const rel = a.compareDocumentPosition(b)
    if (rel & Node.DOCUMENT_POSITION_FOLLOWING) return -1
    if (rel & Node.DOCUMENT_POSITION_PRECEDING) return 1
    return 0
  })
}

/** The per-frame signal the stage broadcasts to its registered sections.
 *  The stage owns the single scroll read; sections receive this and compute
 *  their own section-relative progress from their own geometry. No section or
 *  subsection reads window.scrollY directly. */
export interface StageFrame {
  /** window.scrollY, read once per frame by the stage. */
  scrollY: number
  /** viewport height (innerHeight) for this frame. */
  vh: number
}
