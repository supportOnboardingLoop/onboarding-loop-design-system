/* ============================================================
   flowstack-engine — the LEFT panel of the agent-led scene ("the agent does the
   work"): a rolling two-step window of step cards, connectors, card-outline draws
   and per-step body states, PORTED VERBATIM from the vanilla driver in
   protocol-stack/index.html (the left-panel operations of its BEATS + every
   helper they call, lines ~2512-3368). Only the wiring changed: the global
   `$('id')` lookups became `q()` scoped to the animation root, and the
   right-panel bits (the chat message list, the custom cursor, the Lottie motifs)
   were removed — the right panel is now the real DS <Conversation>, driven in
   lockstep by the orchestrator (AgentAnimation.tsx), which calls these helpers in
   the SAME order the original beats did. Constants, easings and geometry math are
   unchanged.

   This is an imperative controller over a DOM subtree (the DS "engine wrapped by
   React" pattern): AgentAnimation renders the markup (Flowstack.tsx) and hands the
   `.ala-scope` element here; the returned api exposes the helpers + the run/pause
   plumbing the orchestrator sequences against.
   ============================================================ */

/* ================= DEV RIG CONFIG (verbatim) =================
   Every duration (ms) and easing. Speed/slowmo kept for parity even though the
   marketing embed always runs at speed 1. */
export const CONFIG = {
  speed: 1,
  slowmo: 0.25,
  transitions: {
    state: 400, swap: 300, msg: 420, fadelist: 450, choice: 250,
    headswap: 380, cursor: 700, click: 450, stage: 520, grow: 420, el: 320, morph: 380,
  },
  easings: {
    standard: "cubic-bezier(.4,0,.2,1)",
    bounce: "cubic-bezier(.34,1.56,.64,1)",
    cursor: "cubic-bezier(.5,0,.3,1)",
    progress: "easeInOutQuad",
  },
  beats: {
    question: { preDelay: 500, appear: 420, trigDelay: 300, think: 1500, morph: 400, choiceStagger: 90, settle: 400 },
    answer: {
      read: 1300, hover: 700, click: 450, done: 350, conn: 520, line: 500, chipAt: 260,
      stepBuild: 520, elStagger: 60, trigDelay: 250, procAppear: 320, processDwell: 1650,
      ringBlue: 460, ringGreen: 500,
    },
    build: { swapSettle: 350, progress: 2300, doneHold: 350 },
    handoff: {
      preDelay: 450, conn: 520, line: 500, chipAt: 260, stepBuild: 520, elStagger: 60,
      trigDelay: 250, msgAppear: 420, ctaStagger: 90, headDelay: 250, ringBlue: 460,
    },
    hold: { hold: 3800, outStagger: 70, msgOut: 220, collapse: 300, collapseStagger: 90, settle: 350 },
  },
}

const EASE_FNS: Record<string, (p: number) => number> = {
  easeInOutQuad: (p) => (p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2),
  linear: (p) => p,
}

export const ABORT = Symbol("abort")

export type FlowstackApi = ReturnType<typeof createFlowstack>

export function createFlowstack(scope: HTMLElement) {
  const $ = (id: string) => scope.querySelector<HTMLElement>("#" + CSS.escape(id))!
  const Q = (sel: string) => scope.querySelector<HTMLElement>(sel)
  const QA = (sel: string) => scope.querySelectorAll<HTMLElement>(sel)

  let runGen = 0
  let paused = false

  /* ---- time scaling (verbatim) ---- */
  const tscale = () => (1 / CONFIG.speed) * 1 // slowmo disabled in the embed
  const ms = (base: number) => base * tscale()
  function applyConfig() {
    const r = scope.style,
      k = tscale()
    for (const [key, val] of Object.entries(CONFIG.transitions)) r.setProperty("--d-" + key, val * k + "ms")
    r.setProperty("--e-standard", CONFIG.easings.standard)
    r.setProperty("--e-bounce", CONFIG.easings.bounce)
    r.setProperty("--e-cursor", CONFIG.easings.cursor)
  }

  /* ---- pause/abort-aware primitives (verbatim) ---- */
  const raf = () => new Promise<void>((r) => requestAnimationFrame(() => r()))
  const chk = (g: number) => {
    if (g !== runGen) throw ABORT
  }
  async function sleep(base: number, g: number) {
    let remaining = ms(base),
      last = performance.now()
    while (remaining > 0) {
      await raf()
      chk(g)
      const now = performance.now()
      if (!paused) remaining -= now - last
      last = now
    }
  }

  /* ---- measured geometry (taken once at init) ---- */
  const M = {
    blocks: {} as Record<string, number>,
    stackAt: {} as Record<string, number>,
    flowH: 0,
    s1optsBlk: 0,
  }
  function measure() {
    const ids = ["blk-s1", "blk-c1", "blk-s2", "blk-c2", "blk-s3"]
    scope.classList.add("ala-notrans")
    ids.forEach((id) => $(id).classList.add("open"))
    QA(".bel").forEach((el) => el.classList.add("in"))
    setBody("s2build") // measure step 2 at its TALLEST body (the build view it holds in the s3 stack)
    setS1Body("compose") // measure step 1 at its COMPACT (compose) height — it expands when options appear
    void scope.offsetHeight
    ids.forEach((id) => {
      M.blocks[id] = $(id).scrollHeight
    })
    M.flowH = Q(".flowlane")!.clientHeight
    const s1grow = $("s1opts").offsetHeight - $("s1compose").offsetHeight // extra height once the options reveal
    M.s1optsBlk = M.blocks["blk-s1"] + s1grow
    M.stackAt.s1 = M.blocks["blk-s1"] // compose (compact)
    M.stackAt.s1opts = M.s1optsBlk // expanded with options
    M.stackAt.s2 = M.s1optsBlk + M.blocks["blk-c1"] + M.blocks["blk-s2"] // step 1 expanded by the time step 2 appears
    M.stackAt.s3 = M.stackAt.s2 + M.blocks["blk-c2"] + M.blocks["blk-s3"]
    M.stackAt.s23 = M.blocks["blk-s2"] + M.blocks["blk-c2"] + M.blocks["blk-s3"] // 2-step window: step 1 removed
    /* back to zero state */
    QA(".bel").forEach((el) => el.classList.remove("in"))
    ids.forEach((id) => {
      const b = $(id)
      b.classList.remove("open")
      b.style.height = "0px"
    })
    setBody("s2wait")
    setS1Body("none")
    scope.classList.remove("ala-notrans")
  }

  /* ---- staged layout helpers (verbatim) ---- */
  function recenter(stackH: number) {
    $("flowstack").style.transform = "translateY(" + Math.max(0, (M.flowH - stackH) / 2) + "px)"
  }
  function openBlock(id: string) {
    const b = $(id)
    b.style.height = M.blocks[id] + "px"
    const done = () => {
      b.classList.add("open")
      b.style.height = ""
    }
    setTimeout(done, ms(CONFIG.transitions.stage) + 30)
  }
  function closeBlock(id: string) {
    const b = $(id)
    b.style.height = b.scrollHeight + "px"
    void b.offsetHeight
    b.classList.remove("open")
    b.style.height = "0px"
  }
  /* WAAPI collapse: interpolates height explicitly so it can't hit the CSS
     "auto->0" snap that wedges conn blocks (overflow:visible). */
  function collapseAnim(id: string, dur: number) {
    const b = $(id),
      h = b.getBoundingClientRect().height
    b.classList.remove("open")
    const a = b.animate([{ height: h + "px" }, { height: "0px" }], {
      duration: ms(dur),
      easing: CONFIG.easings.standard,
      fill: "forwards",
    })
    a.finished
      .then(() => {
        b.style.height = "0px"
        a.cancel()
      })
      .catch(() => {})
  }
  async function buildEls(scopeEl: HTMLElement, stagger: number, g: number) {
    const els = scopeEl.querySelectorAll<HTMLElement>(".bel:not(.in)")
    for (const el of els) {
      el.classList.add("in")
      await sleep(stagger, g)
    }
  }
  function snapEls(scopeEl: HTMLElement) {
    scopeEl.querySelectorAll<HTMLElement>(".bel").forEach((el) => el.classList.add("in"))
  }

  /* ---- shared draw helpers (verbatim) ---- */
  function draw(line: SVGPathElement, arrow: SVGPathElement, base: number) {
    line.getAnimations().forEach((x) => x.cancel())
    const a = line.animate([{ strokeDashoffset: 100 }, { strokeDashoffset: 0 }], {
      duration: ms(base),
      easing: CONFIG.easings.standard,
      fill: "forwards",
    })
    return a.finished
      .then(() => {
        line.style.strokeDashoffset = "0"
        a.cancel()
        arrow.style.opacity = "1"
      })
      .catch(() => {})
  }
  function retract(line: SVGPathElement, arrow: SVGPathElement, base: number) {
    line.getAnimations().forEach((x) => x.cancel())
    /* undraw top->bottom (same direction it drew): a NEGATIVE dashoffset hides the
       stroke from the top down, leaving the bottom + arrowhead until the very end. */
    const a = line.animate([{ strokeDashoffset: 0 }, { strokeDashoffset: -100 }], {
      duration: ms(base),
      easing: CONFIG.easings.standard,
      fill: "forwards",
    })
    return a.finished
      .then(() => {
        line.style.strokeDashoffset = "-100"
        a.cancel()
        arrow.style.opacity = "0"
      })
      .catch(() => {})
  }
  function wiggle(ids: string[]) {
    ids.forEach((id) => {
      const s = $(id)
      s.classList.remove("wiggle")
      void s.offsetWidth
      s.classList.add("wiggle")
      setTimeout(() => s.classList.remove("wiggle"), ms(CONFIG.transitions.stage) + 80)
    })
  }

  /* ---- card outline draw (all steps) ----
     each .step owns an SVG outline above the tab, "drawn" with stroke-dashoffset +
     a bright leading dot. blue on trigger, green on complete. corners are squircles,
     so the path samples a superellipse (RING_N). steps 1&2 leave a node gap at the
     bottom; step 3 closes. step 2's green ring rides the SAME clock as the bars. */
  const RING_N = 4
  type Ring = { svg: SVGSVGElement; b: SVGPathElement; gp: SVGPathElement; head: SVGCircleElement; len: number }
  const RINGS: Record<string, Ring> = {}
  const RING_SW = 3,
    RING_INSET = RING_SW / 2
  function ringPathD(w: number, h: number, r: number, n: number, gap: number) {
    const ins = RING_INSET,
      cx = w / 2,
      seg = 10,
      p: [number, number][] = []
    const L = ins,
      T = ins,
      R = w - ins,
      B = h - ins,
      rad = r - ins
    const corner = (ccx: number, ccy: number, sdx: number, sdy: number, edx: number, edy: number) => {
      for (let i = 0; i <= seg; i++) {
        const th = (i / seg) * (Math.PI / 2),
          a = Math.pow(Math.cos(th), 2 / n),
          b = Math.pow(Math.sin(th), 2 / n)
        p.push([ccx + rad * a * sdx + rad * b * edx, ccy + rad * a * sdy + rad * b * edy])
      }
    }
    p.push([cx - gap, B])
    p.push([L + rad, B])
    corner(L + rad, B - rad, 0, 1, -1, 0)
    p.push([L, T])
    p.push([R - rad, T])
    corner(R - rad, T + rad, 0, -1, 1, 0)
    p.push([R, B - rad])
    corner(R - rad, B - rad, 1, 0, 0, 1)
    p.push([cx + gap, B])
    return "M " + p.map((pt) => pt[0].toFixed(2) + " " + pt[1].toFixed(2)).join(" L ")
  }
  function buildRing(stepId: string, gap: number): Ring | null {
    const card = Q("#" + stepId + " .ala-card") as HTMLElement | null
    const svg = ($(stepId + "line") as unknown) as SVGSVGElement | null
    if (!card || !svg) return null
    const w = card.offsetWidth,
      h = card.offsetHeight,
      top = card.offsetTop,
      left = card.offsetLeft
    svg.setAttribute("viewBox", "0 0 " + w + " " + h)
    svg.style.width = w + "px"
    svg.style.height = h + "px"
    svg.style.left = left + "px"
    svg.style.top = top + "px"
    const d = ringPathD(w, h, 24, RING_N, gap)
    const b = svg.querySelector<SVGPathElement>(".cl-b")!
    const gp = svg.querySelector<SVGPathElement>(".cl-g")!
    const head = svg.querySelector<SVGCircleElement>(".cl-head")!
    ;[b, gp].forEach((pt) => {
      pt.setAttribute("pathLength", "100")
      pt.setAttribute("d", d)
      pt.style.strokeDashoffset = "100"
    })
    head.classList.remove("on", "b", "g")
    const rec: Ring = { svg, b, gp, head, len: b.getTotalLength() }
    RINGS[stepId] = rec
    return rec
  }
  async function animateRing(stepId: string, color: "b" | "g", dur: number, g: number) {
    const rec = RINGS[stepId]
    if (!rec) return
    const path = color === "g" ? rec.gp : rec.b,
      head = rec.head,
      len = rec.len
    rec.svg.classList.add("show")
    head.classList.remove("b", "g")
    head.classList.add(color, "on")
    try {
      await new Promise<void>((res, rej) => {
        const total = ms(dur)
        let el = 0,
          last = performance.now()
        ;(function frame(now: number) {
          if (g !== runGen) return rej(ABORT)
          if (!paused) el += now - last
          last = now
          const t = Math.min(1, el / total)
          path.style.strokeDashoffset = String(100 * (1 - t))
          const pt = path.getPointAtLength(t * len)
          head.setAttribute("cx", pt.x.toFixed(1))
          head.setAttribute("cy", pt.y.toFixed(1))
          t < 1 ? requestAnimationFrame(frame) : res()
        })(performance.now())
      })
    } catch (e) {
      if (e !== ABORT) throw e
      return
    }
    head.classList.remove("on") // drop the draw head; the drawn stroke stays until the ring fades
  }
  function resetRings() {
    ;["s1", "s2", "s3"].forEach((id) => {
      const rec = RINGS[id]
      if (!rec) return
      rec.svg.classList.remove("show")
      rec.b.style.strokeDashoffset = "100"
      rec.gp.style.strokeDashoffset = "100"
      rec.head.classList.remove("on", "b", "g")
    })
  }
  /* step 2's left bar + green ring, driven off the DS build widget's clock. */
  function setBars(pct: number) {
    $("s2bar").style.width = pct + "%"
    $("s2pct").textContent = pct + "% complete"
    const rec = RINGS.s2
    if (rec && rec.gp.getAttribute("d")) {
      rec.gp.style.strokeDashoffset = String(100 - pct)
      const pt = rec.gp.getPointAtLength((pct / 100) * rec.len)
      rec.head.setAttribute("cx", pt.x.toFixed(1))
      rec.head.setAttribute("cy", pt.y.toFixed(1))
    }
  }

  /* ---- per-step body state (verbatim) ---- */
  function setS1Body(s: "compose" | "opts" | "none") {
    const compose = $("s1compose"),
      opts = $("s1opts")
    compose.classList.toggle("hide", s !== "compose")
    opts.classList.toggle("hide", s !== "opts")
    $("s1qbody").style.height =
      (s === "compose" ? compose.offsetHeight : s === "opts" ? opts.offsetHeight : 0) + "px"
  }
  function resetS1Opts() {
    ;["qoptA", "qoptB", "qoptC"].forEach((id) => $(id).classList.remove("picked", "in"))
  }
  function setS3Await(on: boolean) {
    $("s3await").classList.toggle("hide", !on)
  }
  function setBody(state: "s2wait" | "s2proc" | "s2build") {
    ;["s2wait", "s2proc", "s2build"].forEach((s) => $(s).classList.toggle("hide", s !== state))
  }
  function snapLine(n: number, drawn: boolean) {
    let l = ($("line" + n) as unknown) as SVGPathElement
    const a = ($("arrow" + n) as unknown) as SVGPathElement
    l.getAnimations().forEach((x) => x.cancel())
    const fresh = l.cloneNode(true) as SVGPathElement
    l.replaceWith(fresh)
    l = fresh
    l.style.strokeDashoffset = drawn ? "0" : "100"
    a.style.opacity = drawn ? "1" : "0"
  }

  /* ---- reset (LEFT parts of the original hardResetAll) ---- */
  function hardResetAll() {
    ;["s1", "s2", "s3"].forEach((id) => $(id).classList.remove("on", "trig", "working", "building"))
    ;["chip1", "chip2"].forEach((id) => $(id).classList.remove("show"))
    snapLine(1, false)
    snapLine(2, false)
    resetRings()
    setS1Body("none")
    resetS1Opts()
    setS3Await(false)
    ;["blk-c1", "blk-s2", "blk-c2", "blk-s3"].forEach((id) => {
      const b = $(id)
      b.classList.remove("open")
      b.style.height = "0px"
    })
    QA("#s1 .bel, #s2 .bel, #s3 .bel").forEach((el) => el.classList.remove("in"))
    setBars(0)
    $("s2label").textContent = "Building project"
    setBody("s2wait")
    /* step 1 collapsed — the question beat builds it fresh each loop (2-step window) */
    $("blk-s1").classList.remove("open")
    $("blk-s1").style.height = "0px"
    recenter(M.stackAt.s1)
  }
  function noTrans(fn: () => void) {
    scope.classList.add("ala-notrans")
    fn()
    void scope.offsetHeight
    scope.classList.remove("ala-notrans")
  }

  /* ---- run/pause plumbing ---- */
  function newRun() {
    return ++runGen
  }
  function stop() {
    runGen++ // invalidate any in-flight loops
    scope.getAnimations({ subtree: true }).forEach((a) => a.cancel())
  }
  function pause() {
    paused = true
    scope.getAnimations({ subtree: true }).forEach((a) => {
      if (a.playState === "running") a.pause()
    })
  }
  function resume() {
    paused = false
    scope.getAnimations({ subtree: true }).forEach((a) => {
      if (a.playState === "paused") a.play()
    })
  }
  function setRewind(on: boolean) {
    scope.classList.toggle("rewind", on)
  }

  return {
    // constants + geometry
    CONFIG, EASE_FNS, ABORT, M, RINGS, ms,
    // run plumbing
    newRun, stop, pause, resume, sleep, chk, applyConfig, measure, noTrans, setRewind,
    // element getters (for the orchestrator's verbatim beat code)
    $, Q, QA,
    // helpers
    recenter, openBlock, closeBlock, collapseAnim, buildEls, snapEls,
    draw, retract, wiggle, buildRing, animateRing, resetRings, setBars,
    setS1Body, resetS1Opts, setS3Await, setBody, snapLine, hardResetAll,
    // svg path refs for draw/retract
    line: (n: number) => ($("line" + n) as unknown) as SVGPathElement,
    arrow: (n: number) => ($("arrow" + n) as unknown) as SVGPathElement,
  }
}
