/* ============================================================
   site-nav — the single source of truth for the GLOBAL marketing nav.

   DECIDED (Bal 7/20): the global header + footer carry, in this order,
   System · Product · Service · View Demo · Get Started. The header and footer
   both read this list so they can never drift. View Demo opens the live demo in
   a new tab; Get Started is per-page (checkout on /product & /service, the home
   fork elsewhere), so it is a prop, not part of this list.

   The landing header still uses its own numbered section nav until the /system
   routing session flips every page onto the global variant; that list lives
   inline in TopBar as NAV.
   ============================================================ */

/** The live demo, opened in a new tab from View Demo. */
export const DEMO_URL = "https://demo.onboardingloop.ai"

/** Support address shown in the global footer. */
export const SUPPORT_EMAIL = "support@onboardingloop.com"

export interface GlobalNavItem {
  key: "system" | "product" | "service"
  label: string
  href: string
}

/** The three top-level marketing pages, in header/footer order. */
export const GLOBAL_NAV: GlobalNavItem[] = [
  { key: "system", label: "System", href: "/system" },
  { key: "product", label: "Product", href: "/product" },
  { key: "service", label: "Service", href: "/service" },
]
