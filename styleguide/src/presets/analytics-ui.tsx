import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "@/components/base/icon"
import type { TileDescriptor } from "./analytics-tiles"

// ============================================================================
// Shared analytics content UI — used by the Overview (Insights), Portfolio and
// generated-report views. Pin/Attach card actions (+ their live state) and the
// KPI sparkline.
// ============================================================================

/* A quiet card-action button (Pin / Attach / more) for a card footer: the DS
   icon-button base + the shared nav-icon tip motion, tinting to the brand accent
   on hover. `active` = the persistent on-state (pinned / attached): the icon holds
   the accent color; `filled` swaps the outline glyph for its solid fill. */
export function CardAction({
  icon,
  label,
  active,
  filled,
  onClick,
}: {
  icon: IconName
  label: string
  active?: boolean
  filled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active || undefined}
      onClick={onClick}
      className={cn(
        "bp-navicon-host grid size-8 shrink-0 cursor-pointer place-items-center rounded-lg [corner-shape:squircle] border border-transparent outline-none transition-colors hover:border-[color-mix(in_oklab,var(--foreground)_12%,transparent)] hover:text-primary active:border-[color-mix(in_oklab,var(--foreground)_18%,transparent)] active:bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)] focus-visible:shadow-[0_0_0_3px_var(--accent-tint)]",
        active ? "text-primary" : "text-[var(--ctl-icon)]"
      )}
    >
      <Icon
        name={icon}
        size={17}
        stroke={1.5}
        className={cn("bp-navicon", filled && "[&_path]:fill-current [&_path]:stroke-none")}
      />
    </button>
  )
}

// ---- pin / attach state, shared across every card in the content area --------

/** a content card that can be pinned / attached: a stable id + a headline for the
 *  attach chip, plus (for pin) a serializable `tile` the dashboard re-renders. */
export type CardRef = { id: string; title: string; accent?: string; tile?: TileDescriptor }

export type CardActionsValue = {
  isPinned: (id: string) => boolean
  isAttached: (id: string) => boolean
  onPin: (card: CardRef) => void
  onUnpin: (id: string) => void
  onToggleAttach: (card: CardRef) => void
}

const NOOP: CardActionsValue = {
  isPinned: () => false,
  isAttached: () => false,
  onPin: () => {},
  onUnpin: () => {},
  onToggleAttach: () => {},
}

const CardActionsCtx = React.createContext<CardActionsValue>(NOOP)
export const CardActionsProvider = CardActionsCtx.Provider
export const useCardActions = () => React.useContext(CardActionsCtx)

/* Pin: unpinned → opens the pin-to-dashboard modal; pinned → the glyph fills to a
   solid accent pin and the tooltip flips to "Unpin" (click un-pins). */
export function PinAction({ card }: { card: CardRef }) {
  const { isPinned, onPin, onUnpin } = useCardActions()
  const pinned = isPinned(card.id)
  return (
    <CardAction
      icon={pinned ? "pin-filled" : "pin"}
      filled={pinned}
      active={pinned}
      label={pinned ? "Unpin" : "Pin to dashboard"}
      onClick={() => (pinned ? onUnpin(card.id) : onPin(card))}
    />
  )
}

/* Attach: staged onto the launcher for a new chat; the paperclip holds the accent
   color and the tooltip flips to "Unattach" (click, or the chip's X, un-attaches). */
export function AttachAction({ card }: { card: CardRef }) {
  const { isAttached, onToggleAttach } = useCardActions()
  const attached = isAttached(card.id)
  return (
    <CardAction
      icon="paperclip"
      active={attached}
      label={attached ? "Unattach" : "Attach to chat"}
      onClick={() => onToggleAttach(card)}
    />
  )
}

/* The shared sparkline gradients — render ONCE near the top of the content body,
   then any <Sparkline> references them by id. Status hues (green/orange), not the
   brand, since a sparkline reads good/watch. */
export function SparkDefs() {
  return (
    <svg width="0" height="0" aria-hidden="true" className="absolute">
      <defs>
        <linearGradient id="sparkGreen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--success)" stopOpacity="0.2" />
          <stop offset="1" stopColor="var(--success)" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="sparkOrange" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--warning)" stopOpacity="0.24" />
          <stop offset="1" stopColor="var(--warning)" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// two fixed shapes (an up-trend and a down-trend), carried from the kit
const SPARK_UP = "M0,32 L12,27 L24,30 L36,20 L48,24 L60,14 L72,18 L84,8 L100,5"
const SPARK_DOWN = "M0,9 L12,12 L24,10 L36,17 L48,15 L60,22 L72,20 L84,26 L100,29"

export function Sparkline({ tone }: { tone: "ok" | "warn" }) {
  const ok = tone === "ok"
  const d = ok ? SPARK_UP : SPARK_DOWN
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true" className="h-10 w-[92px] shrink-0">
      <path d={`${d} L100,40 L0,40 Z`} fill={`url(#${ok ? "sparkGreen" : "sparkOrange"})`} />
      <path
        d={d}
        fill="none"
        stroke={ok ? "var(--success)" : "var(--warning)"}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
