/* ============================================================
   LegalPage — the shared prose-page template (Terms, Privacy, and any future
   policy/prose page). Ported from protocol-stack/terms-of-service.html: a hero
   (badge + Feijoa title + "last updated" + lead), a dashed rule, then a two-column
   body — a sticky "on this page" tab rail (auto-built from the sections) beside the
   prose sections.

   It lives in the component library and is composed inside PageShell (which
   supplies the shared header + footer), so a page is just its content: the caller
   passes { badge, title, updated, lead, sections }. Each section carries an id +
   nav label (for the rail) and its title + body (React nodes, so prose keeps its
   links / lists / emphasis). Owns the scroll-spy that lights the active tab —
   ported verbatim from the source's IntersectionObserver.
   ============================================================ */
import * as React from "react"
import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"

export interface LegalSection {
  id: string
  /** the section heading, and (by default) the tab label in the rail */
  title: string
  /** optional shorter tab label; falls back to `title` */
  label?: string
  body: React.ReactNode
}

export interface LegalPageProps {
  badge: string
  title: string
  updated: string
  lead: React.ReactNode
  sections: LegalSection[]
}

export function LegalPage({ badge, title, updated, lead, sections }: LegalPageProps) {
  const navRef = useRef<HTMLElement>(null)

  // Highlight the sticky tab whose section is in view — verbatim from the source:
  // an IntersectionObserver whose callback re-picks the topmost section currently
  // intersecting the viewport (bottom past the header, top above mid-viewport).
  useEffect(() => {
    const nav = navRef.current
    if (!nav) return
    const links = Array.from(nav.querySelectorAll<HTMLAnchorElement>("a"))
    const secs = links
      .map((a) => document.getElementById(a.getAttribute("href")!.slice(1)))
      .filter((s): s is HTMLElement => !!s)
    if (!("IntersectionObserver" in window) || !secs.length) return
    const setActive = (id: string) => {
      links.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + id))
    }
    const io = new IntersectionObserver(
      () => {
        let top: { id: string; top: number } | null = null
        secs.forEach((s) => {
          const r = s.getBoundingClientRect()
          if (r.bottom > 96 && r.top < window.innerHeight * 0.5) {
            if (top === null || r.top < top.top) top = { id: s.id, top: r.top }
          }
        })
        if (top) setActive(top.id)
      },
      { rootMargin: "-88px 0px -55% 0px", threshold: [0, 1] },
    )
    secs.forEach((s) => io.observe(s))
    return () => io.disconnect()
  }, [])

  return (
    <>
      {/* HERO */}
      <section className="lp-hero">
        <div className="lp-hero-in">
          <div className="badge reveal" style={{ "--d": "60ms" } as React.CSSProperties}>
            {badge}
          </div>
          <h1 className="reveal" style={{ "--d": "130ms" } as React.CSSProperties}>
            {title}
          </h1>
          <p className="lp-updated reveal" style={{ "--d": "200ms" } as React.CSSProperties}>
            {updated}
          </p>
          <p className="lp-lead reveal" style={{ "--d": "260ms" } as React.CSSProperties}>
            {lead}
          </p>
        </div>
      </section>

      <div className="lp-rule" />

      {/* BODY */}
      <div className="lp-body">
        <div className="lp-body-in">
          <aside className="lp-nav" aria-label="On this page" ref={navRef}>
            {sections.map((s, i) => (
              <a key={s.id} href={`#${s.id}`} className={cn(i === 0 && "is-active")}>
                {s.label ?? s.title}
              </a>
            ))}
          </aside>

          <div className="lp-content">
            {sections.map((s) => (
              <section key={s.id} id={s.id} className="lp-section">
                <h2>{s.title}</h2>
                <div className="lp-prose">{s.body}</div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
