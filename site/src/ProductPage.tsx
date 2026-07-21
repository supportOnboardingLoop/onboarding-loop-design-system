/* /product — "Do it yourself", $129. A React island mounted inside Base with the
   GLOBAL TopBar + Footer (product.astro). Built from the master build prompt +
   diy-page-ia-v3.html wireframe + diy-page-build-notes.md.

   Copy discipline (per the prompt): PLACEHOLDER copy is transplanted verbatim,
   self-describing lines and all; Bal writes the final copy after the build. Copy
   that is already real — the $129 price, "From download to plan in an afternoon",
   the FAQ questions, the inventory count-lines, "Pay once · free updates · no
   subscription" — stays verbatim.

   Components: the CTAs are the design system's Button rendered as anchors
   (buttonVariants), the FAQ reuses the DS <Qa> accordion, the arrows are the DS
   <Icon>. The page-specific layout (buy shell, inventory rows, results ad card)
   is built in place with product.css, tokens only, ready for a later
   componentization pass. */
import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon } from "@/components/base/icon"
import { DEMO_URL } from "@/components/web/site-nav"
import { CHECKOUT_URL, FaqList, Shot, primary, secondary } from "./product-kit"

const FAQ = [
  {
    q: "Is this software I install?",
    a: "Two or three lines answering plainly. This placeholder runs to the length a real answer would, so the section's rhythm and spacing read true in design.",
  },
  { q: "Is it a course?", a: "Two or three lines answering plainly, at roughly this length, no longer than this." },
  {
    q: "Which LLM do I need?",
    a: "Two lines naming the mainstream assistants and how the skill behaves in each, about this long.",
  },
  {
    q: "Couldn't I just ask my LLM to do this for free?",
    a: "Three lines answering the technical founder's real objection, honestly, at about this length so the answer has room to actually land rather than dodge.",
  },
  {
    q: "My product isn't live yet. Should I buy this?",
    a: "Two lines, honest about who gets the most from it, roughly this long.",
  },
  { q: "How do refunds and updates work?", a: "Two lines covering both plainly, at about this length." },
]

export default function ProductPage() {
  return (
    <>
      <div className="prod-shell">
        <div className="prod-main">
          {/* ── HERO ─────────────────────────────────────────────── */}
          <section className="prod-hero">
            <div className="kicker reveal" style={{ "--d": "20ms" } as React.CSSProperties}>
              Do it yourself
            </div>
            <h1 className="reveal" style={{ "--d": "60ms" } as React.CSSProperties}>
              A plain headline that says what the system actually is
            </h1>
            <p className="prod-sub reveal" style={{ "--d": "120ms" } as React.CSSProperties}>
              The complementary line: who this is for and the specific way it helps them, running to about this length
              and no longer.
            </p>
            <div className="prod-cta-row reveal" style={{ "--d": "180ms" } as React.CSSProperties}>
              <a className={primary} href="#buy">
                Get started
              </a>
              <a className={secondary} href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                Look at the demo
              </a>
            </div>

            <div className="prod-show3">
              <div className="prod-tile">
                <Shot
                  src="/assets/product/demo.png"
                  href={DEMO_URL}
                  alt="The live demo: the agency analytics workspace, opens in a new tab"
                  note="Live demo screenshot, links out"
                />
                <div className="prod-tile-label">The demo, running</div>
                <div className="prod-tile-sub">One line on what you're seeing</div>
              </div>
              <div className="prod-tile">
                <Shot src="/assets/covers/activation-cover.png" alt="A protocol cover, the Activation protocol" />
                <div className="prod-tile-label">The protocols</div>
                <div className="prod-tile-sub">One line on what you're seeing</div>
              </div>
              <div className="prod-tile">
                <Shot src="/assets/product/styleguide.png" alt="The Onboarding Loop design system style guide" />
                <div className="prod-tile-label">The design system</div>
                <div className="prod-tile-sub">One line on what you're seeing</div>
              </div>
            </div>
          </section>

          {/* ── LOGO STRIP (career proof) ────────────────────────── */}
          <section className="prod-logos">
            <p className="prod-logos-cap">A short career-proof caption sits here, one line</p>
            <div className="prod-logostrip">
              <img src="/assets/logos/Google.svg" alt="Google" />
              <img src="/assets/logos/Microsoft.svg" alt="Microsoft" />
              <img src="/assets/logos/Intel.svg" alt="Intel" />
              <img src="/assets/logos/Couchbase.svg" alt="Couchbase" />
              <img src="/assets/logos/Nokia.svg" alt="Nokia" />
            </div>
          </section>

          {/* ── WHAT'S INSIDE (3 inventory rows) ─────────────────── */}
          <section>
            <div className="kicker">What's inside</div>
            <h2>A headline framing the three things you get</h2>
            <p className="prod-sub">A subline that sets up the inventory in one sentence of roughly this length.</p>

            <div className="prod-inv">
              <div className="prod-invrow">
                <div>
                  <h3>The protocols</h3>
                  <div className="prod-count">4 documents · PDF, MD, and readable web pages</div>
                  <p className="prod-desc">
                    Two lines defining what a protocol is on first use and what the four cover: activation, retention,
                    expansion, and the pattern library. Sales register, concrete, about this long in total.
                  </p>
                </div>
                <div className="prod-invmedia">
                  <Shot src="/assets/covers/retention-cover.png" alt="A protocol spread, the Retention protocol cover" />
                </div>
              </div>

              <div className="prod-invrow">
                <div>
                  <h3>The Claude skill</h3>
                  <div className="prod-count">1 skill file · runs as a prompt in any LLM</div>
                  <p className="prod-desc">
                    Two lines on what happens when you load it: your favorite LLM interviews you about your product, then
                    the two of you build your onboarding plan together. About this long.
                  </p>
                </div>
                <div className="prod-invmedia">
                  <Shot note="Chat screenshot, a real interview exchange" alt="The Claude skill running an interview" />
                </div>
              </div>

              <div className="prod-invrow">
                <div>
                  <h3>The design system</h3>
                  <div className="prod-count">Style guide + working React components · GitHub access</div>
                  <p className="prod-desc">
                    Two lines: the same system that powers this site and the demo, including the agent-led onboarding
                    component, ready to carry the redesign your plan may call for. About this long.
                  </p>
                </div>
                <div className="prod-invmedia">
                  <Shot
                    src="/assets/product/styleguide.png"
                    alt="The Onboarding Loop design system style guide and components"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ── HOW IT WORKS (numbered rail) ─────────────────────── */}
          <section>
            <div className="kicker">How it works</div>
            <h2>From download to plan in an afternoon</h2>
            <div className="prod-steps">
              <div className="prod-step">
                <div className="prod-step-num">01</div>
                <div>
                  <h4>Feed it to your favorite LLM</h4>
                  <p>One concrete line describing the literal action, about this long.</p>
                </div>
              </div>
              <div className="prod-step">
                <div className="prod-step-num">02</div>
                <div>
                  <h4>It interviews you</h4>
                  <p>One line on the interview: what it asks about your product and your users.</p>
                </div>
              </div>
              <div className="prod-step">
                <div className="prod-step-num">03</div>
                <div>
                  <h4>Your plan comes out</h4>
                  <p>One line naming what the plan contains, in plain words a stranger restates correctly.</p>
                </div>
              </div>
              <div className="prod-step">
                <div className="prod-step-num">04</div>
                <div>
                  <h4>Build with the system</h4>
                  <p>One line: ship the first fix with the components, redesigning screens where the plan calls for it.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── FOUNDER ──────────────────────────────────────────── */}
          <section>
            <div className="prod-founder">
              <div className="prod-founder-photo">
                <img src="/assets/Balabout.png" alt="Bal Sieber, founder of Onboarding Loop" />
              </div>
              <div>
                <div className="kicker">Who made this</div>
                <h2 className="prod-h2-sm">A bio headline of roughly this length</h2>
                <p className="prod-desc">
                  Two lines: twenty years across marketing and product, and the fact that this is the working system
                  behind the client business. Shorter than the About-page bio, about this long in total.
                </p>
              </div>
            </div>
          </section>

          {/* ── RESULTS (one big Corebee ad card) ────────────────── */}
          <section>
            <div className="kicker">Results</div>
            <h2>A headline introducing the proof</h2>
            <a className="prod-result" href="/case-study-corebee">
              <div className="prod-result-media">
                <img
                  src="/assets/corebee/corebee-after.png"
                  alt="Corebee's redesigned agent workspace, setup as a guided conversation"
                />
              </div>
              <div className="prod-result-body">
                <p className="prod-quote">
                  “The prototype did what a document couldn't. I watched my own setup flow work before a single line of
                  code existed.”
                </p>
                <p className="prod-attr">Jonathan Barr · Founder · Corebee</p>
                <div className="prod-stats">
                  <div className="prod-stat">
                    <b>69/100</b>
                    <span>activation score</span>
                  </div>
                  <div className="prod-stat">
                    <b>19</b>
                    <span>screens audited</span>
                  </div>
                  <div className="prod-stat">
                    <b>1 week</b>
                    <span>start to prototype</span>
                  </div>
                </div>
                <span className="prod-result-link">
                  Read the Corebee story
                  <Icon name="arrow-right" size={18} />
                </span>
              </div>
            </a>
          </section>

          {/* ── FAQ ──────────────────────────────────────────────── */}
          <section className="prod-faq">
            <div className="kicker">FAQ</div>
            <h2>A plain FAQ headline</h2>
            <FaqList items={FAQ} />
          </section>
        </div>

        {/* ── STICKY BUY RAIL ────────────────────────────────────── */}
        <aside className="prod-buyrail">
          <div className="prod-buycard" id="buy">
            <div className="prod-pname">Onboarding Loop · Do it yourself</div>
            <div className="prod-price">
              $129 <small>one-time</small>
            </div>
            <p className="prod-terms">Pay once · free updates · no subscription</p>
            <a className={cn(primary, "w-full h-12 text-md")} href={CHECKOUT_URL}>
              Get started
            </a>
            <div className="prod-inc">
              <div>The protocols · 4 documents</div>
              <div>The Claude skill</div>
              <div>The design system · GitHub access</div>
              <div>Free updates, forever</div>
            </div>
            <p className="prod-fineprint">Stripe checkout · instant access · refund line</p>
          </div>
        </aside>
      </div>

      {/* ── CROSS-LINK BAND (single band to the done-for-you page) ── */}
      <section className="prod-cross">
        <div className="prod-cross-in">
          <div>
            <h3>One sentence asking if they'd rather have it done for them</h3>
            <p>A supporting line of about this length naming what the done-for-you adds and its price.</p>
          </div>
          <a className={secondary} href="/service">
            Done for you · $750
            <Icon name="arrow-right" size={18} />
          </a>
        </div>
      </section>

      {/* ── MOBILE BUY BAR (fixed) ─────────────────────────────── */}
      <div className="prod-buybar">
        <div className="prod-buybar-price">
          $129 <span>one-time</span>
        </div>
        <a className={cn(primary, "nav-btn")} href={CHECKOUT_URL}>
          Get started
        </a>
      </div>
    </>
  )
}
