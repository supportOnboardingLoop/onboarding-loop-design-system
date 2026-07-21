/* /faq — a centered FAQ accordion (the Untitled faq-accordion layout) in OL style.
   A React island (client:load) so the accordion's single-open behavior works.
   Copy is PLACEHOLDER; final questions/answers come later. The "still have
   questions" card closes it with an avatar group + a contact CTA (real support
   address). */
import * as React from "react"

import { buttonVariants } from "@/components/base/button"
import { FaqList } from "./product-kit"
import { SUPPORT_EMAIL } from "@/components/web/site-nav"

const FAQ = [
  {
    q: "What exactly am I buying?",
    a: "Two or three lines answering plainly, at roughly the length a real answer needs so the section's rhythm and spacing read true in design.",
  },
  {
    q: "Do I need to be technical to use this?",
    a: "Two lines, honest about who gets the most from it and what a non-technical founder can expect, about this long.",
  },
  {
    q: "How is this different from a course?",
    a: "Two or three lines drawing the distinction plainly, no longer than this so the answer lands rather than rambles.",
  },
  {
    q: "Which LLM works best with it?",
    a: "Two lines naming the mainstream assistants and how it behaves in each, about this length.",
  },
  {
    q: "Can I start with Build and move to Plan later?",
    a: "Two lines on how the two relate and how an upgrade works, at roughly this length.",
  },
  {
    q: "How do refunds and updates work?",
    a: "Two lines covering both plainly, at about this length.",
  },
]

export default function FaqPage() {
  return (
    <div className="faq-page">
      <div className="faq-page-header">
        <div className="kicker">FAQ</div>
        <h1>A plain FAQ headline</h1>
        <p className="faq-sub">A supporting line telling them this is everything they need to know, about this length.</p>
      </div>

      <FaqList items={FAQ} />

      <div className="faq-help">
        <div className="faq-avatars">
          <img src="/avatars/bal.svg" alt="" />
          <img src="/avatars/jaimie.svg" alt="" />
          <img src="/avatars/wilson.svg" alt="" />
        </div>
        <h3>Still have questions?</h3>
        <p>A short line inviting them to reach out, and where a real answer is a message away.</p>
        <a className={buttonVariants({ variant: "primary", size: "lg" })} href={`mailto:${SUPPORT_EMAIL}`}>
          Get in touch
        </a>
      </div>
    </div>
  )
}
