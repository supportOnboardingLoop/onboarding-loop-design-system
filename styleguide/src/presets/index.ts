import type { DemoPreset } from "./types"
import { analyticsPreset } from "./analytics"
import { projectMgmtPreset } from "./project-mgmt"
import { healthPreset } from "./health"
import { financePreset } from "./finance"
import { crmPreset } from "./crm"

// The demo's SaaS presets, ordered for the picker. Analytics (Heatmap) leads and
// is the default — it's the flagship, and the Heatmap client link deploys it.
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

// Friendly aliases for the ?saas= param. The Heatmap client link can use the
// natural ?saas=heatmap and it resolves to the Analytics preset.
const ALIASES: Record<string, string> = { heatmap: "analytics" }

// Resolve a raw ?saas= value (or alias) to a known preset id, falling back to
// the default when it's missing or unrecognized.
export function resolvePresetId(raw: string | null | undefined): string {
  const key = (raw ?? "").trim().toLowerCase()
  const id = ALIASES[key] ?? key
  return PRESETS[id] ? id : DEFAULT_PRESET_ID
}

export type { DemoPreset } from "./types"
