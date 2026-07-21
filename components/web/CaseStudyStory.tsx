/* ============================================================
   CaseStudyStory — the case study's narrative block: a sticky meta rail (client
   lockup + Product/Stage/Engagement/Timeline) beside the body (Challenge /
   Solution / Results / Deliverables in dashed-ruled 2-up rows), then an optional
   "what went wrong" section with an embedded interactive Figma board.

   Ported from protocol-stack/case-study-corebee.html (the .story section). The
   rail is `position: sticky` (top 153px = header 73 + rail pad 80) so it freezes
   while the body scrolls past; on the paper-tinted band it bleeds full-width left
   via a ::before behind the isolated cell. data-bar="paper" themes the TopBar.

   Reveal: the rail, each body row, the WW block, and the Figma embed each carry
   `.reveal-up`; the component's own root-scoped observer (useRevealUp) lights them
   as they enter, one-shot, matching the source's IntersectionObserver.

   Config-driven so it is reusable across case studies: meta rows, story blocks,
   the WW items, and the Figma embed are all props. `DeliverablesList` is exported
   for the green duotone-check bullets used inside the Deliverables block.
   ============================================================ */
import * as React from "react"
import { useRef } from "react"

import { cn } from "@/lib/utils"
import { useRevealUp } from "@/components/web/ScrollStage"

export interface MetaRow {
  k: React.ReactNode
  v: React.ReactNode
}

export interface StoryBlock {
  k: React.ReactNode
  v: React.ReactNode
  /** render `v` directly, without the `.block-v` text wrapper (e.g. a list). */
  raw?: boolean
}

export interface WrongItem {
  k: React.ReactNode
  v: React.ReactNode
}

export interface FigmaEmbed {
  label: string
  /** the "Open in Figma" board URL (new tab). */
  openHref: string
  /** the embed.figma.com iframe src. */
  embedSrc: string
  title: string
}

export interface CaseStudyStoryProps {
  brand: { logo: { src: string; alt: string }; name: React.ReactNode }
  meta: MetaRow[]
  /** story blocks, laid out two per dashed-ruled row (source has 4 -> 2 rows). */
  blocks: StoryBlock[]
  wrong?: { title: React.ReactNode; lead: React.ReactNode; items: WrongItem[] }
  figma?: FigmaEmbed
  reveal?: boolean
}

// Green duotone circle-check bullet — same icon as the landing's deliverables.
const CheckBullet = () => (
  <span className="ic">
    <svg viewBox="0 0 24 24" fill="none">
      <path
        opacity=".4"
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M7.5 12L10.5 15L16.5 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </span>
)

export function DeliverablesList({ items }: { items: React.ReactNode[] }) {
  return (
    <ul className="deliv-list">
      {items.map((it, i) => (
        <li key={i}>
          <CheckBullet />
          <span>{it}</span>
        </li>
      ))}
    </ul>
  )
}

// arrow-out-of-box glyph for "Open in Figma"
const OpenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7 17L17 7" />
    <path d="M8 7h9v9" />
  </svg>
)

export function CaseStudyStory({ brand, meta, blocks, wrong, figma, reveal = false }: CaseStudyStoryProps) {
  const rootRef = useRef<HTMLElement>(null)
  useRevealUp(rootRef, reveal)

  // chunk the blocks into rows of two (the source lays them 2-up)
  const rows: StoryBlock[][] = []
  for (let i = 0; i < blocks.length; i += 2) rows.push(blocks.slice(i, i + 2))

  return (
    <section className="story" data-bar="paper" ref={rootRef}>
      <div className="story-grid">
        <aside className="story-meta">
          <div className={cn("story-meta-in", reveal && "reveal-up")}>
            <span className="cb-logo">
              <img src={brand.logo.src} alt={brand.logo.alt} />
              <span>{brand.name}</span>
            </span>
            {meta.map((m, i) => (
              <div className="meta-row" key={i}>
                <div className="meta-k">{m.k}</div>
                <div className="meta-v">{m.v}</div>
              </div>
            ))}
          </div>
        </aside>

        <div className="story-body">
          {rows.map((row, ri) => (
            <div className={cn("sb-row", reveal && "reveal-up")} key={ri}>
              {row.map((b, bi) => (
                <div key={bi}>
                  <div className="block-k">{b.k}</div>
                  {b.raw ? b.v : <div className="block-v">{b.v}</div>}
                </div>
              ))}
            </div>
          ))}

          {wrong && (
            <div className={cn("ww", reveal && "reveal-up")}>
              <h2 className="ww-title">{wrong.title}</h2>
              <p className="ww-lead">{wrong.lead}</p>
              {wrong.items.map((it, i) => (
                <div className="ww-item" key={i}>
                  <div className="k">{it.k}</div>
                  <div className="v">{it.v}</div>
                </div>
              ))}

              {figma && (
                <div className={cn("fig-embed", reveal && "reveal-up")}>
                  <div className="fig-bar">
                    <span className="fig-lbl">{figma.label}</span>
                    <a className="fig-open" href={figma.openHref} target="_blank" rel="noopener">
                      Open in Figma
                      <OpenIcon />
                    </a>
                  </div>
                  <div className="fig-box">
                    <iframe className="fig-frame" src={figma.embedSrc} title={figma.title} allowFullScreen loading="lazy" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
