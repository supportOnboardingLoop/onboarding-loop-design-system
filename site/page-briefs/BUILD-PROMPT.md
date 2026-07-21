# Onboarding Loop website · master build prompt

Read this whole file before writing any code. It governs the build of the new
onboardingloop.ai marketing pages. Companion files in this folder:

- `home-ia-v1.html` — homepage wireframe
- `diy-page-ia-v3.html` — Product page wireframe (DIY, $129)
- `dfy-page-ia-v1.html` — Service page wireframe (DFY, $750)
- `diy-page-build-notes.md` — behavior + structure rules (global rules apply to ALL pages)

## What you are building

The new marketing site, one page per session. Build the ENTIRE page before
showing anything; no section-by-section check-ins.

Site map and routes:

| Route | Page | Source |
|---|---|---|
| `/` | Home | home-ia-v1.html (new) |
| `/system` | The system page | the current rebuilt onboardingloop.ai landing page, moved here as-is; only its header/footer/CTAs update to the global pattern |
| `/product` | Do it yourself, $129 | diy-page-ia-v3.html (new) |
| `/service` | Done for you, $750 | dfy-page-ia-v1.html (new) |
| `/corebee` | Corebee case study | already built; NOT in header or footer nav; linked only from the Results sections on /product and /service |
| `/terms`, `/privacy` | Legal | carry over unchanged |

Global header, identical on every page, in this order:
**System · Product · Service · View Demo · Get Started**

- System, Product, Service: text links to /system, /product, /service.
- View Demo: secondary (outlined) button, opens demo.onboardingloop.ai in a new tab.
- Get Started: primary (filled) button. On /product and /service it goes to that
  page's checkout CTA. Everywhere else it goes to the fork section on home
  (`/#fork`). If a cleaner global behavior emerges during the build, flag it to
  Bal instead of deciding silently.

Global footer mirrors the header links plus Terms, Privacy,
support@onboardingloop.com.

## Where you work

This repo (`onboarding-loop-design-system`), inside `site/` (the Astro site).
Step 0 of the first session: confirm the migrated site actually lives here (see
PORT-BRIEF.md at the repo root). If the migration from the old standalone
folder is incomplete, finishing it is the gate before any page work. Do not
build pages in any other folder.

## Design system rules (the point of this whole build)

1. The design system is the base for everything. Base components (repo root
   `components/`) are shared by the product and the website; website-only
   components live with the site. Before building ANY element, check whether a
   component already exists (styleguide, `components.json`, existing pages).
   If it exists, use it.
2. If a component does not exist: design and build it in place, in our style,
   using `tokens.css` / `theme.css` only. Never invent colors, type sizes,
   radii, or shadows outside the tokens. After the pages ship, we will run a
   componentization pass and extract what earned it; your job now is to build
   clean enough that extraction is easy.
3. Reference the already-built surfaces for patterns first: the current
   landing page (future /system), the demo, the styleguide, the Corebee case
   study page.
4. Untitled UI is the fallback reference for LAYOUT ONLY, on patterns we
   haven't built yet (a hero arrangement, a stats row, a pricing layout).
   Look at how they structure it, then build it in Onboarding Loop style with
   our tokens. Never copy Untitled UI styling verbatim.

## How to read the wireframes

They are mid-fidelity IA wireframes: layout, hierarchy, and placeholder copy
at the intended length.

- **Placeholder copy is placeholder.** Transplant it exactly as written, even
  where it describes itself ("A plain headline that says what the system
  actually is"). Do NOT write marketing copy; Bal writes the final copy after
  the build. Copy that is already real (prices, "From download to plan in an
  afternoon", nav labels, FAQ questions on /product) stays verbatim.
- **Hatched boxes are asset slots.** Use the real assets listed in
  diy-page-build-notes.md (demo screenshots, protocol renders, styleguide
  screens, founder photo in ~/Desktop/website-assets). Where the asset needs
  Bal (e.g. the Corebee quote), build a clean styled placeholder and list it
  in your handoff summary.
- **The wireframe aesthetic is not the design.** Dashed borders, the flat gray
  boxes, and Georgia-as-serif are wireframe artifacts. Georgia marks where the
  display face goes; apply the design system's real type and look everywhere.

## Page-specific requirements

**/product and /service (both):** sticky buy card in a right rail, visible for
the entire scroll on desktop; on mobile it collapses to a fixed bottom bar
(price + Get started). Single cross-link band at the bottom to the other
product page; never a two-card fork on a product page.

**/product:** $129 flat, no anchor price. Three inventory rows only (protocols,
Claude skill, design system); the live demo is not an inventory item. Results
section = one big ad-style Corebee card linking to /corebee.

**/service:** $1,500 struck through to $750 with the one-line honest reason in
the buy card. Four deliverable rows. The prototype honesty rule is hard: the
deliverable is an interactive prototype on screenshots of their product with
the real agent on top; never imply we ship code into their live product.
No Sprint or upsell content on the page.

**/ (home):** five screens, huge display type, one idea per screen, generous
air. The fork cards route to /product and /service. The demo screen embeds the
demo or uses a linking still. This page follows the Polsia rhythm: if a screen
grows past one sentence plus one element, it's wrong.

**/system:** content is already built and approved; this is a move + rename,
not a redesign. Swap its header/footer for the global components, point its
CTAs at the fork, and leave the rest alone. (A new "day in the life" section
is coming to this page later; do not attempt it in this build.)

## Build order and process

Suggested order: `/product` → `/service` → `/` → `/system` move + routing +
footer pass. One page per session.

Per page:
1. Read the wireframe + build notes end to end.
2. Inventory which existing components cover which sections; list gaps.
3. Build the whole page.
4. Verify before showing: dev server renders clean, no console errors, desktop
   and ~390px mobile both checked with screenshots, all links and routes work,
   sticky/bottom-bar behavior works, images have alt text.
5. Show Bal: screenshots plus a short summary of components reused vs created
   in place, and any asset placeholders awaiting him.
6. Commit per page with a clear message.

## Don'ts

- No new dependencies without flagging first.
- No copy invention, no renaming, no "improved" headlines.
- No page-anchor navigation in the header.
- Don't touch the demo, the styleguide, or product component code except to
  consume it.
- No em dashes anywhere copy does get touched; use commas or semicolons.
