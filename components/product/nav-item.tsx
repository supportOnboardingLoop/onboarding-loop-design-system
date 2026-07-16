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
  tail?: React.ReactNode
  current?: boolean
  /** collapse to a centered icon rail (label + tail hidden) */
  collapsed?: boolean
}

function NavItem({ icon, tail, current, collapsed, className, children, ...props }: NavItemProps) {
  return (
    <button
      data-slot="nav-item"
      data-current={current || undefined}
      className={cn(
        "group bp-navicon-host flex min-h-9 items-center gap-2 rounded-lg text-left text-base font-medium text-foreground transition-[background,color] duration-[120ms] outline-none",
        collapsed ? "w-10 justify-center px-2 py-2" : "w-full px-2.5 py-2",
        "hover:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)]",
        "focus-visible:shadow-[0_0_0_3px_var(--accent-tint)]",
        "data-[current=true]:bg-[color-mix(in_oklab,var(--foreground)_6%,transparent)] data-[current=true]:shadow-[inset_0_0_0_1px_var(--border-strong)] data-[current=true]:font-semibold",
        className
      )}
      {...props}
    >
      {icon && (
        <span className="flex size-[17px] shrink-0 place-items-center text-muted-foreground transition-colors duration-[120ms] group-hover:text-foreground group-data-[current=true]:text-foreground">
          <Icon name={icon} size={17} stroke={1.75} className="bp-navicon" />
        </span>
      )}
      {!collapsed && <span className="min-w-0 flex-1 truncate leading-5">{children}</span>}
      {!collapsed && tail && <span className="ml-auto shrink-0">{tail}</span>}
    </button>
  )
}

export { NavItem }
export type { NavItemProps }
