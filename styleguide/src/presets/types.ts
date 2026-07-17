import type * as React from "react"
import type { IconName } from "@/components/base/icon"
import type { ConversationHandle } from "@/components/product/conversation"
import type { LauncherApi } from "@/components/product/launcher-engine"
import type { Skin } from "../skins"
import type { CardActionsValue } from "./analytics-ui"

// ============================================================================
// DemoPreset — one "type of SaaS" the demo can load (Analytics, Project Mgmt,
// Health, Finance, CRM). A preset is CONTENT + a Skin; it never owns behavior.
//
// The Demo renderer (DemoApp.tsx) owns all app STATE + behavior (chats,
// collection rows, launcher, travelling avatar, every handler) and is identical
// across presets. It reads the content below and paints it into the shared DS
// components. So a component change reaches every preset, and a new preset is
// just a new data file — no renderer fork.
//
// Most of a preset is plain data. Only the two genuinely-JSX pieces (the
// content-header actions and the content body) are render slots; they receive a
// DemoContext to reach the few shared handles they need.
// ============================================================================

export type NavBadge = { text: string; variant?: "new" | "default" }
export type NavItemDef = { id: string; icon: IconName; label: string; badge?: NavBadge }
export type NavSection = { label: string; count?: number; items: NavItemDef[] }

// A row in the sub-nav's savable collection (analytics: a dashboard).
export type CollectionSeed = { id: string; name: string; count: number }
// A seeded conversation in Saved / Recent chats.
export type ChatSeed = { id: string; title: string; firstText: string; saved?: boolean }
// A row in the Context Engine footer group.
export type ContextItem = { icon: IconName; label: string; count: number }

// A coach-mark the launcher can spotlight. `target` names a shared ref the
// renderer owns; the preset supplies only the copy + which side to point from.
export type PresetCoach = {
  target: "collection" | "actions"
  side: "top" | "bottom" | "left" | "right"
  title: string
  desc: string
}

// The shared handles a preset's render slots may reach into. Kept deliberately
// small: a slot styles/composes content, the renderer owns the state.
export type DemoContext = {
  /** the selected primary-nav item id (the content body switches views on it) */
  navSelected: string
  /** a generated report open in the content area (overrides the nav view) */
  activeReport: { id: string; name: string } | null
  /** open the launcher's save-to-collection modal (the content-header CTA) */
  openSaveModal: () => void
  /** the launcher's imperative API (morph states, relayout) */
  launcher: React.RefObject<LauncherApi | null>
  /** coach-mark target: the content-header actions cluster */
  actionsRef: React.RefObject<HTMLDivElement | null>
  /** the modal/blur region (the content column) */
  regionRef: React.RefObject<HTMLDivElement | null>
  /** where the docked launcher travels up from (content body) */
  dockRef: React.RefObject<HTMLDivElement | null>
  /** pin / attach state + handlers the content cards read (fed into the
   *  CardActionsProvider); the renderer owns the underlying state */
  cardActions: CardActionsValue
}

export type SlotProps = { ctx: DemoContext }

export type DemoPreset = {
  // ---- picker + identity ----
  id: string // url slug, e.g. "analytics"
  label: string // picker label, e.g. "Analytics"
  tagline: string // picker one-liner
  pickerIcon: IconName
  status?: "ready" | "soon" // "soon" = a scaffolded stub
  skin: Skin

  // ---- column 1: primary nav ----
  brand: { mark: string; name: string; sub?: string }
  nav: NavSection[]

  // ---- column 2: agent home / sub-nav ----
  // (the agent identity comes from skin.agent)
  collection: {
    label: string // group label, e.g. "Dashboards"
    itemIcon: IconName // row icon, e.g. "layout-dashboard"
    seed: CollectionSeed[]
    saveVerb: string // content-header CTA + launcher modal, e.g. "Save as Dashboard"
    saveNoun: string // notification noun, e.g. "Dashboard"
  }
  seedSavedChats: ChatSeed[]
  seedRecentChats: ChatSeed[]
  contextEngine: { label: string; items: ContextItem[] }

  // ---- column 3: content ----
  content: {
    title: string
    icon: IconName
    /** right-hand controls in the content header (filters, date range, CTA) */
    HeaderActions?: React.ComponentType<SlotProps>
    /** the content-area body — where the Card system + real content lives */
    Body?: React.ComponentType<SlotProps>
  }

  // ---- launcher ----
  accessOptions: string[] // "Who has access?" options in the save modal
  coaches: PresetCoach[]

  // ---- the agent conversation ----
  // Scripts only the AGENT's reply to a user message (thinks, offers choices,
  // acknowledges the pick, may build a report). The renderer emits the user turn
  // (with any dropped card attachments) BEFORE calling this, so respond must NOT
  // clear or echo the user. `actions` gives host hooks (e.g. open a report in the
  // content area). Return value is ignored.
  conversation: {
    respond: (api: ConversationHandle, text: string, actions?: ConversationActions) => void
  }
}

// Host hooks a preset's conversation can call (e.g. from a report CTA).
export type ConversationActions = {
  openReport?: (id: string, name: string) => void
}
