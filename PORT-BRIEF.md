# Kit → React Port Brief (Loop Design System, Phase 2 continued)

Executable brief for a fresh session. Bal wants the **entire Blueprint kit rebuilt as
React components** in this library, matching the vanilla kit **pixel-for-pixel and
behavior-for-behavior**, reorganized smartly, with the **styleguide rebuilt on the
library's own components using the starter-layout app shell**. This must be complete
before any project work. After the kit: apply to **Heatmap → onboardingloop.ai → Loop OS**.

Bal reviews **rendered output**, not code. He prefers you do the whole port and show him
at the end (minimal check-ins). American English, never em dashes, always hand him the
**full clickable `http://localhost:PORT/...` URL**. Do not run `git commit` (print the
commands); batch commits.

## The two systems

- **The kit = the design source of truth (vanilla CSS/JS):** `~/Desktop/code/loop-design-system/kit/*.css`,`*.js` + the docs site `~/Desktop/code/loop-design-system/docs/*.html`. Serve: `cd ~/Desktop/code/loop-design-system && python3 -m http.server 8902` → `http://localhost:8902/docs/index.html`. The `docs/starter-layout.html` app shell is the layout the styleguide must adopt.
- **The React library (what you build in):** `~/Desktop/code/onboarding-loop-design-system`. Components in `components/base|product|web/`, barrel `index.ts`, Tailwind bridge `theme.css`, neutral tokens `tokens.css`. Styleguide app in `styleguide/` (Vite). Run: `cd ~/Desktop/code/onboarding-loop-design-system && npm run dev` → `http://localhost:5173/`.
- **Token source:** `~/Desktop/code/loop-design-system/tokens/` (neutral brand). If tokens change: `node tokens/build.mjs`, then `cp tokens/build/ol-tokens.css ~/Desktop/code/onboarding-loop-design-system/tokens.css`.

## Ground rules (settled decisions)

- Base UI (`@base-ui/react`) for interactive primitives; CVA for variants; `cn()` from `@/lib/utils`. `@` alias = repo root (vite.config + tsconfig).
- **Tabler icons only** via `@tabler/icons-react` (MIT, resale-safe). Never Hugeicons/Untitled/paid.
- **Neutral brand.** Pure achromatic grays; only functional status colors (success/warning/destructive/info) carry hue. Never reintroduce terracotta. Components read tokens (`--primary`, `--foreground`, `--border`…), never hard-code gray.
- **Squircle** (`corner-shape: squircle`) on rounded rects; circles (avatars, checkmark disc, day cells, knobs) stay round.
- **Verify measured**, per the global CLAUDE.md rule: drive a browser (Playwright at `~/Desktop/code/loop-design-system/node_modules/playwright`), assert bounding rects + computed styles + applied classes, compare against the live kit page, check the negative case, inspect a screenshot. Never eyeball.

## State so far (done)

- Phase 1 tokens unified + neutral + promoted live to Loop OS.
- Phase 2: Vite styleguide, neutral brand, Tabler swap, Base/Product/Web folder reorg, dark-mode toggle.
- **Foundation laid in `theme.css`:** type scale bridged into Tailwind (`text-base` = 14px, the kit default), kit shadow tokens (`--shadow-control`, `--shadow-pop`, `--shadow-card`), radius intent (controls `rounded-lg` 16, cards `rounded-xl` 24).
- **Button ported as the template** (`components/base/button.tsx`): kit tiers `primary/secondary/tertiary/ghost/destructive/link`, 34px / 14px-500 / 16px squircle, accent gradient + control shadow + 3px accent focus. Measured parity confirmed against `docs/components-button.html`. **Follow this pattern for every component.** (Still TODO on the button: the reveal-icon, reveal-label, and icon-only behaviors, see below.)

## Bal's three requirements from this session

1. **The styleguide's home is built ON the design system.** Rebuild it on the `docs/starter-layout.html` app shell (collapsible primary nav + sub-nav + content, agent launcher docked bottom-center) constructed from the library's own React components (nav rows via a Button `nav` tier, cards, etc.). Replace the current hand-built Vite sidebar. Dogfood.
2. **Reorganize smartly.** The old kit organization was messy; don't replicate it. Use Base / Product / Web with logical grouping.
3. **Port the special button behaviors:** icon-only (square 34px), reveal-icon-on-hover (`.bp-btn--reveal`, trailing/leading icon slides in + draws itself), and reveal-label (`.bp-btn--reveal-label`, icon-only that grows a label on hover, e.g. a Send button). Bal specifically noticed the primary's hover icon.

## Confirmed answers (Bal)

- **Styleguide home = the starter-layout's app-shell layout housing the docs.** Reuse its collapsible nav + content-column structure (built from the library's own React components) as the styleguide frame; each nav item opens a component or foundation page. It stays a docs site, dogfooded, not the agency-workspace demo itself.
- **Scope priority = Stages 1-4 + the styleguide first.** Finish all static primitives, widgets, the menu/dropdown, and the styleguide-on-starter-layout. Leave the hardest behavioral tiers (Stage 5 agent chat + convo engine, Stage 6 morphing surface + spotlight overlay) for a dedicated follow-up session, they are each session-sized. Do NOT rush them at the tail of a session.
- **APIs = match the kit freely.** Rename/restructure component props to match the kit design (the Button's `default→primary` rename is the precedent). Only the styleguide consumes these today, so nothing downstream breaks yet.

---

## Design language (the kit canon every component adopts)

Neutral defaults; components read `--bp-*`/semantic tokens, never hard-code gray. Squircle on rects; circles stay round.

- **Control heights:** default (button / single-line input / dropdown trigger) = 34px; sm = 32px; nav/menu row min 32-36px; selection chip 40px; textarea = owner-controlled height, not locked.
- **Type (tokens.css `--text-*`, now bridged):** base 14 = default body/control/label; sm 13; xs 12 (captions only); md 16; lg 18; xl 22; 2xl 28; 3xl 36. Inter. Weights: control 500, field label 600, card title 700 (15px, -.01em). The old React `text-xs` everywhere was one step small → `text-base`.
- **Spacing (4px):** default gap 8; card gap 12, card pad 18 uniform; header pad 16; button pad 0/16 (sm 0/12); input 0/14 (sm 0/10); menu item 10/12; nav item 8/10.
- **Radii:** sm 8, base 12, btn 16 (buttons+inputs+textareas+dropdown triggers+open menus+menu items+nav items), lg 24 (cards/headers/surface), pill 9999.
- **Borders:** `--bp-border` rgba(17,24,39,.08) faint hairline; `--bp-border-strong` rgba(17,24,39,.14) crisp control/card/menu; literal grays #dcdcdc/#cfcfcf (secondary button + dropdown trigger, solid so shadow can't bleed), #d7d7d3 (score), #e9eaeb (slider/progress track). Fix the `--border` token to the translucent .08 value.
- **Gradients (React had ZERO, the single biggest gap):** every raised control is a 180deg gradient. PRIMARY = linear-gradient(180deg, accent+10% white, accent+10% black) + 1px accent border. SECONDARY + EVERY dropdown trigger = linear-gradient(180deg,#fff,#f7f7f7) + 1px #dcdcdc border. (Already done on the button.)
- **Shadows:** `--shadow-control` 0 2px 4px -1px rgba(10,13,18,.08); `--shadow-pop` 0 2px 8px .22, 0 0 0 1px .04 (menus/popovers); `--shadow-card` 3-layer soft (cards/surface). (Tokens added to theme.css.)
- **Focus:** uniform 3px ring. Buttons 0 0 0 3px accent@32%. Inputs/textareas/dropdown-open = border→accent + 3px `--bp-accent-tint`. Replace every old `ring-2 ring-ring/30`.
- **Forcing classes:** the kit authors every state twice, real pseudo-classes AND `.is-hover/.is-focus/.is-active/.is-checked/.is-current/.is-open/.is-done/.is-disabled`. React primitives should accept these so a states board can show every state at rest.
- **Disabled:** opacity .45, cursor not-allowed, pointer-events none.
- **Motion (carry verbatim):** stagger 80ms; `--bp-dur-snap` .3s; `--bp-ease-back` cubic-bezier(.68,-.6,.32,1.6); `--bp-ease-emphasized` cubic-bezier(.22,1,.36,1); calm card glide cubic-bezier(.22,.8,.24,1) .44s. Respect prefers-reduced-motion (instant path) everywhere.

## Parity fixes for the 9 existing Base primitives

All were shadcn "base-mira" dense (h-7=28, text-xs=12, rounded-md=12, flat, no gradient/shadow, 2px gray focus). Most are utility swaps now that the foundation is laid.

- **button** — DONE (template). Remaining: reveal-icon / reveal-label / icon-only.
- **input** — h-7→34; text 14; rounded-lg 16; px 14; border-strong; focus accent border + 3px accent-tint; filled weight 600; optional 40px leading-icon segment + text prefix (#/$/@).
- **textarea** — text 14; rounded-lg 16; px 14; accent focus; keep auto-grow/owner height (do NOT lock to 34).
- **select** — trigger 34/14/rounded16/px14; ADD #fff→#f7f7f7 gradient + #dcdcdc border + control shadow; chevron 18 rotate on open; open = accent border + 3px accent-tint; content shadow-pop, radius16, pad6, gap2, max-h296; item ~40px/14/rounded16; selected = accent-tint + accent-strong + the outline-ring→accent-disc reveal check (the big one). (Full dropdown port is Stage 3.)
- **card** — rounded-xl 24; 18px uniform pad; gap12; 3-layer `--shadow-card`; title 15/700/-.01em; body 14; add `flat` and `interactive` (hover accent border + shadow-pop + translateY(-1px) + accent-tint focus) variants.
- **label** — text 14; font-semibold 600; leading 20.
- **badge** — keep the status pill (dot + semantic tints); only raise 10px → 12px text. (Kit `.bp-badge` is a separate 40px multi-select chip, port that as its own Product component.)
- **separator** — fix `--border` to translucent .08; optional `strong` variant.
- **scroll-area** — no kit counterpart; leave as-is (thumb could use border-strong).

## Build order (stages)

- **Stage 0 — foundation.** DONE (type scale + shadow tokens + radius intent in theme.css). Add a states/showcase board that renders forcing-class states at rest for kit-vs-React review.
- **Stage 1 — restyle the 9 Base primitives** to the kit (one at a time, measured): Label, Separator, Badge (done? verify), Button (done), Input, Textarea, Card, Select-metrics. Add the button reveal/icon-only behaviors here.
- **Stage 2 — simple new primitives (static):** circled checkmark (`.bp-checkmark` outline→disc, real circle), checkbox (14px radius-10, tick mask, ease-back), CTA row, nav item (+icon tip), progress bar, numbered score, compact chatbar + composer + suggestion chips, checklist item (3-state dashed→solid→done), card headers (accent/plain/media).
- **Stage 3 — menu/dropdown tier:** full Select/Dropdown (Base UI + trigger gradient + popup + the outline-ring→accent-disc reveal check + section/option + inline menu), calendar + date-range.
- **Stage 4 — interactive onboarding widgets (kit `bp:answer` → React state/callbacks):** lettered choices (A/B/C), multi-select badge chips (+confirm CTA), sentiment/plain slider, tooltip + anchored placement, resource center (compose from finished parts).
- **Stage 5 — agent/chat/convo engine (hardest; port BPConvo, discard BPChat demo):** agent identity + floating fig-avatar + message row + bubbles (thinking pill = SAME node as reply); staggered sequencer (80ms) + line-by-line reveal (Range measurement in useLayoutEffect); think→reply FLIP morph on one node + elapsed divider; scroll-follow (ease + hard-pin during morph, `scroll:false` to let a host drive); Lottie bulb + 3-dots fallback; wire Stage-4 widgets as convo children + echo-pick-as-user-chip.
- **Stage 6 — launcher + surface morph + overlay (agent-led layer):** stage + scale wrapper (author in reference px at designWidth 1440, `--bp-scale`); launcher pill morph (one element widens); `<AgentSurface>` state machine (ONE persistent card, states registry, `useLayoutEffect` writes inline geometry, CSS interpolates .44s; body cross-fade); overlay focus backgrounds (corner/center/spotlight); spotlight cutout coach-mark (3-part: blur+scale canvas, radial dim, sharp cloned-screenshot window); arrow/anchor placement. Verify measured against `slices/03-surface/index.html` (its Play button runs closed→resource→checklist→tooltip→chat).
- **Stage 7 — rebuild the styleguide on the starter-layout app shell** using the library's own components (requirement 1). Reorganize nav into Base/Product/Web + Foundations. Keep the neutral tokens; keep dark mode. (Can be interleaved: build the shell once the nav/card/button pieces exist.)

Also port the icon set: reuse `kit/icons.js` (Tabler paths, `pathLength=1` for draw-in) as a React `<Icon>` — ~60 icons.

## Hard parts (read before Stages 5-6)

1. Gradients + control shadow + 3px accent focus had to land in theme.css first (done) or nothing matches.
2. Dropdown check: rests as a 1.5px hollow ring + gray tick, fills to accent disc + white knocked-out tick on select, whole 20px slot opens from width:0. A real 50% circle, NOT squircled. Keep Base UI ARIA/keyboard; restyle only.
3. Line-by-line copy reveal needs REAL layout measurement (Range + getBoundingClientRect to find wrap points), in a post-layout `useLayoutEffect`, then reflow back to plain text; provide instant reduced-motion path. Not declarative.
4. think→reply morph: the thinking pill and reply bubble are ONE persistent DOM node that FLIP-morphs (measure r0, inject reply, measure r1, transition on ease-back). If you unmount/remount you break the core "build-out/in, one element that morphs" principle.
5. Two scroll loops must not fight: BPConvo self-manages scroll unless `scroll:false`; hard-pin (no easing) during the think→reply build.
6. Surface morph is a state machine over ONE element, not one component per state. Reference-px geometry + transform:scale wrapper, not %.
7. Spotlight is a 3-part illusion; port all three or it fails.
8. Lottie is decorative/runtime only; ship the static/CSS fallbacks FIRST (mask ticks, CSS chevrons, 3-dots thinking), layer Lottie after. Keep the dots fallback (fires onDone after 2000ms) as the guaranteed contract.

## Uncommitted work (batch-commit at a good point)

`onboarding-loop-design-system`: the Base/Product/Web reorg, the sidebar-navigated styleguide, dark mode, the theme.css foundation, the ported Button, this brief. `loop-design-system/tokens` is committed. Loop OS re-promotion of the neutral tokens is still pending Bal's explicit go (separate from this port).
