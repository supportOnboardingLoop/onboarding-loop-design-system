/* ============================================================
   AboutSection (step 7) — "The source". Ported from protocol-stack/index.html
   (`#about`, markup 3500-3543): the founder text + a single `qa-about` disclosure
   (reusing the DS-side Qa, variant "about") on the left, the portrait + LinkedIn
   caption on the right, and the press-logo row below. A mostly-static section;
   reveal-up pieces animate in via useRevealUp. Content comes from the manifest.
   ============================================================ */
import * as React from "react"
import { useRef } from "react"

import { cn } from "@/lib/utils"
import { Section, useRevealUp } from "@/components/web/ScrollStage"
import { Qa } from "@/components/web/Qa"

export interface AboutSectionProps {
  badge: { num: string; label: string }
  headline: string
  body: string[]
  disclosure: { question: string; answer: string[] }
  photo: { src: string; alt: string }
  cap: { href: string; text: string; icon: string }
  press: { featured: string; logos: { src: string; alt: string; className?: string; underline?: string }[] }
  reveal?: boolean
}

export function AboutSection({ badge, headline, body, disclosure, photo, cap, press, reveal = false }: AboutSectionProps) {
  const root = useRef<HTMLElement>(null)
  useRevealUp(root, reveal)

  const d = (ms: number) => (reveal ? ({ "--d": `${ms}ms` } as React.CSSProperties) : undefined)

  return (
    <Section className="g-d">
      <section id="about" className="about" data-bar="paper" data-dock="source" ref={root}>
        <div className="about-in">
          <div className="about-main">
            <div className="about-text">
              <div className="about-hb">
                <span className={cn("pill pill-white", reveal && "reveal-up")}>
                  <span className="badge-num">{badge.num}</span> {badge.label}
                </span>
                <h2 className={cn(reveal && "reveal-up")} style={d(60)}>
                  {headline}
                </h2>
              </div>
              <div className={cn("about-body", reveal && "reveal-up")} style={d(120)}>
                {body.map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
                <Qa variant="about" question={disclosure.question}>
                  {disclosure.answer.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </Qa>
              </div>
            </div>
            <div className={cn("about-media", reveal && "reveal-up")} style={d(100)}>
              <img className="about-photo" src={photo.src} alt={photo.alt} />
              <a className="about-cap" href={cap.href} target="_blank" rel="noopener noreferrer" aria-label={cap.text}>
                <span>{cap.text}</span>
                <img src={cap.icon} alt="LinkedIn" />
              </a>
            </div>
          </div>
          <div className={cn("about-press", reveal && "reveal-up")} style={d(80)}>
            <p className="featured">{press.featured}</p>
            <div className="press-logos">
              {press.logos.map((l, i) => (
                <span key={i} className={cn("plogo", l.className)}>
                  <img src={l.src} alt={l.alt} />
                  {l.underline && <img className="underline" src={l.underline} alt="" />}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Section>
  )
}
