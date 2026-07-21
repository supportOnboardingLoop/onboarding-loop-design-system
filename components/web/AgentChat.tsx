/* ============================================================
   AgentChat — the RIGHT panel ("the user gets the win"): the phone-style agent
   card. The CHROME is ported from protocol-stack/index.html (`.panel` / `.phead`
   / `.inputbar`, lines 2395-2476): a dark identity header that morphs into a
   celebration on handoff, and a faux "Ask me anything…" composer. The card BODY,
   however, is the real design-system <Conversation> (Jaimie) driven by the
   orchestrator through `apiRef` — so the messages, think->reply morph, Choices
   and self-building widget all come straight from the DS and can never drift from
   the product agent.

   The header + composer don't exist in the DS yet. They live here in the web
   layer for now; both are promotion candidates (see STEP5-STATUS.md): the
   composer overlaps ChatPanel's `.ws-chat__foot`, and the identity header +
   celebration morph could become a DS `AgentCardHeader`.
   ============================================================ */
import * as React from "react"
import { useEffect, useImperativeHandle, useRef, useState } from "react"
import lottie from "lottie-web"

import { cn } from "@/lib/utils"
import { Conversation, type ConversationHandle } from "@/components/product/conversation"

export interface AgentChatHandle {
  celebrate(on: boolean): void
  reset(): void
}

interface AgentChatProps {
  avatar: string
  name: string
  role: string
  apiRef: React.Ref<ConversationHandle>
  headerRef?: React.Ref<AgentChatHandle>
}

// The celebration muscle-arm doodle: the original Lottie motif
// (assets/agent-led/muscle-arm.json), recolored white, reveals once then loops.
// Ported verbatim from the vanilla driver (recolorIllustration + mountMuscle).
// A static flexed-arm SVG is the fallback if the Lottie can't be fetched.
const MUSCLE_FALLBACK =
  '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 44V31c0-6 4-10 10-10h11"/><path d="M34 21c6 0 10 4 10 10v13"/><path d="M15 42c6-8 15-9 22-4"/><rect x="9" y="43" width="10" height="10" rx="2.5"/><rect x="39" y="43" width="10" height="10" rx="2.5"/></svg>'
const clone = <T,>(o: T): T => JSON.parse(JSON.stringify(o))
function recolorIllustration(d: unknown, ink: number[], tint: number) {
  ;(function walk(it: any) {
    if (Array.isArray(it)) it.forEach(walk)
    else if (it && typeof it === "object") {
      if ((it.ty === "fl" || it.ty === "st") && it.c && Array.isArray(it.c.k) && typeof it.c.k[0] === "number") {
        const k = it.c.k,
          outline = k[0] > 0.9 && k[1] > 0.9 && k[2] > 0.9
        delete it.c.x
        it.c.a = 0
        it.c.k = [ink[0], ink[1], ink[2], 1]
        if (it.o) {
          delete it.o.x
          it.o.a = 0
          it.o.k = outline ? 100 : tint || 16
        }
      }
      for (const key in it) walk(it[key])
    }
  })(d)
  return d
}

const SendGlyph = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 12l16-8-6 16-3-6-7-2z" />
    <path d="M11 13l9-9" />
  </svg>
)

export function AgentChat({ avatar, name, role, apiRef, headerRef }: AgentChatProps) {
  const [celebrating, setCelebrating] = useState(false)
  const muscleSlot = useRef<HTMLSpanElement>(null)
  const muscleData = useRef<{ data: object; revealEnd: number; total: number } | null>(null)
  const muscleAnim = useRef<ReturnType<typeof lottie.loadAnimation> | null>(null)

  useImperativeHandle(
    headerRef,
    () => ({
      celebrate: (on: boolean) => setCelebrating(on),
      reset: () => setCelebrating(false),
    }),
    [],
  )

  // preload the muscle Lottie once; seed the slot with the static fallback so the
  // celebration always shows something even if the fetch fails
  useEffect(() => {
    const slot = muscleSlot.current
    if (slot && !slot.innerHTML) slot.innerHTML = MUSCLE_FALLBACK
    let alive = true
    fetch("/assets/agent-led/muscle-arm.json")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (alive && j) muscleData.current = j
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  // mount the muscle on celebrate (reveal -> loop), tear it down on revert
  useEffect(() => {
    const slot = muscleSlot.current
    if (!slot) return
    if (celebrating && muscleData.current && !muscleAnim.current) {
      const m = muscleData.current
      slot.innerHTML = ""
      const anim = lottie.loadAnimation({
        container: slot,
        renderer: "svg",
        loop: false,
        autoplay: false,
        animationData: recolorIllustration(clone(m.data), [1, 1, 1], 16),
      })
      anim.addEventListener("DOMLoaded", () => {
        anim.playSegments([0, m.revealEnd], true)
        anim.addEventListener("complete", function once() {
          anim.removeEventListener("complete", once)
          anim.loop = true
          anim.playSegments([m.revealEnd, m.total], true)
        })
      })
      muscleAnim.current = anim
    } else if (!celebrating && muscleAnim.current) {
      muscleAnim.current.destroy()
      muscleAnim.current = null
      slot.innerHTML = MUSCLE_FALLBACK
    }
    return () => {
      if (muscleAnim.current) {
        muscleAnim.current.destroy()
        muscleAnim.current = null
      }
    }
  }, [celebrating])

  return (
    <div className="appcol">
      <p className="ala-panel-label">The user gets the win.</p>
      <div className="chatlane">
        <div className="panel">
          <div className="phead" id="phead">
            <div className="pheadrow">
              <div className="ala-avatar">
                <img src={avatar} alt="" />
              </div>
              <div className="who">
                <b>{name}</b>
                <span>{role}</span>
              </div>
              <div className="pclose" aria-hidden="true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </div>
            </div>
            <div className="pheadswap">
              <div className={cn("phstate", celebrating && "hide")} id="ph1">
                <h2>Hey Olivia, let&apos;s set up your first project.</h2>
              </div>
              <div className={cn("phstate", !celebrating && "hide")} id="ph2">
                <h2>Olivia, you&apos;re crushing it</h2>
                <div className="celebrate-sub">
                  <span className="muscleslot" ref={muscleSlot} aria-hidden="true" />
                  <span>You&apos;ve got your first project set up and you&apos;re ready to add teammates.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pbody">
            <Conversation
              avatar={avatar}
              name={name}
              role={role}
              apiRef={apiRef}
              thinking="bulb"
              className="min-h-0 flex-1"
              chatClassName="px-4 pt-4 pb-3"
            />
            <div className="inputbar">
              <div className="field">Ask me anything…</div>
              <div className="send">
                <SendGlyph />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
