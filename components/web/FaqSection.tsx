/* ============================================================
   FaqSection (step 9) — the answers group (`.g-e`, #faq). Ported from
   protocol-stack/index.html (markup 3620-3688, CSS 431-506): a two-column
   layout — heading + sub on the left, the accordion list on the right.

   Reuses the DS-side Qa component (base/light variant). This is a SINGLE-OPEN
   group: opening one row closes its siblings (the source's singleOpen at JS
   ~4098) — copied from SystemSection's onToggle handler. Content comes from the
   manifest; an answer is either a string (raw text in `.a`) or an array of
   strings (each a `<p>`, matching the source's multi-paragraph PDFs answer).
   ============================================================ */
import * as React from "react"
import { useRef } from "react"

import { cn } from "@/lib/utils"
import { Section, useRevealUp } from "@/components/web/ScrollStage"
import { Qa } from "@/components/web/Qa"

export interface FaqItem {
  q: React.ReactNode
  a: React.ReactNode | React.ReactNode[]
  open?: boolean
}

export interface FaqSectionProps {
  badge: { num: string; label: string }
  title: string
  sub: string
  items: FaqItem[]
  reveal?: boolean
}

export function FaqSection({ badge, title, sub, items, reveal = false }: FaqSectionProps) {
  const root = useRef<HTMLElement>(null)
  const detailsRefs = useRef<Array<HTMLDetailsElement | null>>([])
  useRevealUp(root, reveal)

  // single-open: when one row opens, close any sibling still open (verbatim from
  // SystemSection — the source groups the FAQ .qa the same way).
  const onToggle = (i: number) => (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    const d = e.currentTarget
    if (!d.open) return
    detailsRefs.current.forEach((o, j) => {
      if (j !== i && o && o.open) o.open = false
    })
  }

  return (
    <Section className="g-e">
      <section id="faq" className="faq" data-bar="white" data-dock="faq" ref={root}>
        <div className="faq-in">
          <div className={cn("faq-head", reveal && "reveal-up")}>
            <div className="faq-hb">
              <span className="faq-badge">
                <span className="badge-num">{badge.num}</span> {badge.label}
              </span>
              <h2>{title}</h2>
            </div>
            <p className="sub">{sub}</p>
          </div>

          <div className={cn("faq-list", reveal && "reveal-up")} style={reveal ? ({ "--d": "80ms" } as React.CSSProperties) : undefined}>
            {items.map((item, i) => (
              <Qa
                key={i}
                question={item.q}
                defaultOpen={item.open}
                ref={(el) => {
                  detailsRefs.current[i] = el
                }}
                onToggle={onToggle(i)}
              >
                {Array.isArray(item.a) ? item.a.map((p, j) => <p key={j}>{p}</p>) : item.a}
              </Qa>
            ))}
          </div>
        </div>
      </section>
    </Section>
  )
}
