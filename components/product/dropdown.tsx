"use client"

import * as React from "react"
import { Popover } from "@base-ui/react/popover"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "../base/icon"
import { Checkbox } from "../base/checkbox"

// ============================================================
// THE ONE dropdown. A single Popover-based menu used everywhere a dropdown
// appears (kebabs, the clients filter, the modal access picker, chat Options).
// It always drops BELOW its trigger (align configurable), on ONE surface, with
// ONE row type whose slots vary by use:
//   • leading icon        (action rows — Rename / Archive …)
//   • leading checkbox     (multi-select rows — stay open on click)
//   • label + trailing      (a count, an icon, a kebab)
//   • an optional search field header (same radius as the rows)
// Every part shares the control-family globals via --ctl-* (radius 16, the light
// neutral hover, the light icon colour). Change a token once -> all dropdowns move.
// ============================================================

const DropdownCtx = React.createContext<{ close: () => void }>({ close: () => {} })

function Dropdown({ children, ...props }: Popover.Root.Props) {
  const [open, setOpen] = React.useState(false)
  return (
    <Popover.Root open={open} onOpenChange={setOpen} {...props}>
      <DropdownCtx.Provider value={{ close: () => setOpen(false) }}>{children}</DropdownCtx.Provider>
    </Popover.Root>
  )
}

const DropdownTrigger = Popover.Trigger

function DropdownContent({
  className,
  children,
  search,
  align = "end",
  side = "bottom",
  sideOffset = 6,
  positionerClassName,
  ...props
}: Popover.Popup.Props &
  Pick<Popover.Positioner.Props, "align" | "side" | "sideOffset"> & {
    /** an optional search field rendered above the rows (e.g. DropdownSearch) */
    search?: React.ReactNode
    /** extra classes for the Positioner (e.g. a higher z when inside another fixed layer) */
    positionerClassName?: string
  }) {
  return (
    <Popover.Portal>
      <Popover.Positioner
        side={side}
        align={align}
        sideOffset={sideOffset}
        className={cn("z-[60] outline-none", positionerClassName)}
      >
        <Popover.Popup
          data-slot="dropdown-content"
          className={cn(
            "flex max-h-[360px] min-w-[200px] origin-[var(--transform-origin)] flex-col gap-0.5 overflow-y-auto rounded-[var(--ctl-radius)] [corner-shape:squircle] border border-border-strong bg-popover p-1.5 text-popover-foreground shadow-card outline-none",
            "transition-[transform,opacity] data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0",
            className
          )}
          {...props}
        >
          {search}
          {children}
        </Popover.Popup>
      </Popover.Positioner>
    </Popover.Portal>
  )
}

// the ONE row: control-family metrics (16px squircle, light hover, 34px, 500),
// with a leading icon that tips-left+bounces on hover (bp-navicon), shared with nav.
const ROW =
  "group/di bp-navicon-host flex min-h-[34px] w-full cursor-default items-center gap-2.5 rounded-[var(--ctl-radius)] [corner-shape:squircle] px-2.5 py-[7px] text-left text-sm font-medium text-foreground outline-none transition-colors select-none hover:bg-[var(--ctl-hover)] focus-visible:bg-[var(--ctl-hover)]"

/** an action row (leading icon + label + optional trailing); closes the menu on click */
function DropdownItem({
  className,
  icon,
  iconFilled,
  danger,
  trailing,
  onClick,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  icon?: IconName
  iconFilled?: boolean
  danger?: boolean
  trailing?: React.ReactNode
}) {
  const { close } = React.useContext(DropdownCtx)
  return (
    <button
      type="button"
      data-slot="dropdown-item"
      onClick={(e) => {
        onClick?.(e)
        close()
      }}
      className={cn(
        ROW,
        danger && "text-destructive hover:bg-[color-mix(in_oklab,var(--destructive)_10%,transparent)]",
        className
      )}
      {...props}
    >
      {icon && (
        <span
          className={cn(
            "flex size-[17px] shrink-0 place-items-center text-[var(--ctl-icon)] transition-colors group-hover/di:text-[var(--ctl-icon-on)]",
            danger && "text-destructive group-hover/di:text-destructive",
            iconFilled && "[&_svg]:fill-current"
          )}
        >
          <Icon name={icon} size={17} stroke={1.7} className="bp-navicon" />
        </span>
      )}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {trailing != null && <span className="ml-auto shrink-0">{trailing}</span>}
    </button>
  )
}

/** a multi-select row (leading checkbox + label); STAYS OPEN, toggles on click */
function DropdownCheckItem({
  className,
  checked,
  onCheckedChange,
  children,
  ...props
}: Omit<React.ComponentProps<"button">, "onChange"> & {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <button
      type="button"
      data-slot="dropdown-check"
      role="menuitemcheckbox"
      aria-checked={checked}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(ROW, className)}
      {...props}
    >
      <Checkbox checked={checked} aria-hidden tabIndex={-1} className="pointer-events-none" />
      <span className="min-w-0 flex-1 truncate">{children}</span>
    </button>
  )
}

/** a search field header — same radius as the rows / buttons */
function DropdownSearch({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <div className="mb-1 flex items-center gap-2 rounded-[var(--ctl-radius)] [corner-shape:squircle] border border-border-strong px-3 py-2">
      <Icon name="search" size={16} className="shrink-0 text-muted-foreground" />
      <input
        className={cn(
          "min-w-0 flex-1 border-none bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground",
          className
        )}
        {...props}
      />
    </div>
  )
}

/** an empty-state row (e.g. "No matches") */
function DropdownEmpty({ children }: { children: React.ReactNode }) {
  return <div className="px-2.5 py-2 text-center text-sm text-muted-foreground">{children}</div>
}

export {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownCheckItem,
  DropdownSearch,
  DropdownEmpty,
}
