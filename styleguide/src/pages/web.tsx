/* ============================================================
   Web — the marketing (`.ol-web`) blocks the onboardingloop.ai site + every case
   study are assembled from. Each entry is a REAL component from components/web,
   rendered live with sample content, so the catalog proves the pages are built
   from shared blocks: a new page reuses the block and swaps its content/images
   (a Heatmap case study hero = this same Before/After, two different images).

   The web layer keeps its own `.ol-web` token scope (the Feijoa display face + an
   editorial neutral ramp) over the same DS primitives; web.css is imported here so
   it applies inside `.ol-web` without leaking onto the rest of the styleguide.
   ============================================================ */
import "@/components/web/web.css"
import { useLayoutEffect, useRef, useState, type ReactNode } from "react"

import { PageIntro, PageSection, PageItem } from "../page-kit"
import { BeforeAfter } from "@/components/web/BeforeAfter"
import { BlueprintQuote } from "@/components/web/BlueprintQuote"
import { CaseStudyHero } from "@/components/web/CaseStudyHero"
import { CaseStudyStory, DeliverablesList } from "@/components/web/CaseStudyStory"
import { CaseStudyDemo } from "@/components/web/CaseStudyDemo"
import { CtaBand } from "@/components/web/CtaBand"
import { Footer } from "@/components/web/Footer"

// Desktop-width preview: renders a full-bleed block at `w`px and zooms it to fit
// the docs pane. `zoom` (not transform:scale) so the frame height tracks the
// scaled content automatically; overflow-hidden clips the block's 100vw paper /
// divider bleeds to the frame. Interactions still land on the right coordinates.
function Frame({ w = 1240, children }: { w?: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [zoom, setZoom] = useState(0.5)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const ro = new ResizeObserver(() => setZoom(Math.min(1, el.clientWidth / w)))
    ro.observe(el)
    return () => ro.disconnect()
  }, [w])
  return (
    <div ref={ref} className="overflow-hidden rounded-xl border border-border-strong [corner-shape:squircle]">
      <div className="ol-web" style={{ width: w, zoom }}>
        {children}
      </div>
    </div>
  )
}

// A block rendered live at the pane width (responsive), its bleeds clipped.
function Live({ children }: { children: ReactNode }) {
  return (
    <div className="ol-web overflow-hidden rounded-xl border border-border-strong [corner-shape:squircle]">
      {children}
    </div>
  )
}

const CB_LOGO = { src: "/assets/corebee/corebee-logo.svg", alt: "" }

export function WebPage() {
  return (
    <>
      <PageIntro>
        The marketing sections the onboardingloop.ai site + every case study are assembled from. Each block below is a
        real component in components/web, rendered live — a new page reuses the block and only swaps its content and
        images (a Heatmap case study hero is this same Before/After with two different images). They share one .ol-web
        token scope (the Feijoa display face, an editorial neutral ramp) over the same DS primitives.
      </PageIntro>

      <PageSection
        title="Web blocks"
        desc="Reusable marketing sections. Swap the content, reuse the block — never rebuild a lookalike."
      >
        <PageItem
          title="Before / after"
          desc="BeforeAfter — the drag / keyboard / cursor-magnet comparison slider. Props: before + after images, labels, aspect, ariaLabel."
        >
          <Live>
            <div style={{ padding: 24 }}>
              <BeforeAfter
                before={{ src: "/assets/corebee/corebee-before.png", alt: "Before" }}
                after={{ src: "/assets/corebee/corebee-after.png", alt: "After" }}
              />
            </div>
          </Live>
        </PageItem>

        <PageItem
          title="Blueprint quote"
          desc="BlueprintQuote — the framed testimonial. ONE component used by BOTH the landing (logo-only, short bottom rails) and a case study (client brand lockup, full bottom rails). Props: brand, quote, avatar, name, stat, bottomRails."
        >
          <Live>
            <BlueprintQuote
              brand={{ logo: CB_LOGO, name: "Corebee" }}
              bottomRails
              quote={'The prototype did what a document couldn\'t. I watched my own setup flow work before a single line of code existed."'}
              avatar={{ src: "/assets/corebee/jonathan-barr.svg", alt: "Jonathan Barr" }}
              name={
                <>
                  <b>Jonathan Barr,</b> Founder, Corebee
                </>
              }
              stat="Live numbers land when Corebee ships"
            />
          </Live>
        </PageItem>

        <PageItem
          title="Case study hero"
          desc="CaseStudyHero — breadcrumb + Feijoa headline + sub + the BeforeAfter slider. Props: crumb, title, sub, beforeAfter."
        >
          <Frame>
            <CaseStudyHero
              crumb={[{ label: "Results", href: "#" }, { label: "Corebee" }]}
              title={<>How Corebee turned setup into its agent&rsquo;s first job</>}
              sub="The signup wizard was earning the win; the dashboard was throwing it away."
              beforeAfter={{
                before: { src: "/assets/corebee/corebee-before.png", alt: "Before" },
                after: { src: "/assets/corebee/corebee-after.png", alt: "After" },
              }}
            />
          </Frame>
        </PageItem>

        <PageItem
          title="Case study story"
          desc="CaseStudyStory — the sticky meta rail + 2-up story blocks + what-went-wrong + Figma embed. Config-driven: brand, meta rows, blocks, wrong items, figma. Exports DeliverablesList for the green-check bullets."
        >
          <Frame>
            <CaseStudyStory
              brand={{ logo: CB_LOGO, name: "Corebee" }}
              meta={[
                { k: "Product", v: "An AI support agent for your website. Paste your URL, it learns your business." },
                { k: "Stage", v: "Early stage, founder-led" },
                { k: "Engagement", v: "The Blueprint · $795" },
                { k: "Timeline", v: "One week, July 2026" },
              ]}
              blocks={[
                { k: "Challenge", v: "The wizard earned the win in ten minutes; the dashboard then threw it away." },
                { k: "Solution", v: "We scored 19 screens against our 11-rule scorecard and rebuilt activation around one rule." },
                { k: "Results", v: "An engineer-ready activation plan, a clickable prototype, and a post-activation roadmap." },
                {
                  k: "Deliverables",
                  raw: true,
                  v: (
                    <DeliverablesList
                      items={[
                        "Activation audit: 19 screens against the 11-rule scorecard",
                        "Engineer-ready activation plan, agent-led setup end to end",
                        "Working prototype of the new flow",
                      ]}
                    />
                  ),
                },
              ]}
              wrong={{
                title: "What Corebee got wrong",
                lead: "The wizard was the good part. The trouble started one click later.",
                items: [
                  { k: "The win, contradicted", v: "“Your AI is already working” sits above “Setup is taking longer than expected.”" },
                  { k: "The dashboard doesn’t know you won", v: "It says “Welcome, My Organization” and shows a checklist at 0 of 3." },
                ],
              }}
            />
          </Frame>
        </PageItem>

        <PageItem
          title="Case study demo"
          desc="CaseStudyDemo — the redesign split-header + wide live-demo box (embed with a recorded-video fallback on mobile / un-renderable embed). Props: heading, sub, demo."
        >
          <Frame>
            <CaseStudyDemo
              heading={<>The redesign: setup is the agent&rsquo;s first job</>}
              sub="The agent leads setup as a conversation, and the dashboard doesn&rsquo;t appear until your live agent is in it."
              demo={{
                embedSrc: "https://corebee.onboardingloop.ai",
                embedTitle: "Corebee live demo",
                openHref: "https://corebee.onboardingloop.ai",
                videoSrc: "/assets/corebee/corebee-demo.mp4",
                poster: "/assets/corebee/corebee-after.png",
              }}
            />
          </Frame>
        </PageItem>

        <PageItem
          title="Closing CTA band"
          desc="CtaBand — the dark closing band (gold-marker headline, sub, cube strip, price, inverted button). Extracted from the landing's closing group; the landing runs the cube spring, a standalone page renders it flush. Props: headline, sub, price, cta."
        >
          <Live>
            <CtaBand
              headline={{ before: "Get the ", mark: "complete", after: " system." }}
              sub="Three protocols. One toolkit. Activation to expansion, designed to build from."
              price={{ was: "$196", now: "$129", save: "Save $67" }}
              cta={{ href: "#", label: "Get the Full Stack" }}
            />
          </Live>
        </PageItem>

        <PageItem
          title="Footer"
          desc="Footer — the shared site footer (brand, section nav, byline + LinkedIn, copyright + Terms / Privacy). The SAME component on every page, stamped by PageShell. Props: home, reveal."
        >
          <Live>
            <Footer home="#" />
          </Live>
        </PageItem>
      </PageSection>
    </>
  )
}
