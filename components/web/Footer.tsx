/* ============================================================
   Footer — the shared site footer (dark band). Extracted from CtaSection so it is
   reusable on ANY page: the landing composes it as the second half of its closing
   scroll group (`.g-e2`, the floor), while a standard page (Terms, Privacy, case
   study, …) renders it at the bottom of normal flow via PageShell.

   Self-contained: it carries the site-wide content as defaults (so a page can just
   drop `<Footer/>`), owns its own reveal when `reveal`, and takes a `home` prefix
   so a non-landing page routes its section links back to the landing (`home="/"`)
   while the landing leaves them same-page (`home=""`, the default).

   `reveal` defaults to FALSE — a footer rendered as static HTML (no client
   hydration) then stays visible instead of stranding on the `.reveal-up` opacity:0.
   Callers that hydrate it (the landing's Landing island; PageShell's client:visible)
   pass `reveal` to get the staggered rise.
   ============================================================ */
import * as React from "react"

import { cn } from "@/lib/utils"
import { DEMO_URL, GLOBAL_NAV, SUPPORT_EMAIL } from "@/components/web/site-nav"

// The footer LinkedIn glyph — ported verbatim from the source (single path, round
// badge). A true circle, but an <svg>, not an element the global squircle touches.
const LinkedInIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32ZM16 30.08C23.7762 30.08 30.08 23.7762 30.08 16C30.08 8.22383 23.7762 1.92 16 1.92C8.22383 1.92 1.92 8.22383 1.92 16C1.92 23.7762 8.22383 30.08 16 30.08ZM8.96 12.8756V22.1812H11.9745V12.8756H8.96ZM10.6654 8.32C9.63418 8.32 8.96 9.01495 8.96 9.92737C8.96 10.8209 9.61425 11.5358 10.6263 11.5358H10.6455C11.6966 11.5358 12.3512 10.8209 12.3512 9.92737C12.3317 9.01495 11.6966 8.32 10.6654 8.32ZM19.5692 12.8756C17.9688 12.8756 17.2522 13.7788 16.8521 14.4124V13.0943H13.8373C13.877 13.9675 13.8373 22.4 13.8373 22.4H16.8521V17.2029C16.8521 16.9248 16.8717 16.6474 16.9514 16.4483C17.1692 15.8926 17.6653 15.3174 18.4981 15.3174C19.5893 15.3174 20.0255 16.1707 20.0255 17.4212V22.3998H23.0399L23.04 17.0642C23.04 14.2059 21.5529 12.8756 19.5692 12.8756Z"
      fill="currentColor"
    />
  </svg>
)

// Site-wide footer content. Section links mirror the header; the `home` prefix is
// applied at render so they route home from a non-landing page.
const FOOT_NAV = [
  { href: "#system", num: "01.", label: "System" },
  { href: "#stack", num: "02.", label: "Stack" },
  { href: "#about", num: "03.", label: "Source" },
  { href: "#faq", num: "04.", label: "Answers" },
]

export interface FooterProps {
  /** prefix for the internal section links: "" on the landing (same-page hashes),
   *  "/" elsewhere (route home, then scroll). */
  home?: string
  /** apply the staggered reveal-up (needs client hydration; default static). */
  reveal?: boolean
  /** "landing" (default): the numbered section links mirroring the landing header.
   *  "global": the DECIDED marketing nav (System · Product · Service · View Demo) +
   *  Terms · Privacy · support email, mirroring the global header. */
  variant?: "landing" | "global"
}

export function Footer({ home = "", reveal = false, variant = "landing" }: FooterProps) {
  const logoHref = variant === "global" ? "/" : home || "#top"

  // The footer fades in with the CSS auto-play `.reveal` (plays on render), NOT
  // the scroll-triggered `.reveal-up`: the copyright + legal row is critical
  // always-visible text, and `.reveal-up` sits at opacity:0 until an
  // IntersectionObserver adds `.is-in` — which never fires when you land directly
  // at the very bottom (the footer falls in the observer's -12% bottom dead zone).
  // `.reveal` can't get stuck (it even works with JS disabled).
  return (
    <footer data-bar="dark" data-dock="final">
      <div className="foot-in">
        <div className={cn("foot-top", reveal && "reveal")}>
          <div className="foot-brand">
            <a className="logo" href={logoHref}>
              <img src="/assets/OnboardingLoop_LogoDark.png" alt="Onboarding Loop" />
            </a>
            <nav className="foot-nav">
              {variant === "global" ? (
                <>
                  {GLOBAL_NAV.map((n) => (
                    <a key={n.key} href={n.href}>
                      {n.label}
                    </a>
                  ))}
                  <a href={DEMO_URL} target="_blank" rel="noopener noreferrer">
                    View Demo
                  </a>
                </>
              ) : (
                FOOT_NAV.map((n) => (
                  <a key={n.href} href={home + n.href}>
                    <span className="badge-num">{n.num}</span> {n.label}
                  </a>
                ))
              )}
            </nav>
          </div>
          <div className="foot-by">
            <span className="foot-byline">by Bal Sieber</span>
            <a
              className="foot-social"
              href="https://www.linkedin.com/in/balsieber/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Bal Sieber on LinkedIn"
            >
              <LinkedInIcon />
            </a>
          </div>
        </div>
        <div className={cn("foot-bottom", reveal && "reveal")} style={reveal ? ({ "--d": "80ms" } as React.CSSProperties) : undefined}>
          <p>© 2026 Onboarding Loop. All rights reserved.</p>
          <div className="legal">
            <a href="/terms-of-service">Terms</a>
            <a href="/privacy-policy">Privacy</a>
            {variant === "global" && <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>}
          </div>
        </div>
      </div>
    </footer>
  )
}
