/* /service — "Done for you", $1,500 → $750. A React island mounted inside Base
   with the GLOBAL TopBar + Footer (service.astro). Built from the master build
   prompt + dfy-page-ia-v1.html wireframe; the DIY build notes' global rules apply.

   Copy discipline: PLACEHOLDER copy is transplanted verbatim; real copy (the
   $1,500→$750 price, "Delivered in 3 days", the FAQ questions, the deliverable
   count-lines) stays verbatim. The prototype-honesty rule is HARD and is carried
   exactly as written: the deliverable is an interactive prototype built on
   screenshots of their product with the real agent on top; their engineers wire
   it in. Nothing here implies we ship code into their live product.

   Shares the buy shell, deliverable rows, results card, FAQ, cross-link band, and
   mobile buy bar with /product via product.css + product-kit. */
import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon } from "@/components/base/icon"
import { CHECKOUT_URL, FaqList, Shot, primary, secondary } from "./product-kit"

const CASE_STUDY = "/case-study-corebee"

const FAQ = [
  {
    q: "Do you write code into my product?",
    a: "Two or three lines answering the prototype-on-screenshots scope honestly, at about the length a real answer needs so nothing feels dodged.",
  },
  {
    q: "What do you need from me?",
    a: "Two lines: the short intake, access to sign up for the product, roughly this long.",
  },
  {
    q: "Why is it $750 right now?",
    a: "Two or three lines stating the early-clients reason plainly: the standing price is $1,500, this window buys the case-study shelf. About this long.",
  },
  {
    q: "What happens after delivery?",
    a: "Two lines on building it with their team or continuing with Bal, about this long.",
  },
  {
    q: "How fast is three days, really?",
    a: "Two lines on the schedule from payment to walkthrough, about this long.",
  },
]

export default function ServicePage() {
  return (
    <>
      <div className="prod-shell">
        <div className="prod-main">
          {/* ── HERO ─────────────────────────────────────────────── */}
          <section className="prod-hero">
            <div className="kicker reveal" style={{ "--d": "20ms" } as React.CSSProperties}>
              Done for you
            </div>
            <h1 className="reveal" style={{ "--d": "60ms" } as React.CSSProperties}>
              A plain headline saying I build your onboarding plan on your actual product
            </h1>
            <p className="prod-sub reveal" style={{ "--d": "120ms" } as React.CSSProperties}>
              The complementary line: who this is for, what lands in their hands, and the three-day window, at about this
              length.
            </p>
            <div className="prod-cta-row reveal" style={{ "--d": "180ms" } as React.CSSProperties}>
              <a className={primary} href="#buy">
                Get started
              </a>
              <a className={secondary} href={CASE_STUDY}>
                See a finished build
              </a>
            </div>

            {/* the hero here is the finished work itself */}
            <div className="prod-heroshot">
              <Shot
                src="/assets/corebee/corebee-after.png"
                alt="A finished build: Corebee's redesigned agent workspace, setup as a guided conversation"
              />
            </div>
          </section>

          {/* ── WHAT YOU GET (4 deliverable rows) ────────────────── */}
          <section>
            <div className="kicker">What you get</div>
            <h2>A headline framing the four deliverables</h2>
            <p className="prod-sub">A subline that sets up the list in one sentence of roughly this length.</p>

            <div className="prod-inv">
              <div className="prod-invrow">
                <div>
                  <h3>Your onboarding blueprint</h3>
                  <div className="prod-count">The plan · built on your actual product</div>
                  <p className="prod-desc">
                    Two lines on what the plan covers: where users stall, the first win, the loop, what to build first,
                    written against their real screens. About this long in total.
                  </p>
                </div>
                <div className="prod-invmedia">
                  <Shot note="Real plan spread (Corebee, redacted if needed)" alt="The onboarding blueprint plan spread" />
                </div>
              </div>

              <div className="prod-invrow">
                <div>
                  <h3>One moment, already working</h3>
                  <div className="prod-count">An interactive prototype of the first win</div>
                  <p className="prod-desc">
                    Two lines: a clickable prototype built on screenshots of their product with the real agent on top;
                    looks and feels like their product, their engineers wire it in. Honest scope, about this long.
                  </p>
                </div>
                <div className="prod-invmedia">
                  <Shot
                    src="/assets/corebee/corebee-after.png"
                    alt="An interactive prototype of the first win, built on screenshots of the product with the real agent on top"
                  />
                </div>
              </div>

              <div className="prod-invrow">
                <div>
                  <h3>The build roadmap</h3>
                  <div className="prod-count">What to ship, in what order</div>
                  <p className="prod-desc">
                    Two lines on the prioritized list their team builds from, written to be handed to an engineer or an
                    LLM. About this long.
                  </p>
                </div>
                <div className="prod-invmedia">
                  <Shot note="Roadmap page (real render)" alt="The build roadmap page" />
                </div>
              </div>

              <div className="prod-invrow">
                <div>
                  <h3>The walkthrough</h3>
                  <div className="prod-count">Delivered live, recorded for the team</div>
                  <p className="prod-desc">
                    Two lines: Bal walks the founder through the plan and the prototype, question by question. About this
                    long.
                  </p>
                </div>
                <div className="prod-invmedia">
                  <Shot note="Call frame or Loom still" alt="The live walkthrough, recorded" />
                </div>
              </div>
            </div>
          </section>

          {/* ── HOW IT WORKS (3 steps, the three days) ───────────── */}
          <section>
            <div className="kicker">How it works</div>
            <h2>A headline about the three days</h2>
            <div className="prod-steps">
              <div className="prod-step">
                <div className="prod-step-num">01</div>
                <div>
                  <h4>The intake</h4>
                  <p>
                    One line: pay, then a short pre-filled interview about your product; most of it is already answered
                    before you arrive.
                  </p>
                </div>
              </div>
              <div className="prod-step">
                <div className="prod-step-num">02</div>
                <div>
                  <h4>The build</h4>
                  <p>One line: Bal runs the same system sold on this site against your real product and screens.</p>
                </div>
              </div>
              <div className="prod-step">
                <div className="prod-step-num">03</div>
                <div>
                  <h4>The handoff</h4>
                  <p>One line: plan, prototype, roadmap, and the live walkthrough, inside three days.</p>
                </div>
              </div>
            </div>
          </section>

          {/* ── SAME SYSTEM NOTE ─────────────────────────────────── */}
          <section>
            <div className="kicker">Same system</div>
            <h2 className="prod-h2-sm">One line stating this is the $129 system, run by the person who built it</h2>
            <p className="prod-sub">
              A supporting line of about this length on what hiring the author adds: judgment, speed, and the first piece
              built.
            </p>
          </section>

          {/* ── FOUNDER ──────────────────────────────────────────── */}
          <section>
            <div className="prod-founder">
              <div className="prod-founder-photo">
                <img src="/assets/Balabout.png" alt="Bal Sieber, who builds each Done-for-you engagement" />
              </div>
              <div>
                <div className="kicker">Who builds it</div>
                <h2 className="prod-h2-sm">A bio headline of roughly this length</h2>
                <p className="prod-desc">
                  Two lines: twenty years across marketing and product, agents run most of the company, one human's
                  judgment on your product. About this long in total.
                </p>
              </div>
            </div>
          </section>

          {/* ── RESULTS (one big Corebee ad card) ────────────────── */}
          <section>
            <div className="kicker">Results</div>
            <h2>A headline introducing the proof</h2>
            <a className="prod-result" href={CASE_STUDY}>
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
            <div className="prod-pname">Onboarding Loop · Done for you</div>
            <div className="prod-price-row">
              <span className="prod-was">$1,500</span>
              <span className="prod-price">
                $750 <small>one-time</small>
              </span>
            </div>
            <p className="prod-why">
              One honest line on why: early-clients price while the case-study shelf builds. Length of this note.
            </p>
            <a className={cn(primary, "w-full h-12 text-md")} href={CHECKOUT_URL}>
              Get started
            </a>
            <div className="prod-inc">
              <div>Your onboarding blueprint</div>
              <div>One moment built as a working prototype</div>
              <div>The build roadmap</div>
              <div>Live walkthrough, recorded</div>
              <div>Delivered in 3 days</div>
            </div>
            <p className="prod-fineprint">Stripe checkout · starts the following Monday · guarantee line TBD</p>
          </div>
        </aside>
      </div>

      {/* ── CROSS-LINK BAND (single band to the do-it-yourself page) ── */}
      <section className="prod-cross">
        <div className="prod-cross-in">
          <div>
            <h3>One sentence asking if they'd rather build it themselves</h3>
            <p>A supporting line of about this length naming the DIY route and its price.</p>
          </div>
          <a className={secondary} href="/product">
            Do it yourself · $129
            <Icon name="arrow-right" size={18} />
          </a>
        </div>
      </section>

      {/* ── MOBILE BUY BAR (fixed) ─────────────────────────────── */}
      <div className="prod-buybar">
        <div className="prod-buybar-price">
          $750 <span>one-time</span>
        </div>
        <a className={cn(primary, "nav-btn")} href={CHECKOUT_URL}>
          Get started
        </a>
      </div>
    </>
  )
}
