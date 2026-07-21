/* ============================================================
   QuoteSection (step 8) — the proof group. Ported from
   protocol-stack/index.html (`.g-d2`, markup 3547-3618). ONE registered
   <Section> (g-d2) holding two sub-sections, matching the source's single grp:

     1. `.quote`  — a blueprint-framed testimonial (dot-grid frame with corner
        crop-marks + crosshairs, Heatmap logo, big Feijoa quote with a flipped
        opening mark, Corey Leger avatar + name/stat). Static; reveal-up pieces
        animate in via useRevealUp.
     2. `.tst`    — an interactive 3-panel carousel: clicking a collapsed panel
        slides it open (flex-basis/grow transition) and reveals its content
        line-by-line, staggered (ported verbatim from the vanilla driver ~4113).

   Content comes from the manifest (Landing). The carousel's active panel is the
   one bit of local state, mirroring the vanilla `.tpanel.active` toggle.
   ============================================================ */
import * as React from "react"
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import { Section } from "@/components/web/ScrollStage"
import { BlueprintQuote } from "@/components/web/BlueprintQuote"

export interface QuoteContent {
  logo: { src: string; alt: string }
  text: React.ReactNode
  avatar: { src: string; alt: string }
  name: React.ReactNode
  stat: React.ReactNode
}

export interface Testimonial {
  logo: { src: string; alt: string; h: number }
  avatar: string
  /** the pull-quote, plain string so it can be split into word spans for the
   *  line-by-line reveal (straight quotes, verbatim from the source). */
  quote: string
  attr: React.ReactNode
  stat: React.ReactNode
  aria: string
}

export interface QuoteSectionProps {
  quote: QuoteContent
  testimonials: Testimonial[]
  reveal?: boolean
}

// Pre-split the pull-quote into word spans with whitespace text nodes between
// them (mirrors the vanilla splitWords: parts on /(\s+)/, spaces stay real text
// nodes so wrapping is identical). `.tp-quote .w{display:inline-block}` lets each
// word carry its own translate on reveal. Rendering the spans in React (rather
// than mutating textContent at reveal time) keeps the DOM React's to own.
function QuoteWords({ text }: { text: string }) {
  const parts = text.split(/(\s+)/).filter(Boolean)
  return (
    <>
      {parts.map((t, i) =>
        /^\s+$/.test(t) ? (
          <React.Fragment key={i}>{t}</React.Fragment>
        ) : (
          <span className="w" key={i}>
            {t}
          </span>
        ),
      )}
    </>
  )
}

export function QuoteSection({ quote, testimonials, reveal = false }: QuoteSectionProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const panelRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [active, setActive] = useState(0)
  const firstPass = useRef(true)

  // Reveal a panel's content line-by-line: each "line" (a group of words sharing
  // an offsetTop, plus the avatar/logo/attr/stat) fades + slides up, staggered
  // top-to-bottom. Verbatim from the vanilla driver, minus splitWords (the words
  // are pre-split in React above).
  const reveal_ = useCallback((panel: HTMLElement) => {
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return
    const vis = (el: Element | null) => !!el && getComputedStyle(el as HTMLElement).display !== "none"
    const q = panel.querySelector<HTMLElement>(".tp-quote")
    const seq: HTMLElement[][] = [] // ordered list of "lines" (arrays of els)
    const av = panel.querySelector<HTMLElement>(".tp-avatar")
    if (vis(av)) seq.push([av!])
    const lg = panel.querySelector<HTMLElement>(".tp-detail .tp-logo")
    if (vis(lg)) seq.push([lg!])
    if (q) {
      let curTop: number | null = null
      let cur: HTMLElement[] | null = null
      Array.from(q.querySelectorAll<HTMLElement>(".w")).forEach((w) => {
        const t = Math.round(w.offsetTop)
        if (t !== curTop) {
          curTop = t
          cur = []
          seq.push(cur)
        }
        cur!.push(w)
      })
    }
    const attr = panel.querySelector<HTMLElement>(".tp-attr")
    if (vis(attr)) seq.push([attr!])
    const stat = panel.querySelector<HTMLElement>(".tp-stat")
    if (vis(stat)) seq.push([stat!])
    let all: HTMLElement[] = []
    seq.forEach((g) => {
      all = all.concat(g)
    })
    // snap every piece to hidden with NO transition (else adding tp-anim would
    // animate 1->0 and there'd be nothing left to animate 0->1), commit it, then
    // transition each line up + in
    all.forEach((el) => {
      el.classList.add("tp-anim")
      el.classList.remove("tp-anim-in")
      el.style.transition = "none"
      el.style.transitionDelay = "0ms"
    })
    void panel.offsetWidth // commit the hidden state as the baseline
    seq.forEach((group, i) => {
      group.forEach((el) => {
        el.style.transition = ""
        el.style.transitionDelay = i * 32 + "ms"
        el.classList.add("tp-anim-in")
      })
    })
  }, [])

  // Freeze the opening panel's content at its FINAL width for the width-slide, so
  // the quote lays out once (stable height) and the widening panel just reveals
  // it — no reflow "bounce" on open. Verbatim from the vanilla freezeWidth.
  const freezeWidth = useCallback((pnl: HTMLElement) => {
    if (window.innerWidth <= 900) return // mobile accordion has no horizontal slide
    const grid = gridRef.current
    if (!grid) return
    const full = pnl.querySelector<HTMLElement>(".tp-full")
    if (!full) return
    const panels = panelRefs.current.filter(Boolean) as HTMLElement[]
    const others = panels.filter((p) => p !== pnl)
    const cw = Math.min(...others.map((p) => p.getBoundingClientRect().width))
    const finalW = Math.round(grid.clientWidth - others.length * cw)
    if (finalW < 200) return
    full.style.width = finalW + "px"
    const anyFull = full as HTMLElement & { _wt?: number }
    clearTimeout(anyFull._wt)
    anyFull._wt = window.setTimeout(() => {
      full.style.width = ""
    }, 420) // release once the slide has settled
  }, [])

  // animate the initially-open panel once the section scrolls into view
  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    if (window.matchMedia("(prefers-reduced-motion:reduce)").matches) return
    const active0 = panelRefs.current[0]
    if (!active0 || !("IntersectionObserver" in window)) return
    const io = new IntersectionObserver(
      (es) => {
        es.forEach((e) => {
          if (e.isIntersecting) {
            reveal_(active0)
            io.disconnect()
          }
        })
      },
      { threshold: 0.35 },
    )
    io.observe(grid)
    return () => io.disconnect()
  }, [reveal_])

  // on click: React flips .active; this fires after the DOM mutation, so we
  // freeze the width and run the reveal on the freshly-active panel.
  useLayoutEffect(() => {
    if (firstPass.current) {
      firstPass.current = false // the initial open is handled by the IO above
      return
    }
    const pnl = panelRefs.current[active]
    if (!pnl) return
    freezeWidth(pnl)
    reveal_(pnl)
  }, [active, freezeWidth, reveal_])

  return (
    <Section className="g-d2">
      {/* 1. QUOTE — the shared blueprint-quote block (also used by the case study);
             the landing passes a logo-only brand + short bottom rails (its default). */}
      <BlueprintQuote
        brand={{ logo: quote.logo }}
        quote={quote.text}
        avatar={quote.avatar}
        name={quote.name}
        stat={quote.stat}
        dataBar="white"
        dock="proof"
        reveal={reveal}
      />

      {/* 2. TESTIMONIALS */}
      <section className="tst" data-bar="paper" data-dock="proof">
        <div className="tst-outer">
          <div className="tgrid" data-active={active} ref={gridRef}>
            <span className="xplus l" />
            <span className="xplus r" />

            {testimonials.map((t, i) => (
              <button
                key={i}
                ref={(el) => {
                  panelRefs.current[i] = el
                }}
                className={cn("tpanel", i === active && "active")}
                data-i={i}
                aria-label={t.aria}
                onClick={() => setActive(i)}
              >
                <div className="tp-face">
                  <img className="tp-face-logo" src={t.logo.src} alt={t.logo.alt} style={{ height: t.logo.h }} />
                </div>
                <div className="tp-full">
                  <div className="tp-row">
                    <img className="tp-avatar" src={t.avatar} alt="" />
                    <div className="tp-detail">
                      <img className="tp-logo" src={t.logo.src} alt={t.logo.alt} style={{ height: t.logo.h }} />
                      <p className="tp-quote">
                        <QuoteWords text={t.quote} />
                      </p>
                      <p className="tp-attr">{t.attr}</p>
                    </div>
                  </div>
                  <div className="tp-stat">{t.stat}</div>
                </div>
              </button>
            ))}

            <span className="cm l" />
            <span className="cm r" />
          </div>
        </div>
      </section>
    </Section>
  )
}
