/* ============================================================
   site-nav — the single source of truth for the GLOBAL marketing nav.

   Header order (Bal 7/21): System · Products (dropdown) · Pricing · FAQ ·
   View Demo (secondary button) · Get Started (primary button, dropdown). The
   footer mirrors the destinations as a flat list. Both header and footer read
   this file so they can never drift.

   - Products is a two-item mega-menu: Build → /product (do it yourself), Plan →
     /service (done for you).
   - Get Started is a two-item dropdown of the SAME two, but for checkout: they
     will each open a Stripe link (left blank for now).
   - Pricing and FAQ are placeholders (no page yet), so their href is undefined.
   ============================================================ */
import type { IconName } from "@/components/base/icon"

/** The live demo, opened in a new tab from View Demo. */
export const DEMO_URL = "https://demo.onboardingloop.ai"

/** Support address shown in the global footer. */
export const SUPPORT_EMAIL = "support@onboardingloop.com"

/** which top-level nav item is the current page (adds aria-current + active tint). */
export type NavKey = "system" | "products" | "pricing" | "faq"

export interface MenuItem {
  key: string
  label: string
  /** short placeholder description under the title (Bal writes final copy). */
  desc: string
  /** destination; undefined = not wired yet (a checkout Stripe link, or an
   *  unbuilt page) — renders as an inert placeholder row. */
  href?: string
  /** Tabler icon shown in the row's framed thumbnail slot (placeholder for a
   *  real thumbnail image Bal can drop in later). */
  icon: IconName
}

/** Products dropdown (nav): the two routes to the product pages. */
export const PRODUCTS_MENU: MenuItem[] = [
  { key: "build", label: "Build", desc: "Do it yourself, $129.", href: "/product", icon: "file-text" },
  { key: "plan", label: "Plan", desc: "Done for you, $750.", href: "/service", icon: "calendar" },
]

/** Get Started dropdown (button): the same two, for checkout. hrefs are the
 *  future Stripe links, left blank for now. */
export const GET_STARTED_MENU: MenuItem[] = [
  { key: "build", label: "Build", desc: "Do it yourself, $129.", href: undefined, icon: "file-text" },
  { key: "plan", label: "Plan", desc: "Done for you, $750.", href: undefined, icon: "calendar" },
]

/** Top-level plain nav items after System + Products. Pricing and FAQ have no
 *  page yet (href undefined → inert placeholder). */
export const NAV_MORE: { key: NavKey; label: string; href?: string }[] = [
  { key: "pricing", label: "Pricing", href: undefined },
  { key: "faq", label: "FAQ", href: undefined },
]

/** Footer nav — a flat mirror of the header's destinations (no dropdowns). */
export const FOOTER_NAV: { label: string; href?: string; external?: boolean }[] = [
  { label: "System", href: "/system" },
  { label: "Build", href: "/product" },
  { label: "Plan", href: "/service" },
  { label: "Pricing", href: undefined },
  { label: "FAQ", href: undefined },
  { label: "View Demo", href: DEMO_URL, external: true },
]
