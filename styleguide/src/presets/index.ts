import type { DemoPreset } from "./types"
import { analyticsPreset } from "./analytics"
import { projectMgmtPreset } from "./project-mgmt"
import { healthPreset } from "./health"
import { financePreset } from "./finance"
import { crmPreset } from "./crm"

// The demo's SaaS presets, ordered for the picker. Analytics leads and is the
// default; it's the flagship, and the client links (e.g. Heatmap) load it as
// their content. A preset is CONTENT only — branding is resolved by the deploy
// (the visitor's Customize choices, or a client record in clients.ts).
export const PRESET_LIST: DemoPreset[] = [
  analyticsPreset,
  projectMgmtPreset,
  healthPreset,
  financePreset,
  crmPreset,
]

export const PRESETS: Record<string, DemoPreset> = Object.fromEntries(
  PRESET_LIST.map((p) => [p.id, p])
)

export const DEFAULT_PRESET_ID = analyticsPreset.id

// Resolve a raw ?saas= value to a known preset id, falling back to the default
// when it's missing or unrecognized. (Host-based client pinning lives in
// clients.ts, resolved before this in DemoApp.)
export function resolvePresetId(raw: string | null | undefined): string {
  const id = (raw ?? "").trim().toLowerCase()
  return PRESETS[id] ? id : DEFAULT_PRESET_ID
}

export type { DemoPreset } from "./types"
