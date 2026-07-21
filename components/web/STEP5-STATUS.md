# Step 5 (agent-led animation) — DONE + verified

The 2nd subsection of the dark System band. LEFT = verbatim port of the vanilla
flowstack; RIGHT = the real DS `<Conversation>` inside ported header + composer
chrome; an orchestrator drives both beat-for-beat and loops. Verified measured,
side-by-side vs the live page (4321).

## Files (all `~/Desktop/code/ds-web`)
- `components/web/Flowstack.tsx` — LEFT panel markup, **verbatim** from
  `protocol-stack/index.html` 2222-2389 (same ids/classes/SVGs/copy; SVG attrs
  camelCased, repeated glyphs factored into local atoms). Renders `.flowcol`.
- `components/web/flowstack-engine.ts` — the LEFT controller, **verbatim** port of
  the driver's left-panel helpers (measure/recenter/openBlock/closeBlock/
  collapseAnim/buildEls/draw/retract/wiggle/buildRing/animateRing/setBars/
  setS1Body/setBody/setS3Await/snapLine/hardResetAll + run/pause/sleep/chk). Only
  `$('id')` → `q()` scoped to the animation root; right-panel/cursor/lottie removed.
- `components/web/AgentChat.tsx` — RIGHT panel: ported `.panel/.phead/.inputbar`
  chrome (dark identity header + ph1↔ph2 celebration morph with the real
  `muscle-arm.json` Lottie recolored white + static fallback; faux "Ask me
  anything…" composer) wrapping the real DS `<Conversation>` (Jaimie) driven by
  `apiRef`. Exposes `AgentChatHandle{celebrate,reset}`.
- `components/web/AgentAnimation.tsx` — orchestrator. Renders `.stage` =
  `<Flowstack/> + <AgentChat/>`. Reproduces the 5 beats (question→answer→build→
  handoff→hold), LEFT ops verbatim, RIGHT ops = DS Conversation api (think/ask/say)
  + header morph. One clock: the DS build widget's progress drives the left step-2
  bar + green ring. Ports `applyScale` (scale-to-fit) verbatim; IntersectionObserver
  play/pause; reduced-motion = static finished frame, no loop.
- `components/web/agent-widgets.tsx` — `AutoChoices` / `WorkspaceBuild` /
  `HandoffCtas` / `WORK_OPTS` (unchanged; the DS widgets the Conversation mounts).
- `components/web/web.css` — the ported `.ala-scope` CSS (LEFT flowstack + RIGHT
  chrome), scoped `.ol-web`; the DS-circle squircle exemption; panel `max-height`.
- Removed the loose first cut `AgentWorkspace.tsx`.

## Bal's feedback — both addressed
1. **LEFT identical to the original** ✓ — ported markup + CSS + driver verbatim.
   Measured pixel-parity vs live: stage 1280×814, flowcol 336×718, appcol 376×718,
   step card 334×134, green border `#079455` radius `0 24px 24px`, blue border
   `#0068C9`, connector 334×64 — all identical. Two-step rolling window, card-outline
   draws (blue→green), connectors + "Answered"/"Built" chips, "Awaiting response…"
   dots, ambient cues (breathe/cogs/pencil/dot-bounce) all present.
2. **RIGHT header + footer + circle avatar** ✓ — dark identity header (avatar +
   Jaimie/AI Assistant + close) that morphs to the "Olivia, you're crushing it"
   celebration (muscle Lottie); "Ask me anything…" composer footer; ME avatar is a
   **true circle** now (squircle exemption).

## Verified (measured, side-by-side vs live 4321)
- Frame 1280×814 (matched, incl. `applyScale`), band-level identical (heading
  padding `32px 124px 40px`, title `#fafafa`, frameTop 268 both).
- Scale-to-fit correct at 1024 (→651)/820 (→521); mobile 390 stacks (flow above,
  chat below), per the ported `@media(max-width:767px)`.
- Motion plays through all 5 beats and **loops** (state progression sampled
  t=3→24s; step 1 drops at handoff; ph2 celebration fires; reset → next loop).
- Reduced-motion renders the finished handoff frame (matches live), no loop.
- Panel grows with the thread (350→611→664) and caps at the lane, chat stays
  bottom-pinned (`atBottom` throughout).
- No runtime console errors (the lone 504 is Astro's dev-toolbar entrypoint).

## Known divergences (logged in TOKENS-DIVERGENCE.md → "Step 5")
- DS conversation shows per-turn timestamps + "Thought for Ns" dividers the live
  lacks → the DS thread is taller, so the panel caps at 664 where live hugs ~589.
  **Open question for Bal:** hide them in the web layer for tighter parity
  (`.ol-web .bp-msg__time, .ol-web .bp-elapsed { display:none }`) or keep the
  authentic DS agent (as the first cut did)? One-line either way.
- Message avatars use the DS floating avatar (accepted; right = real DS agent);
  header keeps the disc headshot for identity parity.
- Custom answer cursor dropped (DS Choices auto-picks); header height-morph is
  instant (crossfade carries it). Both minor.

## Promotion candidates (web → DS)
- The identity header + celebration morph → a DS `AgentCardHeader`.
- The composer footer overlaps `ChatPanel`'s `.ws-chat__foot` — unify.

## Servers / verify
- Rebuilt: `cd ~/Desktop/code/ds-web/site && npx astro dev --port 4330` → http://localhost:4330/
- Live: `cd ~/Desktop/code/protocol-stack && npx serve . -l 4321` → http://localhost:4321/
- Playwright harness in the session scratchpad (`shot.mjs`/`check.mjs`/`seq.mjs`/
  `measure.mjs`); chromium-1228 at `chrome-mac-arm64/Google Chrome for Testing.app`.
