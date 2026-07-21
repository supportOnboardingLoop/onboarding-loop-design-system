import * as React from "react"

import type { AgentDef } from "./skins"

// ============================================================================
// DemoIdentity — the CONTENT identity a demo surface wears: which client sites
// the analytics content names, and which agent its copy refers to.
//
// This is deliberately separate from the SKIN (brand color / font / agent
// visuals, in skins.ts) and from the CONTENT SHAPE (a DemoPreset, presets/*).
// It exists so the PUBLIC demo can show invented, obviously-generic site names
// and the default agent, while a CLIENT build overrides both with the real
// portfolio and the real agent, WITHOUT the analytics content files carrying any
// client-specific strings themselves. The renderer (DemoApp) resolves an identity
// once and supplies it here; the analytics content reads it via useDemoIdentity.
//
// The analytics content references sites by INDEX into `sites` (see
// analytics-content / analytics-portfolio / analytics-reports), so swapping the
// list swaps every label at once with no per-file string edits.
// ============================================================================

// One client site: the domain shown in copy + the 2-letter avatar initials (the
// initials can't be derived from a bare domain, so they travel with the name).
export type DemoSite = { name: string; initials: string }

export type DemoIdentity = {
  sites: DemoSite[]
  agent: AgentDef
}

// The generic, obviously-invented sites the PUBLIC demo shows. None of these are
// real client data; a client build overrides `sites` with its real portfolio (see
// clients.ts). Order is load-bearing: the analytics content indexes into this list.
export const DEFAULT_SITES: DemoSite[] = [
  { name: "harborgoods.com", initials: "HG" },
  { name: "swiftcart.com", initials: "SC" },
  { name: "meadowlane.com", initials: "ML" },
  { name: "brightnest.com", initials: "BN" },
  { name: "coastline.co", initials: "CL" },
  { name: "junipergoods.com", initials: "JG" },
  { name: "atlasfield.com", initials: "AF" },
  { name: "riverstone.co", initials: "RS" },
]

// The default agent the public content refers to when nothing else is resolved.
// Kept here (a plain literal, not an AGENTS lookup) so this module doesn't depend
// on the picker list; DemoApp supplies the live agent at render.
const DEFAULT_AGENT: AgentDef = { name: "Bal", role: "Founder", src: "/avatars/bal.svg" }

const Ctx = React.createContext<DemoIdentity>({ sites: DEFAULT_SITES, agent: DEFAULT_AGENT })

export const DemoIdentityProvider = Ctx.Provider
export const useDemoIdentity = () => React.useContext(Ctx)
