import type { AgentDef } from "./skins"
import type { DemoSite } from "./identity"

// ============================================================================
// Client brands — the SINGLE home for every client-specific value.
//
// Branding is not a property of a preset; it is a property of the DEPLOY. A
// preset (presets/*) is content only. A client build layers a brand on top of a
// preset: the client's primary color, neutral tint, font, agent, logo, and (for
// the analytics content) their real site portfolio. The public demo boots with
// NONE of this: neutral theme, the default agent, the generic letter mark, and
// invented site names (see identity.ts DEFAULT_SITES).
//
// Adding a client is one record here + one host line + (if the link wants a clean
// URL) nothing else — the host lookup pins the preset AND the brand. All of a
// client's specifics (real names, real agent) live in THIS file by design, so the
// public content path stays free of them.
// ============================================================================

export type ClientBrand = {
  id: string // "heatmap"
  presetId: string // "analytics" — which content it loads
  label: string // for internal / debug use
  name: string // the sidebar brand name shown beside the logo (e.g. "Heatmap")
  primary: string // raw #hex, NOT a THEMES key
  neutralTint?: string // raw #hex the greys borrow
  font: string // key into FONTS
  agent: AgentDef // resolved agent identity (name / role / avatar)
  logo?: string // path under styleguide/public/brand/, replaces the letter mark
  // Overrides the demo identity's generic sites so the client build shows the
  // real portfolio. Omit to keep the generic default sites.
  sites?: DemoSite[]
}

// Wilson, the Heatmap agent. Lives here (not in the public AGENTS picker) so the
// public demo never offers or references him; the client build wears him.
const WILSON: AgentDef = { name: "Wilson", role: "CRO expert", src: "/avatars/wilson.svg" }

// Heatmap's real client portfolio (moved off the analytics content files). Order
// matches the analytics content's site indices.
const HEATMAP_SITES: DemoSite[] = [
  { name: "laticoleathers.com", initials: "LL" },
  { name: "gearrush.com", initials: "GR" },
  { name: "plushlair.com", initials: "PL" },
  { name: "blanketwaves.com", initials: "BW" },
  { name: "vaultleather.com", initials: "VL" },
  { name: "crateandtimber.com", initials: "CT" },
  { name: "fieldkraft.com", initials: "FK" },
  { name: "northwoodco.com", initials: "NW" },
]

export const CLIENTS: Record<string, ClientBrand> = {
  heatmap: {
    id: "heatmap",
    presetId: "analytics",
    label: "Heatmap (CRO analytics)",
    name: "Heatmap",
    primary: "#10b068",
    neutralTint: "#ebdbbc", // green reads minty on the greys, so borrow warm Manila
    font: "Inter",
    agent: WILSON,
    logo: "/brand/heatmap.svg", // placeholder wordmark; drop the real asset in at this path
    sites: HEATMAP_SITES,
  },
}

// Client deploys: a custom domain pins the demo to one client (its preset AND its
// brand), so the link reads as a bespoke product, not the multi-SaaS demo. To
// onboard a client domain, add one line here. (Vercel rewrites the host to
// /demo.html; the pin is decided here, by host.)
const CLIENT_HOSTS: Record<string, string> = {
  "heatmap.onboardingloop.ai": "heatmap",
}

// Resolve the client brand for this deploy, or null for the public demo. Order:
// a `?client=<id>` param (a dev escape hatch so a client build can be previewed on
// localhost without editing hosts) wins, then a pinned client host. A non-null
// result means: client mode — force the preset, lock the picker, hide Customize,
// apply the brand, persist nothing.
export function resolveClient(
  hostname: string | null | undefined,
  clientParam?: string | null
): ClientBrand | null {
  const param = (clientParam ?? "").trim().toLowerCase()
  if (param && CLIENTS[param]) return CLIENTS[param]

  const host = (hostname ?? "").trim().toLowerCase()
  const id = CLIENT_HOSTS[host]
  return id ? CLIENTS[id] ?? null : null
}
