"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

// Ported to the kit's field label (kit/field.css .bp-field__label):
// 14px text, 600 weight, 20px line-height.
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-base leading-5 font-semibold text-foreground select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export { Label }
