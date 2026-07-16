"use client"

import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"

import { cn } from "@/lib/utils"
import { Icon } from "./icon"
import { maskStyle } from "./checkmark"

// Ported to the kit dropdown (kit/menu.css .bp-dropdown + .bp-menu). The trigger
// reads like a secondary button (white gradient, #dcdcdc border, control
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
        "group/trigger flex w-full items-center gap-2 rounded-lg border border-[#dcdcdc] bg-[linear-gradient(180deg,#ffffff,#f7f7f7)] font-medium whitespace-nowrap text-[#26262a] shadow-[0_1px_2px_rgba(10,13,18,0.05)] outline-none transition-[border-color,box-shadow,background]",
        "hover:border-[#cfcfcf] hover:bg-[linear-gradient(180deg,#ffffff,#f1f1f1)]",
        "data-[popup-open]:border-primary data-[popup-open]:shadow-[0_0_0_3px_var(--accent-tint)]",
        "disabled:pointer-events-none disabled:opacity-45",
        size === "sm" ? "h-8 px-2.5 text-sm" : "h-[34px] px-3.5 text-base",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon className="ml-auto flex shrink-0 text-muted-foreground transition-transform duration-200 group-data-[popup-open]/trigger:rotate-180">
        <Icon name="chevron-down" size={size === "sm" ? 16 : 18} />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  sideOffset = 6,
  ...props
}: SelectPrimitive.Popup.Props & Pick<SelectPrimitive.Positioner.Props, "sideOffset" | "align" | "side">) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner sideOffset={sideOffset} className="isolate z-50 outline-none" {...props}>
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "max-h-[296px] min-w-[var(--anchor-width)] origin-[var(--transform-origin)] overflow-y-auto rounded-lg border border-border-strong bg-popover p-1.5 text-popover-foreground shadow-pop outline-none",
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

function SelectItem({ className, children, ...props }: SelectPrimitive.Item.Props) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "group/item relative flex min-h-10 w-full cursor-default items-center gap-2 rounded-lg px-3 py-2.5 text-base font-medium text-foreground outline-none select-none",
        "transition-colors data-[highlighted]:bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)] data-[selected]:bg-accent-tint",
        "data-[disabled]:pointer-events-none data-[disabled]:opacity-45",
        className
      )}
      {...props}
    >
      <SelectPrimitive.ItemText className="min-w-0 flex-1 truncate">{children}</SelectPrimitive.ItemText>
      {/* reveal check: 0-width until highlighted or selected; outline ring -> accent disc */}
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
