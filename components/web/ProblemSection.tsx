/* ============================================================
   ProblemSection — the scroll group (.g-problem): a paper band framing a white
   content box (badge + display headline + two-column body with a disclosure).

   A section: registers with the ScrollStage (via <Section>), takes all copy as
   props, and reveals its own .reveal-up pieces via useRevealUp (intersection,
   scoped to its root, so it works standalone). The disclosure is the reusable
   Qa; when it opens it grows the group, and the stage's ResizeObserver re-pins
   automatically (no per-section relayout wiring).
   ============================================================ */
import * as React from "react"
import { useRef } from "react"

import { cn } from "@/lib/utils"
import { Section, useRevealUp } from "@/components/web/ScrollStage"
import { Qa } from "@/components/web/Qa"

export interface ProblemSectionProps {
  eyebrow: { num: string; label: string }
  title: string
  lead: React.ReactNode
  disclosure: { question: React.ReactNode; answer: React.ReactNode }
  reveal?: boolean
}

export function ProblemSection({ eyebrow, title, lead, disclosure, reveal = false }: ProblemSectionProps) {
  const root = useRef<HTMLElement>(null)
  useRevealUp(root, reveal)

  return (
    <Section className="g-problem">
      <section className="problem" id="problem" data-bar="paper" data-dock="problem" ref={root}>
        <div className="problem-in">
          <div className="problem-frame">
            <span className="cm pl-l" aria-hidden="true" />
            <span className="cm pl-r" aria-hidden="true" />
            <span className={cn("pill", "pill-white", reveal && "reveal-up")}>
              <span className="badge-num">{eyebrow.num}</span> {eyebrow.label}
            </span>
            <div className={cn("problem-cols", reveal && "reveal-up")} style={reveal ? ({ "--d": "60ms" } as React.CSSProperties) : undefined}>
              <div className="problem-left">
                <h2 className="problem-title">{title}</h2>
              </div>
              <div className="problem-right">
                <p className="problem-lead">{lead}</p>
                <Qa question={disclosure.question}>{disclosure.answer}</Qa>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Section>
  )
}
