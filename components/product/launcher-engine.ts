/* ============================================================
   Loop Design System — launcher-engine.ts
   The launcher MORPH state machine, ported from the starter-layout
   slice (the source of truth). Framework-agnostic on purpose, the same
   split as convo-engine.ts: React renders the six blocks (with real DS
   components inside) as ONE fixed card + a persistent floating agent
   PNG; this engine owns the one thing React can't express — the
   imperative FLIP geometry (measure a state's target rect, then ease
   left/top/width/height/border-radius on the SAME element so it reads
   as one movement) plus the staggered build-in / reverse-build-out of
   each state's parts, the modal blur backdrop, the coach-mark spotlight
   (dim + masked blur with a squircle cutout), the notif/coach dismiss
   rings, and the saving progress fill.

   Foundational build-out/in law: one element, one motion. Every part
   builds in staggered (bp-anim-rise) and reverse-builds out quicker
   (bp-anim-out) around a --bp-ease-back geometry move; coach opens in
   two distinct beats (travel+collapse to the avatar disc, then expand).
   Reduced motion collapses every morph to an instant state swap.

   The engine drives whatever [data-seq] elements it finds inside the
   active block (agnostic to their markup), and reads/writes text on the
   notif/coach slots by class — so the React tree stays declarative.
   ============================================================ */

export type LauncherState = "default" | "input" | "modal" | "saving" | "notif" | "coach"

export type CoachCfg = {
  el: HTMLElement
  side: "left" | "top"
  title: string
  desc: string
  /** internal: set true once it has fully opened (fires once per target) */
  seen?: boolean
}

export type LauncherOptions = {
  /** the content region the pill docks to (bottom-centre) */
  dockEl: HTMLElement
  /** the region the modal/saving centres on + the blur covers (defaults to dockEl) */
  regionEl?: HTMLElement
  /** the surface that scrolls under a fixed launcher (re-docks on its scroll) */
  scrollEl?: HTMLElement
  coaches?: CoachCfg[]
  onNewChat?: (text: string) => void
  onSaveDashboard?: (name: string) => void
  onState?: (s: LauncherState) => void
}

export type LauncherApi = ReturnType<typeof createLauncher>

const ARROW_GAP = 14
const COACH_PAD = 8
const COACH_DELAY = 350
const VP_MARGIN = 10

export function createLauncher(root: HTMLElement, opts: LauncherOptions) {
  const reduceMotion = !!(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  const dockEl = opts.dockEl
  const regionEl = opts.regionEl || opts.dockEl
  const coaches = opts.coaches || []

  const avatar = root.querySelector<HTMLElement>(".launcher__av")
  const input = root.querySelector<HTMLTextAreaElement>(".launcher__input-field")
  const sendBtn = root.querySelector<HTMLButtonElement>(".launcher__send")
  const saveFill = root.querySelector<HTMLElement>(".launcher__progress-fill")
  const savePct = root.querySelector<HTMLElement>(".launcher__progress-pct")
  const savingProg = root.querySelector<HTMLElement>(".launcher__saving .launcher__progress")
  const notifTitleEl = root.querySelector<HTMLElement>(".notif__title")
  const notifDescEl = root.querySelector<HTMLElement>(".notif__desc")
  const coachTitleEl = root.querySelector<HTMLElement>(".coach__title")
  const coachDescEl = root.querySelector<HTMLElement>(".coach__desc")

  // viewport overlays live on <body> so nothing clips them (the blur/dim are fixed)
  const backdrop = document.createElement("div")
  backdrop.className = "launcher-backdrop"
  const coachDim = document.createElement("div")
  coachDim.className = "coach-dim"
  coachDim.setAttribute("aria-hidden", "true")
  const coachBlur = document.createElement("div")
  coachBlur.className = "coach-blur"
  coachBlur.setAttribute("aria-hidden", "true")
  document.body.appendChild(coachBlur)
  document.body.appendChild(coachDim)
  document.body.appendChild(backdrop)

  let state: LauncherState = "default"
  let morphing = false
  let morphTok = 0
  let DEFAULT_W = 220
  let hovered = false
  let focused = false
  let attachCount = 0 // staged card attachments in the composer (React owns the chips)
  let notifTimer = 0
  let coachSpotTimer = 0
  let spotlightOn = false
  let savingTok = 0
  let pendingSaveName: string | null = null
  // an arbitrary completion hook run when the saving fill lands (pin / custom flows);
  // when set it supersedes the name-based onSaveDashboard callback
  let pendingComplete: (() => void) | null = null
  let activeCoach: CoachCfg | null = null
  let coachOn = false
  let coachHoverTimer = 0

  function blockEl(s: LauncherState) {
    return root.querySelector<HTMLElement>(".launcher__" + s)
  }
  function dock() {
    const b = dockEl.getBoundingClientRect()
    return { cx: b.left + b.width / 2, bottom: b.bottom - 14 }
  }
  function placeBackdrop() {
    const b = regionEl.getBoundingClientRect()
    backdrop.style.left = Math.round(b.left) + "px"
    backdrop.style.top = Math.round(b.top) + "px"
    backdrop.style.width = Math.round(b.width) + "px"
    backdrop.style.height = Math.round(b.height) + "px"
  }

  // measure a state's natural content height at its target width (synchronous, no paint)
  function measureBlockH(s: LauncherState, w: number) {
    const pS = root.dataset.state as LauncherState
    const pW = root.style.width
    const pH = root.style.height
    const pT = root.style.transition
    root.style.transition = "none"
    root.dataset.state = s
    root.style.width = w + "px"
    root.style.height = "auto"
    const h = blockEl(s)?.scrollHeight || 68
    root.dataset.state = pS
    root.style.width = pW
    root.style.height = pH
    root.style.transition = pT
    return h
  }
  function measureDefaultW() {
    const c = root.querySelector<HTMLElement>(".launcher__default .launcher__cta")
    if (c && c.offsetWidth) DEFAULT_W = 70 + c.offsetWidth + 16
  }
  // notif width = fit its content (avatar pad + main + gap + close + right pad)
  function measureNotifW() {
    const pS = root.dataset.state as LauncherState
    const pW = root.style.width
    const pH = root.style.height
    const pT = root.style.transition
    root.style.transition = "none"
    root.dataset.state = "notif"
    root.style.width = "2000px"
    root.style.height = "68px"
    const main = root.querySelector<HTMLElement>(".launcher__notif .notif__main")
    const mw = main ? main.offsetWidth : 320
    root.dataset.state = pS
    root.style.width = pW
    root.style.height = pH
    root.style.transition = pT
    return 84 + mw + 14 + 40 + 14
  }

  function clampLauncherW(w: number) {
    return Math.min(w, window.innerWidth - 24)
  }

  type Geom = { l: number; t: number; w: number; h: number; r: number }
  function geom(s: LauncherState): Geom {
    const d = dock()
    const cc = regionEl.getBoundingClientRect()
    let w: number
    let h: number
    if (s === "input") {
      w = clampLauncherW(480)
      h = Math.max(68, measureBlockH("input", w))
      return { l: d.cx - w / 2, t: d.bottom - h, w, h, r: 34 }
    }
    if (s === "notif") {
      w = clampLauncherW(measureNotifW())
      h = 68
      return { l: d.cx - w / 2, t: d.bottom - h, w, h, r: 34 }
    }
    if (s === "saving") {
      w = clampLauncherW(368)
      h = 68
      return { l: cc.left + (cc.width - w) / 2, t: cc.top + (cc.height - h) / 2, w, h, r: 34 }
    }
    if (s === "modal") {
      w = clampLauncherW(368)
      h = measureBlockH("modal", w)
      return { l: cc.left + (cc.width - w) / 2, t: cc.top + (cc.height - h) / 2, w, h, r: 24 }
    }
    if (s === "coach") {
      const cfg = activeCoach!
      const tr = coachTargetRect(cfg)
      w = coachCardW()
      h = measureBlockH("coach", w) + (parseFloat(getComputedStyle(blockEl("coach")!).paddingBottom) || 0)
      if (cfg.side === "top") {
        const lt = Math.max(VP_MARGIN, Math.min(tr.cx - w / 2, window.innerWidth - VP_MARGIN - w))
        root.style.setProperty("--coach-arrow-x", Math.round(Math.max(26, Math.min(w - 26, tr.cx - lt))) + "px")
        return { l: lt, t: tr.bottom + ARROW_GAP, w, h, r: 34 }
      }
      const tt = Math.max(VP_MARGIN, Math.min(tr.cy - h / 2, window.innerHeight - VP_MARGIN - h))
      return { l: tr.right + ARROW_GAP, t: tt, w, h, r: 34 }
    }
    w = clampLauncherW(DEFAULT_W)
    h = 68
    return { l: d.cx - w / 2, t: d.bottom - h, w, h, r: 34 }
  }
  function applyGeom(g: Geom) {
    root.style.left = Math.round(g.l) + "px"
    root.style.top = Math.round(g.t) + "px"
    root.style.width = Math.round(g.w) + "px"
    root.style.height = Math.round(g.h) + "px"
    root.style.borderRadius = g.r + "px"
  }

  // the ordered atomic elements to build in / out per state (top -> bottom)
  function targets(s: LauncherState) {
    const b = blockEl(s)
    return b ? Array.from(b.querySelectorAll<HTMLElement>("[data-seq]")) : []
  }
  function seqIn(els: HTMLElement[], start: number) {
    els.forEach((el, i) => {
      const cls = el.hasAttribute("data-scale") ? "bp-anim-in" : "bp-anim-rise"
      el.style.animationDelay = start + i * 70 + "ms"
      el.classList.remove("bp-anim-in", "bp-anim-rise", "bp-anim-out")
      void el.offsetWidth
      el.classList.add(cls)
    })
  }
  function seqOut(els: HTMLElement[]) {
    els.forEach((el, i) => {
      el.style.animationDelay = i * 26 + "ms"
      el.classList.remove("bp-anim-in", "bp-anim-rise", "bp-anim-out")
      void el.offsetWidth
      el.classList.add("bp-anim-out")
    })
  }
  function clearAnim(rootEl: HTMLElement | null) {
    if (!rootEl) return
    rootEl.querySelectorAll<HTMLElement>(".bp-anim-in, .bp-anim-rise, .bp-anim-out").forEach((el) => {
      el.classList.remove("bp-anim-in", "bp-anim-rise", "bp-anim-out")
      el.style.animationDelay = ""
    })
  }

  // the one entry point: morph the card to `target`, reverse-building the old content out
  // and building the new content in around the geometry move
  function morphTo(target: LauncherState, o?: { force?: boolean; focus?: boolean }) {
    o = o || {}
    if (target === state && !o.force) return
    const from = state
    const tok = ++morphTok
    const out = blockEl(from)
    const inBlock = blockEl(target)
    morphing = true
    if (from === "notif" || from === "coach") clearNotifDraw()
    const g = geom(target) // measure BEFORE we flip data-state visibly
    const big =
      ["modal", "saving", "notif", "coach"].indexOf(target) >= 0 ||
      ["modal", "saving", "notif", "coach"].indexOf(from) >= 0
    const durS = big ? ".42s" : ".3s"
    const durMs = big ? 420 : 300
    const ease = big ? "cubic-bezier(.4,0,.2,1)" : "var(--bp-ease-back, cubic-bezier(.68,-0.6,.32,1.6))"
    const geomProps = ["left", "top", "width", "height", "border-radius", "background-color", "border-color"]
    const tr = geomProps.map((pr) => pr + " " + durS + " " + ease).join(", ")
    // old content reverse-builds out (skip when the incoming block IS the outgoing one — a
    // coach->coach handoff reuses the same block; seqIn re-hides + rebuilds it)
    if (out && out !== inBlock) {
      out.classList.add("is-leaving")
      seqOut(targets(from))
    }
    state = target
    root.dataset.state = target
    opts.onState?.(target)
    const backdropOn = target === "modal" || target === "saving"
    if (backdropOn) placeBackdrop()
    backdrop.classList.toggle("is-on", backdropOn)
    if (target === "saving") {
      if (saveFill) saveFill.style.width = "0%"
      if (savePct) savePct.textContent = "0%"
      savingProg?.classList.remove("is-complete")
    }
    root.classList.add("is-morphing")
    // coach opens in TWO beats: B1 travel + collapse to the avatar disc; B2 expand into the tooltip
    const twoBeatCoach = target === "coach" && !reduceMotion
    if (twoBeatCoach) {
      const B1 = 420
      const HOLD = 150
      const B2 = 360
      const e1 = "cubic-bezier(.4,0,.2,1)"
      const e2 = "cubic-bezier(.22,1,.36,1)"
      const gc: Geom = { l: g.l, t: g.t, w: 86, h: 90, r: g.r } // avatar-only disc at the landing corner
      seqIn(targets(target), B1 + HOLD + 30) // hold the tooltip content until beat 2
      root.style.transition = ["left", "top", "width", "height", "border-radius"]
        .map((p) => p + " " + B1 / 1000 + "s " + e1)
        .join(", ")
      if (avatar)
        avatar.style.transition = "left " + B1 / 1000 + "s " + e1 + ", top " + B1 / 1000 + "s " + e1 + ", width " + B1 / 1000 + "s " + e1
      void root.offsetWidth
      applyGeom(gc) // BEAT 1
      window.setTimeout(() => {
        if (tok !== morphTok) return
        root.style.transition = ["width", "height", "left", "top", "border-radius"]
          .map((p) => p + " " + B2 / 1000 + "s " + e2)
          .join(", ")
        void root.offsetWidth
        applyGeom(g) // BEAT 2
      }, B1 + HOLD)
    } else {
      seqIn(targets(target), target === "coach" ? 330 : big ? 170 : 120)
      root.style.transition = tr
      if (avatar) avatar.style.transition = "left " + durS + " " + ease + ", top " + durS + " " + ease + ", width " + durS + " " + ease
      void root.offsetWidth
      applyGeom(g)
    }
    const finishMs = twoBeatCoach ? 970 : durMs + 60
    window.setTimeout(() => {
      if (tok !== morphTok) return
      if (out && out !== inBlock) {
        out.classList.remove("is-leaving")
        clearAnim(out)
      }
    }, Math.min(240, durMs - 40))
    window.setTimeout(() => {
      if (tok !== morphTok) return
      morphing = false
      root.classList.remove("is-morphing")
      root.style.transition = ""
      if (avatar) avatar.style.transition = ""
      relayout()
      if (target === "notif") startNotifDraw()
      if (target === "coach") startCoachDraw()
      if (target === "saving") startSaving()
      if (target === "input" && o!.focus) {
        try {
          input?.focus()
        } catch {
          /* noop */
        }
      }
    }, finishMs)
    if (target === "input" && o.focus)
      window.setTimeout(() => {
        if (tok === morphTok)
          try {
            input?.focus()
          } catch {
            /* noop */
          }
      }, 150)
  }

  // grow the docked composer with its textarea (docked bottom, so the top rises as it grows)
  function resizeInput() {
    if (state !== "input" || morphing) return
    const g = geom("input")
    root.style.transition = "height .16s ease, top .16s ease"
    root.style.height = Math.round(g.h) + "px"
    root.style.top = Math.round(g.t) + "px"
    window.setTimeout(() => {
      if (!morphing) root.style.transition = ""
    }, 180)
  }
  function relayout() {
    if (morphing) return
    applyGeom(geom(state))
    if (backdrop.classList.contains("is-on")) placeBackdrop()
    if (coachOn) placeSpotlight()
  }

  /* ---- notif / coach dismiss rings ---- */
  function clearCoachSpot() {
    if (coachSpotTimer) {
      clearTimeout(coachSpotTimer)
      coachSpotTimer = 0
    }
  }
  function hideSpotlight() {
    spotlightOn = false
    clearCoachSpot()
    coachDim.classList.remove("is-on")
    coachBlur.classList.remove("is-on")
  }
  function clearNotifDraw() {
    if (notifTimer) {
      clearTimeout(notifTimer)
      notifTimer = 0
    }
    clearCoachSpot()
    root.classList.remove("is-drawing")
  }
  function startNotifDraw() {
    root.classList.remove("is-drawing")
    void root.offsetWidth
    root.classList.add("is-drawing")
    notifTimer = window.setTimeout(() => morphTo("default"), 4000)
  }
  // the coach counts as "seen" only once it has fully landed + the countdown starts. The
  // HIGHLIGHT (2s) and TOOLTIP (6s) run on SEPARATE timers.
  function startCoachDraw() {
    root.classList.remove("is-drawing")
    void root.offsetWidth
    root.classList.add("is-drawing")
    if (activeCoach) activeCoach.seen = true
    clearCoachSpot()
    coachSpotTimer = window.setTimeout(() => {
      coachSpotTimer = 0
      hideSpotlight()
    }, 2000)
    notifTimer = window.setTimeout(() => dismissCoach(), 6000)
  }

  /* ---- the Saving step: the progress fills 0 -> 100 over ~2s (rAF), then -> notif ---- */
  function startSaving() {
    const t0 = performance.now()
    const dur = 2000
    const tok = ++savingTok
    if (saveFill) saveFill.style.width = "0%"
    if (savePct) savePct.textContent = "0%"
    savingProg?.classList.remove("is-complete")
    const step = () => {
      if (tok !== savingTok || state !== "saving") return
      const e = Math.min(1, (performance.now() - t0) / dur)
      const v = Math.round(e * 100)
      if (saveFill) saveFill.style.width = v + "%"
      if (savePct) savePct.textContent = v + "%"
      if (e < 1) {
        requestAnimationFrame(step)
        return
      }
      savingProg?.classList.add("is-complete")
      window.setTimeout(() => {
        if (tok !== savingTok || state !== "saving") return
        if (pendingComplete) {
          const done = pendingComplete
          pendingComplete = null
          done()
        } else if (pendingSaveName != null) {
          opts.onSaveDashboard?.(pendingSaveName)
        }
        pendingSaveName = null
        morphTo("notif")
      }, 280)
    }
    requestAnimationFrame(step)
  }

  /* ---- input composer (auto-grow + submit) ---- */
  function autoGrow() {
    if (!input) return
    if (!input.value) {
      input.style.height = "40px"
      return
    }
    input.style.height = "auto"
    input.style.height = Math.min(input.scrollHeight, 80) + "px"
    input.scrollTop = input.scrollHeight
  }
  function submit() {
    if (!input) return
    const t = input.value.trim()
    if (!t && attachCount === 0) return // allow send with attachments + no text
    input.value = ""
    autoGrow()
    if (sendBtn) sendBtn.disabled = true
    focused = false
    hovered = false
    morphTo("default")
    try {
      input.blur()
    } catch {
      /* noop */
    }
    opts.onNewChat?.(t)
  }
  function syncSend() {
    if (sendBtn && input) sendBtn.disabled = input.value.trim().length === 0 && attachCount === 0
    autoGrow()
  }
  function maybeCollapse() {
    // keep the composer open while cards are staged, even without text / focus
    if (state === "input" && !focused && !hovered && !input?.value.trim() && attachCount === 0 && !morphing)
      morphTo("default")
  }

  const onInput = () => {
    syncSend()
    resizeInput()
  }
  const onKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (sendBtn && !sendBtn.disabled) submit()
    } else if (e.key === "Escape") {
      if (input) {
        input.value = ""
        autoGrow()
      }
      if (sendBtn) sendBtn.disabled = true
      hovered = false
      input?.blur()
      if (state === "input") morphTo("default")
    }
  }
  const onFocus = () => {
    focused = true
  }
  const onBlur = () => {
    focused = false
    maybeCollapse()
  }
  const onSendClick = () => {
    if (sendBtn && !sendBtn.disabled) submit()
  }
  input?.addEventListener("input", onInput)
  input?.addEventListener("keydown", onKeydown)
  input?.addEventListener("focus", onFocus)
  input?.addEventListener("blur", onBlur)
  sendBtn?.addEventListener("click", onSendClick)
  if (sendBtn) sendBtn.disabled = true

  /* ---- hover / ⌘K: default <-> input ---- */
  const onEnter = () => {
    hovered = true
    if (state === "default" && !morphing) morphTo("input")
  }
  const onLeave = () => {
    hovered = false
    maybeCollapse()
  }
  const onClick = (e: MouseEvent) => {
    if (morphing) return
    const tgt = e.target as HTMLElement
    if (state === "default") morphTo("input", { focus: true })
    else if (state === "input" && !tgt.closest("button, textarea, input")) {
      try {
        input?.focus()
      } catch {
        /* noop */
      }
    }
  }
  root.addEventListener("mouseenter", onEnter)
  root.addEventListener("mouseleave", onLeave)
  root.addEventListener("click", onClick)

  const onDocKey = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && (e.key === "k" || e.key === "K")) {
      e.preventDefault()
      if (morphing) return
      if (state === "default") morphTo("input", { focus: true })
      else if (state === "input") {
        hovered = false
        input?.blur()
        morphTo("default")
      }
    } else if (e.key === "Escape" && state === "modal" && !morphing) {
      morphTo("default")
    }
  }
  document.addEventListener("keydown", onDocKey)
  const onBackdropClick = () => {
    if (state === "modal" && !morphing) morphTo("default")
  }
  backdrop.addEventListener("click", onBackdropClick)

  /* ============================================================ COACH-MARKS */
  function coachTargetRect(cfg: CoachCfg) {
    const r = cfg.el.getBoundingClientRect()
    return {
      x: r.left - COACH_PAD,
      y: r.top - COACH_PAD,
      w: r.width + COACH_PAD * 2,
      h: r.height + COACH_PAD * 2,
      right: r.right + COACH_PAD,
      bottom: r.bottom + COACH_PAD,
      cx: r.left + r.width / 2,
      cy: r.top + r.height / 2,
    }
  }
  // a card width that COMPLEMENTS the copy: balance the body into a few equal-ish lines,
  // measuring the TEXT width via a Range on the nowrap copy (NOT scrollWidth, NOT by
  // resizing the launcher — that would re-evaluate :hover and dismiss the coach mid-open)
  function coachCardW() {
    const block = blockEl("coach")!
    const desc = block.querySelector<HTMLElement>(".coach__desc")!
    const title = block.querySelector<HTMLElement>(".coach__title")!
    const pS = root.dataset.state as LauncherState
    root.dataset.state = "coach"
    desc.style.whiteSpace = "nowrap"
    title.style.whiteSpace = "nowrap"
    const rng = document.createRange()
    rng.selectNodeContents(desc)
    const W1 = rng.getBoundingClientRect().width
    rng.selectNodeContents(title)
    const WT = rng.getBoundingClientRect().width
    desc.style.whiteSpace = ""
    title.style.whiteSpace = ""
    root.dataset.state = pS
    const OVERHEAD = 152
    const MAXTEXT = 300
    const MAXCARD = 480
    const lines = Math.max(1, Math.ceil(W1 / MAXTEXT))
    const textW = Math.max(WT, Math.ceil(W1 / lines) + 14)
    return Math.max(300, Math.min(MAXCARD, Math.round(textW) + OVERHEAD))
  }
  // a full-viewport alpha mask, opaque everywhere EXCEPT a rounded-rect hole at the target,
  // so the blur overlay clears the cutout (the crisp squircle edge is the box-shadow dim)
  function spotlightMask(x: number, y: number, w: number, h: number, r: number) {
    x = Math.round(x)
    y = Math.round(y)
    w = Math.round(w)
    h = Math.round(h)
    const vw = window.innerWidth
    const vh = window.innerHeight
    const outer = "M0 0H" + vw + "V" + vh + "H0Z"
    const inner =
      "M" + (x + r) + " " + y + "H" + (x + w - r) + "A" + r + " " + r + " 0 0 1 " + (x + w) + " " + (y + r) +
      "V" + (y + h - r) + "A" + r + " " + r + " 0 0 1 " + (x + w - r) + " " + (y + h) +
      "H" + (x + r) + "A" + r + " " + r + " 0 0 1 " + x + " " + (y + h - r) +
      "V" + (y + r) + "A" + r + " " + r + " 0 0 1 " + (x + r) + " " + y + "Z"
    const svg =
      "<svg xmlns='http://www.w3.org/2000/svg' width='" + vw + "' height='" + vh + "'><path fill-rule='evenodd' fill='#fff' d='" +
      outer + inner + "'/></svg>"
    return 'url("data:image/svg+xml,' + encodeURIComponent(svg) + '")'
  }
  function placeSpotlight() {
    if (!activeCoach) return
    const r = coachTargetRect(activeCoach)
    coachDim.style.left = Math.round(r.x) + "px"
    coachDim.style.top = Math.round(r.y) + "px"
    coachDim.style.width = Math.round(r.w) + "px"
    coachDim.style.height = Math.round(r.h) + "px"
    const m = spotlightMask(r.x, r.y, r.w, r.h, 24)
    coachBlur.style.webkitMaskImage = m
    coachBlur.style.maskImage = m
  }
  function showCoach(cfg: CoachCfg) {
    const handoff = state === "coach"
    activeCoach = cfg
    coachOn = true
    spotlightOn = true
    if (coachTitleEl) coachTitleEl.textContent = cfg.title
    if (coachDescEl) coachDescEl.textContent = cfg.desc
    root.classList.toggle("is-coach-top", cfg.side === "top")
    root.classList.toggle("is-coach-left", cfg.side !== "top")
    placeSpotlight()
    coachDim.classList.add("is-on")
    coachBlur.classList.add("is-on")
    morphTo("coach", { force: handoff })
  }
  function dismissCoach() {
    if (!coachOn) return
    coachOn = false
    if (notifTimer) {
      clearTimeout(notifTimer)
      notifTimer = 0
    }
    hideSpotlight()
    if (state === "coach") morphTo("default")
  }
  function canArm(cfg: CoachCfg) {
    return !cfg.seen && !spotlightOn && !morphing && (state === "default" || state === "coach")
  }
  function armCoach(cfg: CoachCfg) {
    if (!canArm(cfg)) return
    if (coachHoverTimer) clearTimeout(coachHoverTimer)
    coachHoverTimer = window.setTimeout(() => {
      coachHoverTimer = 0
      if (canArm(cfg) && cfg.el.matches(":hover")) showCoach(cfg)
    }, COACH_DELAY)
  }
  function disarmCoach() {
    if (coachHoverTimer) {
      clearTimeout(coachHoverTimer)
      coachHoverTimer = 0
    }
  }
  const coachHandlers: Array<() => void> = []
  coaches.forEach((cfg) => {
    if (!cfg.el) return
    const enter = () => armCoach(cfg)
    const leave = () => disarmCoach()
    const down = () => {
      disarmCoach()
      if (coachOn && activeCoach === cfg) {
        cfg.seen = true
        hideSpotlight()
      }
    }
    cfg.el.addEventListener("mouseenter", enter)
    cfg.el.addEventListener("mouseleave", leave)
    cfg.el.addEventListener("pointerdown", down)
    coachHandlers.push(() => {
      cfg.el.removeEventListener("mouseenter", enter)
      cfg.el.removeEventListener("mouseleave", leave)
      cfg.el.removeEventListener("pointerdown", down)
    })
  })

  /* ---- keep everything docked / aligned as the layout shifts ---- */
  const onResize = () => {
    measureDefaultW()
    relayout()
  }
  const onScroll = () => relayout()
  window.addEventListener("resize", onResize)
  opts.scrollEl?.addEventListener("scroll", onScroll, { passive: true })
  // capture-phase so a scroll on ANY ancestor (the docs page's own scroller) re-docks the
  // fixed card too, even when we weren't handed that element as scrollEl
  document.addEventListener("scroll", onScroll, true)
  let ro: ResizeObserver | null = null
  if (window.ResizeObserver) {
    ro = new ResizeObserver(() => relayout())
    ro.observe(dockEl)
    if (regionEl !== dockEl) ro.observe(regionEl)
  }

  // initial dock — synchronously (before first paint) so the card never flashes at 0,0,
  // then again on the next frame once fonts/layout have settled
  root.dataset.state = "default"
  measureDefaultW()
  applyGeom(geom("default"))
  requestAnimationFrame(() => {
    measureDefaultW()
    relayout()
  })

  return {
    get state() {
      return state
    },
    morphTo,
    /** open the "create dashboard" modal */
    openModal() {
      if (state !== "modal" && !morphing) morphTo("modal")
    },
    /** open the composer (e.g. after a card is dropped onto the launcher) */
    openInput(focus = true) {
      hovered = true
      if (state !== "input" && !morphing) morphTo("input", { focus })
    },
    /** tell the engine how many card attachments are staged (enables send +
     *  keeps the composer open); React owns the chips */
    setAttachCount(n: number) {
      attachCount = Math.max(0, n | 0)
      syncSend()
      if (state === "input" && !morphing) resizeInput()
    },
    toDefault() {
      if (state !== "default" && !morphing) morphTo("default")
    },
    /** run the full Save -> Saving -> Notif flow. Pass `name` for the built-in
     *  create-dashboard path (calls onSaveDashboard), or `onComplete` for any other
     *  flow (e.g. pin-to-dashboard) that applies its own effect when the fill lands. */
    startSaveFlow(o: { name?: string; notifTitle: string; notifDesc: string; onComplete?: () => void }) {
      pendingSaveName = o.name ?? null
      pendingComplete = o.onComplete ?? null
      if (notifTitleEl) notifTitleEl.textContent = o.notifTitle
      if (notifDescEl) notifDescEl.textContent = o.notifDesc
      morphTo("saving")
    },
    /** the reusable system-wide toast: set text + morph to the notif state */
    showNotification(title: string, desc: string) {
      if (notifTitleEl) notifTitleEl.textContent = title
      if (notifDescEl) notifDescEl.textContent = desc
      morphTo("notif")
    },
    /** dismiss the current transient state (notif close, coach close) back to the pill */
    dismiss() {
      if (state === "notif") morphTo("default")
      else if (state === "coach") dismissCoach()
    },
    /** open a coach-mark immediately (bypasses hover-intent) — for a driver control */
    openCoach(index: number) {
      const cfg = coaches[index]
      if (cfg && !morphing && !spotlightOn) {
        cfg.seen = false
        showCoach(cfg)
      }
    },
    relayout,
    destroy() {
      morphTok++
      savingTok++
      disarmCoach()
      clearNotifDraw()
      hideSpotlight()
      input?.removeEventListener("input", onInput)
      input?.removeEventListener("keydown", onKeydown)
      input?.removeEventListener("focus", onFocus)
      input?.removeEventListener("blur", onBlur)
      sendBtn?.removeEventListener("click", onSendClick)
      root.removeEventListener("mouseenter", onEnter)
      root.removeEventListener("mouseleave", onLeave)
      root.removeEventListener("click", onClick)
      document.removeEventListener("keydown", onDocKey)
      backdrop.removeEventListener("click", onBackdropClick)
      coachHandlers.forEach((off) => off())
      window.removeEventListener("resize", onResize)
      opts.scrollEl?.removeEventListener("scroll", onScroll)
      document.removeEventListener("scroll", onScroll, true)
      ro?.disconnect()
      backdrop.remove()
      coachDim.remove()
      coachBlur.remove()
    },
  }
}
