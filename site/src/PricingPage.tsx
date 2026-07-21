/* /pricing — a two-column plan comparison (Build vs Plan), the Untitled
   large-table layout in OL style. Rendered as static HTML inside Base with the
   global chrome (pricing.astro). Copy is PLACEHOLDER (prices are real: $129 / $750);
   final copy + the real feature list come later. The two CTAs point at the product
   pages for now (checkout/Stripe is wired later). */
import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon } from "@/components/base/icon"
import { primary, secondary } from "./product-kit"

// A cell value: true = included (check), false = not included (dash), or a string.
type Val = boolean | string
interface Row {
  label: string
  diy: Val
  dfy: Val
}
const GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: "What's included",
    rows: [
      { label: "The protocols · 4 documents", diy: true, dfy: true },
      { label: "The Claude skill", diy: true, dfy: true },
      { label: "The design system · GitHub access", diy: true, dfy: true },
      { label: "Readable web pages", diy: true, dfy: true },
    ],
  },
  {
    title: "Done for you",
    rows: [
      { label: "Onboarding blueprint on your product", diy: false, dfy: true },
      { label: "Interactive prototype of the first win", diy: false, dfy: true },
      { label: "The build roadmap", diy: false, dfy: true },
      { label: "Live walkthrough, recorded", diy: false, dfy: true },
    ],
  },
  {
    title: "Support and delivery",
    rows: [
      { label: "Community support", diy: true, dfy: true },
      { label: "Support", diy: "Standard", dfy: "Priority" },
      { label: "Delivery", diy: "Instant", dfy: "3 days" },
      { label: "Free updates, forever", diy: true, dfy: true },
    ],
  },
]

function Cell({ value, featured }: { value: Val; featured?: boolean }) {
  return (
    <div className={cn("price-cell", featured && "price-cell--featured")}>
      {value === true ? (
        <Icon name="check" size={20} className="price-check" aria-label="Included" />
      ) : value === false ? (
        <span className="price-dash" aria-label="Not included" />
      ) : (
        value
      )}
    </div>
  )
}

export default function PricingPage() {
  return (
    <div className="price-wrap">
      <div className="price-header">
        <div className="kicker">Pricing</div>
        <h1>A pricing headline that frames the two ways to get it</h1>
        <p className="price-sub">
          A supporting line about the two plans and who each is for, running to about this length and no longer.
        </p>
      </div>

      <div className="price-scroll">
        <div className="price-table">
          {/* plan headers */}
          <div className="price-corner" />
          <div className="price-plan price-plan--featured">
            <div className="price-plan-name">
              Plan <span className="price-badge">Most popular</span>
            </div>
            <div className="price-amount">
              <b>$129</b>
              <span>one-time</span>
            </div>
            <p className="price-plan-desc">A short line on the do-it-yourself route, about this length.</p>
            <a className={cn(primary, "price-cta")} href="/product">
              Get started
            </a>
          </div>
          <div className="price-plan">
            <div className="price-plan-name">Build</div>
            <div className="price-amount">
              <b>$750</b>
              <span>one-time</span>
            </div>
            <p className="price-plan-desc">A short line on the done-for-you route, about this length.</p>
            <a className={cn(secondary, "price-cta")} href="/service">
              Get started
            </a>
          </div>

          {/* feature groups */}
          {GROUPS.map((g) => (
            <React.Fragment key={g.title}>
              <div className="price-group">{g.title}</div>
              {g.rows.map((r) => (
                <React.Fragment key={r.label}>
                  <div className="price-feat">{r.label}</div>
                  <Cell value={r.diy} featured />
                  <Cell value={r.dfy} />
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}
