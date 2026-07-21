/* ============================================================
   Landing — the page manifest.

   The whole point of the rebuild: the page is an ORDERED LIST of sections
   wrapped in one ScrollStage. Reordering the page means reordering this list
   and nothing else; removing a section means deleting one entry. Because the
   stage and its sections must share state, they are a SINGLE island (this
   component is mounted client:load), not one island per section.

   For step 1 the entries are placeholder blocks that stand in for the real
   sections (built one at a time in later steps). They exist to prove the
   composability guarantees the stage promises: delete any entry, or swap any
   two, and the page still pins and stacks correctly with no other edit.
   Each placeholder also demonstrates the down-flow of motion state: it
   subscribes to the stage's per-frame signal and writes its own
   section-relative progress imperatively (never reading window.scrollY).
   ============================================================ */
import * as React from "react"

import { ScrollStage } from "@/components/web/ScrollStage"
import { HeroSection } from "@/components/web/HeroSection"
import { ProblemSection } from "@/components/web/ProblemSection"
import { SystemSection } from "@/components/web/SystemSection"
import { AgentAnimation } from "@/components/web/AgentAnimation"
import { StackSection } from "@/components/web/StackSection"
import { AboutSection } from "@/components/web/AboutSection"
import { QuoteSection } from "@/components/web/QuoteSection"
import { FaqSection } from "@/components/web/FaqSection"
import { CtaSection } from "@/components/web/CtaSection"

// Hero content lives in the manifest (sections take content as props, they do
// not hardcode copy). Per-logo optical heights live in web.css keyed by alt.
const HERO = {
  badge: "User-onboarding protocols",
  headline: { before: "The onboarding system your product ", mark: "deserves", after: "." },
  trusted: "Built from designing products used by millions.",
  sub: "Get the onboarding protocol stack. Activation. Retention. Expansion.",
  // /system is on the global chrome now: CTAs route to the home fork, not to an
  // in-page section (there is no page-anchor nav here anymore).
  cta: { href: "/#fork", label: "Get the Full Stack" },
  logoStrip: {
    intro: "Created from two decades of work across teams at",
    logos: [
      { src: "/assets/logos/Google.svg", alt: "Google", circle: "/assets/Circle_01.png" },
      { src: "/assets/logos/Microsoft.svg", alt: "Microsoft" },
      { src: "/assets/logos/Intel.svg", alt: "Intel" },
      { src: "/assets/logos/Couchbase.svg", alt: "Couchbase" },
      { src: "/assets/logos/Heatmap.svg", alt: "Heatmap" },
      { src: "/assets/logos/BlueOcean.svg", alt: "Blue Ocean" },
    ],
  },
}

// The problem section's copy (curly typography, matching the source).
const PROBLEM = {
  eyebrow: { num: "00.", label: "The problem" },
  title: "Your most expensive problem is the weeks after signup.",
  lead: (
    <>
      Not pricing. Not features. It’s the gap between <b>“signed up”</b> and <b>“I need this,”</b> and
      that’s where the money quietly leaves.
    </>
  ),
  disclosure: {
    question: "You’ve bolted tools on before. They don’t hold.",
    answer: (
      <>
        <p>
          Tooltips, tours, checklists. They sit on top of the product and point at it. They narrate the
          thing instead of changing it, so the user is still just as lost, now with captions. That treats
          the symptom, a confused user, and leaves the cause alone: <b>an onboarding nobody actually designed.</b>
        </p>
        <p>
          And that layer is running out of road. As products get more AI-led, there’s less fixed screen
          left to stick a tooltip onto. <b>The fix has to live inside the product, not float above it.</b>
        </p>
      </>
    ),
  },
}

// The system section's copy.
const SYSTEM = {
  eyebrow: { num: "01.", label: "The system" },
  headline: "User-onboarding is not a funnel, it’s a game.",
  sub: "Game levels are built on loops, consisting of cue, action, reward until the user unlocks new tools and upgrades.",
  agentLine: (
    <>
      Games teach you while you play, a guide always at your side. That’s <b>agent-led onboarding</b>.
    </>
  ),
  disclosures: [
    {
      question: "Good onboarding works like a game, not a manual.",
      answer: (
        <>
          <p>
            Most people picture onboarding as the sign-up wizard. It’s not. It’s everything from the first
            win, to the habit that keeps them coming back, to the day they bring their team with them.
          </p>
          <p>
            Great games turn strangers into experts without a tutorial anyone reads. They use a loop: a
            cue, one small action, a real reward, then the next cue.
          </p>
          <p>
            The same loop carries a user past the first win, into the habit that brings them back, and on
            to the upgrade that feels like the next natural move. Curious user to power user, with no nudge
            that feels like nagging.
          </p>
        </>
      ),
    },
    {
      question: "Agent-led means the guide does the work, not you.",
      answer: (
        <>
          <p>
            It’s not a separate layer bolted on top with tooltips. It’s a guide that sets the product up
            for you, so you never have to go learn the dashboard, hunt for where things live, or figure out
            the UX on your own.
          </p>
          <p>
            It does the work and hands you the win. One place to go for everything, instead of a map you
            have to memorize. The product onboards you to the product.
          </p>
        </>
      ),
    },
  ],
}

const STACK = {
  badge: { num: "02.", label: "The stack" },
  title: {
    headline: "The Full Protocol Stack",
    s1: "Three protocols. One toolkit. Yours to keep.",
    s2: "Feed them to your favorite LLM and build the onboarding your product should’ve shipped with.",
  },
  cards: [
    {
      thumb: "/assets/blueprints/activation-blueprint.svg",
      alt: "The Activation Protocol",
      title: "The Activation Protocol",
      sub: "Get a new user to a real win on day one.",
      checks: [
        "The Level Design model: why activation is Level 1, and how the agent runs it",
        "How to define the one first-session win that matters",
        "The path, the first quest, and the win moment, built for the agent to walk the user through",
        "The Activation Protocol worksheet, plus how to run it with your favorite LLM",
      ],
    },
    {
      thumb: "/assets/blueprints/retention-blueprint.svg",
      alt: "The Retention Protocol",
      title: "The Retention Protocol",
      sub: "Turn the first win into a daily habit.",
      checks: [
        "The Level Design model: why retention is Level 2, and how the loop keeps users coming back",
        "The one repeated action a habit is built on, and how the agent rewards and calibrates it",
        "Why friction is a feature, and when the agent hands over the controls",
        "The Retention Protocol worksheet, plus how to run it with your favorite LLM",
      ],
    },
    {
      thumb: "/assets/blueprints/expansion-blueprint.svg",
      alt: "The Expansion Protocol",
      title: "The Expansion Protocol",
      sub: "Turn mastery into more seats and advocates.",
      checks: [
        "The Level Design model: why expansion is Level 3, and why your best users are the ones most likely to leave",
        "How to tell when a user has outgrown their plan, so the agent offers more at the right moment instead of nagging everyone",
        "How mastery turns into more seats and advocates, with the agent inviting the right person by name",
        "The Expansion Protocol worksheet, plus how to run it with your favorite LLM",
      ],
    },
    {
      thumb: "/assets/blueprints/level-design-add-on.svg",
      alt: "Level Design Patterns",
      title: "Level Design Patterns",
      sub: "17 agent-led patterns behind the protocols.",
      badge: "Bonus toolkit",
      checks: [
        "17 named patterns, grouped by activation, retention, and expansion",
        "Each with its mechanism, a real example, what works, and what goes sideways",
        "The level-design lens that ties them together",
        "A swipe file to pull from, or hand to your favorite LLM when you're building",
      ],
    },
  ],
  hiw: {
    title: "How it works",
    steps: ["Download the four PDFs", "Upload to your favorite LLM", "Build your onboarding blueprint"],
  },
  foot: {
    note: "Built specifically to collaborate with Claude, ChatGPT, Gemini, or whatever LLM you use.",
    price: { was: "$196", now: "$129", save: "Save $67" },
    updates: "Lifetime updates included.",
    cta: { href: "/#fork", label: "Get the Full Stack" },
  },
}

const ABOUT = {
  badge: { num: "03.", label: "The source" },
  headline: "The system every founder deserves.",
  body: [
    "Hey, I'm Bal.",
    "I've spent twenty years across marketing and product, working with teams at companies like Google, Microsoft, and Intel. The same thing happened over and over. A team builds something genuinely good, launches it, and watches people sign up, look around, and leave before they ever get to the part that would have hooked them.",
  ],
  disclosure: {
    question: "The product was rarely the problem.",
    answer: [
      "The onboarding was the problem. So I spent years working out how to get a stranger to a real win and keep them coming back, until it became the one thing I do.",
      "This is the same system I've used on enterprise B2B products that I charge 24K+ for. I packaged it so an early-stage founder can run it in an afternoon, without a team or a big budget. It's the closest I can get to a do-it-yourself version.",
    ],
  },
  photo: { src: "/assets/Balabout.png", alt: "Bal Sieber, founder of Onboarding Loop" },
  cap: {
    href: "https://www.linkedin.com/in/balsieber/",
    text: "Bal Sieber, founder of Onboarding Loop",
    icon: "/assets/linkedin-icon.svg",
  },
  press: {
    featured: "Bal has been featured in:",
    logos: [
      { src: "/assets/press/Forbes.svg", alt: "Forbes", className: "forbes", underline: "/assets/underline-01.svg" },
      { src: "/assets/press/Entrepreneur.svg", alt: "Entrepreneur" },
      { src: "/assets/press/Wired.svg", alt: "Wired" },
      { src: "/assets/press/Fast_Company.svg", alt: "Fast Company" },
      { src: "/assets/press/fwa.svg", alt: "FWA" },
      { src: "/assets/press/awwwards.svg", alt: "Awwwards" },
    ],
  },
}

// The proof group (g-d2): a framed Heatmap quote + the 3-panel testimonials
// carousel. Straight quotes verbatim from the source (the Feijoa face renders
// both marks as closing, so the opener is flipped in CSS via .oq).
const QUOTE = {
  quote: {
    logo: { src: "/assets/logos/Heatmap.svg", alt: "Heatmap" },
    text: 'Bal turns complex workflows into onboarding that feels effortless."',
    avatar: { src: "/assets/testimonials/CoreyLeger.svg", alt: "Corey Leger" },
    name: (
      <>
        <b>Corey Leger,</b> Director of CRO, Heatmap
      </>
    ),
    stat: (
      <>
        From 8.2% to 4.9% churn <span className="dot">•</span> 250% growth
      </>
    ),
  },
  testimonials: [
    {
      logo: { src: "/assets/logos/Couchbase.svg", alt: "Couchbase", h: 29 },
      avatar: "/assets/testimonials/RahulPrahan.svg",
      quote:
        '"Bal Sieber was the mastermind behind the whole experience. I remember those days fondly and the excitement of building a 1.0 product."',
      attr: (
        <>
          <b>Rahul Pradhan, </b>
          <span>Vice President, Couchbase</span>
        </>
      ),
      stat: (
        <>
          $200M Public Offering <span className="sep">•</span> $763M Valuation
        </>
      ),
      aria: "Rahul Pradhan testimonial",
    },
    {
      logo: { src: "/assets/logos/Microsoft.svg", alt: "Microsoft", h: 26 },
      avatar: "/assets/testimonials/BryanSaftler.svg",
      quote:
        '"Bal Sieber, forward thinking and current; no matter the technology, brings to the table great concepts, theory, and leadership."',
      attr: (
        <>
          <b>Bryan Saftler, </b>
          <span>Director of Product, Microsoft</span>
        </>
      ),
      stat: <>Collaborated on global product launch reaching 150M+ active users</>,
      aria: "Bryan Saftler testimonial",
    },
    {
      logo: { src: "/assets/logos/integer.svg", alt: "Integer", h: 26 },
      avatar: "/assets/testimonials/BenKennedy.svg",
      quote:
        '"Bal Sieber leads the vision for what a digital experience should be, and is also an operator who rolls up his sleeves and gets the work done."',
      attr: (
        <>
          <b>Benjamin Kennedy, </b>
          <span>CEO, Fable</span>
        </>
      ),
      stat: <>Co-led digital product launch for Starbucks</>,
      aria: "Benjamin Kennedy testimonial",
    },
  ],
}

// The answers group (g-e): a single-open FAQ accordion. An answer is a string
// (raw text in .a) or an array of strings (each a <p>, for the multi-paragraph
// "Why PDFs" answer). Apostrophe style matches the source verbatim: straight
// throughout, except the PDFs answer, which uses curly ’.
const FAQ = {
  badge: { num: "04.", label: "The answers" },
  title: "FAQs",
  sub: "Everything you need to know.",
  items: [
    {
      q: "What exactly do I get?",
      open: true,
      a: "The three protocols, Activation, Retention, and Expansion, plus the Level Design Patterns. Four PDFs covering the whole Onboarding Loop, from a stranger's first session to your power users bringing in their teams. After checkout you land on a page with the downloads and a short walkthrough for using them with your favorite LLM. Yours to keep, no app, no login.",
    },
    {
      q: "Why PDFs instead of skills, GPTs, or an app?",
      a: [
        "Anyone selling you prompts, skills, or prebuilt agents is selling to noobs. You don’t need to be an AI expert to use these, but if you’re getting real value out of them, you’re probably already the type who writes your own prompts, builds your own skills, customizes your own agents, maybe ships your own apps.",
        "And every product is different, so there’s no prompt or agent that works out of the box for yours. What you need are the protocols that guide your LLM into building the right onboarding for your product, not someone else’s.",
        "They’re PDFs instead of .md files in case you feel like sitting down and reading them yourself.",
      ],
    },
    {
      q: "Does this only work for desktop SaaS?",
      a: "No. The Onboarding Loop is about how any product turns first-time users into committed ones, so the model holds whether you're mobile, B2B, PLG, or a marketplace. The examples lean SaaS because that's where I've worked most, but the patterns are the same wherever people adopt a product over time: activation, retention, and expansion. Your LLM handles translating them to your context.",
    },
    {
      q: "Do I need an LLM to use these?",
      a: "No, but it's how I'd use them. You can read straight through and do the work yourself. What I actually do, and what I built these for, is hand them to my favorite LLM and let it apply the thinking to my product. A workout plan works as written; onboarding is specific to each product, so instead of generic steps these give your LLM the expert context to design onboarding for yours. There's no magic prompt to paste. The protocols are the brief, you tell it what you're building, it does the rest.",
    },
    {
      q: "What if I don't have an agent in my product yet?",
      a: "Then this is where you start. The protocols don't assume you already have one. They show you what agent-led onboarding does, so you can build your first version at whatever level fits your product. It doesn't take a heavy behavior-tracking setup to be useful; even a simple guided agent beats a tour of tooltips. The point is to design the onboarding your agent should run, whether that agent exists yet or not.",
    },
    {
      q: "How long until I see results?",
      a: "That's up to you, your product, and how you implement. These give you the model and the moves; how fast it shows up depends on what you build with them and where your onboarding is weakest. Some of it you could ship this week.",
    },
  ],
}

// The closing group (g-e2, the floor): the dark closing CTA. The site footer is
// the shared <Footer> component (composed inside CtaSection), so it is not passed
// as content here — it carries the site-wide defaults itself.
const CTA = {
  headline: { before: "Get the ", mark: "complete", after: " system." },
  sub: "Three protocols. One toolkit. Activation to expansion, designed to build from.",
  price: { was: "$196", now: "$129", save: "Save $67" },
  cta: { href: "/#fork", label: "Get the Full Stack" },
}

export default function Landing() {
  return (
    <ScrollStage>
      <HeroSection {...HERO} reveal />
      <ProblemSection {...PROBLEM} reveal />
      <SystemSection {...SYSTEM} reveal agent={<AgentAnimation />} />
      <StackSection {...STACK} reveal />
      <AboutSection {...ABOUT} reveal />
      <QuoteSection {...QUOTE} reveal />
      <FaqSection {...FAQ} reveal />
      <CtaSection {...CTA} reveal footerVariant="global" />
    </ScrollStage>
  )
}
