import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

// Ported to the kit's field control (kit/field.css .bp-field__input inside
// .bp-field__control): 34px, 14px text, 16px squircle, 14px pad, crisp border,
// accent focus (border -> primary + 3px accent-tint), filled value reads at 600.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-[34px] w-full min-w-0 rounded-lg border border-border-strong bg-card px-3.5 text-base text-foreground transition-[color,box-shadow,border-color] outline-none",
        "placeholder:text-muted-foreground [&:not(:placeholder-shown)]:font-semibold",
        "focus:border-primary focus:shadow-[0_0_0_3px_var(--accent-tint)]",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-45",
        "aria-invalid:border-destructive aria-invalid:focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--destructive)_18%,white)]",
        className
      )}
      {...props}
    />
  )
}

export { Input }
