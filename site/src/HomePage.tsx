/* / (home) — five screens, huge display type, one idea per screen, generous air
   (the Polsia rhythm). Rendered as static HTML inside Base with the GLOBAL
   TopBar + Footer (index.astro); no client hydration needed — every screen is a
   sentence plus at most one element, and the only behaviors are anchor links and
   CSS hover. Built from the master build prompt + home-ia-v1.html.

   Copy discipline: PLACEHOLDER copy is transplanted verbatim; real copy (the
   $129 / $750 prices) stays verbatim. The fork routes to /product and /service;
   the header's Get Started routes here to #fork. */
import * as React from "react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/base/button"
import { DEMO_URL } from "@/components/web/site-nav"

const lgPrimary = buttonVariants({ variant: "primary", size: "lg" })
const lgSecondary = buttonVariants({ variant: "secondary", size: "lg" })

export default function HomePage() {
  return (
    <>
      {/* SCREEN 1 · the one-liner */}
      <section className="home-screen home-s1" data-bar="white">
        <div className="home-wrap">
          <h1 className="home-display reveal" style={{ "--d": "40ms" } as React.CSSProperties}>
            The one-liner: the outcome a stranger can't misread, in one sentence this size
          </h1>
          <p className="home-sub reveal" style={{ "--d": "120ms" } as React.CSSProperties}>
            One short supporting line, no longer than this, that names who it's for.
          </p>
          <div className="home-cta-row reveal" style={{ "--d": "180ms" } as React.CSSProperties}>
            <a className={lgPrimary} href="#fork">
              A CTA that forks below
            </a>
            <a className={lgSecondary} href={DEMO_URL} target="_blank" rel="noopener noreferrer">
              Look at the demo
            </a>
          </div>
        </div>
      </section>

      {/* SCREEN 2 · the problem, one sentence */}
      <section className="home-screen home-s2" data-bar="paper">
        <div className="home-wrap">
          <p className="home-display">One sentence naming the problem: signups arrive, most quit before they pay.</p>
        </div>
      </section>

      {/* SCREEN 3 · what it is, one sentence + the demo */}
      <section className="home-screen" data-bar="white">
        <div className="home-wrap">
          <p className="home-display">One sentence saying what Onboarding Loop is, in the plainest words we own.</p>
          {/* the demo as a linking still — the proof is watching it run */}
          <a className="home-demo" href={DEMO_URL} target="_blank" rel="noopener noreferrer" aria-label="Watch the demo run">
            <img src="/assets/product/demo.png" alt="The Onboarding Loop demo: the agency analytics workspace, running" />
          </a>
        </div>
      </section>

      {/* SCREEN 4 · the fork */}
      <section className="home-screen home-s2" id="fork" data-bar="paper">
        <div className="home-wrap">
          <p className="home-display">One sentence setting up the choice: two ways to get it.</p>
          <div className="home-fork">
            <div className="home-fork-card">
              <div className="home-fk">Do it yourself</div>
              <div className="home-fprice">
                $129 <small>one-time</small>
              </div>
              <p>One line on this route, about this long: the system in your hands, your favorite LLM, an afternoon.</p>
              <a className={cn(lgPrimary, "home-cta-full")} href="/product">
                See the product
              </a>
            </div>
            <div className="home-fork-card">
              <div className="home-fk">Done for you</div>
              <div className="home-fprice">
                $750 <small>one-time</small>
              </div>
              <p>One line on this route, about this long: built on your product by the person who made the system, in three days.</p>
              <a className={cn(lgSecondary, "home-cta-full")} href="/service">
                See the product
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* SCREEN 5 · the door to the full story */}
      <section className="home-about" data-bar="white">
        <div className="home-wrap">
          <p className="home-display">One inviting sentence pointing to the full story on the About page.</p>
          <div className="home-cta-row">
            <a className={lgSecondary} href="/system">
              The full story
            </a>
          </div>
        </div>
      </section>
    </>
  )
}
