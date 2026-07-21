"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "@/lib/utils"
import { Icon } from "./icon"
import { maskStyle } from "./checkmark"

// Ported to the kit dropdown (kit/menu.css .bp-dropdown + .bp-menu). The trigger
// reads like a secondary button (the --ctl-face gradient + edge, control
// shadow); open = accent border + 3px accent-tint, chevron flips. The popup is a
// shadow-pop menu; each row carries the reveal check that RESTS as a hollow
// outline ring (revealed on highlight) and fills to an accent disc on select.
const Select = SelectPrimitive.Root

function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
  return <SelectPrimitive.Group data-slot="select-group" className={cn(className)} {...props} />
}

function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
  return (
    <SelectPrimitive.Value
      data-slot="select-value"
      className={cn("min-w-0 flex-1 truncate text-left", className)}
      {...props}
    />
  )
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: SelectPrimitive.Trigger.Props & { size?: "sm" | "default" }) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "group/trigger bp-chev-host flex w-full items-center gap-2 rounded-lg border border-[var(--ctl-line)] bg-[linear-gradient(180deg,var(--ctl-face),var(--ctl-face-2))] font-medium whitespace-nowrap text-[var(--ctl-ink)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] outline-none transition-[border-color,box-shadow,background]",
        "hover:border-[var(--ctl-line-hover)] hover:bg-[linear-gradient(180deg,var(--ctl-face),var(--ctl-face-hover))]",
        "data-[popup-open]:border-primary data-[popup-open]:shadow-[0_0_0_3px_var(--accent-tint)]",
        "disabled:pointer-events-none disabled:opacity-45",
        size === "sm" ? "h-8 px-2.5 text-sm" : "h-[34px] px-3.5 text-base",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="ml-auto flex shrink-0 text-muted-foreground transition-transform duration-200 group-data-[popup-open]/trigger:rotate-180">
        <Icon name="chevron-down" size={size === "sm" ? 16 : 18} className="bp-chev" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  sideOffset = 6,
  positionerClassName,
  ...props
}: SelectPrimitive.Popup.Props &
  Pick<SelectPrimitive.Positioner.Props, "sideOffset" | "align" | "side"> & {
    /** extra classes for the Positioner (e.g. a higher z-index when the trigger
     *  lives inside another fixed layer like the launcher) */
    positionerClassName?: string
  }) {
  return (
    <SelectPrimitive.Portal>
      {/* a Select is just the single-select DROPDOWN: it drops BELOW the trigger
          (alignItemWithTrigger=false turns off base-ui's native "anchor the chosen
          row over the trigger" behavior) on the same surface as every other dropdown. */}
      <SelectPrimitive.Positioner
        side="bottom"
        alignItemWithTrigger={false}
        sideOffset={sideOffset}
        className={cn("isolate z-50 outline-none", positionerClassName)}
        {...props}
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "max-h-[296px] min-w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-y-auto rounded-[var(--ctl-radius)] [corner-shape:squircle] border border-border-strong bg-popover p-1.5 text-popover-foreground shadow-card outline-none",
            "transition-[transform,opacity] data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0",
            className
          )}
          {...props}
        >
          <SelectPrimitive.List className="flex flex-col gap-0.5">{children}</SelectPrimitive.List>
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({ className, ...props }: SelectPrimitive.GroupLabel.Props) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("px-1 pt-1.5 pb-0.5 text-xs leading-[18px] font-semibold text-muted-foreground", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  leading,
  indicator = "check",
  ...props
}: SelectPrimitive.Item.Props & {
  /** content before the label (e.g. a <Checkbox> for a multi-select row) */
  leading?: React.ReactNode
  /** the trailing selected indicator — the reveal-check disc, or "none" when the
   *  row already shows its state some other way (e.g. a leading checkbox) */
  indicator?: "check" | "none"
}) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        // control-family row: same radius + hover as every other dropdown row
        "group/item relative flex min-h-[34px] w-full cursor-default items-center gap-2 rounded-[var(--ctl-radius)] [corner-shape:squircle] px-2.5 py-[7px] text-base font-medium text-foreground outline-none select-none",
        "transition-colors data-[highlighted]:bg-[var(--ctl-hover)] data-[selected]:bg-[var(--ctl-hover)]",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
        className
      )}
      {...props}
    >
      {leading}
      <SelectPrimitive.ItemText className="min-w-0 flex-1 truncate">{children}</SelectPrimitive.ItemText>
      {indicator === "check" && (
        /* reveal check: 0-width until highlighted or selected; outline ring -> accent disc */
        <span className="flex w-0 shrink-0 items-center justify-center overflow-hidden opacity-0 transition-[width,opacity,margin] duration-200 [transition-timing-function:var(--ease-emphasized)] group-data-[highlighted]/item:ml-2 group-data-[highlighted]/item:w-5 group-data-[highlighted]/item:opacity-100 group-data-[selected]/item:ml-2 group-data-[selected]/item:w-5 group-data-[selected]/item:opacity-100">
          <span
            aria-hidden="true"
            className="relative block size-5 shrink-0 rounded-full [corner-shape:round] bg-transparent shadow-[inset_0_0_0_1.5px_var(--border-strong)] transition-[background,box-shadow] group-data-[selected]/item:bg-primary group-data-[selected]/item:shadow-none"
          >
            <span
              className="absolute inset-0 bg-muted-foreground transition-colors group-data-[selected]/item:bg-[var(--primary-foreground)]"
              style={maskStyle(12)}
            />
          </span>
        </span>
      )}
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({ className, ...props }: SelectPrimitive.Separator.Props) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("-mx-1.5 my-1 h-px bg-border-strong", className)}
      {...props}
    />
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
