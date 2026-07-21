# Web layer vs design system: token divergences

Running log of every place the marketing site's values diverge from the design
system's tokens, with both values. This is the **input to a later decision**
about whether each becomes a base token or stays web-only. It is not resolved
here: the web layer (`components/web/web.css`, scoped `.ol-web`) carries the
site's values verbatim for parity; the design system is left untouched.

Legend: **web** = value in the vanilla landing page (`protocol-stack/index.html`
`:root`); **DS** = the design system token (`tokens.css`).

---

## Decision summary (the report)

The rebuild is complete (all 8 sections + footer ported; steps 1-10). Every
divergence found is catalogued in the per-step sections below with both values.
This is the consolidated verdict on each — the input to a later decision about
which web values become base tokens. Three buckets:

### A. Promote to the design system (web value is the better/missing base)

| item | web | DS today | recommendation |
| --- | --- | --- | --- |
| Button `lg` size tier | 48 / px-24 / 24px radius / 15px | added as a real DS `Button` size variant | **Done** — already promoted (`components/base/button.tsx`), shared by every CTA. Keep. |
| Button primary weight | `font-semibold` (600) | `font-medium` (500) | **Decide:** does the DS primary button want 600? The web CTA overrides to 600; if yes, change the base and drop the override. |
| Cube spread spring | `useCubeSpring` (K=140, DAMP=15) | — | Reusable hook, drives both cube rows. If the DS gains a "reveal-on-enter spring" primitive, fold this in; else keep web-only. |
| Inverted button | `.ol-cta--inv` (== header-dark flip == `.btn-inv`) | DS has `secondary` but not this exact white-on-dark gradient | **Decide:** promote as a DS button variant (`inverse`) — it recurs (header, closing CTA) and is currently a web class. |

### B. Keep web-only (legitimately marketing-layer)

- `--font-display` (Feijoa Display) — the marketing display face; the product does
  not carry it.
- Layout metrics — `--page`, `--pad` (24→64→124), `--gutter`, `--maxw`, `--dot`/
  `--hatch`/`--dash` textures, the blueprint frame/crop-mark/crosshair system.
- Deliberate accent literals — the gamification loop-level cube hues
  (`#EDC77F`/`#F59552`/`#F0744B`), the flow-state blue `#0068C9` / green `#079455`,
  the highlight yellow `--hl #f4d77a`, the marker gold. These are content color,
  not brand, and are fine (the brand stays neutral).
- The `.ol-web` scope itself + the `* { corner-shape: squircle }` reset.

### C. Reconcile / open questions (a real gap between web and DS)

| item | the gap | note |
| --- | --- | --- |
| **Neutral ramp** | web = Tailwind `neutral`; DS = OKLCH ramp; most steps 1 off (see the table below) | The biggest systematic divergence. Decide whether the DS ramp shifts toward Tailwind values, or the web layer accepts the DS ramp (would move parity off pixel-exact). Currently web carries Tailwind verbatim. |
| **brand solid** | web `#404040` vs DS `--primary #262626` | Marketing brand is one ramp step lighter. Scoped `--primary:#404040` in `.ol-web`. Decide the canonical brand solid. |
| `--radius-lg` | web 18px vs DS 16px | minor; pick one. |
| semantic green | web `#1f9d57` vs DS `--success #4e9961` | pick one green. |
| **FAQ open-answer padding** | web-directed even padding (`.qa .a 16px 0 0`) vs source `4px 40px 14px 0` | Bal-directed house style (steps 3/7); on the long FAQ answer it wraps 7 lines vs live's 8 (−26px). Keep the house style or restore `4px 40px 14px 0` on `.faq .qa .a` for strict FAQ parity. **Flagged for Bal.** |
| DS-agent chrome | the real DS `<Conversation>` adds per-turn timestamps + "Thought for Ns" the live agent lacks | Hide via `.ol-web .bp-msg__time,.bp-elapsed{display:none}` for tighter parity, or keep the authentic DS agent. **Flagged for Bal (step 5).** |

Everything below is the per-step evidence these verdicts draw on.

---

## Systematic: the neutral ramp

The marketing site uses the **Tailwind `neutral` scale**; the design system uses
its own OKLCH-derived ramp (fixed L per step, hue leaning off the brand). Both are
achromatic, but the L values differ, so most greys are a step off.

| web var | web value | closest DS token | DS value |
| --- | --- | --- | --- |
| `--n-950` | `#0a0a0a` | `--neutral-950` | `#191919` |
| `--n-900` / `--ink` | `#171717` | `--neutral-900` / `--text` | `#262626` |
| `--n-800` / `--ink-soft` | `#262626` | `--neutral-900` | `#262626` (match) |
| `--n-700` / `--secondary` | `#404040` | `--neutral-800` | `#404040` (match) |
| `--n-600` / `--muted` | `#525252` | (between 750 `#666`/800 `#404040`) | — |
| `--n-500` | `#737373` | `--neutral-700` | `#737373` (match) |
| `--n-400` / `--faint` | `#a3a3a3` | `--neutral-500` / `--icon` | `#a3a3a3` (match) |
| `--n-300` / `--line-strong` | `#d4d4d4` | `--neutral-300` | `#cfcfcf` |
| `--n-200` / `--line` | `#e5e5e5` | `--neutral-200` / `--edge` | `#dcdcdc` |
| `--n-100` / `--panel` | `#f5f5f5` | `--neutral-50` | `#f0f0f0` |
| `--n-50` | `#fafafa` | `--neutral-25` / `--canvas` | `#f7f7f7` |

Note the *names* also shift by a step: the site's hairline border `--line #e5e5e5`
sits between the DS `--border #e9e9e9` and `--edge #dcdcdc`.

## Brand / primary

| what | web | DS |
| --- | --- | --- |
| primary solid (`--btn` / button fill) | `#404040` | `--primary` `#262626` |

Handled in the web layer by scoping `--primary: #404040` inside `.ol-web` (it is
achromatic, so the DS neutral ramp, which leans off `--primary`, is unaffected).
The marketing brand solid is one ramp step lighter than the product's.

## Button (reused DS `Button`, extended)

| property | web `.btn-lg` | DS `Button` |
| --- | --- | --- |
| large tier height / pad / radius | 48px / 0 24px / 24px | no `lg` size existed (default 34px) |
| font-weight | 600 | `font-medium` 500 |

- Added an `lg` **size variant** to `components/base/button.tsx` (48/px-24/24px
  squircle) rather than forking the button. The marketing CTA reuses the DS
  primary Button at this tier; measured pixel-identical to the live CTA
  (height 48, radius 24, pad 24, 15px, gradient fill, white text).
- The web CTA adds `font-semibold` (the DS button is 500; the marketing button
  is 600). Candidate: does the DS primary button want 600, or is 600 web-only?
- The reveal arrow uses the DS Button's draw-in slot (`bp-reveal-slot` +
  `arrow-right`); the vanilla site used a plain width/opacity slide of a slightly
  different arrow path. Micro-interaction only; flag for a later look.

## Radius

| web | value | DS | value |
| --- | --- | --- | --- |
| `--radius` | 12px | `--radius` | 12px (match) |
| `--radius-lg` | 18px | `--radius-lg` | 16px (1rem) |

## Status / accent colors

| web | value | DS | value |
| --- | --- | --- | --- |
| `--green` (semantic) | `#1f9d57` | `--success` / `--ol-success` | `#4e9961` |
| `--hl` (highlight yellow) | `#f4d77a` | — (no DS equivalent) | web-only |

## Expected web-only (not conflicts)

- `--font-display` Feijoa Display: the display typeface the product does not
  carry. A legitimate web-layer token, per the brief.
- Header dark-band literal `#262626` (matches DS `--neutral-900`), diagonal hatch
  / dot-grid textures (`--dot`, `--hatch`, `--dash`), blueprint layout metrics
  (`--page`, `--pad`, `--gutter`, `--maxw`): marketing layout primitives.

## Step 2 (hero + logo strip)

No new token divergences. The hero uses `--font-display` (Feijoa, already logged),
`--ink-strong #0a0a0a` (already in the neutral table as `--n-950` vs DS
`--neutral-950 #191919`), `--faint #a3a3a3` (matches DS `--neutral-500`), and the
`--paper`/`--dot` layout primitives (already noted as web-only). The yellow marker
and blueprint shapes are image assets, not tokens.

## Step 3 (the problem)

Two hardcoded literals in the source (not even web tokens there) that are NOT
pure-neutral (they carry a faint blue, unlike the site's R=G=B ramp), kept
verbatim for parity:

| source literal | where | nearest DS token | DS value |
| --- | --- | --- | --- |
| `#131316` | problem title + emphasized `<b>` | `--text` / `--neutral-900` | `#262626` |
| `#70707b` | problem lead paragraph | `--text-muted` / `--neutral-750` | `#666666` |

The `.qa` accordion open fill `#fafafa` = web `--n-50`; its border `#ededed`; the
answer text `#525252` = web `--muted`. These are consistent with the web ramp.

Also newly relevant (noted at step 2 for the Google circle, recurs here): Tailwind
preflight's `img{max-width:100%}` clamps oversized/cropped images; any such image
(the circle, later the faq/products sketches) needs `max-width:none` to match the
vanilla site, which has no img reset.

## Intentional deviations from live (Bal-directed)

Not parity misses; changes Bal asked for that improve on the vanilla site. The
design system (the `Qa` component) is the source of truth for these.

- **Flowstack card padding** (`.ala-card`, step 5): the live page used `16px 24px`
  (bottom 16 read tighter than the 24 sides). Evened the bottom to 24
  (`16px 24px 24px`) so it matches left/right. Card height is measured at runtime,
  so the rings/recenter adapt automatically.

- **Open accordion padding** (`.qa .a`): the vanilla site used `4px 40px 14px 0`,
  which made the open box lopsided (bottom 39 / right 65 vs top/left 25) and left
  the label visually joined to the answer. Now the box's 24px frame is even on all
  four sides and the answer adds a 16px top gap so the label reads as separated.
  Applies to every `.qa` (Problem, and later System + FAQ).

## Step 4 (the system, dark band)

Dark-band literals (the marketing site hardcodes these; the DS dark theme has
role tokens, but the marketing dark band is its own fixed palette):

| source literal | where | nearest DS token |
| --- | --- | --- |
| `#262626` | band background | `--neutral-900` / dark `--surface` (match) |
| `#3f3f46` | band borders / dividers | dark `--edge`-ish |
| `#212121` / `#181818` | dark accordion open fill / border | (no direct token) |
| `#e4e4e7` | system sub | dark `--text`-ish |
| `#a1a1aa` | agent line | dark `--text-muted`-ish |
| `#fafafa` | dark answer text | `--neutral-25` |

Deliberate accent hues (the gamification loop levels; not brand, like the site's
green/yellow): cube fills `#EDC77F` (Cue), `#F59552` (Action), `#F0744B` (Reward),
`#838383` (Habit loop), and the matching label/arrow colours.

## Step 5 (the agent-led animation)

The LEFT flowstack + the RIGHT panel CHROME were ported **verbatim** from
`protocol-stack/index.html` (`.ala-scope`, 1773-2157 CSS + 2222-2476 markup +
2512-3368 driver), scoped under `.ol-web`. They carry the source's own
self-contained variable block (`--gray-50…--track`, `--blue-*`, `--green-*`,
`--ink`, `--brand #262626`, `--track #E9EAEB`) — these are the animation's local
palette, not DS tokens, and are kept as-is for parity (no new global divergence).

Genuine web-vs-DS divergences introduced by making the RIGHT panel the real DS
`<Conversation>` instead of the vanilla message list:

| what | web (live vanilla) | rebuild (DS) | note |
| --- | --- | --- | --- |
| message avatars | `avatar-jaimie.png` disc headshot | DS floating `bp-fig-avatar` (head pokes out, no disc) | Bal-accepted (right = real DS agent). Header keeps the disc headshot for identity parity. |
| user "ME" avatar | squircled (global `*{squircle}`) | **true circle** | the DS declares `.bp-msg__avatar` round; the marketing global squircle was re-squaring it. Fixed with `.ol-web .bp-msg__avatar{corner-shape:round}` (also dots + Choices reveal disc). The web layer's own `.ala-dot` is left squircled, matching live. |
| chat chrome | none | DS adds per-turn timestamps (“Sunday 7:56pm”) + “Thought for Ns” dividers | makes the DS thread taller, so the panel caps at the 664 lane where the live panel hugs to ~589. Candidate to hide in the web layer (`.ol-web .bp-msg__time, .ol-web .bp-elapsed{display:none}`) if Bal wants tighter parity — left visible for now (it is the authentic DS agent, as in the first cut). |
| answer cursor | custom arrow/hand cursor travels to choice A + click-ring | dropped | the cursor targeted the vanilla `.choice`; the DS `Choices` auto-picks after a dwell instead. |
| header height morph | animated `height` head1↔head2 | instant (phstate opacity/transform crossfade only) | can't CSS-transition to `auto`; the crossfade carries the morph. Minor. |

Deliberate accent literals kept verbatim (the flow states — not brand, like the
loop-level cubes): blue `#0068C9` (triggered / step outline draw), green `#079455`
(completed / connectors / “Built”/“Answered” chips), plus the `--blue-*`/`--green-*`
tint ramp for choice highlights and badge fills. The card header dark fill is
`#4a4a4a` (a step lighter than the `#262626` band), verbatim.

The muscle-arm celebration motif is the real Lottie (`muscle-arm.json`, recolored
white via the ported `recolorIllustration`), with a static flexed-arm SVG fallback.

## Step 6a (the Stack — static)

No new token divergences. The Stack section reuses existing web-layer tokens
(`--page`/`--pad`/`--dot`/`--line`/`--line-strong`/`--paper`/`--white`/`--ink`/
`--secondary`/`--faint`/`--n-400`/`--font-display`) and the existing `.pill` /
`.pill-white` / `.badge-num` / `.reveal-up` / `.xplus` primitives. Added:
`.pill-green` (`#f0fdf4` / `#bbf7d0` / `#15803d`), the `.stack-*` / `.pcard-*` /
`.hiw-*` / `.cta-cubes` blocks, all **verbatim** from the source's later (winning)
definitions. The "Get the Full Stack" button reuses the DS Button via `<Cta>`.

Deliberate green literals (the "Bonus toolkit" card + Save pill, matching the
source): `#f0fdf4` fill, `#bbf7d0` border, `#15803d` text, `#f0fdf4`/`#bbf7d0` on
the bonus card body. The cube tiles are image slices of `stripe-thumbnail(.-light).svg`.

Static-first state (motion is step 6b): the title subtitle words render **dark**
(`.w.on`); step 6b flips the default to gray and drives the `.on` toggle on scroll.
The "How it works" band renders **unpinned** (its own reduced-motion/mobile form);
step 6b layers the desktop pinned step-reveal via an `is-pinned` class. The cube
strip sits at `--s:0` (flush); the spread spring is 6b.

## Step 6b (the Stack — motion)

No new token divergences. Two scrubs ported **verbatim** (same math as the vanilla
driver) but wired through the stage's per-frame `vh` + the elements' own live rects
(section-relative, no `window.scrollY`), so they match the site's motion model:

- **Title word darken** — `.stack-title .w` toggle `.on` (gray→black) one word at a
  time as the subhead scrolls up (start `vh*0.9`, end `vh*0.33`). Under reduced
  motion the stage is inert, so a web.css fallback rests the words dark.
- **Card cascade** — `.stack-cardgrid.is-scrub .pcard` fade + slide in from the
  right, left-first (STAGGER 0.18, SPAN 0.46), latching the collapsed row height so
  an open card doesn't shove the arrival point up-scroll.

**Behavioral divergence (DEFERRED, Bal-agreed):** the vanilla "How it works"
**pinned** step-reveal (header holds while steps lock in one at a time) is **not**
ported. Two implementations were built and measured against the ScrollStage:
1. the vanilla nested `position:sticky` — the section's own huge-negative sticky
   `top` displaces the nested sticky (~3570px), so it never holds;
2. a transform-driven "fake pin" (reserve tall wrapper height + `translateY` to
   hold at viewport centre, self-correcting off the live rect) — the hold math is
   sound, but the ScrollStage's pin-and-stack has later sections slide OVER this
   one, so the HIW never reaches viewport centre (the steps top out at ~2200px at
   max scroll) — it can't get solo scroll space, so it never engages.

Root cause: a self-contained scroll-hold sub-effect is incompatible with the stage
owning the scroll timeline. The correct fix is to promote the HIW to its **own
registered `<Section>`** so the stage allots it dedicated pin space — a composition
change ("the stack is one Lego block" → two) to weigh separately with Bal. The band
ships **static** (the source's own mobile/reduced-motion fallback — steps visible),
consistent with prior findings that this reveal is finicky. Title-word + card
cascade scrubs are unaffected and shipped.

## Step 7 (the Source / About)

No new token divergences. Reused existing tokens + the `.pill`/`.pill-white`/
`.badge-num`/`.reveal-up` primitives and the DS-side `Qa` component (its `about`
variant). Added the `.about-*`, `.press-logos`, and `.qa-about` blocks **verbatim**
from the source. Press-logo optical heights keyed by `alt` (Forbes 29 / Entrepreneur
30 / Wired 33 / Fast Company 37 / FWA 28 / Awwwards 15) match the source; the Forbes
underline is the `underline-01.svg` overlay. Section measures pixel-identical to live
(section 831, photo 478×479, h2 490×120, 6 logos).

**Fix that also touches earlier sections:** the live page has an **unscoped global**
`summary { padding: 14px 0 12px }` (from the products `.card`) that leaks onto every
`.qa summary`, so all live accordions (Problem / System / FAQ / About) carry +26px of
summary padding. The rebuild's scoped CSS never inherited it, so its accordions were
26px short of live — a divergence silently present since steps 3-4. Reproduced now as
`.ol-web .qa summary { padding: 14px 0 12px }`, which brings **all** accordions into
exact alignment with live (every summary 50px; About/Problem/System now match).

## Step 8 (the proof group — quote + testimonials, `.g-d2`)

No new token divergences. The whole group reuses existing web-layer tokens
(`--page`/`--pad`/`--dot`/`--line`/`--line-strong`/`--paper`/`--white`/`--ink`/
`--font-display`) and the generic `.xplus` crosshair. All section CSS ported
**verbatim** from the source (quote 1176-1215, testimonials 1217-1302), scoped
`.ol-web`.

Literals kept verbatim for parity (all achromatic except one faint-blue gray,
consistent with the ramp already logged):

| source literal | where | note |
| --- | --- | --- |
| `#131313` | `.quote-text` | R=G=B, near-black; nearest DS `--text`/`--neutral-900 #262626` |
| `#000` | `.tp-quote` | pure black pull-quotes (heavier than `--ink #171717`) |
| `#525252` | `.quote-who .stat`, `.tp-stat` | = web `--muted` (already logged) |
| `#a3a3a3` | `.tp-stat .sep` | = web `--faint`/`--n-400` (already logged) |
| `#a0a0ab` | `.quote-who .stat .dot` | faint **blue-leaning** gray (B>R=G), like `#70707b`/`#131316` from step 3 — kept verbatim |

Two rebuild-specific, parity-neutral notes:

- **Tailwind preflight `img{max-width:100%}`** clamps the sized images; added
  `max-width:none` to `.quote-avatar`/`.tp-avatar`/`.tp-logo` to match the source
  (which has no img reset). Defensive here (all three are sized below their
  container so nothing actually clamped at 1440), but consistent with the Google
  circle / press-logo fix from steps 2 & 7.
- **Word spans pre-rendered in React** rather than split from `textContent` at
  reveal time (the vanilla `splitWords`). Keeps the `.tp-quote` DOM React-owned so
  reconciliation on the next active-panel change is safe; the `reveal()` line
  grouping (by `offsetTop`) and 32ms-per-line stagger are otherwise verbatim, as
  are `freezeWidth` and the flex-basis/grow slide.

Verified measured, side-by-side vs live (reduced-motion static frame diffs
**byte-for-byte identical**: quote-frame 1032×642.75 / pad 124-24-72, quote-text
Feijoa 48/60 #131313 928×120, quote-avatar 156, tgrid 1032×452 panels
[703,164,164], tp-quote Feijoa 24/29.76, tp-stat pad 18/20/18/188 dashed). Motion
pixel-identical across all three carousel panels (slide + line-by-line reveal),
quote reveal-up fires, About above + FAQ below unaffected.

**Cleanup (not a divergence):** removed a **stale placeholder** from the Landing
manifest. The `BLOCKS` array still carried a `products`/"The protocols" entry —
the Stack section's step-1 placeholder, which should have been deleted when
`StackSection` (`g-c`) landed in step 6. It rendered a stray white section between
About and the quote (no such section exists on live). Deleted alongside the
`quote` entry; `BLOCKS` now holds only `faq` + `cta`, matching the live page's
remaining groups exactly.

## Step 9 (the answers — FAQ, `.g-e`)

No new token divergences. Reused the DS-side `Qa` component (light variant) and
the already-built base `.qa` CSS (summary/answer/icon/open-fill, incl. the step-7
`summary { padding: 14px 0 12px }` global-leak fix). Added only the FAQ layout
(`.faq`/`.faq-in`/`.faq-head`/`.faq-hb`/`.faq-badge`/`.faq-list`) **verbatim** plus
`.faq .qa { padding-block: 14px }` (tighter rows) and `.faq .qa .a p { margin: 0 0
12px }` for the multi-paragraph answer. The source's `.faq-sketch` is CSS-only
leftover (no markup element on live), so dropped. Single-open grouping copied from
`SystemSection`'s `onToggle`.

**Parity: closed rows byte-identical to live** — every closed row 80px, summary
50px, `.faq-in` 1280 / pad 72-124 / gap 64, head 484×150, badge 129.9×30, h2
116.5×60 (48/60), sub 484×28 #525252, list gap 8. Single-open + the 3-paragraph
"Why PDFs" answer (12px gaps, last 0) verified.

**One visible deviation — the OPEN answer (the established even-padding, now on a
longer answer):** the base light `.qa .a` uses the Bal-directed even padding from
steps 3 & 7 (`padding: 16px 0 0`) instead of the source's `4px 40px 14px 0`. On
the FAQ's long first answer this is more pronounced than on the Problem
disclosure: the answer loses the source's 40px right inset, so its text measure is
the full 434 (vs live's 394) and it wraps **7 lines instead of 8**; the open row
is **264 vs 290** and the section **848 vs 874 (−26px)**. Everything else matches.
This is consistent with the Problem section's light `.qa` (same rule), so the
rebuild is internally consistent — but it is the one place the FAQ diverges from
live. If strict FAQ pixel-parity is preferred over the even-padding house style,
the one-line restore is `.ol-web .faq .qa .a { padding: 4px 40px 14px 0 }` (scoped
to the FAQ only, leaving Problem/System/About on the even padding). Flagged for
Bal.

## Step 10 (closing CTA + footer, `.g-e2`, the floor)

No new token divergences. The `.cta-boxes`/`.cta-cubes`/`.cube` strip already
existed (step 6). Added the closing-CTA + footer CSS **verbatim** (CTA 587-642,
footer 644-676) scoped `.ol-web`. Literals kept verbatim (all achromatic/on-brand,
matching the source): band `#262626`, borders `#3f3f46`, sub `#e4e4e7`, was
`#70707b`, `.save` translucent green `rgba(240,253,244,.12)` / `rgba(187,247,208,.12)`
/ `#f0fdf4`, footer text `#e5e5e5`/`#d4d4d4`/`#a3a3a3`, inverted button
`#1a1a1a` + `linear-gradient(180deg,#ffffff,#ededed)`.

Reuse / architecture notes:
- **Inverted button** — the closing CTA reuses the DS `<Cta>` (lg tier + reveal
  slot) flipped via a new `.ol-cta--inv` class (`color:#1a1a1a`, transparent
  border, white→#ededed gradient). This mirrors the existing header-dark `.ol-cta`
  flip and equals the vanilla `.btn.btn-lg.btn-inv`. Measured byte-identical to
  live: 176.5×48, radius 24, 15px/600, pad 0 24, dark text, same gradient.
- **Cube spring** — added `components/web/useCubeSpring.ts`, a verbatim port of the
  vanilla damped spring (K=140, DAMP=15, underdamped → the little overshoot/bounce),
  driven the DS way (target from the row's own rect on each stage frame + an
  independent rAF that settles the overshoot). Wired into BOTH the closing CTA and
  the Stack cube strip — the vanilla driver springs both rows, so this also
  **completes the step-6b-deferred stack cube spring** (it was shipping flush).
  Both rows verified spread=1 far below centre → lock to 0 with overshoot at centre
  → reverse on scroll-up, matching live's dynamics (the stack row does reach centre
  and lock even under the pin, contra the HIW reveal). The stack's title-word +
  card-cascade scrubs are unaffected.

**Footer bottom padding — load-bearing, kept at the source's 150px.** First cut used
the design base 48px (reasoning: no chat dock in this rebuild). Measured wrong: the
ScrollStage pin-and-stack leaves ~100px of the floor section below the fold at max
scroll (true on BOTH pages — live reaches ~93px short of its own maxScroll, the
rebuild ~105px), so 48px clipped the copyright/legal row off the bottom of the page
(unreachable). Restored the source's `footer{padding-bottom:150px}` (applied after
the media query, so it wins on every breakpoint); the legal row is now reachable and
reveals at max scroll, matching live within ~3px (foot-bottom top 803 vs 800). The
150px doubles as reserved space for the persistent chat dock (the Loop agent,
rebuilt separately) — which is why the source carries it. Footer element height 412
(= live).

Everything else in the group measured byte-identical to live (reduced-motion static
frame): cta-in pad 62-124 / gap 24, h2 Feijoa 64/79.36 max 836 with the gold-marker
`.mark` 290×90, sub 18 #e4e4e7, cubes 568×142 (closing = dark stripe-thumbnail.svg,
stack = light), price was 30 / now 48 / save translucent-green, foot-in 1280 gap 64
pad 0-124, foot-nav 14/600 #e5e5e5, logo 174×30, social 32×32, foot-bottom pad-top 32.

**Landing manifest cleanup:** with all sections real, removed the placeholder
scaffolding (the `Placeholder` component, `Block`/`Bar` types, `BAR_BG`, the empty
`BLOCKS` array + its `.map`) and the now-unused `Section`/`useStageScroll`/`useRef`/
`useEffect` imports. `Landing` is now the 8 real sections in order.

## Step 11 (finalize)

The rebuild is complete. Finalized this doc into the report above (the "Decision
summary" section near the top consolidates every divergence into promote /
keep-web-only / reconcile buckets — the input to the later token decision). Filled
the styleguide's "Web" nav group (`styleguide/src/pages/web.tsx`, registered in
`showcases.tsx`) with two showcases — **Web tokens** (the neutral ramp, roles &
layout tokens, Feijoa display type) and **Web primitives** (pills, crosshair, the
`Qa` accordion light + dark, the `Cta` button primary + inverted, the cube strip
light + dark) — each rendered inside a `.ol-web` scope with `web.css` imported (the
CSS is fully `.ol-web`-scoped, so it does not leak onto the DS styleguide; verified
measured). Copied the Feijoa fonts + `stripe-thumbnail(-light).svg` into
`styleguide/public/assets` so those two showcases render standalone.

_Report complete through step 11. The full onboardingloop.ai marketing layer is
rebuilt as `.ol-web` React sections sharing the design system, with every
divergence catalogued above._

---

## Post-rebuild: shared chrome + multi-page (Terms / Privacy)

No new token divergences. Two structural additions on top of the landing:

- **Shared chrome extracted** — `Footer` split out of `CtaSection` into a
  standalone component; `TopBar` given a `home` prop; `PageShell.astro` stamps
  `TopBar + <slot> + Footer` around a page. The landing is unchanged (footer still
  in its scroll-stack floor, measured identical); standard pages compose the same
  components. One source of truth, so a chrome edit propagates to every page + the
  DS showcase at once.
- **`LegalPage` template** — the Terms/Privacy shared template (hero + dashed rule +
  sticky "on this page" tab rail + prose sections + scroll-spy), CSS ported verbatim
  (`.lp-*`). Terms + Privacy are content-only React islands on `PageShell`; both
  measured **byte-identical** to the live static pages (Terms hero 557 / body 2934;
  Privacy hero 493 / body 2738; scroll-spy + native nav-scroll verified).

**⚠️ Footgun recorded (bit me on the legal hero):** the landing carries a base
`.ol-web section { padding: 64px 0 }` that every landing section silently overrides
with its own `padding`. Any NEW `<section>` that does not set `padding` inherits
that 64px — it added 64px to `.lp-hero` and 128px to each of the 13 `.lp-section`s
(a 1664px body-height blowout) until reset. Fix: legal sections set `padding: 0`
(hero pads via `.lp-hero-in`, prose spaces via the `.lp-content` gap). **Rule for
future pages: any new marketing `<section>` must set its own `padding`.** A cleaner
long-term fix is to drop the broad base rule and give each landing section explicit
padding — a candidate cleanup, not done here to avoid churning the verified landing.

- **`TopBar` homing is landing-only now** (`if (home) return`): the eased anchor
  scroll exists to defeat the ScrollStage pin-and-stack, which no other page has;
  on a standard page it would hijack the page's own in-content `#anchors` (the legal
  tabs). Standard pages use native scroll + `scroll-margin-top`.
- Footer legal links now resolve to the real routes `/terms-of-service` /
  `/privacy-policy` (the two pages cross-link via the shared footer).
