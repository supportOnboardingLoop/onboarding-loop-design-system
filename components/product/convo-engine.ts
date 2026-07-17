/* ============================================================
   Loop Design System — convo-engine.ts
   The live conversation build-out, ported from the kit's BPConvo
   (kit/convo.js). Framework-agnostic on purpose: it owns the .bp-chat
   container and builds message rows imperatively so it keeps exact
   control of the two things React can't express declaratively —
     • the line-by-line copy reveal (Range measurement, then a nowrap
       clip per visual line), and
     • the think -> reply FLIP: the SAME bubble node measured before
       and after, its width/height eased from thinking size to reply
       size so it reads as one motion.
   It stays out of the widget business: thinkSay() resolves once the
   reply is built, and mountUnderLast() takes a node the host portals a
   real React answer widget into. Echoing a pick back as a user chip is
   just user().  Reduced motion collapses every build to an instant swap.
   ============================================================ */

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
const BULB_PATHS =
  '<path d="M3 12h1m8 -9v1m8 8h1m-15.4 -6.4l.7 .7m12.1 -.7l-.7 .7"/>' +
  '<path d="M9 16a5 5 0 1 1 6 0a3.5 3.5 0 0 0 -1 3a2 2 0 0 1 -4 0a3.5 3.5 0 0 0 -1 -3"/>' +
  '<path d="M9.7 17l4.6 0"/>'
const BULB_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' +
  BULB_PATHS +
  "</svg>"

function esc(s: string) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}
function nowStamp() {
  const d = new Date()
  const h = d.getHours()
  const m = d.getMinutes()
  const ap = h < 12 ? "am" : "pm"
  const h12 = h % 12 || 12
  return DAYS[d.getDay()] + " " + h12 + ":" + (m < 10 ? "0" : "") + m + ap
}

export type ConvoOptions = {
  avatar: string
  name?: string
  role?: string
  userName?: string
  /** "bulb" (glyph, the product look) or "dots" (the guaranteed fallback contract) */
  thinking?: "bulb" | "dots"
  /** mount a richer thinking indicator into the bulb slot (e.g. the bulb Lottie) and
   *  return a cleanup. When given (and thinking:"bulb") it replaces the static glyph.
   *  Keeps the engine decoupled from any Lottie dependency — the React layer owns it. */
  mountBulb?: (container: HTMLElement) => (() => void) | void
  /** false lets a host drive scrolling itself (the engine's follow loop is disabled) */
  scroll?: boolean
}

type Row = {
  row: HTMLElement
  bubble: HTMLElement
  content: HTMLElement
  avatar: HTMLElement | null
  who: HTMLElement | null
  time: HTMLElement | null
}

export type ConvoApi = ReturnType<typeof createConvo>

export function createConvo(chatEl: HTMLElement, opts: ConvoOptions) {
  const reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  const AVATAR = opts.avatar
  const NAME = opts.name || "Agent"
  const ROLE = opts.role || ""
  const YOU = opts.userName || "You"
  const THINK: "bulb" | "dots" = opts.thinking || "bulb"
  const manageScroll = opts.scroll !== false
  let lastContent: HTMLElement | null = null

  /* ---- staggered build-out sequencer (avatar -> name -> time -> bubble) ---- */
  const SEQ = { t: 0, last: -1, stagger: 80 }
  function seqSlot() {
    const now = performance.now()
    if (SEQ.last < 0 || now - SEQ.last > 50) SEQ.t = 0
    SEQ.last = now
    return SEQ.t
  }
  function applyIn(el: HTMLElement | null, delay: number, origin?: string) {
    if (!el) return
    el.style.animationDelay = Math.round(delay) + "ms"
    if (origin) el.style.transformOrigin = origin
    el.classList.remove("bp-anim-in")
    void el.offsetWidth
    el.classList.add("bp-anim-in")
  }
  function seqIn(el: HTMLElement | null, origin?: string) {
    if (!el) return
    const d = seqSlot()
    applyIn(el, d, origin)
    SEQ.t = d + SEQ.stagger
  }
  function seqInGroup(els: ArrayLike<Element>, origin?: string) {
    const arr = Array.prototype.slice.call(els).filter(Boolean) as HTMLElement[]
    if (!arr.length) return
    const d = seqSlot()
    arr.forEach((el) => applyIn(el, d, origin))
    SEQ.t = d + SEQ.stagger
  }
  function applyRise(el: HTMLElement | null, delay: number) {
    if (!el) return
    el.style.animationDelay = Math.round(delay) + "ms"
    el.classList.remove("bp-anim-rise")
    void el.offsetWidth
    el.classList.add("bp-anim-rise")
  }
  function seqRise(el: HTMLElement | null) {
    if (!el) return
    const d = seqSlot()
    applyRise(el, d)
    SEQ.t = d + SEQ.stagger
  }
  function seqRiseGroup(els: ArrayLike<Element>) {
    ;(Array.prototype.slice.call(els).filter(Boolean) as HTMLElement[]).forEach(seqRise)
  }

  /* ---- line-by-line copy reveal ---- */
  function splitLines(p: HTMLElement) {
    const node = p.firstChild
    if (!node || node.nodeType !== 3) return [p.textContent || ""]
    const text = node.textContent || ""
    const range = document.createRange()
    const lines: string[] = []
    let start = 0
    let prevTop: number | null = null
    for (let i = 1; i <= text.length; i++) {
      range.setStart(node, i - 1)
      range.setEnd(node, i)
      const top = range.getBoundingClientRect().top
      if (prevTop === null) prevTop = top
      else if (top > prevTop + 1) {
        lines.push(text.slice(start, i - 1))
        start = i - 1
        prevTop = top
      }
    }
    lines.push(text.slice(start))
    return lines.map((s) => s.replace(/^ +/, ""))
  }
  function toLines(bubble: HTMLElement) {
    Array.prototype.forEach.call(bubble.querySelectorAll("p"), (p: HTMLElement) => {
      p.innerHTML = splitLines(p)
        .map((ln) => '<span class="bp-line"><span class="bp-line__in">' + esc(ln) + "</span></span>")
        .join("")
    })
    return bubble.querySelectorAll(".bp-line__in")
  }
  // collapse the per-visual-line spans back into flowing text so the bubble
  // RE-WRAPS when its column resizes (the nowrap split is only for the reveal).
  function reflowBubble(bubble: HTMLElement | null) {
    if (!bubble) return
    Array.prototype.forEach.call(bubble.querySelectorAll("p"), (p: HTMLElement) => {
      const lines = p.querySelectorAll(".bp-line__in")
      if (lines.length)
        p.textContent = Array.prototype.map.call(lines, (s: HTMLElement) => s.textContent).join(" ")
    })
  }
  function seqLines(inners: ArrayLike<Element>) {
    const arr = Array.prototype.slice.call(inners) as HTMLElement[]
    if (!arr.length) return
    const bubble = (arr[0].closest ? arr[0].closest(".bp-bubble") : null) as HTMLElement | null
    if (reduceMotion) {
      reflowBubble(bubble)
      return
    }
    const last = arr[arr.length - 1]
    arr.forEach((inner) => {
      const d = seqSlot()
      inner.style.animationDelay = Math.round(d) + "ms"
      inner.classList.remove("bp-anim-line")
      void inner.offsetWidth
      inner.classList.add("bp-anim-line")
      SEQ.t = d + SEQ.stagger
      inner.addEventListener("animationend", function onEnd() {
        if (inner.parentNode) (inner.parentNode as HTMLElement).style.overflow = "visible"
        inner.removeEventListener("animationend", onEnd)
      })
    })
    last.addEventListener("animationend", function onLast() {
      last.removeEventListener("animationend", onLast)
      reflowBubble(bubble)
    })
  }

  /* ---- cascade a message's atomic parts ---- */
  function enterMsg(r: Partial<Row>, isUser: boolean) {
    const head = isUser ? [r.avatar, r.time, r.who] : [r.avatar, r.who, r.time]
    head.forEach((el) => seqIn(el as HTMLElement))
    const corner = isUser ? "top right" : "top left"
    const bubble = r.bubble as HTMLElement
    const isText = !!bubble.querySelector("p")
    const inners = isText ? toLines(bubble) : null
    seqIn(bubble, corner)
    if (isText && inners) seqLines(inners)
    else seqInGroup(bubble.children, corner)
  }

  /* ---- expand the SAME bubble from thinking size to reply size ---- */
  function morphBubble(b: HTMLElement, r0: DOMRect, r1: DOMRect) {
    if (reduceMotion) return
    const ease = "var(--bp-ease-back, cubic-bezier(.68,-0.6,.32,1.6))"
    b.style.boxSizing = "border-box"
    b.style.overflow = "hidden"
    b.style.width = r0.width + "px"
    b.style.height = r0.height + "px"
    void b.offsetWidth
    b.style.transition = "width .3s " + ease + ", height .3s " + ease
    b.style.width = r1.width + "px"
    b.style.height = r1.height + "px"
    b.addEventListener("transitionend", function te(e) {
      if (e.propertyName !== "height") return
      b.style.transition = ""
      b.style.width = ""
      b.style.height = ""
      b.style.overflow = ""
      b.style.boxSizing = ""
      b.removeEventListener("transitionend", te)
    })
  }

  /* ---- the thinking indicator (bulb Lottie / glyph, dots fallback) + a timed resolve ---- */
  function mountThink(slot: HTMLElement, loops: number, onDone: () => void) {
    let cleanupBulb: (() => void) | void
    if (THINK === "dots") {
      slot.innerHTML = '<span class="bp-dots"><i></i><i></i><i></i></span>'
    } else if (opts.mountBulb) {
      slot.innerHTML = ""
      cleanupBulb = opts.mountBulb(slot)
    } else {
      slot.innerHTML = BULB_SVG
    }
    const t = window.setTimeout(onDone, Math.max(1, loops) * 700 + 500)
    return {
      destroy() {
        clearTimeout(t)
        if (cleanupBulb) cleanupBulb()
      },
    }
  }

  /* ---- keep the newest content in view (stick to bottom) ---- */
  let stick = true
  let followUntil = 0
  let hardUntil = 0
  let followRaf = 0
  function atBottom(px?: number) {
    return chatEl.scrollHeight - chatEl.clientHeight - chatEl.scrollTop <= (px || 24)
  }
  function stepToward(cur: number, tgt: number, k: number, cap: number) {
    const d = (tgt - cur) * k
    return d > cap ? cap : d < -cap ? -cap : d
  }
  function followTick(ts: number) {
    const max = chatEl.scrollHeight - chatEl.clientHeight
    const done = ts >= followUntil
    if (stick && max > 0)
      chatEl.scrollTop =
        reduceMotion || done || ts < hardUntil ? max : chatEl.scrollTop + stepToward(chatEl.scrollTop, max, 0.3, 90)
    if (!done) followRaf = requestAnimationFrame(followTick)
    else followRaf = 0
  }
  function scrollDown(ms?: number) {
    if (!manageScroll) return
    followUntil = performance.now() + (ms || 600)
    if (!followRaf) followRaf = requestAnimationFrame(followTick)
  }
  function pinBottom(ms?: number) {
    if (!manageScroll) return
    hardUntil = performance.now() + (ms || 900)
    if (stick) {
      const m = chatEl.scrollHeight - chatEl.clientHeight
      if (m > 0) chatEl.scrollTop = m
    }
    scrollDown(ms || 900)
  }
  const onWheel = (e: WheelEvent) => {
    if (e.deltaY < 0) stick = false
    else if (atBottom(4)) stick = true
  }
  const onTouchMove = () => {
    if (!atBottom(4)) stick = false
  }
  const onTouchEnd = () => {
    if (atBottom(24)) stick = true
  }
  if (manageScroll) {
    chatEl.addEventListener("wheel", onWheel, { passive: true })
    chatEl.addEventListener("touchmove", onTouchMove, { passive: true })
    chatEl.addEventListener("touchend", onTouchEnd, { passive: true })
  }

  /* ---- rows ---- */
  function headHTML(name: string, role: string) {
    return (
      '<div class="bp-msg__head"><span class="bp-msg__who"><span class="bp-msg__name">' +
      esc(name) +
      "</span>" +
      (role ? '<span class="bp-msg__role">' + esc(role) + "</span>" : "") +
      '</span><span class="bp-msg__time">' +
      nowStamp() +
      "</span></div>"
    )
  }
  function agentRow(): Row {
    const row = document.createElement("div")
    row.className = "bp-msg"
    row.innerHTML =
      '<span class="bp-fig-avatar"><img src="' +
      AVATAR +
      '" alt=""></span><div class="bp-msg__content">' +
      headHTML(NAME, ROLE) +
      '<div class="bp-bubble"></div></div>'
    chatEl.appendChild(row)
    const content = row.querySelector(".bp-msg__content") as HTMLElement
    lastContent = content
    return {
      row,
      bubble: row.querySelector(".bp-bubble") as HTMLElement,
      content,
      avatar: row.querySelector(".bp-fig-avatar"),
      who: row.querySelector(".bp-msg__who"),
      time: row.querySelector(".bp-msg__time"),
    }
  }
  function user(text: string, attachments?: { title: string; accent?: string }[]) {
    stick = true
    const hasText = !!(text && text.trim())
    const atts = attachments || []
    const row = document.createElement("div")
    row.className = "bp-msg bp-msg--user"
    const bubbleHTML = hasText ? '<div class="bp-bubble bp-bubble--user"><p>' + esc(text) + "</p></div>" : ""
    const clip =
      '<span class="bp-attach__clip"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 7l-6.5 6.5a1.5 1.5 0 0 0 3 3l6.5 -6.5a3 3 0 0 0 -6 -6l-6.5 6.5a4.5 4.5 0 0 0 9 9l6.5 -6.5"/></svg></span>'
    const attHTML = atts.length
      ? '<div class="bp-attachrow">' +
        atts
          .map(
            (a) =>
              '<span class="bp-attach">' +
              clip +
              (a.accent ? '<span class="bp-attach__accent">' + esc(a.accent) + "</span>" : "") +
              '<span class="bp-attach__title">' +
              esc(a.title) +
              "</span></span>"
          )
          .join("") +
        "</div>"
      : ""
    row.innerHTML =
      '<span class="bp-msg__avatar bp-msg__avatar--empty">ME</span><div class="bp-msg__content">' +
      headHTML(YOU, "") +
      bubbleHTML +
      attHTML +
      "</div>"
    chatEl.appendChild(row)
    const bubbleEl = row.querySelector(".bp-bubble") as HTMLElement | null
    const attRowEl = row.querySelector(".bp-attachrow") as HTMLElement | null
    // enterMsg needs an element to build in; use the text bubble, else the chip row
    enterMsg(
      {
        bubble: (bubbleEl || attRowEl) as HTMLElement,
        avatar: row.querySelector(".bp-msg__avatar"),
        who: row.querySelector(".bp-msg__who"),
        time: row.querySelector(".bp-msg__time"),
      },
      true
    )
    // if BOTH text + attachments, rise the chip row in just after the bubble
    if (bubbleEl && attRowEl) {
      attRowEl.style.animationDelay = "110ms"
      attRowEl.classList.add("bp-anim-rise")
    }
    scrollDown()
  }
  function say(paras: string | string[]) {
    if (typeof paras === "string") paras = [paras]
    const r = agentRow()
    r.bubble.innerHTML = paras.map((p) => "<p>" + esc(p) + "</p>").join("")
    enterMsg(r, false)
    scrollDown()
    return r
  }

  /* ---- think, then expand the SAME bubble into the reply ----
     The elapsed divider LEADS: it builds in first with a present-tense ticking
     counter ("Thinking for 1s"), the thinking mark builds in below it, and once
     the reply is ready the label flips to past tense ("Thought for Ns") while the
     same bubble morphs into the answer. Resolves once the reply DOM + line reveal
     have started, so a scripted flow can chain the next turn as one wave. */
  function thinkSay(paras: string | string[], o?: { loops?: number }) {
    o = o || {}
    if (typeof paras === "string") paras = [paras]
    const parasArr = paras
    const start = Date.now()

    const div = document.createElement("div")
    div.className = "bp-chat__elapsed bp-elapsed"
    div.innerHTML =
      '<span class="bp-elapsed__line"></span><span class="bp-elapsed__txt">Thinking for 1s</span><span class="bp-elapsed__line"></span>'
    chatEl.appendChild(div)
    const lbl = div.querySelector(".bp-elapsed__txt") as HTMLElement
    if (reduceMotion) div.classList.add("is-build")
    else requestAnimationFrame(() => div.classList.add("is-build"))
    scrollDown()

    const r = agentRow()
    r.bubble.className = "bp-bubble bp-bubble--thinking"
    r.bubble.innerHTML =
      '<span class="bp-thinking__bulb bp-thinking__bulb--pulse" data-bulb></span><span class="bp-thinklbl">Thinking…</span>'
    const revealAgent = () => {
      r.row.style.visibility = ""
      enterMsg(r, false)
      scrollDown()
    }
    if (reduceMotion) revealAgent()
    else {
      r.row.style.visibility = "hidden"
      setTimeout(revealAgent, 240)
    }

    const tick = window.setInterval(() => {
      if (!div.isConnected) {
        clearInterval(tick)
        return
      }
      lbl.textContent = "Thinking for " + Math.max(1, Math.round((Date.now() - start) / 1000)) + "s"
    }, 1000)

    return new Promise<Row>((resolve) => {
      const ctrl = mountThink(r.bubble.querySelector("[data-bulb]") as HTMLElement, o!.loops || 1, () => {
        clearInterval(tick)
        const secs = Math.max(1, Math.round((Date.now() - start) / 1000))
        lbl.textContent = "Thinking for " + secs + "s"
        const finish = () => {
          ctrl.destroy()
          if (!r.bubble.isConnected) {
            resolve(r)
            return
          }
          pinBottom(1100)
          lbl.textContent = "Thought for " + secs + "s"
          const b = r.bubble
          const r0 = b.getBoundingClientRect()
          b.className = "bp-bubble"
          b.innerHTML = parasArr.map((p) => "<p>" + esc(p) + "</p>").join("")
          const inners = toLines(b)
          const r1 = b.getBoundingClientRect()
          morphBubble(b, r0, r1)
          seqLines(inners)
          pinBottom(1100)
          resolve(r)
        }
        if (reduceMotion) finish()
        else setTimeout(finish, 460)
      })
    })
  }

  /* ---- attach an answer widget (a host-portaled React node) under the last bubble ----
     The node rises in as a unit; once answered the host adds `is-done` and echoes
     the pick with user(). */
  function mountUnderLast(node: HTMLElement) {
    if (!lastContent) return null
    lastContent.appendChild(node)
    seqRise(node)
    scrollDown()
    return node
  }

  const api = {
    user,
    say,
    thinkSay,
    mountUnderLast,
    scrollDown,
    pinBottom,
    get lastContent() {
      return lastContent
    },
    clear() {
      chatEl.innerHTML = ""
      lastContent = null
      stick = true
    },
    destroy() {
      if (followRaf) cancelAnimationFrame(followRaf)
      if (manageScroll) {
        chatEl.removeEventListener("wheel", onWheel)
        chatEl.removeEventListener("touchmove", onTouchMove)
        chatEl.removeEventListener("touchend", onTouchEnd)
      }
    },
  }
  return api
}
