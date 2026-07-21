import { cn } from "@/lib/utils"
import { SectionHeader } from "@/components/product/section-header"
import { Card, CardSurface, CardHeader, CardFooter, CardTitle, CardContent } from "@/components/base/card"
import { Icon } from "@/components/base/icon"
import { PinAction, AttachAction, SparkDefs, CardActionsProvider } from "./analytics-ui"
import { PortfolioView } from "./analytics-portfolio"
import { ReportView } from "./analytics-reports"
import { DashboardView } from "./analytics-dashboard"
import { useDrag } from "../drag"
import { useDemoIdentity } from "../identity"
import type { SlotProps } from "./types"

// ============================================================================
// ANALYTICS content area — the Overview "Insights" board on the DS Card system.
//
// Composition (per Bal's content-treatment direction):
//   • the section header lives OUTSIDE the cards (a plain header + divider);
//   • each insight is its OWN Card = one white surface (pure content) + a footer
//     that carries the meta/interactive bits (client on the left, Pin / Attach
//     on the right), so the surface stays content-only;
//   • the cards are spaced to the content rhythm (not the tight 4px gutter);
//   • the money figure is the hero: a trending-up glyph + a large, lighter-weight
//     number — the thing to notice;
//   • the AI summary is its own labeled headline card.
// Portfolio, generated reports, and drag-to-launcher are later iterations.
// ============================================================================

// `siteIndex` points into the resolved DemoIdentity sites (generic in the public
// demo, the real portfolio in a client build); no client site name is baked here.
type Insight = { money: string; siteIndex: number; title: string; body: string }

// The agent's money-ranked insights (verbatim copy from the shipped portal).
const INSIGHTS: Insight[] = [
  {
    money: "$135K",
    siteIndex: 3,
    title: "Cart abandonment spike on mobile checkout",
    body: "Mobile checkout abandonment up 23% in 14 days. CLS on the checkout page degraded after a theme update; the layout shift interrupts the tap target on the CTA.",
  },
  {
    money: "$48K",
    siteIndex: 0,
    title: "Homepage hero above-fold engagement low",
    body: "Only 12% of visitors interact with the hero CTA. Click activity concentrates on the nav bar instead of the primary conversion path.",
  },
  {
    money: "$27K",
    siteIndex: 1,
    title: "Search users convert 4x but search is buried",
    body: "Visitors who use site search convert at 8.9% vs 2.2% overall, and the search entry point sits below the fold on mobile.",
  },
  {
    money: "$15K",
    siteIndex: 2,
    title: "PDP gallery dead zone on tablet",
    body: "Second and third gallery images get near-zero engagement on tablet; the swipe affordance is not visible.",
  },
  {
    money: "$62K",
    siteIndex: 4,
    title: "Guest checkout hidden behind a forced account wall",
    body: "New shoppers must create an account before paying; 38% drop at the account step on mobile. Guest checkout is supported by the theme but switched off in settings.",
  },
  {
    money: "$41K",
    siteIndex: 1,
    title: "Product reviews load below the fold and lazily",
    body: "Reviews are the top trust signal for this catalog, but render after a 1.2s delay and sit under the fold. PDPs with reviews visible convert 2.1x higher.",
  },
  {
    money: "$33K",
    siteIndex: 5,
    title: "Free-shipping threshold never surfaced in cart",
    body: "The $75 free-shipping threshold is not shown until the final step. Sites that surface it in the mini-cart lift AOV 9-14% on this category.",
  },
  {
    money: "$29K",
    siteIndex: 0,
    title: "Category pages LCP 4.1s on 4G",
    body: "Largest Contentful Paint on collection pages is 4.1s on throttled 4G. Every second over 2.5s costs an estimated 7% of add-to-cart on mobile.",
  },
  {
    money: "$24K",
    siteIndex: 2,
    title: "Out-of-stock variants still look buyable",
    body: "Sold-out sizes render identically to in-stock ones until the Add to Cart tap fails. The dead-end interaction shows a 61% exit rate.",
  },
  {
    money: "$19K",
    siteIndex: 3,
    title: "Prominent promo field trains discount hunting",
    body: "An empty promo code box at checkout sends 18% of users off-site to hunt for codes; 40% do not return. A collapsed link recovers most of them.",
  },
  {
    money: "$12K",
    siteIndex: 1,
    title: "Mobile filter drawer resets on back",
    body: "Applying filters then tapping back clears the whole selection, so users re-filter or abandon. Preserving filter state on history navigation recovers the session.",
  },
  {
    money: "$8K",
    siteIndex: 5,
    title: "No trust badges at the payment step",
    body: "The payment step shows no security or guarantee cues. Adding SSL and returns badges at payment lifts completion 3-5% for first-time buyers.",
  },
]

/* The hero money figure: a trending-up glyph + a large, lighter-weight number.
   `hero` bumps it up for the summary card. */
function MoneyFigure({ amount, hero }: { amount: string; hero?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Icon name="trending-up" size={hero ? 30 : 26} stroke={2} className="shrink-0 text-primary" />
      <div className="flex items-baseline gap-1">
        <span
          className={cn(
            "font-semibold leading-none tracking-[-0.02em] text-primary",
            hero ? "text-[40px]" : "text-[34px]"
          )}
        >
          {amount}
        </span>
        <span className="text-sm font-medium text-muted-foreground">/mo</span>
      </div>
    </div>
  )
}

/* One insight = its own Card: a pure-content surface + a footer that carries the
   client (left) and the Pin / Attach actions (right). */
function InsightCard({ money, siteIndex, title, body }: Insight) {
  const { startDrag } = useDrag()
  const { sites } = useDemoIdentity()
  const site = sites[siteIndex]?.name ?? ""
  const card = { id: title, title, accent: `${money}/mo`, tile: { type: "insight" as const, money, site, title, body } }
  return (
    <Card
      className="cursor-grab select-none active:cursor-grabbing"
      onPointerDown={(e) => startDrag({ title: card.title, accent: card.accent, sourceId: card.id, tile: card.tile }, e)}
    >
      <CardSurface className="gap-3 p-5">
        <MoneyFigure amount={money} />
        <div className="flex flex-col gap-1.5">
          <CardTitle className="text-[15px] leading-snug tracking-[-0.01em]">{title}</CardTitle>
          <CardContent className="text-sm leading-relaxed text-muted-foreground">{body}</CardContent>
        </div>
      </CardSurface>
      <CardFooter
        title={site}
        action={
          <div className="flex items-center gap-0.5">
            <PinAction card={card} />
            <AttachAction card={card} />
          </div>
        }
      />
    </Card>
  )
}

/* The AI summary = its own headline card: a labeled header + a brand-tinted
   surface with the total opportunity as a big number. */
function SummaryCard() {
  const { agent } = useDemoIdentity()
  return (
    <Card>
      <CardHeader
        title="Total opportunity"
        action={<span className="text-sm font-medium text-muted-foreground">12 insights this period</span>}
      />
      <CardSurface className="gap-3 border-[color-mix(in_srgb,var(--primary)_22%,transparent)] bg-[var(--accent-tint)] p-5">
        <MoneyFigure amount="$453K" hero />
        <CardContent className="text-sm leading-relaxed text-foreground">
          {agent.name} ranked these by money. Each one actions into a task, a fix, or a client report.
        </CardContent>
      </CardSurface>
    </Card>
  )
}

/* Overview = the money-ranked Insights board. */
function InsightsView() {
  return (
    <section className="flex flex-col gap-4">
      {/* the section header — outside the cards, on the page grey (shared SectionHeader) */}
      <SectionHeader title="Insights" description="What the AI found, ranked by money" placement="inline" divider />

      <SummaryCard />

      <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(340px,1fr))]">
        {INSIGHTS.map((it) => (
          <InsightCard key={it.title} {...it} />
        ))}
      </div>
    </section>
  )
}

/* The content-area body for the Analytics preset. Fills + scrolls the content
   column and switches view on the selected primary-nav item (Overview → Insights,
   Portfolio → Scorecard + table). The docked launcher floats over its bottom
   (hence the tall bottom pad). */
export function AnalyticsBody({ ctx }: SlotProps) {
  return (
    <CardActionsProvider value={ctx.cardActions}>
      {/* full-width content, flush with the "Overview" + actions header. The
          scroll gutter is RESERVED (scrollbar-gutter: stable) so the 8px DS
          scrollbar never eats into the content width; the right padding is then
          4px (= the header's 12px minus that 8px gutter) so the cards' right edge
          lands exactly on the header actions' right edge, scrollbar or not. Left
          stays 14px (pl-3.5) to match the header icon. */}
      <div className="absolute inset-0 overflow-y-auto [scrollbar-gutter:stable] pt-6 pr-1 pb-[120px] pl-3.5">
        <SparkDefs />
        <div className="flex flex-col gap-6">
          {ctx.selectedDash ? (
            <DashboardView
              dashboard={ctx.selectedDash}
              handlers={ctx.dashboardHandlers}
              meName="Bal Sieber"
              bannerComposerOpen={ctx.bannerComposerOpen}
              onCloseBannerComposer={ctx.closeBannerComposer}
            />
          ) : ctx.activeReport ? (
            <ReportView id={ctx.activeReport.id} />
          ) : (
            // Overview = the money-ranked Insights + the (former) Portfolio content
            // (Scorecard + client table) stacked into one view.
            <>
              <InsightsView />
              <PortfolioView />
            </>
          )}
        </div>
      </div>
    </CardActionsProvider>
  )
}
