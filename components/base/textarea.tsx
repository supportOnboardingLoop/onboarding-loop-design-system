import * as React from "react"

import { cn } from "@/lib/utils"

// Ported to the kit (kit/field.css, textarea path): 14px text, 16px squircle,
// 14px pad, accent focus. Owner-controlled height (auto-grow) — never locked to
// the 34px single-line control height.
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "field-sizing-content flex min-h-16 w-full resize-none rounded-lg border border-border-strong bg-card px-3.5 py-2.5 text-base text-foreground transition-[color,box-shadow,border-color] outline-none",
        "placeholder:text-muted-foreground",
        "focus:border-primary focus:shadow-[0_0_0_3px_var(--accent-tint)]",
        "disabled:cursor-not-allowed disabled:opacity-45",
        "aria-invalid:border-destructive aria-invalid:focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--destructive)_18%,white)]",
        className
      )}
      {...props}
    />
  )
}

export { Textarea }
