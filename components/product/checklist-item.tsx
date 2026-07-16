import * as React from "react"

import { cn } from "@/lib/utils"
import { maskStyle } from "../base/checkmark"

// Ported from the kit (kit/checklist-item.css .bp-item): three states.
//   todo  — dashed grey ring + bold label
//   open  — solid accent ring + label + description + a CTA block (Start/Skip)
//   done  — filled accent circle + white tick, label struck through + muted
// A div (not a button) so the open state's CTA buttons nest cleanly.
type ChecklistItemProps = React.ComponentProps<"div"> & {
  state?: "todo" | "open" | "done"
  label: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
}

function ChecklistItem({
  state = "todo",
  label,
  description,
  action,
  className,
  ...props
}: ChecklistItemProps) {
  const done = state === "done"
  const open = state === "open"
  return (
    <div
      data-slot="checklist-item"
      data-state={state}
      className={cn(
        "group/item flex w-full gap-3 px-5 py-3 text-left transition-[background] duration-150",
        "hover:bg-[color-mix(in_oklab,var(--foreground)_3.5%,transparent)]",
        !props.onClick ? "" : "cursor-pointer",
        done ? "items-center" : "items-start",
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "relative box-border size-7 shrink-0 rounded-full [corner-shape:round] border-2 transition-[border-color,background] duration-200",
          done
            ? "border-solid border-primary bg-primary"
            : open
              ? "border-solid border-primary"
              : "border-dashed border-dash"
        )}
      >
        <span
          className="absolute inset-0 transition-opacity duration-150"
          style={{ background: "var(--primary-foreground)", opacity: done ? 1 : 0, ...maskStyle(14) }}
        />
      </span>
      <span className={cn("flex min-w-0 flex-1 flex-col gap-2.5", done ? "pt-0" : "pt-1")}>
        <span
          className={cn(
            "text-base leading-5 font-semibold",
            done ? "text-done line-through" : "text-foreground"
          )}
        >
          {label}
        </span>
        {open && description && (
          <span className="text-xs leading-[18px] text-muted-foreground">{description}</span>
        )}
        {open && action}
      </span>
    </div>
  )
}

export { ChecklistItem }
export type { ChecklistItemProps }
