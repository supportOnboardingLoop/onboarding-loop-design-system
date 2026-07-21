# Agent-led animation — choreography + source map

Source of truth for the ORIGINAL: `~/Desktop/code/protocol-stack/index.html`.
- design comment ~1765; scoped CSS (`.ala-scope`) 1772-2157; section-frame CSS
  (`.ala-section`, dots/rules/dark) 2159-2207; MARKUP `<section class="ala-section ala-on-dark">`
  2208-2511; DRIVER script IIFE 2512-3368 (beat list `BEATS` ~3029, `CONFIG` ~2519-2555).
- prototype: `protocol-stack/assets/agent-led/agent-led-onboarding-v3.source.html` (461KB).
Serve live original for compare: `cd ~/Desktop/code/protocol-stack && npx serve . -l 4321`.

## Bal's decision (this session)
- LEFT panel ("the agent does the work" — the flowstack of step cards, connectors,
  card-outline draws, progress) must be **ABSOLUTELY IDENTICAL to the original**.
  These do NOT exist in the DS — **port them verbatim** (markup + `.ala-scope` CSS +
  the driver JS beats), do NOT DS-compose them loosely.
- RIGHT panel (the chat) = the real DS `<Conversation>` (already done), but ADD the
  missing header + footer/composer and fix the user avatar (see STEP5-STATUS.md).

## The story (5 beats; plays once on view via IntersectionObserver thr 0.15, then loops; pauses out-of-view; reduced-motion = renderStaticFinal = finished built state, cursor hidden)
Two panels in a 1280-wide `.stage` (space-around, 48/24 pad). LEFT `.flowcol` (336w):
label "The agent does the work." + fixed 336x664 `.flowlane` hosting `#flowstack`
(blocks blk-s1, blk-c1, blk-s2, blk-c2, blk-s3; each height:0->auto, 520ms bounce;
`recenter()` translateY keeps the column centered; a rolling TWO-STEP window). RIGHT
`.appcol` (376w): label "The user gets the win." + 356 chat panel + a custom cursor.

1. QUESTION: step1 grows in, elements stagger (`.bel` 70ms), fires blue (`.trig .working`,
   badge Pending->Triggered, breathing shadow). chat m1 "Thinking…" (bulb Lottie). 1500ms
   think. Question morph: m1 bubble morphs (380ms bounce) into "What kind of work is this?
   I'll build the workspace to match."; step1 body expands to option list; 3 options build
   (90ms stagger) mirrored both sides (Client work / Internal team / Just exploring); blue
   card-outline "draw" traces (superellipse, bright leading dot).
2. ANSWER: cursor travels (700ms) to choice A, hovers, clicks (ring pulse); choice A `.picked`
   (blue + green check); left option A checks green. step1 completes: GREEN outline draws over
   blue (500ms), badge Completed, border/dot/icon green, wiggle. connector1 draws (green line +
   arrow) + chip "Answered". step2 builds, fires blue, body -> processing (2 counter-spinning
   cogs + "Processing answer…"). chat m2 "Thinking…" bulb (cogs + bulb spin together).
3. BUILD: ONE clock (`runProgress`, 2300ms easeInOutQuad) drives 4 things: left step2 progress
   bar + right chat progress bar + step2 green ring + its head, all 0->100%. labels "Building
   project"/"Building your workspace" + % counter. At 100%: "Project built"/"Workspace built";
   350ms hold; step2 settles green.
4. HANDOFF: collapse step1 + connector1 (rewind easing, non-bounce), connector2 draws + chip
   "Built". step3 builds, fires blue, outline is a CLOSED loop (terminal, no exit dot), body
   "Awaiting response…" (3 bouncing dots). chat m3 "Your client workspace is ready. Want to add
   a teammate?" + 2 CTAs ("Add teammate" secondary, "View project" primary). header celebration:
   crossfades "Hey Olivia, let's set up your first project." -> "Olivia, you're crushing it" +
   sub-line + flexed-arm (muscle) Lottie; header grows, panel stays bottom-pinned.
5. HOLD 3800ms, then reverse-unwind (messages out bottom-up 70ms stagger, header reverts,
   connectors retract, steps collapse + recenter), `hardResetAll()` no-transition snap, loop.

## Left-panel elements to port verbatim
Step card `.step`: white 24px squircle; a `.tab` above ("Step N:" + route icon); badge cluster
(Pending white/gray | Triggered blue+lightning | Completed green+check); title row (magic-circle
icon + h3 + typechip "Question"/"Action", recolor gray->ink->green); a divider; a body; a `.ala-dot`
node ring (gray->blue->green, hidden on step3). Bodies: step1 `.qbody` compose("Preparing question…"
+ writing pencil) <-> opts (3 radio options, circle->green-check); step2 `.bodyswap` wait/proc(2 cogs)/
build(progress bar); step3 `.workrow` "Awaiting response…" + 3 dots. Titles: s1 "Ask setup intent" /
"In-app question: 'What kind of work is this?'"; s2 "Build the workspace" / "Runs when the answer comes
in."; s3 "Ask to add team" / "In-app question: 'Want to add a teammate?'".
Connectors `.connrow` (334x64): SVG gray baseline + green draw path (dashoffset ~500ms) + arrowhead +
`.connchip` ("Answered"/"Built" green pills). Card-outline `.cardline`: SVG traces the squircle
silhouette (sampled superellipse `ringPathD` RING_N=4) with bright leading dot; steps 1&2 gap at bottom
for exit node, step3 closed. Ambient loops (breathe/cog-spin/pencil/dot-bounce) gated behind
`@media (prefers-reduced-motion: no-preference)`.

## Assets (in `protocol-stack/assets/agent-led/`, copied to `site/public/assets/agent-led/`)
`avatar-jaimie.png`, `bulb.json` (Lottie thinking bulb; introEnd 90, loop 100-160.1; recolor gray),
`muscle-arm.json` (celebration; revealEnd 60, loop 60-250; recolor white). `window.lottie` (lottie-web,
a DS dep) loads them; SVG/PNG fallbacks inline. Custom `.cursor` (arrow<->hand, tilt, click-ring).
Faux composer input bar at chat bottom ("Ask me anything…" + send).

## Sync model for the rebuild
The RIGHT panel is the DS `<Conversation>` driven imperatively (apiRef). Its `think`/`ask` return
Promises — the orchestrator (`components/web/AgentAnimation.tsx`) sequences the LEFT panel + the beat
timings off those Promises. Port the left panel's exact visuals/CSS/JS; keep syncing it beat-for-beat
to the conversation (as the first cut already does at a coarse level).
