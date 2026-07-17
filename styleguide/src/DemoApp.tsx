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
import { applySkin } from "./skins"
import { PRESET_LIST, PRESETS, DEFAULT_PRESET_ID, resolvePresetId } from "./presets"
import type { DemoPreset, DemoContext } from "./presets/types"
import { DragProvider, type DragCallbacks } from "./drag"
import type { Attachment } from "@/components/product/attach-chip"
import type { CardRef, CardActionsValue } from "./presets/analytics-ui"

// ============================================================
// DEMO — the design system + the agent in action (the full-viewport workspace).
// This is where we SEE the system: assembled ENTIRELY from the real DS
// components, so editing a component (here or in the design system) propagates
// to both — no drift.
//
// The demo is a SINGLE renderer (<DemoWorkspace>) that loads any "type of SaaS"
// from a DemoPreset (presets/*): Analytics (Heatmap), Project Mgmt, Health,
// Finance, CRM. The renderer owns all app STATE + behavior (chats, collection
// rows, launcher, travelling avatar); the preset supplies only CONTENT + a Skin.
// A visitor flips between presets with the SaaS picker; a deploy can lock to one
// (the Heatmap client link → ?saas=analytics&lock=1).
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
   DEMO — top-level entry. Reads ?saas= / ?lock= from the URL, holds the active
   preset, and remounts the workspace on switch (a clean slate + skin per SaaS).
   --------------------------------------------------------------------------- */
function readParams() {
  const p = new URLSearchParams(window.location.search)
  const lock = p.get("lock")
  return {
    id: resolvePresetId(p.get("saas")),
    locked: lock != null && lock !== "0" && lock !== "false",
  }
}

export function Demo() {
  const initial = React.useMemo(readParams, [])
  const [activeId, setActiveId] = React.useState(initial.id)
  const preset = PRESETS[activeId] ?? PRESETS[DEFAULT_PRESET_ID]

  const pick = (id: string) => {
    setActiveId(id)
    const url = new URL(window.location.href)
    url.searchParams.set("saas", id)
    window.history.replaceState(null, "", url) // keep a reload / share on the same SaaS
  }

  // key on the preset id → each SaaS mounts fresh (its own seeds, skin, refs)
  return <DemoWorkspace key={preset.id} preset={preset} locked={initial.locked} onPick={pick} />
}

/* ---------------------------------------------------------------------------
   DEMO WORKSPACE — the 4-column agent workspace, painted from a DemoPreset.
   --------------------------------------------------------------------------- */
function DemoWorkspace({
  preset,
  locked,
  onPick,
}: {
  preset: DemoPreset
  locked: boolean
  onPick: (id: string) => void
}) {
  const AGENT = preset.skin.agent
  const AV = AGENT.src

  // apply this preset's skin (brand color / font / neutral tint) on mount
  React.useEffect(() => {
    applySkin(preset.skin)
  }, [preset])

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

  // data model (seeded from the preset)
  const [dashboards, setDashboards] = React.useState(preset.collection.seed.map((d) => ({ ...d })))
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

  // pin state: cardId -> the dashboard names it's pinned to (empty/absent = unpinned)
  const [pins, setPins] = React.useState<Record<string, string[]>>({})
  // which card the pin modal is acting on, and which modal the launcher renders
  const [pinSource, setPinSource] = React.useState<CardRef | null>(null)
  const [modalMode, setModalMode] = React.useState<"create" | "pin">("create")

  // cards attached anywhere (launcher or open chat) -> reflected as a filled paperclip
  const attachedIds = React.useMemo(
    () => new Set([...launcherAtt, ...chatAtt].map((a) => a.sourceId).filter(Boolean) as string[]),
    [launcherAtt, chatAtt]
  )

  // select a primary-nav item (also closes any open report)
  const selectNav = (id: string) => {
    setNavSelected(id)
    setActiveReport(null)
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
     (a dashboard picker); confirming bumps the chosen dashboards' pinned-count and
     fills the card's pin. Attach stages the card onto the launcher for a NEW chat.
     Both are toggles: a filled pin un-pins, a filled paperclip un-attaches. ---- */
  const bumpDashboards = (names: string[], delta: number) =>
    setDashboards((prev) =>
      prev.map((d) => (names.includes(d.name) ? { ...d, count: Math.max(0, d.count + delta) } : d))
    )

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
  const applyPin = (card: CardRef, names: string[]) => {
    // only bump dashboards this card isn't already pinned to (a drag re-pin is idempotent)
    const existing = pins[card.id] || []
    const added = names.filter((n) => !existing.includes(n))
    if (!added.length) return
    setPins((prev) => ({ ...prev, [card.id]: [...(prev[card.id] || []), ...added] }))
    bumpDashboards(added, +1)
  }
  const pinConfirm = (names: string[]) => {
    if (pinSource) applyPin(pinSource, names)
    setPinSource(null)
  }
  const unpinCard = (id: string) => {
    const names = pins[id]
    if (names?.length) bumpDashboards(names, -1)
    setPins((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
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
    isPinned: (id) => !!pins[id]?.length,
    isAttached: (id) => attachedIds.has(id),
    onPin: openPinModal,
    onUnpin: unpinCard,
    onToggleAttach: toggleAttach,
  }

  // the shared handles a preset's render slots may reach into (rebuilt per render
  // so navSelected stays live for the content body's view switching)
  const ctx: DemoContext = {
    navSelected,
    activeReport,
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
      openReport: (id, name) => setActiveReport({ id, name }),
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
  const archiveDashboard = (id: string) => setDashboards((prev) => prev.filter((d) => d.id !== id))

  const handleOption = (act: ChatPanelOption) => {
    if (!activeId) return
    if (act === "save") saveChat(activeId)
    else if (act === "unsave") unsaveChat(activeId)
    else if (act === "rename") setRenamingId(activeId)
    else if (act === "archive") archiveChat(activeId)
  }

  /* ---- Save-to-collection: the launcher modal -> saving -> green notif -> row.
     A brand-new dashboard starts empty (count 0, no chip) until cards are pinned. ---- */
  const handleSaveDashboard = (name: string) => {
    setDashboards((prev) => [{ id: "dash-" + seq.current++, name, count: 0 }, ...prev])
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
      // dropping a card on a dashboard row IS a pin (fills the card's pin too)
      if (p.sourceId) applyPin({ id: p.sourceId, title: p.title, accent: p.accent }, [name])
      else bumpDashboards([name], +1)
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
  // an open report overrides the nav view for the content-header title + icon
  const headerIcon: IconName = activeReport ? "file-text" : currentNav?.icon ?? preset.content.icon
  const headerTitle = activeReport ? activeReport.name : currentNav?.label ?? preset.content.title

  return (
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
              {!navCollapsed && <BrandMark mark={preset.brand.mark}>{preset.brand.name}</BrandMark>}
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
                      current={navSelected === it.id}
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
                          current={navSelected === it.id}
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
              <AccountCard name="Bal Sieber" email="bal@onboardingloop.ai" initials="ME" online collapsed={navCollapsed} />
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
            </AgentHomeHeader>

            {/* New Dashboard — opens the create-dashboard modal, just below the header */}
            <div className="flex-none px-4 pt-4 pb-1.5">
              <Button variant="tertiary" revealIcon="plus" className="w-full justify-center" onClick={openCreateModal}>
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
                          tail={
                            <span className="st-row-tail">
                              {d.count > 0 && <Chip variant="new">{d.count}</Chip>}
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
              {activeReport && (
                <IconButton
                  icon="x"
                  motion="rotate"
                  aria-label="Close report"
                  className="ml-1"
                  onClick={() => setActiveReport(null)}
                />
              )}

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
      {!locked && <SaasPicker activeId={preset.id} onPick={onPick} hidden={workOpen} />}
    </DragProvider>
  )
}
