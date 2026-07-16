"use client"

import * as React from "react"
import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox"

import { cn } from "@/lib/utils"
import { maskStyle } from "./checkmark"

// Ported to the kit (kit/checkbox.css .bp-checkbox): a 14px squircle box with a
// crisp outline that fills to the accent with a knocked-out tick when checked.
// The tick scales in on an ease-back curve. Base UI keeps ARIA + keyboard.
function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "relative flex size-3.5 shrink-0 items-center justify-center rounded-[10px] border-[1.5px] border-border-strong bg-card outline-none transition-[background,border-color,box-shadow] duration-150",
        "focus-visible:shadow-[0_0_0_3px_var(--accent-tint)]",
        "data-[checked]:border-primary data-[checked]:bg-primary",
        "disabled:pointer-events-none disabled:opacity-45",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        keepMounted
        aria-hidden="true"
        className="block size-full origin-center transition-[opacity,transform] duration-150 [transition-timing-function:var(--ease-back)] data-[unchecked]:scale-[0.6] data-[unchecked]:opacity-0"
        style={{ background: "var(--primary-foreground)", ...maskStyle(10) }}
      />
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
