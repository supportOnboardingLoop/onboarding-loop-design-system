# DIY product page · build notes for Claude Code

Companion to diy-page-ia-v3.html (the layout + placeholder-copy wireframe).
These notes carry the behavior and structure rules that don't belong on the
wireframe itself. Copy on the wireframe is PLACEHOLDER: it describes its own
job and length; final copy is written by Bal after the build.

## Global

- One global header and one global footer, identical across all pages.
  DECIDED (Bal 7/20): nav order is System · Product · Service · View Demo
  (secondary button) · Get Started (primary button). Footer mirrors.
  No page-anchor links in the header. View Demo opens demo.onboardingloop.ai
  in a new tab.
- Build on the Onboarding Loop design system components, inside the migrated
  site folder. No one-off styles.
- Voice guardrails for any copy that does get written: no em dashes, no
  defining-by-negation ("not reading material"), no internal metaphors
  (equipment, drill), "your favorite LLM" is the locked phrase.

## Hero

- The page is a PRODUCT page: the hero describes the product, not the outcome
  pitch (that's the homepage's job).
- Primary CTA "Get started": straight to Stripe checkout, or scrolls to the
  buy card on mobile. Secondary CTA "Look at the demo": opens
  demo.onboardingloop.ai in a new tab. No mystery buttons.
- Show-strip: three tiles, REAL assets only (live demo screenshot linking out,
  existing protocol renders, real style-guide screen). If a tile has no real
  screenshot that earns its spot, drop to two tiles; never invent a box.
  Open visual question: which design-system screen sells it best (agent?
  launcher? style guide overview?).

## Sticky buy card

- Right rail, sticky for the entire scroll on desktop.
- On mobile: collapses to a fixed bottom bar (price + Get started).
- $129 one-time, no anchor price on the DIY product.
- Refund window: TBD (Bal decision, currently drafted as 30-day no-questions).

## What's inside

- Exactly three inventory rows: the protocols, the Claude skill, the design
  system. The live demo is NOT an inventory item (it's viewable from the site,
  not part of the paid kit); it lives in the hero strip and the demo CTA only.
- "Protocol" as a name is an OPEN QUESTION (Bal); build the slot label-agnostic.
- Protocols ship as PDF + MD + readable web pages. Design system = style guide
  + working React components via GitHub access.

## Results section

- Called "Results" (not "Case studies") until there are enough cases for a
  real section. One BIG ad-style card for Corebee: large visual, verbatim
  quote, 2-3 stats, link to the case-study page. It should feel like an ad
  for the case, not a small text link. Second card (Heatmap) slots in later.
- No separate case-study nav item for MVP.

## FAQ

- Safety net only: the "is it software / is it a course" misreads must already
  be answered by the hero and inventory. Keep ~6 items.

## Cross-link

- Single band at the bottom: one line + one button to the done-for-you page
  ($750). Never a two-card fork on a product page; forks belong to home/about.

## Assets available

- Demo: demo.onboardingloop.ai (screenshot or embedded loop).
- Protocol PDF renders: existing thumbnails from the current landing page.
- Style guide / components: screenshots from the design system.
- Client logos: Google, Microsoft, Intel, Couchbase, Nokia (career proof;
  caption must be honest: work across teams at, not "clients"). Slim strip,
  smaller than the About page's; Bal is undecided whether it stays on this
  page at all.
- Founder photo: website-assets folder.
- Corebee quote + stats: pull from projects/corebee-blueprint.md once Bal
  confirms the verbatim quote.
