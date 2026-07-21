/* ============================================================
   StackSection (step 6a, static) — "The Full Protocol Stack". Ported from
   protocol-stack/index.html (`#stack`, markup 3375-3494): the title zone (dot-grid
   gutters + word-highlight headline), the 4-card grid of expandable `.pcard`s, the
   "How it works" band, and the pricing foot. This is the STATIC pass: the title
   words render dark, the cards are fully visible, and the HIW band is unpinned.
   Step 6b adds the motion (title word scrub, cardgrid `is-scrub` cascade, and the
   pinned HIW step-reveal on desktop).

   Content comes from the manifest (Landing) as props. The "Get the Full Stack"
   button reuses the DS Button via <Cta>. Expandable cards are the one bit of
   local state (open/close), mirroring the vanilla `.pcard-inside.open` toggle.
   ============================================================ */
import * as React from "react"
import { useEffect, useRef, useState } from "react"

import { Section, useRevealUp, useStageScroll } from "@/components/web/ScrollStage"
import { Cta } from "@/components/web/Cta"
import { useCubeSpring } from "@/components/web/useCubeSpring"

export interface StackCard {
  thumb: string
  alt: string
  title: string
  sub: string
  badge?: string
  checks: string[]
}

export interface StackSectionProps {
  badge: { num: string; label: string }
  title: { headline: string; s1: string; s2: string }
  cards: StackCard[]
  hiw: { title: string; steps: string[] }
  foot: {
    note: string
    price: { was: string; now: string; save: string }
    updates: string
    cta: { href: string; label: string }
  }
  reveal?: boolean
}

// split a sentence into word spans; each darkens (.on) word-by-word as the block
// scrolls up (driven below via useStageScroll, verbatim from the vanilla scrub).
// Words rest gray; reduced motion shows them all dark (a web.css fallback).
function Words({ text }: { text: string }) {
  const parts = text.split(" ")
  return (
    <>
      {parts.map((w, i) => (
        <span className="w" key={i}>
          {w}
          {i < parts.length - 1 ? " " : ""}
        </span>
      ))}
    </>
  )
}

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <path opacity=".4" d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M7.5 12L10.5 15L16.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const PlusMinusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="9.25" stroke="currentColor" strokeWidth="1.5" opacity=".4" />
    <path d="M8.5 12h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path className="v" d="M12 8.5v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

function Pcard({ card }: { card: StackCard }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="pcard">
      {card.badge && <span className="pcard-badge">{card.badge}</span>}
      <div className="pcard-head">
        <img className="pcard-thumb" src={card.thumb} alt={card.alt} />
        <div className="pcard-titles">
          <h3>{card.title}</h3>
          <p>{card.sub}</p>
        </div>
      </div>
      <div className={`pcard-inside${open ? " open" : ""}`}>
        <button className="pcard-sum" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
          See what&apos;s inside
          <span className="pc">
            <PlusMinusIcon />
          </span>
        </button>
        <div className="pcard-reveal">
          <div className="pcard-reveal-in">
            <ul className="pcard-checks">
              {card.checks.map((c, i) => (
                <li key={i}>
                  <span className="ic">
                    <CheckIcon />
                  </span>
                  <p>{c}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export function StackSection({ badge, title, cards, hiw, foot, reveal = false }: StackSectionProps) {
  const root = useRef<HTMLElement>(null)
  const s1Ref = useRef<HTMLSpanElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const spans = useRef<HTMLElement[]>([])
  const cardEls = useRef<HTMLElement[]>([])
  const rowBaseH = useRef(0)
  const cubesRef = useRef<HTMLDivElement>(null)
  useRevealUp(root, reveal)
  // the stack cube strip springs open→flush on entry, same as the closing CTA
  // (the vanilla driver springs both rows). Reads its own rect, section-relative.
  useCubeSpring(cubesRef)

  // collect the word/card nodes once; arm the cardgrid cascade (progressive
  // enhancement — reduced motion keeps everything visible via web.css)
  useEffect(() => {
    const el = root.current
    if (!el) return
    spans.current = Array.from(el.querySelectorAll<HTMLElement>(".stack-title .w"))
    cardEls.current = Array.from(el.querySelectorAll<HTMLElement>(".stack-cardgrid .pcard"))
    gridRef.current?.classList.add("is-scrub")
    rowBaseH.current = gridRef.current?.getBoundingClientRect().height ?? 0
  }, [])

  // Title word-darken + card cascade, verbatim math from the vanilla driver, but
  // driven off the stage's per-frame `vh` and the elements' own live rects
  // (section-relative; no window.scrollY). Silent under reduced motion.
  useStageScroll(({ vh }) => {
    // subhead: darken words one-by-one from #d4d4d4 to black as they scroll up
    const first = s1Ref.current
    if (first && spans.current.length) {
      const r = first.getBoundingClientRect()
      const start = vh * 0.9,
        end = vh * 0.33
      let p = (start - r.top) / (start - end)
      p = p < 0 ? 0 : p > 1 ? 1 : p
      const n = Math.round(p * spans.current.length)
      spans.current.forEach((s, i) => s.classList.toggle("on", i < n))
    }
    // cards cascade in (left-first, slide from the right), 0->1 as the row travels
    // from "top at viewport bottom" to "centre at middle". Latch the COLLAPSED row
    // height so an open card doesn't shove the arrival point up-scroll.
    const grid = gridRef.current
    if (grid && cardEls.current.length) {
      if (!grid.querySelector(".pcard-inside.open")) rowBaseH.current = grid.getBoundingClientRect().height
      const r = grid.getBoundingClientRect()
      const h = rowBaseH.current
      const startP = vh,
        endP = vh / 2 - h / 2
      let p = startP === endP ? 1 : (startP - r.top) / (startP - endP)
      p = p < 0 ? 0 : p > 1 ? 1 : p
      const STAGGER = 0.18,
        SPAN = 0.46
      cardEls.current.forEach((c, i) => {
        let cp = (p - i * STAGGER) / SPAN
        cp = cp < 0 ? 0 : cp > 1 ? 1 : cp
        c.style.setProperty("--p", cp.toFixed(3))
      })
    }
  })

  return (
    <Section className="g-c">
      <section id="stack" className="stack" data-bar="white" data-dock="stack" ref={root}>
        <div className="stack-in">
          {/* title zone */}
          <div className="stack-head">
            <div className="stack-gutter l">
              <span className="xplus a" />
              <span className="xplus b" />
            </div>
            <div className="stack-head-in">
              <div className="stack-badges">
                <span className="pill pill-white reveal-up">
                  <span className="badge-num">{badge.num}</span> {badge.label}
                </span>
              </div>
              <div className="stack-title reveal-up" style={{ "--d": "100ms" } as React.CSSProperties}>
                <b>{title.headline}</b>
                <span className="s1" ref={s1Ref}>
                  <Words text={title.s1} />
                </span>
                <span className="s2">
                  <Words text={title.s2} />
                </span>
              </div>
            </div>
            <div className="stack-gutter r">
              <span className="xplus a" />
              <span className="xplus b" />
            </div>
          </div>

          {/* cards */}
          <div className="stack-cards">
            <div className="stack-cardgrid" ref={gridRef}>
              {cards.map((c, i) => (
                <Pcard card={c} key={i} />
              ))}
            </div>
          </div>

          {/* how it works — static. The vanilla pinned step-reveal is deferred: it
              can't get solo scroll space inside the ScrollStage's pin-and-stack
              (measured); see the web.css note. Steps render visible. */}
          <div className="hiw" id="how">
            <div className="hiw-pin">
              <div className="hiw-inner">
                <div className="hiw-head">
                  <h2 className="hiw-title reveal-up">{hiw.title}</h2>
                </div>
                <ol className="hiw-steps">
                  {hiw.steps.map((s, i) => (
                    <li className="hiw-step" key={i}>
                      <span className="hiw-num">{i + 1}</span>
                      <span className="hiw-sep" />
                      <span className="hiw-label">{s}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          {/* checklist + price */}
          <div className="stack-foot">
            <p className="stack-note">{foot.note}</p>
            <div className="cta-boxes cta-cubes stack-cubes reveal-up" style={{ "--d": "60ms" } as React.CSSProperties} aria-hidden="true" ref={cubesRef}>
              <span className="cube" />
              <span className="cube" />
              <span className="cube" />
              <span className="cube" />
            </div>
            <div className="stack-price">
              <div className="amt reveal-up">
                <span className="was">{foot.price.was}</span>
                <span className="now">{foot.price.now}</span>
                <span className="pill pill-green">{foot.price.save}</span>
              </div>
              <p className="stack-updates reveal-up" style={{ "--d": "100ms" } as React.CSSProperties}>
                {foot.updates}
              </p>
              <Cta href={foot.cta.href} className="reveal-up" style={{ "--d": "120ms" } as React.CSSProperties}>
                {foot.cta.label}
              </Cta>
            </div>
          </div>
        </div>
      </section>
    </Section>
  )
}
