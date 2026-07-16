import * as React from "react"

import { cn } from "@/lib/utils"
import { Checkmark } from "../base/checkmark"
import { Button } from "../base/button"

// Ported from the kit (kit/widgets.css .bp-badges / .bp-badge): pill badges,
// multi-select. Each is a 40px squircle chip; selected picks up the accent
// (border + tint fill) and reveals a filled circled check on the right. An
// optional confirm CTA sits full-width below, matching the kit's answer wrapper.
export type BadgeOption = { value: string; label: React.ReactNode }

type BadgeSelectProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  options: BadgeOption[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  confirmLabel?: React.ReactNode
  onConfirm?: (value: string[]) => void
}

function BadgeSelect({
  options,
  value,
  defaultValue = [],
  onValueChange,
  confirmLabel,
  onConfirm,
  className,
  ...props
}: BadgeSelectProps) {
  const [internal, setInternal] = React.useState<string[]>(defaultValue)
  const current = value !== undefined ? value : internal
  const toggle = (v: string) => {
    const next = current.includes(v) ? current.filter((x) => x !== v) : [...current, v]
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
  }
  return (
    <div data-slot="badge-select" className={cn("w-full", className)} {...props}>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const selected = current.includes(opt.value)
          return (
            <button
              key={opt.value}
              type="button"
              data-selected={selected || undefined}
              onClick={() => toggle(opt.value)}
              className={cn(
                "group/badge inline-flex h-10 items-center gap-1.5 rounded-md border px-3 text-base font-semibold transition-[border-color,background,color]",
                selected
                  ? "border-primary bg-accent-tint text-foreground"
                  : "border-border-strong bg-card text-foreground hover:bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)]"
              )}
            >
              {opt.label}
              <span className="flex w-0 items-center justify-center overflow-hidden opacity-0 transition-[width,opacity,margin] duration-200 [transition-timing-function:var(--ease-emphasized)] group-data-[selected]/badge:ml-0.5 group-data-[selected]/badge:w-[18px] group-data-[selected]/badge:opacity-100">
                <Checkmark filled size={18} />
              </span>
            </button>
          )
        })}
      </div>
      {confirmLabel && (
        <Button className="mt-3 w-full" disabled={current.length === 0} onClick={() => onConfirm?.(current)}>
          {confirmLabel}
        </Button>
      )}
    </div>
  )
}

export { BadgeSelect }
export type { BadgeSelectProps }
