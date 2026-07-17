import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "../base/icon"

// Ported from the kit (kit/nav-item.css .bp-nav-item): ONE row reused by every
// sidebar / sub-nav list. Icon rows and text rows share metrics (label rides a
// 20px line-box). The icon tips left on hover; `current` marks the row (soft
// fill + faint inset ring + 600 weight). Neutralized to tokens so it adapts to
// dark mode, unlike the kit's hard-coded greys.
type NavItemProps = React.ComponentProps<"button"> & {
  icon?: IconName
  /** a custom leading element in place of `icon` (e.g. a status dot); owns its own
   *  17px footprint. `icon` wins if both are given. */
  leading?: React.ReactNode
  tail?: React.ReactNode
  current?: boolean
  /** collapse to a centered icon rail (label + tail hidden) */
  collapsed?: boolean
}

function NavItem({ icon, leading, tail, current, collapsed, className, children, ...props }: NavItemProps) {
  return (
    <button
      data-slot="nav-item"
      data-current={current || undefined}
      className={cn(
        // same box as the button family: 34px tall (= the CTA height), 16px squircle,
        // 500 weight. hover + selected share a LIGHT fill (~content-canvas grey) + a faint
        // outline a hair darker than the fill — not the darker mix that read too heavy.
        // control-family sibling: shares the locked globals (radius/hover/outline/icon
        // colour) via the --ctl-* tokens; only the full-width left-aligned row shape is
        // its own. Change --ctl-hover once and every sibling moves together.
        "group bp-navicon-host flex min-h-[34px] items-center gap-2 rounded-[var(--ctl-radius)] text-left text-base font-medium text-foreground transition-[background,color] duration-[120ms] outline-none",
        collapsed ? "size-10 justify-center p-0" : "w-full px-2.5 py-[7px]",
        "hover:bg-[var(--ctl-hover)]",
        "focus-visible:shadow-[0_0_0_3px_var(--accent-tint)]",
        "data-[current=true]:bg-[var(--ctl-selected)] data-[current=true]:shadow-[inset_0_0_0_1px_var(--ctl-outline)] data-[current=true]:font-semibold",
        className
      )}
      {...props}
    >
      {icon ? (
        // the icon reads LIGHTER than the label; it darkens (not to full ink) on hover/current
        <span className="flex size-[17px] shrink-0 place-items-center text-[var(--ctl-icon)] transition-colors duration-[120ms] group-hover:text-[var(--ctl-icon-on)] group-data-[current=true]:text-[var(--ctl-icon-on)]">
          <Icon name={icon} size={17} stroke={1.75} className="bp-navicon" />
        </span>
      ) : (
        leading
      )}
      {!collapsed && <span className="min-w-0 flex-1 truncate leading-5">{children}</span>}
      {!collapsed && tail && <span className="ml-auto shrink-0">{tail}</span>}
    </button>
  )
}

export { NavItem }
export type { NavItemProps }
