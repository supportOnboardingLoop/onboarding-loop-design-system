/* ============================================================
   TopBar — the marketing site's sticky header, as its own island.

   Three behaviours are ported verbatim from the vanilla page's inline JS
   (protocol-stack/index.html), only the wiring changed (ids -> refs, per-anchor
   listeners -> one delegated document listener so it survives island hydration):

     1. Mobile nav toggle: the hamburger flips body.nav-open (CSS animates the
        two lines into an X and slides the inline menu open).
     2. Header theming: sample the painted section directly under the bar via
        elementFromPoint (respects the scroll-stacking overlap) and read its
        data-bar (white | paper | dark) to tint/invert the bar. Same sampler as
        the source, frozen while the menu is open or a modal covers the bar.
     3. Anchor homing: the sticky group-stacking decouples a section's flow
        position from where it paints, so native hash scrolling lands short.
        The measure-and-correct eased scroll (homeTo + two re-snaps, all
        cancelled by any user scroll input) is copied unchanged, including the
        constants (GAP -2, cap 0.20vh, the 0.03->0.115 ease-in ramp, 380/820ms
        re-snaps). It only drives hashes whose target exists, so it stays inert
        until the real sections land.

   The reveal-in stagger is pure CSS (.reveal + --d delay); the delays live
   inline on each element, matching the source.
   ============================================================ */
import * as React from "react"
import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/base/button"
import { Icon } from "@/components/base/icon"
import { Cta } from "@/components/web/Cta"
import { DEMO_URL, GET_STARTED_MENU, NAV_MORE, PRODUCTS_MENU, type MenuItem } from "@/components/web/site-nav"

const NAV = [
  { num: "01.", label: "System", href: "#system" },
  { num: "02.", label: "Stack", href: "#stack" },
  { num: "03.", label: "Source", href: "#about" },
  { num: "04.", label: "Answers", href: "#faq" },
]

// The dropdown panel shared by Products (nav) and Get Started (button): a card of
// rows, each a framed thumbnail + title + description (Attio/Untitled layout, in
// OL style). Reveals on hover / focus-within (see .nav-dd in product.css). A row
// with no href (a future Stripe link, or an unbuilt page) renders inert.
function NavMenu({ items }: { items: MenuItem[] }) {
  return (
    <div className="nav-dd-panel">
      <div className="nav-menu">
        {items.map((it) => {
          const body = (
            <>
              <span className="nav-menu-thumb" aria-hidden="true">
                <Icon name={it.icon} size={22} />
              </span>
              <span className="nav-menu-text">
                <span className="nav-menu-title">{it.label}</span>
                <span className="nav-menu-desc">{it.desc}</span>
              </span>
            </>
          )
          return it.href ? (
            <a key={it.key} className="nav-menu-item" href={it.href}>
              {body}
            </a>
          ) : (
            <span key={it.key} className="nav-menu-item nav-menu-item--soon" aria-disabled="true">
              {body}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export interface TopBarProps {
  /** prefix for the internal section links, so a non-landing page routes back to
   *  the landing sections. "" on the landing (same-page hashes, intercepted by the
   *  eased homing below); "/" elsewhere (a real navigation to /#section). */
  home?: string
  /** "landing" (default): numbered section nav + the single Full-Stack CTA, with
   *  the eased anchor-homing that defeats the ScrollStage pinning. "global": the
   *  DECIDED marketing nav (System · Product · Service · View Demo · Get Started)
   *  for the standard marketing pages. Both render inside the same `.bar` chrome so
   *  editing one updates every page. The /system routing session flips the default. */
  variant?: "landing" | "global"
  /** global only: which top-level nav item is current (adds aria-current + active
   *  tint). /product and /service are both under Products. */
  active?: "system" | "products" | "pricing" | "faq"
  /** deprecated: Get Started is now a Build/Plan dropdown, not a single link, so
   *  this is unused. Kept so existing callers don't need editing. */
  getStartedHref?: string
}

export function TopBar({
  home = "",
  variant = "landing",
  active,
  getStartedHref = "/#fork",
}: TopBarProps = {}) {
  const headerRef = useRef<HTMLElement>(null)
  const hamRef = useRef<HTMLButtonElement>(null)
  const logoHref = home || "#top"

  // 1. Mobile nav toggle.
  useEffect(() => {
    const ham = hamRef.current
    if (!ham) return
    const toggle = () => {
      const open = document.body.classList.toggle("nav-open")
      ham.setAttribute("aria-expanded", open ? "true" : "false")
    }
    ham.addEventListener("click", toggle)
    // Any tap on a menu link closes the menu.
    const close = (e: Event) => {
      const a = (e.target as HTMLElement).closest?.(".mobile-menu a")
      if (!a) return
      document.body.classList.remove("nav-open")
      ham.setAttribute("aria-expanded", "false")
    }
    document.addEventListener("click", close)
    return () => {
      ham.removeEventListener("click", toggle)
      document.removeEventListener("click", close)
    }
  }, [])

  // 2. Header theming — match the section the bar sits over.
  useEffect(() => {
    const bar = headerRef.current
    if (!bar) return
    const barInner = bar.querySelector<HTMLElement>(".bar-inner")
    const themeUnder = () => {
      const h = barInner ? barInner.getBoundingClientRect().height : 72
      const el = document.elementFromPoint(
        Math.round(window.innerWidth / 2),
        Math.round(h + 6),
      )
      const sec = el && (el as HTMLElement).closest ? (el as HTMLElement).closest("[data-bar]") : null
      return sec ? sec.getAttribute("data-bar") : "white"
    }
    let ticking = false
    const update = () => {
      ticking = false
      // A modal or the open menu covers the bar: don't resample (the source
      // freezes the theme sampled just before, so the dark menu can't flash light).
      if (document.body.classList.contains("co-locked") || document.body.classList.contains("ft-open")) return
      if (document.body.classList.contains("nav-open")) return
      const t = themeUnder()
      bar.classList.toggle("is-dark", t === "dark")
      bar.classList.toggle("is-paper", t === "paper")
    }
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update)
        ticking = true
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", update, { passive: true })
    window.addEventListener("load", update)
    update()
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", update)
      window.removeEventListener("load", update)
    }
  }, [])

  // 3. Anchor homing — measure-and-correct eased scroll to a section, robust
  //    from any direction because the sticky stacking decouples position from
  //    scrollY. Ported unchanged; wiring is one delegated click listener. LANDING
  //    ONLY: the homing exists to defeat the ScrollStage's pin-and-stack, which no
  //    other page has. On a standard page (home set) it would wrongly hijack the
  //    page's own in-content #anchors (e.g. the legal "on this page" tabs), so bail
  //    — those use native scroll + scroll-margin-top instead.
  useEffect(() => {
    if (home || variant !== "landing") return
    const barInner = document.querySelector<HTMLElement>(".bar-inner")
    let homingOn = false
    let homingTimers: ReturnType<typeof setTimeout>[] = []
    const stopHoming = () => {
      homingOn = false
      homingTimers.forEach(clearTimeout)
      homingTimers = []
      window.removeEventListener("wheel", stopHoming)
      window.removeEventListener("touchmove", stopHoming)
      window.removeEventListener("keydown", onKeyStop)
    }
    const onKeyStop = (e: KeyboardEvent) => {
      const k = e.key
      if (
        k === "ArrowDown" || k === "ArrowUp" || k === "PageDown" || k === "PageUp" ||
        k === "Home" || k === "End" || k === " " || k === "Spacebar"
      ) stopHoming()
    }
    const GAP = -2 // land the section top ~2px behind the opaque header so its
    // 1px border tucks under the header's 1px divider (single visible line).
    const map: Record<string, number> = { "#system": 1, "#stack": 1, "#shop": 1, "#about": 1, "#faq": 1 }
    const want = () => (barInner ? barInner.getBoundingClientRect().height : 72) + GAP
    const landmark = (hash: string) => (hash === "#top" ? null : document.querySelector(hash))

    const homeTo = (el: Element, done?: () => void) => {
      let frames = 0
      let stalls = 0
      const target = want()
      const cap = Math.max(150, window.innerHeight * 0.2)
      const step = () => {
        if (!homingOn) return
        const err = el.getBoundingClientRect().top - target
        if (Math.abs(err) < 1.2 || frames > 260) { if (done) done(); return }
        const f = 0.03 + 0.085 * Math.min(1, frames / 20)
        let s = err * f
        if (s > cap) s = cap
        else if (s < -cap) s = -cap
        const y0 = window.scrollY
        window.scrollBy({ top: s, left: 0, behavior: "instant" as ScrollBehavior })
        frames++
        if (Math.abs(window.scrollY - y0) < 0.3) { if (++stalls > 10) { if (done) done(); return } }
        else stalls = 0
        requestAnimationFrame(step)
      }
      step()
    }
    const snap = (el: Element) => {
      const target = want()
      let frames = 0
      const step = () => {
        if (!homingOn) return
        const err = el.getBoundingClientRect().top - target
        if (Math.abs(err) < 1 || frames++ > 30) return
        window.scrollBy({ top: err * 0.4, left: 0, behavior: "instant" as ScrollBehavior })
        requestAnimationFrame(step)
      }
      step()
    }
    const go = (hash: string) => {
      stopHoming()
      if (hash === "#top") { window.scrollTo({ top: 0, behavior: "smooth" }); return }
      const el = landmark(hash)
      if (!el) return
      homingOn = true
      window.addEventListener("wheel", stopHoming, { passive: true })
      window.addEventListener("touchmove", stopHoming, { passive: true })
      window.addEventListener("keydown", onKeyStop)
      homeTo(el, () => {
        homingTimers.push(setTimeout(() => snap(el), 380))
        homingTimers.push(setTimeout(() => snap(el), 820))
        homingTimers.push(setTimeout(stopHoming, 900))
      })
    }

    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest?.("a[href^='#']") as HTMLAnchorElement | null
      if (!a) return
      const hash = a.getAttribute("href")
      if (!hash || hash.length < 2) return
      if (hash !== "#top" && !map[hash] && !document.querySelector(hash)) return
      e.preventDefault()
      if (history.replaceState) history.replaceState(null, "", hash)
      go(hash)
    }
    document.addEventListener("click", onClick)

    // Arriving from another page with a hash: re-home once the stacking settles.
    const initHash = location.hash
    let onLoad: (() => void) | null = null
    if (initHash && initHash.length > 1 && (map[initHash] || document.querySelector(initHash))) {
      onLoad = () => requestAnimationFrame(() => setTimeout(() => go(initHash), 80))
      window.addEventListener("load", onLoad)
    }
    return () => {
      document.removeEventListener("click", onClick)
      if (onLoad) window.removeEventListener("load", onLoad)
      stopHoming()
    }
  }, [home, variant])

  const logo = (
    <a className="logo reveal" style={{ "--d": "40ms" } as React.CSSProperties} href={logoHref}>
      <img className="logo-light" src="/assets/OnboardingLoop_Logo.png" alt="Onboarding Loop" />
      <img className="logo-dark" src="/assets/OnboardingLoop_LogoDark.png" alt="Onboarding Loop" />
    </a>
  )
  const hamburger = (
    <button className="hamburger" aria-label="Menu" aria-expanded="false" ref={hamRef}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line className="l1" x1="3" y1="12" x2="21" y2="12" />
        <line className="l2" x1="3" y1="12" x2="21" y2="12" />
      </svg>
    </button>
  )

  // ── Global marketing header — System · Product · Service · View Demo · Get Started.
  //    Route links (no page-anchor nav in the header, per the brief); View Demo is a
  //    secondary button that opens the demo in a new tab; Get Started is the primary.
  //    Both buttons are the design-system Button rendered as anchors (buttonVariants),
  //    so they inherit the marketing brand (--primary #404040 in the .ol-web scope).
  if (variant === "global") {
    const d = (ms: number) => ({ "--d": `${ms}ms` } as React.CSSProperties)
    return (
      <header className="bar" ref={headerRef}>
        <div className="bar-inner">
          {logo}
          <nav className="nav-desktop nav-global">
            <a
              className={cn("reveal", active === "system" && "is-active")}
              style={d(110)}
              href="/system"
              aria-current={active === "system" ? "page" : undefined}
            >
              System
            </a>

            {/* Products — a two-item mega-menu (Build → /product, Plan → /service) */}
            <div className="nav-dd reveal" style={d(150)}>
              <button
                type="button"
                className={cn("nav-dd-trigger", active === "products" && "is-active")}
                aria-haspopup="true"
                aria-current={active === "products" ? "page" : undefined}
              >
                Products
                <Icon name="chevron-down" size={16} className="nav-chev" />
              </button>
              <NavMenu items={PRODUCTS_MENU} />
            </div>

            {NAV_MORE.map((n, i) =>
              n.href ? (
                <a
                  key={n.key}
                  className={cn("reveal", active === n.key && "is-active")}
                  style={d(190 + i * 40)}
                  href={n.href}
                  aria-current={active === n.key ? "page" : undefined}
                >
                  {n.label}
                </a>
              ) : (
                // no page yet — inert placeholder styled like a nav link
                <span
                  key={n.key}
                  className={cn("nav-soon reveal", active === n.key && "is-active")}
                  style={d(190 + i * 40)}
                >
                  {n.label}
                </span>
              )
            )}
          </nav>

          <div className="nav-actions reveal" style={d(270)}>
            <a
              className={cn(buttonVariants({ variant: "secondary" }), "nav-btn")}
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Demo
            </a>

            {/* Get Started — a Build/Plan dropdown (each a future Stripe link) */}
            <div className="nav-dd nav-dd--right">
              <button
                type="button"
                className={cn(buttonVariants({ variant: "primary" }), "nav-btn nav-dd-trigger nav-dd-trigger--btn")}
                aria-haspopup="true"
              >
                Get Started
                <Icon name="chevron-down" size={18} className="nav-chev" />
              </button>
              <NavMenu items={GET_STARTED_MENU} />
            </div>
          </div>
          {hamburger}
        </div>

        <div className="mobile-menu">
          <a href="/system" aria-current={active === "system" ? "page" : undefined}>
            System
          </a>
          {/* Products flattens to its two routes on mobile */}
          {PRODUCTS_MENU.map((it) => (
            <a key={it.key} href={it.href}>
              {it.label}
            </a>
          ))}
          {NAV_MORE.map((n) =>
            n.href ? (
              <a key={n.key} href={n.href}>
                {n.label}
              </a>
            ) : (
              <span key={n.key} className="mm-soon">
                {n.label}
              </span>
            )
          )}
          <div className="mm-actions">
            {/* `ol-cta` opts these out of the mobile-menu's plain-link styling, so
                they render as full-width buttons keeping their own fill + color. */}
            <a
              className={cn(buttonVariants({ variant: "secondary" }), "ol-cta nav-btn")}
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              View Demo
            </a>
            <span className="mm-label">Get started</span>
            {GET_STARTED_MENU.map((it, i) => (
              <a
                key={it.key}
                className={cn(buttonVariants({ variant: i === 0 ? "primary" : "secondary" }), "ol-cta nav-btn")}
                {...(it.href ? { href: it.href } : {})}
              >
                {it.label}
              </a>
            ))}
          </div>
        </div>
      </header>
    )
  }

  // ── Landing header — the numbered section nav + the eased anchor-homing above.
  return (
    <header className="bar" ref={headerRef}>
      <div className="bar-inner">
        {logo}
        <nav className="nav-desktop">
          {NAV.map((n, i) => (
            <a
              key={n.href}
              className="reveal"
              style={{ "--d": `${110 + i * 40}ms` } as React.CSSProperties}
              href={home + n.href}
            >
              <span className="badge-num">{n.num}</span> {n.label}
            </a>
          ))}
        </nav>
        <Cta href={`${home}#stack`} className="nav-cta reveal" style={{ "--d": "230ms" } as React.CSSProperties} />
        {hamburger}
      </div>
      <div className="mobile-menu">
        {NAV.map((n) => (
          <a key={n.href} href={home + n.href}>
            <span className="badge-num">{n.num}</span> {n.label}
          </a>
        ))}
        <Cta href={`${home}#stack`} />
      </div>
    </header>
  )
}
