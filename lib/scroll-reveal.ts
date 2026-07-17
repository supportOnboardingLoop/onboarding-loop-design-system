// Global reveal-on-scroll for the DS scrollbar (see components/kit.css).
//
// The scrollbar is transparent at rest; it appears ONLY while an element is being
// scrolled. There is no CSS "is scrolling" state, so a single capture-phase scroll
// listener tags whichever element just scrolled with `.is-scrolling`, then clears it
// ~700ms after that element stops. Capture phase catches EVERY scroller in one
// listener, so this covers any current or future scroll container automatically.
//
// Call installScrollReveal() once per document (e.g. at each app entry). It is
// idempotent — a repeat call is a no-op — and returns a disposer.

const REVEAL_MS = 700
let installed = false

export function installScrollReveal(doc: Document = document): () => void {
  if (installed) return () => {}
  installed = true

  const timers = new WeakMap<Element, number>()
  const onScroll = (e: Event) => {
    const el = e.target as HTMLElement | null
    // document-level scroll reports `document` as target; tag the scrolling element
    const node = el && el.nodeType === 1 ? el : doc.scrollingElement
    if (!node || !(node as HTMLElement).classList) return
    ;(node as HTMLElement).classList.add("is-scrolling")
    const prev = timers.get(node)
    if (prev) clearTimeout(prev)
    timers.set(
      node,
      window.setTimeout(() => (node as HTMLElement).classList.remove("is-scrolling"), REVEAL_MS)
    )
  }

  doc.addEventListener("scroll", onScroll, true) // capture: every scroller, one listener
  return () => {
    doc.removeEventListener("scroll", onScroll, true)
    installed = false
  }
}
