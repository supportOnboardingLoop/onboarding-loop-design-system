import * as React from "react"

import { cn } from "@/lib/utils"

// Ported from the kit (kit/widgets.css .bp-progress): a labelled track that
// fills left -> right while the agent builds something. Title row (label left,
// "N%" right) over a 12px track; the fill is the brand accent. At 100% the
// percentage picks up the accent too.
function Progress({
  value,
  label,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "children"> & { value: number; label?: React.ReactNode }) {
  const pct = Math.max(0, Math.min(100, value))
  const complete = pct >= 100
  return (
    <div data-slot="progress" className={cn("flex w-full flex-col gap-2.5", className)} {...props}>
      {(label != null || true) && (
        <div className="flex items-center justify-between gap-2 text-base leading-5 font-semibold">
          <span className="min-w-0 text-foreground">{label}</span>
          <span
            className={cn(
              "shrink-0 tabular-nums transition-colors duration-200",
              complete ? "text-primary" : "text-muted-foreground"
            )}
          >
            {Math.round(pct)}%
          </span>
        </div>
      )}
      <div className="h-3 overflow-hidden rounded-full bg-[#e9eaeb] dark:bg-white/12">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-[180ms] ease-linear"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

export { Progress }
