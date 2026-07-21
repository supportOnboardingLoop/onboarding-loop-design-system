import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon } from "../base/icon"
import { Input } from "../base/input"
import { Button } from "../base/button"
import { Dropdown, DropdownTrigger, DropdownContent, DropdownCheckItem, DropdownItem } from "./dropdown"
import { Choices } from "./choices"
import { AttachChip, type Attachment } from "./attach-chip"
import { createLauncher, type LauncherApi, type LauncherState } from "./launcher-engine"

// ============================================================
// The agent LAUNCHER — the entry point to the agent-led layer.
// ONE fixed card + one persistent floating agent PNG that MORPH between six
// states (default / input / modal / saving / notif / coach). React renders all
// six blocks (with real DS components inside); launcher-engine.ts owns the
// imperative FLIP geometry + build-in/out sequencing + spotlight (mirrors the
// convo-engine / conversation.tsx split). Foundational build-out/in law: one
// element, one motion — never separate elements that swap or jump.
// ============================================================

// The resting-pill CONTENT — "Ask <agent>" (or a custom `label`) + a ⌘K hint.
// SHARED by the standalone LauncherPill and the full Launcher's default state, so
// the resting pill can never drift between them: one markup, one set of classes
// (styled in launcher.css) → one font, and one flexible content model. `label`
// overrides "Ask <agent>" entirely (the pill isn't always "Ask <name>"); `seq`
// tags the parts for the full Launcher's engine build-in/out sequencing. Because
// the engine measures this content's width, any label just sizes the pill to fit.
function LauncherResting({
  agentName,
  label,
  kbd = "⌘K",
  seq,
}: {
  agentName?: string
  label?: React.ReactNode
  kbd?: string
  seq?: boolean
}) {
  const seqAttr = seq ? { "data-seq": true } : {}
  return (
    <span className="launcher__cta">
      <span className="launcher__ask" {...seqAttr}>
        {label ?? `Ask ${agentName ?? ""}`.trim()}
      </span>
      {kbd ? (
        <span className="launcher__kbd" {...seqAttr}>
          {kbd}
        </span>
      ) : null}
    </span>
  )
}

// The resting pill on its own — the DEFAULT state as a static, standalone
// component (docked bottom-centre of a content area). The full morph machine is
// <Launcher> below; this is handy where only the resting entry point is wanted.
// Both render <LauncherResting>, so they stay identical.
function LauncherPill({
  agentName = "Bal",
  avatarSrc,
  kbd = "⌘K",
  label,
  className,
  ...props
}: React.ComponentProps<"button"> & { agentName?: string; avatarSrc?: string; kbd?: string; label?: React.ReactNode }) {
  return (
    <button
      type="button"
      data-slot="launcher"
      className={cn(
        "relative inline-flex h-[68px] cursor-pointer items-center rounded-[34px] [corner-shape:squircle] border border-border bg-card pr-4 pl-[70px] shadow-card transition-shadow hover:shadow-lift",
        className
      )}
      {...props}
    >
      {/* lift the disc by the canvas headroom (11/75) so it sits centred in the pill,
          head breaking out the top — matches .launcher__av in the full Launcher */}
      {avatarSrc && (
        <img src={avatarSrc} alt="" className="pointer-events-none absolute top-2 left-[14px] block w-[51px] [transform:translateY(-14.667%)]" />
      )}
      <LauncherResting agentName={agentName} label={label} kbd={kbd} />
    </button>
  )
}

const TIMER_RING_D =
  "M20 39 L13 39 A12 12 0 0 1 1 27 L1 13 A12 12 0 0 1 13 1 L27 1 A12 12 0 0 1 39 13 L39 27 A12 12 0 0 1 27 39 L20 39 Z"

function TimerRingButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="notif__close" data-seq aria-label="Dismiss" onClick={onClick}>
      <span className="notif__x">
        <Icon name="x" size={15} />
      </span>
      <svg className="notif__timer" viewBox="0 0 40 40" aria-hidden="true">
        <path className="notif__timer-ring" pathLength={1} d={TIMER_RING_D} />
      </svg>
    </button>
  )
}

export type CoachTarget = {
  ref: React.RefObject<HTMLElement | null>
  side: "left" | "top"
  title: string
  desc: string
}

type LauncherProps = {
  agentName?: string
  /** overrides the "Ask <agent>" resting label (the pill isn't always "Ask <name>") */
  label?: React.ReactNode
  avatarSrc?: string
  kbd?: string
  /** the content region the pill docks to (bottom-centre) */
  dockRef: React.RefObject<HTMLElement | null>
  /** the region the modal/saving centres on + the blur covers (defaults to dockRef) */
  regionRef?: React.RefObject<HTMLElement | null>
  /** the surface that scrolls under the fixed launcher (re-docks on its scroll) */
  scrollRef?: React.RefObject<HTMLElement | null>
  /** coach-mark targets (their DOM refs) */
  coaches?: CoachTarget[]
  /** the "Create new dashboard" access options */
  accessOptions?: string[]
  /** which modal the "modal" state renders: create a dashboard, or pin a card to
   *  one. The host flips this (before calling openModal) to reuse the ONE morphing
   *  card for both flows. */
  modalMode?: "create" | "pin"
  /** the live dashboards a card can be pinned to (pin mode's picker) */
  dashboards?: { id: string; name: string }[]
  /** confirm a pin: the chosen dashboard names (runs after the saving fill lands) */
  onPinConfirm?: (dashboardNames: string[]) => void
  /** jump the open pin modal to the create-dashboard modal (picker's "New Dashboard") */
  onSwitchToCreate?: () => void
  /** staged card attachments shown as chips in the composer (host-owned) */
  attachments?: Attachment[]
  onRemoveAttachment?: (index: number) => void
  onNewChat?: (text: string, attachments?: Attachment[]) => void
  onSaveDashboard?: (name: string) => void
  /** receive the engine API (drive states from a parent control bar) */
  onReady?: (api: LauncherApi | null) => void
  // ---- SEARCH capability (opt-in). When `searchMode` is on, the composer acts as a
  // command-palette: the send button is dropped, the resting agent avatar is hidden
  // while expanded, and `resultsSlot` renders a results list ABOVE the field. All of
  // this is gated, so the demo/agent usage (no search props) is unchanged. ----
  /** the composer placeholder (defaults to "Ask me anything…") */
  placeholder?: string
  /** turn the composer into a search palette (see above) */
  searchMode?: boolean
  /** the results list rendered above the field (host-owned; only shown in searchMode) */
  resultsSlot?: React.ReactNode
  /** fired on every keystroke with the live query */
  onQuery?: (value: string) => void
  /** move the host's result highlight (ArrowDown = +1 / ArrowUp = -1) */
  onNav?: (dir: 1 | -1) => void
  /** commit the highlighted result on Enter (return true if handled) */
  onCommit?: () => boolean
}

const VIEW_OPTS = [
  { value: "snapshot", label: "Snapshot", key: "A" },
  { value: "live", label: "Live", key: "B" },
]

function Launcher({
  agentName = "Bal",
  label,
  avatarSrc,
  kbd = "⌘K",
  dockRef,
  regionRef,
  scrollRef,
  coaches,
  accessOptions = ["Only myself", "My team", "Everyone"],
  modalMode = "create",
  dashboards = [],
  onPinConfirm,
  onSwitchToCreate,
  attachments = [],
  onRemoveAttachment,
  onNewChat,
  onSaveDashboard,
  onReady,
  placeholder,
  searchMode = false,
  resultsSlot,
  onQuery,
  onNav,
  onCommit,
}: LauncherProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const apiRef = React.useRef<LauncherApi | null>(null)
  const [lState, setLState] = React.useState<LauncherState>("default")

  // modal form (owned by React; the engine only drives the morph geometry)
  const [dashName, setDashName] = React.useState("")
  const [access, setAccess] = React.useState<string[]>([])
  const [view, setView] = React.useState<string | null>(null)
  const [pinTargets, setPinTargets] = React.useState<string[]>([]) // chosen dashboard names (pin mode)
  const isPin = modalMode === "pin"
  const saveEnabled = isPin
    ? pinTargets.length > 0 && !!view
    : !!dashName.trim() && access.length > 0 && !!view

  // keep the newest callbacks + attachments reachable from the mount-only engine effect
  const cb = React.useRef({ onNewChat, onSaveDashboard, onReady, coaches, attachments, onQuery, onNav, onCommit })
  cb.current = { onNewChat, onSaveDashboard, onReady, coaches, attachments, onQuery, onNav, onCommit }

  // sync staged attachments to the engine (enables send, keeps composer open, resizes)
  React.useEffect(() => {
    apiRef.current?.setAttachCount(attachments.length)
  }, [attachments])

  React.useEffect(() => {
    const root = rootRef.current
    const dock = dockRef.current
    if (!root || !dock) return
    const coachCfgs = (cb.current.coaches || [])
      .map((c) => (c.ref.current ? { el: c.ref.current, side: c.side, title: c.title, desc: c.desc } : null))
      .filter(Boolean) as { el: HTMLElement; side: "left" | "top"; title: string; desc: string }[]
    const api = createLauncher(root, {
      dockEl: dock,
      regionEl: regionRef?.current || undefined,
      scrollEl: scrollRef?.current || undefined,
      coaches: coachCfgs,
      onNewChat: (t) => cb.current.onNewChat?.(t, cb.current.attachments),
      onSaveDashboard: (n) => cb.current.onSaveDashboard?.(n),
      onState: (s) => setLState(s),
      // SEARCH hooks are wired ONLY in searchMode, so a plain agent composer keeps
      // native arrow-key caret motion + its default Enter-to-send behaviour.
      ...(searchMode
        ? {
            onQuery: (v: string) => cb.current.onQuery?.(v),
            onNav: (d: 1 | -1) => cb.current.onNav?.(d),
            onCommit: () => cb.current.onCommit?.() ?? false,
          }
        : {}),
    })
    apiRef.current = api
    cb.current.onReady?.(api)
    return () => {
      api.destroy()
      apiRef.current = null
      cb.current.onReady?.(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // reset the form each time the modal opens
  React.useEffect(() => {
    if (lState === "modal") {
      setDashName("")
      setAccess([])
      setView(null)
      setPinTargets([])
    }
  }, [lState])

  const handleSave = () => {
    if (isPin) {
      const names = pinTargets
      apiRef.current?.startSaveFlow({
        notifTitle: "New pin created",
        notifDesc:
          names.length === 1 ? `Pinned to the ${names[0]} dashboard` : `Pinned to ${names.length} dashboards`,
        onComplete: () => onPinConfirm?.(names),
      })
      return
    }
    const name = dashName.trim()
    apiRef.current?.startSaveFlow({
      name,
      notifTitle: "New dashboard created",
      notifDesc: `Your dashboard "${name}" has been saved.`,
    })
  }

  const togglePin = (name: string) =>
    setPinTargets((prev) => (prev.includes(name) ? prev.filter((x) => x !== name) : [...prev, name]))

  return (
    <div className={cn("launcher", searchMode && "is-search")} ref={rootRef} data-state="default">
      <img className="launcher__av" src={avatarSrc} alt="" />

      {/* DEFAULT: the resting pill — the SAME <LauncherResting> the standalone
          LauncherPill renders, so the two can't drift. The engine measures its
          width (see measureDefaultW / relayout), so any label sizes the pill. */}
      <div className="launcher__block launcher__default">
        <LauncherResting agentName={agentName} label={label} kbd={kbd} seq />
      </div>

      {/* INPUT: the composer (auto-grow field + send), engine-wired */}
      <div className="launcher__block launcher__input">
        {attachments.length > 0 && (
          <div className="launcher__attachrow" data-seq>
            {attachments.map((a, i) => (
              <AttachChip key={i} att={a} onRemove={() => onRemoveAttachment?.(i)} />
            ))}
          </div>
        )}
        <div className="launcher__composer">
          <div className="launcher__field" data-seq>
            <div className="launcher__field-control">
              <textarea className="launcher__input-field" rows={1} placeholder={placeholder ?? "Ask me anything…"} />
            </div>
          </div>
          {/* the DS Button: reveal-label secondary, sized (in launcher.css) to the field
              height so "Send" grows out the LEFT of the icon on hover. Engine-wired.
              Kept identical in searchMode (consistent with the agent composer); there the
              engine routes its click through onCommit to open the highlighted result. */}
          <Button
            type="button"
            variant="secondary"
            revealLabel="Send"
            aria-label="Send"
            className="launcher__send bp-ico-host"
            data-seq
          >
            <Icon name="send" size={20} loop="fly" />
          </Button>
        </div>
        {/* SEARCH: results / answer render BELOW the composer (conventional command
            palette). The card is bottom-docked and grows upward, so the composer +
            avatar stay put and identical to the demo launcher — no chrome divergence. */}
        {searchMode && resultsSlot}
      </div>

      {/* MODAL: the ONE morphing modal, in create OR pin mode — a header + a body
          of real DS fields. Pin swaps the name+access fields for a dashboard picker. */}
      <div className="launcher__block launcher__modal">
        <div className="launcher__mhdr">
          <span className="launcher__mhdricon" data-seq>
            <Icon name={isPin ? "pin" : "layout-dashboard"} size={20} stroke={1.5} />
          </span>
          <h2 className="launcher__mtitle" data-seq>
            {isPin ? "Pin to dashboard" : "Create new dashboard"}
          </h2>
          <button
            type="button"
            className="launcher__mclose"
            data-seq
            aria-label="Close"
            onClick={() => apiRef.current?.toDefault()}
          >
            <Icon name="x" size={14} />
          </button>
        </div>
        <div className="launcher__mbody">
          {isPin ? (
            <div className="launcher__mfield" data-seq>
              {/* the dashboard picker: multi-select of the LIVE dashboards, with a
                  "New Dashboard" row that jumps to the create modal in place */}
              <Dropdown>
                <DropdownTrigger className="group/trigger bp-chev-host flex h-[34px] w-full items-center gap-2 rounded-[var(--ctl-radius)] [corner-shape:squircle] border border-[var(--ctl-line)] bg-[linear-gradient(180deg,var(--ctl-face),var(--ctl-face-2))] px-3.5 text-base font-medium text-[var(--ctl-ink)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] outline-none transition-colors hover:border-[var(--ctl-line-hover)] data-[popup-open]:border-primary data-[popup-open]:shadow-[0_0_0_3px_var(--accent-tint)]">
                  <span className={cn("min-w-0 flex-1 truncate text-left", pinTargets.length === 0 && "text-muted-foreground")}>
                    {pinTargets.length === 0
                      ? "Choose a dashboard"
                      : pinTargets.length === 1
                        ? pinTargets[0]
                        : `${pinTargets.length} dashboards`}
                  </span>
                  <Icon name="chevron-down" size={18} className="bp-chev shrink-0 text-muted-foreground transition-transform duration-200 group-data-[popup-open]/trigger:rotate-180" />
                </DropdownTrigger>
                <DropdownContent align="start" positionerClassName="z-[130]" className="min-w-[var(--anchor-width)]">
                  <DropdownItem icon="plus" onClick={() => onSwitchToCreate?.()}>
                    New Dashboard
                  </DropdownItem>
                  {dashboards.map((d) => (
                    <DropdownCheckItem
                      key={d.id}
                      checked={pinTargets.includes(d.name)}
                      onCheckedChange={() => togglePin(d.name)}
                    >
                      {d.name}
                    </DropdownCheckItem>
                  ))}
                </DropdownContent>
              </Dropdown>
            </div>
          ) : (
            <>
              <div className="launcher__mfield" data-seq>
                <Input
                  value={dashName}
                  onChange={(e) => setDashName(e.target.value)}
                  placeholder="Dashboard name"
                  autoComplete="off"
                />
              </div>
              <div className="launcher__mfield" data-seq>
                {/* multi-select access: the ONE dropdown (checkbox rows). Drops BELOW the
                    trigger like every other dropdown; stays open while ticking; the trigger
                    shows the comma-joined picks. The launcher is a fixed z-95 layer, so the
                    popup is bumped above it. */}
                <Dropdown>
                  <DropdownTrigger className="group/trigger bp-chev-host flex h-[34px] w-full items-center gap-2 rounded-[var(--ctl-radius)] [corner-shape:squircle] border border-[var(--ctl-line)] bg-[linear-gradient(180deg,var(--ctl-face),var(--ctl-face-2))] px-3.5 text-base font-medium text-[var(--ctl-ink)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] outline-none transition-colors hover:border-[var(--ctl-line-hover)] data-[popup-open]:border-primary data-[popup-open]:shadow-[0_0_0_3px_var(--accent-tint)]">
                    <span className={cn("min-w-0 flex-1 truncate text-left", access.length === 0 && "text-muted-foreground")}>
                      {access.length ? access.join(", ") : "Who has access?"}
                    </span>
                    <Icon name="chevron-down" size={18} className="bp-chev shrink-0 text-muted-foreground transition-transform duration-200 group-data-[popup-open]/trigger:rotate-180" />
                  </DropdownTrigger>
                  <DropdownContent align="start" positionerClassName="z-[130]" className="min-w-[var(--anchor-width)]">
                    {accessOptions.map((o) => (
                      <DropdownCheckItem
                        key={o}
                        checked={access.includes(o)}
                        onCheckedChange={() => setAccess(access.includes(o) ? access.filter((x) => x !== o) : [...access, o])}
                      >
                        {o}
                      </DropdownCheckItem>
                    ))}
                  </DropdownContent>
                </Dropdown>
              </div>
            </>
          )}
          <div className="launcher__mfield" data-seq>
            <span className="launcher__mlabel">Choose a view</span>
            <Choices options={VIEW_OPTS} value={view} onValueChange={setView} />
          </div>
          <div className="launcher__mcta" data-seq>
            <Button variant="secondary" onClick={() => apiRef.current?.toDefault()}>
              Cancel
            </Button>
            <Button disabled={!saveEnabled} onClick={handleSave}>
              {isPin ? "Pin" : "Save"}
            </Button>
          </div>
        </div>
      </div>

      {/* SAVING: the progress pill, driven frame-by-frame by the engine */}
      <div className="launcher__block launcher__saving">
        <div className="launcher__progress">
          <div className="launcher__progress-head" data-seq>
            <span className="launcher__progress-label">Saving</span>
            <span className="launcher__progress-pct">0%</span>
          </div>
          <div className="launcher__progress-track" data-seq>
            <div className="launcher__progress-fill" />
          </div>
        </div>
      </div>

      {/* NOTIF: the confirmation toast + a 4s dismiss ring. Positive (green) by
          default; a neutral tone (data-notif-tone, engine-set) is used for a
          reversible action like a delete, which pairs the trash glyph with an
          optional action button (e.g. Undo). */}
      <div className="launcher__block launcher__notif">
        <div className="notif__main">
          <div className="notif__row">
            <span className="notif__check" data-seq>
              <Icon name="circle-check" size={20} className="notif__ico notif__ico--positive" />
              <Icon name="trash" size={20} className="notif__ico notif__ico--neutral" />
            </span>
            <span className="notif__title" data-seq>
              New dashboard created
            </span>
            <span className="notif__time" data-seq>
              Just now
            </span>
          </div>
          <div className="notif__desc" data-seq>
            Your dashboard has been saved.
          </div>
        </div>
        {/* optional action (e.g. Undo). Label + visibility are engine-driven (so
            the notif width measures right); the click runs the stored callback. */}
        <button type="button" className="notif__action" data-seq hidden onClick={() => apiRef.current?.runNotifAction()}>
          Undo
        </button>
        <TimerRingButton onClick={() => apiRef.current?.dismiss()} />
      </div>

      {/* COACH: the arrow tooltip that travels to a target over the spotlight, 6s ring */}
      <div className="launcher__block launcher__coach">
        <span className="coach__arrow" aria-hidden="true" />
        <div className="coach__main">
          <div className="coach__title" data-seq>
            Create Dashboards
          </div>
          <div className="coach__desc" data-seq>
            Create dashboards out of pinned data for yourself or to share with others.
          </div>
        </div>
        <TimerRingButton onClick={() => apiRef.current?.dismiss()} />
      </div>
    </div>
  )
}

export { LauncherPill, Launcher }
export type { LauncherProps }
