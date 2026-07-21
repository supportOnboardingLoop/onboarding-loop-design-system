/* ============================================================
   BlueprintQuote — the framed blueprint testimonial: a dot-grid frame with
   blueprint crop-mark rails + corner crosshairs, a client lockup, a big Feijoa
   pull-quote (with a flipped opening mark), and an avatar + name + stat.

   Standalone + presentational (no ScrollStage coupling), so it drops into any
   page. Ported from protocol-stack/case-study-corebee.html (the .quote section);
   the frame + type reuse the shared `.quote*` styles in web.css (step 8). Two
   variants over that base:
     - `brand.name` present -> the client brand lockup (mark + wordmark,
       `.quote-brand`); absent -> a plain logo (`.quote-logo`, the landing style).
     - `bottomRails` -> the bottom frame rails run 40px DOWN into the next section
       (matching the top) with corner crosshairs, via `.quote--cs`.

   Reveal: the brand, quote, and attribution carry `.reveal-up`; a root-scoped
   useRevealUp lights them on entry when `reveal`.

   Note: the landing's QuoteSection still inlines its own `.quote` markup (it is
   fused with the testimonial carousel in one ScrollStage group); it could later
   delegate its first sub-section to this component. Left as a follow-up to avoid
   re-verifying that validated page in this pass.
   ============================================================ */
import * as React from "react"
import { useRef } from "react"

import { cn } from "@/lib/utils"
import { useRevealUp } from "@/components/web/ScrollStage"

export interface BlueprintQuoteProps {
  brand: { logo: { src: string; alt: string }; name?: React.ReactNode }
  /** the pull-quote text AFTER the opening mark (the flipped `"` is prepended). */
  quote: React.ReactNode
  avatar: { src: string; alt: string }
  name: React.ReactNode
  stat: React.ReactNode
  /** run the bottom frame rails 40px into the next section + add crosshairs. */
  bottomRails?: boolean
  dataBar?: "white" | "paper" | "dark"
  /** decorative data-dock passthrough (the landing tags this group "proof"). */
  dock?: string
  reveal?: boolean
}

const d = (ms: number) => ({ "--d": `${ms}ms` } as React.CSSProperties)

export function BlueprintQuote({
  brand,
  quote,
  avatar,
  name,
  stat,
  bottomRails = false,
  dataBar = "white",
  dock,
  reveal = false,
}: BlueprintQuoteProps) {
  const rootRef = useRef<HTMLElement>(null)
  useRevealUp(rootRef, reveal)

  return (
    <section className={cn("quote", bottomRails && "quote--cs")} data-bar={dataBar} data-dock={dock} ref={rootRef}>
      <div className="quote-outer">
        <div className="quote-frame">
          {/* blueprint crop-mark rails */}
          <span className="cm v tl-v" />
          <span className="cm v tr-v" />
          <span className="cm v bl-v" />
          <span className="cm v br-v" />
          {/* corner crosshairs where the rails cross the section dividers */}
          <span className="xplus l" />
          <span className="xplus r" />
          {bottomRails && (
            <>
              <span className="xplus bl" />
              <span className="xplus br" />
            </>
          )}

          <div className="quote-content">
            {brand.name ? (
              <span className={cn("quote-brand", reveal && "reveal-up")}>
                <img src={brand.logo.src} alt={brand.logo.alt} />
                <span>{brand.name}</span>
              </span>
            ) : (
              <img className={cn("quote-logo", reveal && "reveal-up")} src={brand.logo.src} alt={brand.logo.alt} />
            )}

            <p className={cn("quote-text", reveal && "reveal-up")} style={reveal ? d(60) : undefined}>
              <span className="oq">&quot;</span>
              {quote}
            </p>

            <div className={cn("quote-attr", reveal && "reveal-up")} style={reveal ? d(120) : undefined}>
              <img className="quote-avatar" src={avatar.src} alt={avatar.alt} />
              <div className="quote-who">
                <p className="name">{name}</p>
                <p className="stat">{stat}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
