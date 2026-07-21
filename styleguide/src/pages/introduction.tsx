import type { ReactNode } from "react"
import { Card, CardSurface, CardTitle, CardDescription } from "@/components/base/card"
import { Icon, type IconName } from "@/components/base/icon"
import { PageSection, PageIntro, Example } from "../page-kit"

/* ============================================================================
   Introduction — the front door of the Onboarding Loop System. A standalone
   page (not in an accordion) that says what the system is and the two ways to
   use it: build agent-led from scratch with the protocols + Claude skill, or
   build the product itself on the design system. Placeholder copy for now,
   drawn from Bal's own description; the layout is real page-kit so it slots in
   cleanly when the copy firms up.
   ========================================================================== */

// a compact icon-tile card (icon + title + one-line description), the same
// shape the Links / Toolkit pages use, but static and non-linking.
function InfoCard({ icon, title, children }: { icon: IconName; title: string; children: ReactNode }) {
  return (
    <Card className="h-full">
      <CardSurface className="flex-1 gap-4">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl [corner-shape:squircle] border border-border bg-subtle text-foreground">
          <Icon name={icon} size={20} stroke={1.5} />
        </span>
        <div className="flex flex-col gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{children}</CardDescription>
        </div>
      </CardSurface>
    </Card>
  )
}

function Grid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]">{children}</div>
}

export function IntroductionPage() {
  return (
    <>
      <PageIntro>
        The Onboarding Loop System is a starter kit for building products that onboard themselves. It is one method,
        told in three protocols, plus the design system to build it with. This page is an early draft; here is the short
        version of how to use it.
      </PageIntro>

      <PageSection title="What it is" desc="Onboarding as part of the product, not a layer bolted on top.">
        <Example>
          <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
            <p>
              Most products bolt onboarding on top: a tour, a checklist, a row of tooltips over a screen that never
              changed underneath. The Onboarding Loop System does the opposite. Onboarding is part of the product. The
              product onboards you onto the product, and it keeps leveling you up for as long as you stay, so there is
              no separate onboarding mode to graduate out of.
            </p>
            <p>
              The method runs on one idea borrowed from game design: take a total stranger and make them fluent with no
              manual, one level at a time. Those levels are the three protocols below. Read them in order, or reach for
              the one covering the stage where you are losing users.
            </p>
          </div>
        </Example>
      </PageSection>

      <PageSection
        title="The three protocols"
        desc="One loop, three levels. Each protocol is a doc you can read or hand straight to your AI."
      >
        <Grid>
          <InfoCard icon="bulb" title="Activation">
            Get a new user to a real first win, fast, with the agent doing the work.
          </InfoCard>
          <InfoCard icon="refresh" title="Retention">
            Turn that first win into a habit, and the habit into mastery.
          </InfoCard>
          <InfoCard icon="trending-up" title="Expansion">
            Turn mastery into more power, more seats, and your loudest advocates.
          </InfoCard>
        </Grid>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Alongside them sits <span className="font-medium text-foreground">Level Design Patterns</span>, a swipe file
          of seventeen concrete patterns you can ship, each grounded in a rule of game design.
        </p>
      </PageSection>

      <PageSection title="How to use it" desc="Two paths, depending on what you are building.">
        <Grid>
          <InfoCard icon="message" title="Build agent-led, from scratch">
            Download the protocol Markdown from the Toolkit, feed it to your LLM, and add the Claude skill. We recommend
            Claude. It interviews you about your product and helps you design the ideal application, with the onboarding
            built in. Already have a product? The same protocols work on what you have today.
          </InfoCard>
          <InfoCard icon="layout-dashboard" title="Build it on the design system">
            Onboarding lives in the product, so the system ships the pieces to build one: a style guide, base
            components, and agent components. Starting from scratch, build here. There are even web components for your
            marketing site.
          </InfoCard>
        </Grid>
      </PageSection>
    </>
  )
}
