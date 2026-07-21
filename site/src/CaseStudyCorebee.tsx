/* Corebee case study — content for the case-study template. A React island (the
   Astro route mounts it inside PageShell, which supplies the shared TopBar +
   Footer). Every section is composed from the design system's own Web components;
   the copy is ported verbatim from protocol-stack/case-study-corebee.html, curly
   quotes and all. `reveal` is passed through because the island is client:load
   hydrated, so the scroll `.reveal-up` observers attach. */
import * as React from "react"

import { CaseStudyHero } from "@/components/web/CaseStudyHero"
import { CaseStudyStory, DeliverablesList } from "@/components/web/CaseStudyStory"
import { BlueprintQuote } from "@/components/web/BlueprintQuote"
import { CaseStudyDemo } from "@/components/web/CaseStudyDemo"
import { CtaBand } from "@/components/web/CtaBand"

const CB_LOGO = { src: "/assets/corebee/corebee-logo.svg", alt: "" }

export default function CaseStudyCorebee() {
  return (
    <>
      <CaseStudyHero
        crumb={[{ label: "Results", href: "/#about" }, { label: "Corebee" }]}
        title={<>How Corebee turned setup into its agent’s first job</>}
        sub="The signup wizard was earning the win; the dashboard was throwing it away. One Blueprint week later, a new user goes from signup to a live agent in a single guided conversation."
        beforeAfter={{
          before: { src: "/assets/corebee/corebee-before.png", alt: "Before: Corebee's original dashboard" },
          after: {
            src: "/assets/corebee/corebee-after.png",
            alt: "After: Corebee's redesigned agent workspace, setup as a guided conversation",
          },
          aspect: "3024 / 1722",
          ariaLabel: "Before and after comparison of Corebee's setup experience",
        }}
      />

      <CaseStudyStory
        reveal
        brand={{ logo: CB_LOGO, name: "Corebee" }}
        meta={[
          {
            k: "Product",
            v: "Corebee puts an AI support agent on your website. Paste your URL, it learns your business and answers for you.",
          },
          { k: "Stage", v: "Early stage, founder-led" },
          { k: "Engagement", v: "The Blueprint · $795" },
          { k: "Timeline", v: "One week, July 2026" },
        ]}
        blocks={[
          {
            k: "Challenge",
            v: (
              <>
                Corebee’s wizard took a new user from signup to a live agent in about ten minutes. Then the dashboard
                greeted them with “Welcome, My Organization” and a setup checklist stuck at 0 of 3. The product didn’t
                know the user had already won.
              </>
            ),
          },
          {
            k: "Solution",
            v: (
              <>
                We walked all 19 screens and scored the flow against our 11-rule scorecard: 69 out of 100, strong win,
                broken path. Then we redesigned activation around one rule: the user doesn’t see the dashboard until
                their first agent is live.
              </>
            ),
          },
          {
            k: "Results",
            v: (
              <>
                An engineer-ready activation plan, a clickable prototype of the agent-led setup, and a post-activation
                roadmap, delivered in one week. Usage numbers land after Corebee ships the build; this page updates when
                they do.
              </>
            ),
          },
          {
            k: "Deliverables",
            raw: true,
            v: (
              <DeliverablesList
                items={[
                  "Activation audit: 19 screens against the 11-rule scorecard",
                  "Engineer-ready activation plan, agent-led setup end to end",
                  "Working prototype of the new flow, the one above",
                  "Post-activation roadmap: habit, retention, upgrade path",
                ]}
              />
            ),
          },
        ]}
        wrong={{
          title: "What Corebee got wrong",
          lead: "The wizard was the good part. URL in, site crawled, live agent on a shareable link in about ten minutes. The trouble started one click later.",
          items: [
            {
              k: "The win, contradicted",
              v: (
                <>
                  “Your AI is already working” sits directly above a warning: “Setup is taking longer than expected.”
                  Both can’t be true, and the warning wins.
                </>
              ),
            },
            {
              k: "The dashboard doesn’t know you won",
              v: (
                <>
                  Corebee just read the user’s site, company name included. The dashboard says “Welcome, My
                  Organization” and shows a checklist at 0 of 3, one step after onboarding finished step one.
                </>
              ),
            },
            {
              k: "The product forgets its own work",
              v: (
                <>
                  “We don’t have a scan on file yet,” six fields marked Not detected, on a page whose own header counts 1
                  source, 1 page learned.
                </>
              ),
            },
          ],
        }}
        figma={{
          label: "The onboarding audit, mapped",
          openHref: "https://www.figma.com/board/E2QIM0mCqbomeY8v19Br2T/Corebee--Onboarding-Audit?node-id=0-1",
          embedSrc:
            "https://embed.figma.com/board/E2QIM0mCqbomeY8v19Br2T/Corebee--Onboarding-Audit?node-id=0-1&embed-host=share",
          title: "Corebee onboarding audit board",
        }}
      />

      <BlueprintQuote
        reveal
        bottomRails
        brand={{ logo: CB_LOGO, name: "Corebee" }}
        quote={
          'The prototype did what a document couldn\'t. I watched my own setup flow work before a single line of code existed."'
        }
        avatar={{ src: "/assets/corebee/jonathan-barr.svg", alt: "Jonathan Barr" }}
        name={
          <>
            <b>Jonathan Barr,</b> Founder, Corebee
          </>
        }
        stat="Live numbers land when Corebee ships"
      />

      <CaseStudyDemo
        reveal
        heading={<>The redesign: setup is the agent’s first job</>}
        sub="Three decisions drove it. The agent leads setup as a conversation, not a wizard that hands off to a dashboard. Everything Corebee learns in the crawl stays visible everywhere after it. And the dashboard doesn’t appear until there’s something in it: your live agent."
        demo={{
          embedSrc: "https://corebee.onboardingloop.ai",
          embedTitle: "Corebee live demo",
          openHref: "https://corebee.onboardingloop.ai",
          videoSrc: "/assets/corebee/corebee-demo.mp4",
          poster: "/assets/corebee/corebee-after.png",
          label: "Live Demo",
          aspect: "16 / 10",
        }}
      />

      <CtaBand
        reveal
        headline={{ before: "Get the ", mark: "complete", after: " system." }}
        sub="Three protocols. One toolkit. Activation to expansion, designed to build from."
        price={{ was: "$196", now: "$129", save: "Save $67" }}
        cta={{ href: "/#stack", label: "Get the Full Stack" }}
      />
    </>
  )
}
