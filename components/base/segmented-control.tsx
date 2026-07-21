"use client"

import * as React from "react"
import { Tabs } from "@base-ui/react/tabs"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "./icon"

// ============================================================================
// SegmentedControl — a compact tabbed button group: a control-family track
// holding N segments, exactly one active, with the selection sliding between
// them on an accent-tint thumb (a primary ring). Icon-only or icon + label.
//
// Built on Base UI Tabs (List + Tab + Indicator) so it gets real tablist
// semantics, roving focus, and arrow-key navigation for free; the Indicator
// exposes per-tab CSS vars (--active-tab-left/top/width/height) that position
// the thumb. Styled on the same --ctl-* control family + selected-state language
// (accent-tint + primary ring) as SelectTrigger and the Customize agent grid.
//
// Use it for a small "pick one" toggle (a setting, or a view/size switch). For
// an agent's 2-3 lettered options with reveal checks, use `Choices`; for a
// value dropdown, use `Select`.
// ============================================================================

export type SegmentedOption = {
  value: string
  /** visible label; omit for an icon-only segment */
  label?: React.ReactNode
  icon?: IconName
  /** tooltip + accessible name, required when the segment is icon-only */
  title?: string
  disabled?: boolean
}

const SIZES = {
  sm: { pad: "p-0.5", tab: "h-7 gap-1.5 px-2.5 text-xs", icon: 16 },
  default: { pad: "p-1", tab: "h-8 gap-1.5 px-3 text-sm", icon: 18 },
} as const

export function SegmentedControl({
  options,
  value,
  defaultValue,
  onValueChange,
  ariaLabel,
  size = "default",
  className,
}: {
  options: SegmentedOption[]
  /** controlled selection (the segment's value) */
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  /** accessible name for the group (a tablist needs a label) */
  ariaLabel: string
  size?: "sm" | "default"
  className?: string
}) {
  const s = SIZES[size]
  return (
    <Tabs.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={(v) => v != null && onValueChange?.(String(v))}
      className={cn("inline-block", className)}
    >
      <Tabs.List
        aria-label={ariaLabel}
        // segmented controls activate on arrow-key focus (automatic activation),
        // so keyboard users change the value with the arrows, not a second Enter
        activateOnFocus
        className={cn(
          "relative inline-flex items-center gap-0.5 rounded-lg [corner-shape:squircle] border border-[var(--ctl-line)] bg-[var(--ctl-face)]",
          s.pad
        )}
      >
        {/* the sliding thumb — accent-tint fill + primary ring, positioned by
            Base UI's per-tab CSS vars. width is 0 until the active tab is
            measured, so there is no mispositioned flash. */}
        <Tabs.Indicator
          className={cn(
            "absolute top-[var(--active-tab-top)] left-[var(--active-tab-left)] h-[var(--active-tab-height)] w-[var(--active-tab-width)] rounded-md [corner-shape:squircle]",
            "bg-accent-tint shadow-[inset_0_0_0_1px_var(--primary)]",
            "transition-[left,top,width,height] duration-200 [transition-timing-function:var(--ease-emphasized)]"
          )}
        />
        {options.map((opt) => (
          <Tabs.Tab
            key={opt.value}
            value={opt.value}
            disabled={opt.disabled}
            aria-label={opt.title}
            title={opt.title}
            className={cn(
              "relative z-[1] inline-flex shrink-0 cursor-pointer items-center justify-center rounded-md [corner-shape:squircle] font-semibold whitespace-nowrap outline-none transition-colors",
              s.tab,
              "text-muted-foreground hover:text-foreground data-[selected]:text-foreground",
              "focus-visible:shadow-[0_0_0_3px_var(--accent-tint)]",
              "disabled:pointer-events-none disabled:opacity-45"
            )}
          >
            {opt.icon && <Icon name={opt.icon} size={s.icon} stroke={1.75} />}
            {opt.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
    </Tabs.Root>
  )
}
