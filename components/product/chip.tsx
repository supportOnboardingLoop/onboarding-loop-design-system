import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Ported from the starter layout (.chip / .chip--new / .chip--warn): a small
// count pill. Neutral = off-white with a light-grey outline; `new` = green
// (success token), `warn` = amber (warning). Theme-adaptive via the status
// tokens. A true round pill, never squircled.
const chipVariants = cva(
  "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full [corner-shape:round] border px-1.5 text-[11px] leading-none font-semibold",
  {
    variants: {
      variant: {
        neutral: "border-border bg-surface text-text-muted dark:border-white/12 dark:bg-white/5 dark:text-muted-foreground",
        new: "bg-[var(--success-tint)] text-[color-mix(in_srgb,var(--success)_72%,#000)] border-[color-mix(in_srgb,var(--success)_40%,#fff)]",
        warn: "bg-[var(--warning-tint)] text-[color-mix(in_srgb,var(--warning)_68%,#000)] border-[color-mix(in_srgb,var(--warning)_42%,#fff)]",
      },
    },
    defaultVariants: { variant: "neutral" },
  }
)

function Chip({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof chipVariants>) {
  return <span data-slot="chip" className={cn(chipVariants({ variant }), className)} {...props} />
}

// The status pill (.badge): a filled dot + label, green by default (success).
function StatusBadge({
  className,
  tone = "success",
  children,
  ...props
}: React.ComponentProps<"span"> & { tone?: "success" | "warning" | "info" | "destructive" }) {
  const token = tone === "destructive" ? "destructive" : tone
  return (
    <span
      data-slot="status-badge"
      className={cn(
        "inline-flex h-[22px] items-center gap-1.5 rounded-full [corner-shape:round] border px-2 text-xs leading-none font-semibold",
        className
      )}
      style={{
        background: `var(--${token}-tint)`,
        color: `color-mix(in srgb, var(--${token}) 72%, #000)`,
        borderColor: `color-mix(in srgb, var(--${token}) 40%, #fff)`,
      }}
      {...props}
    >
      <span className="size-1.5 shrink-0 rounded-full [corner-shape:round]" style={{ background: `var(--${token})` }} />
      {children}
    </span>
  )
}

export { Chip, StatusBadge, chipVariants }
