import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "../base/icon"
import { PanelHeader, type PanelHeaderProps } from "./card-header"

// Ported from the kit (kit/menu.css .bp-section / .bp-option, composed with the
// header): the resource center panel — an accent header over sections of
// full-width option rows. Composed from finished parts, exactly as the kit does.
export type ResourceOption = {
  icon?: IconName
  label: React.ReactNode
  trailing?: IconName | React.ReactNode
  onClick?: () => void
}
export type ResourceSection = { label?: React.ReactNode; options: ResourceOption[] }

type ResourceCenterProps = React.ComponentProps<"div"> &
  Pick<PanelHeaderProps, "avatar" | "name" | "role" | "heading" | "onClose"> & {
    sections: ResourceSection[]
  }

function OptionRow({ icon, label, trailing = "chevron-right", onClick }: ResourceOption) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-md border border-border-strong bg-card px-3.5 py-3 text-left text-base font-semibold text-foreground transition-colors hover:bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)]"
    >
      {icon && <Icon name={icon} size={18} className="shrink-0 text-muted-foreground" />}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      <span className="ml-auto shrink-0 text-muted-foreground">
        {typeof trailing === "string" ? <Icon name={trailing as IconName} size={16} /> : trailing}
      </span>
    </button>
  )
}

function ResourceCenter({ avatar, name, role, heading, onClose, sections, className, ...props }: ResourceCenterProps) {
  return (
    <div
      data-slot="resource-center"
      className={cn("w-[344px] overflow-hidden rounded-xl border border-border-strong bg-card shadow-card", className)}
      {...props}
    >
      <PanelHeader variant="accent" avatar={avatar} name={name} role={role} heading={heading} onClose={onClose} />
      <div className="flex flex-col gap-1.5 p-3">
        {sections.map((sec, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            {sec.label && (
              <div className="px-1 pt-1.5 pb-0.5 text-xs leading-[18px] font-semibold text-muted-foreground">{sec.label}</div>
            )}
            {sec.options.map((opt, j) => (
              <OptionRow key={j} {...opt} />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export { ResourceCenter }
export type { ResourceCenterProps }
