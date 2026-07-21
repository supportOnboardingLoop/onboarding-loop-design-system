/* ============================================================
   AgentAnimation — "This is what agent-led looks like." The 2nd subsection of the
   dark system band: a two-panel scene. The LEFT panel (Flowstack) is a VERBATIM
   port of the vanilla flowstack — step cards, connectors, card-outline draws,
   per-step body states — driven by flowstack-engine.ts. The RIGHT panel
   (AgentChat) is the REAL design-system <Conversation> (Jaimie) inside a ported
   header + composer, driven through the same think->reply morph, Choices, and
   self-building widget the product agent uses.

   This orchestrator sequences BOTH panels beat-for-beat. It reproduces the
   vanilla driver's five beats (question -> answer -> build -> handoff -> hold),
   keeping every LEFT operation verbatim (openBlock/buildEls/rings/connectors/…)
   and swapping the driver's right-panel DOM writes for the DS Conversation api
   (think/ask/say) and the header morph. One clock drives the build: the DS build
   widget reports progress into the left step-2 bar + green ring.

   The scene is authored at 1280 wide and scaled to fit (applyScale = the vanilla
   scale-to-fit, verbatim). It plays once when scrolled into view, then loops;
   pauses out of view; reduced motion renders the finished state and does not loop.
   ============================================================ */
import * as React from "react"
import { useEffect, useRef } from "react"

import type { ConversationHandle } from "@/components/product/conversation"
import { Flowstack } from "@/components/web/Flowstack"
import { AgentChat, type AgentChatHandle } from "@/components/web/AgentChat"
import { createFlowstack, CONFIG } from "@/components/web/flowstack-engine"
import { AutoChoices, WorkspaceBuild, HandoffCtas, WORK_OPTS } from "@/components/web/agent-widgets"

const AGENT = { avatar: "/assets/agent-led/avatar-jaimie.png", name: "Jaimie", role: "AI Assistant" }

export function AgentAnimation() {
  const frameRef = useRef<HTMLDivElement>(null)
  const scopeRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const chatApi = useRef<ConversationHandle | null>(null)
  const headerRef = useRef<AgentChatHandle | null>(null)

  useEffect(() => {
    const frame = frameRef.current
    const scope = scopeRef.current
    const stage = stageRef.current
    if (!frame || !scope || !stage) return

    const eng = createFlowstack(scope)
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let cancelled = false
    let inView = false
    let started = false

    /* ---- scale-to-fit (verbatim from the vanilla applyScale) ---- */
    let lastFrameW = -1
    const applyScale = () => {
      const availW = frame.clientWidth
      if (availW === lastFrameW) return // guard ResizeObserver re-entrancy (we set height, not width)
      lastFrameW = availW
      const natW = stage.offsetWidth,
        natH = stage.offsetHeight // layout size, unaffected by transform
      const s = Math.min(1, availW / natW),
        tx = (availW - natW * s) / 2
      scope.style.transform = "translateX(" + tx + "px) scale(" + s + ")"
      frame.style.height = natH * s + "px"
    }

    const chk = eng.chk
    const sleep = eng.sleep

    /* the answer/build/handoff widgets the DS Conversation mounts */
    const choicesWidget = (fast: boolean) => (done: (echo: string) => void) => (
      <AutoChoices options={WORK_OPTS} autoPick="a" fast={fast} onDone={done} onHover={() => {}} />
    )
    const buildWidget = (fast: boolean) => (done: (echo: string) => void) => (
      <WorkspaceBuild fast={fast} onProgress={(p) => eng.setBars(Math.round(p * 100))} onDone={() => done("")} />
    )

    /* ---- the beats (LEFT ops verbatim; RIGHT ops = DS Conversation api) ---- */
    async function beatQuestion(g: number, fast: boolean) {
      const a = chatApi.current!
      const c = CONFIG.beats.question
      // build step 1 fresh at its compact (compose) height — removed last loop (2-step window)
      eng.setS1Body("compose")
      eng.recenter(eng.M.stackAt.s1)
      eng.openBlock("blk-s1")
      await sleep(CONFIG.transitions.stage * 0.5, g)
      await eng.buildEls(eng.$("s1"), 70, g)
      await sleep(c.preDelay, g)
      // RIGHT: the agent asks the one question (bulb -> reply)
      const tP = a.think("What kind of work is this? I'll build the workspace to match.", { loops: 1 })
      await sleep(c.appear + c.trigDelay, g)
      eng.$("s1").classList.add("trig", "working") // the step fires: blue + breathing while the agent composes
      await tP
      chk(g)
      // LEFT: the card expands with the matching options
      eng.setS1Body("opts")
      eng.recenter(eng.M.stackAt.s1opts)
      const opts = ["qoptA", "qoptB", "qoptC"]
      for (let i = 0; i < 3; i++) {
        eng.$(opts[i]).classList.add("in")
        await sleep(c.choiceStagger, g)
      }
      await sleep(200, g) // let the card finish expanding before tracing it
      eng.buildRing("s1", 8)
      const A = CONFIG.beats.answer,
        clickWin = c.settle + A.read + CONFIG.transitions.cursor + A.hover
      eng.animateRing("s1", "b", clickWin - 200, g).catch(() => {}) // slow ongoing draw
      // RIGHT: the choices build in and auto-pick after a dwell; echoes the pick
      await a.ask(choicesWidget(fast))
      chk(g)
    }

    async function beatAnswer(g: number) {
      const a = chatApi.current!
      const c = CONFIG.beats.answer
      // LEFT: the "Client work" option checks green — mirrors the pick on the right
      eng.$("qoptA").classList.add("picked")
      await sleep(c.done, g)
      // step 1 completes: the green outline draws over the blue before the arrow fires
      eng.$("s1").classList.remove("trig", "working")
      await eng.animateRing("s1", "g", c.ringGreen, g)
      eng.$("s1").classList.add("on")
      eng.wiggle(["s1"])
      if (eng.RINGS.s1) eng.RINGS.s1.svg.classList.remove("show")
      eng.recenter(eng.M.stackAt.s2)
      eng.openBlock("blk-c1")
      await sleep(c.conn * 0.4, g)
      const d1 = eng.draw(eng.line(1), eng.arrow(1), c.line)
      await sleep(c.chipAt, g)
      eng.$("chip1").classList.add("show")
      await d1
      chk(g)
      // step 2 builds out beneath it, fires blue, then processes
      eng.openBlock("blk-s2")
      await sleep(c.stepBuild * 0.5, g)
      await eng.buildEls(eng.$("s2"), c.elStagger, g)
      await sleep(c.trigDelay, g)
      eng.$("s2").classList.add("trig", "working")
      eng.setBody("s2proc") // cogs: the system is processing
      await sleep(c.procAppear, g)
      // RIGHT: NOW the agent starts thinking — cog + bulb visible together
      const tP2 = a.think("On it, building your workspace now.", { loops: 1 })
      await sleep(c.processDwell, g)
      await tP2
      chk(g)
    }

    async function beatBuild(g: number, fast: boolean) {
      const a = chatApi.current!
      const c = CONFIG.beats.build
      eng.$("s2").classList.remove("working") // ambient breathing stops; concrete synced progress begins
      ;["s2wait", "s2proc", "s2build"].forEach((s) => eng.$(s).classList.add("hide"))
      await sleep(200, g)
      eng.$("s2build").classList.remove("hide")
      await sleep(c.swapSettle, g)
      const rec = eng.buildRing("s2", 8) // trace the outline now the card height has settled
      if (rec) {
        rec.svg.classList.add("show")
        rec.head.classList.add("g", "on")
      } // green head leads the draw
      // RIGHT: the DS build widget owns the clock; onProgress drives the left bar + green ring (one clock)
      await a.ask(buildWidget(fast), { echo: false })
      chk(g)
      if (rec) rec.head.classList.remove("on")
      eng.$("s2label").textContent = "Project built"
      await sleep(c.doneHold, g)
      eng.$("s2").classList.remove("trig")
      eng.$("s2").classList.add("on")
      if (rec) rec.svg.classList.remove("show") // ring crossfades into the solid green border
    }

    async function beatHandoff(g: number, fast: boolean) {
      const a = chatApi.current!
      const hdr = headerRef.current
      const c = CONFIG.beats.handoff
      await sleep(c.preDelay, g)
      eng.wiggle(["s2"])
      // two-step window: drop step 1 as step 3 arrives (WAAPI collapse + non-bounce recenter)
      eng.setRewind(true)
      eng.retract(eng.line(1), eng.arrow(1), c.line)
      eng.$("chip1").classList.remove("show")
      eng.collapseAnim("blk-c1", CONFIG.transitions.stage)
      eng.collapseAnim("blk-s1", CONFIG.transitions.stage)
      eng.recenter(eng.M.stackAt.s23)
      eng.openBlock("blk-c2")
      await sleep(CONFIG.transitions.stage + 40, g)
      eng.setRewind(false)
      const d2 = eng.draw(eng.line(2), eng.arrow(2), c.line)
      await sleep(c.chipAt, g)
      eng.$("chip2").classList.add("show")
      await d2
      chk(g)
      eng.openBlock("blk-s3")
      await sleep(c.stepBuild * 0.5, g)
      await eng.buildEls(eng.$("s3"), c.elStagger, g)
      await sleep(c.trigDelay, g)
      eng.$("s3").classList.add("trig", "working")
      eng.buildRing("s3", 0) // closed loop — step 3 is terminal, no node
      eng.animateRing("s3", "b", c.ringBlue, g).catch(() => {})
      eng.setS3Await(true) // "Awaiting response…"
      // RIGHT: the agent delivers the result + CTAs; the header celebrates
      a.say("Your client workspace is ready. Want to add a teammate?")
      await sleep(c.headDelay, g)
      hdr?.celebrate(true)
      await a.ask((done) => <HandoffCtas fast={fast} onDone={done} />, { echo: false })
      chk(g)
    }

    async function holdAndReset(g: number) {
      const a = chatApi.current!
      const hdr = headerRef.current
      const c = CONFIG.beats.hold
      await sleep(c.hold, g) // hold on the finished state
      // reverse build: quick unwind (no bounce)
      eng.setRewind(true)
      hdr?.celebrate(false)
      a.clear() // messages out; the DS thread resets for the next loop
      eng.retract(eng.line(2), eng.arrow(2), c.collapse)
      eng.$("chip2").classList.remove("show")
      await sleep(c.collapseStagger, g)
      ;["s1", "s2", "s3"].forEach((id) => eng.$(id).classList.remove("on", "trig", "working", "building"))
      eng.resetRings()
      eng.setS1Body("none")
      eng.resetS1Opts()
      eng.setS3Await(false)
      eng.closeBlock("blk-s3")
      eng.closeBlock("blk-c2")
      eng.closeBlock("blk-s2") // c1 & s1 already collapsed when step 3 arrived
      eng.recenter(eng.M.stackAt.s1)
      await sleep(CONFIG.transitions.stage + 120, g)
      eng.noTrans(() => eng.hardResetAll())
      eng.setRewind(false)
      await sleep(c.settle, g)
    }

    async function playThrough(g: number, fast: boolean) {
      await beatQuestion(g, fast)
      await beatAnswer(g)
      await beatBuild(g, fast)
      await beatHandoff(g, fast)
    }

    // zero state: step 1 exists but has not built in yet
    const zeroState = () => {
      eng.noTrans(() => {
        eng.hardResetAll()
        eng.QA("#s1 .bel").forEach((el) => el.classList.remove("in"))
        eng.$("blk-s1").classList.remove("open")
        eng.$("blk-s1").style.height = "0px"
      })
    }

    let running = false
    async function loopForever() {
      if (running) return
      running = true
      const g = eng.newRun()
      try {
        while (!cancelled && inView) {
          await playThrough(g, false)
          if (cancelled || !inView) break
          await holdAndReset(g)
        }
      } catch (e) {
        if (e !== eng.ABORT) throw e
      }
      running = false
    }

    // reduced motion: snap the finished handoff state on both panels, no loop
    async function renderStaticFinal() {
      const a = chatApi.current!
      const hdr = headerRef.current
      eng.noTrans(() => {
        eng.hardResetAll()
        // step 2 completed (green, 100%)
        eng.$("blk-s2").classList.add("open")
        eng.$("blk-s2").style.height = ""
        eng.snapEls(eng.$("s2"))
        eng.setBody("s2build")
        eng.setBars(100)
        eng.$("s2label").textContent = "Project built"
        eng.$("s2").classList.add("on")
        // connector 2 drawn + "Built" chip
        eng.$("blk-c2").classList.add("open")
        eng.$("blk-c2").style.height = ""
        eng.snapLine(2, true)
        eng.$("chip2").classList.add("show")
        // step 3 triggered (blue) + awaiting
        eng.$("blk-s3").classList.add("open")
        eng.$("blk-s3").style.height = ""
        eng.snapEls(eng.$("s3"))
        eng.$("s3").classList.add("trig")
        eng.setS3Await(true)
        eng.recenter(eng.M.stackAt.s23)
      })
      // RIGHT: finished thread built with instant `say` turns + fast widgets (no thinking dwell)
      a.clear()
      a.say("What kind of work is this? I'll build the workspace to match.")
      await a.ask(choicesWidget(true))
      a.say("On it, building your workspace now.")
      await a.ask(buildWidget(true), { echo: false })
      a.say("Your client workspace is ready. Want to add a teammate?")
      hdr?.celebrate(true)
      a.ask((done) => <HandoffCtas fast onDone={done} />, { echo: false }).catch(() => {})
    }

    // measure with real font metrics, then scale + run
    let ro: ResizeObserver | null = null
    let io: IntersectionObserver | null = null
    const mq = window.matchMedia("(max-width: 767px)")
    const onMq = () => {
      lastFrameW = -1
      applyScale()
    }

    const start = async () => {
      if (document.fonts && document.fonts.ready) {
        try {
          await document.fonts.ready
        } catch {
          /* measure with fallback metrics */
        }
      }
      if (cancelled || !chatApi.current) return
      eng.applyConfig()
      eng.measure()
      applyScale()
      ro = new ResizeObserver(applyScale)
      ro.observe(frame)
      mq.addEventListener("change", onMq)

      zeroState()

      if (reduce) {
        renderStaticFinal()
        return
      }

      io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            inView = e.isIntersecting
            if (inView) {
              if (!started) {
                started = true
                loopForever()
              } else {
                eng.resume()
                loopForever()
              }
            } else if (started) {
              eng.pause()
            }
          })
        },
        { threshold: 0.15 },
      )
      io.observe(frame)
    }

    start()

    return () => {
      cancelled = true
      eng.stop()
      ro?.disconnect()
      io?.disconnect()
      mq.removeEventListener("change", onMq)
    }
  }, [])

  return (
    <section className="ala-section ala-on-dark" aria-label="What agent-led onboarding looks like">
      <div className="ala-heading">
        <p className="ala-title">This is what agent-led looks like.</p>
        <p className="ala-sub">The product onboards you to the product.</p>
      </div>
      <div className="ala-row">
        <span className="ala-dots" aria-hidden="true" />
        <span className="ala-vline" aria-hidden="true" />
        <span className="xplus ala-plus-t" aria-hidden="true" />
        <div className="ala-frame" ref={frameRef}>
          <div className="ala-scope" ref={scopeRef}>
            <div className="stage" ref={stageRef}>
              <Flowstack />
              <AgentChat avatar={AGENT.avatar} name={AGENT.name} role={AGENT.role} apiRef={chatApi} headerRef={headerRef} />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
