import * as React from "react"
import { flushSync } from "react-dom"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/components/base/icon"
import { IconButton } from "@/components/base/icon-button"
import { Button } from "@/components/base/button"
import { WorkspaceShell } from "@/components/product/workspace-shell"
import {
  LayoutColumn,
  ColumnHeader,
  ColumnTitle,
  ColumnBody,
  ColumnFooter,
  NavList,
} from "@/components/product/layout-column"
import { BrandMark } from "@/components/product/brand-mark"
import { AgentHomeHeader } from "@/components/product/agent-home-header"
import { TravellingAgentAvatar, type TravellingAvatarHandle } from "@/components/product/travelling-avatar"
import { HamburgerButton, AgentDrawerButton } from "@/components/product/compact-bar"
import { NavItem } from "@/components/product/nav-item"
import { CollapsibleSection } from "@/components/product/section"
import { AccountCard } from "@/components/product/account-card"
import { Chip } from "@/components/product/chip"
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
} from "@/components/product/dropdown"
import { Launcher, type CoachTarget } from "@/components/product/launcher"
import { ChatPanel, type ChatPanelOption } from "@/components/product/chat-panel"
import type { LauncherApi } from "@/components/product/launcher-engine"
import type { ConversationHandle } from "@/components/product/conversation"
import { applyTheme, applyFont, applyNeutralTint, complementaryNeutralTint, FONTS, THEMES, AGENTS } from "./skins"
import { PRESET_LIST, PRESETS, DEFAULT_PRESET_ID, resolvePresetId } from "./presets"
import { resolveClient } from "./clients"
import { DemoIdentityProvider, DEFAULT_SITES, type DemoIdentity } from "./identity"
import { useSkinState, CustomizePanel, NEUTRAL_SKIN, type SkinChoice, type SkinState } from "./customize"
import type { DemoPreset, DemoContext } from "./presets/types"
import { DragProvider, type DragCallbacks } from "./drag"
import type { Attachment } from "@/components/product/attach-chip"
import type { CardRef, CardActionsValue } from "./presets/analytics-ui"
import {
  makeTileFromCard,
  nextId,
  type Dashboard,
  type DashboardHandlers,
} from "./presets/analytics-dashboard"
import type { TileDescriptor } from "./presets/analytics-tiles"

// ============================================================
// DEMO — the design system + the agent in action (the full-viewport workspace).
// This is where we SEE the system: assembled ENTIRELY from the real DS
// components, so editing a component (here or in the design system) propagates
// to both — no drift.
//
// The demo is a SINGLE renderer (<DemoWorkspace>) that loads any "type of SaaS"
// from a DemoPreset (presets/*): Analytics, Project Mgmt, Health, Finance, CRM.
// The renderer owns all app STATE + behavior (chats, collection rows, launcher,
// travelling avatar); the preset supplies only CONTENT.
//
// BRANDING is a property of the DEPLOY, not the content (see the boot resolution
// in Demo). The PUBLIC demo boots neutral and lets the visitor drive it via the
// Customize accordion (customize.tsx), surviving SaaS switches; switching presets
// changes content only, never the skin. A CLIENT build (a pinned host, or the
// ?client= dev escape hatch; both resolve in clients.ts) boots that client's
// brand + logo + agent + real site names, locks the picker, and hides Customize.
// A deploy can also just hide the picker with ?saas=&lock=1 (still public).
// ============================================================

// strip only polite / imperative openers; keep question words (they read fine as titles)
const LEADIN =
  /^(can you|could you|would you|please|i want to|i'd like to|i would like to|i need to|tell me about|help me|give me|show me|let's|lets)\s+/i
function summarize(text: string) {
  const t = text.trim().replace(/\s+/g, " ").replace(LEADIN, "")
  let s = t.split(" ").filter(Boolean).slice(0, 7).join(" ").replace(/[\s.,;:!?]+$/, "")
  if (!s) s = text.trim().split(" ").slice(0, 7).join(" ")
  return s.charAt(0).toUpperCase() + s.slice(1)
}

type Chat = { id: string; title: string; firstText: string; history: string; saved?: boolean }

// a tile captured when it's unpinned, so an Undo can restore it to the same board + spot
type RemovedTile = { dashId: string; index: number; tile: Dashboard["tiles"][number] }

// re-insert unpinned tiles at their original board positions (for the Undo action).
// Inserts per board in ascending index so earlier splices don't shift later targets;
// skips any tile that got re-pinned in the meantime (dedupe by tile id).
function reinsertTiles(dashboards: Dashboard[], removed: RemovedTile[]): Dashboard[] {
  const byDash = new Map<string, RemovedTile[]>()
  for (const r of removed) byDash.set(r.dashId, [...(byDash.get(r.dashId) ?? []), r])
  return dashboards.map((d) => {
    const adds = byDash.get(d.id)
    if (!adds) return d
    const tiles = d.tiles.slice()
    for (const { index, tile } of [...adds].sort((a, b) => a.index - b.index)) {
      if (tiles.some((t) => t.id === tile.id)) continue
      tiles.splice(Math.min(index, tiles.length), 0, tile)
    }
    return { ...d, tiles }
  })
}

/* a three-dot kebab that lives inside a NavItem <button> — the trigger renders as a
   span so there's no nested button; clicks are stopped so they don't open the row. */
function Kebab({
  items,
  dash,
}: {
  items: { key: string; icon: IconName; label: string; filled?: boolean; danger?: boolean; onSelect?: () => void }[]
  dash?: boolean
}) {
  return (
    <Dropdown>
      <DropdownTrigger
        nativeButton={false}
        render={<span role="button" tabIndex={-1} aria-label="Options" />}
        className={cn("st-kebab", dash && "st-dash-kebab")}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        onPointerDown={(e: React.PointerEvent) => e.stopPropagation()}
      >
        <Icon name="dots-vertical" size={16} />
      </DropdownTrigger>
      <DropdownContent align="end">
        {items.map((it) => (
          <DropdownItem key={it.key} icon={it.icon} iconFilled={it.filled} danger={it.danger} onClick={it.onSelect}>
            {it.label}
          </DropdownItem>
        ))}
      </DropdownContent>
    </Dropdown>
  )
}

/* inline-rename row: a nav-row-shaped <div> (not a button) holding a text field.
   Enter / blur commits, Escape cancels. */
function EditRow({
  initial,
  leading,
  onCommit,
  onCancel,
}: {
  initial: string
  leading: React.ReactNode
  onCommit: (v: string) => void
  onCancel: () => void
}) {
  const [v, setV] = React.useState(initial)
  const ref = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [])
  return (
    <div className="flex min-h-9 items-center gap-2 rounded-lg [corner-shape:squircle] bg-[var(--ctl-hover)] px-2.5 py-2 shadow-[inset_0_0_0_1px_var(--ctl-outline)]">
      {leading}
      <input
        ref={ref}
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault()
            onCommit(v)
          } else if (e.key === "Escape") {
            onCancel()
          }
        }}
        onBlur={() => onCommit(v)}
        className="min-w-0 flex-1 border-none bg-transparent text-base leading-5 text-foreground outline-none"
      />
    </div>
  )
}

const navIconSlot = (icon: IconName) => (
  <span className="flex size-[17px] shrink-0 place-items-center text-[var(--ctl-icon)]">
    <Icon name={icon} size={17} stroke={1.75} />
  </span>
)

/* ---------------------------------------------------------------------------
   SaaS picker — demo chrome that loads a different type of SaaS into the
   workspace. Hidden when a deploy locks the demo to one preset, and while a
   chat is open (it would overlap the chat panel).
   --------------------------------------------------------------------------- */
function SaasPicker({
  activeId,
  onPick,
  hidden,
}: {
  activeId: string
  onPick: (id: string) => void
  hidden?: boolean
}) {
  const active = PRESETS[activeId]
  return (
    <div className={cn("st-saas-picker", hidden && "st-saas-picker--hidden")}>
      <span className="st-saas-picker__eyebrow">Load a SaaS</span>
      <Dropdown>
        <DropdownTrigger className="st-saas-picker__trigger group/saas">
          <Icon name={active.pickerIcon} size={17} stroke={1.75} className="text-[var(--ctl-icon)]" />
          <span className="st-saas-picker__label">{active.label}</span>
          <Icon
            name="chevron-down"
            size={16}
            className="text-muted-foreground transition-transform duration-200 group-data-[popup-open]/saas:rotate-180"
          />
        </DropdownTrigger>
        <DropdownContent align="end" side="top" className="min-w-[248px]">
          {PRESET_LIST.map((p) => (
            <DropdownItem
              key={p.id}
              icon={p.pickerIcon}
              onClick={() => onPick(p.id)}
              className={cn("py-2", p.id === activeId && "bg-[var(--ctl-hover)]")}
              trailing={p.status === "soon" ? <span className="st-saas-picker__soon">Soon</span> : null}
            >
              <span className="flex min-w-0 flex-col gap-0.5">
                <span className="font-semibold text-foreground">{p.label}</span>
                <span className="truncate text-xs font-normal text-muted-foreground">{p.tagline}</span>
              </span>
            </DropdownItem>
          ))}
        </DropdownContent>
      </Dropdown>
    </div>
  )
}

/* ---------------------------------------------------------------------------
   BOOT — resolve the deploy once: a client build (a pinned host, or the ?client=
   escape hatch) vs the public demo, plus the starting preset, the picker lock,
   and (public only) the visitor's saved skin. Branding is decided HERE, above the
   workspace, so a SaaS switch below can't touch it.
   --------------------------------------------------------------------------- */
const SKIN_KEY = "ol-demo-skin"

// Restore a saved public-mode skin choice, sanitized against the current lists (a
// key saved before a list changed falls back to the neutral default).
function readSavedSkin(): SkinChoice | null {
  try {
    const raw = window.localStorage.getItem(SKIN_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as Partial<SkinChoice>
    return {
      theme: typeof p.theme === "string" && p.theme in THEMES ? p.theme : NEUTRAL_SKIN.theme,
      font: typeof p.font === "string" && FONTS[p.font] ? p.font : NEUTRAL_SKIN.font,
      hex: typeof p.hex === "string" ? p.hex : "",
      dark: typeof p.dark === "boolean" ? p.dark : false,
      agentKey: typeof p.agentKey === "string" && AGENTS[p.agentKey] ? p.agentKey : NEUTRAL_SKIN.agentKey,
      customName: typeof p.customName === "string" ? p.customName : "",
      customRole: typeof p.customRole === "string" ? p.customRole : "",
      logoSrc: typeof p.logoSrc === "string" ? p.logoSrc : null,
    }
  } catch {
    return null
  }
}

const truthyParam = (v: string | null) => v != null && v !== "0" && v !== "false"

function resolveBoot() {
  const params = new URLSearchParams(window.location.search)
  // a client build forces its preset, locks the picker, and carries its own brand
  const client = resolveClient(window.location.hostname, params.get("client"))
  if (client) return { client, presetId: client.presetId, locked: true, initialSkin: NEUTRAL_SKIN, embedded: false }

  // public: ?saas= picks the preset, ?lock= just hides the picker (still public).
  // ?embed=1 wraps the demo in the marketing site's /demo page: the Customize
  // accordion is lifted OUT into a top toolbar (customize.tsx controls, driven
  // over postMessage), so the in-demo panel is hidden and the visitor's skin is
  // NOT persisted here — the host page is the source of truth. The SaaS picker
  // stays, so an embedded visitor can still switch SaaS types.
  const embedded = truthyParam(params.get("embed"))
  return {
    client: null as null,
    presetId: resolvePresetId(params.get("saas")),
    locked: truthyParam(params.get("lock")),
    initialSkin: embedded ? NEUTRAL_SKIN : readSavedSkin() ?? NEUTRAL_SKIN,
    embedded,
  }
}

export function Demo() {
  const boot = React.useMemo(resolveBoot, [])
  const isClient = boot.client != null

  // The skin lives HERE, above the preset remount, so switching SaaS never wipes
  // it. Public: interactive + persisted. Client: inert (the hook writes nothing);
  // the fixed brand is applied by the effect below instead. Embedded (/demo page):
  // interactive so the top toolbar can re-skin it live, but NOT persisted — the
  // host page owns the choice, this frame just applies what it's told.
  const skin = useSkinState(boot.initialSkin, {
    persistKey: isClient || boot.embedded ? undefined : SKIN_KEY,
    enabled: !isClient,
  })

  // client build: apply the fixed brand once (raw hex, its own tint + font, light)
  React.useEffect(() => {
    const c = boot.client
    if (!c) return
    applyTheme("", c.primary)
    applyFont(c.font)
    applyNeutralTint(c.neutralTint ?? complementaryNeutralTint(c.primary))
    document.documentElement.classList.remove("dark")
  }, [boot])

  const [activeId, setActiveId] = React.useState(boot.presetId)
  const preset = PRESETS[activeId] ?? PRESETS[DEFAULT_PRESET_ID]

  const pick = (id: string) => {
    setActiveId(id)
    const url = new URL(window.location.href)
    url.searchParams.set("saas", id)
    window.history.replaceState(null, "", url) // keep a reload / share on the same SaaS
  }

  // Embedded on the marketing /demo page: apply the skin + SaaS the host toolbar
  // posts down (both are lifted out of the demo into that toolbar), and announce
  // readiness on mount so the host re-pushes the current state. Uses only stable
  // setters, so it installs once. Accepts any origin (the frame only mutates its
  // own view; nothing sensitive is exposed).
  const { setTheme, setHex, setFont, setDark, setAgentKey } = skin
  React.useEffect(() => {
    if (!boot.embedded) return
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { source?: string; type?: string; skin?: Partial<SkinChoice>; saas?: string } | null
      if (!d || d.source !== "ol-demo-host") return
      if (d.type === "skin" && d.skin) {
        const s = d.skin
        if (typeof s.theme === "string") setTheme(s.theme)
        if (typeof s.hex === "string") setHex(s.hex)
        if (typeof s.font === "string") setFont(s.font)
        if (typeof s.dark === "boolean") setDark(s.dark)
        if (typeof s.agentKey === "string") setAgentKey(s.agentKey)
      } else if (d.type === "saas" && typeof d.saas === "string") {
        setActiveId(resolvePresetId(d.saas))
      }
    }
    window.addEventListener("message", onMsg)
    window.parent?.postMessage({ source: "ol-demo", type: "ready" }, "*")
    return () => window.removeEventListener("message", onMsg)
  }, [boot.embedded, setTheme, setHex, setFont, setDark, setAgentKey])

  // the resolved agent + avatar + logo, per mode. In public mode these track the
  // visitor's live Customize choices; in client mode they are the client record's.
  const agent = isClient ? boot.client!.agent : skin.agent
  const agentSrc = isClient ? boot.client!.agent.src : skin.agentSrc
  const brandLogo = isClient ? boot.client!.logo : undefined
  const brandName = isClient ? boot.client!.name : preset.brand.name
  // the content identity the analytics files read (generic sites in public, the
  // client's real portfolio in a client build; the agent tracks the resolved one)
  const identity: DemoIdentity = { sites: boot.client?.sites ?? DEFAULT_SITES, agent }

  // key on the preset id → each SaaS mounts fresh (its own seeds, refs). The skin
  // state + identity live ABOVE this key, so they survive the remount.
  return (
    <DemoWorkspace
      key={preset.id}
      preset={preset}
      locked={boot.locked}
      onPick={pick}
      identity={identity}
      agentSrc={agentSrc}
      brandLogo={brandLogo}
      brandName={brandName}
      skin={skin}
      showCustomize={!isClient && !boot.embedded}
      showSaasPicker={!boot.embedded}
      showAccount={!isClient}
    />
  )
}

/* ---------------------------------------------------------------------------
   DEMO WORKSPACE — the 4-column agent workspace, painted from a DemoPreset. The
   skin/identity/agent are resolved above (in Demo) and passed in; this component
   owns only per-SaaS content state, so remounting it on a switch keeps the skin.
   --------------------------------------------------------------------------- */
function DemoWorkspace({
  preset,
  locked,
  onPick,
  identity,
  agentSrc,
  brandLogo,
  brandName,
  skin,
  showCustomize,
  showSaasPicker,
  showAccount,
}: {
  preset: DemoPreset
  locked: boolean
  onPick: (id: string) => void
  identity: DemoIdentity
  agentSrc: string
  brandLogo?: string
  brandName: string
  skin: SkinState
  showCustomize: boolean
  showSaasPicker: boolean
  showAccount: boolean
}) {
  const AGENT = identity.agent
  const AV = agentSrc
  // only presets that render a dashboard view (analytics) make their collection
  // rows open-able; other presets keep the old behavior (a row is drag-target only)
  const supportsDashboards = preset.collection.seedDashboards != null

  const navItemsFlat = React.useMemo(() => preset.nav.flatMap((s) => s.items), [preset])

  const [navCollapsed, setNavCollapsed] = React.useState(false)
  const [subCollapsed, setSubCollapsed] = React.useState(false)
  const [workOpen, setWorkOpen] = React.useState(false)
  const [navSelected, setNavSelected] = React.useState(navItemsFlat[0]?.id ?? "")
  const [contextOpen, setContextOpen] = React.useState(false) // Context Engine section
  const [renamingId, setRenamingId] = React.useState<string | null>(null)

  // compact (<1024px) off-canvas drawers
  const [navOpen, setNavOpen] = React.useState(false)
  const [agentOpen, setAgentOpen] = React.useState(false)

  // data model (seeded from the preset). Analytics ships one fully-formed,
  // populated dashboard (seedDashboards); other presets fall back to their
  // name/count seeds mapped to empty-tile dashboards (name is a literal or a
  // client site resolved from the identity, so no site name is baked in).
  const [dashboards, setDashboards] = React.useState<Dashboard[]>(() =>
    preset.collection.seedDashboards
      ? preset.collection.seedDashboards()
      : preset.collection.seed.map((d) => ({
          id: d.id,
          name: d.name ?? identity.sites[d.siteIndex ?? 0]?.name ?? "",
          tiles: [],
          banners: [],
        }))
  )
  // the dashboard open in the content area (null = a nav / report view)
  const [selectedDashId, setSelectedDashId] = React.useState<string | null>(null)
  // the dashboard banner composer (opened from the content header); auto-closes
  // whenever the open dashboard changes
  const [bannerComposerOpen, setBannerComposerOpen] = React.useState(false)
  React.useEffect(() => setBannerComposerOpen(false), [selectedDashId])
  const [chats, setChats] = React.useState<Chat[]>(
    preset.seedRecentChats.map((c) => ({ ...c, history: "" }))
  )
  const [savedChats, setSavedChats] = React.useState<Chat[]>(
    preset.seedSavedChats.map((c) => ({ ...c, history: "", saved: true }))
  )
  const [activeId, setActiveId] = React.useState<string | null>(null)

  // staged card attachments in each composer (a dropped card waits for the user's send)
  const [launcherAtt, setLauncherAtt] = React.useState<Attachment[]>([])
  const [chatAtt, setChatAtt] = React.useState<Attachment[]>([])
  // a generated report open in the content area (from a chat's report CTA)
  const [activeReport, setActiveReport] = React.useState<{ id: string; name: string } | null>(null)

  // pin membership is DERIVED from the dashboards' tiles (a card is pinned iff a
  // dashboard holds a tile from it) — no separate pins map to keep in sync.
  const pinnedSourceIds = React.useMemo(
    () => new Set(dashboards.flatMap((d) => d.tiles.map((t) => t.sourceId))),
    [dashboards]
  )
  // which card the pin modal is acting on, and which modal the launcher renders
  const [pinSource, setPinSource] = React.useState<CardRef | null>(null)
  const [modalMode, setModalMode] = React.useState<"create" | "pin">("create")

  // cards attached anywhere (launcher or open chat) -> reflected as a filled paperclip
  const attachedIds = React.useMemo(
    () => new Set([...launcherAtt, ...chatAtt].map((a) => a.sourceId).filter(Boolean) as string[]),
    [launcherAtt, chatAtt]
  )

  // select a primary-nav item (also closes any open report / dashboard)
  const selectNav = (id: string) => {
    setNavSelected(id)
    setActiveReport(null)
    setSelectedDashId(null)
  }

  // refs
  const dockRef = React.useRef<HTMLDivElement>(null) // launcher docks to the content body
  const regionRef = React.useRef<HTMLDivElement>(null) // modal/blur region = the content column
  const dashGrpRef = React.useRef<HTMLDivElement>(null) // coach target: the collection group
  const actionsRef = React.useRef<HTMLDivElement>(null) // coach target: content actions
  const subSlotRef = React.useRef<HTMLSpanElement>(null) // travelling-avatar slot (agent-home header)
  const contentSlotRef = React.useRef<HTMLSpanElement>(null) // travelling-avatar landing slot (content header)
  const avRef = React.useRef<TravellingAvatarHandle | null>(null) // the shared travelling avatar's handle
  const launcherApi = React.useRef<LauncherApi | null>(null)
  const chatApi = React.useRef<ConversationHandle | null>(null)
  const seq = React.useRef(1)

  const findChat = (id: string | null) =>
    id ? chats.find((c) => c.id === id) || savedChats.find((c) => c.id === id) || null : null
  const activeChat = findChat(activeId)

  // stage a dropped / attached card as a composer attachment (dedupe by source; max 2)
  const stage = (prev: Attachment[], p: Attachment) =>
    prev.length >= 2 || prev.some((a) => (p.sourceId ? a.sourceId === p.sourceId : a.title === p.title))
      ? prev
      : [...prev, p]

  /* ---- PIN / ATTACH: the card-footer actions. Pin opens the launcher's pin modal
     (a dashboard picker); confirming drops a TILE built from the card onto each
     chosen dashboard (so the board fills with the real card). Attach stages the
     card onto the launcher for a NEW chat. Both are toggles: a filled pin un-pins
     (removes the card's tiles everywhere), a filled paperclip un-attaches. ---- */
  const openCreateModal = () => {
    flushSync(() => setModalMode("create"))
    launcherApi.current?.openModal()
  }
  const openPinModal = (card: CardRef) => {
    // flip to pin mode + remember the source BEFORE the morph, so the engine measures
    // the pin body's height (the modal content is React-rendered)
    flushSync(() => {
      setPinSource(card)
      setModalMode("pin")
    })
    launcherApi.current?.openModal()
  }
  const applyPin = (card: CardRef, names: string[]) =>
    setDashboards((prev) =>
      prev.map((d) =>
        // add a tile only to chosen dashboards that don't already hold this card
        names.includes(d.name) && !d.tiles.some((t) => t.sourceId === card.id)
          ? { ...d, tiles: [...d.tiles, makeTileFromCard(card)] }
          : d
      )
    )
  const pinConfirm = (names: string[]) => {
    if (pinSource) applyPin(pinSource, names)
    setPinSource(null)
  }
  // the "pin deleted" toast (neutral tone) with an Undo that restores the removed
  // tiles to their boards, if clicked before the 4s notif dismisses
  const notifyPinDeleted = (desc: string, restore: () => void) =>
    launcherApi.current?.showNotification("Pin deleted", desc, {
      tone: "neutral",
      actionLabel: "Undo",
      onAction: restore,
    })

  // un-pin a card from EVERY dashboard (its filled pin in any content view). Capture
  // what's removed (per board, with position) first, so Undo can put it all back.
  const unpinCard = (id: string) => {
    const removed: RemovedTile[] = []
    dashboards.forEach((d) => d.tiles.forEach((t, i) => t.sourceId === id && removed.push({ dashId: d.id, index: i, tile: t })))
    if (!removed.length) return
    setDashboards((prev) => prev.map((d) => ({ ...d, tiles: d.tiles.filter((t) => t.sourceId !== id) })))
    const boards = new Set(removed.map((r) => r.dashId))
    const name = dashboards.find((d) => d.id === removed[0].dashId)?.name
    const desc = boards.size === 1 ? `Removed from the ${name} dashboard` : `Removed from ${boards.size} dashboards`
    notifyPinDeleted(desc, () => setDashboards((prev) => reinsertTiles(prev, removed)))
  }
  const toggleAttach = (card: CardRef) => {
    if (launcherAtt.some((a) => a.sourceId === card.id)) {
      setLauncherAtt((prev) => prev.filter((a) => a.sourceId !== card.id))
      return
    }
    if (chatAtt.some((a) => a.sourceId === card.id)) {
      setChatAtt((prev) => prev.filter((a) => a.sourceId !== card.id))
      return
    }
    setLauncherAtt((prev) => stage(prev, { title: card.title, accent: card.accent, sourceId: card.id }))
    launcherApi.current?.openInput()
  }
  // the pin-picker's "New Dashboard" row: swap the open modal to create mode in place
  const switchToCreate = () => {
    flushSync(() => setModalMode("create"))
    launcherApi.current?.relayout()
  }

  const cardActions: CardActionsValue = {
    isPinned: (id) => pinnedSourceIds.has(id),
    isAttached: (id) => attachedIds.has(id),
    onPin: openPinModal,
    onUnpin: unpinCard,
    onToggleAttach: toggleAttach,
  }

  /* ---- DASHBOARDS: select one to open it in the content area; its grid /
     banners / comments mutate through these handlers (all scoped to the open
     dashboard). ---- */
  const selectedDash = React.useMemo(() => dashboards.find((d) => d.id === selectedDashId) ?? null, [dashboards, selectedDashId])
  const selectDashboard = (id: string) => {
    if (!supportsDashboards) return
    setSelectedDashId(id)
    setActiveReport(null)
  }
  const patchDash = (id: string, fn: (d: Dashboard) => Dashboard) =>
    setDashboards((prev) => prev.map((d) => (d.id === id ? fn(d) : d)))
  const patchTile = (dashId: string, tileId: string, fn: (t: Dashboard["tiles"][number]) => Dashboard["tiles"][number]) =>
    patchDash(dashId, (d) => ({ ...d, tiles: d.tiles.map((t) => (t.id === tileId ? fn(t) : t)) }))
  const dashboardHandlers: DashboardHandlers = {
    onReorder: (tiles) => selectedDashId && patchDash(selectedDashId, (d) => ({ ...d, tiles })),
    onResize: (tileId, size) => selectedDashId && patchTile(selectedDashId, tileId, (t) => ({ ...t, size })),
    onUnpinTile: (tileId) => {
      if (!selectedDashId) return
      const dash = dashboards.find((d) => d.id === selectedDashId)
      const index = dash ? dash.tiles.findIndex((t) => t.id === tileId) : -1
      if (!dash || index < 0) return
      const removed: RemovedTile[] = [{ dashId: dash.id, index, tile: dash.tiles[index] }]
      patchDash(selectedDashId, (d) => ({ ...d, tiles: d.tiles.filter((t) => t.id !== tileId) }))
      notifyPinDeleted(`Removed from ${dash.name}`, () => setDashboards((prev) => reinsertTiles(prev, removed)))
    },
    onAddComment: (tileId, text) =>
      selectedDashId &&
      patchTile(selectedDashId, tileId, (t) => ({
        ...t,
        comments: [...t.comments, { id: nextId("c"), author: "Bal Sieber", me: true, text, time: "now" }],
        unread: false,
      })),
    onMarkRead: (tileId) => selectedDashId && patchTile(selectedDashId, tileId, (t) => ({ ...t, unread: false })),
    onAddBanner: (b) => selectedDashId && patchDash(selectedDashId, (d) => ({ ...d, banners: [...d.banners, { id: nextId("banner"), ...b }] })),
    onRemoveBanner: (bid) => selectedDashId && patchDash(selectedDashId, (d) => ({ ...d, banners: d.banners.filter((x) => x.id !== bid) })),
  }

  // the shared handles a preset's render slots may reach into (rebuilt per render
  // so navSelected stays live for the content body's view switching)
  const ctx: DemoContext = {
    navSelected,
    activeReport,
    selectedDash,
    dashboardHandlers,
    bannerComposerOpen,
    openBannerComposer: () => setBannerComposerOpen(true),
    closeBannerComposer: () => setBannerComposerOpen(false),
    openSaveModal: openCreateModal,
    launcher: launcherApi,
    actionsRef,
    regionRef,
    dockRef,
    cardActions,
  }

  /* ---- the travelling agent avatar rides to the new active slot on collapse
     itself; the Demo only asks it to FOLLOW the moving slot on the OTHER layout
     shifts (nav collapse / chat open) ---- */
  const firstShift = React.useRef(true)
  React.useEffect(() => {
    if (firstShift.current) {
      firstShift.current = false
      return
    }
    avRef.current?.follow(440)
  }, [navCollapsed, workOpen])

  /* ---- the live conversation (host-driven): the renderer emits the user turn
     (with any dropped-card attachments), then the preset scripts the reply ---- */
  const startConversation = (text: string, attachments?: Attachment[]) => {
    const api = chatApi.current
    if (!api) return
    api.clear()
    api.user(text, attachments)
    preset.conversation.respond(api, text, {
      // a report replaces the content: clear any open dashboard so it shows
      openReport: (id, name) => {
        setSelectedDashId(null)
        setActiveReport({ id, name })
      },
    })
  }

  const saveActive = () => {
    const api = chatApi.current
    if (!activeId || !api) return
    const html = api.snapshot()
    const patch = (c: Chat) => (c.id === activeId ? { ...c, history: html } : c)
    setChats((prev) => prev.map(patch))
    setSavedChats((prev) => prev.map(patch))
  }

  const openChatSurface = () => {
    setNavCollapsed(true)
    setNavOpen(false)
    setAgentOpen(false)
  }

  const handleNewChat = (text: string, attachments?: Attachment[]) => {
    saveActive()
    const title = text.trim() ? summarize(text) : attachments?.[0]?.title ? summarize(attachments[0].title) : "New chat"
    const c: Chat = { id: "chat-" + seq.current++, title, firstText: text, history: "" }
    setChats((prev) => [c, ...prev])
    setActiveId(c.id)
    const wasClosed = !workOpen
    openChatSurface()
    setWorkOpen(true)
    setLauncherAtt([]) // these are being consumed by this send
    const build = () => startConversation(text, attachments)
    if (wasClosed) window.setTimeout(build, 460)
    else build()
  }

  const openChat = (id: string) => {
    const c = findChat(id)
    if (!c) return
    if (id === activeId && workOpen) return
    if (id !== activeId) saveActive()
    setActiveId(id)
    const wasClosed = !workOpen
    openChatSurface()
    setWorkOpen(true)
    const load = () => {
      const api = chatApi.current
      if (!api) return
      if (c.history) api.restore(c.history)
      else startConversation(c.firstText || c.title)
    }
    if (wasClosed) window.setTimeout(load, 460)
    else load()
  }

  const closeChat = () => {
    saveActive()
    setWorkOpen(false)
    setActiveId(null)
    setChatAtt([])
  }

  // save / un-save / rename / archive operate on a specific id (a kebab can't rely on
  // activeId — it would be set in the same tick and read stale)
  const saveChat = (id: string) => {
    const c = findChat(id)
    if (!c || c.saved) return
    setChats((prev) => prev.filter((x) => x.id !== id))
    setSavedChats((prev) => [{ ...c, saved: true }, ...prev])
  }
  const unsaveChat = (id: string) => {
    const c = findChat(id)
    if (!c || !c.saved) return
    setSavedChats((prev) => prev.filter((x) => x.id !== id))
    setChats((prev) => [{ ...c, saved: false }, ...prev])
  }
  const renameChat = (id: string, title: string) => {
    const t = title.trim()
    setRenamingId(null)
    if (!t) return
    const patch = (c: Chat) => (c.id === id ? { ...c, title: t } : c)
    setChats((prev) => prev.map(patch))
    setSavedChats((prev) => prev.map(patch))
  }
  const archiveChat = (id: string) => {
    setChats((prev) => prev.filter((x) => x.id !== id))
    setSavedChats((prev) => prev.filter((x) => x.id !== id))
    if (activeId === id) {
      setWorkOpen(false)
      setActiveId(null)
    }
  }
  const renameDashboard = (id: string, name: string) => {
    const t = name.trim()
    setRenamingId(null)
    if (!t) return
    setDashboards((prev) => prev.map((d) => (d.id === id ? { ...d, name: t } : d)))
  }
  const archiveDashboard = (id: string) => {
    setDashboards((prev) => prev.filter((d) => d.id !== id))
    if (selectedDashId === id) setSelectedDashId(null)
  }

  const handleOption = (act: ChatPanelOption) => {
    if (!activeId) return
    if (act === "save") saveChat(activeId)
    else if (act === "unsave") unsaveChat(activeId)
    else if (act === "rename") setRenamingId(activeId)
    else if (act === "archive") archiveChat(activeId)
  }

  /* ---- Save-to-collection: the launcher modal -> saving -> green notif -> row.
     A brand-new dashboard starts empty (no chip) until cards are pinned; we open
     it straight away so the user lands on the empty board ready to fill. ---- */
  const handleSaveDashboard = (name: string) => {
    const id = nextId("dash")
    setDashboards((prev) => [{ id, name, tiles: [], banners: [] }, ...prev])
    if (supportsDashboards) {
      setActiveReport(null)
      setSelectedDashId(id)
    }
  }

  /* ---- drag-to-launcher: a dropped card STAGES as an attachment in the launcher
     composer (new chat) or the open chat (follow-up), or pins to a collection row.
     The user then writes their message and sends — the drop never auto-sends. ---- */
  const dragCb: DragCallbacks = {
    onDropLauncher: (p) => {
      setLauncherAtt((prev) => stage(prev, p))
      launcherApi.current?.openInput()
    },
    onDropDashboard: (_id, name, p) => {
      // dropping a card on a dashboard row IS a pin (fills the card's pin + drops
      // the real tile onto that board, carried in the drag payload)
      if (p.sourceId) applyPin({ id: p.sourceId, title: p.title, accent: p.accent, tile: p.tile as TileDescriptor | undefined }, [name])
      launcherApi.current?.showNotification("New pin created", `Pinned to the ${name || "dashboard"} dashboard`)
    },
    onDropChat: (p) => setChatAtt((prev) => stage(prev, p)),
    launcher: launcherApi,
  }

  // map the preset's coach copy onto the shared refs it points at
  const coachRefs: Record<string, React.RefObject<HTMLDivElement | null>> = {
    collection: dashGrpRef,
    actions: actionsRef,
  }
  const coaches: CoachTarget[] = preset.coaches.map((c) => ({
    ref: coachRefs[c.target],
    side: c.side,
    title: c.title,
    desc: c.desc,
  }))

  const chatKebab = (c: Chat) => (
    <Kebab
      items={
        c.saved
          ? [
              { key: "unsave", icon: "bookmark", label: "Un-save chat", filled: true, onSelect: () => unsaveChat(c.id) },
              { key: "rename", icon: "pencil", label: "Rename", onSelect: () => setRenamingId(c.id) },
              { key: "archive", icon: "archive", label: "Archive", danger: true, onSelect: () => archiveChat(c.id) },
            ]
          : [
              { key: "save", icon: "bookmark", label: "Save chat", onSelect: () => saveChat(c.id) },
              { key: "rename", icon: "pencil", label: "Rename", onSelect: () => setRenamingId(c.id) },
              { key: "archive", icon: "archive", label: "Archive", danger: true, onSelect: () => archiveChat(c.id) },
            ]
      }
    />
  )

  const chatRow = (c: Chat) =>
    renamingId === c.id ? (
      <EditRow
        key={c.id}
        initial={c.title}
        leading={<span className="st-chat-dot" />}
        onCommit={(v) => renameChat(c.id, v)}
        onCancel={() => setRenamingId(null)}
      />
    ) : (
      <NavItem
        key={c.id}
        leading={<span className="st-chat-dot" />}
        current={activeId === c.id}
        onClick={() => openChat(c.id)}
        tail={chatKebab(c)}
      >
        {c.title}
      </NavItem>
    )

  const HeaderActions = preset.content.HeaderActions
  const ContentBody = preset.content.Body
  const currentNav = navItemsFlat.find((i) => i.id === navSelected) // drives the content-header title + icon
  // an open dashboard or report overrides the nav view for the header title + icon
  const headerIcon: IconName = selectedDash ? "layout-dashboard" : activeReport ? "file-text" : currentNav?.icon ?? preset.content.icon
  const headerTitle = selectedDash ? selectedDash.name : activeReport ? activeReport.name : currentNav?.label ?? preset.content.title
  // a dashboard / report is a DIFFERENT view than any nav item, so no primary-nav
  // row is "current" while one is open
  const navActive = !selectedDash && !activeReport

  return (
    <DemoIdentityProvider value={identity}>
    <DragProvider cb={dragCb}>
      <WorkspaceShell
        navCollapsed={navCollapsed}
        subCollapsed={subCollapsed}
        workOpen={workOpen}
        navOpen={navOpen}
        agentOpen={agentOpen}
        onNavOpenChange={setNavOpen}
        onAgentOpenChange={setAgentOpen}
        onResize={() => {
          launcherApi.current?.relayout()
          avRef.current?.travel(0)
        }}
        /* ===================== COLUMN 1: primary nav ===================== */
        primaryNav={
          <LayoutColumn as="aside" variant="card">
            <ColumnHeader className={cn("gap-2.5", navCollapsed ? "justify-center" : "pr-3 pl-5")}>
              {!navCollapsed && (
                <BrandMark mark={preset.brand.mark} logo={brandLogo}>
                  {brandName}
                </BrandMark>
              )}
              <IconButton
                icon={navCollapsed ? "chevrons-right" : "chevrons-left"}
                motion={navCollapsed ? "arrow-right" : "arrow-left"}
                className={cn(!navCollapsed && "ml-auto")}
                aria-label={navCollapsed ? "Expand navigation" : "Collapse navigation"}
                onClick={() => setNavCollapsed((c) => !c)}
              />
            </ColumnHeader>

            <ColumnBody>
              {navCollapsed ? (
                <div className="flex flex-col items-center gap-0.5">
                  {navItemsFlat.map((it) => (
                    <NavItem
                      key={it.id}
                      icon={it.icon}
                      collapsed
                      title={it.label}
                      current={navActive && navSelected === it.id}
                      onClick={() => selectNav(it.id)}
                    >
                      {it.label}
                    </NavItem>
                  ))}
                </div>
              ) : (
                preset.nav.map((section, i) => (
                  <CollapsibleSection
                    key={section.label}
                    label={section.label}
                    count={section.count}
                    className={i > 0 ? "mt-2" : undefined}
                  >
                    <NavList>
                      {section.items.map((it) => (
                        <NavItem
                          key={it.id}
                          icon={it.icon}
                          current={navActive && navSelected === it.id}
                          onClick={() => selectNav(it.id)}
                          tail={it.badge ? <Chip variant="new">{it.badge.text}</Chip> : undefined}
                        >
                          {it.label}
                        </NavItem>
                      ))}
                    </NavList>
                  </CollapsibleSection>
                ))
              )}
            </ColumnBody>

            <ColumnFooter className={cn("flex flex-col gap-0.5 pt-3 pb-4", navCollapsed ? "items-center px-3" : "px-4")}>
              <NavItem icon="book-2" collapsed={navCollapsed} title="Education">
                Education
              </NavItem>
              <NavItem
                icon="settings"
                collapsed={navCollapsed}
                title="Settings"
                tail={
                  <span className="st-badge">
                    <span className="st-badge__dot" />
                    Online
                  </span>
                }
              >
                Settings
              </NavItem>
              {showAccount && (
                <AccountCard name="Bal Sieber" email="bal@onboardingloop.ai" initials="ME" online collapsed={navCollapsed} />
              )}
            </ColumnFooter>
          </LayoutColumn>
        }
        /* ===================== COLUMN 2: agent home (sub nav) ===================== */
        agentHome={
          <LayoutColumn as="aside" variant="card">
            <AgentHomeHeader
              name={AGENT.name}
              role={AGENT.role}
              avatarSrc={AV}
              slotRef={subSlotRef}
              onCollapse={() => setSubCollapsed(true)}
            >
              {/* Context Engine lives inside the gray header; opening it grows the header */}
              <CollapsibleSection
                label={preset.contextEngine.label}
                count={preset.contextEngine.items.length}
                collapsed={!contextOpen}
                onCollapsedChange={(c) => setContextOpen(!c)}
                organize={() => {}}
              >
                <NavList>
                  {preset.contextEngine.items.map((it) => (
                    <NavItem key={it.label} icon={it.icon} tail={<Chip>{it.count}</Chip>}>
                      {it.label}
                    </NavItem>
                  ))}
                </NavList>
              </CollapsibleSection>
              {contextOpen && (
                <Button variant="secondary" className="mt-2.5 w-full justify-center">
                  Add Context
                </Button>
              )}
              {/* Customize — the same live re-skin accordion the styleguide wears,
                  a second CollapsibleSection alongside Context Engine. Public only:
                  a client build applies a fixed brand and never renders it. */}
              {showCustomize && <CustomizePanel skin={skin} className="mt-2" />}
            </AgentHomeHeader>

            {/* New Dashboard — opens the create-dashboard modal, just below the header.
                Secondary CTA (matches "Add Context"); the gap below it (to the first
                sub-nav group) equals the gap above it (to the header divider) = 16px. */}
            <div className="flex-none px-4 pt-4">
              <Button variant="secondary" className="w-full justify-center" onClick={openCreateModal}>
                New Dashboard
              </Button>
            </div>

            <ColumnBody>
              <div className="st-sub__grp" ref={dashGrpRef}>
                <CollapsibleSection label={preset.collection.label} count={dashboards.length} organize={() => {}}>
                  <NavList>
                    {dashboards.map((d) =>
                      renamingId === d.id ? (
                        <EditRow
                          key={d.id}
                          initial={d.name}
                          leading={navIconSlot(preset.collection.itemIcon)}
                          onCommit={(v) => renameDashboard(d.id, v)}
                          onCancel={() => setRenamingId(null)}
                        />
                      ) : (
                        <NavItem
                          key={d.id}
                          icon={preset.collection.itemIcon}
                          data-drop="dashboard"
                          data-dash-id={d.id}
                          data-dash-name={d.name}
                          current={selectedDashId === d.id}
                          onClick={supportsDashboards ? () => selectDashboard(d.id) : undefined}
                          tail={
                            <span className="st-row-tail">
                              {d.tiles.length > 0 && <Chip variant="new">{d.tiles.length}</Chip>}
                              <Kebab
                                dash
                                items={[
                                  { key: "edit", icon: "pencil", label: "Rename", onSelect: () => setRenamingId(d.id) },
                                  { key: "versions", icon: "copy", label: "Versions" },
                                  { key: "archive", icon: "archive", label: "Archive", danger: true, onSelect: () => archiveDashboard(d.id) },
                                ]}
                              />
                            </span>
                          }
                        >
                          {d.name}
                        </NavItem>
                      )
                    )}
                  </NavList>
                </CollapsibleSection>
              </div>

              <div className="st-sub__grp">
                <CollapsibleSection label="Saved Chats" count={savedChats.length}>
                  <NavList>{savedChats.map(chatRow)}</NavList>
                </CollapsibleSection>
              </div>

              <div className="st-sub__grp">
                <CollapsibleSection label="Recent Chats" count={chats.length}>
                  <NavList>{chats.map(chatRow)}</NavList>
                </CollapsibleSection>
              </div>
            </ColumnBody>
          </LayoutColumn>
        }
        /* ===================== COLUMN 3: content ===================== */
        content={
          <LayoutColumn as="main" variant="canvas" ref={regionRef}>
            <ColumnHeader hairline={false} className="st-content__hdr">
              <AgentDrawerButton
                src={AV}
                aria-label={`Open ${AGENT.name}`}
                onClick={() => { setAgentOpen((o) => !o); setNavOpen(false) }}
              />
              <span className="ws-agent-slot" ref={contentSlotRef} />
              <span className="st-content__hdricon">
                <Icon name={headerIcon} size={20} stroke={1.5} />
              </span>
              <ColumnTitle>{headerTitle}</ColumnTitle>

              <div className="st-content__actions" ref={actionsRef}>
                {HeaderActions && <HeaderActions ctx={ctx} />}
              </div>

              <HamburgerButton onClick={() => { setNavOpen((o) => !o); setAgentOpen(false) }} />
            </ColumnHeader>

            {/* the docked launcher travels up from bottom-centre of this body; a
                preset's Body fills it (empty today — the content pass lands here) */}
            <div className="st-content__body" ref={dockRef}>
              {ContentBody && <ContentBody ctx={ctx} />}
            </div>
          </LayoutColumn>
        }
        /* ===================== COLUMN 4: AI chat ===================== */
        chat={
          <LayoutColumn as="aside" variant="card" data-drop={workOpen ? "chat" : undefined}>
            {workOpen && (
              <ChatPanel
                agent={{ avatar: AV, name: AGENT.name, role: AGENT.role }}
                title={activeChat?.title ?? "New chat"}
                saved={activeChat?.saved}
                onClose={closeChat}
                onSend={(t) => {
                  chatApi.current?.user(t, chatAtt)
                  chatApi.current?.think("Got it, let me pull that together for you.", { loops: 1 })
                  setChatAtt([])
                }}
                attachments={chatAtt}
                onRemoveAttachment={(i) => setChatAtt((prev) => prev.filter((_, idx) => idx !== i))}
                onOption={handleOption}
                apiRef={chatApi}
              />
            )}
          </LayoutColumn>
        }
      />

      {/* the ONE travelling agent avatar (desktop): the shared floating PNG that rides
          between the agent-home header and the content header on collapse */}
      <TravellingAgentAvatar
        ref={avRef}
        src={AV}
        alt={`${AGENT.name}, the agent`}
        collapsed={subCollapsed}
        openSlotRef={subSlotRef}
        collapsedSlotRef={contentSlotRef}
        onReopen={() => setSubCollapsed(false)}
      />

      {/* the launcher: one fixed card + floating PNG, six morph states + coach spotlight */}
      <Launcher
        agentName={AGENT.name}
        avatarSrc={AV}
        dockRef={dockRef}
        regionRef={regionRef}
        coaches={coaches}
        accessOptions={preset.accessOptions}
        modalMode={modalMode}
        dashboards={dashboards}
        onPinConfirm={pinConfirm}
        onSwitchToCreate={switchToCreate}
        attachments={launcherAtt}
        onRemoveAttachment={(i) => setLauncherAtt((prev) => prev.filter((_, idx) => idx !== i))}
        onNewChat={handleNewChat}
        onSaveDashboard={handleSaveDashboard}
        onReady={(api) => {
          launcherApi.current = api
          // dev-only test seam (headless can't open base-ui select popups)
          if (import.meta.env.DEV) (window as unknown as { __launcher?: LauncherApi | null }).__launcher = api
        }}
      />

      {/* demo chrome: switch which SaaS is loaded (hidden when locked or mid-chat) */}
      {!locked && showSaasPicker && <SaasPicker activeId={preset.id} onPick={onPick} hidden={workOpen} />}
    </DragProvider>
    </DemoIdentityProvider>
  )
}
