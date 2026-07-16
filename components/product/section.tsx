import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon } from "../base/icon"
import { Chip } from "./chip"

// Ported from the starter layout (.sec-head / .sec-body): a collapsible
// subsection title. Reads a hair lighter than the rows below; on hover the line
// darkens and a down-chevron builds in after the label. Click rolls the body
// up/down (grid-rows 1fr<->0fr); collapsed parks the chevron pointing right and
// swaps in a count chip of how many rows are hidden. An optional "Organize"
// action shows only while open.
type CollapsibleSectionProps = {
  label: React.ReactNode
  count?: React.ReactNode
  organize?: () => void
  defaultCollapsed?: boolean
  collapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  className?: string
  children: React.ReactNode
}

function CollapsibleSection({
  label,
  count,
  organize,
  defaultCollapsed = false,
  collapsed: controlled,
  onCollapsedChange,
  className,
  children,
}: CollapsibleSectionProps) {
  const [internal, setInternal] = React.useState(defaultCollapsed)
  const collapsed = controlled ?? internal
  const toggle = () => {
    const next = !collapsed
    if (controlled === undefined) setInternal(next)
    onCollapsedChange?.(next)
  }
  return (
    <div data-slot="section" data-collapsed={collapsed || undefined} className={className}>
      <button
        type="button"
        aria-expanded={!collapsed}
        onClick={toggle}
        className="group/sec flex w-full cursor-pointer items-center gap-[5px] px-2.5 pt-2 pb-1.5 text-left text-xs leading-[1.4] font-medium text-[#a5a5a5] transition-colors hover:text-muted-foreground"
      >
        <span className="shrink-0">{label}</span>
        <span
          className={cn(
            "grid size-3.5 shrink-0 place-items-center text-current opacity-0 transition-[opacity,transform] duration-[380ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] group-hover/sec:opacity-100",
            collapsed && "rotate-[-90deg] opacity-100"
          )}
        >
          <Icon name="chevron-down" size={14} stroke={2} />
        </span>
        {organize && !collapsed && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation()
              organize()
            }}
            className="ml-auto inline-flex h-5 items-center rounded-lg px-2 text-xs leading-none font-medium text-muted-foreground transition-colors hover:bg-fill hover:text-foreground"
          >
            Organize
          </span>
        )}
        {collapsed && count != null && <Chip className="ml-auto">{count}</Chip>}
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-[380ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{ gridTemplateRows: collapsed ? "0fr" : "1fr" }}
      >
        <div className="min-h-0 overflow-hidden">{children}</div>
      </div>
    </div>
  )
}

export { CollapsibleSection }
export type { CollapsibleSectionProps }
