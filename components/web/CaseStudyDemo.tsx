/* ============================================================
   CaseStudyDemo — the "redesign" band: a split 50/50 head (Feijoa headline +
   editorial sub) over a wide, header-less live-demo box. The box embeds the live
   prototype and falls back to a recorded video on mobile, or when the embed can't
   render on desktop.

   Ported from protocol-stack/case-study-corebee.html (the .redesign section + the
   demo-fallback script 749-767). The demo-wrap breaks out wider than the text
   column (max 1800px), labels sit ABOVE the box, the box itself is header-less.
   data-bar="paper" themes the TopBar over this band.

   Fallback logic carried verbatim: on <=860px CSS shows the video and JS kicks
   playback; on desktop, if the iframe never fires `load` within 6s (or errors),
   it swaps in the video. Reveal: head + demo carry `.reveal-up` via useRevealUp.
   ============================================================ */
import * as React from "react"
import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"
import { useRevealUp } from "@/components/web/ScrollStage"

export interface CaseStudyDemoProps {
  heading: React.ReactNode
  sub: React.ReactNode
  demo: {
    embedSrc: string
    embedTitle: string
    openHref: string
    videoSrc: string
    poster: string
    label?: string
    /** CSS aspect-ratio of the box (default 16/10, the source value). */
    aspect?: string
  }
  reveal?: boolean
}

const OpenIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M7 17L17 7" />
    <path d="M8 7h9v9" />
  </svg>
)

export function CaseStudyDemo({ heading, sub, demo, reveal = false }: CaseStudyDemoProps) {
  const rootRef = useRef<HTMLElement>(null)
  const demoRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<HTMLIFrameElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  useRevealUp(rootRef, reveal)

  // recorded-video fallback on mobile / when the live embed can't render
  useEffect(() => {
    const box = demoRef.current
    const frame = frameRef.current
    const video = videoRef.current
    if (!box || !video) return
    const mq = window.matchMedia("(max-width:860px)")
    const playVid = () => {
      const pr = video.play?.()
      if (pr && pr.catch) pr.catch(() => {})
    }
    const useFallback = () => {
      box.classList.add("demo--fallback")
      playVid()
    }
    const sync = () => {
      if (mq.matches) playVid()
    }
    sync()
    mq.addEventListener("change", sync)

    let ok = false
    let timer: ReturnType<typeof setTimeout> | undefined
    const onLoad = () => {
      ok = true
    }
    if (frame && !mq.matches) {
      frame.addEventListener("load", onLoad)
      frame.addEventListener("error", useFallback)
      timer = setTimeout(() => {
        if (!ok && !mq.matches) useFallback()
      }, 6000)
    }
    return () => {
      mq.removeEventListener("change", sync)
      if (frame) {
        frame.removeEventListener("load", onLoad)
        frame.removeEventListener("error", useFallback)
      }
      if (timer) clearTimeout(timer)
    }
  }, [])

  const label = demo.label ?? "Live Demo"

  return (
    <section className="redesign" data-bar="paper" ref={rootRef}>
      <div className="cs-container">
        <div className="redesign-head">
          <h2 className={cn(reveal && "reveal-up")}>{heading}</h2>
          <p className={cn("cs-sub", reveal && "reveal-up")} style={reveal ? ({ "--d": "60ms" } as React.CSSProperties) : undefined}>
            {sub}
          </p>
        </div>
      </div>
      <div className={cn("demo-wrap", reveal && "reveal-up")} style={reveal ? ({ "--d": "120ms" } as React.CSSProperties) : undefined}>
        <div className="demo-bar">
          <span className="demo-lbl">
            <span className="dot" />
            {label}
          </span>
          <a className="demo-open" href={demo.openHref} target="_blank" rel="noopener">
            Open Full Screen
            <OpenIcon />
          </a>
        </div>
        <div className="demo" ref={demoRef} style={demo.aspect ? { aspectRatio: demo.aspect } : undefined}>
          <iframe
            className="demo-frame"
            src={demo.embedSrc}
            title={demo.embedTitle}
            loading="lazy"
            scrolling="no"
            ref={frameRef}
          />
          <video className="demo-video" muted loop playsInline preload="none" poster={demo.poster} ref={videoRef}>
            <source src={demo.videoSrc} type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  )
}
