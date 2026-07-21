/* ============================================================
   Qa — the marketing accordion (the vanilla site's .qa).

   A native <details>/<summary> disclosure, styled in web.css: a slide-open
   answer and a ringed plus/minus icon that pops on hover. Reused by the Problem,
   System (variant "dark") and FAQ sections. The plus/minus glyphs are the
   source's bespoke ringed icons (a faint r=10 circle + short strokes), kept
   verbatim because the hover pop animates their circle + path directly.

   Single-open grouping (opening one closes its siblings) is not here; it is a
   section concern (Problem has a lone disclosure, FAQ/System group theirs).
   ============================================================ */
import * as React from "react"

import { cn } from "@/lib/utils"

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

export interface QaProps {
  question: React.ReactNode
  children: React.ReactNode
  /** default (light), dark (on dark bands), about (slightly darker fill) */
  variant?: "default" | "dark" | "about"
  defaultOpen?: boolean
  className?: string
  style?: React.CSSProperties
  /** forwarded to <details> so a section can group/toggle (e.g. single-open) */
  onToggle?: React.ReactEventHandler<HTMLDetailsElement>
  ref?: React.Ref<HTMLDetailsElement>
}

export function Qa({ question, children, variant = "default", defaultOpen, className, style, onToggle, ref }: QaProps) {
  return (
    <details
      ref={ref}
      className={cn("qa", variant === "dark" && "qa-dark", variant === "about" && "qa-about", className)}
      style={style}
      open={defaultOpen}
      onToggle={onToggle}
    >
      <summary>
        <span className="q">{question}</span>
        <span className="icn">
          <span className="icn-plus">
            <svg {...svgProps}>
              <circle cx="12" cy="12" r="10" opacity=".4" />
              <path d="M12 8v8" />
              <path d="M8 12h8" />
            </svg>
          </span>
          <span className="icn-minus">
            <svg {...svgProps}>
              <circle cx="12" cy="12" r="10" opacity=".4" />
              <path d="M8 12h8" />
            </svg>
          </span>
        </span>
      </summary>
      <div className="a">{children}</div>
    </details>
  )
}
