/* product-kit — the handful of pieces the two commerce pages (/product DIY,
   /service DFY) share. Both are built in place from the same wireframe family and
   the same product.css, so this keeps them in lockstep without a premature
   component abstraction. A later componentization pass can promote these into the
   design system proper. */
import * as React from "react"
import { useRef } from "react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/base/button"
import { Qa } from "@/components/web/Qa"

/* The buy card's Get-started button is the real checkout. Stripe is not wired yet
   (refund/guarantee window + link are Bal decisions), so this is a FLAGGED
   placeholder: every "Get started" routes to the page's own buy card (#buy), which
   is the single checkout CTA. Swap this for the live Stripe link to go live. */
export const CHECKOUT_URL = "#buy"

export const primary = buttonVariants({ variant: "primary" })
export const secondary = buttonVariants({ variant: "secondary" })

/* A framed screenshot surface. With `src` it shows the real image; without, a
   clean labeled placeholder naming the asset Bal still needs (never a hatch).
   With `href` the whole frame is a link that opens in a new tab. */
export function Shot({
  src,
  alt,
  note,
  href,
  className,
}: {
  src?: string
  alt: string
  note?: string
  href?: string
  className?: string
}) {
  const inner = src ? (
    <img src={src} alt={alt} />
  ) : (
    <div className="prod-shot--ph">
      <span className="ph-tag">Screenshot</span>
      <span className="ph-note">{note}</span>
    </div>
  )
  if (href) {
    return (
      <a className={cn("prod-shot", className)} href={href} target="_blank" rel="noopener noreferrer" aria-label={alt}>
        {inner}
      </a>
    )
  }
  return <div className={cn("prod-shot", className)}>{inner}</div>
}

/* The FAQ accordion: DS <Qa> rows in a single-open group (opening one closes the
   others), matching FaqSection's handler. Used by both commerce pages. */
export function FaqList({ items }: { items: Array<{ q: React.ReactNode; a: React.ReactNode }> }) {
  const refs = useRef<Array<HTMLDetailsElement | null>>([])
  const onToggle = (i: number) => (e: React.SyntheticEvent<HTMLDetailsElement>) => {
    if (!e.currentTarget.open) return
    refs.current.forEach((o, j) => {
      if (j !== i && o && o.open) o.open = false
    })
  }
  return (
    <div className="prod-faq-list">
      {items.map((item, i) => (
        <Qa
          key={i}
          question={item.q}
          onToggle={onToggle(i)}
          ref={(el) => {
            refs.current[i] = el
          }}
        >
          {item.a}
        </Qa>
      ))}
    </div>
  )
}
