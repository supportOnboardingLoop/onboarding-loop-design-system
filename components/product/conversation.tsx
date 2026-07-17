import * as React from "react"
import { createPortal } from "react-dom"
import lottie from "lottie-web"

import { cn } from "@/lib/utils"
import { createConvo, type ConvoApi } from "./convo-engine"
import type { Attachment } from "./attach-chip"
import bulbData from "./bulb.json"

// The default thinking indicator: the design-system bulb Lottie. bulb.json wraps the
// raw animation in `.data` with intro/loop frame markers — it plays the intro (reveals),
// then loops while the agent thinks, before the reply morphs in. Mounted into the
// engine's bulb slot; destroyed when the reply arrives.
const BULB = bulbData as unknown as {
  data: object
  introStart: number
  introEnd: number
  loopStart: number
  loopEnd: number
}
function mountBulb(container: HTMLElement) {
  const anim = lottie.loadAnimation({
    container,
    renderer: "svg",
    loop: false,
    autoplay: false,
    animationData: BULB.data,
  })
  const onDom = () => anim.playSegments([BULB.introStart, BULB.introEnd], true)
  const onComplete = () => {
    if (!anim.loop) {
      anim.loop = true
      anim.playSegments([BULB.loopStart, BULB.loopEnd], true)
    }
  }
  anim.addEventListener("DOMLoaded", onDom)
  anim.addEventListener("complete", onComplete)
  return () => anim.destroy()
}

// The live conversation. Wraps the imperative build-out engine (convo-engine.ts,
// ported from BPConvo) in a React surface. It runs in TWO modes:
//   • declarative — pass a `script`; it auto-plays user turns, agent thinking ->
//     reply, and answer widgets (real React components portaled into the node the
//     engine builds, whose pick echoes back as a user chip). This is the styleguide
//     demo path.
//   • host-driven — pass an `apiRef` and no `script`; it starts empty and the host
//     drives live turns via the imperative handle (user / think / ask) and persists
//     history via snapshot / restore. This is how the starter's col-4 chat panel
//     drives a live, resumable conversation.
// Reduced motion collapses every build to an instant swap (handled in the engine).

export type ConvoStep =
  | { role: "user"; text: string }
  | { role: "agent"; say: string | string[] }
  | { role: "agent"; think: string | string[]; loops?: number }
  | {
      role: "agent"
      think: string | string[]
      loops?: number
      /** render a React answer widget; call done(echo) to advance + echo the pick */
      widget: (done: (echo: string) => void) => React.ReactNode
    }

// the imperative handle exposed via `apiRef` (host-driven mode)
export type ConversationHandle = {
  clear(): void
  user(text: string, attachments?: Attachment[]): void
  say(paras: string | string[]): void
  think(paras: string | string[], opts?: { loops?: number }): Promise<void>
  /** mount a React answer widget under the last agent bubble; resolves with the
   *  pick, echoing it back as a user chip unless `echo:false` */
  ask(
    render: (done: (echo: string) => void) => React.ReactNode,
    opts?: { echo?: boolean }
  ): Promise<string>
  /** freeze the current thread to static HTML (animations neutralized) */
  snapshot(): string
  /** replace the thread with a frozen snapshot (no rebuild — a restored chat just appears) */
  restore(html: string): void
  scrollToBottom(): void
}

type WidgetMount = { id: number; node: HTMLElement; el: React.ReactNode }

type ConversationProps = {
  avatar: string
  name?: string
  role?: string
  userName?: string
  /** declarative mode: a scripted conversation that auto-plays on mount */
  script?: ConvoStep[]
  thinking?: "bulb" | "dots"
  /** host-driven mode: receive the imperative handle */
  apiRef?: React.Ref<ConversationHandle>
  /** show a Replay control below the thread (declarative mode) */
  controls?: boolean
  className?: string
  /** padding etc. for the inner .bp-chat scroller */
  chatClassName?: string
}

// Neutralize the build animations on a rendered thread so a re-inserted snapshot
// doesn't replay them, and collapse each bubble's per-line reveal spans back to
// flowing text so a restored chat re-wraps when its column resizes. Mirrors the
// vanilla starter's freeze() + the engine's reflowBubble().
function freeze(html: string) {
  const tmp = document.createElement("div")
  tmp.innerHTML = html
  tmp.querySelectorAll(".bp-bubble p").forEach((p) => {
    const lines = p.querySelectorAll(".bp-line__in")
    if (lines.length) p.textContent = Array.from(lines, (s) => s.textContent).join(" ")
  })
  tmp.querySelectorAll<HTMLElement>("*").forEach((el) => {
    el.classList.remove("bp-anim-in", "bp-anim-rise", "bp-anim-line")
    el.style.animation = "none"
    el.style.animationDelay = ""
    if (
      el.classList.contains("bp-line__in") ||
      el.classList.contains("bp-elapsed__line") ||
      el.classList.contains("bp-elapsed__txt")
    ) {
      el.style.opacity = "1"
      el.style.transform = "none"
    }
    if (el.classList.contains("bp-line")) el.style.overflow = "visible"
  })
  return tmp.innerHTML
}

function Conversation({
  avatar,
  name,
  role,
  userName,
  script,
  thinking = "bulb",
  apiRef,
  controls = false,
  className,
  chatClassName = "px-5 py-4",
}: ConversationProps) {
  const chatRef = React.useRef<HTMLDivElement>(null)
  const engineRef = React.useRef<ConvoApi | null>(null)
  const [widgets, setWidgets] = React.useState<WidgetMount[]>([])
  const [runId, setRunId] = React.useState(0)
  const widgetSeq = React.useRef(0)

  // append a host-rendered widget node and portal the React widget into it;
  // resolves with the echo string once the widget calls done()
  const askWidget = React.useCallback(
    (render: (done: (echo: string) => void) => React.ReactNode, engine?: ConvoApi) =>
      new Promise<string>((resolve) => {
        const e = engine || engineRef.current
        if (!e) return resolve("")
        const node = document.createElement("div")
        node.className = "bp-answer"
        e.mountUnderLast(node)
        const id = ++widgetSeq.current
        const done = (echo: string) => {
          node.classList.add("is-done")
          resolve(echo)
        }
        setWidgets((w) => [...w, { id, node, el: render(done) }])
      }),
    []
  )

  React.useEffect(() => {
    const el = chatRef.current
    if (!el) return
    const run = { cancelled: false, timers: new Set<number>() }
    const engine: ConvoApi = createConvo(el, {
      avatar,
      name,
      role,
      userName,
      thinking,
      mountBulb: thinking === "dots" ? undefined : mountBulb,
    })
    engineRef.current = engine
    engine.clear()
    setWidgets([])

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => {
        const t = window.setTimeout(() => {
          run.timers.delete(t)
          resolve()
        }, ms)
        run.timers.add(t)
      })

    const play = async (steps: ConvoStep[]) => {
      for (const step of steps) {
        if (run.cancelled) return
        if (step.role === "user") {
          engine.user(step.text)
          await sleep(560)
        } else if ("say" in step) {
          engine.say(step.say)
          await sleep(760)
        } else if ("widget" in step) {
          await engine.thinkSay(step.think, { loops: step.loops })
          if (run.cancelled) return
          const echo = await askWidget(step.widget, engine)
          if (run.cancelled) return
          engine.user(echo)
          await sleep(560)
        } else {
          await engine.thinkSay(step.think, { loops: step.loops })
          await sleep(560)
        }
      }
    }
    if (script) play(script)

    return () => {
      run.cancelled = true
      run.timers.forEach((t) => clearTimeout(t))
      engine.destroy()
      engineRef.current = null
    }
  }, [avatar, name, role, userName, script, thinking, runId, askWidget])

  React.useImperativeHandle(
    apiRef,
    (): ConversationHandle => ({
      clear() {
        engineRef.current?.clear()
        setWidgets([])
      },
      user(text, attachments) {
        engineRef.current?.user(text, attachments)
      },
      say(paras) {
        engineRef.current?.say(paras)
      },
      think(paras, opts) {
        return engineRef.current?.thinkSay(paras, opts).then(() => {}) ?? Promise.resolve()
      },
      async ask(render, opts) {
        const echo = await askWidget(render)
        if (opts?.echo !== false) engineRef.current?.user(echo)
        return echo
      },
      snapshot() {
        return chatRef.current ? freeze(chatRef.current.innerHTML) : ""
      },
      restore(html) {
        setWidgets([])
        engineRef.current?.clear()
        const el = chatRef.current
        if (el) {
          el.innerHTML = html
          el.scrollTop = el.scrollHeight
        }
      },
      scrollToBottom() {
        engineRef.current?.scrollDown(400)
      },
    }),
    [askWidget]
  )

  return (
    <div className={cn("flex min-h-0 flex-col", className)}>
      <div ref={chatRef} className={cn("bp-chat scroll-thin min-h-0 flex-1 overflow-y-auto", chatClassName)} />
      {widgets.map((w) => createPortal(w.el, w.node, String(w.id)))}
      {controls && (
        <div className="mt-3 flex justify-center">
          <button
            type="button"
            onClick={() => setRunId((n) => n + 1)}
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border-strong bg-card px-3.5 text-sm font-semibold text-foreground transition-colors [corner-shape:squircle] hover:bg-fill"
          >
            Replay
          </button>
        </div>
      )}
    </div>
  )
}

export { Conversation }
export type { ConversationProps }
