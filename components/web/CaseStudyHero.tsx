/* ============================================================
   CaseStudyHero — a case study's opening: a breadcrumb, a Feijoa display
   headline, an editorial sub, and the before/after comparison slider.

   Ported from protocol-stack/case-study-corebee.html (the .cs-hero section). The
   pieces rise in on load via the pure-CSS `.reveal` stagger (--d delays carried
   verbatim: crumb 60, h1 120, sub 180, slider 240). data-bar="white" tells the
   shared TopBar to paint its light theme while it sits over this section.

   Reusable across case studies: the copy + breadcrumb + slider images are props.
   ============================================================ */
import * as React from "react"

import { BeforeAfter, type BeforeAfterProps } from "@/components/web/BeforeAfter"

export interface CrumbItem {
  label: string
  href?: string
}

export interface CaseStudyHeroProps {
  crumb: CrumbItem[]
  title: React.ReactNode
  sub: React.ReactNode
  beforeAfter: BeforeAfterProps
}

const d = (ms: number) => ({ "--d": `${ms}ms` } as React.CSSProperties)

export function CaseStudyHero({ crumb, title, sub, beforeAfter }: CaseStudyHeroProps) {
  return (
    <section className="cs-hero dots" data-bar="white">
      <div className="cs-container">
        <p className="crumb reveal" style={d(60)}>
          {crumb.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="sep">/</span>}
              {c.href ? <a href={c.href}>{c.label}</a> : c.label}
            </React.Fragment>
          ))}
        </p>
        <h1 className="reveal" style={d(120)}>
          {title}
        </h1>
        <p className="cs-sub reveal" style={d(180)}>
          {sub}
        </p>
        <BeforeAfter {...beforeAfter} className="reveal" style={d(240)} />
      </div>
    </section>
  )
}
