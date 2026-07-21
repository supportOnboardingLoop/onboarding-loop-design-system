/* ============================================================
   SystemSection — the dark scroll group (.g-b): the pitch (badge + Feijoa
   headline + sub + agent line + two dark accordions) on the left, the stacked
   loop-levels graphic on the right. The agent-led animation is a second
   subsection of this band, added in step 5.

   A section: registers with the stage, takes copy as props, reveals its own
   .reveal-up pieces. It drives two motions from the stage's per-frame signal:
   the graphic's --spread scrub (reading the graphic's own rect, section-relative)
   and single-open accordion grouping (opening one dark disclosure closes the
   others, matching the source). Accordion height changes re-pin via the stage's
   ResizeObserver.
   ============================================================ */
import * as React from "react"
import { useRef } from "react"

import { cn } from "@/lib/utils"
import { Section, useStageScroll, useRevealUp } from "@/components/web/ScrollStage"
import { Qa } from "@/components/web/Qa"
import { SystemGraphic } from "@/components/web/SystemGraphic"

export interface SystemSectionProps {
  eyebrow: { num: string; label: string }
  headline: string
  sub: string
  agentLine: React.ReactNode
  disclosures: Array<{ question: React.ReactNode; answer: React.ReactNode }>
  /** the agent-led animation — the 2nd subsection of this dark band (step 5) */
  agent?: React.ReactNode
  reveal?: boolean
}

// graphic spread scrub, verbatim from the source: fan wide open (ENTRY) while
// low, settle to moderate overlap (spread 0) then pack (-PACK) by the top.
const ENTRY = 18
const PACK = 28

export function SystemSection({ eyebrow, headline, sub, agentLine, disclosures, agent, reveal = false }: SystemSectionProps) {
  const root = useRef<HTMLElement>(null)
  const graphicRef = useRef<HTMLDivElement>(null)
  const detailsRefs = useRef<(HTMLDetailsElement | null)[]>([])

  useRevealUp(root, reveal)

  // single-open: when one dark accordion opens, close any sibling still open
  const onToggle = (i: number) => (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    const d = e.currentTarget
    if (!d.open) return
    detailsRefs.current.forEach((o, j) => {
      if (j !== i && o && o.open) o.open = false
    })
  }

  // graphic --spread scrub, driven off the graphic's live position (the stage
  // provides vh; this section reads its own child's rect — section-relative,
  // no window.scrollY). Silent under reduced motion, so --spread rests at 0.
  useStageScroll(({ vh }) => {
    const g = graphicRef.current
    if (!g) return
    const r = g.getBoundingClientRect()
    let p = (vh * 0.62 - r.top) / (vh * 0.62 + 40)
    p = p < 0 ? 0 : p > 1 ? 1 : p
    const e = p * p * (3 - 2 * p) // smoothstep
    const spread = ENTRY - (ENTRY + PACK) * e
    g.style.setProperty("--spread", spread.toFixed(2) + "px")
  })

  return (
    <Section className="g-b">
      <section id="system" className="system" data-bar="dark" data-dock="system" ref={root}>
        <div className="system-in">
          <div className="system-main">
            <div className={cn("system-hb", reveal && "reveal-up")}>
              <span className="system-badge">
                <span className="badge-num">{eyebrow.num}</span> {eyebrow.label}
              </span>
              <h2>{headline}</h2>
              <p className="system-sub">{sub}</p>
            </div>
            <p className={cn("system-agent", reveal && "reveal-up")} style={reveal ? ({ "--d": "60ms" } as React.CSSProperties) : undefined}>
              {agentLine}
            </p>
            {disclosures.map((d, i) => (
              <Qa
                key={i}
                variant="dark"
                question={d.question}
                className={reveal ? "reveal-up" : undefined}
                style={reveal ? ({ "--d": `${80 + i * 40}ms` } as React.CSSProperties) : undefined}
                ref={(el) => {
                  detailsRefs.current[i] = el
                }}
                onToggle={onToggle(i)}
              >
                {d.answer}
              </Qa>
            ))}
          </div>
          <div className={cn("system-visual", reveal && "reveal-up")} style={reveal ? ({ "--d": "120ms" } as React.CSSProperties) : undefined}>
            {/* crosshair where the cubes/text vertical rule meets the divider to the agent-led subsection below */}
            <span className="xplus sys-plus-b" aria-hidden="true" />
            <SystemGraphic ref={graphicRef} />
          </div>
        </div>
        {agent}
      </section>
    </Section>
  )
}
